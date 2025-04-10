<script setup lang="ts">
export interface MetaType {
  name: string
  description?: string
  required?: boolean
  type: string
  default: string
}

defineProps<{
  type: 'props' | 'events' | 'slots' | 'exposed'
  values: MetaType[]
}>()
</script>

<template>
  <Table class="not-prose border rounded-lg overflow-hidden border-separate bg-accent/20 border-spacing-0">
    <TableHeader>
      <TableRow>
        <TableHead class="w-[35%] capitalize text-foreground font-semibold border-x border-b bg-accent/50 px-2.5 border-inline-start-0">
          {{ type }}
        </TableHead>
        <TableHead class="text-foreground font-semibold border-x border-b bg-accent/50 px-2.5 border-inline-start-0">
          Type
        </TableHead>
        <TableHead class="text-foreground font-semibold border-x border-b bg-accent/50 px-2.5 border-inline-start-0">
          Default
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="value in values" :key="value.name" class="not-last:[&_td]:border-b">
        <TableCell class="font-medium px-2.5 border-x border-inline-start-0 inline-flex items-center w-full space-x-2">
          <code class="text-xs">{{ value.name }}</code>
          <Icon v-if="value.required" name="lucide:asterisk" class="text-lg" />
          <Popover v-if="value.description">
            <PopoverTrigger>
              <Icon name="lucide:info" />
            </PopoverTrigger>
            <PopoverContent class="prose p-3 bg-accent border">
              <MDC :value="value.description" class="leading-6" partial />
            </PopoverContent>
          </Popover>
        </TableCell>
        <TableCell class="px-2.5 text-xs border-x border-inline-start-0">
          <code>{{ value.type }}</code>
        </TableCell>
        <TableCell class="px-2.5 text-xs border-l border-inline-start-0">
          {{ value.default ?? '-' }}
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
