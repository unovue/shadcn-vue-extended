<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/registry/ui/auto-form'
import { ref } from 'vue'
import { z } from 'zod'

const formSchema = z.object({
  taskStatus: z.union([z.literal('done'), z.literal('todo'), z.literal('partial')]),
})

const submittedValues = ref<z.infer<typeof formSchema> | null>(null)

function onSubmit(values: z.infer<typeof formSchema>) {
  submittedValues.value = values
}
</script>

<template>
  <div class="w-full max-w-md space-y-4">
    <AutoForm
      :schema="formSchema"
      :field-config="{
        taskStatus: {
          component: 'checkbox',
          label: 'Task status (click to cycle done / to do / partial)',
          checkedValue: 'done',
          uncheckedValue: 'todo',
          indeterminateValue: 'partial',
        },
      }"
      @submit="onSubmit"
    >
      <Button type="submit">
        Submit
      </Button>
    </AutoForm>

    <pre v-if="submittedValues" class="overflow-auto rounded-lg border bg-muted p-4 text-sm">{{ JSON.stringify(submittedValues, null, 2) }}</pre>
  </div>
</template>
