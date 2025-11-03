<template>
  <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" :overlay-style="popup.overlayStyle" bg-color="transparent">
    <view v-if="popup.type === 'qr'" class="popup-qr">
      <view class="popup-qr__info">
        <l-painter css="width: 346rpx; height: 346rpx">
          <l-painter-qrcode :text="popup.qrUrl" css="width: 346rpx; height: 346rpx" />
        </l-painter>
      </view>
      <view class="popup-qr__tips">
        让好友扫一扫二维码，邀请TA开通
      </view>
      <view class="popup-qr__close" @click="close">
        <u-icon name="close" color="#333333" size="36rpx" bold />
      </view>
    </view>
    <view v-if="popup.type === 'toast'" class="popup-toast">
      <view class="popup-toast__title">
        <u-icon :name="popup.icon" :color="popup.iconColor" size="36rpx" bold />
        <text class="text">
          {{ popup.title }}
        </text>
      </view>
      <view class="popup-toast__desc">
        {{ popup.desc }}
      </view>
      <view class="popup-toast__button" @click="close">
        知道了
      </view>
    </view>
    <view v-if="popup.type === 'invite'" class="popup-invite">
      <view class="popup-invite__content">
        <view class="info">
          <view class="info-title">
            恭喜您！离0元续会员更近了一步！
          </view>
          <view v-if="popup.tips" class="info-desc">
            还差1人即可再获得{{ popup.tips }}
          </view>
        </view>
        <view class="desc">
          继续邀约好友省更多！
        </view>
        <view class="list">
          <view class="list-item">
            <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="shareWeixin" />
            <image class="list-item__icon" :src="`${resourceUrl}share_weixin.png`" />
            <text>分享至微信</text>
          </view>
          <view class="list-item">
            <u-button :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="shareDingDing" />
            <image class="list-item__icon link" :src="`${resourceUrl}share_dingding.png`" />
            <text>复制链接</text>
          </view>
        </view>
        <view class="btn" @click="inviteClick">
          查看活动
        </view>
      </view>
      <view class="popup-invite__close" @click="inviteClick">
        <u-icon name="close" color="#333333" size="36rpx" bold />
      </view>
      <image class="popup-invite__bg" :src="`${resourceUrl}popup_invite.png`" mode="widthFix" />
    </view>
    <view v-if="popup.type === 'coupon'" class="popup-coupon" @click="getCoupon">
      <view class="popup-coupon__content">
        <view class="list">
          <view v-for="(item, index) in popup.couponConf || []" :key="index" class="list-item" :class="{ active: index === 0 }">
            <view class="list-item__left">
              <text class="unit">
                ¥
              </text><text class="active">
                {{ item.couponValue }}
              </text>
            </view>
            <view class="list-item__right">
              <view class="title">
                会员抵扣券
              </view>
              <view v-if="item.validHour >= 24" class="time">
                有效期：{{ item.validHour / 24 }}天
              </view>
              <view v-else class="time">
                有效期：{{ item.validHour }}小时
              </view>
            </view>
          </view>
          <image class="list-hand" :src="`${resourceUrl}hand.gif`" mode="widthFix" />
        </view>
      </view>
      <image class="popup-coupon__bg" :src="`${resourceUrl}popup_coupon.png`" mode="widthFix" />
    </view>
    <view v-if="popup.type === 'operation'" class="popup-operation">
      <image class="popup-operation__bg" :src="`${resourceUrl}popup_operation.png`" mode="widthFix" @click="jumpOperation" />
    </view>
    <view v-if="popup.type === 'reservation'" class="popup-reservation">
      <view class="popup-reservation__content">
        <view class="title">
          {{ popup.title }}
        </view>
        <scroll-view class="scroll" scroll-y="true">
          <ITable class="table" :columns="popup.columns" :data="popup.tableData" />
        </scroll-view>
        <image v-if="popup.awardType > 0" class="select selected" :src="`${resourceUrl}popup_selected.png`" />
        <image v-else class="select" :src="`${resourceUrl}popup_select.png`" />
        <view v-if="popup.awardType > 0" class="award">
          <image class="award-icon" :src="resourceUrl + currentAward.icon" :style="currentAward.style" />
          <view class="award-text">
            {{ currentAward.text }}
          </view>
        </view>
        <view v-else class="list">
          <view class="list-item" :class="{ active: selected === 1 }" @click="changeSelected(1)">
            <image class="list-item__icon" :src="`${resourceUrl}popup_coin.png`" />
            <view class="list-item__text">
              选学币
            </view>
          </view>
          <view class="list-item" :class="{ active: selected === 2 }" @click="changeSelected(2)">
            <image class="list-item__icon vip" :src="`${resourceUrl}popup_vip.png`" />
            <view class="list-item__text">
              选会员天数
            </view>
          </view>
        </view>
        <view class="tips">
          <view>注意：</view>
          <view>1. 默认奖励方式为“学币”，你可在奖励生效前更改一次，后续奖励方式将保持一致</view>
          <view>2. 好友开通会员30天不退费奖励即生效</view>
        </view>
        <view v-if="!popup.awardType" class="btn" @click="submit">
          提交
        </view>
      </view>
      <view class="popup-reservation__close" @click="noSubmit">
        <u-icon name="close" color="#333333" size="36rpx" bold />
      </view>
      <image class="popup-reservation__bg" :src="`${resourceUrl}popup_reservation.png`" mode="widthFix" />
    </view>
  </u-popup>
