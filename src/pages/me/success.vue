<template>
  <view class="success">
    <view class="success-info">
      <image class="img" src="../../static/me/ok.png" />
      <view>恭喜您，支付成功！</view>
    </view>
    <view class="button">
      <u-button text="回到首页" :custom-style="{ borderRadius: '40rpx', height: '80rpx' }" :throttle-time="500" @click="goHome" />
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    goHome() {
      return uni.reLaunch({
        url: '/pages/index/index',
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.success {
  padding: 30rpx;
  min-height: 100vh;
  &-info {
    color: #ffffff;
    height: 400rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #66c26d;
    border-radius: 10rpx;
    .img {
      width: 90rpx;
      height: 86rpx;
      margin-bottom: 30rpx;
    }
  }
  .button {
    width: 100%;
    position: fixed;
    bottom: 500rpx;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 30rpx;
  }
}
</style>
