<script setup lang="ts">
import type { FieldProps } from './interface'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { computed } from 'vue'
import AutoFormFieldWrapper from './AutoFormFieldWrapper.vue'

const props = defineProps<FieldProps>()
const inputComponent = computed(() => props.config?.component === 'textarea' ? Textarea : Input)
</script>

<template>
  <AutoFormFieldWrapper v-bind="props">
    <template #default="slotProps">
      <slot v-bind="slotProps">
        <component
          :is="inputComponent"
          type="text"
          v-bind="{ ...slotProps.componentField, ...config?.inputProps }"
          :disabled="config?.inputProps?.disabled ?? disabled"
        />
      </slot>
    </template>
  </AutoFormFieldWrapper>
</template>
