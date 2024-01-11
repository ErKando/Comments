<!----------------------------------- Badge ----------------------------------->
<template>
  <button
    v-if="badge"
    v-tooltip="badge.tooltip"
    class="px-2 py-1 rounded-full text-badge"
    :class="badge.classes"
    @click="badge.handler"
  >
    {{ badge.title }}
  </button>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType } from 'vue'
import { useRoute } from '@nuxtjs/composition-api'
import type {
  IProvide,
  ICommentAuthor,
} from '~/components/Base/Comments/types/types'
import { useOpenModal } from '~/project/utils/use/useOpenModal/useOpenModal'

export default defineComponent({
  name: 'BaseCommentsItemHeaderBadge',
  props: {
    author: { type: Object as PropType<ICommentAuthor>, required: true },
    commentId: { type: Number, required: true },
    isAuthorEmployee: { type: Boolean, required: true },
  },
  setup(props) {
    const route = useRoute()

    const { article } = inject<IProvide>('data') || {}

    const { openPremium, openPlus } = useOpenModal()

    const badgeMap = {
      author: {
        title: 'Автор',
        classes: 'bg-yellow-1 cursor-help',
        handler: () => {},
        tooltip: {
          content: `Автор «<a class="underline hover:no-underline" href="${route.value.path}">${article?.title}</a>»`,
          interactive: true,
          maxWidth: 300,
        },
      },
      expert: {
        title: 'Эксперт',
        classes: 'bg-[#EFCD21] cursor-help',
        handler: () => {},
        tooltip: 'Специалист сервиса «Клерк.Консультаций»',
      },
      curator: {
        title: 'Куратор',
        classes: 'text-primary-white bg-Brands-Education',
        handler: () => {},
        tooltip: {
          content: 'Организует процесс обучения и помогает слушателям',
          maxWidth: 200,
        },
      },
      editor: {
        title: 'Редакция',
        classes: 'bg-primary-light-stroke cursor-help',
        handler: () => {},
        tooltip: 'Работает в Клерк.Ру',
      },
      premium: {
        title: 'Премиум',
        classes: 'text-primary-white bg-Brands-Premium hover:opacity-75',
        handler: openPremium,
        tooltip: null,
      },
      plus: {
        title: 'Плюс',
        classes: 'bg-Brands-Plus hover:opacity-75',
        handler: openPlus,
        tooltip: null,
      },
    }

    const isAuthor = props.author.id === article?.authorId && 'author'
    const isExpert = props.author.isExpert && 'expert'
    const isCurator = false && 'curator'
    const isEditor = props.isAuthorEmployee && 'editor'
    const isPremium = props.author.premium?.active && 'premium'
    const isPlus = props.author.plus?.active && 'plus'

    const status =
      isAuthor || isExpert || isCurator || isEditor || isPremium || isPlus

    const badge = computed(() => {
      if (!status) return
      return badgeMap[status]
    })

    return { badge }
  },
})
</script>
