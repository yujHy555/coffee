import { createLevelData } from './levelData.js';
import { WorldRenderer } from './renderer.js';
import { PRODUCTS } from '../data/products.js';
import { sound } from '../audio/soundManager.js';

export class CoffeePlatformerEngine {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;

    this.width = 1280;
    this.height = 640;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.renderer = new WorldRenderer(this.ctx, this.width, this.height);
    this.keys = new Set();
    this.unlockedPowerups = new Set();
    this.discoveredProducts = new Set();

    this.paused = false;
    this.time = 0;
    this.elapsedSeconds = 0;

    this.resetLevel();
    this.bindInput();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.handleResize(), 120);
    });
  }

  handleResize() {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const aspect = rect.width / rect.height;
    // Keep vertical world height locked at 640 logical units so platform physics and jumps
    // stay 100% consistent, while dynamically adapting horizontal field-of-view for Portrait,
    // Standard 16:9, or Ultrawide screens!
    this.height = 640;
    this.width = Math.round(Math.max(460, Math.min(1850, 640 * aspect)));

    // Render at native Retina / High-DPI physical pixel resolution (minimum 1.5x supersampling
    // even on 1080p screens so strokes and facial details on the Coffee Cup are razor-sharp!)
    const rawDpr = window.devicePixelRatio || 1;
    const scaleFactor = Math.min(3, Math.max(1.5, rawDpr * (rect.height / 640)));
    this.renderScale = scaleFactor;

    this.canvas.width = Math.round(this.width * scaleFactor);
    this.canvas.height = Math.round(this.height * scaleFactor);

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.renderer.resize(this.width, this.height, scaleFactor);
  }

  resetLevel() {
    this.level = createLevelData();

    // Preserve already discovered products across runs if desired, or let nodes show uncollected
    this.level.productNodes.forEach((node) => {
      node.collected = this.discoveredProducts.has(node.productId);
    });

    // Initialize dynamic physics & spring state on every enemy
    this.level.enemies.forEach((enemy, idx) => {
      enemy.groundY = enemy.y;
      enemy.vy = 0;
      enemy.onGround = enemy.type !== 'steam_spirit';
      enemy.scaleX = 1;
      enemy.scaleY = 1;
      enemy.scaleVx = 0;
      enemy.scaleVy = 0;
      enemy.tiltAngle = 0;
      enemy.groundAngle = 0;
      enemy.animPhase = idx * 1.3;
      enemy.hopCount = 0;
      enemy.hopPauseTimer = 0;
      enemy.aggro = false;
      enemy.aggroCooldown = 0;
      enemy.hitFlashTimer = 0;
      enemy.knockbackVx = 0;
      enemy.baseSpeed = Math.abs(enemy.vx) || 85;
    });

    this.player = {
      x: 130,
      y: 420,
      vx: 0,
      vy: 0,
      r: 29, // Even larger heroic Coffee Cup presence (matches 1.38x visual scale)
      facing: 1,
      onGround: false,
      groundPlat: null,
      groundAngle: 0,
      targetGroundAngle: 0,
      jumpsRemaining: 2,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      hp: 3,
      maxHp: 3,
      caffeine: 65, // 0 to 100 bar under hearts
      invulnTimer: 0,
      meleeTimer: 0,
      meleeCooldown: 0,
      shotCooldown: 0,
      hasBeanGun: false, // Picked up Bean Blaster Gun
      gunShootTimer: 0, // Recoil & shooting pose timer
      gunRecoilX: 0,
      dashTimer: 0,
      dashCooldown: 0,
      scaleX: 1,
      scaleY: 1,
      scaleVx: 0, // Harmonic spring velocity X
      scaleVy: 0, // Harmonic spring velocity Y
      tiltAngle: 0,
      sloshAngle: 0,
      sloshVel: 0,
      animTime: 0,
      idleTimer: 0,
      idleBlend: 0,
      airBlend: 0,
      airTime: 0,
      limbLagX: 0,
      limbLagY: 0,
      limbVelX: 0,
      limbVelY: 0,
      blinkTimer: 0,
      nextBlink: 2.6,
      eyeLookX: 0,
      eyeLookY: 0,
      shieldActive: this.unlockedPowerups.has('nitro_shield'),
      checkpointX: 130,
      checkpointY: 420
    };

    this.cameraX = 0;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;

    this.beanCount = 0;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.currentBiome = 'Starry Espresso Hills';

    this.projectiles = [];
    this.dyingEnemies = [];
    this.pinkGooParticles = [];
    this.pinkGooSplats = [];
    this.splatBursts = [];
    this.particles = [];
    this.floatingTexts = [];

    this.syncHud();
  }

  bindInput() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (this.paused) return;

      const code = e.code;
      if (!this.keys.has(code)) {
        this.keys.add(code);
        this.handleKeyPress(code);
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      this.keys.delete(code);

      // Variable jump height: releasing jump key early while ascending cuts upward velocity smoothly
      if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') {
        if (this.player && this.player.vy < -220) {
          this.player.vy *= 0.56;
        }
      }
    });

    // Tap/Click on canvas to fire the Bean Blaster or Espresso Shot
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.paused) return;
      this.triggerEspressoShot();
    });
  }

  // Triggered by keyboard or mobile touch buttons
  handleKeyPress(code) {
    if (this.paused) return;

    // Jump: Space / W / ArrowUp
    if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') {
      this.player.jumpBufferTimer = 0.14;
      this.triggerJump();
    }
    // Spoon Melee: KeyZ / KeyJ
    if (code === 'KeyZ' || code === 'KeyJ') {
      this.triggerSpoonMelee();
    }
    // Espresso Shot / Bean Blaster Fire: KeyX / KeyK / Enter / NumpadEnter
    if (code === 'KeyX' || code === 'KeyK' || code === 'Enter' || code === 'NumpadEnter') {
      this.triggerEspressoShot();
    }
    // Frothy Dash: ShiftLeft / ShiftRight / KeyC / KeyL
    if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyC' || code === 'KeyL') {
      this.triggerDash();
    }
  }

  impulseScale(targetScaleX, targetScaleY, impulseVy = 0) {
    const p = this.player;
    p.scaleX = targetScaleX;
    p.scaleY = targetScaleY;
    p.scaleVx = (1 - targetScaleX) * 4.5;
    p.scaleVy = (1 - targetScaleY) * 4.5 + impulseVy;
    p.sloshVel += (targetScaleY - targetScaleX) * 14 * p.facing;
  }

  impulseEnemyScale(enemy, targetScaleX, targetScaleY, impulseVy = 0) {
    enemy.scaleX = targetScaleX;
    enemy.scaleY = targetScaleY;
    enemy.scaleVx = (1 - targetScaleX) * 5.2;
    enemy.scaleVy = (1 - targetScaleY) * 5.2 + impulseVy;
  }

  // Computes the exact curved/rounded top surface Y of any platform at worldX
  // Matches the visual silhouette of rounded biscuits, domed mossy coffee beans,
  // arched biscotti slices, chocolate cookies, gingerbread cliffs, and bobbing sugar cubes!
  getPlatformSurfaceY(plat, worldX, time = this.time) {
    const localX = Math.max(0, Math.min(plat.w, worldX - plat.x));
    const u = (localX - plat.w * 0.5) / (plat.w * 0.5); // -1 at left edge, 0 at center, +1 at right edge

    if (plat.type === 'mossy_bean') {
      // Elliptical mossy boulder dome: highest in the center, smoothly curving down rounded sides
      const clampedU = Math.max(-0.96, Math.min(0.96, u));
      const domeDrop = (1 - Math.sqrt(1 - clampedU * clampedU)) * (plat.h * 0.34);
      return plat.y - 2 + domeDrop;
    }

    if (plat.type === 'biscotti') {
      // Arched almond biscotti slice: gently crowned center curving down toward both rounded ends
      const archDrop = (u * u) * (plat.h * 0.32);
      return plat.y + 1 + archDrop;
    }

    if (plat.type === 'sugar_cube') {
      // Floating crystalline sugar cube with vertical bob, slight tilt, and beveled edges
      const bob = Math.sin(time * 3.2 + plat.x * 0.025) * 4;
      const tilt = ((plat.x % 200) - 100) * 0.0012;
      const tiltOffset = (localX - plat.w * 0.5) * Math.sin(tilt);
      const edgeRadius = 11;
      let edgeDrop = 0;
      if (localX < edgeRadius) {
        const t = Math.min(0.95, (edgeRadius - localX) / edgeRadius);
        edgeDrop = (1 - Math.sqrt(1 - t * t)) * 6;
      } else if (localX > plat.w - edgeRadius) {
        const t = Math.min(0.95, (localX - (plat.w - edgeRadius)) / edgeRadius);
        edgeDrop = (1 - Math.sqrt(1 - t * t)) * 6;
      }
      return plat.y + bob + tiltOffset + edgeDrop;
    }

    // Biscuit, Chocolate Cookie, and Gingerbread platforms: flat top with smooth rounded corners at edges
    const edgeRadius = Math.min(28, plat.w * 0.25);
    let edgeDrop = 0;
    if (localX < edgeRadius) {
      const t = Math.min(0.95, (edgeRadius - localX) / edgeRadius);
      edgeDrop = (1 - Math.sqrt(1 - t * t)) * 13;
    } else if (localX > plat.w - edgeRadius) {
      const t = Math.min(0.95, (localX - (plat.w - edgeRadius)) / edgeRadius);
      edgeDrop = (1 - Math.sqrt(1 - t * t)) * 13;
    }
    return plat.y + edgeDrop;
  }

  getPlatformSlopeAngle(plat, worldX, time = this.time) {
    const step = 4;
    const yLeft = this.getPlatformSurfaceY(plat, worldX - step, time);
    const yRight = this.getPlatformSurfaceY(plat, worldX + step, time);
    return Math.max(-0.48, Math.min(0.48, Math.atan2(yRight - yLeft, step * 2)));
  }

  triggerJump() {
    const p = this.player;
    const maxJumps = this.unlockedPowerups.has('golden_boost') ? 3 : 2;

    if (p.onGround || p.coyoteTimer > 0) {
      p.vy = -605;
      p.onGround = false;
      p.groundPlat = null;
      p.targetGroundAngle = 0;
      p.coyoteTimer = 0;
      p.jumpBufferTimer = 0;
      p.jumpsRemaining = maxJumps - 1;
      p.limbVelY = 34; // Downward limb-dangle impulse on launch
      // Snappy vertical stretch on takeoff!
      this.impulseScale(0.68, 1.38, 3.2);
      sound.playJump(false);
      this.spawnCoffeeSplash(p.x, p.y - 18, 9, '#78350f');
      this.spawnCoffeeSplash(p.x, p.y + 22, 6, '#fde68a');
    } else if (p.jumpsRemaining > 0) {
      // Stronger 2nd jump (double-jump) with powerful upward thrust!
      p.vy = -655;
      p.jumpsRemaining--;
      p.jumpBufferTimer = 0;
      p.limbVelY = 44; // Extra dramatic downward dangle kick on double-jump!
      // Double-jump mid-air pop & stretch!
      this.impulseScale(0.64, 1.44, 4.4);
      sound.playJump(true);
      this.spawnCoffeeSplash(p.x, p.y + 16, 16, '#fef08a');
    }
  }

  triggerSpoonMelee() {
    const p = this.player;
    if (p.meleeCooldown > 0) return;

    const upgraded = this.unlockedPowerups.has('silver_spoon');
    p.meleeTimer = 0.24;
    p.meleeCooldown = 0.32;
    // Dynamic forward lunge & horizontal stretch on melee swing!
    p.vx += p.facing * 135;
    this.impulseScale(1.28, 0.8, -1.8);
    sound.playSpoonSwing(upgraded);

    // Check melee hitbox in front of player
    const reach = upgraded ? 88 : 64;
    const hitX = p.x + p.facing * (reach * 0.6);
    const hitY = p.y;

    this.level.enemies.forEach((enemy) => {
      if (enemy.dead) return;
      const dist = Math.hypot(enemy.x - hitX, enemy.y - hitY);
      if (dist <= reach) {
        this.damageEnemy(enemy, upgraded ? 2 : 1, p.facing * 240);
      }
    });
  }

  triggerEspressoShot() {
    const p = this.player;

    // When Bean Blaster Gun is equipped, fire rapid-action roasted coffee beans!
    if (p.hasBeanGun) {
      if (p.shotCooldown > 0) return;
      p.shotCooldown = 0.16;
      p.gunShootTimer = 0.22;
      p.gunRecoilX = -p.facing * 7;
      p.vx -= p.facing * 75; // Snappy gunslinger recoil
      sound.playEspressoShot();

      // Shoot exactly one high-velocity bullet straight ahead!
      this.projectiles.push({
        x: p.x + p.facing * 40,
        y: p.y - 2,
        vx: p.facing * 860,
        vy: 0,
        r: 9,
        life: 1.5,
        isBeanProjectile: true,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: p.facing * 20,
        pierce: 1
      });

      // Muzzle flash sparks & smoke at the barrel tip
      for (let s = 0; s < 6; s++) {
        this.particles.push({
          x: p.x + p.facing * 44,
          y: p.y - 2 + (Math.random() - 0.5) * 8,
          vx: p.facing * (110 + Math.random() * 150),
          vy: (Math.random() - 0.5) * 60,
          r: 2.2 + Math.random() * 3.4,
          color: Math.random() < 0.5 ? '#fbcfe8' : '#fde047',
          life: 0.22,
          maxLife: 0.22,
          gravity: 50
        });
      }

      // Satisfying firing squash
      this.impulseScale(1.28, 0.82, -1.8);
      this.syncHud();
      return;
    }

    // Default espresso shot before collecting the Bean Blaster Gun
    if (p.shotCooldown > 0 || p.caffeine < 8) return;

    p.caffeine = Math.max(0, p.caffeine - 8);
    p.shotCooldown = 0.24;
    sound.playEspressoShot();

    const isTriple = this.unlockedPowerups.has('triple_shot');
    const spreads = isTriple ? [-75, 0, 75] : [0];

    spreads.forEach((vySpread) => {
      this.projectiles.push({
        x: p.x + p.facing * 32,
        y: p.y - 4,
        vx: p.facing * 660,
        vy: vySpread,
        r: isTriple ? 9 : 7,
        pierce: isTriple ? 2 : 1,
        life: 1.3,
        isBeanProjectile: false
      });
    });

    // Satisfying recoil squash on firing!
    this.impulseScale(1.26, 0.81, -1.5);
    this.syncHud();
  }

  triggerDash() {
    const p = this.player;
    if (p.dashCooldown > 0 || p.caffeine < 15) return;

    p.caffeine = Math.max(0, p.caffeine - 15);
    p.dashTimer = 0.19;
    p.dashCooldown = 0.58;
    p.vx = p.facing * 730;
    p.vy = 0;
    // Extreme horizontal aerodynamic dash stretch!
    this.impulseScale(1.42, 0.66, 0);
    sound.playJump(true);
    this.spawnCoffeeSplash(p.x, p.y, 16, '#fde047');
    this.syncHud();
  }

  unlockProductPowerup(product) {
    this.discoveredProducts.add(product.id);
    this.unlockedPowerups.add(product.unlockType);
    if (product.unlockType === 'nitro_shield') {
      this.player.shieldActive = true;
    }
    this.player.hp = this.player.maxHp;
    this.player.caffeine = 100;
    this.score += 2500;
    this.syncHud();
  }

  spawnCoffeeSplash(x, y, count, color = '#78350f') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 190;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        r: 2.5 + Math.random() * 4.5,
        color,
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8,
        gravity: 480
      });
    }
  }

  addFloatingText(x, y, text, color = '#fde047') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 0.95
    });
  }

  spawnPinkGooExplosion(x, y, count = 16, maxSpeed = 340) {
    // 1. Comic splat shockwave ring (keep at most 5 active)
    if (this.splatBursts.length > 5) {
      this.splatBursts.splice(0, this.splatBursts.length - 5);
    }
    this.splatBursts.push({
      x,
      y,
      r: 8,
      maxR: 44,
      life: 0.28,
      maxLife: 0.28,
      color: '#ec4899'
    });

    // 2. High-energy glossy pink goo droplets (cap active pool to 36 max to prevent any frame drops)
    if (this.pinkGooParticles.length + count > 36) {
      this.pinkGooParticles.splice(0, (this.pinkGooParticles.length + count) - 36);
    }

    const pinkShades = ['#ec4899', '#f472b6', '#db2777', '#fbcfe8', '#f43f5e', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 75 + Math.random() * maxSpeed;
      const color = pinkShades[Math.floor(Math.random() * pinkShades.length)];
      this.pinkGooParticles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        r: 3 + Math.random() * 4,
        color,
        life: 0.5 + Math.random() * 0.35,
        maxLife: 0.85,
        gravity: 520
      });
    }
  }

  damageEnemy(enemy, dmg, knockbackVx = 0, isBeanShot = false) {
    if (isBeanShot) {
      dmg = 999; // Lethal 1-shot kill when shot with Black Glock 16mm
    }
    enemy.hp -= dmg;
    enemy.hitFlashTimer = 0.2;
    this.impulseEnemyScale(enemy, 1.45, 0.62, 4.0);
    this.shakeTimer = 0.14;
    this.shakeIntensity = 5.5;

    if (enemy.hp <= 0) {
      enemy.dead = true;
      sound.playEnemyDefeat();
      this.score += 500;
      this.player.caffeine = Math.min(100, this.player.caffeine + 20);

      // Add to dyingEnemies for super-satisfying cartoon swell, shake and explosive POP!
      this.dyingEnemies.push({
        type: enemy.type,
        x: enemy.x,
        y: enemy.y,
        vx: knockbackVx * 0.45,
        vy: -140,
        scaleX: enemy.scaleX || 1,
        scaleY: enemy.scaleY || 1,
        facing: enemy.vx >= 0 ? 1 : -1,
        tiltAngle: enemy.tiltAngle || 0,
        timer: 0,
        duration: 0.24,
        exploded: false,
        groundY: enemy.groundY || enemy.y
      });

      // Juicy explosive pink goo splatter cascade (optimized count for 60 FPS!)
      this.spawnPinkGooExplosion(enemy.x, enemy.y, 16, 360);
      this.shakeTimer = 0.22;
      this.shakeIntensity = 7.5;

      this.addFloatingText(enemy.x, enemy.y - 28, '+500 GOO SPLAT!', '#f472b6');
      this.addFloatingText(enemy.x, enemy.y - 10, 'KER-SPLAT!', '#fbcfe8');
      this.syncHud();
    } else {
      this.spawnCoffeeSplash(enemy.x, enemy.y, 8, '#f59e0b');
      enemy.knockbackVx = knockbackVx;
      if (enemy.type !== 'steam_spirit') {
        enemy.vy = -215;
        enemy.onGround = false;
      }
      this.addFloatingText(enemy.x, enemy.y - 20, 'CRACK!', '#bae6fd');
    }
  }

  hurtPlayer() {
    const p = this.player;
    if (p.invulnTimer > 0) return;

    if (p.shieldActive) {
      p.shieldActive = false;
      p.invulnTimer = 1.4;
      this.impulseScale(1.3, 0.75, 2.5);
      sound.playSugarCrumble();
      this.addFloatingText(p.x, p.y - 30, 'NITRO SHIELD BLOCKED!', '#f472b6');
      this.spawnCoffeeSplash(p.x, p.y, 18, '#f472b6');
      this.syncHud();
      return;
    }

    p.hp--;
    p.invulnTimer = 1.5;
    p.vy = -410;
    p.vx = -p.facing * 250;
    p.onGround = false;
    p.groundPlat = null;
    this.impulseScale(0.65, 1.38, 4.0);
    this.shakeTimer = 0.25;
    this.shakeIntensity = 9;
    sound.playHurt();
    this.spawnCoffeeSplash(p.x, p.y, 18, '#ef4444');

    if (p.hp <= 0) {
      // Respawn at last checkpoint with full health
      p.hp = p.maxHp;
      p.x = p.checkpointX;
      p.y = p.checkpointY - 34;
      p.vx = 0;
      p.vy = 0;
      p.shieldActive = this.unlockedPowerups.has('nitro_shield');
      this.addFloatingText(p.x, p.y - 30, 'RE-BREWED AT CHECKPOINT!', '#fde047');
    } else {
      this.addFloatingText(p.x, p.y - 28, 'SPILLED! -1 ♥', '#f87171');
    }
    this.syncHud();
  }

  update(dt) {
    if (this.paused) return;

    this.time += dt;
    this.elapsedSeconds += dt;

    const p = this.player;

    // Cooldowns & timers
    if (p.invulnTimer > 0) p.invulnTimer -= dt;
    if (p.meleeTimer > 0) p.meleeTimer -= dt;
    if (p.meleeCooldown > 0) p.meleeCooldown -= dt;
    if (p.shotCooldown > 0) p.shotCooldown -= dt;
    if (p.dashTimer > 0) p.dashTimer -= dt;
    if (p.dashCooldown > 0) p.dashCooldown -= dt;
    if (p.coyoteTimer > 0) p.coyoteTimer -= dt;
    if (p.jumpBufferTimer > 0) p.jumpBufferTimer -= dt;
    if (this.shakeTimer > 0) this.shakeTimer -= dt;

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    // Passive caffeine regeneration (faster with Golden Honey Geisha unlock)
    const regenRate = this.unlockedPowerups.has('golden_boost') ? 9 : 4.5;
    p.caffeine = Math.min(100, p.caffeine + regenRate * dt);

    // Snappy AAA Platformer Horizontal Movement with Turnaround Boost
    const moveLeft = this.keys.has('ArrowLeft') || this.keys.has('KeyA');
    const moveRight = this.keys.has('ArrowRight') || this.keys.has('KeyD');

    if (p.dashTimer <= 0) {
      const baseAccel = p.onGround ? 2350 : 1550;
      const maxSpeed = 355;

      if (moveLeft) {
        // Extra snappy turnaround impulse when reversing direction!
        const turnBoost = p.vx > 40 ? 2.1 : 1.0;
        if (p.facing === 1 && p.onGround) {
          this.impulseScale(1.18, 0.85, 1.2);
          this.spawnCoffeeSplash(p.x + 12, p.y + 22, 4, '#fde68a');
        }
        p.vx = Math.max(p.vx - baseAccel * turnBoost * dt, -maxSpeed);
        p.facing = -1;
      } else if (moveRight) {
        const turnBoost = p.vx < -40 ? 2.1 : 1.0;
        if (p.facing === -1 && p.onGround) {
          this.impulseScale(1.18, 0.85, 1.2);
          this.spawnCoffeeSplash(p.x - 12, p.y + 22, 4, '#fde68a');
        }
        p.vx = Math.min(p.vx + baseAccel * turnBoost * dt, maxSpeed);
        p.facing = 1;
      } else {
        const friction = p.onGround ? 0.78 : 0.92;
        p.vx *= Math.pow(friction, dt * 60);
        if (Math.abs(p.vx) < 10) p.vx = 0;
      }

      // Dynamic Gravity: Lighter at jump apex for ultra-satisfying hang time, punchier on descent
      const isNearApex = !p.onGround && Math.abs(p.vy) < 115;
      const gravityMult = isNearApex ? 0.68 : p.vy > 80 ? 1.18 : 1.0;
      p.vy += 1420 * gravityMult * dt;
      if (p.vy > 820) p.vy = 820;
    } else if (Math.random() < 0.75) {
      // Frothy dash trail particles
      this.particles.push({
        x: p.x - p.facing * 18,
        y: p.y + (Math.random() - 0.5) * 20,
        vx: -p.facing * 90,
        vy: (Math.random() - 0.5) * 40,
        r: 4 + Math.random() * 5,
        color: '#fef08a',
        life: 0.25,
        maxLife: 0.25,
        gravity: 0
      });
    }

    // Integrate position
    const prevX = p.x;
    const prevY = p.y;
    const impactVy = p.vy;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // World boundaries
    if (p.x < 35) {
      p.x = 35;
      p.vx = 0;
    }
    if (p.x > this.level.width - 45) {
      p.x = this.level.width - 45;
    }

    // Platform Collisions with Rounded-Edge Contour Following & Ground Snapping
    // Ensures the hero stays glued to the ground when walking over curved boulders,
    // biscotti arches, bobbing sugar cubes, and rounded biscuit/cookie corners!
    const wasOnGround = p.onGround;
    const prevPlat = p.groundPlat;
    p.onGround = false;
    p.groundPlat = null;
    p.targetGroundAngle = 0;

    for (const plat of this.level.platforms) {
      const footMargin = p.r * 0.62;
      const withinX = p.x + footMargin > plat.x && p.x - footMargin < plat.x + plat.w;
      if (!withinX || p.vy < 0) continue;

      const surfY = this.getPlatformSurfaceY(plat, p.x, this.time);
      const prevSurfY = this.getPlatformSurfaceY(plat, prevX, this.time - dt);

      // Sticky slope/edge snap when already grounded on this or an adjacent platform
      const isStickyGround =
        wasOnGround &&
        (prevPlat === plat || Math.abs(prevY + p.r - surfY) < 22) &&
        p.y + p.r >= surfY - 20 &&
        prevY + p.r <= prevSurfY + 24;

      // Standard top-down landing from the air
      const crossedTop = prevY + p.r <= prevSurfY + 18 && p.y + p.r >= surfY - 2;

      if (isStickyGround || crossedTop) {
        p.y = surfY - p.r;
        p.vy = 0;
        p.onGround = true;
        p.groundPlat = plat;
        p.targetGroundAngle = this.getPlatformSlopeAngle(plat, p.x, this.time);
        p.coyoteTimer = 0.14;
        p.jumpsRemaining = this.unlockedPowerups.has('golden_boost') ? 2 : 1;

        if (!wasOnGround) {
          // Impact-proportional landing squash & spring bounce!
          const impactFactor = Math.min(1, Math.max(0.25, impactVy / 650));
          const squashX = 1 + 0.36 * impactFactor;
          const squashY = 1 - 0.30 * impactFactor;
          this.impulseScale(squashX, squashY, -3.5 * impactFactor);

          if (plat.type === 'sugar_cube') {
            sound.playSugarCrumble();
            this.spawnCoffeeSplash(p.x, surfY, 8, '#bae6fd');
          } else if (impactFactor > 0.55) {
            this.spawnCoffeeSplash(p.x, surfY, 6, '#fde68a');
          }
        }

        // Execute buffered jump immediately on touchdown for frame-perfect responsiveness!
        if (p.jumpBufferTimer > 0) {
          this.triggerJump();
        }

        // Checkpoint activation
        if (plat.isCheckpoint && p.checkpointX < plat.x) {
          p.checkpointX = plat.x + 80;
          p.checkpointY = plat.y - 36;
          p.shieldActive = this.unlockedPowerups.has('nitro_shield');
          this.addFloatingText(p.x, p.y - 48, `CHECKPOINT: ${plat.checkpointName.toUpperCase()}!`, '#fde047');
          sound.playProductUnlock();
        }

        // Grand Roastery Finish
        if (plat.isFinish && !this.victoryTriggered) {
          this.victoryTriggered = true;
          sound.playProductUnlock();
          if (this.callbacks.onVictory) {
            this.callbacks.onVictory({
              score: this.score,
              beans: this.beanCount,
              discoveredCount: this.discoveredProducts.size,
              time: Math.floor(this.elapsedSeconds)
            });
          }
        }
        break;
      }
    }

    if (wasOnGround && !p.onGround && p.vy >= 0) {
      p.coyoteTimer = 0.14;
    }

    // Smoothly interpolate ground slope alignment so walking onto rounded edges feels buttery-smooth
    p.groundAngle += (p.targetGroundAngle - p.groundAngle) * Math.min(1, 20 * dt);

    // Liquid Hazard check (Falling into Milk Rapids or Boiling Crema Lake)
    if (p.y + p.r > this.level.liquidLevel + 12) {
      this.hurtPlayer();
      p.y = p.checkpointY - 36;
      p.x = p.checkpointX;
      p.vx = 0;
      p.vy = 0;
    }

    // --- Idle Foot-Tap & Hands-on-Waist State + Facial Blinking & Eye Gaze Tracking ---
    const isStandingIdle =
      p.onGround &&
      Math.abs(p.vx) < 12 &&
      !moveLeft &&
      !moveRight &&
      p.meleeTimer <= 0 &&
      p.dashTimer <= 0 &&
      p.shotCooldown <= 0;

    if (isStandingIdle) {
      p.idleTimer += dt;
    } else {
      p.idleTimer = 0;
    }

    // Smoothly blend into the impatient hands-on-waist & foot-tapping pose when waiting
    const targetIdleBlend = p.idleTimer > 0.18 ? 1 : 0;
    p.idleBlend += (targetIdleBlend - p.idleBlend) * Math.min(1, (targetIdleBlend ? 8.5 : 16) * dt);

    // Mid-air Dangle Physics for Arms & Legs (Pendulum trail & velocity drag!)
    const targetAirBlend = p.onGround ? 0 : 1;
    p.airBlend += (targetAirBlend - p.airBlend) * Math.min(1, (p.onGround ? 22 : 14) * dt);
    if (!p.onGround) {
      p.airTime += dt;
    } else {
      p.airTime = 0;
    }

    // Limbs trail behind horizontal movement (-vx) and react to vertical velocity (vy)
    const targetLimbX = !p.onGround
      ? Math.max(-8.5, Math.min(8.5, (-p.vx * p.facing) * 0.022)) + Math.sin(p.airTime * 11.5) * 2.2
      : 0;
    const targetLimbY = !p.onGround
      ? Math.max(-4.5, Math.min(8.5, 4.2 - p.vy * 0.0085)) + Math.cos(p.airTime * 11.5) * 1.4
      : 0;

    p.limbVelX += ((targetLimbX - p.limbLagX) * 145 - p.limbVelX * 11) * dt;
    p.limbVelY += ((targetLimbY - p.limbLagY) * 145 - p.limbVelY * 11) * dt;
    p.limbLagX = Math.max(-10, Math.min(10, p.limbLagX + p.limbVelX * dt));
    p.limbLagY = Math.max(-6, Math.min(10, p.limbLagY + p.limbVelY * dt));

    // Natural eye blinking cycle (occasional double blink!)
    p.nextBlink -= dt;
    if (p.nextBlink <= 0) {
      p.blinkTimer = 0.14;
      p.nextBlink = Math.random() < 0.25 ? 0.28 : 2.4 + Math.random() * 2.2;
    }
    if (p.blinkTimer > 0) {
      p.blinkTimer = Math.max(0, p.blinkTimer - dt);
    }

    // Dynamic eye gaze target (looks ahead when running, up/down when jumping, glances impatiently when idle!)
    const idleGlanceX = p.idleBlend * Math.sin(this.time * 2.1) * 0.85;
    const idleGlanceY = p.idleBlend * (Math.cos(this.time * 4.2) * 0.35 - 0.25);
    const targetLookX = p.idleBlend > 0.5 ? idleGlanceX : Math.max(-1, Math.min(1, p.vx / 220));
    const targetLookY = !p.onGround ? Math.max(-1, Math.min(1, p.vy / 420)) : idleGlanceY;
    p.eyeLookX += (targetLookX - p.eyeLookX) * Math.min(1, 14 * dt);
    p.eyeLookY += (targetLookY - p.eyeLookY) * Math.min(1, 14 * dt);

    // --- Harmonic Spring-Damper Squash & Stretch + Liquid Slosh Physics ---
    // Includes rhythmic body bounce from impatient foot-tapping when idle!
    const idleTapPulse = p.idleBlend > 0.2 ? Math.sin(this.time * 9.5) * 0.025 * p.idleBlend : 0;
    const runBounce = p.onGround && Math.abs(p.vx) > 25
      ? Math.sin(p.animTime * 18) * 0.065 * Math.min(1, Math.abs(p.vx) / 260)
      : idleTapPulse;
    const airStretch = !p.onGround
      ? Math.max(-0.12, Math.min(0.18, Math.abs(p.vy) / 1450))
      : 0;

    const targetSX = 1 - airStretch * 0.65 - runBounce;
    const targetSY = 1 + airStretch + runBounce;

    const stiffness = 240; // Spring stiffness (underdamped for juicy cartoon bounce)
    const damping = 15.5;  // Spring damping

    p.scaleVx += ((targetSX - p.scaleX) * stiffness - p.scaleVx * damping) * dt;
    p.scaleVy += ((targetSY - p.scaleY) * stiffness - p.scaleVy * damping) * dt;
    p.scaleX = Math.max(0.55, Math.min(1.5, p.scaleX + p.scaleVx * dt));
    p.scaleY = Math.max(0.55, Math.min(1.5, p.scaleY + p.scaleVy * dt));

    // Smooth velocity-driven tilt & internal coffee slosh oscillator
    const targetTilt = p.onGround
      ? (p.vx / 355) * 0.11 * p.facing
      : Math.max(-0.18, Math.min(0.18, (p.vy * 0.00028))) * p.facing;
    p.tiltAngle += (targetTilt - p.tiltAngle) * 14 * dt;

    const sloshTarget = -p.vx * 0.015 + p.groundAngle * 4 * p.facing;
    p.sloshVel += ((sloshTarget - p.sloshAngle) * 120 - p.sloshVel * 8) * dt;
    p.sloshAngle += p.sloshVel * dt;

    p.animTime += dt;

    // Ambient rising steam & coffee droplets from the hero cup!
    if (Math.random() < 0.35) {
      this.particles.push({
        x: p.x + (Math.random() - 0.5) * 18,
        y: p.y - 28,
        vx: -p.vx * 0.15 + (Math.random() - 0.5) * 20,
        vy: -35 - Math.random() * 35,
        r: 4 + Math.random() * 6,
        color: 'rgba(255, 255, 255, 0.38)',
        life: 0.7,
        maxLife: 0.7,
        gravity: -25
      });
    }

    // Collect Golden Coffee Beans
    for (const bean of this.level.beans) {
      if (bean.collected) continue;
      const dist = Math.hypot(p.x - bean.x, p.y - bean.y);
      if (dist < p.r + 16) {
        bean.collected = true;
        this.beanCount++;
        this.combo++;
        this.comboTimer = 2.2;
        const points = 100 + Math.min(this.combo * 25, 300);
        this.score += points;
        p.caffeine = Math.min(100, p.caffeine + 6);
        sound.playBeanCollect(this.combo);
        this.spawnCoffeeSplash(bean.x, bean.y, 10, '#fde047');
        this.addFloatingText(bean.x, bean.y - 14, `+${points}`, '#fef08a');
        this.syncHud();
      }
    }

    // Collect Weapon Pickups (Bean Blaster Gun)
    if (this.level.weaponPickups) {
      for (const pickup of this.level.weaponPickups) {
        if (pickup.collected) continue;
        const dist = Math.hypot(p.x - pickup.x, p.y - pickup.y);
        if (dist < p.r + 32) {
          pickup.collected = true;
          p.hasBeanGun = true;
          sound.playProductUnlock();
          this.impulseScale(1.34, 0.76, 3.5);
          this.addFloatingText(pickup.x, pickup.y - 36, '★ BLACK GLOCK 16mm EQUIPPED! ★', '#f472b6');
          this.addFloatingText(pickup.x, pickup.y - 14, '[X] / [CLICK] TO SHOOT BEANS!', '#fde047');
          this.spawnPinkGooExplosion(pickup.x, pickup.y, 14, 160);
          this.syncHud();
        }
      }
    }

    // Collect Mystery Product Crates / Pedestals
    for (const node of this.level.productNodes) {
      if (node.collected) continue;
      const dist = Math.hypot(p.x - node.x, p.y - node.y);
      if (dist < p.r + 34) {
        node.collected = true;
        const product = PRODUCTS.find((pr) => pr.id === node.productId);
        if (product) {
          sound.playProductUnlock();
          this.unlockProductPowerup(product);
          if (this.callbacks.onProductDiscovered) {
            this.callbacks.onProductDiscovered(product);
          }
        }
      }
    }

    // Update Projectiles (Espresso Shots & Spinning Coffee Beans)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;
      if (proj.rotSpeed) proj.rot += proj.rotSpeed * dt;

      // Hit enemies (instant lethal kill if shot with coffee beans!)
      for (const enemy of this.level.enemies) {
        if (enemy.dead) continue;
        const hitRadius = enemy.hp * 4 + 28;
        if (Math.hypot(proj.x - enemy.x, proj.y - enemy.y) < hitRadius) {
          const isBean = Boolean(proj.isBeanProjectile);
          this.damageEnemy(enemy, isBean ? 999 : 1, Math.sign(proj.vx) * 320, isBean);
          proj.pierce--;
          if (proj.pierce <= 0) {
            proj.life = 0;
            break;
          }
        }
      }

      if (proj.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // =========================================================================
    // Dynamic Enemy Physics, AI Behaviors & Harmonic Squash-and-Stretch
    // =========================================================================
    for (const enemy of this.level.enemies) {
      if (enemy.dead) continue;

      if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;
      if (enemy.aggroCooldown > 0) enemy.aggroCooldown -= dt;

      // Decay knockback velocity smoothly
      if (Math.abs(enemy.knockbackVx) > 5) {
        enemy.x += enemy.knockbackVx * dt;
        enemy.knockbackVx *= Math.pow(0.82, dt * 60);
      } else {
        enemy.knockbackVx = 0;
      }

      const distToPlayerX = p.x - enemy.x;
      const distToPlayerY = p.y - enemy.y;
      const distToPlayer = Math.hypot(distToPlayerX, distToPlayerY);
      const dirSign = enemy.vx >= 0 ? 1 : -1;

      if (enemy.type === 'bean_grunt') {
        // 1. COFFEE BEAN GRUNT:
        // Heavy stomping gait + spots player within range, does a fierce angry hop, and charges faster!
        const playerInSight =
          Math.abs(distToPlayerX) < 250 &&
          Math.abs(distToPlayerY) < 110 &&
          Math.sign(distToPlayerX) === dirSign;

        if (playerInSight && !enemy.aggro && enemy.aggroCooldown <= 0 && enemy.onGround) {
          enemy.aggro = true;
          enemy.aggroCooldown = 2.4;
          enemy.vy = -225; // Startled angry hop!
          enemy.onGround = false;
          this.impulseEnemyScale(enemy, 0.74, 1.32, 3.2);
        } else if (Math.abs(distToPlayerX) > 310) {
          enemy.aggro = false;
        }

        const speed = enemy.aggro ? enemy.baseSpeed * 1.68 : enemy.baseSpeed;
        enemy.vx = dirSign * speed;
        enemy.x += enemy.vx * dt;
        enemy.animPhase += dt * (enemy.aggro ? 19 : 13);

        // Turnaround at patrol boundaries with snappy squash pop
        if (enemy.x < enemy.minX) {
          enemy.x = enemy.minX;
          enemy.vx = Math.abs(enemy.vx);
          enemy.aggro = false;
          this.impulseEnemyScale(enemy, 1.24, 0.80, 1.5);
        } else if (enemy.x > enemy.maxX) {
          enemy.x = enemy.maxX;
          enemy.vx = -Math.abs(enemy.vx);
          enemy.aggro = false;
          this.impulseEnemyScale(enemy, 1.24, 0.80, 1.5);
        }

        // Gravity & platform surface landing for Bean Grunt
        if (!enemy.onGround || enemy.vy !== 0) {
          enemy.vy += 1180 * dt;
          enemy.y += enemy.vy * dt;
          if (enemy.y >= enemy.groundY) {
            enemy.y = enemy.groundY;
            enemy.vy = 0;
            enemy.onGround = true;
            this.impulseEnemyScale(enemy, 1.28, 0.76, -2.5);
          }
        }
      } else if (enemy.type === 'sugar_hopper') {
        // 2. SUGAR CUBE HOPPER:
        // Uniform fast 180 px/s horizontal speed in both directions + real parabolic hopping physics,
        // landing compression squash, sugar crystal sparks, and energetic multi-height spring jumps!
        enemy.vx = dirSign * 180;
        enemy.x += enemy.vx * dt;
        enemy.animPhase += dt * 16;

        if (enemy.x < enemy.minX) {
          enemy.x = enemy.minX;
          enemy.vx = 180;
          this.impulseEnemyScale(enemy, 1.26, 0.78, 1.8);
        } else if (enemy.x > enemy.maxX) {
          enemy.x = enemy.maxX;
          enemy.vx = -180;
          this.impulseEnemyScale(enemy, 1.26, 0.78, 1.8);
        }

        if (enemy.onGround) {
          enemy.hopPauseTimer -= dt;
          if (enemy.hopPauseTimer <= 0) {
            enemy.hopCount = (enemy.hopCount + 1) % 3;
            // Every 3rd hop (or when player is close) is an extra-high excited sugar leap!
            const isHighLeap = enemy.hopCount === 0 || distToPlayer < 200;
            enemy.vy = isHighLeap ? -365 : -275;
            enemy.onGround = false;
            this.impulseEnemyScale(enemy, 0.72, 1.34, 3.6);
          }
        } else {
          enemy.vy += 1220 * dt;
          enemy.y += enemy.vy * dt;
          if (enemy.y >= enemy.groundY) {
            enemy.y = enemy.groundY;
            enemy.vy = 0;
            enemy.onGround = true;
            enemy.hopPauseTimer = 0.055; // Brief ground compression before springing back up!
            this.impulseEnemyScale(enemy, 1.34, 0.70, -3.2);
          }
        }
      } else if (enemy.type === 'steam_spirit') {
        // 3. STEAM CLOUD SPIRIT:
        // Fluid aerial swooping physics, figure-8 weaving, banking into turns, and playful dive toward player!
        const swoopSpeed = Math.abs(enemy.vx) || 90;
        enemy.x += enemy.vx * dt;
        enemy.animPhase += dt * 10;

        if (enemy.x < enemy.minX) {
          enemy.x = enemy.minX;
          enemy.vx = swoopSpeed;
          this.impulseEnemyScale(enemy, 1.22, 0.82, 1.2);
        } else if (enemy.x > enemy.maxX) {
          enemy.x = enemy.maxX;
          enemy.vx = -swoopSpeed;
          this.impulseEnemyScale(enemy, 1.22, 0.82, 1.2);
        }

        const baseY = enemy.baseY !== undefined ? enemy.baseY : enemy.groundY;
        const waveOffset = Math.sin(this.time * 3.8 + enemy.x * 0.022) * 20 + Math.cos(this.time * 6.2) * 6;
        // Dive closer to player's altitude when player approaches!
        const playerPull = distToPlayer < 260 ? Math.max(-28, Math.min(36, (p.y - baseY) * 0.35)) : 0;
        const targetY = baseY + waveOffset + playerPull;
        const prevEnemyY = enemy.y;
        enemy.y += (targetY - enemy.y) * Math.min(1, 7.5 * dt);
        enemy.vy = (enemy.y - prevEnemyY) / Math.max(0.001, dt);
      }

      // Harmonic Spring-Damper Squash & Stretch + Dynamic Lean/Tilt for every enemy
      const stridePulse = enemy.onGround
        ? Math.sin(enemy.animPhase) * (enemy.aggro ? 0.08 : 0.05)
        : Math.max(-0.12, Math.min(0.16, Math.abs(enemy.vy) / 1200));
      const targetESX = 1 - stridePulse * 0.7;
      const targetESY = 1 + stridePulse;

      enemy.scaleVx += ((targetESX - enemy.scaleX) * 230 - enemy.scaleVx * 14.5) * dt;
      enemy.scaleVy += ((targetESY - enemy.scaleY) * 230 - enemy.scaleVy * 14.5) * dt;
      enemy.scaleX = Math.max(0.58, Math.min(1.48, enemy.scaleX + enemy.scaleVx * dt));
      enemy.scaleY = Math.max(0.58, Math.min(1.48, enemy.scaleY + enemy.scaleVy * dt));

      const targetEnemyTilt = enemy.type === 'steam_spirit'
        ? Math.max(-0.24, Math.min(0.24, (enemy.vy * 0.0012) + 0.08))
        : !enemy.onGround
          ? Math.max(-0.22, Math.min(0.22, enemy.vy * 0.0005))
          : enemy.aggro
            ? 0.14
            : 0.05;
      enemy.tiltAngle += (targetEnemyTilt - enemy.tiltAngle) * Math.min(1, 14 * dt);

      // Player vs Enemy collision
      const dx = p.x - enemy.x;
      const dy = p.y - enemy.y;
      const dist = Math.hypot(dx, dy);

      if (dist < p.r + 22) {
        // Check if player is stomping from above
        const isStomping = p.vy > 40 && p.y < enemy.y - 6;

        if (p.dashTimer > 0 && this.unlockedPowerups.has('nitro_shield')) {
          this.damageEnemy(enemy, 2, p.facing * 260);
        } else if (isStomping) {
          p.vy = -535;
          this.impulseScale(1.36, 0.72, 4.2);
          this.damageEnemy(enemy, 1, 0);
        } else {
          this.hurtPlayer();
        }
      }
    }

    // Weapon recoil and shoot animation timer countdown
    if (p.gunShootTimer > 0) p.gunShootTimer -= dt;
    if (p.gunRecoilX !== 0) {
      p.gunRecoilX *= Math.pow(0.72, dt * 60);
      if (Math.abs(p.gunRecoilX) < 0.2) p.gunRecoilX = 0;
    }

    // Update Dying Enemies (Violent cartoon swell, shake with pressure, then explode into pink goo!)
    for (let i = this.dyingEnemies.length - 1; i >= 0; i--) {
      const de = this.dyingEnemies[i];
      de.timer += dt;
      de.x += de.vx * dt;
      de.y += de.vy * dt;
      de.vy += 450 * dt;

      // Swell up rapidly like an over-inflated balloon
      const progress = Math.min(1, de.timer / de.duration);
      de.scaleX = 1 + progress * 0.95;
      de.scaleY = 1 + progress * 0.95;
      de.tiltAngle += (Math.random() - 0.5) * 0.18;

      if (de.timer >= de.duration && !de.exploded) {
        de.exploded = true;
        this.spawnPinkGooExplosion(de.x, de.y, 16, 360);
        sound.playEnemyDefeat();
        this.shakeTimer = 0.22;
        this.shakeIntensity = 7.5;
      }

      if (de.timer >= de.duration + 0.08) {
        this.dyingEnemies.splice(i, 1);
      }
    }

    // Update Pink Goo Particles (Stretchy droplets & globules that stick to platforms)
    for (let i = this.pinkGooParticles.length - 1; i >= 0; i--) {
      const pt = this.pinkGooParticles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += pt.gravity * dt;
      pt.vx *= Math.pow(0.97, dt * 60);
      pt.life -= dt;

      // Check collision with platform surfaces to spawn persistent pink goo splats
      // Fast AABB rejection: skip curve evaluation if particle is nowhere near platform!
      for (const plat of this.level.platforms) {
        if (pt.x < plat.x || pt.x > plat.x + plat.w) continue;
        if (pt.y < plat.y - 8 || pt.y > plat.y + 20 || pt.vy <= 0) continue;

        const surfY = this.getPlatformSurfaceY(plat, pt.x, this.time);
        if (pt.y >= surfY - 4 && pt.y <= surfY + 12) {
          if (this.pinkGooSplats.length < 24) {
            this.pinkGooSplats.push({
              x: pt.x,
              y: surfY,
              rx: 6 + Math.random() * 8,
              ry: 2 + Math.random() * 2.5,
              color: pt.color,
              life: 4.5,
              maxLife: 4.5
            });
          }
          pt.life = 0;
          break;
        }
      }

      if (pt.life <= 0) {
        this.pinkGooParticles.splice(i, 1);
      }
    }

    // Update persistent Pink Goo Splats on platforms
    for (let i = this.pinkGooSplats.length - 1; i >= 0; i--) {
      const splat = this.pinkGooSplats[i];
      splat.life -= dt;
      if (splat.life <= 0) {
        this.pinkGooSplats.splice(i, 1);
      }
    }

    // Update Splat Shockwave Bursts
    for (let i = this.splatBursts.length - 1; i >= 0; i--) {
      const sb = this.splatBursts[i];
      sb.life -= dt;
      const t = 1 - sb.life / sb.maxLife;
      sb.currentR = sb.r + (sb.maxR - sb.r) * t;
      if (sb.life <= 0) {
        this.splatBursts.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += pt.gravity * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 38 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // Smooth Camera Follow with adaptive look-ahead for Portrait vs Landscape
    const isPortrait = this.width < 700;
    const anchorRatio = isPortrait ? 0.44 : 0.36;
    const lookAhead = isPortrait ? 28 : 65;
    const targetCamX = Math.max(
      0,
      Math.min(this.level.width - this.width, p.x - this.width * anchorRatio + p.facing * lookAhead)
    );
    this.cameraX += (targetCamX - this.cameraX) * 6.5 * dt;

    // Biome name update
    const newBiome = p.x < 3250 ? 'Starry Espresso Hills' : 'Sunset Biscotti Grove';
    if (newBiome !== this.currentBiome) {
      this.currentBiome = newBiome;
      this.syncHud();
    }
  }

  syncHud() {
    if (!this.callbacks.onHudUpdate) return;
    this.callbacks.onHudUpdate({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      caffeine: Math.round(this.player.caffeine),
      beans: this.beanCount,
      score: this.score,
      biome: this.currentBiome,
      discoveredCount: this.discoveredProducts.size,
      totalProducts: PRODUCTS.length,
      shieldActive: this.player.shieldActive,
      hasBeanGun: this.player.hasBeanGun
    });
  }

  render() {
    const ctx = this.ctx;
    const scale = this.renderScale || 1;
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    // Screen shake offset
    let camX = this.cameraX;
    if (this.shakeTimer > 0) {
      camX += (Math.random() - 0.5) * this.shakeIntensity;
    }

    // 1. Sky, twinkling stars, and latte-art clouds
    this.renderer.drawSkyAndClouds(camX, this.time);

    // 2. Parallax Espresso Machines, Grinders, Rolling Hills, and Coffee Flora
    this.renderer.drawParallaxBackground(camX, this.time);

    // 3. Platforms (Biscuits, Mossy Giant Beans, Sugar Cubes, Biscotti, Chocolate Cookies, Gingerbread)
    for (const plat of this.level.platforms) {
      this.renderer.drawPlatform(plat, camX, this.time);
    }

    // 4. Persistent Pink Goo Splats on Platforms
    this.renderer.drawPinkGooSplats(this.pinkGooSplats, camX);

    // 5. Weapon Pickups (Bean Blaster Gun)
    if (this.level.weaponPickups) {
      for (const pickup of this.level.weaponPickups) {
        this.renderer.drawWeaponPickup(pickup, camX, this.time);
      }
    }

    // 6. Collectible Golden Coffee Beans
    for (const bean of this.level.beans) {
      this.renderer.drawBean(bean, camX, this.time);
    }

    // 7. Mystery Product Pedestals
    for (const node of this.level.productNodes) {
      const product = PRODUCTS.find((pr) => pr.id === node.productId);
      if (product) {
        this.renderer.drawProductPedestal(node, product, camX, this.time);
      }
    }

    // 8. Live Enemies
    for (const enemy of this.level.enemies) {
      this.renderer.drawEnemy(enemy, camX, this.time);
    }

    // 9. Dying Enemies (Swelling, shaking with pressure, and bursting into pink goo!)
    for (const de of this.dyingEnemies) {
      this.renderer.drawDyingEnemy(de, camX, this.time);
    }

    // 10. Projectiles (Spinning Coffee Beans or Espresso Shots)
    for (const proj of this.projectiles) {
      if (proj.isBeanProjectile) {
        this.renderer.drawBeanProjectile(proj, camX, this.time);
      } else {
        const sx = proj.x - camX;
        ctx.save();
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sx, proj.y, proj.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 11. Hero Coffee Cup Character (equipped with Bean Blaster Gun)
    this.renderer.drawPlayer(this.player, camX, this.time, this.unlockedPowerups);

    // 12. Pink Goo Particles & Splat Shockwaves
    this.renderer.drawPinkGooParticles(this.pinkGooParticles, this.splatBursts, camX);

    // 13. Regular Particles (Steam, Crema Splashes, Sugar Sparks)
    for (const pt of this.particles) {
      const sx = pt.x - camX;
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(sx, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 14. Foreground Swirling Milk Rapids & Boiling Crema Waves
    this.renderer.drawForegroundLiquidAndFrame(camX, this.time, this.level.liquidLevel);

    // 15. Floating Combat & Score Popups
    for (const ft of this.floatingTexts) {
      const sx = ft.x - camX;
      ctx.save();
      ctx.globalAlpha = Math.min(1, ft.life * 1.4);
      ctx.font = '900 15px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#271105';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, sx, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, sx, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }
}
