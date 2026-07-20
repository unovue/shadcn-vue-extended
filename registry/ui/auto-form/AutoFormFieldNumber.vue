<script setup lang="ts">
import type { FieldProps } from './interface'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import AutoFormLabel from './AutoFormLabel.vue'
import { beautifyObjectName } from './utils'

defineOptions({
  inheritAttrs: false,
})

defineProps<FieldProps>()

/**
 * DOM `<input type="number">` elements always emit strings via
 * `update:modelValue`/`input`, so binding `componentField` directly would
 * write a string into the (numeric) form model. Coerce to a number here,
 * mapping an empty string to `undefined` so clearing the field doesn't
 * submit `NaN`.
 */
function toComponentField(componentField: Record<string, any>) {
  return {
    ...componentField,
    'onUpdate:modelValue': (value: unknown) => {
      if (value === '' || value === null || value === undefined) {
        componentField['onUpdate:modelValue']?.(undefined)
        return
      }
      const parsed = Number.parseFloat(value as string)
      componentField['onUpdate:modelValue']?.(Number.isNaN(parsed) ? undefined : parsed)
    },
  }
}
</script>

<template>
  <FormField v-slot="slotProps" :name="fieldName">
    <FormItem>
      <AutoFormLabel v-if="!config?.hideLabel" :required="required">
        {{ config?.label || beautifyObjectName(label ?? fieldName) }}
      </AutoFormLabel>
      <FormControl>
        <slot v-bind="slotProps">
          <Input type="number" v-bind="{ ...toComponentField(slotProps.componentField), ...config?.inputProps }" :disabled="config?.inputProps?.disabled ?? disabled" />
        </slot>
      </FormControl>
      <FormDescription v-if="config?.description">
        {{ config.description }}
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
