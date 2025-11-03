<template>
  <u-popup :show="props.show" mode="center" bg-color="transparent" @touchmove.stop.prevent>
    <view v-if="memberType === 'month' || memberType === 'halfYear' || memberType === 'jidu'" class="short">
      <image v-if="shortBg" class="short-bg" :src="shortBg" mode="widthFix" />
      <view class="short-content">
        <view v-if="isMonth" class="short-content__month">
          <view class="month-info">
            <view class="minus">最高立减 <text class="minus-value">{{ recommendGoods.minus }}</text> 元</view>
          </view>
          <view class="month-footer">
            <view v-if="stage === 'expiring'" class="month-footer__tag month-footer__end"><text class="red nowarp">{{ invalidTime }}</text><text class="nowarp">后失效</text></view>
            <image v-if="stage === 'expired'" class="month-footer__tag" :src="`${resourceUrl}month_guoqi_tag.png`" mode="widthFix" />
            <image class="month-footer__item" :src="`${resourceUrl}month_btn.png`" mode="widthFix" @click="paymentVIP" />
          </view>
        </view>
        <view v-else class="short-content__half">
          <view class="half-info">
            <view class="name" :class="{ right: recommendGoods?.name?.length > 4 }">可超值升级至<text class="red">{{ recommendGoods.name }}</text></view>
            <view class="time">服务至：{{ recommendGoods.serviceTo }}</view>
            <view v-if="recommendGoods.minus > 0" class="price">
              <view class="price-original">
                <view class="price-original__text">
                  <text class="unit">¥</text>
                  <text class="value">{{ recommendGoods.original }}</text>
                  <view class="line" />
                </view>
              </view>
              <view class="price-subsidy" :class="{ active: recommendGoods.minus > 99 }">补贴<text class="value">{{ recommendGoods.minus }}</text>元</view>
              <view class="price-cost">
                <view class="price-cost__text" :class="{ active: recommendGoods.cost > 99 }">
                  <text class="unit">¥</text>{{ recommendGoods.cost }}
                </view>
              </view>
            </view>
            <view v-else class="cost"><text class="unit">¥</text>{{ recommendGoods.cost }}</view>
          </view>
          <view class="half-footer">
            <image class="half-footer__tag" :src="`${resourceUrl}only_one.png`" mode="widthFix" />
            <image class="half-footer__item" :src="`${resourceUrl}${stage === 'expired' ? 'half_abandon__expired.png' : 'half_abandon.png'}`" mode="widthFix" @click="handleAbandon" />
            <image class="half-footer__item" :src="`${resourceUrl}half_pay.png`" mode="widthFix" @click="paymentVIP" />
          </view>
        </view>
      </view>
      <view class="short-close" @click="handleClose"><up-icon class="close" name="close" color="#fff" size="40rpx" bold /></view>
    </view>
    <view v-if="memberType === 'year'" class="report">
      <template v-if="stage === 'expired'">
        <image class="report-close" :src="`${resourceUrl}year_home_close.png`" mode="widthFix" @click="handleClose" />
        <image class="report-bg" :src="`${resourceUrl}year_guoqi.png`" mode="widthFix" />
        <view class="report-content">
          <image v-if="recommendation.isFirstLogin" class="report-content__title" :src="`${resourceUrl}year_first_title.png`" mode="heightFix" />
          <image v-else class="report-content__title" :src="`${resourceUrl}year_more_title.png`" mode="heightFix" />
          <view class="report-content__score">
            <view v-if="raiseInfo.baseRaiseScore || raiseInfo.hardRaiseScore" class="improve">
              <view class="improve-text">
                发现<text class="value">{{ raiseInfo.baseRaiseScore || raiseInfo.hardRaiseScore }}分</text>{{ raiseInfo.baseRaiseScore ? "基础" : '拔高' }}提升空间
              </view>
              <image class="improve-icon" :src="`${resourceUrl}year_up.png`" mode="widthFix" />
            </view>
            <view v-if="raiseInfo.level && levelText[raiseInfo.level]" class="tips">
              <view class="tips-text">{{ levelText[raiseInfo.level].text1 }}</view>
              <image class="tips-line" :src="`${resourceUrl}year_line.png`" mode="widthFix" />
            </view>
          </view>
          <view class="report-content__good">
            <image class="good-icon" :src="`${resourceUrl}year_discount.png`" mode="widthFix" />
            <image class="good-star" :src="`${resourceUrl}year_star.png`" mode="widthFix" />
            <view class="good-stage">会员已过期</view>
            <view class="good-minus">马上续费<text class="active">立减¥{{ recommendGoods.minus }}</text></view>
            <view class="good-name">限{{ recommendGoods.name }}</view>
            <view class="good-line" />
            <view class="good-price">
              <view class="original">原价 <text class="value"><text class="unit">¥</text>{{ recommendGoods.original }}</text></view>
              <image class="right" :src="`${resourceUrl}year_right.png`" mode="widthFix" />
              <view class="cost">补贴价<text class="value"><text class="unit">¥</text>{{ recommendGoods.cost }}</text></view>
            </view>
          </view>
          <view class="report-content__btn" @click="paymentVIP">立即续费查看完整报告</view>
        </view>
      </template>
      <view v-else-if="stage.startsWith('expiring')" class="report-expiring">
        <image class="report-expiring__close" :src="`${resourceUrl}year_home_close.png`" mode="widthFix" @click="handleClose" />
        <image v-if="shortBg" class="report-expiring__bg" :src="shortBg" mode="widthFix" />
        <image class="report-expiring__talk" :src="talkImg" mode="heightFix" />
        <image v-if="recommendation.isFirstLogin" class="report-expiring__icon" :src="`${resourceUrl}${firstLoginInfo.icon}`" mode="heightFix" />
        <image class="report-expiring__bird" :class="{ first: recommendation.isFirstLogin }" :src="`${resourceUrl}year_bird.gif`" mode="widthFix" />
        <view v-if="recommendation.isFirstLogin" class="report-expiring__first">
          <image class="first-title" :src="`${resourceUrl}${firstLoginInfo.title}`" mode="heightFix" />
          <view class="first-score">
            <view class="first-score__base">
              <view v-if="raiseInfo.baseRaiseScore || raiseInfo.hardRaiseScore" class="base-text">发现<text class="base-text__active">{{ raiseInfo.baseRaiseScore || raiseInfo.hardRaiseScore }}分</text>{{ raiseInfo.baseRaiseScore ? "基础" : '拔高' }}提升空间</view>
              <image class="base-icon" :src="`${resourceUrl}first_up.png`" mode="widthFix" />
            </view>
            <view class="first-score__desc">
              <view class="desc-text">{{ firstLoginInfo.text }}</view>
              <image class="desc-line" :src="`${resourceUrl}first_line.png`" mode="widthFix" />
            </view>
          </view>
          <view class="first-content">
            <view class="first-content__tag">
              <image class="tag-icon" :src="`${resourceUrl}first_clock.png`" mode="widthFix" />
              <view class="tag-name">{{ recommendGoods.name }}限时优惠</view>
            </view>
            <view class="first-content__info">
              <view class="info-remind">
                <image class="info-remind__icon" :src="`${resourceUrl}first_surprise.png`" mode="widthFix" />
                <view class="info-remind__text">会员剩余 <text class="active">{{ recommendation.expiringDays }} 天</text></view>
              </view>
              <view class="info-gift">
                <view class="info-gift__item">立减<text class="minus">￥{{ recommendGoods.minus }}</text></view>
                <view class="info-gift__add">+</view>
                <view class="info-gift__item">赠 <text class="day">{{ recommendation.giftDays }}天</text></view>
              </view>
              <view class="info-price">
                <view class="info-price__original">原价 <text class="value">¥{{ recommendGoods.original }}</text></view>
                <image class="info-price__right" :src="`${resourceUrl}year_right.png`" mode="widthFix" />
                <view class="info-price__cost">早鸟价<text class="unit">¥</text><text class="value">{{ recommendGoods.cost }}</text></view>
              </view>
            </view>
            <image class="first-content__star" :src="`${resourceUrl}first_star.png`" mode="widthFix" />
          </view>
          <view class="first-btn" @click="paymentVIP">早鸟价续费</view>
        </view>
        <view v-else class="report-expiring__other ">
          <view class="other-title">
            <template v-if="stage === 'expiring-optimal'">距会员到期还有<text class="other-title__count">{{ recommendation.expiringDays }}天</text></template>
            <template v-if="stage === 'expiring-secondary'">会员还剩<text class="other-title__count">{{ recommendation.expiringDays }}天</text>到期</template>
            <template v-if="stage === 'expiring-minimal'">会员权益仅剩<text class="other-title__count">{{ recommendation.expiringDays }}天</text></template>
          </view>
          <view class="other-info">
            <view class="other-info__title"><text class="name">{{ recommendGoods.name }}</text>续费福利已开启</view>
            <view class="other-info__gift">
              <view class="gift-item">立减<text class="minus">￥{{ recommendGoods.minus }}</text></view>
              <view class="gift-add">+</view>
              <view class="gift-item">赠 <text class="day">{{ recommendation.giftDays }}天</text></view>
            </view>
            <view class="other-info__desc">
              <view class="desc-text" :class="{ 'desc-text__active': stage === 'expiring-optimal' }">{{ otherLoginInfo.descText || '' }}</view>
              <image class="desc-line" :src="`${resourceUrl}more_line.png`" mode="widthFix" />
            </view>
          </view>
          <view class="other-discount" :class="{ minimal: stage === 'expiring-minimal' }">
            <view class="other-discount__tag">
              <image class="tag-icon" :src="`${resourceUrl}first_clock.png`" mode="widthFix" />
              <view class="tag-name">{{ recommendGoods.name }}限时优惠</view>
            </view>
            <view class="other-discount__price">
              <view class="original">原价 <text class="value">¥{{ recommendGoods.original }}</text></view>
              <image class="right" :src="`${resourceUrl}year_right.png`" mode="widthFix" />
              <view class="cost">早鸟价<text class="unit">¥</text><text class="value">{{ recommendGoods.cost }}</text></view>
            </view>
            <image class="other-discount__star" :src="`${resourceUrl}${otherLoginInfo.starIcon}`" mode="widthFix" />
          </view>
          <view class="other-time">服务至{{ recommendGoods.serviceTo }}</view>
          <view class="other-btn" @click="paymentVIP">早鸟价续费</view>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

