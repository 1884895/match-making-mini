<template>
  <view class="payment">
    <slot />
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" :overlay-style="popup.overlayStyle" bg-color="transparent">
      <view class="payment-popup">
        <view class="payment-popup__content" @click="checkPaymentStatus">
          <view class="title">
            请确认支付是否已完成
          </view>
          <view class="btn">
            已完成支付
          </view>
          <view class="tips">
            未完成支付
          </view>
        </view>
        <image class="payment-popup__bg" :src="`${resourceUrl}payment.png`" mode="widthFix" />
      </view>
    </u-popup>
  </view>
</template>

<script>
import { IAPId, deviceType, payThroughType } from '../member/util.js'
import { isHFSApp, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    unpaid: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['success', 'cancel', 'fail'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/member/',
      finalParams: {},
      paymentId: '',
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        overlayStyle: {
          background: 'rgba(0, 0, 0, 0.7)',
        },
      },
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
    isReview() {
      // #ifdef H5
      return +this.$route.query.isReview
      // #endif
    },
  },
  methods: {
    async paymentVIP(params = {}, url) {
      this.finalParams = { openId: this.getOpenId(), deviceType: deviceType(), ...params }
      if (this.isReview)
        return this.appPayment({ productId: `${IAPId.member}${this.finalParams.goodNo}` })
      const res = await uni.$http.post(`${this.prefix}${url || (this.unpaid ? '/v2/payments/continue' : '/v2/payments')}`, this.finalParams)
      const { complete, paymentId, wechatOfficialArg, wechatH5Arg } = res.data || {}
      this.paymentId = paymentId
      if (complete) {
        return this.paymentSuccess()
      }
      // #ifdef MP-WEIXIN
      this.miniPayment(wechatOfficialArg)
      // #endif
      // #ifdef H5
      if (isHFSApp()) {
        return this.appPayment(res.data)
      }
      return this.h5Payment(wechatH5Arg, paymentId)
      // #endif
    },
    miniPayment(wechatOfficialArg) {
      return uni.requestPayment({
        provider: 'wxpay',
        orderInfo: '好分数',
        ...wechatOfficialArg,
        success: () => {
          return this.paymentSuccess()
        },
        fail: (err) => {
          if (err.errMsg.includes('fail cancel')) {
            return this.paymentCancel()
          }
          return this.paymentFail(err)
        },
      })
    },
    async appPayment(data) {
      nativeBridge.registerHandler('payCallBack', this.payCallBack)
      const payThrough = payThroughType(this.finalParams.payThrough)
      const payMap = {
        wechat: 'wechatPay',
        alipay: 'aliPay',
        iap: 'applePay',
      }
      nativeBridge.callHandler(payMap[payThrough], JSON.stringify(data))
      !this.isReview && this.open()
    },
    h5Payment(_wechatH5Arg, _paymentId) {},
    checkPaymentStatus() {
      this.close()
      this.getOrderStatus(this.paymentId)
    },
    async getOrderStatus(paymentId) {
      const res = await uni.$http.get(`${this.prefix}/v2/payments/${paymentId}/third-party-pay-status`)
      const { status } = res.data
      if (status === 3) {
        return this.paymentSuccess()
      }
      return this.paymentCancel()
    },
    payCallBack(appCode, thirdCode) {
      this.close()
      const codeStatus = {
        '0': () => this.paymentSuccess(),
        '-1': () => this.paymentFail(thirdCode),
        '-2': () => this.paymentCancel(),
      }
      codeStatus[appCode] && codeStatus[appCode]()
    },
    paymentSuccess() {
      this.$emit('success', this.paymentId)
      // #ifdef H5
      nativeBridge.callHandler('updateUserInfo', 'updateUserInfo')
      // #endif
    },
    paymentCancel() {
      this.$emit('cancel', this.paymentId)
    },
    paymentFail(err) {
      this.$emit('fail', err)
    },
    getOpenId() {
      const { openId } = getApp().globalData.accountInfo || {}
      return openId
    },
    open() {
      this.popup.show = true
    },
    close() {
      this.popup.show = false
    },
  },
}
</script>

<style lang="scss" scoped>
.payment {
  &-popup {
    position: relative;
    &__content {
      width: 588rpx;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      padding: 240rpx 70rpx 50rpx;
      .title {
        font-size: 36rpx;
        font-weight: bold;
        text-align: center;
        color: #541b00;
        margin-bottom: 70rpx;
      }
      .btn {
        width: 100%;
        height: 78rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ff9d34;
        border-radius: 40rpx;
        font-size: 32rpx;
        font-weight: bold;
        color: #fff;
        margin-bottom: 28rpx;
      }
      .tips {
        font-size: 28rpx;
        color: #939393;
        text-align: center;
      }
    }
    &__bg {
      width: 588rpx;
      z-index: -1;
    }
  }
}
</style>
