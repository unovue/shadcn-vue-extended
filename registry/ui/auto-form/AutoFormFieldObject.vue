<script setup lang="ts" generic="T extends ZodRawShape">
import type { ZodAny, ZodObject, ZodRawShape } from 'zod'
import type { Config, ConfigItem, Shape } from './interface'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FormItem } from '@/components/ui/form'
import { FieldContextKey, useField } from 'vee-validate'
import { computed, provide } from 'vue'
import AutoFormField from './AutoFormField.vue'
import AutoFormLabel from './AutoFormLabel.vue'
import { beautifyObjectName, buildShape, getBaseSchema } from './utils'

const props = defineProps<{
  fieldName: string
  required?: boolean
  // `config` here doubles as the ConfigItem for the object field itself
  // (label/description) AND the nested Config<T> for its sub-fields.
  config?: Config<T> & ConfigItem
  schema?: ZodObject<T>
  disabled?: boolean
}>()

// `config` doubles as the ConfigItem for this object field itself, so read
// `.label`/`.description` off it directly. `schema` may be wrapped (e.g. an
// optional sub-object), so fall back to `getBaseSchema` to reach a
// `.describe()` set on the inner ZodObject.
const objectConfig = computed(() => props.config as ConfigItem | undefined)

const objectLabel = computed(() =>
  objectConfig.value?.label
  || getBaseSchema(props.schema as ZodAny)?.description
  || beautifyObjectName(props.fieldName),
)

const objectDescription = computed(() => objectConfig.value?.description)

const shapes = computed(() => {
  // @ts-expect-error ignore {} not assignable to object
  const val: { [key in keyof T]: Shape } = {}

  if (!props.schema)
    return
  const shape = getBaseSchema(props.schema)?.shape
  if (!shape)
    return
  Object.keys(shape).forEach((name) => {
    // Same `buildShape` as AutoForm.vue's top-level `shapes`, so `.readonly()`
    // skipping (#12) and union rendering (#11) behave identically for a
    // nested field — they used to apply only at the top level.
    const itemShape = buildShape(shape[name] as ZodAny)
    if (!itemShape)
      return
    val[name as keyof T] = itemShape
  })
  return val
})

const fieldContext = useField(props.fieldName)
// @ts-expect-error ignore missing `id`
provide(FieldContextKey, fieldContext)
</script>

<template>
  <section>
    <slot v-bind="props">
      <Accordion type="single" as-child class="w-full" collapsible :disabled="disabled">
        <FormItem>
          <AccordionItem :value="fieldName" class="border-none">
            <AccordionTrigger>
              <AutoFormLabel class="text-base" :required="required">
                {{ objectLabel }}
              </AutoFormLabel>
            </AccordionTrigger>
            <AccordionContent class="p-1 space-y-5">
              <p v-if="objectDescription" class="text-sm text-muted-foreground">
                {{ objectDescription }}
              </p>
              <template v-for="(shape, key) in shapes" :key="key">
                <AutoFormField
                  :config="config?.[key as keyof typeof config] as ConfigItem"
                  :field-name="`${fieldName}.${key.toString()}`"
                  :label="key.toString()"
                  :shape="shape"
                />
              </template>
            </AccordionContent>
          </AccordionItem>
        </FormItem>
      </Accordion>
    </slot>
  </section>
</template>
