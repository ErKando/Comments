<!---------------------------------- Editor ----------------------------------->
<template>
  <div class="flex grow border-primary-stroke">
    <!------------------------------ Reply line ------------------------------->
    <LazyBaseCommentsEditorReplyLine
      v-if="depth"
      :depth="depth"
    />
    <div class="flex flex-col gap-2 tab:gap-3 grow">
      <!------------------------------- Rating -------------------------------->
      <LazyBaseCommentsEditorRating
        v-if="showRating"
        :current-rating="rating"
        @set-rating="setRating"
      />
      <div
        class="flex gap-1 tab:gap-2"
        :class="{ 'pt-2': isReply }"
      >
        <!--------------------------- AuthorSelect ---------------------------->
        <LazyBaseCommentsEditorAuthorSelect
          v-if="!isEditing"
          :author="currentAuthor"
          :has-owned-blogs="hasOwnedBlogs"
          @change-author="changeAuthor"
        />
        <div class="grow flex flex-col gap-2">
          <div class="grow">
            <div
              class="bg-primary-bg hover:border-blue-5 focus-within:border-blue-5 focus-within:bg-primary-white rounded-2xl pb-4 flex flex-col grow min-h-[140px] border border-transparent"
            >
              <!--------------------------- Editor ---------------------------->
              <EditorContent v-if="editor" :editor="editor" class="flex grow" />
              <!--------------------------- Toolbar --------------------------->
              <BaseCommentsEditorToolbar
                v-if="editor"
                :is-empty="isEmpty && !isReply"
                :is-reply="!!isReply"
                :editor="editor"
                :upload-image="uploadImage"
                class="mx-4 mt-auto"
                @clear-content="clearContent"
                @handle-submit="handleSubmit"
              />
            </div>
          </div>
          <!------------------------------ Error ------------------------------>
          <UiMessage v-if="error" theme="error" class="text-comment-1">
            {{ error }}
          </UiMessage>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Editor, EditorContent, VueRenderer } from '@tiptap/vue-2'
import { useContext } from '@nuxtjs/composition-api'
import {
  onMounted,
  ref,
  computed,
  getCurrentInstance,
  defineComponent,
  inject,
  PropType,
} from 'vue'
import tippy from 'tippy.js'
import { Placeholder } from '@tiptap/extension-placeholder'
import MentionList from '~/components/Pages/Edit/Extensions/MentionList.vue'
import Mention from '~/components/Pages/Edit/Extensions/tiptap/Mention'
import type {
  IProvide,
  IComment,
  TRating,
  IAuthor,
} from '~/components/Base/Comments/types/types'
import { EPublishError } from '~/components/Base/Comments/types/types'
import {
  LINK,
  STARTER_KIT,
  IMAGE,
} from '~/components/Base/Comments/Editor/constants'
import { ERROR_SHOW_TIME } from '~/components/Base/Comments/constants'

