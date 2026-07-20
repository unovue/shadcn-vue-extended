import { toTypedSchema } from '@vee-validate/zod'
import { flushPromises, mount } from '@vue/test-utils'
import { useForm } from 'vee-validate'
import { describe, expect, it } from 'vitest'
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

  // BUG(#4): AutoFormFieldObject's accordion label ONLY ever reads
  // `schema?.description` (the sub-object's own `.describe()`), never
  // `config?.label` from fieldConfig — and it never renders `config?.description`
  // anywhere (no FormDescription for object fields at all, unlike every other
  // field component). So per-field config passed for a nested object is silently
  // ignored in both respects.
  it('pins BUG #4: fieldConfig label/description are ignored for a ZodObject field', async () => {
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
    // The schema's own .describe() wins over fieldConfig.label:
    expect(wrapper.find('[data-slot="accordion-trigger"]').text()).toContain('an address')
    expect(wrapper.text()).not.toContain('Custom Label')
    // fieldConfig.description is dropped entirely — never rendered:
    expect(wrapper.text()).not.toContain('Custom Desc')
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

    // Quirk observed while characterizing this control: removing the LAST
    // item works reliably, but clicking the remove button for a non-last
    // item (e.g. index 0 while 2 items exist) is a no-op — the field list is
    // unchanged. Asserting the reliable (last-item) case here to keep this
    // test deterministic; the non-last-item no-op is not one of this plan's
    // named bugs so it is only noted, not formally pinned.
    const removeButtons = wrapper.findAll('button').filter(b => b.find('svg.lucide-trash').exists())
    expect(removeButtons).toHaveLength(2)
    await removeButtons[removeButtons.length - 1].trigger('click')
    await flushPromises()
    expect(wrapper.findAll('input[type="text"]')).toHaveLength(1)
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
