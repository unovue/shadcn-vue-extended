<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

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
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.title">
        <BreadcrumbItem class="capitalize" :class="{ 'text-foreground': index === breadcrumbs.length - 1 }">
          {{ breadcrumb.title }}
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index !== breadcrumbs.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
