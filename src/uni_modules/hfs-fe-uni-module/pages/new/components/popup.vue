<template>
  <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" :overlay-style="popup.overlayStyle" bg-color="transparent" @click="tipsShow = false">
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
    <view v-if="popup.type === 'award'" class="popup-award" @click="tipsShow = false">
      <template v-if="(popup.discountList && popup.discountList.length) || (popup.ticketList && popup.ticketList.length)">
        <view class="popup-award__title">
          可使用的奖品<image class="close" :src="`${resourceUrl}close.png`" @click="close" />
        </view>
        <view class="popup-award__content">
          <view v-if="popup.discountList && popup.discountList.length" class="ticket">
            <view class="ticket-name">
              优惠券
            </view>
            <view class="ticket-list">
              <view v-for="(item, index) in popup.discountList" :key="index" class="ticket-list__item">
                <image class="bg" :src="`${resourceUrl}discount_bg.png`" mode="widthFix" />
                <view class="detail">
                  <view class="value flex-row-center">
                    <text class="unit">
                      ￥
                    </text><text class="text">
                      {{ item.discountValue }}
                    </text>
                  </view>
                  <view class="message">
                    <view class="title">
                      {{ item.couponName }}
                    </view>
                    <view class="time">
                      有效期至：{{ $u.timeFormat(item.expireTime, 'yyyy.mm.dd') }}
                    </view>
                  </view>
                  <view class="button" @click="handleUse(item)">
                    去使用
                  </view>
                </view>
              </view>
              <view class="ticket-list__tips">
                查看：APP-我的-我的优惠券
              </view>
            </view>
          </view>
          <view v-if="popup.ticketList && popup.ticketList.length" class="ticket">
            <view class="ticket-name flex-row-start">
              <text>功能券包</text>
              <image class="icon" :src="`${resourceUrl}question.png`" mode="widthFix" @click.stop="tipsShow = !tipsShow" />
              <view v-if="tipsShow" class="text">
                每个功能券包包含成绩PK券*1、模拟成绩券*1、班级穿越券*1、试卷下载券*1、八卦报告券*1、联考报告券*1
              </view>
            </view>
            <view class="ticket-list">
              <view v-for="(item, index) in popup.ticketList" :key="index" class="ticket-list__item many">
                <image class="bg" :src="`${resourceUrl}ticket_bg.png`" mode="widthFix" />
                <view class="detail">
                  <view class="value flex-row-center">
                    <text class="text">
                      {{ item.count }}
                    </text>张
                  </view>
                  <view class="message">
                    <view class="title">
                      功能券包*{{ item.packCount }}
                    </view>
                    <view class="time">
                      有效期至：{{ $u.timeFormat(item.expireTime, 'yyyy.mm.dd') }}
                    </view>
                  </view>
                  <view class="button" @click="handleUse(item)">
                    去使用
                  </view>
                </view>
              </view>
              <view class="ticket-list__tips">
                查看：APP-我的-积分兑换-我的卡券
              </view>
            </view>
          </view>
        </view>
        <view class="popup-award__question">
          如有疑问，请点击<text class="contact" @click="openCustomerServiceChat">
            联系客服
          </text>
        </view>
      </template>
      <template v-else>
        <view class="popup-award__title popup-award_received">
          已获得的奖品<image class="close" :src="`${resourceUrl}close.png`" @click="close" />
        </view>
        <view class="popup-award__message flex-row-center">
          你还未兑换过奖品哦
        </view>
        <view class="popup-award__button flex-row-center" @click="close">
          知道了
        </view>
      </template>
    </view>
    <view v-if="popup.type === 'rules'" class="popup-rules">
      <image v-if="isHFSAppStudent" class="popup-rules__content student" :src="`${resourceUrl}exchange_rules_student.png`" mode="widthFix" />
      <image v-else class="popup-rules__content" :src="`${resourceUrl}exchange_rules.png`" mode="widthFix" />
      <view class="popup-rules__button flex-row-center" @click="close">
        知道了
      </view>
      <view class="popup-rules__close" @click="close">
        <u-icon name="close" color="#333333" size="36rpx" bold />
      </view>
    </view>
    <view v-if="popup.type === 'result'" class="popup-result">
      <image v-if="popup.awardType === 3 || popup.awardType === 2" class="popup-result__ticket" :src="`${resourceUrl}result_ticket.png`" mode="widthFix" />
      <image v-if="popup.awardType === 1" class="popup-result__delay" :src="`${resourceUrl}result_delay.png`" mode="widthFix" />
      <view class="popup-result__info">
        <image v-if="popup.awardType === 2" class="bg" :src="`${resourceUrl}discount_bg.png`" mode="widthFix" />
        <image v-if="popup.awardType === 3" class="bg" :src="`${resourceUrl}ticket_bg.png`" mode="widthFix" />
        <view v-if="popup.awardType === 1" class="delay">
          <view class="title">
            您已获得<text class="count">
              {{ popup.count }}天会员延时包
            </text>
          </view>
          <view class="time">
            会员到期时间延长至：{{ $u.timeFormat(popup.expireTime, 'yyyy.mm.dd') }}
          </view>
        </view>
        <view v-if="popup.awardType === 3 || popup.awardType === 2" class="detail">
          <view v-if="popup.awardType === 2" class="value flex-row-center">
            <text class="unit">
              {{ popup.unit }}
            </text><text class="text">
              {{ popup.count }}
            </text>
          </view>
          <view v-if="popup.awardType === 3" class="value flex-row-center">
            <text class="text">
              {{ popup.count }}
            </text><text class="unit">
              组
            </text>
          </view>
          <view class="message">
            <view class="title">
              {{ popup.couponName }}
            </view>
            <view class="time">
              有效期至：{{ $u.timeFormat(popup.expireTime, 'yyyy.mm.dd') }}
            </view>
          </view>
          <view class="button" @click="handleUse({ type: popup.awardType })">
            去使用
          </view>
        </view>
      </view>
      <view class="popup-result__button flex-row-center" @click="close">
        发起新挑战！
      </view>
      <view class="popup-result__close" @click="close">
        <u-icon name="close" color="#333333" size="36rpx" bold />
      </view>
    </view>
    <view v-if="popup.type === 'select'" class="popup-select">
      <image class="popup-select__head" :src="`${resourceUrl}select_head.png`" mode="widthFix" />
      <view class="popup-select__content">
        <view class="title">
          兑换奖励<image class="close" :src="`${resourceUrl}close.png`" @click="close" />
        </view>
        <view class="message">
          <view class="message-count">
            已成功邀请<text class="message-count__value">
              {{ popup.invited || 0 }}
            </text>人
          </view>
          <view class="message-rules flex-row-center" @click="showRules">
            <image class="message-rules__icon" :src="`${resourceUrl}select_rules.png`" mode="widthFix" />兑换规则
          </view>
        </view>
        <view class="info">
          <view v-for="(item, index) in popup.ticketList" :key="index" class="info-item">
            <view class="info-item__avater" :style="{ marginRight: popup.invited > 5 ? '8rpx' : '22rpx' }">
              <image v-if="popup.invited > 5" class="more" :src="`${resourceUrl}select_more.png`" mode="widthFix" />
              <view v-else class="list">
                <view v-for="(it, i) in 5" :key="it" class="list-item" :style="{ left: `${i * 36}rpx`, zIndex: 5 - i }">
                  <image v-if="i < popup.invited" class="list-item__avater" :src="`${resourceUrl}avatar.png`" mode="widthFix" />
                  <view v-else class="list-item__gray" />
                </view>
              </view>
            </view>
            <image class="info-item__right" :src="`${resourceUrl}select_right.png`" mode="widthFix" />
            <view class="info-item__tag">
              <image class="bg" :src="`${resourceUrl}select_ticked.png`" mode="widthFix" />
              <view class="text flex-col-center" :style="{ padding: item.type === 3 ? '12rpx 0 10rpx' : '6rpx 0' }">
                <template v-if="item.type === 1 || item.type === 2">
                  <view class="text-title">
                    {{ item.count }}{{ item.type === 2 ? '元' : item.unit }}
                  </view>
                  <view class="text-name">
                    {{ item.couponName }}
                  </view>
                </template>
                <template v-if="item.type === 3">
                  <view class="text-name">
                    {{ item.couponName }}
                  </view>
                  <view class="text-limit">
                    每邀5人可兑换
                  </view>
                </template>
              </view>
            </view>
            <view class="info-item__operation flex-col-center">
              <view class="button flex-row-center" :class="{ disabled: item.disabled }" @click="handleSelectAward(item)">
                兑换
              </view>
              <view class="tips">
                {{ item.tips }}
              </view>
            </view>
          </view>
        </view>
        <view class="tips">
          <view>特别提醒：</view>
          <view>1. 邀请人数兑换完毕后进度清零，可重新发起挑战</view>
          <view>2. 活动到期前未选择礼品，取消奖励</view>
          <view v-if="!isHFSAppStudent">
            3. 优惠券需在家长端APP使用或登录小程序家长角色使用
          </view>
        </view>
      </view>
    </view>
    <view v-if="popup.type === 'invite'" class="popup-invite">
      <view class="activity-content flex-col-center">
        <view class="activity-content__text">
          {{ leadData.text }}
        </view>
        <image class="activity-content__down" :src="`${resourceUrl}down.png`" mode="widthFix" />
        <image v-if="leadData.role" class="activity-content__role" :src="resourceUrl + leadData.role" mode="widthFix" />
        <image class="activity-content__rules" :src="`${resourceUrl}rules.png`" mode="widthFix" @click="showRules" />
        <view class="activity-content__message">
          <image class="bg" :src="`${resourceUrl}invite_bg.png`" mode="widthFix" />
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
        </view>
      </view>
      <view class="popup-invite__footer fixed">
        <view class="title">
          {{ popup.title }}
        </view>
        <view class="list">
          <view class="list-item">
            <button v-if="popup.btnType === 'remind'" class="share" open-type="share" data-name="remind" @click="share('shareRemind')" />
            <u-button v-else open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareWeixin')" />
            <image class="list-item__icon" :src="`${resourceUrl}share_weixin.png`" />
            <text>分享至微信</text>
          </view>
          <view class="list-item">
            <button v-if="popup.btnType === 'remind'" class="share" @click="share('showRemindCopy')" />
            <u-button v-else :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareCopy')" />
            <image class="list-item__icon link" :src="`${resourceUrl}share_copy.png`" />
            <text>复制链接</text>
          </view>
        </view>
        <view class="close" @click="inviteClose">
          <u-icon name="close" color="#333333" size="36rpx" bold />
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script>
import { isHFSStudent, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    leadData: {
      type: Object,
      default: () => ({}),
    },
    inviterInfo: {
      type: Object,
      default: () => ({}),
    },
    prefix: {
      type: String,
      default: '',
    },
    isMember: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['closeInvite', 'getInvitation', 'jumpPage', 'shareRemind', 'shareWeixin', 'shareCopy', 'showRemindCopy'],
  options: {
    styleIsolation: 'shared',
  },
  data() {
    return {
      actionId: '667b7145925980bc5a2c6393',
      resourceUrl: 'https://fe-resource.haofenshu.com/new/',
      popup: {
        type: 'invite',
        show: false,
        mode: 'center',
        overlay: true,
        overlayStyle: {
          background: 'rgba(0, 0, 0, 0.7)',
        },
        awardType: '',
        discountValue: 0,
        couponName: '',
        expireTime: '',
        invited: 0,
        ticketList: [],
        qrUrl: '',
        title: '',
      },
      selected: 0,
      tipsShow: false,
      actionMap: {
        shareCopy: 'yytc_fzlj_click',
        shareWeixin: 'yytc_wx_click',
        shareRemind: 'txtc_wx_click',
        showRemindCopy: 'txtc_fzlj_click',
      },
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
    open(type, params = {}) {
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    close() {
      this.popup.show = false
    },
    inviteClose() {
      this.close()
      this.$emit('closeInvite')
    },
    share(type) {
      this.$emit(type)
      report(this.actionId, this.actionMap[type])
    },
    async handleSelectAward({ type, ...arg }) {
      if (!this.inviterInfo.invited)
        return uni.$u.toast('邀请人数不足')
      const res = await uni.$http.post(`${this.prefix}/v3/invitation/inviter-award`, { type }, { custom: { loading: false } })
      this.open('result', { ...arg, awardType: type, expireTime: res.data.expireTime || '' })
      this.$emit('getInvitation')
    },
    showRules() {
      this.open('rules')
      report(this.actionId, 'hdy2_dhgz_click')
    },
    handleUse(item) {
      if (item.type === 2)
        return this.$emit('jumpPage', 'vip')
      if (item.type === 3)
        return this.$emit('jumpPage', 'coupons')
    },
    openCustomerServiceChat() {
      // #ifdef MP-WEIXIN
      const options = this.isMember ? feConfig.vipCustomer : feConfig.customer
      wx.openCustomerServiceChat(options)
      // #endif
      // #ifdef H5
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: '12', data: {} }))
      // #endif
      report(this.actionId, 'hdy2_lxkf_click')
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
  &-award {
    position: relative;
    padding: 32rpx 24rpx 34rpx;
    background: linear-gradient(180deg, #ffdaa0, #ffffff);
    border: 2rpx solid #ffffff;
    border-radius: 52rpx;
    width: 588rpx;
    &__title {
      position: relative;
      text-align: center;
      font-size: 36rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 16rpx;
      .close {
        width: 48rpx;
        height: 48rpx;
        position: absolute;
        top: -10rpx;
        right: 0;
      }
    }
    &__content {
      .ticket {
        margin-bottom: 24rpx;
        &:last-child {
          margin-bottom: 0;
        }
        &-name {
          position: relative;
          font-size: 30rpx;
          color: #333333;
          margin-bottom: 12rpx;
          .icon {
            width: 28rpx;
            height: 28rpx;
            margin-left: 10rpx;
          }
          .text {
            width: 540rpx;
            background: rgba(0, 0, 0, 0.7);
            position: absolute;
            left: 0;
            top: 42rpx;
            z-index: 1;
            font-size: 18rpx;
            color: #ffffff;
            border-radius: 10rpx;
            padding: 6rpx 10rpx;
          }
        }
        &-list {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.7),
            #ffffff
          );
          border: 2rpx solid #ffffff;
          border-radius: 36rpx;
          padding: 24rpx 34rpx;
          &__item {
            position: relative;
            width: 470rpx;
            height: 100rpx;
            margin-bottom: 16rpx;
            &.many {
              height: 108rpx;
              padding-top: 8rpx;
              margin-bottom: 10rpx;
            }
            .bg {
              width: 470rpx;
              height: 100rpx;
              position: absolute;
              bottom: 0;
              left: 0;
            }
            .detail {
              height: 100%;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 6rpx;
              .value {
                width: 98rpx;
                color: #fff3b7;
                flex-shrink: 0;
                .unit {
                  font-size: 24rpx;
                  margin-top: 12rpx;
                }
                .text {
                  font-size: 44rpx;
                }
              }
              .message {
                width: 236rpx;
                padding: 0 6rpx 0 22rpx;
                color: #ffffff;
                flex-shrink: 0;
                .title {
                  font-size: 26rpx;
                  margin-bottom: 2rpx;
                }
                .time {
                  font-size: 18rpx;
                }
              }
              .button {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 118rpx;
                height: 48rpx;
                background: #ff7c0e;
                border-radius: 26rpx;
                font-size: 26rpx;
                font-weight: 500;
                color: #ffffff;
                margin-right: 4rpx;
              }
            }
          }
          &__tips {
            font-size: 22rpx;
            color: #939393;
            margin-top: 20rpx;
            text-align: center;
          }
        }
      }
    }
    &__question {
      width: 100%;
      padding: 36rpx 0 0;
      text-align: center;
      font-size: 24rpx;
      color: #939393;
      .contact {
        color: #ffa300;
      }
    }
    &__received {
      margin-bottom: 26rpx;
    }
    &__message {
      width: 540rpx;
      height: 88rpx;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), #ffffff);
      border: 2rpx solid #ffffff;
      border-radius: 36rpx;
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 40rpx;
    }
    &__tips {
      font-size: 24rpx;
      color: #939393;
      margin-bottom: 54rpx;
      text-align: center;
    }
    &__button {
      width: 256rpx;
      height: 74rpx;
      background: linear-gradient(180deg, #ff6a34, #ffca45);
      border: 1rpx solid #ffffff;
      border-radius: 39rpx;
      box-shadow:
        0rpx 4rpx 8rpx 0rpx rgba(0, 0, 0, 0.06),
        0rpx 2rpx 6rpx 0rpx rgba(255, 255, 255, 0.5) inset;
      font-size: 30rpx;
      font-weight: 500;
      color: #ffffff;
      margin: 0 auto;
    }
  }
  &-rules {
    position: relative;
    &__content {
      width: 588rpx;
      height: 836rpx;
      &.student {
        width: 588rpx;
        height: 730rpx;
      }
    }
    &__button {
      position: relative;
      width: 256rpx;
      height: 74rpx;
      background: linear-gradient(180deg, #ff6a34, #ffca45);
      border: 1rpx solid #ffffff;
      border-radius: 39rpx;
      box-shadow:
        0 4rpx 8rpx 0 rgba(0, 0, 0, 0.06),
        0 2rpx 6rpx 0 rgba(255, 255, 255, 0.5) inset;
      margin: -36rpx auto 0;
      font-size: 30rpx;
      font-weight: 500;
      color: #ffffff;
    }
    &__close {
      position: absolute;
      top: 28rpx;
      right: 38rpx;
    }
  }
  &-result {
    position: relative;
    &__ticket {
      width: 588rpx;
      height: 714rpx;
    }
    &__delay {
      width: 588rpx;
      height: 686rpx;
    }
    &__info {
      position: absolute;
      top: 372rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 470rpx;
      height: 100rpx;
      margin-bottom: 16rpx;
      &:last-child {
        margin-bottom: 0;
      }
      &.many {
        height: 108rpx;
        padding-top: 8rpx;
        margin-bottom: 10rpx;
      }
      .bg {
        width: 470rpx;
        height: 100rpx;
        position: absolute;
        bottom: 0;
        left: 0;
      }
      .detail {
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6rpx;
        .value {
          width: 98rpx;
          color: #fff3b7;
          flex-shrink: 0;
          .unit {
            font-size: 24rpx;
            margin-top: 12rpx;
          }
          .text {
            font-size: 44rpx;
          }
        }
        .message {
          width: 236rpx;
          padding: 0 6rpx 0 22rpx;
          color: #ffffff;
          flex-shrink: 0;
          .title {
            font-size: 26rpx;
            margin-bottom: 2rpx;
          }
          .time {
            font-size: 18rpx;
          }
        }
        .button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 118rpx;
          height: 48rpx;
          background: #ff7c0e;
          border-radius: 26rpx;
          font-size: 26rpx;
          font-weight: 500;
          color: #ffffff;
          margin-right: 4rpx;
        }
      }
      .delay {
        text-align: center;
        .title {
          font-size: 28rpx;
          color: #333333;
          margin-bottom: 4rpx;
          .count {
            color: #ffa300;
          }
        }
        .time {
          font-size: 22rpx;
          color: #939393;
        }
      }
    }
    &__button {
      position: absolute;
      bottom: 36rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 256rpx;
      height: 74rpx;
      background: linear-gradient(180deg, #ff6a34, #ffca45);
      border: 1rpx solid #ffffff;
      border-radius: 39rpx;
      box-shadow:
        0 4rpx 8rpx 0 rgba(0, 0, 0, 0.06),
        0 2rpx 6rpx 0 rgba(255, 255, 255, 0.5) inset;
      font-size: 30rpx;
      font-weight: 500;
      color: #ffffff;
    }
    &__close {
      position: absolute;
      top: 208rpx;
      right: 38rpx;
    }
  }
  &-select {
    &__head {
      width: 458rpx;
      height: 190rpx;
      margin: 0 auto;
    }
    &__content {
      width: 668rpx;
      background: linear-gradient(180deg, #ffdaa0, #ffffff);
      border: 1rpx solid #ffffff;
      border-radius: 52rpx;
      padding: 32rpx 30rpx;
      .title {
        position: relative;
        text-align: center;
        font-size: 36rpx;
        font-weight: 500;
        color: #333333;
        margin-bottom: 10rpx;
        .close {
          width: 48rpx;
          height: 48rpx;
          position: absolute;
          top: -10rpx;
          right: 0;
        }
      }
      .message {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12rpx;
        &-count {
          font-size: 28rpx;
          color: #333333;
          &__value {
            color: #ff8b2a;
          }
        }
        &-rules {
          font-size: 22rpx;
          color: #333333;
          &__icon {
            width: 22rpx;
            height: 26rpx;
            margin-right: 10rpx;
            font-size: 22rpx;
            color: #333333;
          }
        }
      }
      .info {
        width: 608rpx;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), #ffffff);
        border: 2rpx solid #ffffff;
        border-radius: 36rpx;
        margin-bottom: 16rpx;
        &-item {
          display: flex;
          align-items: center;
          padding: 28rpx 16rpx;
          border-bottom: 1rpx solid #ffdfac;
          &:last-child {
            border-bottom: none;
          }
          &__avater {
            flex: 1;
            .more {
              width: 220rpx;
              height: 64rpx;
            }
            .list {
              position: relative;
              display: flex;
              &-item {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                &__avater,
                &__gray {
                  width: 60rpx;
                  height: 60rpx;
                }
                &__gray {
                  background: #e6e6e6;
                  border: 2rpx solid #ffffff;
                  border-radius: 50%;
                }
              }
            }
          }
          &__right {
            width: 46rpx;
            height: 34rpx;
            margin-right: 10rpx;
            flex-shrink: 0;
          }
          &__tag {
            position: relative;
            width: 142rpx;
            height: 82rpx;
            margin-right: 10rpx;
            flex-shrink: 0;
            .bg {
              width: 142rpx;
              height: 82rpx;
              position: absolute;
              top: 0;
              left: 0;
            }
            .text {
              position: relative;
              &-title,
              &-name {
                font-size: 24rpx;
                font-weight: 500;
                color: #ffa300;
              }
              &-limit {
                font-size: 18rpx;
                color: #ff2d2d;
              }
            }
          }
          &__operation {
            .button {
              width: 142rpx;
              height: 52rpx;
              background: #ffa300;
              border-radius: 26rpx;
              font-size: 28rpx;
              font-weight: 500;
              color: #ffffff;
              &.disabled {
                background: #e6e6e6;
                color: #939393;
              }
            }
            .tips {
              font-size: 22rpx;
              color: #939393;
            }
          }
        }
      }
      .tips {
        font-size: 22rpx;
        color: #939393;
        line-height: 32rpx;
      }
    }
  }
  &-invite {
    margin-top: -290rpx;
    position: relative;
    .activity-content {
      width: fit-content;
      position: relative;
      margin: 0 12rpx;
      &__text {
        background: #fffeef;
        border-radius: 32rpx;
        box-shadow: 0rpx -8rpx 0rpx 0rpx #fffccb inset;
        padding: 16rpx 30rpx;
        font-size: 26rpx;
        font-weight: 500;
        color: #6e5536;
      }
      &__down {
        width: 26rpx;
        height: 12rpx;
        margin-bottom: 10rpx;
      }
      &__role {
        width: 314rpx;
        height: 256rpx;
      }
      &__rules {
        width: 198rpx;
        height: 54rpx;
        position: absolute;
        top: 272rpx;
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
              0rpx 4rpx 8rpx 0rpx rgba(0, 0, 0, 0.06),
              0rpx 2rpx 6rpx 0rpx rgba(255, 255, 255, 0.5) inset;
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
    &__footer {
      width: 100%;
      border-radius: 32rpx 32rpx 0 0;
      .title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333333;
        margin-bottom: 34rpx;
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
        }
      }
      &.fixed {
        position: fixed;
        left: 0;
        bottom: 0;
        padding: 34rpx 0 32rpx;
        padding: 34rpx 0 calc(env(safe-area-inset-bottom) + 32rpx);
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
}
</style>
