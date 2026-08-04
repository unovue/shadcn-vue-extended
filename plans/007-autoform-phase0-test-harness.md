# Plan 007: AutoForm Phase 0 — vitest test harness + characterization tests

> Split from [006-autoform-enhancements.md](006-autoform-enhancements.md) Phase 0.
> Target branch: `feat/autoform` (executor works on `autoform/phase-0-test-harness`, reviewer merges).

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW (adds tests + tooling; no component behavior changes)
- **Depends on**: none (first phase of the 006 program)
- **Category**: tests
- **Planned at**: commit `427308f`, 2026-07-20

## Why this matters

AutoForm is 1,073 lines of zod-introspection and form-wiring logic with zero tests, and phases 1–4 of the 006 program will rewrite substantial parts of it. Characterization tests pin today's behavior (including known bugs, marked as such) so every later fix flips a documented expectation instead of guessing at regressions.

## Scope

**In scope**:
- `package.json` (devDeps: vitest, @vue/test-utils, happy-dom, @vitejs/plugin-vue; script `"test": "vitest run"`), `pnpm-lock.yaml`
- `vitest.config.ts` (new, repo root): vue plugin, alias `@` → repo root, environment happy-dom
- `registry/ui/auto-form/__tests__/` (new): `utils.test.ts`, `dependencies.test.ts`, `fields.test.ts`
- `.github/workflows/ci.yml`: add a `test` job (same pnpm setup as `lint`, run `pnpm test`)

**Out of scope**: any change to `registry/ui/auto-form/*.{vue,ts}` source; fixing bugs the tests document; `registry.json`/`public/r` (must remain untouched — verify no drift).

## Key facts

- Registry components use explicit imports (no Nuxt auto-imports) — they ship to consumers. Imports like `@/components/ui/form`, `@/lib/utils` resolve with alias `@` → repo root.
- Component resolution: `AutoFormField.vue` picks `config.component` (string key into `INPUT_COMPONENTS` or raw component) else `INPUT_COMPONENTS[DEFAULT_ZOD_HANDLERS[shape.type]]` (`constant.ts`).
- `useDependencies` (dependencies.ts) relies on provide/inject from `AutoForm.vue` — test dependency behavior by mounting `AutoForm` with a `dependencies` prop, not by calling the composable bare.
- Characterization tests record CURRENT behavior. Known bugs to pin with a `// BUG(#n): ...` comment and an expectation matching today's (wrong) output: #3 preprocess+enum, #4 sub-object labels, #12 readonly rendered editable. (Phase 1 flips these.)

## Test content (minimum)

1. `utils.test.ts` — shape extraction from schemas covering: string, number, boolean, date, enum, nativeEnum, array, object, optional/default wrapping, `.describe()`, preprocess-wrapped enum (BUG #3), `.readonly()` (BUG #12).
2. `dependencies.test.ts` — mount AutoForm with DISABLES / HIDES / SETS_OPTIONS / REQUIRES deps; assert rendered effect of each (REQUIRES: asterisk shows but submission is NOT blocked — pin as BUG #2/#14).
3. `fields.test.ts` — one mount per field type via AutoForm with a covering schema; assert the expected control renders (input[type=number], role=checkbox, select trigger, etc.).

## Verification gates

- `pnpm test` → all pass
- `pnpm lint` → exit 0
- `git status --porcelain -- registry.json public/r` → empty (tests must not enter registry artifacts)
- `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml'))"` → ok
- `pnpm build` NOT required this phase (no source changes)

## STOP conditions

- Mounting fails because a transitive component (`components/ui/*`) uses a Nuxt-only API — report which; do not shim Nuxt.
- Vitest cannot resolve SFCs/aliases after two config attempts — report config + error verbatim.
- Any test requires modifying auto-form source to pass — that's a Phase 1+ change; pin current behavior instead or report.
