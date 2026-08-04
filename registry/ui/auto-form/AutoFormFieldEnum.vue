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

// Phase 4C (#9): `config.options` (explicit value/label pairs) takes
// precedence over the schema-derived `options` (plain strings, where the
// string is both value and beautified label). Normalizing to one shape here
// keeps both the select and radio branches option-shape-agnostic below.
const normalizedOptions = computed(() => {
  if (props.config?.options)
    return props.config.options
  return (props.options ?? []).map(option => ({ value: option, label: beautifyObjectName(option) }))
})
</script>

<template>
  <AutoFormFieldWrapper v-bind="props">
    <template #default="slotProps">
      <slot v-bind="slotProps">
        <RadioGroup v-if="variant === 'radio'" :disabled="maybeBooleanishToBoolean(config?.inputProps?.disabled) ?? disabled" orientation="vertical" v-bind="{ ...slotProps.componentField }">
          <!--
            The id is scoped by `fieldName`: option values are not unique across
            a form, so two radio-variant enum fields sharing an option (e.g. two
            `z.enum(['yes', 'no'])` fields) would otherwise emit duplicate DOM
            ids and every <Label for> would target the first field's input.
          -->
          <div v-for="(option, index) in normalizedOptions" :key="option.value" class="mb-2 flex items-center gap-3 space-y-0">
            <RadioGroupItem :id="`${fieldName}-${option.value}-${index}`" :value="option.value" />
            <Label :for="`${fieldName}-${option.value}-${index}`">{{ option.label }}</Label>
          </div>
        </RadioGroup>

        <Select v-else :disabled="maybeBooleanishToBoolean(config?.inputProps?.disabled) ?? disabled" v-bind="{ ...slotProps.componentField }">
          <SelectTrigger class="w-full">
            <SelectValue :placeholder="config?.inputProps?.placeholder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in normalizedOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </slot>
    </template>
  </AutoFormFieldWrapper>
</template>
