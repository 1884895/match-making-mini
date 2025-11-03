<template>
  <view class="footer" :class="{ active: isMore && !expand }">
    <image v-if="!isMore" class="footer-pic" :src="`${resourceUrl}operation_footer_1.png`" mode="widthFix" />
    <image class="footer-pic" :src="`${resourceUrl}operation_footer_2.png`" mode="widthFix" />
    <view v-if="isMore && !expand" class="footer-mask" @click="expand = !expand">
      <view class="footer-mask__text">
        点击展开查看
      </view>
      <u-icon name="arrow-down" color="#939393" size="30rpx" bold />
    </view>
  </view>
</template>

<script>
export default {
  props: {
    pageType: {
      type: String,
      default: '',
    },
    inviterInfo: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/introduction/',
      expand: false,
    }
  },
  computed: {
    isMore() {
      return ['invite'].includes(this.pageType)
    },
  },
}
</script>

<style lang="scss" scoped>
.footer {
  position: relative;
  width: 100%;
  &.active {
    height: 480rpx !important;
    overflow: hidden;
    margin-bottom: 24rpx;
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 40rpx;
      background: #a1da48;
    }
  }
  &-pic {
    width: 100%;
  }
  &-mask {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 708rpx;
    height: 286rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0), #ffffff 36%);
    margin: 0 20rpx 0 22rpx;
    padding-bottom: 30rpx;
    border-radius: 0 0 40rpx 40rpx;
    z-index: 1;
    &__text {
      font-size: 24rpx;
      color: #939393;
    }
  }
}
</style>
