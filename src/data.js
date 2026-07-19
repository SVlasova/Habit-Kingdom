export const RESOURCE_META = {
  iron: { label: 'Iron', icon: '▰', color: '#667076', source: 'Protein' },
  gold: { label: 'Gold', icon: '●', color: '#c8953d', source: 'Calories' },
  order: { label: 'Order', icon: '⚖', color: '#8b6548', source: 'Calories' },
  road: { label: 'Road Miles', icon: '〽', color: '#8a774d', source: 'Walking' },
  harvest: { label: 'Harvest', icon: '♨', color: '#a77a35', source: 'Fiber' },
  energy: { label: 'Energy', icon: '◆', color: '#4d8fa1', source: 'Water' },
  mana: { label: 'Mana', icon: '✦', color: '#7968a8', source: 'Sleep' },
};

// The built-in database contains raw foods and individual ingredients only.
export const BUILTIN_FOODS = [
  ['chicken-breast', 'Skinless chicken breast, raw', 'Poultry', 113, 23.6, 1.9, 0, 0, 0],
  ['chicken-thigh', 'Skinless chicken thigh, raw', 'Poultry', 120, 19.2, 4.7, 0, 0, 0],
  ['chicken-thigh-skin', 'Chicken thigh with skin, raw', 'Poultry', 211, 16.8, 16.0, 0, 0, 0],
  ['turkey-breast', 'Skinless turkey breast, raw', 'Poultry', 114, 23.7, 1.5, 0, 0, 0],
  ['beef-tenderloin', 'Beef tenderloin, raw', 'Meat', 143, 21.6, 6.3, 0, 0, 0],
  ['beef-mince', 'Ground beef 10%, raw', 'Meat', 176, 20.0, 10.0, 0, 0, 0],
  ['pork-loin', 'Boneless pork loin, raw', 'Meat', 143, 21.2, 6.3, 0, 0, 0],
  ['salmon', 'Atlantic salmon, raw', 'Fish', 208, 20.4, 13.4, 0, 0, 0],
  ['cod', 'Cod, raw', 'Fish', 82, 17.8, 0.7, 0, 0, 0],
  ['egg', 'Chicken egg, raw', 'Eggs', 143, 12.6, 9.5, 0.7, 0, 0.4, 50],
  ['rice', 'Long-grain white rice, dry', 'Grains', 365, 7.1, 0.7, 80.0, 1.3, 0.1],
  ['buckwheat', 'Buckwheat groats, dry', 'Grains', 343, 13.3, 3.4, 71.5, 10.0, 0],
  ['oats', 'Rolled oats, dry', 'Grains', 379, 13.2, 6.5, 67.7, 10.1, 1.0],
  ['potato', 'Potato, raw', 'Vegetables', 77, 2.1, 0.1, 17.5, 2.1, 0.8],
  ['tomato', 'Tomato, raw', 'Vegetables', 18, 0.9, 0.2, 3.9, 1.2, 2.6],
  ['cucumber', 'Cucumber with peel, raw', 'Vegetables', 15, 0.7, 0.1, 3.6, 0.5, 1.7],
  ['broccoli', 'Broccoli, raw', 'Vegetables', 34, 2.8, 0.4, 6.6, 2.6, 1.7],
  ['carrot', 'Carrot, raw', 'Vegetables', 41, 0.9, 0.2, 9.6, 2.8, 4.7],
  ['apple', 'Apple with skin, raw', 'Fruit', 52, 0.3, 0.2, 13.8, 2.4, 10.4],
  ['banana', 'Banana, raw', 'Fruit', 89, 1.1, 0.3, 22.8, 2.6, 12.2],
  ['blueberry', 'Blueberries, raw', 'Berries', 57, 0.7, 0.3, 14.5, 2.4, 10.0],
  ['milk', 'Milk 2.5%', 'Dairy', 52, 3.0, 2.5, 4.7, 0, 4.7],
  ['cottage', 'Cottage cheese 5%', 'Dairy', 121, 17.2, 5.0, 1.8, 0, 1.8],
  ['olive-oil', 'Olive oil', 'Oils', 884, 0, 100, 0, 0, 0],
].map(([id, name, category, calories, protein, fat, carbs, fiber, sugar, portionWeight]) => ({
  id, name, category, calories, protein, fat, carbs, fiber, sugar,
  portionWeight: portionWeight || null, source: 'base', unit: name.includes('Milk') ? 'ml' : 'g',
}));

