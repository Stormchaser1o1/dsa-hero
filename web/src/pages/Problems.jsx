import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, CircleDot, ExternalLink, Flame, Lock, Search } from 'lucide-react';
import { DIFFICULTIES, PROBLEMS } from '../data/problems';
import { TOPICS, TOPIC_BY_ID } from '../data/topics';
import { Link } from '../router';
import { Diff, Empty, PageHead } from '../components/ui/Bits';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To do' },
  { id: 'attempted', label: 'Attempted' },
  { id: 'solved', label: 'Solved' },
];

export default function Problems({ stats }) {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [status, setStatus] = useState('all');

  const unlockedTopics = useMemo(
    () => new Set(stats.byTopic.filter((t) => t.unlocked).map((t) => t.id)),
    [stats.byTopic]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROBLEMS.filter((p) => {
      if (topic !== 'all' && p.topic !== topic) return false;
      if (difficulty !== 'all' && p.difficulty !== difficulty) return false;
      const solved = stats.solvedIds.has(p.id);
      const attempted = stats.attemptedIds.has(p.id);
      if (status === 'solved' && !solved) return false;
      if (status === 'attempted' && !(attempted && !solved)) return false;
      if (status === 'todo' && attempted) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.pattern.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, topic, difficulty, status, stats.solvedIds, stats.attemptedIds]);

  return (
    <>
      <PageHead
        title="Problems"
        sub={`${PROBLEMS.length} curated problems across ${TOPICS.length} topics`}
      >
        <span className="pill pill-accent">
          {stats.solved} / {stats.totalProblems} solved
        </span>
      </PageHead>

      <section className="card card-lit pad filters">
        <div className="search-wrap">
          <Search size={15} strokeWidth={2.2} aria-hidden="true" />
          <input
            className="input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or pattern…"
            aria-label="Search problems"
          />
        </div>

        <div className="filter-row">
          <label className="select-wrap">
            <span className="sr-only">Filter by topic</span>
            <select className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="all">All topics</option>
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <label className="select-wrap">
            <span className="sr-only">Filter by difficulty</span>
            <select
              className="input"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="all">All difficulties</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d[0].toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <div className="segmented">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`segment ${status === f.id ? 'is-active' : ''}`}
                onClick={() => setStatus(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card card-lit table-card">
        {rows.length === 0 ? (
          <div className="pad">
            <Empty icon={Search} title="No problems match" copy="Try clearing a filter." />
          </div>
        ) : (
          <div className="table-scroll">
            <table className="ptable">
              <thead>
                <tr>
                  <th scope="col" className="c-status" />
                  <th scope="col">Problem</th>
                  <th scope="col">Topic</th>
                  <th scope="col">Pattern</th>
                  <th scope="col">Difficulty</th>
                  <th scope="col" className="c-freq">
                    FAANG
                  </th>
                  <th scope="col" className="c-go" />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const solved = stats.solvedIds.has(p.id);
                  const attempted = stats.attemptedIds.has(p.id);
                  const locked = !unlockedTopics.has(p.topic);
                  return (
                    <tr key={p.id} className={solved ? 'is-solved' : ''}>
                      <td className="c-status">
                        {solved ? (
                          <CheckCircle2 size={15} className="ico-ok" aria-label="Solved" />
                        ) : attempted ? (
                          <CircleDot size={15} className="ico-mid" aria-label="Attempted" />
                        ) : locked ? (
                          <Lock size={13} className="ico-dim" aria-label="Topic locked" />
                        ) : (
                          <Circle size={14} className="ico-dim" aria-label="Not started" />
                        )}
                      </td>
                      <td>
                        <Link to={`/practice/${p.id}`} className="ptable-title">
                          {p.title}
                        </Link>
                      </td>
                      <td className="c-dim">{TOPIC_BY_ID[p.topic].short}</td>
                      <td className="c-dim">{p.pattern}</td>
                      <td>
                        <Diff level={p.difficulty} size="sm" />
                      </td>
                      <td className="c-freq">
                        {p.faangFreq > 0 && (
                          <span className={`freq freq-${p.faangFreq}`} title={`Frequency ${p.faangFreq}/3`}>
                            <Flame size={11} strokeWidth={2.4} aria-hidden="true" />
                            {p.faangFreq}
                          </span>
                        )}
                      </td>
                      <td className="c-go">
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="row-link"
                            aria-label={`Open ${p.title} on LeetCode`}
                          >
                            <ExternalLink size={13} strokeWidth={2.2} aria-hidden="true" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
