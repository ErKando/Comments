<!---------------------------- Comments with fetch ---------------------------->
<template>
  <!------------------------------- Fetch error ------------------------------->
  <section v-if="$fetchState.error" class="flex flex-col gap-4 items-center">
    <UiIcon
      icon="fa-solid fa-triangle-exclamation"
      class="text-red-4 text-title-6"
    />
    <UiMessage theme="error">
      Произошла ошибка загрузки комментарий, попробуйте еще раз
    </UiMessage>
    <UiButton size="md" @click="$fetch">Перезагрузить</UiButton>
  </section>
  <!----------------------------- Fetch skeleton ------------------------------>
  <BaseCommentsWithFetchSkeleton v-else-if="$fetchState.pending" />
  <!-------------------------------- Comments --------------------------------->
  <BaseComments
    v-else
    v-bind="commentsProps"
    @publish-comment="onPublish"
    @toggle-show-all-comments="toggleShowAllComments"
  >
    <!-------------------------------- Header --------------------------------->
    <template #header>
      <LazyBaseCommentsHeader v-if="!withoutHeader" />
      <!----------------------- Sort & subscribe error ------------------------>
      <UiMessage v-if="isShowError" theme="error" class="text-comment-1 -mt-4">
        Произошла ошибка, попробуйте еще раз
      </UiMessage>
    </template>
  </BaseComments>
</template>

<script lang="ts">
import { ref, reactive, watch, defineComponent, computed, provide } from 'vue'
import type { PropType } from 'vue'
import { useFetch, useContext } from '@nuxtjs/composition-api'
import type { AxiosError } from 'axios'
import type {
  TSort,
  IArticle,
  IIsSubscribed,
  ICommentsCount,
  IComment,
  IApiParams,
} from '~/components/Base/Comments/types/types'
import {
  AUTH_URLS,
  UN_AUTH_URLS,
  COMMENT_URL,
  COMMENTS_SUBSCRIBE_URL,
  ERROR_SHOW_TIME,
  DEBOUNCE_TIME,
} from '~/components/Base/Comments/constants'

