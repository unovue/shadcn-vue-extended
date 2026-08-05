<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const nuxtApp = useNuxtApp()
const { data } = useActivePage()
const { activeHeadings, updateHeadings } = useScrollspy()

function flatten(links: TocLink[]): TocLink[] {
  return links.flatMap(link => [link, ...(link.children ? flatten(link.children as TocLink[]) : [])])
}

const toc = computed(() => {
  const result = flatten(data.value?.body.toc?.links ?? [])
  return result
})

const indicatorStyle = computed(() => {
  if (!activeHeadings.value?.length) {
    return
  }

  const activeIndex = toc.value.findIndex(link => activeHeadings.value.includes(link.id))
  const linkHeight = 28
  const offset = 4

  return {
    '--indicator-size': `${(linkHeight * activeHeadings.value.length)}px`,
    '--indicator-position': activeIndex >= 0 ? `${(activeIndex * linkHeight) - offset}px` : '0px',
  }
})

nuxtApp.hooks.hookOnce('page:finish', () => {
  updateHeadings([
    ...document.querySelectorAll('h2'),
    ...document.querySelectorAll('h3'),
  ])
})
</script>

<template>
  <div v-if="toc.length">
    <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">On this page</span>

    <div class="relative">
      <ul class="relative mt-3.5 space-y-2 border-l border-hairline">
        <div
          class="absolute w-px h-[var(--indicator-size)] top-[var(--indicator-position)] bg-ink transition-all motion-reduce:transition-none"
          :style="indicatorStyle"
        />
        <li v-for="item in toc" :key="item.id" class="flex h-fit">
          <a
            :data-indent="item.depth === 3 ? '' : undefined"
            :data-active="activeHeadings.includes(item.id) ? '' : undefined"
            class="ml-4 inline-block h-5 truncate text-[12.5px] text-ink-3 transition-colors hover:text-ink data-[active]:text-ink data-[indent]:ml-8"
            :href="`#${item.id}`"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
