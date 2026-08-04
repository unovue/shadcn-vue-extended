<script setup lang="ts">
import type { FieldProps } from './interface'
import { PinInput, PinInputGroup, PinInputSlot } from '@/components/ui/pin-input'
import { computed } from 'vue'
import AutoFormFieldWrapper from './AutoFormFieldWrapper.vue'

const props = defineProps<FieldProps>()

/**
 * Number of pin slots to render. `AutoFormField.vue` only forwards the Zod
 * `schema` prop for `ZodObject`/`ZodArray` shapes, so a `ZodString` field's
 * schema (and any `.length()` check on it) isn't reachable here without
 * editing that (out-of-scope, shared) dispatcher. Default to 6 digits and
 * let consumers override via `config.inputProps.maxlength`, matching the
 * existing `inputProps` escape hatch used by every other field.
 */
const digits = computed(() => {
  const configured = Number(props.config?.inputProps?.maxlength)
  return Number.isFinite(configured) && configured > 0 ? configured : 6
})

/** The form model is a plain string; PinInputRoot's model is `string[]`. */
function toPinValue(modelValue: unknown): string[] {
  return typeof modelValue === 'string' ? modelValue.split('') : []
}

function fromPinValue(value: string[]): string {
  return value.join('')
}
</script>

<template>
  <AutoFormFieldWrapper v-bind="props">
    <template #default="slotProps">
      <slot v-bind="slotProps">
        <PinInput
          :name="slotProps.componentField.name"
          :model-value="toPinValue(slotProps.componentField.modelValue)"
          :disabled="config?.inputProps?.disabled ?? disabled"
          @update:model-value="(value: string[]) => slotProps.componentField['onUpdate:modelValue'](fromPinValue(value))"
        >
          <PinInputGroup>
            <PinInputSlot v-for="index in digits" :key="index" :index="index - 1" />
          </PinInputGroup>
        </PinInput>
      </slot>
    </template>
  </AutoFormFieldWrapper>
</template>
