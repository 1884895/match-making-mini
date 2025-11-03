<template>
  <view v-if="!hideMember" class="user">
    <view class="user-content">
      <view class="sum">
        您已累计消费 <text class="sum-consume">{{ addup }}</text> 元，享 <text class="sum-reduce">限时立减 {{ upGood.minus }} 元</text>
      </view>
      <view class="price">
        <view class="price-real">
          仅 <text class="price-real__count">{{ upGood.cost }}</text> <text class="price-real__unit">元</text>
          <view class="price-real__origin">原价：{{ upGood.original }} 元</view>
        </view>
      </view>
      <view class="btns" @click="jumpVip">
        <view class="btns-item">立即开通</view>
        <image class="btns-tag" :src="`${resourceUrl}old_discount_tag.png`" mode="widthFix" />
      </view>
    </view>
    <image class="user-bg" :src="`${resourceUrl}old_bg.png`" mode="widthFix" />
    <view class="user-good">
      <image class="user-good__icon" :src="`${resourceUrl}old_vip_icon.png`" mode="widthFix" />
      <view class="user-good__name">开通{{ upGood.name }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { isHFSApp, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

const props = withDefaults(defineProps<{
  action?: string
  upgradeInfo: any
}>(), {
  action: '',
  upgradeInfo: () => ({}),
})
const upGood = computed(() => props.upgradeInfo.upGood || {})
const addup = computed(() => props.upgradeInfo.addup || 0)
const hideMember = computed(() => {
  const userInfo = uni.getStorageSync('userInfo') || getApp().globalData?.userInfo || {}
  return userInfo.hideMember || false
})

const resourceUrl = 'https://fe-resource.haofenshu.com/exam/images/'

function jumpVip() {
  if (props.action)
    report('small_big', props.action)
  // #ifdef MP-WEIXIN
  uni.navigateTo({ url: '/pages/me/member' })
  // #endif
  // #ifdef H5
  if (isHFSApp())
    return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, data: {} }))
  uni.navigateTo({ url: '/uni_modules/hfs-fe-uni-module/memberPages/member/member' })
  // #endif
}
</script>

<style lang="scss" scoped>
.user {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  z-index: 9999;
  &-content {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    padding-top: 52rpx;
    z-index: 1;
    .sum {
      font-size: 26rpx;
      color: #b98038;
      padding-left: 28rpx;
      margin-bottom: 36rpx;
      line-height: 40rpx;
      &-consume {
        color: #ff0000;
      }
      &-reduce {
        font-size: 28rpx;
        font-weight: bold;
        color: #ff0000;
      }
    }
    .price {
      display: flex;
      justify-content: center;
      &-real {
        font-size: 28rpx;
        font-weight: bold;
        color: #70450f;
        position: relative;
        &__count {
          font-size: 52rpx;
          font-weight: bold;
          color: #ff0000;
        }
        &__unit {
          font-size: 36rpx;
          font-weight: bold;
          color: #ff0000;
        }
        &__origin {
          position: absolute;
          top: 32rpx;
          left: calc(100% + 20rpx);
          font-size: 22rpx;
          color: #939393;
          white-space: nowrap;
          font-weight: 400;
        }
      }
    }
    .btns {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: calc(100% - 84rpx);
      height: 72rpx;
      background: linear-gradient(225deg, #ffa430 0%, #ff7426);
      border-radius: 36rpx;
      position: absolute;
      left: 50%;
      bottom: calc(env(safe-area-inset-bottom) + 16rpx);
      transform: translateX(-50%);
      &-item {
        font-size: 32rpx;
        font-weight: bold;
        color: #ffffff;
      }
      &-tag {
        width: 126rpx;
        height: 48rpx;
        position: absolute;
        top: -22rpx;
        right: -22rpx;
      }
    }
  }
  &-bg {
    width: 100%;
    height: 308rpx;
  }
  &-good {
    display: flex;
    align-items: center;
    position: absolute;
    top: 116rpx;
    left: 12rpx;
    z-index: 2;
    padding: 4rpx 18rpx 6rpx 14rpx;
    background-color: #fff1b8;
    border-radius: 24rpx 0 0 0;
    &__icon {
      width: 28rpx;
      height: 28rpx;
      margin-right: 8rpx;
    }
    &__name {
      font-size: 28rpx;
      font-weight: bold;
      color: #70450f;
    }
  }
}
</style>
