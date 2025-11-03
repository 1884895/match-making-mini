<template>
  <view class="unpaid">
    <!-- #ifdef MP-WEIXIN -->
    <u-navbar title="继续支付" :placeholder="true" bg-color="#fff" left-icon-color="#333" :title-style="{ color: '#333', fontSize: '16px', fontWeight: 'bold' }" @left-click="goBack" />
    <!-- #endif -->
    <view v-if="orderDetail.remainSec" class="unpaid-tips">
      <view class="unpaid-tips__text">
        <image class="icon" :src="`${resourceUrl}wallet.png`" mode="widthFix" />
        <text>待付款</text>
      </view>
      <view class="unpaid-tips__count">
        <text>剩余：</text>
        <u-count-down :time="orderDetail.remainSec" format="HH:mm:ss" auto-start @finish="countFinish" />
      </view>
    </view>
    <Interactive ref="interactive">
      <template #select>
        <view class="interactive-select">
          <view v-if="orderDetail.studyCoinDeduce" class="interactive-select__item">
            <image class="icon" :src="`${resourceUrl}coin.png`" />
            <view class="title">学币</view>
            <view class="tips">已抵扣 {{ orderDetail.studyCoinDeduce }} 元</view>
          </view>
          <view v-if="orderDetail.couponDeduce" class="interactive-select__item">
            <image class="icon" :src="`${resourceUrl}ticket.png`" />
            <view class="title">优惠券</view>
            <view class="tips">已优惠 {{ orderDetail.couponDeduce }} 元</view>
          </view>
        </view>
      </template>
      <template #payment>
        <view class="payment-button">
          <view class="payment-button__cancel" @click="cancel">
            <image class="icon" :src="`${resourceUrl}monad.png`" />
            <text>取消订单</text>
          </view>
          <view class="payment-button__btn" @click="payment">
            <view>立即支付 {{ orderDetail.amount }} 元<text v-if="realDiscount > 0" class="discount">已减 {{ realDiscount }} 元</text></view>
          </view>
        </view>
      </template>
    </Interactive>
    <view class="unpaid-info">
      <view class="unpaid-info__title">订单信息</view>
      <view class="unpaid-info__item">
        <view class="label">订单编号</view>
        <view class="desc">{{ orderDetail.id }}</view>
      </view>
      <view class="unpaid-info__item">
        <view class="label">下单时间</view>
        <view class="desc">{{ formatTime(orderDetail.time, 'YYYY/MM/DD HH:mm:ss') }}</view>
      </view>
    </view>
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" :overlay-style="popup.overlayStyle" bg-color="transparent">
      <view class="unpaid-popup">
        <template v-if="popup.type === 'cancel'">
          <view class="unpaid-popup__cancel">
            <view class="title">
              确认要取消该订单吗?
            </view>
            <view class="button">
              <view class="button-item cancel" @click="closePopup">
                取消
              </view>
              <view class="button-item confirm" @click="cancelOrder">
                确认
              </view>
            </view>
          </view>
        </template>
        <template v-else>
          <view v-if="popup.type === 'rights'" class="unpaid-popup__item">
            <image class="crown" :src="`${resourceUrl}popup_crown.png`" mode="widthFix" />
            <image class="title" :src="`${resourceUrl}popup_rights.png`" mode="widthFix" />
            <image class="introduce" :src="`${resourceUrl}popup_introduce.png`" mode="widthFix" />
          </view>
          <view v-if="popup.type === 'coupon'" class="unpaid-popup__item">
            <image class="crown" :src="`${resourceUrl}popup_crown.png`" mode="widthFix" />
            <image class="ticket" :src="`${resourceUrl}popup_ticket.png`" mode="widthFix" />
            <view class="coupon">
              <view class="coupon-content">
                <view class="coupon-content__price">
                  <text>¥<text class="active">{{ couponInfo.discountValue }}</text></text>
                </view>
                <view class="coupon-content__desc">
                  <view class="name">会员开通优惠券</view>
                  <view class="tips">{{ couponInfo.promotionText }}</view>
                </view>
              </view>
              <image class="coupon-bg" :src="`${resourceUrl}popup_gift.png`" mode="widthFix" />
            </view>
            <view v-if="couponInfo.remainSec" class="countdown">
              <image class="countdown-icon" :src="`${resourceUrl}popup_clock.png`" />
              <u-count-down :time="couponInfo.remainSec || 0" format="HH:mm:ss" auto-start @change="countChange">
                <view class="count">
                  <view class="count-item">{{ formatNumber((timeData.hours + timeData.days * 24) || 0) }}</view>
                  <view class="count-item">{{ formatNumber(timeData.minutes || 0) }}</view>
                  <view class="count-item">{{ formatNumber(timeData.seconds || 0) }}</view>
                </view>
              </u-count-down>
              <text>后过期</text>
            </view>
          </view>
          <view class="unpaid-popup__button" @click="closePopup">
            继续开通
          </view>
          <view class="unpaid-popup__leave" @click="countFinish">
            狠心离开
          </view>
        </template>
      </view>
    </u-popup>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import Interactive from './components/interactive.vue'
