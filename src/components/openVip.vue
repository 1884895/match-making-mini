<template>
  <view v-if="!isMember">
    <view class="open-vip" @click="clickVip">
      开通会员，尽享所有考试特权
    </view>
  </view>
</template>

<script>
export default {
  props: {
    isMember: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {}
  },
  methods: {
    clickVip() {
      return uni.navigateTo({ url: '/pages/me/member' })
    },
  },
}
</script>

<style lang="scss" scoped>
.open-vip {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100rpx;
  background: #ff4d2b;
  font-size: 34rpx;
  color: #ffffff;
}
</style>
