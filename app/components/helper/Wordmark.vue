<script setup lang="ts">
withDefaults(defineProps<{ muted?: boolean }>(), { muted: false })
</script>

<template>
  <span class="inline-block whitespace-nowrap tracking-[-0.02em]">
    <span class="font-semibold" :class="muted ? 'text-ink-2' : 'text-ink'">shadcn-vue</span>
    <span class="mx-[2.5px] font-semibold tracking-[0.04em] text-ink-3">[/]</span>
    <span class="font-medium text-ink-3">extended</span>
  </span>
</template>
