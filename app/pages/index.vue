<script setup lang="ts">
const { repo } = useAppConfig()

// Credits come from the docs frontmatter rather than a hand-kept list here, so
// adding a component with `contributors:` is enough to get its author named.
const { data: pages } = await useAsyncData('landing-contributors', () =>
  queryCollection('content').select('path', 'meta').all())

const contributors = computed(() => {
  const seen = new Set<string>()
  for (const page of pages.value ?? []) {
    for (const user of (page.meta?.contributors as string[] | undefined) ?? []) {
      seen.add(user)
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b))
})
</script>

<template>
  <div class="flex min-h-0 flex-1 px-6 sm:px-12">
    <div class="mx-auto my-auto w-full max-w-[900px] py-10 sm:py-24">
      <h1 class="mt-8 max-w-[18ch] text-balance text-[clamp(26px,7.6vw,32px)] font-medium leading-[1.08] tracking-[-0.04em] text-ink sm:mt-16 sm:text-[clamp(32px,5.6vw,52px)]">
        A community registry for shadcn-vue.
      </h1>

      <div class="mt-6 grid max-w-[46ch] gap-3 text-[13.5px] leading-[1.7] text-ink-2 sm:mt-9 sm:gap-4 sm:text-[15px]">
        <p>
          Every project reaches for the same few things that never made it into the core
          library. Instead of each of us rewriting them in private, they are collected here
          and maintained in the open.
        </p>
        <p>
          Components, composables, utilities — if it is useful and it installs the
          shadcn-vue way, it belongs here. Everything ships as source: you copy it into
          your project and it becomes yours, including the parts you would have written
          differently.
        </p>
      </div>

      <div class="mt-8 flex flex-wrap items-center gap-3 sm:mt-12">
        <NuxtLink
          to="/docs/getting-started/introduction"
          class="press inline-flex h-8 items-center rounded-[8px] bg-primary px-3 text-[12.5px] font-medium text-primary-foreground sm:h-9 sm:px-3.5 sm:text-[13px]"
        >
          Browse the registry
        </NuxtLink>

        <NuxtLink
          to="/blocks"
          class="mat-cap press inline-flex h-8 items-center gap-2 rounded-[8px] px-3 text-[12.5px] font-medium text-ink-2 transition-colors hover:text-ink sm:h-9 sm:px-3.5 sm:text-[13px]"
        >
          Blocks
        </NuxtLink>

        <a
          :href="`${repo}/blob/main/CONTRIBUTING.md`"
          target="_blank"
          rel="noopener"
          class="mat-cap press inline-flex h-8 items-center gap-2 rounded-[8px] px-3 text-[12.5px] font-medium text-ink-2 transition-colors hover:text-ink sm:h-9 sm:px-3.5 sm:text-[13px]"
        >
          <Icon name="lucide:git-pull-request-arrow" class="size-[13px]" />
          Contribute
        </a>
      </div>

      <section class="mt-16 border-t border-hairline pt-10 sm:mt-24">
        <h2 class="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          Credits
        </h2>

        <p class="mt-3 max-w-[52ch] text-[13.5px] leading-[1.7] text-ink-2">
          Every entry in the registry was written by someone who hit the problem first and
          published the answer. Each docs page names its authors, and so does this one.
        </p>

        <ul v-if="contributors.length" class="mt-5 flex flex-wrap gap-2">
          <li v-for="user in contributors" :key="user">
            <ContributorChip :user="user" />
          </li>
        </ul>

        <p class="mt-5 text-[12.5px] text-ink-3">
          Your name belongs here too —
          <a
            :href="`${repo}/blob/main/CONTRIBUTING.md`"
            target="_blank"
            rel="noopener"
            class="text-accent-ink underline underline-offset-4"
          >adding a component</a>
          takes a schema, a docs page and a pull request.
        </p>
      </section>
    </div>
  </div>
</template>
