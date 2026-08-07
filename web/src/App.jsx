import progress from './data/progress';
import { solvedCount } from './data/selectors';
import useTheme from './hooks/useTheme';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import Today from './components/Today';
import Stats from './components/Stats';
import Breakdown from './components/Breakdown';
import Roadmap from './components/Roadmap';
import Revision from './components/Revision';
import Footer from './components/Footer';

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <TopBar
        meta={progress.meta}
        solved={solvedCount(progress.phases)}
        theme={theme}
        onToggleTheme={toggle}
      />

      <main id="main" className="shell" tabIndex={-1}>
        <span id="top" />
        <Hero nextAction={progress.nextAction} phases={progress.phases} />
        <Today meta={progress.meta} nextAction={progress.nextAction} />
        <Stats data={progress} />
        <Breakdown phases={progress.phases} />
        <Roadmap phases={progress.phases} currentPhaseId={progress.currentPhaseId} />
        <Revision revisionDue={progress.revisionDue} weakAreas={progress.weakAreas} />
        <Footer meta={progress.meta} />
      </main>
    </>
  );
}
