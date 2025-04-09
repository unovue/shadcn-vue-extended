<script setup lang="ts">
import { cn } from '@/lib/utils'

const isOpen = ref(false)

const mainNav = [
  { title: 'Home', href: '/' },
  { title: 'Docs', href: '/docs/getting-started/introduction' },
  // { title: 'Components', href: '/docs/components/accordion' },
  // { title: 'Blocks', href: '/blocks' },
  // { title: 'Themes', href: '/themes' },
]

const links = [
  { name: 'GitHub', href: 'https://github.com/unovue/shadcn-vue', icon: 'lucide:github' },
]

const colorMode = useColorMode()
</script>

<template>
  <Body
    class="bg-background overscroll-none font-sans antialiased"
  >
    <TooltipProvider>
      <div class="relative flex min-h-svh flex-col bg-background">
        <div class="border-grid flex flex-1 flex-col">
          <header class="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div class="container-wrapper">
              <div class="container flex h-14 items-center">
                <div class="mr-4 md:mr-1 hidden md:flex">
                  <!-- <Logo /> -->

                  <nav class="flex items-center gap-4 text-sm xl:gap-6">
                    <NuxtLink
                      v-for="route in mainNav"
                      :key="route.title"
                      :to="route.href"
                      :class="cn('transition-colors hover:text-foreground/80', $route.path === `${route.href}.html` ? 'text-foreground' : 'text-foreground/80')"
                    >
                      {{ route.title }}
                    </NuxtLink>
                  </nav>
                </div>
                <!-- <MobileNav /> -->

                <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                  <div class="w-full flex-1 md:w-auto md:flex-none">
                    <Button
                      variant="outline"
                      class="relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64"
                      @click="isOpen = true"
                    >
                      <span class="hidden lg:inline-flex">Search documentation...</span>
                      <span class="inline-flex lg:hidden">Search...</span>
                      <DocKbd size="xs" class="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        ⌘ K
                      </DocKbd>
                    </Button>
                  </div>

                  <nav class="flex items-center gap-0.5">
                    <!-- <ThemePopover /> -->

                    <!-- <CodeConfigCustomizer /> -->

                    <Button
                      v-for="link in links"
                      :key="link.name"
                      as="a"
                      class="w-8 h-8"
                      :href="link.href"
                      target="_blank"
                      variant="ghost"
                      size="icon"
                    >
                      <Icon :name="link.icon" class="w-4 h-4" />
                    </Button>

                    <Button
                      class="w-8 h-8"
                      aria-label="Toggle dark mode"
                      variant="ghost"
                      size="icon"
                      @click="colorMode.preference = colorMode.preference === 'light' ? 'dark' : 'light' "
                    >
                      <Icon
                        :name="colorMode.value === 'light' ? 'lucide:moon' : 'lucide:sun'"
                        class="w-4 h-4 text-foreground"
                      />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </header>

          <main class="flex flex-1 flex-col">
            <NuxtLayout>
              <NuxtPage />
            </NuxtLayout>

            <!-- <component :is="frontmatter.layout" v-if="frontmatter.layout">
          <slot />
        </component>

        <component is="docs" v-else-if="$route.path.includes('docs')">
          <Content :key="$route.path" />
        </component>

        <component is="examples" v-else-if="$route.path.includes('examples')">
          <Content :key="$route.path" />
        </component>

        <Content v-else-if="!frontmatter.layout" :key="$route.path" /> -->
          </main>

          <footer class="border-grid border-t py-6 md:py-0">
            <div class="container-wrapper">
              <div class="container py-4">
                <p class="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                  <span>
                    Built by
                    <NuxtLink
                      to="https://twitter.com/shadcn"
                      target="_blank"
                      class="font-medium underline underline-offset-4"
                    >
                      shadcn
                    </NuxtLink>.
                  </span>
                  <span class="inline-block ml-1">
                    Ported to Vue by
                    <NuxtLink
                      to="https://github.com/unovue"
                      target="_blank"
                      class="font-medium underline underline-offset-4"
                    >
                      unovue
                    </NuxtLink>
                  </span>.
                  <span class="inline-block ml-1">
                    The code source is available on
                    <NuxtLink
                      to="https://github.com/unovue/shadcn-vue"
                      target="_blank"
                      class="font-medium underline underline-offset-4"
                    >
                      GitHub
                    </NuxtLink>.
                  </span>
                </p>
              </div>
            </div>
          </footer>

          <!-- <Dialog v-model:open="isOpen">
        <DialogContent class="p-0">
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandEmpty>
              No results found.
            </CommandEmpty>
            <CommandList
              @escape-key-down=" isOpen = false"
            >
              <CommandGroup heading="Links">
                <CommandItem
                  v-for="item in docsConfig.mainNav"
                  :key="item.title"
                  :heading="item.title"
                  :value="item.title"
                  class="py-3"
                  @select="handleSelectLink(item)"
                >
                  <File class="mr-2 h-5 w-5" />
                  <span>{{ item.title }}</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup v-for="item in docsConfig.sidebarNav" :key="item.title" :heading="item.title">
                <CommandItem
                  v-for="subItem in item.items"
                  :key="subItem.title"
                  :heading="subItem.title"
                  :value="subItem.title"
                  class="py-3"
                  @select="
                    handleSelectLink(subItem)"
                >
                  <Circle class="mr-2 h-4 w-4" />
                  <span>{{ subItem.title }}</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Theme">
                <CommandItem
                  value="light-theme"
                  class="py-3"
                  @select="
                    () => {
                      isDark = false;
                      isOpen = false;
                    }
                  "
                >
                  <SunIcon class="mr-2 h-5 w-5" />
                  <span>Light Theme</span>
                </CommandItem>
                <CommandItem
                  value="dark-theme"
                  class="py-3"
                  @select="
                    () => {
                      isDark = true;
                      isOpen = false;
                    }
                  "
                >
                  <MoonIcon class="mr-2 h-5 w-5" />
                  <span>Dark Theme</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog> -->
          <Toaster />
        </div>
      </div>
    </TooltipProvider>
  </Body>
</template>
