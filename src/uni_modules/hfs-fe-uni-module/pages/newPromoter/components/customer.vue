<template>
  <view class="customer" :class="{ active: share }" @click="openCustomerServiceChat">
    <image class="customer-icon" :src="`${resourceUrl}operation_customer.png`" mode="widthFix" />
  </view>
</template>

<script>
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    share: {
      type: Boolean,
      default: false,
    },
    isMember: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/newPromoter/',
    }
  },
  methods: {
    openCustomerServiceChat() {
      // #ifdef MP-WEIXIN
      const options = this.isMember ? feConfig.vipCustomer : feConfig.customer
      wx.openCustomerServiceChat(options)
      // #endif
      // #ifdef H5
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: '12', data: {} }))
      // #endif
    },
  },
}
</script>

<style lang="scss" scoped>
.customer {
  position: fixed;
  right: 4rpx;
  bottom: calc(182rpx + env(safe-area-inset-bottom));
  z-index: 9999;
  &.active {
    bottom: 470rpx;
  }
  &-icon {
    width: 92rpx;
    height: 90rpx;
  }
}
</style>
