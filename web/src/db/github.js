/**
 * Writing the logbook back to GitHub from the browser.
 *
 * The app is a static page, so the only way progress can leave this machine is
 * an authenticated call to the GitHub API. A fine-grained token with Contents
 * read/write on this one repository is enough.
 *
 * The token is deliberately kept in localStorage and NOT in the SQLite database,
 * because Settings can export that database as a file — a token living in there
 * would ride along into every backup. Keeping it separate means an exported
 * .sqlite is safe to hand to anyone.
 *
 * Anyone who can read this browser profile can read the token. That is an
 * accepted trade for a single-user app; revoke it at
 * github.com/settings/tokens if the machine is ever shared.
 */
const KEY = 'dsa-hero-github';

const DEFAULTS = {
  token: '',
  owner: 'Stormchaser1o1',
  repo: 'dsa-hero',
  branch: 'main',
  path: 'web/public/logbook.json',
};

export function readConfig() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writeConfig(patch) {
  const next = { ...readConfig(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearConfig() {
  localStorage.removeItem(KEY);
}

/** Configured means "has a token"; everything else has a working default. */
export function isConfigured() {
  return Boolean(readConfig().token);
}

async function api(path, { token, ...init } = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(`GitHub ${res.status}: ${detail.message ?? res.statusText}`);
  }
  return res.json();
}

// btoa works on bytes, not characters, so UTF-8 has to be encoded first or any
// non-ASCII character in a note throws. The reverse applies on the way back.
// Exported so the round-trip can be tested — notes routinely contain em dashes.
export const encode = (text) => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  // Chunked, because spreading a large array into fromCharCode blows the stack.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

export const decode = (b64) =>
  new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));

/** Confirms the token works and can actually write to the repository. */
export async function verify() {
  const cfg = readConfig();
  if (!cfg.token) throw new Error('No token saved.');
  const repo = await api(`/repos/${cfg.owner}/${cfg.repo}`, { token: cfg.token });
  if (!repo.permissions?.push) {
    throw new Error('That token can read the repository but not write to it.');
  }
  return `Connected to ${repo.full_name} as a writer.`;
}

/**
 * Current logbook on the branch, plus the blob sha needed to update it.
 * Returns null when the file does not exist yet.
 */
export async function fetchLogbook() {
  const cfg = readConfig();
  if (!cfg.token) return null;
  try {
    const file = await api(
      `/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}?ref=${cfg.branch}`,
      { token: cfg.token }
    );
    return { sha: file.sha, json: JSON.parse(decode(file.content)) };
  } catch (err) {
    if (String(err.message).includes('404')) return null;
    throw err;
  }
}

/**
 * Commits the logbook. Passing the sha we last saw makes GitHub reject the
 * write if something else changed the file first, so a stale tab cannot
 * silently overwrite a newer commit.
 */
export async function commitLogbook(json, sha, message) {
  const cfg = readConfig();
  if (!cfg.token) throw new Error('No token saved.');
  const body = {
    message,
    content: encode(`${JSON.stringify(json, null, 2)}\n`),
    branch: cfg.branch,
    ...(sha ? { sha } : {}),
  };
  const res = await api(`/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}`, {
    token: cfg.token,
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.content.sha;
}
