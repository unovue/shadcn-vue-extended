<script setup lang="ts">
import { onKeyStroke, useMagicKeys, whenever } from '@vueuse/core'

const open = defineModel<boolean>('open', { default: false })

const { links } = await useDocsNav()
const router = useRouter()

const query = ref('')
const cursor = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)
const listEl = ref<HTMLElement | null>(null)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) {
    return links.value
  }
  return links.value.filter(link =>
    link.title.toLowerCase().includes(q) || link.group.toLowerCase().includes(q),
  )
})

// Reset position whenever the result set changes out from under the cursor.
watch(results, () => {
  cursor.value = 0
})

watch(open, async (isOpen) => {
  if (!isOpen) {
    return
  }
  query.value = ''
  cursor.value = 0
  await nextTick()
  inputEl.value?.focus()
})

function move(delta: number) {
  const total = results.value.length
  if (!total) {
    return
  }
  cursor.value = (cursor.value + delta + total) % total
  nextTick(() => {
    listEl.value?.querySelector('[data-active]')?.scrollIntoView({ block: 'nearest' })
  })
}

function select(index = cursor.value) {
  const link = results.value[index]
  if (!link) {
    return
  }
  open.value = false
  router.push(link.path)
}

const { meta_k, ctrl_k } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
    }
  },
})

whenever(() => meta_k.value || ctrl_k.value, () => {
  open.value = !open.value
})

onKeyStroke('Escape', () => {
  open.value = false
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-100 flex items-start justify-center bg-black/25 px-4 pt-[12vh] backdrop-blur-[2px] dark:bg-black/55"
        role="presentation"
        @click.self="open = false"
      >
        <div
          class="mat-float w-full max-w-[520px] overflow-hidden rounded-[14px]"
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
        >
          <div class="flex h-11 items-center gap-2.5 border-b border-hairline px-3.5">
            <Icon name="lucide:search" class="size-[13px] shrink-0 text-ink-3" />
            <input
              ref="inputEl"
              v-model="query"
              type="text"
              placeholder="Search documentation…"
              class="h-full flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-3"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
              @keydown.enter.prevent="select()"
            >
            <kbd class="mat-well grid h-[16px] min-w-[16px] place-items-center rounded-[4px] px-1 font-mono text-[9px] text-ink-3">
              esc
            </kbd>
          </div>

          <div ref="listEl" class="no-bar max-h-[46vh] overflow-y-auto overscroll-contain p-1.5">
            <p v-if="!results.length" class="px-2.5 py-6 text-center text-[12.5px] text-ink-3">
              No matches for “{{ query }}”.
            </p>

            <button
              v-for="(link, index) in results"
              :key="link.path"
              type="button"
              :data-active="index === cursor ? '' : undefined"
              class="flex h-[34px] w-full items-center gap-2 rounded-[9px] px-2.5 text-left data-[active]:bg-well"
              @click="select(index)"
              @mousemove="cursor = index"
            >
              <span
                class="flex-1 truncate text-[13px]"
                :class="index === cursor ? 'text-ink' : 'text-ink-2'"
              >{{ link.title }}</span>
              <span class="shrink-0 text-[10.5px] uppercase tracking-[0.06em] text-ink-3">{{ link.group }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
