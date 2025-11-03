<template>
  <view class="vip">
    <image class="vip-title" :src="`${resourceUrl}share_head_subtitle.png`" mode="widthFix" />
    <u-swiper :list="vipList" height="276rpx" previous-margin="142rpx" next-margin="142rpx" circular radius="20rpx" bg-color="#ffffff" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/newPromoter/',
      list: [
        'swiper-1.png',
        'swiper-2.png',
        'swiper-3.png',
        'swiper-4.png',
        'swiper-5.png',
        'swiper-6.png',
        'swiper-7.png',
        'swiper-8.png',
        'swiper-9.png',
        'swiper-10.png',
        'swiper-11.png',
      ],
    }
  },
  computed: {
    vipList() {
      return this.list.map(item => ({ url: this.resourceUrl + item }))
    },
  },
}
</script>

<style lang="scss" scoped>
.vip {
  position: relative;
  width: 642rpx;
  height: 350rpx;
  background: #ffffff;
  border: 3rpx solid #ff8d47;
  border-radius: 26rpx;
  padding: 14rpx 0 16rpx;
  margin: 0 auto 24rpx;
  &-title {
    width: 216rpx;
    height: 28rpx;
    margin: 0 auto 16rpx;
  }
}
</style>
