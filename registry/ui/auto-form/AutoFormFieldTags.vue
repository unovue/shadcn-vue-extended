<script setup lang="ts">
import type { FieldProps } from './interface'
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/components/ui/tags-input'
import AutoFormFieldWrapper from './AutoFormFieldWrapper.vue'

const props = defineProps<FieldProps>()
</script>

<template>
  <AutoFormFieldWrapper v-bind="props">
    <template #default="slotProps">
      <slot v-bind="slotProps">
        <TagsInput
          v-slot="{ modelValue: tags }"
          data-slot="tags-input"
          :name="slotProps.componentField.name"
          :model-value="slotProps.componentField.modelValue"
          :disabled="config?.inputProps?.disabled ?? disabled"
          @update:model-value="slotProps.componentField['onUpdate:modelValue']"
        >
          <TagsInputItem v-for="item in tags" :key="item" data-slot="tags-input-item" :value="item">
            <TagsInputItemText data-slot="tags-input-item-text" />
            <TagsInputItemDelete />
          </TagsInputItem>
          <TagsInputInput v-bind="config?.inputProps" />
        </TagsInput>
      </slot>
    </template>
  </AutoFormFieldWrapper>
</template>
