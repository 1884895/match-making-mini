<template>
  <u-popup :show="props.show" :mode="popup.mode" :overlay="props.overlay" :overlay-opacity="props.overlayOpacity" bg-color="transparent" @open="reset">
    <view v-if="popup.type === 'success'" class="upgrade-popup">
      <view class="upgrade-popup__content">
        <view class="price" :class="{ vip: !isCard }">再付 <text class="active">{{ upGood.cost }}</text> 元</view>
        <template v-if="isCard">
          <view class="tips">每天仅需 <text class="active">{{ upGood.dayPrice }}</text> 元</view>
          <view class="date">现会员服务期至：{{ upgradeInfo.memberEnd }}，距毕业差：<text class="active">{{ upgradeInfo.days }} 天</text></view>
        </template>
        <view class="button">
          <view class="btn cancel" @click="cancel">放弃福利</view>
          <view class="btn confirm" @click="confirm">收下福利</view>
        </view>
      </view>
      <image class="upgrade-popup__bg" :src="`${resourceUrl}${isCard ? 'upgrade_end' : 'upgrade_vip'}.png`" mode="widthFix" />
    </view>
    <view v-if="popup.type === 'payment'" class="payment-popup">
      <view class="payment-popup__name">
        <image class="avatar" :src="props.avatar" mode="widthFix" />
        <view class="name">{{ props.name }}同学</view>
      </view>
      <view class="payment-popup__card">
        <view class="tag">限时升级福利</view>
        <view class="price">
          <view class="price-day"><text class="active">{{ upGood.goodName }}</text>差价</view>
          <view class="price-cost"><text class="active">{{ upGood.cost }}</text>元</view>
          <view class="price-original">{{ upGood.original }} 元</view>
        </view>
        <view v-if="isCard" class="desc">支付后会员服务可至<text class="active">{{ upgradeInfo.period }}毕业</text>，每天仅需 {{ upGood.dayPrice }} 元</view>
        <view v-else class="desc">支付后会员服务可延长至<text class="active"> 365 </text>天，每天不到 6 毛钱</view>
        <image class="crown" :src="`${resourceUrl}crown.png`" mode="widthFix" />
      </view>
      <view class="payment-popup__close" @click="goBack">
        <u-icon name="close" color="#333333" size="36rpx" bold />
      </view>
      <view class="payment-popup__btn">
        <view class="button" @click="paymentVIP">立即支付 {{ upGood.cost }} 元</view>
        <view class="tips" @click="openProtocol">
          支付即视为同意<text class="active">《会员协议》</text>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

const props = withDefaults(defineProps<{
  show: boolean
  overlay: boolean
  overlayOpacity: number
  avatar: string
  name: string
  upgradeInfo: any
}>(), {
  show: false,
  overlay: true,
  overlayOpacity: 0.7,
  avatar: '',
  name: '',
  upgradeInfo: {},
})

const emits = defineEmits(['update:show', 'payment', 'protocol', 'back'])
const resourceUrl = 'https://fe-resource.haofenshu.com/member/'
const popup = ref({
  mode: 'center',
  type: 'success',
})
const isCard = computed(() => props.upgradeInfo.upgradeType === 'card')
const upGood = computed(() => props.upgradeInfo.upGood || {})

function closePopup() {
  emits('update:show', false)
}

function paymentVIP() {
  closePopup()
  emits('payment', props.upgradeInfo.paymentId)
}

function cancel() {
  report('small_big', 'zh_sjtc_fq')
  goBack()
}

function goBack() {
  closePopup()
  emits('back')
}

function confirm() {
  report('small_big', 'zh_sjtc_qsj')
  popup.value = { type: 'payment', mode: 'bottom' }
}

function reset() {
  popup.value = { type: 'success', mode: 'center' }
}

function openProtocol() {
  emits('protocol')
}
</script>

<style lang="scss" scoped>
.upgrade-popup {
  position: relative;
  width: 562rpx;
  height: 100%;
  &__content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding-top: 276rpx;
    z-index: 1;
    .price {
      color: #5d230c;
      font-size: 28rpx;
      text-align: center;
      margin-bottom: 92rpx;
      &.vip {
        margin-bottom: 266rpx;
      }
      .active {
        color: #ff0000;
        font-size: 84rpx;
        font-weight: bold;
      }
    }
    .tips {
      color: #5d230c;
      font-size: 28rpx;
      text-align: center;
      margin-bottom: 44rpx;
      .active {
        color: #ff0000;
        font-size: 48rpx;
        font-weight: bold;
      }
    }
    .date {
      color: #ffffff;
      font-size: 22rpx;
      text-align: center;
      margin-bottom: 20rpx;
      .active {
        color: #fffd00;
        font-size: 24rpx;
        font-weight: bold;
      }
    }
    .button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 46rpx;
      .btn {
        width: 224rpx;
        height: 80rpx;
        font-size: 30rpx;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 56rpx;
      }
      .cancel {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.3);
      }
      .confirm {
        color: #333333;
        background: #ffda26;
      }
    }
  }
  &__bg {
    width: 562rpx;
  }
}
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
      width: 212rpx;
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
      position: relative;
      display: flex;
      align-items: baseline;
      margin: 0 auto 20rpx;
      z-index: 1;
      &-day {
        color: #70450f;
        font-size: 32rpx;
        font-weight: bold;
        margin-right: 170rpx;
        .active {
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
      width: 100%;
      position: absolute;
      left: 0;
      bottom: 20rpx;
      color: #a98959;
      font-size: 24rpx;
      text-align: center;
      z-index: 1;
      .active {
        color: #835b1d;
        font-weight: bold;
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
