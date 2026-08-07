import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Circle, ExternalLink, Loader } from 'lucide-react';
import { DIFFICULTY, PHASE_ICONS, hueFor } from '../data/phaseIcons';
import ProgressBar from './ui/ProgressBar';
import Reveal from './ui/Reveal';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'current', label: 'In progress' },
  { id: 'upcoming', label: 'Upcoming' },
];

const STATE_META = {
  done: { label: 'Done', pill: 'pill-success', Icon: Check },
  current: { label: 'In progress', pill: 'pill-accent', Icon: Loader },
  upcoming: { label: 'Upcoming', pill: 'pill-muted', Icon: Circle },
};

/** Animates between 0 and the measured content height so the accordion
 *  never jumps, and settles on `auto` so nested content can reflow. */
function Collapse({ open, children }) {
  const inner = useRef(null);
  const [height, setHeight] = useState(open ? 'auto' : 0);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;

    if (open) {
      setHeight(el.scrollHeight);
      const t = setTimeout(() => setHeight('auto'), 260);
      return () => clearTimeout(t);
    }

    setHeight(el.scrollHeight);
    const raf = requestAnimationFrame(() => setHeight(0));
    return () => cancelAnimationFrame(raf);
  }, [open, children]);

  return (
    <div className="collapse" style={{ height }} aria-hidden={!open}>
      <div ref={inner}>{children}</div>
    </div>
  );
}

function PhaseRow({ phase, index, open, onToggle }) {
  const Icon = PHASE_ICONS[phase.id];
  const { label, pill, Icon: StateIcon } = STATE_META[phase.state];
  const hue = hueFor(index);

  const total = phase.problems.length;
  const done = phase.problems.filter((p) => p.done).length;
  const pct = total ? (done / total) * 100 : 0;
  const panelId = `phase-panel-${phase.id}`;

  return (
    <li className={`phase ${phase.state} ${open ? 'is-open' : ''}`} style={{ '--hue': hue }}>
      <span className="phase-rail" aria-hidden="true" />

      <button
        type="button"
        className="phase-btn"
        onClick={total ? onToggle : undefined}
        disabled={!total}
        aria-expanded={total ? open : undefined}
        aria-controls={total ? panelId : undefined}
      >
        <span className="phase-node">
          <Icon size={16} strokeWidth={2.1} aria-hidden="true" />
          {phase.state === 'done' && (
            <span className="phase-node-badge">
              <Check size={9} strokeWidth={4} aria-hidden="true" />
            </span>
          )}
          {phase.state === 'current' && <span className="phase-node-ping" aria-hidden="true" />}
        </span>

        <span className="phase-body">
          <span className="phase-title-row">
            <span className="phase-title">{phase.name}</span>
            <span className={`pill ${pill} phase-state`}>
              <StateIcon size={10} strokeWidth={3} aria-hidden="true" />
              {label}
            </span>
          </span>

          {phase.blurb && <span className="phase-blurb">{phase.blurb}</span>}

          {total > 0 && (
            <span className="phase-progress">
              <ProgressBar percent={pct} height={4} tone={done === total ? 'success' : 'gradient'} />
              <span className="phase-count">
                {done}/{total}
              </span>
            </span>
          )}
        </span>

        {total > 0 && <ChevronDown size={16} className="phase-chevron" aria-hidden="true" />}
      </button>

      {total > 0 && (
        <Collapse open={open}>
          <ul className="modules" id={panelId}>
            {phase.problems.map((p, i) => {
              const d = DIFFICULTY[p.difficulty];

              return (
                <li
                  key={p.id}
                  className={`module ${p.done ? 'is-done' : ''}`}
                  style={{ '--i': i }}
                >
                  <span className="module-check">
                    {p.done && <Check size={11} strokeWidth={3.6} aria-hidden="true" />}
                  </span>

                  <span className="module-name">{p.name}</span>

                  <span className="diff" style={{ '--diff': d.color }}>
                    {d.label}
                  </span>

                  {p.url && (
                    <a
                      className="module-link"
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Open ${p.name} on LeetCode`}
                    >
                      <ExternalLink size={12} strokeWidth={2.2} aria-hidden="true" />
                    </a>
                  )}

                  {p.done && <span className="sr-only">solved</span>}
                </li>
              );
            })}
          </ul>
        </Collapse>
      )}
    </li>
  );
}

export default function Roadmap({ phases, currentPhaseId }) {
  const [filter, setFilter] = useState('all');
  const [openIds, setOpenIds] = useState(() => new Set([currentPhaseId]));

  const visible = useMemo(
    () => (filter === 'all' ? phases : phases.filter((p) => p.state === filter)),
    [filter, phases]
  );

  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const expandable = visible.filter((p) => p.problems.length > 0);
  const allOpen = expandable.length > 0 && expandable.every((p) => openIds.has(p.id));

  return (
    <Reveal as="section" className="section" id="roadmap" aria-labelledby="roadmap-title">
      <header className="section-head">
        <div>
          <h2 id="roadmap-title" className="section-title">
            Roadmap
          </h2>
          <p className="section-sub">14 phases from first loop to FAANG-level hards</p>
        </div>

        <div className="section-tools">
          <div className="segmented" role="tablist" aria-label="Filter phases">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`segment ${filter === f.id ? 'is-active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {expandable.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() =>
                setOpenIds(allOpen ? new Set() : new Set(expandable.map((p) => p.id)))
              }
            >
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          )}
        </div>
      </header>

      {visible.length === 0 ? (
        <p className="empty">No phases match this filter.</p>
      ) : (
        <ul className="timeline">
          {visible.map((phase) => (
            <PhaseRow
              key={phase.id}
              phase={phase}
              index={phases.indexOf(phase)}
              open={openIds.has(phase.id)}
              onToggle={() => toggle(phase.id)}
            />
          ))}
        </ul>
      )}
    </Reveal>
  );
}
