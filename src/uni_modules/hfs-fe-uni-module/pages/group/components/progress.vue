<template>
  <view class="progress">
    <view class="progress-bg">
      <image class="progress-bg__header" :src="`${resourceUrl}header_bg.png`" mode="widthFix" />
      <image class="progress-bg__tag" :style="{ width: tag.width, top: tag.top }" :src="resourceUrl + tag.icon" mode="widthFix" />
    </view>
    <view :style="{ height: pageType === '4' ? '104rpx' : '74rpx' }" />
    <view class="progress-content" :class="{ active: pageType === '3' }">
      <view v-if="pageType !== '3' && groupInfo.remainTime" class="progress-content__end">
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
      <view v-if="pageType !== '3'" class="progress-content__speed" :class="{ active: grade !== '0' }">
        <view class="speed">
          <view class="speed-bar" :style="{ width: `${(currentSpeed + 1) * 100 / goods.length}%` }" />
          <view class="speed-list">
            <view v-for="(item, index) in goods" :key="index" class="speed-list__item" :style="{ left: `calc(${(index + 1) * 100 / goods.length}% - 43rpx)` }">
              <view v-if="currentSpeed < index" class="mask" />
              <view class="text">
                {{ item.name }}
              </view>
              <view class="tag" :class="{ active: currentSpeed >= index }">
                <u-icon :name="currentSpeed >= index ? 'checkmark' : 'lock'" color="#fff" size="20rpx" bold />
              </view>
              <view class="desc">
                <view class="desc-red">
                  <text class="active">
                    {{ item.cost }}
                  </text>元
                </view>
                <view v-if="grade === '0'" class="desc-green">
                  直降{{ item.minus }}元
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-if="pageType === '3'" class="progress-content__start">
        <view class="algin">
          <view>开团时间：{{ $u.timeFormat(groupInfo.ctime || '', 'mm月dd日hh点MM分ss秒') }}</view>
          <view v-if="pageType === '3'" style="margin-top: 16rpx;">
            成团速度：{{ secondsToHMS(groupInfo.takeTime || 0) }}
          </view>
        </view>
      </view>
      <view v-if="pageType === '3'" class="progress-content__list">
        <view v-for="(item, index) in groupInfo.askCount" :key="index" class="list-item">
          <image v-if="index" class="list-item__icon" :src="resourceUrl + avatarList[(index - 1) % avatarList.length]" />
          <image v-else class="list-item__icon" :src="`${resourceUrl}avatar.png`" />
        </view>
      </view>
      <view v-if="pageType === '3'" class="progress-content__tips" @click="tipsClick">
        <view class="text">
          <text class="content">
            查看邀请记录
          </text>
          <u-icon name="arrow-right" color="#939393" size="24rpx" />
        </view>
      </view>
      <view class="progress-content__next" :class="{ active: pageType === '4' }">
        <text v-if="pageType === '3'">
          恭喜！拼成{{ targetGood.count || 0 }}人团！
        </text>
        <template v-else>
          <text v-if="markNum">
            再邀{{ targetGroup.need }}人，{{ targetGroup.amount }}元得会员！
          </text>
        </template>
      </view>
      <view v-if="pageType === '4'" class="progress-content__payment">
        <view v-if="studyCoinFloat" class="payment-checked" @click="studyCoinClick">
          <view class="payment-checked__icon">
            <view v-if="useStudyCoin" class="bar" />
          </view>
          <view class="payment-checked__text">
            是否用学币抵扣？（您当前剩余学币{{ studyCoinFloat }}个）
          </view>
        </view>
        <view class="payment-button" @click="paymentVIP">
          <view class="tips">
            {{ isMax ? '立即开团' : '去参团，直享优惠' }}
          </view>
          <view v-if="isMax" class="price">
            <text class="app">
              该团已满，可点击开新团
            </text>
          </view>
          <view v-else class="price">
            ¥<text class="active">
              {{ targetPrice }}
            </text>
          </view>
          <view v-if="useStudyCoin" class="text">
            （学币抵扣{{ targetGoodCoin }}元）
          </view>
          <image class="mask" :src="`${resourceUrl}button_mask.png`" />
        </view>
      </view>
      <view v-else class="progress-content__button payment-button" :class="{ active: pageType === '3' }">
        <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="shareWeixin" />
        <text>{{ shareTitle[pageType] }}</text>
        <image class="mask" :src="`${resourceUrl}button_mask.png`" />
      </view>
      <view v-if="pageType === '1' || pageType === '2'" class="progress-content__level" @click="tipsClick">
        <image class="avatar" :src="`${resourceUrl}avatar.png`" />
        <view class="text">
          <text>{{ groupInfo.askCount }}人已下单</text>
          <text v-if="markNum">
            ，距离{{ targetGroup.count }}人团还差{{ markNum }}人
          </text>
        </view>
      </view>
      <view v-if="pageType === '4'" class="progress-content__desc">
        <view class="title">
          特别说明：
        </view>
        <view class="text">
          1. 用户若有学币，下单可抵扣
        </view>
        <view class="text">
          2. 72h拼团计时结束，按达成人数核算成团价，差额72h后原路返回
        </view>
      </view>
    </view>
    <u-popup :show="popup.show" :mode="popup.mode" :overlay-style="popup.overlayStyle" bg-color="transparent">
      <view class="progress-record">
        <view class="progress-record__title">
          团员列表
        </view>
        <view class="progress-record__desc">
          共{{ groupInfo.askCount }}人
        </view>
        <scroll-view scroll-y="true" style="max-height: 60vh;">
          <ITable v-if="tableData.length" class="progress-record__table" :columns="columns" :data="tableData" />
        </scroll-view>
        <view class="progress-record__button" @click="popup.show = false">
          <view class="btn">
            关闭
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import iTable from '../../../components/i-table.vue'
import { formatNumber } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { ITable: iTable },
  props: {
    pageType: {
      type: String,
      default: '',
    },
    groupInfo: {
      type: Object,
      default: () => {},
    },
    paymentInfo: {
      type: Object,
      default: () => {},
    },
    grade: {
      type: String,
      default: '0',
    },
  },
  emits: ['countFinish', 'shareWeixin', 'report'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/group/',
      timeData: {},
      avatarList: ['avatar_1.png', 'avatar_2.png', 'avatar_3.png', 'avatar_4.png', 'avatar_5.png'],
      popup: {
        show: false,
        mode: 'center',
        overlayStyle: {
          background: 'rgba(0, 0, 0, 0.7)',
        },
      },
      columns: [
        { name: '用户姓名', key: 'name' },
        { name: '下单时间', key: 'time' },
        { name: '开通状态', key: 'status' },
      ],
      useStudyCoin: false,
      tags: {
        2: {
          icon: 'progress.png',
          width: '320rpx',
          top: '18rpx',
        },
        3: {
          icon: 'progress_success.png',
          width: '222rpx',
          top: '18rpx',
        },
        4: {
          icon: 'heartbeat.png',
          width: '408rpx',
          top: '24rpx',
        },
      },
      shareTitle: {
        1: '去邀约，省更多',
        2: '去邀约，省更多',
        3: '分享活动给更多好友',
      },
      ownerAction: {
        1: 'owner_page2_invite_btn_click',
        2: 'owner_page2_invite_btn_click',
        3: 'page3_share_btn_click',
      },
      joinerAction: {
        1: 'joiner_page2_invite_btn_click',
        2: 'joiner_page2_invite_btn_click',
        3: 'page3_share_btn_click',
      },
    }
  },
  computed: {
    tag() {
      return this.tags[this.pageType]
    },
    targetGroup() {
      const { nextLevel = [] } = this.groupInfo
      return nextLevel[0] || {}
    },
    markNum() {
      const { askCount = 0 } = this.groupInfo
      return Math.max(0, this.targetGroup.count - askCount)
    },
    tableData() {
      const { members = [] } = this.groupInfo
      return members.map((v) => {
        const { name, time, status } = v
        const statusMap = {
          1: '已开通',
          2: '已退费',
        }
        return {
          name,
          time: uni.$u.timeFormat(time, 'yyyy年mm月dd日hh点MM分ss秒'),
          status: statusMap[status],
        }
      })
    },
    goods() {
      const goods = JSON.parse(JSON.stringify(this.groupInfo.goods || []))
      return (goods).slice(1)
    },
    currentSpeed() {
      const { askCount = 0 } = this.groupInfo
      return this.findLastIndex(this.goods, v => askCount >= v.count)
    },
    studyCoinFloat() {
      return this.paymentInfo.studyCoinFloat || 0
    },
    targetGood() {
      return this.groupInfo.targetGood || {}
    },
    targetGoodCoin() {
      return Math.min(this.targetGood.cost, this.studyCoinFloat)
    },
    targetPrice() {
      const { cost } = this.targetGood
      return this.useStudyCoin ? cost - this.targetGoodCoin : cost
    },
    action() {
      return this.groupInfo.isOwner ? this.ownerAction : this.joinerAction
    },
    isMax() {
      const { askCount = 0, maxMember = 0 } = this.groupInfo
      return this.pageType === '4' && askCount > maxMember
    },
  },
  mounted() {
    uni.$on('paymentUseStudyCoin', (useStudyCoin) => {
      this.useStudyCoin = useStudyCoin
    })
  },
  unmounted() {
    uni.$off('paymentUseStudyCoin')
  },
  methods: {
    formatNumber,
    findLastIndex(array, callback) {
      for (let i = array.length - 1; i >= 0; i--) {
        if (callback(array[i]))
          return i
      }
      return -1
    },
    secondsToHMS(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const remainingSeconds = Math.round(seconds % 60)
      return `${this.formatNumber(hours)}小时${this.formatNumber(minutes)}分${this.formatNumber(remainingSeconds)}秒`
    },
    countChange(e) {
      this.timeData = e
    },
    countFinish() {
      this.$emit('countFinish')
    },
    tipsClick() {
      if (this.pageType === '4')
        return
      this.popup.show = true
    },
    studyCoinClick() {
      this.useStudyCoin = !this.useStudyCoin
      uni.$emit('progressUseStudyCoin', this.useStudyCoin)
    },
    paymentVIP() {
      if (this.isMax) {
        this.$emit('report', 'share_page_new_btn_click')
        return uni.navigateTo({ url: '/uni_modules/hfs-fe-uni-module/pages/group/open' })
      };
      uni.$emit('progressPayment')
    },
    shareWeixin() {
      this.$emit('shareWeixin')
      this.$emit('report', this.action[this.pageType])
    },
  },
}
</script>

