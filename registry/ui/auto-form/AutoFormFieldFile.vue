<script setup lang="ts">
import type { FieldProps } from './interface'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash } from 'lucide-vue-next'
import { ref } from 'vue'
import AutoFormFieldWrapper from './AutoFormFieldWrapper.vue'

const props = defineProps<FieldProps>()

const inputFile = ref<File>()
async function parseFileAsString(file: File | undefined): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = (err) => {
        reject(err)
      }
      reader.readAsDataURL(file)
    }
  })
}
</script>

<template>
  <AutoFormFieldWrapper v-bind="props">
    <template #default="slotProps">
      <slot v-bind="slotProps">
        <Input
          v-if="!inputFile"
          type="file"
          v-bind="{ ...config?.inputProps }"
          :disabled="config?.inputProps?.disabled ?? disabled"
          @change="async (ev: InputEvent) => {
            const file = (ev.target as HTMLInputElement).files?.[0]
            inputFile = file
            const parsed = await parseFileAsString(file)
            slotProps.componentField.onInput(parsed)
          }"
        />
        <div v-else class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent pl-3 pr-1 py-1 text-sm shadow-sm transition-colors">
          <p>{{ inputFile?.name }}</p>
          <Button
            size="icon"
            variant="ghost"
            class="h-[26px] w-[26px]"
            aria-label="Remove file"
            type="button"
            @click="() => {
              inputFile = undefined
              slotProps.componentField.onInput(undefined)
            }"
          >
            <Trash />
          </Button>
        </div>
      </slot>
    </template>
  </AutoFormFieldWrapper>
</template>
