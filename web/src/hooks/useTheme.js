import { useCallback, useEffect, useState } from 'react';

const KEY = 'dsa-theme';

function resolveInitial() {
  const saved = localStorage.getItem(KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Theme is always an explicit value on <html data-theme>, so the toggle
 *  wins over the OS setting in both directions. */
export default function useTheme() {
  const [theme, setTheme] = useState(resolveInitial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#08080c' : '#f6f6f9');
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggle };
}