</template>

<script>
import iTable from '../../../components/i-table.vue'

export default {
  components: { ITable: iTable },
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
  emits: ['coupon', 'report', 'shareWeixin', 'shareDingDing', 'submit'],
  options: {
    styleIsolation: 'shared',
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/introduction/',
      popup: {
        type: '',
        show: false,
        mode: 'center',
        overlay: true,
        overlayStyle: {
          background: 'rgba(0, 0, 0, 0.7)',
        },
        columns: [],
        tableData: [],
      },
      selected: 0,
      awardMap: {
        1: {
          icon: 'popup_coin.png',
          style: 'width: 38rpx; height: 38rpx;',
          text: '学币',
        },
        2: {
          icon: 'popup_vip.png',
          style: 'width: 44rpx; height: 38rpx;',
          text: '会员天数',
        },
      },
    }
  },
  computed: {
    currentAward() {
      return this.awardMap[this.popup.awardType] || {}
    },
  },
  methods: {
    open(type, params = {}) {
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    close() {
      this.popup.show = false
    },
    getCoupon() {
      this.$emit('coupon', this.popup.couponConf)
      this.$emit('report', 'share_coupon_click')
    },
    shareWeixin() {
      this.$emit('shareWeixin')
      this.$emit('report', 'invite_weixin_click')
    },
    shareDingDing() {
      this.$emit('shareDingDing')
      this.$emit('report', 'invite_copy_click')
    },
    changeSelected(index) {
      this.selected = index
    },
    inviteClick() {
      this.$emit('report', 'invite_continue_click')
      this.close()
    },
    submit() {
      if (!this.selected)
        return uni.$u.toast('请选择奖励方式')
      this.$emit('submit', this.selected)
      this.close()
    },
    noSubmit() {
      if (this.popup.awardType > 0)
        return this.close()
      return this.open('toast', {
        icon: 'error-circle-fill',
        iconColor: '#FFB42C',
        title: '当前奖励默认为学币',
        desc: '奖励生效前可更改一次奖励方式',
      })
    },
    jumpOperation() {
      this.$emit('report', 'share_continue_click')
      return uni.redirectTo({ url: '/uni_modules/hfs-fe-uni-module/pages/introduction/operation' })
    },
  },
}
</script>

