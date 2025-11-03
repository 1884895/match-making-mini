<template>
  <view class="payment">
    <view v-if="studyCoinFloat" class="payment-checked" @click="studyCoinClick">
      <view class="payment-checked__icon">
        <view v-if="useStudyCoin" class="bar" />
      </view>
      <view class="payment-checked__text">
        是否用学币抵扣？（您当前剩余学币{{ studyCoinFloat }}个）
      </view>
    </view>
    <view class="payment-goods">
      <view class="payment-goods__customer" @click="openCustomerServiceChat">
        <u-icon name="kefu-ermai" color="#777777" size="36rpx" />
        <view class="text">
          咨询客服
        </view>
      </view>
      <view class="payment-goods__price">
        <!-- <view v-if="pageType === '4'" class="payment-goods__original button" @click="paymentVIP(openGood.no, 10, openGroupInfo.askId)">
          <view class="tips">我要开团</view>
          <view class="price">¥<text class="active">{{ openPrice }}</text></view>
          <view v-if="useStudyCoin" class="text">（学币抵扣{{ openGoodCoin }}元）</view>
        </view> -->
        <view v-if="pageType === '1' || pageType === '5'" class="payment-goods__original button" @click="paymentVIP(originGood.no)">
          <view class="tips">
            单独购买
          </view>
          <view class="price">
            ¥<text class="active">
              {{ originPrice }}
            </text><text class="line">
              ¥360
            </text>
          </view>
          <view v-if="useStudyCoin" class="text">
            （学币抵扣{{ originGoodCoin }}元）
          </view>
        </view>
        <view v-if="pageType === '5'" class="payment-goods__group button" @click="paymentVIP(openGood.no, 10, openGroupInfo.askId)">
          <view class="tips">
            {{ `${openGood.count}人团价·开团` }}
          </view>
          <view class="price">
            ¥<text class="active">
              {{ openPrice }}
            </text><text class="line">
              ¥360
            </text>
          </view>
          <view v-if="useStudyCoin" class="text">
            （学币抵扣{{ openGoodCoin }}元）
          </view>
          <view class="down">
            <text class="down-text">
              直降\n{{ targetGood.minus }}元
            </text>
            <image class="down-icon" :src="`${resourceUrl}down.png`" />
          </view>
        </view>
        <view v-else class="payment-goods__group button" :class="{ active: pageType === '4' }" @click="paymentVIP(targetGood.no, 10)">
          <view class="tips">
            {{ pageType === '4' ? `立即${isMax ? '开' : '参'}团` : `${targetGood.count}人团价·开团` }}
          </view>
          <view v-if="isMax" class="price">
            该团已满，可点击开新团
          </view>
          <view v-else class="price">
            ¥<text class="active">
              {{ targetPrice }}
            </text><text v-if="pageType !== '4'" class="line">
              ¥360
            </text>
          </view>
          <view v-if="useStudyCoin" class="text">
            （学币抵扣{{ targetGoodCoin }}元）
          </view>
          <view v-if="pageType !== '4'" class="down">
            <text class="down-text">
              直降\n{{ targetGood.minus }}元
            </text>
            <image class="down-icon" :src="`${resourceUrl}down.png`" />
          </view>
          <image v-else class="mask" :src="`${resourceUrl}button_mask.png`" />
        </view>
      </view>
    </view>
    <view v-if="pageType === '4' && groupInfo.remainTime" class="payment-tips">
      <text>参团倒计时：</text>
      <u-count-down :time="(groupInfo.remainTime || 0) * 1000" format="HH:mm:ss" auto-start @change="countChange">
        <view class="count">
          <view class="count-item">
            {{ formatNumber((timeData.hours + timeData.days * 24) || 0) }}
          </view>
          <view class="count-item">
            {{ formatNumber(timeData.minutes || 0) }}
          </view>
          <view class="count-item">
            {{ formatNumber(timeData.seconds || 0) }}
          </view>
        </view>
      </u-count-down>
    </view>
    <view class="payment-env" />
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" :overlay-style="popup.overlayStyle" bg-color="transparent">
      <view class="payment-popup">
        <view class="payment-popup__content" @click="checkPaymentStatus">
          <view class="title">
            请确认微信支付是否已完成
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
import { deviceType, payThroughList } from '../../../memberPages/member/util.js'
import { formatNumber, isHFSApp, isHFSParent, isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    pageType: {
      type: String,
      default: '',
    },
    prefix: {
      type: String,
      default: '',
    },
    groupInfo: {
      type: Object,
      default: () => {},
    },
    openGroupInfo: {
      type: Object,
      default: () => {},
    },
    paymentInfo: {
      type: Object,
      default: () => {},
    },
    accountInfo: {
      type: Object,
      default: () => {},
    },
    isPlay: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['report', 'paymentReport', 'paymentSuccessReport'],
  options: {
    styleIsolation: 'shared',
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/group/',
      useStudyCoin: false,
      timeData: {},
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        overlayStyle: {
          background: 'rgba(0, 0, 0, 0.7)',
        },
      },
      paymentOptions: {},
    }
  },
  computed: {
    studyCoinFloat() {
      return this.paymentInfo.studyCoinFloat || 0
    },
    originGood() {
      return this.groupInfo.originGood || {}
    },
    originGoodCoin() {
      return Math.min(this.originGood.cost, this.studyCoinFloat)
    },
    originPrice() {
      const { cost } = this.originGood
      return this.useStudyCoin ? cost - this.originGoodCoin : cost
    },
    targetGood() {
      return this.groupInfo.targetGood || {}
    },
    targetGoodCoin() {
      return Math.min(this.targetGood.cost, this.studyCoinFloat)
    },
    targetPrice() {
      const { cost } = this.targetGood
      return this.useStudyCoin ? cost - this.targetGoodCoin : cost
    },
    openGood() {
      return this.openGroupInfo.targetGood || {}
    },
    openGoodCoin() {
      return Math.min(this.openGood.cost, this.studyCoinFloat)
    },
    openPrice() {
      const { cost } = this.openGood
      return this.useStudyCoin ? cost - this.openGoodCoin : cost
    },
    payWayList() {
      return payThroughList()
    },
    payThrough() {
      const { payThrough } = this.payWayList[0] || {}
      return payThrough
    },
    isMax() {
      const { askCount = 0, maxMember = 0 } = this.groupInfo
      return this.pageType === '4' && askCount > maxMember
    },
    platform() {
      // #ifdef H5
      if (isHFSStudent())
        return 'student'
      if (isHFSParent())
        return 'parent'
      // #endif
      return 'parent'
    },
  },
  mounted() {
    uni.$on('paymentUseStudyCoin', (useStudyCoin) => {
      this.useStudyCoin = useStudyCoin
    })
    if (this.isPlay)
      return
    uni.$on('groupPayment', ({ goodNo, activityType, askId }) => {
      this.paymentVIP(goodNo, activityType, askId)
    })
    uni.$on('progressUseStudyCoin', (useStudyCoin) => {
      this.useStudyCoin = useStudyCoin
    })
    uni.$on('progressPayment', () => {
      this.paymentVIP(this.targetGood.no, 10)
    })
  },
  unmounted() {
    uni.$off('paymentUseStudyCoin')
    if (this.isPlay)
      return
    uni.$off('groupPayment')
    uni.$off('progressUseStudyCoin')
    uni.$off('progressPayment')
  },
  methods: {
    formatNumber,
    open() {
      this.popup.show = true
    },
    close() {
      this.popup.show = false
    },
    studyCoinClick() {
      uni.$emit('paymentUseStudyCoin', !this.useStudyCoin)
    },
    countChange(e) {
      this.timeData = e
    },
    openCustomerServiceChat() {
      this.$emit('report', 'customer_btn_click')
      // #ifdef MP-WEIXIN
      const options = this.paymentInfo.isMember ? feConfig.vipCustomer : feConfig.customer
      wx.openCustomerServiceChat(options)
      // #endif
      return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: '12', data: {} }))
    },
    // 支付
    async paymentVIP(goodNo, activityType, askId) {
      if (this.isMax) {
        this.$emit('report', 'share_page_new_btn_click')
        return uni.navigateTo({ url: '/uni_modules/hfs-fe-uni-module/pages/group/open' })
      };
      if (this.isPlay)
        return uni.$emit('groupPayment', { goodNo, activityType, askId })
      this.$emit('paymentReport', activityType, askId)
      const activityId = askId || this.groupInfo.askId
      const params = {
        couponId: '',
        goodNo,
        goodType: 1,
        payThrough: this.payThrough,
        studyCoinCount: 0,
        useStudyCoin: this.useStudyCoin ? 1 : 3,
        openId: this.accountInfo.openId || undefined,
        activityId,
        activityType: activityType || 10,
        deviceType: deviceType() || undefined,
      }
      const res = await uni.$http.post(`${this.prefix}/v2/payments`, params)
      const { complete, paymentId, wechatOfficialArg, wechatH5Arg } = res.data
      this.paymentOptions = { paymentId, activityType, activityId }
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
      return this.h5Payment(wechatH5Arg)
      // #endif
    },
    // 小程序发起支付
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
    appPayment(data) {
      nativeBridge.registerHandler('payCallBack', this.payCallBack)
      nativeBridge.callHandler('wechatPay', JSON.stringify(data))
      this.open()
    },
    // H5发起支付
    h5Payment(wechatH5Arg) {
      const url = wechatH5Arg.h5_url || ''
      const { domain, params } = this.urlParser(window.location.href)
      const redirectUrl = encodeURIComponent(`${domain}${uni.$u.queryParams(Object.assign({}, params, this.paymentOptions, { platform: this.platform }))}`)
      window.location.replace(`${url}&redirect_url=${redirectUrl}`)
    },
    // 检测支付状态
    checkPaymentStatus() {
      this.close()
      this.getOrderStatus(this.paymentOptions.paymentId)
    },
    // 获取订单状态
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
      const { activityType, activityId: askId } = this.paymentOptions
      this.$emit('paymentSuccessReport', activityType)
      if (activityType) {
        uni.redirectTo({
          url: `/uni_modules/hfs-fe-uni-module/pages/group/invite${uni.$u.queryParams({ type: 1, askId })}`,
        })
      }
      else {
        uni.$u.toast('购买成功')
      }
      // #ifdef H5
      nativeBridge.callHandler('updateUserInfo', 'updateUserInfo')
      // #endif
    },
    paymentCancel() {
      return uni.$u.toast('支付取消')
    },
    paymentFail(err) {
      return uni.$u.toast(err.errMsg || err)
    },
    urlParser(url) {
      const obj = {}
      const res = url.split('?')
      res[1] && res[1].split('&').forEach((v) => {
        const [key, value] = v.split('=')
        obj[key] = value
      })
      return {
        domain: res[0],
        query: res[1],
        params: obj,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.payment {
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 999;
  &-checked {
    width: 100%;
    height: 76rpx;
    display: flex;
    align-items: center;
    padding-left: 20rpx;
    background: #f6f6f6;
    border-radius: 10rpx 10rpx 0rpx 0rpx;
    padding-bottom: 16rpx;
    margin-bottom: -16rpx;
    &__icon {
      width: 28rpx;
      height: 28rpx;
      border-radius: 50%;
      border: 2rpx solid #939393;
      position: relative;
      .bar {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 14rpx;
        height: 14rpx;
        background: #939393;
        border-radius: 50%;
      }
    }
    &__text {
      font-size: 24rpx;
      color: #939393;
      margin-left: 12rpx;
    }
  }
  &-goods {
    width: 100%;
    height: 126rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-radius: 12rpx 12rpx 0rpx 0rpx;
    box-shadow: 0rpx 2rpx 12rpx 0rpx rgba(0, 0, 0, 0.07);
    &__customer {
      width: 152rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      position: relative;
      .text {
        font-size: 22rpx;
        color: #777777;
        margin-top: 10rpx;
      }
      &::after {
        content: '';
        width: 2rpx;
        height: 64rpx;
        opacity: 0.2;
        background: #aaa;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      }
    }
    &__price {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28rpx 0 20rpx;
      .button {
        position: relative;
        width: 40%;
        height: 92rpx;
        border-radius: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        &.active {
          width: 100% !important;
          .price {
            font-size: 28rpx;
            margin-right: 0;
            .active {
              font-size: 44rpx;
              margin-right: 0;
            }
          }
        }
        .tips {
          position: absolute;
          top: -22rpx;
          right: -16rpx;
          font-size: 20rpx;
          color: #fff;
          padding: 4rpx 18rpx;
          border-radius: 200rpx 200rpx 200rpx 0rpx;
        }
        .price {
          font-size: 16rpx;
          font-weight: 500;
          color: #e74c44;
          .active {
            font-size: 36rpx;
          }
          .line {
            font-size: 18rpx;
            font-weight: normal;
            text-decoration: line-through;
            margin-left: 4rpx;
          }
        }
        .text {
          font-size: 20rpx;
          font-weight: 500;
          color: #e74c44;
          margin-top: -6rpx;
        }
        .mask {
          width: 70rpx;
          height: 92rpx;
          position: absolute;
          top: 0;
          right: 40rpx;
        }
      }
    }
    &__original {
      border: 2rpx solid #e74c44;
      .tips {
        background: linear-gradient(225deg, #e74c44, #ff675f);
      }
    }
    &__group {
      width: 332rpx !important;
      background: linear-gradient(225deg, #e74c44, #ff8e50);
      border: 2rpx solid #ffd2cf;
      box-shadow:
        4rpx 4rpx 16rpx 0rpx rgba(255, 255, 255, 0.5) inset,
        -4rpx -4rpx 16rpx 0rpx #cc472b inset;
      .tips {
        background: linear-gradient(225deg, #f4ae4b, #feab41);
      }
      .price {
        margin-right: 50rpx;
        color: #fff !important;
      }
      .text {
        margin-right: 50rpx;
        color: #fff !important;
      }
      .down {
        position: absolute;
        top: 22rpx;
        right: 18rpx;
        display: flex;
        align-items: center;
        &-text {
          font-size: 24rpx;
          color: #fff7c7;
          line-height: 26rpx;
        }
        &-icon {
          width: 31rpx;
          height: 42rpx;
          margin-left: 6rpx;
        }
      }
    }
  }
  &-tips {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    color: #ff4c4c;
    font-weight: 500;
    background: #fff;
    padding: 14rpx 0;
    .count {
      display: flex;
      align-items: center;
      margin-left: 10rpx;
      .count-item {
        width: 44rpx;
        height: 36rpx;
        position: relative;
        background: #feedc3;
        border-radius: 6rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: bold;
        color: #ff3b3b;
        margin-right: 24rpx;
        &::after {
          content: '：';
          position: absolute;
          top: 0;
          right: -34rpx;
        }
        &:last-child {
          margin-right: 0;
          &::after {
            display: none;
          }
        }
      }
    }
  }
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
  &-env {
    width: 100%;
    height: 0;
    height: env(safe-area-inset-bottom);
    background: #fff;
  }
}
</style>
