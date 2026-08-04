<script setup lang="ts">
const colorMode = useColorMode()

// `colorMode.value` is the resolved theme, which is what the thumb should
// track — `preference` can be `system`, which has no position of its own.
const isDark = computed(() => colorMode.value === 'dark')
</script>

<template>
  <div class="mat-well relative flex h-[26px] w-[54px] items-center rounded-[8px] p-[3px]">
    <span
      class="mat-cap absolute left-[3px] top-[3px] h-5 w-6 rounded-[5px] transition-transform duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
      :class="isDark ? 'translate-x-6' : 'translate-x-0'"
      aria-hidden="true"
    />

    <button
      type="button"
      aria-label="Use light theme"
      :aria-pressed="!isDark"
      class="relative z-10 grid h-5 w-6 place-items-center rounded-[5px] transition-colors"
      :class="isDark ? 'text-ink-3 hover:text-ink-2' : 'text-ink'"
      @click="colorMode.preference = 'light'"
    >
      <Icon name="lucide:sun" class="size-[13px]" />
    </button>

    <button
      type="button"
      aria-label="Use dark theme"
      :aria-pressed="isDark"
      class="relative z-10 grid h-5 w-6 place-items-center rounded-[5px] transition-colors"
      :class="isDark ? 'text-ink' : 'text-ink-3 hover:text-ink-2'"
      @click="colorMode.preference = 'dark'"
    >
      <Icon name="lucide:moon" class="size-[13px]" />
    </button>
  </div>
</template>
