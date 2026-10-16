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
    this.stars = Array.from({ length: 85 }, (_, i) => ({
      x: (i * 173.7) % 1400,
      y: (i * 89.3) % 360,
      r: 0.8 + (i % 3) * 0.9,
      phase: i * 0.7
    }));
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
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

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, this.lerpColor('#192544', '#581c4f', blend));
    skyGrad.addColorStop(0.45, this.lerpColor('#345278', '#c85250', blend));
    skyGrad.addColorStop(0.82, this.lerpColor('#7696ab', '#f6aa54', blend));
    skyGrad.addColorStop(1, this.lerpColor('#c5b299', '#fbd87f', blend));

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Twinkling stars (strong in Zone 1, subtle dusk sparkles in Zone 2)
    const starAlpha = 1 - blend * 0.65;
    ctx.save();
    this.stars.forEach((s) => {
      const sx = ((s.x - cameraX * 0.08) % this.width + this.width) % this.width;
      const twinkle = 0.45 + 0.55 * Math.sin(time * 2.8 + s.phase);
      ctx.fillStyle = `rgba(255, 250, 225, ${twinkle * starAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      if (s.r > 2 && twinkle > 0.8) {
        ctx.strokeStyle = `rgba(255, 245, 200, ${0.4 * starAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx - 5, s.y);
        ctx.lineTo(sx + 5, s.y);
        ctx.moveTo(sx, s.y - 5);
        ctx.lineTo(sx, s.y + 5);
        ctx.stroke();
      }
    });
    ctx.restore();

    // Swirled Latte-Art & Night Clouds (Image 1 & Image 2)
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const cx = (((i * 340 - cameraX * 0.14) % (this.width + 320)) + (this.width + 320)) % (this.width + 320) - 160;
      const cy = 75 + (i % 3) * 48 + Math.sin(time * 0.6 + i) * 6;
      this.drawLatteCloud(cx, cy, 85 + (i % 2) * 25, blend, time + i);
    }
    ctx.restore();
  }

  drawLatteCloud(x, y, size, blend, phase) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Outer cloud puff
    ctx.fillStyle = blend < 0.5
      ? `rgba(145, 175, 205, ${0.22 * (1 - blend) + 0.12})`
      : `rgba(252, 185, 130, ${0.32 * blend})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.36, 0, 0, Math.PI * 2);
    ctx.ellipse(-size * 0.45, 6, size * 0.55, size * 0.25, 0, 0, Math.PI * 2);
    ctx.ellipse(size * 0.48, 8, size * 0.5, size * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Latte Rosetta / Heart swirl inside cloud (from Image 2 sky!)
    if (blend > 0.15) {
      ctx.strokeStyle = `rgba(255, 238, 210, ${0.38 * blend})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let t = 0; t < Math.PI * 3.5; t += 0.2) {
        const r = (t / (Math.PI * 3.5)) * (size * 0.42);
        const px = Math.cos(t + phase * 0.2) * r * 1.4;
        const py = Math.sin(t + phase * 0.2) * r * 0.55;
        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawParallaxBackground(cameraX, time) {
    const ctx = this.ctx;
    const blend = this.getBiomeBlend(cameraX);

    // Far Layer: Giant Espresso Machines, Vintage Burr Grinders, and Roastery Silhouettes (from both images!)
    ctx.save();
    const machinePositions = [
      { worldX: 320, type: 'espresso_machine' },
      { worldX: 980, type: 'burr_grinder' },
      { worldX: 1580, type: 'french_press' },
      { worldX: 2220, type: 'espresso_machine' },
      { worldX: 2890, type: 'burr_grinder' },
      { worldX: 3650, type: 'vintage_mill' },
      { worldX: 4520, type: 'espresso_machine' },
      { worldX: 5380, type: 'vintage_mill' },
      { worldX: 6250, type: 'burr_grinder' }
    ];

    machinePositions.forEach((m) => {
      const screenX = m.worldX - cameraX * 0.42;
      if (screenX < -260 || screenX > this.width + 260) return;
      this.drawDistantCoffeeMonument(screenX, 395, m.type, blend, time);
    });
    ctx.restore();

    // Mid-Layer Rolling Coffee Bean Hills
    ctx.save();
    const hillColorBack = this.lerpColor('#4a2c1d', '#5c2c23', blend);
    const hillColorFront = this.lerpColor('#633921', '#783926', blend);

    // Back hills
    ctx.fillStyle = hillColorBack;
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    for (let x = 0; x <= this.width + 40; x += 40) {
      const worldX = x + cameraX * 0.35;
      const y = 415 + Math.sin(worldX * 0.0032) * 58 + Math.cos(worldX * 0.007) * 24;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();

    // Foreground roasted bean hills with embedded bean textures
    ctx.fillStyle = hillColorFront;
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    for (let x = 0; x <= this.width + 40; x += 40) {
      const worldX = x + cameraX * 0.55;
      const y = 465 + Math.sin(worldX * 0.0045 + 1.2) * 48 + Math.cos(worldX * 0.009) * 18;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();

    // Golden Leaf Magical Coffee Plants (Zone 1 Image 1 left side) & Glowing Coffee Cherry Trees (Zone 2 Image 2)
    const floraWorldX = [140, 620, 1380, 1920, 2720, 3450, 4180, 5120, 5890, 6680];
    floraWorldX.forEach((wx, idx) => {
      const sx = wx - cameraX * 0.75;
      if (sx < -200 || sx > this.width + 200) return;
      if (wx < 3250) {
        this.drawGoldenCoffeePlant(sx, 475, time, idx);
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

    const silhouetteFill = this.lerpColor('#526e8a', '#8c5347', blend);
    const highlightFill = this.lerpColor('#7695b3', '#b8765c', blend);
    const trimColor = this.lerpColor('#394f66', '#61352d', blend);

    ctx.fillStyle = silhouetteFill;
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 3;

    if (type === 'espresso_machine') {
      // Classic café espresso machine silhouette (from Image 1 left & Image 2 right)
      ctx.beginPath();
      ctx.roundRect(-58, -155, 116, 155, 14);
      ctx.fill();
      ctx.stroke();

      // Upper cup warmer crown
      ctx.fillStyle = highlightFill;
      ctx.beginPath();
      ctx.roundRect(-64, -172, 128, 24, 8);
      ctx.fill();
      ctx.stroke();

      // Pressure gauge dial
      ctx.fillStyle = '#fff5d6';
      ctx.beginPath();
      ctx.arc(0, -125, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Gauge needle
      ctx.strokeStyle = '#d946ef';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -125);
      ctx.lineTo(Math.cos(time * 2) * 10, -125 + Math.sin(time * 2) * 10);
      ctx.stroke();

      // Portafilter handle sticking out
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, -82);
      ctx.lineTo(68, -74);
      ctx.stroke();
    } else if (type === 'burr_grinder') {
      // Glass hopper burr grinder (from Image 1 right side)
      ctx.beginPath();
      ctx.roundRect(-38, -110, 76, 110, 8);
      ctx.fill();
      ctx.stroke();

      // Clear glass bean hopper on top
      ctx.fillStyle = 'rgba(220, 242, 255, 0.35)';
      ctx.beginPath();
      ctx.moveTo(-46, -185);
      ctx.lineTo(46, -185);
      ctx.lineTo(30, -110);
      ctx.lineTo(-30, -110);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Mound of beans inside hopper
      ctx.fillStyle = '#5c341d';
      ctx.beginPath();
      ctx.arc(0, -135, 28, Math.PI, 0);
      ctx.fill();
    } else {
      // Vintage hand-crank coffee mill (from Image 2 left background)
      ctx.beginPath();
      ctx.roundRect(-48, -105, 96, 105, 6);
      ctx.fill();
      ctx.stroke();

      // Bowl top
      ctx.fillStyle = highlightFill;
      ctx.beginPath();
      ctx.arc(0, -105, 44, Math.PI, 0, true);
      ctx.fill();
      ctx.stroke();

      // S-curved crank arm
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
    const sway = Math.sin(time * 1.8 + seed) * 0.06;
    ctx.rotate(sway);

    // Stem
    ctx.strokeStyle = '#85582a';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-12, -80, 4, -165);
    ctx.stroke();

    // Glowing golden leaves (Image 1 left foreground)
    const leaves = [
      { y: -45, dir: -1, scale: 1.0 },
      { y: -75, dir: 1, scale: 1.05 },
      { y: -110, dir: -1, scale: 0.9 },
      { y: -135, dir: 1, scale: 0.8 },
      { y: -165, dir: 0, scale: 0.75 }
    ];

    leaves.forEach((lf, i) => {
      ctx.save();
      ctx.translate(0, lf.y);
      ctx.rotate(lf.dir * 0.55 + Math.sin(time * 2.2 + i) * 0.05);
      ctx.scale(lf.scale, lf.scale);

      const grad = ctx.createLinearGradient(0, 0, 0, -48);
      grad.addColorStop(0, '#d97706');
      grad.addColorStop(0.5, '#fbbf24');
      grad.addColorStop(1, '#fef08a');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-22, -24, 0, -52);
      ctx.quadraticCurveTo(22, -24, 0, 0);
      ctx.fill();
      ctx.stroke();

      // Leaf center vein
      ctx.strokeStyle = '#fef9c3';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(0, -44);
      ctx.stroke();
      ctx.restore();
    });

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

      // Inner warm glow
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(ch.cx - 2, ch.cy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  drawPlatform(p, cameraX, time) {
    const sx = p.x - cameraX;
    if (sx + p.w < -80 || sx > this.width + 80) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.translate(sx, p.y);

    if (p.type === 'biscuit') {
      // Golden scalloped tea biscuit platform with cream filling (Image 1)
      // Roasted coffee beans supporting underneath
      ctx.fillStyle = '#4a2511';
      for (let bx = 18; bx < p.w - 14; bx += 36) {
        ctx.beginPath();
        ctx.ellipse(bx, p.h + 6, 18, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cream filling layer
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(6, p.h * 0.48, p.w - 12, p.h * 0.28);

      // Top & bottom biscuit wafers
      const biscuitGrad = ctx.createLinearGradient(0, 0, 0, p.h);
      biscuitGrad.addColorStop(0, '#f59e0b');
      biscuitGrad.addColorStop(0.5, '#d97706');
      biscuitGrad.addColorStop(1, '#b45309');

      ctx.fillStyle = biscuitGrad;
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(0, 0, p.w, p.h * 0.56, 10);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(2, p.h * 0.68, p.w - 4, p.h * 0.34, 8);
      ctx.fill();
      ctx.stroke();

      // Scalloped dock dots on top biscuit
      ctx.fillStyle = '#92400e';
      for (let dx = 18; dx < p.w - 12; dx += 22) {
        ctx.beginPath();
        ctx.arc(dx, p.h * 0.28, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p.type === 'mossy_bean') {
      // Giant Roasted Coffee Bean Boulder topped with lush green moss (Image 1 left centerpiece!)
      const beanGrad = ctx.createRadialGradient(p.w * 0.4, p.h * 0.35, 10, p.w * 0.5, p.h * 0.5, p.w * 0.65);
      beanGrad.addColorStop(0, '#7c3f1c');
      beanGrad.addColorStop(0.6, '#4d2611');
      beanGrad.addColorStop(1, '#291307');

      ctx.fillStyle = beanGrad;
      ctx.strokeStyle = '#1c0b03';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(p.w / 2, p.h / 2, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Coffee bean center crease
      ctx.strokeStyle = '#1f0d05';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(14, p.h * 0.52);
      ctx.bezierCurveTo(p.w * 0.35, p.h * 0.36, p.w * 0.65, p.h * 0.66, p.w - 14, p.h * 0.45);
      ctx.stroke();

      // Velvety green moss cap on top of the giant bean
      ctx.fillStyle = '#65a30d';
      ctx.strokeStyle = '#365314';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(16, p.h * 0.36);
      ctx.quadraticCurveTo(p.w * 0.5, -10, p.w - 16, p.h * 0.36);
      ctx.quadraticCurveTo(p.w * 0.75, p.h * 0.52, p.w * 0.5, p.h * 0.34);
      ctx.quadraticCurveTo(p.w * 0.25, p.h * 0.5, 16, p.h * 0.36);
      ctx.fill();
      ctx.stroke();
    } else if (p.type === 'sugar_cube') {
      // Sparkling Crystalline Sugar Cube (Image 1 & Image 2 floating stepping stones)
      const bob = Math.sin(time * 3.2 + p.x * 0.02) * 4;
      ctx.translate(0, bob);

      // Outer crystal glow
      ctx.shadowColor = 'rgba(186, 230, 253, 0.75)';
      ctx.shadowBlur = 14;

      // 3D isometric sugar cube faces
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(0, 6, p.w, p.h - 6, 8);
      ctx.fill();
      ctx.stroke();

      // Top perspective face
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(4, 6);
      ctx.lineTo(12, 0);
      ctx.lineTo(p.w - 4, 0);
      ctx.lineTo(p.w - 2, 6);
      ctx.closePath();
      ctx.fill();

      // Shimmering sugar crystals
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#bae6fd';
      for (let i = 0; i < 6; i++) {
        const cx = 10 + ((i * 17) % (p.w - 18));
        const cy = 14 + ((i * 13) % (p.h - 22));
        ctx.fillRect(cx, cy, 3, 3);
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

      // Toasted almond chunks inside biscotti cut face
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

      // Bottom cookie
      ctx.beginPath();
      ctx.roundRect(4, p.h * 0.52, p.w - 8, p.h * 0.42, 16);
      ctx.fill();
      ctx.stroke();

      // Chocolate cream middle
      ctx.fillStyle = '#3f1d0b';
      ctx.fillRect(10, p.h * 0.42, p.w - 20, p.h * 0.16);

      // Top cookie
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(0, 0, p.w, p.h * 0.48, 18);
      ctx.fill();
      ctx.stroke();

      // Glossy dark chocolate dip covering the left 45% of the cookie!
      ctx.fillStyle = '#3b180c';
      ctx.beginPath();
      ctx.roundRect(0, -1, p.w * 0.46, p.h * 0.92, [18, 6, 14, 16]);
      ctx.fill();
      ctx.stroke();

      // Chocolate shine + cookie dots
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

      // White royal icing piped along top edge
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
        // Golden Tamp Flagpost
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
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.75)';
      ctx.fillStyle = 'rgba(251, 207, 232, 0.18)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -4, 38 + Math.sin(time * 6) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.scale(player.facing, 1);

    // Dynamic squash & stretch + running tilt
    const tilt = player.vx * 0.00045;
    ctx.rotate(tilt);
    ctx.scale(player.scaleX, player.scaleY);

    // --- 1. Animated Legs & Red/Brown Boots (from Image 1 & Image 2) ---
    const runSwing = player.onGround
      ? Math.sin(player.animTime * 15) * Math.min(1, Math.abs(player.vx) / 180)
      : 0.55;

    this.drawCupBoot(-9 + runSwing * 11, 20 - Math.abs(runSwing) * 4, runSwing * 0.45);
    this.drawCupBoot(9 - runSwing * 11, 20 - Math.abs(runSwing) * 4, -runSwing * 0.45);

    // --- 2. Porcelain Cup Handle (Left side) ---
    ctx.strokeStyle = '#3b1d0e';
    ctx.fillStyle = '#fff8eb';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(-22, -2, 10, Math.PI * 0.45, Math.PI * 1.55);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3b1d0e';
    ctx.beginPath();
    ctx.arc(-21, -2, 4.5, Math.PI * 0.45, Math.PI * 1.55);
    ctx.stroke();

    // --- 3. Porcelain Coffee Cup Body ---
    const cupGrad = ctx.createLinearGradient(-22, -22, 22, 20);
    cupGrad.addColorStop(0, '#fffdf9');
    cupGrad.addColorStop(0.65, '#f5e6d3');
    cupGrad.addColorStop(1, '#dec3a4');

    ctx.fillStyle = cupGrad;
    ctx.strokeStyle = '#36190b';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(-23, -18);
    ctx.lineTo(23, -18);
    ctx.quadraticCurveTo(22, 18, 0, 20);
    ctx.quadraticCurveTo(-22, 18, -23, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // --- 4. Top Rim & Sloshing Rich Espresso Inside! (Signature detail in both images) ---
    ctx.fillStyle = '#e7d4bb';
    ctx.strokeStyle = '#36190b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -18, 23, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dynamic coffee splash wave on top of the cup
    const slosh = Math.sin(time * 9) * 3;
    ctx.fillStyle = '#5c280e';
    ctx.strokeStyle = '#290f02';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, -18, 19.5, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Jumping / Moving splash crown (just like Image 1 & 2!)
    if (!player.onGround || Math.abs(player.vx) > 90) {
      ctx.fillStyle = '#6f3212';
      ctx.beginPath();
      ctx.moveTo(-14, -19);
      ctx.quadraticCurveTo(-8, -32 + slosh, 2, -23);
      ctx.quadraticCurveTo(10, -29 - slosh, 15, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // --- 5. Expressive Kawaii Eyes, Rosy Cheeks & Happy Smile ---
    // Eyes
    ctx.fillStyle = '#1f120b';
    ctx.beginPath();
    ctx.ellipse(-6, -2, 3.2, 4.2, 0, 0, Math.PI * 2);
    ctx.ellipse(8, -2, 3.2, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-7, -3.5, 1.3, 0, Math.PI * 2);
    ctx.arc(7, -3.5, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-12, 3, 3.8, 2.2, 0, 0, Math.PI * 2);
    ctx.ellipse(13, 3, 3.8, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Happy open mouth
    ctx.fillStyle = '#991b1b';
    ctx.strokeStyle = '#1f120b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(1, 2, 4.2, 0.1, Math.PI - 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // --- 6. Front Arm & Silver Barista Spoon (Image 2!) ---
    ctx.save();
    const spoonUpgraded = unlockedPowerups.has('silver_spoon');
    const swingAngle = player.meleeTimer > 0
      ? Math.sin((1 - player.meleeTimer / 0.24) * Math.PI) * 1.9 - 0.6
      : Math.sin(time * 5) * 0.12;

    ctx.translate(18, 2);
    ctx.rotate(swingAngle);

    // Cute arm
    ctx.strokeStyle = '#36190b';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(11, -4);
    ctx.stroke();

    // Silver Barista Spoon held in hand
    ctx.fillStyle = spoonUpgraded ? '#fde047' : '#e2e8f0';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(9, -24, 3.8, 22, 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(11, -28, 6.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Melee slash arc visual
    if (player.meleeTimer > 0) {
      ctx.strokeStyle = spoonUpgraded ? 'rgba(250, 204, 21, 0.9)' : 'rgba(186, 230, 253, 0.85)';
      ctx.lineWidth = spoonUpgraded ? 9 : 6;
      ctx.beginPath();
      ctx.arc(0, 0, spoonUpgraded ? 48 : 34, -1.2, 1.1);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }

  drawCupBoot(x, y, angle) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Leg
    ctx.strokeStyle = '#36190b';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(0, 4);
    ctx.stroke();

    // Red/Caramel Boot (Image 1 red boots!)
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#36190b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-5, 2, 13, 8, 4);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawForegroundLiquidAndFrame(cameraX, time, liquidY) {
    const ctx = this.ctx;
    const blend = this.getBiomeBlend(cameraX);

    // Swirling Milk Rapids (Zone 1 Image 1) blending into Boiling Crema & Espresso Lake (Zone 2 Image 2)
    const topWaveColor = this.lerpColor('#fff7ed', '#f59e0b', blend);
    const midLiquidColor = this.lerpColor('#fed7aa', '#92400e', blend);
    const deepLiquidColor = this.lerpColor('#9a3412', '#3b1505', blend);

    const liqGrad = ctx.createLinearGradient(0, liquidY - 15, 0, this.height);
    liqGrad.addColorStop(0, topWaveColor);
    liqGrad.addColorStop(0.35, midLiquidColor);
    liqGrad.addColorStop(1, deepLiquidColor);

    ctx.save();
    ctx.fillStyle = liqGrad;
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.moveTo(0, this.height);
    for (let x = 0; x <= this.width + 30; x += 30) {
      const wx = x + cameraX;
      const wave = Math.sin(wx * 0.018 + time * 3.8) * 9 + Math.cos(wx * 0.035 - time * 2.4) * 5;
      ctx.lineTo(x, liquidY + wave);
    }
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Swirling crema eddies on surface (like Image 2 foreground!)
    ctx.strokeStyle = blend < 0.5 ? 'rgba(255, 255, 255, 0.65)' : 'rgba(254, 243, 199, 0.55)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 9; i++) {
      const sx = (((i * 210 - cameraX * 0.9) % (this.width + 180)) + (this.width + 180)) % (this.width + 180) - 90;
      const sy = liquidY + 26 + (i % 2) * 14 + Math.sin(time * 3 + i) * 4;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 34, 8, 0, 0, Math.PI * 1.65);
      ctx.stroke();
    }

    ctx.restore();
  }
}