const levels = (one, two, three) => [one, two, three];

export const BUILDINGS = [
  {
    id: 'townhall', name: 'Town Hall', icon: '♜', territory: 'center', description: 'The heart of order and growth in the kingdom.', imagePrefix: 'townhall', imageExt: 'webp',
    levels: levels(
      { cost: { gold: 100, order: 100 }, capacity: 20 },
      { cost: { gold: 220, order: 180, iron: 50 }, capacity: 20 },
      { cost: { gold: 400, order: 350, iron: 120 }, capacity: 40 },
    ),
  },
  {
    id: 'farm', name: 'Farm', icon: '♨', territory: 'farmlands', description: 'Harvests, gardens, and steady growth.', imagePrefix: 'farm', imageExt: 'webp',
    levels: levels(
      { cost: { harvest: 60 }, capacity: 10 },
      { cost: { harvest: 140, gold: 40 }, capacity: 20 },
      { cost: { harvest: 300, gold: 120, energy: 80 }, capacity: 35 },
    ),
  },
  {
    id: 'forge', name: 'Forge', icon: '⚒', territory: 'ironhills', description: 'Strength, craft, and hot iron.', imagePrefix: 'forge', imageExt: 'webp',
    levels: levels(
      { cost: { iron: 80 }, capacity: 0 },
      { cost: { iron: 180, gold: 60 }, capacity: 0 },
      { cost: { iron: 350, gold: 150, order: 100 }, capacity: 10 },
    ),
  },
  {
    id: 'mage', name: 'Mage Tower', icon: '✦', territory: 'forest', description: 'Mana, recovery, and restful sleep.', imagePrefix: 'mage', imageExt: 'webp',
    levels: levels(
      { cost: { mana: 100 }, capacity: 0 },
      { cost: { mana: 220, gold: 80 }, capacity: 0 },
      { cost: { mana: 450, gold: 200, order: 120 }, capacity: 10 },
    ),
  },
  {
    id: 'tavern', name: 'Tavern', icon: '♨', territory: 'center', description: 'The kingdom’s best source of rumors and questionable advice.', imagePrefix: 'tavern', imageExt: 'webp',
    levels: levels(
      { cost: { gold: 100, harvest: 50 }, capacity: 0 },
      { cost: { gold: 220, harvest: 120, energy: 50 }, capacity: 15 },
      { cost: { gold: 400, harvest: 250, order: 120 }, capacity: 30 },
    ),
  },
  {
    id: 'library', name: 'Library', icon: '▥', territory: 'forest', description: 'History, analysis, and knowledge.', imagePrefix: 'library', imageExt: 'webp',
    levels: levels(
      { cost: { mana: 120, gold: 100 }, capacity: 0 },
      { cost: { mana: 260, gold: 180, order: 80 }, capacity: 0 },
      { cost: { mana: 500, gold: 350, order: 180 }, capacity: 20 },
    ),
  },
  {
    id: 'market', name: 'Market', icon: '⌂', territory: 'farmlands', description: 'Trade, life, and prosperity.', imagePrefix: 'market', imageExt: 'webp',
    levels: levels(
      { cost: { gold: 150, order: 80 }, capacity: 10 },
      { cost: { gold: 300, order: 180, harvest: 80 }, capacity: 25 },
      { cost: { gold: 550, order: 350, harvest: 150 }, capacity: 50 },
    ),
  },
  {
    id: 'barracks', name: 'Barracks', icon: '⚔', territory: 'ironhills', description: 'Discipline and border defense.', imagePrefix: 'barracks', imageExt: 'webp',
    levels: levels(
      { cost: { iron: 150, order: 100 }, capacity: 0 },
      { cost: { iron: 320, order: 220, gold: 80 }, capacity: 15 },
      { cost: { iron: 600, order: 400, gold: 200 }, capacity: 30 },
    ),
  },
  {
    id: 'fountain', name: 'Fountain', icon: '◉', territory: 'center', description: 'Water, energy, and life in the square.', imagePrefix: 'fountain', imageExt: 'webp',
    levels: levels(
      { cost: { energy: 80 }, capacity: 0 },
      { cost: { energy: 180, gold: 80 }, capacity: 10 },
      { cost: { energy: 350, gold: 180, order: 120 }, capacity: 25 },
    ),
  },
];

