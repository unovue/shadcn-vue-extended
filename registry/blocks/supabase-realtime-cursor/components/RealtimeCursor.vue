<script setup lang="ts">
import Cursor from '@/registry/blocks/supabase-realtime-cursor/components/Cursor.vue'
import { useRealtimeCursors } from '@/registry/blocks/supabase-realtime-cursor/composables/useRealtimeCursors'
import { toRefs } from 'vue'

const props = defineProps<{
  roomName: string
  username: string
}>()

const THROTTLE_MS = 50

const { roomName, username } = toRefs(props)

const { cursors } = useRealtimeCursors({ roomName, username, throttleMs: THROTTLE_MS })
</script>

<template>
  <div>
    <Cursor
      v-for="id in Object.keys(cursors)"
      :key="id"
      class="fixed transition-transform ease-in-out z-50"
      :style="{
        transitionDuration: '20ms',
        top: 0,
        left: 0,
        transform: `translate(${cursors[id].position.x}px, ${cursors[id].position.y}px)`,
      }"
      :color="cursors[id].color"
      :name="cursors[id].user.name"
    />
  </div>
</template>
