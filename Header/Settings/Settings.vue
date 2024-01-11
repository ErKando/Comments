<!--------------------------------- Settings ---------------------------------->
<template>
  <div>
    <!-------------------------------- Button --------------------------------->
    <button
      class="w-6 h-6 flex items-center justify-center group"
      @click="toggleDropDown"
    >
      <UiIcon
        icon="fa-solid fa-gear"
        class="group-hover:text-blue-5 transition group-hover:rotate-90"
        :class="{ 'text-blue-5 rotate-90': isShowDropDown }"
      />
    </button>
    <!--------------------------- DropDown (PC/Tab) --------------------------->
    <ClientOnly>
      <LazyBaseCommentsHeaderSettingsPc
        v-if="isShowDropDown && !isMobile"
        class="absolute left-0 top-full shadow z-10"
        @close-drop-down="isShowDropDown = false"
      />
    </ClientOnly>
    <!--------------------------- DropDown (Mobile) --------------------------->
    <ClientOnly>
      <LazyBaseCommentsHeaderSettingsMobile
        v-if="isMobile"
        :visible="isShowDropDown"
        @close-drop-down="isShowDropDown = false"
      />
    </ClientOnly>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useContext, useStore } from '@nuxtjs/composition-api'
import {
  useMediaQuery,
  screen,
} from '~/project/utils/use/useMediaQuery/useMediaQuery'

export default defineComponent({
  name: 'BaseCommentsHeaderSettings',
  setup() {
    const { $auth } = useContext()
    const store = useStore()

    const isShowDropDown = ref(false)
    const isMobile = useMediaQuery(screen.smaller('tab'))

    const toggleDropDown = () => {
      if (!$auth.loggedIn) {
        const title =
          'Войдите или зарегистрируйтесь, чтобы настроить комментарии'
        return $auth.open.login({ title })
      }
      if (!$auth.user.confirm.email) {
        return store.dispatch('emailConfirm/toggleVisible')
      }
      isShowDropDown.value = !isShowDropDown.value
    }

    return { isShowDropDown, isMobile, toggleDropDown }
  },
})
</script>
