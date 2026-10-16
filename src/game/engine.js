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
      r: 22,
      facing: 1,
      onGround: false,
      jumpsRemaining: 2,
      coyoteTimer: 0,
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
      this.keys.delete(e.code);
    });
  }

  // Triggered by keyboard or mobile touch buttons
  handleKeyPress(code) {
    if (this.paused) return;

    // Jump: Space / W / ArrowUp
    if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') {
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

  triggerJump() {
    const p = this.player;
    const maxJumps = this.unlockedPowerups.has('golden_boost') ? 3 : 2;

    if (p.onGround || p.coyoteTimer > 0) {
      p.vy = -560;
      p.onGround = false;
      p.coyoteTimer = 0;
      p.jumpsRemaining = maxJumps - 1;
      p.scaleX = 0.78;
      p.scaleY = 1.28;
      sound.playJump(false);
      this.spawnCoffeeSplash(p.x, p.y - 16, 8, '#78350f');
    } else if (p.jumpsRemaining > 0) {
      p.vy = -510;
      p.jumpsRemaining--;
      p.scaleX = 0.82;
      p.scaleY = 1.22;
      sound.playJump(true);
      this.spawnCoffeeSplash(p.x, p.y + 14, 12, '#fef08a');
    }
  }

  triggerSpoonMelee() {
    const p = this.player;
    if (p.meleeCooldown > 0) return;

    const upgraded = this.unlockedPowerups.has('silver_spoon');
    p.meleeTimer = 0.24;
    p.meleeCooldown = 0.34;
    sound.playSpoonSwing(upgraded);

    // Check melee hitbox in front of player
    const reach = upgraded ? 78 : 54;
    const hitX = p.x + p.facing * (reach * 0.6);
    const hitY = p.y;

    this.level.enemies.forEach((enemy) => {
      if (enemy.dead) return;
      const dist = Math.hypot(enemy.x - hitX, enemy.y - hitY);
      if (dist <= reach) {
        this.damageEnemy(enemy, upgraded ? 2 : 1, p.facing * 220);
      }
    });
  }

  triggerEspressoShot() {
    const p = this.player;
    if (p.shotCooldown > 0 || p.caffeine < 8) return;

    p.caffeine = Math.max(0, p.caffeine - 8);
    p.shotCooldown = 0.26;
    sound.playEspressoShot();

    const isTriple = this.unlockedPowerups.has('triple_shot');
    const spreads = isTriple ? [-75, 0, 75] : [0];

    spreads.forEach((vySpread) => {
      this.projectiles.push({
        x: p.x + p.facing * 26,
        y: p.y - 4,
        vx: p.facing * 640,
        vy: vySpread,
        r: isTriple ? 9 : 7,
        pierce: isTriple ? 2 : 1,
        life: 1.3
      });
    });

    p.scaleX = 1.18;
    p.scaleY = 0.86;
    this.syncHud();
  }

  triggerDash() {
    const p = this.player;
    if (p.dashCooldown > 0 || p.caffeine < 15) return;

    p.caffeine = Math.max(0, p.caffeine - 15);
    p.dashTimer = 0.18;
    p.dashCooldown = 0.65;
    p.vx = p.facing * 680;
    p.vy = 0;
    sound.playJump(true);
    this.spawnCoffeeSplash(p.x, p.y, 14, '#fde047');
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
      sound.playSugarCrumble();
      this.addFloatingText(p.x, p.y - 30, 'NITRO SHIELD BLOCKED!', '#f472b6');
      this.spawnCoffeeSplash(p.x, p.y, 18, '#f472b6');
      this.syncHud();
      return;
    }

    p.hp--;
    p.invulnTimer = 1.5;
    p.vy = -380;
    p.vx = -p.facing * 240;
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
    if (this.shakeTimer > 0) this.shakeTimer -= dt;

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    // Passive caffeine regeneration (faster with Golden Honey Geisha unlock)
    const regenRate = this.unlockedPowerups.has('golden_boost') ? 9 : 4.5;
    p.caffeine = Math.min(100, p.caffeine + regenRate * dt);

    // Horizontal Movement
    const moveLeft = this.keys.has('ArrowLeft') || this.keys.has('KeyA');
    const moveRight = this.keys.has('ArrowRight') || this.keys.has('KeyD');

    if (p.dashTimer <= 0) {
      const accel = p.onGround ? 1900 : 1250;
      const maxSpeed = 330;

      if (moveLeft) {
        p.vx = Math.max(p.vx - accel * dt, -maxSpeed);
        p.facing = -1;
      } else if (moveRight) {
        p.vx = Math.min(p.vx + accel * dt, maxSpeed);
        p.facing = 1;
      } else {
        const friction = p.onGround ? 0.82 : 0.93;
        p.vx *= Math.pow(friction, dt * 60);
        if (Math.abs(p.vx) < 8) p.vx = 0;
      }

      // Gravity
      p.vy += 1380 * dt;
      if (p.vy > 780) p.vy = 780;
    }

    // Integrate position
    const prevY = p.y;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // World boundaries
    if (p.x < 30) {
      p.x = 30;
      p.vx = 0;
    }
    if (p.x > this.level.width - 40) {
      p.x = this.level.width - 40;
    }

    // Platform Collisions (One-way top landing + solid standing)
    const wasOnGround = p.onGround;
    p.onGround = false;

    for (const plat of this.level.platforms) {
      const withinX = p.x + p.r * 0.75 > plat.x && p.x - p.r * 0.75 < plat.x + plat.w;
      const crossedTop = prevY + p.r <= plat.y + 14 && p.y + p.r >= plat.y && p.vy >= 0;

      if (withinX && crossedTop) {
        p.y = plat.y - p.r;
        p.vy = 0;
        p.onGround = true;
        p.coyoteTimer = 0.12;
        p.jumpsRemaining = this.unlockedPowerups.has('golden_boost') ? 2 : 1;

        if (!wasOnGround) {
          p.scaleX = 1.24;
          p.scaleY = 0.78;
          if (plat.type === 'sugar_cube') {
            sound.playSugarCrumble();
            this.spawnCoffeeSplash(p.x, plat.y, 7, '#bae6fd');
          }
        }

        // Checkpoint activation
        if (plat.isCheckpoint && p.checkpointX < plat.x) {
          p.checkpointX = plat.x + 80;
          p.checkpointY = plat.y - 30;
          p.shieldActive = this.unlockedPowerups.has('nitro_shield');
          this.addFloatingText(p.x, p.y - 45, `CHECKPOINT: ${plat.checkpointName.toUpperCase()}!`, '#fde047');
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
      p.coyoteTimer = 0.12;
    }

    // Liquid Hazard check (Falling into Milk Rapids or Boiling Crema Lake)
    if (p.y + p.r > this.level.liquidLevel + 12) {
      this.hurtPlayer();
      p.y = p.checkpointY - 30;
      p.x = p.checkpointX;
      p.vx = 0;
      p.vy = 0;
    }

    // Smoothly restore squash & stretch
    p.scaleX += (1 - p.scaleX) * 14 * dt;
    p.scaleY += (1 - p.scaleY) * 14 * dt;
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

    // Update Enemies
    for (const enemy of this.level.enemies) {
      if (enemy.dead) continue;
      enemy.x += enemy.vx * dt;
      if (enemy.x < enemy.minX) {
        enemy.x = enemy.minX;
        enemy.vx = Math.abs(enemy.vx);
      } else if (enemy.x > enemy.maxX) {
        enemy.x = enemy.maxX;
        enemy.vx = -Math.abs(enemy.vx);
      }

      // Player vs Enemy collision
      const dx = p.x - enemy.x;
      const dy = p.y - enemy.y;
      const dist = Math.hypot(dx, dy);

      if (dist < p.r + 22) {
        // Check if player is stomping from above
        const isStomping = p.vy > 40 && p.y < enemy.y - 8;

        if (p.dashTimer > 0 && this.unlockedPowerups.has('nitro_shield')) {
          this.damageEnemy(enemy, 2, p.facing * 260);
        } else if (isStomping && enemy.type !== 'spiked_bean') {
          p.vy = -480;
          p.scaleX = 1.25;
          p.scaleY = 0.75;
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
