<template>
  <!-- 短期变长期 -->
  <u-popup :show="!hideMember && popup.show" :mode="popup.mode" :overlay-opacity="0.7" bg-color="transparent">
    <view class="short">
      <!-- 一年过期会员 续费弹窗 -->
      <view v-if="popup.type === 'report'" class="report">
        <image class="report-close" :src="`${resourceUrl}/year_close.png`" mode="widthFix" @click="handleClose" />
        <view class="report-header">
          <image class="report-header__title" :src="`${resourceUrl}/year_title.png`" mode="widthFix" />
          <image class="report-header__sub" :src="`${resourceUrl}/year_sub.png`" mode="widthFix" />
        </view>
        <view class="report-desc">
          <rich-text :nodes="levelText[raiseInfo.level].text1" />
        </view>
        <view class="report-score">
          <image class="report-score__robot" :src="`${resourceUrl}/year_robot.png`" mode="widthFix" />
          <view class="report-score__remind">{{ levelText[raiseInfo.level].text2 }}</view>
          <view class="report-score__desc">{{ levelText[raiseInfo.level].text3 }}</view>
          <view class="report-score__box">
            <view v-if="levelText[raiseInfo.level].text4" class="tips">{{ levelText[raiseInfo.level].text4 }}</view>
            <view class="list">
              <view v-for="(item, index) in papers" :key="index" class="list-item">
                <view class="point" :style="{ backgroundColor: papersColors[index] }" />
                <view class="subject">{{ item.subject }}：</view>
                <view class="question">{{ `${item.level}题` }}</view>
                <view v-if="item.myLost && item.score" class="lost" :style="{ color: papersColors[index] }">丢{{ item.myLost }}分（共{{ item.score }}分）</view>
                <view v-else class="lost" :class="{ active: index === 0 }">丢{{ item.myLostRate }}%分</view>
              </view>
            </view>
            <image class="points" :src="`${resourceUrl}/year_ponit.png`" mode="widthFix" />
            <view class="explain">说明：展示学科失分最多题目类型</view>
          </view>
        </view>
        <view class="report-good">
          <image class="report-good__icon" :src="`${resourceUrl}/year_discount.png`" mode="widthFix" />
          <image class="report-good__star" :src="`${resourceUrl}/year_star.png`" mode="widthFix" />
          <view class="report-good__stage">会员已过期</view>
          <view class="report-good__minus">马上续费<text class="active">立减¥{{ currentGood.minus }}</text></view>
          <view class="report-good__name">限{{ currentGood.name }}</view>
          <view class="report-good__line" />
          <view class="report-good__price">
            <view class="original">
              <view class="original-text">原价 <text class="value">¥{{ currentGood.original }}</text></view>
              <image class="original-right" :src="`${resourceUrl}/year_right.png`" mode="widthFix" />
            </view>
            <view class="cost">补贴价<text class="value"><text class="unit">¥</text>{{ currentGood.cost }}</text></view>
          </view>
          <view v-if="currentGood?.dayPriceNew < 0.99" class="report-good__day">每天低至 {{ currentGood.dayPriceNew }} 元</view>
        </view>
        <view class="report-btns" :class="{ reason: recommendation.reasonDone === 1 }">
          <view v-if="recommendation.reasonDone !== 1" class="cancel" @click="handleThink">考虑一下</view>
          <view class="confirm" @click="paymentVIP">立即续费恢复会员</view>
        </view>
      </view>
      <!-- 考虑弹窗 -->
      <view v-if="popup.type === 'suggest'" class="suggest">
        <view class="suggest-header">
          <image class="suggest-header__icon" :src="`${resourceUrl}/suggest_icon.png`" mode="widthFix" />
          <view class="suggest-header__title">请选择您的想法（可多选）</view>
        </view>
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
}>(), {
  shortInfo: () => ({}),
})
// 事件定义
const emits = defineEmits(['close'])
const resourceUrl = 'https://fe-resource.haofenshu.com/shortToLong'
const popup = ref({ show: false, mode: 'center', type: '' }) // 弹窗类型
const raiseInfo = ref<any>({})
const papersColors = ['#FF2F2F', '#0093FF', '#FF9B00']
const hideMember = computed(() => {
  const userInfo = uni.getStorageSync('userInfo') || getApp().globalData?.userInfo || {}
  return userInfo.hideMember || false
})

