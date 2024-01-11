<!------------------------------ Fetch skeleton ------------------------------->
<template>
  <section class="flex flex-col gap-6 items-center">
    <BaseSceletonBox with-out-full class="rounded-lg w-full max-w-175 h-8" />
    <BaseSceletonBox with-out-full class="rounded-lg w-full max-w-175 h-36" />
    <BaseCommentsSkeleton
      v-for="i in SKELETON_COUNT"
      :key="`skeleton_${i}`"
      class="w-full max-w-175"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { SKELETON_COUNT } from '~/components/Base/Comments/constants'

export default defineComponent({
  name: 'BaseCommentsWithFetchSkeleton',
  setup() {
    return { SKELETON_COUNT }
  },
})
</script>