const props = withDefaults(defineProps<{
  show: boolean
  shortInfo: any
  raiseInfo: any
}>(), {
  show: false,
  shortInfo: {},
  raiseInfo: {},
})
const emits = defineEmits(['close', 'abandon', 'payment'])

const resourceUrl = 'https://fe-resource.haofenshu.com/shortToLong/'
const membership = computed(() => props.shortInfo?.membership || [])
const recommendGoods = computed(() => membership.value.find((item: any) => item.isRecommended) || {})
const recommendation = computed(() => props.shortInfo?.recommendation || {}) // 当前用户的会员类型、状态
const raiseInfo = computed(() => props.raiseInfo || {})

const stage = computed(() => recommendation.value?.stage)
const memberType = computed(() => recommendation.value?.memberType)
const isMonth = computed(() => memberType.value === 'month')
const isYearExpiring = computed(() => memberType.value === 'year' && stage.value.startsWith('expiring'))
const shortBg = computed(() => {
  if (!memberType.value || !stage.value)
    return ''
  const { minus = 0, isFirstLogin = false } = recommendation.value || {}
  const bgMap: any = {
    halfYear: { expired: minus > 0 ? 'half_guoqi' : 'half_guoqi_cost', expiring: minus > 0 ? 'half_linqi' : 'half_linqi_cost', active: '' },
    jidu: { expired: minus > 0 ? 'half_guoqi' : 'half_guoqi_cost', expiring: minus > 0 ? 'half_linqi' : 'half_linqi_cost', active: '' },
    month: { expired: 'month_guoqi', expiring: 'month_linqi', active: 'month_zaiqi' },
    year: {
      'expired': 'year_guoqi',
      'expiring-optimal': isFirstLogin ? 'first_bg' : 'more_bg1',
      'expiring-secondary': isFirstLogin ? 'first_bg' : 'more_bg2',
      'expiring-minimal': isFirstLogin ? 'first_bg' : 'more_bg3',
      'active': '',
    },
  }
  return `${resourceUrl}${bgMap[memberType.value][stage.value]}.png`
})
const talkImg = computed(() => {
  const { isFirstLogin = false } = recommendation.value || {}
  if (isFirstLogin)
    return `${resourceUrl}first_talk.png`
  const stageMap: any = { 'expiring-optimal': 'more_bg1_tag.png', 'expiring-secondary': 'more_bg2_tag.png', 'expiring-minimal': 'more_bg3_tag.png' }
  return `${resourceUrl}${stageMap[stage.value]}`
})
const firstLoginInfo = computed(() => {
  const { scoreRange = 0 } = raiseInfo.value || {}
  const infoMap: any = {
    0: { title: 'first_bcwd.png', text: '"稳中求进，下次突破就在眼前！"', icon: '' },
    1: { title: 'first_wdjb.png', text: '"每个进步都值得肯定，继续加油！"', icon: '' },
    2: { title: 'first_ysts.png', text: '"太棒了！你正在变得更强！"', icon: 'first_ysts_icon.png' },
    3: { title: 'first_dfts.png', text: '"了不起！你的潜力无限！"', icon: 'first_dfts_icon.png' },
    4: { title: 'first_xygz.png', text: '"波动带来新发现，找准方向再出发！"', icon: '' },
    5: { title: 'first_ysxj.png', text: '"挑战让我们看到更多可能，一起突破！"', icon: '' },
    6: { title: 'first_dfxj.png', text: '"转折点已到，抓住机会实现逆袭！"', icon: 'first_dfxj_icon.png' },
  }
  return infoMap[scoreRange] || { title: '', text: '', icon: '' }
})
const invalidTime = computed(() => {
  const duration = dayjs(recommendation.value.memberEnd).diff(dayjs(), 'hour')
  const day = Math.floor(duration / 24)
  const hour = duration % 24
  return `${day}天${hour}小时`
})
const otherLoginInfo = computed(() => {
  const { nextLeftDays = 0 } = recommendation.value || {}
  const infoMap: any = {
    'expiring-optimal': { descText: '福利逐步递减，越早越优惠', starIcon: 'first_star.png' },
    'expiring-secondary': { descText: `${nextLeftDays}天后赠送天数减少至5天`, starIcon: 'first_star.png' },
    'expiring-minimal': { descText: `早鸟福利倒计时：${invalidTime.value}`, starIcon: 'more_star.png' },
  }
  return infoMap[stage.value] || {}
})
const levelText: any = computed(() => {
  return {
    优秀: {
      text1: '分析成绩刷错题，保持绝对竞争力',
    },
    中等偏上: {
      text1: '发现提分空间，解决就能遥遥领先',
    },
    中等: {
      text1: '发现提分空间，解决就能遥遥领先',
    },
    中等偏下: {
      text1: '个性提分方案已生成，逆风翻盘等你赢',
    },
    较弱: {
      text1: '个性提分方案已生成，逆风翻盘等你赢',
    },
  }
})

