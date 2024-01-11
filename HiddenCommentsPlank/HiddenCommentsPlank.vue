<!--------------------------- Hidden comments plank --------------------------->
<template>
  <div
    class="flex justify-center bg-primary-white border-t border-primary-stroke pt-4 pb-5 tab:py-5 grow rounded-b-2xl"
  >
    <div
      class="px-4 tab:px-0 flex items-center justify-between gap-2 grow max-w-175"
    >
      <!------------------------ Hidden comments count ------------------------>
      <button class="flex items-center gap-2 group" @click="$emit('show-all')">
        <UiAvatarGroup class="hidden tab:flex" tag="div" :users="hiddenUsers" />
        <span class="text-blue-5 group-hover:text-blue-4">
          Еще
          {{ hiddenCountString }}
        </span>
      </button>
      <!--------------------------- Show all always --------------------------->
      <button
        class="text-blue-5 hover:text-blue-4"
        @click="$emit('show-all-always')"
      >
        Всегда открыты
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { IHiddenUsers } from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsHiddenCommentsPlank',
  props: {
    hiddenUsers: { type: Array as PropType<IHiddenUsers[]>, required: true },
    hiddenCountString: { type: String, required: true },
  },
  emits: ['show-all', 'show-all-always'],
})
</script>
