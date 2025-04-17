import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/registry/blocks/supabase-client/lib/supabase/client'
import { tryOnMounted, tryOnUnmounted, useEventListener, useThrottleFn } from '@vueuse/core'
import { ref, toRef } from 'vue'

const supabase = createClient()

const generateRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`

const generateRandomNumber = () => Math.floor(Math.random() * 100)

const EVENT_NAME = 'realtime-cursor-move'

interface CursorEventPayload {
  position: {
    x: number
    y: number
  }
  user: {
    id: number
    name: string
  }
  color: string
  timestamp: number
}

export function useRealtimeCursors(options: {
  roomName: MaybeRef<string>
  username: MaybeRef<string>
  throttleMs: MaybeRef<number>
}) {
  const color = ref(generateRandomColor())
  const userId = ref(generateRandomNumber())
  const cursors = ref<Record<string, CursorEventPayload>>({})
  const roomName = toRef(options.roomName)
  const username = toRef(options.username)
  const throttleMs = toRef(options.throttleMs)

  const channelRef = ref<RealtimeChannel | null>(null)

  const handleMouseMove = useThrottleFn((event: MouseEvent) => {
    const { clientX, clientY } = event

    const payload: CursorEventPayload = {
      position: {
        x: clientX,
        y: clientY,
      },
      user: {
        id: userId.value,
        name: username.value,
      },
      color: color.value,
      timestamp: new Date().getTime(),
    }

    channelRef.value?.send({
      type: 'broadcast',
      event: EVENT_NAME,
      payload,
    })
  }, throttleMs)

  let channel: RealtimeChannel | undefined
  tryOnMounted(() => {
    channel = supabase.channel(roomName.value)
    channelRef.value = channel

    channel
      .on('broadcast', { event: EVENT_NAME }, (data: { payload: CursorEventPayload }) => {
        const { user } = data.payload
        // Don't render your own cursor
        if (user.id === userId.value)
          return

        const prev = { ...cursors.value }
        if (prev[userId.value]) {
          delete prev[userId.value]
        }

        cursors.value = {
          ...prev,
          [user.id]: data.payload,
        }
      })
      .subscribe()
  })

  tryOnUnmounted(() => {
    channel?.unsubscribe()
  })

  useEventListener('mousemove', handleMouseMove)

  return {
    cursors,
  }
}
