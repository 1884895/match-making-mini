<template>
  <u-popup :show="!hideMember && props.show" :mode="popup.mode" :bg-color="popup.bgColor" :overlay-style="popup.overlayStyle" :duration="popup.duration" :close-on-click-overlay="popup.closeOnClickOverlay" @touchmove.stop.prevent>
    <view v-if="Object.keys(degradeInfo).length" class="popup">
      <!-- 原待支付订单挽留 isDegrade ture 降级商品 false 原订单商品，degradeType: 0 原商品 1 折扣品 -->
      <view v-if="!degradeInfo.isDegrade && degradeInfo.degradeType === 0" class="popup-item popup-unpaid">
        <view class="popup-item__content">
          <view class="title">{{ degradeInfo.name }}</view>
          <view class="cost"><text class="unit">¥</text><text>{{ degradeInfo.cost }}</text></view>
          <view class="tips"><template v-if="degradeInfo.dayPrice < 0.99">每天仅需<text class="active">{{ degradeInfo.dayPrice }}</text>元，</template>畅享<text class="active">32</text>项会员特权</view>
          <view v-if="degradeInfo.minus > 0" class="tag">
            <view class="tag-info">
              <image class="tag-info__bg" :src="`${resourceUrl}/remind_tag.png`" mode="widthFix" />
              <view class="tag-info__text">可省{{ degradeInfo.minus }}元</view>
            </view>
          </view>
          <view class="btns">
            <view class="btns-abandon" @click="handleClose(2)">放弃支付</view>
            <view class="btns-pay" @click="handlePayment">立即支付</view>
          </view>
        </view>
        <image class="popup-unpaid__bg" :src="`${resourceUrl}/remind_unpaid_bg.png`" mode="widthFix" />
      </view>
      <!-- 降级商品优惠挽留 -->
      <view v-if="degradeInfo.isDegrade && degradeInfo.degradeType === 0" class="popup-item popup-price">
        <view class="popup-item__content">
          <view class="title">【{{ degradeInfo.name }}】补贴价资格？</view>
          <view class="cost">仅需：<text class="count">{{ degradeInfo.cost }}</text>元</view>
          <view class="desc">
            <view v-if="degradeInfo.cardType === 'year' || degradeInfo.cardType === 'halfyear'" class="desc-text">限时补贴</view>
            <view v-else class="desc-text">32 项会员功能<text class="active">全开放</text></view>
            <view class="desc-line" />
          </view>
          <view v-if="degradeInfo.minus > 0" class="tag">
            <view class="tag-info">
              <image class="tag-info__bg" :src="`${resourceUrl}/remind_tag.png`" mode="widthFix" />
              <view class="tag-info__text">可省{{ degradeInfo.minus }}元</view>
            </view>
          </view>
          <view class="btns">
            <view class="btns-abandon" @click="handleClose(2)">忍痛放弃</view>
            <view class="btns-pay" @click="handlePayment">立即支付</view>
          </view>
        </view>
        <image class="popup-price__bg" :src="`${resourceUrl}/remind_price_bg.png`" mode="widthFix" />
      </view>
      <!-- 降级商品补贴挽留 -->
      <view v-if="degradeInfo.degradeType === 1" class="popup-item popup-discount">
        <view class="popup-item__content">
          <view class="title">【{{ degradeInfo.name }}】补贴价资格？</view>
          <view class="cost">仅需：<text class="count">{{ degradeInfo.cost }}</text>元</view>
          <view class="desc">
            <view class="desc-text">限时补贴 10%</view>
            <view class="desc-line" />
          </view>
          <view v-if="degradeInfo.minus > 0" class="tag">
            <view class="tag-info">
              <image class="tag-info__bg" :src="`${resourceUrl}/remind_tag.png`" mode="widthFix" />
              <view class="tag-info__text">可省{{ degradeInfo.minus }}元</view>
            </view>
          </view>
          <view class="btns">
            <view class="btns-abandon" @click="handleClose(2)">忍痛放弃</view>
            <view class="btns-pay" @click="handlePayment">立即支付</view>
          </view>
          <view class="countdown">
            <view v-if="isFinish" class="countdown-text">已取消</view>
            <template v-else>
              <image class="countdown-clock" :src="`${resourceUrl}/clock.png`" mode="widthFix" />
              <up-count-down :time="degradeInfo.remainTime * 1000" format="HH:mm:ss" auto-start @change="onChange" @finish="isFinish = true">
                <view class="countdown-time">
                  <view class="countdown-time__count">{{ formatNumber(timeData.hours || 0) }}</view>
                  <text class="countdown-time__doc">:</text>
                  <view class="countdown-time__count">{{ formatNumber(timeData.minutes || 0) }}</view>
                  <text class="countdown-time__doc">:</text>
                  <view class="countdown-time__count">{{ formatNumber(timeData.seconds || 0) }}</view>
                </view>
              </up-count-down>
              <view class="countdown-text">后取消</view>
            </template>
          </view>
        </view>
        <image class="popup-discount__bg" :src="`${resourceUrl}/remind_discount_bg.png`" mode="widthFix" />
      </view>
      <view class="popup-close" @click="handleClose(1)"><up-icon class="close" name="close" color="#fff" size="34rpx" bold /></view>
    </view>
  </u-popup>
  <Payment ref="payment" @success="paymentSuccess" />
