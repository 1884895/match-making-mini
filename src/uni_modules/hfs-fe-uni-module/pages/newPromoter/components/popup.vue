<template>
  <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" :overlay-style="popup.overlayStyle" bg-color="transparent">
    <!-- 查看奖励 -->
    <view v-if="popup.type === 'award'" class="popup-award" :class="{ empty: !popup.awardList.length }">
      <image class="popup-award__title" :src="`${resourceUrl}award_title.png`" mode="widthFix" />
      <scroll-view scroll-y="true" :style="{ maxHeight: '360rpx' }">
        <view v-if="popup.awardList.length" class="popup-award__member">
          <view v-for="(item, index) in popup.awardList" :key="index" class="member-item">
            <view class="member-item__day">
              <view class="value">{{ item.count }}<text class="unit">天</text></view>
            </view>
            <view class="member-item__line" />
            <view class="member-item__detail">
              <view class="name">{{ item.name }}</view>
              <view class="origin">原价：¥{{ item.price }}</view>
            </view>
            <view class="member-item__tag">已发放</view>
            <image class="member-item__icon" :src="`${resourceUrl}award_ticket_icon.png`" mode="widthFix" />
          </view>
        </view>
        <view v-else class="popup-award__empty">你还未获得过奖励哦</view>
      </scroll-view>
      <view class="popup-award__btns">
        <image class="btn" :src="`${resourceUrl}award_btn.png`" mode="widthFix" @click="close" />
      </view>
      <view class="popup-award__close" @click="close">
        <u-icon name="close" color="#333333" size="36rpx" bold />
      </view>
    </view>
    <!-- 一键报名-分享给好友 -->
    <view v-if="popup.type === 'share'" class="popup-share">
      <view class="popup-share__footer fixed">
        <view class="title">{{ popup.title }}</view>
        <view class="list">
          <view class="list-item">
            <button v-if="popup.btnType === 'remind'" class="share" open-type="share" data-name="remind" @click="share('shareRemind')" />
            <u-button v-else open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareWeixin')" />
            <image class="list-item__icon" :src="`${resourceUrl}share_weixin.png`" />
            <text>微信好友</text>
          </view>
          <view class="list-item">
            <button v-if="popup.btnType === 'remind'" class="share" @click="share('showRemindCopy')" />
            <u-button v-else :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareCopy')" />
            <image class="list-item__icon link" :src="`${resourceUrl}share_copy.png`" />
            <text>复制链接</text>
          </view>
        </view>
        <view class="close" @click="close">
          <u-icon name="close" color="#333333" size="36rpx" bold />
        </view>
      </view>
    </view>
    <!-- 分享成功，继续邀约 -->
    <view v-if="popup.type === 'invite'" class="popup-invite">
      <image class="popup-invite__hand" :src="`${resourceUrl}share_hand.png`" mode="widthFix" />
      <image class="popup-invite__title" :src="`${resourceUrl}share_popup_title.png`" mode="widthFix" />
      <view class="popup-invite__detail" :class="{ bottom: achievedFreeVip }">
        <view class="record">
          <view class="count" :class="{ small: showAward || showContinueAward }">恭喜您成功邀请<text class="active">{{ inviterInfo.invited }}</text>人</view>
          <view v-if="showAward" class="award" :class="{ small: showContinueAward }">已获得{{ formateTime(sumCount) }}<text class="active">免费会员</text></view>
        </view>
        <view v-if="showContinueAward" class="continue">您已<text class="active">{{ inviterInfo.reachStandDay }}天</text>连续达标，额外获赠<text class="active">{{ getMonth(inviterInfo.reachStandVipDay) }}</text>会员</view>
        <image class="bg" :src="`${resourceUrl}share_bg_icon.png`" mode="widthFix" />
      </view>
      <view v-if="!achievedFreeVip" class="popup-invite__message">
        <view class="text">继续加油</view>
        <view class="text">向<text class="active">0元</text>拿年度会员冲刺吧</view>
      </view>
      <view class="popup-invite__btns">
        <image class="btns-item" :src="`${resourceUrl}share_btn.png`" mode="widthFix" />
        <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="handleContinue" />
      </view>
      <view class="popup-invite__close" @click="close">
        <u-icon name="close" color="#333333" size="36rpx" bold />
      </view>
    </view>
  </u-popup>
