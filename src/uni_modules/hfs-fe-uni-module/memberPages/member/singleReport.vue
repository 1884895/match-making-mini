<template>
  <view class="report">
    <view class="goods">
      <view class="goods-title">
        <image class="goods-title__icon" :src="`${resourceUrl}report_icon.png`" mode="widthFix" />
        <view class="goods-title__text">购买单次学情报告</view>
      </view>
      <view class="goods-content">
        <view class="goods-content__detail">
          <image class="avater" :src="`${resourceUrl}report_avater.png`" mode="widthFix" />
          <view class="info">
            <view class="info-title">考试名称: {{ examName }}</view>
            <view class="info-student">学生: {{ linkedStudent.studentName }}</view>
            <view class="info-tag">购买单次报告仅限查看本次考试</view>
          </view>
        </view>
        <view class="goods-content__footer">
          <view class="price">价格: {{ reportPrice }}学币</view>
          <view v-if="couponPrice > 0" class="price">优惠: {{ couponPrice }}</view>
          <view class="btn" @click="openPopup">购买学情报告</view>
        </view>
      </view>
    </view>
    <ShortToLong v-if="shortInfo.show" :from="shortFrom" :short-info="shortInfo" @abandon="shortInfo.show = false" @payment="shortInfo.show = false" />
    <OldUserDiscount v-else-if="upgradeInfo.upgrade" title="解锁全部考试学情报告" :upgrade-info="upgradeInfo" action="gm_xqbg" />
    <view v-else-if="showVip && !isMember" class="vip" @click="jumpVip">
      <view class="vip-btn">开通会员VIP更划算<text v-if="vipCoupon.discountValue > 0">立减￥{{ vipCoupon.discountValue }}</text></view>
    </view>
    <!-- 支付方式 -->
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay">
      <view class="pay">
        <view class="pay-content">
          <view class="pay-content__price">￥{{ isUseStudyCoin ? usedStudyPrice : realPrice }}</view>
          <view class="pay-content__coupon"><text v-if="couponPrice > 0">优惠券已抵扣{{ couponPrice }}学币</text></view>
          <view class="pay-content__list">
            <view v-for="(item, index) in payWayList" :key="index" class="list-item" @click="changePayThrough(item)">
              <image class="list-item__icon" :class="{ wechat: item.title === '微信支付' }" :src="`${resourceUrl}${payIcon[item.title as keyof typeof payIcon] || ''}`" mode="widthFix" />
              <view class="list-item__title">{{ item.title }}</view>
              <image class="list-item__selected" :src="payThrough === item.payThrough ? `${resourceUrl}select_round_active.png` : `${resourceUrl}select_round.png`" />
            </view>
            <view class="list-item coin">
              <image class="list-item__icon" :src="`${resourceUrl}xuebipay.png`" mode="widthFix" />
              <view class="list-item__title">学币余额: {{ studyCoin }}<text v-if="isUseStudyCoin">, 可用余额: {{ canUsedStudyCoin }}</text></view>
              <view class="list-item__switch">
                <up-switch v-model="isUseStudyCoin" active-color="#f56c6c" />
              </view>
            </view>
          </view>
          <view class="pay-content__btn" @click="confirmPay">确认支付</view>
        </view>
        <view class="pay-close">
          <u-icon class="close" name="close" color="#333" size="36rpx" bold @click="closePopup" />
        </view>
      </view>
    </u-popup>
    <Payment ref="payment" @success="paymentSuccess" @fail="paymentFail" />
  </view>
</template>

