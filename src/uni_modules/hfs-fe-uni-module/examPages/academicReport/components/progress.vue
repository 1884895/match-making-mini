<template>
  <view class="progress">
    <view v-if="progressText" class="progress-rate" :style="{ marginLeft: `${current * (100 / 3) + (100 / 3 / 2)}%` }">
      <view class="progress-rate__text">
        {{ progressText }}
      </view>
      <image class="progress-rate__icon" :src="`${resourceUrl}down.png`" />
    </view>
    <view class="progress-content" :class="{ active: !showProgress }">
      <view class="progress-content__bar">
        <view v-for="item in [0, 1, 2]" :key="item" class="line" :style="{ left: `${item * (100 / 3)}%` }" />
        <view v-if="showProgress" class="text" :class="{ active: current === 2 }" :style="{ left: `${current * (100 / 3)}%` }">
          {{ diffcultList[current] }}
        </view>
        <image v-else class="question" :src="`${resourceUrl}icon_exam_harder.png`" mode="heightFix" />
      </view>
    </view>
    <view class="progress-footer" :class="{ active: !showProgress }">
      <view v-for="(item, index) in ['中等偏易', '中等偏难']" :key="index" class="progress-footer__item">
        {{ item }}
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    showProgress: {
      type: Boolean,
      default: true,
    },
    difficultyLevel: {
      type: String,
      default: '',
    },
    // 当前进度上方显示文案
    progressText: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
      diffcultList: ['中等偏易', '中等', '中等偏难'],
    }
  },
  computed: {
    current() {
      const index = this.diffcultList.findIndex(item => item === this.difficultyLevel)
      return Math.max(index, 0)
    },
  },
}
</script>

<style lang="scss" scoped>
.progress {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  &-rate {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    transform: translate(-50%);
    margin-bottom: 6rpx;
    width: fit-content;
    &__text {
      background: rgba(255, 108, 8, 0.1);
      padding: 4rpx 14rpx;
      border-radius: 16rpx;
      font-size: 24rpx;
      font-weight: 500;
      color: #ff6c08;
      white-space: nowrap;
      min-width: 100rpx;
      text-align: center;
    }
    &__icon {
      width: 12rpx;
      height: 6rpx;
    }
  }
  &-content {
    display: flex;
    align-items: center;
    height: 32rpx;
    &.active {
      height: 38rpx;
    }
    &__bar {
      width: 100%;
      height: 12rpx;
      position: relative;
      background: linear-gradient(270deg, #ffc747, #ffeaba 99%);
      border-radius: 10rpx;
      z-index: 1;
      .line {
        width: 2rpx;
        height: 10rpx;
        background-color: #ffffff;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 3;
      }
      .text {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
        font-size: 22rpx;
        color: #ffffff;
        width: calc(100% / 3 + 2rpx);
        height: 32rpx;
        background: #ff6c08;
        border-radius: 6rpx;
        &.active {
          width: calc(100% / 3);
        }
      }
      .question {
        height: 32rpx;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
  &-footer {
    display: flex;
    justify-content: space-between;
    &.active {
      margin-top: -10rpx;
    }
    &__item {
      font-size: 18rpx;
      color: #939393;
    }
  }
}
</style>
