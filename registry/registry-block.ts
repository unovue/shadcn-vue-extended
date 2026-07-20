export const block = [
  {
    name: 'dialog-01',
    type: 'registry:block',
    title: 'Dialog 01',
    description: 'A dialog block example.',
    dependencies: ['lucide-vue-next'],
    registryDependencies: [
      'button',
      'dialog',
    ],
    files: [
      {
        path: 'blocks/dialog-01/index.vue',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'dialog-02',
    type: 'registry:block',
    title: 'Dialog 02',
    description: 'A dialog block example.',
    dependencies: ['lucide-vue-next'],
    registryDependencies: [
      'button',
      'dialog',
    ],
    files: [
      {
        path: 'blocks/dialog-02/index.vue',
        type: 'registry:component',
      },
    ],
  },
]
