<!--------------------------------- Comments ---------------------------------->
<template>
  <section id="comments" ref="commentsElement" class="flex flex-col max-w-256">
    <div class="flex flex-col gap-4 tab:gap-6 w-full max-w-175 self-center">
      <!---------------------------- Publish error ---------------------------->
      <UiMessage v-if="showError" theme="error" class="text-comment-1">
        Произошла ошибка, попробуйте еще раз
      </UiMessage>
      <!------------------------------- Header -------------------------------->
      <slot name="header" />
      <!----------------------------- Top editor ------------------------------>
      <LazyBaseCommentsEditor v-if="showTopEditor" />
      <ul v-if="slicedComments.length" class="flex flex-col">
        <!------------------------------- Item -------------------------------->
        <BaseCommentsItem
          v-for="comment in slicedComments"
          :key="comment.id"
          :comment="comment"
          class="mt-3 first:mt-0"
        >
          <!-------------------------- Reply editor --------------------------->
          <template #editor>
            <LazyBaseCommentsEditor
              v-if="editorCommentId === comment.id"
              :depth="1"
              :comment="comment"
              :class="{ 'mt-2': !comment.children.length }"
            />
          </template>
        </BaseCommentsItem>
      </ul>
      <!---------------------------- Bottom editor ---------------------------->
      <LazyBaseCommentsEditor v-if="showBottomEditor" />
    </div>
    <!------------------------- Hidden comments plank ------------------------->
    <LazyBaseCommentsHiddenCommentsPlank
      v-if="!isShowAll"
      class="mt-4"
      :hidden-users="computedHiddenUsers"
      :hidden-count-string="hiddenCountString"
      @show-all="isShowAll = true"
      @show-all-always="showAllAlways"
    />
    <!----------------------------- Profile plank ----------------------------->
    <LazyBaseProfilePlank
      v-if="profileComment && !withoutPlank"
      :id="profileComment.author.id"
      @on-hide="setProfileComment(null)"
    />
  </section>
</template>

<script lang="ts">
import {
  ref,
  computed,
  PropType,
  defineComponent,
  provide,
  nextTick,
  onMounted,
  shallowRef,
} from 'vue'
import { useContext, useRoute } from '@nuxtjs/composition-api'
import type { AxiosError } from 'axios'
import { plural } from '~/project/utils/utils.plural'
import type {
  IArticle,
  IComment,
  TEditorCommentId,
  IPublish,
  IHiddenUsers,
  ICommentsAuthors,
  TSort,
  TProfileComment,
} from '~/components/Base/Comments/types/types'
import {
  COMMENT_URL,
  ERROR_SHOW_TIME,
  MAX_COMMENTS_TO_SHOW,
  OPINIONS_WORDS,
  MAX_HIDDEN_USERS,
} from '~/components/Base/Comments/constants'

