import { useEffect } from 'react';
import { X } from 'lucide-react';
import { DIFFICULTY_META } from '../../data/problems';

/** Difficulty chip — one component so the colour never drifts. */
export function Diff({ level, size = 'md' }) {
  const meta = DIFFICULTY_META[level];
  if (!meta) return null;
  return (
    <span className={`diff diff-${size}`} style={{ '--diff': meta.color }}>
      {meta.label}
    </span>
  );
}

/** Section heading used at the top of every page. */
export function PageHead({ title, sub, children }) {
  return (
    <header className="page-head">
      <div>
        <h1 className="page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  );
}

export function CardHead({ title, sub, icon: Icon, hue = 'var(--accent)', children }) {
  return (
    <header className="ch">
      {Icon && (
        <span className="ch-icon" style={{ '--ch-hue': hue }}>
          <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
        </span>
      )}
      <div className="ch-text">
        <h2 className="ch-title">{title}</h2>
        {sub && <p className="ch-sub">{sub}</p>}
      </div>
      {children && <div className="ch-actions">{children}</div>}
    </header>
  );
}

export function Empty({ icon: Icon, title, copy, children }) {
  return (
    <div className="empty-state">
      {Icon && (
        <span className="empty-glyph" aria-hidden="true">
          <Icon size={20} strokeWidth={2} />
        </span>
      )}
      <p className="empty-title">{title}</p>
      {copy && <p className="empty-copy">{copy}</p>}
      {children}
    </div>
  );
}

export function Meter({ percent, tone = 'gradient', height = 6, color }) {
  const clamped = Math.max(0, Math.min(100, percent || 0));
  return (
    <div
      className="meter"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span
        className={`meter-fill meter-${tone}`}
        style={{ width: `${clamped}%`, ...(color ? { background: color } : null) }}
      />
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`modal ${wide ? 'is-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          <h2 className="modal-title">{title}</h2>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
