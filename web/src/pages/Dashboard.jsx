import { useMemo } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Leaf,
  ListChecks,
  Lock,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useStore } from '../store/store';
import { planFor, ROLE_META } from '../engine/planner';
import { PROBLEM_BY_ID, DIFFICULTIES, DIFFICULTY_META } from '../data/problems';
import { JOURNEY_BANDS, STAGE_IDS } from '../data/stages';
import { TOPIC_BY_ID } from '../data/topics';
import { isWeekendKey, todayKey } from '../lib/date';
import { Link } from '../router';
import Donut from '../components/ui/Donut';
import Heatmap from '../components/ui/Heatmap';
import { CardHead, Diff, Empty, Meter } from '../components/ui/Bits';

function StatTile({ icon: Icon, label, value, hint, accent, tone }) {
  return (
    <div className={`tile ${tone ? `tile-${tone}` : ''}`} style={{ '--tile': accent }}>
      <div className="tile-body">
        <p className="tile-label">{label}</p>
        <p className="tile-value">{value}</p>
        {hint && <p className="tile-hint">{hint}</p>}
      </div>
      <span className="tile-icon">
        <Icon size={19} strokeWidth={2.1} aria-hidden="true" />
      </span>
    </div>
  );
}

export default function Dashboard({ stats }) {
  const { state } = useStore();
  const today = todayKey();
  const weekend = isWeekendKey(today);

  const plan = useMemo(() => planFor(state, stats, today), [state, stats, today]);
  const now = new Date();

  const monthStats = useMemo(() => {
    const prefix = today.slice(0, 7);
    const rows = state.attempts.filter((a) => a.date.startsWith(prefix));
    const solved = new Set(rows.filter((a) => a.outcome.startsWith('solved')).map((a) => a.problemId));
    const attempted = new Set(rows.map((a) => a.problemId));
    const minutes = rows.reduce((s, a) => s + a.minutes, 0);
    return {
      solved: solved.size,
      attempted: attempted.size,
      accuracy: rows.length
        ? Math.round((rows.filter((a) => a.outcome.startsWith('solved')).length / rows.length) * 100)
        : 0,
      hours: minutes / 60,
    };
  }, [state.attempts, today]);

  const stageIdx = STAGE_IDS.indexOf(stats.stage.id);
  const doneToday = plan.filter((p) => stats.solvedIds.has(p.problemId)).length;

  return (
    <>
      <header className="welcome">
        <div>
          <h1 className="welcome-title">
            Welcome back, {state.profile.name}! <span aria-hidden="true">👋</span>
          </h1>
          <p className="welcome-sub">Let&apos;s conquer one problem at a time.</p>
        </div>
        <Link to="/today" className="grind-pill">
          <Leaf size={14} strokeWidth={2.3} aria-hidden="true" />
          Keep Grinding!
        </Link>
      </header>

      <section className="tiles" aria-label="Headline stats">
        <StatTile
          icon={CheckCircle2}
          label="Problems Solved"
          value={stats.solved}
          hint={`${stats.solvedThisWeek} this week`}
          accent="var(--accent)"
        />
        <StatTile
          icon={ListChecks}
          label="Total Problems"
          value={
            <>
              {stats.solved} <span className="tile-of">/ {stats.totalProblems}</span>
            </>
          }
          hint={`${stats.overallPercent.toFixed(1)}% completed`}
          accent="var(--hue-2)"
        />
        <StatTile
          icon={TrendingUp}
          label="Acceptance Rate"
          value={`${Math.round(stats.accuracy)}%`}
          hint={`${stats.winningAttempts} of ${stats.totalAttempts} attempts`}
          accent="var(--success)"
        />
        <StatTile
          icon={Star}
          label="Current Level"
          value={stats.level.rank}
          hint={`Level ${stats.level.level} · ${stats.stage.name}`}
          accent="var(--streak)"
          tone="warm"
        />
      </section>

      <div className="grid-2">
        <section className="card card-lit pad">
          <CardHead title="Your Progress" sub="Difficulty is the real scoreboard" icon={Target} />
          <div className="progress-split">
            <Donut percent={stats.overallPercent} value={`${stats.overallPercent.toFixed(0)}%`} />
            <div className="diff-stack">
              {DIFFICULTIES.map((d) => {
                const row = stats.byDifficulty[d];
                const meta = DIFFICULTY_META[d];
                return (
                  <div key={d} className="diff-line" style={{ '--diff': meta.color }}>
                    <span className="diff-line-head">
                      <span className="diff-name">{meta.label}</span>
                      <span className="diff-num">
                        {row.solved} <span className="muted">/ {row.total}</span>
                      </span>
                    </span>
                    <Meter percent={(row.solved / row.total) * 100} tone="custom" height={5} />
                  </div>
                );
              })}
              <div className="diff-line total-line">
                <span className="diff-line-head">
                  <span className="diff-name">Total</span>
                  <span className="diff-num">
                    {stats.solved} <span className="muted">/ {stats.totalProblems}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="mini-row">
            <span className="mini">
              <Flame size={15} className="mini-ico streak" aria-hidden="true" />
              <b>{stats.currentStreak}</b> Day Streak
            </span>
            <span className="mini">
              <CheckCircle2 size={15} className="mini-ico ok" aria-hidden="true" />
              <b>{stats.solved}</b> Total Solved
            </span>
            <span className="mini">
              <Clock size={15} className="mini-ico" aria-hidden="true" />
              <b>{stats.avgMinutes ? stats.avgMinutes.toFixed(1) : '—'}</b> Avg Time (min)
            </span>
          </div>
        </section>

        <section className="card card-lit pad">
          <CardHead
            title="Practice Calendar"
            sub={now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            icon={Flame}
            hue="var(--streak)"
          />
          <div className="calendar-split">
            <Heatmap year={now.getFullYear()} month={now.getMonth()} activity={stats.activity} />
            <div className="cal-side">
              <div className="cal-goal">
                <p className="cal-goal-label">This Week</p>
                <p className="cal-goal-value">
                  {stats.solvedThisWeek} <span>/ {stats.weeklyTarget} problems</span>
                </p>
                <Meter percent={(stats.solvedThisWeek / stats.weeklyTarget) * 100} height={5} />
              </div>
              <div className="cal-goal">
                <p className="cal-goal-label">{weekend ? 'Weekend Goal' : 'Today’s Goal'}</p>
                <p className="cal-goal-value">
                  {stats.solvedToday} <span>/ {stats.goalToday} problems</span>
                </p>
                <Meter
                  percent={(stats.solvedToday / stats.goalToday) * 100}
                  height={5}
                  tone={stats.solvedToday >= stats.goalToday ? 'success' : 'gradient'}
                />
              </div>
              <Link to="/progress" className="btn btn-ghost btn-block">
                View full calendar
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="grid-2">
        <section className="card card-lit pad">
          <CardHead
            title="Today's Plan"
            sub={`${plan.length} ${plan.length === 1 ? 'problem' : 'problems'} · keep it consistent`}
            icon={ListChecks}
          >
            <Link to="/today" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </CardHead>

          {plan.length === 0 ? (
            <Empty
              icon={ListChecks}
              title="Nothing queued"
              copy="Every problem in the bank is solved. Time for timed mocks."
            />
          ) : (
            <ul className="plan-list">
              {plan.map(({ problemId, role }) => {
                const p = PROBLEM_BY_ID[problemId];
                const solved = stats.solvedIds.has(problemId);
                return (
                  <li key={problemId} className={`plan-row ${solved ? 'is-done' : ''}`}>
                    <Diff level={p.difficulty} />
                    <span className="plan-body">
                      <span className="plan-title">{p.title}</span>
                      <span className="plan-meta">
                        {TOPIC_BY_ID[p.topic].short} · {p.pattern}
                      </span>
                    </span>
                    {solved ? (
                      <span className="pill pill-success">
                        <CheckCircle2 size={11} strokeWidth={2.6} aria-hidden="true" />
                        Solved
                      </span>
                    ) : (
                      <Link to={`/practice/${problemId}`} className="btn btn-primary btn-sm">
                        Solve now
                      </Link>
                    )}
                    <span className="sr-only">{ROLE_META[role]?.label}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="goal-foot">
            <span className={doneToday >= plan.length && plan.length ? 'goal-hit' : ''}>
              <CheckCircle2 size={13} strokeWidth={2.4} aria-hidden="true" />
              Daily goal: {doneToday}/{plan.length} completed
            </span>
            <Meter
              percent={plan.length ? (doneToday / plan.length) * 100 : 0}
              height={5}
              tone={doneToday >= plan.length && plan.length ? 'success' : 'gradient'}
            />
          </div>
        </section>

        <section className="card card-lit pad">
          <CardHead
            title="Your DSA Journey"
            sub="Start from basics and reach FAANG+"
            icon={TrendingUp}
            hue="var(--hue-8)"
          />
          <ol className="journey">
            {JOURNEY_BANDS.map((band, i) => {
              const reached = band.stages.some((s) => STAGE_IDS.indexOf(s) <= stageIdx);
              const active = band.stages.includes(stats.stage.id);
              return (
                <li key={band.id} className={`jn ${reached ? 'is-reached' : ''} ${active ? 'is-active' : ''}`}>
                  <span className="jn-node">
                    {reached ? (
                      <Leaf size={18} strokeWidth={2.1} aria-hidden="true" />
                    ) : (
                      <Lock size={16} strokeWidth={2.1} aria-hidden="true" />
                    )}
                  </span>
                  <span className="jn-name">{band.name}</span>
                  <span className="jn-sub">{band.sub}</span>
                  {i < JOURNEY_BANDS.length - 1 && <span className="jn-link" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>
          <Link to="/roadmap" className="btn btn-ghost btn-block">
            View full roadmap
          </Link>
        </section>
      </div>

      <div className="grid-2">
        <section className="card card-lit pad">
          <CardHead title="Recent Achievements" sub="Earned, not given" icon={Star} hue="var(--warn)">
            <Link to="/achievements" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </CardHead>
          {stats.achievements.filter((a) => a.unlocked).length === 0 ? (
            <Empty
              icon={Star}
              title="No badges yet"
              copy="Solve your first problem and First Blood is yours."
            />
          ) : (
            <ul className="badge-row">
              {stats.achievements
                .filter((a) => a.unlocked)
                .slice(-3)
                .map((a) => (
                  <li key={a.id} className="badge-mini">
                    <span className="badge-orb" style={{ '--orb': a.hue }}>
                      <a.icon size={18} strokeWidth={2.1} aria-hidden="true" />
                    </span>
                    <span className="badge-mini-text">
                      <b>{a.name}</b>
                      <span>{a.desc}</span>
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="card card-lit pad">
          <CardHead title="Problem Stats" sub="This month" icon={TrendingUp} hue="var(--hue-3)" />
          <div className="pstats">
            <div className="pstat">
              <p className="pstat-label">Solved</p>
              <p className="pstat-value">{monthStats.solved}</p>
              <p className="pstat-delta ok">{stats.solved} all time</p>
            </div>
            <div className="pstat">
              <p className="pstat-label">Attempted</p>
              <p className="pstat-value">{monthStats.attempted}</p>
              <p className="pstat-delta">{stats.attempted} all time</p>
            </div>
            <div className="pstat">
              <p className="pstat-label">Accuracy</p>
              <p className="pstat-value">{monthStats.accuracy}%</p>
              <p className="pstat-delta">{Math.round(stats.accuracy)}% all time</p>
            </div>
            <div className="pstat">
              <p className="pstat-label">Time Spent</p>
              <p className="pstat-value warm">{monthStats.hours.toFixed(1)} hrs</p>
              <p className="pstat-delta">{stats.avgMinutes.toFixed(0)} min average</p>
            </div>
          </div>
          <Link to="/progress" className="btn btn-ghost btn-block">
            Full progress breakdown
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
