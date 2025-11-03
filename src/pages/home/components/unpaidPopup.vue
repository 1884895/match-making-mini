<template>
  <u-popup :show="props.show" mode="center" bg-color="transparent" @touchmove.stop.prevent>
    <view v-if="cardType === 'unpaid'" class="unpaid">
      <image class="unpaid-clock" :src="`${resourceUrl}/unpay_clock.png`" mode="widthFix" />
      <view class="unpaid-content">
        <image class="unpaid-content__title" :src="`${resourceUrl}/unpay_title.png`" mode="widthFix" />
        <view class="unpaid-content__detail">
          <image class="bg" :src="`${resourceUrl}/unpay_bg.png`" mode="widthFix" />
          <view class="info">
            <view class="info-name">{{ degradeInfo.name }}</view>
            <view class="info-price">
              <view class="info-price__cost">￥<text class="active">{{ degradeInfo.cost }}</text></view>
              <view v-if="degradeInfo.minus > 0" class="info-price__minus">｜可省 <text class="active">{{ degradeInfo.minus }}</text> 元</view>
            </view>
          </view>
        </view>
        <view class="btns">
          <view class="btns-item" @click="handleCancel">取消支付</view>
          <view class="btns-item btns-once" @click="handlePayment">立即支付</view>
        </view>
      </view>
    </view>
    <view v-else class="degrade" :class="{ [cardType]: degradeInfo.degradeType === 0 }">
      <image class="degrade-bg" :src="`${resourceUrl}${degradeInfo.degradeType === 0 ? `/unpay_${cardType}.png` : '/unpay_butie.png'}`" mode="widthFix" />
      <view class="degrade-content">
        <view class="degrade-content__header" :class="{ month: cardType === 'month' || cardType === 'week', subsidy: degradeInfo.degradeType }">
          <view class="name">{{ degradeInfo.name }}</view>
          <view v-if="cardType === 'month' || cardType === 'week'" class="tips">32 项会员功能全开放</view>
        </view>
        <view class="degrade-content__detail">
          <view class="origin">
            <view class="origin-label">{{ degradeInfo.degradeType ? '原订单价' : '原价' }}</view>
            <view class="origin-value">{{ degradeInfo.original }}<text class="unit">元</text></view>
          </view>
          <view class="minus">立减{{ degradeInfo.minus }}元</view>
          <view class="cost">
            <view class="cost-label">现补贴价</view>
            <view class="cost-value">{{ degradeInfo.cost }}<text class="unit">元</text></view>
            <view class="cost-tag">限时补贴 {{ degradeInfo.degradeType ? '10%' : `${degradeInfo.minus}元` }}</view>
          </view>
        </view>
        <view class="degrade-content__message">
          <view v-if="degradeInfo.degradeType" class="countdown">
            <view v-if="isFinish" class="countdown-text">已取消</view>
            <template v-else>
              <image class="countdown-clock" :src="`${resourceUrl}/unpay_cutdown_icon.png`" mode="widthFix" />
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
          <template v-else>
            <view v-if="degradeInfo.dayPrice < 0.99" class="notice">仅享 <text class="active">1</text> 次，低至 <text class="active">{{ degradeInfo.dayPrice }}</text> 元/天</view>
          </template>
        </view>
        <view class="btns">
          <view class="btns-item" @click="handleCancel">{{ degradeInfo.degradeType ? '放弃补贴' : '忍痛放弃' }}</view>
          <view class="btns-item btns-once" @click="handlePayment">立即支付</view>
        </view>
      </view>
    </view>
    <view class="close" :class="{ closeTop: cardType === 'unpaid' }" @click="handleClose"><up-icon class="close" name="close" color="#fff" size="40rpx" bold /></view>
  </u-popup>
</template>

<script setup lang="ts">
import { formatNumber } from '@/uni_modules/hfs-fe-uni-plugins'

const props = withDefaults(defineProps<{
  show: boolean
  degradeInfo: any
}>(), {
  show: false,
  degradeInfo: {},
})
const emits = defineEmits(['close', 'update:show'])
const resourceUrl = `${feConfig.resourceUrl}/images/`
const timeData = ref({ hours: 0, minutes: 0, seconds: 0 })
const isFinish = ref(false)