export const TERRITORIES = [
  { id: 'center', name: 'Heart of the Kingdom', cost: {}, capacity: 20, description: 'Town Hall, Tavern, and Fountain', position: 'area-center' },
  { id: 'farmlands', name: 'Fertile Farmlands', cost: { road: 80, harvest: 60, order: 40 }, capacity: 30, description: 'Farms and Market', position: 'area-farm' },
  { id: 'forest', name: 'Forest Road', cost: { road: 140, order: 100, gold: 80 }, capacity: 25, description: 'Library and Mage Tower', position: 'area-forest' },
  { id: 'ironhills', name: 'Iron Hills', cost: { road: 180, iron: 150, gold: 120 }, capacity: 30, description: 'Forge and Barracks', position: 'area-hills' },
  { id: 'river', name: 'River District', cost: { road: 220, energy: 150, gold: 150 }, capacity: 35, description: 'Bridges and waterworks', position: 'area-river' },
  { id: 'castle', name: 'Castle Hill', cost: { road: 350, gold: 300, order: 300 }, capacity: 50, description: 'Late-game upgrades', position: 'area-castle' },
];

export const LAND_PLOTS = [
  { id: 'townhall', buildingId: 'townhall', name: 'Town Hall Grounds', district: 'Upper Terrace', x: 50, y: 28, row: 'upper', landCost: {}, description: 'The starting seat of the kingdom.' },
  { id: 'tavern', buildingId: 'tavern', name: 'Tavern Lot', district: 'Upper Terrace', x: 80, y: 28, row: 'near', landCost: { road: 10 }, description: 'Nearby land for rumors and social life.' },
  { id: 'fountain', buildingId: 'fountain', name: 'Fountain Square', district: 'Middle Terrace', x: 50, y: 52, row: 'near', landCost: { road: 10 }, description: 'Nearby public land for water and energy.' },
  { id: 'mage', buildingId: 'mage', name: 'Mage Rise', district: 'Upper Terrace', x: 20, y: 28, row: 'middle', landCost: { road: 30 }, description: 'A prepared tower plot for Mana and recovery.' },
  { id: 'library', buildingId: 'library', name: 'Scholar Grove', district: 'Middle Terrace', x: 20, y: 52, row: 'middle', landCost: { road: 20 }, description: 'A middle-row plot for knowledge and analysis.' },
  { id: 'forge', buildingId: 'forge', name: 'Smithing Yard', district: 'Middle Terrace', x: 80, y: 52, row: 'middle', landCost: { road: 30 }, description: 'A middle-row plot for craft and Iron.' },
  { id: 'barracks', buildingId: 'barracks', name: 'Training Yard', district: 'Lower Terrace', x: 20, y: 79, row: 'lower', landCost: { road: 40 }, description: 'Lower-row land for discipline and defense.' },
  { id: 'farm', buildingId: 'farm', name: 'Farmstead Field', district: 'Lower Terrace', x: 50, y: 79, row: 'lower', landCost: { road: 45 }, description: 'Lower-row fertile land for Harvest growth.' },
  { id: 'market', buildingId: 'market', name: 'Market Grounds', district: 'Lower Terrace', x: 80, y: 79, row: 'lower', landCost: { road: 50 }, description: 'Lower-row land for trade and prosperity.' },
];