<script setup lang="ts">
import Payment from '../components/payment.vue'
import { deviceType, payThroughList } from './util.js'
import OldUserDiscount from './components/oldUserDiscount.vue'
import ShortToLong from './components/shortToLong.vue'
import { isHFSApp, isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

const resourceUrl = 'https://fe-resource.haofenshu.com/member/'
const shortFrom = ref<string>('singleReport')
const routeParams = ref<any>({})
const upgradeInfo = ref<any>({}) // 升级信息
const shortInfo = ref<any>({}) // 短期变长期信息
const coupon = ref<any>([]) // 学情报告优惠券
const vipCoupon = ref<any>([]) // VIP优惠券
const report = ref<any>({}) // 学情报告
const paymentInfo = ref<any>({}) // 支付信息
const popup = ref({ show: false, mode: 'bottom', overlay: true })
const payThrough = ref<any>(null) // 支付方式
const payIcon = { 微信支付: 'wechat_pay.png', 支付宝: 'alipay.png' }
const payment = ref<any>(null)
const isUseStudyCoin = ref(false) // 支付时是否使用学币

const prefix = computed(() => {
  let prefix = ''
  // #ifdef MP-WEIXIN
  prefix = '/v1/be-proxy'
  // #endif
  return prefix
})
const showVip = computed(() => {
  // #ifdef H5
  if (isHFSStudent()) {
    return false
  }
  // #endif
  return true
})
const examId = computed(() => routeParams.value.examId || '')
const examName = computed(() => routeParams.value.examName || '')
const userInfo = computed(() => uni.getStorageSync('userInfo') || getApp()?.globalData?.userInfo || {})
const linkedStudent = computed(() => userInfo.value.linkedStudent || {})
const isMember = computed(() => userInfo.value.isMember || false)
const payWayList = computed(() => payThroughList())
const reportPrice = computed(() => report.value?.price || 0) // 学情报告价格
const couponPrice = computed(() => coupon.value?.discountValue || 0)// 学情报告优惠券
const realPrice = computed(() => reportPrice.value - couponPrice.value > 0 ? reportPrice.value - couponPrice.value : 0)// 学情报告抵扣完优惠券价格
const studyCoin = computed(() => paymentInfo.value?.studyCoin || 0)
const usedStudyPrice = computed(() => realPrice.value > studyCoin.value ? realPrice.value - studyCoin.value : 0) // 使用学币后价格
const canUsedStudyCoin = computed(() => studyCoin.value >= realPrice.value ? realPrice.value : studyCoin.value) // 可以使用的学币数量

function openPopup() {
  popup.value.show = true
}

function closePopup() {
  popup.value.show = false
}

// 支付
async function confirmPay() {
  closePopup()
  const params = {
    examId: examId.value,
    goodNo: report.value.no,
    goodType: 10,
    payThrough: payThrough.value,
    studyCoinCount: isUseStudyCoin.value ? canUsedStudyCoin.value : 0,
    useStudyCoin: isUseStudyCoin.value ? 1 : 3,
    deviceType: deviceType(),
  }
  payment.value?.paymentVIP(params)
}

// 支付成功
function paymentSuccess() {
  uni.showToast({ title: '购买成功', icon: 'none' })
  init()
}

// 支付失败
function paymentFail(err: any) {
  uni.$u.toast(err.errMsg || err)
}

// 选择支付方式
function changePayThrough({ payThrough: payType = null }) {
  if (payThrough.value === payType)
    return
  payThrough.value = payType
}

function jumpVip() {
  // #ifdef MP-WEIXIN
  uni.navigateTo({ url: '/pages/me/member' })
  // #endif
  // #ifdef H5
  if (isHFSApp())
    return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, data: {} }))
  uni.navigateTo({ url: '/uni_modules/hfs-fe-uni-module/memberPages/member/member' })
  // #endif
}

// 获取分析报告商品
async function getGoods() {
  const res = await uni.$http.get(`${prefix.value}/v2/payments/goods/3rd-exams/${examId.value}`)
  const { goodList = [] } = res.data || []
  report.value = goodList.find((item: any) => item.no === 'pointMall-2001') || {}
}

// 获取学情报告优惠券列表
async function getCouponList() {
  const params = { goodType: 10, useStatus: 1, deviceType: deviceType() }
  const res = await uni.$http.get(`${prefix.value}/v2/payments/coupons/receives`, params, { custom: { loading: false, error: false } })
  const list = res.data || []
  coupon.value = list.find((item: any) => item.goodNo === report.value.no) || {}
}

// 获取VIP优惠券列表
async function getVipCouponList() {
  const params = { goodType: 1, useStatus: 1, deviceType: deviceType() }
  const res = await uni.$http.get(`${prefix.value}/v2/payments/coupons/receives`, params, { custom: { loading: false, error: false } })
  const list = res.data || []
  vipCoupon.value = list.find((item: any) => item.goodType === 1) || {}
}

// 获取持有的学币
async function getCoins() {
  const res = await uni.$http.get(`${prefix.value}/v2/user-center/payment-info`)
  paymentInfo.value = res.data || {}
}

// 获取短期变长期推荐
async function getShortRecommend() {
  const res = await uni.$http.get(`${prefix.value}/v3/strategy/recommend-goods`, { from: shortFrom.value }, { custom: { loading: false, error: false } })
  shortInfo.value = res.data || {}
}

// 获取小转大升级信息
async function getUpgrade() {
  const res = await uni.$http.get(`${prefix.value}/v2/payments/upgrade-popup`, {}, { custom: { loading: false, error: false } })
  upgradeInfo.value = res.data || {}
}

