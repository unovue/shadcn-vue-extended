import type { FileBeforeParseHook } from '@nuxt/content'
import { parseMarkdown, stringifyMarkdown } from '@nuxtjs/mdc/runtime'
import autoTypeTable from './auto-type-table'
import componentPreview from './component-preview'
import npmCommand from './npm-command'

export default async (ctx: FileBeforeParseHook) => {
  if (ctx.file.extension === '.md') {
    const mdc = await parseMarkdown(ctx.file.body)

    // List of all the transformer
    npmCommand(mdc)
    autoTypeTable(mdc)
    componentPreview(mdc)

    const parsedBody = await stringifyMarkdown(mdc.body, mdc.data)
    if (parsedBody)
      ctx.file.body = parsedBody
  }
}
