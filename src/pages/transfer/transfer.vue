<template>
  <view class="transfer">
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" :overlay-style="popup.overlayStyle" :safe-area-inset-bottom="false" bg-color="transparent">
      <image class="transfer-top" :src="`${resourceUrl}final_top_bg.png`" mode="widthFix" />
      <image class="transfer-bottom" :src="`${resourceUrl}final_bottom_bg.png`" mode="widthFix" />
      <image class="transfer-pic" :src="`${resourceUrl}final_card.png`" mode="widthFix" />
      <view class="share">
        <view class="share-item">
          <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" />
          <image class="share-item__icon" :src="`${resourceUrl}share_weixin.png`" />
          <view class="share-item__text">
            分享至微信
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { getAccountInfo } from '../../utils/login'

export default {
  data() {
    return {
      resourceUrl: `${feConfig.resourceUrl}/images/`,
      options: {},
      popup: {
        show: false,
        mode: 'bottom',
        overlay: true,
        overlayStyle: {
          background: 'transparent',
        },
      },
      shareMessage: {},
      back: false,
    }
  },
  onLoad(options) {
    this.options = options
    options.pageType === 'share' && this.handleShare()
    options.pageType === 'member' && this.handlePay()
    options.pageType === 'login' && this.handleLogin()
  },
  onShow() {
    this.back && uni.navigateBack()
  },
  onShareAppMessage() {
    this.back = true
    const { title, path, imageUrl } = this.shareMessage
    return { title, path, imageUrl }
  },
  methods: {
    handleShare() {
      this.popup.show = true
      this.shareMessage = JSON.parse(decodeURIComponent(this.options.shareMessage))
    },
    async handlePay() {
      // 获取账号信息
      const accountInfo = getApp().globalData.accountInfo || {}
      if (!accountInfo.openId) {
        const res = await getAccountInfo()
        getApp().globalData.accountInfo = res.data
      }
      const url = decodeURIComponent(this.options.memberUrl)
      uni.redirectTo({ url })
    },
    handleLogin() {
      const redirectUrl = decodeURIComponent(this.options.redirectUrl)
      getApp().globalData.redirect_uri = redirectUrl
      uni.redirectTo({ url: '/pages/login/login' })
    },
  },
}
</script>

<style lang="scss" scoped>
.transfer {
  position: relative;
  height: 100vh;
  background: #e4e0ff;
  &-top {
    width: 100%;
    height: 590rpx;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
  }
  &-bottom {
    width: 100%;
    height: 590rpx;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 10;
  }
  &-pic {
    position: fixed;
    top: 100rpx;
    left: 0;
    width: 750rpx;
    height: 976rpx;
    z-index: 20;
  }
  .share {
    width: 750rpx;
    background: #e6e6e6;
    border-radius: 32rpx 32rpx 0 0;
    display: flex;
    justify-content: space-evenly;
    padding: 34rpx 0 32rpx;
    padding: 34rpx 0 calc(env(safe-area-inset-bottom) + 32rpx);
    z-index: 9999;
    &-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      &__icon {
        width: 72rpx;
        height: 72rpx;
        margin-bottom: 10rpx;
      }
      &__text {
        font-size: 24rpx;
        color: #333333;
      }
    }
  }
}
</style>
