<template>
  <view class="mouth">
    <view class="mouth-header">
      <view class="mouth-header__content">
        <view class="title">
          口算PK赛
        </view>
        <view class="name">
          当前段位：{{ pkInfo.rank > 0 ? curRankInfo.rankName : '无' }}<image
            v-if="pkInfo.rank > 0"
            class="icon" :src="resourceUrl + curRankInfo.rankNormalIcon"
          />
        </view>
      </view>
      <view class="mouth-header__rank" @click="jumpRank">
        <image class="icon" :src="`${resourceUrl}home_cup.png`" />
        <view class="text">
          PK榜
        </view>
      </view>
      <image class="mouth-header__bg" :src="`${resourceUrl}home_header_dot.png`" />
    </view>
    <view class="mouth-record">
      <view class="mouth-record__num">
        <image class="text-icon" :src="`${resourceUrl}index_record_icon.png`" />
        <view class="text-title">
          战绩：
        </view>
        <view class="text-win">
          {{ record['1'] || 0 }}胜{{ record['3'] || 0 }}败{{ record['2'] || 0 }}平
        </view>
      </view>
      <view class="mouth-record__level" @click.stop="selectLevel">
        <view class="level">
          L{{ curLevel }}：{{ levelMap[curLevel] }}
        </view>
        <u-icon :name="isShowLevelPop ? 'arrow-up-fill' : 'arrow-down-fill'" color="#ffffff" size="18rpx" />
      </view>
      <view v-if="isShowLevelPop" class="mouth-record__select">
        <view v-for="(item, index) in levelList" :key="index" @click="changeLevel(item)">
          <view class="item">
            <view class="item-name">
              {{ item.label }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <scroll-view
      class="mouth-cards" scroll-x="true" :scroll-left="scrollLeftZero" show-scrollbar="false"
      @scroll="scroll"
    >
      <view class="mouth-cards__list">
        <view v-for="(item, index) in themeList" :key="index" class="card">
          <view class="card-name">
            {{ item.name }}
          </view>
          <view class="card-user">
            <view class="card-user__left">
              <view class="user">
                <image class="user-avater" :src="`${resourceUrl}avatar.png`" />
                <view class="user-name">
                  我
                </view>
              </view>
            </view>
            <image class="card-user__center" :src="`${resourceUrl}home_icon_pk.png`" />
            <view class="card-user__right">
              <view class="user">
                <image class="user-avater" :src="`${resourceUrl}avatar.png`" />
                <view class="user-name">
                  对手
                </view>
              </view>
            </view>
          </view>
          <view class="card-type">
            <view class="card-type__unreal" @click="computerMatch(item.code)">
              <view class="text">
                随机匹配
              </view>
            </view>
            <image class="card-type__vs" :src="`${resourceUrl}home_icon_vs.png`" />
            <view class="card-type__real" @click="friendMatch(item.code)">
              <view class="text">
                好友匹配
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    pkInfo: {
      type: Object,
      default: () => ({}),
    },
    levelMap: {
      type: Object,
      default: () => ({}),
    },
    remainChance: {
      type: Number,
      default: 0,
    },
  },
  emits: ['friendMatch'],
  data() {
    return {
      resourceUrl: `${feConfig.resourceUrl}/pk/images/`,
      themeList: [],
      rankInfoList: {},
      isShowLevelPop: false,
      scrollLeftZero: 0, // 滚动距离，用于回到开头
      oldScrollLeft: 0,
      curLevel: 1,
    }
  },
  computed: {
    record() {
      return this.pkInfo.record || []
    },
    curRankInfo() {
      return this.rankInfoList[this.pkInfo.rank] || {}
    },
    levelList() {
      const levels = Object.keys(this.levelMap)
      if (!levels.length)
        return []
      const list = levels.map((key) => {
        return {
          label: `L${key}：${this.levelMap[key]}`,
          value: key,
        }
      })
      return list
    },
  },
  mounted() {
    this.getTheme()
    this.rankInfoList = uni.getStorageSync('rankInfoList') || {}
  },
  methods: {
    selectLevel() {
      this.isShowLevelPop = !this.isShowLevelPop
    },
    changeLevel(item) {
      this.curLevel = this.levelList.indexOf(item) + 1
      this.closeLevelPop()
      this.getTheme()
      this.scrollLeft()
    },
    scroll(e) {
      this.oldScrollLeft = e.detail.scrollLeft
    },
    // 滚回起点
    scrollLeft() {
      this.scrollLeftZero = this.oldScrollLeft
      setTimeout(() => {
        this.scrollLeftZero = 0
      }, 100)
    },
    closeLevelPop() {
      this.isShowLevelPop = false
    },
    async getTheme() {
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/pk/theme${uni.$u.queryParams({ level: this.curLevel })}`, {}, { custom: { loading: false } })
      this.themeList = res.Data || []
    },
    computerMatch(code) {
      report('pk', 'sy_sjpp')
      if (this.remainChance === 0)
        return uni.showToast({ title: '做任务增加挑战次数后才能挑战哦~', icon: 'none' })
      const url = '/uni_modules/hfs-fe-uni-module/pages/pk/pk'
      const params = { code }
      uni.navigateTo({
        url: `${url}${uni.$u.queryParams(params)}`,
        success: (res) => {
          const innerAudioContext = uni.createInnerAudioContext()
          innerAudioContext.play()
          res.eventChannel.emit('pkAudio', { innerAudioContext })
        },
      })
    },
    friendMatch(code) {
      report('pk', 'sy_hypp')
      this.$emit('friendMatch', code)
    },
    jumpRank() {
      uni.navigateTo({ url: '/uni_modules/hfs-fe-uni-module/pages/pk/rank' })
    },
  },
}
</script>

<style lang="scss" scoped>
.mouth {
  width: 100%;
  height: 530rpx;
  background: #d5efff;
  border: 2rpx solid #d5efff;
  border-radius: 32rpx;
  box-shadow: 0rpx 4rpx 8rpx 0rpx rgba(214, 189, 47, 0.2);

  &-header {
    height: 96rpx;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: linear-gradient(275deg, #2aa3ff 3%, #00a9ff 96%);
    border-radius: 32rpx 32rpx 0rpx 0rpx;
    padding: 0 30rpx 0 32rpx;
    position: relative;
    display: flex;

    &__content {
      display: flex;
      align-items: baseline;

      .title {
        font-size: 40rpx;
        font-family: YEFONTAoYeHei;
        z-index: 4;
        text-align: left;
        color: #ffffff;
      }

      .name {
        font-size: 24rpx;
        color: #ffffff;
        margin-left: 8rpx;
        position: relative;

        .icon {
          position: absolute;
          top: 50%;
          right: -40rpx;
          transform: translateY(-47%);
          width: 40rpx;
          height: 40rpx;
        }
      }
    }

    &__bg {
      width: 200rpx;
      z-index: 0;
      position: absolute;
      top: 0;
      left: 0;
      height: 96rpx;
    }

    &__title {
      margin-left: 29rpx;
      font-size: 40rpx;
      z-index: 4;
      text-align: left;
      color: #ffffff;
    }

    &__level {
      align-items: baseline;
      display: flex;
      flex: 1;
      margin-left: 10rpx;

      .name {
        font-size: 24rpx;
        color: #ffffff;
        margin-left: 8rpx;
      }

      .icon {
        width: 40rpx;
        height: 40rpx;
      }
    }

    &__rank {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding-top: 8rpx;

      .icon {
        width: 40rpx;
        height: 40rpx;
      }

      .text {
        font-size: 24rpx;
        font-weight: 500;
        text-align: center;
        color: #ffffff;
      }
    }
  }

  &-record {
    display: flex;
    height: 80rpx;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    position: relative;
    &__num {
      display: flex;
      align-items: center;
      flex: auto;

      .text-icon {
        width: 40rpx;
        height: 44rpx;
      }

      .text-title {
        font-size: 28rpx;
        font-weight: 500;
        margin-left: 9rpx;
        color: #333333;
      }

      .text-win {
        font-size: 28rpx;
        color: #333333;
      }
    }

    &__level {
      display: flex;
      align-items: center;
      height: 48rpx;
      background: #1fa5ff;
      justify-content: center;
      padding: 6rpx 12rpx 6rpx 15rpx;
      border-radius: 12rpx;

      .level {
        font-weight: 500;
        color: #333333;
        height: 36rpx;
        font-size: 26rpx;
        margin-right: 6rpx;
        color: #ffffff;
      }
    }

    &__select {
      position: absolute;
      top: 64rpx;
      right: 30rpx;
      z-index: 5;
      width: 198rpx;
      height: 384rpx;
      background: #ffffff;
      border-radius: 16rpx;

      .item {
        padding: 0 14rpx 0 16rpx;

        &-name {
          width: 168rpx;
          height: 64rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #ffffff;
          box-shadow: 0rpx -1rpx 0rpx 0rpx #e6e6e6 inset;
          font-size: 24rpx;
          color: #333333;
        }
      }
    }
  }

  &-cards {
    width: 694rpx;
    white-space: nowrap;

    &__list {
      display: inline-flex;

      .card {
        width: 502rpx;
        height: 330rpx;
        margin-left: 20rpx;
        margin-right: 20rpx;
        padding: 24rpx 42rpx 30rpx 42rpx;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.5),
          #ffffff 41%
        );
        border: 2rpx solid #ffffff;
        border-radius: 32rpx;
        box-shadow: 0rpx 4rpx 12rpx 0rpx rgba(21, 123, 187, 0.2);

        &:last-child {
          margin-left: 0;
        }

        &-name {
          font-size: 32rpx;
          font-weight: 500;
          text-align: center;
          color: #333333;
          margin-bottom: 30rpx;
        }

        &-user {
          margin-bottom: 24rpx;
          justify-content: center;
          display: flex;

          &__left {
            .user {
              justify-content: center;

              &-avater {
                width: 72rpx;
                height: 72rpx;
                border-radius: 50%;
                border: 2.29rpx solid #416aff;
              }

              &-name {
                font-size: 24rpx;
                text-align: center;
                font-weight: 500;
                color: #416aff;
              }
            }
          }

          &__center {
            width: 70rpx;
            height: 68rpx;
            margin: 0 44rpx;
          }

          &__right {
            .user {
              justify-content: center;

              &-avater {
                width: 72rpx;
                height: 72rpx;
                border-radius: 50%;
                border: 2.29rpx solid #ff4646;
              }

              &-name {
                font-size: 24rpx;
                text-align: center;
                font-weight: 500;
                color: #ff4646;
              }
            }
          }
        }

        &-type {
          display: flex;
          justify-content: center;
          height: 70rpx;

          .text {
            font-size: 28rpx;
            font-weight: 500;
            text-align: center;
            color: #ffffff;
          }

          &__unreal {
            width: 184rpx;
            height: 70rpx;
            display: flex;
            background: linear-gradient(270deg, #ff4e45, #ff8a39);
            border-radius: 38rpx 0 0 38rpx;
            align-items: center;
            justify-content: center;
          }

          &__vs {
            width: 50rpx;
            height: 70rpx;
            margin: 0 -4rpx;
          }

          &__real {
            width: 184rpx;
            background: linear-gradient(90deg, #416eff, #41a3ff);
            border-radius: 0 38rpx 38rpx 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }
}
</style>
