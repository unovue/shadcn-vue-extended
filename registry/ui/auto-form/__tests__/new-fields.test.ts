import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { AutoForm } from '..'

describe('d1: tags field (config.component "tags")', () => {
  it('array-of-string WITHOUT config still renders the classic AutoFormFieldArray accordion', async () => {
    const schema = z.object({ labels: z.array(z.string()) })
    const wrapper = mount(AutoForm as any, { props: { schema } })
    await flushPromises()

    expect(wrapper.find('[data-slot="accordion-trigger"]').exists()).toBe(true)
    expect(wrapper.find('[data-slot="tags-input"]').exists()).toBe(false)
  })

  it('array-of-string with config.component "tags" renders the tags input instead of the accordion', async () => {
    const schema = z.object({ labels: z.array(z.string()) })
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { labels: { component: 'tags' } } },
    })
    await flushPromises()

    expect(wrapper.find('[data-slot="tags-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-slot="accordion-trigger"]').exists()).toBe(false)
  })

  it('adding two tags submits them as ["a", "b"]', async () => {
    const schema = z.object({ labels: z.array(z.string()) })
    const onSubmit = vi.fn()
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { labels: { component: 'tags' } } },
      attrs: { onSubmit },
    })
    await flushPromises()

    const input = wrapper.find('[data-slot="tags-input"] input')
    expect(input.exists()).toBe(true)

    await input.setValue('a')
    await input.trigger('keydown', { key: 'Enter' })
    await flushPromises()
    await input.setValue('b')
    await input.trigger('keydown', { key: 'Enter' })
    await flushPromises()

    expect(wrapper.findAll('[data-slot="tags-input-item-text"]').map(t => t.text())).toEqual(['a', 'b'])

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 20))
    await flushPromises()

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0][0] as { labels: string[] }
    expect(payload.labels).toEqual(['a', 'b'])
  })
})

describe('d2: pin field (config.component "pin")', () => {
  it('renders 6 pin slots by default', async () => {
    const schema = z.object({ otp: z.string() })
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { otp: { component: 'pin' } } },
    })
    await flushPromises()

    expect(wrapper.findAll('[data-slot="pin-input-slot"]')).toHaveLength(6)
  })

  it('renders N pin slots honoring config.inputProps.maxlength', async () => {
    const schema = z.object({ otp: z.string() })
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { otp: { component: 'pin', inputProps: { maxlength: 4 } } } },
    })
    await flushPromises()

    expect(wrapper.findAll('[data-slot="pin-input-slot"]')).toHaveLength(4)
  })

  it('entering digits submits the joined string', async () => {
    const schema = z.object({ otp: z.string() })
    const onSubmit = vi.fn()
    const wrapper = mount(AutoForm as any, {
      props: { schema, fieldConfig: { otp: { component: 'pin', inputProps: { maxlength: 4 } } } },
      attrs: { onSubmit },
    })
    await flushPromises()

    const slots = wrapper.findAll('[data-slot="pin-input-slot"]')
    expect(slots).toHaveLength(4)

    const digits = ['1', '2', '3', '4']
    for (let i = 0; i < slots.length; i++) {
      await slots[i].setValue(digits[i])
      await flushPromises()
    }

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 20))
    await flushPromises()

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0][0] as { otp: string }
    expect(payload.otp).toBe('1234')
    expect(typeof payload.otp).toBe('string')
  })
})
