/**
 * Render smoke test — mounts the real App in jsdom, walks every route, and
 * fails on any console error or thrown exception. Catches broken imports,
 * bad hooks and crashing effects that a successful bundle build would not.
 *
 * Run with: npm run smoke
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

const { window } = dom;

// Minimal browser globals React and the app touch.
globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Element = window.Element;
globalThis.Node = window.Node;
globalThis.localStorage = window.localStorage;
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
// Deliberately NOT overriding performance / URL / Blob — Node already provides
// them, and jsdom's Performance delegates back to the global, which recurses.

// jsdom has no layout engine, so scrolling is a no-op here.
window.scrollTo = () => {};

// jsdom ships neither of these.
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
});
globalThis.matchMedia = window.matchMedia;

class IO {
  constructor(cb) {
    this.cb = cb;
  }
  observe(el) {
    this.cb([{ isIntersecting: true, target: el }], this);
  }
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = IO;
window.IntersectionObserver = IO;

const problems = [];
const origError = console.error;
console.error = (...args) => {
  problems.push(args.map(String).join(' '));
  origError(...args);
};
window.addEventListener('error', (e) => problems.push(`window error: ${e.message}`));

// Load the app through Vite so JSX and CSS imports resolve exactly as they
// do in the real build.
const { createServer } = await import('vite');
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const { default: React } = await import('react');
const { createRoot } = await import('react-dom/client');
const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
const { PROBLEMS } = await vite.ssrLoadModule('/src/data/problems.js');
const { TOPICS } = await vite.ssrLoadModule('/src/data/topics.js');
const { STAGES } = await vite.ssrLoadModule('/src/data/stages.js');
const { PATTERNS } = await vite.ssrLoadModule('/src/data/patterns.js');

const root = createRoot(document.getElementById('root'));
const el = document.getElementById('root');

async function renderRoute(hash) {
  window.location.hash = hash;
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  await new Promise((resolve) => {
    root.render(React.createElement(App));
    setTimeout(resolve, 120);
  });
  return el.innerHTML;
}

const checks = [];

// ---- data integrity ---------------------------------------------------
const ids = PROBLEMS.map((p) => p.id);
checks.push(['problem ids are unique', new Set(ids).size === ids.length]);
checks.push(['every problem has a known topic', PROBLEMS.every((p) => TOPICS.some((t) => t.id === p.topic))]);
checks.push([
  'every problem has a valid difficulty',
  PROBLEMS.every((p) => ['easy', 'medium', 'hard'].includes(p.difficulty)),
]);
checks.push(['24 topics defined', TOPICS.length === 24]);
checks.push(['9 stages defined', STAGES.length === 9]);
checks.push([`problem bank is populated (${PROBLEMS.length})`, PROBLEMS.length >= 200]);
checks.push([`patterns defined (${PATTERNS.length})`, PATTERNS.length >= 12]);

// ---- routes render ----------------------------------------------------
const ROUTES = [
  ['/dashboard', 'welcome-title'],
  ['/today', 'mission'],
  ['/practice', 'pick-list'],
  [`/practice/${PROBLEMS[20].id}`, 'timer-face'],
  ['/problems', 'ptable'],
  ['/progress', 'factor-list'],
  ['/patterns', 'pattern-grid'],
  ['/contests', 'round-grid'],
  ['/achievements', 'badge-grid'],
  ['/notes', 'page-title'],
  ['/resources', 'ptable'],
  ['/roadmap', 'stage-track'],
  ['/settings', 'sql-input'],
];

for (const [route, marker] of ROUTES) {
  const html = await renderRoute(`#${route}`);
  checks.push([`${route} renders`, html.length > 500 && html.includes(marker)]);
  if (html.includes('NaN')) checks.push([`${route} leaks NaN`, false]);
  if (html.includes('undefined<') || html.includes('>undefined'))
    checks.push([`${route} leaks undefined`, false]);
}

// The sidebar must survive every navigation.
const last = el.innerHTML;
checks.push(['sidebar is present', last.includes('nav-item')]);
checks.push(['no NaN anywhere in the final render', !last.includes('NaN')]);

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}

if (problems.length) {
  console.log(`\nFAIL  ${problems.length} console error(s):`);
  problems.slice(0, 12).forEach((p) => console.log(`  - ${p.slice(0, 400)}`));
  failed++;
}

await vite.close();

console.log(failed ? `\n${failed} check(s) failed.` : `\nAll ${checks.length} checks passed.`);
process.exit(failed ? 1 : 0);
