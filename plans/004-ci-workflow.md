# Plan 004: Add CI — lint, registry drift check, and site build on every PR

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat db64bb8..HEAD -- .github/workflows package.json scripts/build-registry.ts`
> Also confirm plan 003 is DONE in `plans/README.md` — this plan's lint job
> requires a passing lint baseline.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/003-fix-lint-baseline.md
- **Category**: dx
- **Planned at**: commit `db64bb8`, 2026-07-20

## Why this matters

There is no `.github/` directory — zero CI. Nothing verifies that a PR lints, that the site still builds, or that the committed registry artifacts (`registry.json`, `public/r/*.json`) match the registry definitions in `registry/registry-ui.ts` / `registry/registry-block.ts`. The drift risk is real and specific to this repo's design: contributors must run `pnpm build:registry` manually and commit the output; if they forget, the deployed registry silently serves stale component JSON while the source in the repo says otherwise. For a project inviting community PRs, CI is the difference between maintainable and not.

## Current state

- No `.github/` directory exists (`ls .github` → No such file or directory).
- `package.json` scripts (exact): `build` → `nuxt build`, `lint` → `eslint .`, `build:registry` → `tsx ./scripts/build-registry.ts`. Package manager pinned: `"packageManager": "pnpm@9.15.9+sha512...."` (corepack-compatible).
- `scripts/build-registry.ts` regenerates `registry.json` then shells out to `pnpm dlx shadcn-vue@latest build registry.json --output public/r`. Note: it uses `@latest`, so output could change when upstream releases — see Maintenance notes.
- The site build uses nitro preset `cloudflare-module` with a D1 binding declared in `nuxt.config.ts`; `nuxt build` does NOT require Cloudflare credentials — bindings are only resolved at runtime/deploy.
- `pnpm lint` exits 0 (after plan 003).
- Node version: no `.nvmrc` or `engines` field exists; use Node 22 (matches `@types/node` ^22).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `pnpm install --frozen-lockfile` | exit 0 |
| Lint | `pnpm lint` | exit 0 |
| Registry rebuild | `pnpm build:registry` | exit 0; regenerates `registry.json`, `public/r/*.json` |
| Drift check | `git diff --exit-code -- registry.json public/r` | exit 0 when artifacts are in sync |
| Site build | `pnpm build` | exit 0; writes `.output/` |
| Workflow syntax check (local, optional) | `gh workflow list` after push, or https://rhysd.github.io/actionlint/ | no syntax errors |

## Scope

**In scope** (create only):
- `.github/workflows/ci.yml`

**Out of scope** (do NOT touch):
- Deployment automation (Cloudflare deploy stays manual/as-is — do not add a deploy job; you don't have and must not request secrets).
- `package.json` scripts, `scripts/build-registry.ts` (see Maintenance notes for a deferred pinning follow-up).
- Templates in `.github/` root (plan 002).

## Git workflow

- Branch: `advisor/004-ci-workflow`
- Commit style: conventional commits, e.g. `ci: add lint, registry drift check, and build workflow`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `.github/workflows/ci.yml`

Triggers: `pull_request` and `push` to `main`. Three jobs (they can share a setup pattern; use separate jobs so failures are legible):

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4   # reads version from packageManager field
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  registry:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build:registry
      - name: Check registry artifacts are committed
        run: |
          git diff --exit-code -- registry.json public/r \
            || (echo "::error::registry.json / public/r out of sync — run 'pnpm build:registry' and commit the result" && exit 1)

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

Notes for the executor:
- `pnpm/action-setup@v4` with no `version` input reads the `packageManager` field — do not hard-code a pnpm version.
- Do not add secrets or environment variables; none of the three jobs need any.

**Verify**: `npx --yes actionlint .github/workflows/ci.yml 2>&1 || true` → no errors reported (if actionlint can't be fetched offline, YAML-parse the file instead: `node -e "require('js-yaml')"` is NOT available — use `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml'))"` → exit 0).

### Step 2: Prove each job's command works locally

Run the three command sequences locally (they must pass before CI can):

1. `pnpm lint` → exit 0
2. `pnpm build:registry && git diff --exit-code -- registry.json public/r` → **see STOP conditions if the diff is non-empty**
3. `pnpm build` → exit 0

**Verify**: all three exit 0. After step 2's rebuild, `git status` must show no modifications to `registry.json`/`public/r` (if it does and the diff is only formatting/ordering from a new `shadcn-vue@latest`, STOP — see below).

## Test plan

CI workflows are their own test: after merge, the Actions tab must show all three jobs green on `main`. Locally, Step 2 is the pre-flight equivalent.

## Done criteria

- [ ] `.github/workflows/ci.yml` exists with `lint`, `registry`, `build` jobs
- [ ] All three job command sequences pass locally (Step 2)
- [ ] Workflow YAML parses cleanly
- [ ] `git status --short` shows only `.github/workflows/ci.yml` added
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `pnpm lint` fails — plan 003 hasn't landed or regressed; this plan depends on it.
- `pnpm build:registry` produces a diff in `registry.json`/`public/r` on the current commit — the committed artifacts are already stale OR `shadcn-vue@latest` changed its output format. Report the diff; deciding whether to commit regenerated artifacts or pin the CLI version is a maintainer call.
- `pnpm build` fails locally — the site build is broken for a reason unrelated to CI; report the error rather than patching build config.

## Maintenance notes

- **Deferred follow-up**: `scripts/build-registry.ts` invokes `shadcn-vue@latest` — a new CLI release can change generated JSON and turn the drift job red with no repo change. If that happens, pin the version in the script (e.g. `shadcn-vue@2.4.x`) as a one-line fix.
- If a deploy job is added later, it belongs in a separate workflow with Cloudflare secrets — keep this CI workflow secret-free so it runs on fork PRs.
- The `build` job implicitly checks that new registry components compile within the docs site (they're auto-imported by the Nuxt components config), which is the closest thing this repo has to a component test.
