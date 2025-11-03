<template>
  <view class="pay">
    <Content :img-list="courseMessage.imgList" :sign-up-status="signUpStatus" />
    <Footer ref="footer" v-model:sign-up-status="signUpStatus" :account-info="accountInfo" :user-info="userInfo" :is-login="isLogin" :prefix="prefix" :good-no="goodNo" :course-message="courseMessage" />
  </view>
</template>

<script>
// #ifdef MP-WEIXIN
import { getAccountInfo } from '../../../../utils/login'
// #endif
import Content from './components/content.vue'
import Footer from './components/footer.vue'
import mixins from './mixins.js'
import { isHFSApp } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Content, Footer }, // eslint-disable-line vue/no-reserved-component-names
  mixins: [mixins],
  data() {
    return {
      signUpStatus: false,
      userInfo: {},
      accountInfo: {},
    }
  },
  computed: {
    prefix() {
      let prefix = '/v1/be-proxy'
      // #ifdef H5
      prefix = feConfig.api.hfs || ''
      // #endif
      return prefix
    },
    isLogin() {
      let isLogin = false
      // #ifdef H5
      if (isHFSApp()) {
        isLogin = true
      }
      // #endif
      // #ifdef MP-WEIXIN
      isLogin = !!this.userInfo.userId
      // #endif
      return isLogin
    },
  },
  onLoad(options) {
    if (options.paymentId) {
      // #ifdef H5
      if (!isHFSApp()) {
        window.location.href = 'HFSParent://'
        return
      }
      // #endif
      this.$nextTick(() => {
        this.$refs.footer.open()
        this.$refs.footer.paymentOptions = this.options
      })
    }
    this.init()
    this.getSignUpStatus()
  },
  methods: {
    async init() {
      // #ifdef MP-WEIXIN
      this.accountInfo = getApp().globalData.accountInfo || {}
      this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
      // 获取账号信息
      if (!this.accountInfo.openId) {
        const res = await getAccountInfo()
        this.accountInfo = res.data
        getApp().globalData.accountInfo = res.data
      }
      // #endif
    },
    async getSignUpStatus() {
      if (!this.isLogin)
        return
      const res = await uni.$http.get(`${this.prefix}/v3/activity/course/signup-status?goodNo=${this.goodNo}`, {}, { custom: { loading: false } })
      this.signUpStatus = res.data
    },
  },
}
</script>
