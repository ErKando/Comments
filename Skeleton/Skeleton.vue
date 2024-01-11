<!----------------------------- Comment skeleton ------------------------------>
<template>
  <li id="comment-skeleton" class="flex flex-col gap-3">
    <!-------------------------------- Header --------------------------------->
    <div class="flex items-center gap-2">
      <BaseSceletonBox with-out-full class="w-10 h-10 rounded-full" />
      <div class="flex flex-col gap-1 w-1/3">
        <BaseSceletonBox with-out-full class="h-5 w-full rounded-lg" />
        <BaseSceletonBox with-out-full class="h-4 w-full rounded-lg" />
      </div>
    </div>
    <!--------------------------------- Body ---------------------------------->
    <BaseSceletonBox with-out-full class="h-8 w-full rounded-lg" />
    <!-------------------------------- Footer --------------------------------->
    <BaseSceletonBox with-out-full class="h-6 w-full rounded-lg" />
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BaseCommentsSkeleton',
})
</script>
