<template>
  <view class="discount">
    <view class="discount-header">
      <view class="discount-header__content">
        <image class="icon" :src="`${resourceUrl}discount_label.png`" mode="widthFix" />
        <view class="info">
          <view class="info-title">{{ title }}</view>
          <view class="info-equity" @click="jumpEquity">尊享<text class="active">32项</text>会员特权<u-icon name="arrow-right" color="#939393" size="24rpx" /></view>
        </view>
      </view>
    </view>
    <view class="discount-content">
      <view class="discount-content__detail">
        <image class="title" :src="`${resourceUrl}discount_title.png`" mode="widthFix" />
        <view class="consume">您已累计消费 {{ addup }} 元</view>
        <view class="reduce">
          <view class="reduce-text">享限时立减 <text class="reduce-text__count">{{ upGood.minus }}</text> 元</view>
          <image class="reduce-line" :src="`${resourceUrl}discount_reduce_line.png`" mode="widthFix" />
        </view>
        <view class="card">
          <view class="card-message">
            <view class="card-message__name">现开通{{ upGood.name }}</view>
            <view class="card-message__price">仅 <text class="active">{{ upGood.cost }}</text> 元</view>
            <view class="card-message__count">立减 <text class="active">{{ upGood.minus }}</text> 元</view>
          </view>
          <image class="card-bg" :src="`${resourceUrl}discount_card_bg.png`" mode="widthFix" />
        </view>
        <view class="btn flex-row-center" @click="openVip">
          <view class="btn-text">{{ upGood.cost }} 元｜立即开通</view>
          <image class="btn-tag" :src="`${resourceUrl}discount_tag.png`" mode="widthFix" />
        </view>
        <view class="agree" @click="jumpPage('agreement')">支付即视为同意<text class="agree-message">《会员协议》</text></view>
      </view>
      <image class="discount-content__vip" :src="`${resourceUrl}discount_icon.png`" mode="widthFix" />
      <image class="discount-content__line" :src="`${resourceUrl}discount_line.png`" mode="widthFix" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { isHFSApp, isHFSStudent, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

const props = withDefaults(defineProps<{
  action?: string
  title: string
  upgradeInfo: any
}>(), {
  action: '',
  title: '开通会员',
  upgradeInfo: () => ({}),
})
const resourceUrl = 'https://fe-resource.haofenshu.com/member/'
const upGood = computed(() => props.upgradeInfo.upGood || {})
const addup = computed(() => props.upgradeInfo.addup || 0)

// 跳转会员权益
function jumpEquity() {
  let url = '/pages/mine/comparison'
  // #ifdef MP-WEIXIN
  url = `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}`)}`
  // #endif
  // #ifdef H5
  if (isHFSApp()) {
    if (isHFSStudent())
      url = '/pages/mine/studentComparison'
    return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${window.location.origin}${url}` }))
  }
  // #endif
  return uni.navigateTo({ url })
}

function openVip() {
  if (props.action)
    report('small_big', props.action)
  jumpPage('vip')
}

function jumpPage(type: string) {
  const jumpMap = {
    vip: { url: '/pages/me/member', target: 8, params: {}, webview: false },
    agreement: { url: '/pages/agreement/index', target: '', params: {}, webview: uni.$u.platform === 'weixin' },
  }
  let { url, target, webview, params } = jumpMap[type as keyof typeof jumpMap]
  // #ifdef MP-WEIXIN
  if (webview)
    url = `/pages/webview/webview?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}`)}`
  // #endif
  // #ifdef H5
  if (isHFSApp()) {
    if (target)
      return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target, data: params }))
  }
  // #endif
  return uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.discount {
  width: 100%;
  overflow: hidden;
  &-header {
    width: 100%;
    height: 180rpx;
    background: #fffde5;
    border: 2rpx solid #ffffff;
    border-radius: 24rpx 24rpx 12rpx 12rpx;
    padding: 0 28rpx;
    &__content {
      height: 126rpx;
      display: flex;
      align-items: center;
      .icon {
        width: 56rpx;
        height: 56rpx;
        margin-right: 22rpx;
      }
      .info {
        &-title {
          font-size: 30rpx;
          font-weight: bold;
          color: #333333;
          margin-bottom: 2rpx;
        }
        &-equity {
          display: flex;
          align-items: center;
          font-size: 26rpx;
          color: #939393;
          .active {
            color: #ff0000;
          }
        }
      }
    }
  }
  &-content {
    background: linear-gradient(142deg, #fff1a3, #fff4c2 100%);
    border: 2rpx solid #ffffff;
    border-radius: 24rpx 0 0 24rpx;
    margin-top: -54rpx;
    position: relative;
    &__detail {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: 0 42rpx 20rpx;
      position: relative;
      z-index: 2;
      .title {
        width: 372rpx;
        height: 60rpx;
        margin-bottom: 20rpx;
      }
      .consume {
        font-size: 28rpx;
        color: #9b4f00;
        margin-bottom: 16rpx;
      }
      .reduce {
        font-size: 44rpx;
        font-weight: bold;
        color: #9b4f00;
        margin-bottom: 34rpx;
        position: relative;
        &-text {
          position: relative;
          z-index: 2;
          &__count {
            font-size: 52rpx;
            color: #ff0000;
          }
        }
        &-line {
          width: 370rpx;
          height: 18rpx;
          position: absolute;
          bottom: 0;
          left: 0;
          z-index: 1;
        }
      }
      .card {
        position: relative;
        margin-bottom: 124rpx;
        &-message {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: absolute;
          padding-top: 48rpx;
          top: 0;
          left: 0;
          z-index: 1;
          &__name {
            font-size: 44rpx;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 10rpx;
          }
          &__price {
            font-size: 40rpx;
            font-weight: bold;
            color: #ffffff;
            .active {
              font-size: 64rpx;
              color: #fffd09;
            }
          }
          &__count {
            position: absolute;
            bottom: 36rpx;
            right: -8rpx;
            transform: rotate(-41deg);
            font-size: 26rpx;
            font-weight: bold;
            color: #6c4600;
            .active {
              color: #ff0000;
            }
          }
        }
        &-bg {
          width: 582rpx;
          height: 320rpx;
        }
      }
      .btn {
        width: 100%;
        height: 84rpx;
        background: linear-gradient(225deg, #ffa430 0%, #ff7426);
        border-radius: 42rpx;
        margin-bottom: 12rpx;
        position: relative;
        &-text {
          font-size: 32rpx;
          font-weight: bold;
          color: #ffffff;
        }
        &-tag {
          width: 158rpx;
          height: 48rpx;
          position: absolute;
          top: -18rpx;
          right: 4rpx;
          z-index: 1;
        }
      }
      .agree {
        font-size: 22rpx;
        color: #333333;
        &-message {
          color: #ff0000;
        }
      }
    }
    &__vip {
      width: 206rpx;
      height: 186rpx;
      position: absolute;
      top: 25rpx;
      right: -20rpx;
      z-index: 1;
    }
    &__line {
      width: 426rpx;
      height: 308rpx;
      position: absolute;
      bottom: 0;
      right: 0;
      z-index: 1;
    }
  }
}
</style>
