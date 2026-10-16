// AAA Multi-Level Data for Coffee Platformer
// Level 1: Starry Espresso Hills & Sunset Biscotti Grove (Concept Art Images 1 & 2)
// Level 2: Neon Mocha Grotto & Frothy Caramel Caldera (New Biome, New Collectibles, Marshmallow Bouncers, Steam Vents, and Golden Desert Eagle .50)

export function createLevel1Data() {
  const platforms = [
    // --- ZONE 1: STARRY ESPRESSO HILLS ---
    { x: 40, y: 500, w: 360, h: 42, type: 'biscuit', zone: 1 },
    { x: 450, y: 420, w: 230, h: 130, type: 'mossy_bean', zone: 1 },
    { x: 160, y: 340, w: 170, h: 36, type: 'biscuit', zone: 1 },

    // Sugar Cube Arch #1 over the swirling milk river
    { x: 740, y: 390, w: 54, h: 54, type: 'sugar_cube', zone: 1 },
    { x: 815, y: 350, w: 54, h: 54, type: 'sugar_cube', zone: 1 },
    { x: 895, y: 330, w: 54, h: 54, type: 'sugar_cube', zone: 1 },
    { x: 975, y: 350, w: 54, h: 54, type: 'sugar_cube', zone: 1 },
    { x: 1050, y: 390, w: 54, h: 54, type: 'sugar_cube', zone: 1 },

    // Lower long biscuit promenade
    { x: 1080, y: 510, w: 580, h: 44, type: 'biscuit', zone: 1 },
    { x: 1480, y: 350, w: 250, h: 38, type: 'biscuit', zone: 1 },

    // Mid-zone Espresso Machine & Grinder overlook
    { x: 1760, y: 460, w: 220, h: 90, type: 'mossy_bean', zone: 1 },
    { x: 2040, y: 390, w: 180, h: 38, type: 'biscuit', zone: 1 },
    { x: 2280, y: 320, w: 190, h: 38, type: 'biscuit', zone: 1 },

    // High road for Product #2
    { x: 2520, y: 240, w: 240, h: 38, type: 'biscuit', zone: 1 },
    { x: 2440, y: 500, w: 540, h: 44, type: 'biscuit', zone: 1 },

    // Transition Sugar Bridge into Sunset Biscotti Grove
    { x: 3040, y: 450, w: 54, h: 54, type: 'sugar_cube', zone: 1 },
    { x: 3125, y: 410, w: 54, h: 54, type: 'sugar_cube', zone: 1 },
    { x: 3210, y: 380, w: 54, h: 54, type: 'sugar_cube', zone: 1 },

    // --- ZONE 2: SUNSET BISCOTTI GROVE ---
    { x: 3320, y: 470, w: 380, h: 65, type: 'gingerbread', zone: 2, isCheckpoint: true, checkpointName: 'Sunset Biscotti Grove' },
    { x: 3780, y: 505, w: 250, h: 56, type: 'biscotti', zone: 2 },
    { x: 4100, y: 430, w: 280, h: 62, type: 'biscotti', zone: 2 },
    { x: 4460, y: 395, w: 270, h: 64, type: 'choco_cookie', zone: 2 },
    { x: 4380, y: 215, w: 230, h: 48, type: 'choco_cookie', zone: 2 },

    // Ascending Sugar Cube steps toward Gingerbread Icing Cliff
    { x: 4790, y: 370, w: 52, h: 52, type: 'sugar_cube', zone: 2 },
    { x: 4875, y: 335, w: 52, h: 52, type: 'sugar_cube', zone: 2 },
    { x: 4960, y: 365, w: 52, h: 52, type: 'sugar_cube', zone: 2 },

    { x: 5050, y: 455, w: 560, h: 75, type: 'gingerbread', zone: 2, isCheckpoint: true, checkpointName: 'Gingerbread Icing Cliffs' },
    { x: 5690, y: 415, w: 230, h: 58, type: 'biscotti', zone: 2 },
    { x: 5990, y: 355, w: 250, h: 62, type: 'choco_cookie', zone: 2 },
    { x: 6290, y: 295, w: 220, h: 56, type: 'biscotti', zone: 2 },

    // Grand Barista Sanctuary Finish
    { x: 6570, y: 430, w: 620, h: 95, type: 'gingerbread', zone: 2, isFinish: true }
  ];

  const beans = [];
  const addArc = (centerX, baseY, width, height, count) => {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = centerX - width / 2 + t * width;
      const arcY = baseY - Math.sin(t * Math.PI) * height;
      beans.push({ x, y: arcY, collected: false, bobOffset: i * 0.6 });
    }
  };

  addArc(240, 440, 180, 45, 5);
  addArc(245, 285, 110, 25, 4);
  addArc(565, 345, 160, 55, 5);
  addArc(895, 255, 310, 70, 6);
  addArc(1320, 450, 260, 40, 6);
  addArc(1900, 340, 220, 65, 5);
  addArc(2360, 240, 200, 55, 5);
  addArc(2680, 440, 280, 45, 6);
  addArc(3125, 310, 210, 60, 5);
  addArc(3680, 400, 190, 75, 5);
  addArc(3950, 360, 200, 70, 5);
  addArc(4290, 325, 210, 65, 5);
  addArc(4620, 310, 190, 60, 5);
  addArc(4495, 150, 160, 35, 5);
  addArc(5320, 385, 280, 55, 7);
  addArc(5840, 320, 220, 65, 5);
  addArc(6140, 260, 220, 65, 5);
  addArc(6450, 225, 200, 65, 5);

  const enemies = [
    { id: 'e1', type: 'bean_grunt', x: 1220, y: 484, minX: 1100, maxX: 1420, vx: -78, hp: 2, maxHp: 2 },
    { id: 'e2', type: 'sugar_hopper', x: 1520, y: 484, minX: 1320, maxX: 1630, vx: -180, hp: 1, maxHp: 1 },
    { id: 'e3', type: 'steam_spirit', x: 2110, y: 350, baseY: 350, minX: 2020, maxX: 2240, vx: 75, hp: 1, maxHp: 1 },
    { id: 'e4', type: 'bean_grunt', x: 2620, y: 474, minX: 2470, maxX: 2760, vx: 85, hp: 2, maxHp: 2 },
    { id: 'e5', type: 'sugar_hopper', x: 2880, y: 474, minX: 2680, maxX: 2950, vx: -180, hp: 2, maxHp: 2 },
    { id: 'e6', type: 'sugar_hopper', x: 3560, y: 444, minX: 3380, maxX: 3660, vx: -180, hp: 2, maxHp: 2 },
    { id: 'e7', type: 'steam_spirit', x: 4220, y: 380, baseY: 380, minX: 4100, maxX: 4380, vx: 88, hp: 2, maxHp: 2 },
    { id: 'e8', type: 'sugar_hopper', x: 5180, y: 429, minX: 5080, maxX: 5360, vx: -180, hp: 2, maxHp: 2 },
    { id: 'e9', type: 'bean_grunt', x: 5450, y: 429, minX: 5300, maxX: 5580, vx: 92, hp: 2, maxHp: 2 },
    { id: 'e10', type: 'steam_spirit', x: 6110, y: 305, baseY: 305, minX: 5990, maxX: 6240, vx: -115, hp: 2, maxHp: 2 }
  ];

  const productNodes = [
    { productId: 'midnight-velvet-espresso', x: 1605, y: 290, collected: false },
    { productId: 'golden-arabica-elixir', x: 2640, y: 180, collected: false },
    { productId: 'artisan-silver-barista-spoon', x: 4495, y: 155, collected: false },
    { productId: 'sunset-biscotti-cold-brew', x: 5510, y: 395, collected: false }
  ];

  const weaponPickups = [
    {
      id: 'glock-16mm-starter',
      type: 'glock_16mm',
      name: 'Black Glock 16mm',
      x: 285,
      y: 452,
      collected: false
    },
    {
      id: 'glock-16mm-zone2',
      type: 'glock_16mm',
      name: 'Tactical Black Glock 16mm',
      x: 3460,
      y: 420,
      collected: false
    }
  ];

  return {
    levelIndex: 1,
    title: 'Level 1: Starry Espresso Hills',
    zone1Name: 'Starry Espresso Hills',
    zone2Name: 'Sunset Biscotti Grove',
    width: 7250,
    height: 640,
    liquidLevel: 575,
    platforms,
    beans,
    sugarGems: [],
    cacaoPods: [],
    enemies,
    productNodes,
    weaponPickups
  };
}

