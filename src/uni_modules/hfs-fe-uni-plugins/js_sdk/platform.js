/**
 * 获取UA
 * @export getUA
 * @return {string}
 */
export function getUA() {
  return uni.getSystemInfoSync().ua
}

/**
 * 是否是HFSApp
 * @export isHFSApp
 * @return {boolean}
 */
export function isHFSApp() {
  return getUA().includes('HFS')
}

/**
 * 判断是否是小多伴学App
 * @export isXDBX
 * @return {boolean}
 */
export function isXDBXApp() {
  return getUA().includes('XDBX')
}

/**
 * 是否是App(好分数或小多伴学)
 * @return {boolean}
 */
export function isApp() {
  return isHFSApp() || isXDBXApp()
}

/**
 * 是否是HFS学生端
 * @export isHFSStudent
 * @return {boolean}
 */
export function isHFSStudent() {
  return getUA().includes('HFS_XS')
}

/**
 * 是否是HFS家长端
 * @export isHFSParent
 * @return {boolean}
 */
export function isHFSParent() {
  return getUA().includes('HFS_JZ')
}

/**
 * 是否是提分宝
 * @export isTFBApp
 * @return {boolean}
 */
export function isTFBApp() {
  return getUA().includes('TFB')
}

/**
 * 是否是提分宝平板
 * @export isTFBPad
 * @return {boolean}
 */
export function isTFBPad() {
  return getUA().includes('TFB_APP')
}

/**
 * 是否是提分宝墨水屏
 * @export isTFBInk
 * @return {boolean}
 */
export function isTFBInk() {
  return getUA().includes('TFB_INK')
}

/**
 * 是否是微信
 * @export isWechat
 * @return {boolean}
 */
export function isWechat() {
  return getUA().includes('MicroMessenger')
}

/**
 * 是否是QQ
 * @export isQQ
 * @return {boolean}
 */
export function isQQ() {
  return getUA().includes('QQ') || getUA().includes('MQQBrowser')
}

/**
 * 是否是小程序
 * @export isMiniProgram
 * @return {boolean}
 */
export function isMiniProgram() {
  return getUA().includes('miniProgram') || window.__wxjs_environment === 'miniprogram'
}

/**
 * 是否是鸿蒙
 * @export isHarmony
 * @return {boolean}
 */
export function isHarmony() {
  return getUA().includes('OpenHarmony') || getUA().includes('ArkWeb')
}

/**
 * 是否是AI提分教练手机
 * @export isAICPhone
 * @return {boolean}
 */
export function isAICPhone() {
  const ua = getUA()
  const match = ua.match(/appType=(\d)/)
  return match && match[1] === '1'
}

/**
 * 是否是AI提分教练平板
 * @export isAICPad
 * @return {boolean}
 */
export function isAICPad() {
  const ua = getUA()
  const match = ua.match(/appType=(\d)/)
  return match && match[1] === '2'
}