const degradeInfo = computed(() => props.degradeInfo)
const cardType = computed(() => {
  const { isDegrade, degradeType, isNew, cardType: type } = degradeInfo.value
  const isUnpaid = (isDegrade === false && degradeType === 0) || isNew
  return isUnpaid ? 'unpaid' : type
})

// 倒计时
function onChange(e: any) {
  timeData.value = e
};

function handleClose() {
  unpaidReport(1)
  orderAction(cardType.value === 'unpaid' ? 2 : 1)
  emits('close')
}

function handleCancel() {
  unpaidReport(2)
  orderAction(2)
  emits('close')
}

function handlePayment() {
  emits('update:show', false)
  const { id, cid } = degradeInfo.value
  uni.navigateTo({ url: `/pages/me/member${uni.$u.queryParams({ unpayId: id, cid })}` })
}

// 待支付弹窗-用户反馈
async function orderAction(action: number) {
  const { id, degradeType, degradeLevel } = degradeInfo.value
  const params = { id, action, degradeType, degradeLevel }
  return await uni.$http.post('/v1/be-proxy/v2/payments/order-action', params, { custom: { loading: false, error: false } })
}

// 埋点
function unpaidReport(action: number) {
  if (Object.keys(degradeInfo.value).length === 0)
    return
  const { degradeType, degradeLevel, cardType, cid } = degradeInfo.value
  const params = {
    cardType, // 特殊的cardType 支付页：payPage  >=5时 action=4    <5时action=5   会员挽留cardType=vipWanliu
    action, // 1：关闭广告  2：放弃  3：支付
    degradeType,
    degradeLevel,
    cid,
  }
  uni.$http.post('/v1/be-proxy/v3/action/unpay-degrade', params, { custom: { loading: false, error: false } })
}
</script>

