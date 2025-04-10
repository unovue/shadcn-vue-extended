import type { MDCParserResult } from '@nuxtjs/mdc'
import { visit } from 'unist-util-visit'

export default async (mdc: MDCParserResult) => {
  visit(mdc.body, (n) => {
    if (n.type === 'element' && n.tag === 'pre' && n.props?.language === 'bash') {
      const npmCommand = n.props.code
      const props = { pnpm: '', npm: '', yarn: '', bun: '' }

      if (npmCommand.includes('npm install')) {
        props.npm = npmCommand
        props.yarn = npmCommand.replaceAll('npm install', 'yarn add')
        props.pnpm = npmCommand.replaceAll('npm install', 'pnpm add')
        props.bun = npmCommand.replaceAll('npm install', 'bun add')
      }
      else if (npmCommand.includes('npx create-')) {
        props.npm = npmCommand
        props.yarn = npmCommand.replaceAll('npx create-', 'yarn create')
        props.pnpm = npmCommand.replaceAll('npx create-', 'pnpm create')
        props.bun = npmCommand.replaceAll('npx', 'bunx --bun')
      }
      else if (npmCommand.includes('npm create')) {
        props.npm = npmCommand
        props.yarn = npmCommand.replaceAll('npm create', 'yarn create')
        props.pnpm = npmCommand.replaceAll('npm create', 'pnpm create')
        props.bun = npmCommand.replaceAll('npm create', 'bun create')
      }
      else if (npmCommand.includes('npx')) {
        props.npm = npmCommand
        props.yarn = npmCommand
        props.pnpm = npmCommand.replaceAll('npx', 'pnpm dlx')
        props.bun = npmCommand.replaceAll('npx', 'bunx --bun')
      }
      else if (npmCommand.includes('npm run')) {
        props.npm = npmCommand
        props.yarn = npmCommand.replaceAll('npm run', 'yarn')
        props.pnpm = npmCommand.replaceAll('npm run', 'pnpm')
        props.bun = npmCommand.replaceAll('npm run', 'bun')
      }

      if (props.npm) {
        n.tag = 'npm-command'
        n.props = { ':tabs': JSON.stringify(props) }
        n.children = []
      }
    }
  })
}
