import { useMemo } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Gauge,
  Info,
  ListChecks,
  Play,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../store/store';
import { planFor, readForm, ROLE_META } from '../engine/planner';
import { PROBLEM_BY_ID } from '../data/problems';
import { TOPIC_BY_ID } from '../data/topics';
import { formatLong, isWeekendKey, todayKey } from '../lib/date';
import { Link } from '../router';
import { CardHead, Diff, Empty, Meter, PageHead } from '../components/ui/Bits';

const FORM_COPY = {
  calibrating: 'Still calibrating — the first few sessions set your baseline.',
  struggling: 'Recent form is shaky, so today leans easier and reinforces fundamentals.',
  steady: 'Form is steady. Difficulty holds and creeps up as you keep landing solves.',
  cruising: 'You are cruising — today includes something harder on purpose.',
};

export default function TodaysPlan({ stats }) {
  const { state } = useStore();
  const today = todayKey();
  const weekend = isWeekendKey(today);
  const form = readForm(state);

  const plan = useMemo(() => planFor(state, stats, today), [state, stats, today]);
  const done = plan.filter((p) => stats.solvedIds.has(p.problemId)).length;

  return (
    <>
      <PageHead
        title={weekend ? 'Weekend Challenge' : "Today's Plan"}
        sub={formatLong(today)}
      >
        <span className={`pill ${done >= plan.length && plan.length ? 'pill-success' : 'pill-accent'}`}>
          <CalendarDays size={11} strokeWidth={2.4} aria-hidden="true" />
          {weekend ? 'Weekend' : 'Weekday'} · {plan.length} problems
        </span>
      </PageHead>

      <section className="card card-lit pad mission">
        <div className="mission-head">
          <div>
            <p className="mission-count">
              {done} <span>/ {plan.length}</span>
            </p>
            <p className="mission-label">
              {done >= plan.length && plan.length
                ? 'Mission complete — well done.'
                : 'Problems completed today'}
            </p>
          </div>
          <span className="pill pill-muted">
            <Gauge size={11} strokeWidth={2.4} aria-hidden="true" />
            Form: {form.label}
          </span>
        </div>
        <Meter
          percent={plan.length ? (done / plan.length) * 100 : 0}
          height={8}
          tone={done >= plan.length && plan.length ? 'success' : 'gradient'}
        />
        <p className="mission-note">
          <Info size={13} strokeWidth={2.2} aria-hidden="true" />
          {FORM_COPY[form.label]}
        </p>
      </section>

      {plan.length === 0 ? (
        <section className="card card-lit pad">
          <Empty
            icon={ListChecks}
            title="Nothing left in the bank"
            copy="You have solved every problem in the curriculum. Move to timed mock rounds."
          >
            <Link to="/contests" className="btn btn-primary">
              Go to contests
            </Link>
          </Empty>
        </section>
      ) : (
        <div className="mission-list">
          {plan.map(({ problemId, role, reason }, i) => {
            const p = PROBLEM_BY_ID[problemId];
            const topic = TOPIC_BY_ID[p.topic];
            const solved = stats.solvedIds.has(problemId);
            const meta = ROLE_META[role] ?? ROLE_META.new;

            return (
              <article key={problemId} className={`card card-lit pad mission-card ${solved ? 'is-done' : ''}`}>
                <div className="mc-top">
                  <span className="mc-index">Problem {i + 1}</span>
                  <span className="pill pill-muted mc-role" style={{ '--role': meta.hue }}>
                    {meta.label}
                  </span>
                  {solved && (
                    <span className="pill pill-success">
                      <CheckCircle2 size={11} strokeWidth={2.6} aria-hidden="true" />
                      Solved
                    </span>
                  )}
                </div>

                <h2 className="mc-title">{p.title}</h2>

                <div className="mc-tags">
                  <Diff level={p.difficulty} />
                  <span className="tag">
                    <topic.icon size={11} strokeWidth={2.2} aria-hidden="true" />
                    {topic.name}
                  </span>
                  <span className="tag">
                    <Sparkles size={11} strokeWidth={2.2} aria-hidden="true" />
                    {p.pattern}
                  </span>
                  {p.faangFreq >= 3 && <span className="tag tag-hot">High FAANG frequency</span>}
                </div>

                <p className="mc-reason">{reason || meta.hint}</p>

                <div className="mc-actions">
                  <Link to={`/practice/${problemId}`} className="btn btn-primary">
                    <Play size={14} strokeWidth={2.4} aria-hidden="true" />
                    {solved ? 'Re-solve' : 'Start solving'}
                  </Link>
                  {p.url && (
                    <a className="btn btn-ghost" href={p.url} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} strokeWidth={2.2} aria-hidden="true" />
                      Open on LeetCode
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="card card-lit pad">
        <CardHead title="The rules of a session" sub="Same every day" icon={Info} hue="var(--hue-2)" />
        <ol className="rules">
          <li>Read the problem twice, then say it back in your own words.</li>
          <li>State the brute force out loud and give its time and space complexity.</li>
          <li>Think for 25 minutes before taking a hint. Hints come one level at a time.</li>
          <li>Write the code. Run it against the empty, single-element and duplicate cases.</li>
          <li>Log the attempt honestly — the plan for tomorrow is built from it.</li>
        </ol>
      </section>
    </>
  );
}
