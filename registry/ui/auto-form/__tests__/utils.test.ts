import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  beautifyObjectName,
  booleanishToBoolean,
  getBaseSchema,
  getBaseType,
  getDefaultValueInZodStack,
  getFromPath,
  getIndexIfArray,
  getObjectFormSchema,
  isNotNestedPath,
  maybeBooleanishToBoolean,
  normalizeFormPath,
} from '../utils'

describe('beautifyObjectName', () => {
  it('splits camelCase into title case words', () => {
    expect(beautifyObjectName('myFieldName')).toBe('My Field Name')
  })

  it('capitalizes a single lowercase word', () => {
    expect(beautifyObjectName('name')).toBe('Name')
  })

  it('strips bracketed array indices', () => {
    expect(beautifyObjectName('tags[0].name')).toBe('Tags.name')
  })
})

describe('getIndexIfArray', () => {
  it('extracts the numeric index from a bracketed path segment', () => {
    expect(getIndexIfArray('tags[3]')).toBe(3)
  })

  it('returns undefined when there is no bracketed index', () => {
    expect(getIndexIfArray('tags')).toBeUndefined()
  })
})

describe('getBaseSchema / getBaseType', () => {
  it('resolves ZodString', () => {
    expect(getBaseType(z.string() as any)).toBe('ZodString')
  })

  it('resolves ZodNumber', () => {
    expect(getBaseType(z.number() as any)).toBe('ZodNumber')
  })

  it('resolves ZodBoolean', () => {
    expect(getBaseType(z.boolean() as any)).toBe('ZodBoolean')
  })

  it('resolves ZodDate', () => {
    expect(getBaseType(z.date() as any)).toBe('ZodDate')
  })

  it('resolves ZodEnum', () => {
    const schema = z.enum(['red', 'green'])
    expect(getBaseType(schema as any)).toBe('ZodEnum')
    expect(getBaseSchema(schema as any)?._def.values).toEqual(['red', 'green'])
  })

  it('resolves ZodNativeEnum, with values as a plain object (not an array)', () => {
    enum Fruit {
      Apple = 'apple',
      Banana = 'banana',
    }
    const schema = z.nativeEnum(Fruit)
    expect(getBaseType(schema as any)).toBe('ZodNativeEnum')
    // Unlike ZodEnum, the raw `.values` here is an object map, not an array —
    // callers (AutoForm.vue) must Object.values() it themselves.
    expect(getBaseSchema(schema as any)?._def.values).toEqual({ Apple: 'apple', Banana: 'banana' })
  })

  it('resolves ZodArray', () => {
    expect(getBaseType(z.array(z.string()) as any)).toBe('ZodArray')
  })

  it('resolves ZodObject', () => {
    expect(getBaseType(z.object({ a: z.string() }) as any)).toBe('ZodObject')
  })

  it('unwraps ZodOptional down to the inner type', () => {
    const schema = z.string().optional()
    expect(getBaseType(schema as any)).toBe('ZodString')
    expect(getBaseSchema(schema as any) instanceof z.ZodString).toBe(true)
  })

  it('unwraps ZodDefault down to the inner type', () => {
    const schema = z.string().default('hello')
    expect(getBaseType(schema as any)).toBe('ZodString')
  })

  it('unwraps optional+default and default+optional stacks equally', () => {
    expect(getBaseType(z.string().optional().default('x') as any)).toBe('ZodString')
    expect(getBaseType(z.string().default('x').optional() as any)).toBe('ZodString')
  })

  it('preserves .describe() through unwrapping', () => {
    const schema = z.string().describe('hello world')
    expect(getBaseSchema(schema as any)?.description).toBe('hello world')
  })

  // BUG(#3) precursor fact: getBaseSchema/getBaseType correctly unwrap a
  // z.preprocess()-wrapped enum down to the underlying ZodEnum (via the
  // ZodEffects `schema` def key), so the unwrapping utilities themselves are
  // NOT where BUG #3 (initial value fails to match Select options for an
  // enum nested in an array — see fields.test.ts) originates.
  it('unwraps a z.preprocess-wrapped enum down to ZodEnum', () => {
    const schema = z.preprocess(v => v, z.enum(['red', 'green']))
    expect(getBaseType(schema as any)).toBe('ZodEnum')
    const base = getBaseSchema(schema as any)
    expect(base instanceof z.ZodEnum).toBe(true)
    expect(base?._def.values).toEqual(['red', 'green'])
  })

  it('unwraps a z.preprocess-wrapped, defaulted enum and finds the default', () => {
    const schema = z.preprocess(v => v, z.enum(['red', 'green']).default('green'))
    expect(getBaseType(schema as any)).toBe('ZodEnum')
    expect(getDefaultValueInZodStack(schema as any)).toBe('green')
  })

  // BUG(#12): .readonly() unwraps cleanly to the inner schema/type at the
  // utils layer — nothing in getBaseSchema/getBaseType is aware of
  // ZodReadonly, which is exactly why no component downstream ever disables
  // the rendered control (see fields.test.ts).
  it('unwraps .readonly() down to the inner type', () => {
    const schema = z.string().readonly()
    expect(schema._def.typeName).toBe('ZodReadonly')
    expect(getBaseType(schema as any)).toBe('ZodString')
    expect(getBaseSchema(schema as any) instanceof z.ZodString).toBe(true)
  })
})

