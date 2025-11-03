<template>
  <view class="wechat-service">
    <image class="wechat-service__logo" src="../../static/logo.png" />
    <u-button text="联系客服" color="#FF4D2B" :custom-style="{ borderRadius: '35.42rpx', height: '70rpx' }" :throttle-time="500" @click="openCustomerServiceChat" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      options: {},
    }
  },
  computed: {
    isMember() {
      return +this.options.isMember || 0
    },
  },
  onLoad(options) {
    this.options = options
  },
  methods: {
    openCustomerServiceChat() {
      const options = this.isMember ? feConfig.vipCustomer : feConfig.customer
      return wx.openCustomerServiceChat(options)
    },
  },
}
</script>

<style lang="scss" scoped>
.wechat-service {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  padding: 245rpx 110rpx 0;
  &__logo {
    width: 176rpx;
    height: 206rpx;
    margin-bottom: 200rpx;
  }
}
</style>
