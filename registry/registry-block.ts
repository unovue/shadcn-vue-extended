export const block = [
  {
    name: 'dialog-01',
    type: 'registry:block',
    dependencies: ['lucide-vue-next'],
    registryDependencies: [
      'button',
      'dialog',
    ],
    files: [
      {
        path: 'blocks/dialog-01/index.vue',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'dialog-02',
    type: 'registry:block',
    dependencies: ['lucide-vue-next'],
    registryDependencies: [
      'button',
      'dialog',
    ],
    files: [
      {
        path: 'blocks/dialog-02/index.vue',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'supabase-client',
    type: 'registry:block',
    dependencies: ['@supabase/supabase-js'],
    files: [
      {
        path: 'blocks/supabase-client/lib/supabase/client.ts',
        type: 'registry:lib',
      },
    ],
  },
  {
    name: 'supabase-realtime-cursor',
    type: 'registry:block',
    dependencies: ['lucide-vue-next'],
    registryDependencies: ['https://extended.shadcn-vue.com/r/supabase-client.json'],
    files: [
      {
        path: 'blocks/supabase-realtime-cursor/components/Cursor.vue',
        type: 'registry:component',
      },
      {
        path: 'blocks/supabase-realtime-cursor/components/RealtimeCursor.vue',
        type: 'registry:component',
      },
      {
        path: 'blocks/supabase-realtime-cursor/composables/useRealtimeCursors.ts',
        type: 'registry:hook',
      },
    ],
  },
]
