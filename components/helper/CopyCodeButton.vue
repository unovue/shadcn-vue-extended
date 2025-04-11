<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { useClipboard } from '@vueuse/core'
import { toRefs } from 'vue'

const props = withDefaults(defineProps<{
  code?: string
  class?: HTMLAttributes['class']
}>(), {
  code: '',
})
const { code } = toRefs(props)

const { copy, copied } = useClipboard({ source: code })
</script>

<template>
  <Tooltip :delay-duration="100">
    <TooltipTrigger as-child>
      <Button
        size="icon"
        variant="ghost"
        :class="cn('size-7 [&_svg]:size-3.5', props.class)"
        @click="copy()"
      >
        <span class="sr-only">Copy</span>
        <Icon v-if="copied" name="lucide:check" />
        <Icon v-else name="lucide:clipboard" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Copy code</TooltipContent>
  </Tooltip>
</template>
