<template>
  <view class="medal">
    <view class="medal-content">
      <!-- #ifdef MP-WEIXIN -->
      <u-navbar title="考试勋章" :auto-back="true" :placeholder="true" :bg-color="bgColor" left-icon-color="#fff" :title-style="{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <u-gap height="30rpx" bg-color="transparent" />
      <!-- #endif -->
      <u-gap height="24rpx" bg-color="transparent" />
      <view class="medal-content__info">
        <view class="title">
          <view class="title-name one-txt-cut">
            <image class="icon" src="../static/academicReport/exam-icon.png" /><view class="one-txt-cut">
              {{ options.name }}
            </view>
          </view>
          <view class="title-time">
            考试时间{{ options.time }}
          </view>
        </view>
        <view class="list">
          <view v-if="options.scoreMedal > 0" class="list-item">
            <view class="list-item__content">
              <image class="icon" :src="scoreBadgeList[options.scoreMedal - 1].icon" />
              <view class="shadow" />
              <image class="text score" src="../static/index/medal_score.png" />
            </view>
            <image class="list-item__bg" src="../static/index/medal_icon_bg.png" mode="widthFix" />
          </view>
          <view v-if="options.progressMedal > 0" class="list-item">
            <view class="list-item__content">
              <image class="icon" :src="progressiveBadge[options.progressMedal - 1].icon" />
              <view class="shadow" />
              <image class="text" src="../static/index/medal_progress.png" />
            </view>
            <image class="list-item__bg" src="../static/index/medal_icon_bg.png" mode="widthFix" />
          </view>
        </view>
      </view>
      <view class="medal-content__list">
        <view class="list-title">
          成绩勋章：有绝对实力才能获得的荣誉
        </view>
        <template v-for="(item, index) in scoreBadgeList">
          <view v-if="item[Number(showDegree)]" :key="index" class="list-item">
            <image class="icon" :src="item.icon" />
            <view>{{ showDegree ? '年级等第' : '年级击败率' }}</view>
            <view class="active">
              {{ item[Number(showDegree)] }}
            </view>
          </view>
        </template>
      </view>
      <view class="medal-content__list">
        <view class="list-title">
          进步勋章：战胜过去的自己也是莫大的荣耀
        </view>
        <view v-for="(item, index) in progressiveBadge" :key="index" class="list-item">
          <image class="icon" :src="item.icon" />
          <view><text>{{ item.text }}</text>{{ showDegree ? index === progressiveBadge.length - 1 ? '等第下降' : '等第提升' : '内进步' }}</view>
          <view class="active">
            {{ item[Number(showDegree)] }}
          </view>
        </view>
      </view>
      <view class="medal-content__desc">
        好分数会根据考试总分和有没有取得进步来评价你的本次考试，并为你颁发相应的评价勋章
      </view>
    </view>
    <image class="medal-bg" src="../static/index/medal_bg.png" mode="widthFix" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      options: {},
      scoreBadgeList: [
        {
          icon: require('../static/index/medal_a.png'),
          0: '90%-100%',
          1: 'A1-A5',
        },
        {
          icon: require('../static/index/medal_b.png'),
          0: '80%-90%',
          1: 'B1-B5',
        },
        {
          icon: require('../static/index/medal_c.png'),
          0: '65%-80%',
          1: 'C1-C5',
        },
        {
          icon: require('../static/index/medal_d.png'),
          0: '50%-65%',
          1: 'D1-D5',
        },
        {
          icon: require('../static/index/medal_e.png'),
          0: '20%-50%',
          1: 'E',
        },
        {
          icon: require('../static/index/medal_f.png'),
          0: '0%-20%',
          1: '',
        },
      ],
      progressiveBadge: [
        {
          icon: require('../static/index/medal_gold.png'),
          text: '一鸣惊人，班级',
          0: '15名以上',
          1: '8个等第以上',
        },
        {
          icon: require('../static/index/medal_silver.png'),
          text: '刮目相看，班级',
          0: '10-14名',
          1: '5-7个等第',
        },
        {
          icon: require('../static/index/medal_bronze.png'),
          text: '进步可喜，班级',
          0: '5-9名',
          1: '1-4个等第',
        },
        {
          icon: require('../static/index/medal_comeon.png'),
          text: '保持水平，班级',
          0: '负4-4名',
          1: '0个等第',
        },
        {
          icon: require('../static/index/medal_notice.png'),
          text: '引起重视，班级',
          0: '负5名及以上',
          1: '1个等第以上',
        },
      ],
      bgColor: 'transparent',
    }
  },
  computed: {
    showDegree() {
      return +this.options.rankType === 4
    },
  },
  onLoad(options) {
    this.options = options
  },
  onPageScroll({ scrollTop }) {
    this.bgColor = scrollTop > 10 ? '#ffc43f' : 'transparent'
  },
}
</script>

<style lang="scss" scoped>
.medal {
  position: relative;
  min-height: 100vh;
  background: #f6f6f6;
  padding-bottom: 24rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 24rpx);
  &-content {
    width: 100%;
    position: relative;
    z-index: 1;
    &__info {
      height: 304rpx;
      background: #ffffff;
      border-radius: 24rpx;
      margin-bottom: 24rpx;
      padding: 20rpx 28rpx;
      .title {
        color: #939393;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;
        &-name {
          display: flex;
          align-items: center;
          font-size: 24rpx;
          .icon {
            width: 18rpx;
            height: 24rpx;
            margin-right: 10rpx;
          }
        }
        &-time {
          flex-shrink: 0;
          font-size: 22rpx;
          margin-left: 20rpx;
        }
      }
      .list {
        display: flex;
        align-items: center;
        justify-content: space-between;
        &-item {
          position: relative;
          width: 332rpx;
          height: 204rpx;
          &__content {
            width: 100%;
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 10rpx;
            .icon {
              width: 112rpx;
              height: 112rpx;
              margin-bottom: 6rpx;
            }
            .shadow {
              width: 62rpx;
              height: 10rpx;
              background: #ffc15c;
              border-radius: 50%;
              filter: blur(2rpx);
              margin-bottom: 12rpx;
            }
            .text {
              width: 120rpx;
              height: 30rpx;
              &.score {
                height: 32rpx;
              }
            }
          }
          &__bg {
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
          }
        }
      }
    }
    &__list {
      width: 100%;
      background: #ffffff;
      border-radius: 24rpx;
      margin-bottom: 24rpx;
      .list-title {
        position: relative;
        font-size: 30rpx;
        color: #333333;
        height: 88rpx;
        display: flex;
        align-items: center;
        padding-left: 48rpx;
        border-bottom: 1rpx solid #f6f6f6;
        &::before {
          content: '';
          position: absolute;
          left: 28rpx;
          top: 50%;
          transform: translateY(-50%);
          width: 8rpx;
          height: 30rpx;
          background: #ffba1d;
          border-radius: 6rpx;
        }
      }
      .list-item {
        height: 80rpx;
        font-size: 26rpx;
        color: #333333;
        display: flex;
        align-items: center;
        border-bottom: 1rpx solid #f6f6f6;
        padding-left: 28rpx;
        .icon {
          width: 60rpx;
          height: 60rpx;
          margin-right: 16rpx;
        }
        .active {
          color: #ffba1d;
        }
        &:last-child {
          border-bottom: none;
        }
      }
    }
    &__desc {
      color: #939393;
      font-size: 24rpx;
      line-height: 34rpx;
      background: #ffffff;
      border-radius: 24rpx;
      padding: 24rpx 28rpx;
    }
  }
  &-bg {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
