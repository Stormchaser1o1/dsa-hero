import { Lock, Sparkles, Star, Zap } from 'lucide-react';
import { Meter, PageHead } from '../components/ui/Bits';

export default function Achievements({ stats }) {
  const unlocked = stats.achievements.filter((a) => a.unlocked);
  const locked = stats.achievements.filter((a) => !a.unlocked);

  return (
    <>
      <PageHead title="Achievements" sub="Milestones you actually earned.">
        <span className="pill pill-accent">
          <Star size={11} strokeWidth={2.4} aria-hidden="true" />
          {unlocked.length} / {stats.achievements.length}
        </span>
      </PageHead>

      <section className="card card-lit pad level-panel">
        <div className="lp-left">
          <span className="lp-badge">{stats.level.level}</span>
          <div>
            <p className="lp-rank">{stats.level.rank}</p>
            <p className="lp-sub">
              Level {stats.level.level} · {stats.totalXp} XP total
            </p>
          </div>
        </div>
        <div className="lp-right">
          <Meter percent={stats.level.percent} height={8} />
          <p className="lp-xp">
            {stats.level.into} / {stats.level.need} XP to level {stats.level.level + 1}
          </p>
          <p className="lp-split">
            <Zap size={12} strokeWidth={2.3} aria-hidden="true" />
            {stats.problemXp} XP from problems · {stats.achievementXp} XP from badges
          </p>
        </div>
      </section>

      <section className="badge-section">
        <h2 className="section-h">
          <Sparkles size={15} strokeWidth={2.2} aria-hidden="true" />
          Unlocked
        </h2>
        {unlocked.length === 0 ? (
          <p className="sw-none">Nothing yet. Solve one problem and First Blood is yours.</p>
        ) : (
          <ul className="badge-grid">
            {unlocked.map((a) => (
              <li key={a.id} className="badge-card is-on" style={{ '--orb': a.hue }}>
                <span className="badge-orb">
                  <a.icon size={20} strokeWidth={2.1} aria-hidden="true" />
                </span>
                <p className="badge-name">{a.name}</p>
                <p className="badge-desc">{a.desc}</p>
                <span className="badge-xp">+{a.xp} XP</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="badge-section">
        <h2 className="section-h">
          <Lock size={14} strokeWidth={2.2} aria-hidden="true" />
          Locked
        </h2>
        <ul className="badge-grid">
          {locked.map((a) => (
            <li key={a.id} className="badge-card" style={{ '--orb': 'var(--fg-faint)' }}>
              <span className="badge-orb">
                <Lock size={17} strokeWidth={2.1} aria-hidden="true" />
              </span>
              <p className="badge-name">{a.name}</p>
              <p className="badge-desc">{a.desc}</p>
              <span className="badge-xp">+{a.xp} XP</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
