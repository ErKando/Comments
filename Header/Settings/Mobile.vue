<!----------------------------- DropDown (Mobile) ----------------------------->
<template>
  <BaseModal
    preset="bottom"
    :visible="visible"
    class="rounded-t-2xl [overflow:inherit] pt-1 pb-2"
    @update:visible="$emit('close-drop-down')"
  >
    <BaseModalButtonClose
      preset="above"
      class="focus:outline-none"
      @click="$emit('close-drop-down')"
    />
    <div class="flex items-center gap-2 px-4 py-2">
      <button
        v-if="isShowSortDropDown"
        class="flex items-center justify-center p-2 -m-2"
        @click="isShowSortDropDown = false"
      >
        <UiIcon icon="fa-solid fa-angle-left" />
      </button>
      <h3 class="font-medium text-sub-title">{{ title }}</h3>
    </div>
    <template v-if="!isShowSortDropDown">
      <!-------------------------------- Sort --------------------------------->
      <button
        class="flex gap-2 justify-between items-center hover:bg-blue-2 px-4 py-2 rounded-t w-full"
        @click="isShowSortDropDown = true"
      >
        <span class="shrink-0">Сортировка по умолчанию</span>
        <div class="text-primary-disabled flex items-center gap-2">
          <span class="text-text-3 line-clamp-1 break-all">
            {{ SORT_MAP[settings?.defaultSort || 'dateasc'] }}
          </span>
          <div class="w-4 h-4 flex items-center justify-center">
            <UiIcon icon="fa-solid fa-angle-right" />
          </div>
        </div>
      </button>
      <!--------------------------- Show all levels --------------------------->
      <button
        class="flex gap-2 justify-between items-center hover:bg-blue-2 px-4 py-2 text-left"
        @click="toggleShowAllLevels"
      >
        <div class="flex flex-col gap-1">
          <span>Ветки всегда открыты</span>
          <span class="text-text-3 text-primary-secondary">
            По&nbsp;умолчанию показываем первые два ответа в&nbsp;обсуждении
          </span>
        </div>
        <BaseCommentsHeaderSettingsPseudoSwitch
          :checked="settings?.showAllLevels"
        />
      </button>
      <!-------------------------- Show all comments -------------------------->
      <button
        class="flex gap-2 justify-between items-center hover:bg-blue-2 px-4 py-2 text-left"
        @click="toggleShowAllComments"
      >
        <div class="flex flex-col gap-1">
          <span>Комментарии всегда открыты</span>
          <span class="text-text-3 text-primary-secondary">
            По&nbsp;умолчанию во&nbsp;всех материалах видно три первых поста,
            остальные скрыты
          </span>
        </div>
        <BaseCommentsHeaderSettingsPseudoSwitch
          :checked="settings?.showAllComments"
        />
      </button>
      <!------------------------------ Footnote ------------------------------->
      <p class="text-comment-1 text-primary-disabled py-2 px-4">
        *Настройки применяются по&nbsp;всему сайту
      </p>
    </template>
    <!--------------------------------- Sort ---------------------------------->
    <template v-else>
      <button
        v-for="item in SORT_ITEMS"
        :key="item.value"
        class="py-2 px-4 text-left block w-full"
        :class="
          settings?.defaultSort === item.value
            ? 'bg-blue-1 cursor-default pointer-events-none'
            : 'hover:bg-blue-2'
        "
        @click="changeDefaultSort(item.value)"
      >
        {{ item.title }}
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, ref, inject, computed } from 'vue'
import { SORT_ITEMS, SORT_MAP } from '~/components/Base/Comments/constants'
import type {
  IHeaderProvide,
  TSort,
} from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsHeaderSettingsMobile',
  props: { visible: { type: Boolean, required: true } },
  emits: ['close-drop-down'],
  setup(_, { emit }) {
    const isShowSortDropDown = ref(false)

    const title = computed(() => {
      return isShowSortDropDown.value
        ? 'Сортировка по умолчанию'
        : 'Настройка комментариев'
    })

    const {
      settings,
      setDefaultSort,
      toggleShowAllComments,
      toggleShowAllLevels,
    } = inject<IHeaderProvide>('header') || {}

    const closeDropDown = () => {
      emit('close-drop-down')
      setTimeout(() => (isShowSortDropDown.value = false), 500)
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
      title,
    }
  },
})
</script>