// =========================================================================
// LEVEL 2: NEON MOCHA GROTTO & CARAMEL CALDERA
// Features:
// - New Elements: Bouncy Marshmallow Trampoline Pads (extreme spring boost!),
//   Steam Vent Geysers, Amethyst Crystal Formations, Crispy Wafer Ledges.
// - New Collectibles: Sparkling Crystalline Sugar Gems (+250 pts, restores caffeine),
//   Roasted Cacao Pods (+500 pts, golden chocolate rush).
// - New Gun: Golden Desert Eagle .50 (heavy polished gold hand-cannon,
//   single high-velocity explosive slug, massive dual-port compensator blast).
// =========================================================================

export function createLevel2Data() {
  const platforms = [
    // --- ZONE 1: NEON MOCHA GROTTO ---
    // Starting Obsidian Basalt Shelf
    { x: 40, y: 500, w: 380, h: 44, type: 'obsidian_rock', zone: 1 },
    // Amethyst Sugar Crystal Spire
    { x: 460, y: 430, w: 220, h: 90, type: 'amethyst_crystal', zone: 1 },
    // High secret crystal terrace with first Sugar Gem
    { x: 180, y: 320, w: 190, h: 38, type: 'amethyst_crystal', zone: 1 },

    // Crispy Chocolate Wafer Bridge
    { x: 730, y: 390, w: 240, h: 42, type: 'wafer_ledge', zone: 1 },

    // NEW ELEMENT: Marshmallow Trampoline Pad #1! (Launches player sky-high to upper caverns)
    { x: 1020, y: 490, w: 145, h: 46, type: 'marshmallow_pad', zone: 1, bouncePower: 860 },

    // High secret crystal cavern accessible via Marshmallow Bounce
    { x: 1000, y: 220, w: 260, h: 40, type: 'amethyst_crystal', zone: 1 },

    // Obsidian promenade with steam vent elevator
    { x: 1240, y: 505, w: 580, h: 44, type: 'obsidian_rock', zone: 1 },

    // High Wafer catwalk with Product Node #1
    { x: 1520, y: 330, w: 260, h: 38, type: 'wafer_ledge', zone: 1 },

    // NEW ELEMENT: Rising Steam Vent Elevator
    { x: 1860, y: 510, w: 100, h: 36, type: 'steam_vent', zone: 1 },

    // NEW ELEMENT: Marshmallow Trampoline Pad #2 over the glowing mocha fissure
    { x: 2020, y: 495, w: 145, h: 46, type: 'marshmallow_pad', zone: 1, bouncePower: 870 },

    // High secret wafer ledge for Product Node #2
    { x: 2000, y: 225, w: 260, h: 38, type: 'wafer_ledge', zone: 1 },

    // Mid-cavern obsidian crags
    { x: 2280, y: 460, w: 240, h: 54, type: 'obsidian_rock', zone: 1 },
    { x: 2580, y: 390, w: 220, h: 40, type: 'wafer_ledge', zone: 1 },
    { x: 2860, y: 330, w: 230, h: 40, type: 'amethyst_crystal', zone: 1 },

    // Lower cavern path
    { x: 2540, y: 505, w: 520, h: 46, type: 'obsidian_rock', zone: 1 },

    // Transition crystal bridge steps
    { x: 3120, y: 420, w: 180, h: 44, type: 'amethyst_crystal', zone: 1 },

    // --- ZONE 2: FROTHY CARAMEL CALDERA ---
    // Checkpoint 1: Caldera Bastion Terrace
    { x: 3350, y: 470, w: 440, h: 70, type: 'obsidian_rock', zone: 2, isCheckpoint: true, checkpointName: 'Caramel Caldera Gate' },

    // Crispy Wafer Islands over the boiling caramel lake
    { x: 3880, y: 500, w: 270, h: 46, type: 'wafer_ledge', zone: 2 },
    { x: 4220, y: 435, w: 280, h: 46, type: 'wafer_ledge', zone: 2 },

    // NEW ELEMENT: Marshmallow Trampoline Pad #3 (Super spring up to Celestial Spire)
    { x: 4560, y: 490, w: 150, h: 46, type: 'marshmallow_pad', zone: 2, bouncePower: 880 },

    // High secret crystal haven with Product Node #3 & Cacao Pod
    { x: 4520, y: 195, w: 260, h: 40, type: 'amethyst_crystal', zone: 2 },

    // Caramel Caldera Central Crag
    { x: 4780, y: 420, w: 340, h: 62, type: 'obsidian_rock', zone: 2 },

    // Giant Amethyst Crystal Steps
    { x: 5180, y: 370, w: 190, h: 52, type: 'amethyst_crystal', zone: 2 },
    { x: 5440, y: 320, w: 210, h: 52, type: 'amethyst_crystal', zone: 2 },

    // Checkpoint 2: Celestial Observatory Ridge
    { x: 5720, y: 460, w: 500, h: 72, type: 'obsidian_rock', zone: 2, isCheckpoint: true, checkpointName: 'Observatory Ridge' },

    // NEW ELEMENT: Marshmallow Trampoline Pad #4 (Launches into final aerial gauntlet!)
    { x: 6280, y: 490, w: 150, h: 46, type: 'marshmallow_pad', zone: 2, bouncePower: 890 },

    // High floating wafer bridges over the vortex
    { x: 6250, y: 220, w: 240, h: 40, type: 'wafer_ledge', zone: 2 },
    { x: 6540, y: 270, w: 240, h: 40, type: 'wafer_ledge', zone: 2 },

    // Grand Celestial Espresso Observatory Finish Platform
    { x: 6840, y: 425, w: 620, h: 95, type: 'obsidian_rock', zone: 2, isFinish: true }
  ];

  // Golden beans arranged in sweeping arcs
  const beans = [];
  const addArc = (centerX, baseY, width, height, count) => {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = centerX - width / 2 + t * width;
      const arcY = baseY - Math.sin(t * Math.PI) * height;
      beans.push({ x, y: arcY, collected: false, bobOffset: i * 0.6 });
    }
  };

  addArc(240, 440, 180, 45, 5);
  addArc(570, 360, 180, 50, 5);
  addArc(850, 310, 200, 60, 5);
  addArc(1420, 440, 240, 45, 6);
  addArc(1650, 260, 200, 55, 5);
  addArc(2120, 420, 190, 60, 5);
  addArc(2400, 390, 210, 55, 5);
  addArc(2750, 430, 260, 45, 6);
  addArc(3210, 340, 190, 60, 5);
  addArc(3650, 400, 200, 65, 5);
  addArc(4020, 420, 220, 60, 5);
  addArc(4360, 360, 220, 65, 5);
  addArc(4950, 350, 220, 55, 5);
  addArc(5310, 290, 200, 60, 5);
  addArc(5960, 390, 260, 50, 6);
  addArc(6390, 170, 200, 50, 5);
  addArc(6680, 210, 200, 55, 5);

  // NEW COLLECTIBLE 1: Crystalline Sugar Gems (+250 points, restores caffeine, sparkling aura)
  const sugarGems = [
    { x: 270, y: 260, collected: false, bobOffset: 0.2 },
    { x: 1090, y: 160, collected: false, bobOffset: 1.1 },
    { x: 1140, y: 160, collected: false, bobOffset: 1.5 },
    { x: 1860, y: 350, collected: false, bobOffset: 2.2 },
    { x: 2130, y: 165, collected: false, bobOffset: 0.8 },
    { x: 2980, y: 260, collected: false, bobOffset: 1.9 },
    { x: 4010, y: 420, collected: false, bobOffset: 0.5 },
    { x: 4610, y: 135, collected: false, bobOffset: 2.7 },
    { x: 4670, y: 135, collected: false, bobOffset: 3.1 },
    { x: 5310, y: 240, collected: false, bobOffset: 1.4 },
    { x: 5570, y: 190, collected: false, bobOffset: 2.0 },
    { x: 6370, y: 120, collected: false, bobOffset: 0.9 },
    { x: 6430, y: 120, collected: false, bobOffset: 1.3 }
  ];

  // NEW COLLECTIBLE 2: Roasted Cacao Pods (+500 points, rich chocolate energy)
  const cacaoPods = [
    { x: 570, y: 290, collected: false, bobOffset: 0.4 },
    { x: 1650, y: 180, collected: false, bobOffset: 1.8 },
    { x: 2510, y: 170, collected: false, bobOffset: 2.6 },
    { x: 4570, y: 140, collected: false, bobOffset: 3.3 },
    { x: 6660, y: 180, collected: false, bobOffset: 1.2 }
  ];

  // Level 2 Enemies
  const enemies = [
    { id: 'l2_e1', type: 'sugar_hopper', x: 600, y: 400, minX: 470, maxX: 660, vx: 180, hp: 2, maxHp: 2 },
    { id: 'l2_e2', type: 'bean_grunt', x: 1420, y: 479, minX: 1260, maxX: 1560, vx: -88, hp: 2, maxHp: 2 },
    { id: 'l2_e3', type: 'steam_spirit', x: 1720, y: 340, baseY: 340, minX: 1600, maxX: 1840, vx: 80, hp: 2, maxHp: 2 },
    { id: 'l2_e4', type: 'sugar_hopper', x: 2460, y: 435, minX: 2320, maxX: 2510, vx: -180, hp: 2, maxHp: 2 },
    { id: 'l2_e5', type: 'bean_grunt', x: 2780, y: 479, minX: 2580, maxX: 2960, vx: 94, hp: 2, maxHp: 2 },
    { id: 'l2_e6', type: 'steam_spirit', x: 3000, y: 280, baseY: 280, minX: 2880, maxX: 3080, vx: -85, hp: 2, maxHp: 2 },
    // Zone 2 Caldera Enemies
    { id: 'l2_e7', type: 'sugar_hopper', x: 3620, y: 444, minX: 3420, maxX: 3720, vx: -180, hp: 2, maxHp: 2 },
    { id: 'l2_e8', type: 'bean_grunt', x: 4940, y: 394, minX: 4800, maxX: 5080, vx: 96, hp: 2, maxHp: 2 },
    { id: 'l2_e9', type: 'steam_spirit', x: 5320, y: 290, baseY: 290, minX: 5200, maxX: 5420, vx: 90, hp: 2, maxHp: 2 },
    { id: 'l2_e10', type: 'sugar_hopper', x: 5960, y: 434, minX: 5780, maxX: 6120, vx: 180, hp: 2, maxHp: 2 },
    { id: 'l2_e11', type: 'steam_spirit', x: 6420, y: 210, baseY: 210, minX: 6280, maxX: 6520, vx: -110, hp: 2, maxHp: 2 }
  ];

  // Collectible Mystery Product Crates / Pedestals in Level 2
  const productNodes = [
    { productId: 'midnight-velvet-espresso', x: 1650, y: 270, collected: false },
    { productId: 'golden-arabica-elixir', x: 2130, y: 170, collected: false },
    { productId: 'artisan-silver-barista-spoon', x: 4650, y: 140, collected: false },
    { productId: 'sunset-biscotti-cold-brew', x: 5980, y: 405, collected: false }
  ];

  // NEW GUN: Golden Desert Eagle .50 Pickups!
  // Placed right at the start of Level 2 and at the Zone 2 Caldera Checkpoint!
  const weaponPickups = [
    {
      id: 'golden-deagle-starter',
      type: 'golden_deagle',
      name: 'Golden Desert Eagle .50',
      x: 285,
      y: 452,
      collected: false
    },
    {
      id: 'golden-deagle-caldera',
      type: 'golden_deagle',
      name: 'Golden Desert Eagle .50',
      x: 3520,
      y: 420,
      collected: false
    }
  ];

  return {
    levelIndex: 2,
    title: 'Level 2: Neon Mocha Grotto & Caramel Caldera',
    zone1Name: 'Neon Mocha Grotto',
    zone2Name: 'Frothy Caramel Caldera',
    width: 7400,
    height: 640,
    liquidLevel: 580,
    platforms,
    beans,
    sugarGems,
    cacaoPods,
    enemies,
    productNodes,
    weaponPickups
  };
}

// Master Level Data factory
export function createLevelData(levelIndex = 1) {
  if (levelIndex === 2) {
    return createLevel2Data();
  }
  return createLevel1Data();
}
