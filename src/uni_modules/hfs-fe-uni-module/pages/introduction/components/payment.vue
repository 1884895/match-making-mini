<template>
  <view class="payment">
    <view v-if="showCoupon" class="payment-coupon">
      <view v-for="(item, index) in activityCoupons" :key="index" class="payment-coupon__item">
        <view class="content">
          <view class="content-left">
            <text class="unit">
              ¥
            </text><text class="active">
              {{ item.discountValue }}
            </text>
          </view>
          <view class="content-right">
            <view class="content-right__title">
              会员开通立减券
            </view>
            <view class="content-right__desc">
              <text v-if="item.type === 1">
                有效期：2小时（含限时下单福利10元）
              </text>
              <text v-if="item.type === 2">
                有效期：7天
              </text>
            </view>
          </view>
          <template v-if="item.type === 1">
            <image class="content-tag" :src="`${resourceUrl}coupon_tag.png`" mode="widthFix" />
            <view class="content-down">
              <text>限时福利倒计时</text>
              <u-count-down :time="expireTime || 0" format="HH:mm:ss" auto-start @change="countChange" @finish="countFinish">
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
          </template>
        </view>
        <image class="bg" :src="`${resourceUrl}coupon_bg.png`" mode="widthFix" />
      </view>
    </view>
    <view v-if="studyCoinFloat" class="payment-checked" @click="studyCoinClick">
      <view class="payment-checked__icon">
        <view v-if="useStudyCoin" class="bar" />
      </view>
      <view class="payment-checked__text">
        是否用学币抵扣？（您当前剩余学币{{ studyCoinFloat }}个）
      </view>
    </view>
    <view class="payment-goods">
      <view class="payment-goods__button">
        <view class="price">
          ¥<text class="active">
            {{ currentPrice }}
          </text>
        </view>
        <view class="original">
          <view class="original-discount">
            优惠{{ useStudyCoin ? discount + goodCoin : discount }}元<text v-if="useStudyCoin" class="text">
              （学币抵扣{{ goodCoin }}元）
            </text>
          </view>
          <view class="original-price">
            原价:{{ originCost }}元
          </view>
        </view>
        <view class="btn" @click="paymentVIP">
          券后开通
        </view>
      </view>
    </view>
    <view v-if="!showCoupon && currentCoupon.type === 1" class="payment-down">
      <text class="active">
        10
      </text>
      <text>元限时下单额外奖励</text>
      <u-count-down :time="expireTime || 0" format="HH:mm:ss" auto-start @change="countChange">
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
      <text>后失效</text>
    </view>
    <view class="payment-env" />
  </view>
</template>

