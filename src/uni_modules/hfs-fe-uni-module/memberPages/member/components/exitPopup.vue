<template>
  <u-popup :show="props.show" :mode="props.mode" :overlay="props.overlay" :overlay-opacity="props.overlayOpacity" bg-color="transparent">
    <view class="exit-popup">
      <view class="exit-popup__content">
        <view class="coupon">
          <view class="coupon-price">
            <text>{{ props.minus }}<text class="unit">元</text></text>
          </view>
          <view class="coupon-name">{{ cardType[props.card] }}立减券</view>
        </view>
        <view class="btn" @click="closePopup">开心收下并支付</view>
        <view class="close" @click="goBack">
          <u-icon name="close" color="#333333" size="36rpx" bold />
        </view>
      </view>
      <image class="exit-popup__bg" :src="`${resourceUrl}exit_bg.png`" mode="widthFix" />
    </view>
  </u-popup>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  show: boolean
  mode: string
  overlay: boolean
  overlayOpacity: number
  minus: number
  card: string
}>(), {
  show: false,
  mode: 'center',
  overlay: true,
  overlayOpacity: 0.7,
  minus: 0,
  card: '',
})
const emits = defineEmits(['update:show', 'back'])
const cardType: Record<string, string> = {
  month: '月卡',
  halfyear: '半年卡',
  year: '年卡',
  huhang: '护航卡',
  chongci: '冲刺卡',
  lexue: '乐学卡',
}
const resourceUrl = 'https://fe-resource.haofenshu.com/member/'
function closePopup() {
  emits('update:show', false)
}

function goBack() {
  closePopup()
  emits('back')
}
</script>

<style lang="scss" scoped>
.exit-popup {
  position: relative;
  width: 530rpx;
  height: 100%;
  &__content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding-top: 348rpx;
    z-index: 1;
    .coupon {
      display: flex;
      align-items: center;
      width: 100%;
      height: 125rpx;
      padding-left: 42rpx;
      margin-bottom: 82rpx;
      &-price {
        width: 136rpx;
        height: 100%;
        color: #ff180b;
        font-size: 48rpx;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        .unit {
          font-size: 22rpx;
          font-weight: normal;
          margin-left: 2rpx;
        }
      }
      &-name {
        color: #6c4600;
        font-size: 32rpx;
        font-weight: 500;
        padding-left: 24rpx;
      }
    }
    .btn {
      position: relative;
      width: 366rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 30rpx;
      font-weight: bold;
      background: linear-gradient(225deg, #ff8813, #ff4026 100%);
      border: 2rpx solid #ffc427;
      border-radius: 56rpx;
      margin: 0 auto;
      &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: -4rpx;
        transform: translateX(-50%);
        width: 340rpx;
        height: 16rpx;
        opacity: 0.5;
        background: #ff3c00;
        filter: blur(8rpx);
      }
    }
    .close {
      position: absolute;
      top: 112rpx;
      right: 25rpx;
    }
  }
  &__bg {
    width: 530rpx;
  }
}
</style>
