<script setup lang="ts">
const route = useRoute()

definePageMeta({
  layout: 'blank',
})

const component = defineAsyncComponent(() => import(`@/registry/blocks/${route.params.id}/index.vue`))
</script>

<template>
  <div class="relative flex min-h-screen w-full items-center justify-center">
    <component :is="component" />
  </div>
</template>
