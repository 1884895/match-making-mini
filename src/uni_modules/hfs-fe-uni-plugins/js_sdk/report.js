// #ifdef VUE2
import { http } from '@/plugins/luch-request/config.js'
// #endif

const platformMap = {
  android: 1,
  ios: 2,
}
export async function report(id, action, config) {
  const { platform, deviceId: uuid } = uni.getDeviceInfo()
  let device
  // #ifdef H5
  device = platformMap[platform]
  // #endif
  // #ifdef MP-WEIXIN
  device = 7
  // #endif
  const params = {
    id,
    action,
    device: device || 6,
    uuid,
  }
  // #ifdef VUE2
  await http.post(`${feConfig.api.hfs || ''}/v3/action`, params, { custom: { loading: false, error: false }, ...config })
  // #endif
  // #ifdef VUE3
  const post = uni.$http.post ?? uni.$http.Post
  await post(`${feConfig.api.hfs || ''}/v3/action`, params, { custom: { loading: false, error: false }, meta: { loading: false, error: false }, ...config })
  // #endif
}
