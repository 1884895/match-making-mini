<template>
  <!-- 短期变长期-页面内底部弹窗 -->
  <view v-if="!hideMember" class="short">
    <!-- 月度会员 -->
    <view v-if="memberType === 'month'" class="short-month">
      <image class="short-month__bg" :src="monthBg" mode="widthFix" />
      <view class="short-month__close" @click="handleClose"><up-icon class="close" name="close" color="#333" size="34rpx" bold /></view>
      <view v-if="stage === 'expiring'" class="short-month__invalid">倒计时：<text class="time">{{ invalidTime }}</text></view>
      <view class="short-month__content">
        <view class="goods">
          <view v-for="(item, index) in membership" :key="item.id" class="goods-item" :class="{ active: currentGood.no === item.no }" @click="goodClick(item)">
            <image v-if="index === 1" class="goods-item__tag" :src="`${resourceUrl}/month_hot.png`" mode="widthFix" />
            <view class="goods-item__name">{{ item.name }}</view>
            <view class="goods-item__price">
              <view class="price-cost">{{ item.cost }}<text class="unit">元</text></view>
              <view class="price-original">{{ item.original }}元</view>
            </view>
            <view class="goods-item__minus">{{ item.minus ? `立省 ${item.minus}` : '续费优惠' }}</view>
            <view class="goods-item__desc">{{ item.promotion_text }}</view>
          </view>
        </view>
        <view class="footer">
          <view class="footer-text" @click="paymentVIP">使用福利</view>
          <u-icon name="arrow-right" color="#FFFFFF" size="30rpx" />
        </view>
      </view>
    </view>

    <!-- 半年/季度/年度会员 -->
    <view v-else class="short-half">
      <image v-if="stage === 'expired'" class="short-half__bg" :src="`${resourceUrl}/half_expired_bg.png`" mode="widthFix" />
      <image v-else class="short-half__bg" :src="`${resourceUrl}/half_bg.png`" mode="widthFix" />
      <view class="short-half__close" @click="handleClose"><up-icon class="close" name="close" color="#333" size="34rpx" bold /></view>
      <view class="short-half__content">
        <view class="message">
          <!-- 在期 -->
          <view v-if="stage === 'active'" class="message-item">
            <view class="message-item__header">
              <image class="header-icon" :src="`${resourceUrl}/half_gift.png`" mode="widthFix" />
              <view class="header-title">恭喜获得续费【{{ currentGood.name }}】福利</view>
            </view>
            <view class="message-item__sub"><text v-if="currentGood.minus" class="red">立减{{ currentGood.minus }}元！</text>服务至：{{ currentGood.serviceTo }}</view>
            <view class="message-item__desc">
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/half_icon1.png`" mode="widthFix" />
                <view class="desc-item__text">服务期<text class="active">无限次</text>考试分析+考后提升方案</view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/half_icon2.png`" mode="widthFix" />
                <view v-if="currentGood.minus" class="desc-item__text">早续费早优惠<text class="light">(原价￥{{ currentGood.original }}→<text class="active">补贴价￥{{ currentGood.cost }}</text>)</text></view>
                <view v-else class="desc-item__text">早续费早优惠<text class="light">(<text class="active">补贴价￥{{ currentGood.cost }}</text>)</text></view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/half_icon3.png`" mode="widthFix" />
                <view class="desc-item__text"><view class="active">仅享 1 次</view>，补贴后低至 {{ currentGood.dayPriceNew }} 元/天</view>
              </view>
            </view>
          </view>
          <!-- 临期 -->
          <view v-if="stage === 'expiring'" class="message-item">
            <view class="message-item__header">
              <image class="header-icon" :src="`${resourceUrl}/half_gift.png`" mode="widthFix" />
              <view class="header-title">您的会员 {{ recommendation.daysRemaining }} 天后失效！</view>
            </view>
            <view class="message-item__sub">获得 <text class="red">{{ currentGood.cost }} 元</text>续费 <text class="red">{{ currentGood.name }}</text>限时福利！</view>
            <view class="message-item__desc">
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/half_icon1.png`" mode="widthFix" />
                <view class="desc-item__text">全年<text class="active">无限次</text>考试分析+考后提升方案</view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/half_icon2.png`" mode="widthFix" />
                <view v-if="currentGood.minus" class="desc-item__text">专享{{ currentGood.name }}优惠{{ currentGood.minus }}元福利<text class="light">(原价￥{{ currentGood.original }}→<text class="active">补贴价￥{{ currentGood.cost }}</text>)</text></view>
                <view v-else class="desc-item__text">专享{{ currentGood.name }}优惠福利<text class="light">(<text class="active">补贴价￥{{ currentGood.cost }}</text>)</text></view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/half_icon3.png`" mode="widthFix" />
                <view class="desc-item__text"><view class="active">仅享 1 次</view>，补贴后低至 {{ currentGood.dayPriceNew }} 元/天<view class="end">服务至{{ currentGood.serviceTo }}</view></view>
              </view>
            </view>
          </view>
          <!-- 过期 -->
          <view v-if="stage === 'expired'" class="message-item">
            <view class="message-item__header">
              <image class="header-icon" :src="`${resourceUrl}/half_gift.png`" mode="widthFix" />
              <view class="header-title">权限暂停通知，您的会员已过期！</view>
            </view>
            <view class="message-item__sub"><text class="red">成绩报告、错题导出等32项特权已关闭</text></view>
            <view class="message-item__desc">
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/half_icon1.png`" mode="widthFix" />
                <view class="desc-item__text">续费恢复<text class="active">32项会员特权</text></view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/half_icon2.png`" mode="widthFix" />
                <view v-if="currentGood.minus" class="desc-item__text">专享老用户限时续费补贴!<text class="light">(原价￥{{ currentGood.original }}→<text class="active">补贴价￥{{ currentGood.cost }}</text>)</text></view>
                <view v-else class="desc-item__text">专享老用户限时续费补贴!<text class="light">(<text class="active">补贴价￥{{ currentGood.cost }}</text>)</text></view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/half_icon3.png`" mode="widthFix" />
                <view class="desc-item__text"><view class="active">仅享 1 次</view>，补贴后低至 {{ currentGood.dayPriceNew }} 元/天</view>
              </view>
            </view>
          </view>
        </view>
        <view class="footer">
          <view class="btn cancel" @click="handleAbandon">放弃福利</view>
          <view class="btn confirm" @click="paymentVIP">使用补贴</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { isHFSApp, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

const props = withDefaults(defineProps<{
  shortInfo?: any
  from: string
}>(), {
  shortInfo: () => ({}),
})
// 事件定义
const emits = defineEmits(['close', 'payment', 'abandon'])
const resourceUrl = 'https://fe-resource.haofenshu.com/shortToLong'
const currentGood = ref<any>({})
const hasClicked = ref(false)
const membership = computed(() => props.shortInfo?.membership || [])
const recommendation = computed(() => props.shortInfo?.recommendation || {}) // 当前用户的会员类型、状态
const hideMember = computed(() => {
  const userInfo = uni.getStorageSync('userInfo') || getApp().globalData?.userInfo || {}
  return userInfo.hideMember || false
})

const stage = computed(() => recommendation.value?.stage as 'expired' | 'expiring' | 'active')
const memberType = computed(() => recommendation.value?.memberType as 'month' | 'halfYear' | 'jidu')
const isMonth = computed(() => memberType.value === 'month')
const monthBg = computed(() => {
  const bgMap = { expired: 'month_expired', expiring: 'month_expiring', active: 'month_active' }
  return `${resourceUrl}/${bgMap[stage.value]}.png`
})
const invalidTime = computed(() => {
  const duration = dayjs(recommendation.value.memberEnd).diff(dayjs(), 'hour')
  const day = Math.floor(duration / 24)
  const hour = duration % 24
  return `${day}天${hour}小时`
})
const beProxy = computed(() => {
  let prefix = ''
  // #ifdef MP-WEIXIN
  prefix = '/v1/be-proxy'
  // #endif
  return prefix
})

watch(
  () => props.shortInfo,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      const recommendGoods = newVal.membership?.find((item: any) => item.isRecommended)
      if (recommendGoods) {
        currentGood.value = recommendGoods
        hasClicked.value = false // 重置点击状态
      }
    }
  },
  { deep: true, immediate: true },
)

// 处理关闭
async function handleClose() {
  await orderAction(1)
  await closeAds()
  emits('close')
}

// 处理放弃
async function handleAbandon() {
  await orderAction(2)
  await closeAds()
  emits('abandon')
}

// 处理确认
function paymentVIP() {
  emits('payment')
  memberType.value && report('short_long', `${memberType.value}_popup`)
  const params = { activityType: 'shortToLong', goodNo: (isMonth.value && !hasClicked.value) ? undefined : currentGood.value.no }
  // #ifdef MP-WEIXIN
  uni.navigateTo({ url: `/pages/me/member${uni.$u.queryParams(params)}` })
  // #endif
  // #ifdef H5
  const url = `/uni_modules/hfs-fe-uni-module/memberPages/member/member${uni.$u.queryParams(params)}`
  if (isHFSApp())
    return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${window.location.origin}${url}`, data: {} }))
  uni.navigateTo({ url })
  // #endif
}

