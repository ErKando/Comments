<!-------------------------------- Reply line --------------------------------->
<template>
  <div class="flex">
    <!------------------------------- Separator ------------------------------->
    <div
      class="relative w-3 tab:w-5 shrink-0 border-primary-stroke"
      :class="{ 'border-l': !isDeep }"
    >
      <!----------------------------- Reply line ------------------------------>
      <div
        class="w-2 tab:w-4 h-8 absolute -left-px top-0 border-l border-b border-primary-stroke rounded-bl-lg highlighted-line"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { MAX_DEPTH } from '~/components/Base/Comments/constants'

export default defineComponent({
  name: 'BaseCommentsEditorReplyLine',
  props: { depth: { type: Number, default: 0 } },
  setup(props) {
    const isDeep = computed(() => props.depth >= MAX_DEPTH)

    return { isDeep }
  },
})
</script>
