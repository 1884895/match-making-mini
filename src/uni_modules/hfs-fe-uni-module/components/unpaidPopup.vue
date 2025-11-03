<template>
  <view v-if="!hideMember && degradeInfo.id" class="unpaid">
    <view class="unpaid-content">
      <image class="unpaid-content__bg" :src="`${resourceUrl}/unpaid_bg.png`" mode="widthFix" />
      <view class="unpaid-content__info">
        <view class="message">
          <view v-if="degradeInfo.cardType === 'huhang'" class="message-item">
            <view class="title">【{{ degradeInfo.name }}】心愿补贴金来啦！</view>
            <view class="desc pl-20">
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/huhang_1.png`" mode="widthFix" />
                <view class="desc-item__text">服务期<text class="active">不限次</text>考试分析+考后提升方案</view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/huhang_2.png`" mode="widthFix" />
                <view class="desc-item__text">
                  <text>月均成本 ≈</text>
                  <text class="active">1 杯奶茶钱</text>
                  <image class="naicha" :src="`${resourceUrl}/huhang_3.png`" mode="widthFix" />
                  <text class="small ml-8">（原订单价￥{{ degradeInfo.original }}→</text>
                  <text class="active"><text class="active-small">补贴价￥</text>{{ degradeInfo.cost }}</text>
                  <text class="small">）</text>
                </view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/huhang_4.png`" mode="widthFix" />
                <view class="desc-item__text"><text class="active">{{ degradeInfo.degradeType ? '补贴 10%' : '限时补贴' }}，仅享 1 次</text><template v-if="degradeInfo.dayPrice < 0.99">，补贴后低至 {{ degradeInfo.dayPrice }} 元/天</template></view>
              </view>
            </view>
          </view>
          <view v-if="degradeInfo.cardType === 'year'" class="message-item">
            <view class="title">【一年会员】专属福利来啦！</view>
            <view class="desc pl-20">
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/year_1.png`" mode="widthFix" />
                <view class="desc-item__text">全年<text class="active">不限次</text>考试分析+考后提升方案</view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/year_2.png`" mode="widthFix" />
                <view class="desc-item__text">
                  <text>月均成本比一本辅导书便宜多了</text>
                  <text class="small">（原价￥{{ degradeInfo.original }}→</text>
                  <text class="active"><text class="active-small">补贴价￥</text>{{ degradeInfo.cost }}</text>
                  <text class="small">）</text>
                </view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/huhang_4.png`" mode="widthFix" />
                <view class="desc-item__text"><text class="active">{{ degradeInfo.degradeType ? '补贴 10%' : '限时补贴' }}，仅享 1 次</text><template v-if="degradeInfo.dayPrice < 0.99">，补贴后低至 {{ degradeInfo.dayPrice }} 元/天</template></view>
              </view>
            </view>
          </view>
          <view v-if="degradeInfo.cardType === 'halfyear'" class="message-item">
            <view class="title">【半年卡】智慧之选！</view>
            <view class="desc pl-20">
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/halfyear_1.png`" mode="widthFix" />
                <view class="desc-item__text">32 项会员功能全开放</view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/huhang_2.png`" mode="widthFix" />
                <view class="desc-item__text">
                  <text>月均成本 ≈ 2 支中性笔开支</text>
                  <image class="pen" :src="`${resourceUrl}/halfyear_2.png`" mode="widthFix" />
                  <image class="pen ml-14" :src="`${resourceUrl}/halfyear_2.png`" mode="widthFix" />
                  <text class="small ml-14">（原价￥{{ degradeInfo.original }}→</text>
                  <text class="active"><text class="active-small">补贴价￥</text>{{ degradeInfo.cost }}</text>
                  <text class="small">）</text>
                </view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/huhang_4.png`" mode="widthFix" />
                <view class="desc-item__text"><text class="active">{{ degradeInfo.degradeType ? '补贴 10%' : '限时补贴' }}，仅享 1 次</text><template v-if="degradeInfo.dayPrice < 0.99">，补贴后低至 {{ degradeInfo.dayPrice }} 元/天</template></view>
              </view>
            </view>
          </view>
          <view v-if="degradeInfo.cardType === 'jidu'" class="message-item">
            <view class="title">【季度会员】智慧之选！</view>
            <view class="desc">
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/halfyear_1.png`" mode="widthFix" />
                <view class="desc-item__text">32 项会员功能全开放</view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/huhang_2.png`" mode="widthFix" />
                <view class="desc-item__text">
                  <text>月成本 ≈ 1 杯奶茶钱</text>
                  <image class="mixue" :src="`${resourceUrl}/month_1.png`" mode="widthFix" />
                  <text class="small ml-14">（原价￥{{ degradeInfo.original }}→</text>
                  <text class="active"><text class="active-small">补贴价￥</text>{{ degradeInfo.cost }}</text>
                  <text class="small">）</text>
                </view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/huhang_4.png`" mode="widthFix" />
                <view class="desc-item__text"><text class="active">仅享 1 次</text><template v-if="degradeInfo.dayPrice < 0.99">，历史首次，补贴后低至 {{ degradeInfo.dayPrice }} 元/天</template></view>
              </view>
            </view>
          </view>
          <view v-if="degradeInfo.cardType === 'month'" class="message-item">
            <view class="title">【{{ degradeInfo.cost }}元购月度会员】羊毛党狂喜！</view>
            <view class="desc">
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/halfyear_1.png`" mode="widthFix" />
                <view class="desc-item__text">32 项会员功能全开放</view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/huhang_2.png`" mode="widthFix" />
                <view class="desc-item__text">
                  <text>月成本 ≈ 1 杯蜜雪冰城</text>
                  <image class="mixue" :src="`${resourceUrl}/month_1.png`" mode="widthFix" />
                  <text class="small ml-14">（原价￥{{ degradeInfo.original }}→</text>
                  <text class="active"><text class="active-small">补贴价￥</text>{{ degradeInfo.cost }}</text>
                  <text class="small">）</text>
                </view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/huhang_4.png`" mode="widthFix" />
                <view class="desc-item__text"><text class="active">仅享 1 次</text><template v-if="degradeInfo.dayPrice < 0.99">，历史首次，补贴后低至 {{ degradeInfo.dayPrice }} 元/天</template></view>
              </view>
            </view>
          </view>
          <view v-if="degradeInfo.cardType === 'week'" class="message-item">
            <view class="title">【{{ degradeInfo.cost }} 元拿一周会员】价格龙卷风来袭！</view>
            <view class="desc">
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/halfyear_1.png`" mode="widthFix" />
                <view class="desc-item__text">32 项会员功能全开放</view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/huhang_2.png`" mode="widthFix" />
                <view class="desc-item__text">
                  <text>周成本 ≈ 1 根棒棒糖</text>
                  <image class="mixue" :src="`${resourceUrl}/week_1.png`" mode="widthFix" />
                  <text class="small">（原价￥{{ degradeInfo.original }}→</text>
                  <text class="active"><text class="active-small">补贴价￥</text>{{ degradeInfo.cost }}</text>
                  <text class="small">）</text>
                </view>
              </view>
              <view class="desc-item">
                <image class="desc-item__icon" :src="`${resourceUrl}/huhang_4.png`" mode="widthFix" />
                <view class="desc-item__text"><text class="active">仅享 1 次！历史首次！也是最后一次！</text></view>
              </view>
            </view>
          </view>
        </view>
        <view class="btns">
          <view class="btns-abandon" @click="handleAbandon">放弃补贴</view>
          <view class="btns-pay" @click="paymentVIP">{{ `立即支付 ${degradeInfo.cost} 元` }}</view>
        </view>
      </view>
      <view class="unpaid-content__close" @click="handleClose"><up-icon class="close" name="close" color="#333" size="34rpx" bold /></view>
    </view>
    <Payment ref="payment" @success="paymentSuccess" />
  </view>
</template>

<script setup lang="ts">
import Payment from '../memberPages/components/payment.vue'
import { isMiniProgram, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

const props = withDefaults(defineProps<{
  degradeInfo: any
}>(), {
  degradeInfo: () => ({}),
})
const emits = defineEmits(['close', 'abandon', 'payment', 'paymentSuccess'])
const resourceUrl = 'https://fe-resource.haofenshu.com/unpaid'
const payment = ref()
const hideMember = computed(() => {
  const userInfo = uni.getStorageSync('userInfo') || getApp().globalData?.userInfo || {}
  return userInfo.hideMember || false
})

const beProxy = computed(() => {
  let prefix = ''
  // #ifdef MP-WEIXIN
  prefix = '/v1/be-proxy'
  // #endif
  return prefix
})
const degradeInfo = computed(() => props.degradeInfo || {})

// 关闭按钮
async function handleClose() {
  unpaidReport(1)
  const res = await orderAction(1)
  emits('close', res.data)
}

// 放弃补贴
function handleAbandon() {
  unpaidReport(2)
  orderAction(2)
  emits('abandon')
}

// 立即支付
function paymentVIP() {
  emits('payment')
  unpaidReport(3)
  const { id, cid } = degradeInfo.value
  const url = `/pages/me/member${uni.$u.queryParams({ unpayId: id, cid })}`
  // #ifdef H5
  if (isMiniProgram()) {
    return jWeixin.miniProgram.navigateTo({ url })
  }
  nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${location.origin}/uni_modules/hfs-fe-uni-module/memberPages/member/member${uni.$u.queryParams({ unpayId: id, cid })}` }))
  // #endif
  // #ifdef MP-WEIXIN
  uni.navigateTo({ url })
  // #endif
}