// 商品点击
function goodClick(item: any) {
  currentGood.value = item
  hasClicked.value = true
}

// 活动类用户反馈
async function orderAction(action: number) {
  const { product, memberType, stage } = recommendation.value
  const params = { product, memberType, stage, action }
  await uni.$http.post(`${beProxy.value}/v3/strategy/recommend-action`, params, { custom: { loading: false, error: false } })
}

// 记录当前模块点击次数
async function closeAds() {
  await uni.$http.post(`${beProxy.value}/v3/strategy/recommend-goods/close-ads`, { from: props.from }, { custom: { loading: false, error: false } })
}
</script>

<style lang="scss" scoped>
.short {
  background: #fff;
  width: 100%;
  padding-bottom: env(safe-area-inset-bottom);
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 9999;
  &-month {
    position: relative;
    &__bg {
      width: 100%;
      height: 410rpx;
    }
    &__close {
      padding: 20rpx;
      position: absolute;
      right: 0;
      top: 6rpx;
      transform: translateY(-100%);
    }
    &__invalid {
      position: absolute;
      top: 60rpx;
      right: 15rpx;
      font-size: 24rpx;
      color: #864400;
      .time {
        color: #ff0000;
      }
    }
    &__content {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      .goods {
        display: flex;
        width: 100%;
        height: 100%;
        padding: 120rpx 20rpx 96rpx;
        &-item {
          position: relative;
          width: 196rpx;
          height: 194rpx;
          margin-right: 24rpx;
          padding-top: 20rpx;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #ffffff;
          border-radius: 20rpx;
          transition: width 0.1s;
          &__tag {
            width: 142rpx;
            height: 36rpx;
            position: absolute;
            top: -16rpx;
            left: 0;
          }
          &__name {
            font-size: 24rpx;
            font-weight: bold;
            color: #333333;
            margin-bottom: 8rpx;
          }
          &__price {
            display: flex;
            align-items: baseline;
            margin-bottom: 4rpx;
            line-height: 40rpx;
            .price-cost {
              font-size: 40rpx;
              font-weight: Bold;
              color: #ff381b;
              margin-right: 4rpx;
              .unit {
                font-size: 24rpx;
                color: #5d3a0c;
              }
            }
            .price-original {
              font-size: 18rpx;
              text-decoration: line-through;
              color: #939393;
            }
          }
          &__minus {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 112rpx;
            height: 34rpx;
            background: #ffeae3;
            border-radius: 6rpx;
            font-size: 20rpx;
            color: #ff551d;
          }
          &__desc {
            position: absolute;
            bottom: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 32rpx;
            background: #f6f6f6;
            border-radius: 0 20rpx 20rpx 0;
            font-size: 16rpx;
            color: #976000;
          }
          &:last-child {
            margin-right: 0;
          }
          &.active {
            width: 268rpx;
            background: linear-gradient(163deg, #ffd401, #ffaa01 81%);
            border: 2rpx solid #ffc55f;
            padding-top: 26rpx;
            .goods-item__tag {
              width: 168rpx;
              height: 42rpx;
              position: absolute;
              top: -22rpx;
              left: 0;
            }
            .goods-item__name {
              font-size: 24rpx;
              font-weight: bold;
              color: #ffffff;
              margin-bottom: 0;
            }
            .goods-item__price {
              .price-cost {
                font-size: 48rpx;
                font-weight: bold;
                color: #ffffff;
                .unit {
                  font-size: 24rpx;
                  color: #ffffff;
                }
              }
              .price-original {
                font-size: 18rpx;
                color: #ffffff;
              }
            }
            .goods-item__minus {
              background: #ffffff;
              font-size: 20rpx;
              color: #ff0000;
            }
            .goods-item__desc {
              background: linear-gradient(225deg, #ffd766, #ffc55f);
              border-radius: 0 20rpx 20rpx 0;
              font-size: 20rpx;
              color: #976000;
            }
          }
        }
      }
      .footer {
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(315deg, #ffa430 0%, #ff7627);
        border: 2rpx solid #ffffff;
        border-radius: 40rpx;
        position: absolute;
        bottom: 18rpx;
        right: 16rpx;
        padding: 8rpx 20rpx 8rpx 34rpx;
        z-index: 10;
        &-text {
          font-size: 28rpx;
          font-weight: bold;
          color: #ffffff;
          margin-right: 6rpx;
        }
      }
    }
  }
  &-half {
    position: relative;
    &__bg {
      width: 100%;
      height: 390rpx;
    }
    &__close {
      padding: 20rpx;
      position: absolute;
      right: 0;
      top: 6rpx;
      transform: translateY(-100%);
    }
    &__content {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      padding: 14rpx 20rpx 12rpx;
      .message {
        &-item {
          &__header {
            display: flex;
            align-items: center;
            margin-bottom: 16rpx;
            .header-icon {
              width: 28rpx;
              height: 28rpx;
              margin-right: 10rpx;
            }
            .header-title {
              font-size: 26rpx;
              font-weight: bold;
              color: #864400;
              line-height: 1;
            }
          }
          &__sub {
            font-size: 26rpx;
            font-weight: bold;
            color: #864400;
            margin-bottom: 32rpx;
            line-height: 1;
            .red {
              color: #ff0000;
            }
          }
          &__desc {
            padding: 0 18rpx;
            .desc-item {
              display: flex;
              align-items: center;
              margin-bottom: 20rpx;
              &:last-child {
                margin-bottom: 0;
              }
              &__icon {
                width: 40rpx;
                height: 40rpx;
                margin-right: 8rpx;
                flex-shrink: 0;
              }
              &__text {
                line-height: 40rpx;
                display: flex;
                align-items: center;
                font-size: 26rpx;
                color: #70450f;
                flex-shrink: 0;
                .light {
                  font-size: 22rpx;
                  font-weight: bold;
                }
                .active {
                  font-size: 24rpx;
                  color: #ff0000;
                  font-weight: bold;
                }
                .end {
                  font-size: 22rpx;
                  color: #aa7526;
                  margin-left: 6rpx;
                }
              }
            }
          }
        }
      }
      .footer {
        width: 100%;
        position: absolute;
        bottom: 12rpx;
        left: 0;
        padding: 0 36rpx;
        display: flex;
        align-items: center;
        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 72rpx;
          border-radius: 40rpx;
          &.cancel {
            width: 224rpx;
            background: #f6f6f6;
            font-size: 32rpx;
            color: #939393;
            margin-right: 16rpx;
          }
          &.confirm {
            flex-grow: 1;
            background: linear-gradient(315deg, #ffa430 0%, #ff7627);
            border: 2rpx solid #ffffff;
            font-size: 32rpx;
            font-weight: bold;
            color: #ffffff;
          }
        }
      }
    }
  }
}
</style>