<style lang="scss" scoped>
.popup {
  &-qr {
    position: relative;
    width: 514rpx;
    height: 530rpx;
    background: #ffffff;
    border-radius: 48rpx;
    padding: 80rpx 0 36rpx;
    &__info {
      width: 346rpx;
      height: 346rpx;
      margin: 0 auto 34rpx;
    }
    &__tips {
      font-size: 24rpx;
      font-weight: 500;
      color: #333333;
      text-align: center;
    }
    &__close {
      position: absolute;
      top: 30rpx;
      right: 30rpx;
    }
  }
  &-toast {
    width: 588rpx;
    height: 350rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #eaffeb, #ffffff 34%);
    border-radius: 46rpx;
    &__title {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 34rpx;
      .text {
        margin-left: 14rpx;
      }
    }
    &__desc {
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 66rpx;
    }
    &__button {
      width: 260rpx;
      height: 76rpx;
      font-size: 28rpx;
      font-weight: 500;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffb42c;
      border-radius: 38rpx;
    }
  }
  &-invite {
    position: relative;
    width: 590rpx;
    height: 750rpx;
    &__content {
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 232rpx 0 38rpx;
      z-index: 1;
      .info {
        width: 502rpx;
        color: #ff3838;
        background: linear-gradient(180deg, rgba(234, 255, 235, 0.7), #eaffeb);
        border: 2rpx solid #ffffff;
        border-radius: 18rpx;
        padding: 22rpx 0;
        text-align: center;
        margin-bottom: 28rpx;
        &-title {
          font-size: 28rpx;
          font-weight: bold;
        }
        &-desc {
          font-size: 22rpx;
          margin-top: 14rpx;
        }
      }
      .desc {
        font-size: 28rpx;
        font-weight: 500;
        color: #333333;
        margin-bottom: 22rpx;
      }
      .list {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        margin-bottom: 18rpx;
        .list-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 24rpx;
          color: #333333;
          margin-bottom: 26rpx;
          &__icon {
            width: 100rpx;
            height: 118rpx;
            margin-bottom: 10rpx;
            &.link {
              width: 164rpx;
            }
          }
        }
      }
      .btn {
        width: 244rpx;
        height: 52rpx;
        font-size: 24rpx;
        font-weight: 500;
        color: #ff3838;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2rpx solid #ff3838;
        border-radius: 58rpx;
      }
    }
    &__bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }
    &__close {
      position: absolute;
      top: 135rpx;
      right: 48rpx;
      z-index: 1;
    }
  }
  &-coupon {
    position: relative;
    width: 556rpx;
    height: 666rpx;
    &__content {
      position: relative;
      padding: 124rpx 46rpx 114rpx;
      z-index: 1;
      .list {
        position: relative;
        &-item {
          width: 458rpx;
          height: 134rpx;
          display: flex;
          align-items: center;
          &.active {
            height: 122rpx;
            margin-bottom: 170rpx;
            .list-item__right {
              padding-top: 0;
            }
          }
          &__left {
            width: 142rpx;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24rpx;
            font-weight: 500;
            color: #fff3b7;
            .unit {
              margin-top: 1.2em;
            }
            .active {
              font-size: 68rpx;
              font-weight: bold;
            }
          }
          &__right {
            flex: 1;
            padding: 20rpx 0 0 38rpx;
            .title {
              font-size: 30rpx;
              font-weight: 500;
              color: #ffffff;
              margin-bottom: 6rpx;
            }
            .time {
              font-size: 24rpx;
              color: #ffffff;
            }
          }
        }
        &-hand {
          width: 72rpx;
          height: 87rpx;
          position: absolute;
          bottom: 140rpx;
          left: 50%;
          transform: translateX(-50%);
        }
      }
    }
    &__bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }
  }
  &-operation {
    width: 590rpx;
    height: 706rpx;
    &__bg {
      width: 100%;
    }
  }
  &-reservation {
    position: relative;
    width: 668rpx;
    background: linear-gradient(180deg, #d8ffda, #ffffff 12%);
    border: 2rpx solid #ffffff;
    border-radius: 52rpx;
    &__content {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 48rpx 20rpx 40rpx;
      z-index: 1;
      .title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 24rpx;
      }
      .scroll {
        width: 100%;
        max-height: 296rpx;
        margin-bottom: 38rpx;
        ::v-deep .table {
          border: none;
          border-radius: 16rpx;
          .tr {
            border: none;
            background: #f8f8f8;
          }
          .th,
          .td {
            height: 74rpx !important;
            border: none !important;
            padding: 0 !important;
          }
          .th {
            font-size: 20rpx !important;
            color: #3a7700 !important;
            font-weight: 500 !important;
            white-space: nowrap;
          }
          .td {
            font-size: 22rpx !important;
            color: #333333 !important;
          }
        }
      }
      .select {
        width: 244rpx;
        height: 42rpx;
        margin-bottom: 26rpx;
        &.selected {
          width: 288rpx;
          height: 46rpx;
        }
      }
      .award {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 32rpx;
        &-icon {
          margin-right: 12rpx;
        }
        &-text {
          font-size: 36rpx;
          font-weight: 500;
          color: #ff7424;
        }
      }
      .list {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 8rpx;
        margin-bottom: 22rpx;
        .list-item {
          width: 292rpx;
          height: 76rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2rpx solid #979797;
          border-radius: 20rpx;
          &.active {
            background: linear-gradient(225deg, #ffc660 2%, #ffa400);
            border-radius: 20rpx;
            border: none;
            .list-item {
              &__icon {
                filter: brightness(100);
              }
              &__text {
                color: #fff;
              }
            }
          }
          &__icon {
            width: 28rpx;
            height: 28rpx;
            margin-right: 10rpx;
            filter: grayscale(100%);
            &.vip {
              width: 34rpx;
              height: 30rpx;
            }
          }
          &__text {
            font-size: 28rpx;
            font-weight: 500;
            color: #939393;
          }
        }
      }
      .tips {
        width: 100%;
        font-size: 22rpx;
        color: #939393;
        line-height: 32rpx;
        padding-left: 8rpx;
      }
      .btn {
        width: 260rpx;
        height: 76rpx;
        font-size: 28rpx;
        font-weight: 500;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 40rpx;
        background: #ffb42c;
        border-radius: 38rpx;
      }
    }
    &__bg {
      position: absolute;
      top: -138rpx;
      left: 0;
      width: 100%;
    }
    &__close {
      position: absolute;
      top: 30rpx;
      right: 40rpx;
      z-index: 1;
    }
  }
}
</style>
