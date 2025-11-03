<template>
  <view class="detail">
    <view class="detail-header">
      <image class="detail-header__avatar" :src="`${resourceUrl}/images/memberPages/behalf/detail-avatar.png`" mode="widthFix" />
      <view class="detail-header__info">
        <text class="name">
          {{ detail.studentName }}
        </text>
        发给你的代付请求
      </view>
    </view>
    <view class="detail-payment-info">
      <view class="detail-payment-info__title">
        <view class="detail-payment-info__title-text">
          需付款
        </view>
      </view>
      <view class="detail-payment-info__amount">
        <view class="detail-payment-info__amount-text">
          <text class="detail-payment-info__amount-text-rmb">
            ¥
          </text>{{ detail.amount || '0' }}
        </view>
      </view>
      <view class="detail-payment-info__line" />
      <view class="detail-payment-info__count-down">
        <view class="detail-payment-info__count-down-text">
          支付剩余时间：
        </view>
        <u-count-down :time="detail.remainSec || 0" format="HH:mm:ss" auto-start @change="countChange">
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
    </view>
    <view class="detail-good-info">
      <view class="detail-good-info__title">
        <text class="detail-good-info__title-text">
          商品信息
        </text>
        <view class="detail-good-info__title-logo">
          <image
            class="detail-good-info__title-logo-img"
            :src="`${resourceUrl}/images/memberPages/behalf/logo.png`"
            mode="widthFix"
          />
        </view>
      </view>
      <view class="detail-good-info__content">
        <view class="good">
          <view class="good-item active">
            <view class="name">
              {{ good.name }}
            </view>
            <view class="price" :class="{ active: good.promotionText }">
              <view class="price-cost">
                {{ good.cost }}<text class="active">
                  元
                </text><view v-if="good.discount" class="price-cost__discount">
                  {{ good.discount }}
                </view>
              </view>
              <view v-if="good.dayPrice" class="price-day">
                <text v-if="good.line">
                  原价：
                </text><text :class="{ through: good.line }">
                  {{ good.dayPrice }}
                </text>
              </view>
            </view>
            <view v-if="good.promotionTop" class="tag">
              {{ good.promotionTop }}
            </view>
            <view v-if="good.promotionText" class="tip">
              {{ good.promotionText }}
            </view>
            <image class="icon" :src="`${memberUrl}crown.png`" />
          </view>
          <view class="good-desc">
            <view class="good-desc__title">
              读懂成绩 提升成绩
            </view>
            <view class="good-desc__text">
              4500万学生的智慧学习方式
            </view>
            <view class="good-desc__text">
              让成绩弯道超车！
            </view>
            <view class="good-desc__btn" @click="jumpVip">
              了解好分数会员<u-icon name="arrow-right" size="22rpx" color="#ff9a00" bold />
            </view>
          </view>
        </view>
      </view>
    </view>
    <Payment ref="payment" @success="paymentSuccess">
      <view class="detail-footer">
        <view class="detail-footer__btn" :class="{ invalid }" @click="paymentVIP">
          {{ fotterBtnText }}
        </view>
      </view>
    </Payment>
    <view class="safe-area-bottom" />
  </view>
</template>

