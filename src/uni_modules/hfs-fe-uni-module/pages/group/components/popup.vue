<template>
  <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" :overlay-style="popup.overlayStyle" bg-color="transparent">
    <view class="popup">
      <view class="popup-content">
        <view class="popup-content__title">
          {{ title[pageType] }}
        </view>
        <view class="popup-content__info">
          <view class="title">
            {{ subTitle[pageType].replace('x', targetGood.count || 0) }}
          </view>
          <view v-if="pageType !== '3' && groupInfo.nextLevel" class="list">
            <view v-for="(item, index) in groupInfo.nextLevel" :key="index" class="list-item">
              还差{{ item.need }}人即可组成{{ item.count }}人团，可{{ item.amount }}元购买会员
            </view>
          </view>
          <view v-if="pageType === '3'" class="list">
            <view class="list-item">
              以拼团价{{ groupInfo.realAmount }}元购得好分数360会员！
            </view>
            <view v-if="groupInfo.refundAmount > 0" class="list-item">
              升团奖励{{ groupInfo.refundAmount }}元将在24小时内返回您的账户
            </view>
          </view>
          <view v-if="pageType === '1'" class="tips">
            快去邀请好友参团吧
          </view>
          <view v-if="pageType === '3'" class="tips active">
            <view>分享活动给更多的人</view>
            <view>让大家也尽享超值优惠吧！</view>
          </view>
        </view>
        <view v-if="pageType !== '3' && groupInfo.remainTime" class="popup-content__end">
          <text>拼团剩余时间</text>
          <u-count-down :time="(groupInfo.remainTime || 0) * 1000" format="HH:mm:ss" auto-start @change="countChange" @finish="countFinish">
            <view class="count">
              <view class="count-item">
                {{ formatNumber((timeData.hours + timeData.days * 24) || 0) }}
              </view>
              <view class="count-item">
                {{ formatNumber(timeData.minutes || 0) }}
              </view>
              <view class="count-item">
                {{ formatNumber(timeData.seconds || 0) }}
              </view>
            </view>
          </u-count-down>
        </view>
        <view class="popup-content__share">
          <view class="title">
            {{ shareTitle[pageType] }}
          </view>
          <view class="list">
            <view class="list-item">
              <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="shareWeixin" />
              <image class="list-item__icon" :src="`${resourceUrl}weixin.png`" />
              <text>分享至微信</text>
            </view>
            <view class="list-item">
              <u-button :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="shareDingDing" />
              <image class="list-item__icon" :src="`${resourceUrl}dingding.png`" />
              <text>分享至钉钉</text>
            </view>
          </view>
        </view>
        <view class="popup-content__button" @click="close">
          查看活动
        </view>
        <view v-if="pageType === '3'" class="popup-content__date">
          活动日期：{{ $u.timeFormat(groupInfo.startTime, 'yyyy年mm月dd日') }} - {{ $u.timeFormat(groupInfo.endTime, 'mm月dd日') }}
        </view>
      </view>
      <view class="popup-close" @click="close">
        <u-icon name="close" color="#333333" size="36rpx" bold />
      </view>
      <image class="popup-bg" :src="`${resourceUrl}popup.png`" mode="widthFix" />
    </view>
  </u-popup>
</template>

<script>
import { formatNumber } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    pageType: {
      type: String,
      default: '',
    },
    groupInfo: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['countFinish', 'shareWeixin', 'report', 'shareDingDing'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/group/',
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        overlayStyle: {
          background: 'rgba(0, 0, 0, 0.7)',
        },
      },
      timeData: {},
      title: {
        1: '下单成功',
        2: '继续加油',
        3: '好消息分享',
      },
      subTitle: {
        1: '恭喜您！下单成功！',
        2: '恭喜您！离拼团成功又近了一步！',
        3: '恭喜您！成功组成x人团！',
      },
      shareTitle: {
        1: '邀约好友',
        2: '继续邀约好友省更多！',
        3: '邀约好友',
      },
      ownerAction: {
        1: 'owner_pay_success_pop_click',
        2: 'owner_continue_invite_pop_click',
        3: 'continue_share_pop_click',
      },
      joinerAction: {
        1: 'joiner_pay_success_pop_click',
        2: 'joiner_continue_invite_btn_click',
        3: 'continue_share_pop_click',
      },
    }
  },
  computed: {
    targetGood() {
      return this.groupInfo.targetGood || {}
    },
    action() {
      return this.groupInfo.isOwner ? this.ownerAction : this.joinerAction
    },
  },
  methods: {
    formatNumber,
    countChange(e) {
      this.timeData = e
    },
    countFinish() {
      this.$emit('countFinish')
    },
    open() {
      this.popup.show = true
    },
    close() {
      this.popup.show = false
    },
    shareWeixin() {
      this.$emit('shareWeixin')
      this.$emit('report', this.action[this.pageType])
    },
    shareDingDing() {
      this.$emit('shareDingDing')
      this.$emit('report', this.action[this.pageType])
    },
  },
}
</script>

<style lang="scss" scoped>
.popup {
  position: relative;
  &-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    width: 588rpx;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    padding: 145rpx 44rpx 40rpx;
    &__title {
      font-family: YEFONTAoYeHei;
      font-size: 48rpx;
      color: #333333;
      margin-bottom: 28rpx;
    }
    &__info {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20rpx 0;
      margin-bottom: 22rpx;
      background: #feedc3;
      border: 2rpx solid #ffffff;
      border-radius: 18rpx;
      .title {
        font-size: 28rpx;
        font-weight: bold;
        color: #e85c5c;
        margin-bottom: 15rpx;
      }
      .list {
        margin-bottom: 4rpx;
        &-item {
          font-size: 22rpx;
          color: #e85c5c;
          margin-bottom: 14rpx;
          text-align: center;
        }
      }
      .tips {
        font-size: 24rpx;
        font-weight: bold;
        color: #e85c5c;
        text-align: center;
        &.active {
          font-family: YEFONTAoYeHei;
          font-size: 28rpx;
          font-weight: normal;
        }
      }
    }
    &__end {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26rpx;
      color: #333333;
      margin-bottom: 20rpx;
      .count {
        display: flex;
        align-items: center;
        margin-left: 10rpx;
        .count-item {
          width: 44rpx;
          height: 36rpx;
          position: relative;
          background: #feedc3;
          border-radius: 6rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28rpx;
          font-weight: bold;
          color: #ff3b3b;
          margin-right: 24rpx;
          &::after {
            content: '：';
            position: absolute;
            top: 0;
            right: -34rpx;
          }
          &:last-child {
            margin-right: 0;
            &::after {
              display: none;
            }
          }
        }
      }
    }
    &__share {
      width: 100%;
      margin-bottom: 38rpx;
      .title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333333;
        text-align: center;
        margin-bottom: 30rpx;
      }
      .list {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-around;
        .list-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 28rpx;
          font-weight: bold;
          color: #333333;
          &__icon {
            width: 80rpx;
            height: 80rpx;
            margin-bottom: 12rpx;
          }
        }
      }
    }
    &__button {
      width: 244rpx;
      height: 52rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      font-weight: bold;
      color: #e32d2d;
      margin: 0 auto;
      border: 2rpx solid #e32d2d;
      border-radius: 58rpx;
    }
    &__date {
      font-size: 22rpx;
      color: #e32d2d;
      text-align: center;
      margin-top: 22rpx;
    }
  }
  &-close {
    position: absolute;
    top: 150rpx;
    right: 44rpx;
  }
  &-bg {
    width: 590rpx;
    z-index: -1;
  }
}
</style>
