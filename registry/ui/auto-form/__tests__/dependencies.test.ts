import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { AutoForm } from '..'
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

    // BUG(#2/#14): DependencyType.REQUIRES only ever drives the visual
    // asterisk (isRequired feeds FieldProps.required for the label). It does
    // NOT alter the zod validation schema, which is fixed once at mount via
    // toTypedSchema(props.schema). So even with the dependency active and the
    // (schema-optional) target field left empty, the form still submits
    // successfully — the "required" indicator is cosmetic only.
    it('still submits successfully with the target field left empty, despite the active REQUIRES dependency', async () => {
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

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.calls[0][0]).toEqual({ hasX: true })
      expect(wrapper.findAll('[data-slot="form-message"]').every(m => m.text() === '')).toBe(true)
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
})
