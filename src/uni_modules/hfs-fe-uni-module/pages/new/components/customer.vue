<template>
  <view class="customer" :class="{ active: share }" @click="openCustomerServiceChat">
    <image class="customer-icon" :src="`${resourceUrl}customer.png`" mode="widthFix" />
  </view>
</template>

<script>
import { nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

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
      actionId: '667b7145925980bc5a2c6393',
      resourceUrl: 'https://fe-resource.haofenshu.com/new/',
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
      report(this.actionId, 'hdy2_lxkf_click')
    },
  },
}
</script>

<style lang="scss" scoped>
.customer {
  position: fixed;
  right: 4rpx;
  bottom: 280rpx;
  z-index: 999;
  &.active {
    bottom: 470rpx;
  }
  &-icon {
    width: 92rpx;
    height: 90rpx;
  }
}
</style>