export const DECORATIONS = [
  { id: 'fence', name: 'Wooden Fence', image: 'decor-fence.webp', size: 47, cost: { harvest: 20 } },
  { id: 'bench', name: 'Wooden Bench', image: 'decor-bench.webp', size: 48, cost: { gold: 15 } },
  { id: 'well', name: 'Well', image: 'decor-well.webp', size: 62, cost: { energy: 60, gold: 30 } },
  { id: 'dummies', name: 'Training Dummies', image: 'decor-dummies.webp', size: 46, cost: { iron: 45, order: 30 } },
  { id: 'statue', name: 'Stone Statue', image: 'decor-statue.webp', size: 53, cost: { iron: 60, order: 45 } },
  { id: 'bridge', name: 'Stone Bridge', image: 'decor-bridge.webp', size: 92, cost: { road: 80, iron: 50, gold: 50 } },
  { id: 'tree', name: 'Small Tree', image: 'decor-tree.webp', size: 58, cost: { harvest: 25 } },
  { id: 'sign', name: 'Signpost', image: 'decor-signpost.webp', size: 38, cost: { gold: 20, road: 10 } },
  { id: 'lantern', name: 'Road Lantern', image: 'decor-lantern.webp', size: 34, cost: { gold: 20, energy: 10 } },
  { id: 'reading-garden', name: 'Reading Garden', image: 'decor-reading-garden.webp', size: 78, cost: { mana: 70, harvest: 40, gold: 50 } },
  { id: 'market-stall', name: 'Market Stall', image: 'decor-market-stall.webp', size: 73, cost: { gold: 70, harvest: 40, order: 20 } },
  { id: 'crystals', name: 'Magic Crystals', image: 'decor-crystals.webp', size: 42, cost: { mana: 80 } },
  { id: 'fountain-garden', name: 'Fountain Garden', image: 'decor-fountain-garden.webp', size: 86, cost: { energy: 90, harvest: 60, gold: 60 } },
  { id: 'flowers', name: 'Flower Bed', image: 'decor-flower-bed.webp', size: 43, cost: { harvest: 20 } },
  { id: 'barrels', name: 'Barrel Stack', image: 'decor-barrels.webp', size: 48, cost: { gold: 30, harvest: 20 } },
];

export const RUMORS = {
  low_water: [
    'The wells look suspiciously empty. The buckets demand attention.',
    'The people protest the lack of water, my liege. Politely, for now.',
    'The well reflected today’s choices with unsettling accuracy.',
  ],
  low_sleep: [
    'The mages are tired. One apologized to a chair for a failed spell.',
    'The tower lights burned all night. The candles filed a joint complaint.',
  ],
  low_protein: [
    'The forge is cooling. The blacksmith is taking it personally.',
    'Iron is scarce. The apprentices pretend to polish already polished tools.',
  ],
  calories_over: [
    'The royal kitchen has grown too powerful. The pies discuss autonomy.',
    'The feast entered the chronicles. The Tavern denies responsibility.',
  ],
  good_day: [
    'The kingdom is running suspiciously smoothly today. The council is concerned.',
    'Flags are raised, the forge is hot, and the wells are full. Even the innkeeper is pleased.',
    'The bard asked permission to write about today. The decision is pending.',
  ],
  building: [
    'Construction is complete. The people already argue over who gets the first key.',
    'The new building opened with ceremony far beyond the approved budget.',
  ],
  neutral: [
    'The kingdom keeps growing: slowly, proudly, and with a great deal of paperwork.',
    'The Tavern is quiet. Either that is good news, or they are hiding something.',
  ],
};

export const DEMO_PROFILE = {
  name: 'Alex', email: 'ruler@habitkingdom.app', age: 32, height: 175, weight: 76,
  targets: { calories: 2200, protein: 160, fat: 75, carbs: 230, fiber: 30, sugar: 55, water: 2.5, sleep: 8, distance: 8 },
};

const today = new Date();
const iso = (date) => date.toISOString().slice(0, 10);
const day = (offset) => { const d = new Date(today); d.setDate(d.getDate() + offset); return iso(d); };