<script>
import { formatNumber } from '@/uni_modules/hfs-fe-uni-plugins'

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
    inviterInfo: {
      type: Object,
      default: () => ({}),
    },
    paymentInfo: {
      type: Object,
      default: () => ({}),
    },
    accountInfo: {
      type: Object,
      default: () => ({}),
    },
    couponList: {
      type: Array,
      default: () => ([]),
    },
    showCoupon: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['countFinish', 'report', 'paymentSuccess'],
  options: {
    styleIsolation: 'shared',
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/introduction/',
      useStudyCoin: false,
      timeData: {},
    }
  },
  computed: {
    activityCoupons() {
      return this.couponList.filter(v => v.type > 0) || []
    },
    currentCoupon() {
      return this.activityCoupons[0] || {}
    },
    expireTime() {
      return this.currentCoupon.expireTime - new Date().getTime()
    },
    originGood() {
      return this.inviterInfo.originGood || {}
    },
    originCost() {
      return this.originGood.cost || 0
    },
    studyCoinFloat() {
      return this.paymentInfo.studyCoinFloat || 0
    },
    discount() {
      return this.currentCoupon.discountValue || 0
    },
    activityPrice() {
      return this.originCost - this.discount
    },
    goodCoin() {
      return Math.min(this.activityPrice, this.studyCoinFloat)
    },
    currentPrice() {
      return this.useStudyCoin ? this.activityPrice - this.goodCoin : this.activityPrice
    },
  },
  mounted() {
    uni.$on('paymentUseStudyCoin', (useStudyCoin) => {
      this.useStudyCoin = useStudyCoin
    })
  },
  unmounted() {
    uni.$off('paymentUseStudyCoin')
  },
  methods: {
    formatNumber,
    countChange(e) {
      this.timeData = e
    },
    countFinish() {
      this.$emit('countFinish')
    },
    studyCoinClick() {
      uni.$emit('paymentUseStudyCoin', !this.useStudyCoin)
    },
    async paymentVIP() {
      this.$emit('report', 'share_activate_click')
      const { askId, joinAskId } = this.inviterInfo
      const activityId = joinAskId || askId || undefined
      const params = {
        couponId: this.currentCoupon.couponId,
        goodNo: this.originGood.no,
        goodType: 1,
        payThrough: 30,
        studyCoinCount: 0,
        useStudyCoin: this.useStudyCoin ? 1 : 3,
        openId: this.accountInfo.openId || undefined,
        activityId,
      }
      const res = await uni.$http.post(`${this.prefix}/v2/payments`, params)
      const { complete, wechatOfficialArg } = res.data
      if (complete) {
        return this.paymentSuccess()
      }
      this.miniPayment(wechatOfficialArg)
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
          return uni.$u.toast(err.errMsg)
        },
      })
    },
    paymentSuccess() {
      this.$emit('paymentSuccess')
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
  background: #fff;
  &-coupon {
    width: 100%;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: center;
    margin-bottom: 32rpx;
    &__item {
      position: relative;
      width: 526rpx;
      height: 136rpx;
      margin-bottom: 12rpx;
      .content {
        height: 100%;
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        &-left {
          width: 166rpx;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22rpx;
          color: #ff2d25;
          font-weight: bold;
          .unit {
            margin-top: 1.2em;
          }
          .active {
            font-size: 64rpx;
            margin-left: 4rpx;
          }
        }
        &-right {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-left: 20rpx;
          &__title {
            font-size: 28rpx;
            font-weight: bold;
            color: #333333;
            margin-bottom: 4rpx;
          }
          &__desc {
            font-size: 18rpx;
            color: #ff2525;
          }
        }
        &-tag {
          position: absolute;
          top: 0;
          left: 0;
          width: 112rpx;
          height: 44rpx;
        }
        &-down {
          position: absolute;
          top: 0;
          right: 0;
          width: 268rpx;
          height: 34rpx;
          font-size: 18rpx;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffa980;
          border-radius: 0rpx 14rpx 0rpx 18rpx;
          .count {
            display: flex;
            align-items: center;
            margin-left: 4rpx;
            .count-item {
              width: 30rpx;
              height: 24rpx;
              position: relative;
              background: #ff6116;
              border-radius: 4rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20rpx;
              font-weight: bold;
              color: #ffffff;
              margin-right: 14rpx;
              &::after {
                content: '：';
                position: absolute;
                top: 50%;
                right: -22rpx;
                transform: translateY(-50%);
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
      }
      .bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
      }
    }
  }
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
    padding: 18rpx 20rpx;
    border-radius: 12rpx 12rpx 0rpx 0rpx;
    &__button {
      width: 100%;
      height: 92rpx;
      display: flex;
      align-items: center;
      background: linear-gradient(137deg, #fff2eb 0%, #ffeadf 86%);
      border-radius: 48rpx;
      padding-left: 26rpx;
      .price {
        font-size: 26rpx;
        font-weight: 500;
        color: #ff0000;
        margin-right: 20rpx;
        .active {
          font-size: 48rpx;
          font-weight: bold;
        }
      }
      .original {
        flex: 1;
        &-discount {
          font-size: 24rpx;
          font-weight: 500;
          color: #333333;
          .text {
            font-size: 20rpx;
            color: #939393;
          }
        }
        &-price {
          opacity: 0.7;
          font-size: 20rpx;
          color: #939393;
          text-decoration: line-through;
        }
      }
      .btn {
        width: 206rpx;
        height: 92rpx;
        font-size: 32rpx;
        font-weight: 500;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(225deg, #ff3200, #fe5c03 97%);
        border-radius: 36rpx 48rpx 48rpx 4rpx;
      }
    }
  }
  &-down {
    width: 100%;
    font-size: 26rpx;
    color: #333333;
    display: flex;
    align-items: center;
    justify-content: center;
    .active {
      font-size: 32rpx;
      font-weight: bold;
      color: #ff3b3b;
    }
    .count {
      display: flex;
      align-items: center;
      .count-item {
        width: 44rpx;
        height: 36rpx;
        background: #ffebe0;
        border-radius: 6rpx;
        position: relative;
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
          top: 50%;
          right: -34rpx;
          transform: translateY(-50%);
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
  &-env {
    width: 100%;
    height: 0;
    height: env(safe-area-inset-bottom);
    background: #fff;
  }
}
</style>
