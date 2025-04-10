import type { MDCParserResult } from '@nuxtjs/mdc'
import { fileURLToPath } from 'node:url'
import { join } from 'pathe'
import { visit } from 'unist-util-visit'
import { createChecker } from 'vue-component-meta'
// import { type PropsType } from "@/components/mdc/AutoTypeTable.vue"

let checker: ReturnType<typeof createChecker>
const __dirname = fileURLToPath(new URL('..', import.meta.url))

export default async (mdc: MDCParserResult) => {
  visit(mdc.body, (n) => {
    if (n.type === 'element' && n.tag === 'auto-type-table' && n.props?.path) {
      if (!checker) {
        checker = createChecker(join(__dirname, 'tsconfig.json'))
      }

      const { path } = n.props
      const componentPath = join(__dirname, path)
      const meta = checker.getComponentMeta(componentPath)

      n.props = {
        ':props': JSON.stringify(meta.props.filter(i => !i.global).map(i => ({ name: i.name, description: i.description, required: i.required, type: i.type, default: i.default }))),
        ':events': JSON.stringify(meta.events.filter),
        ':slots': JSON.stringify(meta.slots),
        // ':exposed': JSON.stringify(meta.exposed),
      }
      // console.log(n)
    }
  })
}
