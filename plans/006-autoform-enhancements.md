# Plan 006: AutoForm enhancement program — resolve all 19 open issues

> **Program plan**: this is an umbrella roadmap compiled from every open issue in
> unovue/shadcn-vue-extended (all 19 are AutoForm-related). It is organized into
> five dispatchable phases. Phases 1–5 should each be split into their own
> numbered executor plan (007+) at dispatch time, using this document as the
> source spec. Phase 0 is the prerequisite for everything.
>
> **Drift check**: `git diff --stat 427308f..HEAD -- registry/ui/auto-form content/docs/2.components/auto-form.md`

## Status

- **Priority**: P1 (program)
- **Effort**: L (program total; per-phase S–M)
- **Risk**: MED — AutoForm is the registry's most-consumed item; every change ships to consumers via `/r/auto-form.json`
- **Depends on**: none
- **Category**: direction / bugs / features
- **Planned at**: commit `427308f`, 2026-07-20

## Why this matters

Every single open issue on the repo (19/19) targets AutoForm — it is the reason
people find this registry. The issues split roughly into: correctness bugs that
break advertised behavior (7), a structurally broken dependency system (3), and
feature asks that mostly reduce to one architectural gap — field rendering is
hard-wired to `INPUT_COMPONENTS` and per-type field components repeat their
FormField boilerplate, making customization require forking (9).

## Source inventory (all files in `registry/ui/auto-form/`)

| File | Role |
|---|---|
| `AutoForm.vue` (106 ln) | root: schema → shapes, vee-validate `useForm`, dependencies provide |
| `AutoFormField.vue` (45 ln) | per-field dispatcher; resolves component from config or `DEFAULT_ZOD_HANDLERS`→`INPUT_COMPONENTS`; already accepts a raw component in `config.component` |
| `AutoFormField{Array,Boolean,Date,Enum,File,Input,Number,Object}.vue` | per-type renderers, each repeating FormField/FormItem/FormLabel structure |
| `utils.ts` (188 ln) | `getBaseSchema`/`getBaseType`/shape extraction from zod |
| `dependencies.ts` (93 ln) | `useDependencies` — DISABLES/REQUIRES/HIDES/SETS_OPTIONS resolution |
| `constant.ts` | `INPUT_COMPONENTS` map + `DEFAULT_ZOD_HANDLERS` |
| `interface.ts` | Config/ConfigItem/Shape/Dependency types |

Zod stays on v3 (`^3.24.2`) throughout this program; a zod v4 migration is explicitly out of scope.

## Issue → workstream mapping

### Phase 0 — Test harness (prerequisite, S)

The repo has zero tests; AutoForm is 1,073 lines of schema-introspection logic — exactly the code that regresses silently. Before any fix:

