# Plan 001: Write a real README and Getting Started doc

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat db64bb8..HEAD -- README.md content/docs/1.getting-started/introduction.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `db64bb8`, 2026-07-20

## Why this matters

This repo is the public registry for community-extended shadcn-vue components, deployed at https://extended.shadcn-vue.com, and it was just made public. The entire README is one line: `# shadcn-vue/extended (WIP)`, and the docs site's Getting Started page body is literally the word `WIP`. A developer landing on either entry point today cannot tell what the project is, how to install a component, or where to go next. These two files are the highest-leverage consumption blockers.

## Current state

- `README.md` — the whole file is:

  ```markdown
  # shadcn-vue/extended (WIP)
  ```

  (It also has a trailing-space/EOF-newline lint error — your rewrite fixes that as a side effect.)

- `content/docs/1.getting-started/introduction.md` — the whole file is:

  ```markdown
  ---
  title: Introduction
  description: Shadcn vue extended
  ---


  WIP
  ```

Facts to use in the content (verified against the repo at commit `db64bb8`):

- Project: a shadcn-vue registry of extra components and blocks that are not in the official shadcn-vue collection. Docs site: https://extended.shadcn-vue.com. Repo: https://github.com/unovue/shadcn-vue-extended (both values live in `nuxt.config.ts` `appConfig`).
- Install command pattern (used throughout existing docs, e.g. `content/docs/2.components/separator-label.md`):
  `npx shadcn-vue@latest add https://extended.shadcn-vue.com/r/<name>.json`
- Current registry items (from `registry.json`):
  | Name | Type | What it is |
  |---|---|---|
  | `separator-label` | ui | Separator with a label |
  | `auto-form` | ui | Auto-generate a form from a Zod schema (vee-validate + zod) |
  | `dialog-01` | block | Dialog example block |
  | `dialog-02` | block | Dialog example block |
  | `supabase-client` | block | Supabase client factory (`lib/supabase/client.ts`) |
  | `supabase-realtime-cursor` | block | Real-time collaborative cursors via Supabase Realtime |
- Tech stack of the site itself (for the README's development section): Nuxt 3 + @nuxt/content v3, Tailwind CSS v4, deployed on Cloudflare (nitro preset `cloudflare-module`). Package manager pnpm 9 (pinned via `packageManager` in `package.json`).
- Dev commands: `pnpm install`, `pnpm dev`, `pnpm lint`, `pnpm build:registry` (regenerates `registry.json` and `public/r/*.json`).
- Repo docs conventions: markdown files under `content/docs/` use frontmatter with `title`, `description`, optional `contributors: ['github-handle']`; MDC components like `::component-preview{path=...}` and `::callout` are available — see `content/docs/2.components/separator-label.md` as the exemplar.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `pnpm install` | exit 0 |
| Lint | `pnpm lint` | may fail on pre-existing errors elsewhere (see plan 003); the two files you touch must not appear in its output |
| Dev preview (optional) | `pnpm dev` | site at http://localhost:3000 |

## Scope

**In scope** (the only files you should modify):
- `README.md`
- `content/docs/1.getting-started/introduction.md`

**Out of scope** (do NOT touch, even though they look related):
- `content/docs/2.components/*` and `content/docs/3.blocks/*` — component docs are covered by plan 005.
- `CONTRIBUTING.md` — covered by plan 002. The README should *link* to it (the link may 404 until plan 002 lands; that's fine).
- `registry.json`, `public/r/**` — generated artifacts.

## Git workflow

- Branch: `advisor/001-readme-and-getting-started`
- Commit style: conventional commits, matching history (`chore: add readme and just make it public`, `feat: include breadcrumb`). Use e.g. `docs: write README and getting-started introduction`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Rewrite `README.md`

Replace the file with a real README containing, in order:

1. Title `# shadcn-vue/extended` and a one-paragraph description: community-maintained registry of extra components and blocks for [shadcn-vue](https://www.shadcn-vue.com), installable with the shadcn-vue CLI. Link the docs site https://extended.shadcn-vue.com.
2. **Usage** section with the install command pattern and one concrete example:
   ```bash
   npx shadcn-vue@latest add https://extended.shadcn-vue.com/r/auto-form.json
   ```
3. **What's inside** section: the components/blocks table from "Current state" above, each name linking to its docs page where one exists (`https://extended.shadcn-vue.com/docs/components/separator-label`, `.../docs/components/auto-form`, `.../docs/blocks/supabase-realtime-cursor`, and `https://extended.shadcn-vue.com/blocks` for the dialog blocks).
4. **Development** section: `pnpm install`, `pnpm dev`; note that `pnpm build:registry` regenerates registry artifacts which are committed.
5. **Contributing** section: one sentence pointing at `CONTRIBUTING.md`.
6. **License** section: MIT, link `LICENSE`.

Keep it under ~80 lines. End the file with exactly one trailing newline and no trailing spaces (the repo lints markdown).

**Verify**: `pnpm lint 2>&1 | grep README` → no output (README no longer in lint errors)

### Step 2: Rewrite the introduction doc

Replace the body of `content/docs/1.getting-started/introduction.md` (keep the frontmatter keys, improve the description to e.g. `Extra components and blocks for shadcn-vue, installable via the CLI.`). Body should cover:

1. What this project is and its relationship to shadcn-vue (extended/community registry, not a component library — code is copied into your project).
2. How installation works: the CLI fetches the item JSON from this registry and writes the files into your project per your `components.json`; one example command (same as README).
3. Prerequisites: an existing project already set up with shadcn-vue (link https://www.shadcn-vue.com/docs/installation).
4. Where to go next: Components section and Blocks page.

Use existing docs as the style exemplar (`content/docs/2.components/auto-form.md`): plain markdown headings, `::callout` for asides if needed.

**Verify**: `pnpm lint 2>&1 | grep introduction` → no output

### Step 3: Visual check (optional but recommended)

Run `pnpm dev`, open http://localhost:3000/docs/getting-started/introduction, confirm the page renders with no MDC errors in the terminal.

**Verify**: page renders; no `[MDC]` or Vue warnings referencing `introduction.md` in dev output.

## Test plan

No unit tests exist in this repo and none are needed for markdown. Verification is the lint greps above plus the dev-server render check.

## Done criteria

- [ ] `README.md` contains sections: description, Usage, component table, Development, Contributing, License
- [ ] `content/docs/1.getting-started/introduction.md` no longer contains the string `WIP`
- [ ] `pnpm lint 2>&1 | grep -E 'README|introduction'` → no output
- [ ] `git status --short` shows only the two in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Either file no longer matches the "Current state" excerpts (someone already wrote content).
- The registry items in `registry.json` differ from the table above (registry changed — the component table would be wrong).
- You are tempted to also create `CONTRIBUTING.md` — that is plan 002.

## Maintenance notes

- The component table in the README will drift as items are added; plan 002's contributing guide should tell contributors to update it (or a follow-up could generate it from `registry.json`).
- Reviewer should check the install command URLs actually resolve (e.g. `curl -sI https://extended.shadcn-vue.com/r/auto-form.json` → 200).
