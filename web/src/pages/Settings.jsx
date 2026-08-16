import { useRef, useState } from 'react';
import {
  AlertTriangle,
  CloudUpload,
  Database,
  Download,
  Moon,
  Play,
  Sun,
  Target,
  Upload,
  User,
} from 'lucide-react';
import { useStore } from '../store/store';
import { EXAMPLE_QUERIES } from '../db/schema';
import { CardHead, Empty, PageHead } from '../components/ui/Bits';
import { clearConfig, readConfig, verify, writeConfig } from '../db/github';

/**
 * Two-way sync with the repository.
 *
 * Everything the app knows lives in IndexedDB, which one "clear site data" wipes
 * out and which no other device can see. With a token saved here, every change
 * is committed to logbook.json, and any browser holding the same token restores
 * from it on load.
 */
function RepoSync() {
  const { sync, syncNow } = useStore();
  const [cfg, setCfg] = useState(readConfig);
  const [token, setToken] = useState('');
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState(false);

  const connected = Boolean(cfg.token);

  const save = async () => {
    setBusy(true);
    setNote(null);
    try {
      setCfg(writeConfig({ ...cfg, token: token || cfg.token }));
      setNote({ tone: 'ok', text: await verify() });
    } catch (err) {
      setNote({ tone: 'bad', text: err.message });
    } finally {
      setToken('');
      setBusy(false);
    }
  };

  const pushNow = async () => {
    setBusy(true);
    setNote(null);
    try {
      const res = await syncNow('Sync from the browser');
      setNote({ tone: 'ok', text: `Committed ${res.count} attempts to ${cfg.owner}/${cfg.repo}.` });
    } catch (err) {
      setNote({ tone: 'bad', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const disconnect = () => {
    clearConfig();
    setCfg(readConfig());
    setNote({ tone: 'ok', text: 'Token removed from this browser.' });
  };

  const statusText = {
    idle: connected ? 'Connected' : 'Not connected',
    pending: 'Committing…',
    ok: 'Saved to the repo',
    error: 'Sync failed',
  }[sync.state];

  return (
    <section className="card card-lit pad">
      <CardHead
        title="Save to the repository"
        sub="Commits your progress to GitHub so it outlives this browser"
        icon={CloudUpload}
        hue="var(--hue-2)"
      />
      <p className="prose">
        Without this, everything lives only in this browser — clearing site data loses it, and no
        other device can see it. With a token saved, every attempt you log is committed to{' '}
        <code className="inline-code">{cfg.path}</code>, and any browser holding the same token
        restores from it on load.
      </p>
      <p className="prose">
        Create a{' '}
        <a
          href="https://github.com/settings/personal-access-tokens/new"
          target="_blank"
          rel="noreferrer"
        >
          fine-grained token
        </a>{' '}
        scoped to <strong>only</strong> the {cfg.owner}/{cfg.repo} repository, with{' '}
        <strong>Contents: Read and write</strong>. It is stored in this browser and never written
        into the SQLite database, so exported backups never contain it.
      </p>

      <div className="field-row">
        <label className="field">
          <span>{connected ? 'Replace token' : 'Fine-grained token'}</span>
          <input
            className="input"
            type="password"
            autoComplete="off"
            placeholder={connected ? '•••••••• saved' : 'github_pat_…'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Branch</span>
          <input
            className="input"
            value={cfg.branch}
            onChange={(e) => setCfg({ ...cfg, branch: e.target.value })}
          />
        </label>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-ghost" onClick={save} disabled={busy || (!token && !connected)}>
          <CloudUpload size={14} aria-hidden="true" />
          {connected ? 'Save and verify' : 'Connect'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={pushNow} disabled={busy || !connected}>
          <Play size={14} aria-hidden="true" />
          Sync now
        </button>
        {connected && (
          <button type="button" className="btn btn-ghost" onClick={disconnect} disabled={busy}>
            Disconnect
          </button>
        )}
      </div>

      {note && <p className={`msg ${note.tone}`}>{note.text}</p>}
      <p className="foot-note">
        {statusText}
        {sync.at && ` · last commit ${new Date(sync.at).toLocaleTimeString()}`}
        {sync.error && ` · ${sync.error}`}
      </p>
    </section>
  );
}

function SqlConsole() {
  const { runSql, status } = useStore();
  const [sql, setSql] = useState(EXAMPLE_QUERIES[0].sql);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const execute = () => {
    if (!status.ready) {
      setError('The database is not open in this browser.');
      return;
    }
    try {
      const out = runSql(sql);
      setError(null);
      setResult(out.length ? out[out.length - 1] : { columns: [], values: [] });
    } catch (err) {
      setResult(null);
      setError(err.message);
    }
  };

  return (
    <section className="card card-lit pad">
      <CardHead
        title="SQL console"
        sub="Your progress is a real SQLite database — query it"
        icon={Database}
        hue="var(--hue-3)"
      />
      <p className="prose">
        Tables: <code className="inline-code">attempt</code>,{' '}
        <code className="inline-code">attempt_mistake</code>,{' '}
        <code className="inline-code">revision</code>, <code className="inline-code">plan</code>,{' '}
        <code className="inline-code">plan_item</code>, <code className="inline-code">setting</code>
        , plus <code className="inline-code">problem</code> and{' '}
        <code className="inline-code">topic</code> from the curriculum, and the view{' '}
        <code className="inline-code">v_solved</code>.
      </p>

      <div className="chip-wrap">
        {EXAMPLE_QUERIES.map((q) => (
          <button
            key={q.name}
            type="button"
            className="chip"
            onClick={() => {
              setSql(q.sql);
              setResult(null);
              setError(null);
            }}
          >
            {q.name}
          </button>
        ))}
      </div>

      <label className="field sql-field">
        <span className="sr-only">SQL query</span>
        <textarea
          className="input sql-input"
          rows={8}
          spellCheck={false}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
        />
      </label>

      <button type="button" className="btn btn-primary" onClick={execute}>
        <Play size={14} strokeWidth={2.4} aria-hidden="true" />
        Run query
      </button>

      {error && <p className="msg bad">{error}</p>}

      {result && (
        <div className="sql-result">
          {result.values.length === 0 ? (
            <Empty icon={Database} title="No rows" copy="The query ran but returned nothing." />
          ) : (
            <>
              <p className="foot-note">
                {result.values.length} row{result.values.length === 1 ? '' : 's'}
              </p>
              <div className="table-scroll">
                <table className="ptable">
                  <thead>
                    <tr>
                      {result.columns.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.values.slice(0, 200).map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className={typeof cell === 'number' ? 'c-num' : ''}>
                            {cell === null ? <span className="c-dim">null</span> : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default function Settings({ stats, theme, onToggleTheme }) {
  const { state, status, setGoals, setProfile, resetAll, exportDatabase, importDatabase } =
    useStore();
  const fileRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const exportBackup = async () => {
    try {
      const bytes = await exportDatabase();
      const blob = new Blob([bytes], { type: 'application/vnd.sqlite3' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dsa-hero-${new Date().toISOString().slice(0, 10)}.sqlite`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ tone: 'ok', text: 'Database downloaded. Open it in any SQLite tool.' });
    } catch (err) {
      setMessage({ tone: 'bad', text: err.message });
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importDatabase(await file.arrayBuffer());
      setMessage({ tone: 'ok', text: 'Database restored.' });
    } catch (err) {
      setMessage({ tone: 'bad', text: `Could not read that file: ${err.message}` });
    }
    e.target.value = '';
  };

  return (
    <>
      <PageHead title="Settings" sub="Goals, profile and your database.">
        <span className={`pill ${status.ready ? 'pill-success' : 'pill-muted'}`}>
          <Database size={11} strokeWidth={2.4} aria-hidden="true" />
          {status.ready ? 'SQLite connected' : 'In-memory only'}
        </span>
      </PageHead>

      {status.error && (
        <section className="card card-lit pad danger-zone">
          <p className="msg bad">
            The database could not be opened in this browser ({status.error}). The app still works,
            but nothing will be saved. Private/incognito windows block IndexedDB.
          </p>
        </section>
      )}

      {status.migrated && (
        <section className="card card-lit pad">
          <p className="msg ok">
            Your earlier progress was migrated from browser storage into the SQLite database.
          </p>
        </section>
      )}

      <section className="card card-lit pad">
        <CardHead title="Daily goals" sub="The system plans around these" icon={Target} />
        <div className="field-row">
          <label className="field">
            <span>Weekday problems</span>
            <input
              className="input"
              type="number"
              min="1"
              max="10"
              value={state.goals.weekday}
              onChange={(e) => setGoals({ weekday: Math.max(1, Number(e.target.value) || 1) })}
            />
          </label>
          <label className="field">
            <span>Weekend problems</span>
            <input
              className="input"
              type="number"
              min="1"
              max="12"
              value={state.goals.weekend}
              onChange={(e) => setGoals({ weekend: Math.max(1, Number(e.target.value) || 1) })}
            />
          </label>
        </div>
        <p className="foot-note">
          Current weekly target: <b>{stats.weeklyTarget} problems</b>. The default 2 / 4 split is
          what you signed up for — raising it is easy, sustaining it is the hard part.
        </p>
      </section>

      <section className="card card-lit pad">
        <CardHead title="Profile" sub="Shown on the dashboard" icon={User} hue="var(--hue-2)" />
        <label className="field">
          <span>Display name</span>
          <input
            className="input"
            type="text"
            value={state.profile.name}
            onChange={(e) => setProfile({ name: e.target.value })}
          />
        </label>
        <div className="theme-row">
          <span>Theme</span>
          <button type="button" className="btn btn-ghost" onClick={onToggleTheme}>
            {theme === 'dark' ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
            {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          </button>
        </div>
      </section>

      <section className="card card-lit pad">
        <CardHead
          title="Your database"
          sub="SQLite, stored in this browser via IndexedDB"
          icon={Download}
          hue="var(--hue-3)"
        />
        <p className="prose">
          Nothing is uploaded anywhere. Export writes a genuine{' '}
          <code className="inline-code">.sqlite</code> file — open it in DB Browser for SQLite, the{' '}
          <code className="inline-code">sqlite3</code> CLI, or IntelliJ&apos;s database tool.
        </p>
        <div className="btn-row">
          <button type="button" className="btn btn-ghost" onClick={exportBackup}>
            <Download size={14} aria-hidden="true" />
            Export .sqlite
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={14} aria-hidden="true" />
            Import .sqlite
          </button>
          <input ref={fileRef} type="file" accept=".sqlite,.db,application/vnd.sqlite3" onChange={onFile} hidden />
        </div>
        {message && <p className={`msg ${message.tone}`}>{message.text}</p>}
        <p className="foot-note">
          {state.attempts.length} attempts · {stats.solved} problems solved · started{' '}
          {state.startedOn}
        </p>
      </section>

      <RepoSync />

      <SqlConsole />

      <section className="card card-lit pad danger-zone">
        <CardHead title="Reset everything" sub="This cannot be undone" icon={AlertTriangle} hue="var(--danger)" />
        <p className="prose">
          Drops every attempt, note, streak and badge, and starts the journey from day zero. Export
          first if you might want it back.
        </p>
        {confirming ? (
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                await resetAll();
                setConfirming(false);
                setMessage({ tone: 'ok', text: 'Database reset.' });
              }}
            >
              Yes, delete all my progress
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => setConfirming(true)}>
            Reset all progress
          </button>
        )}
      </section>
    </>
  );
}
