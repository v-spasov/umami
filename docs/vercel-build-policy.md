# Vercel build policy

Production continues to deploy automatically. Automatic Git previews are disabled in both the Preview environment's Branch Tracking setting and `git.deploymentEnabled`. Routine feature branches and Dependabot branches do not build previews. Dependency changes still build when merged to production.

To request an intentional preview, run `vercel deploy --build-env FORCE_VERCEL_BUILD=1` from the linked project directory. The override also permits an intentional rebuild of a documentation-only commit. It is not needed for normal production application changes.

The dependency-free `.vercel-build-ignore.cjs` runs before installation. It compares the current commit with Vercel's last successful deployment for that project and branch (`VERCEL_GIT_PREVIOUS_SHA`), skipping only documentation, GitHub configuration and native-wrapper changes. Public assets, lockfiles, build scripts and application changes always build. Missing commit metadata, shallow history or Git errors allow a build. Do not replace the baseline with `HEAD^`, which can miss earlier undeployed application changes.

Keep Vercel's build cache and the team's Remote Cache enabled. Next.js build caching is managed automatically by Vercel; don't set `VERCEL_FORCE_NO_BUILD_CACHE=1`, `VERCEL_FORCE_NO_BUILD_CACHE_UPLOAD=1` or `TURBO_FORCE=true` for normal deployments. Intentional cache-clearing or manual redeployments can be performed in the Vercel dashboard.

The Vercel team default and existing projects use Basic build machines (2 vCPUs, 8 GB memory). On-demand build concurrency is disabled; builds queue instead of starting paid parallel bursts. Production remains prioritized. Expect longer build or queue times in exchange for the smaller machine.

Run `node scripts/test-vercel-build-ignore.cjs` after editing the skip rules. The script exits 0 to skip and 1 to build; exit 1 is expected when running it locally without Vercel metadata.
