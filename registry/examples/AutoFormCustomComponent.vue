<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm, AutoFormFieldWrapper } from '@/registry/ui/auto-form'
import { StarIcon } from 'lucide-vue-next'
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
      default: (slotProps: any) => h(
        'div',
        { class: 'flex gap-1' },
        [1, 2, 3, 4, 5].map(value => h(StarIcon, {
          key: value,
          class: [
            'size-6 cursor-pointer transition-colors',
            (slotProps.componentField.modelValue ?? 0) >= value
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground',
          ],
          onClick: () => slotProps.componentField['onUpdate:modelValue'](value),
        })),
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
