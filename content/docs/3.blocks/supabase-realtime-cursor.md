---
title: Supabase Realtime Cursor
description: Real-time cursor sharing for collaborative applications
reference: https://supabase.com/ui/docs/react/realtime-cursor
contributors: [zernonia]
---

::iframe-split{:iframes='["/examples/SupabaseRealtimeCursor", "/examples/SupabaseRealtimeCursor"]' :class="h-120"}
::

## Prerequisites

This block depends on the `supabase-client` registry item, which is installed automatically as `lib/supabase/client.ts`.

The client requires two environment variables to be set in the consuming project:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These are Vite-style env vars; Nuxt users should adapt them to their own env handling (for example `NUXT_PUBLIC_SUPABASE_URL`). You can find your project's URL and anon key on the [Supabase API settings page](https://supabase.com/dashboard/project/_/settings/api).

## Installation

```bash
npx shadcn-vue@latest add https://extended.shadcn-vue.com/r/supabase-realtime-cursor.json
```

## Folder structure

::block-code-viewer{id="supabase-realtime-cursor"}
::

## Read more

More information please visit [Supabase UI](https://supabase.com/ui/docs/react/realtime-cursor)
