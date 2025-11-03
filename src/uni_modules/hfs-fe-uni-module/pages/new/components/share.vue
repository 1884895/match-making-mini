<template>
  <view class="share-popup">
    <view class="share-popup__list fixed">
      <view class="list-item">
        <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareWeixin')" />
        <image class="list-item__icon" :src="`${resourceUrl}share_weixin.png`" />
        <text>分享至微信</text>
      </view>
      <view class="list-item">
        <u-button :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareCopy')" />
        <image class="list-item__icon link" :src="`${resourceUrl}share_copy.png`" />
        <text>复制链接</text>
      </view>
    </view>
  </view>
</template>

<script>
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    pageType: {
      type: String,
      default: '',
    },
  },
  emits: ['shareWeixin', 'shareCopy'],
  data() {
    return {
      actionId: '667b7145925980bc5a2c6393',
      resourceUrl: 'https://fe-resource.haofenshu.com/new/',
      actionMap: {
        shareWeixin: 'hdy2_wx_click',
        shareCopy: 'hdy2_fzlj_click',
      },
    }
  },
  methods: {
    share(type) {
      this.$emit(type)
      report(this.actionId, this.actionMap[type])
    },
  },
}
</script>

<style lang="scss" scoped>
.share-popup {
  width: 100%;
  border-radius: 32rpx 32rpx 0 0;
  &__list {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    .list-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      color: #333333;
      &__icon {
        width: 72rpx;
        height: 72rpx;
        margin-bottom: 8rpx;
      }
    }
    &.fixed {
      position: fixed;
      left: 0;
      bottom: 0;
      padding: 34rpx 0 32rpx;
      padding: 34rpx 0 calc(env(safe-area-inset-bottom) + 32rpx);
      background: #ffffff;
      z-index: 10;
    }
  }
}
</style>
