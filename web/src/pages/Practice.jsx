import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bug,
  CheckCircle2,
  ExternalLink,
  Eye,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Timer,
} from 'lucide-react';
import { useStore } from '../store/store';
import { planFor } from '../engine/planner';
import { PROBLEM_BY_ID, PROBLEMS } from '../data/problems';
import { TOPIC_BY_ID } from '../data/topics';
import { PATTERN_BY_ID, corePatternFor } from '../data/patterns';
import { MISTAKE_TYPES, OUTCOMES } from '../data/mistakes';
import { todayKey } from '../lib/date';
import { Link, navigate } from '../router';
import { CardHead, Diff, Empty, PageHead } from '../components/ui/Bits';

function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
    ref.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(ref.current);
  }, [running]);

  return {
    seconds,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: () => {
      setRunning(false);
      setSeconds(0);
    },
  };
}

const pad = (n) => String(n).padStart(2, '0');

function Picker({ stats }) {
  const { state } = useStore();
  const plan = useMemo(() => planFor(state, stats, todayKey()), [state, stats]);
  const [query, setQuery] = useState('');

  const results = query.trim()
    ? PROBLEMS.filter((p) => p.title.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  return (
    <>
      <PageHead title="Practice" sub="Pick a problem to work on, or start today's set." />

      <section className="card card-lit pad">
        <CardHead title="Today's queue" sub="Straight from your plan" icon={Sparkles} />
        {plan.length === 0 ? (
          <Empty icon={Sparkles} title="Nothing queued" copy="Your plan is empty for today." />
        ) : (
          <ul className="pick-list">
            {plan.map(({ problemId }) => {
              const p = PROBLEM_BY_ID[problemId];
              return (
                <li key={problemId}>
                  <Link to={`/practice/${problemId}`} className="pick">
                    <Diff level={p.difficulty} />
                    <span className="pick-title">{p.title}</span>
                    <span className="pick-meta">{TOPIC_BY_ID[p.topic].short}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card card-lit pad">
        <CardHead title="Or search the bank" sub={`${PROBLEMS.length} problems`} icon={Bug} hue="var(--hue-3)" />
        <input
          className="input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title…"
          aria-label="Search problems"
        />
        {results.length > 0 && (
          <ul className="pick-list">
            {results.map((p) => (
              <li key={p.id}>
                <Link to={`/practice/${p.id}`} className="pick">
                  <Diff level={p.difficulty} />
                  <span className="pick-title">{p.title}</span>
                  <span className="pick-meta">{TOPIC_BY_ID[p.topic].short}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function Practice({ stats, param }) {
  const { logAttempt } = useStore();
  const timer = useTimer();
  const problem = param ? PROBLEM_BY_ID[param] : null;

  const [hintLevel, setHintLevel] = useState(0);
  const [viewedSolution, setViewedSolution] = useState(false);
  const [outcome, setOutcome] = useState('solved-clean');
  const [tries, setTries] = useState(1);
  const [mistakes, setMistakes] = useState([]);
  const [notes, setNotes] = useState('');
  const [code, setCode] = useState('');
  const [minutes, setMinutes] = useState('');

  useEffect(() => {
    setHintLevel(0);
    setViewedSolution(false);
    setOutcome('solved-clean');
    setTries(1);
    setMistakes([]);
    setNotes('');
    setCode('');
    setMinutes('');
    timer.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param]);

  if (!problem) return <Picker stats={stats} />;

  const topic = TOPIC_BY_ID[problem.topic];
  const core = corePatternFor(problem.pattern);
  const pattern = core ? PATTERN_BY_ID[core] : null;
  const already = stats.perProblem.get(problem.id);

  const hints = pattern
    ? [
        { title: 'Nudge — what to notice', body: pattern.cue },
        { title: 'Direction — the idea', body: `${pattern.idea}\n\nTell: ${pattern.tell}` },
        { title: 'Skeleton — the shape of the code', body: pattern.template, code: true },
      ]
    : [
        { title: 'Nudge', body: 'Write the smallest example by hand and look for what repeats.' },
        { title: 'Direction', body: 'State the brute force, then ask which step is doing redundant work.' },
        { title: 'Skeleton', body: 'Start with a loop over the input and a variable holding the best answer so far.' },
      ];

  const toggleMistake = (id) =>
    setMistakes((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));

  const submit = (e) => {
    e.preventDefault();
    const mins = minutes !== '' ? Number(minutes) : Math.max(1, Math.round(timer.seconds / 60));
    logAttempt({
      problemId: problem.id,
      outcome,
      minutes: mins,
      hints: hintLevel,
      tries,
      viewedSolution,
      mistakes,
      notes,
      code,
      language: 'java',
    });
    navigate('/today');
  };

  return (
    <>
      <PageHead title={problem.title} sub={`${topic.name} · ${problem.pattern}`}>
        {problem.url && (
          <a className="btn btn-ghost" href={problem.url} target="_blank" rel="noreferrer">
            <ExternalLink size={14} strokeWidth={2.2} aria-hidden="true" />
            LeetCode
          </a>
        )}
      </PageHead>

      <div className="practice-grid">
        <div className="practice-main">
          <section className="card card-lit pad">
            <div className="pr-tags">
              <Diff level={problem.difficulty} />
              <span className="tag">
                <topic.icon size={11} strokeWidth={2.2} aria-hidden="true" />
                {topic.name}
              </span>
              <span className="tag">{problem.pattern}</span>
              {already?.solved && (
                <span className="pill pill-success">
                  <CheckCircle2 size={11} strokeWidth={2.6} aria-hidden="true" />
                  Solved before
                </span>
              )}
            </div>

            <ol className="frame">
              <li>
                <b>Problem.</b> Read it twice, then write it back in one sentence.
              </li>
              <li>
                <b>Thought process.</b> What are the constraints? What does n tell you about the
                budget?
              </li>
              <li>
                <b>Brute force.</b> Describe it and state its complexity. Write it if it is quick.
              </li>
              <li>
                <b>Optimisation.</b> Which step repeats work? What could remember it?
              </li>
              <li>
                <b>Pattern.</b> Name it before you code.
              </li>
              <li>
                <b>Optimal solution.</b> Implement, then test empty / single / duplicate inputs.
              </li>
              <li>
                <b>Complexity.</b> Time and space, out loud.
              </li>
              <li>
                <b>Lesson.</b> One sentence you would want before an interview.
              </li>
            </ol>
          </section>

          <section className="card card-lit pad">
            <CardHead
              title="Hint ladder"
              sub="One level at a time — 25 minutes of thinking first"
              icon={Lightbulb}
              hue="var(--warn)"
            />
            <div className="hints">
              {hints.map((h, i) => {
                const open = hintLevel > i;
                return (
                  <div key={h.title} className={`hint ${open ? 'is-open' : ''}`}>
                    {open ? (
                      <>
                        <p className="hint-title">{h.title}</p>
                        {h.code ? (
                          <pre className="code">
                            <code>{h.body}</code>
                          </pre>
                        ) : (
                          <p className="hint-body">{h.body}</p>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        className="hint-lock"
                        onClick={() => setHintLevel(i + 1)}
                        disabled={hintLevel !== i}
                      >
                        <Lightbulb size={14} strokeWidth={2.2} aria-hidden="true" />
                        Reveal hint {i + 1} — {h.title.split('—')[0].trim()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <label className="check-line">
              <input
                type="checkbox"
                checked={viewedSolution}
                onChange={(e) => setViewedSolution(e.target.checked)}
              />
              <Eye size={13} strokeWidth={2.2} aria-hidden="true" />I read the full solution
            </label>
          </section>
        </div>

        <aside className="practice-side">
          <section className="card card-lit pad timer-card">
            <CardHead title="Timer" sub="Honest thinking time" icon={Timer} hue="var(--hue-2)" />
            <p className="timer-face">
              {pad(Math.floor(timer.seconds / 60))}:{pad(timer.seconds % 60)}
            </p>
            <div className="timer-actions">
              {timer.running ? (
                <button type="button" className="btn btn-ghost" onClick={timer.pause}>
                  <Pause size={14} aria-hidden="true" />
                  Pause
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={timer.start}>
                  <Play size={14} aria-hidden="true" />
                  Start
                </button>
              )}
              <button type="button" className="btn btn-ghost btn-icon" onClick={timer.reset} aria-label="Reset timer">
                <RotateCcw size={14} aria-hidden="true" />
              </button>
            </div>
            <p className="timer-hint">
              {timer.seconds < 1500
                ? `${Math.ceil((1500 - timer.seconds) / 60)} min before hints are fair game`
                : 'Past 25 minutes — a hint is fine now'}
            </p>
          </section>

          <form className="card card-lit pad" onSubmit={submit}>
            <CardHead title="Log this attempt" sub="Drives tomorrow's plan" icon={Save} hue="var(--success)" />

            <fieldset className="field">
              <legend>Outcome</legend>
              <div className="radio-stack">
                {OUTCOMES.map((o) => (
                  <label key={o.id} className={`radio ${outcome === o.id ? 'is-on' : ''}`}>
                    <input
                      type="radio"
                      name="outcome"
                      value={o.id}
                      checked={outcome === o.id}
                      onChange={() => setOutcome(o.id)}
                    />
                    <span>
                      <b>{o.label}</b>
                      <span className="radio-desc">{o.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="field-row">
              <label className="field">
                <span>Minutes</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={minutes}
                  placeholder={String(Math.max(1, Math.round(timer.seconds / 60)))}
                  onChange={(e) => setMinutes(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Attempts</span>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={tries}
                  onChange={(e) => setTries(Number(e.target.value) || 1)}
                />
              </label>
              <label className="field">
                <span>Hints used</span>
                <input className="input" type="number" min="0" value={hintLevel} readOnly />
              </label>
            </div>

            <fieldset className="field">
              <legend>What went wrong? (optional)</legend>
              <div className="chip-wrap">
                {MISTAKE_TYPES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`chip ${mistakes.includes(m.id) ? 'is-on' : ''}`}
                    style={{ '--chip': m.hue }}
                    onClick={() => toggleMistake(m.id)}
                    title={m.hint}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="field">
              <span>
                Your solution <small>Java · saved with the attempt</small>
              </span>
              <textarea
                className="input code-input"
                rows={10}
                spellCheck={false}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={'class Solution {\n    // paste what you actually wrote\n}'}
              />
            </label>

            <label className="field">
              <span>Lesson learned</span>
              <textarea
                className="input"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="The one sentence you'd want to read before an interview…"
              />
            </label>

            <button type="submit" className="btn btn-primary btn-block">
              <Save size={14} strokeWidth={2.4} aria-hidden="true" />
              Save attempt
            </button>
          </form>
        </aside>
      </div>
    </>
  );
}
