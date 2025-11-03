<template>
  <view class="vip">
    <view class="vip-title">
      <view class="vip-title__text">
        好分数会员尊享
      </view>
      <view class="vip-title__link" @click="jumpVip">
        点击查看更多会员专享<u-icon name="arrow-right" size="24rpx" color="#939393" :custom-style="{ marginLeft: '4rpx' }" />
      </view>
    </view>
    <view class="vip-pic">
      <image class="vip-pic__img" :src="`${resourceUrl}comparison.png`" mode="widthFix" />
    </view>
  </view>
</template>

<script>
import { isHFSApp, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/member/',
    }
  },
  methods: {
    jumpVip() {
      let url = '/pages/mine/comparison'
      // #ifdef MP-WEIXIN
      url = `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}`)}`
      // #endif
      // #ifdef H5
      if (isHFSApp()) {
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${window.location.origin}${url}` }))
      }
      // #endif
      return uni.navigateTo({ url })
    },
  },
}
</script>

<style lang="scss" scoped>
.vip {
  width: 100%;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx 0;
  &-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
    padding: 0 28rpx;
    &__text {
      color: #333333;
      font-size: 32rpx;
      font-weight: bold;
    }
    &__link {
      font-size: 24rpx;
      color: #939393;
      display: flex;
      align-items: center;
    }
  }
  &-pic {
    padding: 0 39rpx;
    &__img {
      width: 100%;
    }
  }
}
</style>
