import { toTypedSchema } from '@vee-validate/zod'
import { flushPromises, mount } from '@vue/test-utils'
import { useForm } from 'vee-validate'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { z } from 'zod'
import { AutoForm } from '..'

function wait(ms = 20) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Phase 4C (#9): AutoFormFieldEnum — config.options value/label pairs.
describe('autoFormFieldEnum: config.options value/label pairs (#9)', () => {
  const schema = z.object({ color: z.enum(['red', 'green']) })
  const options = [
    { value: 'red', label: 'Red Color' },
    { value: 'green', label: 'Green Color' },
  ]

  it('select variant: renders the pair labels, keeps the pair values as the submitted values', async () => {
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { color: { options } } },
    })
    await flushPromises()

    // reka-ui's hidden native <select> mirror always renders regardless of
    // open/closed portal state — its <option>s carry the real value
    // (attribute) and the display label (text content), so this exercises
    // both without needing to drive the visual popover open.
    const opts = wrapper.findAll('select[name="color"] option')
    expect(opts.map(o => o.attributes('value'))).toEqual(['', 'red', 'green'])
    expect(opts.map(o => o.text())).toEqual(['', 'Red Color', 'Green Color'])
  })

  it('select variant: displays the matched label and submits the value (not the label)', async () => {
    const onSubmit = vi.fn()
    const Harness = defineComponent({
      setup() {
        const form = useForm({
          validationSchema: toTypedSchema(schema),
          initialValues: { color: 'red' },
        })
        return () => h(AutoForm as any, {
          schema,
          form,
          fieldConfig: { color: { options } },
          onSubmit,
        })
      },
    })
    const wrapper = mount(Harness)
    await flushPromises()

    expect(wrapper.find('[data-slot="select-value"]').text()).toBe('Red Color')

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wait()
    await flushPromises()

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ color: 'red' })
  })

  it('radio variant: renders the pair labels and submits the value (not the label)', async () => {
    const onSubmit = vi.fn()
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { color: { component: 'radio', options } } },
      attrs: { onSubmit },
    })
    await flushPromises()

    const radios = wrapper.findAll('[role="radio"]')
    expect(radios.map(r => r.attributes('value'))).toEqual(['red', 'green'])
    expect(wrapper.findAll('label').map(l => l.text())).toEqual(['Color *', 'Red Color', 'Green Color'])

    await radios[0].trigger('click')
    await flushPromises()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wait()
    await flushPromises()

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ color: 'red' })
  })

  // Regression: the plain string[] path (value === beautified label) is
  // exercised by fields.test.ts's "zodEnum renders a select trigger" and
  // "...radio..." cases, which stay unmodified and passing.
})

// Phase 4C (#6): AutoFormFieldBoolean — checkedValue/uncheckedValue/indeterminateValue.
describe('autoFormFieldBoolean: checked/unchecked/indeterminate values (#6)', () => {
  it('default checkbox behavior is unchanged: toggles plain boolean true/false', async () => {
    const schema = z.object({ flag: z.boolean() })
    const onSubmit = vi.fn()
    const wrapper = mount(AutoForm as any, { props: { schema }, attrs: { onSubmit } })
    await flushPromises()

    await wrapper.find('[role="checkbox"]').trigger('click')
    await flushPromises()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wait()
    await flushPromises()
    expect(onSubmit.mock.calls[0][0]).toEqual({ flag: true })

    await wrapper.find('[role="checkbox"]').trigger('click')
    await flushPromises()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wait()
    await flushPromises()
    expect(onSubmit.mock.calls[1][0]).toEqual({ flag: false })
  })

  it('default switch behavior is unchanged: toggles plain boolean and ignores checkedValue/uncheckedValue', async () => {
    const schema = z.object({ flag: z.boolean() })
    const onSubmit = vi.fn()
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { flag: { component: 'switch', checkedValue: 'yes', uncheckedValue: 'no' } } },
      attrs: { onSubmit },
    })
    await flushPromises()

    await wrapper.find('[role="switch"]').trigger('click')
    await flushPromises()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wait()
    await flushPromises()

    // Switch variant ignores checkedValue/uncheckedValue — always plain boolean.
    expect(onSubmit.mock.calls[0][0]).toEqual({ flag: true })
  })

  it('custom checkedValue/uncheckedValue submit correctly', async () => {
    const schema = z.object({ flag: z.union([z.literal('yes'), z.literal('no')]) })
    const onSubmit = vi.fn()
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { flag: { component: 'checkbox', checkedValue: 'yes', uncheckedValue: 'no' } } },
      attrs: { onSubmit },
    })
    await flushPromises()

    expect(wrapper.find('[role="checkbox"]').attributes('data-state')).toBe('unchecked')

    await wrapper.find('[role="checkbox"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="checkbox"]').attributes('data-state')).toBe('checked')

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wait()
    await flushPromises()
    expect(onSubmit.mock.calls[0][0]).toEqual({ flag: 'yes' })

    await wrapper.find('[role="checkbox"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="checkbox"]').attributes('data-state')).toBe('unchecked')

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wait()
    await flushPromises()
    expect(onSubmit.mock.calls[1][0]).toEqual({ flag: 'no' })
  })

  it('indeterminateValue makes the checkbox cycle checked -> unchecked -> indeterminate -> checked ...', async () => {
    const schema = z.object({
      flag: z.union([z.literal(true), z.literal(false), z.literal('excluded')]),
    })
    const onSubmit = vi.fn()
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { flag: { component: 'checkbox', indeterminateValue: 'excluded' } } },
      attrs: { onSubmit },
    })
    await flushPromises()
    const checkbox = () => wrapper.find('[role="checkbox"]')

    expect(checkbox().attributes('data-state')).toBe('unchecked')

    await checkbox().trigger('click')
    await flushPromises()
    expect(checkbox().attributes('data-state')).toBe('checked')

    await checkbox().trigger('click')
    await flushPromises()
    expect(checkbox().attributes('data-state')).toBe('unchecked')

    await checkbox().trigger('click')
    await flushPromises()
    // The indeterminate cycle reaches indeterminateValue in the model, and
    // reka-ui's CheckboxRoot renders its own tri-state indeterminate visual
    // (data-state="indeterminate", aria-checked="mixed") for it.
    expect(checkbox().attributes('data-state')).toBe('indeterminate')
    expect(checkbox().attributes('aria-checked')).toBe('mixed')

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wait()
    await flushPromises()
    expect(onSubmit.mock.calls[0][0]).toEqual({ flag: 'excluded' })

    await checkbox().trigger('click')
    await flushPromises()
    expect(checkbox().attributes('data-state')).toBe('checked')
  })
})