</template>

<script>
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    inviterInfo: {
      type: Object,
      default: () => ({}),
    },
    awardList: {
      type: Array,
      default: () => [],
    },
    isMember: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['shareRemind', 'shareWeixin', 'shareCopy', 'showRemindCopy'],
  options: {
    styleIsolation: 'shared',
  },
  data() {
    return {
      actionId: 'newPromoter',
      resourceUrl: 'https://fe-resource.haofenshu.com/newPromoter/',
      popup: {
        type: 'invite',
        show: false,
        mode: 'center',
        overlay: true,
        overlayStyle: {
          background: 'rgba(0, 0, 0, 0.7)',
        },
        title: '',
        awardList: [],
      },
    }
  },
  computed: {
    sumCount() {
      return this.awardList.reduce((total, item) => total + item.count, 0)
    },
    achievedFreeVip() {
      return this.sumCount >= 360
    },
    showAward() {
      return !!this.awardList.length
    },
    showContinueAward() {
      return this.inviterInfo.reachStandVipDay > 0
    },
  },
  methods: {
    open(type, params = {}) {
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    close() {
      this.popup.show = false
    },
    share(type) {
      this.$emit(type)
    },
    formateTime(day) {
      return day === 7 ? '1周' : `${Math.floor(day / 30)}个月+${day % 30 / 7}周`
    },
    handleContinue() {
      report(this.actionId, 'hdy2_jxyy')
      this.$emit('shareWeixin')
    },
    getMonth(day) {
      const dayMap = {
        7: '1周',
        30: '1个月',
        60: '2个月',
        120: '4个月',
      }
      return dayMap[day] || `${day}天`
    },
  },
}
</script>

