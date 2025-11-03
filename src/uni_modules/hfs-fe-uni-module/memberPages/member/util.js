import { isHFSApp, isHarmony } from '@/uni_modules/hfs-fe-uni-plugins'

export const IAPId = {
  coin: 'com.HFSParent.coin.',
  member: 'com.HFSParent.member.',
}

export const payThroughEnum = {
  Mini: { payThrough: 30, title: '微信支付' }, // 微信小程序
  H5Wechat: { payThrough: 31, title: '微信支付' }, // H5微信
  IOSWechat: { payThrough: 34, title: '微信支付' }, // 苹果微信
  IOSIAP: { payThrough: 15, title: 'IAP' }, // 苹果IAP
  AndroidWechat: { payThrough: 14, title: '微信支付' }, // 安卓微信
  AndroidAlipay: { payThrough: 111, title: '支付宝' }, // 安卓支付宝
  HarmonyWechat: { payThrough: 35, title: '微信支付' }, // 鸿蒙微信
  HarmonyAlipay: { payThrough: 113, title: '支付宝' }, // 鸿蒙支付宝
}
export const payThroughMap = {
  4: '微信',
  14: '微信',
  25: '微信',
  30: '微信',
  31: '微信',
  32: '微信',
  33: '微信',
  34: '微信',
  35: '微信',
  1: '支付宝',
  110: '支付宝',
  11: '支付宝',
  111: '支付宝',
  112: '支付宝',
  113: '支付宝',
  15: '苹果应用内购买',
  3: '线下支付',
  9: '线下支付',
  21: '线下支付',
  22: '线下支付',
  26: '线下支付',
  5: '系统赠送',
}

export function payThroughType(payThrough) {
  const wechatList = [payThroughEnum.H5Wechat, payThroughEnum.IOSWechat, payThroughEnum.AndroidWechat, payThroughEnum.HarmonyWechat]
  const alipayList = [payThroughEnum.AndroidAlipay, payThroughEnum.HarmonyAlipay]
  if (payThrough === payThroughEnum.Mini.payThrough)
    return 'mini'
  if (payThrough === payThroughEnum.IOSIAP.payThrough)
    return 'iap'
  if (wechatList.some(v => v.payThrough === payThrough))
    return 'wechat'
  if (alipayList.some(v => v.payThrough === payThrough))
    return 'alipay'
}

export function payThroughList() {
  const platform = uni.$u.platform
  const platformMap = {
    weixin: () => [payThroughEnum.Mini],
    h5: () => {
      const os = uni.$u.os()
      if (isHarmony())
        return [payThroughEnum.HarmonyWechat, payThroughEnum.HarmonyAlipay]
      if (isHFSApp()) {
        const osOptions = {
          android: [payThroughEnum.AndroidWechat, payThroughEnum.AndroidAlipay],
          ios: [payThroughEnum.IOSWechat],
        }
        return osOptions[os]
      }
      return [payThroughEnum.H5Wechat]
    },
  }
  return platformMap[platform] ? platformMap[platform]() : []
};

export function deviceType() {
  const platform = uni.$u.platform
  const platformMap = {
    weixin: () => 7,
    h5: () => {
      const os = uni.$u.os()
      if (isHarmony())
        return 10
      if (isHFSApp()) {
        const osOptions = {
          android: 1,
          ios: 2,
        }
        return osOptions[os]
      }
      return 5
    },
  }
  return platformMap[platform] ? platformMap[platform]() : 6
}
