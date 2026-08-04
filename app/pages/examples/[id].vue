<script setup lang="ts">
const route = useRoute()

definePageMeta({
  layout: 'blank',
})

const component = defineAsyncComponent(() => import(`~~/registry/examples/${route.params.id}.vue`))
</script>

<template>
  <div class="relative flex min-h-screen w-full items-center justify-center bg-accent/50">
    <component :is="component" />
  </div>
</template>