export const DEMO_LOGS = {
  [day(-6)]: { meals: {}, water: 1.8, sleep: 7.2, distance: 3.4, totalsOverride: { calories: 1885, protein: 137, fat: 64, carbs: 195, fiber: 22, sugar: 39 } },
  [day(-5)]: { meals: {}, water: 1.7, sleep: 6.4, distance: 2.2, totalsOverride: { calories: 2310, protein: 132, fat: 81, carbs: 251, fiber: 19, sugar: 61 } },
  [day(-4)]: { meals: {}, water: 2.1, sleep: 7.4, distance: 4.8, totalsOverride: { calories: 2040, protein: 141, fat: 69, carbs: 218, fiber: 24, sugar: 45 } },
  [day(-3)]: { meals: {}, water: 1.9, sleep: 7.8, distance: 6.1, totalsOverride: { calories: 2120, protein: 145, fat: 70, carbs: 225, fiber: 25, sugar: 47 } },
  [day(-2)]: { meals: {}, water: 2.0, sleep: 6.8, distance: 2.6, totalsOverride: { calories: 1940, protein: 136, fat: 62, carbs: 215, fiber: 21, sugar: 42 } },
  [day(-1)]: { meals: {}, water: 1.6, sleep: 7.0, distance: 2.2, totalsOverride: { calories: 1980, protein: 140, fat: 66, carbs: 211, fiber: 20, sugar: 38 } },
  [day(0)]: {
    meals: {
      breakfast: [
        { id: 'demo-1', foodId: 'oats', name: 'Rolled oats, dry', grams: 70, calories: 265.3, protein: 9.2, fat: 4.6, carbs: 47.4, fiber: 7.1, sugar: 0.7 },
        { id: 'demo-2', foodId: 'banana', name: 'Banana, raw', grams: 120, calories: 106.8, protein: 1.3, fat: 0.4, carbs: 27.4, fiber: 3.1, sugar: 14.6 },
      ],
      lunch: [
        { id: 'demo-3', foodId: 'chicken-breast', name: 'Skinless chicken breast, raw', grams: 250, calories: 282.5, protein: 59, fat: 4.8, carbs: 0, fiber: 0, sugar: 0 },
        { id: 'demo-4', foodId: 'rice', name: 'Long-grain white rice, dry', grams: 90, calories: 328.5, protein: 6.4, fat: 0.6, carbs: 72, fiber: 1.2, sugar: 0.1 },
        { id: 'demo-5', foodId: 'broccoli', name: 'Broccoli, raw', grams: 180, calories: 61.2, protein: 5, fat: 0.7, carbs: 11.9, fiber: 4.7, sugar: 3.1 },
      ],
      dinner: [
        { id: 'demo-6', foodId: 'salmon', name: 'Atlantic salmon, raw', grams: 180, calories: 374.4, protein: 36.7, fat: 24.1, carbs: 0, fiber: 0, sugar: 0 },
        { id: 'demo-7', foodId: 'potato', name: 'Potato, raw', grams: 300, calories: 231, protein: 6.3, fat: 0.3, carbs: 52.5, fiber: 6.3, sugar: 2.4 },
      ],
      snack: [{ id: 'demo-8', foodId: 'cottage', name: 'Cottage cheese 5%', grams: 200, calories: 242, protein: 34.4, fat: 10, carbs: 3.6, fiber: 0, sugar: 3.6 }],
    },
    water: 2.1, sleep: 7.5, distance: 6.8,
  },
};

export const INITIAL_STATE = {
  version: 9,
  profile: DEMO_PROFILE,
  selectedDate: day(0),
  logs: DEMO_LOGS,
  customFoods: [],
  recipes: [],
  resources: { iron: 265, gold: 420, order: 310, road: 175, harvest: 170, energy: 190, mana: 245 },
  claimedDates: [],
  buildings: { townhall: 1 },
  unlockedLands: ['townhall'],
  territories: ['center', 'farmlands'],
  decorations: [],
  population: 18,
  notices: [],
  account: { authenticated: true, mode: 'demo' },
  onboardingComplete: false,
  needsProfileSetup: false,
};
