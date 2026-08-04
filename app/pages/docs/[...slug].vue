<script lang="ts" setup>
const { repo } = useAppConfig()
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})

const sourceLink = `${repo}/tree/main/`

const metaLinks = computed(() => {
  const meta = page.value?.meta
  if (!meta) {
    return []
  }

  return [
    typeof meta.docs === 'string' && { label: 'Docs', href: meta.docs, icon: 'lucide:external-link' },
    meta.source && { label: 'Component Source', href: sourceLink + meta.source, icon: 'lucide:code-xml' },
    meta.primitive && { label: 'API Reference', href: meta.primitive, icon: 'lucide:external-link' },
    meta.reference && { label: 'API Reference', href: meta.reference, icon: 'lucide:external-link' },
  ].filter(Boolean) as Array<{ label: string, href: string, icon: string }>
})
</script>

<template>
  <div v-if="page">
    <header>
      <div class="flex items-center gap-2.5">
        <h1 class="scroll-m-20 text-[27px] font-medium leading-[1.15] tracking-[-0.03em] text-ink">
          {{ page.title }}
        </h1>
        <span
          v-if="page.meta.label"
          class="shrink-0 rounded-[4px] bg-accent-soft px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.06em] text-accent-ink"
        >
          {{ page.meta.label }}
        </span>
      </div>

      <p v-if="page.description" class="mt-3.5 text-[15px] leading-relaxed text-ink-2">
        {{ page.description }}
      </p>
    </header>

    <div v-if="metaLinks.length" class="mt-5 flex flex-wrap items-center gap-2">
      <NuxtLink
        v-for="link in metaLinks"
        :key="link.label + link.href"
        :to="link.href"
        target="_blank"
        class="mat-cap press inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2.5 text-[11.5px] font-medium text-ink-2 transition-colors hover:text-ink"
      >
        {{ link.label }}
        <Icon :name="link.icon" class="size-3" />
      </NuxtLink>
    </div>

    <div v-if="page.meta.contributors" class="mt-4 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-3">
      <span>Contributors:</span>
      <GithubUser v-for="user in page.meta.contributors" :key="user" :user />
    </div>

    <div class="nuxt-content prose py-10">
      <ContentRenderer :value="page" />
    </div>

    <DocEditLink />
  </div>
</template>
