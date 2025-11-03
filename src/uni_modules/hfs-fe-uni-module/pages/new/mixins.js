// #ifdef MP-WEIXIN
import { getAccountInfo } from '../../../../utils/login'
// #endif
import { isHFSStudent, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  data() {
    return {
      actionId: '667b7145925980bc5a2c6393',
      resourceUrl: 'https://fe-resource.haofenshu.com/new/',
      options: {},
      userInfo: {},
      accountInfo: {},
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
    hasStudent() {
      return this.userInfo.linkedStudent && (this.userInfo.linkedStudent.isVirtual === 2)
    },
    isMember() {
      return this.userInfo.isMember || false
    },
    prefix() {
      let prefix = '/v1/be-proxy'
      // #ifdef H5
      prefix = feConfig.api.hfs || ''
      // #endif
      return prefix
    },
    isMiniProgram() {
      return uni.$u.platform === 'weixin'
    },
    isHFSAppStudent() {
      // #ifdef H5
      if (isHFSStudent()) {
        return true
      }
      // #endif
      return false
    },
  },
  async onLoad(options) {
    this.options = { ...options, ...this.qrCodeHandle(options.q) }
    this.options.action && report(this.actionId, this.options.action)
    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    this.accountInfo = getApp().globalData.accountInfo || {}
    await this.init()
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
      if (this.pageType === 'share')
        return
      return await this.getInvitation(true)
    },
    async getInvitation(continueInvite = false) {
      try {
        const params = {}
        this.pageType === 'operation' && (params.onlyCode = 1)
        const res = await uni.$http.get(`${this.prefix}/v3/invitation`, params, { custom: { error: false } })
        this.inviterInfo = res.data || {}
        this.initPage(continueInvite)
        uni.setNavigationBarTitle({ title: this.inviterInfo.name || '好分数·给力拉新季' })
      }
      catch (err) {
        return this.showError(err)
      }
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
            this.jumpLogin()
          }
        },
      })
    },
    jumpLogin(type) {
      type && report(this.actionId, type)
      getApp().globalData.redirect_uri = `${uni.$u.page()}${uni.$u.queryParams(this.options)}`
      return uni.redirectTo({ url: `${feConfig.login}${uni.$u.queryParams(this.options)}` })
    },
    jumpBind() {
      report(this.actionId, 'yyy_bd_click')
      return uni.redirectTo({ url: `/pages/me/bindStudent?icode=${this.inviterInfo.icode}` })
    },
    jumpOperation() {
      report(this.actionId, 'yyy_cjhd_click')
      return uni.redirectTo({ url: '/uni_modules/hfs-fe-uni-module/pages/new/operation' })
    },
    // 发送邀请海报
    async sharePoster() {
      const qrUrl = await this.getQrUrl()
      this.$refs.painter.init(qrUrl, false)
    },
    async shareQr() {
      this.$refs.popup.open('qr', { qrUrl: await this.getQrUrl() })
    },
    // 海报二维码链接
    async getQrUrl() {
      let qrUrl = ''
      // #ifdef MP-WEIXIN
      if (feConfig.wxShareUrl.includes('?')) {
        qrUrl = `${feConfig.wxShareUrl}`
      }
      else {
        qrUrl = `${feConfig.wxShareUrl}${uni.$u.queryParams({ icode: await this.getInvitationCode() })}`
      }
      // #endif
      // #ifdef H5
      const platform = isHFSStudent() ? 'student' : 'parent'
      qrUrl = `${window.location.origin}/#/uni_modules/hfs-fe-uni-module/pages/new/share${uni.$u.queryParams({ icode: await this.getInvitationCode(), platform })}`
      // #endif
      return qrUrl
    },
    async getInvitationCode() {
      if (this.inviterInfo.icode)
        return this.inviterInfo.icode
      const params = { platform: this.isMiniProgram ? 2 : 1 }
      const { data } = await uni.$http.post(`${this.prefix}/v3/invitation/code`, params, { custom: { loading: false, error: false } })
      this.inviterInfo.icode = data
      return data
    },
    async getShareWeixinInfo() {
      this.openInvite()
      return {
        title: '向你推荐！一款免费查成绩的小程序！',
        content: '4500万学生的智慧学习方式！现在下载更有会员体验券包、大额优惠券、老用户同等邀请福利0元送！',
        path: `/uni_modules/hfs-fe-uni-module/pages/new/share?icode=${await this.getInvitationCode()}`,
        imageUrl: `${this.resourceUrl}weixin_share_icon.png`,
      }
    },
    async shareWeixin() {
      // #ifdef H5
      const qrUrl = await this.getQrUrl()
      this.$refs.painter.init(qrUrl)
      // #endif
    },
    async shareRemind() {
      // #ifdef H5
      const { title, path, imageUrl: cover } = await this.getShareRemindInfo()
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 8, target: 'gh_dad0a8e4dc1c', data: { title, path, cover } }))
      // #endif
    },
    async getShareRemindInfo() {
      this.openInvite()
      return {
        title: `${this.studentInfo.studentName}${this.userInfo.roleType === 2 ? '家长' : ''}提醒你去绑定好分数！绑定才能查成绩！`,
        content: '4500万学生的智慧学习方式！现在下载更有会员体验券包、大额优惠券、老用户同等邀请福利0元送！',
        path: `/pages/index/index?actionId=${this.actionId}&action=txtc_txbd_click`,
        imageUrl: 'https://hfs-oss.yunxiao.com/production/000001/weixin_share_icon.png',
      }
    },
    async showRemindCopy() {
      const title = '向你推荐！一款免费查成绩的小程序！'
      const url = `${this.inviterInfo.XCXPath}${encodeURIComponent(uni.$u.queryParams({ icode: await this.getInvitationCode(), action: 'txtc_txbd_click' }, false))}`
      uni.setClipboardData({ data: `${title}：${url}`, success: () => { uni.showToast({ title: '复制成功', icon: 'none', duration: 2000 }) } })
    },
    async shareCopy() {
      const { title, url } = await this.getShareCopyInfo()
      uni.setClipboardData({ data: `${title}：${url}`, success: () => { uni.showToast({ title: '复制成功', icon: 'none', duration: 2000 }) } })
    },
    async getShareCopyInfo() {
      const params = {
        title: '',
        url: '',
      }
      // #ifdef H5
      const platform = isHFSStudent() ? 'student' : 'parent'
      params.title = '向你推荐！一款免费查成绩的APP！'
      params.url = `${window.location.origin}/#/uni_modules/hfs-fe-uni-module/pages/new/share${uni.$u.queryParams({ icode: await this.getInvitationCode(), platform })}`
      // #endif
      // #ifdef MP-WEIXIN
      params.title = '向你推荐！一款免费查成绩的小程序！'
      params.url = `${this.inviterInfo.XCXPath}${encodeURIComponent(uni.$u.queryParams({ icode: await this.getInvitationCode() }, false))}`
      // #endif
      return params
    },
    openInvite() {
      setTimeout(() => {
        this.$refs.popup.open('invite', { title: '继续邀约！' })
        this.$refs.painter.show = false
        this.$refs.progress.showGif = false
      }, 300)
      report(this.actionId, 'yytc_show')
    },
  },
}
