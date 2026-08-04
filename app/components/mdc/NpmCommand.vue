<script setup lang="ts">
import type { PackageManager } from '@/composables/useConfig'

const props = defineProps<{
  tabs: Record<PackageManager, string>
}>()

const { packageManager } = useConfig()
</script>

<template>
  <div class="not-prose language-bash mat-well relative mt-6 max-h-[650px] overflow-x-auto rounded-[11px]">
    <Tabs v-model="packageManager" class="gap-0">
      <div class="flex items-center justify-between border-b border-hairline px-1 pt-1 pb-2">
        <TabsList class="h-7 translate-y-[2px] bg-transparent gap-3 p-0 pl-1">
          <TabsTrigger v-for="key in Object.keys(tabs)" :key="key" :value="key" class="rounded-sm">
            {{ key }}
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent v-for="([key, value]) in Object.entries(tabs)" :key="key" :value="key" class="overflow-auto">
        <pre class="language-bash shiki shiki-themes github-light github-dark w-full inline-flex py-4"><code class="px-4"><span class="line"><span>{{ value }}</span></span></code></pre>
      </TabsContent>
    </Tabs>
    <CopyCodeButton class="absolute top-1.5 right-1.5" :code="props.tabs[packageManager]" />
  </div>
</template>
