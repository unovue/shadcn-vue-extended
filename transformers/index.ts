import type { FileBeforeParseHook } from '@nuxt/content'
import { parseMarkdown, stringifyMarkdown } from '@nuxtjs/mdc/runtime'
import autoTypeTable from './auto-type-table'
import componentPreview from './component-preview'
import npmCommand from './npm-command'
import stripInjectedProps from './strip-injected-props'

export default async (ctx: FileBeforeParseHook) => {
  if (ctx.file.extension === '.md') {
    const mdc = await parseMarkdown(ctx.file.body)

    // List of all the transformer
    npmCommand(mdc)
    autoTypeTable(mdc)
    componentPreview(mdc)

    // Must run last: cleans up after the transformers above, immediately
    // before the tree is serialized back to markdown.
    stripInjectedProps(mdc)

    const parsedBody = await stringifyMarkdown(mdc.body, mdc.data)
    if (parsedBody)
      ctx.file.body = parsedBody
  }
}
