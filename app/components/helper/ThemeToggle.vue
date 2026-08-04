<script setup lang="ts">
const colorMode = useColorMode()

/*
 * The visual state is driven by `dark:` variants rather than by
 * `colorMode.value`. With a `system` preference the server cannot know the
 * resolved theme, so it renders `<html>` with no class and the toggle in its
 * light position; the color-mode script then adds `.dark` before Vue hydrates
 * and every JS-bound class mismatches. CSS variants resolve off that same class
 * and so agree on both sides — and the toggle looks right before JS even runs.
 *
 * `aria-pressed` cannot be expressed in CSS, so it waits for mount. Until then
 * the attribute is simply absent, which matches what the server rendered.
 */
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const isDark = computed(() => (mounted.value ? colorMode.value === 'dark' : undefined))
</script>

<template>
  <div class="mat-well relative flex h-[26px] w-[54px] items-center rounded-[8px] p-[3px]">
    <span
      class="mat-cap absolute left-[3px] top-[3px] h-5 w-6 translate-x-0 rounded-[5px] transition-transform duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:translate-x-6"
      aria-hidden="true"
    />

    <button
      type="button"
      aria-label="Use light theme"
      :aria-pressed="isDark === undefined ? undefined : !isDark"
      class="relative z-10 grid h-5 w-6 place-items-center rounded-[5px] text-ink transition-colors dark:text-ink-3 dark:hover:text-ink-2"
      @click="colorMode.preference = 'light'"
    >
      <Icon name="lucide:sun" class="size-[13px]" />
    </button>

    <button
      type="button"
      aria-label="Use dark theme"
      :aria-pressed="isDark"
      class="relative z-10 grid h-5 w-6 place-items-center rounded-[5px] text-ink-3 transition-colors hover:text-ink-2 dark:text-ink dark:hover:text-ink"
      @click="colorMode.preference = 'dark'"
    >
      <Icon name="lucide:moon" class="size-[13px]" />
    </button>
  </div>
</template>
