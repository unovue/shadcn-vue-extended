<script setup lang="ts">
const { data } = useActivePage()
const { repo } = useAppConfig()
const url = computed(() => `${repo}/blob/main/${data.value?.id}`)
</script>

<template>
  <Button as-child variant="ghost" class="underline mt-8">
    <NuxtLink :to="url" target="_blank">
      <Icon name="lucide:square-pen" />
      Edit this page on GitHub
    </NuxtLink>
  </Button>
</template>
