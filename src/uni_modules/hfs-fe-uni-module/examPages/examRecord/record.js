import { isHFSApp, isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/record/',
      options: {},
      config: {},
      scrollTop: 0,
    }
  },
  computed: {
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    beProxy() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/be-proxy'
      // #endif
      return prefix
    },
    showVip() {
      // #ifdef H5
      if (isHFSStudent()) {
        return false
      }
      // #endif
      return true
    },
    isMember() {
      return this.userInfo.isMember || false
    },
    userInfo() {
      return uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    },
    isExamMember() {
      // examMemberType 1:学情套餐 2:考试套餐
      return this.userInfo.examMemberType > 0 || this.isMember
    },
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
  },
  async onLoad(options) {
    this.options = options
    this.getShieldConfig()
  },
  onPageScroll(e) {
    uni.$u.debounce(() => { this.scrollTop = e.scrollTop }, 200)
  },
  methods: {
    // 获取屏蔽配置
    async getShieldConfig() {
      const config = uni.getStorageSync('shieldConfig') || {}
      if (Object.keys(config).length)
        return (this.config = config)
      const res = await uni.$http.get(`${this.beProxy}/v2/config/school/hidden-config`)
      this.config = res.data
      uni.setStorageSync('shieldConfig', res.data)
    },
    jumpPage(item, params = {}) {
      const dataMap = {
        vip: { url: '/pages/me/member', target: 8 }, // 开通会员
      }
      const { url = '', target } = dataMap[item.type] || {}
      // #ifdef MP-WEIXIN
      if (!url)
        return uni.showToast({ title: '请到APP端体验', icon: 'none' })
      uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      // #endif
      // #ifdef H5
      if (isHFSApp() && target)
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target, eventId: params.eventId || '', data: params }))
      uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      // #endif
    },
  },
}
