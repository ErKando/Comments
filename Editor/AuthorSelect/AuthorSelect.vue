<!------------------------------- AuthorSelect -------------------------------->
<template>
  <div v-click-outside="() => (showDropDown = false)" class="relative">
    <!-------------------------------- Button --------------------------------->
    <button
      :class="{ 'cursor-default': !hasOwnedBlogs }"
      class="relative"
      @click="showDropDown = !showDropDown"
    >
      <UiAvatar size="ms" tag="div" :src="author.avatar" />
      <div
        v-if="hasOwnedBlogs"
        class="w-4 h-4 rounded-full bg-primary-white flex items-center justify-center shadow absolute bottom-0 right-0"
      >
        <UiIcon
          :class="{ 'rotate-180': showDropDown }"
          class="transition-transform text-comment-2"
          icon="fa-solid fa-angle-down"
        />
      </div>
    </button>
    <!------------------------------- DropDown -------------------------------->
    <UiDropDownMenu
      v-if="hasOwnedBlogs && showDropDown"
      :items="$auth.user.ownedBlogs"
      max-width="max-content"
      class="z-[19]"
      position="left"
    >
      <template #item="{ item }">
        <button
          class="flex items-center gap-2 px-4 py-2 hover:bg-blue-2 w-full text-left"
          @click="changeAuthor(item)"
        >
          <UiAvatar size="sm" tag="div" :src="item.avatar" />
          <span class="text-text-3 line-clamp-1">{{ item.title }}</span>
        </button>
      </template>
    </UiDropDownMenu>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue'
import { useContext } from '@nuxtjs/composition-api'
import type { IAuthor } from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsEditorAuthorSelect',
  props: {
    author: { type: Object as PropType<IAuthor>, required: true },
    hasOwnedBlogs: { type: Boolean, required: true },
  },
  emits: { 'change-author': (val: IAuthor) => val },
  setup(_, { emit }) {
    const { $auth } = useContext()

    const showDropDown = ref(false)

    const changeAuthor = (author: IAuthor) => {
      showDropDown.value = false
      const brand = $auth.user.brands.find((brand: any) => {
        return brand.blogId === author.id
      })
      emit('change-author', brand || author)
    }

    return { showDropDown, changeAuthor }
  },
})
</script>
