<template>
  <u-popup :show="!hideMember && props.show" :mode="popup.mode" :bg-color="popup.bgColor" :overlay-style="popup.overlayStyle" :duration="popup.duration" :close-on-click-overlay="popup.closeOnClickOverlay" @touchmove.stop.prevent>
    <template v-if="Object.keys(currentGoods).length">
      <view v-if="memberType === 'month' || memberType === 'halfYear' || memberType === 'jidu'" class="popup">
        <view class="popup-item popup-discount">
          <view class="popup-item__content">
            <view class="title">【{{ currentGoods.name }}】补贴价资格？</view>
            <view class="cost">仅需：<text class="count">{{ currentGoods.cost }}</text>元</view>
            <view v-if="currentGoods.minus > 0" class="tag">
              <view class="tag-info">
                <image class="tag-info__bg" :src="`${resourceUrl}/remind_tag.png`" mode="widthFix" />
                <view class="tag-info__text">可省{{ currentGoods.minus }}元</view>
              </view>
            </view>
            <view class="btns">
              <view class="btns-abandon" @click="handleClose(2)">忍痛放弃</view>
              <view class="btns-pay" @click="handlePayment">立即支付</view>
            </view>
          </view>
          <image v-if="recommendation.stage === 'expired'" class="popup-discount__bg" :src="`${resourceUrl}/remind_expired_bg.png`" mode="widthFix" />
          <image v-else class="popup-discount__bg" :src="`${resourceUrl}/remind_active_bg.png`" mode="widthFix" />
        </view>
        <view class="popup-close" @click="handleClose(1)"><up-icon class="close" name="close" color="#fff" size="34rpx" bold /></view>
      </view>
      <view v-if="memberType === 'year'" class="year">
        <image class="year-close" :src="`${resourceUrl}/year_close.png`" mode="widthFix" @click="handleClose(1, 'year_discount_close')" />
        <image class="year-bg" :src="`${resourceUrl}/year_bg.png`" mode="widthFix" />
        <view class="year-content">
          <view class="year-content__info">
            <view class="name" :class="{ active: currentGoods.dayPriceNew < 0.99 }">{{ currentGoods.name }}<view class="name-price">￥{{ currentGoods.cost }}</view></view>
            <view class="price">限时优惠：<text class="active">{{ currentGoods.discount }}折</text></view>
            <view v-if="currentGoods.dayPriceNew < 0.99" class="day">每天低至 {{ currentGoods.dayPriceNew }} 元</view>
          </view>
          <view class="year-content__btns">
            <view class="btns-item cancel" @click="handleClose(2, 'year_discount_refuse')">狠心拒绝</view>
            <view class="btns-item confirm" @click="handlePayment('year_discount_pay')">立享补贴</view>
          </view>
        </view>
      </view>
    </template>
  </u-popup>
  <Payment ref="payment" @success="paymentSuccess" />
</template>

