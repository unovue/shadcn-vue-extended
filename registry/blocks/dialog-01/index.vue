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
import { Check } from '@lucide/vue'
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
      <DialogFooter class="flex flex-col sm:flex-row sm:gap-3 w-full gap-2">
        <DialogClose as-child>
          <Button variant="default" class="w-full sm:w-1/2">
            Deactivate
          </Button>
        </DialogClose>
        <DialogClose as-child>
          <Button variant="outline" class="w-full sm:w-1/2">
            Cancel
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
