<!----------------------------------- Rates ----------------------------------->
<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-4">
      <!-------------------------------- Like --------------------------------->
      <BaseCommentsItemFooterRatesElem
        :count="likes"
        :rated="amILike"
        :current-rated="liked"
        :comment-id="commentId"
        @toggle-rate="toggleLike"
        @rate-error="handleError"
      />
      <!------------------------------- Dislike ------------------------------->
      <BaseCommentsItemFooterRatesElem
        :count="dislikes"
        :rated="amIDislike"
        :current-rated="disliked"
        :comment-id="commentId"
        is-dislike
        @toggle-rate="toggleDislike"
        @rate-error="handleError"
      />
    </div>
    <!------------------------------ Rate error ------------------------------->
    <UiMessage v-if="showError" theme="error" class="text-comment-1">
      Произошла ошибка, попробуйте еще раз
    </UiMessage>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import type { AxiosError } from 'axios'
import {
  REMOVE_ACTION,
  ERROR_SHOW_TIME,
} from '~/components/Base/Comments/constants'
import type {
  TLikeAction,
  TDislikeAction,
} from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsItemFooterRates',
  props: {
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    commentId: { type: Number, default: 0 },
    amILike: { type: Boolean, default: false },
    amIDislike: { type: Boolean, default: false },
  },
  setup(props) {
    const liked = ref(props.amILike)
    const disliked = ref(props.amIDislike)

    const toggleLike = (action: TLikeAction) => {
      liked.value = action !== REMOVE_ACTION
      if (disliked.value) disliked.value = false
    }

    const toggleDislike = (action: TDislikeAction) => {
      disliked.value = action !== REMOVE_ACTION
      if (liked.value) liked.value = false
    }

    const showError = ref(false)
    const handleError = (e: AxiosError) => {
      console.error(e)
      showError.value = true
      setTimeout(() => (showError.value = false), ERROR_SHOW_TIME)
    }

    return {
      liked,
      disliked,
      toggleLike,
      toggleDislike,
      showError,
      handleError,
    }
  },
})
</script>
