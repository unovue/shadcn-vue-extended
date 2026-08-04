import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { AutoForm } from '..'
import { getRequiresDependencyIssues } from '../dependencies'
import { DependencyType } from '../interface'

// `useDependencies` (dependencies.ts) relies on provide/inject wired up by
// <AutoForm>, so dependency behavior is characterized by mounting AutoForm
// with a `dependencies` prop rather than calling the composable directly.

function wait(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function toggleSource(wrapper: ReturnType<typeof mount>) {
  await wrapper.find('[role="checkbox"]').trigger('click')
  await flushPromises()
}

describe('useDependencies via <AutoForm dependencies>', () => {
  describe('dependencyType.DISABLES', () => {
    const schema = z.object({
      hasX: z.boolean(),
      x: z.string().optional(),
    })
    const dependencies = [
      { sourceField: 'hasX', targetField: 'x', type: DependencyType.DISABLES, when: (v: any) => v === true },
    ]

    it('leaves the target field enabled while the condition is unmet', async () => {
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies } })
      await flushPromises()
      expect(wrapper.find('input[name="x"]').attributes('disabled')).toBeUndefined()
    })

    it('disables the target field once the source condition is met', async () => {
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies } })
      await flushPromises()
      await toggleSource(wrapper)
      expect(wrapper.find('input[name="x"]').attributes('disabled')).toBe('')
    })

    // The fields that route `disabled` through `maybeBooleanishToBoolean`
    // (boolean/date/enum) read it as `maybeBooleanishToBoolean(...) ??
    // disabled`. While that helper collapsed a literal `false` to
    // `undefined`, an explicit `inputProps.disabled = false` fell through to
    // the dependency-driven `disabled` and could never win.
    it('honors an explicit inputProps.disabled=false over an active DISABLES dependency', async () => {
      const boolSchema = z.object({ hasX: z.boolean(), flag: z.boolean() })
      const boolDeps = [
        { sourceField: 'hasX', targetField: 'flag', type: DependencyType.DISABLES, when: (v: any) => v === true },
      ]
      const wrapper = mount(AutoForm as any, {
        props: {
          schema: boolSchema,
          dependencies: boolDeps,
          fieldConfig: { flag: { inputProps: { disabled: false } } },
        },
      })
      await flushPromises()
      await toggleSource(wrapper)
      const target = wrapper.findAll('[role="checkbox"]')[1]
      expect(target.attributes('data-disabled')).toBeUndefined()
    })
  })

  describe('dependencyType.HIDES', () => {
    const schema = z.object({
      hasX: z.boolean(),
      x: z.string().optional(),
    })
    const dependencies = [
      { sourceField: 'hasX', targetField: 'x', type: DependencyType.HIDES, when: (v: any) => v === true },
    ]

    it('renders the target field while the condition is unmet', async () => {
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies } })
      await flushPromises()
      expect(wrapper.find('input[name="x"]').exists()).toBe(true)
    })

    it('removes the target field from the DOM once the source condition is met', async () => {
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies } })
      await flushPromises()
      await toggleSource(wrapper)
      expect(wrapper.find('input[name="x"]').exists()).toBe(false)
    })
  })

  describe('dependencyType.SETS_OPTIONS', () => {
    const schema = z.object({
      hasX: z.boolean(),
      color: z.enum(['red', 'green', 'blue']),
    })
    const dependencies = [
      {
        sourceField: 'hasX',
        targetField: 'color',
        type: DependencyType.SETS_OPTIONS,
        when: (v: any) => v === true,
        options: ['blue'],
      },
    ]

    it('exposes the full option set while the condition is unmet', async () => {
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies } })
      await flushPromises()
      const values = wrapper.findAll('select[name="color"] option').map(o => o.attributes('value'))
      expect(values).toEqual(['', 'red', 'green', 'blue'])
    })

    it('replaces the option set with the override once the source condition is met', async () => {
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies } })
      await flushPromises()
      await toggleSource(wrapper)
      const values = wrapper.findAll('select[name="color"] option').map(o => o.attributes('value'))
      expect(values).toEqual(['', 'blue'])
    })
  })

  describe('dependencyType.REQUIRES', () => {
    const schema = z.object({
      hasX: z.boolean(),
      x: z.string().optional(),
    })
    const dependencies = [
      { sourceField: 'hasX', targetField: 'x', type: DependencyType.REQUIRES, when: (v: any) => v === true },
    ]

    it('does not show a required asterisk on the target label while the condition is unmet', async () => {
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies } })
      await flushPromises()
      const labels = wrapper.findAll('label')
      const xLabel = labels.find(l => l.text().startsWith('X'))!
      expect(xLabel.find('span').exists()).toBe(false)
    })

    it('shows a required asterisk on the target label once the source condition is met', async () => {
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies } })
      await flushPromises()
      await toggleSource(wrapper)
      const labels = wrapper.findAll('label')
      const xLabel = labels.find(l => l.text().startsWith('X'))!
      expect(xLabel.find('span').text()).toBe('*')
    })

    // FIXED(#2/#14): DependencyType.REQUIRES used to only ever drive the
    // visual asterisk (isRequired feeds FieldProps.required for the label)
    // and never touched the zod validation schema, which was fixed once at
    // mount via toTypedSchema(props.schema). So even with the dependency
    // active and the (schema-optional) target field left empty, the form
    // used to still submit successfully — the "required" indicator was
    // cosmetic only. AutoForm.vue now layers `getRequiresDependencyIssues()`
    // onto the typed schema's `parse()` step (see dependencies.ts), so an
    // active REQUIRES dependency now genuinely blocks submission when its
    // target is empty.
    it('blocks submission and renders a form error when the target field is left empty while the REQUIRES dependency is active', async () => {
      const onSubmit = vi.fn()
      const wrapper = mount(AutoForm as any, {
        props: { schema, dependencies },
        attrs: { onSubmit },
      })
      await flushPromises()
      await toggleSource(wrapper)

      expect(wrapper.find('input[name="x"]').element.value).toBe('')

      await wrapper.find('form').trigger('submit')
      await flushPromises()
      await wait(20)
      await flushPromises()

      expect(onSubmit).not.toHaveBeenCalled()
      const messages = wrapper.findAll('[data-slot="form-message"]').map(m => m.text())
      expect(messages.some(text => text.length > 0)).toBe(true)
    })

    it('submits successfully with the target field left empty when the REQUIRES dependency is inactive', async () => {
      const onSubmit = vi.fn()
      const wrapper = mount(AutoForm as any, {
        props: { schema, dependencies },
        attrs: { onSubmit },
      })
      await flushPromises()
      // `hasX` is a required (non-optional, no default) boolean, so toggle
      // it to a concrete `false` (rather than leaving it `undefined`) to
      // isolate "dependency inactive" from "base schema rejects an unset
      // required field" — an unrelated failure mode.
      await toggleSource(wrapper)
      await toggleSource(wrapper)

      expect(wrapper.find('input[name="x"]').element.value).toBe('')

      await wrapper.find('form').trigger('submit')
      await flushPromises()
      await wait(20)
      await flushPromises()

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.calls[0][0]).toEqual({ hasX: false })
      expect(wrapper.findAll('[data-slot="form-message"]').every(m => m.text() === '')).toBe(true)
    })
  })

  describe('dependencyType.REQUIRES with a when() reading both source and target values', () => {
    const schema = z.object({
      hasX: z.boolean(),
      x: z.string().optional(),
    })
    // `when(sourceFieldValue, targetFieldValue)` — per interface.ts's
    // BaseDependency shape — receives the *target* field's own current value
    // as its second argument. This exercises that both arguments are
    // plumbed through correctly at validation time (not just at render
    // time, which the asterisk tests above already cover).
    const when = vi.fn((sourceValue: any, targetValue: any) => sourceValue === true && targetValue !== 'ignored')
    const dependencies = [
      { sourceField: 'hasX', targetField: 'x', type: DependencyType.REQUIRES, when },
    ]

    it('blocks submit when active (source true) and the target is left empty', async () => {
      when.mockClear()
      const onSubmit = vi.fn()
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies }, attrs: { onSubmit } })
      await flushPromises()
      await toggleSource(wrapper)

      await wrapper.find('form').trigger('submit')
      await flushPromises()
      await wait(20)
      await flushPromises()

      expect(onSubmit).not.toHaveBeenCalled()
      expect(when).toHaveBeenCalledWith(true, undefined)
    })

    it('submits fine when inactive (source false), leaving the target empty', async () => {
      when.mockClear()
      const onSubmit = vi.fn()
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies }, attrs: { onSubmit } })
      await flushPromises()
      // Toggle to a concrete `false` (see comment above) rather than
      // leaving the required `hasX` boolean unset.
      await toggleSource(wrapper)
      await toggleSource(wrapper)

      await wrapper.find('form').trigger('submit')
      await flushPromises()
      await wait(20)
      await flushPromises()

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(when).toHaveBeenCalledWith(false, undefined)
    })
  })

  describe('dependencyType.REQUIRES boundary values (false and 0 are not empty)', () => {
    it('submits successfully when an active dependency targets a `false` boolean value', async () => {
      const schema = z.object({
        hasX: z.boolean().default(true),
        flag: z.boolean().default(false),
      })
      const dependencies = [
        { sourceField: 'hasX', targetField: 'flag', type: DependencyType.REQUIRES, when: (v: any) => v === true },
      ]
      const onSubmit = vi.fn()
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies }, attrs: { onSubmit } })
      await flushPromises()

      await wrapper.find('form').trigger('submit')
      await flushPromises()
      await wait(20)
      await flushPromises()

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.calls[0][0]).toEqual({ hasX: true, flag: false })
      expect(wrapper.findAll('[data-slot="form-message"]').every(m => m.text() === '')).toBe(true)
    })

    it('submits successfully when an active dependency targets a `0` numeric value', async () => {
      const schema = z.object({
        hasX: z.boolean().default(true),
        count: z.number().default(0),
      })
      const dependencies = [
        { sourceField: 'hasX', targetField: 'count', type: DependencyType.REQUIRES, when: (v: any) => v === true },
      ]
      const onSubmit = vi.fn()
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies }, attrs: { onSubmit } })
      await flushPromises()

      await wrapper.find('form').trigger('submit')
      await flushPromises()
      await wait(20)
      await flushPromises()

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.calls[0][0]).toEqual({ hasX: true, count: 0 })
      expect(wrapper.findAll('[data-slot="form-message"]').every(m => m.text() === '')).toBe(true)
    })
  })

  // #15: dependency evaluation must be a pure function of
  // (initialValues, schema, dependencies) at first render, so SSR and
  // client hydration produce the same layout. This mounts with a HIDES
  // dependency that is active purely from schema defaults (no interaction,
  // no `await`) and asserts the hidden state is already correct
  // synchronously after `mount()` — matching what a synchronous SSR render
  // pass would see. See NOTES in dependencies.ts / the phase-2 commit for
  // the full code-reading analysis this backs up.
  describe('first-render determinism (#15)', () => {
    it('reflects an active HIDES dependency synchronously on the very first render tick', () => {
      const schema = z.object({
        hasX: z.boolean().default(true),
        x: z.string().optional(),
      })
      const dependencies = [
        { sourceField: 'hasX', targetField: 'x', type: DependencyType.HIDES, when: (v: any) => v === true },
      ]

      const wrapper = mount(AutoForm as any, { props: { schema, dependencies } })
      // Deliberately no `await flushPromises()` / `nextTick()` here.
      expect(wrapper.find('input[name="x"]').exists()).toBe(false)
    })

    it('leaves the target field rendered on the first tick when the dependency is inactive by default', () => {
      const schema = z.object({
        hasX: z.boolean().default(false),
        x: z.string().optional(),
      })
      const dependencies = [
        { sourceField: 'hasX', targetField: 'x', type: DependencyType.HIDES, when: (v: any) => v === true },
      ]

      const wrapper = mount(AutoForm as any, { props: { schema, dependencies } })
      expect(wrapper.find('input[name="x"]').exists()).toBe(true)
    })
  })

  // BUG(#10) regression: getSourceValue() in dependencies.ts parses dotted
  // field paths with `.split('.').toReversed()` three times to resolve a
  // dependency's source value relative to the target's array index (the
  // `index >= 0 && sourceInitial.join(',') === targetInitial.join(',')`
  // branch below). `toReversed()` is an ES2023 array method; since consumers
  // install this file verbatim (unbundled, no polyfill guarantee), it must
  // not appear in shipped source. Fixed by switching to in-place `.reverse()`
  // (safe here because each call operates on a fresh array from `.split()`).
  // This test exercises exactly that array-relative-sibling code path, which
  // no other test in this suite reaches.
  describe('array-relative dependency (exercises getSourceValue index path)', () => {
    const schema = z.object({
      items: z.array(z.object({ hasX: z.boolean(), x: z.string().optional() })),
    })
    const dependencies = [
      { sourceField: 'items.hasX', targetField: 'items.x', type: DependencyType.DISABLES, when: (v: any) => v === true },
    ]

    async function expandToItemFields(wrapper: ReturnType<typeof mount>) {
      await wrapper.find('[data-slot="accordion-trigger"]').trigger('click')
      await flushPromises()
      const addButton = wrapper.findAll('button').find(b => b.text().includes('Add'))!
      await addButton.trigger('click')
      await flushPromises()
      const triggers = wrapper.findAll('[data-slot="accordion-trigger"]')
      await triggers[1].trigger('click')
      await flushPromises()
    }

    it('leaves the sibling target field enabled while the condition is unmet', async () => {
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies } })
      await flushPromises()
      await expandToItemFields(wrapper)
      expect(wrapper.find('input[name="items[0].x"]').attributes('disabled')).toBeUndefined()
    })

    it('disables the sibling target field once the same-item source condition is met', async () => {
      const wrapper = mount(AutoForm as any, { props: { schema, dependencies } })
      await flushPromises()
      await expandToItemFields(wrapper)
      await toggleSource(wrapper)
      expect(wrapper.find('input[name="items[0].x"]').attributes('disabled')).toBe('')
    })
  })

  // The REQUIRES validation path (`getRequiresDependencyIssues`) resolves
  // dependency paths itself rather than going through `getSourceValue`, so
  // the DISABLES coverage above does not reach it. It used to stop one level
  // short of expanding an array: for a shared parent of exactly `items` the
  // last path segment was consumed on the way in, leaving nothing to walk,
  // so the *array* was treated as a single item. That read `hasX`/`x` off the
  // array object (always undefined, so the dependency silently never fired)
  // and, for a `when()` that is truthy on undefined, emitted the schema-level
  // path `items.x`, which maps to no registered field — blocking submit with
  // no message rendered anywhere.
  describe('getRequiresDependencyIssues path expansion over arrays', () => {
    const dependencies = [{
      sourceField: 'items.hasX',
      targetField: 'items.x',
      type: DependencyType.REQUIRES,
      when: (v: any) => v === true,
    }] as any

    it('raises one issue per array item whose own sibling source is active and target empty', () => {
      const values = {
        items: [
          { hasX: true, x: '' }, // active + empty -> issue
          { hasX: false, x: '' }, // inactive -> no issue
          { hasX: true, x: 'ok' }, // active but filled -> no issue
        ],
      }
      expect(getRequiresDependencyIssues(values, dependencies)).toEqual([
        { path: 'items[0].x', message: 'Required' },
      ])
    })

    it('raises nothing when no item has its source active', () => {
      expect(getRequiresDependencyIssues({ items: [{ hasX: false, x: '' }] }, dependencies)).toEqual([])
    })

    it('emits per-item vee-validate paths, never the unmappable schema-level `items.x`', () => {
      const alwaysActive = [{
        sourceField: 'items.hasX',
        targetField: 'items.x',
        type: DependencyType.REQUIRES,
        when: () => true,
      }] as any
      const issues = getRequiresDependencyIssues({ items: [{ x: '' }, { x: '' }] }, alwaysActive)
      expect(issues.map(issue => issue.path)).toEqual(['items[0].x', 'items[1].x'])
    })

    it('still resolves a non-array sibling pair off the shared parent object', () => {
      const nested = [{
        sourceField: 'address.hasZip',
        targetField: 'address.zip',
        type: DependencyType.REQUIRES,
        when: (v: any) => v === true,
      }] as any
      const issues = getRequiresDependencyIssues({ address: { hasZip: true, zip: '' } }, nested)
      expect(issues).toEqual([{ path: 'address.zip', message: 'Required' }])
    })

    it('still resolves a flat top-level pair', () => {
      const flat = [{
        sourceField: 'hasX',
        targetField: 'x',
        type: DependencyType.REQUIRES,
        when: (v: any) => v === true,
      }] as any
      expect(getRequiresDependencyIssues({ hasX: true, x: '' }, flat)).toEqual([{ path: 'x', message: 'Required' }])
    })
  })
})
