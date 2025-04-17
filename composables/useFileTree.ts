const rawFiles = import.meta.glob(`@/registry/blocks/**/*.{vue,ts,js,d.ts}`, {
  query: '?raw',
  import: 'default',
})

export interface FileTree {
  name: string
  path?: string
  content?: string
  children?: FileTree[]
}

export interface FileTreeWithParent extends FileTree {
  parents?: string[]
}

export function useFileTree(id: string) {
  const { data } = useNuxtData<FileTree[]>(`file-tree-${id}`)

  onBeforeMount(async () => {
    if (!data.value) {
      const files = Object.fromEntries(
        Object.entries(rawFiles).filter(
          ([key]) => key.includes(`/blocks/${id}`),
        ),
      )
      const obj: Record<string, string> = {}
      for await (const [key, value] of Object.entries(files)) {
        obj[(key.split(`${id}/`)[1])] = await value() as string
      }

      data.value = parseToFileTree(obj)
    }
  })

  const flattenData = computed(() => {
    if (!data.value)
      return []

    const result: FileTreeWithParent[] = []

    function traverse(node: FileTreeWithParent, parentNames: string[] = []) {
      const nodeCopy: FileTreeWithParent = { ...node }
      nodeCopy.parents = [...parentNames]
      result.push(nodeCopy)
      if (node.children && node.children.length > 0) {
        const updatedParents = [...parentNames, node.name]
        for (const child of node.children) {
          traverse(child, updatedParents)
        }
      }
    }

    for (const node of data.value) {
      traverse(node)
    }

    return result
  })

  return {
    data,
    flattenData,
  }
}

function parseToFileTree(files: Record<string, string>): FileTree[] {
  const root: FileTree = {
    name: 'root',
    children: [],
  }

  // Sort paths to ensure parent directories are processed before children
  const paths = Object.keys(files).sort()

  for (const path of paths) {
    // Split the path into segments
    const segments = path.split('/').filter(s => s !== '')

    // Process each path
    let currentNode = root
    let currentPath = ''

    // Process each segment except the last one (which is the file)
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`

      // Check if this directory already exists in current node's children
      let found = false
      for (const child of currentNode.children || []) {
        if (child.name === segment && !child.content) { // It's a directory if it has no content
          found = true
          currentNode = child
          break
        }
      }

      // If not found, create new directory node
      if (!found) {
        const newNode: FileTree = {
          name: segment,
          path: currentPath,
          children: [],
        }
        if (!currentNode.children)
          currentNode.children = []
        currentNode.children.push(newNode)
        currentNode = newNode
      }
    }

    // Process the file (last segment)
    const name = segments[segments.length - 1]

    const fileNode: FileTree = {
      name,
      path,
      content: files[path],
    }

    if (!currentNode.children)
      currentNode.children = []
    currentNode.children.push(fileNode)
  }

  // Return the children of root directly instead of returning root itself
  return root.children || []
}
