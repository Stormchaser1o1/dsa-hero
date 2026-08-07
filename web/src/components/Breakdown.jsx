import { Gauge, Sparkles } from 'lucide-react';
import { DIFFICULTY, SOLVABLE } from '../data/phaseIcons';
import { byDifficulty, byPattern } from '../data/selectors';
import ProgressBar from './ui/ProgressBar';
import Reveal from './ui/Reveal';
import useReveal from '../hooks/useReveal';

function DifficultyCard({ phases }) {
  const [ref, shown] = useReveal();
  const counts = byDifficulty(phases);

  return (
    <div ref={ref} className="card card-lit panel">
      <header className="panel-head">
        <span className="panel-icon" style={{ '--panel-hue': 'var(--hue-6)' }}>
          <Gauge size={15} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <div>
          <h2 className="panel-title">Difficulty split</h2>
          <p className="panel-sub">Easy builds speed, medium gets the offer</p>
        </div>
      </header>

      <ul className="diff-list">
        {SOLVABLE.map((key) => {
          const { done, total } = counts[key];
          const meta = DIFFICULTY[key];
          const pct = total ? (done / total) * 100 : 0;

          return (
            <li key={key} className="diff-row" style={{ '--diff': meta.color }}>
              <span className="diff-row-head">
                <span className="diff-dot" aria-hidden="true" />
                <span className="diff-label">{meta.label}</span>
                <span className="diff-count">
                  {done}
                  <span className="diff-total">/{total}</span>
                </span>
              </span>
              <ProgressBar percent={pct} active={shown} tone="custom" height={6} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PatternsCard({ phases }) {
  const [ref, shown] = useReveal();
  const rows = byPattern(phases).slice(0, 8);

  return (
    <div ref={ref} className="card card-lit panel">
      <header className="panel-head">
        <span className="panel-icon" style={{ '--panel-hue': 'var(--hue-3)' }}>
          <Sparkles size={15} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <div>
          <h2 className="panel-title">Top patterns</h2>
          <p className="panel-sub">Interviews test patterns, not problems</p>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="empty">No patterns mapped yet.</p>
      ) : (
        <ul className="pattern-list">
          {rows.map((r) => (
            <li key={r.pattern} className="pattern">
              <span className="pattern-name">{r.pattern}</span>
              <span className="pattern-bar">
                <ProgressBar
                  percent={r.total ? (r.done / r.total) * 100 : 0}
                  active={shown}
                  height={4}
                  tone={r.done === r.total ? 'success' : 'gradient'}
                />
              </span>
              <span className="pattern-count">
                {r.done}/{r.total}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Breakdown({ phases }) {
  return (
    <Reveal as="section" className="section panels" aria-label="Difficulty and pattern breakdown">
      <DifficultyCard phases={phases} />
      <PatternsCard phases={phases} />
    </Reveal>
  );
}