<script>
import Payment from '../components/payment.vue'
// #ifdef MP-WEIXIN
import { getAccountInfo } from '../../../../utils/login'
// #endif
import { formatNumber, isHFSApp, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Payment },
  data() {
    return {
      paymentId: '',
      detail: {},
      memberUrl: 'https://fe-resource.haofenshu.com/member/',
      resourceUrl: 'https://fe-resource.haofenshu.com/hfs-fe-portal-miniprogram/',
      timeData: {},
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
    good() {
      return this.detail.good || {}
    },
    invalid() {
      const { remainSec = 0, payStatus } = this.detail || {}

      return payStatus !== 0 || remainSec <= 0
    },
    fotterBtnText() {
      if (!this.invalid) {
        return `立即支付 ${this.detail.amount} 元`
      }

      const { remainSec = 0, payStatus } = this.detail || {}
      if (payStatus !== 0) {
        return '已支付'
      }

      if (remainSec <= 0) {
        return '订单超时'
      }

      return '未知状态'
    },
  },
  methods: {
    formatNumber,
    async getDetail() {
      const res = await uni.$http.get(`${this.prefix}/v2/payments/gift-detail?id=${this.paymentId}`)
      this.detail = res.data || {}
    },
    countChange(e) {
      this.timeData = e
    },
    jumpVip() {
      let url = '/pages/intro/index'
      // #ifdef MP-WEIXIN
      url = `/pages/webview/webview?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}`)}`
      // #endif
      // #ifdef H5
      if (isHFSApp()) {
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${window.location.origin}${url}` }))
      }
      // #endif
      return uni.navigateTo({ url })
    },
    async paymentVIP() {
      if (this.invalid) {
        return
      }
      report('behalf', 'dfxq_ljzf_click')
      const params = {
        payThrough: 30,
        id: this.paymentId,
      }
      this.$refs.payment.paymentVIP(params, '/v2/payments/ask-gift')
    },
    paymentSuccess() {
      this.getDetail()
    },
  },
  async onLoad(options) {
    report('behalf', 'dfxq_xcx_show')
    if (!options.paymentId) {
      return uni.showToast({ title: '缺少参数', icon: 'none' })
    }
    this.paymentId = options.paymentId
    // #ifdef MP-WEIXIN
    const accountInfo = getApp().globalData.accountInfo || {}
    if (!accountInfo.openId) {
      const res = await getAccountInfo()
      getApp().globalData.accountInfo = res.data
    }
    // #endif
    this.getDetail()
  },
}
</script>

