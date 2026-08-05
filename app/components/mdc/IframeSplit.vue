<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  iframes: string[]
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('not-prose rounded-lg border overflow-hidden w-full h-full flex justify-center min-h-80', props.class)">
    <iframe v-for="iframe in iframes" :key="iframe" class="not-last:border-r w-full h-auto" :src="iframe" />
  </div>
</template>
