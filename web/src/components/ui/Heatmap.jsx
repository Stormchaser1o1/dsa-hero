import { formatShort, monthGrid, todayKey } from '../../lib/date';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function levelFor(count) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

/** Month view of practice activity, GitHub-contribution style. */
export default function Heatmap({ year, month, activity, onSelect }) {
  const cells = monthGrid(year, month);
  const today = todayKey();

  return (
    <div className="heatmap">
      <div className="heatmap-days" aria-hidden="true">
        {DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="heatmap-grid" role="grid" aria-label="Practice activity">
        {cells.map((cell) => {
          const count = activity.get(cell.key) ?? 0;
          const lvl = levelFor(count);
          return (
            <button
              key={cell.key}
              type="button"
              role="gridcell"
              className={`heat ${cell.inMonth ? '' : 'is-outside'} ${
                cell.key === today ? 'is-today' : ''
              }`}
              data-level={lvl}
              onClick={onSelect ? () => onSelect(cell.key) : undefined}
              title={`${formatShort(cell.key)} — ${count} attempt${count === 1 ? '' : 's'}`}
            >
              <span className="sr-only">
                {formatShort(cell.key)}: {count} attempts
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
