<template>
  <view class="pay">
    <view class="pay-info">
      <view class="pay-info__title">
        <text class="pay-info__title-text">商品信息</text>
        <view class="pay-info__title-logo">
          <image class="pay-info__title-logo-img" :src="`${resourceUrl}/images/memberPages/behalf/logo.png`" mode="widthFix" />
        </view>
      </view>
      <view class="pay-info__content">
        <view class="good">
          <view class="good-item active">
            <view class="name">{{ detail.goodName }}</view>
            <view class="price">
              <view class="price-cost">{{ detail.amount }}<text class="active">元</text></view>
            </view>
            <view class="tag">限时特惠</view>
            <image class="icon" :src="`${memberUrl}crown.png`" />
          </view>
          <view class="good-desc">
            <view class="good-desc__title">读懂成绩 提升成绩</view>
            <view class="good-desc__text">4500万学生的智慧学习方式</view>
            <view class="good-desc__text">让成绩弯道超车！</view>
            <view class="good-desc__btn" @click="jumpVip">了解好分数会员<u-icon name="arrow-right" size="22rpx" color="#ff9a00" bold /></view>
          </view>
        </view>
      </view>
    </view>
    <view class="pay-list">
      <view class="pay-list__item">
        <view class="label">购买产品：</view>
        <view class="text">好分数会员</view>
      </view>
      <view class="pay-list__item">
        <view class="label">会员周期：</view>
        <view class="text">{{ detail.goodName }}</view>
      </view>
      <view class="pay-list__item active">
        <view class="label">会员价格：</view>
        <view class="text">¥ {{ detail.amount }}</view>
      </view>
    </view>
    <Payment ref="payment" @success="paymentSuccess">
      <view class="pay-footer">
        <view class="pay-footer__btn" :class="{ invalid }" @click="paymentVIP">
          {{ footerBtnText }}
        </view>
      </view>
    </Payment>
  </view>
</template>

<script lang="ts" setup>
import Payment from '../../uni_modules/hfs-fe-uni-module/memberPages/components/payment.vue'
import { getAccountInfo } from '../../utils/login'

const memberUrl = 'https://fe-resource.haofenshu.com/member/'
const resourceUrl = 'https://fe-resource.haofenshu.com/hfs-fe-portal-miniprogram/'
const paymentId = ref('')
const payment: any = ref(null)
const detail: any = ref({})
const invalid = computed(() => {
  const { remainSec = 0, payStatus } = detail.value || {}
  return payStatus !== 0 || remainSec <= 0
})
const footerBtnText = computed(() => {
  if (!invalid.value) {
    return `立即支付 ${detail.value.amount} 元`
  }
  const { remainSec = 0, payStatus } = detail.value || {}
  if (payStatus !== 0) {
    return '已支付'
  }
  if (remainSec <= 0) {
    return '订单超时'
  }
  return '未知状态'
})

onLoad(async (options: any) => {
  if (!options.id) {
    return uni.showToast({ title: '缺少参数', icon: 'none' })
  }
  paymentId.value = options.id
  const accountInfo = getApp().globalData!.accountInfo || {}
  if (!accountInfo.openId) {
    const res = await getAccountInfo()
    getApp().globalData!.accountInfo = res.data
  }
  getDetail()
})

async function getDetail() {
  const res = await uni.$http.get(`/v1/be-proxy/v2/payments/gift-detail?id=${paymentId.value}`)
  detail.value = res.data || {}
}

async function paymentVIP() {
  if (invalid.value) {
    return
  }
  const params = {
    payThrough: 30,
    id: paymentId.value,
  }
  payment.value.paymentVIP(params, '/v2/payments/ask-gift')
}

function paymentSuccess() {
  getDetail()
}

function jumpVip() {
  return uni.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent(`${feConfig.mobileUrl}/pages/intro/index`)}` })
}
</script>

<style lang="scss" scoped>
.pay {
  min-height: 100vh;
  padding: 24rpx 28rpx;
  background: #f6f6f6;
  &-info {
    background: #ffffff;
    border-radius: 24rpx;
    display: flex;
    flex-direction: column;
    margin-bottom: 24rpx;
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
          padding-top: 42rpx;
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
  &-list {
    background: #ffffff;
    border-radius: 24rpx;
    &__item {
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 28rpx;
      .label {
        color: #939393;
        font-size: 26rpx;
      }
      .text {
        color: #666666;
        font-size: 28rpx;
      }
      &.active {
        height: 96rpx;
        border-top: 1rpx solid #e6e6e6;
        .label {
          color: #333333;
          font-size: 30rpx;
        }
        .text {
          color: #ff0000;
          font-size: 44rpx;
        }
      }
    }
  }
  &-footer {
    position: fixed;
    left: 0;
    bottom: 0;
    padding: 20rpx 28rpx;
    padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
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
}
</style>
