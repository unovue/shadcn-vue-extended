<script setup lang="ts">
import type { PackageManager } from '@/composables/useConfig'
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  tabs: Record<PackageManager, string>
}>()

const { packageManager } = useConfig()
const { copied, copy } = useClipboard()

function handleCopy() {
  copy(props.tabs[packageManager.value])
}
</script>

<template>
  <div class="not-prose language-bash relative mt-6 max-h-[650px] overflow-x-auto rounded-xl bg-accent/40 border">
    <Tabs v-model="packageManager" class="gap-0">
      <div class="flex items-center justify-between border-b px-1 pt-1 pb-2">
        <TabsList class="h-7 translate-y-[2px] bg-transparent gap-3 p-0 pl-1">
          <TabsTrigger v-for="key in Object.keys(tabs)" :key="key" :value="key">
            {{ key }}
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent v-for="([key, value]) in Object.entries(tabs)" :key="key" :value="key" class="p-4">
        <pre class="language-bash shiki shiki-themes github-light github-dark"><code><span class="line"><span>{{ value }}</span></span></code></pre>
      </TabsContent>
    </Tabs>
    <Button
      size="icon"
      variant="ghost"
      class="absolute right-2 top-2 z-10 h-6 w-6 [&_svg]:h-3 [&_svg]:w-3"
      @click="handleCopy"
    >
      <span class="sr-only">Copy</span>
      <Icon v-if="copied" name="lucide:check" /><Icon v-else name="lucide:clipboard" />
    </Button>
  </div>
</template>
