<script setup lang="ts">
const props = defineProps<{
  user: string
}>()

interface GitHubUser {
  user: {
    id: number
    username: string
    name: string
    twitter: string
    avatar: string
  }
}
const { data } = useLazyFetch<GitHubUser>(`https://ungh.cc/users/${props.user}`, {})
</script>

<template>
  <NuxtLink
    v-if="data?.user.id"
    :to="`https://github.com/${user}`"
    target="_blank"
    class="not-prose inline-flex items-center gap-1 rounded-full mat-cap pr-2.5 text-xs font-mono font-semibold text-ink-2 hover:text-ink translate-y-[7px] mx-1"
  >
    <span class="size-6 rounded-full inline-block bg-cover" :style="{ 'background-image': `url(${data.user.avatar})` }" />
    {{ data.user.name }}
  </NuxtLink>
</template>
