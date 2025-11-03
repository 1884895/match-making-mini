<template>
  <view class="progress">
    <view class="progress-content">
      <view class="progress-content__info">
        <view class="speed">
          <view class="speed-bar" :class="{ active: speed >= 3 }" :style="{ width: `calc(${speed * 166}rpx + 40rpx)` }" />
          <view class="speed-list">
            <view v-for="(item, index) in awardConf" :key="index" class="speed-list__item" :style="{ left: `calc(${index * 166}rpx + 40rpx)` }">
              <view v-if="speed < index" class="mask radius" />
              <view class="top">
                <view v-if="speed < index" class="mask" />
                <template v-if="index">
                  <view v-if="index === awardConf.length - 1">
                    邀请第{{ speed > 3 ? askCount : index + 1 }}位
                  </view>
                  <view v-else>
                    邀请第{{ index + 1 }}位
                  </view>
                </template>
                <view v-else>
                  首单邀请
                </view>
                <image v-if="speed < index" class="top-arrow" :src="`${resourceUrl}progress_arrow_mask.png`" />
                <image v-else class="top-arrow" :src="`${resourceUrl}progress_arrow.png`" />
                <view class="top-tag" :class="{ active: speed >= index }">
                  <u-icon :name="speed >= index ? 'checkbox-mark' : 'lock'" color="#fff" size="28rpx" bold />
                </view>
              </view>
              <view v-if="index === awardConf.length - 1" class="invite">
                每邀请1人：
              </view>
              <view class="bottom">
                <view v-if="!inviterInfo.awardType || inviterInfo.awardType === 1">
                  <text class="active">
                    {{ item.coin }}
                  </text>学币{{ !inviterInfo.awardType || inviterInfo.awardType === 2 ? '或' : '' }}
                </view>
                <view v-if="!inviterInfo.awardType || inviterInfo.awardType === 2">
                  <text class="active">
                    {{ item.vip }}
                  </text>天会员
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="progress-content__desc">
        <view class="invite">
          共邀请：<text class="active">
            <text class="num">
              {{ askCount }}
            </text>人
          </text>
        </view>
        <view class="invite">
          <text>预计共获得：</text>
          <text class="active">
            <template v-if="!inviterInfo.awardType || inviterInfo.awardType === 1">
              <text class="num">
                {{ inviterInfo.awardCoin || '' }}
              </text>学币{{ !inviterInfo.awardType || inviterInfo.awardType === 2 ? '/' : '' }}
            </template>
            <template v-if="!inviterInfo.awardType || inviterInfo.awardType === 2">
              <text class="num">
                {{ inviterInfo.awardVip || '' }}
              </text>天会员服务
            </template>
          </text>
        </view>
      </view>
      <view class="progress-content__button" @click="order">
        <view class="btn">
          {{ inviterInfo.awardType > 0 ? '查看奖励' : '预约领取奖励' }}
        </view>
      </view>
    </view>
    <image class="progress-bg" :src="`${resourceUrl}progress_bg.png`" mode="widthFix" />
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
      default: () => ({}),
    },
  },
  emits: ['order', 'report'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/introduction/',
    }
  },
  computed: {
    awardConf() {
      return this.inviterInfo.awardConf || []
    },
    askCount() {
      return this.inviterInfo.askCount || 0
    },
    speed() {
      return this.askCount - 1
    },
  },
  methods: {
    order() {
      this.$emit('order')
      this.$emit('report', 'invite_receive_click')
    },
  },
}
</script>

<style lang="scss" scoped>
.progress {
  position: relative;
  margin: -228rpx 20rpx 24rpx 22rpx;
  &-content {
    height: 600rpx;
    position: relative;
    z-index: 1;
    padding: 126rpx 24rpx 32rpx;
    &__info {
      width: 100%;
      height: 224rpx;
      margin-bottom: 24rpx;
      padding: 88rpx 30rpx 0 24rpx;
      .speed {
        position: relative;
        width: 100%;
        height: 14rpx;
        background: #ffffff;
        border: 2rpx solid #ffa237;
        border-radius: 8rpx;
        &-bar {
          height: 100%;
          background: #ffa237;
          border-radius: 8rpx;
          &.active {
            width: 100% !important;
          }
        }
        &-list {
          &__item {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 26rpx;
            height: 26rpx;
            background: #ffffff;
            border: 8rpx solid #ffa237;
            border-radius: 50%;
            .mask {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              border-radius: 52rpx;
              background: rgba(51, 51, 51, 0.3);
              &.radius {
                width: 26rpx;
                height: 26rpx;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
              }
            }
            .top {
              position: absolute;
              left: 50%;
              bottom: calc(100% + 24rpx);
              transform: translateX(-50%);
              white-space: nowrap;
              font-size: 22rpx;
              font-weight: 500;
              color: #ffffff;
              padding: 6rpx 18rpx;
              border-radius: 52rpx;
              background: linear-gradient(90deg, #ff5a02, #fc7e06);
              &-arrow {
                position: absolute;
                left: 50%;
                top: 99%;
                transform: translateX(-50%);
                width: 18rpx;
                height: 10rpx;
              }
              &-tag {
                position: absolute;
                top: -17rpx;
                right: -17rpx;
                width: 34rpx;
                height: 34rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #ffa20a;
                border-radius: 50%;
                z-index: 1;
                &.active {
                  background: #a1da48;
                }
              }
            }
            .invite,
            .bottom {
              position: absolute;
              left: 50%;
              top: calc(100% + 16rpx);
              transform: translateX(-50%);
              white-space: nowrap;
              font-size: 14rpx;
              color: #333333;
              font-weight: 500;
            }
            .bottom {
              top: calc(100% + 36rpx);
              font-size: 18rpx;
              line-height: 32rpx;
              .active {
                color: #f93a3a;
                font-size: 26rpx;
              }
            }
          }
        }
      }
    }
    &__desc {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 56rpx;
      padding: 0 14rpx;
      .invite {
        font-size: 24rpx;
        color: #333333;
        .active {
          color: #f93a3a;
          font-size: 24rpx;
          .num {
            font-size: 40rpx;
            font-weight: 500;
          }
        }
      }
    }
    &__button {
      position: relative;
      width: 660rpx;
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, #ff512c, #ff6b4c 49%, #ff512c 99%);
      border-radius: 54rpx;
      margin: 0 auto;
      &::after {
        content: '';
        display: flex;
        width: 238rpx;
        height: 36rpx;
        position: absolute;
        left: 50%;
        bottom: 18rpx;
        transform: translateX(-50%);
        background: #ff8425;
        border-radius: 50%;
        filter: blur(20rpx);
      }
      .btn {
        position: relative;
        width: 640rpx;
        height: 72rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36rpx;
        font-weight: 500;
        color: #ffffff;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.3),
          rgba(255, 255, 255, 0) 59%
        );
        border-radius: 44rpx;
        box-shadow:
          2rpx 4rpx 4rpx 0rpx rgba(255, 133, 106, 0.6) inset,
          -2rpx 4rpx 4rpx 0rpx rgba(253, 142, 66, 0.29) inset;
        z-index: 1;
      }
    }
  }
  &-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 708rpx;
  }
}
</style>
