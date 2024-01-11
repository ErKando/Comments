<!--------------------------------- Subscribe --------------------------------->
<template>
  <button
    class="w-4 h-5 flex items-center justify-center group"
    @click="toggleSubscription"
  >
    <UiIcon
      v-tooltip="status.tooltip"
      :icon="status.icon"
      class="w-4 h-4"
      :class="status.iconClasses"
    />
  </button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useContext, useStore } from '@nuxtjs/composition-api'
import type { AxiosError } from 'axios'
import {
  SUBSCRIBE_URL,
  SUBS_STATUS,
  UN_SUBS_STATUS,
} from '~/components/Base/Comments/constants'
import type { IBlog } from '~/project/objects/auth'

export default defineComponent({
  name: 'BaseCommentsItemHeaderSubscribe',
  props: { blogId: { type: Number, required: true } },
  emits: { 'subscribe-error': (error: AxiosError) => error },
  setup(props, { emit }) {
    const { $auth, $axios } = useContext()
    const store = useStore()

    const isSubscribed = computed(() => {
      return $auth.user.subscribedBlogs.some(
        (blog: IBlog) => blog.id === props.blogId
      )
    })

    const status = computed(() => {
      if (isSubscribed.value) return SUBS_STATUS
      return UN_SUBS_STATUS
    })

    const subscribe = async () => {
      try {
        const data = { blogID: props.blogId }
        await $axios.$post(SUBSCRIBE_URL, data)
        store.commit('profile/ADD_SUBSCRIBED_BLOGS', { id: props.blogId })
      } catch (e) {
        emit('subscribe-error', e as AxiosError)
      }
    }
    const unSubscribe = async () => {
      try {
        const params = { blogID: props.blogId }
        await $axios.$delete(SUBSCRIBE_URL, { params })
        store.commit('profile/DEL_FROM_SUBSCRIBED_BLOGS', props.blogId)
      } catch (e) {
        emit('subscribe-error', e as AxiosError)
      }
    }

    const toggleSubscription = () => {
      if (!$auth.loggedIn) {
        const title = 'Войдите или зарегистрируйтесь, чтобы подписаться на блог'
        return $auth.open.login({ title })
      }
      if (!$auth.user.confirm.email) {
        return store.dispatch('emailConfirm/confirmEmail')
      }
      isSubscribed.value ? unSubscribe() : subscribe()
    }

    return { status, toggleSubscription }
  },
})
</script>
