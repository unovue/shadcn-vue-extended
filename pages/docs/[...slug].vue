<script lang="ts" setup>
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})

const sourceLink = 'https://github.com/unovue/shadcn-vue-extended/tree/main/'
</script>

<template>
  <div v-if="page">
    <div class="space-y-2">
      <div class="flex items-center space-x-4">
        <h1 class="scroll-m-20 text-3xl font-bold tracking-tight">
          {{ page.title }}
        </h1>
        <span v-if="page.meta.label" class="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
          {{ page.meta.label }}
        </span>
      </div>
      <p class="text-base text-muted-foreground">
        {{ page.description }}
      </p>
    </div>

    <div v-if="page.meta.docs || page.meta.source || page.meta.primitive" class="flex items-center space-x-2 pt-4">
      <NuxtLink v-if="typeof page.meta.docs === 'string'" :to="page.meta.docs" target="_blank" class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
        <Icon name="lucide:external-link" class="mr-1 h-3 w-3" />
        Docs
      </NuxtLink>
      <NuxtLink v-if="page.meta.source" :to="sourceLink + page.meta.source" target="_blank" class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
        Component Source
        <Icon name="lucide:code-xml" class="ml-1 h-3 w-3" />
      </NuxtLink>
      <NuxtLink v-if="page.meta.primitive" :to="page.meta.primitive" target="_blank" class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
        API Reference
        <Icon name="lucide:external-link" class="ml-1 h-3 w-3" />
      </NuxtLink>
    </div>

    <div class="nuxt-content prose py-8">
      <ContentRenderer :value="page" />
    </div>

    <DocEditLink />
  </div>
</template>
