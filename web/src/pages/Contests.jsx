import { useMemo } from 'react';
import { Clock, ExternalLink, Rocket, Swords, Trophy } from 'lucide-react';
import { useStore } from '../store/store';
import { PROBLEMS, PROBLEM_BY_ID } from '../data/problems';
import { isWeekendKey, todayKey } from '../lib/date';
import { Link } from '../router';
import { CardHead, Diff, Empty, Meter, PageHead } from '../components/ui/Bits';

const ROUNDS = [
  {
    id: 'sprint',
    name: 'Easy Sprint',
    rule: '3 easies, 30 minutes total',
    desc: 'Builds speed and removes hesitation on the problems you should never lose.',
    unlockAt: 10,
    mix: ['easy', 'easy', 'easy'],
    minutes: 30,
  },
  {
    id: 'standard',
    name: 'Standard Round',
    rule: '2 mediums, 45 minutes',
    desc: 'The shape of a real phone screen. Talk out loud the entire time.',
    unlockAt: 40,
    mix: ['medium', 'medium'],
    minutes: 45,
  },
  {
    id: 'onsite',
    name: 'Onsite Round',
    rule: '1 medium + 1 hard, 60 minutes',
    desc: 'State complexity before coding, and handle one follow-up per problem.',
    unlockAt: 90,
    mix: ['medium', 'hard'],
    minutes: 60,
  },
  {
    id: 'gauntlet',
    name: 'The Gauntlet',
    rule: '4 problems, mixed topics, 90 minutes',
    desc: 'No topic hints. You have to recognise the pattern cold.',
    unlockAt: 150,
    mix: ['medium', 'medium', 'hard', 'hard'],
    minutes: 90,
  },
];

/** Deterministic pick so a round is stable for the day. */
function pickFor(mix, stats, seedKey) {
  let h = 7;
  for (let i = 0; i < seedKey.length; i++) h = (h * 31 + seedKey.charCodeAt(i)) >>> 0;
  const used = new Set();
  return mix.map((d, i) => {
    const pool = PROBLEMS.filter(
      (p) =>
        p.difficulty === d &&
        !used.has(p.id) &&
        !p.isDrill &&
        (stats.byTopic.find((t) => t.id === p.topic)?.unlocked ?? false)
    );
    if (!pool.length) return null;
    const pick = pool[(h + i * 977) % pool.length];
    used.add(pick.id);
    return pick;
  }).filter(Boolean);
}

export default function Contests({ stats }) {
  const { state } = useStore();
  const today = todayKey();
  const weekend = isWeekendKey(today);

  const history = useMemo(() => {
    const perDay = new Map();
    for (const a of state.attempts) {
      if (!isWeekendKey(a.date)) continue;
      if (!a.outcome.startsWith('solved')) continue;
      const set = perDay.get(a.date) ?? new Set();
      set.add(a.problemId);
      perDay.set(a.date, set);
    }
    return [...perDay.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 8);
  }, [state.attempts]);

  return (
    <>
      <PageHead
        title="Contests"
        sub="Timed rounds. The point is pressure, not new material."
      >
        <span className={`pill ${weekend ? 'pill-accent' : 'pill-muted'}`}>
          <Swords size={11} strokeWidth={2.4} aria-hidden="true" />
          {weekend ? 'Weekend — 4 problem day' : 'Weekday — 2 problem day'}
        </span>
      </PageHead>

      <div className="round-grid">
        {ROUNDS.map((r) => {
          const unlocked = stats.solved >= r.unlockAt;
          const picks = unlocked ? pickFor(r.mix, stats, today + r.id) : [];

          return (
            <section key={r.id} className={`card card-lit pad round ${unlocked ? '' : 'is-locked'}`}>
              <CardHead
                title={r.name}
                sub={r.rule}
                icon={unlocked ? Rocket : Clock}
                hue={unlocked ? 'var(--accent)' : 'var(--fg-faint)'}
              />
              <p className="round-desc">{r.desc}</p>

              {unlocked ? (
                <>
                  <ul className="round-picks">
                    {picks.map((p) => (
                      <li key={p.id}>
                        <Diff level={p.difficulty} size="sm" />
                        <Link to={`/practice/${p.id}`} className="round-link">
                          {p.title}
                        </Link>
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noreferrer" aria-label="Open on LeetCode">
                            <ExternalLink size={12} strokeWidth={2.2} aria-hidden="true" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="round-foot">
                    <Clock size={12} strokeWidth={2.3} aria-hidden="true" />
                    Set a {r.minutes}-minute timer. Log every problem, solved or not.
                  </p>
                </>
              ) : (
                <div className="round-lock">
                  <Meter percent={(stats.solved / r.unlockAt) * 100} height={5} />
                  <p>
                    Unlocks at {r.unlockAt} solved — {Math.max(0, r.unlockAt - stats.solved)} to go
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <section className="card card-lit pad">
        <CardHead title="Weekend history" sub="Days you cleared the 4-problem target" icon={Trophy} hue="var(--warn)" />
        {history.length === 0 ? (
          <Empty
            icon={Trophy}
            title="No weekend sessions yet"
            copy="Weekends are four problems, with the last one deliberately above your level."
          />
        ) : (
          <ul className="wk-list">
            {history.map(([date, set]) => (
              <li key={date} className={set.size >= state.goals.weekend ? 'is-hit' : ''}>
                <span className="wk-date">{date}</span>
                <span className="wk-bar">
                  <Meter
                    percent={(set.size / state.goals.weekend) * 100}
                    height={5}
                    tone={set.size >= state.goals.weekend ? 'success' : 'gradient'}
                  />
                </span>
                <b>
                  {set.size}/{state.goals.weekend}
                </b>
                <span className="wk-names">
                  {[...set]
                    .map((id) => PROBLEM_BY_ID[id]?.title)
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
