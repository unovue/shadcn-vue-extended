---
title: Introduction
description: Extra components and blocks for shadcn-vue, installable via the CLI.
---

**shadcn-vue/extended** is a community-maintained registry of extra components and blocks for [shadcn-vue](https://www.shadcn-vue.com) that aren't part of the official collection.

It isn't a component library you install as a dependency. Like shadcn-vue itself, the code for each item is copied directly into your project, so you own it and can modify it however you like.

## How it works

The shadcn-vue CLI can add components from any registry, not just the official one. Running the `add` command with a URL to an item's JSON file on this site fetches that item's source files and writes them into your project, following the paths configured in your `components.json`.

```bash
npx shadcn-vue@latest add https://extended.shadcn-vue.com/r/auto-form.json
```

## Prerequisites

You need an existing project that already has shadcn-vue set up. If you haven't done that yet, follow the [shadcn-vue installation guide](https://www.shadcn-vue.com/docs/installation) first.

## Next steps

- Browse the [Components](/docs/components/separator-label) section for individual UI components.
- Browse the [Blocks](/blocks) page for larger, ready-to-use pieces.
