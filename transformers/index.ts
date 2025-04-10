import type { FileBeforeParseHook } from '@nuxt/content'
import { parseMarkdown, stringifyMarkdown } from '@nuxtjs/mdc/runtime'
import autoTypeTable from './auto-type-table'
import npmCommand from './npm-command'

export default async (ctx: FileBeforeParseHook) => {
  if (ctx.file.extension === '.md') {
    const mdc = await parseMarkdown(ctx.file.body)

    npmCommand(mdc)
    autoTypeTable(mdc)

    const parsedBody = await stringifyMarkdown(mdc.body, mdc.data)
    if (parsedBody)
      ctx.file.body = parsedBody
  }
}
