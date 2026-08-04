<script setup lang="ts">
const props = defineProps<{ user: string }>()

interface GitHubUser {
  user: {
    id: number
    username: string
    name: string
    avatar: string
  }
}

// Lazy so a slow or unreachable ungh.cc never blocks the page; the chip falls
// back to the handle, which is the part that actually credits the person.
const { data } = useLazyFetch<GitHubUser>(`https://ungh.cc/users/${props.user}`, {
  key: `contributor-${props.user}`,
  server: false,
})
</script>

<template>
  <a
    :href="`https://github.com/${user}`"
    target="_blank"
    rel="noopener"
    class="mat-cap press inline-flex h-8 items-center gap-2 rounded-[8px] py-1 pl-1.5 pr-3 text-[12.5px] font-medium text-ink-2 transition-colors hover:text-ink"
  >
    <span
      v-if="data?.user.avatar"
      class="size-5 shrink-0 rounded-full bg-cover bg-center"
      :style="{ backgroundImage: `url(${data.user.avatar})` }"
    />
    <span v-else class="size-5 shrink-0 rounded-full bg-well" />

    {{ data?.user.name || user }}
  </a>
</template>
