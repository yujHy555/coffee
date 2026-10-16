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
        this.drawFinishSanctuary(p.w * 0.55, 0, time);
      }
    }

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
    } else {
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

    // --- 1. Far/Left Arm (In IDLE: Hand on waist! In AIR: Dangles & trails with velocity! On GROUND: Waves/swings!) ---
    ctx.save();
    if (idleBlend > 0.5 && !isAction) {
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
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore(); // end cup body + face group
    ctx.restore(); // end hipShift group

    // --- 8. Near/Right Arm (In IDLE: Hand on waist! In AIR: Dangles loosely! When moving/attacking: swings or slashes!) ---
    ctx.save();
    const spoonUpgraded = unlockedPowerups.has('silver_spoon');
    if (idleBlend > 0.5 && !isAction && player.meleeTimer <= 0) {
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
        limbLagX
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
    limbLagX = 0
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
}
