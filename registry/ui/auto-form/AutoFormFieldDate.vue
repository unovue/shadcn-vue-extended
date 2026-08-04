<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { FieldProps } from './interface'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { DateFormatter, fromDate, getLocalTimeZone, parseDate, toCalendarDate } from '@internationalized/date'
import { CalendarIcon } from '@lucide/vue'
import AutoFormFieldWrapper from './AutoFormFieldWrapper.vue'
import { maybeBooleanishToBoolean } from './utils'

const props = defineProps<FieldProps>()

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

function isDateValue(value: unknown): value is DateValue {
  return !!value && typeof value === 'object' && typeof (value as DateValue).toDate === 'function'
}

/**
 * The Calendar component (reka-ui) needs a `DateValue` (`@internationalized/date`),
 * but the form model may hold a plain `Date`, an ISO string, or already be a
 * `DateValue` — normalize to a `DateValue` for display/editing.
 */
function toDateValue(value: unknown): DateValue | undefined {
  if (value === null || value === undefined || value === '')
    return undefined
  if (isDateValue(value))
    return value
  if (value instanceof Date)
    return toCalendarDate(fromDate(value, getLocalTimeZone()))
  if (typeof value === 'string') {
    try {
      return parseDate(value.slice(0, 10))
    }
    catch {
      const parsed = new Date(value)
      return Number.isNaN(parsed.getTime()) ? undefined : toCalendarDate(fromDate(parsed, getLocalTimeZone()))
    }
  }
  return undefined
}

/**
 * Converts a `DateValue` (or already-a-`Date`) back to a plain JS `Date` for
 * the form model. Accepts the same string forms as `toDateValue` — the two
 * must agree on what counts as a renderable value, since the Calendar reads
 * through `toDateValue` while the trigger label reads through this. When
 * only `toDateValue` handled strings, a string-valued model rendered the
 * "Pick a date" placeholder on the button while the Calendar inside showed
 * the correct date.
 */
function toJsDate(value: unknown): Date | undefined {
  if (value === null || value === undefined || value === '')
    return undefined
  if (isDateValue(value))
    return value.toDate(getLocalTimeZone())
  if (value instanceof Date)
    return value
  if (typeof value === 'string')
    return toDateValue(value)?.toDate(getLocalTimeZone())
  return undefined
}
</script>

<template>
  <AutoFormFieldWrapper v-bind="props">
    <template #default="slotProps">
      <slot v-bind="slotProps">
        <div>
          <Popover>
            <PopoverTrigger as-child :disabled="maybeBooleanishToBoolean(config?.inputProps?.disabled) ?? disabled">
              <Button
                variant="outline"
                :class="cn(
                  'w-full justify-start text-left font-normal',
                  !slotProps.componentField.modelValue && 'text-muted-foreground',
                )"
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ toJsDate(slotProps.componentField.modelValue) ? df.format(toJsDate(slotProps.componentField.modelValue)!) : "Pick a date" }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar
                initial-focus
                v-bind="{
                  ...slotProps.componentField,
                  'modelValue': toDateValue(slotProps.componentField.modelValue),
                  'onUpdate:modelValue': (v: DateValue | undefined) => slotProps.componentField['onUpdate:modelValue']?.(toJsDate(v)),
                }"
              />
            </PopoverContent>
          </Popover>
        </div>
      </slot>
    </template>
  </AutoFormFieldWrapper>
</template>