<script setup lang="ts">
import Payment from '../memberPages/components/payment.vue'
import { deviceType, payThroughList } from '../memberPages/member/util.js'
import { isMiniProgram, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

const props = withDefaults(defineProps<{
  show: boolean
  isTabbar: boolean
  recommend: any
  options: any
}>(), {
  show: false,
  isTabbar: false,
  recommend: () => ({}), // 最新推荐商品
  options: {},
})
const emits = defineEmits(['update:show', 'payment', 'paymentSuccess'])

const popup = ref({
  mode: 'center',
  duration: 200,
  closeOnClickOverlay: true,
  bgColor: 'transparent',
  overlayStyle: { background: 'rgba(0, 0, 0, 0.85)' },
})
const resourceUrl = 'https://fe-resource.haofenshu.com/shortToLong'
const payment = ref()
const hideMember = computed(() => {
  const userInfo = uni.getStorageSync('userInfo') || getApp().globalData?.userInfo || {}
  return userInfo.hideMember || false
})
const goodNo = computed(() => props.options?.goodNo || '')
const currentGoods = computed(() => props.recommend?.membership?.find((item: any) => goodNo.value ? item.no === goodNo.value : item.isRecommended) || {})
const recommendation = computed(() => props.recommend.recommendation || {})
const memberType = computed(() => recommendation.value?.memberType as 'month' | 'halfYear' | 'jidu' | 'year')
const stage = computed(() => recommendation.value?.stage || '')
const isYearExpiring = computed(() => memberType.value === 'year' && stage.value.startsWith('expiring'))
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

async function handleClose(action: number, event?: any) {
  event && report(isYearExpiring.value ? 'year_expiring' : 'short_long', event)
  await orderAction(action)
  emits('update:show', false)
  !props.isTabbar && goBack()
}

// 立即支付
async function handlePayment(event: any) {
  event && report(isYearExpiring.value ? 'year_expiring' : 'short_long', event)
  const page = uni.$u.page()
  // #ifdef H5
  page.includes('memberPages/member/member') ? await paymentVIP() : jumpVip()
  // #endif

  // #ifdef MP-WEIXIN
  page.includes('pages/me/member') ? await paymentVIP() : jumpVip()
  // #endif
  emits('payment')
}

async function paymentVIP() {
  const params = {
    deviceType: deviceType(),
    goodNo: currentGoods.value.no, // 固定商品
    goodType: 1, // 固定参数 goodType goodNo
    payThrough: payThrough.value,
    studyCoinCount: 0, // 不支持学币
    useStudyCoin: 3,
    aid: '',
    bid: '',
    cid: '',
  }
  await payment.value?.paymentVIP(params, '/v2/payments')
}

function jumpVip() {
  const params = { activityType: 'shortToLong' }
  const url = `/pages/me/member${uni.$u.queryParams(params)}`
  // #ifdef H5
  if (isMiniProgram()) {
    return jWeixin.miniProgram.navigateTo({ url })
  }
  nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${location.origin}/uni_modules/hfs-fe-uni-module/memberPages/member/member${params}` }))
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

// 活动类用户反馈
async function orderAction(action: number) {
  const { product, memberType, stage } = recommendation.value
  const params = { product, memberType, stage, action }
  await uni.$http.post(`${beProxy.value}/v3/strategy/recommend-action`, params, { custom: { loading: false, error: false } })
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
      .btns {
        display: flex;
        align-items: center;
        position: absolute;
        bottom: 30rpx;
        left: 50%;
        transform: translateX(-50%);
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
  &-discount {
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
.year {
  position: relative;
  &-close {
    width: 44rpx;
    height: 44rpx;
    position: absolute;
    top: 24rpx;
    right: 24rpx;
    z-index: 20;
  }
  &-bg {
    width: 594rpx;
    height: 596rpx;
  }
  &-content {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    padding-top: 190rpx;
    z-index: 10;
    &__info {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 250rpx;
      .name {
        display: flex;
        align-items: center;
        font-size: 36rpx;
        color: #70450f;
        margin-top: 0;
        margin-bottom: 10rpx;
        &.active {
          margin-top: 30rpx;
        }
        &-price {
          font-size: 44rpx;
          font-weight: bold;
          color: #ff0000;
          margin-left: 10rpx;
        }
      }
      .price {
        font-size: 28rpx;
        color: #666666;
        margin-bottom: 18rpx;
        .active {
          color: #ff0000;
        }
      }
      .day {
        font-size: 28rpx;
        color: #ff0000;
      }
    }
    &__btns {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0 40rpx;
      position: absolute;
      bottom: 30rpx;
      left: 0;
      .btns-item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 248rpx;
        height: 76rpx;
        border: 2rpx solid #ffffff;
        border-radius: 40rpx;
        font-size: 28rpx;
        &.cancel {
          background: #e6e6e6;
          color: #939393;
        }
        &.confirm {
          background: linear-gradient(225deg, #ffb405, #ff5f3d);
          font-weight: bold;
          color: #ffffff;
        }
      }
    }
  }
}
</style>
