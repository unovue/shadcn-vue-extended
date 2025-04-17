<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Check } from 'lucide-vue-next'
import { ref } from 'vue'

const open = ref(true)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="outline">
        Show Dialog
      </Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-sm flex flex-col items-center">
      <div class="flex justify-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check class="h-6 w-6 text-green-600" />
        </div>
      </div>

      <DialogHeader class="text-center gap-0">
        <DialogTitle class="text-center">
          Payment successful
        </DialogTitle>
        <DialogDescription class="mt-2 text-center mx-auto sm:max-w-[90%]">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          amet labore.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="sm:justify-center w-full">
        <DialogClose as-child>
          <Button class="w-full">
            Go back to dashboard
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
