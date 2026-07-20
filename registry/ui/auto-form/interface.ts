import type { Component, InputHTMLAttributes } from 'vue'
import type { z, ZodAny } from 'zod'
import type { INPUT_COMPONENTS } from './constant'

export interface FieldProps {
  fieldName: string
  label?: string
  required?: boolean
  config?: ConfigItem
  disabled?: boolean
}

export interface Shape {
  type: string
  default?: any
  required?: boolean
  options?: string[]
  schema?: ZodAny
}

export interface InputComponents {
  date: Component
  select: Component
  radio: Component
  checkbox: Component
  switch: Component
  textarea: Component
  number: Component
  string: Component
  file: Component
  array: Component
  object: Component
};

export interface ConfigItem {
  /** Value for the `FormLabel` */
  label?: string
  /** Value for the `FormDescription` */
  description?: string
  /**
   * Pick which component to be rendered. Either one of the built-in
   * `INPUT_COMPONENTS` keys, or a custom `Component` for full control over
   * the field's markup.
   *
   * Contract for a custom component: `AutoFormField.vue` mounts it in place
   * of the built-in field and binds exactly the `FieldProps` shape —
   * `fieldName`, `label`, `required`, `options`, `disabled`, and `config`
   * (this same `ConfigItem`, so the custom component can read
   * `config.inputProps`, `config.description`, etc. itself). It receives no
   * other props. To match the built-in fields' label/description/validation
   * message skeleton, wrap the control in `AutoFormFieldWrapper` (exported
   * from `./index.ts`), which owns that skeleton and exposes the
   * `vee-validate` `FormField` slot props (`componentField`, etc.) through
   * its default slot.
   */
  component?: keyof typeof INPUT_COMPONENTS | Component
  /** Hide `FormLabel`. */
  hideLabel?: boolean
  inputProps?: InputHTMLAttributes

  // ---- Phase 4C ----
  /**
   * Explicit value/label pairs for an enum-rendered field (`select` or
   * `radio` variant of `AutoFormFieldEnum`). When set, this takes
   * precedence over the schema-derived `options` (plain strings, where the
   * string doubles as both value and beautified label): each option's
   * `label` is displayed and its `value` is what gets submitted. This is a
   * rendering-only concern — the underlying zod enum/literal union must
   * still validate against the `value`s listed here; keeping the two in
   * sync is the consumer's responsibility.
   */
  options?: Array<{ value: string, label: string }>
  /**
   * The value submitted when an `AutoFormFieldBoolean` checkbox is checked.
   * Defaults to `true`. Only honored by the `checkbox` variant — the
   * `switch` variant is always a plain boolean and ignores this.
   */
  checkedValue?: unknown
  /**
   * The value submitted when an `AutoFormFieldBoolean` checkbox is
   * unchecked. Defaults to `false`. Only honored by the `checkbox`
   * variant — the `switch` variant is always a plain boolean and ignores
   * this.
   */
  uncheckedValue?: unknown
  /**
   * When set, `AutoFormFieldBoolean`'s `checkbox` variant becomes a
   * tri-state control that cycles `checkedValue` -> `uncheckedValue` ->
   * `indeterminateValue` -> `checkedValue` ... on each click, using
   * reka-ui's `CheckboxRoot` indeterminate visual state. Unset (the
   * default) keeps the checkbox a plain two-state toggle. The `switch`
   * variant ignores this — it is always a plain boolean. The schema side
   * (validating that the field may hold `indeterminateValue`, e.g.
   * `z.union([z.literal(true), z.literal(false), z.literal('excluded')])`)
   * is the consumer's responsibility.
   */
  indeterminateValue?: unknown
}

// Define a type to unwrap an array
type UnwrapArray<T> = T extends (infer U)[] ? U : never

export type Config<SchemaType extends object> = {
  // If SchemaType.key is an object, create a nested Config, otherwise ConfigItem
  [Key in keyof SchemaType]?:
  SchemaType[Key] extends any[]
    ? UnwrapArray<Config<SchemaType[Key]>>
    : SchemaType[Key] extends object
      ? Config<SchemaType[Key]>
      : ConfigItem;
}

export enum DependencyType {
  DISABLES,
  REQUIRES,
  HIDES,
  SETS_OPTIONS,
}

interface BaseDependency<SchemaType extends z.infer<z.ZodObject<any, any>>> {
  sourceField: keyof SchemaType
  type: DependencyType
  targetField: keyof SchemaType
  when: (sourceFieldValue: any, targetFieldValue: any) => boolean
}

export type ValueDependency<SchemaType extends z.infer<z.ZodObject<any, any>>> =
  BaseDependency<SchemaType> & {
    type:
      | DependencyType.DISABLES
      | DependencyType.REQUIRES
      | DependencyType.HIDES
  }

export type EnumValues = readonly [string, ...string[]]

export type OptionsDependency<
  SchemaType extends z.infer<z.ZodObject<any, any>>,
> = BaseDependency<SchemaType> & {
  type: DependencyType.SETS_OPTIONS

  // Partial array of values from sourceField that will trigger the dependency
  options: EnumValues
}

export type Dependency<SchemaType extends z.infer<z.ZodObject<any, any>>> =
  | ValueDependency<SchemaType>
  | OptionsDependency<SchemaType>
