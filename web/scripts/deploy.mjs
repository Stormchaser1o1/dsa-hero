/**
 * Publishes web/dist to the `gh-pages` branch, which GitHub Pages serves.
 *
 * We push a prebuilt branch rather than building in CI because custom GitHub
 * Actions workflows are not yet enabled on this account — GitHub's managed
 * "pages build and deployment" job is. Once Actions runs, switch Pages back to
 * build_type=workflow and this script becomes optional; .github/workflows/
 * deploy.yml is already in place for that.
 *
 * Run with: npm run deploy
 */
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const webDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(webDir, '..');
const distDir = join(webDir, 'dist');
const workDir = join(repoRoot, '.deploy');
const BRANCH = 'gh-pages';

const git = (args, cwd = repoRoot) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' }).trim();

const step = (msg) => console.log(`\n[36m▸[0m ${msg}`);

if (!existsSync(distDir)) {
  console.error('No web/dist — run `npm run build` first.');
  process.exit(1);
}

// A stale worktree registration survives a deleted directory, so prune first.
step('Preparing worktree');
git(['worktree', 'prune']);

if (!existsSync(workDir)) {
  const hasRemoteBranch = git(['ls-remote', '--heads', 'origin', BRANCH]).length > 0;
  if (hasRemoteBranch) {
    git(['fetch', 'origin', BRANCH]);
    git(['worktree', 'add', '-B', BRANCH, workDir, `origin/${BRANCH}`]);
  } else {
    git(['worktree', 'add', '--detach', workDir]);
    git(['checkout', '--orphan', BRANCH], workDir);
    git(['rm', '-rf', '.'], workDir);
  }
} else {
  git(['fetch', 'origin', BRANCH]);
  git(['reset', '--hard', `origin/${BRANCH}`], workDir);
}

step('Syncing build output');
for (const entry of readdirSync(workDir)) {
  if (entry !== '.git') rmSync(join(workDir, entry), { recursive: true, force: true });
}
mkdirSync(workDir, { recursive: true });
cpSync(distDir, workDir, { recursive: true });
// Stops Pages running the output through Jekyll, which would drop _-prefixed files.
writeFileSync(join(workDir, '.nojekyll'), '');

step('Publishing');
git(['add', '-A'], workDir);

const dirty = git(['status', '--porcelain'], workDir);
if (!dirty) {
  console.log('\nNothing changed — site already up to date.');
  process.exit(0);
}

const sha = git(['rev-parse', '--short', 'HEAD']);
git(['commit', '-m', `Deploy dashboard from ${sha}`], workDir);
git(['push', 'origin', BRANCH], workDir);

console.log('\n[32m✔[0m Deployed → https://stormchaser1o1.github.io/dsa-hero/');
