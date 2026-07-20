<script setup lang="ts">
import type { FieldProps } from './interface'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { computed } from 'vue'
import AutoFormFieldWrapper from './AutoFormFieldWrapper.vue'
import { beautifyObjectName, maybeBooleanishToBoolean } from './utils'

const props = defineProps<FieldProps & {
  options?: string[]
}>()

// Centralize the select-vs-radio choice in one computed `variant` so future
// enum variants (e.g. a multi-select or a toggle group) slot in as another
// branch here instead of scattering `config?.component === 'radio'` checks
// across the template.
type EnumVariant = 'select' | 'radio'
const variant = computed<EnumVariant>(() => props.config?.component === 'radio' ? 'radio' : 'select')
</script>

<template>
  <AutoFormFieldWrapper v-bind="props">
    <template #default="slotProps">
      <slot v-bind="slotProps">
        <RadioGroup v-if="variant === 'radio'" :disabled="maybeBooleanishToBoolean(config?.inputProps?.disabled) ?? disabled" orientation="vertical" v-bind="{ ...slotProps.componentField }">
          <div v-for="(option, index) in options" :key="option" class="mb-2 flex items-center gap-3 space-y-0">
            <RadioGroupItem :id="`${option}-${index}`" :value="option" />
            <Label :for="`${option}-${index}`">{{ beautifyObjectName(option) }}</Label>
          </div>
        </RadioGroup>

        <Select v-else :disabled="maybeBooleanishToBoolean(config?.inputProps?.disabled) ?? disabled" v-bind="{ ...slotProps.componentField }">
          <SelectTrigger class="w-full">
            <SelectValue :placeholder="config?.inputProps?.placeholder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in options" :key="option" :value="option">
              {{ beautifyObjectName(option) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </slot>
    </template>
  </AutoFormFieldWrapper>
</template>
