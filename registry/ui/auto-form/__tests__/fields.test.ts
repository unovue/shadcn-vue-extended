import { toTypedSchema } from '@vee-validate/zod'
import { flushPromises, mount } from '@vue/test-utils'
import { useForm } from 'vee-validate'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { z } from 'zod'
import { AutoForm } from '..'

describe('field type resolution (one mount per field type)', () => {
  it('zodString renders a text input', async () => {
    const schema = z.object({ name: z.string() })
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    const input = wrapper.find('input[name="name"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('type')).toBe('text')
  })

  it('zodString with config.component "textarea" renders a textarea', async () => {
    const schema = z.object({ bio: z.string() })
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { bio: { component: 'textarea' } } },
    })
    await flushPromises()
    expect(wrapper.find('[name="bio"]').element.tagName).toBe('TEXTAREA')
  })

  it('zodNumber renders a number input', async () => {
    const schema = z.object({ age: z.number() })
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    expect(wrapper.find('input[name="age"]').attributes('type')).toBe('number')
  })

  // BUG(#8) fixed: AutoFormFieldNumber used to bind componentField straight
  // onto <Input type="number">. DOM number inputs always emit strings via
  // `input`/`update:modelValue`, so the form model received the string "42"
  // instead of the number 42. AutoFormFieldNumber now coerces with
  // Number.parseFloat (empty string -> undefined) before forwarding the
  // update to vee-validate.
  it('fixes BUG #8: a number input submits a real number, not a string', async () => {
    const schema = z.object({ age: z.number() })
    const onSubmit = vi.fn()
    const wrapper = mount(AutoForm as any, {
      props: { schema },
      attrs: { onSubmit },
    })
    await flushPromises()
    await wrapper.find('input[name="age"]').setValue('42')
    await flushPromises()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 20))
    await flushPromises()

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0][0] as { age: number }
    expect(payload.age).toBe(42)
    expect(typeof payload.age).toBe('number')
  })

  it('zodBoolean renders a checkbox by default', async () => {
    const schema = z.object({ flag: z.boolean() })
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    expect(wrapper.find('[role="checkbox"]').exists()).toBe(true)
  })

  it('zodBoolean with config.component "switch" renders a switch instead', async () => {
    const schema = z.object({ flag: z.boolean() })
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { flag: { component: 'switch' } } },
    })
    await flushPromises()
    expect(wrapper.find('[role="switch"]').exists()).toBe(true)
    expect(wrapper.find('[role="checkbox"]').exists()).toBe(false)
  })

  it('zodEnum renders a select trigger (combobox) by default', async () => {
    const schema = z.object({ color: z.enum(['red', 'green']) })
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    expect(wrapper.find('[role="combobox"]').exists()).toBe(true)
    const values = wrapper.findAll('select[name="color"] option').map(o => o.attributes('value'))
    expect(values).toEqual(['', 'red', 'green'])
  })

  it('zodEnum with config.component "radio" renders a radiogroup with one radio per option', async () => {
    const schema = z.object({ color: z.enum(['red', 'green']) })
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { color: { component: 'radio' } } },
    })
    await flushPromises()
    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true)
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios).toHaveLength(2)
    expect(radios.map(r => r.attributes('value'))).toEqual(['red', 'green'])
  })

  it('zodNativeEnum renders options from Object.values() of the enum map', async () => {
    enum Fruit {
      Apple = 'apple',
      Banana = 'banana',
    }
    const schema = z.object({ fruit: z.nativeEnum(Fruit) })
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    const values = wrapper.findAll('select[name="fruit"] option').map(o => o.attributes('value'))
    expect(values).toEqual(['', 'apple', 'banana'])
  })

  it('zodDate renders a popover-trigger button with a placeholder', async () => {
    const schema = z.object({ dob: z.date() })
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    const trigger = wrapper.find('[data-slot="popover-trigger"]')
    expect(trigger.exists()).toBe(true)
    expect(trigger.text()).toBe('Pick a date')
  })

  // BUG(#13) fixed: AutoFormFieldDate called `slotProps.componentField.modelValue.toDate(...)`
  // directly on the form model value to render the trigger label, and spread
  // `componentField` (whose `modelValue` is whatever the form model holds —
  // a plain `Date` for a `z.date()` field, not a `DateValue`) straight onto
  // <Calendar>. Both crashed with "modelValue.toDate is not a function" as
  // soon as the field had a non-empty initial/default value. The component
  // now bridges plain `Date`/string model values to a `DateValue` for the
  // Calendar and back, and guards the trigger label's format call.
  it('fixes BUG #13: a z.date() field with a default value renders without throwing', async () => {
    const schema = z.object({ d: z.date().default(new Date('2026-01-15T00:00:00.000Z')) })
    expect(() => mount(AutoForm as any, { props: { schema } })).not.toThrow()
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    const trigger = wrapper.find('[data-slot="popover-trigger"]')
    expect(trigger.exists()).toBe(true)
    expect(trigger.text()).not.toBe('Pick a date')
    expect(trigger.text()).toContain('2026')
  })

  it('a config.component "file" field renders a file input', async () => {
    const schema = z.object({ doc: z.any() })
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { doc: { component: 'file' } } },
    })
    await flushPromises()
    // Unlike every other field component, AutoFormFieldFile does not spread
    // slotProps.componentField onto the <Input>, so it never gets a `name`
    // attribute — select on type instead.
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
  })

  it('zodObject renders nested fields inside a collapsible accordion', async () => {
    const schema = z.object({
      address: z.object({ street: z.string() }),
    })
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    expect(wrapper.find('input[name="address.street"]').exists()).toBe(false)
    await wrapper.find('[data-slot="accordion-trigger"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('input[name="address.street"]').exists()).toBe(true)
  })

  // BUG(#4) fixed: AutoFormFieldObject's accordion label now prefers
  // `config?.label`, falling back to the sub-object's own `.describe()`, then
  // `beautifyObjectName(fieldName)`. `config?.description` is now rendered
  // (FormDescription-style) inside the accordion content, matching every
  // other field component.
  it('fixes BUG #4: fieldConfig label/description are honored for a ZodObject field', async () => {
    const schema = z.object({
      address: z.object({ street: z.string() }).describe('an address'),
    })
    const wrapper = mount(AutoForm as any, {
      props: {
        schema,
        fieldConfig: { address: { label: 'Custom Label', description: 'Custom Desc' } },
      },
    })
    await flushPromises()
    // fieldConfig.label now wins over the schema's own .describe():
    expect(wrapper.find('[data-slot="accordion-trigger"]').text()).toContain('Custom Label')
    expect(wrapper.find('[data-slot="accordion-trigger"]').text()).not.toContain('an address')
    // fieldConfig.description is now rendered (inside the collapsed accordion
    // content, so open it first):
    expect(wrapper.text()).not.toContain('Custom Desc')
    await wrapper.find('[data-slot="accordion-trigger"]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Custom Desc')
  })

  it('fixes BUG #4: falls back to schema .describe() for the label when fieldConfig.label is absent', async () => {
    const schema = z.object({
      address: z.object({ street: z.string() }).describe('an address'),
    })
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    expect(wrapper.find('[data-slot="accordion-trigger"]').text()).toContain('an address')
  })

  it('zodArray renders add/remove UI and grows/shrinks the field list', async () => {
    const schema = z.object({ tags: z.array(z.string()) })
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    await wrapper.find('[data-slot="accordion-trigger"]').trigger('click')
    await flushPromises()

    expect(wrapper.findAll('input[type="text"]')).toHaveLength(0)

    const addButton = wrapper.findAll('button').find(b => b.text().includes('Add'))!
    await addButton.trigger('click')
    await flushPromises()
    expect(wrapper.findAll('input[type="text"]')).toHaveLength(1)

    await addButton.trigger('click')
    await flushPromises()
    expect(wrapper.findAll('input[type="text"]')).toHaveLength(2)

    await removeButtons(wrapper)[removeButtons(wrapper).length - 1].trigger('click')
    await flushPromises()
    expect(wrapper.findAll('input[type="text"]')).toHaveLength(1)
  })

  function removeButtons(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('button').filter(b => b.find('svg.lucide-trash').exists())
  }

  // BUG(#5) fixed: removing an array item used to leave a ghost entry and be
  // a no-op for any non-last index — see the root-cause note on
  // AutoFormFieldArray.vue's `useField(fieldName)` call. Removing index 0 of
  // 2 must remove exactly that entry and keep the second item's value.
  it('fixes BUG #5: removing a non-last array item removes exactly that entry and keeps the rest', async () => {
    const schema = z.object({ tags: z.array(z.string()) })
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    await wrapper.find('[data-slot="accordion-trigger"]').trigger('click')
    await flushPromises()

    const addButton = wrapper.findAll('button').find(b => b.text().includes('Add'))!
    await addButton.trigger('click')
    await flushPromises()
    await wrapper.findAll('input[type="text"]')[0].setValue('first')
    await addButton.trigger('click')
    await flushPromises()
    await wrapper.findAll('input[type="text"]')[1].setValue('second')
    await flushPromises()

    expect(wrapper.findAll('input[type="text"]').map(i => (i.element as HTMLInputElement).value)).toEqual(['first', 'second'])

    await removeButtons(wrapper)[0].trigger('click')
    await flushPromises()

    const remaining = wrapper.findAll('input[type="text"]')
    expect(remaining).toHaveLength(1)
    expect((remaining[0].element as HTMLInputElement).value).toBe('second')
    expect(remaining[0].attributes('name')).toBe('tags[0]')
  })

  // BUG(#3): an enum nested inside an array item fails to reflect its
  // current/initial value in the Select trigger. The underlying vee-validate
  // field value IS correct (the hidden mirror <select> shows the right
  // `value` attribute), but the visible SelectValue renders empty
  // (data-placeholder) instead of the matched option's label. This
  // reproduces for a plain enum item too — it is not specific to
  // preprocess — but is characterized here with a z.preprocess-wrapped enum
  // per the known-bugs list, since AutoFormFieldArray computes its item
  // shape from the raw (non-unwrapped) item schema.
  it('pins BUG #3: array-nested enum does not display its matched initial value', async () => {
    const itemSchema = z.preprocess(v => (typeof v === 'string' ? v.toLowerCase() : v), z.enum(['red', 'green']))
    const schema = z.object({ colors: z.array(itemSchema) })

    const Harness = defineComponent({
      setup() {
        const form = useForm({
          validationSchema: toTypedSchema(schema),
          initialValues: { colors: ['GREEN' as any] },
        })
        return () => h(AutoForm as any, { schema, form })
      },
    })

    const wrapper = mount(Harness)
    await flushPromises()
    await wrapper.find('[data-slot="accordion-trigger"]').trigger('click')
    await flushPromises()

    // The underlying field value is correctly normalized to 'green' (matches
    // an option)...
    expect(wrapper.find('select[name="colors[0]"]').attributes('value')).toBe('green')
    // ...but the visible trigger fails to show it, rendering the empty
    // placeholder instead of "Green".
    const selectValue = wrapper.find('[data-slot="select-value"]')
    expect(selectValue.attributes('data-placeholder')).toBe('')
    expect(selectValue.text()).toBe('')
  })

  // FIXED(#12): AutoForm.vue's shape-extraction loop now detects ZodReadonly
  // anywhere in the wrapper stack (via utils.ts's isReadonlyInZodStack) and
  // skips the field entirely, rather than silently unwrapping ZodReadonly
  // like any other wrapper and rendering an editable control.
  it('fixes BUG #12: a top-level .readonly() field is skipped entirely (renders nothing)', async () => {
    const schema = z.object({ id: z.string().readonly(), name: z.string() })
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()
    expect(wrapper.find('input[name="id"]').exists()).toBe(false)
    // sibling fields are unaffected
    expect(wrapper.find('input[name="name"]').exists()).toBe(true)
  })
})
