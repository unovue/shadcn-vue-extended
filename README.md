# shadcn-vue/extended

A community-maintained registry of extra components and blocks for [shadcn-vue](https://www.shadcn-vue.com) that aren't part of the official collection. Browse the docs at [extended.shadcn-vue.com](https://extended.shadcn-vue.com).

## Usage

Install any item with the shadcn-vue CLI, pointing it at this registry's JSON:

```bash
npx shadcn-vue@latest add https://extended.shadcn-vue.com/r/<name>.json
```

For example, to add `auto-form`:

```bash
npx shadcn-vue@latest add https://extended.shadcn-vue.com/r/auto-form.json
```

## What's inside

| Name | Type | Description |
| --- | --- | --- |
| [`separator-label`](https://extended.shadcn-vue.com/docs/components/separator-label) | ui | Separator with a label |
| [`auto-form`](https://extended.shadcn-vue.com/docs/components/auto-form) | ui | Auto-generate a form from a Zod schema (vee-validate + zod) |
| [`dialog-01`](https://extended.shadcn-vue.com/blocks) | block | Dialog example block |
| [`dialog-02`](https://extended.shadcn-vue.com/blocks) | block | Dialog example block |
| `supabase-client` | block | Supabase client factory |
| [`supabase-realtime-cursor`](https://extended.shadcn-vue.com/docs/blocks/supabase-realtime-cursor) | block | Real-time collaborative cursors via Supabase Realtime |

## Development

```bash
pnpm install
pnpm dev
```

`pnpm build:registry` regenerates `registry.json` and `public/r/*.json` from the `registry/` source files; the generated artifacts are committed to the repo.

## Contributing

Want to add a component or block? See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Licensed under the [MIT license](./LICENSE).