function paymentSuccess() {
  emits('paymentSuccess')
}

// 待支付弹窗-用户反馈
async function orderAction(action: number) {
  const { id, degradeType, degradeLevel } = degradeInfo.value
  const params = { id, action, degradeType, degradeLevel }
  return await uni.$http.post(`${beProxy.value}/v2/payments/order-action`, params, { custom: { loading: false, error: false } })
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
  uni.$http.post(`${beProxy.value}/v3/action/unpay-degrade`, params, { custom: { loading: false, error: false } })
}
</script>

<style lang="scss" scoped>
.unpaid {
  background: #f6f6f6;
  width: 100%;
  padding-bottom: env(safe-area-inset-bottom);
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 9999;
  &-content {
    position: relative;
    &__info {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      .message {
        padding: 48rpx 6rpx 0;
        &-item {
          .title {
            font-size: 28rpx;
            font-weight: bold;
            color: #864400;
            margin-bottom: 30rpx;
          }
          .desc {
            padding-left: 32rpx;
            &.pl-20 {
              padding-left: 20rpx;
            }
            &-item {
              display: flex;
              align-items: center;
              margin-bottom: 18rpx;
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
                height: 40rpx;
                display: flex;
                align-items: center;
                font-size: 26rpx;
                color: #70450f;
                flex-shrink: 0;
                .active {
                  font-size: 28rpx;
                  color: #ff0000;
                  font-weight: bold;
                  &-small {
                    font-size: 22rpx;
                  }
                }
                .naicha {
                  width: 42rpx;
                  height: 60rpx;
                }
                .pen {
                  width: 34rpx;
                  height: 78rpx;
                }
                .mixue {
                  width: 48rpx;
                  height: 76rpx;
                  margin-left: 8rpx;
                }
                .ml-14 {
                  margin-left: -14rpx;
                }
                .ml-8 {
                  margin-left: -8rpx;
                }
                .small {
                  font-size: 22rpx;
                  color: #aa7526;
                  font-weight: bold;
                }
              }
            }
          }
        }
      }
      .btns {
        width: 100%;
        position: absolute;
        bottom: 12rpx;
        display: flex;
        align-items: center;
        padding: 0 36rpx;
        &-abandon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 224rpx;
          height: 72rpx;
          background: #f6f6f6;
          border-radius: 40rpx;
          font-size: 32rpx;
          color: #939393;
          margin-right: 16rpx;
        }
        &-pay {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 72rpx;
          background: linear-gradient(315deg, #ffa430 0%, #ff7627);
          border: 2rpx solid #ffffff;
          border-radius: 40rpx;
          flex-grow: 1;
          font-size: 32rpx;
          font-weight: bold;
          color: #ffffff;
        }
      }
    }
    &__bg {
      width: 100%;
      height: 394rpx;
    }
    &__close {
      padding: 20rpx;
      position: absolute;
      right: 0;
      top: 6rpx;
      transform: translateY(-100%);
    }
  }
}
</style>
