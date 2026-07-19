import { useEffect, useState } from 'react';
import {
  BUILDINGS, BUILTIN_FOODS, LAND_PLOTS, RESOURCE_META,
} from './data.js';
import { useKingdomStore } from './store.js';
import KingdomScene from './components/KingdomScene.jsx';
import {
  MEALS, NUTRIENTS, addDays, analysisTips, canAfford, dayTotals, formatDate,
  generateQuests, goalStatus, monthDates, nutritionFor, progress,
  rewardForDay, round, selectRumor, shortDate, subtractCost, sumItems, toISO, uid, weekDates,
} from './utils.js';

const NAV = [
  ['today', 'Today', '⌂'], ['foods', 'Foods', '◇'], ['recipes', 'Recipes', '▤'],
  ['calendar', 'History', '▦'], ['quests', 'Quests', '⚑'], ['kingdom', 'Kingdom', '♜'], ['profile', 'Profile', '◉'],
];

const LABELS = {
  calories: 'Calories', protein: 'Protein', fat: 'Fat', carbs: 'Carbs', fiber: 'Fiber', sugar: 'Sugar',
};

const assetUrl = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

function App() {
  const {
    state, setState, update, reset, startDemo, startFromZero,
  } = useKingdomStore();
  const [page, setPage] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('page');
    return NAV.some(([id]) => id === requested) ? requested : 'today';
  });
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  };

  useEffect(() => {
    let knownToday = toISO(new Date());
    const selectToday = () => setState((current) => {
      const today = toISO(new Date());
      if (current.selectedDate === today && current.logs[today]) return current;
      const next = structuredClone(current);
      next.selectedDate = today;
      next.logs[today] ||= { meals: {}, water: 0, sleep: 0, distance: 0 };
      return next;
    });
    const checkForNewDay = () => {
      const today = toISO(new Date());
      if (today === knownToday) return;
      knownToday = today;
      selectToday();
    };
    const handleVisibility = () => { if (!document.hidden) checkForNewDay(); };

    selectToday();
    const timer = window.setInterval(checkForNewDay, 60_000);
    window.addEventListener('focus', checkForNewDay);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', checkForNewDay);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [setState]);

  useEffect(() => {
    if (state.account?.authenticated && state.needsProfileSetup && page !== 'profile') setPage('profile');
  }, [page, state.account?.authenticated, state.needsProfileSetup]);

  if (!state.account?.authenticated) {
    return <AccountGate update={update} notify={notify} />;
  }

  const go = (next) => {
    if (next === 'today') update((draft) => {
      const today = toISO(new Date());
      draft.selectedDate = today;
      draft.logs[today] ||= { meals: {}, water: 0, sleep: 0, distance: 0 };
    });
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const beginDemo = () => {
    startDemo();
    setPage('today');
    notify('Demo version loaded');
  };
  const beginFromZero = () => {
    startFromZero();
    setPage('profile');
    notify('Start by filling in your profile.');
  };
  const common = { state, update, notify, go, setModal };

  return (
    <div className="app-shell">
      <Sidebar page={page} go={go} profile={state.profile} />
      <main className="main-shell">
        <Topbar page={page} go={go} state={state} update={update} />
        {page === 'today' && <TodayPage {...common} />}
        {page === 'foods' && <FoodsPage {...common} />}
        {page === 'recipes' && <RecipesPage {...common} />}
        {page === 'calendar' && <CalendarPage {...common} />}
        {page === 'quests' && <QuestsPage {...common} />}
        {page === 'kingdom' && <KingdomPage {...common} />}
        {page === 'profile' && <ProfilePage {...common} reset={reset} startFromZero={startFromZero} />}
      </main>
      <MobileNav page={page} go={go} />
      {!state.onboardingComplete && <OnboardingChoice onStartDemo={beginDemo} onStartZero={beginFromZero} />}
      {modal?.type === 'add-food' && <AddFoodModal {...common} meal={modal.meal} close={() => setModal(null)} />}
      {modal?.type === 'custom-food' && <CustomFoodModal {...common} close={() => setModal(null)} />}
      {modal?.type === 'recipe' && <RecipeModal {...common} close={() => setModal(null)} />}
      {modal?.type === 'rumors' && <RumorHistory {...common} close={() => setModal(null)} />}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}

function OnboardingChoice({ onStartDemo, onStartZero }) {
  return (
    <div className="modal-backdrop onboarding-backdrop">
      <section className="onboarding-card parchment-card" aria-modal="true" role="dialog" aria-labelledby="onboarding-title">
        <p className="eyebrow">Welcome</p>
        <h2 id="onboarding-title">Welcome to Habit Kingdom</h2>
        <div className="onboarding-copy">
          <section>
            <p>Habit Kingdom turns daily nutrition tracking into a small fantasy kingdom. Log your meals, water, sleep, and walking, then use your progress to earn resources and grow your land.</p>
          </section>
          <section>
            <h3>Track your day</h3>
            <p>Add foods to breakfast, lunch, dinner, or snacks. The app calculates calories, protein, fat, carbs, fiber, and sugar against your personal targets.</p>
          </section>
          <section>
            <h3>Use raw foods and recipes</h3>
            <p>Choose from the built-in raw food database, create your own foods, or calculate homemade dishes from ingredients.</p>
          </section>
          <section>
            <h3>Complete quests</h3>
            <p>The advisor reviews your recent habits and suggests practical quests based on your nutrition, recovery, and movement patterns.</p>
          </section>
          <section>
            <h3>Build the kingdom</h3>
            <p>Earn resources by walking, meeting your protein goal, staying hydrated, getting enough sleep, and keeping your calories within range. Use those resources to unlock new land, construct buildings, and grow your kingdom step by step.</p>
          </section>
          <section>
            <h3>Demo note</h3>
            <p>This is a demo version with a sample user, prepared diary history, and saved resources so you can explore the full experience immediately. You can restore the demo at any time or start from zero in Profile.</p>
          </section>
        </div>
        <div className="onboarding-options">
          <button className="onboarding-option" type="button" onClick={onStartDemo}>
            <span>Prepared showcase</span>
            <strong>Start demo version</strong>
            <p>Loads a sample profile, diary history, accumulated resources, quests, and a kingdom that is ready to explore.</p>
          </button>
          <button className="onboarding-option" type="button" onClick={onStartZero}>
            <span>Clean account</span>
            <strong>Start from zero</strong>
            <p>Creates an empty diary, no resources, a blank profile, and sends you to Profile first to enter your details.</p>
          </button>
        </div>
      </section>
    </div>
  );
}

function AccountGate({ update }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('Alex');
  const [email, setEmail] = useState('ruler@habitkingdom.app');
  const enter = (event) => {
    event.preventDefault();
    update((next) => {
      next.account = { authenticated: true, mode: 'local', email };
      next.profile.name = name || 'Ruler';
      next.profile.email = email;
    });
  };
  return (
    <div className="account-gate">
      <section className="gate-story">
        <img src={assetUrl('logo.png')} alt="Habit Kingdom crest" />
        <p className="eyebrow light">Habit Kingdom</p>
        <h1>Habits that build an entire world.</h1>
        <p>Track your nutrition, earn resources, and grow a cozy medieval kingdom.</p>
      </section>
      <form className="gate-form parchment-card" onSubmit={enter}>
        <p className="eyebrow">Welcome</p>
        <h2>{mode === 'login' ? 'Return to the kingdom' : 'Found your kingdom'}</h2>
        {mode === 'register' && <Field label="Ruler name"><input value={name} onChange={(e) => setName(e.target.value)} required /></Field>}
        <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
        <Field label="Password"><input type="password" defaultValue="kingdom123" minLength="6" required /></Field>
        <button className="primary full" type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
        <button className="text-button" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'No account? Register' : 'Already have an account? Sign in'}
        </button>
        <p className="form-note">This demo stores data locally in your browser. The architecture is ready for a Supabase connection.</p>
      </form>
    </div>
  );
}

function Sidebar({ page, go, profile }) {
  const displayName = profile.name || 'New ruler';
  const avatarLetter = displayName.slice(0, 1).toUpperCase();
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => go('today')}>
        <img src={assetUrl('logo.png')} alt="" />
        <span><strong>Habit Kingdom</strong><small>Track. Nourish. Build.</small></span>
      </button>
      <nav>
        {NAV.map(([id, label, icon]) => (
          <button key={id} className={page === id ? 'active' : ''} onClick={() => go(id)}><i>{icon}</i><span>{label}</span>{id === 'quests' && <b>3</b>}</button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="mini-avatar">{avatarLetter}</div>
        <span><strong>{displayName}</strong><small>Ruler</small></span>
      </div>
    </aside>
  );
}

function MobileNav({ page, go }) {
  const items = NAV.filter(([id]) => ['today', 'calendar', 'kingdom', 'quests', 'profile'].includes(id));
  return <nav className="mobile-nav">{items.map(([id, label, icon]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => go(id)}><i>{icon}</i><span>{label}</span></button>)}</nav>;
}

function Topbar({ page, go, state, update }) {
  const title = NAV.find(([id]) => id === page)?.[1] || 'Habit Kingdom';
  const today = toISO(new Date());
  const profileLetter = (state.profile.name || 'R').slice(0, 1).toUpperCase();
  return (
    <header className="topbar">
      <div><p className="breadcrumb">Habit Kingdom <span>/</span> {title}</p><h1>{title}</h1></div>
      <div className="top-actions">
        {page === 'today' && state.selectedDate !== today && <button className="quiet-button" onClick={() => update((next) => { next.selectedDate = today; })}>Go to today</button>}
        <button className="profile-button" onClick={() => go('profile')}><span>{profileLetter}</span><i>⌄</i></button>
      </div>
    </header>
  );
}

function TodayPage({ state, update, setModal, go }) {
  const { selectedDate } = state;
  const dates = weekDates(selectedDate);
  const log = state.logs[selectedDate] || { meals: {}, water: 0, sleep: 0, distance: 0 };
  const totals = dayTotals(log);
  const targets = state.profile.targets;
  const quests = generateQuests(state.logs, selectedDate, targets);
  const tips = analysisTips(state.logs, targets);
  const rumor = selectRumor(log, targets, new Date(`${selectedDate}T12:00:00`).getDate());

  const setHabit = (key, value) => update((next) => {
    next.logs[selectedDate] ||= { meals: {}, water: 0, sleep: 0, distance: 0 };
    next.logs[selectedDate][key] = Math.max(0, Number(value));
    delete next.logs[selectedDate].totalsOverride;
  });
  const removeFood = (meal, id) => update((next) => {
    next.logs[selectedDate].meals[meal] = next.logs[selectedDate].meals[meal].filter((entry) => entry.id !== id);
  });

  return (
    <div className="page-content today-page">
      <section className="date-strip parchment-card">
        <button className="date-arrow" onClick={() => update((next) => { next.selectedDate = addDays(next.selectedDate, -7); })}>‹</button>
        <div className="week-days">
          {dates.map((date) => {
            const active = date === selectedDate;
            const status = goalStatus(state.logs[date], targets);
            const completion = Object.values(status).filter(Boolean).length;
            return <button key={date} className={active ? 'active' : ''} onClick={() => update((next) => { next.selectedDate = date; })}><span>{shortDate(date).split(' ')[0]}</span><strong>{new Date(`${date}T12:00:00`).getDate()}</strong><i className={completion >= 4 ? 'good' : completion ? 'partial' : ''} /></button>;
          })}
        </div>
        <button className="date-arrow" onClick={() => update((next) => { next.selectedDate = addDays(next.selectedDate, 7); })}>›</button>
        <button className="calendar-jump" onClick={() => go('calendar')}>▦</button>
      </section>

      <div className="today-grid">
        <div className="today-main">
          <section className="daily-hero parchment-card">
            <div className="hero-copy">
              <p className="eyebrow">{new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(`${selectedDate}T12:00:00`))}</p>
              <h2>{formatDate(selectedDate, { year: 'numeric' })}</h2>
              <p>Nutrition comes first. The kingdom can wait until today’s duties are done.</p>
            </div>
            <CalorieRing actual={totals.calories} target={targets.calories} />
            <div className="macro-mini-grid">
              <MacroSmall label="Protein" value={totals.protein} target={targets.protein} color="var(--sage)" />
              <MacroSmall label="Fat" value={totals.fat} target={targets.fat} color="var(--gold)" />
              <MacroSmall label="Carbs" value={totals.carbs} target={targets.carbs} color="var(--terracotta)" />
            </div>
          </section>

          <div className="section-heading"><div><p className="eyebrow">Diary</p><h2>Meals</h2></div><button className="quiet-button" onClick={() => setModal({ type: 'add-food', meal: 'snack' })}>+ Quick add</button></div>
          <div className="meal-list">
            {MEALS.map((meal) => <MealCard key={meal.id} meal={meal} entries={log.meals?.[meal.id] || []} onAdd={() => setModal({ type: 'add-food', meal: meal.id })} onRemove={(id) => removeFood(meal.id, id)} />)}
          </div>

          <div className="section-heading"><div><p className="eyebrow">Daily habits</p><h2>Recovery and movement</h2></div></div>
          <section className="habit-grid">
            <HabitCard type="water" icon="◆" label="Water" value={log.water || 0} target={targets.water} unit="L" step="0.1" onChange={(value) => setHabit('water', value)} />
            <HabitCard type="sleep" icon="✦" label="Sleep" value={log.sleep || 0} target={targets.sleep} unit="h" step="0.1" onChange={(value) => setHabit('sleep', value)} />
            <HabitCard type="distance" icon="〽" label="Walking" value={log.distance || 0} target={targets.distance} unit="km" step="0.1" onChange={(value) => setHabit('distance', value)} />
          </section>
        </div>

        <aside className="today-aside">
          <button className="rumor-card" onClick={() => setModal({ type: 'rumors' })}>
            <div className="rumor-sign">The Well-Fed Dragon Tavern</div><span className="rumor-icon">♨</span><p className="eyebrow light">Latest rumor</p><blockquote>“{rumor}”</blockquote><small>Open the rumor chronicle →</small>
          </button>
          <section className="parchment-card side-card">
            <div className="side-title"><div><p className="eyebrow">Active duties</p><h3>Council quests</h3></div><button onClick={() => go('quests')}>All</button></div>
            {quests.slice(0, 2).map((quest) => <QuestCompact key={quest.id} quest={quest} />)}
          </section>
          <section className="parchment-card side-card">
            <div className="side-title"><div><p className="eyebrow">Insights</p><h3>Advisor notes</h3></div></div>
            {tips.slice(0, 2).map((tip) => <div className="tip-row" key={tip.title}><i>{tip.icon}</i><div><strong>{tip.title}</strong><p>{tip.text}</p></div></div>)}
          </section>
        </aside>
      </div>
    </div>
  );
}

function CalorieRing({ actual, target }) {
  const pct = Math.min(progress(actual, target), 1);
  const over = actual > target;
  return (
    <div className={`calorie-ring ${over ? 'over' : ''}`} style={{ '--progress': `${pct * 360}deg` }}>
      <div><strong>{Math.round(actual)}</strong><span>of {target} kcal</span><small>{over ? `+${Math.round(actual - target)} over` : `${Math.max(Math.round(target - actual), 0)} left`}</small></div>
    </div>
  );
}

function MacroSmall({ label, value, target, color }) {
  return <div className="macro-small"><div><span>{label}</span><strong>{round(value)} <small>/ {target} g</small></strong></div><div className="progress"><i style={{ width: `${Math.min(progress(value, target) * 100, 100)}%`, background: color }} /></div></div>;
}

function MealCard({ meal, entries, onAdd, onRemove }) {
  const totals = sumItems(entries);
  const [open, setOpen] = useState(true);
  return (
    <section className={`meal-card parchment-card ${open ? 'open' : ''}`}>
      <header onClick={() => setOpen(!open)}>
        <span className={`meal-icon ${meal.id}`}>{meal.icon}</span>
        <div><h3>{meal.label}</h3><p>{entries.length ? `${entries.length} ${entries.length === 1 ? 'item' : 'items'}` : 'Nothing added yet'}</p></div>
        <div className="meal-totals"><strong>{Math.round(totals.calories)} <small>kcal</small></strong><span>P {round(totals.protein)} · F {round(totals.fat)} · C {round(totals.carbs)}</span></div>
        <button className="meal-add" onClick={(e) => { e.stopPropagation(); onAdd(); }}>+</button><i className="chevron">⌄</i>
      </header>
      {open && <div className="meal-body">
        {!entries.length && <button className="empty-meal" onClick={onAdd}><span>＋</span><strong>Add foods</strong><small>From the built-in database, custom foods, or recipes</small></button>}
        {entries.map((entry) => <div className="food-row" key={entry.id}><div><strong>{entry.name}</strong><span>{round(entry.grams)} g</span></div><span>{round(entry.protein)} P</span><span>{round(entry.fat)} F</span><span>{round(entry.carbs)} C</span><b>{Math.round(entry.calories)} kcal</b><button aria-label="Delete" onClick={() => onRemove(entry.id)}>×</button></div>)}
      </div>}
    </section>
  );
}

function HabitCard({ type, icon, label, value, target, unit, step, onChange }) {
  const ratio = Math.min(progress(value, target), 1);
  return (
    <article className={`habit-card parchment-card ${type}`}>
      <div className="habit-top"><span>{icon}</span><div><p>{label}</p><strong>{round(value)} <small>/ {target} {unit}</small></strong></div></div>
      {type === 'water' && <div className="well"><div className="well-water" style={{ height: `${ratio * 100}%` }} /><span>⌇</span></div>}
      <div className="habit-progress"><i style={{ width: `${ratio * 100}%` }} /></div>
      <div className="habit-controls"><button onClick={() => onChange(round(Math.max(0, value - Number(step))))}>−</button><input type="number" min="0" step={step} value={value} onChange={(e) => onChange(e.target.value)} /><button onClick={() => onChange(round(value + Number(step)))}>+</button></div>
    </article>
  );
}

function QuestCompact({ quest }) {
  return <article className="quest-compact"><div className="quest-icon">⚑</div><div><span>{quest.tag}</span><h4>{quest.title}</h4><p>{quest.task}</p><div className="progress"><i style={{ width: `${quest.progress * 100}%` }} /></div><small>{quest.reward}</small></div></article>;
}

function FoodsPage({ state, setModal }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const all = [...BUILTIN_FOODS, ...state.customFoods, ...state.recipes];
  const categories = ['All', ...new Set(all.map((food) => food.category || 'My recipes'))];
  const filtered = all.filter((food) => (category === 'All' || (food.category || 'My recipes') === category) && food.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="page-content">
      <PageLead eyebrow="Accurate database" title="Foods and ingredients" text="The built-in database contains raw foods only. Create branded foods and prepared dishes yourself without filling optional nutrients.">
        <button className="secondary" onClick={() => setModal({ type: 'recipe' })}>+ Calculate dish</button><button className="primary" onClick={() => setModal({ type: 'custom-food' })}>+ Custom food</button>
      </PageLead>
      <section className="library-toolbar parchment-card"><label className="search-box"><span>⌕</span><input placeholder="Find a food…" value={query} onChange={(e) => setQuery(e.target.value)} /></label><div className="filter-chips">{categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></section>
      <section className="food-table parchment-card">
        <div className="table-head"><span>Name / 100 g</span><span>kcal</span><span>Protein</span><span>Fat</span><span>Carbs</span><span>Fiber</span></div>
        {filtered.map((food) => <div className="table-row" key={food.id}><span><i>{food.source === 'base' ? '◇' : food.source === 'recipe' ? '▤' : '✦'}</i><b>{food.name}</b><small>{food.category || 'My recipes'}{food.portionWeight ? ` · portion ${food.portionWeight} g` : ''}</small></span><strong>{round(food.calories)}</strong><span>{round(food.protein)} g</span><span>{round(food.fat)} g</span><span>{round(food.carbs)} g</span><span>{round(food.fiber)} g</span></div>)}
        {!filtered.length && <EmptyState icon="⌕" title="Nothing found" text="Change your search or create a custom food." />}
      </section>
    </div>
  );
}

function RecipesPage({ state, setModal }) {
  return (
    <div className="page-content">
      <PageLead eyebrow="Calculator" title="My dishes and recipes" text="Add raw ingredients and weights, then enter the finished dish weight. We calculate nutrition per 100 g."><button className="primary" onClick={() => setModal({ type: 'recipe' })}>+ New recipe</button></PageLead>
      <div className="recipe-grid">
        <button className="new-recipe-card" onClick={() => setModal({ type: 'recipe' })}><span>＋</span><h3>Calculate a new dish</h3><p>Ingredients → total nutrition → per 100 g</p></button>
        {state.recipes.map((recipe) => <article className="recipe-card parchment-card" key={recipe.id}><div className="recipe-crest">▤</div><p className="eyebrow">Saved dish</p><h3>{recipe.name}</h3><p>{recipe.ingredients.length} ingredients · yield {recipe.finalWeight} g</p><div className="recipe-nutrition"><strong>{round(recipe.calories)}<small>kcal</small></strong><span>P {round(recipe.protein)}</span><span>F {round(recipe.fat)}</span><span>C {round(recipe.carbs)}</span></div><small>per 100 g of finished dish</small></article>)}
      </div>
      {!state.recipes.length && <div className="content-note"><span>Kitchen tip</span>A saved dish can be added to any meal using a normal serving weight.</div>}
    </div>
  );
}

function CalendarPage({ state, update, go }) {
  const [month, setMonth] = useState(state.selectedDate);
  const dates = monthDates(month);
  const activeMonth = new Date(`${month}T12:00:00`).getMonth();
  const selectedLog = state.logs[state.selectedDate];
  const selectedTotals = dayTotals(selectedLog);
  return (
    <div className="page-content">
      <PageLead eyebrow="Chronicle" title="Calendar and history" text="Open any day to see nutrition, habits, earned rewards, and kingdom progress." />
      <div className="history-grid">
        <section className="month-card parchment-card">
          <header><button onClick={() => setMonth(addDays(new Date(new Date(`${month}T12:00:00`).getFullYear(), new Date(`${month}T12:00:00`).getMonth(), 1, 12).toISOString().slice(0, 10), -1))}>‹</button><h2>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(`${month}T12:00:00`))}</h2><button onClick={() => { const d = new Date(`${month}T12:00:00`); d.setMonth(d.getMonth() + 1); setMonth(toISO(d)); }}>›</button></header>
          <div className="month-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}</div>
          <div className="month-grid">{dates.map((date) => {
            const log = state.logs[date]; const totals = dayTotals(log); const inMonth = new Date(`${date}T12:00:00`).getMonth() === activeMonth; const selected = date === state.selectedDate;
            const good = log && goalStatus(log, state.profile.targets); const score = good ? Object.values(good).filter(Boolean).length : 0;
            return <button key={date} className={`${inMonth ? '' : 'muted'} ${selected ? 'selected' : ''}`} onClick={() => update((next) => { next.selectedDate = date; })}><strong>{new Date(`${date}T12:00:00`).getDate()}</strong>{log && <><i className={score >= 4 ? 'good' : score >= 2 ? 'partial' : 'low'} /><small>{Math.round(totals.calories)} kcal</small></>}</button>;
          })}</div>
        </section>
        <aside className="day-summary parchment-card">
          <p className="eyebrow">Selected day</p><h2>{formatDate(state.selectedDate, { year: 'numeric' })}</h2>
          {selectedLog ? <>
            <div className="summary-calories"><strong>{Math.round(selectedTotals.calories)}</strong><span>of {state.profile.targets.calories} kcal</span></div>
            <div className="summary-bars"><MacroSmall label="Protein" value={selectedTotals.protein} target={state.profile.targets.protein} color="var(--sage)" /><MacroSmall label="Fiber" value={selectedTotals.fiber} target={state.profile.targets.fiber} color="var(--gold)" /></div>
            <div className="history-habits"><span>◆ {selectedLog.water || 0} L</span><span>✦ {selectedLog.sleep || 0} h</span><span>〽 {selectedLog.distance || 0} km</span></div>
            <button className="primary full" onClick={() => go('today')}>Open diary</button>
          </> : <EmptyState icon="▦" title="No entries" text="Open the diary and add nutrition or habits for this day." />}
        </aside>
      </div>
    </div>
  );
}

function QuestsPage({ state }) {
  const quests = generateQuests(state.logs, state.selectedDate, state.profile.targets);
  const tips = analysisTips(state.logs, state.profile.targets);
  return (
    <div className="page-content">
      <PageLead eyebrow="Crown Council" title="Quests and smart analysis" text="There is no chatbot here: the advisor finds recurring patterns in daily totals and selects fair tasks from a rule-based library." />
      <section className="advisor-banner"><div className="advisor-portrait">♙</div><div><p className="eyebrow light">Weekly report</p><h2>“The kingdom is stable. However, the wells and mages have filed a joint petition.”</h2><p>Quests evaluate daily totals and never force a specific breakfast, lunch, or number of meals.</p></div></section>
      <div className="quest-page-grid"><div><div className="section-heading"><div><p className="eyebrow">In progress</p><h2>Active quests</h2></div></div>{quests.map((quest) => <article className="quest-full parchment-card" key={quest.id}><div className="quest-seal">⚑</div><div><span className="tag">{quest.tag}</span><h3>{quest.title}</h3><p className="flavor">“{quest.flavor}”</p><strong>{quest.task}</strong><div className="progress large"><i style={{ width: `${quest.progress * 100}%` }} /></div><footer><span>{Math.round(quest.progress * 100)}% complete</span><b>Reward: {quest.reward}</b></footer></div></article>)}</div>
        <aside><div className="section-heading"><div><p className="eyebrow">Insights</p><h2>Advisor notes</h2></div></div><section className="parchment-card analysis-list">{tips.map((tip) => <div className="analysis-item" key={tip.title}><i>{tip.icon}</i><div><h3>{tip.title}</h3><p>{tip.text}</p></div></div>)}</section><div className="fairness-note"><strong>Fairness rules</strong><p>Protein, fiber, water, and sleep use practical ranges. Exactly 100% is never required.</p></div></aside></div>
    </div>
  );
}

function KingdomPage({ state, update, notify }) {
  const [selectedPlotId, setSelectedPlotId] = useState('townhall');
  const log = state.logs[state.selectedDate] || { meals: {} };
  const rewards = rewardForDay(log, state.profile.targets);
  const claimed = state.claimedDates.includes(state.selectedDate);
  const unlockedLands = state.unlockedLands || ['townhall'];
  const selectedPlot = LAND_PLOTS.find((plot) => plot.id === selectedPlotId) || LAND_PLOTS[0];
  const selectedBuilding = BUILDINGS.find((building) => building.id === selectedPlot.buildingId);
  const selectedLevel = state.buildings[selectedBuilding.id] || 0;
  const selectedTier = selectedBuilding.levels[selectedLevel];
  const selectedLandUnlocked = unlockedLands.includes(selectedPlot.id);

  const claim = () => {
    if (claimed) return;
    update((next) => {
      Object.entries(rewards).forEach(([key, value]) => { next.resources[key] = round((next.resources[key] || 0) + value); });
      next.claimedDates.push(next.selectedDate);
      next.notices.unshift({ id: uid('notice'), date: next.selectedDate, text: 'Daily resources delivered to the treasury.' });
    });
    notify('Daily resources added to the treasury');
  };

  const unlockLand = (plot) => {
    if (unlockedLands.includes(plot.id) || !canAfford(state.resources, plot.landCost)) return;
    update((next) => {
      next.resources = subtractCost(next.resources, plot.landCost);
      next.unlockedLands ||= ['townhall'];
      next.unlockedLands.push(plot.id);
      next.notices.unshift({ id: uid('notice'), date: next.selectedDate, text: `${plot.name} was connected to the road network.` });
    });
    notify(`${plot.name} unlocked`);
  };

  const build = (building) => {
    const level = state.buildings[building.id] || 0;
    const tier = building.levels[level];
    const plot = LAND_PLOTS.find((item) => item.buildingId === building.id);
    const landUnlocked = !plot || unlockedLands.includes(plot.id);
    if (!tier || !landUnlocked || !canAfford(state.resources, tier.cost)) return;
    update((next) => {
      next.resources = subtractCost(next.resources, tier.cost);
      next.buildings[building.id] = level + 1;
      next.notices.unshift({ id: uid('notice'), date: next.selectedDate, text: `${building.name}: level ${level + 1} complete.` });
    });
    notify(`${building.name} is now level ${level + 1}`);
  };

  return (
    <div className="kingdom-page">
      <section className="kingdom-top">
        <div><p className="eyebrow light">{state.profile.name}'s Domain</p><h1>Valley of Quiet Dawn</h1><p>Buy land with Road Miles. Build only on the plot assigned to each building.</p></div>
      </section>
      <section className="resource-ribbon">{Object.entries(RESOURCE_META).map(([key, meta]) => <div key={key}><i style={{ color: meta.color }}>{meta.icon}</i><span><small>{meta.label}</small><strong>{round(state.resources[key])}</strong></span></div>)}</section>
      <div className="kingdom-layout">
        <KingdomScene state={state} selectedPlotId={selectedPlot.id} onSelectPlot={setSelectedPlotId} />
        <aside className="kingdom-panel">
          <section className="claim-card">
            <div><p className="eyebrow">Reward for {formatDate(state.selectedDate)}</p><h3>{claimed ? 'Treasury replenished' : 'Daily resources ready'}</h3></div>
            <div className="earned-row">{Object.entries(rewards).filter(([, value]) => value > 0).map(([key, value]) => <span key={key}>{RESOURCE_META[key].icon} +{value}</span>)}</div>
            <button className="primary full" disabled={claimed || !Object.values(rewards).some(Boolean)} onClick={claim}>{claimed ? 'Collected' : 'Collect resources'}</button>
          </section>
          <section className="plot-focus">
            <p className="eyebrow">Selected land</p>
            <h2>{selectedPlot.name}</h2>
            <p>{selectedPlot.description}</p>
            <div className="plot-status-grid">
              <span><small>District</small><strong>{selectedPlot.district}</strong></span>
              <span><small>Building</small><strong>{selectedBuilding.name}</strong></span>
              <span><small>Level</small><strong>{selectedLevel}/3</strong></span>
            </div>
            {!selectedLandUnlocked && <button className="primary full" disabled={!canAfford(state.resources, selectedPlot.landCost)} onClick={() => unlockLand(selectedPlot)}>Buy land <CostDisplay cost={selectedPlot.landCost} /></button>}
            {selectedLandUnlocked && <button className="primary full" disabled={!selectedTier || !canAfford(state.resources, selectedTier?.cost || {})} onClick={() => build(selectedBuilding)}>{selectedTier ? (selectedLevel ? 'Upgrade building' : 'Build here') : 'Maximum level'}</button>}
            {selectedLandUnlocked && selectedTier && <div className="next-cost"><small>Next cost</small><CostDisplay cost={selectedTier.cost} /></div>}
          </section>
          <div className="shop-list plot-list">
            {LAND_PLOTS.map((plot) => {
              const building = BUILDINGS.find((item) => item.id === plot.buildingId);
              const level = state.buildings[building.id] || 0;
              const landUnlocked = unlockedLands.includes(plot.id);
              return (
                <article className={`shop-item plot-item ${selectedPlot.id === plot.id ? 'active' : ''}`} key={plot.id}>
                  <button className="plot-select" type="button" onClick={() => setSelectedPlotId(plot.id)}>
                    <span className={`plot-token ${landUnlocked ? 'ready' : 'locked'}`}>
                      <strong>{landUnlocked ? (level ? `L${level}` : 'Ready') : `${plot.landCost.road} mi`}</strong>
                      <small>{landUnlocked ? 'land' : 'cost'}</small>
                    </span>
                  </button>
                  <div><div className="shop-name"><h4>{plot.name}</h4><span>{landUnlocked ? `lvl. ${level}/3` : 'locked'}</span></div><p>{building.name} · {plot.district}</p><small>{landUnlocked ? (level ? 'Building established' : 'Land ready for construction') : <CostDisplay cost={plot.landCost} />}</small></div>
                  {!landUnlocked ? <button disabled={!canAfford(state.resources, plot.landCost)} onClick={() => unlockLand(plot)}>Buy</button> : <button disabled={!building.levels[level] || !canAfford(state.resources, building.levels[level]?.cost || {})} onClick={() => build(building)}>{level ? 'Up' : 'Build'}</button>}
                </article>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProfilePage({
  state, update, reset, startFromZero, notify,
}) {
  const [draft, setDraft] = useState(structuredClone(state.profile));
  useEffect(() => { setDraft(structuredClone(state.profile)); }, [state.profile]);
  const numericDraft = (key, value) => setDraft({ ...draft, [key]: value === '' ? '' : Number(value) });
  const save = (event) => {
    event.preventDefault();
    update((next) => {
      next.profile = draft;
      next.needsProfileSetup = false;
      next.account.email = draft.email;
    });
    notify('Profile and targets saved');
  };
  const targetFields = [['calories', 'Calories', 'kcal'], ['protein', 'Protein', 'g'], ['fat', 'Fat', 'g'], ['carbs', 'Carbs', 'g'], ['fiber', 'Fiber', 'g'], ['sugar', 'Sugar', 'g'], ['water', 'Water', 'L'], ['sleep', 'Sleep', 'h'], ['distance', 'Walking', 'km']];
  const portraitLetter = (draft.name || 'R').slice(0, 1).toUpperCase();
  return (
    <div className="page-content">
      <PageLead eyebrow="Personal settings" title="Profile and targets" text="Your targets always remain under your control. The app never changes them automatically." />
      <section className="demo-notice parchment-card">
        <div><p className="eyebrow">Demo version</p><h2>Prepared data is included for exploration.</h2></div>
        <p>This demo build is designed to show the app functionality. Reset demo data restores the prepared showcase. Start from zero clears the diary, resources, progress, and profile so a new user can begin from a blank state.</p>
      </section>
      <form onSubmit={save} className="profile-grid">
        <section className="profile-card parchment-card"><div className="profile-portrait">{portraitLetter}<button type="button">✎</button></div><p className="eyebrow">Ruler of the Kingdom</p><h2>{draft.name || 'New ruler'}</h2><p>{draft.email || 'Add your email'}</p></section>
        <section className="form-section parchment-card"><div className="section-heading"><div><p className="eyebrow">Basic information</p><h2>About you</h2></div></div><div className="form-grid"><Field label="Name"><input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field><Field label="Email"><input required type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field><Field label="Age"><input type="number" value={draft.age} onChange={(e) => numericDraft('age', e.target.value)} /></Field><Field label="Height, cm"><input type="number" value={draft.height} onChange={(e) => numericDraft('height', e.target.value)} /></Field><Field label="Weight, kg"><input type="number" step="0.1" value={draft.weight} onChange={(e) => numericDraft('weight', e.target.value)} /></Field></div></section>
        <section className="form-section parchment-card targets-section"><div className="section-heading"><div><p className="eyebrow">Daily targets</p><h2>Nutrition and habits</h2></div><span className="manual-badge">Manual settings</span></div><div className="target-grid">{targetFields.map(([key, label, unit]) => <Field label={label} key={key}><div className="input-unit"><input type="number" min="0" step="0.1" value={draft.targets[key]} onChange={(e) => setDraft({ ...draft, targets: { ...draft.targets, [key]: Number(e.target.value) } })} /><span>{unit}</span></div></Field>)}</div><div className="reward-explainer"><i>i</i><p><strong>How rewards work</strong>Protein, fiber, water, and sleep: full reward from 100%, half at 85–99%. Calories: full reward in the 85–100% range; exceeding the target is not rewarded.</p></div></section>
        <div className="profile-actions"><div className="reset-stack"><button className="danger-link" type="button" onClick={() => { if (window.confirm('Restore demo data? Your changes will be deleted.')) { reset(); notify('Demo data restored'); } }}>Reset demo data</button><button className="danger-link" type="button" onClick={() => { if (window.confirm('Start from zero? This clears diary history, resources, kingdom progress, and profile details.')) { startFromZero(); notify('Clean start ready. Fill in your profile to begin.'); } }}>Start from zero</button></div><button className="secondary" type="button" onClick={() => update((next) => { next.account.authenticated = false; })}>Sign out</button><button className="primary" type="submit">Save changes</button></div>
      </form>
    </div>
  );
}

function AddFoodModal({ state, update, meal, close, notify, setModal }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(100);
  const [unit, setUnit] = useState('g');
  const foods = [...BUILTIN_FOODS, ...state.customFoods, ...state.recipes].filter((food) => food.name.toLowerCase().includes(query.toLowerCase()));
  const add = () => {
    if (!selected || amount <= 0) return;
    const entry = nutritionFor(selected, Number(amount), unit);
    update((next) => {
      next.logs[next.selectedDate] ||= { meals: {}, water: 0, sleep: 0, distance: 0 };
      next.logs[next.selectedDate].meals ||= {};
      next.logs[next.selectedDate].meals[meal] ||= [];
      next.logs[next.selectedDate].meals[meal].push(entry);
      delete next.logs[next.selectedDate].totalsOverride;
    });
    notify(`${selected.name} added to ${MEALS.find((m) => m.id === meal)?.label.toLowerCase()}`);
    close();
  };
  return (
    <Modal close={close} wide>
      <div className="modal-heading"><div><p className="eyebrow">{MEALS.find((m) => m.id === meal)?.label}</p><h2>Add food</h2></div><button className="quiet-button" onClick={() => setModal({ type: 'custom-food' })}>+ Create custom</button></div>
      <label className="search-box modal-search"><span>⌕</span><input autoFocus placeholder="Start typing a food name…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      <div className="food-picker">
        <div className="picker-list">{foods.slice(0, 30).map((food) => <button key={food.id} className={selected?.id === food.id ? 'active' : ''} onClick={() => { setSelected(food); setUnit(food.portionWeight ? 'portion' : 'g'); setAmount(food.portionWeight ? 1 : 100); }}><i>{food.source === 'recipe' ? '▤' : food.source === 'base' ? '◇' : '✦'}</i><span><strong>{food.name}</strong><small>{round(food.calories)} kcal · P {round(food.protein)} · F {round(food.fat)} · C {round(food.carbs)}</small></span><b>›</b></button>)}</div>
        <div className="picker-detail">{selected ? <><div className="selected-food-icon">◇</div><p className="eyebrow">Selected</p><h3>{selected.name}</h3><div className="amount-fields"><Field label="Amount"><input type="number" min="0" step="0.1" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field><Field label="Unit"><select value={unit} onChange={(e) => setUnit(e.target.value)}><option value="g">grams</option>{selected.portionWeight && <option value="portion">portion ({selected.portionWeight} g)</option>}</select></Field></div><div className="calculated-preview">{Object.entries(nutritionFor(selected, Number(amount), unit)).filter(([key]) => ['calories', 'protein', 'fat', 'carbs'].includes(key)).map(([key, value]) => <span key={key}><small>{LABELS[key]}</small><strong>{round(value)}{key === 'calories' ? '' : ' g'}</strong></span>)}</div><button className="primary full" onClick={add}>Add to diary</button></> : <EmptyState icon="◇" title="Choose a food" text="Nutrition for the specified weight or portion will appear here." />}</div>
      </div>
    </Modal>
  );
}

function CustomFoodModal({ update, close, notify }) {
  const [food, setFood] = useState({ name: '', category: 'My foods', calories: '', protein: '', fat: '', carbs: '', fiber: '', sugar: '', portionWeight: '' });
  const save = (event) => {
    event.preventDefault();
    update((next) => { next.customFoods.push({ ...food, id: uid('food'), source: 'custom', unit: 'g', ...Object.fromEntries(['calories', 'protein', 'fat', 'carbs', 'fiber', 'sugar', 'portionWeight'].map((key) => [key, Number(food[key]) || 0])) }); });
    notify('Food saved to your personal database'); close();
  };
  return <Modal close={close}><form onSubmit={save}><div className="modal-heading"><div><p className="eyebrow">Personal database</p><h2>New food</h2></div></div><Field label="Name"><input autoFocus required value={food.name} onChange={(e) => setFood({ ...food, name: e.target.value })} placeholder="For example, protein bar" /></Field><div className="form-grid four">{['calories', 'protein', 'fat', 'carbs'].map((key) => <Field label={`${LABELS[key]} per 100 g *`} key={key}><input type="number" min="0" step="0.1" required value={food[key]} onChange={(e) => setFood({ ...food, [key]: e.target.value })} /></Field>)}</div><div className="form-grid three">{['fiber', 'sugar'].map((key) => <Field label={`${LABELS[key]} (optional)`} key={key}><input type="number" min="0" step="0.1" value={food[key]} onChange={(e) => setFood({ ...food, [key]: e.target.value })} /></Field>)}<Field label="Serving weight, g (optional)"><input type="number" min="0" step="0.1" value={food.portionWeight} onChange={(e) => setFood({ ...food, portionWeight: e.target.value })} /></Field></div><div className="modal-actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary" type="submit">Save food</button></div></form></Modal>;
}

function FoodDropdown({ foods, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selectedFood = foods.find((food) => food.id === value) || foods[0];
  return (
    <div className={`food-dropdown ${open ? 'open' : ''}`}>
      <button className="food-dropdown-trigger" type="button" onClick={() => setOpen(!open)}>
        <span>{selectedFood?.name}</span>
        <i>⌄</i>
      </button>
      {open && (
        <div className="food-dropdown-menu" role="listbox">
          {foods.map((food) => (
            <button className={food.id === value ? 'active' : ''} type="button" key={food.id} onClick={() => { onChange(food.id); setOpen(false); }}>
              <strong>{food.name}</strong>
              <small>{round(food.calories)} kcal · P {round(food.protein)} · F {round(food.fat)} · C {round(food.carbs)}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeModal({ state, update, close, notify }) {
  const sourceFoods = [...BUILTIN_FOODS, ...state.customFoods];
  const [name, setName] = useState(''); const [finalWeight, setFinalWeight] = useState(''); const [ingredients, setIngredients] = useState([]); const [foodId, setFoodId] = useState(sourceFoods[0].id); const [grams, setGrams] = useState(100);
  const addIngredient = () => { const food = sourceFoods.find((item) => item.id === foodId); if (!food || grams <= 0) return; setIngredients([...ingredients, { ...nutritionFor(food, Number(grams)), sourceFood: food }]); };
  const total = sumItems(ingredients); const per100 = Number(finalWeight) > 0 ? Object.fromEntries(NUTRIENTS.map((key) => [key, round(total[key] / Number(finalWeight) * 100)])) : Object.fromEntries(NUTRIENTS.map((key) => [key, 0]));
  const save = (event) => { event.preventDefault(); if (!ingredients.length || !finalWeight) return; update((next) => { next.recipes.push({ id: uid('recipe'), name, category: 'My recipes', source: 'recipe', unit: 'g', finalWeight: Number(finalWeight), ingredients: ingredients.map((item) => ({ foodId: item.foodId, name: item.name, grams: item.grams })), ...per100 }); }); notify('Recipe calculated and saved'); close(); };
  return <Modal close={close} wide><form onSubmit={save}><div className="modal-heading"><div><p className="eyebrow">Dish calculator</p><h2>New recipe</h2></div></div><div className="recipe-builder"><div><Field label="Dish name"><input required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="For example, chicken with rice" /></Field><div className="ingredient-add"><div className="field"><span>Raw ingredient</span><FoodDropdown foods={sourceFoods} value={foodId} onChange={setFoodId} /></div><Field label="Raw weight, g"><input type="number" min="0" step="0.1" value={grams} onChange={(e) => setGrams(e.target.value)} /></Field><button type="button" className="secondary" onClick={addIngredient}>Add</button></div><div className="ingredient-list">{ingredients.map((item, index) => <div key={`${item.id}-${index}`}><span><strong>{item.name}</strong><small>{item.grams} g raw ingredient</small></span><b>{Math.round(item.calories)} kcal</b><button type="button" onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))}>×</button></div>)}{!ingredients.length && <p>Add at least one raw ingredient.</p>}</div><Field label="Finished dish weight, g"><input required type="number" min="1" step="0.1" value={finalWeight} onChange={(e) => setFinalWeight(e.target.value)} placeholder="Weight after cooking" /></Field></div><aside className="recipe-result"><p className="eyebrow">Calculation</p><h3>Per 100 g of finished dish</h3><div className="result-calories"><strong>{round(per100.calories)}</strong><span>kcal</span></div><div className="result-macros"><span><small>Protein</small><b>{round(per100.protein)} g</b></span><span><small>Fat</small><b>{round(per100.fat)} g</b></span><span><small>Carbs</small><b>{round(per100.carbs)} g</b></span></div><div className="result-total"><span>Total in dish</span><strong>{Math.round(total.calories)} kcal</strong></div><button className="primary full" disabled={!ingredients.length || !finalWeight || !name} type="submit">Save recipe</button></aside></div></form></Modal>;
}

function RumorHistory({ state, close }) {
  const entries = Object.keys(state.logs).sort().reverse().slice(0, 14).map((date, index) => ({ date, text: selectRumor(state.logs[date], state.profile.targets, index) }));
  return <Modal close={close}><div className="rumor-history"><div className="modal-heading"><div><p className="eyebrow">Tavern archive</p><h2>Rumors and kingdom notes</h2></div></div>{entries.map((entry, index) => <article key={entry.date} className={index === 0 ? 'latest' : ''}><span>{formatDate(entry.date)}</span><p>“{entry.text}”</p></article>)}</div></Modal>;
}

function Modal({ children, close, wide = false }) {
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}><div className={`modal parchment-card ${wide ? 'wide' : ''}`}><button className="modal-close" onClick={close}>×</button>{children}</div></div>;
}

function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }
function CostDisplay({ cost }) { return <span className="resource-cost">{Object.entries(cost).map(([key, amount]) => <span key={key} title={RESOURCE_META[key]?.label}><i style={{ color: RESOURCE_META[key]?.color }}>{RESOURCE_META[key]?.icon}</i><b>{amount}</b></span>)}</span>; }
function PageLead({ eyebrow, title, text, children }) { return <header className="page-lead"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></div>{children && <aside>{children}</aside>}</header>; }
function EmptyState({ icon, title, text }) { return <div className="empty-state"><span>{icon}</span><h3>{title}</h3><p>{text}</p></div>; }

export default App;