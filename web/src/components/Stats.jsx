import { CalendarClock, CheckCircle2, Flame, Layers } from 'lucide-react';
import StatCard from './ui/StatCard';
import ProgressBar from './ui/ProgressBar';
import Reveal from './ui/Reveal';
import useReveal from '../hooks/useReveal';
import useCountUp from '../hooks/useCountUp';
import { daysUntil, solvedCount, totalCount } from '../data/selectors';

function relativeDay(iso) {
  const d = daysUntil(iso);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return 'Due today';
  if (d === 1) return 'Due tomorrow';
  return `in ${d} days`;
}

export default function Stats({ data }) {
  const { meta, phases, currentPhaseId, revisionDue } = data;
  const [ref, shown] = useReveal();

  const currentIndex = phases.findIndex((p) => p.id === currentPhaseId);
  const solved = solvedCount(phases);
  const total = totalCount(phases);
  const solvedPct = total ? (solved / total) * 100 : 0;

  const solvedNum = useCountUp(solved, { active: shown, duration: 900 });
  const streakCount = useCountUp(meta.streakDays, { active: shown, duration: 900 });

  const next = revisionDue
    .slice()
    .sort((a, b) => a.nextRevision.localeCompare(b.nextRevision))[0];
  const overdue = next && daysUntil(next.nextRevision) < 0;

  return (
    <Reveal as="section" className="stats" aria-label="Progress summary" delay={60}>
      <div ref={ref} className="stats-grid">
        <StatCard
          icon={Layers}
          label="Phase"
          value={`${currentIndex} / ${phases.length - 1}`}
          hint={phases[currentIndex]?.name.replace(/^Phase \d+ — /, '')}
          accent="var(--hue-1)"
        >
          <div className="stat-meter">
            <ProgressBar percent={(currentIndex / (phases.length - 1)) * 100} active={shown} />
          </div>
        </StatCard>

        <StatCard
          icon={CheckCircle2}
          label="Problems solved"
          value={solvedNum}
          hint={`of ${total} in the curriculum`}
          accent="var(--hue-4)"
        >
          <div className="stat-meter">
            <ProgressBar percent={solvedPct} active={shown} tone="success" />
          </div>
        </StatCard>

        <StatCard
          icon={Flame}
          label="Streak"
          value={
            <span className="streak-num">
              {streakCount}
              <span className="streak-unit">{streakCount === 1 ? 'day' : 'days'}</span>
            </span>
          }
          hint="Two a day. Four on weekends."
          accent="var(--hue-6)"
        >
          <div className="streak-dots" aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={i}
                className={`streak-dot ${i < meta.streakDays ? 'is-lit' : ''}`}
                style={{ '--i': i }}
              />
            ))}
          </div>
        </StatCard>

        <StatCard
          icon={CalendarClock}
          label="Next re-solve"
          value={next ? relativeDay(next.nextRevision) : '—'}
          hint={next ? next.topic : 'Nothing scheduled'}
          accent={overdue ? 'var(--danger)' : 'var(--hue-5)'}
        />
      </div>
    </Reveal>
  );
}
