<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/registry/ui/auto-form'
import { ref } from 'vue'
import { z } from 'zod'

const formSchema = z.object({
  projectName: z.string(),
  skills: z.array(z.string()),
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
        skills: {
          component: 'tags',
          description: 'Press enter to add a skill.',
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
