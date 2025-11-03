<template>
  <!-- 短期变长期-购买学币、购买学情报告页面用 -->
  <view class="short">
    <view class="short-content">
      <!-- 头部用户信息 -->
      <view class="short-content__header">
        <image class="avatar" :src="`${resourceUrl}/report_icon.png`" mode="aspectFill" />
        <view class="info">
          <view class="info-nickname">HI～{{ studentInfo.studentName }}同学</view>
          <view class="info-expire">{{ formatTime(recommendation.memberEnd) }} 到期<u-icon name="arrow-right" size="24rpx" color="#999" /></view>
        </view>
      </view>

      <!-- 内容区 -->
      <view class="short-content__list">
        <!-- 月度 -->
        <template v-if="isMonth">
          <view class="list-item month">
            <image class="benefit" :src="`${resourceUrl}/${config.titleIcon}.png`" mode="heightFix" />
            <view class="title">
              <image class="title-icon" :src="`${resourceUrl}/${config.icon}.png`" mode="widthFix" />
              <text class="title-text">{{ config.monthTitle }}</text>
            </view>
            <view class="tips">{{ config.monthSubtitle }}</view>
            <view v-if="stage === 'expiring'" class="invalid">倒计时：<text class="time">{{ invalidTime }}</text></view>
            <view class="goods">
              <view v-for="(item, index) in membership" :key="item.no" class="goods-item" :class="{ active: currentGood.no === item.no }" @click="goodClick(item)">
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
          </view>
          <!-- 图标提醒 -->
          <view class="list-icons">
            <view class="list-icons__item">
              <image class="icon" :src="`${resourceUrl}/half_icon1.png`" mode="widthFix" />
              <view class="text">考后提升</view>
            </view>
            <view class="list-icons__item">
              <image class="icon" :src="`${resourceUrl}/half_icon2.png`" mode="widthFix" />
              <view class="text">超值优惠</view>
            </view>
            <view class="list-icons__item">
              <image class="icon" :src="`${resourceUrl}/half_icon3.png`" mode="widthFix" />
              <view class="text">早续费早优惠！</view>
            </view>
          </view>
        </template>

        <!-- 半年/季卡 -->
        <template v-else>
          <!-- 在期 -->
          <view v-if="stage === 'active'" class="list-item">
            <image class="benefit" :src="`${resourceUrl}/report_half_active.png`" mode="heightFix" />
            <view class="title">
              <text class="title-text">恭喜获得续费【{{ currentGood.name }}】福利</text>
            </view>
            <view class="sub">
              <text v-if="currentGood.minus" class="sub-desc">立减{{ currentGood.minus }}元！</text>
              <text class="sub-date">服务至：{{ currentGood.serviceTo }}</text>
            </view>
            <view class="card">
              <image class="card-bg" :src="`${resourceUrl}/report_half_bg.png`" mode="widthFix" />
              <image class="card-tag" :src="`${resourceUrl}/report_half_tips.png`" mode="widthFix" />
              <view class="card-info">
                <view class="card-info__line">
                  <image class="line-icon" :src="`${resourceUrl}/half_icon1.png`" mode="widthFix" />
                  <view class="line-text">服务期<text class="red big">无限次</text>考试分析+考后提升方案</view>
                </view>
                <view class="card-info__line">
                  <image class="line-icon" :src="`${resourceUrl}/half_icon2.png`" mode="widthFix" />
                  <view v-if="currentGood.minus" class="line-text">早续费早优惠<text class="small brown">(原价￥{{ currentGood.original }}→<text class="red">补贴价￥<text class="big">{{ currentGood.cost }}</text></text>)</text></view>
                  <view v-else class="line-text">早续费早优惠<text class="small brown">(<text class="red">补贴价￥<text class="big">{{ currentGood.cost }}</text></text>)</text></view>
                </view>
                <view class="card-info__line">
                  <image class="line-icon" :src="`${resourceUrl}/half_icon3.png`" mode="widthFix" />
                  <view class="line-text"><text class="red big">仅享 1 次</text><text v-if="currentGood?.dayPriceNew < 0.99">，补贴后低至 {{ currentGood.dayPriceNew }} 元/天</text></view>
                </view>
              </view>
            </view>
          </view>
          <!-- 临期 -->
          <view v-if="stage === 'expiring'" class="list-item">
            <image class="benefit" :src="`${resourceUrl}/report_half_active.png`" mode="heightFix" />
            <view class="title">
              <text class="title-text">您的会员 {{ recommendation.daysRemaining }} 天后失效！</text>
            </view>
            <view class="sub">
              <text class="sub-desc">获得 {{ currentGood.cost }} 元续费 {{ currentGood.name }}限时福利！</text>
            </view>
            <view class="card">
              <image class="card-bg" :src="`${resourceUrl}/report_half_bg.png`" mode="widthFix" />
              <image class="card-tag" :src="`${resourceUrl}/report_half_tips.png`" mode="widthFix" />
              <view class="card-info">
                <view class="card-info__line">
                  <image class="line-icon" :src="`${resourceUrl}/half_icon1.png`" mode="widthFix" />
                  <view class="line-text">全年<text class="red big">不限次</text>考试分析+考后提升方案</view>
                </view>
                <view class="card-info__line">
                  <image class="line-icon" :src="`${resourceUrl}/half_icon2.png`" mode="widthFix" />
                  <view v-if="currentGood.minus" class="line-text">专享{{ currentGood.name }}优惠{{ currentGood.minus }}元福利<text class="small brown">(原价￥{{ currentGood.original }}→<text class="red">补贴价￥<text class="big">{{ currentGood.cost }}</text></text>)</text></view>
                  <view v-else class="line-text">专享{{ currentGood.name }}优惠福利<text class="small brown">(<text class="red">补贴价￥<text class="big">{{ currentGood.cost }}</text></text>)</text></view>
                </view>
                <view class="card-info__line">
                  <image class="line-icon" :src="`${resourceUrl}/half_icon3.png`" mode="widthFix" />
                  <view class="line-text"><text class="red big">仅享 1 次</text><text v-if="currentGood?.dayPriceNew < 0.99">，补贴后低至 {{ currentGood.dayPriceNew }} 元/天</text></view>
                </view>
              </view>
            </view>
          </view>
          <!-- 过期 -->
          <view v-if="stage === 'expired'" class="list-item">
            <image class="benefit" :src="`${resourceUrl}/report_half_old.png`" mode="heightFix" />
            <view class="title">
              <text class="title-text">权限暂停通知，您的会员已过期！</text>
            </view>
            <view class="sub">
              <text class="sub-desc">成绩报告、错题导出等32项特权已关闭</text>
            </view>
            <view class="card">
              <image class="card-bg" :src="`${resourceUrl}/report_half_bg.png`" mode="widthFix" />
              <image class="card-tag" :src="`${resourceUrl}/report_half_tips.png`" mode="widthFix" />
              <view class="card-info">
                <view class="card-info__line">
                  <image class="line-icon" :src="`${resourceUrl}/half_icon1.png`" mode="widthFix" />
                  <view class="line-text">续费恢复<text class="red big">32项会员特权</text></view>
                </view>
                <view class="card-info__line">
                  <image class="line-icon" :src="`${resourceUrl}/half_icon2.png`" mode="widthFix" />
                  <view v-if="currentGood.minus" class="line-text">专享老用户限时续费补贴！<text class="small brown">(原价￥{{ currentGood.original }}→<text class="red">补贴价￥<text class="big">{{ currentGood.cost }}</text></text>)</text></view>
                  <view v-else class="line-text">专享老用户限时续费补贴！<text class="small brown">(<text class="red">补贴价￥<text class="big">{{ currentGood.cost }}</text></text>)</text></view>
                </view>
                <view class="card-info__line">
                  <image class="line-icon" :src="`${resourceUrl}/half_icon3.png`" mode="widthFix" />
                  <view class="line-text"><text class="red big">仅享 1 次</text><text v-if="currentGood?.dayPriceNew < 0.99">，补贴后低至 {{ currentGood.dayPriceNew }} 元/天</text></view>
                </view>
              </view>
            </view>
          </view>
        </template>

        <!-- 按钮区 -->
        <view class="list-btns">
          <view v-if="memberType === 'halfYear' || memberType === 'jidu'" class="list-btns__abandon" @click="handleAbandon">{{ config.abandonText }}</view>
          <view class="list-btns__confirm" @click="paymentVIP">{{ isMonth ? '使用福利' : config.confirmText }}</view>
        </view>

        <!-- 协议提示 -->
        <view class="list-agreement">
          支付即视为同意<text class="link" @click="handleAgreement">《会员协议》</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { isHFSApp, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

const props = withDefaults(defineProps<{
  shortInfo?: any
  from: string
}>(), {
  shortInfo: () => ({}),
})
const emit = defineEmits(['abandon', 'payment'])
const resourceUrl = 'https://fe-resource.haofenshu.com/shortToLong'
const currentGood = ref<any>({})
const hasClicked = ref(false)
const userInfo = computed(() => uni.getStorageSync('userInfo') || getApp()?.globalData?.userInfo || {})
const studentInfo = computed(() => userInfo.value.linkedStudent || {})
const membership = computed(() => props.shortInfo?.membership || [])
const recommendGoods = computed(() => membership.value.find((item: any) => item.isRecommended) || {})

const recommendation = computed(() => props.shortInfo?.recommendation || {}) // 当前用户的会员类型、状态
const memberType = computed(() => recommendation.value?.memberType) // 会员类型 halfYear:半年会员，jidu:季度会员，month:月度会员
const isMonth = computed(() => memberType.value === 'month')
const stage = computed(() => recommendation.value?.stage) // 会员状态 active:在期，expiring：临期 expired:过期
// 会员文案
const config = computed(() => {
  const textMap: any = {
    active: { abandonText: '放弃福利', confirmText: '使用福利', icon: 'report_month_active', monthTitle: '大考小考，陪你进步陪你赢', monthSubtitle: '老用户续费福利来袭！', titleIcon: 'report_half_active' },
    expiring: { abandonText: '放弃补贴', confirmText: '使用补贴', icon: 'report_month_expiring', monthTitle: '您的会员即将到期！', monthSubtitle: '老用户续费福利来袭！', titleIcon: 'report_half_active' },
    expired: { abandonText: '忍痛放弃', confirmText: '使用补贴', icon: 'report_month_expired', monthTitle: '您的会员权益已失效！', monthSubtitle: '续费即可恢复权益！', titleIcon: 'report_half_old' },
  }
  return textMap[stage.value] || {}
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
onMounted(() => {
  currentGood.value = recommendGoods.value
})

function formatTime(time: any) {
  return dayjs(time).format('YYYY-MM-DD')
}

// 商品点击
function goodClick(item: any) {
  currentGood.value = item
  hasClicked.value = true
}

// 处理放弃
async function handleAbandon() {
  emit('abandon')
  closeAds()
}

// 记录当前模块点击次数
async function closeAds() {
  await uni.$http.post(`${beProxy.value}/v3/strategy/recommend-goods/close-ads`, { from: props.from }, { custom: { loading: false, error: false } })
}

// 处理确认
function paymentVIP() {
  emit('payment')
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

// 处理协议点击
function handleAgreement() {
  let url = '/pages/agreement/index'
  // #ifdef MP-WEIXIN
  url = `/pages/webview/webview?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}`)}`
  // #endif
  // #ifdef H5
  if (isHFSApp()) {
    return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${window.location.origin}${url}` }))
  }
  // #endif
  return uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.short {
  width: 100%;
  overflow: hidden;
  &-content {
    background: #ffffff;
    &__header {
      width: 100%;
      height: 180rpx;
      padding: 18rpx 28rpx 82rpx;
      display: flex;
      align-items: center;
      background: #fffde5;
      border: 2rpx solid #ffffff;
      border-radius: 24rpx 12rpx 12rpx 24rpx;
      .avatar {
        width: 56rpx;
        height: 56rpx;
        border-radius: 50%;
        margin-right: 22rpx;
      }
      .info {
        &-nickname {
          font-size: 32rpx;
          color: #333333;
          font-weight: bold;
        }
        &-expire {
          display: flex;
          align-items: center;
          font-size: 26rpx;
          color: #939393;
          margin-right: 4rpx;
        }
      }
    }
    &__list {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(135deg, #fff8df, #feecb5 100%);
      border: 2rpx solid #ffffff;
      border-radius: 24rpx 24rpx 0 0;
      padding: 0 14rpx 22rpx;
      margin-top: -72rpx;
      position: relative;
      .list-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 60rpx;
        &.month {
          margin-bottom: 52rpx;
          .benefit {
            margin-bottom: 16rpx;
          }
          .title {
            margin-bottom: 16rpx;
          }
        }
        .benefit {
          width: 272rpx;
          height: 66rpx;
          margin-bottom: 30rpx;
        }
        .title {
          display: flex;
          align-items: center;
          margin-bottom: 22rpx;
          &-icon {
            width: 44rpx;
            height: 44rpx;
            margin-right: 10rpx;
          }
          &-text {
            font-size: 32rpx;
            font-weight: bold;
            line-height: 1;
            color: #864400;
          }
        }
        .invalid {
          position: absolute;
          top: 192rpx;
          right: 16rpx;
          font-size: 26rpx;
          color: #ff0000;
        }
        .sub {
          margin-bottom: 46rpx;
          &-desc {
            font-size: 28rpx;
            color: #ff0000;
          }
          &-date {
            font-size: 28rpx;
            color: #864400;
          }
        }
        .card {
          position: relative;
          &-bg {
            width: 722rpx;
            height: 322rpx;
          }
          &-tag {
            width: 210rpx;
            height: 130rpx;
            position: absolute;
            top: -24rpx;
            right: -12rpx;
            z-index: 10;
          }
          &-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 20;
            padding: 18rpx 30rpx 50rpx;
            &__line {
              display: flex;
              align-items: center;
              padding: 30rpx 0 14rpx;
              border-bottom: 1rpx dashed #d6c539;
              .line-icon {
                width: 40rpx;
                height: 40rpx;
                margin-right: 12rpx;
                flex-shrink: 0;
              }
              .line-text {
                font-size: 26rpx;
                color: #70450f;
                white-space: nowrap;
                .red {
                  font-weight: bold;
                  color: #ff0000;
                  white-space: nowrap;
                }
                .brown {
                  color: #aa7526;
                  white-space: nowrap;
                }
                .small {
                  font-size: 22rpx;
                  white-space: nowrap;
                }
                .big {
                  font-size: 24rpx;
                  white-space: nowrap;
                }
              }
            }
          }
        }
        .tips {
          font-size: 28rpx;
          color: #864400;
          margin-bottom: 58rpx;
        }
        .goods {
          display: flex;
          width: 100%;
          height: 100%;
          padding: 0 6rpx;
          &-item {
            position: relative;
            width: 196rpx;
            height: 238rpx;
            margin-right: 24rpx;
            padding-top: 40rpx;
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
              margin-bottom: 14rpx;
            }
            &__price {
              display: flex;
              align-items: baseline;
              margin-bottom: 18rpx;
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
              padding-top: 36rpx;
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
                margin-bottom: 8rpx;
              }
              .goods-item__price {
                margin-bottom: 14rpx;
                .price-cost {
                  font-size: 48rpx;
                  font-weight: bold;
                  color: #ffffff;
                  margin-right: 8rpx;
                  .unit {
                    font-size: 24rpx;
                    color: #ffffff;
                    font-weight: 400;
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
      }
      .list-icons {
        display: flex;
        justify-content: space-between;
        padding: 0 44rpx;
        margin-bottom: 58rpx;
        &__item {
          display: flex;
          align-items: center;
          .icon {
            width: 40rpx;
            height: 40rpx;
            margin-right: 12rpx;
          }
          .text {
            font-size: 26rpx;
            color: #333333;
          }
        }
      }
      .list-btns {
        width: 100%;
        padding: 0 22rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;
        &__abandon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 224rpx;
          height: 84rpx;
          background: rgba(255, 122, 39, 0.2);
          border-radius: 40rpx;
          margin-right: 22rpx;
          font-size: 32rpx;
          color: #ff7a27;
        }
        &__confirm {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
          height: 84rpx;
          background: linear-gradient(225deg, #ffa430 0%, #ff7426);
          border-radius: 42rpx;
          font-size: 32rpx;
          font-weight: bold;
          color: #ffffff;
        }
      }

      .list-agreement {
        font-size: 22rpx;
        color: #333333;
        .link {
          color: #ff0000;
        }
      }
    }
  }
}
</style>
