<template>
  <view class="activity">
    <image v-if="isHFSAppStudent" class="activity-bg" :src="`${resourceUrl}header_bg_student.png`" mode="widthFix" />
    <image v-else class="activity-bg" :src="`${resourceUrl}header_bg.png`" mode="widthFix" />
    <view class="activity-rules flex-row-center" @click="jumpRules">
      活动规则
    </view>
    <view class="activity-content flex-col-center">
      <template v-if="leadData.text">
        <view class="activity-content__text">
          {{ leadData.text }}
        </view>
        <image class="activity-content__down" :src="`${resourceUrl}down.png`" mode="widthFix" />
      </template>
      <view class="activity-content__role">
        <image v-if="showGif" class="img gif" :src="`${resourceUrl + leadData.roleGif}?timestamp=${Math.random()}`" mode="heightFix" />
        <image v-else class="img" :src="resourceUrl + leadData.role" mode="heightFix" />
      </view>
      <image class="activity-content__rules" :src="`${resourceUrl}rules.png`" mode="widthFix" @click="showRules" />
      <view class="activity-content__message">
        <image class="bg" :src="`${resourceUrl}activity_bg.png`" mode="widthFix" />
        <view class="detail">
          <view class="detail-num flex-row-start">
            <image class="detail-num__icon" :src="`${resourceUrl}person.png`" mode="widthFix" />
            <view class="detail-num__text">
              已邀<text class="count">
                {{ inviterInfo.invited || 0 }}
              </text>人
            </view>
          </view>
        </view>
        <view class="progress">
          <view class="progress-bar" :style="{ width: `${progress}%` }" />
          <view class="progress-list">
            <view v-for="(item, index) in progressList" :key="index" class="progress-list__item">
              <view class="point">
                <image class="point-icon" :src="resourceUrl + (progress >= (index + 1) * 20 ? 'point_select.png' : 'point_default.png')" mode="widthFix" />
                <view class="point-text">
                  {{ item }}
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="btns flex-row-center">
          <view class="btns-item flex-row-center btns-exchange" @click="selectAward">
            兑换奖励
          </view>
          <view class="btns-item flex-row-center btns-award" @click="showAward">
            查看奖品
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { isHFSStudent, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    prefix: {
      type: String,
      default: '',
    },
    leadData: {
      type: Object,
      default: () => ({}),
    },
    inviterInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['showAward', 'selectAward', 'showRules'],
  data() {
    return {
      actionId: '667b7145925980bc5a2c6393',
      resourceUrl: 'https://fe-resource.haofenshu.com/new/',
      showGif: false,
    }
  },
  computed: {
    progress() {
      const { invited = 0 } = this.inviterInfo
      const rate = invited % 5 / 5 * 100
      return rate || 6
    },
    progressList() {
      const { invited = 0 } = this.inviterInfo
      const start = Math.floor(invited / 5) * 5 + 1
      return Array.from({ length: 5 }).fill(0).map((item, index) => `${index + start}人`)
    },
    isHFSAppStudent() {
      // #ifdef H5
      if (isHFSStudent()) {
        return true
      }
      // #endif
      return false
    },
  },
  methods: {
    async showAward() {
      const res = await uni.$http.get(`${this.prefix}/v3/invitation/award`)
      const list = res.data || []
      const discountList = list.filter(item => item.type === 2)
      const ticketList = list.filter(item => item.type === 3)
      this.$emit('showAward', { discountList, ticketList })
      report(this.actionId, 'hdy2_wdjp_click')
    },
    selectAward() {
      this.$emit('selectAward')
      report(this.actionId, 'hdy2_dyjl_click')
    },
    showRules() {
      this.$emit('showRules')
      report(this.actionId, 'hdy2_dhgz_click')
    },
    jumpRules() {
      return uni.navigateTo({ url: '/uni_modules/hfs-fe-uni-module/pages/new/rule' })
    },
  },
}
</script>

<style lang="scss" scoped>
.activity {
  position: relative;
  margin-bottom: 24rpx;
  padding-top: 192rpx;
  &-bg {
    width: 750rpx;
    height: 844rpx;
    position: absolute;
    top: 0;
    left: 0;
  }
  &-rules {
    position: absolute;
    top: 20rpx;
    right: 0;
    width: 96rpx;
    height: 38rpx;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 200rpx 0 0 200rpx;
    font-size: 20rpx;
    font-weight: 500;
    color: #ffffff;
  }
  &-content {
    width: fit-content;
    position: relative;
    margin: 0 12rpx;
    &__text {
      background: #fffeef;
      border: 4rpx solid #6e5536;
      border-radius: 32rpx;
      box-shadow: 0 -8rpx 0 0 #fffccb inset;
      padding: 16rpx 30rpx;
      font-size: 26rpx;
      font-weight: 500;
      color: #6e5536;
    }
    &__down {
      width: 26rpx;
      height: 12rpx;
    }
    &__role {
      height: 256rpx;
      .img {
        width: 314rpx;
        height: 256rpx;
      }
      .gif {
        width: 400rpx;
        height: 256rpx;
      }
    }
    &__rules {
      width: 198rpx;
      height: 54rpx;
      position: absolute;
      top: 270rpx;
      right: 10rpx;
      z-index: 1;
    }
    &__message {
      width: 726rpx;
      height: 338rpx;
      position: relative;
      margin-top: -32rpx;
      padding: 68rpx 42rpx 26rpx;
      .bg {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }
      .detail {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32rpx;
        &-num {
          &__icon {
            width: 40rpx;
            height: 40rpx;
            margin-right: 14rpx;
          }
          &__text {
            font-size: 36rpx;
            font-weight: 500;
            color: #ae6b1e;
            .count {
              color: #f25a13;
              margin: 0 8rpx;
            }
          }
        }
        &-time {
          font-size: 24rpx;
          color: #ae6b1e;
          .item {
            margin: 0 4rpx;
            padding: 0 6rpx;
            background: #ae6b1e;
            border-radius: 4rpx;
            color: #ffffff;
          }
        }
      }
      .progress {
        position: relative;
        width: calc(100% - 12rpx);
        height: 24rpx;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 18rpx;
        margin-bottom: 90rpx;
        &-bar {
          height: 24rpx;
          transition: width 0.5s ease-in-out;
          background: linear-gradient(270deg, #ff7436, #ffb942);
          border-radius: 18rpx;
        }
        &-list {
          display: flex;
          width: 100%;
          position: absolute;
          top: -10rpx;
          &__item {
            position: relative;
            width: 20%;
            .point {
              position: absolute;
              right: -2rpx;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              &-icon {
                width: 44rpx;
                height: 44rpx;
                margin-bottom: 4rpx;
              }
              &-text {
                font-size: 22rpx;
                color: #ae6b1e;
              }
            }
          }
        }
      }
      .btns {
        position: relative;
        &-item {
          width: 200rpx;
          height: 48rpx;
          margin: 0 8rpx;
        }
        &-exchange {
          background: linear-gradient(180deg, #ff6a34, #ffca45);
          border: 1rpx solid #ffffff;
          border-radius: 38rpx;
          box-shadow:
            0 4rpx 8rpx 0 rgba(0, 0, 0, 0.06),
            0 2rpx 6rpx 0 rgba(255, 255, 255, 0.5) inset;
          font-size: 26rpx;
          font-weight: 500;
          color: #ffffff;
        }
        &-award {
          border: 2rpx solid #ff7736;
          border-radius: 38rpx;
          font-size: 26rpx;
          color: #ff7736;
        }
      }
    }
  }
}
</style>
