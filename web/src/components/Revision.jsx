import { useState } from 'react';
import { AlertTriangle, Check, PartyPopper, RotateCcw } from 'lucide-react';
import Reveal from './ui/Reveal';
import { daysUntil } from '../data/selectors';

function RevisionCard({ revisionDue }) {
  const [done, setDone] = useState(() => new Set());

  const toggle = (topic) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });

  const allDone = revisionDue.length > 0 && done.size === revisionDue.length;

  return (
    <div className="card card-lit panel">
      <header className="panel-head">
        <span className="panel-icon" style={{ '--panel-hue': 'var(--hue-2)' }}>
          <RotateCcw size={15} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <div>
          <h2 className="panel-title">Re-solve queue</h2>
          <p className="panel-sub">A problem is yours only when you can redo it cold</p>
        </div>
        {revisionDue.length > 0 && (
          <span className={`pill ${allDone ? 'pill-success' : 'pill-muted'} panel-count`}>
            {done.size}/{revisionDue.length}
          </span>
        )}
      </header>

      {revisionDue.length === 0 ? (
        <div className="empty-state">
          <span className="empty-glyph" aria-hidden="true">
            <RotateCcw size={18} strokeWidth={2.4} />
          </span>
          <p className="empty-title">Nothing to re-solve yet</p>
          <p className="empty-copy">
            Every solved problem comes back on day 1, day 7 and day 30.
          </p>
        </div>
      ) : (
        <ul className="revision-list">
          {revisionDue.map((row) => {
            const isDone = done.has(row.topic);
            const left = daysUntil(row.nextRevision);
            const overdue = left < 0;

            return (
              <li key={row.topic} className={`revision ${isDone ? 'is-done' : ''}`}>
                <button
                  type="button"
                  className={`check ${isDone ? 'is-checked' : ''}`}
                  onClick={() => toggle(row.topic)}
                  aria-pressed={isDone}
                >
                  {isDone && <Check size={12} strokeWidth={3.6} aria-hidden="true" />}
                  <span className="sr-only">Mark {row.topic} re-solved</span>
                </button>

                <span className="revision-body">
                  <span className="revision-topic">{row.topic}</span>
                  <span className="revision-meta">
                    solved {row.solvedOn} · {row.label}
                  </span>
                </span>

                <span
                  className={`pill ${overdue ? 'pill-streak' : 'pill-muted'} revision-when`}
                >
                  {overdue
                    ? `${Math.abs(left)}d late`
                    : left === 0
                      ? 'today'
                      : left === 1
                        ? 'tomorrow'
                        : `${left}d`}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {allDone && (
        <p className="panel-done">
          <PartyPopper size={14} strokeWidth={2.2} aria-hidden="true" />
          All caught up for today.
        </p>
      )}
    </div>
  );
}

function WeakAreasCard({ weakAreas }) {
  return (
    <div className="card card-lit panel">
      <header className="panel-head">
        <span className="panel-icon" style={{ '--panel-hue': 'var(--hue-5)' }}>
          <AlertTriangle size={15} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <div>
          <h2 className="panel-title">Weak patterns</h2>
          <p className="panel-sub">Where a hint was needed, or the first attempt failed</p>
        </div>
      </header>

      {weakAreas.length === 0 ? (
        <div className="empty-state">
          <span className="empty-glyph" aria-hidden="true">
            <Check size={18} strokeWidth={2.4} />
          </span>
          <p className="empty-title">Nothing flagged yet</p>
          <p className="empty-copy">Weak spots show up here after your first session.</p>
        </div>
      ) : (
        <ul className="weak-list">
          {weakAreas.map((w) => (
            <li key={w} className="weak">
              <span className="weak-dot" aria-hidden="true" />
              {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Revision({ revisionDue, weakAreas }) {
  return (
    <Reveal as="section" className="section panels" aria-label="Re-solve queue and weak patterns">
      <RevisionCard revisionDue={revisionDue} />
      <WeakAreasCard weakAreas={weakAreas} />
    </Reveal>
  );
}
