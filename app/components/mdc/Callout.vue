<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface CalloutProps {
  icon?: string
  title?: string
  class?: HTMLAttributes['class']
}

const props = defineProps<CalloutProps>()
</script>

<template>
  <Alert :class="cn('mat-well my-6 rounded-[10px] border-none text-ink-2', props.class)">
    <span v-if="icon" classs="mr-4 text-2xl">{{ icon }}</span>
    <AlertTitle v-if="title">
      {{ title }}
    </AlertTitle>
    <AlertDescription>
      <slot />
    </AlertDescription>
  </Alert>
</template>
