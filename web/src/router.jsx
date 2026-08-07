import { useEffect, useState } from 'react';

const DEFAULT_ROUTE = '/dashboard';

function readHash() {
  const raw = window.location.hash.replace(/^#/, '');
  return raw || DEFAULT_ROUTE;
}

/** Hash routing keeps GitHub Pages happy — no server rewrites needed. */
export function useRoute() {
  const [path, setPath] = useState(readHash);

  useEffect(() => {
    const onChange = () => {
      setPath(readHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const [, section = 'dashboard', param = null] = path.split('/');
  return { path, section: `/${section}`, param };
}

export function navigate(to) {
  window.location.hash = to;
}

/** Anchor that keeps the hash-router contract in one place. */
export function Link({ to, className, children, ...rest }) {
  return (
    <a href={`#${to}`} className={className} {...rest}>
      {children}
    </a>
  );
}