</template>

<script setup lang="ts">
import Payment from '../memberPages/components/payment.vue'
import { payThroughList } from '../memberPages/member/util.js'
import { formatNumber, isMiniProgram, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

const props = withDefaults(defineProps<{
  show: boolean
  isTabbar: boolean
  degradeInfo: any
  cardType: string
  shortInfo: any
}>(), {
  show: false,
  isTabbar: false,
  degradeInfo: () => ({}),
  cardType: '',
  shortInfo: {},
})
const emits = defineEmits(['close', 'update:show', 'abandon', 'payment', 'paymentSuccess'])
const hideMember = computed(() => {
  const userInfo = uni.getStorageSync('userInfo') || getApp().globalData?.userInfo || {}
  return userInfo.hideMember || false
})

const popup = ref({
  mode: 'center',
  duration: 200,
  closeOnClickOverlay: true,
  bgColor: 'transparent',
  overlayStyle: { background: 'rgba(0, 0, 0, 0.85)' },
})
const resourceUrl = 'https://fe-resource.haofenshu.com/unpaid'
const timeData = ref({ hours: 0, minutes: 0, seconds: 0 })
const isFinish = ref(false)
const payment = ref()

const degradeInfo = computed(() => props.degradeInfo || {})
const recommendation = computed(() => props.shortInfo?.recommendation || {}) // 当前用户的会员类型、状态
const memberType = computed(() => recommendation.value?.memberType as 'month' | 'halfYear' | 'jidu' | 'year')
const stage = computed(() => recommendation.value?.stage || '')
const isYearExpiring = computed(() => memberType.value === 'year' && stage.value.startsWith('expiring'))
const themeId = computed(() => props.shortInfo?.themeId || '')
const payWayList = computed(() => payThroughList())
const payThrough = computed(() => {
  const { payThrough } = payWayList.value[0] || {}
  return payThrough
})
const beProxy = computed(() => {
  let prefix = ''
  // #ifdef MP-WEIXIN
  prefix = '/v1/be-proxy'
  // #endif
  return prefix
})

// 倒计时
function onChange(e: any) {
  timeData.value = e
};

async function handleClose(action: number) {
  // 一年过期
  if (themeId.value === 'year_expired' || themeId.value === 'year_expiring') {
    const eventMap: { [key: number]: string } = { 1: 'year_unpay_close', 2: 'year_unpay_refuse' }
    report(isYearExpiring.value ? 'year_expiring' : 'short_long', eventMap[action])
    await shortOrderAction(action)
  }
  // 短变长（月卡、季卡、半年卡）
  if (themeId.value === 'short_long') {
    await shortOrderAction(action)
  }
  unpaidReport(action)
  await orderAction(action)
  emits('update:show', false)
  action === 1 && emits('close')
  action === 2 && !props.isTabbar && goBack()
}

// 立即支付
function handlePayment() {
  if (themeId.value === 'year_expired' || themeId.value === 'year_expiring')
    report(isYearExpiring.value ? 'year_expiring' : 'short_long', 'year_unpay_pay')
  emits('payment')
  unpaidReport(3)
  const page = uni.$u.page()
  // #ifdef H5
  page.includes('memberPages/member/member') ? paymentVIP() : jumpVip()
  // #endif

  // #ifdef MP-WEIXIN
  page.includes('pages/me/member') ? paymentVIP() : jumpVip()
  // #endif
}

function paymentVIP() {
  const params = { payThrough: payThrough.value, id: degradeInfo.value.id }
  payment.value?.paymentVIP(params, '/v2/payments/degrade')
}

function jumpVip() {
  const { id, cid } = degradeInfo.value
  const url = `/pages/me/member${uni.$u.queryParams({ unpayId: id, cid })}`
  // #ifdef H5
  if (isMiniProgram()) {
    return jWeixin.miniProgram.navigateTo({ url })
  }
  nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${location.origin}/uni_modules/hfs-fe-uni-module/memberPages/member/member${uni.$u.queryParams({ unpayId: id, cid })}` }))
  // #endif
  // #ifdef MP-WEIXIN
  uni.navigateTo({ url })
  // #endif
}

function paymentSuccess() {
  emits('paymentSuccess')
}

function goBack() {
  if (getCurrentPages().length > 1)
    return uni.navigateBack()
  // #ifdef H5
  nativeBridge.callHandler('goBack', 'goBack')
  // #endif
  // #ifdef MP-WEIXIN
  return uni.navigateBack()
  // #endif
}

// 待支付弹窗-用户反馈
async function orderAction(action: number) {
  const { id, degradeType, degradeLevel } = degradeInfo.value
  const params = { id, action, degradeType, degradeLevel }
  await uni.$http.post(`${beProxy.value}/v2/payments/order-action`, params, { custom: { loading: false, error: false } })
}

// 活动类用户反馈
async function shortOrderAction(action: number) {
  const { product, memberType, stage } = recommendation.value
  const params = { product, memberType, stage, action }
  await uni.$http.post(`${beProxy.value}/v3/strategy/recommend-action`, params, { custom: { loading: false, error: false } })
}
// 埋点
async function unpaidReport(action: number) {
  if (Object.keys(degradeInfo.value).length === 0)
    return
  const { degradeType, degradeLevel, cid } = degradeInfo.value
  const params = {
    cardType: 'vipWanliu', // 特殊的cardType 支付页：payPage  >=5时 action=4    <5时action=5   会员挽留cardType=vipWanliu
    action, // 1：关闭广告  2：放弃  3：支付
    degradeType,
    degradeLevel,
    cid,
  }
  uni.$http.post(`${beProxy.value}/v3/action/unpay-degrade`, params, { custom: { loading: false, error: false } })
}
</script>

<style lang="scss" scoped>
.popup {
  &-item {
    position: relative;
    &__content {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
      padding: 230rpx 28rpx 0;
      .title {
        font-size: 36rpx;
        line-height: 50rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 44rpx;
      }
      .cost {
        font-size: 30rpx;
        color: #ff0000;
        margin-bottom: 50rpx;
        height: 106rpx;
        line-height: 106rpx;
        .count {
          font-size: 76rpx;
          font-weight: bold;
          margin-right: 10rpx;
        }
      }
      .tag {
        position: absolute;
        top: 296rpx;
        right: 32rpx;
        &-info {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          &__bg {
            width: 148rpx;
            height: 46rpx;
          }
          &__text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24rpx;
            font-weight: bold;
            color: #ffffff;
            white-space: nowrap;
          }
        }
      }
      .desc {
        position: relative;
        margin-bottom: 32rpx;
        &-text {
          height: 32rpx;
          display: flex;
          align-items: center;
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
          position: relative;
          z-index: 1;
          .active {
            color: #ff0000;
          }
        }
        &-line {
          width: calc(100% + 28rpx);
          height: 12rpx;
          opacity: 0.5;
          background: #fff300;
          border-radius: 10rpx;
          position: absolute;
          bottom: -6rpx;
          left: -14rpx;
        }
      }
      .btns {
        display: flex;
        align-items: center;
        margin-bottom: 24rpx;
        &-abandon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 242rpx;
          height: 80rpx;
          background: rgba(21, 118, 255, 0.15);
          border-radius: 40rpx;
          margin-right: 14rpx;
          font-size: 32rpx;
          color: #1678ff;
        }
        &-pay {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 242rpx;
          height: 80rpx;
          background: linear-gradient(225deg, #268bff 0%, #1374ff);
          border: 2rpx solid #ffffff;
          border-radius: 42rpx;
          font-size: 32rpx;
          font-weight: bold;
          color: #ffffff;
        }
      }
    }
  }
  &-unpaid {
    .popup-item__content {
      .cost {
        font-size: 76rpx;
        font-weight: bold;
        color: #ff0000;
        margin-bottom: 56rpx;
        .unit {
          font-size: 32rpx;
          font-weight: 400;
          margin-right: 10rpx;
        }
      }
      .tips {
        display: flex;
        align-items: center;
        font-size: 30rpx;
        line-height: 56rpx;
        color: #333333;
        margin-bottom: 30rpx;
        white-space: nowrap;
        .active {
          font-size: 40rpx;
          font-weight: bold;
          color: #ff0000;
        }
      }
    }
    &__bg {
      width: 554rpx;
      height: 678rpx;
    }
  }
  &-price {
    &__bg {
      width: 554rpx;
      height: 640rpx;
    }
  }
  &-discount {
    .popup-item__content {
      .countdown {
        display: flex;
        align-items: center;
        &-clock {
          width: 28rpx;
          height: 32rpx;
          margin-right: 10rpx;
        }
        &-time {
          display: flex;
          align-items: center;
          margin-right: 6rpx;
          &__count {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36rpx;
            height: 30rpx;
            font-size: 24rpx;
            font-weight: bold;
            color: #ff0000;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 4rpx;
          }
          &__doc {
            font-size: 24rpx;
            font-weight: bold;
            color: #ff0000;
            margin: 0 4rpx;
          }
        }
        &-text {
          font-size: 24rpx;
          color: #333333;
        }
      }
    }
    &__bg {
      width: 554rpx;
      height: 694rpx;
    }
  }
  &-close {
    padding: 20rpx;
    position: absolute;
    top: 8rpx;
    right: 20rpx;
    z-index: 20;
  }
}
</style>