import { formatNumber, isHFSApp, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Interactive },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/member/',
      options: {},
      orderDetail: {},
      timeData: {},
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        overlayStyle: {
          background: 'rgba(0, 0, 0, 0.7)',
        },
        type: '',
      },
    }
  },
  computed: {
    couponInfo() {
      return this.orderDetail.coupon || {}
    },
    realDiscount() {
      const { couponDeduce = 0, studyCoinDeduce = 0 } = this.orderDetail || {}
      return couponDeduce + studyCoinDeduce
    },
    prefix() {
      let prefix = '/v1/be-proxy'
      // #ifdef H5
      prefix = feConfig.api.hfs || ''
      // #endif
      return prefix
    },
  },
  onLoad(options) {
    this.options = options
    this.getOrderDetail(options.id)
    // #ifdef H5
    this.backClick()
    // #endif
  },
  methods: {
    // 获取订单详情
    async getOrderDetail(id) {
      const res = await uni.$http.get(`${this.prefix}/v2/payments/detail?id=${id}`)
      this.orderDetail = res.data || {}
      this.$refs.interactive.unpaid(this.orderDetail)
    },
    // 取消订单
    async cancelOrder() {
      this.closePopup()
      await uni.$http.delete(`${this.prefix}/v2/payments/${this.orderDetail.id}`)
      uni.$u.toast('订单已取消')
      await uni.$u.sleep(1000)
      this.countFinish()
    },
    formatNumber,
    backClick() {
      // #ifdef H5
      nativeBridge.registerHandler('backClick', this.goBack)
      nativeBridge.callHandler('leftButton', 'backClick()')
      // #endif
    },
    goBack() {
      this.showPopup(this.orderDetail.couponDeduce ? 'coupon' : 'rights')
    },
    countChange(e) {
      this.timeData = e
    },
    countFinish() {
      if (getCurrentPages().length > 1)
        return uni.navigateBack()
      // #ifdef H5
      if (isHFSApp()) {
        return nativeBridge.callHandler('goBack', 'goBack')
      }
      // #endif
      // #ifdef MP-WEIXIN
      return uni.reLaunch({ url: '/pages/index/index' })
      // #endif
    },
    async cancel() {
      this.showPopup('cancel')
    },
    payment() {
      const params = {
        aid: this.options.aid || '',
        bid: this.options.bid || '',
        cid: this.options.cid || '',
      }
      this.$refs.interactive.paymentVIP(params)
    },
    formatTime(time, format) {
      if (!time)
        return
      return dayjs(time).format(format)
    },
    showPopup(type, params = {}) {
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    closePopup() {
      this.popup.show = false
    },
  },
}
</script>

