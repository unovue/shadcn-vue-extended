<script setup lang="ts">
const { data } = useActivePage()
const { repo } = useAppConfig()
const url = computed(() => `${repo}/blob/main/${data.value?.id}`)
</script>

<template>
  <NuxtLink
    :to="url"
    target="_blank"
    class="mat-cap press mt-10 inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2.5 text-[11.5px] font-medium text-ink-2 transition-colors hover:text-ink"
  >
    <Icon name="lucide:square-pen" class="size-3" />
    Edit this page on GitHub
  </NuxtLink>
</template>