- Add `vitest` + `@vue/test-utils` + `happy-dom` as devDependencies; `"test": "vitest run"` script; a `registry/ui/auto-form/__tests__/` directory (excluded from registry `files` lists — verify built JSON doesn't pick it up).
- Seed with characterization tests: schema→shape extraction (`utils.ts`), dependency resolution (`dependencies.ts`), and one mount test per field type.
- Wire `pnpm test` into `.github/workflows/ci.yml` as a fourth job (or a step in `lint`).

### Phase 1 — Quick-win bug fixes (S each, independent)

| Issue | Bug | Where / root-cause lead |
|---|---|---|
| #10 | `toReversed()` breaks consumers on TS lib < ES2023 | `dependencies.ts:36-40` — replace with `[...arr].reverse()` |
| #12 | `.readonly()` fields should not render as editable | `utils.ts` — unwrap/skip `ZodReadonly` in shape extraction (render nothing, or disabled — decide and document) |
| #8 | number input doesn't update bound data | `AutoFormFieldNumber.vue` — v-model/`valueAsNumber` handling vs vee-validate field binding |
| #4 | sub-object `describe()`/field-config label+description ignored | `AutoFormFieldObject.vue` — doesn't consume `config`/schema description like scalar fields do |
| #13 | date default value arrives as string/Date, Calendar expects `DateValue` (`.toDate is not a function`) | `AutoFormFieldDate.vue` — coerce incoming model value (string/Date) to `DateValue` before handing to Calendar |
| #3 | `z.preprocess`-wrapped enum: initial value not matched to options | `utils.ts` `getBaseSchema` — must unwrap `ZodEffects` (preprocess) before reading enum values |
| #5 | deleting an array item leaves a ghost field; length stale | `AutoFormFieldArray.vue` — FieldArray `remove` + `:key` by index instead of stable entry key |

Each fix lands with a regression test (Phase 0 harness) and, where user-visible, a docs example.

### Phase 2 — Dependencies system overhaul (M; #2, #14, #15 share one root cause)

`useDependencies` only affects *rendering* (asterisk, hidden, disabled, options) — it never changes the *effective validation schema*, so vee-validate still validates against the static zod schema:

- #2 / #14: `DependencyType.REQUIRES` shows the field as required but the form submits with it empty — the required override must be reflected in validation (derive a computed schema with the override applied, or register/deregister a field-level rule when the dependency flips).
- #15: SSR hydration mismatch under Nuxt — dependency state (hidden fields etc.) must resolve deterministically from initial values on both server and client render.

Acceptance: the gist repros from #2/#14 fail submission with a visible error when the required dependency is active; the #15 StackBlitz repro renders without hydration warnings.

### Phase 3 — Flexibility architecture (M–L; #7, #17 — unlocks Phase 4)

- Extract the repeated FormField/FormItem/FormLabel/FormMessage skeleton from all eight `AutoFormField*.vue` into a shared wrapper (issue #7's gist sketches this); per-type components become thin inner controls.
- Custom components: `config.component` already accepts a raw component — formalize and document the contract (what props/slots a custom field receives: `fieldName`, `label`, `required`, `disabled`, `options`, `config`), so #1 (tags input), #16 (multi-select), #19 (pin input) become drop-in custom fields rather than forks.
- Enum variants (#7's third point): stop special-casing `v-if="config?.component === 'radio'"` — variant resolution goes through the same component-resolution path so any control can back an enum.
- #17 (single config): evaluate a `fields` config array as an *additive* API over the zod-schema path — spike first; if it can't share the same internals, document the decision and close #17 with rationale instead of shipping two form builders.

### Phase 4 — Field types and input options (S–M each; depends on Phase 3)

| Issue | Feature | Approach after Phase 3 |
|---|---|---|
| #9 | enum select with separate value/label | allow `options: [{ value, label }]` in field config / SETS_OPTIONS payloads; keep string[] working |
| #16 + #1 | `Array<string>` as multi-select / tags input | map `ZodArray<ZodString>` to a new multi-value control; tags-input as documented custom-component example |
| #19 | PIN input | new field component, opt-in via `config.component: 'pin'` (+ `INPUT_COMPONENTS` entry) |
| #18 | icons in inputs | extend the shared wrapper/`inputProps` with icon slot or `icon` config |
| #6 | indeterminate checkbox | `checkedValue`/`uncheckedValue`/`indeterminate` support on the boolean field |
| #11 | `z.union()` support | unwrap unions in `utils.ts`: pick the first non-literal member for rendering; at minimum render *something* and document limitations (currently renders nothing) |

### Phase 5 — Docs and issue closure (S)

- AutoForm docs page has zero live previews — add a `::component-preview` example per capability shipped above (`registry/examples/AutoForm*.vue`).
- After each phase ships: `pnpm build:registry`, commit regenerated artifacts, push (auto-deploys), then close the covered issues with a comment linking the docs example. Issues #2, #7, #11 have authors who volunteered PRs — invite them on the relevant phase before executing it in-house.

## Recommended execution order

Phase 0 → Phase 1 (parallelizable per-fix) → Phase 2 → Phase 3 → Phase 4 (parallelizable per-feature) → Phase 5 (rolling, after each phase).

## Verification gates (every phase)

- `pnpm test` — all tests pass, new regression tests included
- `pnpm lint` — exit 0
- `pnpm build:registry && git status --porcelain -- registry.json public/r` — empty after committing artifacts
- `pnpm build` — exit 0
- For consumer-facing changes: scratch install `public/r/auto-form.json` into a /tmp Vite project (pattern from plan 005) and mount a smoke-test form

## STOP conditions (for phase executors)

- A fix requires changing the public `field-config` API shape in a breaking way — report; breaking changes need a maintainer decision and a docs migration note.
- The #15 hydration fix appears to require Nuxt-specific code inside the registry item (consumers include non-Nuxt Vite users) — report options instead of committing to one.
- Zod v4-only APIs seem necessary — out of scope; report.

## Maintenance notes

- Every source change under `registry/ui/auto-form/` must ship with regenerated registry artifacts, or CI's drift job fails the PR.
- Issue #5's repro references the OLD upstream shadcn-vue example — reproduce against this repo's current code first; if unreproducible here, close with explanation.
- Cross-check upstream vantezzen/auto-form (React) for how it solved value/label options and custom fields — credit conventions already exist in the docs page.
