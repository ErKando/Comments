<!----------------------------- Comment component ----------------------------->
<template>
  <li
    :id="`comment__${comment.id}`"
    ref="commentElement"
    class="flex flex-col highlighted-parent"
  >
    <div v-if="!isHidden" class="flex grow">
      <!----------------------------- Reply lines ----------------------------->
      <LazyBaseCommentsItemReplyLines
        v-if="depth"
        :is-max-depth="depth > MAX_DEPTH"
        @hide-parent-children="$emit('hide-children')"
        @hide-comment="isHidden = true"
      />
      <div class="flex flex-col grow">
        <!------------------------------ Comment ------------------------------>
        <article
          class="flex flex-col gap-3 px-3 -mx-3 rounded-2xl grow duration-1000"
          :class="{ 'pb-2': comment.children?.length }"
        >
          <!----------------------------- Header ------------------------------>
          <BaseCommentsItemHeader
            :comment="comment"
            :parent="parent"
            :class="{ 'pt-3': hasParent }"
          />
          <!----------------------------- Rating ------------------------------>
          <LazyBaseCommentsItemRating
            v-if="withRating && !hasParent"
            :current-rating="comment.ratingValue"
          />
          <!----------------------------- Content ----------------------------->
          <template v-if="!isEditing && !isFetching">
            <div
              v-if="content"
              :id="`content-${comment.id}`"
              class="base-comments selection:bg-blue-2 text-text-1 word-break"
              @mouseup="getSelection"
              v-html="content"
            />
          </template>
          <!--------------------------- Edit editor --------------------------->
          <LazyBaseCommentsEditor
            v-else-if="!isFetching"
            :content="comment.html"
            :comment="comment"
            class="pb-2"
            @edit-comment="editComment"
            @close-editing="isEditing = false"
          />
          <!-------------------------- Edit skeleton -------------------------->
          <BaseSceletonBox
            v-else
            with-out-full
            class="w-full h-12 rounded-lg"
          />
          <!----------------------------- Footer ------------------------------>
          <BaseCommentsItemFooter
            :comment="comment"
            :is-deleted="isDeleted"
            @delete-comment="deleteComment"
            @open-editing="isEditing = true"
          />
          <!---------------------------- Referrer ----------------------------->
          <UiLink
            v-if="withReferrer"
            :url="comment.entity.url + `#comment__${comment.id}`"
            class="flex gap-2"
          >
            <div class="w-4 h-6 flex items-center justify-center shrink-0">
              <UiIcon icon="fa-solid fa-arrow-turn-up" class="rotate-90" />
            </div>
            <span class="word-break">
              {{ comment.entity.title }}
            </span>
          </UiLink>
          <!----------------------- Delete & edit error ----------------------->
          <UiMessage v-if="showError" theme="error" class="text-comment-1">
            Произошла ошибка, попробуйте еще раз
          </UiMessage>
        </article>
        <!--------------------------- Reply editor ---------------------------->
        <slot name="editor" />
        <!----------------------------- Children ------------------------------>
        <template v-if="comment.children?.length">
          <ul
            v-if="!isChildrenHidden"
            class="flex flex-col highlighted-line-parent"
          >
            <BaseCommentsItem
              v-for="(child, idx) in comment.children"
              :key="child.id"
              :comment="child"
              :depth="depth + 1"
              :parent="parentData"
              @hide-children="hideChildren"
            >
              <!------------------------ Reply editor ------------------------->
              <template #editor>
                <LazyBaseCommentsEditor
                  v-if="editorCommentId === child.id"
                  :comment="child"
                  :depth="depth + 2"
                  :class="{ 'mt-2': !child.children.length }"
                  @show-children="showChildren"
                />
              </template>
            </BaseCommentsItem>
          </ul>
          <!--------------------- Children comments count --------------------->
          <LazyBaseCommentsItemChildrenCount
            v-else
            :count="branchCommentsCount - 1"
            @click="showChildren"
          />
        </template>
      </div>
    </div>
    <!------------------------- Branch comments count ------------------------->
    <LazyBaseCommentsItemChildrenCount
      v-else
      :count="branchCommentsCount"
      @click="isHidden = false"
    />
    <!-------------------------------- Gallery -------------------------------->
    <UiGallery :parent-selector="`#content-${comment.id}`" img-selector="img" />
  </li>
