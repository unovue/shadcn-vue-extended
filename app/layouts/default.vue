<script setup lang="ts">
const { repo } = useAppConfig()

const mainNav = [
  { title: 'Docs', href: '/docs/getting-started/introduction' },
  { title: 'Blocks', href: '/blocks' },
]
</script>

<template>
  <TooltipProvider>
    <!--
      The bezel: the frame the app sits in. It owns the viewport, so the
      document itself never scrolls — panels scroll internally instead.
    -->
    <div class="fixed inset-0 flex p-3 sm:p-5">
      <div class="mat-panel border flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px]">
        <header class="flex h-12 shrink-0 items-center gap-4 border-b border-hairline px-4 sm:px-5">
          <NuxtLink to="/" class="text-[13px]">
            <Wordmark />
          </NuxtLink>

          <nav class="hidden items-center gap-4 sm:flex">
            <NuxtLink
              v-for="route in mainNav"
              :key="route.title"
              :to="route.href"
              class="text-[12.5px] text-ink-3 transition-colors hover:text-ink"
              active-class="text-ink"
            >
              {{ route.title }}
            </NuxtLink>
          </nav>

          <span class="flex-1" />

          <a
            :href="repo"
            target="_blank"
            rel="noopener"
            aria-label="GitHub repository"
            class="mat-cap press grid size-7 place-items-center rounded-[6px] text-ink-2 transition-colors hover:text-ink"
          >
            <Icon name="lucide:github" class="size-[13px]" />
          </a>

          <ThemeToggle />
        </header>

        <!-- `scroll-inset`, not `no-bar`: this is the page's only scroller, so
             its scrollbar needs to be visible — just held clear of the panel's
             rounded corners. -->
        <main class="scroll-inset flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <slot />
        </main>
      </div>
    </div>

    <Toaster />
  </TooltipProvider>
</template>
