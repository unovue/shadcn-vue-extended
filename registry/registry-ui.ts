export const ui = [
  {
    name: 'separator-label',
    type: 'registry:ui',
    title: 'Separator Label',
    description: 'A separator with a centered label.',
    dependencies: ['reka-ui'],
    files: [
      {
        path: 'ui/separator-label/index.ts',
        type: 'registry:ui',
      },
      {
        path: 'ui/separator-label/SeparatorLabel.vue',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'auto-form',
    type: 'registry:ui',
    title: 'Auto Form',
    description: 'Automatically generate a form from a Zod schema, powered by vee-validate.',
    dependencies: [
      'vee-validate',
      '@vee-validate/zod',
      'zod',
      'reka-ui',
    ],
    registryDependencies: [
      'form',
      'accordion',
      'button',
      'separator',
      'checkbox',
      'switch',
      'calendar',
      'popover',
      'label',
      'radio-group',
      'select',
      'input',
      'textarea',
    ],
    files: [
      {
        path: 'ui/auto-form/AutoForm.vue',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/AutoFormField.vue',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/AutoFormFieldArray.vue',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/AutoFormFieldBoolean.vue',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/AutoFormFieldDate.vue',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/AutoFormFieldEnum.vue',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/AutoFormFieldFile.vue',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/AutoFormFieldInput.vue',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/AutoFormFieldNumber.vue',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/AutoFormFieldObject.vue',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/AutoFormLabel.vue',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/constant.ts',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/dependencies.ts',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/index.ts',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/interface.ts',
        type: 'registry:ui',
      },
      {
        path: 'ui/auto-form/utils.ts',
        type: 'registry:ui',
      },
    ],
  },

]
