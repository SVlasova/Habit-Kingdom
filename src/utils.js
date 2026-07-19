import { BUILDINGS, RESOURCE_META, RUMORS } from './data.js';

export const MEALS = [
  { id: 'breakfast', label: 'Breakfast', icon: '☀' },
  { id: 'lunch', label: 'Lunch', icon: '◐' },
  { id: 'dinner', label: 'Dinner', icon: '☾' },
  { id: 'snack', label: 'Snack', icon: '✦' },
];

export const NUTRIENTS = ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sugar'];

export function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyTotals() {
  return { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0 };
}

export function sumItems(items = []) {
  return items.reduce((total, item) => {
    NUTRIENTS.forEach((key) => { total[key] += Number(item[key]) || 0; });
    return total;
  }, emptyTotals());
}

export function dayTotals(log) {
  if (!log) return emptyTotals();
  if (log.totalsOverride && !Object.values(log.meals || {}).some((items) => items?.length)) return log.totalsOverride;
  return Object.values(log.meals || {}).reduce((total, items) => {
    const meal = sumItems(items);
    NUTRIENTS.forEach((key) => { total[key] += meal[key]; });
    return total;
  }, emptyTotals());
}

export function nutritionFor(food, amount, inputUnit = 'g') {
  const grams = inputUnit === 'portion' ? amount * (food.portionWeight || 100) : amount;
  const multiplier = grams / 100;
  return {
    id: uid('entry'), foodId: food.id, name: food.name, grams: round(grams), unit: food.unit || 'g',
    ...Object.fromEntries(NUTRIENTS.map((key) => [key, round((Number(food[key]) || 0) * multiplier)])),
  };
}

export function progress(actual, target) {
  return target ? actual / target : 0;
}

export function rewardForDay(log, targets) {
  const totals = dayTotals(log);
  const hasMeals = Object.values(log?.meals || {}).some((items) => items?.length) || Boolean(log?.totalsOverride?.calories);
  const rewards = { iron: 0, gold: 0, order: 0, road: 0, harvest: 0, energy: 0, mana: 0 };
  const general = (actual, target) => {
    const ratio = progress(actual, target);
    return ratio >= 1 ? 10 : ratio >= 0.85 ? 5 : 0;
  };
  if (hasMeals) {
    const calorieRatio = progress(totals.calories, targets.calories);
    const calorieReward = totals.calories > targets.calories ? 0 : calorieRatio >= 0.85 ? 10 : 5;
    rewards.gold = calorieReward;
    rewards.order = calorieReward;
  }
  rewards.iron = general(totals.protein, targets.protein);
  rewards.harvest = general(totals.fiber, targets.fiber);
  rewards.energy = general(log?.water || 0, targets.water);
  rewards.mana = general(log?.sleep || 0, targets.sleep);
  rewards.road = Math.min(Math.max(Number(log?.distance) || 0, 0), 10);
  return Object.fromEntries(Object.entries(rewards).map(([key, value]) => [key, round(value)]));
}

export function goalStatus(log, targets) {
  const totals = dayTotals(log);
  return {
    calories: totals.calories <= targets.calories && totals.calories >= targets.calories * 0.85,
    protein: totals.protein >= targets.protein * 0.85,
    fiber: totals.fiber >= targets.fiber * 0.85,
    water: (log?.water || 0) >= targets.water * 0.85,
    sleep: (log?.sleep || 0) >= targets.sleep * 0.85,
    distance: (log?.distance || 0) >= Math.min(targets.distance, 10),
  };
}

export function formatDate(iso, options = {}) {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', ...options }).format(new Date(`${iso}T12:00:00`));
}

export function shortDate(iso) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric' }).format(new Date(`${iso}T12:00:00`));
}

export function toISO(date) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 10);
}

export function addDays(iso, amount) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return toISO(date);
}

export function weekDates(iso) {
  const date = new Date(`${iso}T12:00:00`);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(date); d.setDate(date.getDate() + index); return toISO(d);
  });
}

export function monthDates(iso) {
  const active = new Date(`${iso}T12:00:00`);
  const first = new Date(active.getFullYear(), active.getMonth(), 1, 12);
  const offset = (first.getDay() + 6) % 7;
  first.setDate(first.getDate() - offset);
  return Array.from({ length: 42 }, (_, index) => {
    const d = new Date(first); d.setDate(first.getDate() + index); return toISO(d);
  });
}

export function canAfford(resources, cost) {
  return Object.entries(cost).every(([resource, amount]) => (resources[resource] || 0) >= amount);
}

export function subtractCost(resources, cost) {
  const next = { ...resources };
  Object.entries(cost).forEach(([resource, amount]) => { next[resource] = round((next[resource] || 0) - amount); });
  return next;
}

export function costLabel(cost) {
  return Object.entries(cost).map(([key, amount]) => `${RESOURCE_META[key]?.icon || ''} ${amount}`).join('  ·  ');
}

export function populationCapacity(state) {
  let capacity = 10;
  Object.entries(state.buildings || {}).forEach(([id, level]) => {
    const building = BUILDINGS.find((item) => item.id === id);
    for (let i = 0; i < level; i += 1) capacity += building?.levels[i]?.capacity || 0;
  });
  state.territories.forEach((id) => {
    if (id !== 'center') capacity += { farmlands: 30, forest: 25, ironhills: 30, river: 35, castle: 50 }[id] || 0;
  });
  return capacity;
}

