<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RealtimeCursors from '@/registry/blocks/supabase-realtime-cursor/components/RealtimeCursor.vue'
import { RefreshCcw } from 'lucide-vue-next'
import { ref } from 'vue'

import { generateFullName } from './utils'

const username = ref('')
onMounted(() => {
  username.value = generateFullName()
})
</script>

<template>
  <div class="flex flex-col w-44">
    <Label>Username</Label>
    <div class="flex items-center gap-2 mt-1">
      <Input
        :value="username"
        disabled
        @change="(e: Event) => {
          const target = e.target as HTMLInputElement
          username = target.value
        }"
      />
      <Button
        variant="secondary"
        size="icon"
        class="px-2"
        @click="username = generateFullName()"
      >
        <RefreshCcw :size="18" />
      </Button>
    </div>

    <RealtimeCursors room-name="supabase-realtime-cursor-example" :username="username" />
  </div>
</template>
