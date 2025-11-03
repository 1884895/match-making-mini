// #ifdef MP-WEIXIN
import { getAccountInfo } from '../../../../utils/login'
// #endif
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  data() {
    return {
      options: {},
      userInfo: {},
      accountInfo: {},
      paymentInfo: {},
      inviterInfo: {},
      couponList: [],
      firstLogin: false,
    }
  },
  computed: {
    isLogin() {
      return !!this.userInfo.userId
    },
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
    prefix() {
      let prefix = '/v1/be-proxy'
      // #ifdef H5
      prefix = feConfig.api.hfs || ''
      // #endif
      return prefix
    },
    platform() {
      let platform = 'mp'
      // #ifdef H5
      platform = 'parent'
      // #endif
      return platform
    },
    isInvitee() {
      return !!this.options.askId
    },
  },
  async onLoad(options) {
    this.options = { ...options, ...this.qrCodeHandle(options.q) }
    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    this.accountInfo = getApp().globalData.accountInfo || {}
    await this.init()
    await this.getPaymentInfo()
  },
  methods: {
    qrCodeHandle(qr = '') {
      const obj = {}
      const res = decodeURIComponent(qr).split('?')
      res[1] && res[1].split('&').forEach((v) => {
        const [key, value] = v.split('=')
        obj[key] = value
      })
      return obj
    },
    async init() {
      // #ifdef MP-WEIXIN
      // 回调地址
      this.firstLogin = getApp().globalData.redirect_uri
      getApp().globalData.redirect_uri = ''

      // 获取账号信息
      if (!this.accountInfo.openId) {
        const res = await getAccountInfo()
        this.accountInfo = res.data
        getApp().globalData.accountInfo = res.data
      }
      // #endif
      if (!this.isInvitee) {
        return await this.getInviter()
      }
      return await this.getInvitee()
    },
    async getInviter() {
      try {
        const res = await uni.$http.get(`${this.prefix}/v3/activity/inviter`)
        this.inviterInfo = res.data || {}
        uni.setNavigationBarTitle({ title: this.inviterInfo.name })
        this.initPage()
      }
      catch (err) {
        return this.showError(err)
      }
    },
    async getInvitee() {
      try {
        const { askId, activityId } = this.options
        const res = await uni.$http.get(`${this.prefix}/v3/activity/invitee`, { askId, activityId })
        this.inviterInfo = res.data || {}
        uni.setNavigationBarTitle({ title: this.inviterInfo.name })
        this.initPage()
      }
      catch (err) {
        return this.showError(err)
      }
    },
    // 获取支付信息
    async getPaymentInfo() {
      const res = await uni.$http.get(`${this.prefix}/v2/user-center/payment-info`, {}, { custom: { loading: false, error: false } })
      this.paymentInfo = res.data || {}
    },
    // 领取优惠券
    async getCoupon(couponGroup) {
      const { activityId, askId } = this.inviterInfo
      await uni.$http.post(`${this.prefix}/v2/payments/activity-coupon`, { couponGroup, activityId, askId }, { custom: { loading: false, error: false } })
    },
    // 获取优惠券
    async getCouponList() {
      const res = await uni.$http.get(`${this.prefix}/v2/payments/coupons/receives?goodType=1&useStatus=1`, {}, { custom: { loading: false, error: false } })
      this.couponList = res.data || []
    },
    showError(err) {
      if (err.code === 3001) {
        return this.showLogin(false)
      }
      if (err.code === 13002) {
        return uni.showModal({
          title: '温馨提示',
          content: err.msg,
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#FDA828',
          success: (res) => {
            if (res.confirm) {
              // #ifdef H5
              nativeBridge.callHandler('goBack', 'goBack')
              // #endif
              // #ifdef MP-WEIXIN
              return uni.reLaunch({ url: '/pages/index/index' })
              // #endif
            }
          },
        })
      }
      return uni.$u.toast(err.msg || '获取数据失败')
    },
    showLogin(showCancel = true) {
      return uni.showModal({
        title: '温馨提示',
        content: '您尚未登录，请立即登录后继续',
        showCancel,
        confirmColor: '#FDA828',
        success: (res) => {
          if (res.confirm) {
            getApp().globalData.redirect_uri = `${uni.$u.page()}${uni.$u.queryParams(this.options)}`
            return uni.redirectTo({ url: feConfig.login })
          }
        },
      })
    },
    sharePoster() {
      this.$refs.painter.init(this.inviterInfo)
    },
    shareQr() {
      const { activityId, askId } = this.inviterInfo
      this.$refs.popup.open('qr', { qrUrl: `https://operation.haofenshu.com/#/introduction${uni.$u.queryParams({ activityId, askId })}` })
    },
    getShareWeixinInfo() {
      const { activityId, askId, inviter } = this.inviterInfo
      const { title, path, imageUrl } = this.inviterInfo.shareHY || {}
      return { title: `${inviter || '好分数'}${title}`, path: `${path}${uni.$u.queryParams({ activityId, askId })}`, imageUrl }
    },
    shareWeixin() {
      // #ifdef H5
      const { title, path, imageUrl: cover } = this.getShareWeixinInfo()
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 8, target: 'gh_dad0a8e4dc1c', data: { title, path, cover } }))
      // #endif
    },
    getShareDingDingInfo() {
      const { activityId, askId, inviter } = this.inviterInfo
      const { title, query } = this.inviterInfo.sharePYQ || {}
      return { title: `${inviter || '好分数'}${title}`, url: `${query}${encodeURIComponent(uni.$u.queryParams({ activityId, askId }, false))}` }
    },
    shareDingDing() {
      const { title, url } = this.getShareDingDingInfo()
      uni.setClipboardData({ data: `${title}：${url}`, success: () => { uni.showToast({ title: '复制成功', icon: 'none', duration: 2000 }) } })
    },
    async report(action) {
      const params = {
        activityId: this.inviterInfo.activityId,
        action,
        platform: this.platform,
      }
      await uni.$http.post(`${this.prefix}/v3/activity/action`, params, { custom: { loading: false, error: false } })
    },
  },
}