<style lang="scss" scoped>
.detail {
  position: relative;
  min-height: 100vh;
  background-color: #f6f6f6;
  background-image: url('https://fe-resource.haofenshu.com/hfs-fe-portal-miniprogram/images/memberPages/behalf/detail-bg.png');
  background-size: contain;
  background-repeat: no-repeat;

  &-header {
    padding: 36rpx 28rpx 28rpx 28rpx;

    display: flex;
    align-items: center;

    &__avatar {
      width: 84rpx;
      height: 84rpx;
    }

    &__info {
      margin-left: 16rpx;
      height: 44rpx;
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;

      .name {
        color: #ffba1d;
      }
    }
  }

  &-payment-info {
    margin: 0 28rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), #ffffff 28%);
    border: 2rpx solid #ffffff;
    border-radius: 24rpx;

    display: flex;
    flex-direction: column;

    &__title {
      padding: 40rpx 0 10rpx 0;
      display: flex;
      align-items: center;
      justify-content: center;

      &-text {
        height: 42rpx;
        font-size: 30rpx;
        font-weight: 500;
        color: #333333;
      }
    }

    &__amount {
      display: flex;
      align-items: center;
      justify-content: center;

      &-text {
        height: 74rpx;
        font-size: 52rpx;
        font-weight: 500;
        color: #333333;

        &-rmb {
          margin-right: 10rpx;
          font-size: 30rpx;
        }
      }
    }

    &__line {
      margin: 20rpx 26rpx 0 26rpx;
      height: 2rpx;
      border: 1rpx solid #e6e6e6;
    }

    &__count-down {
      padding: 34rpx 0 46rpx 0;
      display: flex;
      align-items: center;
      justify-content: center;

      &-text {
        height: 36rpx;
        font-size: 26rpx;
        color: #333333;
      }

      .count {
        display: flex;
        align-items: center;
        margin-right: 8rpx;

        .count-item {
          width: 44rpx;
          height: 36rpx;
          position: relative;
          background: #ffeaea;
          border-radius: 6rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30rpx;
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
  }

  &-good-info {
    margin: 32rpx 28rpx 0 28rpx;
    background: #ffffff;
    border-radius: 24rpx;

    display: flex;
    flex-direction: column;

    &__title {
      position: relative;
      padding: 26rpx 32rpx 24rpx 32rpx;

      &-text {
        height: 42rpx;
        font-size: 30rpx;
        font-weight: 500;
        color: #333333;
      }

      &-logo {
        position: absolute;
        top: 30rpx;
        right: 32rpx;
        width: 96rpx;
        height: 28rpx;

        &-img {
          width: 100%;
          height: 100%;
        }
      }
    }

    &__content {
      padding: 0 28rpx 32rpx 30rpx;

      display: flex;

      .good {
        width: 100%;
        display: flex;
        align-items: center;
        &-item {
          position: relative;
          display: flex;
          align-items: center;
          flex-direction: column;
          width: 192rpx;
          height: 168rpx;
          padding-top: 34rpx;
          background: linear-gradient(163deg, #ffecb5, #fff6de 81%);
          border: 2rpx solid #ffc55f;
          border-radius: 20rpx;
          .name {
            color: #70450f;
            font-size: 24rpx;
            font-weight: bold;
          }
          .price {
            z-index: 1;
            &-cost {
              color: #ff381b;
              font-size: 40rpx;
              font-weight: bold;
              position: relative;
              .active {
                font-size: 18rpx;
                color: #5d3a0c;
                margin-left: 2rpx;
              }
              &__discount {
                position: absolute;
                top: 0;
                right: 0;
                transform: translateX(90%);
                background: rgba(255, 0, 0, 0.1);
                border-radius: 4rpx;
                padding: 2rpx 6rpx;
                font-size: 12rpx;
                color: #ff0000;
              }
            }
            &-day {
              color: #70450f;
              font-size: 16rpx;
              text-align: center;
              margin-top: -6rpx;
              .through {
                text-decoration: line-through;
              }
            }
          }
          .tag {
            position: absolute;
            top: -12rpx;
            left: -2rpx;
            height: 32rpx;
            font-size: 18rpx;
            color: #ffffff;
            font-weight: 500;
            display: flex;
            align-items: center;
            background: linear-gradient(225deg, #ff450e, #ff880c);
            border-radius: 26rpx 2rpx 26rpx 2rpx;
            padding: 0 24rpx;
            z-index: 1;
          }
          .tip {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 26rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #976000;
            font-size: 14rpx;
            background: linear-gradient(225deg, #ffd766, #ffc55f);
            border-radius: 0 0 18rpx 18rpx;
            z-index: 1;
          }
          .icon {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 98rpx;
            height: 92rpx;
          }
        }
        &-desc {
          flex: 1;
          margin-left: 22rpx;
          &__title {
            height: 36rpx;
            color: #333333;
            font-size: 26rpx;
            font-weight: 500;
            margin-bottom: 8rpx;
          }
          &__text {
            height: 36rpx;
            color: #666666;
            font-size: 26rpx;
            margin-bottom: 8rpx;
          }
          &__btn {
            color: #ff9a00;
            font-size: 22rpx;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-top: 29rpx;
          }
        }
      }
    }
  }

  &-footer {
    position: fixed;
    left: 0;
    bottom: 0;
    padding: 20rpx 28rpx;
    width: 100%;
    background: #fff;
    border-radius: 24rpx 24rpx 0rpx 0rpx;
    box-shadow: 0rpx -4rpx 12rpx 0rpx rgba(0, 0, 0, 0.04);

    display: flex;
    align-items: center;
    justify-content: center;

    &__btn {
      width: 100%;
      height: 84rpx;
      background: linear-gradient(225deg, #ffa430 0%, #ff7426);
      border-radius: 42rpx;
      font-size: 32rpx;
      font-weight: 500;
      color: #ffffff;

      display: flex;
      align-items: center;
      justify-content: center;

      &.invalid {
        background: #e6e6e6;
        color: #939393;
      }
    }
  }

  .safe-area-bottom {
    height: env(safe-area-inset-bottom);
    background: #fff;
  }
}
</style>
