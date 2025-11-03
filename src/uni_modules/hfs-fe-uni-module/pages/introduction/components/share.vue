<template>
  <view class="share-popup">
    <image class="share-popup__title" :src="`${resourceUrl}share_title.png`" mode="widthFix" />
    <view class="share-popup__tips">
      温馨提醒：记得让好友通过你的分享链接开通会员，才能成功获取奖励哟！
    </view>
    <view class="share-popup__list column">
      <view class="list-item">
        <u-button :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('sharePoster')" />
        <image class="list-item__icon" :src="`${resourceUrl}share_img.png`" />
        <text>发送邀请海报</text>
      </view>
      <view class="list-item">
        <u-button :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareQr')" />
        <image class="list-item__icon qr" :src="`${resourceUrl}share_qr.png`" />
        <text>面对面邀约</text>
      </view>
    </view>
    <view class="share-popup__list fixed">
      <view class="list-item">
        <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareWeixin')" />
        <image class="list-item__icon" :src="`${resourceUrl}share_weixin.png`" />
        <text>分享至微信</text>
      </view>
      <view class="list-item">
        <u-button :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareDingDing')" />
        <image class="list-item__icon link" :src="`${resourceUrl}share_dingding.png`" />
        <text>复制链接</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    pageType: {
      type: String,
      default: '',
    },
  },
  emits: ['sharePoster', 'shareQr', 'shareWeixin', 'shareDingDing', 'report'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/introduction/',
      actionMap: {
        operation: {
          sharePoster: 'operation_poster_click',
          shareQr: 'operation_qr_click',
          shareWeixin: 'operation_weixin_click',
          shareDingDing: 'operation_copy_click',
        },
        invite: {
          sharePoster: 'invite_poster_click',
          shareQr: 'invite_qr_click',
          shareWeixin: 'invite_weixin_click',
          shareDingDing: 'invite_copy_click',
        },
      },
    }
  },
  methods: {
    share(type) {
      this.$emit(type)
      this.$emit('report', this.actionMap[this.pageType][type])
    },
  },
}
</script>

<style lang="scss" scoped>
.share-popup {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #ebf8bf, #ffffff 42%);
  border: 2rpx solid #ffffff;
  border-radius: 40rpx 40rpx 0 0;
  padding-top: 22rpx;
  z-index: 999;
  &__title {
    width: 310rpx;
    margin-bottom: 18rpx;
  }
  &__tips {
    font-size: 20rpx;
    color: #333333;
    margin-bottom: 20rpx;
  }
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
        width: 100rpx;
        height: 118rpx;
        margin-bottom: 10rpx;
        &.link {
          width: 164rpx;
        }
      }
    }
    &.column {
      .list-item {
        width: 320rpx;
        height: 74rpx;
        flex-direction: row;
        font-size: 28rpx;
        font-weight: 500;
        color: rgba(255, 116, 36, 0.7);
        border: 2rpx solid rgba(255, 116, 36, 0.7);
        border-radius: 40rpx;
        margin-bottom: 8rpx;
        &__icon {
          width: 38rpx;
          height: 32rpx;
          margin-bottom: 0;
          margin-right: 12rpx;
          opacity: 0.7;
          &.qr {
            height: 32rpx;
          }
        }
      }
    }
    &.fixed {
      position: fixed;
      left: 0;
      bottom: 0;
      padding: 10rpx 0;
      padding: 10rpx 0 calc(env(safe-area-inset-bottom) + 10rpx);
      background: #ffffff;
      z-index: 10;
    }
  }
}
</style>
