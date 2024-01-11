<!--------------------------------- Subscribe --------------------------------->
<template>
  <div>
    <!-------------------------------- Button --------------------------------->
    <button
      v-tooltip="state.tooltip"
      class="group flex items-center gap-2 disabled:text-primary-disabled disabled:cursor-not-allowed"
      @click="tryToggleIsSubscribed"
    >
      <UiIcon
        icon="fa-solid fa-bell"
        class="transition-transform"
        :class="state.iconClasses"
      />
      <span
        class="text-text-3 group-hover:text-blue-5 phone-ms:line-clamp-1 break-all hidden"
      >
        {{ state.text }}
      </span>
    </button>
    <!--------------------------------- Text ---------------------------------->
    <transition name="fade">
      <div
        v-if="showText"
        class="absolute px-4 py-2 shadow rounded-2xl flex gap-2 bg-primary-white border border-primary-bg z-10 left-1/2 right-1/2 -translate-x-1/2 max-w-max -bottom-12 w-full"
      >
        <div class="flex items-center justify-center w-4 h-5">
          <UiIcon :icon="state.icon" :class="textIconClasses" />
        </div>
        <p class="text-text-3" v-html="state.subsText" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { inject, defineComponent, ref, nextTick, computed } from 'vue'
import { useContext, useStore } from '@nuxtjs/composition-api'
import type { IHeaderProvide } from '~/components/Base/Comments/types/types'
import {
  UN_SUBS_CONTENT,
  SUBS_CONTENT,
  SUBS_TEXT,
  UN_SUBS_TEXT,
  SHOW_SUBS_TEXT_TIME,
} from '~/components/Base/Comments/constants'

export default defineComponent({
  name: 'BaseCommentsHeaderSubscribe',
  setup() {
    const { $auth } = useContext()
    const store = useStore()

    const showText = ref(false)
    const timeoutId = ref<null | NodeJS.Timeout>(null)
    const toggleShowText = () => {
      showText.value = true
      timeoutId.value && clearTimeout(timeoutId.value)
      timeoutId.value = setTimeout(
        () => (showText.value = false),
        SHOW_SUBS_TEXT_TIME
      )
    }

    const { isSubscribed, toggleIsSubscribed } =
      inject<IHeaderProvide>('header') || {}

    const tryToggleIsSubscribed = () => {
      if (!$auth.loggedIn) {
        const title =
          'Войдите или зарегистрируйтесь, чтобы подписаться на комментарии'
        return $auth.open.login({ title })
      }
      if (!$auth.user.confirm.email) {
        return store.dispatch('emailConfirm/toggleVisible')
      }
      toggleIsSubscribed?.()
      nextTick(toggleShowText)
    }

    const state = computed(() => {
      if (isSubscribed) {
        return {
          subsText: SUBS_TEXT,
          tooltip: { content: SUBS_CONTENT, maxWidth: 190 },
          iconClasses: 'text-blue-5 -rotate-45 group-hover:text-blue-4',
          text: 'Вы подписаны',
          icon: 'fa-solid fa-check',
          textIconClasses: 'text-green-4',
        }
      }
      else {
        return {
          subsText: UN_SUBS_TEXT,
          tooltip: { content: UN_SUBS_CONTENT, maxWidth: 244 },
          iconClasses: 'text-primary-disabled-pro group-hover:text-blue-5',
          text: 'Подписаться',
          icon: 'fa-solid fa-circle-info',
          textIconClasses: 'text-yellow-3',
        }
      }
    })

    return {
      isSubscribed,
      toggleIsSubscribed,
      UN_SUBS_CONTENT,
      SUBS_CONTENT,
      tryToggleIsSubscribed,
      showText,
      state,
    }
  },
})
</script>
