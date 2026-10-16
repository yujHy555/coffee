// Hand-crafted AAA multi-biome level matching both concept images:
// Zone 1 (0 - 3400px): Starry Espresso Hills (Night sky, mossy giant coffee bean boulders, biscuit bridges, sugar cube arches, espresso grinders)
// Zone 2 (3400 - 7000px): Sunset Biscotti Grove & Crema Lake (Sunset latte-art clouds, coffee cherry trees, biscotti islands, chocolate sandwich cookies, gingerbread icing cliffs)

export function createLevelData() {
  const platforms = [
    // --- ZONE 1: STARRY ESPRESSO HILLS ---
    // Starting biscuit terrace
    { x: 40, y: 500, w: 360, h: 42, type: 'biscuit', zone: 1 },
    // Giant Mossy Coffee Bean Mound (like Image 1 left side)
    { x: 450, y: 420, w: 230, h: 130, type: 'mossy_bean', zone: 1 },
    // Elevated floating biscuit left of mound for secret beans
    { x: 160, y: 340, w: 170, h: 36, type: 'biscuit', zone: 1 },

    // Sugar Cube Arch #1 over the swirling milk river (Image 1 centerpiece!)
    { x: 740, y: 390, w: 54, h: 54, type: 'sugar_cube', zone: 1 },
    { x: 815, y: 350, w: 54, h: 54, type: 'sugar_cube', zone: 1 },
    { x: 895, y: 330, w: 54, h: 54, type: 'sugar_cube', zone: 1 },
    { x: 975, y: 350, w: 54, h: 54, type: 'sugar_cube', zone: 1 },
    { x: 1050, y: 390, w: 54, h: 54, type: 'sugar_cube', zone: 1 },

    // Lower long biscuit promenade with Spiked Bean & Rolling Donut (Image 1 bottom right)
    { x: 1080, y: 510, w: 580, h: 44, type: 'biscuit', zone: 1 },
    // Upper biscuit shelf holding Product #1 (Midnight Velvet Espresso)
    { x: 1480, y: 350, w: 250, h: 38, type: 'biscuit', zone: 1 },

    // Mid-zone Espresso Machine & Grinder overlook
    { x: 1760, y: 460, w: 220, h: 90, type: 'mossy_bean', zone: 1 },
    { x: 2040, y: 390, w: 180, h: 38, type: 'biscuit', zone: 1 },
    { x: 2280, y: 320, w: 190, h: 38, type: 'biscuit', zone: 1 },

    // High road for Product #2 (Golden Honey Process Geisha)
    { x: 2520, y: 240, w: 240, h: 38, type: 'biscuit', zone: 1 },
    // Lower road with enemies
    { x: 2440, y: 500, w: 540, h: 44, type: 'biscuit', zone: 1 },

    // Transition Sugar Bridge into Sunset Biscotti Grove
    { x: 3040, y: 450, w: 54, h: 54, type: 'sugar_cube', zone: 1 },
    { x: 3125, y: 410, w: 54, h: 54, type: 'sugar_cube', zone: 1 },
    { x: 3210, y: 380, w: 54, h: 54, type: 'sugar_cube', zone: 1 },

    // --- ZONE 2: SUNSET BISCOTTI GROVE (Image 2) ---
    // Checkpoint 1 & Roastery Terrace
    { x: 3320, y: 470, w: 380, h: 65, type: 'gingerbread', zone: 2, isCheckpoint: true, checkpointName: 'Sunset Biscotti Grove' },

    // Crumbling Biscotti Islands over boiling Crema Lake (Image 2 left & center)
    { x: 3780, y: 505, w: 250, h: 56, type: 'biscotti', zone: 2 },
    { x: 4100, y: 430, w: 280, h: 62, type: 'biscotti', zone: 2 },

    // Chocolate-Dipped Sandwich Cookie Platform (Image 2 center-right!)
    { x: 4460, y: 395, w: 270, h: 64, type: 'choco_cookie', zone: 2 },

    // High secret cookie for Product #3 (Damascus Barista Spoon Set)
    { x: 4380, y: 215, w: 230, h: 48, type: 'choco_cookie', zone: 2 },

    // Ascending Sugar Cube steps toward Gingerbread Icing Cliff (Image 2 right)
    { x: 4790, y: 370, w: 52, h: 52, type: 'sugar_cube', zone: 2 },
    { x: 4875, y: 335, w: 52, h: 52, type: 'sugar_cube', zone: 2 },
    { x: 4960, y: 365, w: 52, h: 52, type: 'sugar_cube', zone: 2 },

    // Gingerbread Icing Cliff (Image 2 right side)
    { x: 5050, y: 455, w: 560, h: 75, type: 'gingerbread', zone: 2, isCheckpoint: true, checkpointName: 'Gingerbread Icing Cliffs' },

    // Final gauntlet over the Boiling Espresso Vortex
    { x: 5690, y: 415, w: 230, h: 58, type: 'biscotti', zone: 2 },
    { x: 5990, y: 355, w: 250, h: 62, type: 'choco_cookie', zone: 2 },
    { x: 6290, y: 295, w: 220, h: 56, type: 'biscotti', zone: 2 },

    // Grand Barista Sanctuary & Golden Espresso Machine Finish
    { x: 6570, y: 430, w: 620, h: 95, type: 'gingerbread', zone: 2, isFinish: true }
  ];

  // Golden Coffee Beans placed in signature arcs (matching both concept images)
  const beans = [];
  const addArc = (centerX, baseY, width, height, count) => {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = centerX - width / 2 + t * width;
      const arcY = baseY - Math.sin(t * Math.PI) * height;
      beans.push({ x, y: arcY, collected: false, bobOffset: i * 0.6 });
    }
  };

  // Arc over starting terrace
  addArc(240, 440, 180, 45, 5);
  // Secret upper biscuit beans
  addArc(245, 285, 110, 25, 4);
  // Arc over mossy bean boulder
  addArc(565, 345, 160, 55, 5);
  // Signature Image 1 Arc above the 5 Sugar Cubes!
  addArc(895, 255, 310, 70, 6);
  // Along lower biscuit promenade
  addArc(1320, 450, 260, 40, 6);
  // Arc leading to Product #1
  addArc(1900, 340, 220, 65, 5);
  addArc(2360, 240, 200, 55, 5);
  // Lower path beans
  addArc(2680, 440, 280, 45, 6);
  // Transition sugar bridge arc
  addArc(3125, 310, 210, 60, 5);

  // Zone 2 Sunset Biscotti Grove arcs (Image 2 left & center golden bean arcs)
  addArc(3680, 400, 190, 75, 5);
  addArc(3950, 360, 200, 70, 5);
  addArc(4290, 325, 210, 65, 5);
  addArc(4620, 310, 190, 60, 5);
  // High secret arc
  addArc(4495, 150, 160, 35, 5);
  // Gingerbread cliff arc
  addArc(5320, 385, 280, 55, 7);
  // Final gauntlet arcs
  addArc(5840, 320, 220, 65, 5);
  addArc(6140, 260, 220, 65, 5);
  addArc(6450, 225, 200, 65, 5);

  // Enemies matching the official COFFEE-THEMED ENEMIES Character Design Sheet:
  // - 'bean_grunt': COFFEE BEAN GRUNT (Vertical roasted coffee bean with center cleft, angry white eyes, V-brow, rosy cheeks, maroon boots)
  // - 'sugar_hopper': SUGAR CUBE HOPPER (3D sparkling sugar cube with excited open mouth, raised fist, and red-and-white striped sneakers)
  // - 'steam_spirit': STEAM CLOUD SPIRIT (Floating creamy-white wispy steam ghost with spiral curls, mischievous grin, and hovering tail)
  const enemies = [
    {
      id: 'e1',
      type: 'bean_grunt',
      x: 1220,
      y: 484,
      minX: 1100,
      maxX: 1420,
      vx: -78,
      hp: 2,
      maxHp: 2
    },
    {
      id: 'e2',
      type: 'sugar_hopper',
      x: 1520,
      y: 484,
      minX: 1320,
      maxX: 1630,
      vx: -180,
      hp: 1,
      maxHp: 1
    },
    {
      id: 'e3',
      type: 'steam_spirit',
      x: 2110,
      y: 350,
      baseY: 350,
      minX: 2020,
      maxX: 2240,
      vx: 75,
      hp: 1,
      maxHp: 1
    },
    {
      id: 'e4',
      type: 'bean_grunt',
      x: 2620,
      y: 474,
      minX: 2470,
      maxX: 2760,
      vx: 85,
      hp: 2,
      maxHp: 2
    },
    {
      id: 'e5',
      type: 'sugar_hopper',
      x: 2880,
      y: 474,
      minX: 2680,
      maxX: 2950,
      vx: -180,
      hp: 2,
      maxHp: 2
    },
    // Zone 2 Enemies
    {
      id: 'e6',
      type: 'sugar_hopper',
      x: 3560,
      y: 444,
      minX: 3380,
      maxX: 3660,
      vx: -180,
      hp: 2,
      maxHp: 2
    },
    {
      id: 'e7',
      type: 'steam_spirit',
      x: 4220,
      y: 380,
      baseY: 380,
      minX: 4100,
      maxX: 4380,
      vx: 88,
      hp: 2,
      maxHp: 2
    },
    {
      id: 'e8',
      type: 'sugar_hopper',
      x: 5180,
      y: 429,
      minX: 5080,
      maxX: 5360,
      vx: -180,
      hp: 2,
      maxHp: 2
    },
    {
      id: 'e9',
      type: 'bean_grunt',
      x: 5450,
      y: 429,
      minX: 5300,
      maxX: 5580,
      vx: 92,
      hp: 2,
      maxHp: 2
    },
    {
      id: 'e10',
      type: 'steam_spirit',
      x: 6110,
      y: 305,
      baseY: 305,
      minX: 5990,
      maxX: 6240,
      vx: -115,
      hp: 2,
      maxHp: 2
    }
  ];

  // Collectible Mystery Product Crates / Pedestals placed in the world
  const productNodes = [
    {
      productId: 'midnight-velvet-espresso',
      x: 1605,
      y: 290,
      collected: false
    },
    {
      productId: 'golden-arabica-elixir',
      x: 2640,
      y: 180,
      collected: false
    },
    {
      productId: 'artisan-silver-barista-spoon',
      x: 4495,
      y: 155,
      collected: false
    },
    {
      productId: 'sunset-biscotti-cold-brew',
      x: 5510,
      y: 395,
      collected: false
    }
  ];

  return {
    width: 7250,
    height: 640,
    liquidLevel: 575,
    platforms,
    beans,
    enemies,
    productNodes
  };
}
