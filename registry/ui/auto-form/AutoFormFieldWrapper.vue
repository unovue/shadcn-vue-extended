<script setup lang="ts">
import type { FieldProps } from './interface'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { computed } from 'vue'
import AutoFormLabel from './AutoFormLabel.vue'
import { beautifyObjectName } from './utils'

/**
 * Shared skeleton for the scalar/enum/file AutoForm fields
 * (`AutoFormField{Input,Number,Boolean,Date,Enum,File}.vue`):
 * `FormField > FormItem > (label + control) > FormDescription > FormMessage`.
 *
 * A field component supplies only its control markup via the default slot,
 * which is rendered inside `FormControl` and receives the `FormField`
 * slot props (`componentField`, etc.) — the same object every field used to
 * get from its own local `<FormField v-slot="slotProps">`. This lets a
 * field keep re-exposing its own default slot (`<slot v-bind="slotProps">`)
 * to callers so the "override the control from the parent" contract is
 * unchanged.
 */
const props = defineProps<FieldProps & {
  /**
   * 'default' places the label above the control (Input/Number/Date/Enum/File).
   * 'inline' wraps the control and label together, control first, in a
   * flex row — used by AutoFormFieldBoolean's checkbox/switch layout.
   */
  layout?: 'default' | 'inline'
}>()

const resolvedLabel = computed(() => props.config?.label || beautifyObjectName(props.label ?? props.fieldName))
</script>

<template>
  <FormField v-slot="slotProps" :name="fieldName">
    <FormItem>
      <!--
        No bottom margin: FormItem is a `grid gap-2`, so the gap already
        separates this row from the description and message below. An extra
        margin here made checkbox/switch fields sit looser than every other
        field type.
      -->
      <div v-if="layout === 'inline'" class="flex items-center gap-3">
        <FormControl>
          <slot v-bind="slotProps" />
        </FormControl>
        <AutoFormLabel v-if="!config?.hideLabel" :required="required">
          {{ resolvedLabel }}
        </AutoFormLabel>
      </div>
      <template v-else>
        <AutoFormLabel v-if="!config?.hideLabel" :required="required">
          {{ resolvedLabel }}
        </AutoFormLabel>
        <FormControl>
          <slot v-bind="slotProps" />
        </FormControl>
      </template>

      <FormDescription v-if="config?.description">
        {{ config.description }}
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
