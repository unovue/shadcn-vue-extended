<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

defineProps<{
  path: string
  componentName: string
}>()

const { copy, copied } = useClipboard()
const codeContentRef = ref<HTMLDivElement>()
function handleCopy() {
  copy(codeContentRef.value?.textContent ?? '')
}
</script>

<template>
  <div class="not-prose ">
    <Tabs default-value="preview">
      <TabsList>
        <TabsTrigger value="preview">
          Preview
        </TabsTrigger>
        <TabsTrigger value="code">
          Code
        </TabsTrigger>
      </TabsList>

      <div class="rounded-lg border p-4 bg-accent/50">
        <TabsContent value="preview" class="min-h-60 flex items-center justify-center">
          <Suspense>
            <component :is="componentName" />

            <template #fallback>
              <Icon name="lucide:loader-circle" class="animate-spin" />
            </template>
          </Suspense>
        </TabsContent>
        <TabsContent value="code" class="prose relative">
          <Button variant="ghost" :class="{ copied }" class="absolute top-0 right-0" @click="handleCopy">
            <Icon :name="copied ? 'lucide:check' : 'lucide:clipboard'" />
          </Button>

          <div ref="codeContentRef">
            <slot name="code" />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  </div>
</template>
