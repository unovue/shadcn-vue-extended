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
