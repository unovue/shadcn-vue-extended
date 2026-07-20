<script setup lang="ts">
import type { FieldProps } from './interface'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { computed } from 'vue'
import AutoFormFieldWrapper from './AutoFormFieldWrapper.vue'

const props = defineProps<FieldProps>()
const inputComponent = computed(() => props.config?.component === 'textarea' ? Textarea : Input)
// Phase 4D: opt-in icon decoration, see ConfigItem.icon in interface.ts.
const iconPosition = computed(() => props.config?.icon?.position ?? 'left')
</script>

<template>
  <AutoFormFieldWrapper v-bind="props">
    <template #default="slotProps">
      <slot v-bind="slotProps">
        <div v-if="config?.icon" class="relative">
          <component
            :is="config.icon.component"
            class="absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            :class="iconPosition === 'right' ? 'right-3' : 'left-3'"
          />
          <component
            :is="inputComponent"
            type="text"
            v-bind="{ ...slotProps.componentField, ...config?.inputProps }"
            :class="iconPosition === 'right' ? 'pr-9' : 'pl-9'"
            :disabled="config?.inputProps?.disabled ?? disabled"
          />
        </div>
        <component
          :is="inputComponent"
          v-else
          type="text"
          v-bind="{ ...slotProps.componentField, ...config?.inputProps }"
          :disabled="config?.inputProps?.disabled ?? disabled"
        />
      </slot>
    </template>
  </AutoFormFieldWrapper>
</template>
