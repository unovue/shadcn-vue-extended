# Plan 005: Complete registry metadata, document undocumented items, verify block install paths

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat db64bb8..HEAD -- registry content/docs/3.blocks`
> If registry definitions changed since this plan was written, re-verify the
> "Current state" excerpts before proceeding.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (changes what consumers download — requires a test install)
- **Depends on**: none (run after 001–004; rebuilds registry artifacts, so land before or rebased on any other registry change)
- **Category**: docs / correctness
- **Planned at**: commit `db64bb8`, 2026-07-20

## Why this matters

Three consumption-quality gaps remain after the entry-point docs land:

1. **No registry item has a `title` or `description`**, so `npx shadcn-vue view <url>` and any registry-browsing UI show bare names.
2. **The Supabase items have a hidden runtime requirement**: the installed `supabase-client` code reads `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` and will throw at runtime if unset — no doc mentions this. `supabase-client` itself has no docs page at all.
3. **The dialog blocks' files are typed `registry:ui` without a `target`**, which likely makes the CLI install a *block* into `components/ui/dialog-01/index.vue` — a UI-primitive path — instead of a block/component path. This needs verification via a real test install, then fixing.

## Current state

- `registry/registry-ui.ts` — array `ui` with items `separator-label`, `auto-form`. No item anywhere has `title` or `description`. Example head of an entry:

  ```ts
  {
    name: 'separator-label',
    type: 'registry:ui',
    dependencies: ['reka-ui'],
    files: [ ... ],
  }
  ```

- `registry/registry-block.ts` — array `block` with `dialog-01`, `dialog-02`, `supabase-client`, `supabase-realtime-cursor`. The dialog entries' files are:

  ```ts
  {
    name: 'dialog-01',
    type: 'registry:block',
    dependencies: ['lucide-vue-next'],
    registryDependencies: ['button', 'dialog'],
    files: [
      { path: 'blocks/dialog-01/index.vue', type: 'registry:ui' },
    ],
  }
  ```

  (Compare: `supabase-realtime-cursor` files correctly use `registry:component` / `registry:hook`.)

- `registry/blocks/supabase-client/lib/supabase/client.ts` (entire file):

  ```ts
  import { createClient as createSupabaseClient } from '@supabase/supabase-js'

  export function createClient() {
    return createSupabaseClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
    )
  }
  ```

- `content/docs/3.blocks/supabase-realtime-cursor.md` — has Installation and Folder structure sections; **no mention of env vars**. There is no `content/docs/` page for `supabase-client`, `dialog-01`, or `dialog-02` (the dialogs are showcased on `/blocks` via `pages/blocks/index.vue`, which is acceptable — they don't need docs pages, but supabase-client needs at least an env-var note where it's pulled in).
- `pnpm build:registry` regenerates `registry.json` + `public/r/*.json` from the two definition files; generated artifacts are committed.
- The registry-item schema (`https://shadcn-vue.com/schema/registry-item.json`, already referenced by the generated files) supports `title`, `description`, and per-file `target` fields.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `pnpm install` | exit 0 |
| Rebuild registry | `pnpm build:registry` | exit 0; regenerates artifacts |
| Lint | `pnpm lint` | exit 0 (post plan 003) |
| Scratch test install | see Step 1 | files land at expected paths |

## Scope

**In scope**:
- `registry/registry-ui.ts`, `registry/registry-block.ts` — add `title`/`description`; fix dialog file types/targets per Step 1 findings
- `content/docs/3.blocks/supabase-realtime-cursor.md` — add env-var prerequisites section
- `registry.json`, `public/r/*.json` — regenerated via `pnpm build:registry` only (never hand-edited)
- A scratch project under `/tmp/` for the test install (throwaway; not part of the repo)

**Out of scope** (do NOT touch):
- Component source under `registry/ui/**` and `registry/blocks/**` (except nothing — source is untouched; only metadata and docs change)
- `scripts/build-registry.ts`
- `components/**`, `pages/**`

## Git workflow

- Branch: `advisor/005-registry-metadata`
- Commit style: conventional commits, e.g. `fix: block file targets and registry item metadata`, `docs: document supabase env prerequisites`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Verify how the dialog blocks actually install (investigation gate)

Create a scratch Vue project and install `dialog-01` from the *local* built JSON to see where files land:

```bash
cd /tmp && rm -rf svx-test && pnpm create vite@latest svx-test --template vue-ts
cd svx-test && pnpm install
pnpm dlx shadcn-vue@latest init -y --base-color neutral 2>&1 | tail -5   # accept defaults if prompted
pnpm dlx shadcn-vue@latest add /Users/zernonia/Desktop/UnoVue/shadcn-vue-extended/public/r/dialog-01.json 2>&1 | tail -5
find src components -name "*.vue" | grep -i dialog
```

(If the CLI refuses local paths, serve the repo's `public/` with `npx serve public` and use `http://localhost:3000/r/dialog-01.json`.)

Record where `index.vue` landed:
- If it lands under `components/ui/dialog-01/` → confirms the mis-typing; proceed to Step 2's fix.
- If it lands somewhere sensible for a block (e.g. `components/dialog-01.vue`) → the current typing is fine; SKIP the type change in Step 2 and note this in `plans/README.md`.

**Verify**: the `find` output above, recorded in your final report.

### Step 2: Fix dialog block file entries (conditional on Step 1)

In `registry/registry-block.ts`, for `dialog-01` and `dialog-02`, change each file entry to a component type with an explicit target, e.g.:

```ts
files: [
  { path: 'blocks/dialog-01/index.vue', type: 'registry:component', target: 'components/dialog-01.vue' },
],
```

(Mirror exactly what Step 1 showed to be wrong; keep `dialog-02` symmetrical.)

**Verify**: rerun the Step 1 scratch install against the rebuilt JSON (after Step 4) — file lands at the target path.

### Step 3: Add `title` and `description` to all six items

In both definition files, add to each item. Use these (maintainer can edit later):

| Item | title | description |
|---|---|---|
| separator-label | Separator Label | A separator with a centered label. |
| auto-form | Auto Form | Automatically generate a form from a Zod schema, powered by vee-validate. |
| dialog-01 | Dialog 01 | A dialog block example. |
| dialog-02 | Dialog 02 | A dialog block example. |
| supabase-client | Supabase Client | A Supabase client factory. Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. |
| supabase-realtime-cursor | Supabase Realtime Cursor | Real-time collaborative cursors using Supabase Realtime. |

**Verify**: `grep -c 'description:' registry/registry-ui.ts registry/registry-block.ts` → `2` and `4` respectively.

### Step 4: Rebuild registry artifacts

```bash
pnpm build:registry
```

**Verify**: exit 0; `grep -l '"description"' public/r/*.json | wc -l` → `6`; `git diff --stat -- registry.json public/r` shows all seven generated files updated and nothing else.

### Step 5: Document the Supabase env prerequisite

In `content/docs/3.blocks/supabase-realtime-cursor.md`, add a `## Prerequisites` section immediately before `## Installation`:

- The block depends on the `supabase-client` registry item (installed automatically as `lib/supabase/client.ts`).
- It requires two env vars in the consuming project: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Vite-style; Nuxt users should adapt to their env handling).
- Link to Supabase API-keys docs: https://supabase.com/dashboard/project/_/settings/api

**Verify**: `pnpm lint 2>&1 | grep supabase-realtime` → no output.

## Test plan

- The Step 1/Step 2 scratch install IS the test: `dialog-01` files land at the intended target after the fix.
- One more scratch install of `supabase-realtime-cursor` from the rebuilt JSON: confirms the registryDependency URL chain still resolves (`lib/supabase/client.ts` gets installed alongside). Note: the item's `registryDependencies` uses the absolute production URL `https://extended.shadcn-vue.com/r/supabase-client.json`, so this test hits the deployed site — it validates against the OLD deployed JSON until the site redeploys; expected and fine.

## Done criteria

- [ ] Step 1 findings recorded (install path before/after)
- [ ] All 6 items have `title` + `description` in definitions and in `public/r/*.json`
- [ ] `supabase-realtime-cursor.md` documents both env vars
- [ ] `pnpm build:registry && git diff --exit-code -- registry.json public/r` → exit 0 (artifacts in sync)
- [ ] `pnpm lint` exits 0
- [ ] `/tmp/svx-test` scratch dir is not inside the repo and nothing from it was committed
- [ ] `plans/README.md` status row updated (including the Step 1 verdict)

## STOP conditions

Stop and report back (do not improvise) if:

- The scratch install in Step 1 fails for environment reasons (network, CLI prompts that can't be answered non-interactively) after two attempts — report; do not guess the install path and change types blind.
- `shadcn-vue` CLI rejects the `target` field or the `registry:component` type for these items (schema mismatch) — report the CLI error verbatim.
- `pnpm build:registry` output changes files beyond the expected seven generated files.

## Maintenance notes

- Once titles/descriptions exist, plan 001's README component table could be generated from `registry.json` — deferred follow-up.
- CONTRIBUTING (plan 002) should be updated in the same PR if the dialog file-type convention changes, so new blocks copy the right pattern.
- AutoForm's docs page has no live `::component-preview` examples (the upstream shadcn-vue AutoForm docs have many). Explicitly deferred: it's content authoring, not a defect; track as a good-first-issue for contributors.