</template>

<script lang="ts">
import {
  computed,
  ref,
  PropType,
  defineComponent,
  inject,
  watch,
  onMounted,
} from 'vue'
import { useContext, useRoute } from '@nuxtjs/composition-api'
import type { AxiosError } from 'axios'
import type {
  IComment,
  IProvide,
  ICommentsParent,
} from '~/components/Base/Comments/types/types'
import {
  MAX_DEPTH_TO_SHOW,
  MAX_DEPTH,
  COMMENT_URL,
  ERROR_SHOW_TIME,
} from '~/components/Base/Comments/constants'

export default defineComponent({
  name: 'BaseCommentsItem',
  props: {
    comment: { type: Object as PropType<IComment>, required: true },
    depth: { type: Number, default: 0 },
    parent: {
      type: Object as PropType<ICommentsParent>,
      default: () => ({}),
    },
  },
  emits: ['hide-children'],
  setup(props,) {
    const { $axios } = useContext()
    const route = useRoute()

    const { editorCommentId, withRating, withReferrer, setSelection } =
      inject<IProvide>('data') || {}

    const isFetching = ref(false)

    const isDeleted = ref(props.comment.deleted || false)
    const deleteComment = async () => {
      try {
        isFetching.value = true
        const id = props.comment.id
        const url = COMMENT_URL + '/' + id
        const data = { id, deleted: true }
        await $axios.$put(url, data)
        isDeleted.value = true
      } catch (e) {
        handleError(e as AxiosError)
      } finally {
        isFetching.value = false
      }
    }

    const isEditing = ref(false)
    const newContent = ref('')
    const editComment = async (html: string) => {
      try {
        isFetching.value = true
        const id = props.comment.id
        const url = COMMENT_URL + '/' + id
        const data = { html, id }
        await $axios.$put(url, data)
        newContent.value = html
      } catch (e) {
        handleError(e as AxiosError)
      } finally {
        isFetching.value = false
      }
    }
    const content = computed(() => {
      if (newContent.value) return newContent.value
      return isDeleted.value ? 'Этот комментарий удален.' : props.comment.html
    })

    const getCommentsCount = () => {
      if (!props.comment.children?.length) return 1
      const stack = [props.comment]
      let count = 0

      while (stack.length) {
        const comment = stack.pop()
        count++
        stack.push(...comment.children)
      }

      return count
    }
    const branchCommentsCount = ref(getCommentsCount())

    const isHidden = ref(false)

    const isChildrenHidden = ref(false)
    const hideChildren = () => (isChildrenHidden.value = true)
    const showChildren = () => (isChildrenHidden.value = false)

    onMounted(() => {
      if (
        props.depth === MAX_DEPTH_TO_SHOW &&
        !route.value.hash.includes('comment__')
      ) {
        hideChildren()
      }
    })

    const commentElement = ref<HTMLElement | null>(null)
    const parentData = computed<ICommentsParent>(() => {
      return {
        element: commentElement.value,
        name: props.comment.author.name || props.comment.author.display_name,
        childrenLength: props.comment.children?.length,
      }
    })

    const showError = ref(false)
    const handleError = (e: AxiosError) => {
      console.error(e)
      showError.value = true
      setTimeout(() => (showError.value = false), ERROR_SHOW_TIME)
    }

    const getSelection = () => {
      const selection = window.getSelection()?.toString() || ''
      setSelection && setSelection(selection)
    }

    const hasParent = computed(() => Object.keys(props.parent).length)

    return {
      isDeleted,
      content,
      deleteComment,
      isEditing,
      editComment,
      isChildrenHidden,
      isHidden,
      branchCommentsCount,
      editorCommentId,
      hideChildren,
      commentElement,
      parentData,
      isFetching,
      showChildren,
      withRating,
      showError,
      handleError,
      withReferrer,
      getSelection,
      hasParent,
    }
  },
})
</script>

<style>
/* highlight parent, when hover on child reference button */
.highlighted-parent:has(.highlighted-child:hover) > article {
  @apply bg-blue-1 z-10 relative;
}

/* highlight parent reply line, when hover on child reply-line */
.highlighted-line-parent:has(.highlighted-line:hover) .reply-line {
  @apply border-blue-5;
}

</style>
