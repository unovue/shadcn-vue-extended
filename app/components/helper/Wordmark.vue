<script setup lang="ts">
withDefaults(defineProps<{ muted?: boolean }>(), { muted: false })
</script>

<template>
  <span class="inline-block whitespace-nowrap tracking-[-0.02em]">
    <span class="font-semibold text-ink-3">shadcn-vue</span>
    <span class="mx-[2.5px] font-semibold tracking-[0.04em] text-ink">/</span>
    <span class="font-medium text-ink">extended</span>
  </span>
</template>