// 获取营销活动（按优先级）
async function getMarketingActivity() {
  const marketingStrategies = [
    {
      name: 'shortToLong', // 短期变长期
      fetch: getShortRecommend,
      check: () => shortInfo.value.show,
    },
    {
      name: 'upgrade', // 小转大
      fetch: getUpgrade,
      check: () => upgradeInfo.value.upgrade,
    },
    {
      name: 'vipCoupon', // 默认VIP
      fetch: getVipCouponList,
      check: () => true, // 总是返回true，作为兜底
    },
  ]

  for (const strategy of marketingStrategies) {
    await strategy.fetch()
    if (strategy.check())
      break
  }
}

async function init() {
  getGoods()
  getCoins()
  getCouponList()
  await getMarketingActivity()
  payThrough.value = payWayList.value[0]?.payThrough
  isUseStudyCoin.value = false
}

onLoad(async (options: any) => {
  routeParams.value = options
  init()
})
</script>

<style lang="scss" scoped>
.report {
  min-height: 100vh;
  background-color: #f6f6f6;
  padding-top: 24rpx;
  .goods {
    padding: 22rpx 40rpx;
    background: #ffffff;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    &-title {
      display: flex;
      align-items: center;
      margin-bottom: 18rpx;
      margin-left: -11rpx;
      &__icon {
        width: 56rpx;
        height: 56rpx;
        margin-right: 16rpx;
      }
      &__text {
        font-size: 30rpx;
        font-weight: bold;
        color: #333333;
      }
    }
    &-content {
      &__detail {
        display: flex;
        align-items: center;
        margin-bottom: 34rpx;
        .avater {
          width: 150rpx;
          height: 150rpx;
          margin-right: 24rpx;
          flex-shrink: 0;
        }
        .info {
          display: flex;
          flex-direction: column;
          max-width: 496rpx;
          &-title {
            font-size: 28rpx;
            font-weight: bold;
            color: #282423;
            margin-bottom: 8rpx;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          &-student {
            font-size: 24rpx;
            color: #333333;
            margin-bottom: 8rpx;
          }
          &-tag {
            background: #fff2f2;
            border-radius: 24rpx;
            padding: 6rpx 16rpx;
            font-size: 24rpx;
            color: #ff0000;
            margin-right: auto;
          }
        }
      }
      &__footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .price {
          font-size: 28rpx;
          color: #333333;
        }
        .btn {
          font-size: 28rpx;
          background-color: #ffba1d;
          color: #ffffff;
          padding: 6rpx 22rpx;
          border-radius: 40rpx;
        }
      }
    }
  }
  .vip {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    background-color: #ffffff;
    padding: 20rpx 28rpx calc(20rpx + env(safe-area-inset-bottom));
    border-radius: 24rpx 0 0 24rpx;
    box-shadow: 0 -4rpx 12rpx 0 rgba(0, 0, 0, 0.04);
    &-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 84rpx;
      background: linear-gradient(225deg, #ffa430 0%, #ff7426);
      border-radius: 42rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #ffffff;
    }
  }
  .pay {
    position: relative;
    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60rpx 60rpx calc(40rpx + env(safe-area-inset-bottom));
      &__price {
        font-size: 52rpx;
        color: #333333;
        text-align: center;
        font-weight: bold;
      }
      &__coupon {
        font-size: 24rpx;
        color: #ff0000;
        margin-bottom: 34rpx;
      }
      &__list {
        width: 100%;
        background: #ffffff;
        border-radius: 24rpx;
        margin-bottom: 120rpx;
        .list-item {
          height: 108rpx;
          display: flex;
          align-items: center;
          border-bottom: 1rpx solid #e6e6e6;
          &:last-child {
            border-bottom: 1rpx solid transparent;
          }
          &__icon {
            width: 48rpx;
            height: 48rpx;
            margin-right: 24rpx;
            &.wechat {
              width: 54rpx;
              height: 54rpx;
              margin-right: 18rpx;
            }
          }
          &__title {
            font-size: 28rpx;
            color: #333333;
            margin-right: 12rpx;
          }
          &__selected {
            width: 38rpx;
            height: 38rpx;
            margin-left: auto;
          }
          &__switch {
            margin-left: auto;
          }
        }
      }
      &__btn {
        width: 100%;
        height: 64rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #ffba1d;
        color: #ffffff;
        border-radius: 42rpx;
        margin-bottom: 12rpx;
        position: relative;
        &-text {
          font-size: 32rpx;
          font-weight: bold;
          color: #ffffff;
        }
      }
    }
    &-close {
      position: absolute;
      top: 40rpx;
      left: 20rpx;
    }
  }
}
</style>
