import { Flame, Menu, Shield, X } from 'lucide-react';
import { NAV } from '../../data/nav';
import { Link } from '../../router';
import { Meter } from '../ui/Bits';

export default function Sidebar({ section, stats, open, onToggle, onNavigate }) {
  const { level, currentStreak, bestStreak } = stats;

  return (
    <>
      <button
        type="button"
        className={`sidebar-scrim ${open ? 'is-open' : ''}`}
        onClick={onToggle}
        aria-hidden={!open}
        tabIndex={-1}
      />

      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-top">
          <Link to="/dashboard" className="brand" onClick={onNavigate}>
            <span className="brand-mark">
              <Shield size={17} strokeWidth={2.3} aria-hidden="true" />
            </span>
            <span className="brand-name">
              DSA <span className="brand-accent">HERO</span>
            </span>
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-icon sidebar-close"
            onClick={onToggle}
            aria-label="Close navigation"
          >
            <X size={17} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>

        <nav className="nav">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`nav-item ${section === to ? 'is-active' : ''}`}
              aria-current={section === to ? 'page' : undefined}
              onClick={onNavigate}
            >
              <Icon size={17} strokeWidth={2} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="side-card streak-card">
            <div className="side-card-head">
              <span className="side-icon streak-icon">
                <Flame size={14} strokeWidth={2.3} aria-hidden="true" />
              </span>
              <span className="side-label">Current Streak</span>
            </div>
            <p className="streak-big">
              {currentStreak} <span>{currentStreak === 1 ? 'Day' : 'Days'}</span>
            </p>
            <p className="side-foot">Best streak: {bestStreak} days</p>
          </div>

          <Link to="/achievements" className="side-card level-card" onClick={onNavigate}>
            <div className="level-row">
              <span className="level-badge">{level.rank.charAt(0)}</span>
              <span className="level-text">
                <span className="level-rank">{level.rank}</span>
                <span className="side-foot">Level {level.level}</span>
              </span>
            </div>
            <Meter percent={level.percent} height={5} />
            <p className="side-foot">
              {level.into} / {level.need} XP
            </p>
          </Link>
        </div>
      </aside>
    </>
  );
}

export function MenuButton({ onClick }) {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-icon menu-btn"
      onClick={onClick}
      aria-label="Open navigation"
    >
      <Menu size={18} strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
}
