<script setup lang="ts">
const { repo } = useAppConfig()
</script>

<template>
  <div class="flex min-h-0 flex-1 px-6 sm:px-12">
    <div class="mx-auto my-auto w-full max-w-[900px] py-10 sm:py-24">
      <h1 class="mt-8 max-w-[22ch] text-balance text-[clamp(26px,7.6vw,32px)] font-medium leading-[1.08] tracking-[-0.04em] text-ink sm:mt-16 sm:text-[clamp(32px,5.6vw,52px)]">
        The components shadcn-vue
        <span class="whitespace-nowrap">doesn't ship</span>, built the same way.
      </h1>

      <div class="mt-6 grid max-w-[44ch] gap-3 text-[13.5px] leading-[1.7] text-ink-2 sm:mt-9 sm:gap-4 sm:text-[15px]">
        <p>
          Every project reaches for the same handful of pieces that never made it into the
          core library. An auto-generated form. A separator that carries a label. A dialog
          you have already written four times.
        </p>
        <p>
          These are distributed the way shadcn-vue is: you copy the source into your project
          and it becomes yours, including the parts you would have written differently.
        </p>
      </div>

      <div class="mt-8 flex flex-wrap items-center gap-3 sm:mt-12">
        <NuxtLink
          to="/docs/getting-started/introduction"
          class="press inline-flex h-8 items-center rounded-[9px] bg-ink px-3 text-[12.5px] font-medium text-panel sm:h-9 sm:px-3.5 sm:text-[13px]"
        >
          Browse the components
        </NuxtLink>

        <NuxtLink
          to="/blocks"
          class="mat-cap press inline-flex h-8 items-center gap-2 rounded-[9px] px-3 text-[12.5px] font-medium text-ink-2 transition-colors hover:text-ink sm:h-9 sm:px-3.5 sm:text-[13px]"
        >
          Blocks
        </NuxtLink>

        <a
          :href="repo"
          target="_blank"
          rel="noopener"
          class="mat-cap press inline-flex h-8 items-center gap-2 rounded-[9px] px-3 text-[12.5px] font-medium text-ink-2 transition-colors hover:text-ink sm:h-9 sm:px-3.5 sm:text-[13px]"
        >
          <Icon name="lucide:github" class="size-[13px]" />
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>
