<script setup lang="ts">
import type { DocsNavGroup } from '@/composables/useDocsNav'

defineProps<{ groups: DocsNavGroup[] }>()

const route = useRoute()
</script>

<template>
  <section v-for="group in groups" :key="group.title" class="mb-5 last:mb-0">
    <h2 class="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
      {{ group.title }}
    </h2>

    <NuxtLink
      v-for="doc in group.children"
      :key="doc.path"
      :to="doc.path"
      class="group flex h-[32px] w-full items-center gap-2 rounded-[9px] px-2.5 transition-colors"
      :class="[
        doc.page === false && 'pointer-events-none opacity-60',
        route.path === doc.path ? 'bg-well' : 'hover:bg-well',
      ]"
    >
      <span
        class="flex-1 truncate text-left text-[13px] transition-colors duration-150"
        :class="route.path === doc.path ? 'text-ink' : 'text-ink-2 group-hover:text-ink'"
      >
        {{ doc.title }}
      </span>

      <span
        v-if="doc.label"
        class="shrink-0 rounded-[4px] bg-accent-soft px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.06em] text-accent-ink"
      >
        {{ doc.label }}
      </span>
    </NuxtLink>
  </section>
</template>