describe('getDefaultValueInZodStack', () => {
  it('returns undefined when there is no ZodDefault in the stack', () => {
    expect(getDefaultValueInZodStack(z.string() as any)).toBeUndefined()
  })

  it('returns the default value for a plain ZodDefault', () => {
    expect(getDefaultValueInZodStack(z.string().default('hi') as any)).toBe('hi')
  })

  it('finds the default through an optional wrapper', () => {
    expect(getDefaultValueInZodStack(z.string().default('hi').optional() as any)).toBe('hi')
  })
})

describe('getObjectFormSchema', () => {
  it('returns a plain ZodObject unchanged', () => {
    const schema = z.object({ a: z.string() })
    expect(getObjectFormSchema(schema)).toBe(schema)
  })

  it('unwraps a ZodEffects (e.g. .refine()) down to the underlying ZodObject', () => {
    const schema = z.object({ a: z.string() })
    const refined = schema.refine(() => true)
    expect(getObjectFormSchema(refined as any)).toBe(schema)
  })
})

describe('normalizeFormPath', () => {
  it('converts numeric dot-segments into bracket syntax', () => {
    expect(normalizeFormPath('a.b.0.c')).toBe('a.b[0].c')
  })

  it('leaves a simple path untouched', () => {
    expect(normalizeFormPath('name')).toBe('name')
  })

  it('returns an empty string for an empty path', () => {
    expect(normalizeFormPath('')).toBe('')
  })
})

describe('isNotNestedPath', () => {
  it('is true for a fully bracketed path', () => {
    expect(isNotNestedPath('[foo]')).toBe(true)
  })

  it('is false for a regular dotted path', () => {
    expect(isNotNestedPath('foo')).toBe(false)
    expect(isNotNestedPath('foo.bar')).toBe(false)
  })
})

describe('getFromPath', () => {
  it('reads a nested dotted path', () => {
    expect(getFromPath({ a: { b: 5 } }, 'a.b')).toBe(5)
  })

  it('reads through array bracket segments', () => {
    expect(getFromPath({ a: [{ b: 5 }] }, 'a[0].b')).toBe(5)
  })

  it('returns the fallback when the path is missing', () => {
    expect(getFromPath({ a: 1 }, 'x.y', 'FALLBACK')).toBe('FALLBACK')
  })

  it('returns undefined for an undefined object with no fallback', () => {
    expect(getFromPath(undefined, 'a.b')).toBeUndefined()
  })
})

describe('booleanishToBoolean / maybeBooleanishToBoolean', () => {
  it('normalizes the string "true" and "false"', () => {
    expect(booleanishToBoolean('true')).toBe(true)
    expect(booleanishToBoolean('false')).toBe(false)
  })

  it('passes real booleans through', () => {
    expect(booleanishToBoolean(true)).toBe(true)
    expect(booleanishToBoolean(false)).toBe(false)
  })

  it('maybeBooleanishToBoolean returns undefined for undefined input', () => {
    expect(maybeBooleanishToBoolean(undefined)).toBeUndefined()
  })

  it('maybeBooleanishToBoolean delegates to booleanishToBoolean for truthy input', () => {
    expect(maybeBooleanishToBoolean('true')).toBe(true)
    expect(maybeBooleanishToBoolean('false')).toBe(false)
  })

  // Quirk: the `value ? ... : undefined` guard treats a literal boolean
  // `false` as falsy, so it short-circuits to undefined instead of calling
  // booleanishToBoolean(false) — a real `false` is indistinguishable from
  // "not provided" here. String `'false'` (above) is unaffected.
  it('maybeBooleanishToBoolean returns undefined for a literal false (falsy short-circuit)', () => {
    expect(maybeBooleanishToBoolean(false)).toBeUndefined()
  })
})