// Phase 4C (#11): z.union() rendering.
describe('z.union() rendering (#11)', () => {
  // The issue's canonical case: an optional-email escape hatch modeled as a
  // union so '' is explicitly a valid value alongside a real (validated)
  // email, rather than relying on .optional() alone.
  const schema = z.object({
    email: z.union([z.literal(''), z.string().email().optional()]),
  })

  it('renders a string input instead of nothing', async () => {
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    const input = wrapper.find('input[name="email"]')
    expect(input.exists()).toBe(true)
  })

  it('accepts an explicit empty string on submit', async () => {
    const onSubmit = vi.fn()
    const wrapper = mount(AutoForm as any, { props: { schema }, attrs: { onSubmit } })
    await flushPromises()

    await wrapper.find('input[name="email"]').setValue('a@b.com')
    await wrapper.find('input[name="email"]').setValue('')
    await flushPromises()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wait()
    await flushPromises()

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: '' })
  })

  it('accepts a valid email on submit', async () => {
    const onSubmit = vi.fn()
    const wrapper = mount(AutoForm as any, { props: { schema }, attrs: { onSubmit } })
    await flushPromises()

    await wrapper.find('input[name="email"]').setValue('a@b.com')
    await flushPromises()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wait()
    await flushPromises()

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'a@b.com' })
  })

  it('rejects an invalid (non-empty, non-email) value with a validation error', async () => {
    const onSubmit = vi.fn()
    const wrapper = mount(AutoForm as any, { props: { schema }, attrs: { onSubmit } })
    await flushPromises()

    await wrapper.find('input[name="email"]').setValue('not-an-email')
    await flushPromises()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wait()
    await flushPromises()

    expect(onSubmit).not.toHaveBeenCalled()
    const messages = wrapper.findAll('[data-slot="form-message"]').map(m => m.text())
    expect(messages.some(text => text.length > 0)).toBe(true)
  })

  it('union-of-enum renders the enum options', async () => {
    const enumSchema = z.object({ color: z.union([z.literal(''), z.enum(['red', 'green'])]) })
    const wrapper = mount(AutoForm as any, { props: { schema: enumSchema } })
    await flushPromises()
    const values = wrapper.findAll('select[name="color"] option').map(o => o.attributes('value'))
    expect(values).toEqual(['', 'red', 'green'])
  })

  // Union resolution originally lived only in AutoForm.vue's own shape loop,
  // so a union nested inside a ZodObject fell back to `getBaseType() ===
  // 'ZodUnion'`, which has no DEFAULT_ZOD_HANDLERS entry and rendered
  // nothing at all. Both loops now share utils.ts's `buildShape`.
  it('renders a union nested inside a ZodObject', async () => {
    const nested = z.object({
      contact: z.object({ email: z.union([z.literal(''), z.string().email().optional()]) }),
    })
    const wrapper = mount(AutoForm as any, { props: { schema: nested } })
    await flushPromises()
    await wrapper.find('[data-slot="accordion-trigger"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('input[name="contact.email"]').exists()).toBe(true)
  })
})
