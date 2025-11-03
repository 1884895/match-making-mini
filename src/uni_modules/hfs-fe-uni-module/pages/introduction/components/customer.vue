<template>
  <view class="customer" :class="{ active: share }" @click="openCustomerServiceChat">
    <image class="customer-icon" :src="`${resourceUrl}customer.png`" mode="widthFix" />
  </view>
</template>

<script>
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    pageType: {
      type: String,
      default: '',
    },
    share: {
      type: Boolean,
      default: false,
    },
    paymentInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['report'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/introduction/',
      actionMap: {
        operation: 'operation_customer_click',
        invite: 'invite_customer_click',
        share: 'share_continue_click',
      },
    }
  },
  methods: {
    openCustomerServiceChat() {
      this.$emit('report', this.actionMap[this.pageType])
      // #ifdef MP-WEIXIN
      const options = this.paymentInfo.isMember ? feConfig.vipCustomer : feConfig.customer
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
