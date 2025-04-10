import type { MDCParserResult } from '@nuxtjs/mdc'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'pathe'
import { visit } from 'unist-util-visit'

const __dirname = fileURLToPath(new URL('..', import.meta.url))

export default async (mdc: MDCParserResult) => {
  visit(mdc.body, (n) => {
    if (n.type === 'element' && n.tag === 'component-preview' && n.props?.path) {
      const { path } = n.props
      const componentPath = join(__dirname, path)
      const fileContent = readFileSync(componentPath, { encoding: 'utf8' })

      n.props.path = componentPath
      n.props.componentName = path.split('/').pop()?.split('.')[0] || ''
      n.children = [
        {
          type: 'element',
          tag: 'template',
          props: { 'v-slot:code': '' },
          children: [
            {
              type: 'element',
              tag: 'pre',
              props: {
                className: ['language-vue'],
                language: 'vue',
                meta: '',
                code: fileContent,
              },
              children: [],
            },
          ],
        },
      ]
    }
  })
}
