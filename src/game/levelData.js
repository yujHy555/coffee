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

// =============================================================================
// LEVEL 3: CLOUDTOP STRATOSPHERE & CELESTIAL STAR-ROAST ORBIT
// Features: Steam Turbo Jetpack, High-Altitude Flying, Floating Cinnamon Whipped
// Clouds, Steampunk Victorian Airship Decks, Flying Cinnamon Rings, Star Beans,
// Shimmering Celestial Cold Brew Orbs, and the Galactic Orbital Roastery Finish!
// =============================================================================
export function createLevel3Data() {
  const platforms = [
    // --- ZONE 1: CLOUDTOP CAPPUCCINO STRATOSPHERE ---
    // Starting Victorian Airship Launch Deck (features the Steam Turbo Jetpack pickup!)
    { x: 40, y: 480, w: 380, h: 56, type: 'airship_deck', zone: 1 },

    // Floating Cinnamon-Dusted Whipped Foam Cloud Platforms
    { x: 490, y: 410, w: 260, h: 48, type: 'cappuccino_cloud', zone: 1 },
    { x: 820, y: 290, w: 230, h: 46, type: 'cappuccino_cloud', zone: 1 },

    // Mid-air Victorian Brass Airship Barge #1
    { x: 1140, y: 420, w: 320, h: 54, type: 'airship_deck', zone: 1 },

    // High soaring cloud path for jetpack pilots
    { x: 1380, y: 190, w: 240, h: 44, type: 'cappuccino_cloud', zone: 1 },

    // Stratosphere Bouncy Marshmallow Launcher
    { x: 1680, y: 470, w: 120, h: 36, type: 'marshmallow_pad', zone: 1 },

    // High Cloud Observation Island
    { x: 1820, y: 260, w: 220, h: 46, type: 'cappuccino_cloud', zone: 1 },

    // Flagship Steampunk Airship Cruiser (equipped with a Golden Desert Eagle .50 for aerial gunplay!)
    { x: 2120, y: 380, w: 460, h: 58, type: 'airship_deck', zone: 1 },

    // Ascending flight clouds over the grand drop
    { x: 2660, y: 430, w: 200, h: 46, type: 'cappuccino_cloud', zone: 1 },
    { x: 2930, y: 320, w: 210, h: 46, type: 'cappuccino_cloud', zone: 1 },
    { x: 3200, y: 220, w: 220, h: 46, type: 'cappuccino_cloud', zone: 1 },

    // Mid-Level Gateway Checkpoint to Outer Space
    { x: 3480, y: 450, w: 420, h: 62, type: 'airship_deck', zone: 2, isCheckpoint: true, checkpointName: 'Celestial Orbit Gateway' },

    // --- ZONE 2: CELESTIAL STAR-ROAST ORBIT ---
    // Cosmic Asteroid Platforms made of roasted meteorite bean rock
    { x: 3980, y: 370, w: 280, h: 66, type: 'cosmic_rock', zone: 2 },

    // Sparkling Starry Quartz Crystalline Asteroid
    { x: 4340, y: 250, w: 260, h: 54, type: 'stellar_quartz', zone: 2 },

    // High Zero-G Cosmic Outpost
    { x: 4700, y: 160, w: 230, h: 58, type: 'cosmic_rock', zone: 2 },

    // Lower Asteroid with Marshmallow Trampoline Launcher
    { x: 4740, y: 480, w: 280, h: 64, type: 'cosmic_rock', zone: 2 },
    { x: 5120, y: 470, w: 120, h: 36, type: 'marshmallow_pad', zone: 2 },

    // High Orbit Starry Quartz Spire
    { x: 5320, y: 290, w: 240, h: 52, type: 'stellar_quartz', zone: 2 },

    // Wide Cosmic Asteroid Station
    { x: 5740, y: 390, w: 380, h: 64, type: 'cosmic_rock', zone: 2 },

    // Upper Atmospheric Starry Quartz Platform
    { x: 6200, y: 240, w: 260, h: 54, type: 'stellar_quartz', zone: 2 },

    // Floating Starlight Cloud Runway
    { x: 6580, y: 360, w: 280, h: 48, type: 'cappuccino_cloud', zone: 2 },

    // Grand Galactic Orbital Roastery Space Station Finish
    { x: 6980, y: 420, w: 720, h: 96, type: 'airship_deck', zone: 2, isFinish: true }
  ];

  // Golden Coffee Beans distributed along aerial jetpack flight arcs
  const beans = [];
  const addArc = (centerX, baseY, width, height, count) => {
    for (let i = 0; i < count; i++) {
      const u = (i / (count - 1)) * 2 - 1;
      const x = Math.round(centerX + u * (width * 0.5));
      const y = Math.round(baseY - (1 - u * u) * height);
      beans.push({ x, y, collected: false });
    }
  };

  // Level 3 Bean Arcs
  addArc(650, 360, 260, 75, 7);
  addArc(980, 240, 240, 80, 7);
  addArc(1500, 140, 260, 75, 7);
  addArc(1950, 210, 240, 85, 7);
  addArc(2350, 320, 320, 95, 9);
  addArc(2800, 360, 260, 80, 7);
  addArc(3060, 260, 240, 75, 7);
  addArc(4160, 310, 280, 90, 8);
  addArc(4520, 200, 260, 90, 7);
  addArc(4920, 110, 240, 80, 7);
  addArc(5530, 230, 300, 110, 8);
  addArc(5980, 320, 340, 90, 8);
  addArc(6390, 190, 280, 90, 7);
  addArc(6780, 310, 260, 80, 7);

  // EXCLUSIVE LEVEL 3 COLLECTIBLE #1: Stellar Star Coffee Beans (sparkling 8-pointed golden stars, +300 pts, +10% jetpack fuel)
  const starBeans = [
    { x: 310, y: 390, collected: false },
    { x: 740, y: 320, collected: false },
    { x: 1040, y: 210, collected: false },
    { x: 1260, y: 330, collected: false },
    { x: 1530, y: 120, collected: false },
    { x: 1740, y: 380, collected: false },
    { x: 2020, y: 180, collected: false },
    { x: 2520, y: 300, collected: false },
    { x: 2850, y: 230, collected: false },
    { x: 3320, y: 160, collected: false },
    { x: 3740, y: 360, collected: false },
    { x: 4220, y: 170, collected: false },
    { x: 4620, y: 120, collected: false },
    { x: 5040, y: 80, collected: false },
    { x: 5460, y: 180, collected: false },
    { x: 5880, y: 280, collected: false },
    { x: 6120, y: 160, collected: false },
    { x: 6480, y: 130, collected: false },
    { x: 6860, y: 260, collected: false }
  ];

  // EXCLUSIVE LEVEL 3 COLLECTIBLE #2: Shimmering Celestial Cold Brew Orbs (cosmic glass orbs, +600 pts, refills 100% jetpack fuel!)
  const celestialOrbs = [
    { x: 930, y: 190, collected: false },
    { x: 1780, y: 170, collected: false },
    { x: 2790, y: 230, collected: false },
    { x: 4470, y: 150, collected: false },
    { x: 5240, y: 190, collected: false },
    { x: 6330, y: 140, collected: false }
  ];

  // EXCLUSIVE LEVEL 3 ELEMENT #3: Flying Cinnamon Speed Rings (giant glowing rings in the sky, flying through them gives a rush of speed + 300 pts!)
  const cinnamonRings = [
    { id: 'ring_1', x: 1040, y: 210, r: 36, triggered: false },
    { id: 'ring_2', x: 1840, y: 180, r: 36, triggered: false },
    { id: 'ring_3', x: 3100, y: 170, r: 38, triggered: false },
    { id: 'ring_4', x: 4540, y: 190, r: 40, triggered: false },
    { id: 'ring_5', x: 5480, y: 220, r: 40, triggered: false },
    { id: 'ring_6', x: 6420, y: 180, r: 40, triggered: false }
  ];

  // Airborne Celestial Steam Harpies & Cosmic Spirits patrolling Level 3
  const enemies = [
    { id: 'l3_e1', type: 'sugar_hopper', x: 620, y: 390, minX: 520, maxX: 720, vx: 140, hp: 2, maxHp: 2 },
    { id: 'l3_e2', type: 'steam_harpy', x: 990, y: 220, baseY: 220, minX: 860, maxX: 1100, vx: 110, hp: 2, maxHp: 2 },
    { id: 'l3_e3', type: 'bean_grunt', x: 1280, y: 400, minX: 1180, maxX: 1400, vx: 90, hp: 2, maxHp: 2 },
    { id: 'l3_e4', type: 'steam_harpy', x: 1720, y: 210, baseY: 210, minX: 1600, maxX: 1860, vx: -125, hp: 2, maxHp: 2 },
    { id: 'l3_e5', type: 'sugar_hopper', x: 2340, y: 360, minX: 2180, maxX: 2500, vx: 160, hp: 2, maxHp: 2 },
    { id: 'l3_e6', type: 'steam_harpy', x: 2840, y: 260, baseY: 260, minX: 2700, maxX: 3000, vx: 115, hp: 2, maxHp: 2 },
    { id: 'l3_e7', type: 'steam_spirit', x: 3740, y: 360, baseY: 360, minX: 3580, maxX: 3880, vx: 95, hp: 2, maxHp: 2 },
    { id: 'l3_e8', type: 'sugar_hopper', x: 4120, y: 350, minX: 4020, maxX: 4220, vx: 150, hp: 2, maxHp: 2 },
    { id: 'l3_e9', type: 'steam_harpy', x: 4560, y: 180, baseY: 180, minX: 4400, maxX: 4720, vx: -130, hp: 2, maxHp: 2 },
    { id: 'l3_e10', type: 'steam_spirit', x: 5040, y: 220, baseY: 220, minX: 4900, maxX: 5200, vx: 105, hp: 2, maxHp: 2 },
    { id: 'l3_e11', type: 'sugar_hopper', x: 5920, y: 370, minX: 5780, maxX: 6080, vx: 170, hp: 2, maxHp: 2 },
    { id: 'l3_e12', type: 'steam_harpy', x: 6420, y: 190, baseY: 190, minX: 6280, maxX: 6560, vx: 135, hp: 2, maxHp: 2 }
  ];

  // Products hidden in Level 3
  const productNodes = [
    { productId: 'golden-arabica-elixir', x: 1490, y: 140, collected: false },
    { productId: 'artisan-silver-barista-spoon', x: 2360, y: 325, collected: false },
    { productId: 'midnight-velvet-espresso', x: 4810, y: 110, collected: false },
    { productId: 'sunset-biscotti-cold-brew', x: 6330, y: 190, collected: false }
  ];

  // JETPACK & WEAPON PICKUPS FOR LEVEL 3
  const weaponPickups = [
    {
      id: 'jetpack-starter',
      type: 'thruster_jetpack',
      name: 'Steam Turbo Jetpack',
      x: 270,
      y: 432,
      collected: false
    },
    {
      id: 'supa-splat-sky-arsenal',
      type: 'supa_splat',
      name: 'Supa Splat Gun',
      x: 2180,
      y: 332,
      collected: false
    },
    {
      id: 'jetpack-space-station',
      type: 'thruster_jetpack',
      name: 'Steam Turbo Jetpack',
      x: 3660,
      y: 402,
      collected: false
    }
  ];

  return {
    levelIndex: 3,
    title: 'Level 3: Cloudtop Stratosphere & Celestial Star-Roast Orbit',
    zone1Name: 'Cloudtop Stratosphere',
    zone2Name: 'Celestial Star-Roast Orbit',
    width: 7800,
    height: 640,
    liquidLevel: 610,
    platforms,
    beans,
    starBeans,
    celestialOrbs,
    cinnamonRings,
    enemies,
    productNodes,
    weaponPickups
  };
}

// Master Level Data factory
export function createLevelData(levelIndex = 1) {
  if (levelIndex === 3) {
    return createLevel3Data();
  }
  if (levelIndex === 2) {
    return createLevel2Data();
  }
  return createLevel1Data();
}
