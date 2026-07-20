# Plan 002: Add CONTRIBUTING.md, .env.example, and PR/issue templates

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat db64bb8..HEAD -- CONTRIBUTING.md .env.example .github`
> If any in-scope file already exists with content, compare against this plan
> before proceeding; on a conflict, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `db64bb8`, 2026-07-20

## Why this matters

This is a community-extension registry — its whole point is external contributions — yet there is no `CONTRIBUTING.md`, no `.github/` directory at all, and no `.env.example` (the `.gitignore` even whitelists `!.env.example`, but the file was never created). The add-a-component workflow spans five places (source files, a registry definition file, a generated-artifact build, a docs page, and for blocks a page entry) and is currently discoverable only by reading git history. Every prospective contributor either guesses or gives up.

## Current state

- No `CONTRIBUTING.md`, no `.github/` directory, no `.env.example` (verify: `ls CONTRIBUTING.md .github .env.example` → all "No such file").
- `CODE_OF_CONDUCT.md` and `LICENSE` (MIT) already exist at the repo root.
- `.gitignore` ends with:
  ```
  # Local env files
  .env
  .env.*
  !.env.example
  ```
- The **add-a-component workflow**, reverse-engineered from the repo (this is the core content of the guide):
  1. **Source files** go under `registry/ui/<name>/` (UI components) or `registry/blocks/<name>/` (blocks). Exemplars: `registry/ui/separator-label/` (a `SeparatorLabel.vue` + `index.ts` barrel), `registry/blocks/supabase-realtime-cursor/` (components/ + composables/ subfolders).
  2. **Register the item** in `registry/registry-ui.ts` (array `ui`) or `registry/registry-block.ts` (array `block`). Each entry has `name`, `type` (`registry:ui` / `registry:block`), npm `dependencies`, `registryDependencies` (names of official shadcn-vue items, or full URLs for items from this registry, e.g. `'https://extended.shadcn-vue.com/r/supabase-client.json'`), and `files` with paths **relative to `registry/`**.
  3. **Build the registry**: `pnpm build:registry` (runs `scripts/build-registry.ts`) — regenerates `registry.json` at the root and `public/r/<name>.json`. These generated files are **committed**.
  4. **Docs page** under `content/docs/2.components/<name>.md` or `content/docs/3.blocks/<name>.md` with frontmatter `title`, `description`, `contributors: ['github-handle']`. Available MDC blocks (see `content/docs/2.components/separator-label.md` as exemplar):
     - `::component-preview{path=/registry/examples/<Example>.vue}` — live preview; the example component must be created in `registry/examples/` (auto-registered globally via `nuxt.config.ts` components config).
     - `::auto-type-table{path=/registry/ui/<name>/<Component>.vue}` — auto-generated props table.
     - `::block-code-viewer{id="<block-name>"}` — file tree + source viewer for blocks.
  5. **Blocks only**: add a `<BlockContainer id="<name>" />` entry in `pages/blocks/index.vue` so it appears on the /blocks page, and ensure the block preview route works (`pages/blocks/preview/[id].vue` renders it in an iframe).
- Dev setup facts: pnpm 9 (pinned in `package.json` `packageManager`), `pnpm install`, `pnpm dev`, `pnpm lint` / `pnpm lint:fix` (antfu eslint config). The site deploys to Cloudflare; contributors don't need Cloudflare credentials for local dev.
- Env vars: `registry/blocks/supabase-client/lib/supabase/client.ts` reads `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`; the local `.env` (untracked) defines exactly these two keys. They're only needed to run the Supabase-related example previews locally.
- Commit convention from `git log`: conventional commits (`feat:`, `fix:`, `chore:`).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `pnpm install` | exit 0 |
| Lint | `pnpm lint` | new files not in error output (repo has pre-existing failures until plan 003) |
| Registry build (to document, not necessarily run) | `pnpm build:registry` | exit 0 |

## Scope

**In scope** (create only):
- `CONTRIBUTING.md`
- `.env.example`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/component-request.md`
- `.github/ISSUE_TEMPLATE/bug-report.md`

