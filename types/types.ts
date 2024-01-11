import type { Ref } from 'vue'
import type { ICommentsSettings } from '~/project/objects/auth'

export type TSort = 'likes' | 'datedesc' | 'dateasc'
export interface IArticle {
  title: string
  authorId: number
}
export interface IIsSubscribed {
  subscribed: boolean
}
export interface ICommentsCount {
  level1: number
  total: number
}

export interface ICommentAuthor {
  id: number
  display_name: string
  name: string
  avatar: string
  description: string
  registered_at: string
  lastActivity: string
  url: string
  shortUrl: string
  commentsCount: number
  city: { id: number; name: string }
  positionAtWork: string
  positionAtWorkId: number
  workplace: string
  workplaceId: number
  doingWhat: string
  online: boolean
  premium: { active: boolean; param1: null; expires: null; tariffId: null }
  plus: { active: boolean; expires: null; tariffId: null }
  corporatePremium: {
    active: boolean
    expires: string
    tariffId: number
    role: number
  }
  tribuneId: number
  tribuneSubscribers: number
  on: string
  lastResumeTitle: string
  isExpert: boolean
  blogId: number
  isCompany: boolean
}

export interface IComment {
  id: number
  posted: string
  html: string
  author: ICommentAuthor
  author_id: number
  likes: number
  dislikes: number
  children: IComment[]
  platform: boolean
  deleted: boolean
  entity: {
    title: string
    url: string
  }
  ratingValue: number | null
  isAuthorEmployee: boolean
  amILike: boolean
  amIDislike: boolean
}

export type TProfileComment = IComment | null

export type TRating = null | 0 | 25 | 50 | 75 | 100

export interface IAuthor {
  avatar: string
  id: number
  title: string
  url: string
  display_name: string
}
export interface IPublish {
  html: string
  parentComment?: IComment
  ratingValue?: TRating
  as_brand_id?: number
  author?: IAuthor
}
export interface IApiParams {
  entity: number
  sort: TSort
}

export interface ISortItem {
  title: string
  value: TSort
}

export interface ICommentsAuthors {
  id: number
  text: string
  avatar: string
  name: string
}

export type TEditorCommentId = number | null

export interface IHiddenUsers {
  src: string
}

export interface IHeaderProvide {
  commentsCount: ICommentsCount
  computedTitle: string
  isSubscribed: IIsSubscribed
  isFetching: boolean
  toggleIsSubscribed: () => void
  sort: TSort
  settings: ICommentsSettings
  setDefaultSort: (sort: TSort) => void
  toggleAllComments: () => void
  toggleShowAllComments: () => void
  toggleShowAllLevels: () => void
}

export type TProfileId = null | number

export interface IProvide {
  readonly: boolean
  withoutUserSubscribe: boolean
  article: IArticle
  uniqueCommentsAuthors: ICommentsAuthors[]
  editorCommentId: TEditorCommentId
  withRating: boolean
  withReferrer: boolean
  selection: Ref<string>
  setSelection: (selection: string) => void
  setProfileComment: (comment: TProfileComment) => void
  publishComment: (data: IPublish) => void
  openEditor: (commentId: number) => void
  closeEditor: () => void
}

export interface ICommentsParent {
  element: HTMLElement | null
  name: string
  childrenLength: number
}

export type TLikeAction = 'enjoy' | 'remove'

export type TDislikeAction = 'hate' | 'remove'

export interface IRatedUser {
  avatar: string
  id: number
  displayName: string
  url: string
}

export interface IDotsItems {
  title: string
  show: boolean
  handler: () => void
}

export const enum EPublishError {
  Rating = 'Необходимо оценить компанию',
  Empty = 'Комментарий не может быть пустым',
  UnconfirmedEmail = 'Необходимо подтвердить почту',
}

export interface ISortTypes {
  title: string
  value: TSort
}
