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
          <view class="price-day"><text class="active">{{ newPromoterGoodDetail.name }}</text>补贴价</view>
          <view class="price-cost"><text class="active">{{ newPromoterGoodDetail.cost }}</text>元</view>
          <view class="price-original">{{ newPromoterGoodDetail.original }} 元</view>
        </view>
        <view class="desc"><text class="active">仅享 1 次</text>，补贴后低至 <text class="bold">{{ newPromoterGoodDetail.dayPrice }}</text>  元/天</view>
        <image class="crown" :src="`${resourceUrl}crown.png`" mode="widthFix" />
      </view>
      <view class="payment-popup__close" @click="closePopup">
        <u-icon name="close" color="#333333" size="36rpx" bold />
      </view>
      <view class="payment-popup__btn">
        <view class="button" @click="paymentVIP">立即支付 {{ newPromoterGoodDetail.cost }} 元</view>
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
  newPromoterGoodDetail: any
  paymentInfo: any
}>(), {
  show: false,
  overlay: true,
  overlayOpacity: 0.7,
  newPromoterGoodDetail: {},
  paymentInfo: {},
})
const emits = defineEmits(['update:show', 'payment', 'protocol'])
const resourceUrl = 'https://fe-resource.haofenshu.com/member/'

const newPromoterGoodDetail = computed(() => props.newPromoterGoodDetail || {})
const userInfo = computed(() => uni.getStorageSync('userInfo') || getApp()?.globalData?.userInfo || {})
const studentInfo = computed(() => userInfo.value.linkedStudent || {})
const avatar = computed(() => userInfo.value.avatar || `${resourceUrl}avatar.png`)

function closePopup() {
  emits('update:show', false)
}

function paymentVIP() {
  closePopup()
  emits('payment')
}

function openProtocol() {
  emits('protocol')
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