export default defineComponent({
  name: 'BaseComments',
  props: {
    comments: { type: Array as PropType<IComment[]>, required: true },
    entityId: { type: Number, required: true },
    withoutBottomEditor: { type: Boolean, default: false },
    withoutTopEditor: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    showAll: { type: Boolean, default: false },
    showAllLevels: { type: Boolean, default: false },
    withoutUserSubscribe: { type: Boolean, default: false },
    withRating: { type: Boolean, default: false },
    withoutPlank: { type: Boolean, default: false },
    withReferrer: { type: Boolean, default: false },
    sort: { type: String as PropType<TSort>, default: 'dateasc' },
    // to not show comment on publish in opinions
    isPrivate: { type: Boolean, default: false },
    // for author badge
    article: { type: Object as PropType<IArticle>, required: true },
  },
  emits: ['publish-comment', 'toggle-show-all-comments'],
  setup(props, { emit }) {
    const { $axios, $auth } = useContext()
    const route = useRoute()

    const commentsElement = ref<null | HTMLElement>(null)

    const comments_ = shallowRef(props.comments)

    const editorCommentId = ref<TEditorCommentId>(null)
    const openEditor = (commentId: number) => {
      if (editorCommentId.value === commentId) {
        return editorCommentId.value = null
      } else editorCommentId.value = commentId
    }
    const closeEditor = () => (editorCommentId.value = null)

    const showError = ref(false)
    const handleError = (e: AxiosError) => {
      console.error(e)
      commentsElement.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      showError.value = true
      setTimeout(() => (showError.value = false), ERROR_SHOW_TIME)
    }

    const publishComment = async (data: IPublish) => {
      isShowAll.value = true

      const { html, ratingValue, as_brand_id, parentComment } = data
      const params = {
        entity_id: props.entityId,
        html,
        parent_id: editorCommentId.value,
        ...(ratingValue && { ratingValue }),
        ...(as_brand_id && { as_brand_id }),
        ...(props.isPrivate && { private: 1 }),
      }

      editorCommentId.value = null
      try {
        const comment = await $axios.$post<IComment>(COMMENT_URL, params)
        if (parentComment) parentComment.children.push(comment)
        else {
          const method = props.sort === 'datedesc' ? 'unshift' : 'push'
          comments_.value[method](comment)
          nextTick(() => {
            const skeleton = document.querySelector(`#comment__${comment.id}`)
            skeleton?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
          })
        }
        emit('publish-comment')
      } catch (e) {
        handleError(e as AxiosError)
      }
    }

    const hiddenUsers = ref<IHiddenUsers[]>([])
    const computedHiddenUsers = computed(() => {
      if (hiddenUsers.value.length <= MAX_HIDDEN_USERS) return hiddenUsers.value
      const set = new Set(hiddenUsers.value.map((item) => JSON.stringify(item)))
      const uniqueHiddenUsers: IHiddenUsers[] = Array.from(set, (item) => {
        return JSON.parse(item)
      })
      return uniqueHiddenUsers.slice(0, MAX_HIDDEN_USERS)
    })

    const getSlicedComments = (comments: IComment[]) => {
      const [first, second, third, ...rest] = comments
      hiddenUsers.value = rest.map((comment) => {
        return { src: comment.author.avatar }
      })
      return [first, second, third]
    }

    const slicedComments = computed(() => {
      const isLowCount = comments_.value.length <= MAX_COMMENTS_TO_SHOW
      if (isShowAll.value || isLowCount) return comments_.value
      return getSlicedComments(comments_.value)
    })

    const commentsAuthors = ref<ICommentsAuthors[]>([])
    const uniqueCommentsAuthors = computed<ICommentsAuthors[]>(() => {
      const arr = commentsAuthors.value
      const set = new Set(arr.map((item) => JSON.stringify(item)))
      return Array.from(set, (item) => JSON.parse(item))
    })

    const getTotalCount = (comments: IComment[]) => {
      const stack: IComment[] = JSON.parse(JSON.stringify(comments))
      let count = 0

      while (stack.length) {
        const comment = stack.pop()
        comment.deleted && count++
        const { id, avatar, display_name: text, name } = comment.author
        commentsAuthors.value.push({ id, text, avatar, name })
        comment.children && stack.push(...comment.children)
      }

      return count
    }

    const totalCount = getTotalCount(comments_.value)

    const hiddenCountString = computed(() => {
      const slicedCommentsCount = getTotalCount(slicedComments.value)
      const count = totalCount - slicedCommentsCount
      const word = plural(count, OPINIONS_WORDS)

      return `${count} ${word}`
    })

    const isShowAll = ref(props.showAll)
    const showAllAlways = () => {
      isShowAll.value = true
      emit('toggle-show-all-comments')
    }

    const showTopEditor = computed(() => {
      if (props.withoutTopEditor || !isShowAll.value || props.readonly) return
      return comments_.value.length > MAX_COMMENTS_TO_SHOW
    })

    const showBottomEditor = computed(() => {
      return !props.withoutBottomEditor && !props.readonly
    })

    if (comments_.value.length <= MAX_COMMENTS_TO_SHOW) isShowAll.value = true

    const profileComment = shallowRef<TProfileComment>(null)
    const setProfileComment = (comment: TProfileComment) => {
      profileComment.value = comment
    }

    const selection = ref<string>('')
    const setSelection = (value: string) => (selection.value = value)

    onMounted(() => {
      route.value.hash.includes('comment__') && (isShowAll.value = true)
      document.addEventListener('selectionchange', () => (selection.value = ''))
    })

    provide('data', {
      uniqueCommentsAuthors, // BaseCommentsEditor
      publishComment, // BaseCommentsEditor
      closeEditor, // BaseCommentsEditor
      withRating: props.withRating, // BaseCommentsEditor
      selection, // BaseCommentsEditorToolbar
      editorCommentId, // BaseCommentsItem
      withReferrer: props.withReferrer, // BaseCommentsItem
      setSelection, // BaseCommentsItem
      setProfileComment, // BaseCommentsItemHeader
      withoutUserSubscribe: props.withoutUserSubscribe, // CommentsItemHeader
      article: props.article, // BaseCommentsItemHeaderBadge
      readonly: props.readonly, // BaseCommentsItemFooter
      openEditor, // BaseCommentsItemFooter
    })

    return {
      slicedComments,
      editorCommentId,
      hiddenCountString,
      isShowAll,
      showAllAlways,
      computedHiddenUsers,
      showBottomEditor,
      showTopEditor,
      setProfileComment,
      profileComment,
      commentsElement,
      showError,
    }
  },
})
</script>