<style lang="scss" scoped>
.unpaid {
  min-height: 100vh;
  background: #f6f6f6;
  padding-bottom: 180rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 180rpx);
  &-tips {
    width: 100%;
    height: 90rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28rpx;
    background: #fff8ea;
    &__text {
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 34rpx;
      font-weight: bold;
      color: #333333;
      .icon {
        width: 36rpx;
        height: 36rpx;
        margin-right: 20rpx;
      }
    }
    &__count {
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 30rpx;
      color: #ffb100;
      ::v-deep .u-count-down__text {
        font-size: 30rpx;
        color: #ffb100;
      }
    }
  }
  &-info {
    width: 100%;
    background: #ffffff;
    border-radius: 24rpx;
    padding: 28rpx 28rpx 0;
    &__title {
      color: #333333;
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }
    &__item {
      width: 100%;
      height: 82rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1rpx solid #e6e6e6;
      &:last-child {
        border: none;
      }
      .label {
        color: #333333;
        font-size: 28rpx;
      }
      .desc {
        color: #939393;
        font-size: 28rpx;
      }
    }
  }
  .interactive-select {
    background: #ffffff;
    border-radius: 24rpx;
    padding: 0 28rpx;
    margin-bottom: 8rpx;
    &__item {
      height: 96rpx;
      display: flex;
      align-items: center;
      &:nth-child(2) {
        border-top: 1rpx solid #e6e6e6;
      }
      .icon {
        width: 36rpx;
        height: 36rpx;
        margin-right: 16rpx;
      }
      .title {
        font-size: 28rpx;
        color: #333333;
        margin-right: 12rpx;
      }
      .tips {
        font-size: 24rpx;
        color: #ff3737;
        margin-left: auto;
      }
    }
  }
  .payment-button {
    display: flex;
    align-items: center;
    padding: 0 28rpx;
    margin-bottom: 12rpx;
    &__cancel {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      font-size: 26rpx;
      color: #939393;
      white-space: nowrap;
      margin-right: 24rpx;
      .icon {
        width: 32rpx;
        height: 34rpx;
        margin-bottom: 4rpx;
      }
    }
    &__btn {
      width: 100%;
      height: 84rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: #ffffff;
      font-weight: bold;
      background: linear-gradient(225deg, #ffa430 0%, #ff7426);
      border-radius: 42rpx;
      .discount {
        font-size: 24rpx;
        font-weight: normal;
        margin-left: 10rpx;
      }
    }
  }
  &-popup {
    position: relative;
    width: 586rpx;
    background: linear-gradient(180deg, #ffe8bc, #ffffff 23%);
    border: 2rpx solid #ffffff;
    border-radius: 44rpx;
    padding-bottom: 24rpx;
    &__cancel {
      padding: 50rpx 40rpx 26rpx;
      .title {
        font-size: 32rpx;
        color: #333333;
        margin-bottom: 60rpx;
        text-align: center;
      }
      .button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        &-item {
          width: 240rpx;
          height: 82rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 40rpx;
          font-size: 32rpx;
          &.cancel {
            background-color: #f6f6f6;
            color: #333333;
          }
          &.confirm {
            background-color: #ffba1d;
            color: #ffffff;
          }
        }
      }
    }
    &__item {
      padding-top: 80rpx;
      .crown {
        position: absolute;
        top: -98rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 246rpx;
      }
      .title {
        width: 306rpx;
        margin: 0 auto 24rpx;
      }
      .ticket {
        width: 308rpx;
        margin: 12rpx auto 30rpx;
      }
      .coupon {
        position: relative;
        width: 514rpx;
        margin: 0 auto 38rpx;
        &-content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 16rpx;
          z-index: 1;
          &__price {
            width: 130rpx;
            color: #ff0000;
            font-size: 24rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            .active {
              font-size: 52rpx;
              font-weight: bold;
            }
          }
          &__desc {
            flex: 1;
            padding-left: 24rpx;
            .name {
              color: #764514;
              font-size: 30rpx;
              font-weight: bold;
              margin-bottom: 6rpx;
            }
            .tips {
              color: #ff3636;
              font-size: 24rpx;
            }
          }
        }
        &-bg {
          width: 100%;
        }
      }
      .introduce {
        width: 478rpx;
        margin: 0 auto 38rpx;
      }
      .countdown {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30rpx;
        color: #333333;
        margin-bottom: 24rpx;
        &-icon {
          width: 30rpx;
          height: 34rpx;
          margin-right: 12rpx;
        }
        .count {
          display: flex;
          align-items: center;
          margin-right: 8rpx;
          .count-item {
            width: 44rpx;
            height: 36rpx;
            position: relative;
            background: #fff5f5;
            border-radius: 6rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30rpx;
            font-weight: bold;
            color: #ff4545;
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
    &__button {
      width: 486rpx;
      height: 92rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 32rpx;
      font-weight: bold;
      background: linear-gradient(225deg, #ffa430 0%, #ff7426);
      border-radius: 46rpx;
      margin: 0 auto 18rpx;
    }
    &__leave {
      color: #cccccc;
      font-size: 26rpx;
      text-align: center;
    }
  }
}
</style>
