import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { z } from 'zod'
import { AutoForm, AutoFormFieldWrapper } from '..'

describe('custom-component contract (config.component)', () => {
  // 3.2: a custom component dropped in via `config.component` must receive
  // exactly the documented FieldProps — AutoFormField.vue binds fieldName,
  // label, required, options, disabled, and config (see interface.ts's
  // ConfigItem.component JSDoc). Verify with a stub that records every prop
  // it's mounted with.
  it('receives fieldName, label, required, options, disabled, and config', async () => {
    const received: Record<string, unknown>[] = []
    const StubComponent = defineComponent({
      props: ['fieldName', 'label', 'required', 'options', 'disabled', 'config'],
      setup(props) {
        received.push({ ...props })
        return () => h('div', { 'data-testid': 'stub' })
      },
    })

    const schema = z.object({ color: z.enum(['red', 'green']) })
    const wrapper = mount(AutoForm as any, {
      props: {
        schema,
        fieldConfig: {
          color: {
            component: StubComponent,
            label: 'Favorite color',
            description: 'pick one',
          },
        },
      },
    })
    await flushPromises()

    expect(wrapper.find('[data-testid="stub"]').exists()).toBe(true)
    expect(received).toHaveLength(1)

    const props = received[0]
    expect(props.fieldName).toBe('color')
    expect(props.required).toBe(true)
    expect(props.disabled).toBeFalsy()
    expect(props.options).toEqual(['red', 'green'])
    expect(props.config).toMatchObject({
      component: StubComponent,
      label: 'Favorite color',
      description: 'pick one',
    })
  })
})

describe('autoFormFieldWrapper (shared skeleton for custom fields)', () => {
  // 3.2: AutoFormFieldWrapper is exported so a custom `config.component` can
  // reuse the label/description/message skeleton instead of reimplementing
  // it. Mount a minimal custom field built on top of the wrapper and check
  // it renders that skeleton and binds its control via the wrapper's
  // slotProps (the vee-validate FormField slot props).
  const CustomField = defineComponent({
    props: ['fieldName', 'label', 'required', 'options', 'disabled', 'config'],
    components: { AutoFormFieldWrapper },
    template: `
      <AutoFormFieldWrapper v-bind="$props">
        <template #default="slotProps">
          <input data-testid="custom-input" type="text" v-bind="slotProps.componentField" />
        </template>
      </AutoFormFieldWrapper>
    `,
  })

  it('renders the label + description skeleton and binds the control via slotProps', async () => {
    const wrapper = mount(CustomField, {
      props: {
        fieldName: 'nickname',
        required: true,
        config: { label: 'Nickname', description: 'Shown to other users' },
      },
    })
    await flushPromises()

    // Skeleton: FormItem > label (with required marker) > control > description.
    expect(wrapper.find('[data-slot="form-item"]').exists()).toBe(true)
    expect(wrapper.find('label').text()).toContain('Nickname')
    expect(wrapper.find('label').text()).toContain('*')
    expect(wrapper.find('[data-slot="form-description"]').text()).toBe('Shown to other users')

    // Control: bound via the wrapper's slotProps (componentField), same as
    // every built-in field's `v-bind="slotProps.componentField"`.
    const input = wrapper.find('[data-testid="custom-input"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('name')).toBe('nickname')

    await input.setValue('Ada')
    await flushPromises()
    expect((input.element as HTMLInputElement).value).toBe('Ada')
  })

  it('honors config.hideLabel to hide the label', async () => {
    const wrapper = mount(CustomField, {
      props: {
        fieldName: 'nickname',
        config: { hideLabel: true },
      },
    })
    await flushPromises()
    expect(wrapper.find('label').exists()).toBe(false)
  })
})
