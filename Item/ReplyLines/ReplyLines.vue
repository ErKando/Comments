<!-------------------------------- Reply lines -------------------------------->
<template>
  <div
    v-if="!isMaxDepth"
    class="flex relative reply-line"
  >
    <!------------------------------- Separator ------------------------------->
    <div
      class="relative w-2 tab:w-4 border-l border-b shrink-0 rounded-bl-lg mr-1 border-primary-stroke cursor-pointer -mb-[29px] highlighted-line"
      @click="$emit('hide-parent-children')"
    >
      <!----------------------------- Reply line ------------------------------>
    </div>
    <div
      class="w-2 tab:w-4 h-8 absolute top-0 border-l border-b border-primary-stroke rounded-bl-lg cursor-pointer highlighted-line"
      :class="isMaxDepth ? '-left-3 tab:-left-5' : 'left-0'"
      @click="$emit('hide-comment')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BaseCommentsItemReplyLines',
  props: { isMaxDepth: { type: Boolean, required: true }, },
  emits: ['hide-parent-children', 'hide-comment'],
})
</script>
