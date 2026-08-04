<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  container?: boolean
  url: string
}>()

const isLoading = ref(true)
</script>

<template>
  <div class="relative bg-background aspect-[4/2.5] h-[var(--height)]">
    <div v-if="isLoading" class="flex items-center justify-center h-full w-full z-10 relative">
      <Icon name="lucide:loader-circle" class="animate-spin" />
    </div>
    <div class="size-full">
      <ClientOnly>
        <iframe
          v-show="!isLoading"
          :src="url"
          class="relative z-20 w-full bg-background size-full"
          @load="isLoading = false"
        />
      </ClientOnly>
    </div>
  </div>
</template>
