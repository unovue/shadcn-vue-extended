<script setup lang="ts">
import type { FieldProps } from './interface'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { computed } from 'vue'
import AutoFormFieldWrapper from './AutoFormFieldWrapper.vue'
import { maybeBooleanishToBoolean } from './utils'

const props = defineProps<FieldProps>()

const booleanComponent = computed(() => props.config?.component === 'switch' ? Switch : Checkbox)
</script>

<template>
  <AutoFormFieldWrapper v-bind="props" layout="inline">
    <template #default="slotProps">
      <slot v-bind="slotProps">
        <component
          :is="booleanComponent"
          :disabled="maybeBooleanishToBoolean(config?.inputProps?.disabled) ?? disabled"
          :name="slotProps.componentField.name"
          :model-value="slotProps.componentField.modelValue"
          @update:model-value="slotProps.componentField['onUpdate:modelValue']"
        />
      </slot>
    </template>
  </AutoFormFieldWrapper>
</template>
