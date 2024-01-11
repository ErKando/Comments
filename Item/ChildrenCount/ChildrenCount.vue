<!------------------------------ Children count ------------------------------->
<template>
  <button
    class="text-blue-5 hover:text-blue-4 flex items-center gap-2 group w-fit"
    v-on="$listeners"
  >
    <UiIcon
      icon="fa-solid fa-angle-down"
      class="group-hover:rotate-180 transition-transform px-0.5"
    />
    <span class="text-text-3">{{ countString }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { COMMENTS_WORDS } from '~/components/Base/Comments/constants'
import { plural } from '~/project/utils/utils.plural'

export default defineComponent({
  name: 'BaseCommentsItemChildrenCount',
  props: { count: { type: Number, required: true } },
  setup(props) {
    const countString = computed(() => {
      const word = plural(props.count, COMMENTS_WORDS)
      return `${props.count} ${word}`
    })

    return { countString }
  },
})
</script>
