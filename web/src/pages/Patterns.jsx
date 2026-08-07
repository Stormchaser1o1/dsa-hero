import { useState } from 'react';
import { ChevronDown, Eye, Sparkles, Target } from 'lucide-react';
import { PROBLEMS } from '../data/problems';
import { corePatternFor } from '../data/patterns';
import { Link } from '../router';
import { CardHead, Diff, Meter, PageHead } from '../components/ui/Bits';

export default function Patterns({ stats }) {
  const [open, setOpen] = useState(null);

  return (
    <>
      <PageHead
        title="Patterns"
        sub="Interviews test patterns, not problems. Learn the cue before the code."
      >
        <span className="pill pill-accent">
          {stats.masteredPatterns} / {stats.byPattern.length} above 60%
        </span>
      </PageHead>

      <div className="pattern-grid">
        {stats.byPattern.map((p) => {
          const isOpen = open === p.id;
          const problems = PROBLEMS.filter((x) => corePatternFor(x.pattern) === p.id);

          return (
            <section key={p.id} className={`card card-lit pad pcard ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className="pcard-head"
                onClick={() => setOpen(isOpen ? null : p.id)}
                aria-expanded={isOpen}
              >
                <span className="pcard-title-row">
                  <span className="pcard-title">{p.name}</span>
                  <span className="pcard-count">
                    {p.solved}/{p.total}
                  </span>
                  <ChevronDown size={16} className="pcard-chev" aria-hidden="true" />
                </span>
                <Meter percent={p.mastery} height={5} tone={p.mastery >= 60 ? 'success' : 'gradient'} />
              </button>

              <p className="pcard-cue">
                <Eye size={13} strokeWidth={2.2} aria-hidden="true" />
                {p.cue}
              </p>

              {isOpen && (
                <div className="pcard-body">
                  <p className="pcard-idea">{p.idea}</p>
                  <p className="pcard-tell">
                    <Target size={12} strokeWidth={2.3} aria-hidden="true" />
                    <b>Tell:</b> {p.tell}
                  </p>
                  <pre className="code">
                    <code>{p.template}</code>
                  </pre>

                  <p className="pcard-sub">
                    <Sparkles size={12} strokeWidth={2.3} aria-hidden="true" />
                    {problems.length} problems use this
                  </p>
                  <ul className="pcard-problems">
                    {problems.map((x) => (
                      <li key={x.id} className={stats.solvedIds.has(x.id) ? 'is-solved' : ''}>
                        <Link to={`/practice/${x.id}`}>{x.title}</Link>
                        <Diff level={x.difficulty} size="sm" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <section className="card card-lit pad">
        <CardHead title="How to use this page" sub="Read it before a session, not during" icon={Sparkles} />
        <p className="prose">
          When you get stuck, do not scroll to the template. Read only the <b>cue</b> line and ask
          whether it matches the problem in front of you. Pattern recognition is the skill being
          trained — the code is the easy part once the pattern is named.
        </p>
      </section>
    </>
  );
}