<style lang="scss" scoped>
.unpaid {
  display: flex;
  flex-direction: column;
  align-items: center;
  &-clock {
    width: 212rpx;
    height: 144rpx;
    position: relative;
    z-index: 2;
  }
  &-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 554rpx;
    background: linear-gradient(180deg, #d2faff, #fcfffd);
    border: 2rpx solid #ffffff;
    border-radius: 44rpx;
    padding: 88rpx 28rpx 34rpx;
    margin-top: -88rpx;
    position: relative;
    z-index: 1;
    &__title {
      width: 394rpx;
      height: 42rpx;
      margin-bottom: 38rpx;
    }
    &__detail {
      width: 100%;
      position: relative;
      margin-bottom: 34rpx;
      .bg {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
      }
      .info {
        padding: 30rpx 36rpx 22rpx;
        position: relative;
        z-index: 3;
        &-name {
          font-size: 36rpx;
          font-weight: bold;
          color: #9b4f00;
        }
        &-price {
          display: flex;
          align-items: baseline;
          &__cost {
            font-size: 28rpx;
            font-weight: bold;
            color: #9b4f00;
            .active {
              font-size: 56rpx;
              color: #ff0000;
            }
          }
          &__minus {
            font-size: 32rpx;
            color: #9b4f00;
            .active {
              font-weight: bold;
              color: #ff0000;
            }
          }
        }
      }
    }
  }
}
.degrade {
  position: relative;
  &-bg {
    width: 570rpx;
    height: 710rpx;
  }
  &-content {
    width: 100%;
    height: 100%;
    padding: 124rpx 36rpx 32rpx;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    &__header {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 104rpx;
      padding: 0 28rpx;
      margin-bottom: 50rpx;
      .name {
        font-size: 48rpx;
        font-weight: bold;
        color: #ff0000;
      }
      .tips {
        font-size: 24rpx;
        color: #333333;
        margin-top: 6rpx;
      }
      &.subsidy {
        padding-top: 24rpx;
      }
    }
    &__detail {
      position: relative;
      display: flex;
      margin-bottom: 30rpx;
      .origin {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 170rpx;
        height: 166rpx;
        flex-shrink: 0;
        &-label {
          opacity: 0.7;
          font-size: 28rpx;
          font-weight: bold;
          color: #333333;
          margin-bottom: 8rpx;
        }
        &-value {
          opacity: 0.7;
          font-size: 44rpx;
          font-weight: bold;
          color: #ff0000;
          .unit {
            font-size: 28rpx;
            color: #333333;
            margin-left: 8rpx;
          }
        }
      }
      .minus {
        position: absolute;
        top: 20rpx;
        left: 148rpx;
        font-size: 24rpx;
        font-weight: bold;
        color: #ffffff;
        flex-shrink: 0;
        transform: rotate(26deg);
      }
      .cost {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 314rpx;
        height: 214rpx;
        flex-shrink: 0;
        margin-left: 18rpx;
        position: relative;
        &-label {
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
          margin-top: 40rpx;
        }
        &-value {
          font-size: 76rpx;
          font-weight: bold;
          color: #ff0000;
          .unit {
            font-size: 28rpx;
            color: #333333;
            margin-left: 8rpx;
          }
        }
        &-tag {
          height: 36rpx;
          display: flex;
          align-items: center;
          position: absolute;
          top: 0;
          right: 8rpx;
          font-size: 22rpx;
          font-weight: bold;
          color: #ffffff;
        }
      }
    }
    &__message {
      display: flex;
      justify-content: center;
      .countdown {
        margin-bottom: 32rpx;
        display: flex;
        align-items: center;
        &-clock {
          width: 30rpx;
          height: 34rpx;
          margin-right: 12rpx;
        }
        &-time {
          display: flex;
          align-items: center;
          margin-right: 8rpx;
          &__count {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44rpx;
            height: 36rpx;
            font-size: 30rpx;
            font-weight: bold;
            color: #004aff;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 4rpx;
          }
          &__doc {
            font-size: 30rpx;
            font-weight: bold;
            color: #004aff;
            margin: 0 6rpx;
          }
        }
        &-text {
          font-size: 30rpx;
          color: #333333;
        }
      }
      .notice {
        height: 48rpx;
        margin-bottom: 28rpx;
        font-size: 30rpx;
        color: #333333;
        .active {
          font-size: 34rpx;
          font-weight: bold;
          color: #ff0000;
        }
      }
    }
  }
}
.year {
  .degrade-content {
    padding: 110rpx 36rpx 32rpx;
    &__header {
      margin-bottom: 68rpx;
    }
    &__detail {
      .minus {
        top: 22rpx;
        left: 156rpx;
      }
      .cost {
        &-tag {
          right: 8rpx;
        }
      }
    }
  }
}
.halfyear {
  .degrade-content {
    padding: 106rpx 36rpx 32rpx;
    &__header {
      margin-bottom: 64rpx;
    }
    &__detail {
      .minus {
        left: 154rpx;
      }
      .cost {
        width: 304rpx;
      }
    }
  }
}
.month {
  .degrade-content {
    &__header {
      margin-bottom: 64rpx;
    }
    &__detail {
      .minus {
        top: 22rpx;
      }
    }
  }
}
.week {
  .degrade-content {
    &__header {
      margin-bottom: 64rpx;
    }
    &__detail {
      .minus {
        top: 24rpx;
        left: 144rpx;
      }
    }
  }
}
.close {
  position: absolute;
  top: -54rpx;
  right: 20rpx;
  &.closeTop {
    top: -26rpx;
  }
}
.btns {
  display: flex;
  width: 100%;
  justify-content: space-between;
  .btns-item {
    width: calc(50% - 8rpx);
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: #333333;
    background: #f6f6f6;
    border-radius: 40rpx;
    border: 2rpx solid #f6f6f6;
  }
  .btns-once {
    color: #ffffff;
    font-weight: bold;
    background: linear-gradient(315deg, #fe4d88 0%, #fe3d3c 49%, #fc9535);
    border: 2rpx solid #ffffff;
  }
}
</style>
