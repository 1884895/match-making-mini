<template>
  <view class="feedback">
    <view class="feedback-content">
      <view class="feedback-content__label">
        评分
      </view>
      <view class="feedback-content__list">
        <view v-for="(item, index) in scoreList" :key="index" class="item" :class="{ active: item === score }" @click="score = item">
          {{ item }}分
        </view>
      </view>
    </view>
    <view class="feedback-input">
      <u-textarea v-model="content" placeholder="请写下您对考试功能的建议" maxlength="500" border="none" auto-height confirm-type="return" :placeholder-style="{ fontSize: '28rpx', color: '#939393' }" />
    </view>
    <view class="feedback-btn">
      <u-button text="提交" color="#FFBA1D" :custom-style="{ borderRadius: '36rpx', height: '72rpx', fontSize: '28rpx' }" :throttle-time="500" @click="setAdvice" />
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      score: 5,
      scoreList: [1, 2, 3, 4, 5],
      content: '',
    }
  },
  computed: {
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/be-proxy'
      // #endif
      return prefix
    },
  },
  methods: {
    async setAdvice() {
      await uni.$http.post(`${this.prefix}/v2/users/advice`, { score: this.score, comment_content: this.content })
      uni.$u.toast('提交成功')
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.emit('adviceChange', false)
      await uni.$u.sleep(1000)
      uni.navigateBack()
    },
  },
}
</script>

<style lang="scss" scoped>
.feedback {
  min-height: 100vh;
  background: #ffffff;
  padding: 24rpx 28rpx 240rpx;
  &-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
    &__label {
      font-size: 28rpx;
      font-weight: 500;
      color: #282423;
    }
    &__list {
      display: flex;
      align-items: center;
      .item {
        width: 112rpx;
        height: 64rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        color: #333333;
        background: #f6f6f6;
        border-radius: 8rpx;
        margin-left: 15rpx;
        &.active {
          color: #ffffff;
          background: #ffba1d;
        }
      }
    }
  }
  &-input {
    width: 100%;
    background: #f6f6f6;
    border-radius: 24rpx;
    padding: 10rpx;
    ::v-deep .u-textarea {
      min-height: 520rpx;
      margin-bottom: 30rpx;
      background: transparent !important;
      &__field {
        height: auto !important;
      }
    }
    ::v-deep .uni-textarea-wrapper {
      min-height: 100%;
    }
  }
  &-btn {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 180rpx;
    padding: 0 calc((100% - 232rpx) / 2);
    z-index: 100;
    display: flex;
    align-items: center;
    background: #ffffff;
  }
}
</style>
