<template>
  <view class="empty" :style="{ padding, backgroundColor, borderRadius }">
    <image class="img" src="../examPages/static/academicReport/empty.png" mode="widthFix" />
  </view>
</template>

<script>
export default {
  props: {
    padding: {
      type: String,
      default: '150rpx 0 300rpx 0',
    },
    backgroundColor: {
      type: String,
      default: '#fff',
    },
    borderRadius: {
      type: String,
      default: '0',
    },
  },
}
</script>

<style lang="scss" scoped>
.empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .img {
    width: 474rpx;
    height: 328rpx;
  }
}
</style>
