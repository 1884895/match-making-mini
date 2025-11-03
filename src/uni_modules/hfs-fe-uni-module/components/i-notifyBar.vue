<template>
  <view v-if="show" class="notify">
    <image class="notify-left" :src="`${resourceUrl}notify.png`" />
    <view class="notify-content">
      <view class="notify-content__message" :class="{ scroll }">
        <view class="title">
          {{ title }}
        </view>
        <view class="sub">
          {{ subTitle }}
        </view>
      </view>
    </view>
    <view class="notify-right">
      <u-icon name="close" size="30rpx" color="#FFB100" @click="handleClose" />
    </view>
  </view>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    subTitle: {
      type: String,
      default: '',
    },
    scroll: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  data() {
    return {
      show: true,
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
    }
  },
  methods: {
    handleClose() {
      this.show = false
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss" scoped>
.notify {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 82rpx;
  background: linear-gradient(180deg, #ffffff, rgba(255, 255, 255, 0.9));
  border-radius: 0 0 16rpx 16rpx;
  padding: 0 12rpx 0 28rpx;
  &-left {
    width: 36rpx;
    height: 36rpx;
    margin-right: 10rpx;
  }
  &-content {
    flex: 1;
    flex-wrap: nowrap;
    overflow: hidden;
    &__message {
      display: flex;
      align-items: center;
      width: fit-content;
      word-break: keep-all;
      white-space: nowrap;
      .title {
        font-size: 24rpx;
        color: #333333;
      }
      .sub {
        font-size: 24rpx;
        color: #939393;
        margin-left: 8rpx;
      }
    }
    .scroll {
      padding-left: 100%;
      animation: moveX 20s linear infinite;
    }
  }
  &-right {
    padding: 16rpx;
  }
}
@keyframes moveX {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
