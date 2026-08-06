<script lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
</script>

<script setup lang="ts" generic="T extends number">
import { reactivePick } from '@vueuse/core'
import { Primitive, useForwardProps } from 'reka-ui'
import { cn } from '~/lib/utils'
import TimeslotSegmentItemText from './TimeslotSegmentItemText.vue'

export interface TimeslotSegmentItemProps<T extends number> extends PrimitiveProps {
  class?: HTMLAttributes['class']
  value: T
  readonly?: boolean
  selected?: boolean
}

export interface TimeslotSegmentItemEmits {
  (type: 'select', target: HTMLElement): void
}

const props = withDefaults(defineProps<TimeslotSegmentItemProps<T>>(), {
  readonly: false,
  selected: false,
})

const emit = defineEmits<TimeslotSegmentItemEmits>()
const delegatedProps = reactivePick(props, 'as', 'asChild')
const forwardProps = useForwardProps(delegatedProps)

const root = useTemplateRef('root')

function onButtonClick() {
  const target = root.value?.$el
  if (target instanceof HTMLElement) {
    emit('select', target)
  }
}
</script>

<template>
  <Primitive
    ref="root"
    data-timeslot-segment-item
    data-slot="timeslot-segment-item"
    :data-value="value"
    v-bind="forwardProps"
    :class="cn(
      'flex items-center justify-center first:justify-end last:justify-start first:last:justify-center',
      props.class,
    )"
  >
    <Primitive
      as="button"
      role="button"
      class="snap snap-center snap-normal text-center font-normal cursor-pointer transition-[color,opacity] text-muted-foreground hover:text-foreground data-[selected=true]:text-foreground data-[readonly=true]:opacity-25 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 rounded-md outline-none"
      :data-selected="props.selected"
      :data-readonly="props.readonly"
      @click="onButtonClick"
    >
      <slot v-bind="{ value }">
        <TimeslotSegmentItemText
          :value="value"
        />
      </slot>
    </Primitive>
  </Primitive>
</template>

<style scoped>
@reference "tailwindcss";

@layer components {
  [data-timeslot-segment-item] {
    @apply flex-col;

    &:first-child, &:last-child {
      @apply min-h-[calc(50%+2rem)]!;
    }

    &:first-child:last-child {
      @apply justify-center min-w-auto! min-h-full!;
    }

    &[data-day-period]:before {
      @apply inline-block snap-align-none text-xs lowercase;
      content: attr(data-day-period);
    }

    &>button {
      @apply mx-1 my-0 min-w-20 min-h-14;
    }

    &[data-day-period]:before {
      @apply mx-0 mt-4;
    }

    &[data-day-period="AM"], &[data-day-period="PM"] {
      & ~ &:before {
        @apply hidden;
      }
    }
  }
}
</style>
