<template>
  <view class="study">
    <view class="coin">
      <view class="coin-title">
        <image class="coin-title__icon" :src="`${resourceUrl}study_icon.png`" />
        学币套餐
      </view>
      <view class="coin-list">
        <view v-for="(item, index) in studyCoins" :key="index" class="coin-item" @click="selectCoin(item)">
          <image class="coin-item-bg" :src="resourceUrl + bgSrc(item)" />
          <view class="coin-item-name">
            {{ item.name }}
          </view>
          <view class="coin-item-cost">
            {{ isReview ? item.iapCost : item.cost }}
            <span class="coin-item-cost-unit">元</span>
          </view>
        </view>
      </view>
      <Payment ref="payment" @success="paymentSuccess" @fail="paymentFail">
        <view v-if="upgradeInfo.upgrade || shortInfo.show" class="upgrade">
          <slot name="payment">
            <view class="upgrade-button" @click="paymentVIP">
              立即支付 {{ isReview ? currentItem.iapCost : currentItem.cost }} 元
            </view>
          </slot>
        </view>
        <view v-else class="pay">
          <slot name="payment">
            <view class="pay-button" @click="paymentVIP">
              <view class="pay-button__btn">
                <view>
                  立即支付 {{ isReview ? currentItem.iapCost : currentItem.cost }} 元
                </view>
              </view>
            </view>
          </slot>
          <view class="pay-tips" @click="openProtocol">
            支付即视为同意<text class="active">
              《会员协议》
            </text>
          </view>
        </view>
      </Payment>
    </view>
    <ShortToLong v-if="shortInfo.show" :from="shortFrom" :short-info="shortInfo" @abandon="shortInfo.show = false" @payment="shortInfo.show = false" />
    <OldUserDiscount v-if="upgradeInfo.upgrade" :upgrade-info="upgradeInfo" action="gm_xb" />
  </view>
</template>

<script>
import Payment from '../../components/payment.vue'
import { IAPId, payThroughEnum, payThroughList } from '../util.js'
import OldUserDiscount from './oldUserDiscount.vue'
import ShortToLong from './shortToLong.vue'
import { isHFSParent } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Payment, OldUserDiscount, ShortToLong },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/member/',
      studyCoins: [],
      currentItem: {},
      upgradeInfo: {},
      shortInfo: {},
      shortFrom: 'coin',
    }
  },
  computed: {
    beProxy() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/be-proxy'
      // #endif
      return prefix
    },
    payWayList() {
      return payThroughList()
    },
    isIos() {
      return uni.$u.os() === 'ios'
    },
    isReview() {
      return isHFSParent() && this.isIos
    },
  },
  created() {
    this.getCoinList()
    this.getUpgrade()
    !this.upgradeInfo.upgrade && this.getShortRecommend()
  },
  methods: {
    async getUpgrade() {
      const res = await uni.$http.get(`${this.beProxy}/v2/payments/upgrade-popup`)
      this.upgradeInfo = res.data || {}
    },
    async getCoinList() {
      const res = await uni.$http.get(`${this.beProxy}/v2/payments/goods-list`)
      const { studyCoins = [] } = res.data || []
      this.studyCoins = studyCoins || []
      this.currentItem = this.studyCoins[0] || {}
    },
    selectCoin(item) {
      this.currentItem = item
    },
    bgSrc(item) {
      return item.no === this.currentItem.no ? 'coin_selected.png' : 'coin_unselected.png'
    },
    paymentVIP() {
      // #ifdef H5
      if (this.isReview) {
        this.$refs.payment.finalParams.payThrough = payThroughEnum.IOSIAP.payThrough
        return this.$refs.payment.appPayment({ productId: `${IAPId.coin}${this.currentItem.no}` })
      }
      // #endif
      const params = {
        couponId: '',
        goodNo: this.currentItem.no,
        goodType: 2,
        payThrough: this.payWayList[0].payThrough,
        studyCoinCount: 0,
        useStudyCoin: 3,
      }
      this.$refs.payment.paymentVIP(params)
    },
    paymentSuccess() {
      uni.showToast({ title: '购买成功', icon: 'none' })
      this.getUpgrade()
    },
    paymentFail(err) {
      return uni.$u.toast(err.errMsg || err)
    },
    openProtocol() {
      let url = '/pages/agreement/index'
      // #ifdef MP-WEIXIN
      url = `/pages/webview/webview?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}`)}`
      // #endif
      return uni.navigateTo({ url })
    },
    // 获取短期变长期推荐
    async getShortRecommend() {
      const res = await uni.$http.get(`${this.beProxy}/v3/strategy/recommend-goods`, { from: this.shortFrom }, { custom: { loading: false, error: false } })
      const { recommendation = {} } = res.data || {}
      const { memberType = '' } = recommendation
      if (memberType === 'month' || memberType === 'jidu' || memberType === 'halfYear') {
        this.shortInfo = res.data || {}
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.study {
  background: #f6f6f6;
  .coin {
    background: #ffffff;
    padding: 16rpx 28rpx 44rpx 28rpx;
    margin-bottom: 20rpx;
  }

  .coin-title {
    display: flex;
    align-items: center;
    font-size: 32rpx;
    color: #333333;
    font-weight: bold;
    padding-bottom: 28rpx;
    &__icon {
      width: 56rpx;
      height: 56rpx;
      margin-right: 16rpx;
    }
  }

  .coin-list {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 36rpx;
  }

  .coin-item {
    position: relative;
    width: 220rpx;
    height: 240rpx;
    border-radius: 16rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    &-name {
      font-size: 26rpx;
      color: #70450f;
      z-index: 1;
    }
    &-cost {
      display: flex;
      align-items: baseline;
      font-size: 64rpx;
      color: #ff381b;
      font-weight: bold;
      z-index: 1;
      &-unit {
        margin-left: 6rpx;
        font-size: 24rpx;
        color: #5d3a0c;
      }
    }
  }

  .upgrade {
    width: 100%;
    display: flex;
    justify-content: center;
    &-button {
      background: #ffba1d;
      border-radius: 42rpx;
      padding: 14rpx 66rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #ffffff;
    }
  }
  .pay {
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 999;
    padding: 20rpx 0 12rpx;
    padding: 20rpx 0 calc(env(safe-area-inset-bottom) + 12rpx);
    background: #ffffff;
    border-radius: 24rpx 24rpx 0 0;
    box-shadow: 0rpx -4rpx 12rpx 0rpx rgba(0, 0, 0, 0.04);
    &-button {
      padding: 0 28rpx;
      &__btn {
        width: 100%;
        height: 84rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        color: #ffffff;
        font-weight: bold;
        background: linear-gradient(225deg, #ffa430 0%, #ff7426);
        border-radius: 42rpx;
        margin-bottom: 12rpx;
      }
    }
    &-tips {
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
