<script setup lang="ts" generic="T extends ZodObjectOrWrapped">
import type { FormContext, GenericObject } from 'vee-validate'
import type { z, ZodAny } from 'zod'
import type { Config, ConfigItem, Dependency, Shape } from './interface'
import type { ZodObjectOrWrapped } from './utils'
import { Form } from '@/components/ui/form'
import { toTypedSchema } from '@vee-validate/zod'
import { computed, toRefs } from 'vue'
import AutoFormField from './AutoFormField.vue'
import { provideDependencies, withDependencyValidation } from './dependencies'
import { buildShape, getObjectFormSchema } from './utils'

const props = defineProps<{
  schema: T
  form?: FormContext<GenericObject>
  fieldConfig?: Config<z.infer<T>>
  dependencies?: Dependency<z.infer<T>>[]
}>()

const emits = defineEmits<{
  submit: [event: z.infer<T>]
}>()

const { dependencies } = toRefs(props)
provideDependencies(dependencies)

const shapes = computed(() => {
  // @ts-expect-error ignore {} not assignable to object
  const val: { [key in keyof T]: Shape } = {}
  const baseSchema = getObjectFormSchema(props.schema)
  const shape = baseSchema.shape
  Object.keys(shape).forEach((name) => {
    // `buildShape` returns null for a `.readonly()` field (BUG #12) — render
    // nothing for it rather than an editable control. It also resolves union
    // rendering (#11) and enum options (#3); see its JSDoc.
    const itemShape = buildShape(shape[name] as ZodAny)
    if (!itemShape)
      return
    val[name as keyof T] = itemShape
  })
  return val
})

const fields = computed(() => {
  // @ts-expect-error ignore {} not assignable to object
  const val: { [key in keyof z.infer<T>]: { shape: Shape, fieldName: string, config: ConfigItem } } = {}
  for (const key in shapes.value) {
    const shape = shapes.value[key]
    val[key as keyof z.infer<T>] = {
      shape,
      config: props.fieldConfig?.[key] as ConfigItem,
      fieldName: key,
    }
  }
  return val
})

const formComponent = computed(() => props.form ? 'form' : Form)
const formComponentProps = computed(() => {
  if (props.form) {
    return {
      onSubmit: props.form.handleSubmit(val => emits('submit', val)),
    }
  }
  else {
    // Layer REQUIRES-dependency validation onto the typed schema without
    // touching `props.schema` itself — `cast()`/`describe()` must keep
    // reading the original schema so default-value extraction is unaffected
    // (see NOTES in dependencies.ts).
    const formSchema = withDependencyValidation(toTypedSchema(props.schema), props.dependencies)
    return {
      keepValues: true,
      validationSchema: formSchema,
      onSubmit: (val: GenericObject) => emits('submit', val),
    }
  }
})
</script>

<template>
  <!--
    Fields carry no outer margin of their own, so the form owns the rhythm
    between them. `space-y-5` matches the spacing nested object fields already
    use in AutoFormFieldObject, so a nested group reads the same as the top
    level. A `class` passed by the caller still merges in and can override it.
  -->
  <component
    :is="formComponent"
    v-bind="formComponentProps"
    class="space-y-5"
  >
    <slot name="customAutoForm" :fields="fields">
      <template v-for="(shape, key) of shapes" :key="key">
        <slot
          :shape="shape"
          :name="key.toString() as keyof z.infer<T>"
          :field-name="key.toString()"
          :config="fieldConfig?.[key as keyof typeof fieldConfig] as ConfigItem"
        >
          <AutoFormField
            :config="fieldConfig?.[key as keyof typeof fieldConfig] as ConfigItem"
            :field-name="key.toString()"
            :shape="shape"
          />
        </slot>
      </template>
    </slot>

    <slot :shapes="shapes" />
  </component>
</template>
