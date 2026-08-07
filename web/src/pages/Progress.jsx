import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Gauge, Layers, ThumbsUp, TrendingUp } from 'lucide-react';
import { useStore } from '../store/store';
import { DIFFICULTIES, DIFFICULTY_META } from '../data/problems';
import { MISTAKE_BY_ID } from '../data/mistakes';
import { nextStageProgress } from '../data/stages';
import { monthLabel, todayKey } from '../lib/date';
import Heatmap from '../components/ui/Heatmap';
import Sparkline from '../components/ui/Sparkline';
import { CardHead, Empty, Meter, PageHead } from '../components/ui/Bits';

export default function Progress({ stats }) {
  const { state } = useStore();
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const last14 = useMemo(() => {
    const keys = [];
    const d = new Date();
    for (let i = 13; i >= 0; i--) {
      const t = new Date(d);
      t.setDate(d.getDate() - i);
      keys.push(
        `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
      );
    }
    return keys.map((k) => stats.activity.get(k) ?? 0);
  }, [stats.activity]);

  const stage = nextStageProgress(stats.metrics);
  const mistakes = [...stats.mistakeCounts.entries()].sort((a, b) => b[1] - a[1]);
  const maxMistake = mistakes.length ? mistakes[0][1] : 0;

  const shiftMonth = (n) => {
    const d = new Date(cursor.y, cursor.m + n, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <>
      <PageHead title="Progress" sub="Where you are, and what is holding the score back." />

      <section className="card card-lit pad readiness">
        <CardHead
          title="Interview Readiness"
          sub="Weighted across coverage, difficulty, independence and consistency"
          icon={Gauge}
          hue={stats.readiness.band.hue}
        />
        <div className="ready-head">
          <div className="ready-score" style={{ '--band': stats.readiness.band.hue }}>
            <span className="ready-num">{stats.readiness.score}</span>
            <span className="ready-of">/ 100</span>
          </div>
          <div className="ready-band">
            <p className="ready-band-name" style={{ color: stats.readiness.band.hue }}>
              {stats.readiness.band.label}
            </p>
            <Meter percent={stats.readiness.score} height={8} color={stats.readiness.band.hue} tone="custom" />
            {stats.readiness.penalty > 0 && (
              <p className="ready-penalty">
                <AlertTriangle size={12} strokeWidth={2.3} aria-hidden="true" />
                −{stats.readiness.penalty.toFixed(1)} for {stats.weakTopics.length} unaddressed weak topic
                {stats.weakTopics.length === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>

        <ul className="factor-list">
          {stats.readiness.factors.map((f) => (
            <li key={f.id} className="factor">
              <span className="factor-label">
                {f.label}
                <span className="factor-weight">{f.weight}%</span>
              </span>
              <Meter percent={f.value * 100} height={5} />
              <span className="factor-hint">{f.hint}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid-2">
        <section className="card card-lit pad">
          <CardHead title="Activity" sub={monthLabel(cursor.y, cursor.m)} icon={TrendingUp}>
            <div className="month-nav">
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                <ChevronLeft size={15} aria-hidden="true" />
              </button>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => shiftMonth(1)} aria-label="Next month">
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </div>
          </CardHead>
          <Heatmap year={cursor.y} month={cursor.m} activity={stats.activity} />
          <div className="spark-block">
            <p className="spark-label">Attempts, last 14 days</p>
            <Sparkline points={last14} />
          </div>
        </section>

        <section className="card card-lit pad">
          <CardHead title="Next stage" sub={stage.next ? stage.next.name : 'Journey complete'} icon={Layers} hue="var(--hue-8)" />
          {stage.next ? (
            <>
              <p className="stage-blurb">{stage.next.blurb}</p>
              <Meter percent={stage.percent} height={7} />
              <p className="stage-pct">{Math.round(stage.percent)}% of the way there</p>
              <ul className="req-list">
                {stage.checks.map((c) => {
                  const done = c.have >= c.need;
                  return (
                    <li key={c.label} className={done ? 'is-done' : ''}>
                      <span>{c.label}</span>
                      <b>
                        {c.have}
                        {c.unit ?? ''} / {c.need}
                        {c.unit ?? ''}
                      </b>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <Empty icon={Layers} title="Every stage cleared" copy="You are FAANG/MAANG ready by this system's measure." />
          )}
        </section>
      </div>

      <section className="card card-lit pad">
        <CardHead title="Topic mastery" sub="70% of a topic's problems marks it complete" icon={Layers} hue="var(--hue-3)" />
        <ul className="topic-list">
          {stats.byTopic.map((t) => (
            <li key={t.id} className={`topic-row ${t.unlocked ? '' : 'is-locked'}`}>
              <span className="topic-ico" style={{ '--th': `var(--hue-${t.hue})` }}>
                <t.icon size={14} strokeWidth={2.1} aria-hidden="true" />
              </span>
              <span className="topic-name">{t.name}</span>
              <span className="topic-bar">
                <Meter percent={t.ratio * 100} height={5} tone={t.completed ? 'success' : 'gradient'} />
              </span>
              <span className="topic-count">
                {t.solved}/{t.total}
              </span>
              <span className="topic-acc">
                {t.accuracy == null ? '—' : `${Math.round(t.accuracy)}%`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid-2">
        <section className="card card-lit pad">
          <CardHead title="Mistake profile" sub="Logged from your own attempts" icon={AlertTriangle} hue="var(--danger)" />
          {mistakes.length === 0 ? (
            <Empty icon={AlertTriangle} title="No mistakes logged yet" copy="Tag what went wrong when you save an attempt." />
          ) : (
            <ul className="mistake-list">
              {mistakes.map(([id, count]) => {
                const m = MISTAKE_BY_ID[id];
                if (!m) return null;
                return (
                  <li key={id} className="mistake-row" style={{ '--mh': m.hue }}>
                    <span className="mistake-name">{m.label}</span>
                    <span className="mistake-bar">
                      <Meter percent={(count / maxMistake) * 100} height={5} tone="custom" color={m.hue} />
                    </span>
                    <b>{count}</b>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card card-lit pad">
          <CardHead title="Strong and weak" sub="Needs 3+ attempts in a topic to register" icon={ThumbsUp} hue="var(--success)" />
          <div className="sw-block">
            <p className="sw-head weak">Weak topics</p>
            {stats.weakTopics.length === 0 ? (
              <p className="sw-none">Nothing flagged.</p>
            ) : (
              <ul className="sw-list">
                {stats.weakTopics.map((t) => (
                  <li key={t.id}>
                    <span className="sw-dot weak" aria-hidden="true" />
                    {t.name}
                    <b>{Math.round(t.accuracy)}%</b>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="sw-block">
            <p className="sw-head strong">Strong topics</p>
            {stats.strongTopics.length === 0 ? (
              <p className="sw-none">Nothing yet — keep solving.</p>
            ) : (
              <ul className="sw-list">
                {stats.strongTopics.map((t) => (
                  <li key={t.id}>
                    <span className="sw-dot strong" aria-hidden="true" />
                    {t.name}
                    <b>{Math.round(t.accuracy)}%</b>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className="card card-lit pad">
        <CardHead title="Difficulty split" sub="All time" icon={Gauge} hue="var(--warn)" />
        <div className="diff-stack wide">
          {DIFFICULTIES.map((d) => {
            const row = stats.byDifficulty[d];
            const meta = DIFFICULTY_META[d];
            return (
              <div key={d} className="diff-line" style={{ '--diff': meta.color }}>
                <span className="diff-line-head">
                  <span className="diff-name">{meta.label}</span>
                  <span className="diff-num">
                    {row.solved} <span className="muted">/ {row.total}</span>
                  </span>
                </span>
                <Meter percent={(row.solved / row.total) * 100} tone="custom" height={6} />
              </div>
            );
          })}
        </div>
        <p className="foot-note">
          Started {state.startedOn} · {stats.activeDays.length} active days · last session{' '}
          {stats.activeDays.at(-1) ?? todayKey()}
        </p>
      </section>
    </>
  );
}
