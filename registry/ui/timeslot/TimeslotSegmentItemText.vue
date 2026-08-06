<script lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
</script>

<script setup lang="ts">
import { Primitive } from 'reka-ui'
import { cn } from '~/lib/utils'

export interface TimeslotSegmentItemTextProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
  value: number
}

const props = defineProps<TimeslotSegmentItemTextProps>()

const formattedText = computed(() => {
  return props.value.toString().slice(-2).padStart(2, '0')
})
</script>

<template>
  <Primitive
    as="span"
    :class="cn(
      'text-xl whitespace-nowrap',
      props.class,
    )"
  >
    {{ formattedText }}
  </Primitive>
</template>