const suggestList = ref([
  { label: '价格有点高', value: 1, check: false, icon: 'suggest_price.png', showInput: false, inputValue: '' },
  { label: '使用不太多', value: 2, check: false, icon: 'suggest_use.png', showInput: false, inputValue: '' },
  { label: '产品体验欠佳', value: 3, check: false, icon: 'suggest_product.png', showInput: true, inputValue: '' },
  { label: '学校不用了', value: 4, check: false, icon: 'suggest_school.png', showInput: false, inputValue: '' },
  { label: '其他', value: 5, check: false, icon: 'suggest_other.png', showInput: true, inputValue: '' },
])
const recommendation = computed(() => props.shortInfo?.recommendation || {}) // 当前用户的会员类型、状态

const currentGood = computed(() => props.shortInfo?.membership?.find((item: any) => item.isRecommended) || {})
const beProxy = computed(() => {
  let prefix = ''
  // #ifdef MP-WEIXIN
  prefix = '/v1/be-proxy'
  // #endif
  return prefix
})
const selectSuggestList = computed(() => {
  return suggestList.value.filter(item => item.check) || []
})
const papers = computed(() => raiseInfo.value?.papers || [])
const levelText: any = computed(() => {
  const { baseRaiseScore = '', hardRaiseScore = '', baseRaiseSubjects = [] } = raiseInfo.value
  const subjectString = baseRaiseSubjects.join('、')
  return {
    优秀: {
      text1: (baseRaiseScore || hardRaiseScore) ? `抓住 <span class='active'>${baseRaiseScore || hardRaiseScore}分</span> ${baseRaiseScore ? '基础' : '拔高'}提升空间，保持绝对竞争力` : `分析成绩刷错题，保持绝对竞争力`,
      text2: '英语、语文、数学总丢冤枉分？',
      text3: 'AI挖掘出你的黄金提升点',
      text4: '',
    },
    中等偏上: {
      text1: (baseRaiseScore || hardRaiseScore) ? `发现 <span class='active'>${baseRaiseScore || hardRaiseScore}分</span> ${baseRaiseScore ? '基础' : '拔高'}提升空间，解决就能遥遥领先！` : '',
      text2: subjectString ? `${subjectString}总丢冤枉分？` : '',
      text3: 'AI挖掘出你的黄金提升点',
      text4: '',
    },
    中等: {
      text1: (baseRaiseScore || hardRaiseScore) ? `发现 <span class='active'>${baseRaiseScore || hardRaiseScore}分</span> ${baseRaiseScore ? '基础' : '拔高'}提升空间，解决就能遥遥领先！` : '',
      text2: subjectString ? `${subjectString}总丢冤枉分？` : '',
      text3: 'AI挖掘出你的黄金提升点',
      text4: '',
    },
    中等偏下: {
      text1: (baseRaiseScore || hardRaiseScore) ? `发现 <span class='active'>${baseRaiseScore || hardRaiseScore}分</span> ${baseRaiseScore ? '基础' : '拔高'}提升空间，逆风翻盘等你赢！` : '',
      text2: '个性提升方案已生成',
      text3: '定制基础错题训练包+微课精解',
      text4: '先补最该补的，跻身年级进步榜',
    },
    较弱: {
      text1: (baseRaiseScore || hardRaiseScore) ? `发现 <span class='active'>${baseRaiseScore || hardRaiseScore}分</span> ${baseRaiseScore ? '提升' : '拔高'}空间，逆风翻盘等你赢！` : '',
      text2: '个性提升方案已生成',
      text3: '定制基础错题训练包+微课精解',
      text4: '先补最该补的，跻身年级进步榜',
    },
  }
})

onMounted(async () => {
  await getRaiseInfo()
  popup.value = { show: true, mode: 'center', type: 'report' }
  closeAds()
})

// 处理考虑
async function handleThink() {
  report('short_long', 'year_bottom_ad_think')
  popup.value.show = false
  await uni.$u.sleep(350)
  popup.value = { show: true, mode: 'bottom', type: 'suggest' }
}

// 处理续费
async function paymentVIP() {
  popup.value.show = false
  const { memberType } = recommendation.value
  report('short_long', `${memberType}_bottom_ad`)
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
      text1: selectSuggestList.value.find(item => item.value === 3)?.inputValue || '',
      text2: selectSuggestList.value.find(item => item.value === 5)?.inputValue || '',
    },
  }
  await orderAction(2, params)
  emits('close')
}

