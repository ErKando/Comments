<!--------------------------------- Sort item --------------------------------->
<template>
  <li class="flex">
    <label
      class="px-4 py-2 w-full text-left"
      :class="
        sort === item.value
          ? 'bg-blue-1 cursor-default'
          : 'hover:bg-blue-2 cursor-pointer'
      "
    >
      {{ item.title }}
      <input
        v-model="sort"
        type="radio"
        hidden
        :value="item.value"
        @change="$emit('close')"
      />
    </label>
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType, inject } from 'vue'
import type {
  ISortItem,
  IHeaderProvide,
} from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsHeaderSortItem',
  props: { item: { type: Object as PropType<ISortItem>, required: true } },
  emits: ['close'],
  setup() {
    const { sort } = inject<IHeaderProvide>('header') || {}

    return { sort }
  },
})
</script>
