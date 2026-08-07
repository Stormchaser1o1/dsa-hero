import { useEffect, useState } from 'react';
import { Flame, Moon, Sun, Swords } from 'lucide-react';
import GithubMark from './ui/GithubMark';

export default function TopBar({ meta, solved, theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrolled(y > 8);
        setScrollPct(max > 0 ? (y / max) * 100 : 0);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className={`topbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="topbar-inner">
        <a className="brand" href="#top">
          <span className="brand-mark">
            <Swords size={15} strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span className="brand-text">
            <span className="brand-name">{meta.title}</span>
            <span className="brand-sub">{solved} solved</span>
          </span>
        </a>

        <div className="topbar-actions">
          <span className="pill pill-streak streak-pill" title={`${meta.streakDays}-day streak`}>
            <Flame size={12} strokeWidth={2.4} aria-hidden="true" />
            {meta.streakDays}
            <span className="sr-only">day streak</span>
          </span>

          <a
            className="btn btn-ghost btn-icon"
            href={meta.repo}
            target="_blank"
            rel="noreferrer"
            aria-label="Open repository on GitHub"
          >
            <GithubMark size={16} />
          </a>

          <button
            type="button"
            className="btn btn-ghost btn-icon theme-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun size={16} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Moon size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div className="scroll-progress" style={{ transform: `scaleX(${scrollPct / 100})` }} />
    </header>
  );
}
