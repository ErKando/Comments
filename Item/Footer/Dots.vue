<!----------------------------------- Dots ------------------------------------>
<template>
  <div class="relative">
    <!-------------------------------- Button --------------------------------->
    <button class="group" @click="showDropDown = true">
      <UiIcon
        icon="fa-solid fa-ellipsis"
        class="text-primary-disabled-pro group-hover:text-primary"
      />
    </button>
    <!------------------------------- DropDown -------------------------------->
    <UiDropDownMenuNoScroll
      v-if="showDropDown"
      v-click-outside="closeDropDown"
      position="bottom-right"
      class="mt-2 px-4 z-20"
      list-tag="ul"
    >
      <template v-for="item in items">
        <li v-if="item.show" :key="item.title" class="-mx-4 hover:bg-blue-2">
          <button
            class="flex items-center gap-2 px-4 py-2 w-full text-text-3"
            @click="item.handler"
          >
            {{ item.title }}
          </button>
        </li>
      </template>
    </UiDropDownMenuNoScroll>
  </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from 'vue'
import { useRoute, useContext } from '@nuxtjs/composition-api'
import {
  EDIT_EXPIRES_TIME,
  DELETE_EXPIRES_TIME,
} from '~/components/Base/Comments/constants'
import type { IDotsItems } from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsItemFooterDots',
  props: {
    commentId: { type: Number, required: true },
    posted: { type: String, required: true },
    authorId: { type: Number, required: true },
    isDeleted: { type: Boolean, required: true },
  },
  emits: ['delete-comment', 'open-editing'],
  setup(props, { emit }) {
    const route = useRoute()
    const {
      $config: { klerkBase },
      $auth,
    } = useContext()

    const showDropDown = ref(false)
    const closeDropDown = () => (showDropDown.value = false)

    const isCopied = ref(false)
    const copyLink = () => {
      const link = `${klerkBase}${route.value.path}#comment__${props.commentId}`
      navigator.clipboard.writeText(link)
      isCopied.value = true
      setTimeout(() => {
        ;[isCopied.value, showDropDown.value] = [false, false]
      }, 1000)
    }

    const isDeleteExpired = computed(() => {
      const today = new Date().getTime()
      const posted = new Date(props.posted).getTime()
      const diff = today - posted
      return diff > DELETE_EXPIRES_TIME
    })
    const isEditExpired = computed(() => {
      const today = new Date().getTime()
      const posted = new Date(props.posted).getTime()
      const diff = today - posted
      return diff > EDIT_EXPIRES_TIME
    })
    const isOwner = computed(() => props.authorId === $auth.user.id)

    const deleteComment = () => {
      emit('delete-comment')
      closeDropDown()
    }
    const editComment = () => {
      emit('open-editing')
      closeDropDown()
    }

    const showDelete = computed(() => {
      return isOwner.value && !isDeleteExpired.value && !props.isDeleted
    })

    const showEdit = computed(() => {
      return isOwner.value && !isEditExpired.value && !props.isDeleted
    })

    const items = computed<IDotsItems[]>(() => {
      return [
        {
          title: 'Редактировать',
          show: showEdit.value,
          handler: editComment,
        },
        {
          title: 'Удалить',
          show: showDelete.value,
          handler: deleteComment,
        },
        {
          title: isCopied.value ? 'Скопировано' : 'Скопировать ссылку',
          show: true,
          handler: copyLink,
        },
      ]
    })

    return { showDropDown, items, closeDropDown }
  },
})
</script>