export default defineComponent({
  name: 'BaseCommentsWithFetch',
  props: {
    entityId: { type: Number, required: true },
    withoutHeader: { type: Boolean, default: false },
    withoutTopEditor: { type: Boolean, default: false },
    withoutBottomEditor: { type: Boolean, default: false },
    defaultSort: { type: String as PropType<TSort>, default: 'dateasc' },
    title: { type: String, default: 'Комментарии' },
    readonly: { type: Boolean, default: false },
    showAll: { type: Boolean, default: false },
    withoutUserSubscribe: { type: Boolean, default: false },
    withRating: { type: Boolean, default: false },
    withoutPlank: { type: Boolean, default: false },
    withReferrer: { type: Boolean, default: false },
    // to not show comment on publish in opinions
    isPrivate: { type: Boolean, default: false },
    // for author badge
    article: { type: Object as PropType<IArticle>, required: true },
  },
  setup(props) {
    const { $axios, $auth } = useContext()

    const comments = ref<IComment[]>([])
    const commentsCount = reactive<ICommentsCount>({ level1: 0, total: 0 })
    const isSubscribed = reactive<IIsSubscribed>({ subscribed: false })
    const isShowError = ref(false)

    const commentsSettings = $auth.user.settings?.comments
    const settings = reactive({
      defaultSort: commentsSettings?.defaultSort || props.defaultSort,
      showAllComments: props.showAll || commentsSettings?.showAllComments,
      showAllLevels: commentsSettings?.showAllLevels,
    })
    const debounceId = ref<null | NodeJS.Timeout>(null)
    const updateUserSettings = () => {
      debounceId.value && clearTimeout(debounceId.value)
      debounceId.value = setTimeout(() => {
        const comments = { ...settings.value }
        $auth.user.update({ settings: { comments } })
      }, DEBOUNCE_TIME)
    }
    const setDefaultSort = (newSort: TSort) => {
      settings.value.defaultSort = newSort
      sort.value = newSort
      updateUserSettings()
    }
    const toggleShowAllComments = () => {
      settings.value.showAllComments = !settings.value.showAllComments
      updateUserSettings()
    }
    const toggleShowAllLevels = () => {
      settings.value.showAllLevels = !settings.value.showAllLevels
      updateUserSettings()
    }

    const authFetch = async (params: IApiParams) => {
      ;[comments.value, commentsCount.value, isSubscribed.value] =
        await Promise.all(AUTH_URLS.map((url) => $axios.$get(url, { params })))
    }
    const nonAuthFetch = async (params: IApiParams) => {
      ;[comments.value, commentsCount.value] = await Promise.all(
        UN_AUTH_URLS.map((url) => $axios.$get(url, { params }))
      )
    }
    useFetch(async () => {
      const params = { entity: props.entityId, sort: sort.value }
      const action = $auth.loggedIn ? authFetch : nonAuthFetch
      try {
        await action(params)
      } catch (e) {
        console.log(e)
        throw e
      }
    })

    const handleError = (e: AxiosError) => {
      console.error(e)
      isShowError.value = true
      setTimeout(() => {
        isShowError.value = false
      }, ERROR_SHOW_TIME)
    }

    const getComments = async () => {
      try {
        isFetching.value = true
        const params = { entity: props.entityId, sort: sort.value }
        comments.value = await $axios.$get(COMMENT_URL, { params })
      } catch (e) {
        const error = e as AxiosError
        handleError(error)
      } finally {
        isFetching.value = false
      }
    }
    const sort = ref(props.defaultSort)
    watch(() => sort.value, getComments)
    const isFetching = ref(false)

    const unSubscribe = async () => {
      try {
        isFetching.value = true
        const params = { entity: props.entityId }
        await $axios.$delete(COMMENTS_SUBSCRIBE_URL, { params })
        isSubscribed.value.subscribed = false
      } catch (e) {
        const error = e as AxiosError
        handleError(error)
      } finally {
        isFetching.value = false
      }
    }
    const subscribe = async () => {
      try {
        isFetching.value = true
        const params = { entity: props.entityId }
        await $axios.$post(COMMENTS_SUBSCRIBE_URL, params, { params })
        isSubscribed.value.subscribed = true
      } catch (e) {
        const error = e as AxiosError
        handleError(error)
      } finally {
        isFetching.value = false
      }
    }
    const toggleIsSubscribed = () => {
      const action = isSubscribed.value?.subscribed ? unSubscribe : subscribe
      action()
    }

    const commentsProps = computed(() => {
      return {
        comments: comments.value,
        article: props.article,
        entityId: props.entityId,
        withoutBottomEditor: props.withoutBottomEditor,
        withoutTopEditor: props.withoutTopEditor,
        readonly: props.readonly,
        showAll: settings.value.showAllComments,
        showAllLevels: settings.value.showAllLevels,
        withoutUserSubscribe: props.withoutUserSubscribe,
        withRating: props.withRating,
        withoutPlank: props.withoutPlank,
        withReferrer: props.withReferrer,
        hiddenCommentsPlankClasses: props.hiddenCommentsPlankClasses,
        sort: sort.value,
        isPrivate: props.isPrivate,
      }
    })

    const computedTitle = computed(() => {
      return commentsCount.value.total ? props.title : 'Начать дискуссию'
    })

    const onPublish = () => {
      commentsCount.value.total++
      !isSubscribed.value.subscribed && subscribe()
    }

    provide('header', {
      commentsCount, // BaseCommentsHeader
      computedTitle, // BaseCommentsHeader
      isFetching, // BaseCommentsHeader
      settings, // BaseCommentsHeaderSettings
      setDefaultSort, // BaseCommentsHeaderSettings
      toggleShowAllComments, // BaseCommentsHeaderSettings
      toggleShowAllLevels, // BaseCommentsHeaderSettings
      isSubscribed, // BaseCommentsHeaderSubscribe
      toggleIsSubscribed, // BaseCommentsHeaderSubscribe
      sort, // BaseCommentsHeaderSortItem'
    })

    return {
      commentsProps,
      comments,
      commentsCount,
      isShowError,
      onPublish,
      isSubscribed,
      settings,
      toggleShowAllComments,
    }
  },
})
</script>
