<script setup lang="ts">
import { ResizablePanel } from '@/components/ui/resizable'
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  id: string
}>()

const { website } = useAppConfig()
const { copied, copy } = useClipboard()

const tabValue = ref('preview')
const resizableRef = ref<InstanceType<typeof ResizablePanel>>()
const iframeURL = computed(() => `/blocks/preview/${props.id}`)
</script>

<template>
  <Tabs
    :id="id"
    v-model="tabValue"
    class="group/block-view-wrapper flex min-w-0 flex-col items-stretch gap-4"
    :style=" { '--height': '500px' }"
  >
    <div class="flex flex-col items-center gap-4 sm:flex-row">
      <div class="hidden items-center gap-2 sm:flex">
        <h3 class="text-sm font-medium">
          {{ id }}
        </h3>

        <div class="mx-2 hidden h-4 md:flex">
          <Separator orientation="vertical" />
        </div>

        <TabsList class="h-7 items-center rounded-md p-0 px-[calc(theme(spacing.1)_-_2px)] py-[theme(spacing.1)]">
          <TabsTrigger class="h-[1.45rem] rounded-sm px-2 text-xs" value="preview">
            Preview
          </TabsTrigger>
          <TabsTrigger class="h-[1.45rem] rounded-sm px-2 text-xs" value="code">
            Code
          </TabsTrigger>
        </TabsList>
      </div>

      <div class="flex items-center gap-2 pr-[14px] sm:ml-auto">
        <Button
          variant="ghost"
          class="hidden md:flex size-7"
          size="icon"
          @click="copy(`npx shadcn-vue@latest add ${website}/r/${id}.json`)"
        >
          <Icon v-if="copied" name="lucide:check" />
          <Icon v-else name="lucide:copy" />
        </Button>

        <div class="mx-2 hidden h-4 md:flex">
          <Separator orientation="vertical" />
        </div>

        <div class="hidden h-7 items-center gap-1.5 rounded-md border p-[2px] shadow-none lg:flex">
          <ToggleGroup
            type="single"
            default-value="100"
            @update:model-value="(value) => {
              resizableRef?.resize(parseInt(value as string))
            }"
          >
            <ToggleGroupItem
              value="100"
              class="h-[22px] w-[22px] rounded-sm p-0"
            >
              <Icon name="lucide:monitor" class="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="60"
              class="h-[22px] w-[22px] rounded-sm p-0"
            >
              <Icon name="lucide:tablet" class="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="30"
              class="h-[22px] w-[22px] rounded-sm p-0"
            >
              <Icon name="lucide:smartphone" class="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <Separator orientation="vertical" class="h-4" />
            <Button
              size="icon"
              variant="ghost"
              class="h-[22px] w-[22px] rounded-sm p-0"
              as-child
              title="Open in New Tab"
            >
              <a :href="iframeURL" target="_blank">
                <span class="sr-only">Open in New Tab</span>
                <Icon name="lucide:fullscreen" class="h-3.5 w-3.5" />
              </a>
            </Button>
          </ToggleGroup>
        </div>
      </div>
    </div>

    <div class="rounded-lg border overflow-hidden h-[var(--height)]">
      <TabsContent
        v-show="tabValue === 'preview'"
        force-mount
        value="preview"
        class="relative after:absolute after:inset-0 after:right-3 after:z-0 after:rounded-lg after:bg-muted  px-0"
      >
        <ResizablePanelGroup id="block-resizable" direction="horizontal" class="relative z-10 bg-background">
          <ResizablePanel
            id="block-resizable-panel-1"
            ref="resizableRef"
            :default-size="100"
            :min-size="30"
            as-child
          >
            <BlockPreview :url="iframeURL" container />
          </ResizablePanel>
          <ResizableHandle id="block-resizable-handle" class="relative hidden w-3 bg-transparent p-0 after:absolute after:right-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-y-1/2 after:translate-x-[-1px] after:rounded-full after:bg-border after:transition-all after:hover:h-10 sm:block" />
          <ResizablePanel id="block-resizable-panel-2" :default-size="0" :min-size="0" />
        </ResizablePanelGroup>
      </TabsContent>
      <TabsContent value="code" class="h-full">
        <BlockViewerCode :id />
      </TabsContent>
    </div>
  </Tabs>
</template>
