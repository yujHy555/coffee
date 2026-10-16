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

    this.player = {
      x: 130,
      y: 420,
      vx: 0,
      vy: 0,
      r: 25, // Slightly larger protagonist presence
      facing: 1,
      onGround: false,
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
    // Espresso Shot: KeyX / KeyK
    if (code === 'KeyX' || code === 'KeyK') {
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

  triggerJump() {
    const p = this.player;
    const maxJumps = this.unlockedPowerups.has('golden_boost') ? 3 : 2;

    if (p.onGround || p.coyoteTimer > 0) {
      p.vy = -595;
      p.onGround = false;
      p.coyoteTimer = 0;
      p.jumpBufferTimer = 0;
      p.jumpsRemaining = maxJumps - 1;
      // Snappy vertical stretch on takeoff!
      this.impulseScale(0.68, 1.38, 3.2);
      sound.playJump(false);
      this.spawnCoffeeSplash(p.x, p.y - 18, 9, '#78350f');
      this.spawnCoffeeSplash(p.x, p.y + 22, 6, '#fde68a');
    } else if (p.jumpsRemaining > 0) {
      p.vy = -535;
      p.jumpsRemaining--;
      p.jumpBufferTimer = 0;
      // Double-jump mid-air pop & stretch!
      this.impulseScale(0.72, 1.34, 3.6);
      sound.playJump(true);
      this.spawnCoffeeSplash(p.x, p.y + 16, 14, '#fef08a');
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
    const reach = upgraded ? 84 : 60;
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
    if (p.shotCooldown > 0 || p.caffeine < 8) return;

    p.caffeine = Math.max(0, p.caffeine - 8);
    p.shotCooldown = 0.24;
    sound.playEspressoShot();

    const isTriple = this.unlockedPowerups.has('triple_shot');
    const spreads = isTriple ? [-75, 0, 75] : [0];

    spreads.forEach((vySpread) => {
      this.projectiles.push({
        x: p.x + p.facing * 28,
        y: p.y - 4,
        vx: p.facing * 660,
        vy: vySpread,
        r: isTriple ? 9 : 7,
        pierce: isTriple ? 2 : 1,
        life: 1.3
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

  damageEnemy(enemy, dmg, knockbackVx = 0) {
    enemy.hp -= dmg;
    this.spawnCoffeeSplash(enemy.x, enemy.y, 12, '#f59e0b');
    this.shakeTimer = 0.12;
    this.shakeIntensity = 5;

    if (enemy.hp <= 0) {
      enemy.dead = true;
      sound.playEnemyDefeat();
      this.score += 500;
      this.player.caffeine = Math.min(100, this.player.caffeine + 18);
      this.addFloatingText(enemy.x, enemy.y - 20, '+500 ROASTED!', '#fbbf24');
      this.spawnCoffeeSplash(enemy.x, enemy.y, 20, '#fef08a');
      this.syncHud();
    } else {
      enemy.x += knockbackVx * 0.08;
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
    this.impulseScale(0.65, 1.38, 4.0);
    this.shakeTimer = 0.25;
    this.shakeIntensity = 9;
    sound.playHurt();
    this.spawnCoffeeSplash(p.x, p.y, 18, '#ef4444');

    if (p.hp <= 0) {
      // Respawn at last checkpoint with full health
      p.hp = p.maxHp;
      p.x = p.checkpointX;
      p.y = p.checkpointY - 30;
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
          this.spawnCoffeeSplash(p.x + 12, p.y + 20, 4, '#fde68a');
        }
        p.vx = Math.max(p.vx - baseAccel * turnBoost * dt, -maxSpeed);
        p.facing = -1;
      } else if (moveRight) {
        const turnBoost = p.vx < -40 ? 2.1 : 1.0;
        if (p.facing === -1 && p.onGround) {
          this.impulseScale(1.18, 0.85, 1.2);
          this.spawnCoffeeSplash(p.x - 12, p.y + 20, 4, '#fde68a');
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

    // Platform Collisions (One-way top landing + solid standing)
    const wasOnGround = p.onGround;
    p.onGround = false;

    for (const plat of this.level.platforms) {
      const withinX = p.x + p.r * 0.76 > plat.x && p.x - p.r * 0.76 < plat.x + plat.w;
      const crossedTop = prevY + p.r <= plat.y + 16 && p.y + p.r >= plat.y && p.vy >= 0;

      if (withinX && crossedTop) {
        p.y = plat.y - p.r;
        p.vy = 0;
        p.onGround = true;
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
            this.spawnCoffeeSplash(p.x, plat.y, 8, '#bae6fd');
          } else if (impactFactor > 0.55) {
            this.spawnCoffeeSplash(p.x, plat.y, 6, '#fde68a');
          }
        }

        // Execute buffered jump immediately on touchdown for frame-perfect responsiveness!
        if (p.jumpBufferTimer > 0) {
          this.triggerJump();
        }

        // Checkpoint activation
        if (plat.isCheckpoint && p.checkpointX < plat.x) {
          p.checkpointX = plat.x + 80;
          p.checkpointY = plat.y - 34;
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
      }
    }

    if (wasOnGround && !p.onGround && p.vy >= 0) {
      p.coyoteTimer = 0.14;
    }

    // Liquid Hazard check (Falling into Milk Rapids or Boiling Crema Lake)
    if (p.y + p.r > this.level.liquidLevel + 12) {
      this.hurtPlayer();
      p.y = p.checkpointY - 34;
      p.x = p.checkpointX;
      p.vx = 0;
      p.vy = 0;
    }

    // --- Harmonic Spring-Damper Squash & Stretch + Liquid Slosh Physics ---
    // While airborne, target scale subtly stretches with vertical velocity; on ground, target is 1.0 with a lively run bounce
    const runBounce = p.onGround && Math.abs(p.vx) > 25
      ? Math.sin(p.animTime * 18) * 0.065 * Math.min(1, Math.abs(p.vx) / 260)
      : 0;
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

    const sloshTarget = -p.vx * 0.015;
    p.sloshVel += ((sloshTarget - p.sloshAngle) * 120 - p.sloshVel * 8) * dt;
    p.sloshAngle += p.sloshVel * dt;

    p.animTime += dt;

    // Ambient rising steam & coffee droplets from the hero cup!
    if (Math.random() < 0.35) {
      this.particles.push({
        x: p.x + (Math.random() - 0.5) * 16,
        y: p.y - 24,
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

    // Update Projectiles (Espresso Shots)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      // Hit enemies
      for (const enemy of this.level.enemies) {
        if (enemy.dead) continue;
        if (Math.hypot(proj.x - enemy.x, proj.y - enemy.y) < enemy.hp * 4 + 24) {
          this.damageEnemy(enemy, 1, Math.sign(proj.vx) * 140);
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

    // Update Enemies (Coffee Bean Grunt, Sugar Cube Hopper, Steam Cloud Spirit)
    for (const enemy of this.level.enemies) {
      if (enemy.dead) continue;
      if (enemy.type === 'sugar_hopper') {
        enemy.vx = (enemy.vx >= 0 ? 1 : -1) * 180;
      }
      enemy.x += enemy.vx * dt;
      if (enemy.x < enemy.minX) {
        enemy.x = enemy.minX;
        enemy.vx = Math.abs(enemy.vx);
      } else if (enemy.x > enemy.maxX) {
        enemy.x = enemy.maxX;
        enemy.vx = -Math.abs(enemy.vx);
      }

      if (enemy.type === 'steam_spirit' && enemy.baseY !== undefined) {
        enemy.y = enemy.baseY + Math.sin(this.time * 3.8 + enemy.x * 0.02) * 14;
      }

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
          p.vy = -525;
          this.impulseScale(1.36, 0.72, 4.2);
          this.damageEnemy(enemy, 1, 0);
        } else {
          this.hurtPlayer();
        }
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
      shieldActive: this.player.shieldActive
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

    // 4. Collectible Golden Coffee Beans
    for (const bean of this.level.beans) {
      this.renderer.drawBean(bean, camX, this.time);
    }

    // 5. Mystery Product Pedestals
    for (const node of this.level.productNodes) {
      const product = PRODUCTS.find((pr) => pr.id === node.productId);
      if (product) {
        this.renderer.drawProductPedestal(node, product, camX, this.time);
      }
    }

    // 6. Enemies
    for (const enemy of this.level.enemies) {
      this.renderer.drawEnemy(enemy, camX, this.time);
    }

    // 7. Espresso Shot Projectiles
    for (const proj of this.projectiles) {
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

    // 8. Hero Coffee Cup Character
    this.renderer.drawPlayer(this.player, camX, this.time, this.unlockedPowerups);

    // 9. Particles (Steam, Crema Splashes, Sugar Sparks)
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

    // 10. Foreground Swirling Milk Rapids & Boiling Crema Waves
    this.renderer.drawForegroundLiquidAndFrame(camX, this.time, this.level.liquidLevel);

    // 11. Floating Combat & Score Popups
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
