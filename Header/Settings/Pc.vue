<!----------------------------- DropDown (PC/Tab) ----------------------------->
<template>
  <div
    v-click-outside="closeDropDown"
    class="bg-primary-white rounded-2xl border border-primary-bg py-2 flex flex-col"
  >
    <!--------------------------------- Sort ---------------------------------->
    <div
      class="text-text-3 flex gap-2 justify-between items-center hover:bg-blue-2 px-4 py-2 rounded-t"
      @mouseenter="isShowSortDropDown = true"
      @mouseleave="isShowSortDropDown = false"
    >
      <span>Сортировка по умолчанию</span>
      <div class="text-primary-disabled flex items-center gap-2">
        <span class="text-comment-1">
          {{ SORT_MAP[settings?.defaultSort || 'dateasc'] }}
        </span>
        <div class="w-4 h-4 flex items-center justify-center">
          <UiIcon icon="fa-solid fa-angle-right" />
        </div>
      </div>
      <!------------------------------ DropDown ------------------------------->
      <div
        v-if="isShowSortDropDown"
        class="absolute left-full -top-px bg-primary-white shadow z-10 rounded-2xl border border-primary-bg py-2 flex flex-col min-w-[131px] overflow-hidden"
      >
        <button
          v-for="item in SORT_ITEMS"
          :key="item.value"
          class="py-2 px-4 text-left"
          :class="
            settings?.defaultSort === item.value
              ? 'bg-blue-1 cursor-default pointer-events-none'
              : 'hover:bg-blue-2'
          "
          @click="changeDefaultSort(item.value)"
        >
          {{ item.title }}
        </button>
      </div>
    </div>
    <!---------------------------- Show all levels ---------------------------->
    <button
      class="text-text-3 flex gap-2 justify-between items-center hover:bg-blue-2 px-4 py-2 text-left"
      @click="toggleShowAllLevels"
    >
      <div class="flex flex-col gap-1">
        <span>Ветки всегда открыты</span>
        <span class="text-comment-1 text-primary-secondary">
          По&nbsp;умолчанию показываем первые два ответа в&nbsp;обсуждении
        </span>
      </div>
      <BaseCommentsHeaderSettingsPseudoSwitch
        :checked="settings?.showAllLevels"
      />
    </button>
    <!--------------------------- Show all comments --------------------------->
    <button
      class="text-text-3 flex gap-2 justify-between items-center hover:bg-blue-2 px-4 py-2 text-left"
      @click="toggleShowAllComments"
    >
      <div class="flex flex-col gap-1">
        <span>Комментарии всегда открыты</span>
        <span class="text-comment-1 text-primary-secondary">
          По&nbsp;умолчанию во&nbsp;всех материалах видно три первых поста,
          остальные скрыты
        </span>
      </div>
      <BaseCommentsHeaderSettingsPseudoSwitch
        :checked="settings?.showAllComments"
      />
    </button>
    <!------------------------------- Footnote -------------------------------->
    <p class="text-badge text-primary-disabled py-2 px-4">
      *Настройки применяются по&nbsp;всему сайту
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue'
import { SORT_ITEMS, SORT_MAP } from '~/components/Base/Comments/constants'
import type {
  IHeaderProvide,
  TSort,
} from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsHeaderSettingsPc',
  emits: ['close-drop-down'],
  setup(_, { emit }) {
    const isShowSortDropDown = ref(false)

    const {
      settings,
      setDefaultSort,
      toggleShowAllComments,
      toggleShowAllLevels,
    } = inject<IHeaderProvide>('header') || {}

    const closeDropDown = () => {
      emit('close-drop-down')
      isShowSortDropDown.value = false
    }

    const changeDefaultSort = (sort: TSort) => {
      setDefaultSort?.(sort)
      closeDropDown()
    }

    return {
      isShowSortDropDown,
      closeDropDown,
      SORT_ITEMS,
      settings,
      SORT_MAP,
      toggleShowAllComments,
      toggleShowAllLevels,
      changeDefaultSort,
    }
  },
})
</script>
