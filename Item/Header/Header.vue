<!---------------------------------- Header ----------------------------------->
<template>
  <header class="flex flex-col gap-2">
    <div class="flex gap-2">
      <div @mouseover="setProfileComment?.(comment)">
        <!------------------------------ Avatar ------------------------------->
        <UiAvatarWithJob v-bind="avatarProps" />
      </div>
      <div class="flex flex-wrap items-center gap-y-1 gap-x-2">
        <!------------------------------- Name -------------------------------->
        <UiLink
          :url="author.url"
          theme="dark"
          class="text-text-3 font-medium"
        >
          {{ name }}
        </UiLink>
        <!----------------------------- Subscribe ----------------------------->
        <LazyBaseCommentsItemHeaderSubscribe
          v-if="showSubscribe"
          :blog-id="blogId"
          @subscribe-error="handleSubsError"
        />
        <!------------------------------- Badge ------------------------------->
        <BaseCommentsItemHeaderBadge
          :author="author"
          :comment-id="comment.id"
          :is-author-employee="comment.isAuthorEmployee"
        />
        <!------------------------------- Date -------------------------------->
        <BaseNearDateTime
          class="text-badge text-primary-disabled"
          :date="comment.posted"
        />
        <!---------------------------- Parent name ---------------------------->
        <button
          v-if="parent.name"
          class="group flex items-center gap-1 highlighted-child"
          @click="scrollToParent"
        >
          <UiIcon
            icon="fa-solid fa-arrow-up-long"
            class="px-[3px] text-primary-disabled-pro group-hover:text-blue-5"
          />
          <span
            class="text-badge text-primary-secondary group-hover:text-blue-5 hidden tab:block"
          >
            {{ parent.name }}
          </span>
        </button>
        <div
          v-if="author.positionAtWork || author.workplace"
          class="tab:w-full flex items-center gap-2"
        >
          <!------------------------ Position at work ------------------------->
          <UiLink
            v-if="author.positionAtWork"
            :url="`/user/list/?positionAtWork=${author.positionAtWorkId}`"
            theme="clean"
            class="text-comment-1 hover:text-blue-5 w-fit"
          >
            {{ author.positionAtWork }}
          </UiLink>
          <!---------------------------- Workplace ---------------------------->
          <UiLink
            v-if="author.workplace"
            :url="`/user/list/?workplace=${author.workplaceId}`"
            theme="clean"
            class="text-comment-1 hover:text-blue-5 w-fit hidden tab:block"
          >
            {{ author.workplace }}
          </UiLink>
        </div>
      </div>
    </div>
    <!---------------------------- Subscribe error ---------------------------->
    <UiMessage v-if="showError" theme="error" class="text-comment-1">
      Произошла ошибка, попробуйте еще раз
    </UiMessage>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, ref } from 'vue'
import { useContext } from '@nuxtjs/composition-api'
import type { AxiosError } from 'axios'
import type {
  IProvide,
  IComment,
  ICommentsParent,
} from '~/components/Base/Comments/types/types'
import { ERROR_SHOW_TIME } from '~/components/Base/Comments/constants'

export default defineComponent({
  name: 'BaseCommentsItemHeader',
  props: {
    comment: { type: Object as PropType<IComment>, required: true },
    parent: { type: Object as PropType<ICommentsParent>, default: () => ({}) },
  },
  setup(props) {
    const { $auth } = useContext()

    const { withoutUserSubscribe, setProfileComment } =
      inject<IProvide>('data') || {}

    const author = computed(() => props.comment.author)

    const name = computed(() => author.value.name || author.value.display_name)

    const scrollToParent = () => {
      const el = props.parent?.element
      el && el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    const blogId = computed(() => author.value.tribuneId || author.value.blogId)

    const isOwner = computed(() => $auth.user.id === author.value.id)

    const showSubscribe = computed(() => {
      if (withoutUserSubscribe) return
      return blogId.value && !isOwner.value
    })

    const avatarProps = computed(() => {
      const { id, isAuthorEmployee } = props.comment
      return {
        src: author.value.avatar,
        size: 'ms',
        tag: author.value.isExpert ? 'div' : 'NuxtLink',
        isOnline: author.value.online,
        isPremium: author.value.premium?.active && !isAuthorEmployee,
        isPlus: author.value.plus?.active && !isAuthorEmployee,
        isExpert: author.value.isExpert,
        lastResumeTitle: author.value.lastResumeTitle,
        id: `comment-profile-${id}`,
        ...(!author.value.isExpert && { to: author.value.url }),
      }
    })

    const showError = ref(false)
    const handleSubsError = (e: AxiosError) => {
      console.error(e)
      showError.value = true
      setTimeout(() => (showError.value = false), ERROR_SHOW_TIME)
    }

    return {
      name,
      scrollToParent,
      blogId,
      showSubscribe,
      author,
      avatarProps,
      setProfileComment,
      handleSubsError,
      showError,
    }
  },
})
</script>
