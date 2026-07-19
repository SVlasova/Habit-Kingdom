import { useEffect, useState } from 'react';
import { INITIAL_STATE } from './data.js';

const STORAGE_KEY = 'habit-kingdom-state-v2';
const emptyDay = () => ({ meals: {}, water: 0, sleep: 0, distance: 0 });
const todayISO = () => new Date().toISOString().slice(0, 10);
const zeroResources = () => Object.fromEntries(Object.keys(INITIAL_STATE.resources).map((key) => [key, 0]));

function demoState() {
  const today = todayISO();
  const next = structuredClone(INITIAL_STATE);
  next.selectedDate = today;
  next.logs[today] ||= emptyDay();
  next.account = { authenticated: true, mode: 'demo' };
  next.onboardingComplete = true;
  next.needsProfileSetup = false;
  return next;
}

function zeroState() {
  const today = todayISO();
  return {
    version: INITIAL_STATE.version,
    profile: {
      name: '',
      email: '',
      age: '',
      height: '',
      weight: '',
      targets: structuredClone(INITIAL_STATE.profile.targets),
    },
    selectedDate: today,
    logs: { [today]: emptyDay() },
    customFoods: [],
    recipes: [],
    resources: zeroResources(),
    claimedDates: [],
    buildings: { townhall: 1 },
    unlockedLands: ['townhall'],
    territories: ['center'],
    decorations: [],
    population: 0,
    notices: [],
    account: { authenticated: true, mode: 'zero' },
    onboardingComplete: true,
    needsProfileSetup: true,
  };
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved?.version === INITIAL_STATE.version ? saved : structuredClone(INITIAL_STATE);
  } catch {
    return structuredClone(INITIAL_STATE);
  }
}

export function useKingdomStore() {
  const [state, setState] = useState(load);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

  const update = (producer) => setState((current) => {
    const next = structuredClone(current);
    producer(next);
    return next;
  });

  const startDemo = () => setState(demoState());
  const startFromZero = () => setState(zeroState());
  const reset = startDemo;
  const resetProgress = startFromZero;
  return {
    state, setState, update, reset, resetProgress, startDemo, startFromZero,
  };
}
