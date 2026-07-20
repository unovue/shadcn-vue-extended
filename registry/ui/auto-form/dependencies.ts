import type { TypedSchema } from 'vee-validate'
import type { Ref } from 'vue'
import type * as z from 'zod'
import type { Dependency, EnumValues } from './interface'
import { createContext } from 'reka-ui'
import { useFieldValue, useFormValues } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import { DependencyType } from './interface'
import { getFromPath, getIndexIfArray, normalizeFormPath } from './utils'

export const [injectDependencies, provideDependencies] = createContext<Ref<Dependency<z.infer<z.ZodObject<any>>>[] | undefined>>('AutoFormDependencies')

// ---- #2/#14: REQUIRES dependencies must also drive validation ----
//
// `useDependencies` below only ever affects rendering: `isRequired` feeds the
// visual asterisk on the field label, but the vee-validate validation schema
// never learns about it, so a schema-optional field left empty submits fine
// even while a REQUIRES dependency targeting it is active. The functions in
// this section derive the same "is this REQUIRES dependency active, and is
// its target empty" semantics as pure functions of a candidate `values`
// object (no watchers, no reactive schema rebuilding), so `AutoForm.vue` can
// layer them onto the vee-validate typed schema's `parse()` step. Keeping
// this here (rather than in AutoForm.vue) means both the live-render path
// (the `watch` below) and the validation path share one definition of
// "empty" and one definition of "which value pairs a dependency applies to".
// See NOTES in the phase-2 commit for why a `schema.superRefine()` wrapper
// (applied before `toTypedSchema`) was tried first and rejected.

/**
 * Mirrors how zod treats a missing required field: `undefined`, `null`, `''`
 * and `[]` are empty. `false` and `0` are valid, present values and must NOT
 * be flagged.
 */
function isEmptyDependencyValue(value: unknown): boolean {
  if (value === undefined || value === null)
    return true
  if (typeof value === 'string')
    return value.length === 0
  if (Array.isArray(value))
    return value.length === 0
  return false
}

/**
 * Walks `segments` off `base`, expanding into every element whenever an
 * array is encountered along the way — so a schema-level path like
 * `items.hasX` resolves against every `items[N].hasX`.
 */
function expandDependencyPath(
  base: unknown,
  segments: string[],
  path: (string | number)[] = [],
): { path: (string | number)[], value: unknown }[] {
  if (segments.length === 0)
    return [{ path, value: base }]

  if (Array.isArray(base))
    return base.flatMap((item, index) => expandDependencyPath(item, segments, [...path, index]))

  if (base === null || base === undefined || typeof base !== 'object')
    return []

  const [head, ...rest] = segments
  return expandDependencyPath((base as Record<string, unknown>)[head], rest, [...path, head])
}

interface ResolvedDependencyTarget {
  targetPath: (string | number)[]
  sourceValue: unknown
  targetValue: unknown
}

/**
 * Resolves the (source value, target value, target path) triples a
 * dependency applies to for a given candidate `values` object. Mirrors
 * `getSourceValue()` below: when `sourceField` and `targetField` share the
 * same parent path (e.g. array-item siblings `items.hasX` / `items.x`) they
 * are resolved together, per-item; otherwise both are read directly off the
 * root `values`.
 */
function resolveDependencyTargets(values: Record<string, unknown>, dep: Dependency<any>): ResolvedDependencyTarget[] {
  const sourceSegments = String(dep.sourceField).split('.')
  const targetSegments = String(dep.targetField).split('.')
  const sourceParent = sourceSegments.slice(0, -1).join('.')
  const targetParent = targetSegments.slice(0, -1).join('.')
  const sourceLast = sourceSegments[sourceSegments.length - 1]
  const targetLast = targetSegments[targetSegments.length - 1]

  if (sourceParent && sourceParent === targetParent) {
    return expandDependencyPath(values, sourceParent.split('.')).map(({ path, value: base }) => ({
      targetPath: [...path, targetLast],
      sourceValue: getFromPath(base as Record<string, unknown>, sourceLast),
      targetValue: getFromPath(base as Record<string, unknown>, targetLast),
    }))
  }

  return [{
    targetPath: targetSegments,
    sourceValue: getFromPath(values, String(dep.sourceField)),
    targetValue: getFromPath(values, String(dep.targetField)),
  }]
}

/**
 * Pure function: given a candidate form `values` object and the dependency
 * list, returns the validation issues an active-and-empty REQUIRES
 * dependency should raise. Exported for direct unit testing.
 */
