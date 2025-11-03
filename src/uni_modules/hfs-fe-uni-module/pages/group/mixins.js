// #ifdef MP-WEIXIN
import { getAccountInfo } from '../../../../utils/login'
// #endif
import { isHFSApp, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  data() {
    return {
      options: {},
      userInfo: {},
      accountInfo: {},
      groupInfo: {},
      openGroupInfo: {},
      paymentInfo: {},
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
    roleType() {
      return this.userInfo.roleType
    },
    grade() {
      return '0'
      // 日常活动返回0，区分毕业生时根据 grade 字段返回
      // const { grade = '' } = this.groupInfo;
      // return ['五年级', '六年级', '初三', '初四', '高三'].includes(grade) ? grade : '0';
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
    groupEnd() {
      return this.groupInfo.done === 2
    },
  },
  async onLoad(options) {
    // #ifdef H5
    if (options.paymentId && !isHFSApp()) {
      const config = {
        student: 'HaoFenShu://',
        parent: 'HFSParent://',
      }
      window.location.href = config[options.platform] || config.parent
      return
    }
    // #endif
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    this.accountInfo = getApp().globalData.accountInfo || {}
    await this.init()
    await this.getPaymentInfo()
  },
  methods: {
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
      return await this.getGroupInfo()
    },
    // 获取拼团活动信息
    async getGroupInfo() {
      try {
        const res = await uni.$http.get(`${this.prefix}/v3/activity/groupon${uni.$u.queryParams({ askId: this.options.askId })}`)
        this.groupInfo = res.data || {}
        uni.setNavigationBarTitle({ title: this.groupInfo.name })
        this.initPage()
      }
      catch (err) {
        return this.showError(err)
      }
    },
    // 获取开团活动信息
    async getOpenGroupInfo() {
      try {
        const res = await uni.$http.get(`${this.prefix}/v3/activity/groupon`)
        this.openGroupInfo = res.data || {}
      }
      catch (err) {
        return this.showError(err)
      }
    },
    // 获取支付信息
    async getPaymentInfo() {
      const res = await uni.$http.get(`${this.prefix}/v2/user-center/payment-info`)
      this.paymentInfo = res.data || {}
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
    async report(action) {
      const params = {
        activityId: this.groupInfo.activityId,
        action,
        platform: this.platform,
      }
      await uni.$http.post(`${this.prefix}/v3/activity/action`, params)
    },
  },
}
