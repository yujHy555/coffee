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
    if (sx < -80 || sx > this.width + 80) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.translate(sx, enemy.y);

    const walkCycle = Math.sin(time * 10 + enemy.x * 0.05);

    if (enemy.type === 'spiked_bean' || enemy.type === 'roast_stalker') {
      // Grumpy Roasted Bean Enemy (Image 1 Spiked Bean & Image 2 Stalker Bean)
      // Animated little legs
      ctx.strokeStyle = '#261005';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-9, 14);
      ctx.lineTo(-12 + walkCycle * 6, 26);
      ctx.moveTo(9, 14);
      ctx.lineTo(12 - walkCycle * 6, 26);
      ctx.stroke();

      // Bean body
      const grad = ctx.createRadialGradient(-5, -6, 4, 0, 0, 26);
      grad.addColorStop(0, '#854d27');
      grad.addColorStop(1, '#3b1c0a');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#1c0a02';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 21, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Metal spikes on head if spiked_bean (Image 1!)
      if (enemy.type === 'spiked_bean') {
        const spikeAngles = [-0.65, -0.25, 0.25, 0.65];
        spikeAngles.forEach((ang) => {
          ctx.save();
          ctx.rotate(ang);
          ctx.fillStyle = '#e2e8f0';
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-5, -21);
          ctx.lineTo(0, -34);
          ctx.lineTo(5, -21);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        });
      }

      // Angry white eyes & furrowed brow (Image 1)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-7, -2, 4.5, 0, Math.PI * 2);
      ctx.arc(7, -2, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-7, -1, 2.2, 0, Math.PI * 2);
      ctx.arc(7, -1, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Angry V-brow
      ctx.strokeStyle = '#1c0a02';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-14, -8);
      ctx.lineTo(-2, -3);
      ctx.moveTo(14, -8);
      ctx.lineTo(2, -3);
      ctx.stroke();
    } else if (enemy.type === 'donut_roller') {
      // Sprinting Glazed Ring Donut (Image 1 bottom right!)
      // Running legs
      ctx.strokeStyle = '#291306';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-6, 18);
      ctx.lineTo(-12 + walkCycle * 9, 27);
      ctx.moveTo(6, 18);
      ctx.lineTo(12 - walkCycle * 9, 27);
      ctx.stroke();

      ctx.rotate(Math.sin(time * 8) * 0.15);

      // Golden glazed torus
      const donutGrad = ctx.createRadialGradient(-4, -4, 5, 0, 0, 23);
      donutGrad.addColorStop(0, '#fcd34d');
      donutGrad.addColorStop(0.65, '#d97706');
      donutGrad.addColorStop(1, '#92400e');

      ctx.fillStyle = donutGrad;
      ctx.strokeStyle = '#3b1505';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 21, 0, Math.PI * 2);
      ctx.arc(0, 0, 7, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.stroke();

      // Cute eyes on top of the donut ring (Image 1!)
      ctx.fillStyle = '#1e1b18';
      ctx.beginPath();
      ctx.arc(-5, -12, 2.2, 0, Math.PI * 2);
      ctx.arc(5, -12, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.type === 'angry_sugar') {
      // Angry Sugar Cube Enemy (Image 2 left & right!)
      const hop = Math.abs(Math.sin(time * 6 + enemy.x)) * -8;
      ctx.translate(0, hop);

      // Little legs
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-8, 16);
      ctx.lineTo(-10 + walkCycle * 5, 26);
      ctx.moveTo(8, 16);
      ctx.lineTo(10 - walkCycle * 5, 26);
      ctx.stroke();

      // Sugar cube body
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-18, -18, 36, 34, 6);
      ctx.fill();
      ctx.stroke();

      // Scowling face (Image 2)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-6, -2, 2.6, 0, Math.PI * 2);
      ctx.arc(6, -2, 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.lineTo(-2, -4);
      ctx.moveTo(12, -8);
      ctx.lineTo(2, -4);
      ctx.moveTo(-5, 7);
      ctx.quadraticCurveTo(0, 3, 5, 7);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawPlayer(player, cameraX, time, unlockedPowerups) {
    const sx = player.x - cameraX;
    const sy = player.y;
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(sx, sy);

    // Invulnerability flash
    if (player.invulnTimer > 0 && Math.floor(time * 20) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }

    // Nitro Foam Shield Aura if unlocked
    if (unlockedPowerups.has('nitro_shield') && player.shieldActive) {
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.78)';
      ctx.fillStyle = 'rgba(251, 207, 232, 0.2)';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(0, -4, 40 + Math.sin(time * 6) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Smoothly blend between FRONT view (0) when idle and 3/4 SIDE profile (1) when running/attacking
    const speedRatio = Math.min(1, Math.abs(player.vx) / 140);
    const isAction = !player.onGround || player.meleeTimer > 0 || player.shotCooldown > 0.1;
    const sideMix = isAction ? Math.max(0.75, speedRatio) : speedRatio * 0.85;

    ctx.scale(player.facing, 1);

    // Dynamic squash & stretch + subtle forward run lean
    const tilt = player.vx * 0.00038 * player.facing;
    ctx.rotate(tilt);
    ctx.scale(player.scaleX, player.scaleY);

    // Character Sheet Palette Constants:
    // Outline: #432212 | Cream Body: #F5E3C8 | Shadow Cream: #DEC39D | Highlight: #FFF9EE
    // Coffee: #5A2E17 & #743C1F | Boot Red: #C63B33 | Cheek Coral: #F19483
    const outlineCol = '#432212';
    const limbCol = '#522915';

    // --- 1. Back Arm (Visible in FRONT & 3/4 view, swings opposite to front arm) ---
    const runSwing = player.onGround
      ? Math.sin(player.animTime * 15) * Math.min(1, Math.abs(player.vx) / 170)
      : -0.55;

    if (sideMix < 0.92) {
      ctx.save();
      const backArmX = -21 + sideMix * 10;
      ctx.translate(backArmX, 3);
      ctx.rotate(-runSwing * 0.45);
      this.drawProtagonistArm(ctx, -1, false, false, 0);
      ctx.restore();
    }

    // --- 2. Legs & Cuffed Red Boots (Exact match to Character Sheet!) ---
    const stride = runSwing * 10;
    const leftLegX = -8 + sideMix * 5 + stride;
    const rightLegX = 8 - sideMix * 3 - stride;

    // Far/Back Boot
    this.drawCupBoot(
      leftLegX,
      20 - Math.max(0, -runSwing) * 4,
      -runSwing * 0.38,
      0.25 + sideMix * 0.65
    );
    // Near/Front Boot
    this.drawCupBoot(
      rightLegX,
      21 - Math.max(0, runSwing) * 4,
      runSwing * 0.38,
      0.35 + sideMix * 0.65
    );

    // --- 3. Thick Rounded C-Handle on the Left (-X) Side (Matches FRONT & SIDE views) ---
    ctx.save();
    const handleOffsetX = -23 + sideMix * 1.5;
    ctx.translate(handleOffsetX, -2);

    // Outer C-handle loop
    ctx.fillStyle = '#E8CFB0';
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.arc(0, 0, 11.5, Math.PI * 0.42, Math.PI * 1.58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner C-handle cutout
    ctx.fillStyle = '#24314c'; // Dark interior shadow
    ctx.beginPath();
    ctx.arc(1, 0, 5.2, Math.PI * 0.48, Math.PI * 1.52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // --- 4. Wide Rounded Cream Porcelain Cup Body (Character Sheet Proportions) ---
    ctx.save();
    ctx.fillStyle = '#F5E3C8';
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';

    // Bowl path: wide top (-25 to +25), smoothly rounded teacup base
    ctx.beginPath();
    ctx.moveTo(-25, -16);
    ctx.lineTo(25, -16);
    ctx.bezierCurveTo(25, 11, 14, 19, 0, 19);
    ctx.bezierCurveTo(-15, 19, -25, 11, -25, -16);
    ctx.closePath();
    ctx.fill();

    // Clip inside the cup body to paint the warm shading & glossy highlight from the sheet
    ctx.save();
    ctx.clip();

    // Left & Bottom Crescent Shadow (#DEC39D)
    ctx.fillStyle = '#DEC39D';
    ctx.beginPath();
    ctx.moveTo(-26, -18);
    ctx.quadraticCurveTo(-18, 13, 22, 14);
    ctx.lineTo(26, 22);
    ctx.lineTo(-26, 22);
    ctx.closePath();
    ctx.fill();

    // Right Vertical Glossy Cream Highlight (#FFF9EE)
    ctx.fillStyle = 'rgba(255, 250, 240, 0.85)';
    ctx.beginPath();
    ctx.ellipse(18 - sideMix * 3, -2, 3.8, 11, 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Re-stroke outer cup contour cleanly over clipped shading
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-25, -16);
    ctx.lineTo(25, -16);
    ctx.bezierCurveTo(25, 11, 14, 19, 0, 19);
    ctx.bezierCurveTo(-15, 19, -25, 11, -25, -16);
    ctx.closePath();
    ctx.stroke();

    // --- 5. Thick Ceramic Top Rim & Concentric Rich Coffee Surface (Character Sheet Detail!) ---
    // Outer ceramic rim lip
    ctx.fillStyle = '#FFF6E8';
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 3.3;
    ctx.beginPath();
    ctx.ellipse(0, -16, 25, 7.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner rim shadow wall
    ctx.fillStyle = '#DFC4A2';
    ctx.beginPath();
    ctx.ellipse(0, -15.5, 21.5, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rich roast coffee pool with concentric crema rings
    const slosh = Math.sin(time * 9) * 2.4;
    ctx.fillStyle = '#5A2E17';
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, -15.2, 20.5, 4.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Lighter crema ring inside coffee surface (exact match to sheet)
    ctx.strokeStyle = '#7A4123';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, -15.2, 14.5, 2.7, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Dynamic coffee splash wave, flying droplets, and S-curved steam plume (Exact match to Reference Image 1!)
    ctx.save();
    const steamWiggle = Math.sin(time * 3.5) * 4;
    const steamGrad = ctx.createLinearGradient(0, -18, 0, -68);
    steamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    steamGrad.addColorStop(0.6, 'rgba(235, 245, 255, 0.25)');
    steamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = steamGrad;
    ctx.beginPath();
    ctx.moveTo(-4, -18);
    ctx.bezierCurveTo(-18 + steamWiggle, -34, 14 - steamWiggle, -48, -6 + steamWiggle, -68);
    ctx.bezierCurveTo(18 - steamWiggle, -50, -6 + steamWiggle, -34, 6, -18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (!player.onGround || Math.abs(player.vx) > 95) {
      // Sculpted Coffee Splash Crown on the trailing rim of the cup (Reference Image 1!)
      ctx.fillStyle = '#5A2E17';
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-19, -15.5);
      ctx.bezierCurveTo(-24, -28 + slosh, -12, -31, -6, -22);
      ctx.quadraticCurveTo(2, -28 - slosh, 11, -15.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Trailing airborne espresso droplets behind the cup (Reference Image 1!)
      const dropOffsets = [
        { dx: -27, dy: -24, r: 2.8 },
        { dx: -33, dy: -16, r: 2.1 },
        { dx: -28, dy: 14, r: 3.1 },
        { dx: -36, dy: 22, r: 2.3 }
      ];
      dropOffsets.forEach((d, idx) => {
        const bounce = Math.sin(time * 12 + idx) * 2;
        ctx.fillStyle = '#743C1F';
        ctx.strokeStyle = outlineCol;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(d.dx, d.dy + bounce, d.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    // --- 6. Character Sheet Face (Shifts smoothly from Center FRONT to Right Profile SIDE) ---
    const faceShiftX = sideMix * 10.5;
    ctx.save();
    ctx.translate(faceShiftX, 0);

    // Left Eye (Approaches right eye and foreshortens as cup turns to SIDE view)
    const leftEyeX = -9.5 + sideMix * 4.5;
    const leftEyeScaleX = 1 - sideMix * 0.35;
    ctx.fillStyle = outlineCol;
    ctx.beginPath();
    ctx.ellipse(leftEyeX, -1.5, 3.3 * leftEyeScaleX, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left Eye Upper-Right Catchlight (Matches sheet!)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(leftEyeX + 0.9 * leftEyeScaleX, -2.8, 1.25 * leftEyeScaleX, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye (Foreshortens slightly at extreme profile)
    const rightEyeX = 9.5 - sideMix * 1.5;
    const rightEyeScaleX = 1 - sideMix * 0.25;
    ctx.fillStyle = outlineCol;
    ctx.beginPath();
    ctx.ellipse(rightEyeX, -1.5, 3.3 * rightEyeScaleX, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye Catchlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(rightEyeX + 0.9 * rightEyeScaleX, -2.8, 1.25 * rightEyeScaleX, 0, Math.PI * 2);
    ctx.fill();

    // Warm Coral-Pink Oval Cheeks (#F19483)
    ctx.fillStyle = '#F19483';
    // Near cheek (prominent in both FRONT and SIDE view)
    ctx.beginPath();
    ctx.ellipse(leftEyeX - 3.5 * (1 - sideMix * 0.5), 3.8, 4.2, 2.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Far cheek (fades as it wraps around the right edge in SIDE view)
    if (sideMix < 0.75) {
      ctx.globalAlpha = (1 - sideMix / 0.75) * (player.invulnTimer > 0 ? 0.55 : 1);
      ctx.beginPath();
      ctx.ellipse(rightEyeX + 3.2, 3.8, 3.8, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = player.invulnTimer > 0 && Math.floor(time * 20) % 2 === 0 ? 0.55 : 1;
    }

    // Happy Bean-Shaped Open Smile with Coral Tongue (#432212 cavity + #F08070 tongue)
    const mouthX = sideMix * 3.2;
    ctx.save();
    ctx.translate(mouthX, 2.2);
    ctx.fillStyle = '#4A2112';
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(-3.8, -0.5);
    ctx.quadraticCurveTo(0, 0.8, 3.8, -0.5);
    ctx.bezierCurveTo(4.2, 5.2, -4.2, 5.2, -3.8, -0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pinkish-coral tongue inside lower mouth
    ctx.fillStyle = '#F08070';
    ctx.beginPath();
    ctx.ellipse(0, 2.5, 2.4, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore(); // end face group

    // --- 7. Foreground Arm (Swings at side in FRONT view, reaches forward in SIDE view, or slashes Silver Spoon!) ---
    ctx.save();
    const spoonUpgraded = unlockedPowerups.has('silver_spoon');
    const frontArmX = (1 - sideMix) * 21 + sideMix * -3;
    const frontArmY = 3.5;

    ctx.translate(frontArmX, frontArmY);
    this.drawProtagonistArm(
      ctx,
      1,
      sideMix > 0.45,
      player.meleeTimer > 0,
      player.meleeTimer,
      spoonUpgraded,
      runSwing * 0.4
    );
    ctx.restore();

    ctx.restore();
    ctx.restore();
  }

  drawProtagonistArm(ctx, dir, isSidePointing, isSlashing, meleeTimer, spoonUpgraded = false, walkSwing = 0) {
    const limbCol = '#522915';
    const outlineCol = '#3A1B0C';

    ctx.save();
    if (isSlashing) {
      // Dynamic Silver Barista Spoon Slash!
      const slashProgress = 1 - meleeTimer / 0.24;
      const swingAngle = Math.sin(slashProgress * Math.PI) * 2.1 - 0.75;
      ctx.rotate(swingAngle);

      ctx.strokeStyle = limbCol;
      ctx.lineWidth = 4.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(9, 2, 17, -2);
      ctx.stroke();

      // Silver or Golden Barista Spoon
      ctx.fillStyle = spoonUpgraded ? '#fde047' : '#e2e8f0';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.2;
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
      ctx.lineWidth = spoonUpgraded ? 9 : 6;
      ctx.beginPath();
      ctx.arc(0, 0, spoonUpgraded ? 48 : 35, -1.25, 1.15);
      ctx.stroke();
    } else if (isSidePointing) {
      // Exact SIDE View Arm from Character Sheet: reaches forward horizontally across body with cute pointing finger!
      ctx.rotate(walkSwing * 0.25);

      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 5.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(13, 4.5, 27, 1.5);
      ctx.stroke();

      ctx.strokeStyle = limbCol;
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(13, 4.5, 27, 1.5);
      ctx.stroke();

      // Cute pointing hand (thumb up + index finger forward)
      ctx.fillStyle = limbCol;
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(28, 1.2, 3.8, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pointing finger tip
      ctx.beginPath();
      ctx.roundRect(29, -1, 5.5, 2.8, 1.4);
      ctx.fill();
      ctx.stroke();
    } else {
      // Exact FRONT View Arm from Character Sheet: curved downward at side with cute 3-finger hand
      ctx.rotate(walkSwing);

      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 5.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(dir * 6, 7, dir * 5, 16);
      ctx.stroke();

      ctx.strokeStyle = limbCol;
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(dir * 6, 7, dir * 5, 16);
      ctx.stroke();

      // Cute 3-fingered dark-brown hand
      ctx.fillStyle = limbCol;
      ctx.strokeStyle = outlineCol;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(dir * 5, 17, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCupBoot(x, y, angle, toeProfile = 0.5) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const outlineCol = '#432212';
    const limbCol = '#522915';
    const bootRed = '#C63B33';
    const bootShadow = '#9E2A24';

    // Dark brown stick leg
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 5.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 2);
    ctx.stroke();

    ctx.strokeStyle = limbCol;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 2);
    ctx.stroke();

    // Red Boot Shaft & Rounded Toe (Matches Character Sheet Palette Icon!)
    const toeExt = 5 + toeProfile * 4.5;
    ctx.fillStyle = bootRed;
    ctx.strokeStyle = outlineCol;
    ctx.lineWidth = 2.6;
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

    // Top Boot Cuff Rim (as seen in FRONT/SIDE/BACK views)
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
