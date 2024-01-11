<!---------------------------------- Rating ----------------------------------->
<template>
  <div class="flex items-center">
    <!--------------------------------- Item ---------------------------------->
    <BaseCommentsEditorRatingItem
      v-for="rating in RATING"
      :key="rating"
      tag="div"
      :is-active="!!currentRating && currentRating >= rating"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { RATING } from '~/components/Base/Comments/constants'
import type { TRating } from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsItemRating',
  props: {
    currentRating: {
      type: [Number, null] as PropType<TRating>,
      default: null,
    },
  },
  setup() {
    return { RATING }
  },
})
</script>