export function selectRumor(log, targets, salt = 0) {
  const totals = dayTotals(log);
  let pool = RUMORS.neutral;
  if (totals.calories > targets.calories) pool = RUMORS.calories_over;
  else if ((log?.water || 0) < targets.water * 0.7) pool = RUMORS.low_water;
  else if ((log?.sleep || 0) < targets.sleep * 0.75) pool = RUMORS.low_sleep;
  else if (totals.protein < targets.protein * 0.85) pool = RUMORS.low_protein;
  else if (Object.values(goalStatus(log, targets)).filter(Boolean).length >= 5) pool = RUMORS.good_day;
  const seed = Math.abs(Math.floor((totals.calories || 1) + (log?.water || 0) * 10 + salt));
  return pool[seed % pool.length];
}

export function generateQuests(logs, selectedDate, targets) {
  const dates = Object.keys(logs).filter((d) => d <= selectedDate).sort();
  const recent = dates.slice(-7).map((d) => ({ date: d, log: logs[d], totals: dayTotals(logs[d]) }));
  const quests = [];
  const last = recent.at(-1);
  const proteinNear = recent.slice(-2).every(({ totals }) => {
    const ratio = progress(totals.protein, targets.protein); return ratio >= 0.8 && ratio <= 0.9;
  });
  if (proteinNear) quests.push({ id: 'iron-anvil', title: 'Iron for the Anvil', tag: 'Protein', task: 'Reach 95–105% of your protein target today.', reward: '+5 Iron', progress: Math.min(progress(last?.totals.protein || 0, targets.protein), 1.05) / 1.05, flavor: 'The forge is nearly at full heat. The anvil awaits one final effort.' });
  const lowWater = recent.filter(({ log }) => progress(log.water || 0, targets.water) < 0.85).length >= 4;
  if (lowWater) quests.push({ id: 'dry-wells', title: 'Dry Wells', tag: 'Water', task: 'Reach at least 90% of your water target.', reward: '125% Energy', progress: progress(last?.log.water || 0, targets.water * 0.9), flavor: 'The buckets have started making complaints. Restore the water supply.' });
  const lowSleep = recent.filter(({ log }) => progress(log.sleep || 0, targets.sleep) < 0.85).length >= 3;
  if (lowSleep) quests.push({ id: 'restless-mages', title: 'Restless Mages', tag: 'Sleep', task: 'Reach at least 90% of your sleep target.', reward: '125% Mana', progress: progress(last?.log.sleep || 0, targets.sleep * 0.9), flavor: 'The mages are exhausted. One has already apologized to a chair.' });
  const lowRoad = recent.filter(({ log }) => (log.distance || 0) < 3).length >= 3;
  if (lowRoad) quests.push({ id: 'unfinished-road', title: 'Unfinished Road', tag: 'Walking', task: 'Walk at least 5 km today.', reward: '+5 Road Miles', progress: (last?.log.distance || 0) / 5, flavor: 'The road crew is naming their shovels. Give them something to do.' });
  const lowFiber = recent.filter(({ totals }) => progress(totals.fiber, targets.fiber) < 0.85).length >= 5;
  if (lowFiber) quests.push({ id: 'nervous-harvest', title: 'Nervous Harvest', tag: 'Fiber', task: 'Reach at least 90% of your fiber target.', reward: '125% Harvest', progress: progress(last?.totals.fiber || 0, targets.fiber * 0.9), flavor: 'The cabbages are asking awkward questions. The farmers request assistance.' });
  if (!quests.length) quests.push({ id: 'three-order', title: 'Three Days of Order', tag: 'Calories', task: 'Stay within 85–100% of your calorie target.', reward: '+20 Order', progress: progress(last?.totals.calories || 0, targets.calories), flavor: 'The council cautiously hopes the good streak will continue.' });
  return quests.slice(0, 4).map((quest) => ({ ...quest, progress: Math.min(Math.max(quest.progress || 0, 0), 1) }));
}

export function analysisTips(logs, targets) {
  const dates = Object.keys(logs).sort().slice(-30);
  const recent7 = dates.slice(-7);
  const tips = [];
  const waterLow = recent7.filter((d) => progress(logs[d].water, targets.water) < 0.85).length;
  if (waterLow >= 4) tips.push({ icon: '◆', title: 'Water Needs Attention', text: `Below 85% on ${waterLow} of the last ${recent7.length} days. Keep water visible and close.` });
  const sleepLow = recent7.filter((d) => progress(logs[d].sleep, targets.sleep) < 0.85).length;
  if (sleepLow >= 3) tips.push({ icon: '✦', title: 'Mana Is Unstable', text: 'Sleep fell below target several times. Protect bedtime like a royal decree.' });
  const overByWeekday = {};
  dates.forEach((date) => {
    if (dayTotals(logs[date]).calories > targets.calories) {
      const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(`${date}T12:00:00`));
      overByWeekday[weekday] = (overByWeekday[weekday] || 0) + 1;
    }
  });
  const repeated = Object.entries(overByWeekday).find(([, count]) => count >= 3);
  if (repeated) tips.push({ icon: '◉', title: `${repeated[0]} is Feast Territory`, text: 'The council suggests reserving more calories for the evening.' });
  const roadLow = recent7.filter((d) => (logs[d].distance || 0) < 3).length;
  if (roadLow >= 4) tips.push({ icon: '〽', title: 'The Cartographers Are Bored', text: 'A short daily walk will restart road expansion.' });
  if (!tips.length) tips.push({ icon: '✓', title: 'A Steady Week', text: 'You are keeping a sustainable rhythm. The council has temporarily run out of reasons to panic.' });
  return tips;
}
