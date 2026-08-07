import { BookMarked, Code2, ExternalLink, Gauge, Ruler } from 'lucide-react';
import { COMPLEXITY_TABLE, CONSTRAINT_HINTS, JAVA_SNIPPETS, LINKS } from '../data/resources';
import { CardHead, PageHead } from '../components/ui/Bits';

export default function Resources() {
  return (
    <>
      <PageHead title="Resources" sub="The references worth keeping open while you practise." />

      <section className="card card-lit pad">
        <CardHead
          title="Read the constraints first"
          sub="n tells you the algorithm before you have an idea"
          icon={Ruler}
          hue="var(--hue-8)"
        />
        <div className="table-scroll">
          <table className="ptable">
            <thead>
              <tr>
                <th scope="col">Constraint</th>
                <th scope="col">Budget</th>
                <th scope="col">What it means</th>
              </tr>
            </thead>
            <tbody>
              {CONSTRAINT_HINTS.map((r) => (
                <tr key={r.n}>
                  <td>
                    <code className="inline-code">{r.n}</code>
                  </td>
                  <td>
                    <b>{r.budget}</b>
                  </td>
                  <td className="c-dim">{r.means}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card card-lit pad">
        <CardHead title="Complexity cheat sheet" sub="Know these cold" icon={Gauge} hue="var(--warn)" />
        <div className="table-scroll">
          <table className="ptable">
            <thead>
              <tr>
                <th scope="col">Operation</th>
                <th scope="col">Time</th>
                <th scope="col">Note</th>
              </tr>
            </thead>
            <tbody>
              {COMPLEXITY_TABLE.map((r) => (
                <tr key={r.op}>
                  <td>{r.op}</td>
                  <td>
                    <code className="inline-code">{r.time}</code>
                  </td>
                  <td className="c-dim">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card card-lit pad">
        <CardHead title="Java snippets" sub="The lines you will retype a hundred times" icon={Code2} hue="var(--hue-3)" />
        <div className="snippet-grid">
          {JAVA_SNIPPETS.map((s) => (
            <div key={s.name} className="snippet">
              <p className="snippet-name">{s.name}</p>
              <pre className="code">
                <code>{s.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      <section className="card card-lit pad">
        <CardHead title="Links" sub="Practice, visualise, reference" icon={BookMarked} />
        <div className="link-groups">
          {LINKS.map((g) => (
            <div key={g.group} className="link-group">
              <p className="link-group-name">{g.group}</p>
              <ul className="link-list">
                {g.items.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noreferrer">
                      <span className="link-name">
                        {l.name}
                        <ExternalLink size={11} strokeWidth={2.2} aria-hidden="true" />
                      </span>
                      <span className="link-note">{l.note}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
