<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { MousePointer2 } from 'lucide-vue-next'

const props = defineProps<{
  class?: HTMLAttributes['class']
  color: string
  name: string
}>()
</script>

<template>
  <div :class="cn('pointer-events-none', props.class)">
    <MousePointer2 :color :fill="color" :size="30" />

    <div
      class="mt-1 px-2 py-1 rounded text-xs font-bold text-white text-center"
      :style="{ backgroundColor: color }"
    >
      {{ name }}
    </div>
  </div>
</template>
