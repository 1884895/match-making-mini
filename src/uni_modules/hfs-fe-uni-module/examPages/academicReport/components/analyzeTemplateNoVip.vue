<template>
  <view class="template">
    <image class="template-icon" :src="`${resourceUrl}template_icon.png`" />
    <view class="template-content">
      <image class="template-content__title" :src="`${resourceUrl}template_title.png`" />
      <slot />
    </view>
  </view>
</template>

<script>
export default {
  props: {
    content: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
    }
  },
}
</script>

<style lang="scss" scoped>
.template {
  position: relative;
  background-color: #f6f6f6;
  border-radius: 10rpx;
  border-top-right-radius: 100rpx;
  padding: 24rpx 28rpx;
  min-height: 106rpx;
  &-icon {
    width: 74rpx;
    height: 106rpx;
    position: absolute;
    top: 0;
    right: 0;
  }
  &-content {
    font-size: 24rpx;
    color: #939393;
    &__title {
      width: 84rpx;
      height: 28rpx;
      margin-bottom: 16rpx;
    }
  }
}
</style>
