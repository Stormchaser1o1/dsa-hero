/**
 * Stat tile. `accent` tints the icon chip; children render below the value
 * (a meter, a caption, whatever the tile needs).
 */
export default function StatCard({ icon: Icon, label, value, hint, accent = 'var(--accent)', children }) {
  return (
    <article className="stat" style={{ '--stat-accent': accent }}>
      <header className="stat-head">
        <span className="stat-chip">
          <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <h3 className="stat-label">{label}</h3>
      </header>

      <p className="stat-value">{value}</p>
      {hint && <p className="stat-hint">{hint}</p>}
      {children}
    </article>
  );
}
