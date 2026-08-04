# Contributing

## Welcome

Thanks for your interest in contributing! This is a community registry of extended components and blocks for [shadcn-vue](https://www.shadcn-vue.com/), and it only exists because people contribute components, blocks, fixes, and docs. Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before participating.

## Local setup

- pnpm 9 is required (the version is pinned in `package.json`). If you don't have it, run `corepack enable` to let Node manage it for you.
- Install dependencies: `pnpm install`
- Start the dev server: `pnpm dev`
- You do not need Cloudflare credentials for local dev.

## Adding a component or block

Follow this checklist. It's the same five-step workflow used by every existing item in the registry.

1. **Add the source files** under `registry/ui/<name>/` for UI components, or `registry/blocks/<name>/` for blocks (blocks can have `components/` and `composables/` subfolders as needed).
   - Exemplar (UI): `registry/ui/separator-label/` (`SeparatorLabel.vue` + `index.ts` barrel)
   - Exemplar (block): `registry/blocks/dialog-01/` (single `index.vue`)

2. **Register the item** in `registry/registry-ui.ts` (array `ui`) for components, or `registry/registry-block.ts` (array `block`) for blocks. Each entry needs `name`, `type` (`registry:ui` / `registry:block`), npm `dependencies`, `registryDependencies` (names of official shadcn-vue items, or full URLs for items from this registry, e.g. `'https://extended.shadcn-vue.com/r/separator-label.json'`), and `files` with paths **relative to `registry/`**. Minimal example:

   ```ts
   // registry/registry-ui.ts
   const myComponentEntry = {
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

3. **Build the registry**: run `pnpm build:registry` (runs `scripts/build-registry.ts`). This regenerates `registry.json` at the repo root and `public/r/<name>.json`. These generated files must be committed alongside your source changes.

4. **Add a docs page** under `content/docs/2.components/<name>.md` (components) or `content/docs/3.blocks/<name>.md` (blocks), with frontmatter `title`, `description`, and `contributors: ['your-github-handle']`. Useful MDC blocks:
   - `::component-preview{path=/registry/examples/<Example>.vue}` — live preview; create the example component in `registry/examples/` (it's auto-registered globally via the `components` config in `nuxt.config.ts`).
   - `::auto-type-table{path=/registry/ui/<name>/<Component>.vue}` — auto-generated props table.
   - `::block-code-viewer{id="<block-name>"}` — file tree + source viewer for blocks.
   - Exemplar (component): `content/docs/2.components/separator-label.md`

5. **Blocks only**: add a `<BlockContainer id="<name>" />` entry in `app/pages/blocks/index.vue` so it appears on the `/blocks` page. Previews render via `app/pages/blocks/preview/[id].vue` in an iframe.

## Before you open a PR

- [ ] `pnpm build:registry` has been run, and the regenerated `registry.json` / `public/r/*.json` files are committed
- [ ] A docs page has been added under `content/docs/2.components/` or `content/docs/3.blocks/`
- [ ] `pnpm lint:fix` runs clean on the files you touched
- [ ] Commit messages follow [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, ...)

## What gets accepted

This registry is for components and blocks that **extend** the official shadcn-vue registry, not duplicate it — patterns that don't belong in shadcn-vue core but are broadly useful. Items that a vendor already ships officially for Vue/Nuxt (for example, [Supabase UI](https://supabase.com/ui) now covers Supabase blocks) belong upstream, not here — that's also why the earlier Supabase blocks were removed. Maintainers may decline contributions that are out of scope, already covered elsewhere, or don't fit the registry's direction.
