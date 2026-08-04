# Plan 008: AutoForm Phase 1 — seven quick-win bug fixes

> Split from [006-autoform-enhancements.md](006-autoform-enhancements.md) Phase 1.
> **Depends on plan 007 (test harness) being merged into `feat/autoform`.**
> Dispatch as two parallel executor batches; both branch from `feat/autoform` after 007 lands:
> - **Batch A** (`autoform/phase-1a-schema-fixes`) — pure TS: #10, #12, #3
> - **Batch B** (`autoform/phase-1b-field-fixes`) — field components: #8, #4, #13, #5
>
> Batches touch disjoint files except `__tests__/` (both flip pinned BUG expectations there —
> reviewer resolves trivial test-file merge overlap if any).

## Status

- **Priority**: P1 / **Effort**: M (S per fix) / **Risk**: MED (ships to consumers)
- **Depends on**: plans/007 (merged), category: bug
- **Planned at**: commit `427308f`, 2026-07-20

## Shared rules (both batches)

- Every fix flips its `// BUG(#n)` characterization test (from plan 007) to the FIXED expectation and adds any missing regression case. A fix without a flipped/added test is incomplete.
- Public API (`field-config` shape, props) must not change — these are drop-in fixes.
- After all fixes: `pnpm build:registry` and commit regenerated `registry.json` + `public/r/*.json` (auto-form content hash changes).
- Gates: `pnpm test` 0 failures; `pnpm lint` exit 0; `git status --porcelain -- registry.json public/r` empty after committing artifacts.
- STOP if: a fix seems to require restructuring shared field architecture (that's Phase 3); or a flipped test exposes a second bug underneath (report, don't chain fixes).

## Batch A — schema/TS fixes (files: `dependencies.ts`, `utils.ts`, tests)

### A1 (#10): `toReversed()` breaks consumers on TS lib < ES2023
`dependencies.ts:36-40` uses `.toReversed()` three times on `String.split` results. Replace each with `[...x.split('.')].reverse()` (or `.split('.').reverse()` — the array is fresh, in-place reverse is safe; choose this simpler form). Consumers install this file verbatim, so no ES2023 lib requirement may remain. Verify: `grep -c toReversed registry/ui/auto-form/dependencies.ts` → 0; dependency tests still pass.

### A2 (#12): `.readonly()` fields render editable
`utils.ts` `getBaseSchema` unwraps `_def.innerType`, which silently strips `ZodReadonly`, so readonly fields render as their inner editable type. Fix in shape extraction (`AutoForm.vue`/`AutoFormFieldObject.vue` both build shapes via `getBaseSchema`/`getBaseType`): detect `ZodReadonly` in the wrapper stack and skip the field entirely (do not render). Document the behavior in the docs page's zod-configuration section. Flip BUG(#12) test.

### A3 (#3): `z.preprocess`-wrapped enum ignores preprocessed initial value
Symptom (issue gist): enum inside `z.preprocess`; the initial value shown in the form is the raw value, never run through the preprocess function, so it matches no option. Investigate `getDefaultValueInZodStack` + how `AutoForm.vue` computes initial values; the fix is to run values through `schema.safeParse` (which applies effects) when deriving initial form values, falling back to raw on parse failure. Flip BUG(#3) test. STOP if this requires changing how ALL defaults resolve (report design options instead).

## Batch B — field component fixes (files: four `AutoFormField*.vue`, tests)

### B1 (#8): number input doesn't propagate numeric values
`AutoFormFieldNumber.vue` binds `slotProps.componentField` directly to `<Input type="number">`; DOM number inputs emit strings, so the form model receives strings (zod number validation then fails or binding appears dead). Fix: intercept the update (e.g. wrap `componentField`'s `onUpdate:modelValue`/change handler) to coerce with `Number.parseFloat` (empty string → `undefined`). Flip/add regression test asserting the form value is `typeof number` after input.

### B2 (#4): sub-object ignores field-config label/description and inner `.describe()`
`AutoFormFieldObject.vue` AccordionTrigger renders `{{ schema?.description || beautifyObjectName(fieldName) }}` — `config.label` is never consulted, and `config.description` is never rendered. Fix: label precedence `config.label || schema.description || beautifyObjectName(fieldName)`; render `config.description` (FormDescription-style) inside the accordion content. Note `props.schema` may be the wrapped schema — read description via `getBaseSchema` fallback so `.describe()` on optional-wrapped sub-objects works. Flip BUG(#4) test.

### B3 (#13): date field crashes (`modelValue.toDate is not a function`) with default values
`AutoFormFieldDate.vue`: Calendar/date display expects a `DateValue` (from `@internationalized/date` via reka-ui) but schema defaults/initial values arrive as `Date` or ISO string. Fix: computed bridge that converts incoming `Date`/string model values to `DateValue` (e.g. `parseDate`/`fromDate`) and converts back on update; guard the display format call. Add regression test mounting a schema with `z.date().default(new Date(...))`.

### B4 (#5): deleting an array item leaves a ghost entry
`AutoFormFieldArray.vue` (uses vee-validate `FieldArray`): removal leaves a stale rendered entry and the length doesn't shrink. Read the file; expected root cause: iteration keyed by index (or by `fields.length`-derived key) instead of vee-validate's stable `entry.key`, and/or `remove(index)` called with a stale index from the closure. Fix keying to `field.key` and pass the loop index to `remove`. Add regression test: mount array schema with 2 items, click remove on first, assert 1 rendered entry with the second item's value.

## Reviewer merge protocol

Merge Batch A and Batch B into `feat/autoform` after review (A first, then B; resolve `__tests__` overlap if both touched the same test file). Then run the full gates on `feat/autoform` and `pnpm build:registry` drift check once more on the merged result.
