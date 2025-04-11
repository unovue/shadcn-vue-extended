/* eslint-disable node/prefer-global/process */
import { exec } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { block } from '@/registry/registry-block'
import { ui } from '@/registry/registry-ui'
import path from 'pathe'
import { rimraf } from 'rimraf'

const registry = [
  ...ui,
  ...block,
]

async function buildRegistryJsonFile() {
  // 1. Fix the path for registry items.
  const fixedRegistry = {
    name: 'shadcn-vue-extended',
    homepage: 'https://extended.shadcn-vue.com',
    items: registry.map((item) => {
      const files = item.files?.map((file) => {
        return {
          ...file,
          path: `registry/${file.path}`,
        }
      })

      return {
        ...item,
        files,
      }
    }),
  }

  // 2. Write the content of the registry to `registry.json`
  rimraf.sync(path.join(process.cwd(), `registry.json`))
  await fs.writeFile(
    path.join(process.cwd(), `registry.json`),
    JSON.stringify(fixedRegistry, null, 2),
  )
}

async function buildRegistry() {
  return new Promise((resolve, reject) => {
    const process = exec(
      `pnpm dlx shadcn-vue@latest build registry.json --output public/r`,
    )

    process.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined)
      }
      else {
        reject(new Error(`Process exited with code ${code}`))
      }
    })
  })
}

try {
  console.log('💅 Building registry.json...')
  await buildRegistryJsonFile()

  console.log('🏗️ Building registry...')
  await buildRegistry()
}
catch (error) {
  console.error(error)
  process.exit(1)
}
