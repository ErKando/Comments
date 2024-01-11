<!----------------------------------- Sort ------------------------------------>
<template>
  <div class="relative">
    <!-------------------------------- Button --------------------------------->
    <button
      v-bind="$attrs"
      class="flex items-center justify-center w-6 h-6 group disabled:text-primary-disabled disabled:cursor-not-allowed"
      @click="isShowSort = !isShowSort"
    >
      <UiIcon icon="fa-solid fa-sort" class="group-hover:text-blue-5" />
    </button>
    <!--------------------------- Dropdown (PC/Tab) --------------------------->
    <ClientOnly>
      <UiDropDownMenuNoScroll
        v-if="isShowSort && !isMobile"
        v-click-outside="() => (isShowSort = false)"
        position="bottom-right"
        class="mt-2 text-text-3 overflow-hidden flex flex-col"
        list-tag="ul"
        min-width="131px"
      >
        <BaseCommentsHeaderSortItem
          v-for="item in SORT_ITEMS"
          :key="item.value"
          :item="item"
          @close="isShowSort = false"
        />
      </UiDropDownMenuNoScroll>
    </ClientOnly>
    <!---------------------------- Modal (Mobile) ----------------------------->
    <ClientOnly>
      <BaseModal
        v-if="isMobile"
        preset="bottom"
        :visible="isShowSort"
        class="rounded-t-2xl [overflow:inherit] pt-0.5 pb-2"
        @update:visible="isShowSort = false"
      >
        <BaseModalButtonClose preset="above" @click="isShowSort = false"
        />
        <h3 class="px-4 py-2 font-medium text-sub-title">Сортировка</h3>
        <ul class="flex flex-col">
          <BaseCommentsHeaderSortItem
            v-for="item in SORT_ITEMS"
            :key="item.value"
            :item="item"
            @close="isShowSort = false"
          />
        </ul>
      </BaseModal>
    </ClientOnly>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import {
  useMediaQuery,
  screen,
} from '~/project/utils/use/useMediaQuery/useMediaQuery'
import { SORT_ITEMS } from '~/components/Base/Comments/constants'

export default defineComponent({
  name: 'BaseCommentsHeaderSort',
  inheritAttrs: false,
  setup() {
    const isShowSort = ref(false)

    const isMobile = useMediaQuery(screen.smaller('tab'))

    return { isShowSort, SORT_ITEMS, isMobile }
  },
})
</script>
