<template>
  <view class="template">
    <view class="template-content">
      <image v-if="showFlower && !guide" class="template-content__title" src="../../static/academicReport/template_title.png" />
      <image v-if="showFlower && guide" class="template-content__title guide" :src="`${resourceUrl}guide.png`" />
      <rich-text v-if="!custom" class="template-content__message" :nodes="content" />
      <slot v-else />
    </view>
    <image class="template-needle" src="../../static/academicReport/template_needle.png" />
    <image v-if="showFlower" class="template-flower" src="../../static/academicReport/template_flower.png" />
  </view>
</template>

<script>
export default {
  props: {
    content: {
      type: String,
      default: '',
    },
    guide: {
      type: Boolean,
      default: false,
    },
    showFlower: {
      type: Boolean,
      default: true,
    },
    custom: {
      type: Boolean,
      default: false,
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
  padding: 24rpx 26rpx 26rpx 26rpx;
  min-height: 100rpx;
  background: linear-gradient(174deg, #ffeccd 11%, #fffbde 58%);
  border-radius: 16rpx;
  &-bg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  &-content {
    position: relative;
    z-index: 3;
    font-size: 28rpx;
    color: #333333;
    line-height: 44rpx;
    &__title {
      width: 70rpx;
      height: 30rpx;
      margin-bottom: 12rpx;
    }
    .guide {
      width: 136rpx;
      height: 29rpx;
    }
    &__message {
      font-size: 28rpx;
      color: #333333;
      line-height: 44rpx;
      text-align: left;
    }
  }
  &-needle {
    width: 48rpx;
    height: 68rpx;
    position: absolute;
    top: -14rpx;
    left: -10rpx;
    z-index: 2;
  }
  &-comma {
    width: 88rpx;
    height: 70rpx;
    position: absolute;
    top: 16rpx;
    right: 14rpx;
    z-index: 2;
  }
  &-flower {
    width: 58rpx;
    height: 64rpx;
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 2;
  }
}
</style>
