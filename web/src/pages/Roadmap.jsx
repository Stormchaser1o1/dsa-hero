import { Check, Lock, Map as MapIcon, Unlock } from 'lucide-react';
import { STAGES, STAGE_IDS, nextStageProgress } from '../data/stages';
import { Link } from '../router';
import { CardHead, Meter, PageHead } from '../components/ui/Bits';

export default function Roadmap({ stats }) {
  const currentIdx = STAGE_IDS.indexOf(stats.stage.id);
  const next = nextStageProgress(stats.metrics);

  return (
    <>
      <PageHead
        title="Roadmap"
        sub="Nine stages. Each one unlocks on performance, not on time served."
      >
        <span className="pill pill-accent">{stats.stage.name}</span>
      </PageHead>

      <section className="card card-lit pad">
        <CardHead
          title="Where you are"
          sub={next.next ? `Next: ${next.next.name}` : 'Final stage reached'}
          icon={MapIcon}
        />
        <p className="stage-blurb">{stats.stage.blurb}</p>
        {next.next && (
          <>
            <Meter percent={next.percent} height={8} />
            <p className="stage-pct">{Math.round(next.percent)}% toward {next.next.name}</p>
          </>
        )}
      </section>

      <ol className="stage-track">
        {STAGES.map((s, i) => {
          const reached = i <= currentIdx;
          const active = i === currentIdx;
          const topics = stats.byTopic.filter((t) => t.stage === s.id);

          return (
            <li key={s.id} className={`stage ${reached ? 'is-reached' : ''} ${active ? 'is-active' : ''}`}>
              <span className="stage-rail" aria-hidden="true" />
              <span className="stage-node">
                {reached ? (
                  active ? (
                    <Unlock size={15} strokeWidth={2.2} aria-hidden="true" />
                  ) : (
                    <Check size={15} strokeWidth={3} aria-hidden="true" />
                  )
                ) : (
                  <Lock size={14} strokeWidth={2.2} aria-hidden="true" />
                )}
              </span>

              <div className="stage-card card card-lit pad">
                <header className="stage-head">
                  <div>
                    <p className="stage-index">Stage {i}</p>
                    <h2 className="stage-name">{s.name}</h2>
                    <p className="stage-tag">{s.tagline}</p>
                  </div>
                  <span className={`pill ${active ? 'pill-accent' : reached ? 'pill-success' : 'pill-muted'}`}>
                    {active ? 'Current' : reached ? 'Cleared' : 'Locked'}
                  </span>
                </header>

                <p className="stage-blurb">{s.blurb}</p>

                {i > 0 && (
                  <ul className="req-inline">
                    {Object.entries(s.requires)
                      .filter(([, v]) => v > 0)
                      .map(([k, v]) => {
                        const have =
                          k === 'solved'
                            ? stats.metrics.solved
                            : k === 'topics'
                              ? stats.metrics.topicsCompleted
                              : k === 'accuracy'
                                ? Math.round(stats.metrics.accuracy)
                                : stats.metrics[k];
                        return (
                          <li key={k} className={have >= v ? 'is-met' : ''}>
                            {k === 'accuracy' ? 'accuracy' : k} {have}/{v}
                          </li>
                        );
                      })}
                  </ul>
                )}

                {topics.length > 0 && (
                  <div className="stage-topics">
                    {topics.map((t) => (
                      <span key={t.id} className={`stage-topic ${t.completed ? 'is-done' : ''}`}>
                        <t.icon size={11} strokeWidth={2.2} aria-hidden="true" />
                        {t.short}
                        <b>
                          {t.solved}/{t.total}
                        </b>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <section className="card card-lit pad">
        <CardHead title="How unlocking works" sub="Performance gates, not lesson counts" icon={Unlock} hue="var(--hue-3)" />
        <p className="prose">
          A topic opens once the previous one is 60% solved, and counts as complete at 70%. A stage
          opens only when every one of its requirements is met at the same time — so you cannot
          reach <b>Interview Ready</b> by grinding easies. If accuracy drops or a topic goes weak,
          the daily planner pulls you back to reinforcement automatically.
        </p>
        <Link to="/today" className="btn btn-primary">
          Back to today&apos;s plan
        </Link>
      </section>
    </>
  );
}
