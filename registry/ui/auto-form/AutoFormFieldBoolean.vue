<script setup lang="ts">
import type { FieldProps } from './interface'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { computed } from 'vue'
import AutoFormFieldWrapper from './AutoFormFieldWrapper.vue'
import { maybeBooleanishToBoolean } from './utils'

const props = defineProps<FieldProps>()

const booleanComponent = computed(() => props.config?.component === 'switch' ? Switch : Checkbox)

// Phase 4C (#6): the `checkbox` variant supports opt-in
// checkedValue/uncheckedValue/indeterminateValue. The `switch` variant is
// always a plain boolean and ignores all of this.
const isCheckbox = computed(() => booleanComponent.value === Checkbox)
const checkedValue = computed(() => props.config?.checkedValue ?? true)
const uncheckedValue = computed(() => props.config?.uncheckedValue ?? false)
const indeterminateEnabled = computed(() => props.config?.indeterminateValue !== undefined)

// reka-ui's CheckboxRoot only renders the indeterminate visual state for the
// literal string 'indeterminate' (see its `isIndeterminate`/`getState`
// helpers) — it has no concept of a caller-defined `indeterminateValue`. So
// the field's real (form) value and the primitive's own tri-state model are
// two different things, and this bridges between them: map the field value
// to the primitive's boolean | 'indeterminate' model for display...
function toPrimitiveState(fieldValue: unknown): boolean | 'indeterminate' {
  if (indeterminateEnabled.value && fieldValue === props.config?.indeterminateValue)
    return 'indeterminate'
  return fieldValue === checkedValue.value
}

// ...and compute the next field value ourselves on click, rather than
// trust whatever CheckboxRoot's own 2-state toggle emits (it has no native
// concept of cycling through a 3rd, indeterminate state — see
// CheckboxRoot's handleClick, which only ever flips its boolean/'indeterminate'
// model to `true`). Cycle: checkedValue -> uncheckedValue -> (if enabled)
// indeterminateValue -> checkedValue ...
function nextValue(fieldValue: unknown): unknown {
  if (fieldValue === checkedValue.value)
    return uncheckedValue.value
  if (indeterminateEnabled.value && fieldValue === uncheckedValue.value)
    return props.config?.indeterminateValue
  return checkedValue.value
}
</script>

<template>
  <AutoFormFieldWrapper v-bind="props" layout="inline">
    <template #default="slotProps">
      <slot v-bind="slotProps">
        <component
          :is="booleanComponent"
          :disabled="maybeBooleanishToBoolean(config?.inputProps?.disabled) ?? disabled"
          :name="slotProps.componentField.name"
          :model-value="isCheckbox ? toPrimitiveState(slotProps.componentField.modelValue) : slotProps.componentField.modelValue"
          @update:model-value="isCheckbox
            ? slotProps.componentField['onUpdate:modelValue'](nextValue(slotProps.componentField.modelValue))
            : slotProps.componentField['onUpdate:modelValue']($event)"
        />
      </slot>
    </template>
  </AutoFormFieldWrapper>
</template>
