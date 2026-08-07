import GithubMark from './ui/GithubMark';

export default function Footer({ meta }) {
  return (
    <footer className="footer">
      <p>
        Rendered from <code>src/data/progress.js</code> · updated {meta.lastSession}
      </p>
      <a className="footer-link" href={meta.repo} target="_blank" rel="noreferrer">
        <GithubMark size={13} />
        {meta.repo.replace('https://github.com/', '')}
      </a>
    </footer>
  );
}
