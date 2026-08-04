<script setup lang="ts">
import type { AccordionRootProps } from 'reka-ui'
import { AccordionRoot } from 'reka-ui'

withDefaults(defineProps<{
  type?: AccordionRootProps['type']
}>(), {
  type: 'single',
})
</script>

<template>
  <AccordionRoot :type collapsible class="mat-well not-prose overflow-hidden rounded-[10px]">
    <slot />
  </AccordionRoot>
</template>
