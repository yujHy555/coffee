// AAA 2D Painterly Vector & Procedural Animation Renderer
// Faithfully recreates the two concept art images:
// 1. Night Starry Espresso Hills (Golden leaf coffee plant, espresso machines & burr grinders, mossy giant bean boulders, sugar cube arches, swirling milk rapids)
// 2. Sunset Biscotti Grove (Latte art clouds, coffee cherry trees, crumbling biscotti islands, chocolate-dipped cookies, boiling crema vortex)
// 3. Fully animated Coffee Cup Hero (sloshing espresso inside rim, rising steam, red boots, silver barista spoon slash, espresso shots)

export class WorldRenderer {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.scale = 1;
    this.stars = Array.from({ length: 110 }, (_, i) => ({
      x: (i * 173.7) % 1800,
      y: (i * 71.3) % 330,
      r: 0.7 + (i % 4) * 0.65,
      phase: i * 0.7,
      isCross: i % 11 === 0
    }));
    this.currentLevel = 1;
  }

  setLevel(levelIndex) {
    this.currentLevel = levelIndex;
  }

  resize(width, height, scale = 1) {
    this.width = width;
    this.height = height;
    this.scale = scale;
  }

  // Smooth blend factor (0 = Zone 1 Night Starry Hills, 1 = Zone 2 Sunset Biscotti Grove)
  getBiomeBlend(cameraX) {
    const startTransition = 2750;
    const endTransition = 3650;
    return Math.max(0, Math.min(1, (cameraX - startTransition) / (endTransition - startTransition)));
  }

  lerpColor(hexA, hexB, t) {
    const a = parseInt(hexA.slice(1), 16);
    const b = parseInt(hexB.slice(1), 16);
    const r = Math.round(((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t);
    const g = Math.round(((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t);
    const bl = Math.round((a & 255) * (1 - t) + (b & 255) * t);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  drawSkyAndClouds(cameraX, time) {
    const ctx = this.ctx;
    const blend = this.getBiomeBlend(cameraX);

    if (this.currentLevel === 3) {
      // Level 3 Sky Gradient: Cloudtop Stratosphere (golden peach/sunset violet) -> Celestial Star-Roast Orbit (deep space cosmic void)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height * 0.9);
      skyGrad.addColorStop(0, this.lerpColor('#2e1065', '#020617', blend));
      skyGrad.addColorStop(0.3, this.lerpColor('#4c1d95', '#0f172a', blend));
      skyGrad.addColorStop(0.6, this.lerpColor('#7c2d12', '#1e1b4b', blend));
      skyGrad.addColorStop(0.85, this.lerpColor('#ea580c', '#312e81', blend));
      skyGrad.addColorStop(1, this.lerpColor('#fde047', '#0369a1', blend));

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Cosmic stars, nebula dust, and planetary rings
      ctx.save();
      this.stars.forEach((s) => {
        const sx = ((s.x - cameraX * 0.04) % this.width + this.width) % this.width;
        const twinkle = 0.45 + 0.55 * Math.sin(time * 3.6 + s.phase);
        ctx.fillStyle = s.isCross ? `rgba(56, 189, 248, ${twinkle * 0.95})` : `rgba(254, 240, 138, ${twinkle * 0.85})`;
        ctx.beginPath();
        ctx.arc(sx, s.y, s.r * 1.3, 0, Math.PI * 2);
        ctx.fill();

        if (s.isCross && twinkle > 0.6) {
          this.drawFourPointSparkle(sx, s.y, s.r * 5, `rgba(125, 211, 252, ${twinkle})`);
        }
      });

      // Distant ringed coffee planet in Zone 2
      if (blend > 0.2) {
        const planetAlpha = Math.min(1, (blend - 0.2) * 1.5);
        ctx.save();
        ctx.globalAlpha = planetAlpha;
        const px = ((2400 - cameraX * 0.03) % (this.width + 400) + (this.width + 400)) % (this.width + 400) - 100;
        const py = 120;

        // Swirling espresso latte globe
        const pGrad = ctx.createRadialGradient(px - 14, py - 14, 8, px, py, 42);
        pGrad.addColorStop(0, '#fef08a');
        pGrad.addColorStop(0.4, '#d97706');
        pGrad.addColorStop(0.8, '#78350f');
        pGrad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(px, py, 38, 0, Math.PI * 2);
        ctx.fill();

        // Planetary foam rings
        ctx.strokeStyle = 'rgba(253, 230, 138, 0.65)';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.ellipse(px, py, 68, 16, -0.28, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
      return;
    }

    if (this.currentLevel === 2) {
      // Level 2 Sky Gradient: Neon Mocha Grotto (deep obsidian/amethyst violet) -> Frothy Caramel Caldera (fiery sunset amber/caramel)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height * 0.85);
      skyGrad.addColorStop(0, this.lerpColor('#0c0714', '#2d0f04', blend));
      skyGrad.addColorStop(0.32, this.lerpColor('#1d0e2e', '#5b1d09', blend));
      skyGrad.addColorStop(0.64, this.lerpColor('#3b0764', '#9a3412', blend));
      skyGrad.addColorStop(0.88, this.lerpColor('#701a75', '#c2410c', blend));
      skyGrad.addColorStop(1, this.lerpColor('#2e1022', '#f59e0b', blend));

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Glowing subterranean crystals and star nebulas
      ctx.save();
      this.stars.forEach((s) => {
        const sx = ((s.x - cameraX * 0.05) % this.width + this.width) % this.width;
        const twinkle = 0.4 + 0.6 * Math.sin(time * 3.2 + s.phase);
        ctx.fillStyle = s.isCross ? `rgba(244, 114, 182, ${twinkle * 0.9})` : `rgba(192, 132, 252, ${twinkle * 0.75})`;
        ctx.beginPath();
        ctx.arc(sx, s.y, s.r * 1.2, 0, Math.PI * 2);
        ctx.fill();

        if (s.isCross && twinkle > 0.6) {
          this.drawFourPointSparkle(sx, s.y, s.r * 4.5, `rgba(250, 204, 21, ${twinkle})`);
        }
      });

      // Cavern ceiling stalactites in Zone 1
      if (blend < 0.85) {
        const stalactiteAlpha = 1 - blend;
        ctx.globalAlpha = stalactiteAlpha;
        for (let i = 0; i < 9; i++) {
          const stX = ((i * 220 - cameraX * 0.1) % (this.width + 300) + (this.width + 300)) % (this.width + 300) - 100;
          const stH = 35 + ((i * 29) % 55);
          ctx.fillStyle = '#170b22';
          ctx.beginPath();
          ctx.moveTo(stX - 18, 0);
          ctx.lineTo(stX + 18, 0);
          ctx.lineTo(stX, stH);
          ctx.closePath();
          ctx.fill();

          // Glowing amethyst crystal tip
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.moveTo(stX - 6, stH - 12);
          ctx.lineTo(stX + 6, stH - 12);
          ctx.lineTo(stX, stH + 8);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      return;
    }

    // Rich Painterly Sky Gradient (Matches Reference Image 1 Deep Indigo -> Slate Blue -> Teal-Cyan -> Warm Horizon Glow)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height * 0.85);
    skyGrad.addColorStop(0, this.lerpColor('#1b2a4a', '#4a154b', blend));
    skyGrad.addColorStop(0.32, this.lerpColor('#2c4870', '#9b374e', blend));
    skyGrad.addColorStop(0.64, this.lerpColor('#5887a8', '#e27347', blend));
    skyGrad.addColorStop(0.88, this.lerpColor('#9bc2cf', '#f7b257', blend));
    skyGrad.addColorStop(1, this.lerpColor('#e4d5b7', '#fde08d', blend));

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Twinkling Starfield & 4-Point Celestial Sparkles (Reference Image 1)
    const starAlpha = 1 - blend * 0.6;
    ctx.save();
    this.stars.forEach((s) => {
      const sx = ((s.x - cameraX * 0.06) % this.width + this.width) % this.width;
      const twinkle = 0.4 + 0.6 * Math.sin(time * 2.6 + s.phase);
      ctx.fillStyle = `rgba(255, 252, 235, ${twinkle * starAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      if (s.isCross && twinkle > 0.65) {
        this.drawFourPointSparkle(sx, s.y, s.r * 4.2, `rgba(255, 250, 220, ${twinkle * 0.85 * starAlpha})`);
      }
    });
    ctx.restore();

    // Painterly Layered Billowing Clouds with Decorative Spirals (Exact match to Reference Image 1!)
    ctx.save();
    const cloudConfigs = [
      { baseX: 160, y: 58, scale: 1.15, flip: 1 },
      { baseX: 540, y: 82, scale: 1.35, flip: -1 },
      { baseX: 960, y: 48, scale: 1.05, flip: 1 },
      { baseX: 1380, y: 92, scale: 1.25, flip: -1 },
      { baseX: 1760, y: 64, scale: 1.1, flip: 1 }
    ];

    const span = Math.max(this.width + 450, 1950);
    cloudConfigs.forEach((cfg, i) => {
      const cx = (((cfg.baseX - cameraX * 0.12) % span) + span) % span - 220;
      const cy = cfg.y + Math.sin(time * 0.45 + i) * 4;
      this.drawReferenceCloudBand(cx, cy, cfg.scale, cfg.flip, blend);
    });
    ctx.restore();
  }

  drawFourPointSparkle(x, y, size, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(size * 0.14, -size * 0.14, size, 0);
    ctx.quadraticCurveTo(size * 0.14, size * 0.14, 0, size);
    ctx.quadraticCurveTo(-size * 0.14, size * 0.14, -size, 0);
    ctx.quadraticCurveTo(-size * 0.14, -size * 0.14, 0, -size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawReferenceCloudBand(x, y, scale, flip, blend) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * flip, scale);

    // Colors from Reference Image 1 cloud layers:
    // Deep blue-slate shadow base, soft periwinkle mid-body, luminous pale-ice upper rim highlight, and inner spiral curls
    const shadowCol = blend < 0.5
      ? 'rgba(54, 83, 122, 0.58)'
      : 'rgba(165, 68, 82, 0.52)';
    const midCol = blend < 0.5
      ? 'rgba(98, 136, 174, 0.68)'
      : 'rgba(232, 126, 98, 0.64)';
    const highlightCol = blend < 0.5
      ? 'rgba(168, 202, 228, 0.72)'
      : 'rgba(254, 202, 152, 0.72)';
    const curlCol = blend < 0.5
      ? 'rgba(62, 95, 136, 0.65)'
      : 'rgba(180, 78, 85, 0.6)';

    // 1. Sweeping diagonal cloud tail & shadow base
    ctx.fillStyle = shadowCol;
    ctx.beginPath();
    ctx.moveTo(-165, 36);
    ctx.bezierCurveTo(-110, 12, -55, -24, 15, -28);
    ctx.bezierCurveTo(65, -32, 125, -8, 165, 18);
    ctx.bezierCurveTo(115, 38, 35, 44, -45, 42);
    ctx.bezierCurveTo(-105, 40, -145, 42, -165, 36);
    ctx.closePath();
    ctx.fill();

    // 2. Sculpted billowing cloud puffs (Midtone body)
    ctx.fillStyle = midCol;
    ctx.beginPath();
    ctx.moveTo(-145, 30);
    ctx.bezierCurveTo(-125, 4, -90, 2, -72, 12);
    ctx.bezierCurveTo(-58, -18, -12, -26, 12, -4);
    ctx.bezierCurveTo(32, -24, 78, -20, 92, 4);
    ctx.bezierCurveTo(115, -4, 145, 6, 155, 22);
    ctx.quadraticCurveTo(60, 36, -35, 34);
    ctx.quadraticCurveTo(-100, 35, -145, 30);
    ctx.closePath();
    ctx.fill();

    // 3. Crisp luminous top rim highlight along each puff crest (Reference Image 1 signature look!)
    ctx.strokeStyle = highlightCol;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-132, 20);
    ctx.bezierCurveTo(-115, 2, -88, 2, -72, 12);
    ctx.moveTo(-64, 6);
    ctx.bezierCurveTo(-48, -16, -12, -22, 10, -4);
    ctx.moveTo(18, -6);
    ctx.bezierCurveTo(36, -20, 72, -16, 86, 2);
    ctx.stroke();

    // 4. Stylized Decorative Swirl Curls inside the cloud body (Exact detail from Reference Image 1!)
    ctx.strokeStyle = curlCol;
    ctx.lineWidth = 2.6;
    const drawCloudSpiral = (sx, sy, rMax) => {
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2.7; a += 0.22) {
        const r = rMax * (1 - a / (Math.PI * 3.1));
        const px = sx + Math.cos(a) * r * 1.25;
        const py = sy + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };

    drawCloudSpiral(-18, 12, 15);
    drawCloudSpiral(48, 15, 12);
    drawCloudSpiral(-82, 21, 9);

    ctx.restore();
  }

  drawParallaxBackground(cameraX, time) {
    const ctx = this.ctx;
    const blend = this.getBiomeBlend(cameraX);

    if (this.currentLevel === 3) {
      // Level 3 Stratosphere & Cosmic Orbit Parallax
      ctx.save();

      // Distant Floating Steampunk Airships sailing across the sky
      const airshipCoords = [
        { wx: 480, y: 170, scale: 0.65 },
        { wx: 1680, y: 130, scale: 0.5 },
        { wx: 2980, y: 190, scale: 0.7 },
        { wx: 4240, y: 140, scale: 0.55 },
        { wx: 5640, y: 210, scale: 0.65 },
        { wx: 6840, y: 150, scale: 0.5 }
      ];

      airshipCoords.forEach((ship, idx) => {
        const sx = ship.wx - cameraX * 0.22;
        if (sx < -160 || sx > this.width + 160) return;
        const bob = Math.sin(time * 1.5 + idx) * 8;
        ctx.save();
        ctx.translate(sx, ship.y + bob);
        ctx.scale(ship.scale, ship.scale);

        // Zeppelin gasbag (warm cappuccino cream)
        const bagGrad = ctx.createLinearGradient(0, -25, 0, 25);
        bagGrad.addColorStop(0, '#fef3c7');
        bagGrad.addColorStop(0.5, '#f59e0b');
        bagGrad.addColorStop(1, '#92400e');
        ctx.fillStyle = bagGrad;
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, 52, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Lower gondola cabin
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.roundRect(-24, 20, 48, 12, 3);
        ctx.fill();
        ctx.stroke();

        // Tiny glowing cabin portholes
        ctx.fillStyle = '#fde047';
        for (let p = -16; p <= 16; p += 8) {
          ctx.beginPath();
          ctx.arc(p, 26, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Turning aft propeller
        ctx.save();
        ctx.translate(56, 0);
        ctx.rotate(time * 18);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(0, 14);
        ctx.stroke();
        ctx.restore();

        ctx.restore();
      });

      // Lower atmospheric cloud sea
      ctx.fillStyle = blend < 0.5 ? 'rgba(254, 243, 199, 0.45)' : 'rgba(30, 27, 75, 0.55)';
      ctx.beginPath();
      ctx.moveTo(-20, this.height);
      for (let x = -20; x <= this.width + 40; x += 36) {
        const worldX = x + cameraX * 0.35;
        const y = 490 + Math.sin(worldX * 0.005) * 26 + Math.cos(worldX * 0.012) * 12;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(this.width + 40, this.height);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      return;
    }

    // Distant hazy roastery skyline silhouettes (Moka pots, silos, portafilter towers in mist as seen in Image 1 center horizon)
    ctx.save();
    ctx.fillStyle = this.lerpColor('#5c7e9e', '#9e584c', blend);
    ctx.globalAlpha = 0.45;
    for (let i = 0; i < 12; i++) {
      const hx = ((i * 310 - cameraX * 0.2) % (this.width + 400) + (this.width + 400)) % (this.width + 400) - 200;
      const hHeight = 70 + (i % 3) * 32;
      ctx.beginPath();
      ctx.roundRect(hx, 390 - hHeight, 38 + (i % 2) * 18, hHeight + 60, 8);
      ctx.fill();
    }
    ctx.restore();

    // Far Layer: Detailed Pastel-Lilac Espresso Machines & Clear-Hopper Burr Grinders (Reference Image 1 left & right!)
    ctx.save();
    const machinePositions = [
      { worldX: 310, type: 'espresso_machine' },
      { worldX: 980, type: 'burr_grinder' },
      { worldX: 1120, type: 'drip_brewer' },
      { worldX: 1680, type: 'espresso_machine' },
      { worldX: 2320, type: 'burr_grinder' },
      { worldX: 2940, type: 'drip_brewer' },
      { worldX: 3650, type: 'vintage_mill' },
      { worldX: 4520, type: 'espresso_machine' },
      { worldX: 5380, type: 'vintage_mill' },
      { worldX: 6250, type: 'burr_grinder' }
    ];

    machinePositions.forEach((m) => {
      const screenX = m.worldX - cameraX * 0.42;
      if (screenX < -260 || screenX > this.width + 260) return;
      this.drawDistantCoffeeMonument(screenX, 412, m.type, blend, time);
    });
    ctx.restore();

    // Mid-Layer Rolling Roasted Coffee Hills with Embedded Whole Coffee Beans (Reference Image 1!)
    ctx.save();
    const hillColorBack = this.lerpColor('#5a3422', '#683126', blend);
    const hillColorFront = this.lerpColor('#764226', '#873e29', blend);
    const hillRimLight = this.lerpColor('#a86840', '#c46c45', blend);

    // Back hills
    ctx.fillStyle = hillColorBack;
    ctx.strokeStyle = '#2d150a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, this.height);
    for (let x = -20; x <= this.width + 40; x += 32) {
      const worldX = x + cameraX * 0.35;
      const y = 415 + Math.sin(worldX * 0.0032) * 56 + Math.cos(worldX * 0.007) * 22;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width + 40, this.height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Foreground roasted soil hills
    ctx.fillStyle = hillColorFront;
    ctx.beginPath();
    ctx.moveTo(-20, this.height);
    for (let x = -20; x <= this.width + 40; x += 28) {
      const worldX = x + cameraX * 0.55;
      const y = 462 + Math.sin(worldX * 0.0045 + 1.2) * 46 + Math.cos(worldX * 0.009) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width + 40, this.height);
    ctx.closePath();
    ctx.fill();

    // Warm rim highlight along the crest of the foreground hills
    ctx.strokeStyle = hillRimLight;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = -20; x <= this.width + 40; x += 28) {
      const worldX = x + cameraX * 0.55;
      const y = 462 + Math.sin(worldX * 0.0045 + 1.2) * 46 + Math.cos(worldX * 0.009) * 16;
      if (x === -20) ctx.moveTo(x, y + 2);
      else ctx.lineTo(x, y + 2);
    }
    ctx.stroke();

    // Dark outline along foreground hill crest
    ctx.strokeStyle = '#33170a';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    for (let x = -20; x <= this.width + 40; x += 28) {
      const worldX = x + cameraX * 0.55;
      const y = 462 + Math.sin(worldX * 0.0045 + 1.2) * 46 + Math.cos(worldX * 0.009) * 16;
      if (x === -20) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Embedded Roasted Coffee Beans scattered inside the hills (Reference Image 1 texture!)
    const firstBeanIdx = Math.floor((cameraX * 0.55) / 65) - 2;
    const lastBeanIdx = firstBeanIdx + Math.ceil(this.width / 65) + 5;
    for (let bi = firstBeanIdx; bi <= lastBeanIdx; bi++) {
      const worldX = bi * 65 + ((bi * 37) % 25);
      const sx = worldX - cameraX * 0.55;
      const hillTopY = 462 + Math.sin(worldX * 0.0045 + 1.2) * 46 + Math.cos(worldX * 0.009) * 16;
      const by = hillTopY + 18 + ((Math.abs(bi) * 29) % 45);
      const angle = ((bi * 1.3) % 3.14) - 1.5;

      ctx.save();
      ctx.translate(sx, by);
      ctx.rotate(angle);
      ctx.fillStyle = '#542a14';
      ctx.strokeStyle = '#2d1408';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.quadraticCurveTo(0, 3, 8, 0);
      ctx.stroke();
      ctx.restore();
    }

    // Golden Leaf Magical Coffee Plants (Zone 1 Image 1 left side) & Glowing Coffee Cherry Trees (Zone 2 Image 2)
    const floraWorldX = [125, 610, 1380, 1920, 2720, 3450, 4180, 5120, 5890, 6680];
    floraWorldX.forEach((wx, idx) => {
      const sx = wx - cameraX * 0.75;
      if (sx < -220 || sx > this.width + 220) return;
      if (wx < 3250) {
        this.drawGoldenCoffeePlant(sx, 480, time, idx);
      } else {
        this.drawCoffeeCherryTree(sx, 480, time, idx);
      }
    });

    ctx.restore();
  }

  drawDistantCoffeeMonument(x, baseY, type, blend, time) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, baseY);

    // Pastel lavender-grey & slate-blue tones matching Reference Image 1's background espresso machine & grinders
    const bodyFill = this.lerpColor('#8c92b5', '#9e6356', blend);
    const panelFill = this.lerpColor('#6c769c', '#7a463b', blend);
    const highlightFill = this.lerpColor('#b0b7d6', '#c48674', blend);
    const trimColor = this.lerpColor('#3f4868', '#4f2922', blend);

    ctx.fillStyle = bodyFill;
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 2.8;

    if (type === 'espresso_machine') {
      // 3/4 Perspective Café Espresso Machine with cup on drip tray (Exact match to Image 1 left background!)
      ctx.beginPath();
      ctx.roundRect(-56, -162, 112, 162, 14);
      ctx.fill();
      ctx.stroke();

      // Recessed inner brewing alcove
      ctx.fillStyle = panelFill;
      ctx.beginPath();
      ctx.roundRect(-42, -110, 84, 88, 8);
      ctx.fill();
      ctx.stroke();

      // Upper control header with pressure gauge & buttons
      ctx.fillStyle = highlightFill;
      ctx.beginPath();
      ctx.roundRect(-60, -168, 120, 48, 12);
      ctx.fill();
      ctx.stroke();

      // White Cup resting on top warmer
      ctx.fillStyle = '#d8e2ef';
      ctx.beginPath();
      ctx.roundRect(-36, -188, 28, 20, [2, 2, 10, 10]);
      ctx.fill();
      ctx.stroke();

      // Pressure gauge dial
      ctx.fillStyle = '#eef2ff';
      ctx.beginPath();
      ctx.arc(4, -144, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Gauge needle
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(4, -144);
      ctx.lineTo(4 + Math.cos(time * 2) * 8, -144 + Math.sin(time * 2) * 8);
      ctx.stroke();

      // Grouphead & Portafilter Handle extending right
      ctx.fillStyle = trimColor;
      ctx.fillRect(-16, -110, 32, 16);
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(8, -98);
      ctx.lineTo(66, -88);
      ctx.stroke();

      // White Cup sitting on the drip tray underneath portafilter
      ctx.fillStyle = '#d8e2ef';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-18, -56, 36, 32, [3, 3, 14, 14]);
      ctx.fill();
      ctx.stroke();
    } else if (type === 'burr_grinder' || type === 'drip_brewer') {
      // Clear Glass Hopper Burr Grinder filled with whole coffee beans (Exact match to Image 1 right background!)
      ctx.fillStyle = bodyFill;
      ctx.beginPath();
      ctx.roundRect(-40, -115, 80, 115, 8);
      ctx.fill();
      ctx.stroke();

      // Grinder collar
      ctx.fillStyle = panelFill;
      ctx.fillRect(-32, -130, 64, 16);
      ctx.strokeRect(-32, -130, 64, 16);

      // Transparent blue-tinted glass bean hopper on top
      ctx.fillStyle = 'rgba(186, 224, 248, 0.36)';
      ctx.beginPath();
      ctx.moveTo(-48, -205);
      ctx.lineTo(48, -205);
      ctx.lineTo(32, -130);
      ctx.lineTo(-32, -130);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pile of dark-roasted coffee beans inside the glass hopper!
      ctx.fillStyle = '#633c28';
      ctx.beginPath();
      ctx.moveTo(-38, -162);
      ctx.quadraticCurveTo(0, -182, 38, -160);
      ctx.lineTo(30, -130);
      ctx.lineTo(-30, -130);
      ctx.closePath();
      ctx.fill();

      // Individual bean texture dots in hopper
      ctx.fillStyle = '#472818';
      for (let bx = -24; bx <= 24; bx += 12) {
        ctx.beginPath();
        ctx.ellipse(bx, -148 - (Math.abs(bx) % 9), 5, 3.5, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hopper lid
      ctx.fillStyle = highlightFill;
      ctx.beginPath();
      ctx.ellipse(0, -205, 50, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Vintage hand-crank coffee mill (from Image 2 left background)
      ctx.beginPath();
      ctx.roundRect(-48, -105, 96, 105, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = highlightFill;
      ctx.beginPath();
      ctx.arc(0, -105, 44, Math.PI, 0, true);
      ctx.fill();
      ctx.stroke();

      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, -135);
      ctx.lineTo(0, -165);
      ctx.lineTo(54, -160);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawGoldenCoffeePlant(x, y, time, seed) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    const sway = Math.sin(time * 1.7 + seed) * 0.045;
    ctx.rotate(sway);

    // Warm golden ambient backlight aura behind the plant (Reference Image 1 left!)
    const plantGlow = ctx.createRadialGradient(0, -110, 10, 0, -110, 125);
    plantGlow.addColorStop(0, 'rgba(254, 240, 138, 0.42)');
    plantGlow.addColorStop(0.55, 'rgba(245, 158, 11, 0.14)');
    plantGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = plantGlow;
    ctx.beginPath();
    ctx.arc(0, -110, 125, 0, Math.PI * 2);
    ctx.fill();

    // Main curved stem & secondary sprout stem
    ctx.strokeStyle = '#653b16';
    ctx.lineWidth = 6.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.quadraticCurveTo(-18, -95, 6, -210);
    ctx.stroke();

    // Coffee beans growing at the leaf nodes (as seen in Reference Image 1!)
    const nodeBeans = [
      { x: -11, y: -62, rot: -0.4 },
      { x: -8, y: -115, rot: 0.35 }
    ];
    nodeBeans.forEach((nb) => {
      ctx.save();
      ctx.translate(nb.x, nb.y);
      ctx.rotate(nb.rot);
      ctx.fillStyle = '#92400e';
      ctx.strokeStyle = '#3b1505';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Translucent, luminous golden leaves with veined details
    const leaves = [
      { x: -6, y: -55, dir: -1.1, scale: 1.15 },
      { x: -8, y: -85, dir: 0.95, scale: 1.2 },
      { x: -9, y: -130, dir: -0.95, scale: 1.05 },
      { x: -4, y: -162, dir: 0.88, scale: 0.98 },
      { x: 2, y: -195, dir: -0.45, scale: 0.82 },
      { x: 6, y: -205, dir: 0.38, scale: 0.78 }
    ];

    leaves.forEach((lf, i) => {
      ctx.save();
      ctx.translate(lf.x, lf.y);
      ctx.rotate(lf.dir + Math.sin(time * 2.1 + i) * 0.04);
      ctx.scale(lf.scale, lf.scale);

      const grad = ctx.createLinearGradient(0, 0, 0, -58);
      grad.addColorStop(0, '#b45309');
      grad.addColorStop(0.35, '#f59e0b');
      grad.addColorStop(0.75, '#fde047');
      grad.addColorStop(1, '#fef9c3');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#5c2808';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-24, -18, -20, -44, 0, -60);
      ctx.bezierCurveTo(20, -44, 24, -18, 0, 0);
      ctx.fill();
      ctx.stroke();

      // Glowing leaf center rib & side veins
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(0, -52);
      ctx.moveTo(0, -18);
      ctx.lineTo(-9, -28);
      ctx.moveTo(0, -28);
      ctx.lineTo(9, -38);
      ctx.stroke();
      ctx.restore();
    });

    // Floating 4-point golden sparkles around the plant
    for (let s = 0; s < 4; s++) {
      const spX = -45 + s * 32 + Math.sin(time * 2 + s) * 6;
      const spY = -65 - s * 38 + Math.cos(time * 2.5 + s) * 5;
      this.drawFourPointSparkle(spX, spY, 6 + (s % 2) * 3, '#fef08a');
    }

    ctx.restore();
  }

  drawCoffeeCherryTree(x, y, time, seed) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Gnarled trunk
    ctx.strokeStyle = '#4a2511';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.quadraticCurveTo(15, -75, -10, -170);
    ctx.stroke();

    // Lush green foliage clusters with glowing red coffee cherries (Image 2 left/right)
    const clusters = [
      { cx: -32, cy: -155, r: 38 },
      { cx: 24, cy: -145, r: 34 },
      { cx: -5, cy: -185, r: 42 }
    ];

    clusters.forEach((c) => {
      ctx.fillStyle = '#3f6212';
      ctx.strokeStyle = '#1a2e05';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Glowing red-orange coffee cherries hanging from branches
    const cherries = [
      { cx: -46, cy: -128 },
      { cx: -35, cy: -122 },
      { cx: 32, cy: -118 },
      { cx: 20, cy: -114 },
      { cx: -8, cy: -142 }
    ];
    cherries.forEach((ch, idx) => {
      const pulse = 0.85 + 0.15 * Math.sin(time * 4 + idx + seed);
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(ch.cx, ch.cy, 7.5 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(ch.cx - 2, ch.cy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  drawPlatform(p, cameraX, time) {
    const sx = p.x - cameraX;
    if (sx + p.w < -100 || sx > this.width + 100) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.translate(sx, p.y);

    if (p.type === 'biscuit') {
      // Ornate Scalloped Butter-Biscuit Sandwich Platform resting on Giant Roasted Beans (Reference Image 1!)
      // 1. Underlying Roasted Coffee Bean Foundation
      for (let bx = 26; bx < p.w - 18; bx += 48) {
        ctx.save();
        ctx.translate(bx, p.h + 14);
        ctx.rotate((bx % 2 === 0 ? 1 : -1) * 0.18);
        const bGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, 26);
        bGrad.addColorStop(0, '#7c3f1d');
        bGrad.addColorStop(1, '#381908');
        ctx.fillStyle = bGrad;
        ctx.strokeStyle = '#1f0c03';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.quadraticCurveTo(0, 5, 16, 0);
        ctx.stroke();
        ctx.restore();
      }

      // 2. Bottom Biscuit Layer
      ctx.fillStyle = '#c26d1f';
      ctx.strokeStyle = '#3b1704';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.roundRect(2, p.h * 0.62, p.w - 4, p.h * 0.38, 9);
      ctx.fill();
      ctx.stroke();

      // 3. Vanilla Cream Filling Wave
      ctx.fillStyle = '#fff9db';
      ctx.strokeStyle = '#5c2808';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(5, p.h * 0.44, p.w - 10, p.h * 0.26, 6);
      ctx.fill();
      ctx.stroke();

      // 4. Top Golden Scalloped Biscuit Layer
      const biscuitGrad = ctx.createLinearGradient(0, 0, 0, p.h * 0.56);
      biscuitGrad.addColorStop(0, '#fde08d');
      biscuitGrad.addColorStop(0.35, '#f59e0b');
      biscuitGrad.addColorStop(1, '#b45309');

      ctx.fillStyle = biscuitGrad;
      ctx.strokeStyle = '#3b1704';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(0, 0, p.w, p.h * 0.54, 11);
      ctx.fill();
      ctx.stroke();

      // Scalloped bottom edge bumps & decorative baker's pinholes along top wafer
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(8, 4, p.w - 16, p.h * 0.34, 6);
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      for (let dx = 20; dx < p.w - 16; dx += 20) {
        ctx.beginPath();
        ctx.arc(dx, p.h * 0.21, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p.type === 'mossy_bean') {
      // Iconic Stacked Giant Coffee Bean Boulders with Velvety Green Moss Patches (Reference Image 1 left centerpiece!)
      // 1. Two Supporting Lower Giant Coffee Beans underneath the main boulder
      const drawLowerBean = (bx, by, rx, ry, rot) => {
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(rot);
        const g = ctx.createRadialGradient(-rx * 0.25, -ry * 0.25, 6, 0, 0, rx);
        g.addColorStop(0, '#8a4824');
        g.addColorStop(0.65, '#542811');
        g.addColorStop(1, '#2a1206');
        ctx.fillStyle = g;
        ctx.strokeStyle = '#1b0a03';
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Deep roasted crease
        ctx.strokeStyle = '#160702';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(-rx * 0.78, -4);
        ctx.bezierCurveTo(-rx * 0.2, ry * 0.28, rx * 0.2, -ry * 0.28, rx * 0.78, 4);
        ctx.stroke();
        ctx.restore();
      };

      drawLowerBean(p.w * 0.34, p.h * 0.92, p.w * 0.31, p.h * 0.34, 0.32);
      drawLowerBean(p.w * 0.68, p.h * 0.88, p.w * 0.29, p.h * 0.32, -0.28);

      // 2. Main Top Giant Coffee Bean Boulder
      const beanGrad = ctx.createRadialGradient(p.w * 0.38, p.h * 0.28, 12, p.w * 0.5, p.h * 0.45, p.w * 0.58);
      beanGrad.addColorStop(0, '#9a5229');
      beanGrad.addColorStop(0.55, '#5c2d14');
      beanGrad.addColorStop(1, '#2d1407');

      ctx.fillStyle = beanGrad;
      ctx.strokeStyle = '#1b0a03';
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.ellipse(p.w / 2, p.h * 0.42, p.w * 0.52, p.h * 0.44, -0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Deep central roasted bean cleft
      ctx.strokeStyle = '#1b0a03';
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(10, p.h * 0.38);
      ctx.bezierCurveTo(p.w * 0.35, p.h * 0.22, p.w * 0.65, p.h * 0.54, p.w - 10, p.h * 0.32);
      ctx.stroke();

      // 3. Organic, multi-toned velvety green moss patches draped over the boulder (Reference Image 1!)
      const mossGrad = ctx.createLinearGradient(0, 0, 0, p.h * 0.6);
      mossGrad.addColorStop(0, '#84cc16');
      mossGrad.addColorStop(0.6, '#65a30d');
      mossGrad.addColorStop(1, '#3f6212');

      ctx.fillStyle = mossGrad;
      ctx.strokeStyle = '#283e0b';
      ctx.lineWidth = 2.4;

      // Top-left & rim moss blanket
      ctx.beginPath();
      ctx.moveTo(18, p.h * 0.28);
      ctx.quadraticCurveTo(p.w * 0.48, -10, p.w - 18, p.h * 0.24);
      ctx.bezierCurveTo(p.w * 0.96, p.h * 0.48, p.w * 0.78, p.h * 0.62, p.w * 0.66, p.h * 0.48);
      ctx.quadraticCurveTo(p.w * 0.52, p.h * 0.3, p.w * 0.38, p.h * 0.26);
      ctx.quadraticCurveTo(p.w * 0.22, p.h * 0.24, 18, p.h * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Left lower moss patch
      ctx.beginPath();
      ctx.moveTo(16, p.h * 0.46);
      ctx.quadraticCurveTo(p.w * 0.22, p.h * 0.38, p.w * 0.34, p.h * 0.52);
      ctx.quadraticCurveTo(p.w * 0.2, p.h * 0.64, 16, p.h * 0.46);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (p.type === 'sugar_cube') {
      // Crystalline 3-Faceted Sparkling Sugar Cube (Exact match to Reference Image 1 arch!)
      const bob = Math.sin(time * 3.2 + p.x * 0.025) * 4;
      const tilt = ((p.x % 200) - 100) * 0.0012;
      ctx.translate(p.w / 2, p.h / 2 + bob);
      ctx.rotate(tilt);
      ctx.translate(-p.w / 2, -p.h / 2);

      // Soft icy-blue outer glow
      ctx.shadowColor = 'rgba(186, 230, 253, 0.85)';
      ctx.shadowBlur = 16;

      const w = p.w;
      const h = p.h;

      // Top isometric diamond/rhombus face (brightest white)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(w - 2, 0);
      ctx.lineTo(w - 8, 12);
      ctx.lineTo(2, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Front main crystal face (cool ice-white gradient)
      const frontGrad = ctx.createLinearGradient(0, 12, w, h);
      frontGrad.addColorStop(0, '#f8fafc');
      frontGrad.addColorStop(1, '#dbeafe');
      ctx.fillStyle = frontGrad;
      ctx.beginPath();
      ctx.moveTo(2, 12);
      ctx.lineTo(w - 8, 12);
      ctx.lineTo(w - 8, h);
      ctx.lineTo(2, h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right side shaded face (deeper periwinkle-ice)
      ctx.fillStyle = '#bfdbfe';
      ctx.beginPath();
      ctx.moveTo(w - 8, 12);
      ctx.lineTo(w - 2, 0);
      ctx.lineTo(w - 2, h - 10);
      ctx.lineTo(w - 8, h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Granular sugar crystal glints inside front face
      ctx.shadowBlur = 0;
      for (let i = 0; i < 14; i++) {
        const cx = 7 + ((i * 19) % (w - 20));
        const cy = 16 + ((i * 13) % (h - 22));
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#93c5fd';
        ctx.fillRect(cx, cy, 2.5, 2.5);
      }
    } else if (p.type === 'biscotti') {
      // Crunchy Almond Biscotti Slice floating over crema (Image 2 left & center)
      const grad = ctx.createLinearGradient(0, 0, 0, p.h);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.35, '#fde68a');
      grad.addColorStop(1, '#b45309');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, p.h * 0.75);
      ctx.quadraticCurveTo(p.w * 0.15, -6, p.w * 0.5, 2);
      ctx.quadraticCurveTo(p.w * 0.85, -4, p.w - 6, p.h * 0.75);
      ctx.lineTo(p.w - 14, p.h);
      ctx.lineTo(14, p.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      for (let ax = 28; ax < p.w - 28; ax += 38) {
        ctx.beginPath();
        ctx.ellipse(ax, p.h * 0.56, 7, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p.type === 'choco_cookie') {
      // Half-Chocolate-Dipped Sandwich Cookie (Image 2 center-right!)
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#3b1505';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.roundRect(4, p.h * 0.52, p.w - 8, p.h * 0.42, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#3f1d0b';
      ctx.fillRect(10, p.h * 0.42, p.w - 20, p.h * 0.16);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(0, 0, p.w, p.h * 0.48, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#3b180c';
      ctx.beginPath();
      ctx.roundRect(0, -1, p.w * 0.46, p.h * 0.92, [18, 6, 14, 16]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.ellipse(p.w * 0.2, p.h * 0.2, 24, 6, -0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78350f';
      for (let cx = p.w * 0.55; cx < p.w - 20; cx += 26) {
        ctx.beginPath();
        ctx.arc(cx, p.h * 0.24, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p.type === 'gingerbread') {
      // Gingerbread Cliff with White Royal Icing Trim (Image 2 right side)
      ctx.fillStyle = '#9a4a1a';
      ctx.strokeStyle = '#3b1505';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(0, 0, p.w, p.h, 16);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#fff1f2';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let ix = 14; ix < p.w - 14; ix += 28) {
        ctx.moveTo(ix, 10);
        ctx.quadraticCurveTo(ix + 14, 22, ix + 28, 10);
      }
      ctx.stroke();

      if (p.isCheckpoint) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(p.w - 55, -62, 6, 62);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(p.w - 49, -62);
        ctx.lineTo(p.w - 12, -46);
        ctx.lineTo(p.w - 49, -30);
        ctx.closePath();
        ctx.fill();
      }

      if (p.isFinish) {
        if (this.currentLevel === 2) {
          this.drawObservatoryFinish(p.w * 0.55, 0, time);
        } else {
          this.drawFinishSanctuary(p.w * 0.55, 0, time);
        }
      }
    } else if (p.type === 'obsidian_rock') {
      // Obsidian Basalt Shelf with glowing magma/mocha veins
      const grad = ctx.createLinearGradient(0, 0, 0, p.h);
      grad.addColorStop(0, '#2d1b2e');
      grad.addColorStop(0.4, '#1b1322');
      grad.addColorStop(1, '#0f0a14');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#09050d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(0, 0, p.w, p.h, 14);
      ctx.fill();
      ctx.stroke();

      // Glowing amethyst/mocha vein along top rim
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(8, 5);
      ctx.lineTo(p.w - 8, 5);
      ctx.stroke();

      // Craggy crystalline facets
      ctx.strokeStyle = '#581c87';
      ctx.lineWidth = 1.4;
      for (let vx = 24; vx < p.w - 20; vx += 36) {
        ctx.beginPath();
        ctx.moveTo(vx, 10);
        ctx.lineTo(vx + 14, p.h * 0.65);
        ctx.stroke();
      }

      if (p.isCheckpoint) {
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(p.w - 55, -62, 6, 62);
        ctx.fillStyle = '#e879f9';
        ctx.beginPath();
        ctx.moveTo(p.w - 49, -62);
        ctx.lineTo(p.w - 12, -46);
        ctx.lineTo(p.w - 49, -30);
        ctx.closePath();
        ctx.fill();
      }

      if (p.isFinish) {
        this.drawObservatoryFinish(p.w * 0.55, 0, time);
      }
    } else if (p.type === 'amethyst_crystal') {
      // Faceted Glowing Amethyst Sugar Crystal Cluster Platform
      const grad = ctx.createLinearGradient(0, 0, 0, p.h);
      grad.addColorStop(0, '#c084fc');
      grad.addColorStop(0.35, '#9333ea');
      grad.addColorStop(1, '#581c87');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#3b0764';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.roundRect(0, 0, p.w, p.h, [14, 14, 8, 8]);
      ctx.fill();
      ctx.stroke();

      // Faceted prismatic crystal spikes protruding along the sides
      ctx.fillStyle = '#e879f9';
      for (let cx = 12; cx < p.w - 16; cx += 28) {
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx + 12, -8);
        ctx.lineTo(cx + 24, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Bright specular crystalline glints
      for (let i = 0; i < 8; i++) {
        const gx = 10 + ((i * 27) % (p.w - 20));
        const gy = 12 + ((i * 15) % (p.h - 18));
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#f5d0fe';
        ctx.fillRect(gx, gy, 2.5, 2.5);
      }
    } else if (p.type === 'wafer_ledge') {
      // Crispy Chocolate & Vanilla Layered Wafer Platform
      ctx.fillStyle = '#3f1d0b';
      ctx.strokeStyle = '#1b0a03';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.roundRect(2, p.h * 0.65, p.w - 4, p.h * 0.35, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(4, p.h * 0.45, p.w - 8, p.h * 0.22);

      const wGrad = ctx.createLinearGradient(0, 0, 0, p.h * 0.5);
      wGrad.addColorStop(0, '#fde68a');
      wGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = wGrad;
      ctx.beginPath();
      ctx.roundRect(0, 0, p.w, p.h * 0.48, 8);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.3;
      for (let wx = 12; wx < p.w - 10; wx += 16) {
        ctx.beginPath();
        ctx.moveTo(wx, 2);
        ctx.lineTo(wx, p.h * 0.44);
        ctx.stroke();
      }
    } else if (p.type === 'marshmallow_pad') {
      // NEW ELEMENT: Bouncy Toasted Marshmallow Trampoline Pad
      const squash = p.squashTimer ? Math.sin(p.squashTimer * 12) * 8 : 0;
      const padY = squash;
      const padH = p.h - squash;

      const mGrad = ctx.createLinearGradient(0, padY, 0, padY + padH);
      mGrad.addColorStop(0, '#fff1f2');
      mGrad.addColorStop(0.35, '#fce7f3');
      mGrad.addColorStop(0.8, '#fbcfe8');
      mGrad.addColorStop(1, '#b45309');

      ctx.fillStyle = mGrad;
      ctx.strokeStyle = '#831843';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(0, padY, p.w, padH, 20);
      ctx.fill();
      ctx.stroke();

      // Toasted crust spots
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(p.w * 0.25, padY + 6, 14, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(p.w * 0.72, padY + 7, 16, 5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Trampoline spring arrow icon
      ctx.fillStyle = '#be185d';
      ctx.beginPath();
      const cx = p.w * 0.5;
      const cy = padY + padH * 0.55;
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx + 8, cy);
      ctx.lineTo(cx + 3, cy);
      ctx.lineTo(cx + 3, cy + 8);
      ctx.lineTo(cx - 3, cy + 8);
      ctx.lineTo(cx - 3, cy);
      ctx.lineTo(cx - 8, cy);
      ctx.closePath();
      ctx.fill();
    } else if (p.type === 'steam_vent') {
      // NEW ELEMENT: High-Pressure Espresso Steam Geyser Vent
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.roundRect(0, 0, p.w, p.h, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      for (let vx = 10; vx < p.w - 10; vx += 12) {
        ctx.fillRect(vx, 3, 6, p.h - 6);
      }

      // Billowing upward steam column
      ctx.save();
      const steamAlpha = 0.45 + Math.sin(time * 6) * 0.15;
      const steamGrad = ctx.createLinearGradient(0, p.h, 0, -180);
      steamGrad.addColorStop(0, `rgba(255, 255, 255, ${steamAlpha * 0.8})`);
      steamGrad.addColorStop(0.5, `rgba(254, 240, 138, ${steamAlpha * 0.4})`);
      steamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = steamGrad;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(p.w - 4, 0);
      ctx.lineTo(p.w + 16, -180);
      ctx.lineTo(-16, -180);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'cappuccino_cloud') {
      // Cinnamon-Dusted Whipped Cream Foam Cloud Platform
      const bob = Math.sin(time * 2.6 + p.x * 0.02) * 3.5;
      ctx.translate(0, bob);

      // Cloud base shadow
      ctx.fillStyle = 'rgba(180, 83, 9, 0.16)';
      ctx.beginPath();
      ctx.ellipse(p.w * 0.5, p.h * 0.72, p.w * 0.48, p.h * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bubbly overlapping cream puffs
      const cGrad = ctx.createLinearGradient(0, 0, 0, p.h);
      cGrad.addColorStop(0, '#ffffff');
      cGrad.addColorStop(0.35, '#fffbeb');
      cGrad.addColorStop(0.75, '#fef3c7');
      cGrad.addColorStop(1, '#fde68a');

      ctx.fillStyle = cGrad;
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2.6;

      ctx.beginPath();
      const puffCount = Math.max(4, Math.round(p.w / 46));
      const step = p.w / puffCount;
      ctx.moveTo(10, p.h * 0.5);
      for (let i = 0; i < puffCount; i++) {
        const px = i * step + step * 0.5;
        const py = i === 0 || i === puffCount - 1 ? 14 : 6;
        const r = step * 0.58;
        ctx.arc(px, py, r, Math.PI * 0.88, Math.PI * 0.12, false);
      }
      ctx.lineTo(p.w - 8, p.h * 0.68);
      ctx.quadraticCurveTo(p.w * 0.5, p.h + 8, 8, p.h * 0.68);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cinnamon powder dusting on top
      ctx.fillStyle = '#b45309';
      for (let s = 14; s < p.w - 14; s += 8) {
        const sy = 4 + Math.sin(s * 1.7) * 4;
        ctx.fillRect(s, sy, 2, 2);
      }
    } else if (p.type === 'airship_deck') {
      // Victorian Steampunk Brass Airship Platform with Rivets & Propeller
      const bob = Math.sin(time * 1.8 + p.x * 0.015) * 2;
      ctx.translate(0, bob);

      // Brass deck plate
      const deckGrad = ctx.createLinearGradient(0, 0, 0, p.h);
      deckGrad.addColorStop(0, '#fef08a');
      deckGrad.addColorStop(0.2, '#f59e0b');
      deckGrad.addColorStop(0.7, '#b45309');
      deckGrad.addColorStop(1, '#451a03');

      ctx.fillStyle = deckGrad;
      ctx.strokeStyle = '#291105';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.roundRect(0, 0, p.w, p.h, [8, 8, 4, 4]);
      ctx.fill();
      ctx.stroke();

      // Polished copper rivets along the edges
      ctx.fillStyle = '#451a03';
      for (let rx = 10; rx < p.w - 10; rx += 22) {
        ctx.beginPath();
        ctx.arc(rx, 8, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spinning brass propeller on the left or bottom
      const propAngle = time * 24;
      ctx.save();
      ctx.translate(14, p.h + 8);
      ctx.rotate(propAngle);
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      if (p.isCheckpoint) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(p.w - 55, -62, 6, 62);
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath();
        ctx.moveTo(p.w - 49, -62);
        ctx.lineTo(p.w - 12, -46);
        ctx.lineTo(p.w - 49, -30);
        ctx.closePath();
        ctx.fill();
      }

      if (p.isFinish) {
        this.drawOrbitalRoasteryFinish(p.w * 0.55, 0, time);
      }
    } else if (p.type === 'stellar_quartz') {
      // Cosmic Starry Quartz Asteroid
      const qGrad = ctx.createLinearGradient(0, 0, 0, p.h);
      qGrad.addColorStop(0, '#bae6fd');
      qGrad.addColorStop(0.35, '#38bdf8');
      qGrad.addColorStop(0.8, '#0369a1');
      qGrad.addColorStop(1, '#082f49');

      ctx.fillStyle = qGrad;
      ctx.strokeStyle = '#0c4a6e';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.roundRect(0, 0, p.w, p.h, [12, 12, 6, 6]);
      ctx.fill();
      ctx.stroke();

      // Faceted crystalline spikes
      ctx.fillStyle = '#e0f2fe';
      for (let cx = 14; cx < p.w - 14; cx += 26) {
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx + 10, -7);
        ctx.lineTo(cx + 20, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (p.type === 'cosmic_rock') {
      // Roasted Meteorite Bean Asteroid with Golden Caramel Veins
      const rGrad = ctx.createLinearGradient(0, 0, 0, p.h);
      rGrad.addColorStop(0, '#2e1065');
      rGrad.addColorStop(0.35, '#1e1b4b');
      rGrad.addColorStop(1, '#09090b');

      ctx.fillStyle = rGrad;
      ctx.strokeStyle = '#4c1d95';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.roundRect(0, 0, p.w, p.h, 12);
      ctx.fill();
      ctx.stroke();

      // Glowing molten golden caramel fissures
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(18, p.h * 0.4);
      ctx.lineTo(p.w * 0.35, p.h * 0.55);
      ctx.lineTo(p.w * 0.65, p.h * 0.35);
      ctx.lineTo(p.w - 24, p.h * 0.6);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawObservatoryFinish(x, y, time) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Celestial Espresso Observatory Finish (Level 2)
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-80, -180, 160, 180, 18);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(0, -110);
    ctx.rotate(time * 1.5);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 14, 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -110, 12 + Math.sin(time * 5) * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CELESTIAL OBSERVATORY', 0, -192);
    ctx.restore();
  }

  drawOrbitalRoasteryFinish(x, y, time) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Rotating Great Celestial Astrolabe Rings
    const ringAngle = time * 0.7;
    ctx.save();
    ctx.translate(0, -95);
    ctx.rotate(ringAngle);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-3, -71, 6, 6);
    }
    ctx.restore();

    // Orbital Spaceport Dome
    const domeGrad = ctx.createRadialGradient(0, -95, 10, 0, -95, 52);
    domeGrad.addColorStop(0, '#fef08a');
    domeGrad.addColorStop(0.4, '#d97706');
    domeGrad.addColorStop(0.85, '#78350f');
    domeGrad.addColorStop(1, '#291105');

    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, -95, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Blue-Gold Plasma Coffee Cup Crest
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☕', 0, -95);

    // Beaming Cosmic Espresso Beacon
    const beamGrad = ctx.createLinearGradient(0, -145, 0, -320);
    beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
    beamGrad.addColorStop(0.6, 'rgba(250, 204, 21, 0.45)');
    beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(-16, -143);
    ctx.lineTo(-45, -310);
    ctx.lineTo(45, -310);
    ctx.lineTo(16, -143);
    ctx.closePath();
    ctx.fill();

    // Docking Portal Arch & Base Structure
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.roundRect(-54, -48, 108, 48, [12, 12, 0, 0]);
    ctx.fill();
    ctx.stroke();

    // Portal Light Core
    const portalGrad = ctx.createLinearGradient(0, -42, 0, 0);
    portalGrad.addColorStop(0, '#facc15');
    portalGrad.addColorStop(0.6, '#38bdf8');
    portalGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = portalGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 32, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GALACTIC ORBITAL ROASTERY', 0, -165);

    ctx.restore();
  }

  drawFinishSanctuary(x, y, time) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Grand Golden Espresso Archway & Trophy Cup
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-75, -175, 150, 175, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, -115, 36 + Math.sin(time * 4) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#451a03';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GRAND ROASTERY', 0, -188);
    ctx.restore();
  }

  drawBean(bean, cameraX, time) {
    if (bean.collected) return;
    const sx = bean.x - cameraX;
    if (sx < -40 || sx > this.width + 40) return;

    const ctx = this.ctx;
    const bob = Math.sin(time * 4.2 + bean.bobOffset) * 5;
    const tilt = Math.sin(time * 2.5 + bean.bobOffset) * 0.25;

    ctx.save();
    ctx.translate(sx, bean.y + bob);
    ctx.rotate(tilt);

    // Golden aura glow (like both concept images!)
    const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
    aura.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
    aura.addColorStop(0.55, 'rgba(245, 158, 11, 0.35)');
    aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();

    // Roasted Golden Coffee Bean body
    const beanGrad = ctx.createLinearGradient(-10, -12, 10, 12);
    beanGrad.addColorStop(0, '#fbbf24');
    beanGrad.addColorStop(0.5, '#b45309');
    beanGrad.addColorStop(1, '#78350f');

    ctx.fillStyle = beanGrad;
    ctx.strokeStyle = '#3b1505';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 14.5, 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // S-curve bean crease
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-2, -11);
    ctx.bezierCurveTo(-5, -3, 5, 3, 2, 11);
    ctx.stroke();

    // Specular shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.ellipse(-4, -5, 2.5, 5, 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawSugarGem(gem, cameraX, time) {
    if (gem.collected) return;
    const sx = gem.x - cameraX;
    if (sx < -40 || sx > this.width + 40) return;

    const ctx = this.ctx;
    const bob = Math.sin(time * 4.5 + gem.bobOffset) * 6;
    const spin = time * 2.2 + gem.bobOffset;

    ctx.save();
    ctx.translate(sx, gem.y + bob);

    // Amethyst crystalline aura
    const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
    aura.addColorStop(0, 'rgba(232, 121, 249, 0.85)');
    aura.addColorStop(0.5, 'rgba(168, 85, 247, 0.35)');
    aura.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();

    // Diamond faceted Sugar Gem
    ctx.save();
    ctx.rotate(Math.sin(spin) * 0.15);
    ctx.fillStyle = '#c084fc';
    ctx.strokeStyle = '#581c87';
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';

    // Top pyramid facets
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(10, -3);
    ctx.lineTo(0, 14);
    ctx.lineTo(-10, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Highlight facet
    ctx.fillStyle = '#f5d0fe';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(-10, -3);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Front facet
    ctx.fillStyle = '#e879f9';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(10, -3);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2, -5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    this.drawFourPointSparkle(Math.sin(time * 3 + gem.bobOffset) * 10, -10, 4.5, '#ffffff');
    ctx.restore();
  }

  drawCacaoPod(pod, cameraX, time) {
    if (pod.collected) return;
    const sx = pod.x - cameraX;
    if (sx < -40 || sx > this.width + 40) return;

    const ctx = this.ctx;
    const bob = Math.sin(time * 3.8 + pod.bobOffset) * 6;
    const tilt = Math.sin(time * 2.1 + pod.bobOffset) * 0.22;

    ctx.save();
    ctx.translate(sx, pod.y + bob);
    ctx.rotate(tilt);

    // Warm golden-chocolate aura
    const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, 28);
    aura.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
    aura.addColorStop(0.55, 'rgba(180, 83, 9, 0.35)');
    aura.addColorStop(1, 'rgba(180, 83, 9, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();

    // Roasted Cacao Pod Silhouette
    const grad = ctx.createLinearGradient(-10, -14, 10, 14);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.35, '#b45309');
    grad.addColorStop(1, '#451a03');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#291105';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fluted longitudinal ridges of the cacao pod
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.quadraticCurveTo(-7, 0, 0, 16);
    ctx.moveTo(0, -16);
    ctx.quadraticCurveTo(7, 0, 0, 16);
    ctx.stroke();

    // Stem at top
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, -19, 4, 4);

    ctx.restore();
  }

  drawStarBean(star, cameraX, time) {
    if (star.collected) return;
    const sx = star.x - cameraX;
    if (sx < -40 || sx > this.width + 40) return;
    const ctx = this.ctx;
    const bob = Math.sin(time * 4.2 + (star.x * 0.02)) * 5;

    ctx.save();
    ctx.translate(sx, star.y + bob);

    // Glowing starlight aura
    const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
    aura.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
    aura.addColorStop(0.5, 'rgba(250, 204, 21, 0.4)');
    aura.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();

    // 8-Pointed Starburst
    ctx.save();
    ctx.rotate(time * 1.6);
    this.drawFourPointSparkle(0, 0, 11, '#38bdf8');
    ctx.rotate(Math.PI / 4);
    this.drawFourPointSparkle(0, 0, 8, '#fef08a');
    ctx.restore();

    // Glowing Golden Coffee Bean Core
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.quadraticCurveTo(0, 2.5, 5, 0);
    ctx.stroke();

    ctx.restore();
  }

  drawCelestialOrb(orb, cameraX, time) {
    if (orb.collected) return;
    const sx = orb.x - cameraX;
    if (sx < -50 || sx > this.width + 50) return;
    const ctx = this.ctx;
    const bob = Math.sin(time * 3.4 + (orb.x * 0.015)) * 6;

    ctx.save();
    ctx.translate(sx, orb.y + bob);

    // Deep space aura
    const aura = ctx.createRadialGradient(0, 0, 3, 0, 0, 32);
    aura.addColorStop(0, 'rgba(192, 132, 252, 0.9)');
    aura.addColorStop(0.55, 'rgba(56, 189, 248, 0.45)');
    aura.addColorStop(1, 'rgba(192, 132, 252, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fill();

    // Tilted planetary ring
    ctx.save();
    ctx.rotate(-0.35);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Glass Orb Sphere with Swirling Galaxy Core
    const orbGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 13);
    orbGrad.addColorStop(0, '#f5d0fe');
    orbGrad.addColorStop(0.35, '#c084fc');
    orbGrad.addColorStop(0.7, '#7e22ce');
    orbGrad.addColorStop(1, '#3b0764');

    ctx.fillStyle = orbGrad;
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Specular glass shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(-4, -4, 3, 2, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawCinnamonRing(ring, cameraX, time) {
    const sx = ring.x - cameraX;
    if (sx < -90 || sx > this.width + 90) return;
    const ctx = this.ctx;
    const pulse = ring.pulseTimer ? Math.sin(ring.pulseTimer * 10) * 8 : 0;
    const r = ring.r + pulse;

    ctx.save();
    ctx.translate(sx, ring.y);

    // Radiant outer speed aura
    const aura = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.5);
    aura.addColorStop(0, 'rgba(250, 204, 21, 0.7)');
    aura.addColorStop(0.5, 'rgba(249, 115, 22, 0.35)');
    aura.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Golden Cinnamon Ring Torus
    ctx.strokeStyle = ring.triggered ? '#38bdf8' : '#f59e0b';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = ring.triggered ? '#e0f2fe' : '#fef08a';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Cinnamon sparkles & rotating notches
    ctx.save();
    ctx.rotate(time * 2.2);
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, -r - 2, 4, 4);
    }
    ctx.restore();

    // Floating speed arrow indicator in the center
    ctx.fillStyle = ring.triggered ? '#38bdf8' : '#fde047';
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-6, -8);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawProductPedestal(node, product, cameraX, time) {
    if (node.collected) return;
    const sx = node.x - cameraX;
    if (sx < -90 || sx > this.width + 90) return;

    const ctx = this.ctx;
    const hover = Math.sin(time * 3.2) * 7;

    ctx.save();
    ctx.translate(sx, node.y + hover);

    // Radiant discovery beams
    ctx.save();
    ctx.rotate(time * 0.9);
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = 'rgba(253, 224, 71, 0.16)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-10, -48);
      ctx.lineTo(10, -48);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Outer Halo
    ctx.strokeStyle = product.accentColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 32 + Math.sin(time * 5) * 3, 0, Math.PI * 2);
    ctx.stroke();

    // Artisan Coffee Bag / Relic Icon
    ctx.fillStyle = product.color;
    ctx.strokeStyle = '#271206';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-20, -24, 40, 48, 8);
    ctx.fill();
    ctx.stroke();

    // Bag top fold & gold seal
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-14, -12, 28, 18);
    ctx.fillStyle = '#451a03';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NEW', 0, 0);

    // Floating label pill above
    ctx.fillStyle = 'rgba(24, 13, 8, 0.85)';
    ctx.beginPath();
    ctx.roundRect(-62, -52, 124, 20, 10);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('★ DISCOVER PRODUCT ★', 0, -39);

    ctx.restore();
  }

  drawEnemy(enemy, cameraX, time) {
    if (enemy.dead) return;
    const sx = enemy.x - cameraX;
    if (sx < -100 || sx > this.width + 100) return;

    const ctx = this.ctx;
    const facing = enemy.vx >= 0 ? 1 : -1;
    const seed = parseInt(enemy.id?.replace(/\D/g, '') || '1', 10);
    const phase = enemy.animPhase !== undefined ? enemy.animPhase : time * 13 + seed * 1.7;
    const walkCycle = Math.sin(phase);

    ctx.save();
    ctx.translate(sx, enemy.y);

    // Warm ground contact shadow underneath grounded enemies only (No shadow for Steam Cloud Spirit ghosts!)
    // Stays anchored to the ground surface and scales down dynamically when the enemy hops into the air!
    if (enemy.type !== 'steam_spirit') {
      const groundDeltaY = enemy.groundY !== undefined ? Math.max(0, enemy.groundY - enemy.y) : 0;
      const shadowScale = Math.max(0.45, 1 - groundDeltaY / 110);
      ctx.fillStyle = `rgba(42, 18, 6, ${(0.26 * shadowScale).toFixed(2)})`;
      ctx.beginPath();
      ctx.ellipse(0, groundDeltaY + 28, 22 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Brief hit flash when damaged
    if (enemy.hitFlashTimer > 0 && Math.floor(time * 30) % 2 === 0) {
      ctx.filter = 'brightness(1.55)';
    }

    ctx.scale(facing, 1);

    // Apply harmonic spring-damper squash-and-stretch + dynamic velocity/charge tilt anchored at the feet!
    const esx = enemy.scaleX || 1;
    const esy = enemy.scaleY || 1;
    const etilt = enemy.tiltAngle || 0;
    const pivotY = enemy.type === 'steam_spirit' ? 0 : 26;
    ctx.translate(0, pivotY);
    ctx.rotate(etilt);
    ctx.scale(esx, esy);
    ctx.translate(0, -pivotY);

    if (enemy.type === 'bean_grunt') {
      // =========================================================================
      // 1. COFFEE BEAN GRUNT (Exact match to Top Row of Enemy Character Sheet!)
      // Vertical roasted coffee bean with top notch, S-cleft, angry white eyes,
      // furrowed V-brow, rosy cheeks, frown, clenched fists, and maroon boots
      // + Dynamic Aggro Charge Steam & Faster Stride!
      // =========================================================================
      const outlineCol = '#3B1A0B';

      // Back Arm (curved outward with clenched fist)
      ctx.save();
      ctx.translate(-15, 2);
      ctx.rotate(-walkCycle * (enemy.aggro ? 0.48 : 0.28));
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 4.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-9, 3, -8, 12);
      ctx.stroke();
      ctx.fillStyle = '#6E371B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-8, 13, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Legs & Maroon Cuffed Boots (#8C2D2B)
      const drawGruntBoot = (lx, ly, rot) => {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(rot);
        ctx.strokeStyle = outlineCol;
        ctx.lineWidth = 4.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 1);
        ctx.stroke();

        // Maroon boot with top cuff & rounded toe
        ctx.fillStyle = '#8C2D2B';
        ctx.strokeStyle = outlineCol;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(-4.5, -2, 9, 3, 1.2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-4, 1);
        ctx.lineTo(4, 1);
        ctx.quadraticCurveTo(9.5, 1.5, 9, 6.5);
        ctx.lineTo(-4.5, 6.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };

      const strideAmp = enemy.aggro ? 8.5 : 6;
      const liftAmp = enemy.aggro ? 4.8 : 3;
      drawGruntBoot(-7 + walkCycle * strideAmp, 21 - Math.max(0, -walkCycle) * liftAmp, -walkCycle * 0.38);
      drawGruntBoot(7 - walkCycle * strideAmp, 22 - Math.max(0, walkCycle) * liftAmp, walkCycle * 0.38);

      // Vertical Roasted Bean Body with top cleft notch
      const beanGrad = ctx.createRadialGradient(-4, -8, 4, 0, 0, 26);
      beanGrad.addColorStop(0, enemy.aggro ? '#B35D32' : '#9E5834');
      beanGrad.addColorStop(0.55, '#783D1E');
      beanGrad.addColorStop(1, '#522611');

      ctx.fillStyle = beanGrad;
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.bezierCurveTo(15, -25, 22, -10, 20, 6);
      ctx.bezierCurveTo(18, 19, 8, 21, 0, 20);
      ctx.bezierCurveTo(-12, 21, -21, 16, -21, 2);
      ctx.bezierCurveTo(-21, -13, -13, -25, 0, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Upper-left specular highlight spots (exact match to sheet!)
      ctx.fillStyle = 'rgba(222, 158, 115, 0.55)';
      ctx.beginPath();
      ctx.ellipse(-9, -13, 3.5, 2, -0.5, 0, Math.PI * 2);
      ctx.ellipse(-13, -8, 1.8, 1.2, -0.5, 0, Math.PI * 2);
      ctx.fill();

      // Vertical S-curve Coffee Bean Center Crease (shifted slightly right for 3/4 side look)
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(2, -22);
      ctx.bezierCurveTo(6, -10, 3, 6, 5, 20);
      ctx.stroke();

      // Angry White Eyes with Dark Pupils & Furrowed V-Brow
      ctx.save();
      ctx.translate(3, (esx - 1) * 2);

      // Left Eye
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-6.5, -3, 4.5, 3.8, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right Eye
      ctx.beginPath();
      ctx.ellipse(6.5, -3, 4.2, 3.6, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupils & tiny white catchlights
      const pupilShift = enemy.aggro ? 0.8 : 0;
      ctx.fillStyle = '#1F0D05';
      ctx.beginPath();
      ctx.arc(-5.5 + pupilShift, -2.8, 2, 0, Math.PI * 2);
      ctx.arc(6.8 + pupilShift, -2.8, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-6 + pupilShift, -3.5, 0.8, 0, Math.PI * 2);
      ctx.arc(6.3 + pupilShift, -3.5, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Deep Furrowed V-Eyebrows (furrow deeper when charging!)
      const browDrop = enemy.aggro ? 1.2 : 0;
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-12, -8.5);
      ctx.lineTo(-2, -4.8 + browDrop);
      ctx.moveTo(11.5, -8.5);
      ctx.lineTo(2.5, -4.8 + browDrop);
      ctx.stroke();

      // Warm Rosy Cheeks (#D97762)
      ctx.fillStyle = enemy.aggro ? 'rgba(239, 95, 75, 0.8)' : 'rgba(225, 118, 98, 0.65)';
      ctx.beginPath();
      ctx.ellipse(-9.5, 2, 2.8, 1.6, 0, 0, Math.PI * 2);
      ctx.ellipse(9.5, 2, 2.6, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Grumpy Curved Frown (or open growl when charging!)
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      if (enemy.aggro) {
        ctx.fillStyle = '#3B1A0B';
        ctx.ellipse(0.5, 3.2, 3.8, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.moveTo(-3.5, 3.8);
        ctx.quadraticCurveTo(0.5, 0.5, 4.2, 3.8);
        ctx.stroke();
      }
      ctx.restore();

      // Foreground Arm & Clenched Fist
      ctx.save();
      ctx.translate(-14, 3);
      ctx.rotate(walkCycle * (enemy.aggro ? 0.55 : 0.35));
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 4.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-6, 6, -4, 13);
      ctx.stroke();
      ctx.fillStyle = '#783D1E';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(-4, 14, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (enemy.type === 'sugar_hopper') {
      // =========================================================================
      // 2. SUGAR CUBE HOPPER (Exact match to Middle Row of Enemy Character Sheet!)
      // 3D Isometric Crystalline White Sugar Cube with real parabolic hop physics,
      // squash-and-stretch landing compression, and Red-and-White Striped Sneakers!
      // =========================================================================
      const outlineCol = '#4A2512';
      const airFactor = !enemy.onGround ? Math.max(-1, Math.min(1, enemy.vy / 320)) : 0;

      // Speed / Hop motion lines behind cube (as shown in sheet!)
      ctx.strokeStyle = 'rgba(180, 155, 135, 0.55)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-29, -8);
      ctx.lineTo(-23, -8);
      ctx.moveTo(-31, 0);
      ctx.lineTo(-24, 0);
      ctx.stroke();

      // Helper for Red-and-White Striped Sneakers (Exact match to sheet!)
      const drawHopperSneaker = (lx, ly, rot) => {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(rot);

        // Cream-white leg
        ctx.fillStyle = '#F5EDE2';
        ctx.strokeStyle = outlineCol;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(-2.5, -9, 5, 10, 2);
        ctx.fill();
        ctx.stroke();

        // Red Sneaker Body
        ctx.fillStyle = '#D63E34';
        ctx.beginPath();
        ctx.moveTo(-5, -1);
        ctx.lineTo(4, -1);
        ctx.quadraticCurveTo(12, 0, 12.5, 5.5);
        ctx.lineTo(-5.5, 6.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // White Toe Cap & White Thick Sole
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(9.2, 3.8, 3, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.fill();
        ctx.stroke();

        ctx.fillRect(-5.5, 4.5, 17.5, 2.5);
        ctx.strokeRect(-5.5, 4.5, 17.5, 2.5);

        // Two White Laces / Stripes on Sneaker
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(1, 0);
        ctx.lineTo(3, 3.5);
        ctx.moveTo(4, 0.5);
        ctx.lineTo(6, 3.5);
        ctx.stroke();

        ctx.restore();
      };

      const legSpread = !enemy.onGround ? 6 : walkCycle * 7;
      // Back Leg & Sneaker
      drawHopperSneaker(-8 - legSpread, 19, (!enemy.onGround ? 0.45 : walkCycle * 0.45) + 0.2);
      // Front Leg & Sneaker (kicking forward in mid-air!)
      drawHopperSneaker(8 + legSpread, 18, (!enemy.onGround ? -0.5 + airFactor * 0.25 : -walkCycle * 0.45) - 0.3);

      // Trailing Left Arm (-X)
      ctx.save();
      ctx.translate(-18, 2);
      ctx.rotate(0.35 + walkCycle * 0.3 - airFactor * 0.35);
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-8, 2, -10, 9);
      ctx.stroke();
      ctx.strokeStyle = '#F5EDE2';
      ctx.lineWidth = 2.6;
      ctx.stroke();
      ctx.fillStyle = '#F5EDE2';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-10, 10, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 3D Isometric Sugar Cube Body (Left shaded side, Top face, Right front face)
      ctx.lineJoin = 'round';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2.8;

      // Left Shaded Face (#E5DCD0)
      ctx.fillStyle = '#E5DCD0';
      ctx.beginPath();
      ctx.moveTo(-19, -13);
      ctx.lineTo(-4, -9);
      ctx.lineTo(-4, 15);
      ctx.lineTo(-19, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top Face (#FFFFFF)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-19, -13);
      ctx.lineTo(3, -19);
      ctx.lineTo(19, -13);
      ctx.lineTo(-4, -9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Front/Right Face (#FAF6F0) where the face sits
      ctx.fillStyle = '#FAF6F0';
      ctx.beginPath();
      ctx.moveTo(-4, -9);
      ctx.lineTo(19, -13);
      ctx.lineTo(19, 11);
      ctx.lineTo(-4, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Granular Sugar Sparkle Texture Dots
      ctx.fillStyle = '#D5C7B8';
      const dots = [
        [-14, -4], [-10, 4], [-15, 6], [0, -14], [6, -15], [14, 7], [-1, 10]
      ];
      dots.forEach(([dx, dy]) => {
        ctx.fillRect(dx, dy, 2, 2);
      });

      // Excited Face on the Front/Right Cube Plane
      ctx.save();
      ctx.translate(8, 1 + airFactor * 1.5);

      // Wide Oval White Eyes with Big Dark Pupils
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-4.5, -3.5, 3.4, 4.4, 0, 0, Math.PI * 2);
      ctx.ellipse(4.8, -4.2, 3.2, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#2B1408';
      ctx.beginPath();
      ctx.ellipse(-4, -3.2 + airFactor * 0.8, 2, 2.8, 0, 0, Math.PI * 2);
      ctx.ellipse(5.2, -3.9 + airFactor * 0.8, 1.9, 2.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye Catchlights
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-4.6, -4.6 + airFactor * 0.6, 0.9, 0, Math.PI * 2);
      ctx.arc(4.6, -5.2 + airFactor * 0.6, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Expressive Arched Eyebrows
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-7.5, -9 - (!enemy.onGround ? 1.2 : 0));
      ctx.lineTo(-2, -8.5 - (!enemy.onGround ? 1.2 : 0));
      ctx.moveTo(2.5, -9.5 - (!enemy.onGround ? 1.2 : 0));
      ctx.lineTo(7.5, -9.5 - (!enemy.onGround ? 1.2 : 0));
      ctx.stroke();

      // Pink Cheeks
      ctx.fillStyle = '#F29B8E';
      ctx.beginPath();
      ctx.ellipse(-7, 2.2, 2.4, 1.4, 0, 0, Math.PI * 2);
      ctx.ellipse(7.5, 1.2, 2.2, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wide Open Laughing/Battle-Cry Mouth with Red Tongue
      ctx.fillStyle = '#5A1E14';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-3.8, 1);
      ctx.lineTo(4.2, 0.2);
      ctx.bezierCurveTo(4.8, 7.5 + (!enemy.onGround ? 1.5 : 0), -4.2, 8 + (!enemy.onGround ? 1.5 : 0), -3.8, 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#E8655A';
      ctx.beginPath();
      ctx.ellipse(0.3, 4.5, 2.5, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Raised Cheering Front Arm (+X) with Fist
      ctx.save();
      ctx.translate(18, 0);
      ctx.rotate(-0.4 + walkCycle * 0.25 - (!enemy.onGround ? 0.35 : 0));
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(7, -1, 9, -7);
      ctx.stroke();
      ctx.strokeStyle = '#F5EDE2';
      ctx.lineWidth = 2.6;
      ctx.stroke();
      ctx.fillStyle = '#F5EDE2';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(9, -8, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (enemy.type !== 'steam_harpy') {
      // =========================================================================
      // 3. STEAM CLOUD SPIRIT (Exact match to Bottom Row of Enemy Character Sheet!)
      // Floating creamy-white wispy steam ghost with top curl crest, inner spiral
      // curls, mischievous eyes & smirk, floating wisp hands, and undulating tail!
      // =========================================================================
      const outlineCol = '#5E3A22';
      const tailWave = Math.sin(phase * 1.1) * 4.5;

      // Sculpted Wispy Steam Body with Top Curl Crest & Undulating Ghostly Tail
      const spiritGrad = ctx.createRadialGradient(2, -4, 4, 0, 0, 28);
      spiritGrad.addColorStop(0, '#FFFDF9');
      spiritGrad.addColorStop(0.65, '#F5E9D6');
      spiritGrad.addColorStop(1, '#DFCBB0');

      ctx.fillStyle = spiritGrad;
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2.6;
      ctx.lineJoin = 'round';

      ctx.beginPath();
      // Start at top-left wisp curl crest
      ctx.moveTo(-8, -24);
      ctx.bezierCurveTo(-2, -28, 12, -25, 17, -15);
      ctx.bezierCurveTo(23, -8, 22, 6, 15, 14);
      // Bottom sweeping ghostly tail curling back to the left (-X) with dynamic wave!
      ctx.bezierCurveTo(8, 22, -8, 24 + tailWave * 0.5, -22, 20 + tailWave);
      ctx.bezierCurveTo(-30, 17 + tailWave, -31, 9 + tailWave, -25, 7 + tailWave * 0.8);
      ctx.bezierCurveTo(-21, 6 + tailWave * 0.6, -19, 12 + tailWave * 0.5, -23, 13 + tailWave * 0.7);
      ctx.quadraticCurveTo(-14, 15 + tailWave * 0.4, -12, 8);
      // Left billowing cloud puffs
      ctx.bezierCurveTo(-21, 4, -22, -8, -14, -13);
      ctx.bezierCurveTo(-18, -18, -14, -24, -8, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner Decorative Cream Spiral Curls (Signature detail on Steam Cloud Spirit!)
      ctx.strokeStyle = '#C9B193';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      const drawSpiritCurl = (cx, cy, r) => {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2.4; a += 0.25) {
          const rad = r * (1 - a / (Math.PI * 2.8));
          const px = cx + Math.cos(a) * rad;
          const py = cy + Math.sin(a) * rad;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      };
      drawSpiritCurl(-9, -6, 6.5);
      drawSpiritCurl(-6, 9, 5.5);

      // Mischievous Angled Eyes, Rosy Cheeks & Smirk/Open Grin
      ctx.save();
      ctx.translate(6, -3);

      // Eyes
      ctx.fillStyle = '#4A2512';
      ctx.beginPath();
      ctx.ellipse(-4.5, -1, 2.5, 3.2, 0.15, 0, Math.PI * 2);
      ctx.ellipse(5.5, -1.5, 2.3, 3, -0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-4.8, -2, 0.9, 0, Math.PI * 2);
      ctx.arc(5.2, -2.5, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Mischievous V-Brows
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-8, -5.5);
      ctx.lineTo(-2, -3.2);
      ctx.moveTo(8.5, -6);
      ctx.lineTo(3, -3.5);
      ctx.stroke();

      // Soft Peach Cheeks
      ctx.fillStyle = 'rgba(242, 155, 142, 0.55)';
      ctx.beginPath();
      ctx.ellipse(-6.8, 2.8, 2.4, 1.3, 0, 0, Math.PI * 2);
      ctx.ellipse(7.2, 2.2, 2.2, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mischievous Grin
      ctx.fillStyle = '#6E261A';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-3, 2.5);
      ctx.quadraticCurveTo(1, 1.5, 4, 2.2);
      ctx.bezierCurveTo(3.5, 6.5, -2.5, 6.5, -3, 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Wispy Curling Arms (Front & Side) swaying with aerial motion
      ctx.save();
      ctx.translate(16, 4);
      ctx.rotate(Math.sin(phase * 0.9) * 0.25);
      ctx.strokeStyle = outlineCol;
      ctx.fillStyle = '#F5E9D6';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(9, -3, 9, 3);
      ctx.quadraticCurveTo(7, 7, -1, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      // Celestial Winged Steam Harpy: Flapping latte-foam feathery wings, cute steam cloud body, goggles!
      const outlineCol = '#4c1d95';
      const wingFlap = Math.sin(phase * 1.8) * 0.7;

      // Far wing
      ctx.save();
      ctx.translate(-8, -4);
      ctx.rotate(-0.4 - wingFlap);
      ctx.fillStyle = '#e0e7ff';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, -14, 8, 18, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Cloud Body
      const bGrad = ctx.createRadialGradient(0, -2, 3, 0, 0, 22);
      bGrad.addColorStop(0, '#ffffff');
      bGrad.addColorStop(0.6, '#ede9fe');
      bGrad.addColorStop(1, '#c4b5fd');
      ctx.fillStyle = bGrad;
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Steampunk Aviator Goggles
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#291105';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(-5, -4, 5.5, 0, Math.PI * 2);
      ctx.arc(6, -4, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-5, -4, 3.2, 0, Math.PI * 2);
      ctx.arc(6, -4, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Cute smile
      ctx.strokeStyle = '#2e1065';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(1, 4, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Near wing
      ctx.save();
      ctx.translate(8, -2);
      ctx.rotate(0.3 + wingFlap);
      ctx.fillStyle = '#f5f3ff';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, -16, 9, 20, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  drawPlayer(player, cameraX, time, unlockedPowerups) {
    const sx = player.x - cameraX;
    const sy = player.y;
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(sx, sy);

    // Subtle, much smaller ground contact shadow beneath the protagonist's boots,
    // tilted to match rounded platform edges and slopes!
    if (player.onGround) {
      ctx.save();
      ctx.translate(0, player.r);
      ctx.rotate(player.groundAngle || 0);
      ctx.fillStyle = 'rgba(42, 18, 6, 0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12.5, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Invulnerability flash
    if (player.invulnTimer > 0 && Math.floor(time * 20) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }

    // Nitro Foam Shield Aura if unlocked
    if (unlockedPowerups.has('nitro_shield') && player.shieldActive) {
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.78)';
      ctx.fillStyle = 'rgba(251, 207, 232, 0.2)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, -4, 52 + Math.sin(time * 6) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Smoothly blend between FRONT VIEW (0) when idle and SIDE VIEW (1) when running/jumping/attacking
    const speedRatio = Math.min(1, Math.abs(player.vx) / 135);
    const isAction = !player.onGround || player.meleeTimer > 0 || player.shotCooldown > 0.1;
    const sideMix = isAction ? Math.max(0.82, speedRatio) : speedRatio * 0.9;
    const idleBlend = player.idleBlend || 0;

    // Rhythmic impatient foot-tapping cycle when waiting in idle!
    const tapRaw = Math.sin(time * 9.5);
    const tapLift = Math.max(0, tapRaw); // Lifts toe up on positive half-wave, snaps down to ground on 0

    // Rotate around the ground contact point (player.r) by the platform's rounded-edge slope angle
    // before flipping horizontally so slope rotation always matches the terrain contour!
    const slopeTilt = player.onGround ? (player.groundAngle || 0) * 0.78 : 0;
    ctx.translate(0, player.r);
    ctx.rotate(slopeTilt);
    ctx.scale(player.facing, 1);

    // Anchor squash & stretch at the bottom of the boots (+28px local) and scale up to 1.38x
    // for an even larger, commanding hero presence with crisp, refined thin linework!
    const heroScale = 1.38;
    const dynamicTilt = player.tiltAngle !== undefined ? player.tiltAngle : player.vx * 0.00038 * player.facing;
    const idleHipTilt = idleBlend * (-0.035 + Math.sin(time * 9.5) * 0.015);

    ctx.rotate(dynamicTilt + idleHipTilt);
    ctx.scale(player.scaleX * heroScale, player.scaleY * heroScale);
    ctx.translate(0, -28);

    const outlineCol = '#432212';

    const airBlend = player.airBlend !== undefined ? player.airBlend : (player.onGround ? 0 : 1);
    const airTime = player.airTime || time;
    const limbLagX = (player.limbLagX || 0) * airBlend;
    const limbLagY = (player.limbLagY || 0) * airBlend;
    // Vertical velocity dangle offset: positive when rising (arms/legs hang down), negative when falling fast (wind trails arms up)
    const armDangleY = airBlend * Math.max(-7, Math.min(15, limbLagY * 1.55 - (player.vy || 0) * 0.011));
    const armFlutter = airBlend * Math.sin(airTime * 12.5) * 0.34;

    const runSwing = player.onGround
      ? Math.sin(player.animTime * 16) * Math.min(1, Math.abs(player.vx) / 160)
      : Math.sin(airTime * 12.5) * 0.45;

    // Slight sassy hip shift over the standing leg when hands are on his waist in idle
    const hipShiftX = idleBlend * -1.4;
    const hipBobY = idleBlend * Math.abs(Math.sin(time * 9.5)) * 0.9;

    // --- 1. Far/Left Arm (When shooting: supports the equipped gun with 2 hands! When idle: hand on waist! In air: dangles!) ---
    const hasGun = Boolean(player.hasBeanGun);
    const weaponType = player.weaponType || 'glock_16mm';
    const isShooting = (player.gunShootTimer || 0) > 0 && hasGun;

    ctx.save();
    if (isShooting) {
      // Two-handed tactical shooting stance: Left arm reaches forward to cup under the gun grip!
      const nearArmX = (1 - sideMix) * 21 + sideMix * 2;
      const nearArmY = (1 - sideMix) * 4 + sideMix * 8;
      this.drawSupportArm(ctx, nearArmX, nearArmY, sideMix, player.gunShootTimer || 0, weaponType);
    } else if (idleBlend > 0.5 && !isAction) {
      // Left arm bent akimbo with hand planted firmly on the left waist/hip of the cup!
      this.drawWaistArm(ctx, -1, tapLift, hipShiftX, hipBobY);
    } else {
      const waveX = (1 - sideMix) * -23 + sideMix * (18 - airBlend * 4) + limbLagX * 0.55;
      const waveY = (1 - sideMix) * 1 + sideMix * 3 + (player.scaleY - 1) * -4 + armDangleY * 0.35;
      ctx.translate(waveX, waveY);
      this.drawProtagonistArm(
        ctx,
        sideMix > 0.45 ? 1 : -1,
        true,
        false,
        0,
        false,
        runSwing * 0.42 * (1 - airBlend) + armFlutter + Math.sin(time * 6.5) * 0.09,
        airBlend,
        armDangleY,
        limbLagX
      );
    }
    ctx.restore();

    // --- 2. Legs & Cuffed Red Boots (Dangle loosely in the air, stride when running, or tap foot in idle!) ---
    const groundStride = runSwing * 11 * (1 - idleBlend) * (1 - airBlend);
    const airKick = Math.sin(airTime * 13.5) * 4.6 * airBlend;
    const leftLegX = -8.5 + sideMix * 4.5 + groundStride + limbLagX * 0.85 - airKick;
    const rightLegX = 8.5 + idleBlend * 1.8 - sideMix * 2.5 - groundStride + limbLagX * 0.7 + airKick;

    // When airborne, legs extend & hang downward below the cup instead of tucking up!
    const leftAirDrop = airBlend * (4.8 + Math.max(-1.5, limbLagY * 0.65) + Math.cos(airTime * 13.5) * 2.2);
    const rightAirDrop = airBlend * (5.8 + Math.max(-1.5, limbLagY * 0.65) - Math.cos(airTime * 13.5) * 2.2);
    const leftGroundLift = Math.max(0, -runSwing) * 4.5 * (1 - idleBlend) * (1 - airBlend);
    const rightGroundLift = Math.max(0, runSwing) * 4.5 * (1 - idleBlend) * (1 - airBlend);

    // Dangling boot angle: toes point loosely downward and swing like a pendulum in the air!
    const airToeDangle = airBlend * (0.38 + Math.max(-0.22, Math.min(0.32, -(player.vy || 0) * 0.0005)));
    const leftBootAngle = -runSwing * 0.42 * (1 - idleBlend) * (1 - airBlend) + airToeDangle - armFlutter * 0.65;
    const rightBootAngle = runSwing * 0.42 * (1 - idleBlend) * (1 - airBlend) + airToeDangle + armFlutter * 0.65;

    // Left / Standing or Back Dangling Boot
    this.drawCupBoot(
      leftLegX,
      20.2 - leftGroundLift + leftAirDrop,
      leftBootAngle,
      0.25 + sideMix * 0.65,
      0,
      leftAirDrop,
      -limbLagX * 0.45
    );

    // Right / Tapping or Front Dangling Boot
    const tapToeAngle = idleBlend * (1 - airBlend) * (-tapLift * 0.44);
    this.drawCupBoot(
      rightLegX,
      20.8 - rightGroundLift + rightAirDrop,
      rightBootAngle,
      0.38 + sideMix * 0.62 + idleBlend * 0.25,
      tapToeAngle,
      rightAirDrop,
      -limbLagX * 0.45
    );

    // Subtle rhythmic tap lines near the tapping boot toe when it strikes the ground in idle!
    if (idleBlend > 0.65 && tapRaw < -0.75) {
      ctx.save();
      ctx.strokeStyle = 'rgba(253, 230, 138, 0.75)';
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rightLegX + 9, 25);
      ctx.lineTo(rightLegX + 12.5, 23);
      ctx.moveTo(rightLegX + 10, 27.5);
      ctx.lineTo(rightLegX + 14, 27);
      ctx.stroke();
      ctx.restore();
    }

    // --- 3. Upper Body Group (with subtle hip shift & breathing during idle) ---
    ctx.save();
    ctx.translate(hipShiftX, hipBobY);

    // Draw Thruster Jetpack on the back of the cup (canisters, nozzles & rocket exhaust)
    this.drawJetpackOnPlayer(ctx, player, sideMix, time);

    // Handle in FRONT VIEW (Sits on the side of the cup when sideMix is low)
    if (sideMix < 0.55) {
      ctx.save();
      ctx.translate(23, -1);
      ctx.fillStyle = '#E8CFB0';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      ctx.arc(0, 0, 11.5, -Math.PI * 0.55, Math.PI * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#24314c';
      ctx.beginPath();
      ctx.arc(-1, 0, 5.2, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // --- 4. Wide Rounded Cream Porcelain Cup Body (Thinner, refined linework) ---
    ctx.save();
    ctx.fillStyle = '#F5E3C8';
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(-25, -16);
    ctx.lineTo(25, -16);
    ctx.bezierCurveTo(25, 11, 14, 19, 0, 19);
    ctx.bezierCurveTo(-15, 19, -25, 11, -25, -16);
    ctx.closePath();
    ctx.fill();

    // Clip inside cup body for warm crescent shadow (#DEC39D) & glossy vertical highlight (#FFF9EE)
    ctx.save();
    ctx.clip();

    ctx.fillStyle = '#DEC39D';
    ctx.beginPath();
    ctx.moveTo(-26, 12);
    ctx.quadraticCurveTo(8, 15, 18, -18);
    ctx.lineTo(26, -18);
    ctx.lineTo(26, 22);
    ctx.lineTo(-26, 22);
    ctx.closePath();
    ctx.fill();

    // Glossy white vertical highlight on the leading/front curve
    ctx.fillStyle = 'rgba(255, 252, 245, 0.88)';
    ctx.beginPath();
    ctx.ellipse(-16 + sideMix * 33, -2, 3.6, 11, -0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Re-stroke outer cup contour cleanly with refined thin linework
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-25, -16);
    ctx.lineTo(25, -16);
    ctx.bezierCurveTo(25, 11, 14, 19, 0, 19);
    ctx.bezierCurveTo(-15, 19, -25, 11, -25, -16);
    ctx.closePath();
    ctx.stroke();

    // Draw Jetpack Harness Straps & Bronze Buckle across the porcelain cup torso
    this.drawJetpackHarness(ctx, player, sideMix);

    // --- 5. Thick Ceramic Top Rim, Bubbly Crema Foam & Dynamic Slosh-Reactive Splash Crown ---
    ctx.fillStyle = '#FFF6E8';
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.75;
    ctx.beginPath();
    ctx.ellipse(0, -16, 25, 7.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#DFC4A2';
    ctx.beginPath();
    ctx.ellipse(0, -15.5, 21.5, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rich roast coffee surface reactive to player.sloshAngle
    const slosh = Math.sin(time * 9.5) * 2.2 + (player.sloshAngle || 0) * 0.45;
    ctx.fillStyle = '#5A2E17';
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(0, -15.2, 20.5, 4.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Sculpted Bubbly Sloshing Coffee Wave & Crema Bubbles inside the rim
    ctx.fillStyle = '#6E381D';
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-18, -15.5);
    ctx.quadraticCurveTo(-11, -21 + slosh * 0.7, -3, -17);
    ctx.quadraticCurveTo(6, -24 - slosh * 0.9, 12, -26 - Math.min(6, Math.abs(slosh)));
    ctx.quadraticCurveTo(18, -27, 16, -15.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crema foam bubbles on the coffee surface
    const bubbles = [
      { bx: -11, by: -16.5, br: 2.3 },
      { bx: -6, by: -15.2, br: 1.6 },
      { bx: 3, by: -16.2, br: 2.1 },
      { bx: 9, by: -15.5, br: 1.5 }
    ];
    bubbles.forEach((b) => {
      ctx.fillStyle = '#C88A5A';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 0.95;
      ctx.beginPath();
      ctx.arc(b.bx, b.by, b.br, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Airborne Coffee Droplets & S-Curved Steam Plume above the cup
    ctx.save();
    const steamWiggle = Math.sin(time * 3.5) * 4;
    const steamGrad = ctx.createLinearGradient(0, -20, 0, -68);
    steamGrad.addColorStop(0, 'rgba(255, 250, 240, 0.42)');
    steamGrad.addColorStop(0.6, 'rgba(245, 235, 220, 0.22)');
    steamGrad.addColorStop(1, 'rgba(255, 250, 240, 0)');
    ctx.fillStyle = steamGrad;
    ctx.beginPath();
    ctx.moveTo(-4, -20);
    ctx.bezierCurveTo(-16 + steamWiggle, -35, 14 - steamWiggle, -48, -5 + steamWiggle, -68);
    ctx.bezierCurveTo(17 - steamWiggle, -50, -5 + steamWiggle, -35, 6, -20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const dropOffsets = [
      { dx: -10, dy: -26, r: 2.3 },
      { dx: -2, dy: -31, r: 2.7 },
      { dx: 11, dy: -32, r: 2.1 },
      { dx: 18, dy: -25, r: 1.7 }
    ];
    dropOffsets.forEach((d, idx) => {
      const bounce = Math.sin(time * 11 + idx * 1.4) * 2.8 + (player.scaleY - 1) * -8;
      ctx.fillStyle = '#6E381D';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(d.dx, d.dy + bounce, d.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // =========================================================================
    // 6. EXPRESSIVE ANIMATED FACE (Blinking, Gaze Tracking, Eyebrows & Mouth!)
    // =========================================================================
    const faceShiftX = sideMix * 11.5;
    const faceFollowY = (player.scaleY - 1) * -3.5;
    const isBlinking = (player.blinkTimer || 0) > 0;
    const isHurtFace = (player.invulnTimer || 0) > 0.85;
    const isAttackingFace = player.meleeTimer > 0 || player.dashTimer > 0 || player.shotCooldown > 0.08;
    const lookX = (player.eyeLookX || 0) * 1.15;
    const lookY = (player.eyeLookY || 0) * 1.0;

    ctx.save();
    ctx.translate(faceShiftX, faceFollowY);

    const leftEyeX = -9.5 + sideMix * 5.5;
    const leftEyeScaleX = 1 - sideMix * 0.22;
    const rightEyeX = 9.5 - sideMix * 1.5;
    const rightEyeScaleX = 1 - sideMix * 0.35;

    // --- 6a. Animated Expressive Eyebrows ---
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.45;
    ctx.lineCap = 'round';

    // Left Eyebrow (Raises in jump excitement, angles in action, or tilts with impatience in idle!)
    const jumpBrowLift = !player.onGround ? -1.8 : 0;
    const idleLeftBrow = idleBlend * (0.8 + tapLift * 0.6);
    const idleRightBrow = idleBlend * (-1.6 - tapLift * 0.9); // Cocked sassy brow when waiting!
    const actionBrowTilt = isAttackingFace ? 1.6 : 0;

    ctx.beginPath();
    ctx.moveTo(leftEyeX - 3.4 * leftEyeScaleX, -6.5 + jumpBrowLift - actionBrowTilt * 0.5 + idleLeftBrow * 0.4);
    ctx.quadraticCurveTo(
      leftEyeX,
      -8.0 + jumpBrowLift + idleLeftBrow,
      leftEyeX + 3.2 * leftEyeScaleX,
      -6.2 + jumpBrowLift + actionBrowTilt
    );
    ctx.stroke();

    if (sideMix < 0.78) {
      ctx.beginPath();
      ctx.moveTo(rightEyeX - 3.0 * rightEyeScaleX, -6.2 + jumpBrowLift + actionBrowTilt);
      ctx.quadraticCurveTo(
        rightEyeX,
        -8.2 + jumpBrowLift + idleRightBrow,
        rightEyeX + 3.4 * rightEyeScaleX,
        -6.4 + jumpBrowLift - actionBrowTilt * 0.5 + idleRightBrow * 0.5
      );
      ctx.stroke();
    }

    // --- 6b. Animated Eyes (Open with tracking catchlights, Blinking eyelids, or Hurt '> <' wince) ---
    const drawAnimatedEye = (ex, scaleX, isLeft) => {
      if (isHurtFace) {
        // Squeezed '> <' wince eyes when hurt!
        ctx.strokeStyle = outlineCol;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        if (isLeft) {
          ctx.moveTo(ex - 2.8 * scaleX, -3.5);
          ctx.lineTo(ex + 2.2 * scaleX, -1.2);
          ctx.lineTo(ex - 2.8 * scaleX, 1.2);
        } else {
          ctx.moveTo(ex + 2.8 * scaleX, -3.5);
          ctx.lineTo(ex - 2.2 * scaleX, -1.2);
          ctx.lineTo(ex + 2.8 * scaleX, 1.2);
        }
        ctx.stroke();
      } else if (isBlinking) {
        // Crisp curved closed eyelid arc during natural blink
        ctx.strokeStyle = outlineCol;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ex - 3.3 * scaleX, -1.0);
        ctx.quadraticCurveTo(ex, 1.4, ex + 3.3 * scaleX, -1.0);
        ctx.stroke();
      } else {
        // Open glossy dark espresso eyes with gaze-tracking catchlights!
        const eyeStretchY = !player.onGround ? 1.08 : 1.0 - idleBlend * 0.06;
        ctx.fillStyle = outlineCol;
        ctx.beginPath();
        ctx.ellipse(ex + lookX * 0.45, -1.5 + lookY * 0.4, 3.2 * scaleX, 3.9 * eyeStretchY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Half-lidded sassy upper eyelid line when waiting impatiently in idle
        if (idleBlend > 0.55) {
          ctx.fillStyle = '#F5E3C8';
          ctx.beginPath();
          ctx.ellipse(ex + lookX * 0.45, -4.4, 3.6 * scaleX, 1.6 * idleBlend, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Primary & secondary white specular catchlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ex + (0.9 + lookX * 0.65) * scaleX, -2.8 + lookY * 0.55, 1.25 * scaleX, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex - (1.1 - lookX * 0.35) * scaleX, 0.3 + lookY * 0.35, 0.55 * scaleX, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawAnimatedEye(leftEyeX, leftEyeScaleX, true);
    if (sideMix < 0.78) {
      drawAnimatedEye(rightEyeX, rightEyeScaleX, false);
    }

    // --- 6c. Warm Coral-Pink Oval Cheeks (#F19483) that puff slightly with expression ---
    const cheekPulse = 1 + Math.sin(time * 8) * 0.05;
    ctx.fillStyle = '#F19483';
    ctx.beginPath();
    ctx.ellipse(leftEyeX - 3.2 * (1 - sideMix * 0.4), 3.8, 4.2 * cheekPulse, 2.3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (sideMix < 0.72) {
      ctx.beginPath();
      ctx.ellipse(12.2, 3.8, 3.8 * cheekPulse, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 6d. Expressive Context-Reactive Mouth ---
    const mouthX = sideMix * 5.8;
    ctx.save();
    ctx.translate(mouthX, 2.2);
    ctx.fillStyle = '#4A2112';
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.3;

    if (isHurtFace) {
      // Surprised / wincing 'O' mouth when hurt
      ctx.beginPath();
      ctx.ellipse(0, 2.0, 2.6, 3.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (!player.onGround && player.vy > 200) {
      // Excited wind-rushing 'O' mouth when diving/falling fast!
      ctx.beginPath();
      ctx.ellipse(0.4, 1.8, 2.8, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F08070';
      ctx.beginPath();
      ctx.ellipse(0.4, 3.2, 1.8, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (idleBlend > 0.55 && !isAttackingFace) {
      // Impatient / sassy side-smirk pulsing rhythmically with the foot tap!
      const tapSmirk = tapLift * 0.9;
      ctx.beginPath();
      ctx.moveTo(-3.4, 1.2 + tapSmirk * 0.3);
      ctx.quadraticCurveTo(0.8, 1.8 - tapSmirk * 0.6, 4.2, -0.4 - tapSmirk * 0.5);
      ctx.stroke();
      // Little corner smile dimple
      ctx.beginPath();
      ctx.arc(4.4, -0.6 - tapSmirk * 0.5, 1.1, -Math.PI * 0.7, Math.PI * 0.4);
      ctx.stroke();
    } else {
      // Cheerful Open Smile with Coral Tongue (wider when jumping or attacking!)
      const mouthOpen = !player.onGround ? 6.2 : isAttackingFace ? 5.8 : 5.1 + Math.sin(player.animTime * 16) * 0.5;
      const wScale = 1 - sideMix * 0.25;
      ctx.beginPath();
      ctx.moveTo(-3.8 * wScale, -0.5);
      ctx.quadraticCurveTo(0, 0.8, 3.8, -0.5);
      ctx.bezierCurveTo(4.2, mouthOpen, -4.2 * wScale, mouthOpen, -3.8 * wScale, -0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F08070';
      ctx.beginPath();
      ctx.ellipse(0, mouthOpen * 0.48, 2.3 * (1 - sideMix * 0.2), 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore(); // end face group

    // --- 7. Foreground Foreshortened C-Handle on the Side of the Cup in SIDE VIEW ---
    if (sideMix >= 0.55) {
      ctx.save();
      ctx.translate(-9, -1);
      ctx.fillStyle = '#E8CFB0';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      ctx.roundRect(-4.5, -11.5, 9, 23, 4.5);
      ctx.fill();
      ctx.stroke();

      // Inner handle groove
      ctx.strokeStyle = '#C9AC86';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
      ctx.restore();
    }

    ctx.restore(); // end cup body + face group
    ctx.restore(); // end hipShift group

    // --- 8. Near/Right Arm (Holding Black Glock 16mm when equipped, Spoon when meleeing, or swinging/waist) ---
    ctx.save();
    const spoonUpgraded = unlockedPowerups.has('silver_spoon');

    if (idleBlend > 0.5 && !isAction && player.meleeTimer <= 0 && !isShooting && !hasGun) {
      // Right arm bent akimbo with hand planted firmly on the right waist/hip of the cup!
      this.drawWaistArm(ctx, 1, tapLift, hipShiftX, hipBobY);
    } else {
      const nearArmX = (1 - sideMix) * 21 + sideMix * (2 + limbLagX * 0.45);
      const nearArmY = (1 - sideMix) * 4 + sideMix * 8 + (player.scaleY - 1) * -3 + armDangleY * 0.28;

      ctx.translate(nearArmX, nearArmY);
      this.drawProtagonistArm(
        ctx,
        1,
        false,
        player.meleeTimer > 0,
        player.meleeTimer,
        spoonUpgraded,
        -runSwing * 0.42 * (1 - airBlend) - armFlutter * 1.15,
        airBlend,
        armDangleY,
        limbLagX,
        hasGun,
        isShooting,
        player.gunShootTimer || 0,
        player.gunRecoilX || 0,
        weaponType,
        time
      );
    }
    ctx.restore();

    ctx.restore();
  }

  // Draws an arm bent akimbo with elbow pointing outward and hand resting on the cup's waist/hip!
  drawWaistArm(ctx, sideDir, tapLift, hipShiftX = 0, hipBobY = 0) {
    const limbCol = '#522915';
    const outlineCol = '#3A1B0C';

    const shoulderX = sideDir * 22 + hipShiftX;
    const shoulderY = 1.5 + hipBobY;
    const elbowX = sideDir * (31.5 + tapLift * 0.9) + hipShiftX;
    const elbowY = 6.2 + hipBobY - tapLift * 0.6;
    const handX = sideDir * 19.5 + hipShiftX;
    const handY = 12.2 + hipBobY;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer dark contour of bent akimbo arm
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Inner warm espresso arm fill stroke
    ctx.strokeStyle = limbCol;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Hand planted on waist/hip
    ctx.fillStyle = limbCol;
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.ellipse(handX - sideDir * 1.2, handY + 0.4, 3.4, 2.5, sideDir * -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Two-handed tactical shooting stance: Left/Far Arm extends across chest to support the equipped gun!
  drawSupportArm(ctx, targetHandX, targetHandY, sideMix, gunShootTimer, weaponType = 'glock_16mm') {
    const limbCol = '#522915';
    const outlineCol = '#3A1B0C';
    const isDeagle = weaponType === 'golden_deagle';
    const duration = isDeagle ? 0.26 : 0.22;
    const recoilProg = gunShootTimer / duration;
    const kickX = -recoilProg * (isDeagle ? 8 : 6);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const shoulderX = -12 + sideMix * 14;
    const shoulderY = 1.5;
    const endX = targetHandX + kickX - 2.5;
    const endY = targetHandY + 3.8;
    const ctrlX = shoulderX + 11;
    const ctrlY = shoulderY + 8;

    // Dark contour of left arm extending across chest
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
    ctx.stroke();

    // Espresso arm fill
    ctx.strokeStyle = limbCol;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
    ctx.stroke();

    // Left support hand cupping firmly under the gun grip & right hand
    ctx.fillStyle = limbCol;
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(endX, endY, 3.6, 2.8, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Support fingers wrapping under the base of the grip
    ctx.beginPath();
    ctx.arc(endX + 2, endY - 1, 1.6, 0, Math.PI * 2);
    ctx.arc(endX + 3.5, endY + 0.8, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawProtagonistArm(
    ctx,
    dir,
    isWaving,
    isSlashing,
    meleeTimer,
    spoonUpgraded = false,
    walkSwing = 0,
    airBlend = 0,
    armDangleY = 0,
    limbLagX = 0,
    hasGun = false,
    isShooting = false,
    gunShootTimer = 0,
    gunRecoilX = 0,
    weaponType = 'glock_16mm',
    time = 0
  ) {
    const limbCol = '#522915';
    const outlineCol = '#3A1B0C';

    ctx.save();
    if (isSlashing) {
      // Dynamic Silver Barista Spoon Slash!
      const slashProgress = 1 - meleeTimer / 0.24;
      const swingAngle = Math.sin(slashProgress * Math.PI) * 2.1 - 0.75;
      ctx.rotate(swingAngle);

      ctx.strokeStyle = limbCol;
      ctx.lineWidth = 3.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(9, 2, 17, -2);
      ctx.stroke();

      // Silver or Golden Barista Spoon
      ctx.fillStyle = spoonUpgraded ? '#fde047' : '#e2e8f0';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.45;
      ctx.beginPath();
      ctx.roundRect(14, -24, 4, 23, 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(16, -28, 6.8, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Slash wave trail
      ctx.strokeStyle = spoonUpgraded ? 'rgba(250, 204, 21, 0.9)' : 'rgba(186, 230, 253, 0.85)';
      ctx.lineWidth = spoonUpgraded ? 7.5 : 5.0;
      ctx.beginPath();
      ctx.arc(0, 0, spoonUpgraded ? 48 : 35, -1.25, 1.15);
      ctx.stroke();
    } else if (hasGun) {
      // =========================================================================
      // EQUIPPED GUN (Black Glock 16mm or Golden Desert Eagle .50)
      // =========================================================================
      const isSupaSplat = weaponType === 'supa_splat';
      const isDeagle = weaponType === 'golden_deagle';
      const duration = isSupaSplat ? 0.24 : isDeagle ? 0.26 : 0.22;
      const recoilProg = isShooting ? gunShootTimer / duration : 0;
      const kickX = -recoilProg * (isSupaSplat ? 8.5 : isDeagle ? 8 : 6);
      const kickAngle = -recoilProg * (isSupaSplat ? 0.24 : isDeagle ? 0.26 : 0.22);
      const armAngle = isShooting ? -0.12 + kickAngle : 0.22 + walkSwing * 0.3;

      ctx.rotate(armAngle);
      ctx.translate(kickX, 0);

      // Arm reaching forward holding gun
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 3.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(8, isShooting ? -2 : 3, 16, isShooting ? -4 : 6);
      ctx.stroke();

      ctx.strokeStyle = limbCol;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(8, isShooting ? -2 : 3, 16, isShooting ? -4 : 6);
      ctx.stroke();

      // Hand grasping gun grip
      const handX = 16;
      const handY = isShooting ? -4 : 6;
      ctx.fillStyle = limbCol;
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(handX, handY, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw the equipped weapon!
      if (isSupaSplat) {
        this.drawSupaSplatGun(ctx, handX, handY, isShooting, recoilProg, time);
      } else if (isDeagle) {
        this.drawGoldenDesertEagle50(ctx, handX, handY, isShooting, recoilProg, time);
      } else {
        this.drawBlackGlock16mm(ctx, handX, handY, isShooting, recoilProg);
      }
    } else if (isWaving) {
      // Raised Waving / Reaching 4-Finger Hand that dangles & trails loosely in mid-air!
      ctx.rotate(walkSwing * 0.45);

      const ctrlX = dir * 9 + limbLagX * 0.45;
      const ctrlY = -2 + armDangleY * 0.85;
      const endX = dir * (13 - airBlend * 2.5) + limbLagX * 0.8;
      const endY = -11 + armDangleY * 1.35 + airBlend * 5.5;

      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      ctx.stroke();

      ctx.strokeStyle = limbCol;
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      ctx.stroke();

      // Cute spread 4-fingered hand dangling at the wrist
      const handX = endX + dir * 0.8;
      const handY = endY - 0.8 + airBlend * 1.2;
      ctx.fillStyle = limbCol;
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(handX, handY, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const wristDroop = airBlend * 0.35 + armDangleY * 0.03;
      const fingerAngles = [-0.6 + wristDroop, -0.15 + wristDroop, 0.3 + wristDroop];
      fingerAngles.forEach((fa) => {
        ctx.save();
        ctx.translate(handX, handY);
        ctx.rotate(fa * dir);
        ctx.beginPath();
        ctx.roundRect(dir > 0 ? 1 : -5.2, -2.3, 4.2, 2.0, 1);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    } else {
      // Near Lower Arm that dangles downward & trails loosely in the air!
      ctx.rotate(walkSwing);

      const ctrlX = dir * (3 - airBlend * 2) + limbLagX * 0.6;
      const ctrlY = 7 + airBlend * 4.5 + armDangleY * 0.7;
      const endX = dir * (10 - airBlend * 4.5) + limbLagX * 0.95;
      const endY = 4 + airBlend * 7.5 + armDangleY * 1.1;

      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      ctx.stroke();

      ctx.strokeStyle = limbCol;
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      ctx.stroke();

      ctx.fillStyle = limbCol;
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(endX + dir * 0.8, endY + 0.4, 3.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCupBoot(x, y, angle, toeProfile = 0.5, toeTapAngle = 0, legDangleY = 0, legBendX = 0) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const outlineCol = '#432212';
    const limbCol = '#522915';
    const bootRed = '#C63B33';
    const bootShadow = '#9E2A24';

    // Dark brown stick leg (extends higher & bends loosely when dangling in the air!)
    const topLegY = -8 - legDangleY * 1.15;
    const topLegX = -legBendX * 0.6;
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(topLegX, topLegY);
    ctx.quadraticCurveTo(legBendX, (topLegY + 2) * 0.45, 0, 2);
    ctx.stroke();

    ctx.strokeStyle = limbCol;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(topLegX, topLegY);
    ctx.quadraticCurveTo(legBendX, (topLegY + 2) * 0.45, 0, 2);
    ctx.stroke();

    // Rotate the boot itself at the ankle (0, 2) so it dangles and swings freely in the air!
    ctx.translate(0, 2);
    ctx.rotate(angle);
    ctx.translate(0, -2);

    // Pivot around the back heel (-4.5, 7.5) when tapping the foot in idle!
    if (Math.abs(toeTapAngle) > 0.001) {
      ctx.translate(-4.5, 7.5);
      ctx.rotate(toeTapAngle);
      ctx.translate(4.5, -7.5);
    }

    // Red Boot Shaft & Rounded Toe (thinner outline)
    const toeExt = 5 + toeProfile * 4.5;
    ctx.fillStyle = bootRed;
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(-4.8, -1);
    ctx.lineTo(4.2, -1);
    ctx.lineTo(4.5, 3);
    ctx.quadraticCurveTo(toeExt + 2, 3.5, toeExt + 1.5, 7.8);
    ctx.lineTo(-5.2, 7.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top Boot Cuff Rim
    ctx.fillStyle = bootRed;
    ctx.beginPath();
    ctx.roundRect(-5.6, -2.5, 10.6, 3.2, 1.5);
    ctx.fill();
    ctx.stroke();

    // Darker Red Sole & Heel Line
    ctx.fillStyle = bootShadow;
    ctx.fillRect(-4.8, 5.8, toeExt + 5.5, 2);

    // Subtle white highlight on boot toe
    ctx.fillStyle = 'rgba(255, 225, 215, 0.55)';
    ctx.beginPath();
    ctx.ellipse(toeExt - 1.5, 4.8, 2.2, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawForegroundLiquidAndFrame(cameraX, time, liquidY) {
    const ctx = this.ctx;
    const blend = this.getBiomeBlend(cameraX);

    // 1. Swirling Creamy Milk Rapids & Curling Wave Crests (Reference Image 1 foreground!)
    const topWaveColor = this.lerpColor('#fffaf0', '#f59e0b', blend);
    const midLiquidColor = this.lerpColor('#f5d0a9', '#b45309', blend);
    const deepLiquidColor = this.lerpColor('#8c421e', '#3b1505', blend);

    const liqGrad = ctx.createLinearGradient(0, liquidY - 22, 0, this.height);
    liqGrad.addColorStop(0, topWaveColor);
    liqGrad.addColorStop(0.42, midLiquidColor);
    liqGrad.addColorStop(1, deepLiquidColor);

    ctx.save();
    ctx.fillStyle = liqGrad;
    ctx.strokeStyle = '#3b1704';
    ctx.lineWidth = 3.2;

    ctx.beginPath();
    ctx.moveTo(-20, this.height);
    for (let x = -20; x <= this.width + 40; x += 24) {
      const wx = x + cameraX;
      const wave = Math.sin(wx * 0.016 + time * 3.4) * 10 + Math.cos(wx * 0.032 - time * 2.2) * 5;
      ctx.lineTo(x, liquidY + wave);
    }
    ctx.lineTo(this.width + 40, this.height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sculpted Curling Milk Wave Crests & Splash Droplets (Reference Image 1 left & right wave curls!)
    const curlSpacing = 340;
    const firstCurl = Math.floor(cameraX / curlSpacing) - 1;
    const lastCurl = firstCurl + Math.ceil(this.width / curlSpacing) + 3;

    for (let ci = firstCurl; ci <= lastCurl; ci++) {
      const wx = ci * curlSpacing + Math.sin(time * 1.5 + ci) * 18;
      const sx = wx - cameraX;
      const waveY = liquidY + Math.sin(wx * 0.016 + time * 3.4) * 8;
      const dir = ci % 2 === 0 ? 1 : -1;

      ctx.save();
      ctx.translate(sx, waveY);
      ctx.scale(dir, 1);

      ctx.fillStyle = topWaveColor;
      ctx.strokeStyle = '#3b1704';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-45, 12);
      ctx.bezierCurveTo(-20, -8, 10, -34, 34, -26);
      ctx.bezierCurveTo(48, -20, 42, 2, 24, 4);
      ctx.bezierCurveTo(14, 5, 8, -8, 18, -12);
      ctx.quadraticCurveTo(-2, -2, -12, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Splash droplets around the curling crest
      ctx.fillStyle = topWaveColor;
      ctx.beginPath();
      ctx.arc(46, -24, 4.5, 0, Math.PI * 2);
      ctx.arc(56, -12, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Caramel ribbon eddies flowing through the milk river
    ctx.strokeStyle = blend < 0.5 ? 'rgba(217, 155, 102, 0.65)' : 'rgba(254, 240, 138, 0.55)';
    ctx.lineWidth = 3.2;
    for (let i = 0; i < 9; i++) {
      const sx = (((i * 210 - cameraX * 0.85) % (this.width + 180)) + (this.width + 180)) % (this.width + 180) - 90;
      const sy = liquidY + 24 + (i % 2) * 14 + Math.sin(time * 3 + i) * 4;
      ctx.beginPath();
      ctx.moveTo(sx - 38, sy);
      ctx.bezierCurveTo(sx - 12, sy - 9, sx + 12, sy + 9, sx + 38, sy - 3);
      ctx.stroke();
    }

    // 2. Ornate Carved Coffee-Bean Side Pillars & Corner Latte-Art Cups (Reference Image 1 Frame Borders!)
    this.drawOrnateFrameBorders();

    ctx.restore();
  }

  drawOrnateFrameBorders() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const pillarW = 24;

    ctx.save();
    // Left & Right Carved Coffee-Bean Pillars
    const drawPillar = (x, isRight) => {
      const grad = ctx.createLinearGradient(x, 0, x + pillarW, 0);
      grad.addColorStop(0, isRight ? '#7c4322' : '#331608');
      grad.addColorStop(0.5, '#5c2e14');
      grad.addColorStop(1, isRight ? '#331608' : '#7c4322');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#1f0b03';
      ctx.lineWidth = 3;
      ctx.fillRect(x, 0, pillarW, h);
      ctx.strokeRect(x, 0, pillarW, h);

      // Carved coffee beans stacked vertically inside the border pillar
      for (let by = 28; by < h - 20; by += 34) {
        ctx.save();
        ctx.translate(x + pillarW / 2, by);
        ctx.rotate((by % 68 === 0 ? 1 : -1) * 0.25);
        ctx.fillStyle = '#47210c';
        ctx.strokeStyle = '#240e04';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.quadraticCurveTo(2.5, 0, 0, 8);
        ctx.stroke();
        ctx.restore();
      }
    };

    drawPillar(0, false);
    drawPillar(w - pillarW, true);

    // Corner Latte Art & Roasted Bean Medallions (Bottom-Right, Top-Right, Bottom-Left just like Reference Image 1!)
    this.drawCornerLatteCup(w - 8, h - 6, 52, true);
    this.drawCornerLatteCup(w - 6, 4, 44, true);
    this.drawCornerLatteCup(10, h - 4, 48, false);

    ctx.restore();
  }

  drawCornerLatteCup(x, y, radius, hasRosetta) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Ceramic Rim
    ctx.fillStyle = '#fff6e8';
    ctx.strokeStyle = '#2d1306';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner Crema Pool
    ctx.fillStyle = '#c87d4b';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.84, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (hasRosetta) {
      // Creamy Heart / Rosetta Latte Art Leaves (Reference Image 1 bottom-right & top-right corners!)
      ctx.fillStyle = '#fff8eb';
      for (let i = -2; i <= 2; i++) {
        ctx.save();
        ctx.rotate(i * 0.35 - 0.6);
        ctx.beginPath();
        ctx.ellipse(0, -radius * 0.28, radius * 0.22, radius * 0.11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(-radius * 0.15, -radius * 0.15, radius * 0.18, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Bottom-left emblem with central coffee bean (Reference Image 1 bottom-left corner!)
      ctx.fillStyle = '#e7cfb4';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#6f3618';
      ctx.strokeStyle = '#2d1306';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(-6, -6, 13, 17, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // =========================================================================
  // BLACK GLOCK 16mm, WEAPON PICKUPS, BEAN PROJECTILES & PINK GOO SPLATS
  // =========================================================================

  drawBlackGlock16mm(ctx, x, y, isShooting, recoilProg, time = 0) {
    ctx.save();
    ctx.translate(x, y);

    // Stance angle: level when shooting, tilted slightly up when ready
    ctx.rotate(isShooting ? -0.06 : -0.22);

    const slideKick = isShooting ? recoilProg * 5.0 : 0;
    const outlineCol = '#090a0c';

    // 1. Tactical Matte Black Polymer Lower Frame & Textured Grip
    ctx.fillStyle = '#181a1f';
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(3.5, 0);
    ctx.lineTo(2.5, 12);
    ctx.quadraticCurveTo(-1.5, 13.5, -5.5, 11.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ergonomic grip stippling & finger groove
    ctx.fillStyle = '#262931';
    ctx.fillRect(-3, 3, 4.5, 2);
    ctx.fillRect(-3.5, 6.5, 4.5, 2);

    // Magazine baseplate bumper
    ctx.fillStyle = '#111215';
    ctx.beginPath();
    ctx.roundRect(-6, 11, 9.5, 2.5, 1);
    ctx.fill();
    ctx.stroke();

    // Squared Glock Trigger Guard
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(3, 2);
    ctx.lineTo(7.2, 2);
    ctx.lineTo(7.2, 7.5);
    ctx.lineTo(1, 7.5);
    ctx.stroke();

    // Silver Steel Trigger
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(4.2, 3);
    ctx.quadraticCurveTo(5, 5, 3.5, 6.5);
    ctx.stroke();

    // Frame accessory rail under the barrel
    ctx.fillStyle = '#1a1c22';
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.3;
    ctx.fillRect(5, -1, 15, 3.2);
    ctx.strokeRect(5, -1, 15, 3.2);

    // 2. Silver Barrel Crown & Exposed Breach (revealed during slide blowback)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(8, -6.5, 7, 5);
    ctx.fillStyle = '#334155';
    ctx.fillRect(20, -6, 5, 4.2);

    // Ejected Brass Shell Casing flying out when firing!
    if (isShooting && recoilProg > 0.08) {
      const casingX = 11 - recoilProg * 14;
      const casingY = -12 - recoilProg * 16;
      ctx.save();
      ctx.translate(casingX, casingY);
      ctx.rotate(recoilProg * 8.5);
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 1;
      ctx.fillRect(-2, -3.5, 4, 7);
      ctx.strokeRect(-2, -3.5, 4, 7);
      // Tiny smoke wisp from ejection port
      ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
      ctx.beginPath();
      ctx.arc(0, -6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Angular Matte Black Glock Slide with Blowback Recoil Kick
    ctx.save();
    ctx.translate(-slideKick, 0);

    // Deep matte black slide body
    const slideGrad = ctx.createLinearGradient(0, -7.5, 0, -2);
    slideGrad.addColorStop(0, '#262930');
    slideGrad.addColorStop(0.35, '#16171a');
    slideGrad.addColorStop(1, '#0e0f12');

    ctx.fillStyle = slideGrad;
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.roundRect(-4.5, -7.5, 28, 6.5, 1);
    ctx.fill();
    ctx.stroke();

    // Top bevel highlight line
    ctx.strokeStyle = '#474c58';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-3, -6.5);
    ctx.lineTo(22, -6.5);
    ctx.stroke();

    // Rear slide cocking serrations (3 distinct vertical cut lines)
    ctx.strokeStyle = '#090a0d';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-1.5, -6.5);
    ctx.lineTo(-1.5, -2);
    ctx.moveTo(1, -6.5);
    ctx.lineTo(1, -2);
    ctx.moveTo(3.5, -6.5);
    ctx.lineTo(3.5, -2);
    ctx.stroke();

    // White 3-Dot Combat Sights
    // Rear Sight Notch with 2 white dots
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(-3.8, -9.2, 3.2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3.4, -8.8, 1, 1);
    ctx.fillRect(-1.8, -8.8, 1, 1);

    // Front Sight Post with 1 white dot
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(20, -9.0, 2.2, 1.8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20.5, -8.6, 1.2, 1.2);

    ctx.restore(); // end slide blowback

    // 4. Awesome Looking Tactical Muzzle Flash!
    if (isShooting && recoilProg > 0.05) {
      const flashAlpha = Math.min(1, recoilProg * 1.6);
      const flashScale = 0.95 + recoilProg * 1.1;
      const muzzleX = 26 - slideKick * 0.2;
      const muzzleY = -4.5;

      ctx.save();
      ctx.translate(muzzleX, muzzleY);
      ctx.scale(flashScale, flashScale);

      // Expanding fiery plasma shockwave ring
      ctx.strokeStyle = `rgba(244, 63, 94, ${flashAlpha * 0.75})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(3, 0, 11 + (1 - recoilProg) * 7, 0, Math.PI * 2);
      ctx.stroke();

      // Outer vivid fiery pink-orange flame petals
      ctx.fillStyle = `rgba(251, 113, 133, ${flashAlpha * 0.88})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(16, -10);
      ctx.lineTo(32, 0);
      ctx.lineTo(16, 10);
      ctx.closePath();
      ctx.fill();

      // Multi-pointed incandescent tactical starburst
      this.drawFourPointSparkle(8, 0, 24, `rgba(253, 224, 71, ${flashAlpha})`);
      ctx.save();
      ctx.rotate(Math.PI / 4);
      this.drawFourPointSparkle(6, 0, 17, `rgba(249, 115, 22, ${flashAlpha * 0.9})`);
      ctx.restore();

      // Blazing white-hot core
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.beginPath();
      ctx.ellipse(4, 0, 6.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Muzzle spark embers flying forward
      const sparkColors = ['#fde047', '#fb7185', '#ffffff'];
      for (let s = 0; s < 5; s++) {
        const sx = 18 + s * 5;
        const sy = (Math.sin(s * 2.3) * 8);
        ctx.fillStyle = sparkColors[s % sparkColors.length];
        ctx.beginPath();
        ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // =========================================================================
  // GOLDEN DESERT EAGLE .50 (Heavy polished gold hand-cannon, single slug)
  // =========================================================================

  drawGoldenDesertEagle50(ctx, x, y, isShooting, recoilProg, time = 0) {
    ctx.save();
    ctx.translate(x, y);

    // Stance angle: level when shooting, tilted slightly up when ready
    ctx.rotate(isShooting ? -0.05 : -0.2);

    const slideKick = isShooting ? recoilProg * 7.5 : 0;
    const outlineCol = '#451a03';

    // 1. Heavy Polished Gold Lower Frame & Trigger Guard
    const goldGrad = ctx.createLinearGradient(0, -8, 0, 14);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.35, '#eab308');
    goldGrad.addColorStop(0.7, '#ca8a04');
    goldGrad.addColorStop(1, '#854d0e');

    ctx.fillStyle = goldGrad;
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.7;
    ctx.lineJoin = 'round';

    // Massive Magnum Frame
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    ctx.lineTo(3.5, 14);
    ctx.quadraticCurveTo(-1.5, 15.5, -7, 13.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Textured Matte Black Combat Grip Panel with Gold Emblem
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.roundRect(-4.5, 2, 6.5, 10, 2);
    ctx.fill();

    // Golden Coffee Bean Emblem embossed on grip
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(-1.2, 7, 1.8, 2.6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Squared Heavy Desert Eagle Trigger Guard
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(4, 2);
    ctx.lineTo(9.5, 2);
    ctx.lineTo(9.5, 9);
    ctx.lineTo(2, 9);
    ctx.stroke();

    // Gold Skeletonized Trigger
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(5.5, 3);
    ctx.quadraticCurveTo(6.8, 5.5, 4.5, 7.8);
    ctx.stroke();

    // Lower Picatinny Accessory Rail
    ctx.fillStyle = '#a16207';
    ctx.fillRect(6, -1, 19, 3.5);
    ctx.strokeRect(6, -1, 19, 3.5);

    // 2. Heavy Titanium Gold Slide with Blowback Recoil Kick
    ctx.save();
    ctx.translate(-slideKick, 0);

    // Massive Triangular Desert Eagle Slide
    const slideGrad = ctx.createLinearGradient(0, -10, 0, -2);
    slideGrad.addColorStop(0, '#fffbeb');
    slideGrad.addColorStop(0.25, '#fde047');
    slideGrad.addColorStop(0.65, '#eab308');
    slideGrad.addColorStop(1, '#92400e');

    ctx.fillStyle = slideGrad;
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(-5.5, -9.5, 34, 8, 1.5);
    ctx.fill();
    ctx.stroke();

    // Top Picatinny Rail Grooves on Slide
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.2;
    for (let rx = 2; rx < 22; rx += 3.8) {
      ctx.beginPath();
      ctx.moveTo(rx, -9.5);
      ctx.lineTo(rx, -7.5);
      ctx.stroke();
    }

    // Rear Cocking Serrations
    for (let sx = -3.5; sx <= 0; sx += 1.8) {
      ctx.beginPath();
      ctx.moveTo(sx, -7.5);
      ctx.lineTo(sx, -2);
      ctx.stroke();
    }

    // Dual-Port Compensator Muzzle Brake (cuts at the top of the barrel)
    ctx.fillStyle = '#451a03';
    ctx.fillRect(21, -9.5, 2.5, 3);
    ctx.fillRect(25, -9.5, 2.5, 3);

    // Front & Rear Combat Sights
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4.5, -11.5, 3, 2.2);
    ctx.fillRect(26.5, -11.5, 2.4, 2.2);

    ctx.restore(); // end slide blowback

    // Ejected Massive .50 AE Brass Casing
    if (isShooting && recoilProg > 0.08) {
      const casingX = 14 - recoilProg * 18;
      const casingY = -14 - recoilProg * 20;
      ctx.save();
      ctx.translate(casingX, casingY);
      ctx.rotate(recoilProg * 10);
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.1;
      ctx.fillRect(-3, -4.5, 6, 9);
      ctx.strokeRect(-3, -4.5, 6, 9);
      ctx.restore();
    }

    // 3. EPIC DUAL-PORT COMPENSATOR FLAME JETS + MASSIVE MUZZLE BLAST!
    if (isShooting && recoilProg > 0.04) {
      const flashAlpha = Math.min(1, recoilProg * 1.8);
      const muzzleX = 32 - slideKick * 0.2;
      const muzzleY = -5.5;

      ctx.save();

      // Top dual compensator gas jets erupting upwards!
      ctx.fillStyle = `rgba(253, 224, 71, ${flashAlpha * 0.9})`;
      ctx.beginPath();
      ctx.moveTo(21, -9.5);
      ctx.lineTo(22, -22);
      ctx.lineTo(24, -9.5);
      ctx.moveTo(25, -9.5);
      ctx.lineTo(26, -24);
      ctx.lineTo(28, -9.5);
      ctx.fill();

      // Massive Blinding Forward Fireball & 8-Point Starburst
      ctx.translate(muzzleX, muzzleY);
      const flashScale = 1.25 + recoilProg * 1.35;
      ctx.scale(flashScale, flashScale);

      // Outer golden flame shockwave
      ctx.strokeStyle = `rgba(245, 158, 11, ${flashAlpha * 0.8})`;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(4, 0, 16 + (1 - recoilProg) * 10, 0, Math.PI * 2);
      ctx.stroke();

      // Incandescent gold/white multi-point starburst
      this.drawFourPointSparkle(10, 0, 34, `rgba(254, 240, 138, ${flashAlpha})`);
      ctx.save();
      ctx.rotate(Math.PI / 4);
      this.drawFourPointSparkle(8, 0, 26, `rgba(245, 158, 11, ${flashAlpha * 0.9})`);
      ctx.restore();

      // Blazing white-hot plasma core
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.beginPath();
      ctx.ellipse(6, 0, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  // =========================================================================
  // SUPA SPLAT GUN (Retro-futuristic chunky neon splat blaster with glowing fluid tank)
  // =========================================================================

  drawSupaSplatGun(ctx, x, y, isShooting, recoilProg, time = 0) {
    ctx.save();
    ctx.translate(x, y);

    // Stance angle
    ctx.rotate(isShooting ? -0.04 : -0.16);

    const kick = isShooting ? recoilProg * 7.5 : 0;
    const pumpKick = isShooting ? recoilProg * 5.0 : 0;

    // 1. Chunky Ergonomic Grip (Dark Matte Slate with grips)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-4, 13);
    ctx.lineTo(4, 13);
    ctx.lineTo(5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Grip texture ribs
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.2;
    for (let gy = 3; gy <= 10; gy += 3.5) {
      ctx.beginPath();
      ctx.moveTo(-1, gy);
      ctx.lineTo(3.5, gy);
      ctx.stroke();
    }

    // Trigger Guard & Neon Trigger
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(3, 4, 4.5, -Math.PI * 0.4, Math.PI * 0.5);
    ctx.stroke();

    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(2.5, 2.5, 2.2, 3.5);

    // 2. Main Receiver Body (Vibrant Neon Cyan Chassis)
    ctx.save();
    ctx.translate(-kick * 0.35, 0);

    const bodyGrad = ctx.createLinearGradient(0, -9, 0, 4);
    bodyGrad.addColorStop(0, '#22d3ee');
    bodyGrad.addColorStop(0.5, '#06b6d4');
    bodyGrad.addColorStop(1, '#0891b2');

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = '#083344';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.roundRect(-3, -8, 26, 11, 4);
    ctx.fill();
    ctx.stroke();

    // Neon Magenta Racing Accent Stripe
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(0, -2, 21, 2.8);

    // Pressure Gauge on the side of the chassis
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(6, -2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pressure needle
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(6, -2);
    ctx.lineTo(6 + Math.cos(time * 6) * 2.4, -2 + Math.sin(time * 6) * 2.4);
    ctx.stroke();

    // 3. Translucent Glass Slime Fluid Reservoir on top!
    const tankX = 2;
    const tankY = -16;
    const tankW = 16;
    const tankH = 8.5;

    // Glass Tank Outer
    ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(tankX, tankY, tankW, tankH, 4);
    ctx.fill();
    ctx.stroke();

    // Glowing Neon Magenta Espresso Slime inside reservoir
    const slimeGrad = ctx.createLinearGradient(0, tankY + 2, 0, tankY + tankH);
    slimeGrad.addColorStop(0, '#f472b6');
    slimeGrad.addColorStop(0.6, '#ec4899');
    slimeGrad.addColorStop(1, '#be185d');

    const sloshW = Math.sin(time * 8) * 1.5;
    ctx.fillStyle = slimeGrad;
    ctx.beginPath();
    ctx.moveTo(tankX + 1.5, tankY + 3 + sloshW);
    ctx.quadraticCurveTo(tankX + tankW * 0.5, tankY + 2 - sloshW, tankX + tankW - 1.5, tankY + 3);
    ctx.lineTo(tankX + tankW - 1.5, tankY + tankH - 1.5);
    ctx.lineTo(tankX + 1.5, tankY + tankH - 1.5);
    ctx.closePath();
    ctx.fill();

    // Slime bubbles inside tank
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(tankX + 5, tankY + 5, 1.1, 0, Math.PI * 2);
    ctx.arc(tankX + 11, tankY + 4, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Brass Tank End-Caps with Rivets
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.1;
    ctx.fillRect(tankX - 2, tankY - 0.5, 2.5, tankH + 1);
    ctx.strokeRect(tankX - 2, tankY - 0.5, 2.5, tankH + 1);
    ctx.fillRect(tankX + tankW - 0.5, tankY - 0.5, 2.5, tankH + 1);
    ctx.strokeRect(tankX + tankW - 0.5, tankY - 0.5, 2.5, tankH + 1);

    // 4. Heavy Ribbed Barrel & Chunky Nozzle
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#083344';
    ctx.lineWidth = 1.6;
    ctx.fillRect(23, -6.5, 8, 8);
    ctx.strokeRect(23, -6.5, 8, 8);

    // Chunky Muzzle Bell with Glowing Magenta Drip Ring
    ctx.fillStyle = '#f43f5e';
    ctx.strokeStyle = '#881337';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(30, -8, 5, 11, 2.5);
    ctx.fill();
    ctx.stroke();

    // Glowing Aperture Core
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(33.5, -5, 2, 5);

    // 5. Under-Barrel Pneumatic Pump Slide Handle
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(11 - pumpKick, 2, 12, 4.5, 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // end body translate

    // 6. JUICY NEON SPLAT MUZZLE FLASH!
    if (isShooting && recoilProg > 0.04) {
      const flashAlpha = Math.min(1, recoilProg * 1.9);
      const muzzleX = 35 - kick * 0.35;
      const muzzleY = -2.5;

      ctx.save();
      ctx.translate(muzzleX, muzzleY);
      const flashScale = 1.2 + recoilProg * 1.2;
      ctx.scale(flashScale, flashScale);

      // Expanding neon pink splash shockwave
      ctx.strokeStyle = `rgba(244, 63, 94, ${flashAlpha * 0.85})`;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(3, 0, 14 + (1 - recoilProg) * 8, 0, Math.PI * 2);
      ctx.stroke();

      // Radiant comic splat starburst
      this.drawFourPointSparkle(8, 0, 32, `rgba(244, 63, 94, ${flashAlpha})`);
      ctx.save();
      ctx.rotate(Math.PI / 4);
      this.drawFourPointSparkle(6, 0, 24, `rgba(6, 182, 212, ${flashAlpha * 0.9})`);
      ctx.restore();

      // Glowing white/pink plasma core
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.beginPath();
      ctx.ellipse(4, 0, 8, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Splat slime droplets bursting forward
      const dropletColors = ['#ec4899', '#f43f5e', '#38bdf8', '#ffffff'];
      for (let s = 0; s < 5; s++) {
        const sx = 12 + s * 4;
        const sy = Math.sin(s * 2.1) * 7;
        ctx.fillStyle = dropletColors[s % dropletColors.length];
        ctx.beginPath();
        ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  drawJetpackPickupVisual(ctx, time) {
    // Twin polished brass canisters with steam valve caps and nozzles
    const canW = 12;
    const canH = 28;
    const offsets = [-7, 7];

    offsets.forEach((cx) => {
      ctx.save();
      ctx.translate(cx, 0);

      const canGrad = ctx.createLinearGradient(-canW / 2, 0, canW / 2, 0);
      canGrad.addColorStop(0, '#78350f');
      canGrad.addColorStop(0.3, '#d97706');
      canGrad.addColorStop(0.6, '#fef08a');
      canGrad.addColorStop(0.85, '#b45309');
      canGrad.addColorStop(1, '#451a03');

      ctx.fillStyle = canGrad;
      ctx.strokeStyle = '#291105';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-canW / 2, -canH / 2, canW, canH, 5);
      ctx.fill();
      ctx.stroke();

      // Top Dome Cap
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -canH / 2, canW * 0.45, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Exhaust Nozzle
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(-canW * 0.45, canH / 2);
      ctx.lineTo(-canW * 0.6, canH / 2 + 6);
      ctx.lineTo(canW * 0.6, canH / 2 + 6);
      ctx.lineTo(canW * 0.45, canH / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Idling steam puffs
      const puff = Math.sin(time * 6 + cx) * 2;
      ctx.fillStyle = 'rgba(254, 243, 199, 0.7)';
      ctx.beginPath();
      ctx.arc(0, canH / 2 + 9 + puff, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Central Brass Boiler & Dial
    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#291105';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(-6, -8, 12, 16, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(time * 3) * 3.8, Math.sin(time * 3) * 3.8);
    ctx.stroke();
  }

  drawJetpackOnPlayer(ctx, player, sideMix, time) {
    if (!player.hasJetpack) return;

    ctx.save();
    // Position on the back of the cup (negative X is back)
    const packX = -18 - sideMix * 4;
    const packY = -2;

    ctx.translate(packX, packY);

    // Rocket Exhaust Flames (when active)
    if (player.jetpackActive || (player.jetpackPower || 0) > 0.05) {
      const pwr = player.jetpackPower || 1;
      const flicker = 0.85 + Math.sin(time * 38) * 0.15;
      const flameLen = (28 + Math.sin(time * 48) * 6) * pwr * flicker;
      const flameW = (7 + Math.cos(time * 32) * 1.5) * pwr;

      // Draw dual flames (one for each nozzle)
      const nozzleOffsets = [-5, 5];
      for (const nx of nozzleOffsets) {
        ctx.save();
        ctx.translate(nx, 16);

        // Radiant thrust light bloom
        const bloom = ctx.createRadialGradient(0, flameLen * 0.3, 2, 0, flameLen * 0.5, flameLen * 1.2);
        bloom.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
        bloom.addColorStop(0.4, 'rgba(249, 115, 22, 0.35)');
        bloom.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.ellipse(0, flameLen * 0.4, flameW * 2.2, flameLen * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Outer crimson/orange flame plume
        const flameGrad = ctx.createLinearGradient(0, 0, 0, flameLen);
        flameGrad.addColorStop(0, '#ffffff');
        flameGrad.addColorStop(0.2, '#fef08a');
        flameGrad.addColorStop(0.55, '#f97316');
        flameGrad.addColorStop(0.85, '#dc2626');
        flameGrad.addColorStop(1, 'rgba(124, 45, 18, 0)');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(-flameW * 0.5, 0);
        ctx.quadraticCurveTo(-flameW * 0.8, flameLen * 0.45, 0, flameLen);
        ctx.quadraticCurveTo(flameW * 0.8, flameLen * 0.45, flameW * 0.5, 0);
        ctx.closePath();
        ctx.fill();

        // Inner piercing white-hot core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-flameW * 0.25, 0);
        ctx.quadraticCurveTo(-flameW * 0.35, flameLen * 0.3, 0, flameLen * 0.55);
        ctx.quadraticCurveTo(flameW * 0.35, flameLen * 0.3, flameW * 0.25, 0);
        ctx.closePath();
        ctx.fill();

        // Shock diamonds (supersonic steam jet rings)
        ctx.fillStyle = 'rgba(254, 249, 195, 0.9)';
        for (let sd = 0; sd < 3; sd++) {
          const sy = flameLen * (0.2 + sd * 0.24);
          ctx.beginPath();
          ctx.ellipse(0, sy, flameW * 0.32, 1.8, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Dual Polished Brass Espresso Canisters
    const canisterWidth = 9;
    const canisterHeight = 22;
    const canisterOffsets = [-5, 5];

    canisterOffsets.forEach((cx) => {
      ctx.save();
      ctx.translate(cx, 0);

      // Main cylinder body gradient (burnished brass & polished gold)
      const canGrad = ctx.createLinearGradient(-canisterWidth / 2, 0, canisterWidth / 2, 0);
      canGrad.addColorStop(0, '#78350f');
      canGrad.addColorStop(0.25, '#d97706');
      canGrad.addColorStop(0.55, '#fef08a');
      canGrad.addColorStop(0.85, '#b45309');
      canGrad.addColorStop(1, '#451a03');

      ctx.fillStyle = canGrad;
      ctx.strokeStyle = '#291105';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(-canisterWidth / 2, -canisterHeight / 2, canisterWidth, canisterHeight, 4);
      ctx.fill();
      ctx.stroke();

      // Top pressure valve cap (spherical brass dome)
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -canisterHeight / 2, canisterWidth * 0.45, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Lower exhaust bell nozzle
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(-canisterWidth * 0.45, canisterHeight / 2);
      ctx.lineTo(-canisterWidth * 0.55, canisterHeight / 2 + 5);
      ctx.lineTo(canisterWidth * 0.55, canisterHeight / 2 + 5);
      ctx.lineTo(canisterWidth * 0.45, canisterHeight / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    });

    // Central Steam Boiler Manifold & Mini Pressure Dial
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#291105';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(-5, -6, 10, 12, 2.5);
    ctx.fill();
    ctx.stroke();

    // Round Brass Pressure Gauge Dial
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dial needle
    const fuelAngle = -Math.PI * 0.6 + ((player.jetpackFuel || 100) / 100) * (Math.PI * 1.2);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(fuelAngle) * 3.2, Math.sin(fuelAngle) * 3.2);
    ctx.stroke();

    ctx.restore();
  }

  drawJetpackHarness(ctx, player, sideMix) {
    if (!player.hasJetpack) return;
    ctx.save();

    // 2 outer vertical backpack-style shoulder straps that frame the cup flanks,
    // completely clear of his eyes, eyebrows, rosy cheeks, and mouth!
    const strapColor = '#451a03';
    const highlightColor = '#78350f';
    const buckleColor = '#facc15';
    const buckleBorder = '#291105';

    // 1. Far/Left Shoulder Strap (hugs the left outer contour of the cup)
    const leftTopX = -17 - sideMix * 2;
    const leftBotX = -19 - sideMix * 2;

    ctx.strokeStyle = strapColor;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(leftTopX, -13);
    ctx.quadraticCurveTo(leftTopX - 3, 0, leftBotX, 11);
    ctx.stroke();

    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(leftTopX, -13);
    ctx.quadraticCurveTo(leftTopX - 3, 0, leftBotX, 11);
    ctx.stroke();

    // Left lower brass adjustment buckle (near waist/hip, below face)
    ctx.fillStyle = buckleColor;
    ctx.strokeStyle = buckleBorder;
    ctx.lineWidth = 1.1;
    ctx.fillRect(leftBotX - 2.5, 5, 5, 4.5);
    ctx.strokeRect(leftBotX - 2.5, 5, 5, 4.5);

    // 2. Near/Right Shoulder Strap (hugs the right outer contour, only when visible in angle)
    if (sideMix < 0.82) {
      const rightTopX = 14 - sideMix * 5;
      const rightBotX = 16 - sideMix * 5;

      ctx.strokeStyle = strapColor;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rightTopX, -13);
      ctx.quadraticCurveTo(rightTopX + 2, 0, rightBotX, 11);
      ctx.stroke();

      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(rightTopX, -13);
      ctx.quadraticCurveTo(rightTopX + 2, 0, rightBotX, 11);
      ctx.stroke();

      // Right lower brass adjustment buckle (near waist/hip, below face)
      ctx.fillStyle = buckleColor;
      ctx.strokeStyle = buckleBorder;
      ctx.lineWidth = 1.1;
      ctx.fillRect(rightBotX - 2.5, 5, 5, 4.5);
      ctx.strokeRect(rightBotX - 2.5, 5, 5, 4.5);
    }

    ctx.restore();
  }

  drawWeaponPickup(pickup, cameraX, time) {
    if (pickup.collected) return;
    const sx = pickup.x - cameraX;
    if (sx < -90 || sx > this.width + 90) return;

    const ctx = this.ctx;
    const bob = Math.sin(time * 3.8 + pickup.x * 0.01) * 6;
    const tilt = Math.sin(time * 2.2) * 0.12;

    ctx.save();
    ctx.translate(sx, pickup.y + bob);

    const isSupaSplat = pickup.type === 'supa_splat';
    const isDeagle = pickup.type === 'golden_deagle';
    const isJetpack = pickup.type === 'thruster_jetpack';

    // Radiant collectible aura
    const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, 36);
    if (isJetpack) {
      aura.addColorStop(0, 'rgba(56, 189, 248, 0.88)');
      aura.addColorStop(0.55, 'rgba(250, 204, 21, 0.45)');
      aura.addColorStop(1, 'rgba(56, 189, 248, 0)');
    } else if (isSupaSplat) {
      aura.addColorStop(0, 'rgba(236, 72, 153, 0.92)');
      aura.addColorStop(0.55, 'rgba(6, 182, 212, 0.55)');
      aura.addColorStop(1, 'rgba(236, 72, 153, 0)');
    } else if (isDeagle) {
      aura.addColorStop(0, 'rgba(250, 204, 21, 0.85)');
      aura.addColorStop(0.55, 'rgba(245, 158, 11, 0.45)');
      aura.addColorStop(1, 'rgba(250, 204, 21, 0)');
    } else {
      aura.addColorStop(0, 'rgba(244, 114, 182, 0.75)');
      aura.addColorStop(0.55, 'rgba(251, 191, 36, 0.35)');
      aura.addColorStop(1, 'rgba(244, 114, 182, 0)');
    }
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();

    // Rotating 4-point golden sparkles
    ctx.save();
    ctx.rotate(time * 1.4);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      this.drawFourPointSparkle(0, -24, 6, isJetpack ? '#38bdf8' : isSupaSplat ? '#f472b6' : isDeagle ? '#fef08a' : '#fde047');
    }
    ctx.restore();

    // Floating 3D Gun or Jetpack Display
    ctx.save();
    ctx.rotate(tilt);
    ctx.scale(1.35, 1.35);
    if (isJetpack) {
      this.drawJetpackPickupVisual(ctx, time);
    } else if (isSupaSplat) {
      this.drawSupaSplatGun(ctx, -10, 0, false, 0, time);
    } else if (isDeagle) {
      this.drawGoldenDesertEagle50(ctx, -10, 0, false, 0, time);
    } else {
      this.drawBlackGlock16mm(ctx, -10, 0, false, 0);
    }
    ctx.restore();

    // Floating Label Pill
    ctx.fillStyle = 'rgba(17, 18, 22, 0.94)';
    ctx.strokeStyle = isJetpack ? '#38bdf8' : isSupaSplat ? '#ec4899' : isDeagle ? '#facc15' : '#f472b6';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    const labelText = isJetpack ? '★ STEAM TURBO JETPACK ★' : isSupaSplat ? '💥 SUPA SPLAT GUN 💥' : isDeagle ? '★ GOLDEN DESERT EAGLE .50 ★' : '★ BLACK GLOCK 16mm ★';
    const pillW = isJetpack ? 170 : isSupaSplat ? 154 : isDeagle ? 176 : 132;
    ctx.roundRect(-pillW / 2, -38, pillW, 20, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isJetpack ? '#7dd3fc' : isSupaSplat ? '#fbcfe8' : isDeagle ? '#fef08a' : '#fde047';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labelText, 0, -24);

    ctx.restore();
  }

  drawBeanProjectile(proj, cameraX, time) {
    const sx = proj.x - cameraX;
    if (sx < -35 || sx > this.width + 35) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.translate(sx, proj.y);

    const dir = Math.sign(proj.vx) || 1;
    const isSupaSplat = Boolean(proj.isSupaSplat);
    const isDeagle = Boolean(proj.isDeagleSlug);

    if (isSupaSplat) {
      // High-velocity glowing neon magenta/cyan splat slug!
      const streakGrad = ctx.createLinearGradient(0, 0, -dir * 44, 0);
      streakGrad.addColorStop(0, 'rgba(244, 63, 94, 0.95)');
      streakGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.7)');
      streakGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = streakGrad;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, 9);
      ctx.lineTo(-dir * 44, 0);
      ctx.closePath();
      ctx.fill();

      // Slime droplet lobes
      const slimeGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 12);
      slimeGrad.addColorStop(0, '#fbcfe8');
      slimeGrad.addColorStop(0.4, '#f43f5e');
      slimeGrad.addColorStop(1, '#9d174d');

      ctx.fillStyle = slimeGrad;
      ctx.strokeStyle = '#881337';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Trailing splat globules
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(-dir * 9, 3, 3.2, 0, Math.PI * 2);
      ctx.arc(-dir * 16, -2, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Specular shine catchlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(3, -2.5, 3.2, 1.8, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (isDeagle) {
      // Supercharged Golden Magnum Energy Streak & Shockwave Ring
      const streakGrad = ctx.createLinearGradient(0, 0, -dir * 46, 0);
      streakGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      streakGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.7)');
      streakGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = streakGrad;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, 9);
      ctx.lineTo(-dir * 46, 0);
      ctx.closePath();
      ctx.fill();

      // Outer golden supersonic shockwave halo
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.75)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(-dir * 8, 0, 8, 14, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Rotate heavy gilded slug
      ctx.rotate(proj.rot || 0);

      // Heavy Gilded Golden Coffee Bean Slug
      const slugGrad = ctx.createLinearGradient(-9, -11, 9, 11);
      slugGrad.addColorStop(0, '#fffbeb');
      slugGrad.addColorStop(0.35, '#fde047');
      slugGrad.addColorStop(0.7, '#ca8a04');
      slugGrad.addColorStop(1, '#78350f');

      ctx.fillStyle = slugGrad;
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Center gold crease
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-1, -9.5);
      ctx.bezierCurveTo(-4, -2.5, 4, 2.5, 1, 9.5);
      ctx.stroke();

      // Specular shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-3.5, -4, 2.5, 4.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Golden & pink energy comet streak behind the flying bean
      const streakGrad = ctx.createLinearGradient(0, 0, -dir * 32, 0);
      streakGrad.addColorStop(0, 'rgba(244, 114, 182, 0.85)');
      streakGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.65)');
      streakGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
      ctx.fillStyle = streakGrad;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 6);
      ctx.lineTo(-dir * 32, 0);
      ctx.closePath();
      ctx.fill();

      // Rotate the 3D roasted coffee bean
      ctx.rotate(proj.rot || 0);

      // Roasted Coffee Bean Body
      const beanGrad = ctx.createLinearGradient(-7, -8, 7, 8);
      beanGrad.addColorStop(0, '#9A4824');
      beanGrad.addColorStop(0.5, '#683018');
      beanGrad.addColorStop(1, '#3B170B');

      ctx.fillStyle = beanGrad;
      ctx.strokeStyle = '#240C04';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(0, 0, 7.8, 10.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // S-curve center crease
      ctx.strokeStyle = '#1D0A03';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-1, -7.5);
      ctx.bezierCurveTo(-3.5, -2, 3.5, 2, 1, 7.5);
      ctx.stroke();

      // Glossy catchlight shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.ellipse(-2.8, -3.2, 1.8, 3.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawPinkGooSplats(splats, cameraX) {
    if (!splats || splats.length === 0) return;
    const ctx = this.ctx;

    for (const splat of splats) {
      const sx = splat.x - cameraX;
      if (sx < -50 || sx > this.width + 50) continue;

      const alpha = Math.min(1, splat.life / 1.5);
      ctx.save();
      ctx.translate(sx, splat.y);
      ctx.globalAlpha = alpha;

      // Glossy pink puddle
      ctx.fillStyle = splat.color || '#ec4899';
      ctx.strokeStyle = '#be185d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, splat.rx, splat.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Dripping blobs hanging over platform edge
      ctx.beginPath();
      ctx.arc(-splat.rx * 0.45, splat.ry * 0.7, splat.ry * 0.6, 0, Math.PI * 2);
      ctx.arc(splat.rx * 0.4, splat.ry * 0.8, splat.ry * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight gleam on the puddle surface
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.ellipse(-splat.rx * 0.28, -splat.ry * 0.25, splat.rx * 0.35, splat.ry * 0.35, -0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  drawDyingEnemy(de, cameraX, time) {
    const sx = de.x - cameraX;
    if (sx < -100 || sx > this.width + 100) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.translate(sx, de.y);

    // Violent shaking trembling from internal cartoon pressure!
    const shakeX = (Math.random() - 0.5) * 8;
    const shakeY = (Math.random() - 0.5) * 8;
    ctx.translate(shakeX, shakeY);

    ctx.scale(de.facing, 1);
    ctx.rotate(de.tiltAngle || 0);
    ctx.scale(de.scaleX, de.scaleY);

    // Zero-cost cartoon pink pressure outline (NO blur, NO filter for 60 FPS!)
    const dummyEnemy = {
      type: de.type,
      x: 0,
      y: 0,
      vx: de.facing,
      hp: 0,
      dead: false,
      animPhase: time * 20,
      hitFlashTimer: 0.1,
      aggro: false,
      scaleX: 1,
      scaleY: 1,
      tiltAngle: 0
    };

    // Draw the swelling cartoon body natively
    this.drawEnemy(dummyEnemy, 0, time);

    // Overlay giant cartoon knock-out "X X" eyes on top!
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 3.6;
    ctx.lineCap = 'round';

    const drawXEye = (ex, ey) => {
      ctx.beginPath();
      ctx.moveTo(ex - 5, ey - 5);
      ctx.lineTo(ex + 5, ey + 5);
      ctx.moveTo(ex + 5, ey - 5);
      ctx.lineTo(ex - 5, ey + 5);
      ctx.stroke();
    };

    drawXEye(2, -4);
    drawXEye(13, -5);

    // Sweating comic droplets
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.arc(-14, -18, 3.2, 0, Math.PI * 2);
    ctx.arc(18, -16, 2.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawPinkGooParticles(particles, splatBursts, cameraX) {
    const ctx = this.ctx;

    // 1. Splat shockwave rings
    if (splatBursts) {
      for (const sb of splatBursts) {
        const sx = sb.x - cameraX;
        if (sx < -100 || sx > this.width + 100) continue;
        const alpha = Math.min(1, sb.life / sb.maxLife);
        ctx.save();
        ctx.translate(sx, sb.y);
        ctx.strokeStyle = `rgba(236, 72, 153, ${alpha * 0.9})`;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(0, 0, sb.currentR || sb.r, 0, Math.PI * 2);
        ctx.stroke();

        // Radiating star spikes
        ctx.strokeStyle = `rgba(251, 207, 232, ${alpha * 0.75})`;
        ctx.lineWidth = 2.2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const r1 = (sb.currentR || sb.r) * 0.85;
          const r2 = (sb.currentR || sb.r) * 1.35;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
          ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 2. Glossy pink goo droplets & flying globules
    if (particles) {
      for (const pt of particles) {
        const sx = pt.x - cameraX;
        if (sx < -40 || sx > this.width + 40) continue;
        const alpha = Math.max(0, Math.min(1, pt.life / (pt.maxLife * 0.5)));

        ctx.save();
        ctx.translate(sx, pt.y);
        ctx.globalAlpha = alpha;

        // Stretch along velocity vector
        const speed = Math.hypot(pt.vx, pt.vy);
        const angle = Math.atan2(pt.vy, pt.vx);
        ctx.rotate(angle);

        const stretch = Math.min(2.4, 1 + speed / 280);
        ctx.fillStyle = pt.color;
        ctx.strokeStyle = '#9d174d';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.ellipse(0, 0, pt.r * stretch, pt.r * (2 - stretch * 0.5), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Specular highlight catchlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(pt.r * stretch * 0.3, -pt.r * 0.3, Math.max(1, pt.r * 0.32), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }
  }
}