<style lang="scss" scoped>
.progress {
  position: relative;
  margin: -40rpx 28rpx 12rpx;
  &-bg {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    &__header {
      width: 100%;
    }
    &__tag {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  &-content {
    position: relative;
    z-index: 1;
    width: 100%;
    background: #fff;
    border-radius: 24rpx;
    &.active {
      padding-bottom: 28rpx;
    }
    &__start {
      font-size: 28rpx;
      color: #939393;
      padding: 26rpx 0 22rpx 36rpx;
      .algin {
        text-align: left;
      }
    }
    &__list {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      padding: 0 32rpx 0 16rpx;
      margin-bottom: 10rpx;
      .list-item {
        width: 86rpx;
        height: 86rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #feedc3;
        border: 2rpx solid #fead2c;
        border-radius: 50%;
        margin: 0 0 20rpx 16rpx;
        &__icon {
          width: 100%;
          height: 100%;
        }
      }
    }
    &__tips {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30rpx;
      .text {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        font-weight: 500;
        color: #939393;
        .content {
          margin-right: 10rpx;
        }
      }
    }
    &__end {
      width: 100%;
      height: 68rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26rpx;
      color: #333333;
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
    &__speed {
      width: calc(100% - 52rpx);
      height: 214rpx;
      background: #f2f2f2;
      border-radius: 24rpx;
      margin: 0 auto 24rpx;
      padding: 66rpx 28rpx 0 12rpx;
      &.active {
        height: 188rpx;
      }
      .speed {
        position: relative;
        width: 100%;
        height: 22rpx;
        background: #ffffff;
        border: 2.1rpx solid #ff8730;
        border-radius: 28rpx;
        &-bar {
          height: 100%;
          background: #ff8730;
          border-radius: 28rpx;
        }
        &-list {
          &__item {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 86rpx;
            height: 40rpx;
            background: #ffd3b3;
            border: 2.1rpx solid #ff8935;
            border-radius: 22.1rpx;
            .text {
              font-family: YEFONTAoYeHei;
              font-size: 22rpx;
              color: #ff8935;
              &::first-letter {
                font-size: 30rpx;
              }
            }
            .tag {
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
            .desc {
              width: 100%;
              position: absolute;
              top: calc(100% + 8rpx);
              left: 50%;
              transform: translateX(-50%);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              white-space: nowrap;
              &-red {
                font-size: 25.2rpx;
                color: #e74c44;
                display: flex;
                align-items: baseline;
                .active {
                  font-size: 38rpx;
                }
              }
              &-green {
                font-size: 22rpx;
                color: #098209;
                font-weight: 500;
              }
            }
            .mask {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.3);
              border: 2.1rpx solid rgba(0, 0, 0, 0.3);
              border-radius: 22.1rpx;
            }
            &:last-child {
              left: calc(100% - 86rpx) !important;
            }
          }
        }
      }
    }
    &__next {
      width: 100%;
      font-family: YEFONTAoYeHei;
      font-size: 30rpx;
      color: #e14e3f;
      text-align: center;
      margin-bottom: 6rpx;
      &.active {
        margin-bottom: 28rpx;
      }
    }
    &__payment {
      padding: 0 28rpx;
      .payment-checked {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 36rpx;
        &__icon {
          width: 28rpx;
          height: 28rpx;
          border-radius: 50%;
          border: 2rpx solid #939393;
          position: relative;
          .bar {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 14rpx;
            height: 14rpx;
            background: #939393;
            border-radius: 50%;
          }
        }
        &__text {
          font-size: 24rpx;
          color: #939393;
          margin-left: 12rpx;
        }
      }
    }
    &__button {
      width: 448rpx !important;
      &.active {
        background: linear-gradient(225deg, #e7a744, #ffc557) !important;
        border: 2rpx solid #ffd295 !important;
        box-shadow:
          4rpx 4rpx 16rpx 0rpx rgba(255, 255, 255, 0.5) inset,
          -4rpx -4rpx 16rpx 0rpx rgba(226, 132, 26, 0.63) inset !important;
      }
    }
    .payment-button {
      position: relative;
      width: 100%;
      height: 92rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20rpx;
      font-size: 36rpx;
      font-weight: 500;
      color: #ffffff;
      background: linear-gradient(225deg, #e74c44, #ff8e50);
      border: 2rpx solid #ffd2cf;
      border-radius: 48rpx;
      box-shadow:
        4rpx 4rpx 16rpx 0rpx rgba(255, 255, 255, 0.5) inset,
        -4rpx -4rpx 16rpx 0rpx #cc472b inset;
      .tips {
        position: absolute;
        top: -22rpx;
        right: 30rpx;
        font-size: 20rpx;
        color: #fff;
        padding: 4rpx 18rpx;
        border-radius: 200rpx 200rpx 200rpx 0rpx;
        background: linear-gradient(225deg, #f4ae4b, #feab41);
      }
      .price {
        font-size: 16rpx;
        font-weight: bold;
        .active {
          font-size: 36rpx;
        }
        .app {
          font-size: 28rpx;
        }
      }
      .text {
        font-size: 20rpx;
        margin-top: -6rpx;
      }
      .mask {
        width: 70rpx;
        height: 92rpx;
        position: absolute;
        top: 0;
        right: 40rpx;
      }
    }
    &__level {
      width: 100%;
      height: 84rpx;
      display: flex;
      align-items: center;
      padding-left: 28rpx;
      border-top: 1rpx solid #e6e6e6;
      .avatar {
        width: 36rpx;
        height: 36rpx;
        border-radius: 50%;
        margin-right: 12rpx;
      }
      .text {
        font-size: 28rpx;
        color: #333333;
      }
    }
    &__desc {
      padding: 10rpx 28rpx 28rpx;
      .title {
        font-size: 24rpx;
        font-weight: 500;
        color: #333333;
        line-height: 34rpx;
      }
      .text {
        font-size: 18rpx;
        color: #939393;
      }
    }
  }
  &-record {
    width: 650rpx;
    background: #ffffff;
    border-radius: 16.67rpx;
    padding: 36rpx 30rpx 42rpx;
    &__title {
      font-size: 34rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 30rpx;
      text-align: center;
    }
    &__desc {
      font-size: 32rpx;
      color: #333333;
      margin-bottom: 30rpx;
    }
    &__button {
      padding: 30rpx 30rpx 0;
      .btn {
        height: 72rpx;
        background: linear-gradient(180deg, #fda828 0%, #fd6222 100%);
        border-radius: 50rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 30rpx;
        font-weight: bold;
      }
    }
  }
}
</style>
