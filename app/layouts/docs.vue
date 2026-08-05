<script setup lang="ts">
const { repo } = useAppConfig()
const route = useRoute()
const { groups } = await useDocsNav()

const searchOpen = ref(false)
const mobileNavOpen = ref(false)

watch(() => route.path, () => {
  mobileNavOpen.value = false
})
</script>

<template>
  <TooltipProvider>
    <!-- The bezel owns the viewport; the sidebar and the panel float on it. -->
    <div class="fixed inset-0 flex gap-3 overflow-hidden p-3 sm:gap-4 sm:p-5">
      <aside class="hidden h-full w-[236px] shrink-0 lg:block">
        <nav class="flex h-full flex-col px-2">
          <div class="shrink-0 pb-2.5">
            <div class="flex h-12 items-center px-2.5 text-[13px]">
              <NuxtLink to="/">
                <Wordmark />
              </NuxtLink>
            </div>

            <button
              type="button"
              class="mat-well press flex h-[34px] w-full items-center gap-2 rounded-[8px] px-2.5 text-left"
              @click="searchOpen = true"
            >
              <Icon name="lucide:search" class="size-[13px] shrink-0 text-ink-3" />
              <span class="flex-1 text-[12.5px] text-ink-3">Search</span>
              <span class="flex shrink-0 items-center gap-1">
                <kbd class="mat-cap grid h-[16px] min-w-[16px] place-items-center rounded-[4px] px-1 font-mono text-[9.5px] text-ink-3">⌘</kbd>
                <kbd class="mat-cap grid h-[16px] min-w-[16px] place-items-center rounded-[4px] px-1 font-mono text-[9.5px] text-ink-3">K</kbd>
              </span>
            </button>
          </div>

          <div class="fade-y no-bar min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8 pt-1">
            <DocsNavTree :groups="groups" />
          </div>
        </nav>
      </aside>

      <div class="min-w-0 flex-1">
        <div class="mat-panel border scroll-inset h-full overflow-y-auto overflow-x-hidden overscroll-contain rounded-[16px]">
          <header class="sticky top-0 z-20 flex h-12 items-center gap-2.5 border-b border-hairline bg-panel/85 px-4 backdrop-blur-md sm:gap-4 sm:px-5">
            <NuxtLink to="/" class="text-[13px] lg:hidden">
              <Wordmark />
            </NuxtLink>

            <button
              type="button"
              class="mat-cap press flex h-7 items-center gap-1.5 rounded-[6px] px-2 text-[11px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink lg:hidden"
              @click="mobileNavOpen = true"
            >
              <Icon name="lucide:menu" class="size-[13px]" />
              <span class="hidden sm:inline">Menu</span>
            </button>

            <div class="hidden min-w-0 lg:block">
              <DocBreadcrumb />
            </div>

            <span class="flex-1" />

            <button
              type="button"
              class="mat-cap press hidden h-7 items-center gap-2 rounded-[7px] pl-2.5 pr-1.5 text-[11.5px] text-ink-3 transition-colors hover:text-ink-2 lg:flex"
              @click="searchOpen = true"
            >
              Search
              <span class="flex items-center gap-1">
                <kbd class="mat-well grid h-[16px] min-w-[16px] place-items-center rounded-[4px] px-1 font-mono text-[9px] text-ink-3">⌘</kbd>
                <kbd class="mat-well grid h-[16px] min-w-[16px] place-items-center rounded-[4px] px-1 font-mono text-[9px] text-ink-3">K</kbd>
              </span>
            </button>

            <a
              :href="repo"
              target="_blank"
              rel="noopener"
              aria-label="GitHub repository"
              class="mat-cap press hidden size-7 place-items-center rounded-[6px] text-ink-2 transition-colors hover:text-ink sm:grid"
            >
              <Icon name="lucide:github" class="size-[13px]" />
            </a>

            <ThemeToggle />
          </header>

          <!-- Softens content passing under the sticky header instead of a hard cut. -->
          <div class="pointer-events-none sticky top-12 z-10 -mb-12 h-12 bg-gradient-to-b from-panel via-panel/85 to-transparent" />

          <!--
            The contents rail is pinned to the right edge of the panel so the
            prose column can take the space it frees up, rather than the two
            being centred together as one block.
          -->
          <div class="flex w-full gap-12 px-6 py-12 sm:px-10">
            <div class="mx-auto w-full min-w-0 max-w-[860px] flex-1">
              <slot />
            </div>

            <aside class="hidden w-[172px] shrink-0 xl:block">
              <div class="sticky top-24">
                <DocTableOfContent :key="route.path" />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile navigation -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
        enter-from-class="opacity-0"
        leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
        leave-to-class="opacity-0"
      >
        <div
          v-if="mobileNavOpen"
          class="fixed inset-0 z-100 bg-black/25 backdrop-blur-[2px] lg:hidden dark:bg-black/55"
          role="presentation"
          @click.self="mobileNavOpen = false"
        >
          <div class="mat-float absolute inset-y-3 left-3 flex w-[260px] flex-col rounded-[12px] p-2">
            <div class="flex h-12 shrink-0 items-center justify-between px-2.5">
              <Wordmark class="text-[13px]" />
              <button
                type="button"
                aria-label="Close navigation"
                class="press grid size-7 place-items-center rounded-[6px] text-ink-3 hover:text-ink"
                @click="mobileNavOpen = false"
              >
                <Icon name="lucide:x" class="size-[14px]" />
              </button>
            </div>

            <div class="fade-y no-bar min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 pt-1">
              <DocsNavTree :groups="groups" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <SearchPalette v-model:open="searchOpen" />
    <Toaster />
  </TooltipProvider>
</template>
