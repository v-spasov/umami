// Vercel runs this before installing dependencies: 0 skips, 1 builds.
const { execFileSync } = require('node:child_process');

const nonRuntimeDirectories = ['docs/', '.github/', 'desktop/', 'mobile/'];
const nonRuntimeFiles = new Set([
  'AGENTS.md', 'CLAUDE.md', 'README.md', 'CONTRIBUTING.md', 'LICENSE',
  'dependabot-review.md', 'scripts/test-vercel-build-ignore.cjs',
]);

function isNonRuntime(file) {
  return nonRuntimeFiles.has(file) || nonRuntimeDirectories.some(dir => file.startsWith(dir));
}

function shouldSkip(env, changedFiles) {
  if (env.FORCE_VERCEL_BUILD === '1') return false;
  const branch = env.VERCEL_GIT_COMMIT_REF;
  if (env.VERCEL_ENV === 'preview' && branch) return true;
  // Never compare just HEAD^: earlier unbuilt application changes must still deploy.
  const previous = env.VERCEL_GIT_PREVIOUS_SHA;
  const current = env.VERCEL_GIT_COMMIT_SHA;
  if (![previous, current].every(sha => /^[a-f0-9]{40,64}$/i.test(sha || ''))) return false;
  try {
    return changedFiles(previous, current).every(isNonRuntime);
  } catch {
    // Missing shallow history or a Git failure must allow the application to build.
    return false;
  }
}

if (require.main === module) {
  const skip = shouldSkip(process.env, (previous, current) =>
    execFileSync('git', ['diff', '--name-only', '--no-renames', '-z', previous, current, '--'], {
      cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }).split('\0').filter(Boolean));
  console.log(skip ? 'Skipping: unrequested preview or no hosted-app changes.' : 'Building: hosted-app changes or no reliable comparison.');
  process.exit(skip ? 0 : 1);
}

module.exports = { isNonRuntime, shouldSkip };
