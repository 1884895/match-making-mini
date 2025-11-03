import type { AjaxInstance, AjaxRequestConfig } from 'uni-ajax'

declare global {
  interface Uni {
    $http: AjaxInstance<AjaxRequestConfig>
    $u: {
      [key: string]: any
    }
  }
  const feConfig: {
    api: {
      base: string
      znyx: string
      be: string
    }
    login: string
    customer: {
      extInfo: {
        url: string
      }
      corpId: string
    }
    vipCustomer: {
      extInfo: {
        url: string
      }
      corpId: string
    }
    bannerProjectId: string
    bannerSlotId: string
    myBannerSlotId: string
    courseBannerSlotId: string
    examIndexSlotId: string
    resourceUrl: string
    operationUrl: string
    mobileUrl: string
    wxShareUrl: string
  }
  const jWeixin: any
}

declare module 'uni-ajax' {
  interface CustomConfig {
    custom?: Partial<{
      loading: boolean
      error: boolean
    }>
  }
}
