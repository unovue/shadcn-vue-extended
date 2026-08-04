<script setup lang="ts">
// NOTE: `DependencyType` and `Dependency` are exported from `interface.ts`
// but are not re-exported through the `index.ts` barrel, so they're
// imported directly from the interface module here.
import type { Dependency } from '~~/registry/ui/auto-form/interface'
import { Button } from '@/components/ui/button'
import { AutoForm } from '~~/registry/ui/auto-form'
import { DependencyType } from '~~/registry/ui/auto-form/interface'
import { ref } from 'vue'
import { z } from 'zod'

const formSchema = z.object({
  age: z.number().min(0).default(20),
  parentsAllowed: z.boolean().optional(),
  vegetarian: z.boolean().default(false),
  mealOption: z.enum(['Pasta', 'Salad', 'Beef Wellington']),
  hasAllergies: z.boolean().default(false),
  // Optional by default - the REQUIRES dependency below turns this into a
  // hard validation error once `hasAllergies` is checked, not just a
  // cosmetic asterisk.
  allergyDetails: z.string().optional(),
})
  // SETS_OPTIONS only narrows what the select *renders* - it never touches
  // validation, and it can't retroactively clear a value that was already
  // chosen before the restriction kicked in. So the "vegetarians can't have
  // the Beef Wellington" rule has to be enforced in the schema too, per the
  // `refine` guidance in the dependencies docs. Without this, checking
  // "vegetarian" while Beef Wellington is already selected leaves the
  // invalid pair submittable.
  .superRefine((values, ctx) => {
    if (values.vegetarian && values.mealOption === 'Beef Wellington') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mealOption'],
        message: 'Beef Wellington is not a vegetarian option.',
      })
    }
  })

const dependencies: Dependency<z.infer<typeof formSchema>>[] = [
  {
    // Adults don't need to declare whether their parents allowed them to attend.
    sourceField: 'age',
    type: DependencyType.HIDES,
    targetField: 'parentsAllowed',
    when: age => age >= 18,
  },
  {
    // Vegetarians can't pick the Beef Wellington - remove it from the options.
    // The predicate deliberately does NOT exclude the case where Beef
    // Wellington is already selected: guarding on that would switch the
    // restriction off in exactly the situation it exists to prevent, leaving
    // the offending option selectable. The schema's superRefine above is what
    // makes the combination unsubmittable.
    sourceField: 'vegetarian',
    type: DependencyType.SETS_OPTIONS,
    targetField: 'mealOption',
    when: vegetarian => vegetarian === true,
    options: ['Pasta', 'Salad'],
  },
  {
    // Meal choice is locked while age is not yet confirmed.
    sourceField: 'age',
    type: DependencyType.DISABLES,
    targetField: 'mealOption',
    when: age => age <= 0,
  },
  {
    // Checking "has allergies" now genuinely requires allergyDetails to be
    // filled in before the form can be submitted.
    sourceField: 'hasAllergies',
    type: DependencyType.REQUIRES,
    targetField: 'allergyDetails',
    when: hasAllergies => hasAllergies === true,
  },
]

const submittedValues = ref<z.infer<typeof formSchema> | null>(null)

function onSubmit(values: z.infer<typeof formSchema>) {
  submittedValues.value = values
}
</script>

<template>
  <div class="w-full max-w-md space-y-4">
    <AutoForm :schema="formSchema" :dependencies="dependencies" @submit="onSubmit">
      <Button type="submit">
        Submit
      </Button>
    </AutoForm>

    <pre v-if="submittedValues" class="overflow-auto rounded-lg border bg-muted p-4 text-sm">{{ JSON.stringify(submittedValues, null, 2) }}</pre>
  </div>
</template>