<style lang="scss" scoped>
.popup {
  &-award {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    padding: 40rpx 46rpx 0;
    width: 530rpx;
    height: 602rpx;
    background: linear-gradient(180deg, #c4e9ff, #ffffff 10%);
    border: 2rpx solid #ffffff;
    border-radius: 64rpx;
    overflow: hidden;
    &.empty {
      height: 412rpx;
    }
    &__title {
      width: 216rpx;
      height: 38rpx;
      margin-bottom: 40rpx;
    }
    &__member {
      display: flex;
      flex-direction: column;
      align-items: center;
      .member-item {
        display: flex;
        align-items: center;
        width: 100%;
        height: 126rpx;
        background: linear-gradient(150deg, #ffefc3, #fff6de 100%);
        border: 2rpx solid #ffc55f;
        border-radius: 22rpx;
        margin-bottom: 24rpx;
        position: relative;
        overflow: hidden;
        &__day {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 128rpx;
          height: 100%;
          font-size: 52rpx;
          font-weight: 500;
          color: #ff0000;
          flex-shrink: 1;
          .value {
            display: flex;
            align-items: baseline;
            .unit {
              font-size: 24rpx;
              color: #333333;
              align-self: baseline;
            }
          }
        }
        &__line {
          width: 0;
          height: 92rpx;
          border-right: 1rpx dashed #ffc55f;
          margin-right: 26rpx;
        }
        &__detail {
          .name {
            font-size: 30rpx;
            font-weight: 500;
            color: #333333;
            margin-bottom: 2rpx;
          }
          .origin {
            font-size: 22rpx;
            color: #666666;
          }
        }
        &__tag {
          position: absolute;
          top: 0;
          right: 0;
          padding: 2rpx 16rpx 4rpx;
          font-size: 24rpx;
          font-weight: 500;
          color: #ffffff;
          border-bottom-left-radius: 12rpx;
          background: #ff8f25;
        }
        &__icon {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 88rpx;
          height: 82rpx;
        }
      }
    }
    &__empty {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 440rpx;
      height: 128rpx;
      background: #e7f3ff;
      border-radius: 22rpx;
      font-size: 28rpx;
      color: #000000;
    }
    &__btns {
      display: flex;
      justify-content: center;
      width: 100%;
      height: 136rpx;
      background: #ffffff;
      position: absolute;
      bottom: 0;
      left: 0;
      .btn {
        margin-top: 22rpx;
        width: 274rpx;
        height: 76rpx;
      }
    }
    &__close {
      position: absolute;
      top: 28rpx;
      right: 38rpx;
    }
  }
  &-share {
    &__footer {
      width: 100%;
      border-radius: 32rpx 32rpx 0 0;
      .title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333333;
        margin-bottom: 32rpx;
        text-align: center;
      }
      .list {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        .list-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 24rpx;
          color: #333333;
          &__icon {
            width: 72rpx;
            height: 72rpx;
            margin-bottom: 8rpx;
          }
          .share {
            width: 100%;
            height: 100%;
            background: transparent;
            border: none;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 10;
          }
          ::v-deep uni-button:after {
            border: none;
          }
          ::v-deep .u-button--active::before {
            opacity: 0;
          }
        }
      }
      &.fixed {
        position: fixed;
        left: 0;
        bottom: 0;
        padding: 26rpx 0 30rpx;
        padding: 26rpx 0 calc(env(safe-area-inset-bottom) + 30rpx);
        background: #ffffff;
        z-index: 10;
      }
      .close {
        position: absolute;
        top: 28rpx;
        right: 38rpx;
      }
    }
  }
  &-invite {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    width: 530rpx;
    background: linear-gradient(180deg, #c4e9ff, #ffffff 10%);
    border: 2rpx solid #ffffff;
    border-radius: 64rpx;
    padding: 44rpx 38rpx 12rpx;
    &__hand {
      position: absolute;
      top: -188rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 444rpx;
      height: 364rpx;
    }
    &__title {
      width: 196rpx;
      height: 50rpx;
      margin-bottom: 38rpx;
    }
    &__detail {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;
      position: relative;
      background: #b9ff45;
      border-radius: 22rpx;
      padding: 22rpx 10rpx 16rpx;
      margin-bottom: 26rpx;
      overflow: hidden;
      min-height: 128rpx;
      &.bottom {
        margin-bottom: 40rpx;
      }
      .record {
        position: relative;
        z-index: 2;
        .count {
          font-size: 32rpx;
          color: #000000;
          text-align: center;
          .active {
            color: #ff0000;
          }
          &.small {
            font-size: 26rpx;
          }
        }
        .award {
          font-size: 36rpx;
          font-weight: bold;
          color: #000000;
          text-align: center;
          white-space: nowrap;
          .active {
            color: #ff0000;
            white-space: nowrap;
          }
          &.small {
            font-size: 30rpx;
          }
        }
      }
      .continue {
        font-size: 22rpx;
        color: #333333;
        text-align: center;
        margin-top: 12rpx;
        position: relative;
        z-index: 2;
        .active {
          color: #ff0000;
        }
      }
      .bg {
        width: 114rpx;
        height: 114rpx;
        position: absolute;
        bottom: -12rpx;
        right: -6rpx;
      }
    }
    &__message {
      margin-bottom: 26rpx;
      .text {
        text-align: center;
        font-size: 26rpx;
        color: #333333;
        .active {
          color: #ff0000;
        }
      }
    }
    &__btns {
      width: 454rpx;
      height: 96rpx;
      position: relative;
      .btns-item {
        width: 100%;
        height: 100%;
      }
      ::v-deep .u-button--active::before {
        opacity: 0;
      }
    }
    &__close {
      position: absolute;
      top: 28rpx;
      right: 38rpx;
    }
  }
}
</style>
