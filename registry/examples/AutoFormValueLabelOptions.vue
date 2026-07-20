<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/registry/ui/auto-form'
import { ref } from 'vue'
import { z } from 'zod'

const formSchema = z.object({
  plan: z.enum(['free', 'pro', 'enterprise']),
  contactMethod: z.enum(['email', 'sms']),
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
        plan: {
          label: 'Choose a plan',
          options: [
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro ($10/mo)' },
            { value: 'enterprise', label: 'Enterprise (contact us)' },
          ],
        },
        contactMethod: {
          component: 'radio',
          label: 'How should we contact you?',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'Text message' },
          ],
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
