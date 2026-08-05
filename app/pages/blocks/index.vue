<script setup lang="ts">
</script>

<template>
  <div class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:px-10">
    <header>
      <h1 class="text-[27px] font-medium leading-[1.15] tracking-[-0.03em] text-ink">
        Blocks
      </h1>
      <p class="mt-3.5 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
        Larger compositions built from the components. Copy the source, or pull one in with
        the CLI.
      </p>
    </header>

    <div class="mt-12 flex flex-col gap-14">
      <BlockContainer id="dialog-01" />

      <BlockContainer id="dialog-02" />
    </div>
  </div>
</template>
