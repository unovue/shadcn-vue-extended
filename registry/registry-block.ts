export const block = [
  {
    name: 'dialog-01',
    type: 'registry:block',
    title: 'Dialog 01',
    description: 'A dialog block example.',
    dependencies: ['lucide-vue-next'],
    registryDependencies: [
      'button',
      'dialog',
    ],
    files: [
      {
        path: 'blocks/dialog-01/index.vue',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'dialog-02',
    type: 'registry:block',
    title: 'Dialog 02',
    description: 'A dialog block example.',
    dependencies: ['lucide-vue-next'],
    registryDependencies: [
      'button',
      'dialog',
    ],
    files: [
      {
        path: 'blocks/dialog-02/index.vue',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'supabase-client',
    type: 'registry:block',
    title: 'Supabase Client',
    description: 'A Supabase client factory. Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
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
    title: 'Supabase Realtime Cursor',
    description: 'Real-time collaborative cursors using Supabase Realtime.',
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
