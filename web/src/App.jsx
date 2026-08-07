import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { StoreProvider } from './store/store';
import useStats from './hooks/useStats';
import useTheme from './hooks/useTheme';
import { useRoute } from './router';
import Sidebar, { MenuButton } from './components/layout/Sidebar';

import Dashboard from './pages/Dashboard';
import TodaysPlan from './pages/TodaysPlan';
import Practice from './pages/Practice';
import Problems from './pages/Problems';
import Progress from './pages/Progress';
import Patterns from './pages/Patterns';
import Contests from './pages/Contests';
import Achievements from './pages/Achievements';
import Notes from './pages/Notes';
import Resources from './pages/Resources';
import Roadmap from './pages/Roadmap';
import Settings from './pages/Settings';

const PAGES = {
  '/dashboard': Dashboard,
  '/today': TodaysPlan,
  '/practice': Practice,
  '/problems': Problems,
  '/progress': Progress,
  '/patterns': Patterns,
  '/contests': Contests,
  '/achievements': Achievements,
  '/notes': Notes,
  '/resources': Resources,
  '/roadmap': Roadmap,
  '/settings': Settings,
};

function Shell() {
  const { section, param } = useRoute();
  const stats = useStats();
  const { theme, toggle } = useTheme();
  const [navOpen, setNavOpen] = useState(false);

  const Page = PAGES[section] ?? Dashboard;

  useEffect(() => {
    setNavOpen(false);
  }, [section, param]);

  return (
    <div className="app">
      <Sidebar
        section={section}
        stats={stats}
        open={navOpen}
        onToggle={() => setNavOpen((v) => !v)}
        onNavigate={() => setNavOpen(false)}
      />

      <div className="main">
        <div className="mobile-bar">
          <MenuButton onClick={() => setNavOpen(true)} />
          <span className="mobile-title">DSA HERO</span>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </button>
        </div>

        <main id="main" className="content" tabIndex={-1}>
          <Page stats={stats} param={param} theme={theme} onToggleTheme={toggle} />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
