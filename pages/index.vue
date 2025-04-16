<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 flex-1 ">
    <h1 class="font-bold text-4xl">
      Extended
    </h1>

    <div class="flex items-center gap-2 mt-6">
      <Button as-child>
        <NuxtLink to="/docs/getting-started/introduction">
          Docs
        </NuxtLink>
      </Button>

      <Button as-child variant="outline">
        <NuxtLink to="/blocks">
          Blocks
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>