**Out of scope** (do NOT touch):
- `.github/workflows/**` — CI is plan 004.
- `README.md` — plan 001 (it links to CONTRIBUTING.md; you don't need to edit it).
- Any file under `registry/`, `content/`, `pages/`.
- **Never copy values from the local `.env` file.** `.env.example` gets placeholder values only.

## Git workflow

- Branch: `advisor/002-contributing-guide`
- Commit style: conventional commits, e.g. `docs: add contributing guide and templates`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `CONTRIBUTING.md`

Sections, in order:

1. **Welcome** — one paragraph; link `CODE_OF_CONDUCT.md`.
2. **Local setup** — pnpm 9 required (`corepack enable` note), `pnpm install`, `pnpm dev`; note that Supabase env vars are only needed for Supabase example previews and to copy `.env.example` to `.env` if working on those.
3. **Adding a component or block** — the five-step workflow from "Current state" above, written as a numbered checklist with the exact file paths and one exemplar link per step. Include a minimal registry entry example:
   ```ts
   // registry/registry-ui.ts
   {
     name: 'my-component',
     type: 'registry:ui',
     dependencies: ['reka-ui'],
     registryDependencies: ['button'],
     files: [
       { path: 'ui/my-component/index.ts', type: 'registry:ui' },
       { path: 'ui/my-component/MyComponent.vue', type: 'registry:ui' },
     ],
   }
   ```
4. **Before you open a PR** — checklist: `pnpm build:registry` run and generated files committed; docs page added; `pnpm lint:fix` clean; conventional commit messages.
5. **What gets accepted** — short paragraph: components/blocks that extend (not duplicate) the official shadcn-vue registry; maintainers may decline out-of-scope items.

**Verify**: `pnpm lint 2>&1 | grep CONTRIBUTING` → no output

### Step 2: Create `.env.example`

Exactly (placeholders only — never real values):

```
# Only required to run the Supabase example previews locally (pnpm dev)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Verify**: `git check-ignore .env.example; echo $?` → `1` (not ignored, so it will be committed); `grep -c "supabase.co" .env` → do NOT run anything that prints `.env` contents.

### Step 3: Create PR and issue templates

- `.github/PULL_REQUEST_TEMPLATE.md`: What/Why summary line, plus the checklist from CONTRIBUTING step 4 as checkboxes.
- `.github/ISSUE_TEMPLATE/component-request.md`: frontmatter `name: Component request`, `about: Suggest a component or block for the registry`; body prompts: what it does, link to prior art (e.g. the React/Supabase-UI equivalent), willingness to PR it.
- `.github/ISSUE_TEMPLATE/bug-report.md`: frontmatter `name: Bug report`, `about: Something broken in a registry item or the docs site`; body prompts: affected item name, install command used, environment (Nuxt/Vite, versions), repro.

**Verify**: `ls .github/PULL_REQUEST_TEMPLATE.md .github/ISSUE_TEMPLATE/*.md` → 3 files listed

## Test plan

No unit tests apply. Verification: files exist, lint doesn't flag them, `.env.example` contains no real credential values (reviewer must eyeball this).

## Done criteria

- [ ] `CONTRIBUTING.md` documents all five workflow steps with exact paths
- [ ] `.env.example` exists with placeholder values only
- [ ] The three `.github` template files exist
- [ ] `pnpm lint 2>&1 | grep -E 'CONTRIBUTING|\.github'` → no output
- [ ] `git status --short` shows only the five in-scope files added
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any in-scope file already exists (someone wrote it since this plan).
- The workflow facts don't match reality (e.g. `pnpm build:registry` fails on a clean checkout, or `registry/registry-ui.ts` moved) — the guide must not document a broken workflow.
- You find yourself about to read or copy the contents of `.env` — placeholders only.

## Maintenance notes

- When the registry build or folder layout changes (e.g. if plan 005 changes block file types), CONTRIBUTING's workflow section must be updated in the same PR.
- Reviewer should scrutinize: no secrets in `.env.example`; the five-step workflow matches what `scripts/build-registry.ts` actually does.
