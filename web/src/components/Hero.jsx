import { ArrowRight, Calendar, Swords } from 'lucide-react';
import ProgressRing from './ui/ProgressRing';
import Reveal from './ui/Reveal';
import { overallPercent, solvedCount, totalCount } from '../data/selectors';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Burning the midnight oil';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Hero({ nextAction, phases }) {
  const pct = overallPercent(phases);

  return (
    <Reveal as="section" className="hero" aria-labelledby="hero-title">
      <div className="hero-glow" aria-hidden="true" />

      <div className="hero-main">
        <span className="pill pill-accent hero-badge">
          <Swords size={11} strokeWidth={2.4} aria-hidden="true" />
          Up next
        </span>

        <p className="hero-greeting">{greeting()}, Yogender.</p>
        <h1 id="hero-title" className="hero-title">
          {nextAction.title}
        </h1>
        <p className="hero-desc">{nextAction.description}</p>

        <div className="hero-actions">
          <a className="btn btn-primary" href="#today">
            Start today's set
            <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
          </a>
          <span className="hero-meta">
            <Calendar size={13} strokeWidth={2} aria-hidden="true" />
            {nextAction.topic}
          </span>
        </div>
      </div>

      <div className="hero-ring">
        <ProgressRing percent={pct} size={156} stroke={11} />
        <p className="hero-ring-cap">
          {solvedCount(phases)} of {totalCount(phases)} problems solved
        </p>
      </div>
    </Reveal>
  );
}
