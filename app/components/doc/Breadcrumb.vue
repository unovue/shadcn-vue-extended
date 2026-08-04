<script setup lang="ts">
const route = useRoute()

function convertPathToTitleArray(path: string): Array<{ title: string }> {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  if (!cleanPath) {
    return []
  }

  const segments = cleanPath.split('/').filter(segment => segment.length > 0)
  const segmentsWithoutLast = segments.slice(0, -1)
  return segmentsWithoutLast.map((segment) => {
    const formattedTitle = segment
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())

    return { title: formattedTitle }
  })
}

const breadcrumbs = computed(() => convertPathToTitleArray(route.path))
</script>

<template>
  <nav aria-label="Breadcrumb" class="flex min-w-0 items-center gap-1.5 text-[12px]">
    <template v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.title">
      <span
        class="truncate capitalize"
        :class="index === breadcrumbs.length - 1 ? 'text-ink-2' : 'text-ink-3'"
      >
        {{ breadcrumb.title }}
      </span>
      <span v-if="index !== breadcrumbs.length - 1" class="shrink-0 text-ink-3" aria-hidden="true">/</span>
    </template>
  </nav>
</template>
