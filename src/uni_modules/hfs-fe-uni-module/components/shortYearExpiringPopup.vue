<template>
  <!-- 短期变长期 -->
  <u-popup :show="!hideMember && popup.show" :mode="popup.mode" :overlay-opacity="0.7" bg-color="transparent">
    <view class="short">
      <!-- 一年临期会员 续费弹窗 -->
      <view v-if="popup.type === 'report'" class="report">
        <image class="report-close" :src="`${resourceUrl}/year_expiring_close.png`" mode="widthFix" @click="handleClose" />
        <image class="report-bg" :src="`${resourceUrl}/${imgMap.bg}`" mode="widthFix" />
        <image class="report-talk" :src="`${resourceUrl}/year_talk.png`" mode="widthFix" />
        <image class="report-bird" :src="`${resourceUrl}/${birdImg}`" mode="widthFix" />
        <view class="report-content">
          <view class="report-content__header">
            <image class="icon" :src="`${resourceUrl}/${imgMap.icon}`" mode="widthFix" />
            <view class="title">距会员到期仅<text class="title-active">{{ recommendation.expiringDays }}天</text></view>
          </view>
          <view class="report-content__tips">本会员期您将积累<text class="active">{{ recommendation.lastQuantity || 365 }}天</text>学考数据，续费后将持续积累</view>
          <view class="report-content__gift" :class="{ minimal: stage === 'expiring-minimal' }">
            <view class="gift-item">
              <view class="gift-item__title">
                <image class="title-icon" :src="`${resourceUrl}/year_one.png`" mode="heightFix" />
                <view class="title-text">{{ `【续费${currentGood.name}优惠】` }}</view>
              </view>
              <view class="gift-item__info">
                <view class="price">
                  <view class="price-discount">{{ discountFormat(currentGood.discount) }}折</view>
                  <view class="price-text">原价<text class="price-text__through">¥{{ currentGood.original }}</text></view>
                  <view class="price-cost">现价¥{{ currentGood.cost }}</view>
                </view>
                <view v-if="descText.desc1" class="desc">{{ descText.desc1 }}</view>
              </view>
            </view>
            <view class="gift-item">
              <view class="gift-item__title">
                <image class="title-icon" :src="`${resourceUrl}/year_two.png`" mode="heightFix" />
                <view class="title-text">【续费延时奖励】</view>
              </view>
              <view class="gift-item__info">
                <view class="price">
                  <view class="price-text">额外赠送<text class="price-text__value">{{ recommendation.giftDays }}天</text>会员权益<template v-if="recommendation.giftDays > 5">（价值{{ recommendation.giftDays }}元）</template></view>
                </view>
                <view v-if="descText.desc2" class="desc">{{ descText.desc2 }}</view>
              </view>
            </view>
          </view>
          <view class="report-content__btns" :class="{ reason: recommendation.reasonDone === 1 }">
            <view v-if="recommendation.reasonDone !== 1" class="cancel" @click="handleThink">考虑一下</view>
            <view class="confirm" @click="paymentVIP">¥{{ currentGood.cost }} 续费护航卡</view>
          </view>
        </view>
      </view>
      <!-- 考虑弹窗 -->
      <view v-if="popup.type === 'suggest'" class="suggest">
        <view class="suggest-header">
          <image class="suggest-header__icon" :src="`${resourceUrl}/linqi_icon.png`" mode="widthFix" />
          <view class="suggest-header__title">请选择您的想法</view>
        </view>
        <view class="suggest-sub">可多选，帮助我们更好地为您服务</view>
        <view class="suggest-list">
          <view v-for="(item, index) in suggestList" :key="index" class="suggest-list__item">
            <view class="line" />
            <view class="info">
              <view class="info-content" @click="suggestClick(item)">
                <image v-if="item.check" class="select" :src="`${resourceUrl}/suggest_select.png`" mode="widthFix" />
                <image v-else class="select" :src="`${resourceUrl}/suggest_default.png`" mode="widthFix" />
                <image class="icon" :src="`${resourceUrl}/${item.icon}`" mode="widthFix" />
                <view class="label">{{ item.label }}</view>
              </view>
              <view v-if="item.showInput && item.check" class="info-textarea">
                <up-textarea v-model="item.inputValue" height="82rpx" placeholder="请输入你的想法..." placeholder-class="palceholder" border="none" count maxlength="30" />
              </view>
            </view>
          </view>
        </view>
        <view class="suggest-btn" :class="{ active: selectSuggestList.length }" @click="suggestConfirm">确定</view>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { isHFSApp, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

const props = withDefaults(defineProps<{
  shortInfo?: any
  from: string
  imgType: string
}>(), {
  shortInfo: () => ({}),
  imgType: 'score',
})
// 事件定义
const emits = defineEmits(['close'])
const resourceUrl = 'https://fe-resource.haofenshu.com/shortToLong'
const popup = ref({ show: false, mode: 'center', type: '' }) // 弹窗类型
const raiseInfo = ref<any>({})
const hideMember = computed(() => {
  const userInfo = uni.getStorageSync('userInfo') || getApp().globalData?.userInfo || {}
  return userInfo.hideMember || false
})

const suggestList = ref([
  { label: '等到期后再续', value: 1, check: false, icon: 'linqi_icon1.png', showInput: false, inputValue: '' },
  { label: '想续短周期会员', value: 2, check: false, icon: 'linqi_icon2.png', showInput: false, inputValue: '' },
  { label: '价格有点高', value: 3, check: false, icon: 'linqi_icon3.png', showInput: false, inputValue: '' },
  { label: '使用不太多', value: 4, check: false, icon: 'linqi_icon4.png', showInput: false, inputValue: '' },
  { label: '对产品体验有建议', value: 5, check: false, icon: 'linqi_icon5.png', showInput: true, inputValue: '' },
  { label: '其他', value: 6, check: false, icon: 'linqi_icon6.png', showInput: true, inputValue: '' },
])
const beProxy = computed(() => {
  let prefix = ''
  // #ifdef MP-WEIXIN
  prefix = '/v1/be-proxy'
  // #endif
  return prefix
})
const recommendation = computed(() => props.shortInfo?.recommendation || {}) // 当前用户的会员类型、状态
const stage = computed(() => recommendation.value?.stage || '')
const currentGood = computed(() => props.shortInfo?.membership?.find((item: any) => item.isRecommended) || {})
const selectSuggestList = computed(() => {
  return suggestList.value.filter(item => item.check) || []
})
const imgMap = computed(() => {
  const bgMap = {
    'expiring-optimal': { bg: 'year_bg1.png', icon: 'year_icon1.png' },
    'expiring-secondary': { bg: 'year_bg2.png', icon: 'year_icon2.png' },
    'expiring-minimal': { bg: 'year_bg3.png', icon: 'year_icon3.png' },
  }
  return bgMap[stage.value as keyof typeof bgMap]
})
const birdImg = computed(() => {
  const gifMap = { score: 'year_socre_bird.gif', subject: 'year_subject_bird.gif', lose: 'year_lose_bird.gif', improve: 'year_improve_bird.gif' }
  return gifMap[props.imgType as keyof typeof gifMap]
})
const descText = computed(() => {
  const { expiringDays = '', nextDiscount = 0, nextLeftDays = 0 } = recommendation.value || {}
  return {
    desc1: nextLeftDays > 0 ? `限${nextLeftDays}天内有效，${nextLeftDays}天后仅${nextDiscount}折` : `限${expiringDays}天内有效，${expiringDays}天后早鸟优惠结束`,
    desc2: nextLeftDays > 0 ? `${nextLeftDays}天后少送5天` : '',
  }
})

onMounted(async () => {
  await getRaiseInfo()
  popup.value = { show: true, mode: 'center', type: 'report' }
  closeAds()
})

// 处理考虑
async function handleThink() {
  report('year_expiring', 'year_bottom_ad_think')
  popup.value.show = false
  await uni.$u.sleep(350)
  popup.value = { show: true, mode: 'bottom', type: 'suggest' }
}

// 处理续费
async function paymentVIP() {
  popup.value.show = false
  report('year_expiring', 'year_bottom_ad')
  const params = { activityType: 'shortToLong', goodNo: currentGood.value.no }
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

// 建议点击
function suggestClick(item: any) {
  item.check = !item.check
}

// 建议确定
async function suggestConfirm() {
  if (selectSuggestList.value.length === 0)
    return
  const params = {
    reason: {
      minds: selectSuggestList.value.map(item => item.value) || [],
      text1: selectSuggestList.value.find(item => item.value === 5)?.inputValue || '',
      text2: selectSuggestList.value.find(item => item.value === 6)?.inputValue || '',
    },
  }
  await orderAction(2, params)
  emits('close')
}

// 处理关闭
async function handleClose() {
  report('year_expiring', 'year_bottom_ad_close')
  await orderAction(1)
  emits('close')
}

// 活动类用户反馈
async function orderAction(action: number, options?: any) {
  const { product, memberType, stage } = recommendation.value
  const params = { product, memberType, stage, action, ...options }
  await uni.$http.post(`${beProxy.value}/v3/strategy/recommend-action`, params, { custom: { loading: false, error: false } })
}

// 记录当前模块点击次数
async function closeAds() {
  await uni.$http.post(`${beProxy.value}/v3/strategy/recommend-goods/close-ads`, { from: props.from }, { custom: { loading: false, error: false } })
}

// 获取提升空间
async function getRaiseInfo() {
  const res = await uni.$http.get(`${beProxy.value}/v4/exam/latest-raise-info`, {}, { custom: { loading: false, error: false } })
  raiseInfo.value = res.data || {}
}

function discountFormat(discount: number) {
  const len = discount.toString().split('.')[1]?.length || 0
  if (len < 2)
    return discount
  return discount.toFixed(2)
}
</script>

<style lang="scss" scoped>
.short {
  .report {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 722rpx;
    background: linear-gradient(153deg, #fffdee, #ffffff 83%);
    border: 2rpx solid #ffffff;
    border-radius: 40rpx;
    position: relative;
    &-close {
      width: 44rpx;
      height: 44rpx;
      position: absolute;
      top: -152rpx;
      right: 26rpx;
    }
    &-bg {
      width: 722rpx;
      height: 1234rpx;
    }
    &-bird {
      width: 240rpx;
      height: 240rpx;
      position: absolute;
      top: -120rpx;
      right: -26rpx;
    }
    &-talk {
      width: 236rpx;
      height: 62rpx;
      position: absolute;
      top: -76rpx;
      right: 168rpx;
    }
    &-content {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      padding: 32rpx 24rpx 24rpx 24rpx;
      &__header {
        display: flex;
        align-items: center;
        padding-left: 6rpx;
        margin-bottom: 14rpx;
        .icon {
          width: 52rpx;
          height: 52rpx;
          margin-right: 16rpx;
        }
        .title {
          font-size: 40rpx;
          font-weight: bold;
          color: #333333;
          line-height: 52rpx;
          text-shadow:
            -2rpx -2rpx 0 #fff,
            2rpx -2rpx 0 #fff,
            -2rpx 2rpx 0 #fff,
            2rpx 2rpx 0 #fff;
          &-active {
            font-size: 48rpx;
            font-weight: bold;
            color: #ff0000;
          }
        }
      }
      &__tips {
        font-size: 26rpx;
        color: #333333;
        padding-left: 10rpx;
        text-shadow:
          -2rpx -2rpx 0 #fff,
          2rpx -2rpx 0 #fff,
          -2rpx 2rpx 0 #fff,
          2rpx 2rpx 0 #fff;
        .active {
          font-size: 34rpx;
          color: #003bff;
          font-weight: bold;
        }
      }
      &__gift {
        width: 650rpx;
        height: 380rpx;
        position: absolute;
        top: 386rpx;
        left: 34rpx;
        padding: 4rpx 24rpx;
        .gift-item {
          padding: 24rpx 0;
          border-bottom: 1rpx solid #e6e6e6;
          &:last-child {
            border-bottom: none;
          }
          &__title {
            display: flex;
            align-items: center;
            margin-bottom: 12rpx;
            &.active {
              margin-bottom: 18rpx;
            }
            .title-icon {
              width: 106rpx;
              height: 42rpx;
            }
            .title-text {
              font-size: 30rpx;
              font-weight: bold;
              color: #333333;
              line-height: 42rpx;
            }
          }
          &__info {
            padding-left: 122rpx;
            .price {
              display: flex;
              align-items: baseline;
              margin-bottom: 6rpx;
              &-discount {
                font-size: 32rpx;
                font-weight: bold;
                color: #ff0000;
                margin-right: 20rpx;
                line-height: 44rpx;
              }
              &-text {
                font-size: 26rpx;
                color: #666666;
                line-height: 36rpx;
                margin-right: 12rpx;
                &__through {
                  text-decoration: line-through;
                }
                &__value {
                  font-size: 32rpx;
                  font-weight: bold;
                  color: #ff0000;
                  line-height: 36rpx;
                }
              }
              &-cost {
                font-size: 26rpx;
                color: #ff0000;
                line-height: 36rpx;
              }
            }
            .desc {
              font-size: 24rpx;
              color: #7737ff;
              line-height: 34rpx;
            }
          }
        }
        &.minimal {
          height: 340rpx;
        }
      }
      &__btns {
        width: 100%;
        display: flex;
        align-items: center;
        position: absolute;
        bottom: 24rpx;
        left: 0;
        padding: 0 24rpx;
        .cancel {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 256rpx;
          height: 76rpx;
          background: #e6e6e6;
          border: 2rpx solid #ffffff;
          border-radius: 40rpx;
          font-size: 28rpx;
          color: #939393;
          margin-right: 28rpx;
        }
        .confirm {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
          height: 76rpx;
          background: linear-gradient(225deg, #ffb405, #ff5f3d);
          border: 2rpx solid #ffffff;
          border-radius: 40rpx;
          font-size: 28rpx;
          font-weight: bold;
          color: #ffffff;
        }
        &.reason {
          justify-content: center;
          .confirm {
            width: 392rpx;
            flex-grow: 0;
          }
        }
      }
    }
  }
  .suggest {
    padding: 24rpx 33rpx calc(env(safe-area-inset-bottom) + 32rpx) 32rpx;
    background: #ffffff;
    border-radius: 24rpx 24rpx 0rpx 0rpx;
    &-header {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;
      &__icon {
        width: 30rpx;
        height: 36rpx;
        margin-right: 12rpx;
        margin-bottom: 4rpx;
      }
      &__title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
      }
    }
    &-sub {
      font-size: 26rpx;
      color: #939393;
      margin-bottom: 32rpx;
    }
    &-list {
      display: flex;
      flex-direction: column;
      margin-bottom: 16rpx;
      &__item {
        width: 686rpx;
        min-height: 92rpx;
        background: #fff6ed;
        border: 2rpx solid #ffe6ce;
        border-radius: 20rpx;
        overflow: hidden;
        position: relative;
        padding: 0 20rpx 0 36rpx;
        margin-bottom: 20rpx;
        .line {
          width: 8rpx;
          height: 100%;
          background: #ffa346;
          position: absolute;
          top: 0;
          left: 0;
        }
        &:nth-of-type(2n + 1) {
          background: #eef5ff;
          border: 2rpx solid #e1edff;
          .line {
            background: #5299ff;
          }
        }
        .info {
          margin-top: 24rpx;
          &-content {
            display: flex;
            align-items: center;
            .select {
              width: 36rpx;
              height: 36rpx;
              margin-right: 20rpx;
            }
            .icon {
              width: 36rpx;
              height: 36rpx;
              margin-right: 14rpx;
            }
            .label {
              font-size: 30rpx;
              color: #333333;
            }
          }
          &-textarea {
            margin: 26rpx 0 20rpx;
            .palceholder {
              font-size: 28rpx;
              color: #939393;
            }
          }
        }
      }
    }
    &-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 76rpx;
      background: #e6e6e6;
      border-radius: 38rpx;
      font-size: 28rpx;
      color: #939393;
      &.active {
        background: linear-gradient(225deg, #ffb405, #ff5f3d);
        border: 2rpx solid #ffffff;
        border-radius: 40rpx;
        font-weight: bold;
        color: #ffffff;
      }
    }
  }
}
</style>
