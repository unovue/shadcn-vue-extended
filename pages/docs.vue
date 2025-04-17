<script setup lang="ts">
import { cn } from '@/lib/utils'

const { data } = await useAsyncData('navigation', () => {
  return queryCollectionNavigation('content')
})

const nav = computed(() => data.value?.[0].children)
</script>

<template>
  <div class="container-wrapper">
    <div class="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <aside class="border-grid fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 border-r md:sticky md:block">
        <div class="no-scrollbar h-full overflow-auto py-6 pr-6 lg:py-8">
          <div v-for="docsGroup in nav" :key="docsGroup.title">
            <div class="pb-4">
              <h4 class="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
                {{ docsGroup.title }}

                <!-- <span v-if="docsGroup.label" class="ml-2 font-normal rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                  {{ docsGroup.label }}
                </span> -->
              </h4>

              <div class="grid grid-flow-row auto-rows-max gap-0.5 text-sm">
                <template
                  v-for="doc in docsGroup.children"
                  :key="doc.path"
                >
                  <NuxtLink
                    v-if="doc.path"
                    :to="doc.path"
                    :class="cn('group flex h-8 w-full items-center rounded-lg px-2 font-normal text-foreground underline-offset-2 hover:bg-accent hover:text-accent-foreground', doc.page === false && 'cursor-not-allowed opacity-60', $route.path === doc.path && 'bg-accent font-medium text-accent-foreground')"
                  >
                    {{ doc.title }}

                    <span v-if="doc.label" class="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                      {{ doc.label }}
                    </span>
                  </NuxtLink>
                </template>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main class="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
        <div class="mx-auto w-full min-w-0 max-w-3xl">
          <div class="block xl:hidden mb-12">
            <DocTableOfContent />
          </div>

          <DocBreadcrumb class="mb-4" />

          <NuxtPage />
        </div>

        <div class="hidden text-sm xl:block">
          <div class="sticky top-20 -mt-6 h-[calc(100vh-3.5rem)] pt-4">
            <DocTableOfContent :key="$route.path" show-carbon-ads />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
