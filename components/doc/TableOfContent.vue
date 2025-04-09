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
  <div>
    <span class="text-[13px] flex items-center gap-2">On this page</span>

    <div class="relative">
      <ul class="mt-4 space-y-2 border-l relative">
        <div
          class="w-px h-[var(--indicator-size)] top-[var(--indicator-position)] bg-foreground absolute transition-all"
          :style="indicatorStyle"
        />
        <li v-for="item in toc" :key="item.id" class="h-fit flex">
          <a
            :data-indent="item.depth === 3 ? '' : undefined"
            :data-active="activeHeadings.includes(item.id) ? '' : undefined"
            class="text-[13px] data-[indent]:ml-10 data-[active]:text-primary hover:text-primary transition-colors ml-5 h-5 inline-block truncate text-muted-foreground"
            :href="`#${item.id}`"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
