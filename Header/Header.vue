<!------------------------------ Comments header ------------------------------>
<template>
  <header class="flex items-center justify-between gap-2 relative">
    <div class="flex items-center gap-2">
      <!------------------------------- Heading ------------------------------->
      <h2 class="text-sub-title font-medium">{{ computedTitle }}</h2>
      <!-------------------------------- Count -------------------------------->
      <UiBadge
        v-if="commentsCount?.total"
        size="md"
        theme="grey"
        class="!font-bold"
      >
        {{ commentsCount?.total }}
      </UiBadge>
      <!------------------------------ Settings ------------------------------->
      <BaseCommentsHeaderSettings class="ml-2" />
      <!-------------------------------- Sort --------------------------------->
      <LazyBaseCommentsHeaderSort
        v-if="commentsCount?.total"
        :disabled="isFetching"
      />
      <!---------------------- Sort & subscribe spinner ----------------------->
      <UiIcon v-if="isFetching" icon="fa-solid fa-spinner" spin />
    </div>
    <!------------------------------- Subscribe ------------------------------->
    <BaseCommentsHeaderSubscribe :disabled="isFetching" />
  </header>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'
import type { IHeaderProvide } from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsHeader',
  setup() {
    const { commentsCount, computedTitle, isFetching } =
      inject<IHeaderProvide>('header') || {}

    return { commentsCount, computedTitle, isFetching }
  },
})
</script>
