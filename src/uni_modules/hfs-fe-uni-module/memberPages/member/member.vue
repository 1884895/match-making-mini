<template>
  <view class="member" :class="{ 'member-coin': options.coin }">
    <!-- #ifdef MP-WEIXIN -->
    <u-navbar title="开通会员" :placeholder="true" bg-color="#fff" left-icon-color="#333" :title-style="{ color: '#333', fontSize: '16px', fontWeight: 'bold' }" @left-click="backClick" />
    <!-- #endif -->
    <Coin v-if="options.coin" />
    <template v-else>
      <Interactive ref="interactive" @check-exit-popup="checkExitPopup" @close-unpaid-remind-popup="closeUnpaidRemindPopup" @start-payment="startPayment" @payment-cancel="payStayTime" @payment-fail="payStayTime" @check-short-exit="checkShortExit" />
      <Vip />
    </template>
  </view>
</template>

<script>
import dayjs from 'dayjs'
// #ifdef MP-WEIXIN
import { getAccountInfo } from '../../../../utils/login'
// #endif
import Interactive from './components/interactive.vue'
import Vip from './components/vip.vue'
import Coin from './components/coin.vue'
import { isHFSParent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Interactive, Vip, Coin },
  data() {
    return {
      options: {},
      degradeInfo: {},
      originLevel: null,
      originType: null,
      startPayTime: '',
      backType: '', // 页面弹窗返回类型
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
    isAndroid() {
      return uni.$u.os() === 'android'
    },
    isHFSParent() {
      return isHFSParent()
    },
  },
  async onLoad(options) {
    this.options = options
    // #ifdef MP-WEIXIN
    const accountInfo = getApp().globalData.accountInfo || {}
    if (!accountInfo.openId) {
      const res = await getAccountInfo()
      getApp().globalData.accountInfo = res.data
    }
    // #endif
    options.coin && uni.setNavigationBarTitle({ title: '充值学币' })
    !options.coin && this.initPage()
  },
  methods: {
    async payStayTime() {
      this.originLevel = null
      this.originType = null
      this.checkExitPopup()
    },
    startPayment() {
      this.startPayTime = dayjs()
    },
    initPage() {
      this.$nextTick(() => {
        this.$refs.interactive.init()
        // #ifdef H5
        this.backClick()
        // #endif
      })
    },
    // 关闭挽留弹窗时，存在新发起的待支付订单，通知首页
    async closeUnpaidRemindPopup() {
      this.degradeInfo = await this.getDegradeTip()
      const { isDegrade, degradeType, isNew } = this.degradeInfo
      if ((isDegrade === false && degradeType === 0) || isNew) {
        // #ifdef H5
        nativeBridge.callHandler('updateDegradePopup', 'updateDegradePopup')
        // #endif
      }
      this.$refs.interactive.goBack()
    },
    // 获取最新待支付数据，注册不同的返回事件
    async checkExitPopup(degradeInfo) {
      this.degradeInfo = degradeInfo || await this.getDegradeTip()
      this.originLevel === null && (this.originLevel = this.degradeInfo.degradeLevel)
      this.originType === null && (this.originType = this.degradeInfo.degradeType)
      // #ifdef H5
      this.backClick()
      // #endif
    },
    checkShortExit() {
      this.backType = 'short'
      // #ifdef H5
      this.backClick()
      // #endif
    },
    // 返回
    backClick() {
      const { id, negative, degradeLevel, degradeType } = this.degradeInfo || {}
      const isSource = this.originLevel === degradeLevel && this.originType === degradeType // 同一商品
      const isShowDegrade = (this.options.unpayId === id && isSource && negative < 3) || !!(!this.options.unpayId && id)
      isShowDegrade && (this.$refs.interactive.degradeInfo = this.degradeInfo)

      // #ifdef H5
      nativeBridge.registerHandler('backClick', async () => {
        if (this.isHFSParent && isShowDegrade)
          return this.$refs.interactive.showDegradeExit()
        if (this.backType === 'short' || this.$refs.interactive.themeId === 'year_expired' || this.$refs.interactive.themeId === 'year_expiring')
          return this.$refs.interactive.showShortExit()
        this.$refs.interactive.showExit()
      })
      nativeBridge.callHandler('leftButton', 'backClick()')
      // #endif

      // #ifdef MP-WEIXIN
      if (isShowDegrade)
        return this.$refs.interactive.showDegradeExit()
      if (this.backType === 'short' || this.$refs.interactive.themeId === 'year_expired' || this.$refs.interactive.themeId === 'year_expiring')
        return this.$refs.interactive.showShortExit()
      this.$refs.interactive.showExit()
      // #endif
    },
    async getDegradeTip() {
      const res = await uni.$http.get(`${this.prefix}/v2/payments/degrade-tip`, { cid: this.options.cid }, { custom: { loading: false, error: false } })
      return res.data || {}
    },
    // 待支付弹窗-用户反馈
    async orderAction(action) {
      if (!this.degradeInfo.id)
        return
      const { id, degradeType, degradeLevel } = this.degradeInfo
      const params = { id, action, degradeType, degradeLevel }
      await uni.$http.post(`${this.prefix}/v2/payments/order-action`, params, { custom: { loading: false, error: false } })
    },
  },
  onShareAppMessage() {
    return this.$refs.interactive.getShareWeixinInfo()
  },
}
</script>

<style lang="scss" scoped>
.member {
  min-height: 100vh;
  background: #f6f6f6;
  padding-bottom: 180rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 180rpx);
  &-coin {
    padding-bottom: 0;
  }
}
</style>