export default defineComponent({
  name: 'BaseCommentsEditor',
  components: { EditorContent },
  props: {
    comment: { type: Object as PropType<IComment>, default: null },
    depth: { type: Number, default: 0 },
    content: { type: String, default: '' },
  },
  emits: {
    'close-editing': null,
    'edit-comment': (val: string) => val,
    'show-children': null,
  },
  setup(props, { emit }) {
    const { $auth } = useContext()
    const editor = ref()

    const content = ref(props.content)

    const isEditing = computed(() => props.content)
    const isReply = computed(() => props.comment)

    const uploadImage = (e) => {
      const images = Array.from(
        e?.target?.files ||
          e?.clipboardData?.files ||
          e?.dataTransfer?.files ||
          []
      )
        .filter((file) => /image/i.test(file.type))

      if (!images.length) return
      e.preventDefault()

      for (const image of images) {
        editor.value.chain().focus().setFigure({ image }).scrollIntoView().run()
      }
    }

    const isEmpty = computed(() => {
      return !content.value.replace(
        /&nbsp;|\s|<br>|<br \/>|<br\/>|<p>|<\/p>/g,
        ''
      )
    })

    const { uniqueCommentsAuthors, publishComment, closeEditor, withRating } =
      inject<IProvide>('data') || {}

    const parent = getCurrentInstance()?.proxy || {}

    const PLACEHOLDER = Placeholder.configure({
      placeholder: 'Введите комментарий (@ для упоминания пользователя)',
    })

    const MENTION = Mention.configure({
      HTMLAttributes: { class: 'mention' },
      suggestion: {
        items: () => uniqueCommentsAuthors || [],
        render: () => {
          let component
          let popup

          return {
            onStart: (prop) => {
              const data = { parent, propsData: prop }
              component = new VueRenderer(MentionList, data)
              popup = tippy('body', {
                getReferenceClientRect: prop.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              })
            },
            onUpdate(prop) {
              component.updateProps(prop)
              popup[0].setProps({ getReferenceClientRect: prop.clientRect })
            },
            onKeyDown(prop) {
              return component.ref?.onKeyDown(prop)
            },
            onExit() {
              popup[0].destroy()
              component.destroy()
            },
          }
        },
      },
    })

    const editorClasses =
      'focus:outline-none cursor-text grow px-4 pt-4 pb-2 base-comments'

    const initEditor = () => {
      const options = {
        content: content.value,
        extensions: [STARTER_KIT, PLACEHOLDER, LINK, IMAGE, MENTION],
        editorProps: {
          attributes: { class: editorClasses },
          handlePaste: (_: any, e: ClipboardEvent) => {
            if (!e?.clipboardData?.files?.length) return
            uploadImage(e)
          },
        },
        onUpdate: () => (content.value = editor?.value?.getHTML?.() || ''),
      }
      editor.value = new Editor(options)
      isReply.value && editor.value?.commands?.focus?.()
    }

    onMounted(initEditor)

    const clearContent = () => {
      editor.value.commands.clearContent(true)
      if (isEditing.value) emit('close-editing')
      else closeEditor?.()
    }

    const error = ref<EPublishError | null>(null)
    const toggleError = (message: EPublishError) => {
      error.value = message
      setTimeout(() => (error.value = null), ERROR_SHOW_TIME)
    }

    const rating = ref<TRating>(null)
    const showRating = computed(() => {
      return withRating && !isEditing.value && !isReply.value
    })
    const setRating = (newRating: TRating) => (rating.value = newRating)

    const handleSubmit = () => {
      const isRatingError =
        withRating &&
        !Number.isInteger(rating.value) &&
        !isEditing.value &&
        !isReply.value

      if (!$auth.loggedIn) {
        const title = 'Войдите или зарегистрируйтесь, чтобы комментировать'
        return $auth.open.login({ title })
      }
      if (!$auth.user.confirm.email)
        return toggleError(EPublishError.UnconfirmedEmail)
      if (isRatingError) return toggleError(EPublishError.Rating)
      if (isEmpty.value) return toggleError(EPublishError.Empty)

      if (isEditing.value) emit('edit-comment', content.value)
      else {
        if (isReply.value) emit('show-children')
        const isBrand = currentAuthor.value.id !== $auth.user.ownedBlogs[0].id
        const data = {
          html: content.value,
          parentComment: props.comment,
          ...(rating.value && { ratingValue: rating.value }),
          ...(isBrand && { as_brand_id: currentAuthor.value.id }),
          author: currentAuthor.value,
        }
        publishComment?.(data)
      }

      clearContent()
      const activeElement = document?.activeElement as HTMLElement
      activeElement?.blur?.()
    }

    const currentAuthor = ref({
      id: $auth.user.ownedBlogs?.[0]?.id,
      title: $auth.user.name || $auth.user.display_name,
      avatar: $auth.user.avatar,
      url: $auth.user.url,
      display_name: '',
    })
    const changeAuthor = (author: IAuthor) => (currentAuthor.value = author)
    const hasOwnedBlogs = computed(() => $auth.user.ownedBlogs.length > 1)

    return {
      editor,
      isEmpty,
      clearContent,
      handleSubmit,
      error,
      rating,
      showRating,
      setRating,
      isReply,
      currentAuthor,
      changeAuthor,
      hasOwnedBlogs,
      isEditing,
      uploadImage,
    }
  },
})
</script>
