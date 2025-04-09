---
title: Introduction
description: Re-usable components built with Radix Vue, and Tailwind CSS.
---

An unofficial, community-led [Vue](https://vuejs.org/) port of [shadcn/ui](https://ui.shadcn.com). We are not affiliated with [shadcn](https://twitter.com/shadcn), but we did get his blessing before creating a Vue version of his work. This project was born out of the need for a similar project for the Vue ecosystem.

This is **NOT** a component library. It's a collection of re-usable components that you can copy and paste or use the CLI to add to your apps.

**What do you mean not a component library?**

It means you do not install it as a dependency. It is not available or distributed via npm, with no plans to publish it.

Pick the components you need. Use the CLI to automatically add the components, or copy and paste the code into your project and customize to your needs. The code is yours.

_Use this as a reference to build your own component libraries._

## FAQ

::accordions
::accord{id=faq-1}
#header
Why not packaged as a dependency?

#default
The idea behind this is to give you ownership and control over the code, allowing you to decide how the components are built and styled.

Start with some sensible defaults, then customize the components to your needs.

One of the drawback of packaging the components in an npm package is that the style is coupled with the implementation. _The design of your components should be separate from their implementation._
::

::accord{id=faq-2}
#header
Which frameworks are supported?

#default
This port is built to be used with Vue/Nuxt.
::
::

```bash
bash -sh
```

```bash
npx shadcn-vue@latest add accordion
```

```ts
export default defineNuxtConfig({
  content: {
    build: {
      markdown: {
        // Object syntax can be used to override default options
        rehypePlugins: {
          'rehype-figure': {

          }
        },
      }
    }
  }
})
```
