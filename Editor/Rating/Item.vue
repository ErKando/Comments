<!-------------------------------- Rating item -------------------------------->
<template>
  <component :is="tag" class="px-0.5 first:pl-0 last:pr-0" v-on="$listeners">
    <UiIcon
      icon="fa-solid fa-star"
      class="text-primary-stroke"
      :class="{ 'text-yellow-3': isActive }"
    />
  </component>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'BaseCommentsEditorRatingItem',
  props: {
    isActive: { type: Boolean, required: true },
    tag: { type: String as PropType<'button' | 'div'>, default: 'button' },
  },
})
</script>
