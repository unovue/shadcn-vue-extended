<script setup lang="ts">
import { AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from 'reka-ui'

defineProps<{
  title?: string
  id?: string
}>()
</script>

<template>
  <AccordionItem :value="id || title || ''" data-slot="accordion-item" class="border-b last:border-b-0 bg-accent/50">
    <AccordionHeader class="flex" as="div">
      <AccordionTrigger data-slot="accordion-trigger" class="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-90">
        <slot name="icon">
          <Icon
            name="lucide:chevron-right"
            class="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 ml-4"
          />
        </slot>
        <h3>
          <slot name="header" mdc-unwrap="p">
            <div class="flex-1">
              {{ title }}
            </div>
          </slot>
        </h3>
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent
      data-slot="accordion-content"
      class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
    >
      <div class="prose pt-0 p-4">
        <slot />
      </div>
    </AccordionContent>
  </AccordionItem>
</template>
