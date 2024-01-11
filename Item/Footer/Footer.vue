<!---------------------------------- Footer ----------------------------------->
<template>
  <footer class="flex items-center gap-4">
    <!--------------------------------- Rates --------------------------------->
    <BaseCommentsItemFooterRates
      :likes="comment.likes"
      :dislikes="comment.dislikes"
      :comment-id="comment.id"
      :am-i-like="comment.amILike"
      :am-i-dislike="comment.amIDislike"
    />
    <!--------------------------------- Reply --------------------------------->
    <button
      v-if="!readonly"
      class="text-text-3 hover:text-shadow"
      @click="openEditor?.(comment.id)"
    >
      Ответить
    </button>
    <!--------------------------------- Dots ---------------------------------->
    <BaseCommentsItemFooterDots
      v-if="comment.id"
      :comment-id="comment.id"
      :posted="comment.posted"
      :author-id="comment.author.id"
      :is-deleted="isDeleted"
      @delete-comment="$emit('delete-comment')"
      @open-editing="$emit('open-editing')"
    />
  </footer>
</template>

<script lang="ts">
import { defineComponent, inject, PropType } from 'vue'
import type { IProvide, IComment } from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsItemFooter',
  props: {
    comment: { type: Object as PropType<IComment>, default: () => ({}) },
    isDeleted: { type: Boolean, default: false },
  },
  emits: ['delete-comment', 'open-editing'],
  setup() {
    const { readonly, openEditor } = inject<IProvide>('data') || {}

    return { readonly, openEditor }
  },
})
</script>
