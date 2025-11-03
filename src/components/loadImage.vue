<template>
  <view class="load-image" :class="{ error }" :style="{ maxHeight }">
    <u-image v-if="src" :src="src" mode="widthFix" width="100%" height="100%" :lazy-load="true" :fade="false" :show-menu-by-longpress="false" @click="click" @load="load" @error="handleError" />
    <view v-else class="none" @click="click">
      {{ noneText }}
    </view>
  </view>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      default: '',
    },
    maxHeight: {
      type: String,
      default: '',
    },
    noneText: {
      type: String,
      default: '等待学校上传试卷原卷',
    },
  },
  options: {
    styleIsolation: 'shared',
  },
  emits: ['click', 'load', 'error'],
  data() {
    return {
      error: false,
    }
  },
  methods: {
    click() {
      this.$emit('click')
    },
    load() {
      this.$emit('load')
    },
    handleError() {
      this.error = true
      this.$emit('error')
    },
  },
}
</script>

<style lang="scss" scoped>
.load-image {
  overflow: hidden;
  ::v-deep .u-image__loading,
  ::v-deep .u-image__error {
    max-height: 224rpx !important;
    min-height: 190rpx !important;
  }
  .none {
    width: 100%;
    height: 190rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 28rpx;
    color: #939393;
    background: #c7c7c7;
  }
  &.error {
    ::v-deep .u-image {
      min-height: 190rpx !important;
    }
  }
}
</style>
