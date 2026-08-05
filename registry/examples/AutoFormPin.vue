<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ref } from 'vue'
import { z } from 'zod'
import { AutoForm } from '~~/registry/ui/auto-form'

const formSchema = z.object({
  otp: z.string().length(6),
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
        otp: {
          component: 'pin',
          label: 'One-time password',
          description: 'Enter the 6-digit code sent to your device.',
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
