---
title: AutoForm
description: Automatically generate a form from Zod schema.
contributors: ['zernonia']
---

## What is AutoForm

AutoForm is a drop-in form builder for your internal and low-priority forms with existing zod schemas. For example, if you already have zod schemas for your API and want to create a simple admin panel to edit user profiles, simply pass the schema to AutoForm and you're done.

::callout
Credit: Heavily inspired by [AutoForm](https://github.com/vantezzen/auto-form) by Vantezzen
::

::component-preview{path=/registry/examples/AutoFormBasic.vue}
::

## Installation

<Steps>

### Run the following command

```bash
npx shadcn-vue@latest update form
npx shadcn-vue@latest add auto-form
```

</Steps>

## Field types

Currently, these field types are supported out of the box:

- boolean (checkbox, switch) — the checkbox variant also supports a tri-state [indeterminate mode](#checkedvalue-uncheckedvalue-indeterminatevalue)
- date (date picker)
- enum (select, radio group)
- number (input)
- string (input, textarea, [pin input](#component))
- array of strings ([tags input](#component))
- array of objects (accordion, add/remove items)
- object (nested accordion)
- file (file)

You can add support for other field types by adding them to the `INPUT_COMPONENTS` object in `auto-form/constant.ts`.

Two things worth knowing about how schemas map to rendered fields:

- Fields marked `.readonly()` are skipped entirely — AutoForm renders nothing for them, rather than an editable control. See [Readonly fields](#readonly-fields).
- A `z.union([...])` field renders using its first "meaningful" member (skipping bare literals/`undefined`/`null` placeholders), while validation still runs against the full union. See [Unions](#unions).

## Zod configuration

### Validations

Your form schema can use any of zod's validation methods including refine.

<Callout>

⚠️ However, there's a known issue with Zod’s `refine` and `superRefine` not executing whenever some object keys are missing.
[Read more](https://github.com/logaretm/vee-validate/issues/4338)

</Callout>

### Descriptions

You can use the `describe` method to set a label for each field. If no label is set, the field name will be used and un-camel-cased.

```ts
const formSchema = z.object({
  username: z.string().describe('Your username'),
  someValue: z.string(), // Will be "Some Value"
})
```

You can also configure the label with [`fieldConfig`](#label) too.

### Optional fields

By default, all fields are required. You can make a field optional by using the `optional` method.

```ts
const formSchema = z.object({
  username: z.string().optional(),
})
```

### Default values

You can set a default value for a field using the `default` method.

```ts
const formSchema = z.object({
  favouriteNumber: z.number().default(5),
})
```

If you want to set default value of date, convert it to Date first using `new Date(val)`.

### Select/Enums

AutoForm supports `enum` and `nativeEnum` to create select fields.

```ts
const formSchema = z.object({
  color: z.enum(['red', 'green', 'blue']),
})

enum BreadTypes {
  // For native enums, you can alternatively define a backed enum to set a custom label
  White = 'White bread',
  Brown = 'Brown bread',
  Wholegrain = 'Wholegrain bread',
  Other,
}
// Keep in mind that zod will validate and return the enum labels, not the enum values!
const nativeEnumSchema = z.object({
  bread: z.nativeEnum(BreadTypes),
})
```

### Unions

A `z.union()` field renders using its first non-literal, non-`undefined`, non-`null` member (falling back to the first member if every option is a placeholder). Validation still runs against the whole union — only which component gets picked for rendering is affected. The canonical case is an optional email modeled as a union, so an explicit empty string is a valid value alongside a real email:

```ts
const formSchema = z.object({
  email: z.union([z.literal(''), z.string().email().optional()]),
})
```

::component-preview{path=/registry/examples/AutoFormUnion.vue}
::

### Readonly fields

Fields marked `.readonly()` are skipped entirely and never rendered — use this for values you want present on the inferred type (e.g. an `id` returned by your API) without exposing an editable control for them.

```ts
const formSchema = z.object({
  id: z.string().readonly(),
  name: z.string(),
})
```

## Field configuration

As zod doesn't allow adding other properties to the schema, you can use the `fieldConfig` prop to add additional configuration for the UI of each field.

```vue
<template>
  <AutoForm
    :field-config="{
      username: {
        // fieldConfig
      },
    }"
  />
</template>
```

### Label

You can use the `label` property to customize label if you want to overwrite the pre-defined label via [Zod's description](#descriptions).

```ts
const fieldConfig = {
  username: {
    label: 'Custom username',
  },
}
```

### Description

You can use the `description` property to add a description below the field.

```ts
const fieldConfig = {
  username: {
    description: 'Enter a unique username. This will be shown to other users.',
  },
}
```

### hideLabel

Use `hideLabel` to hide the field's `FormLabel` entirely.

```ts
const fieldConfig = {
  username: {
    hideLabel: true,
  },
}
```

### Input props

You can use the `inputProps` property to pass props to the input component. You can use any props that the HTML component accepts.

```ts
const fieldConfig = {
  username: {
    inputProps: {
      type: 'text',
      placeholder: 'Username',
    },
  },
}

// This will be rendered as:
// <input type="text" placeholder="Username" />
```

### Component

By default, AutoForm will use the Zod type to determine which input component to use. You can override this by using the `component` property.

```ts
const fieldConfig = {
  acceptTerms: {
    // Booleans use a checkbox by default, use a switch instead
    component: 'switch',
  },
}
```

The complete list of supported field types is typed. Current supported types are:

- `checkbox` (default for booleans)
- `switch`
- `date` (default for dates)
- `select` (default for enums)
- `radio`
- `textarea`
- `tags` — for a `z.array(z.string())` field, renders a tags input instead of the default accordion
- `pin` — for a `z.string()` field, renders a segmented one-time-code input. It always renders 6 slots unless you override the count via `inputProps.maxlength` — the schema's own `.length()` check is not read for this.

::component-preview{path=/registry/examples/AutoFormTags.vue}
::

::component-preview{path=/registry/examples/AutoFormPin.vue}
::

Alternatively, you can pass a Vue component to the `component` property to use a custom component. The contract: `AutoFormField.vue` mounts your component in place of the built-in field and binds exactly the `FieldProps` shape — `fieldName`, `label`, `required`, `options`, `disabled`, and `config` (the same `ConfigItem`, so your component can read `config.inputProps`, `config.description`, etc. itself). It receives no other props.

To match the built-in fields' label/description/validation-message skeleton, wrap your control in `AutoFormFieldWrapper` (exported from `@/registry/ui/auto-form`), which owns that skeleton and exposes the `vee-validate` `FormField` slot props (`componentField`, etc.) through its default slot.

```vue
<script setup lang="ts">
import type { FieldProps } from '@/registry/ui/auto-form'
import { AutoFormFieldWrapper } from '@/registry/ui/auto-form'

const props = defineProps<FieldProps>()
</script>

<template>
  <AutoFormFieldWrapper v-bind="props">
    <template #default="slotProps">
      <input type="text" v-bind="slotProps.componentField">
    </template>
  </AutoFormFieldWrapper>
</template>
```

Pass the above component in `fieldConfig`.

```ts
const fieldConfig = {
  username: {
    component: CustomField,
  },
}
```

::component-preview{path=/registry/examples/AutoFormCustomComponent.vue}
::

### Icon

Use `icon` to render an icon inside `AutoFormFieldInput`'s control (the `string`/`textarea` field). It's a no-op for every other field component.

```ts
const fieldConfig = {
  email: {
    icon: { component: MailIcon },
  },
  query: {
    icon: { component: SearchIcon, position: 'right' },
  },
}
```

`position` accepts `'left'` (default) or `'right'`.

::component-preview{path=/registry/examples/AutoFormInputIcon.vue}
::

### Options

By default, an enum's select/radio options are derived straight from the schema — each string doubles as both the submitted value and its beautified display label. Use `options` to pass explicit value/label pairs instead: each option's `label` is displayed, and its `value` is what gets submitted.

```ts
const fieldConfig = {
  plan: {
    options: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro ($10/mo)' },
    ],
  },
}
```

This is a rendering-only concern — your zod enum/union must still validate against the `value`s listed here; keeping the two in sync is up to you.

::component-preview{path=/registry/examples/AutoFormValueLabelOptions.vue}
::

### checkedValue, uncheckedValue, indeterminateValue

These only apply to the `checkbox` variant of a boolean field — the `switch` variant is always a plain boolean and ignores all three.

- `checkedValue` / `uncheckedValue` — the value submitted when the checkbox is checked / unchecked. Default to plain `true` / `false`.
- `indeterminateValue` — when set, the checkbox becomes a tri-state control that cycles `checkedValue -> uncheckedValue -> indeterminateValue -> checkedValue -> ...` on each click, using reka-ui's indeterminate visual state.

```ts
const fieldConfig = {
  taskStatus: {
    component: 'checkbox',
    checkedValue: 'done',
    uncheckedValue: 'todo',
    indeterminateValue: 'partial',
  },
}
```

Your zod schema is responsible for validating that the field may actually hold `indeterminateValue`, e.g. `z.union([z.literal('done'), z.literal('todo'), z.literal('partial')])`.

::component-preview{path=/registry/examples/AutoFormIndeterminate.vue}
::

### Named slot

You can use Vue named slot to customize the rendered `AutoFormField`.

```vue
<template>
  <AutoForm
    :field-config="{
      customParent: {
        label: 'Wrapper',
      },
    }"
  >
    <template #customParent="slotProps">
      <div class="flex items-end space-x-2">
        <AutoFormField v-bind="slotProps" class="w-full" />
        <Button type="button">
          Check
        </Button>
      </div>
    </template>
  </AutoForm>
</template>
```

### Accessing the form data

There are two ways to access the form data:

#### @submit

The preferred way is to use the `submit` emit. This will be called when the form is submitted and the data is valid.

```vue
<template>
  <AutoForm
    @submit="(data) => {
      // Do something with the data
    }"
  />
</template>
```

#### Controlled form

By passing the `form` as props, you can control and use the method provided by `Form`.

```vue
<script setup lang="ts">
import { AutoForm } from '@/registry/ui/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

const schema = z.object({
  username: z.string(),
})
const form = useForm({
  validationSchema: toTypedSchema(schema),
})

form.setFieldValue('username', 'bar')
</script>

<template>
  <AutoForm :form="form" :schema="schema" />
</template>
```

### Submitting the form

You can use any `button` component to create a submit button. Most importantly is to add attributes `type="submit"`.

```vue
<template>
  <AutoForm>
    <CustomButton type="submit">
      Send now
    </CustomButton>
  </AutoForm>

  // or
  <AutoForm>
    <button type="submit">
      Send now
    </button>
  </AutoForm>
</template>
```

### Adding other elements

All children passed to the `AutoForm` component will be rendered below the form.

```vue
<template>
  <AutoForm>
    <Button>Send now</Button>
    <p class="text-gray-500 text-sm">
      By submitting this form, you agree to our
      <a href="#" class="text-primary underline">
        terms and conditions
      </a>.
    </p>
  </AutoForm>
</template>
```

## Dependencies

AutoForm allows you to add dependencies between fields to control fields based on the value of other fields. For this, a `dependencies` array can be passed to the `AutoForm` component.

```vue
<template>
  <AutoForm
    :dependencies="[
      {
        // 'age' hides 'parentsAllowed' when the age is 18 or older
        sourceField: 'age',
        type: DependencyType.HIDES,
        targetField: 'parentsAllowed',
        when: age => age >= 18,
      },
      {
        // 'vegetarian' checkbox hides the 'Beef Wellington' option from 'mealOptions'
        // if its not already selected
        sourceField: 'vegetarian',
        type: DependencyType.SETS_OPTIONS,
        targetField: 'mealOptions',
        when: (vegetarian, mealOption) =>
          vegetarian && mealOption !== 'Beef Wellington',
        options: ['Pasta', 'Salad'],
      },
    ]"
  />
</template>
```

`DependencyType` and the `Dependency` type are exported from `auto-form/interface`.

The following dependency types are supported:

- `DependencyType.HIDES`: Hides the target field when the `when` function returns true
- `DependencyType.DISABLES`: Disables the target field when the `when` function returns true
- `DependencyType.REQUIRES`: Marks the target field as required when the `when` function returns true — and, since it now layers onto form validation, blocks submission if the target is left empty while the dependency is active (see below)
- `DependencyType.SETS_OPTIONS`: Sets the options of the target field to the `options` array when the `when` function returns true

The `when` function is called with the value of the source field and the value of the target field and should return a boolean to indicate if the dependency should be applied.

Please note that dependencies will not cause the inverse action when returning `false` - for example, if you mark a field as required in your zod schema (i.e. by not explicitly setting `optional`), returning `false` in your `REQUIRES` dependency will not mark it as optional. You should instead use zod's `optional` method to mark as optional by default and use the `REQUIRES` dependency to mark it as required when the dependency is met.

`HIDES`, `DISABLES`, and `SETS_OPTIONS` have no effect on form validation — use zod's `refine` method if you need cross-field validation for those. `REQUIRES` is the one exception: an active `REQUIRES` dependency is enforced at submit time, not just shown as a cosmetic asterisk on the label — submitting with the target field empty blocks submission and renders a validation message, exactly as if the field were required in the schema itself.

You can create multiple dependencies for the same field and dependency type - for example to hide a field based on multiple other fields. This will then hide the field when any of the dependencies are met.

::component-preview{path=/registry/examples/AutoFormDependencies.vue}
::

## Sub-objects & arrays

You can nest objects to create accordion sections.

```ts
const formSchema = z.object({
  address: z.object({
    street: z.string(),
    city: z.string(),
    zip: z.string(),

    // You can nest objects as deep as you want
    nested: z.object({
      foo: z.string(),
      bar: z.string(),

      nested: z.object({
        foo: z.string(),
        bar: z.string(),
      }),
    }),
  }),
})
```

Like with normal objects, you can use the `describe` method to set a label and description for the section:

```ts
const formSchemaWithLabel = z.object({
  address: z
    .object({
      street: z.string(),
      city: z.string(),
      zip: z.string(),
    })
    .describe('Your address'),
})
```

A nested object's accordion label and description also honor `fieldConfig`'s `label`/`description` for that key — `fieldConfig.address.label` takes priority over the schema's own `.describe()`, which in turn takes priority over the beautified field name.

```ts
const fieldConfig = {
  address: {
    label: 'Shipping address',
    description: 'Where should we send your order?',
  },
}
```

AutoForm supports arrays _of objects_. Because inferring things like field labels from arrays of strings/numbers/etc. is difficult, only objects are supported by the accordion + add/remove UI (arrays of plain strings can instead use the [`tags` component](#component)).

```ts
const formSchemaWithArray = z.object({
  guestListName: z.string(),
  invitedGuests: z
    .array(
      // Define the fields for each item
      z.object({
        name: z.string(),
        age: z.number(),
      }),
    )
    // Optionally set a custom label - otherwise this will be inferred from the field name
    .describe('Guests invited to the party'),
})
```

Arrays are not supported as the root element of the form schema.

You also can set default value of an array using .default(), but please make sure the array element has same structure with the schema.

```ts
const formSchemaWithArrayDefault = z.object({
  guestListName: z.string(),
  invitedGuests: z
    .array(
      z.object({
        name: z.string(),
        age: z.number(),
      }),
    )
    .describe('Guests invited to the party')
    .default([
      { name: 'John', age: 24 },
      { name: 'Jane', age: 20 },
    ]),
})
```

::component-preview{path=/registry/examples/AutoFormObjectArray.vue}
::