export function getRequiresDependencyIssues(
  values: Record<string, unknown>,
  dependencies: Dependency<any>[] | undefined,
): { path: string, message: string }[] {
  if (!dependencies?.length)
    return []

  const issues: { path: string, message: string }[] = []

  dependencies.forEach((dep) => {
    if (dep.type !== DependencyType.REQUIRES)
      return

    resolveDependencyTargets(values, dep).forEach(({ targetPath, sourceValue, targetValue }) => {
      if (dep.when(sourceValue, targetValue) && isEmptyDependencyValue(targetValue)) {
        issues.push({
          path: normalizeFormPath(targetPath.map(String).join('.')),
          message: 'Required',
        })
      }
    })
  })

  return issues
}

/**
 * Wraps a vee-validate typed schema so its `parse()` step also raises the
 * issues from `getRequiresDependencyIssues`, without touching `cast()` /
 * `describe()`. Those must keep reading the original, unwrapped typed schema
 * so default-value extraction (`resolveInitialValues` in vee-validate core,
 * which falls back to `getDefaults()` in @vee-validate/zod when `.parse()`
 * throws) is unaffected by dependency-driven issues.
 */
export function withDependencyValidation<TInput, TOutput>(
  typedSchema: TypedSchema<TInput, TOutput>,
  dependencies: Dependency<any>[] | undefined,
): TypedSchema<TInput, TOutput> {
  if (!dependencies?.some(dep => dep.type === DependencyType.REQUIRES))
    return typedSchema

  return {
    ...typedSchema,
    async parse(values, context) {
      const base = await typedSchema.parse(values, context)
      const dependencyIssues = getRequiresDependencyIssues(values as Record<string, unknown>, dependencies)
      if (!dependencyIssues.length)
        return base

      const errors = base.errors.map(error => ({ ...error, errors: [...error.errors] }))
      dependencyIssues.forEach(({ path, message }) => {
        const existing = errors.find(error => error.path === path)
        if (existing)
          existing.errors.push(message)
        else
          errors.push({ path, errors: [message] })
      })

      return { value: base.value, errors }
    },
  }
}

export default function useDependencies(
  fieldName: string,
) {
  const form = useFormValues()
  // parsed test[0].age => test.age
  const currentFieldName = fieldName.replace(/\[\d+\]/g, '')
  const currentFieldValue = useFieldValue<any>(fieldName)

  if (!form)
    throw new Error('useDependencies should be used within <AutoForm>')

  const dependencies = injectDependencies()
  const isDisabled = ref(false)
  const isHidden = ref(false)
  const isRequired = ref(false)
  const overrideOptions = ref<EnumValues | undefined>()

  const currentFieldDependencies = computed(() => dependencies.value?.filter(
    dependency => dependency.targetField === currentFieldName,
  ))

  function getSourceValue(dep: Dependency<any>) {
    const source = dep.sourceField as string
    const index = getIndexIfArray(fieldName) ?? -1
    const [sourceLast, ...sourceInitial] = source.split('.').reverse()
    const [_targetLast, ...targetInitial] = (dep.targetField as string).split('.').reverse()

    if (index >= 0 && sourceInitial.join(',') === targetInitial.join(',')) {
      const [_currentLast, ...currentInitial] = fieldName.split('.').reverse()
      return getFromPath(form.value, currentInitial.join('.') + sourceLast)
    }

    return getFromPath(form.value, source)
  }

  const sourceFieldValues = computed(() => currentFieldDependencies.value?.map(dep => getSourceValue(dep)))

  const resetConditionState = () => {
    isDisabled.value = false
    isHidden.value = false
    isRequired.value = false
    overrideOptions.value = undefined
  }

  watch([sourceFieldValues, dependencies], () => {
    resetConditionState()
    currentFieldDependencies.value?.forEach((dep) => {
      const sourceValue = getSourceValue(dep)
      const conditionMet = dep.when(sourceValue, currentFieldValue.value)

      switch (dep.type) {
        case DependencyType.DISABLES:
          if (conditionMet)
            isDisabled.value = true

          break
        case DependencyType.REQUIRES:
          if (conditionMet)
            isRequired.value = true

          break
        case DependencyType.HIDES:
          if (conditionMet)
            isHidden.value = true

          break
        case DependencyType.SETS_OPTIONS:
          if (conditionMet)
            overrideOptions.value = dep.options

          break
      }
    })
  }, { immediate: true, deep: true })

  return {
    isDisabled,
    isHidden,
    isRequired,
    overrideOptions,
  }
}
