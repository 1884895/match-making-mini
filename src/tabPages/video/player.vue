<template>
  <view class="player">
    <video v-if="options.src" id="video" class="player-video" :src="options.src" :title="options.title" :enable-play-gesture="true" :show-casting-button="true" :show-mute-btn="true" :show-screen-lock-button="true" :show-snapshot-button="true" :vslide-gesture-in-fullscreen="true" autoplay controls />
    <view class="player-info">
      <view class="player-info__title">
        {{ options.title }}
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      options: {},
    }
  },
  onLoad(options) {
    this.options = options
    options.title && uni.setNavigationBarTitle({ title: options.title })
  },
}
</script>

<style lang="scss" scoped>
.player {
  min-height: 100vh;
  &-video {
    width: 750rpx;
    height: 422rpx;
  }
  &-info {
    padding: 30rpx 30rpx 58rpx;
    &__title {
      font-size: 38rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 35rpx;
    }
  }
}
</style>
