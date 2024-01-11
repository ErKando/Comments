<!------------------------------- Like/Dislike -------------------------------->
<template>
  <div
    class="relative"
    @mouseenter="showRates"
    @mouseleave="showDropDown = false"
  >
    <!-------------------------------- Button --------------------------------->
    <button class="flex items-center gap-2 group" @click="toggleRate">
      <UiIcon
        :icon="isDislike ? 'fa-thumbs-down' : 'fa-solid fa-thumbs-up'"
        :class="iconClasses"
      />
      <LazyUiBadge
        v-if="currentCount"
        class="!font-semibold text-primary-white"
        :bg="isDislike ? 'bg-red-4' : 'bg-green-4'"
      >
        {{ currentCount }}
      </LazyUiBadge>
    </button>
    <!------------------------------- Dropdown -------------------------------->
    <UiDropDownMenu
      v-if="ratedUsers.length && showDropDown"
      :items="ratedUsers"
      max-width="max-content"
      class="z-[19]"
      position="left"
    >
      <template #item="{ item }">
        <UiLink
          :url="item.url"
          theme="clean"
          class="hover:bg-blue-2 w-full pl-4 pr-8 py-2 flex items-center gap-2"
        >
          <UiAvatar size="xs" tag="div" :src="item.avatar" />
          <span class="line-clamp-1 w-full shrink-0 text-text-3">
            {{ item.displayName }}
          </span>
        </UiLink>
      </template>
    </UiDropDownMenu>
  </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from 'vue'
import { useContext, useStore } from '@nuxtjs/composition-api'
import type { AxiosError } from 'axios'
import {
  REMOVE_ACTION,
  LIKE_ACTION,
  DISLIKE_ACTION,
  GET_RATES,
  TOGGLE_RATE_URL,
} from '~/components/Base/Comments/constants'
import type {
  TLikeAction,
  TDislikeAction,
  IRatedUser,
} from '~/components/Base/Comments/types/types'

export default defineComponent({
  name: 'BaseCommentsItemFooterRatesElem',
  props: {
    count: { type: Number, default: 0 },
    rated: { type: Boolean, default: false },
    isDislike: { type: Boolean, default: false },
    currentRated: { type: Boolean, default: false },
    commentId: { type: Number, default: 0 },
  },
  emits: {
    'toggle-rate': (val: TLikeAction | TDislikeAction) => val,
    'rate-error': (error: AxiosError) => error,
  },
  setup(props, { emit }) {
    const { $axios, $auth } = useContext()
    const store = useStore()

    const showDropDown = ref(false)

    const ratedUsers = ref<IRatedUser[]>([])

    const currentCount = computed(() => {
      return props.count + Number(props.currentRated) - Number(props.rated)
    })

    const iconClasses = computed(() => {
      const base = props.isDislike
        ? 'group-hover:text-red-3'
        : 'group-hover:text-green-3'
      const state = props.currentRated
        ? props.isDislike
          ? 'text-red-4'
          : 'text-green-4'
        : 'text-primary-disabled-pro'

      return `${base} ${state}`
    })

    const showRates = () => {
      if (!currentCount.value) return
      !ratedUsers.value.length && getRates()
      showDropDown.value = true
    }

    const getRates = async () => {
      try {
        const type = props.isDislike ? 'dislikes' : 'likes'
        const params = { id: props.commentId, type }
        ratedUsers.value = await $axios.$get(GET_RATES, { params })
      } catch (e) {
        // no need to handle
        console.error(e)
      }
    }

    const getCurrentUser = (): IRatedUser => {
      return {
        id: $auth.user.id,
        displayName: $auth.user.name,
        url: $auth.user.url,
        avatar: $auth.user.avatar,
      }
    }

    const hasCurrentUser = computed(() => {
      return ratedUsers.value.some((user) => user.id === $auth.user.id)
    })

    const toggleRate = async () => {
      if (!$auth.loggedIn) {
        const title =
          'Войдите или зарегистрируйтесь, чтобы голосовать за комментарии'
        return $auth.open.login({ title })
      }
      if (!$auth.user.confirm.email) {
        return store.dispatch('emailConfirm/toggleVisible')
      }

      let action: TLikeAction | TDislikeAction

      if (!props.currentRated) {
        action = props.isDislike ? DISLIKE_ACTION : LIKE_ACTION
        if (!hasCurrentUser.value) {
          const user = getCurrentUser()
          ratedUsers.value.push(user)
        }
        showDropDown.value = true
      } else {
        action = REMOVE_ACTION
        ratedUsers.value = ratedUsers.value.filter((user) => {
          return user.id !== $auth.user.id
        })
      }

      emit('toggle-rate', action)

      try {
        const data = { action, comment_id: props.commentId }
        await $axios.$post(TOGGLE_RATE_URL, data)
      } catch (e) {
        emit('rate-error', e as AxiosError)
      }
    }

    return {
      showDropDown,
      showRates,
      toggleRate,
      iconClasses,
      currentCount,
      ratedUsers,
    }
  },
})
</script>
