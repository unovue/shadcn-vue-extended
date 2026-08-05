import type { MDCParserResult } from '@nuxtjs/mdc'
import { visit } from 'unist-util-visit'

/**
 * `parseMarkdown` runs rehype plugins that decorate the tree — external links
 * come back with `rel: ['nofollow']`, which was never in the source markdown.
 *
 * That matters because this pipeline round-trips: parse -> transform ->
 * `stringifyMarkdown`. The serializer has no syntax for an array-valued
 * attribute, so it emits `{rel=""nofollow""}` with doubled quotes, which
 * @nuxt/content then fails to re-parse and renders as literal text next to the
 * link.
 *
 * Dropping these before serializing restores the source's fidelity. Nothing is
 * lost: @nuxt/content's own pipeline re-adds `rel="nofollow"` when it renders
 * the final anchor.
 */
export default (mdc: MDCParserResult) => {
  visit(mdc.body, (n: { type?: string, props?: Record<string, unknown> }) => {
    if (n.type !== 'element' || !n.props) {
      return
    }

    for (const [key, value] of Object.entries(n.props)) {
      // `className` is the one array prop the serializer does handle.
      if (Array.isArray(value) && key !== 'className') {
        delete n.props[key]
      }
    }
  })
}
