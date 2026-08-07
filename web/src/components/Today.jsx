import { useState } from 'react';
import { CalendarDays, Check, ExternalLink, Target } from 'lucide-react';
import { DIFFICULTY } from '../data/phaseIcons';
import { isWeekend, todayTarget } from '../data/selectors';
import ProgressBar from './ui/ProgressBar';
import Reveal from './ui/Reveal';

/** Local-only ticks. The committed record is `done` in progress.js —
 *  this is just a scratchpad for the current sitting. */
export default function Today({ meta, nextAction }) {
  const [ticked, setTicked] = useState(() => new Set());

  const target = todayTarget(meta.schedule);
  const weekend = isWeekend();
  const queue = nextAction.problems ?? [];
  const pct = target ? (ticked.size / target) * 100 : 0;

  const toggle = (id) =>
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Reveal as="section" className="section" id="today" aria-labelledby="today-title" delay={40}>
      <div className="card card-lit panel today">
        <header className="panel-head">
          <span className="panel-icon" style={{ '--panel-hue': 'var(--hue-1)' }}>
            <Target size={15} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <div>
            <h2 id="today-title" className="panel-title">
              Today's set
            </h2>
            <p className="panel-sub">
              <CalendarDays size={11} strokeWidth={2.2} aria-hidden="true" />
              {weekend ? 'Weekend' : 'Weekday'} — {target} problems
            </p>
          </div>
          <span className={`pill ${ticked.size >= target ? 'pill-success' : 'pill-muted'} panel-count`}>
            {ticked.size}/{target}
          </span>
        </header>

        <div className="today-meter">
          <ProgressBar percent={pct} active tone={ticked.size >= target ? 'success' : 'gradient'} />
        </div>

        {queue.length === 0 ? (
          <p className="empty">Nothing queued — next session will fill this in.</p>
        ) : (
          <ul className="today-list">
            {queue.map((p) => {
              const d = DIFFICULTY[p.difficulty];
              const isTicked = ticked.has(p.id);

              return (
                <li key={p.id} className={`today-item ${isTicked ? 'is-done' : ''}`}>
                  <button
                    type="button"
                    className={`check ${isTicked ? 'is-checked' : ''}`}
                    onClick={() => toggle(p.id)}
                    aria-pressed={isTicked}
                  >
                    {isTicked && <Check size={12} strokeWidth={3.6} aria-hidden="true" />}
                    <span className="sr-only">Mark {p.name} done</span>
                  </button>

                  <span className="today-name">{p.name}</span>

                  <span className="diff" style={{ '--diff': d.color }}>
                    {d.label}
                  </span>

                  {p.url && (
                    <a
                      className="today-link"
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${p.name} on LeetCode`}
                    >
                      <ExternalLink size={13} strokeWidth={2.2} aria-hidden="true" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <p className="today-rule">
          Rule: 25 minutes of honest thinking before any hint. Brute force counts as a solution —
          write it, then beat it.
        </p>
      </div>
    </Reveal>
  );
}
