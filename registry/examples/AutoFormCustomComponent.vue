<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm, AutoFormFieldWrapper } from '@/registry/ui/auto-form'
import { StarIcon } from '@lucide/vue'
import { defineComponent, h, ref } from 'vue'
import { z } from 'zod'

// A custom field component built on `AutoFormFieldWrapper` (the shared
// label/description/message skeleton). It's mounted in place of the
// built-in field and receives exactly the `FieldProps` shape - fieldName,
// label, required, options, disabled, config - and nothing else. Defined
// with `h()` here (rather than a second SFC) since it only needs to exist
// for this example.
const StarRatingField = defineComponent({
  name: 'StarRatingField',
  props: ['fieldName', 'label', 'required', 'options', 'disabled', 'config'],
  setup(props) {
    return () => h(AutoFormFieldWrapper, { ...props }, {
      // Each star is a real <button>, not a bare clickable SVG: native
      // buttons are focusable and handle Enter/Space for free, and they
      // honor `disabled`. The icon itself is aria-hidden, so the accessible
      // name comes from the button's aria-label rather than the graphic.
      default: (slotProps: any) => h(
        'div',
        { 'class': 'flex gap-1', 'role': 'group', 'aria-label': 'Rating' },
        [1, 2, 3, 4, 5].map((value) => {
          const selected = (slotProps.componentField.modelValue ?? 0) >= value
          return h(
            'button',
            {
              'key': value,
              'type': 'button',
              'disabled': props.disabled,
              'aria-label': `${value} star${value === 1 ? '' : 's'}`,
              'aria-pressed': selected,
              'class': 'rounded-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
              'onClick': () => slotProps.componentField['onUpdate:modelValue'](value),
            },
            h(StarIcon, {
              'aria-hidden': 'true',
              'class': [
                'size-6 transition-colors',
                selected ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground',
              ],
            }),
          )
        }),
      ),
    })
  },
})

const formSchema = z.object({
  productName: z.string(),
  rating: z.number().min(1).max(5),
})

const submittedValues = ref<z.infer<typeof formSchema> | null>(null)

function onSubmit(values: z.infer<typeof formSchema>) {
  submittedValues.value = values
}
</script>

<template>
  <div class="w-full max-w-md space-y-4">
    <AutoForm
      :schema="formSchema"
      :field-config="{
        rating: {
          label: 'Your rating',
          component: StarRatingField,
        },
      }"
      @submit="onSubmit"
    >
      <Button type="submit">
        Submit
      </Button>
    </AutoForm>

    <pre v-if="submittedValues" class="overflow-auto rounded-lg border bg-muted p-4 text-sm">{{ JSON.stringify(submittedValues, null, 2) }}</pre>
  </div>
</template>
