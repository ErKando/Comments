<!---------------------------------- Toolbar ---------------------------------->
<template>
  <div class="flex items-center justify-between gap-2">
    <div class="flex items-center gap-2 phone-ms:gap-4">
      <template v-for="action in actions">
        <!------------------------- Actions (button) -------------------------->
        <button
          v-if="action.name !== 'image'"
          :id="`action-${action.name}`"
          :key="action.name"
          v-tooltip="action.tooltip"
          class="flex items-center justify-center w-4 h-4 group"
          @click="action.handler"
        >
          <UiIcon
            :icon="action.icon"
            :class="{ 'text-blue-5': editor.isActive(action.name) }"
            class="group-hover:text-blue-5"
          />
        </button>
        <!-------------------------- Actions (input) -------------------------->
        <label
          v-else
          :id="`action-${action.name}`"
          :key="action.name"
          v-tooltip="action.tooltip"
          class="flex items-center justify-center w-4 h-4 group cursor-pointer"
        >
          <UiIcon :icon="action.icon" class="group-hover:text-blue-5" />
          <input type="file" hidden multiple @change="uploadImage" />
        </label>
      </template>
    </div>
    <!--------------------------- Publish & cancel ---------------------------->
    <div class="flex items-center gap-2">
      <template v-for="button in buttons">
        <template v-if="button.show">
          <UiButton
            v-if="!button.icon"
            :key="button.title"
            v-tooltip="{
              content: 'Необходима авторизация',
              onShow: () => button.isPublish && !$auth.loggedIn,
            }"
            v-bind="button.attrs"
            class="text-text-3"
            @click="button.handler"
          >
            {{ button.title }}
          </UiButton>
        </template>
      </template>
    </div>
    <!----------------------------- Link tooltip ------------------------------>
    <BaseCommentsEditorToolbarBubble v-if="editor" :editor="editor" />
    <!--------------------------- Selection tooltip --------------------------->
    <div ref="divForTooltip" class="hidden" />
    <button
      ref="selectionTooltip"
      class="bg-primary-white py-4 pl-4 pr-8 flex items-center gap-2 border border-primary-bg shadow rounded-2xl hover:bg-blue-2"
      @click="toggleBlockquote"
    >
      <div class="flex items-center justify-center w-4 h-4">
        <UiIcon icon="fa-solid fa-quote-right" />
      </div>
      <span class="text-text-3">Ответить с цитированием</span>
    </button>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  inject,
  ref,
  onMounted,
  watch,
} from 'vue'
import tippy, { followCursor, Instance } from 'tippy.js'
import 'tippy.js/animations/scale.css'
import type { Editor } from '@tiptap/vue-2'
import type { IProvide } from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsEditorToolbar',
  props: {
    editor: { type: Object as PropType<Editor>, required: true },
    isEmpty: { type: Boolean, required: true },
    uploadImage: { type: Function, required: true },
    isReply: { type: Boolean, required: true },
  },
  emits: ['clear-content', 'handle-submit'],
  setup(props, { emit }) {
    const { selection } = inject<IProvide>('data') || {}

    const tippyRef = ref<Instance | null>(null)
    const divForTooltip = ref<HTMLElement | null>(null)
    const selectionTooltip = ref<HTMLElement | null>(null)

    onMounted(() => {
      const tippyInstance = tippy(divForTooltip.value, {
        content: selectionTooltip.value,
        animation: 'scale',
        trigger: 'manual',
        placement: 'bottom',
        interactive: true,
        zIndex: 100,
        appendTo: () => document.body,
        followCursor: true,
        plugins: [followCursor],
      })

      tippyRef.value = tippyInstance
    })

    watch(
      () => selection?.value,
      (value) => {
        if (value) tippyRef.value?.show()
        else tippyRef.value?.hide()
      }
    )

    const buttons = computed(() => {
      return [
        {
          title: 'Отмена',
          show: props.isReply,
          attrs: {
            theme: 'clean',
            class: 'hidden tab:flex p-2 hover:text-blue-5',
          },
          icon: '',
          iconAttrs: {},
          handler: () => emit('clear-content'),
          isPublish: false,
        },
        {
          title: 'Отправить',
          show: true,
          attrs: {
            size: 'sm',
            theme: 'dark',
            class: 'hidden tab:flex',
          },
          icon: '',
          iconAttrs: {},
          handler: () => emit('handle-submit'),
          isPublish: true,
        },
      ]
    })

    const toggleLink = () => {
      const previousUrl = props.editor.getAttributes('link').href
      if (previousUrl) {
        props.editor.chain().focus().extendMarkRange('link').unsetLink().run()
        return
      }
      props.editor
        .chain()
        .focus()
        .command(({ state }) => {
          return state.selection.empty
        })
        .extendMarkRange('link')
        .toggleLink({ href: '' })
        .run()
    }

    const toggleBlockquote = () => {
      if (!selection?.value)
        return props.editor.chain().focus().toggleBlockquote().run()
      const chain = props.editor.chain().focus()
      const result = props.editor.isActive('blockquote')
        ? chain.selectParentNode().deleteNode().insertContent(selection.value)
        : chain.insertContent(`<blockquote>${selection.value}</blockquote>`)
      result.run()
      props.editor.commands.enter()
      props.editor.commands.enter()
    }
    const toggleBold = () => props.editor.chain().focus().toggleBold().run()
    const toggleItalic = () => props.editor.chain().focus().toggleItalic().run()
    const toggleStrike = () => props.editor.chain().focus().toggleStrike().run()

    const actions = [
      {
        icon: 'fa-solid fa-image',
        name: 'image',
        tooltip:
          'Вставить изображение <span class="text-primary-disabled">⌘/Ctrl+V</span>',
        handler: () => {},
      },
      {
        icon: 'fa-solid fa-bold',
        name: 'bold',
        tooltip: 'Жирный <span class="text-primary-disabled">⌘/Ctrl+B</span>',
        handler: toggleBold,
      },
      {
        icon: 'fa-solid fa-italic',
        name: 'italic',
        tooltip: 'Курсив <span class="text-primary-disabled">⌘/Ctrl+I</span>',
        handler: toggleItalic,
      },
      {
        icon: 'fa-solid fa-strikethrough',
        name: 'strike',
        tooltip:
          'Зачёркнутый <span class="text-primary-disabled">⌘+SHIFT+X/Ctrl+X</span>',
        handler: toggleStrike,
      },
      {
        icon: 'fa-solid fa-link',
        name: 'link',
        tooltip: 'Ссылка <span class="text-primary-disabled">⌘/Ctrl+K</span>',
        handler: toggleLink,
      },
      {
        icon: 'fa-solid fa-quote-right',
        name: 'blockquote',
        tooltip: 'Цитата',
        handler: toggleBlockquote,
      },
    ]

    return {
      buttons,
      actions,
      divForTooltip,
      selectionTooltip,
      toggleBlockquote,
    }
  },
})
</script>
