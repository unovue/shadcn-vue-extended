<script setup lang="ts">
import { cn } from '@/lib/utils'
import { TreeItem, TreeRoot } from 'reka-ui'

const props = defineProps<{
  id: string
  inContainer?: boolean
}>()

const activeFile = ref<FileTreeWithParent>()
const expandedKeys = ref<string[]>([])

const { data, flattenData } = useFileTree(props.id)

const activeFileLang = computed(() => activeFile.value?.name.substr(activeFile.value?.name.lastIndexOf('.') + 1))

watch(data, () => {
  activeFile.value = flattenData.value.find(d => d.content)
  if (activeFile.value)
    expandedKeys.value = activeFile.value.parents ?? []
}, { immediate: true })
</script>

<template>
  <div :class="cn('flex h-full text-foreground group-data-[view=preview]/block-view-wrapper:hidden', props.inContainer ? '' : 'overflow-hidden border rounded-lg my-4 not-prose h-120')">
    <div :class="cn('w-70', props.inContainer ? '' : 'w-56')">
      <div class="min-h-full w-full flex flex-col">
        <div class="flex h-full flex-col w-full flex-1 border-r bg-accent/50 text-foreground">
          <div class="duration-200 flex shrink-0 items-center font-medium outline-none ease-linear h-12 rounded-none border-b px-4 text-sm text-foreground">
            Files
          </div>
          <TreeRoot
            v-slot="{ flattenItems }"
            v-model="activeFile"
            v-model:expanded="expandedKeys"
            class="list-none select-none"
            :items="data ?? []"
            :get-key="(item) => item.name"
          >
            <TreeItem
              v-for="item in flattenItems"
              :key="item._id"
              v-slot="{ isSelected, isExpanded }"
              v-bind="item.bind"
              as-child
              @select="(ev) => {
                if (item.hasChildren || ev.detail.isSelected)
                  ev.preventDefault()
              }"
            >
              <Button
                variant="ghost"
                :data-active="isSelected"
                class="flex w-full justify-start whitespace-nowrap rounded-none pl-[--index] hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground active:bg-accent active:text-foreground data-[active=true]:bg-accent dark:data-[active=true]:bg-accent data-[active=true]:text-foreground"
                :style="{ 'padding-left': `${(item.level - 0.25)}rem` }"
              >
                <template v-if="item.hasChildren">
                  <Icon
                    name="lucide:chevron-right"
                    class="size-3.5 transition-transform"
                    :class="{ 'rotate-90': isExpanded } "
                  />
                  <Icon name="lucide:folder" class="size-3.5" />
                </template>
                <template v-else>
                  <Icon
                    name="lucide:chevron-right"
                    class="invisible"
                  />
                  <Icon name="lucide:file" class="size-3.5" />
                </template>
                <div>
                  {{ item.value.name }}
                </div>
              </Button>
            </TreeItem>
          </TreeRoot>
        </div>
      </div>
    </div>
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex h-12 flex-shrink-0 items-center gap-2 border-b bg-accent/50 px-4 text-sm font-medium">
        <Icon name="lucide:file" class="size-4" />
        {{ activeFile?.path }}
        <div class="ml-auto flex items-center gap-2">
          <CopyCodeButton :code="activeFile?.content" />
        </div>
      </div>
      <div class="overflow-auto">
        <CodeRenderer :code="activeFile?.content" :lang="activeFileLang" />
      </div>
    </div>
  </div>
</template>
