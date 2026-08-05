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
  <div class="not-prose my-4">
    <Tabs default-value="preview">
      <TabsList>
        <TabsTrigger value="preview">
          Preview
        </TabsTrigger>
        <TabsTrigger value="code">
          Code
        </TabsTrigger>
      </TabsList>

      <!--
        A stage of its own: `--preview` is a third surface, distinct from both
        the bezel behind the panel and the panel the docs sit on, so a demo
        reads as a separate thing rather than dissolving into the page.
      -->
      <div class="rounded-[12px] border bg-preview p-8">
        <TabsContent value="preview" class="min-h-60 flex items-center justify-center">
          <Suspense>
            <component :is="componentName" />

            <template #fallback>
              <Icon name="lucide:loader-circle" class="animate-spin" />
            </template>
          </Suspense>
        </TabsContent>
        <!--
          Not `prose`: this sits under `.not-prose`, and every prose rule
          excludes `.not-prose *`, so that class is inert here. The code block
          gets its own styling instead.
        -->
        <TabsContent value="code" class="preview-code relative">
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
