import { useRef, useState } from 'react';
import { AlertTriangle, Download, Moon, Sun, Target, Upload, User } from 'lucide-react';
import { useStore } from '../store/store';
import { CardHead, PageHead } from '../components/ui/Bits';

export default function Settings({ stats, theme, onToggleTheme }) {
  const { state, setGoals, setProfile, resetAll, importState } = useStore();
  const fileRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa-hero-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ tone: 'ok', text: 'Backup downloaded.' });
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      importState(await file.text());
      setMessage({ tone: 'ok', text: 'Progress restored from backup.' });
    } catch (err) {
      setMessage({ tone: 'bad', text: err.message || 'Could not read that file.' });
    }
    e.target.value = '';
  };

  return (
    <>
      <PageHead title="Settings" sub="Goals, profile and your data." />

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
        <CardHead title="Your data" sub="Stored in this browser only" icon={Download} hue="var(--hue-3)" />
        <p className="prose">
          Progress lives in this browser&apos;s local storage — it is not uploaded anywhere. Export a
          backup before clearing site data or switching machines.
        </p>
        <div className="btn-row">
          <button type="button" className="btn btn-ghost" onClick={exportBackup}>
            <Download size={14} aria-hidden="true" />
            Export backup
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={14} aria-hidden="true" />
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={onFile}
            hidden
          />
        </div>
        {message && <p className={`msg ${message.tone}`}>{message.text}</p>}
        <p className="foot-note">
          {state.attempts.length} attempts · {stats.solved} problems solved · started {state.startedOn}
        </p>
      </section>

      <section className="card card-lit pad danger-zone">
        <CardHead title="Reset everything" sub="This cannot be undone" icon={AlertTriangle} hue="var(--danger)" />
        <p className="prose">
          Wipes every attempt, note, streak and badge, and starts the journey from day zero.
        </p>
        {confirming ? (
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                resetAll();
                setConfirming(false);
                setMessage({ tone: 'ok', text: 'Everything reset.' });
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
