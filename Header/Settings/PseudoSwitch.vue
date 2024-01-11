<!------------------------------- Pseudo switch ------------------------------->
<template>
  <div
    class="relative w-8 h-4 rounded-full shrink-0 transition-all duration-500"
    :class="checked ? 'bg-blue-5' : 'bg-primary-light-stroke'"
  >
    <span
      class="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full transition-all bg-primary-white duration-500"
      :class="checked ? 'right-px' : 'right-[17px]'"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BaseCommentsHeaderSettingsPseudoSwitch',
  props: { checked: { type: Boolean, required: true } },
})
</script>
