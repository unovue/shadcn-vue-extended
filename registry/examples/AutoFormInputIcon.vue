<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/registry/ui/auto-form'
import { MailIcon, SearchIcon } from '@lucide/vue'
import { ref } from 'vue'
import { z } from 'zod'

const formSchema = z.object({
  email: z.string().email(),
  query: z.string(),
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
        email: {
          icon: { component: MailIcon },
        },
        query: {
          icon: { component: SearchIcon, position: 'right' },
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
