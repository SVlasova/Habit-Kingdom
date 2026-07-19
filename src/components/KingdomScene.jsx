import { BUILDINGS, LAND_PLOTS } from '../data.js';

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`;

function levelFor(state, id) {
  const value = state?.buildings?.[id];
  return typeof value === 'number' ? value : Number(value?.level || 0);
}

function buildingFile(building, level) {
  const visibleLevel = Math.max(1, Math.min(3, level));
  return `${building.imagePrefix}-${visibleLevel}.${building.imageExt || 'webp'}`;
}

function plotState(state, plot) {
  const unlockedLands = state?.unlockedLands || ['townhall'];
  const building = BUILDINGS.find((item) => item.id === plot.buildingId);
  const level = levelFor(state, building.id);
  return { building, level, landUnlocked: unlockedLands.includes(plot.id) };
}

export default function KingdomScene({ state, selectedPlotId, onSelectPlot }) {
  return (
    <section className="kingdom-board" aria-label="Kingdom map with fixed land slots">
      <img className="kingdom-board-art" src={asset('kingdom-map-bg-v3.png')} alt="" draggable="false" />

      <div className="kingdom-plot-layer">
        {LAND_PLOTS.map((plot) => {
          const { building, level, landUnlocked } = plotState(state, plot);
          const active = selectedPlotId === plot.id;
          const built = level > 0;
          return (
            <button
              key={plot.id}
              type="button"
              className={`kingdom-site ${active ? 'active' : ''} ${landUnlocked ? 'unlocked' : 'locked'} ${built ? 'built' : 'empty'}`}
              style={{ left: `${plot.x}%`, top: `${plot.y}%` }}
              onClick={() => onSelectPlot(plot.id)}
              aria-label={`${plot.name}: ${building.name}, ${landUnlocked ? `level ${level}` : 'land locked'}`}
            >
              <span className="site-pad" />
              {!built && <span className="empty-site">{landUnlocked ? 'Build' : `${plot.landCost.road} mi`}</span>}
              {built && <img className={`site-building site-building-${building.id}`} src={asset(buildingFile(building, level))} alt="" draggable="false" />}
              <span className="site-label"><strong>{building.name}</strong><small>{built ? `Level ${level}` : landUnlocked ? 'Land ready' : 'Land locked'}</small></span>
            </button>
          );
        })}
      </div>

      <div className="kingdom-map-note">Fixed building slots - no free dragging</div>
    </section>
  );
}
