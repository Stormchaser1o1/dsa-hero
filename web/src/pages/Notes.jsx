import { useMemo, useState } from 'react';
import { Clock, Code2, NotebookPen, Search, Trash2 } from 'lucide-react';
import { useStore } from '../store/store';
import { PROBLEM_BY_ID } from '../data/problems';
import { TOPIC_BY_ID } from '../data/topics';
import { MISTAKE_BY_ID, OUTCOME_BY_ID } from '../data/mistakes';
import { Link } from '../router';
import { Diff, Empty, PageHead } from '../components/ui/Bits';

export default function Notes() {
  const { state, updateNote, updateCode, deleteAttempt } = useStore();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [editingCode, setEditingCode] = useState(null);
  const [codeDraft, setCodeDraft] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...state.attempts]
      .reverse()
      .map((a) => ({ ...a, problem: PROBLEM_BY_ID[a.problemId] }))
      .filter((a) => a.problem)
      .filter(
        (a) =>
          !q ||
          a.problem.title.toLowerCase().includes(q) ||
          (a.notes ?? '').toLowerCase().includes(q) ||
          (a.code ?? '').toLowerCase().includes(q) ||
          a.problem.pattern.toLowerCase().includes(q)
      );
  }, [state.attempts, query]);

  const startEdit = (a) => {
    setEditing(a.id);
    setDraft(a.notes ?? '');
  };

  const save = (id) => {
    updateNote(id, draft);
    setEditing(null);
  };

  const startEditCode = (a) => {
    setEditingCode(a.id);
    setCodeDraft(a.code ?? '');
  };

  const saveCode = (id) => {
    updateCode(id, codeDraft);
    setEditingCode(null);
  };

  return (
    <>
      <PageHead title="Notes & History" sub="Every attempt you have logged, newest first.">
        <span className="pill pill-muted">{state.attempts.length} attempts</span>
      </PageHead>

      <section className="card card-lit pad">
        <div className="search-wrap">
          <Search size={15} strokeWidth={2.2} aria-hidden="true" />
          <input
            className="input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, problems or patterns…"
            aria-label="Search notes"
          />
        </div>
      </section>

      {rows.length === 0 ? (
        <section className="card card-lit pad">
          <Empty
            icon={NotebookPen}
            title={state.attempts.length ? 'No matches' : 'No attempts logged yet'}
            copy={
              state.attempts.length
                ? 'Try a different search.'
                : 'Solve a problem from your plan and log it — the note lands here.'
            }
          >
            {!state.attempts.length && (
              <Link to="/today" className="btn btn-primary">
                Go to today&apos;s plan
              </Link>
            )}
          </Empty>
        </section>
      ) : (
        <div className="note-list">
          {rows.map((a) => {
            const outcome = OUTCOME_BY_ID[a.outcome];
            return (
              <article key={a.id} className="card card-lit pad note">
                <header className="note-head">
                  <Diff level={a.problem.difficulty} size="sm" />
                  <Link to={`/practice/${a.problemId}`} className="note-title">
                    {a.problem.title}
                  </Link>
                  <span className={`pill ${outcome?.solved ? 'pill-success' : 'pill-muted'}`}>
                    {outcome?.label ?? a.outcome}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon note-del"
                    onClick={() => deleteAttempt(a.id)}
                    aria-label="Delete this attempt"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </header>

                <p className="note-meta">
                  <span>{a.date}</span>
                  <span>{TOPIC_BY_ID[a.problem.topic].short}</span>
                  <span>{a.problem.pattern}</span>
                  <span>
                    <Clock size={11} strokeWidth={2.3} aria-hidden="true" />
                    {a.minutes} min
                  </span>
                  <span>{a.tries} attempt{a.tries === 1 ? '' : 's'}</span>
                  <span>{a.hints} hint{a.hints === 1 ? '' : 's'}</span>
                  {a.viewedSolution && <span className="warn-text">read solution</span>}
                </p>

                {a.mistakes?.length > 0 && (
                  <div className="note-mistakes">
                    {a.mistakes.map((m) => (
                      <span key={m} className="chip is-on" style={{ '--chip': MISTAKE_BY_ID[m]?.hue }}>
                        {MISTAKE_BY_ID[m]?.label ?? m}
                      </span>
                    ))}
                  </div>
                )}

                {editing === a.id ? (
                  <div className="note-edit">
                    <textarea
                      className="input"
                      rows={3}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                    <div className="note-edit-actions">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => save(a.id)}>
                        Save
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="note-body" onClick={() => startEdit(a)}>
                    {a.notes ? a.notes : <span className="note-empty">Add a lesson learned…</span>}
                  </button>
                )}

                {editingCode === a.id ? (
                  <div className="note-edit">
                    <textarea
                      className="input code-input"
                      rows={12}
                      spellCheck={false}
                      value={codeDraft}
                      onChange={(e) => setCodeDraft(e.target.value)}
                      aria-label="Solution code"
                    />
                    <div className="note-edit-actions">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => saveCode(a.id)}>
                        Save
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingCode(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : a.code ? (
                  <details className="note-code">
                    <summary>
                      <Code2 size={12} strokeWidth={2.3} aria-hidden="true" />
                      Solution — {(a.code.match(/\n/g)?.length ?? 0) + 1} lines
                    </summary>
                    <pre className="code">
                      <code>{a.code}</code>
                    </pre>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEditCode(a)}>
                      Edit code
                    </button>
                  </details>
                ) : (
                  <button type="button" className="note-code-add" onClick={() => startEditCode(a)}>
                    <Code2 size={12} strokeWidth={2.3} aria-hidden="true" />
                    Add your solution
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
