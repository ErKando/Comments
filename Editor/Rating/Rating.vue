<!---------------------------------- Rating ----------------------------------->
<template>
  <div class="flex items-center gap-2">
    <p class="font-medium">Оцените компанию:</p>
    <div class="flex items-center">
      <!-------------------------------- Item --------------------------------->
      <BaseCommentsEditorRatingItem
        v-for="rating in ratings"
        :key="rating"
        :is-active="getIsActive(rating)"
        @mouseenter="tempRating = rating"
        @mouseleave="tempRating = null"
        @click="$emit('set-rating', rating)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue'
import { RATING } from '~/components/Base/Comments/constants'
import type { TRating } from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsEditorRating',
  props: {
    currentRating: {
      type: [Number, null] as PropType<TRating>,
      default: null,
    },
  },
  emits: { 'set-rating': (val: TRating) => val },
  setup(props) {
    const tempRating = ref<null | number>(null)

    const getIsActive = (rating: TRating) => {
      if (Number.isInteger(tempRating.value))
        return tempRating.value >= rating
      if (!Number.isInteger(props.currentRating)) return false
      return props.currentRating >= rating
    }

    const ratings = computed(() => RATING as TRating[])

    return { ratings, tempRating, getIsActive }
  },
})
</script>