function handleClose() {
  isYearExpiring.value && report('year_expiring', 'year_close')
  orderAction(1)
  emits('close')
}

function handleAbandon() {
  orderAction(2)
  emits('abandon')
}

// 处理确认
function paymentVIP() {
  emits('payment')
  memberType.value && report(isYearExpiring.value ? 'year_expiring' : 'short_long', `${memberType.value}_popup`)
  const params = { activityType: 'shortToLong', goodNo: isMonth.value ? undefined : recommendGoods.value.no }
  uni.navigateTo({ url: `/pages/me/member${uni.$u.queryParams(params)}` })
}

// 活动类用户反馈
async function orderAction(action: number) {
  const { product, memberType, stage } = recommendation.value
  const params = { product, memberType, stage, action }
  await uni.$http.post('/v1/be-proxy/v3/strategy/recommend-action', params, { custom: { loading: false, error: false } })
}
</script>

<style lang="scss" scoped>
.short {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  &-bg {
    width: 650rpx;
    height: 754rpx;
  }
  &-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    &__month {
      .month-info {
        .minus {
          position: absolute;
          top: 224rpx;
          left: 194rpx;
          font-size: 44rpx;
          font-weight: bold;
          color: #333333;
          transform: rotate(-1deg);
          &-value {
            font-size: 56rpx;
            color: #ff5b02;
          }
        }
      }
      .month-footer {
        width: 100%;
        position: absolute;
        bottom: 70rpx;
        left: 0;
        padding: 0 86rpx;
        &__tag {
          width: 272rpx;
          height: 42rpx;
          position: absolute;
          top: -34rpx;
          right: 86rpx;
        }
        &__end {
          width: auto;
          display: flex;
          flex-wrap: nowrap;
          background: #fffe2f;
          padding: 2rpx 20rpx 2rpx 24rpx;
          font-size: 28rpx;
          color: #333333;
          border-radius: 24rpx;
          border-bottom-left-radius: 0;
          .red {
            font-size: 28rpx;
            color: #ff0000;
          }
          .nowarp {
            white-space: nowrap;
          }
        }
        &__item {
          width: 478rpx;
          height: 96rpx;
        }
      }
    }
    &__half {
      .half-info {
        .name {
          position: absolute;
          top: 224rpx;
          right: 95rpx;
          font-size: 36rpx;
          font-weight: bold;
          color: #333333;
          &.right {
            right: 70rpx;
          }
          .red {
            font-size: 44rpx;
            color: #ff0000;
          }
        }
        .time {
          position: absolute;
          top: 308rpx;
          left: 170rpx;
          font-size: 28rpx;
          font-weight: bold;
          color: #ffffff;
          transform: rotate(-1deg);
        }
        .price {
          display: flex;
          justify-content: space-between;
          position: absolute;
          top: 380rpx;
          left: 100rpx;
          width: 454rpx;
          height: 160rpx;
          &-original {
            position: absolute;
            top: 50rpx;
            left: 0;
            width: 170rpx;
            height: 114rpx;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            &__text {
              position: relative;
              color: #ff4616;
              margin-bottom: 6rpx;
              transform: rotate(-3deg);
              .unit {
                font-size: 32rpx;
              }
              .value {
                font-size: 52rpx;
              }
              .line {
                width: 124rpx;
                height: 4rpx;
                position: absolute;
                background: #fff;
                left: -6rpx;
                top: 50%;
                width: calc(100% + 12rpx);
                transform: rotate(-3deg);
              }
            }
          }
          &-subsidy {
            position: absolute;
            left: 126rpx;
            top: 16rpx;
            transform: rotate(12deg);
            font-size: 24rpx;
            font-weight: bold;
            color: #ffffff;
            &.active {
              left: 120rpx;
            }
            .value {
              font-size: 30rpx;
              color: #fff900;
            }
          }
          &-cost {
            position: absolute;
            right: 0;
            display: flex;
            justify-content: center;
            align-items: flex-end;
            width: 280rpx;
            height: 164rpx;
            &__text {
              font-size: 112rpx;
              color: #ff0000;
              display: flex;
              align-items: baseline;
              line-height: 1.2;
              &.active {
                font-size: 100rpx;
              }
              .unit {
                font-size: 64rpx;
              }
            }
          }
        }
        .cost {
          display: flex;
          align-items: baseline;
          position: absolute;
          top: 400rpx;
          left: 50%;
          transform: translateX(-50%);
          height: 146rpx;
          font-size: 104rpx;
          font-weight: bold;
          color: #ff0000;
          .unit {
            font-size: 64rpx;
          }
        }
      }
      .half-footer {
        width: 100%;
        position: absolute;
        bottom: 70rpx;
        left: 0;
        padding: 0 70rpx;
        display: flex;
        justify-content: space-between;
        &__item {
          width: 242rpx;
          height: 88rpx;
        }
        &__tag {
          width: 174rpx;
          height: 48rpx;
          position: absolute;
          right: 48rpx;
          bottom: 76rpx;
        }
      }
    }
  }
  &-close {
    position: absolute;
    top: -54rpx;
    right: 20rpx;
  }
}
.report {
  position: relative;
  &-close {
    width: 44rpx;
    height: 44rpx;
    position: absolute;
    top: -72rpx;
    right: 0;
    z-index: 20;
  }
  &-bg {
    width: 626rpx;
    height: 744rpx;
  }
  &-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    padding: 40rpx 32rpx 38rpx 64rpx;
    &__title {
      width: 472rpx;
      height: 54rpx;
      margin-bottom: 22rpx;
    }
    &__score {
      width: 100%;
      height: 164rpx;
      background: rgba(255, 250, 167, 0.3);
      border: 4rpx solid #ffc12b;
      border-radius: 24rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20rpx 0 26rpx;
      margin-bottom: 28rpx;
      .improve {
        display: flex;
        align-items: baseline;
        margin-bottom: 10rpx;
        &-text {
          font-size: 28rpx;
          font-weight: bold;
          color: #6c490d;
          .value {
            font-size: 48rpx;
            font-weight: bold;
            color: #1fc24c;
            margin: 0 6rpx;
          }
        }
        &-icon {
          width: 44rpx;
          height: 44rpx;
          margin-left: 8rpx;
        }
      }
      .tips {
        position: relative;
        &-text {
          font-size: 26rpx;
          font-weight: bold;
          color: #6c490d;
          position: relative;
          z-index: 10;
        }
        &-line {
          width: 402rpx;
          height: 20rpx;
          position: absolute;
          bottom: -6rpx;
          left: 50%;
          transform: translateX(-50%);
        }
      }
    }
    &__good {
      width: 100%;
      background: linear-gradient(135deg, #fff4f4, #ffe2e2);
      border: 4rpx solid #ff6363;
      border-radius: 20rpx;
      position: relative;
      padding: 26rpx 28rpx 14rpx;
      margin-bottom: 36rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      .good-icon {
        width: 180rpx;
        height: 48rpx;
        position: absolute;
        top: -16rpx;
        left: -4rpx;
      }
      .good-star {
        width: 154rpx;
        height: 126rpx;
        position: absolute;
        bottom: 0;
        right: 0;
        z-index: 10;
      }
      .good-stage {
        font-size: 30rpx;
        font-weight: bold;
        color: #ff0000;
        margin-bottom: 8rpx;
      }
      .good-minus {
        font-size: 26rpx;
        color: #939393;
        margin-bottom: 16rpx;
        .active {
          font-size: 32rpx;
          font-weight: bold;
          color: #ff0000;
        }
      }
      .good-name {
        background: rgba(255, 0, 0, 0.1);
        border-radius: 24rpx;
        padding: 6rpx 34rpx;
        font-size: 24rpx;
        font-weight: bold;
        color: #ff0000;
        margin-bottom: 16rpx;
        position: relative;
        z-index: 20;
      }
      .good-line {
        width: 100%;
        height: 1px;
        background-image: linear-gradient(
          to right,
          rgba(255, 56, 27, 0.2) 0%,
          rgba(255, 56, 27, 0.2) 50%,
          transparent 50%
        );
        background-size: 12rpx 2rpx;
        background-repeat: repeat-x;
        position: relative;
        z-index: 20;
      }
      .good-price {
        display: flex;
        align-items: baseline;
        margin-bottom: 6rpx;
        position: relative;
        z-index: 20;
        .original {
          font-size: 28rpx;
          color: #939393;
          .value {
            text-decoration: line-through;
            margin-right: 6rpx;
          }
        }
        .right {
          width: 32rpx;
          height: 24rpx;
          margin-right: 16rpx;
        }
        .cost {
          font-size: 32rpx;
          color: #ff381b;
          .value {
            font-size: 52rpx;
            margin: 0 4rpx 0 12rpx;
            .unit {
              font-size: 24rpx;
              margin-right: 4rpx;
            }
          }
        }
      }
    }
    &__btn {
      width: 420rpx;
      height: 76rpx;
      background: linear-gradient(225deg, #ffb405, #ff5f3d);
      border: 2rpx solid #ffffff;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: bold;
      color: #ffffff;
      position: absolute;
      bottom: 38rpx;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  &-expiring {
    position: relative;
    &__close {
      width: 44rpx;
      height: 44rpx;
      position: absolute;
      top: -86rpx;
      right: 10rpx;
      z-index: 99;
    }
    &__bg {
      width: 650rpx;
      height: 810rpx;
    }
    &__talk {
      width: 236rpx;
      height: 62rpx;
      position: absolute;
      top: -42rpx;
      right: 138rpx;
    }
    &__icon {
      height: 72rpx;
      position: absolute;
      top: -16rpx;
      left: -20rpx;
    }
    &__bird {
      width: 240rpx;
      height: 240rpx;
      position: absolute;
      top: -74rpx;
      right: -38rpx;
      &.first {
        top: -54rpx;
      }
    }
    &__first {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      padding: 52rpx 40rpx 32rpx 40rpx;
      .first-title {
        width: 408rpx;
        height: 98rpx;
        margin-bottom: 32rpx;
      }
      .first-score {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 100%;
        height: 174rpx;
        background: #ffffff;
        border: 2rpx solid #d9c6ff;
        border-radius: 24rpx;
        box-shadow: 0rpx 0rpx 12rpx 0rpx rgba(172, 134, 255, 0.1);
        margin-bottom: 36rpx;
        &__base {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: -10rpx 0 20rpx;
          .base-text {
            font-size: 28rpx;
            font-weight: bold;
            color: #333333;
            &__active {
              font-size: 48rpx;
              color: #0061ff;
              margin: 0 7rpx;
            }
          }
          .base-icon {
            width: 44rpx;
            height: 44rpx;
            margin-left: 8rpx;
          }
        }
        &__desc {
          position: relative;
          .desc-text {
            font-size: 28rpx;
            font-weight: bold;
            color: #0061ff;
            position: relative;
            z-index: 20;
          }
          .desc-line {
            width: 402rpx;
            height: 20rpx;
            position: absolute;
            bottom: -6rpx;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
          }
        }
      }
      .first-content {
        width: 570rpx;
        height: 280rpx;
        background: linear-gradient(135deg, #fff8f0, #fff5ee);
        border: 2rpx solid #ffad5b;
        border-radius: 24rpx;
        padding: 44rpx 50rpx 28rpx 50rpx;
        position: relative;
        margin-bottom: 30rpx;
        &__tag {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: -24rpx;
          left: -2rpx;
          padding: 6rpx 20rpx;
          background: linear-gradient(225deg, #ffb30e, #ffb20c);
          border-radius: 26rpx 2rpx;
          .tag-icon {
            width: 28rpx;
            height: 28rpx;
            margin-right: 8rpx;
          }
          .tag-name {
            font-size: 26rpx;
            font-weight: bold;
            color: #ffffff;
          }
        }
        &__info {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          position: relative;
          z-index: 20;
          .info-remind {
            display: flex;
            align-items: center;
            margin-bottom: 16rpx;
            &__icon {
              width: 44rpx;
              height: 44rpx;
              margin-right: 12rpx;
            }
            &__text {
              font-size: 30rpx;
              color: #333333;
              .active {
                font-size: 30rpx;
                font-weight: bold;
                color: #ff381b;
              }
            }
          }
          .info-gift {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 84rpx;
            background: linear-gradient(225deg, #ffebbf, #ffe3b7);
            border-radius: 16rpx;
            &__item {
              font-size: 32rpx;
              font-weight: bold;
              color: #333333;
              .minus {
                font-size: 44rpx;
                color: #ff4300;
              }
              .day {
                font-size: 44rpx;
                font-weight: bold;
                color: #482eff;
              }
            }
            &__add {
              margin: 0 20rpx;
            }
          }
          .info-price {
            display: flex;
            align-items: baseline;
            justify-content: center;
            &__original {
              font-size: 28rpx;
              color: #939393;
              margin-right: 16rpx;
              .value {
                text-decoration: line-through;
                margin-right: 6rpx;
              }
            }
            &__right {
              width: 32rpx;
              height: 26rpx;
              margin-right: 16rpx;
            }
            &__cost {
              font-size: 32rpx;
              font-weight: bold;
              color: #ff381b;
              .unit {
                font-size: 24rpx;
                color: #ff381b;
                margin: 0 4rpx 0 12rpx;
              }
              .value {
                font-size: 52rpx;
                font-weight: Bold;
                color: #ff381b;
              }
            }
          }
        }
        &__star {
          width: 146rpx;
          height: 126rpx;
          position: absolute;
          bottom: 0;
          right: 0;
          z-index: 10;
        }
      }
      .first-btn {
        position: absolute;
        bottom: 32rpx;
        left: 40rpx;
        width: calc(100% - 80rpx);
        height: 76rpx;
        background: linear-gradient(225deg, #977cff, #6b57ff);
        border: 2rpx solid #ffffff;
        border-radius: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: bold;
        color: #ffffff;
      }
    }
    &__other {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      padding: 58rpx 40rpx 32rpx 40rpx;
      .other-title {
        font-size: 40rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 42rpx;
        line-height: 42rpx;
        text-shadow:
          -2rpx -2rpx 0 #fff,
          2rpx -2rpx 0 #fff,
          -2rpx 2rpx 0 #fff,
          2rpx 2rpx 0 #fff;
        &__count {
          font-size: 48rpx;
          font-weight: bold;
          color: #ff0000;
        }
      }
      .other-info {
        display: flex;
        align-items: center;
        flex-direction: column;
        width: 100%;
        background: #ffffff;
        border: 2rpx solid #e9ead1;
        border-radius: 24rpx;
        box-shadow: 0rpx 0rpx 12rpx 0rpx rgba(255, 222, 73, 0.1);
        padding: 24rpx 50rpx 36rpx;
        margin-bottom: 40rpx;
        &__title {
          font-size: 28rpx;
          font-weight: bold;
          color: #333333;
          margin-bottom: 22rpx;
          .name {
            font-size: 32rpx;
            color: #ff381b;
          }
        }
        &__gift {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 84rpx;
          background: linear-gradient(225deg, #ffebbf, #ffe3b7);
          border-radius: 16rpx;
          margin-bottom: 24rpx;
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
          .gift-item {
            .minus {
              font-size: 44rpx;
              color: #ff4300;
            }
            .day {
              font-size: 44rpx;
              font-weight: bold;
              color: #482eff;
            }
          }
          .gift-add {
            margin: 0 20rpx;
            font-size: 40rpx;
          }
        }
        &__desc {
          position: relative;
          .desc-text {
            font-size: 28rpx;
            font-weight: bold;
            color: #ff0000;
            position: relative;
            z-index: 20;
            &__active {
              color: #403a05;
            }
          }
          .desc-line {
            width: 402rpx;
            height: 20rpx;
            position: absolute;
            bottom: -6rpx;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
          }
        }
      }
      .other-discount {
        width: 100%;
        height: 142rpx;
        background: linear-gradient(135deg, #fff1e0, #ffebdd);
        border: 2rpx solid #ffad5b;
        border-radius: 24rpx;
        position: relative;
        margin-bottom: 44rpx;
        &__tag {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: -24rpx;
          left: -2rpx;
          padding: 6rpx 20rpx;
          background: linear-gradient(225deg, #ff450e, #ff880c);
          border-radius: 26rpx 2rpx;
          .tag-icon {
            width: 28rpx;
            height: 28rpx;
            margin-right: 8rpx;
          }
          .tag-name {
            font-size: 26rpx;
            font-weight: bold;
            color: #ffffff;
          }
        }
        &__price {
          display: flex;
          align-items: baseline;
          justify-content: center;
          padding-top: 36rpx;
          position: relative;
          z-index: 20;
          .original {
            font-size: 28rpx;
            color: #939393;
            margin-right: 16rpx;
            .value {
              text-decoration: line-through;
              margin-right: 6rpx;
            }
          }
          .right {
            width: 32rpx;
            height: 26rpx;
            margin-right: 16rpx;
          }
          .cost {
            font-size: 32rpx;
            font-weight: bold;
            color: #ff381b;
            .unit {
              font-size: 24rpx;
              color: #ff381b;
              margin: 0 4rpx 0 12rpx;
            }
            .value {
              font-size: 52rpx;
              font-weight: Bold;
              color: #ff381b;
            }
          }
        }
        &__star {
          width: 146rpx;
          height: 126rpx;
          position: absolute;
          bottom: 0;
          right: 0;
          z-index: 10;
        }
        &.minimal {
          background: linear-gradient(135deg, #ffe9e9, #ffd7d7);
          border: 2rpx solid #ff0000;
          .other-discount__tag {
            background: #ff0000;
          }
        }
      }
      .other-time {
        opacity: 0.7;
        font-size: 28rpx;
        color: #333333;
        margin-bottom: 14rpx;
        text-align: center;
      }
      .other-btn {
        position: absolute;
        bottom: 32rpx;
        left: 40rpx;
        width: calc(100% - 80rpx);
        height: 76rpx;
        background: linear-gradient(225deg, #ffbf10, #ff1e1e);
        border: 2rpx solid #ffffff;
        border-radius: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: bold;
        color: #ffffff;
      }
    }
  }
}
</style>
