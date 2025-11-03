<template>
  <u-popup :show="props.show" mode="bottom" :overlay="props.overlay" :overlay-opacity="props.overlayOpacity" bg-color="transparent">
    <view class="payment-popup">
      <view class="payment-popup__name">
        <image class="avatar" :src="avatar" mode="widthFix" />
        <view class="name">{{ studentInfo.studentName }}同学</view>
      </view>
      <view class="payment-popup__card">
        <view class="tag">心愿补贴金已到账</view>
        <view class="price">
          <view class="price-day"><text class="active">{{ degradeInfo.name }}</text>补贴价</view>
          <view class="price-cost"><text class="active">{{ degradeInfo.cost }}</text>元</view>
          <view class="price-original">{{ degradeInfo.original }} 元</view>
        </view>
        <view class="desc"><text class="active">仅享 1 次</text>，补贴后低至 <text class="bold">{{ degradeInfo.dayPrice }}</text>  元/天</view>
        <image class="crown" :src="`${resourceUrl}crown.png`" mode="widthFix" />
      </view>
      <view class="payment-popup__close" @click="handleClose">
        <u-icon name="close" color="#333333" size="36rpx" bold />
      </view>
      <view class="payment-popup__btn">
        <view v-if="studyCoinFloat > 0" class="coin" @click="handleUseCoin">
          <image class="coin-icon" :src="`${resourceUrl}${useStudyCoin ? 'coin_active' : 'coin_default'}.png`" mode="widthFix" />
          <view class="coin-text">是否用学币抵扣？（您当前剩余学币{{ studyCoinFloat }}个）</view>
        </view>
        <view class="button" @click="paymentVIP">立即支付 {{ realPrice }} 元</view>
        <view class="tips" @click="openProtocol">
          支付即视为同意<text class="active">《会员协议》</text>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  show: boolean
  overlay: boolean
  overlayOpacity: number
  degradeInfo: any
  paymentInfo: any
}>(), {
  show: false,
  overlay: true,
  overlayOpacity: 0.7,
  degradeInfo: {},
  paymentInfo: {},
})
const emits = defineEmits(['update:show', 'close', 'payment', 'protocol', 'unpaidReport'])
const resourceUrl = 'https://fe-resource.haofenshu.com/member/'
const useStudyCoin = ref(false)

const beProxy = computed(() => {
  let prefix = ''
  // #ifdef MP-WEIXIN
  prefix = '/v1/be-proxy'
  // #endif
  return prefix
})
const degradeInfo = computed(() => props.degradeInfo || {})
const userInfo = computed(() => uni.getStorageSync('userInfo') || getApp()?.globalData?.userInfo || {})
const studentInfo = computed(() => userInfo.value.linkedStudent || {})
const avatar = computed(() => userInfo.value.avatar || `${resourceUrl}avatar.png`)
const studyCoinFloat = computed(() => props.paymentInfo.studyCoinFloat || 0)
const goodCoin = computed(() => Math.min(degradeInfo.value.cost, studyCoinFloat.value))
const realPrice = computed(() => useStudyCoin.value ? degradeInfo.value.cost - goodCoin.value : degradeInfo.value.cost)

function closePopup() {
  emits('update:show', false)
}

async function handleClose() {
  await orderAction(1)
  emits('close')
  emits('unpaidReport', 1)
}

function paymentVIP() {
  closePopup()
  emits('payment', { id: props.degradeInfo.id, useStudyCoin: useStudyCoin.value ? 1 : 3 })
  emits('unpaidReport', 3)
}

function openProtocol() {
  emits('protocol')
}

function handleUseCoin() {
  useStudyCoin.value = !useStudyCoin.value
}

// 待支付弹窗-用户反馈
async function orderAction(action: number) {
  const { id, degradeType, degradeLevel } = degradeInfo.value
  const params = { id, action, degradeType, degradeLevel }
  return await uni.$http.post(`${beProxy.value}/v2/payments/order-action`, params, { custom: { loading: false, error: false } })
}
</script>

<style lang="scss" scoped>
.payment-popup {
  width: 100%;
  height: 778rpx;
  background: #fff9f3;
  border-radius: 24rpx 24rpx 0 0;
  padding: 36rpx 28rpx 0;
  &__name {
    display: flex;
    align-items: center;
    margin-bottom: 56rpx;
    .avatar {
      width: 56rpx;
      height: 56rpx;
      margin-right: 12rpx;
    }
    .name {
      color: #333333;
      font-size: 30rpx;
      font-weight: bold;
    }
  }
  &__card {
    position: relative;
    width: 100%;
    height: 212rpx;
    display: flex;
    align-items: center;
    background: linear-gradient(168deg, #ffecb5, #fff6de 100%);
    border: 2rpx solid #ffc55f;
    border-radius: 20rpx;
    .tag {
      position: absolute;
      top: -22rpx;
      left: 0;
      width: 252rpx;
      height: 50rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26rpx;
      color: #ffffff;
      font-weight: bold;
      background: linear-gradient(225deg, #ff450e, #ff880c);
      border-radius: 36rpx 2rpx 36rpx 2rpx;
    }
    .price {
      width: 100%;
      position: relative;
      display: flex;
      align-items: baseline;
      padding: 0 38rpx;
      margin-bottom: 10rpx;
      z-index: 1;
      &-day {
        color: #70450f;
        font-size: 30rpx;
        font-weight: bold;
        align-self: self-start;
        flex-grow: 1;
        margin-top: 14rpx;
        .active {
          font-size: 36rpx;
          color: #ff6124;
        }
      }
      &-cost {
        color: #ff381b;
        font-size: 24rpx;
        margin-right: 12rpx;
        .active {
          font-size: 64rpx;
          font-weight: bold;
          margin-right: 4rpx;
        }
      }
      &-original {
        width: 86rpx;
        height: 32rpx;
        color: #ff8d00;
        font-size: 22rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 142, 0, 0.1);
        border-radius: 8rpx;
        text-decoration: line-through;
      }
    }
    .desc {
      position: absolute;
      left: 38rpx;
      bottom: 24rpx;
      color: #a98959;
      font-size: 28rpx;
      z-index: 1;
      .active {
        color: #835b1d;
      }
      .bold {
        font-weight: bold;
        color: #835b1d;
      }
    }
    .crown {
      position: absolute;
      bottom: 16rpx;
      right: 0;
      width: 148rpx;
      height: 162rpx;
    }
  }
  &__close {
    position: absolute;
    top: 33rpx;
    right: 33rpx;
  }
  &__btn {
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 999;
    padding: 0 28rpx 12rpx;
    padding-bottom: calc(env(safe-area-inset-bottom) + 12rpx);
    .coin {
      display: flex;
      align-items: center;
      padding-left: 28rpx;
      margin-bottom: 12rpx;
      &-icon {
        width: 28rpx;
        height: 28rpx;
        margin-right: 12rpx;
      }
      &-text {
        font-size: 24rpx;
        color: #70450f;
      }
    }
    .button {
      width: 100%;
      height: 84rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 32rpx;
      font-weight: bold;
      background: linear-gradient(225deg, #ffa430 0%, #ff7426);
      border-radius: 42rpx;
      margin-bottom: 12rpx;
    }
    .tips {
      font-size: 22rpx;
      color: #939393;
      text-align: center;
      .active {
        color: #ffba1d;
      }
    }
  }
}
</style>