// 处理关闭
async function handleClose() {
  report('short_long', 'year_bottom_ad_close')
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
    padding: 36rpx 24rpx 40rpx;
    position: relative;
    &-close {
      width: 44rpx;
      height: 44rpx;
      position: absolute;
      top: 24rpx;
      right: 24rpx;
    }
    &-header {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;
      &__title {
        width: 222rpx;
        height: 64rpx;
      }
      &__sub {
        width: 184rpx;
        height: 40rpx;
      }
    }
    &-desc {
      font-size: 28rpx;
      font-weight: bold;
      color: #666666;
      margin-bottom: 24rpx;
      .active {
        font-size: 32rpx;
        color: #1fc24c;
      }
    }
    &-score {
      width: 674rpx;
      background: linear-gradient(135deg, #c5d9ff, #d6e4ff);
      border-radius: 24rpx;
      padding: 20rpx 12rpx 12rpx;
      position: relative;
      margin-bottom: 40rpx;
      &__robot {
        width: 118rpx;
        height: 126rpx;
        position: absolute;
        top: 0;
        right: 0;
      }
      &__remind {
        font-size: 26rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 6rpx;
        padding-left: 10rpx;
      }
      &__desc {
        font-size: 30rpx;
        font-weight: bold;
        color: #3e3bff;
        margin-bottom: 12rpx;
        padding-left: 10rpx;
      }
      &__box {
        width: 100%;
        background: #ffffff;
        border-radius: 24rpx;
        padding: 32rpx 16rpx 22rpx 32rpx;
        position: relative;
        z-index: 99;
        .tips {
          font-size: 28rpx;
          font-weight: bold;
          color: #ff0000;
          margin-bottom: 20rpx;
        }
        .list {
          display: flex;
          flex-direction: column;
          &-item {
            display: flex;
            align-items: center;
            margin-bottom: 32rpx;
            .point {
              width: 12rpx;
              height: 12rpx;
              border-radius: 50%;
              background: #ff9b00;
              margin-right: 12rpx;
            }
            .subject {
              font-size: 28rpx;
              font-weight: bold;
              color: #333333;
            }
            .question {
              font-size: 28rpx;
              color: #333333;
              flex-grow: 1;
            }
            .lost {
              font-size: 28rpx;
              font-weight: bold;
              color: #ff9b00;
            }
          }
        }
        .points {
          width: 30rpx;
          height: 6rpx;
          margin: 0 0 24rpx 26rpx;
        }
        .explain {
          font-size: 24rpx;
          color: #939393;
          margin-left: 26rpx;
        }
      }
    }
    &-good {
      width: 674rpx;
      background: linear-gradient(135deg, #fff4f4, #ffe2e2);
      border: 4rpx solid #ff6363;
      border-radius: 20rpx;
      position: relative;
      padding: 26rpx 28rpx 14rpx;
      margin-bottom: 36rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      &__icon {
        width: 180rpx;
        height: 48rpx;
        position: absolute;
        top: -16rpx;
        left: -4rpx;
      }
      &__star {
        width: 148rpx;
        height: 146rpx;
        position: absolute;
        bottom: 0;
        right: 0;
        z-index: 10;
      }
      &__stage {
        font-size: 30rpx;
        font-weight: bold;
        color: #ff0000;
        margin-bottom: 8rpx;
      }
      &__minus {
        font-size: 26rpx;
        color: #939393;
        margin-bottom: 16rpx;
        .active {
          font-size: 32rpx;
          font-weight: bold;
          color: #ff0000;
        }
      }
      &__name {
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
      &__line {
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
        margin-bottom: 12rpx;
        position: relative;
        z-index: 20;
      }
      &__price {
        display: flex;
        align-items: baseline;
        margin-bottom: 6rpx;
        position: relative;
        z-index: 20;
        .original {
          display: flex;
          align-items: center;
          &-text {
            font-size: 28rpx;
            color: #939393;
            .value {
              text-decoration: line-through;
              margin-right: 6rpx;
            }
          }
          &-right {
            width: 32rpx;
            height: 24rpx;
            margin-right: 16rpx;
          }
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
      &__day {
        font-size: 24rpx;
        color: #939393;
      }
    }
    &-btns {
      width: 100%;
      display: flex;
      align-items: center;
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
  .suggest {
    padding: 24rpx 33rpx calc(env(safe-area-inset-bottom) + 32rpx) 32rpx;
    background: #ffffff;
    border-radius: 24rpx 24rpx 0rpx 0rpx;
    &-header {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;
      &__icon {
        width: 30rpx;
        height: 36rpx;
        margin-right: 12rpx;
      }
      &__title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
      }
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
