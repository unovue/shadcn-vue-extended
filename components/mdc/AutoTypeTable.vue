<script setup lang="ts">
export interface PropsType {
  name: string
  description?: string
  required?: boolean
  type: string
  default: string
}

const props = defineProps<{
  props: PropsType[]
}>()
</script>

<template>
  <div>
    <MetaTable type="props" :values="props.props" />
  </div>
</template>
