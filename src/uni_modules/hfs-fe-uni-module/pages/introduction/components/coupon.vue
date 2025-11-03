<template>
  <view class="coupon">
    <Payment :page-type="pageType" :prefix="prefix" :inviter-info="inviterInfo" :account-info="accountInfo" :payment-info="paymentInfo" :coupon-list="couponList" :show-coupon="true" @count-finish="countFinish" @payment-success="paymentSuccess" @report="report" />
  </view>
</template>

<script>
import Payment from './payment.vue'

export default {
  components: { Payment },
  props: {
    pageType: {
      type: String,
      default: '',
    },
    prefix: {
      type: String,
      default: '',
    },
    inviterInfo: {
      type: Object,
      default: () => ({}),
    },
    paymentInfo: {
      type: Object,
      default: () => ({}),
    },
    accountInfo: {
      type: Object,
      default: () => ({}),
    },
    couponList: {
      type: Array,
      default: () => ([]),
    },
  },
  emits: ['countFinish', 'paymentSuccess', 'report'],
  options: {
    styleIsolation: 'shared',
  },
  data() {
    return {}
  },
  methods: {
    countFinish() {
      this.$emit('countFinish')
    },
    paymentSuccess() {
      this.$emit('paymentSuccess')
    },
    report(type) {
      this.$emit('report', type)
    },
  },
}
</script>

<style lang="scss" scoped>
.coupon {
  background: #ffffff;
  border-radius: 0 0 40rpx 40rpx;
  margin: -2rpx 20rpx 24rpx 22rpx;
  padding: 18rpx 32rpx 32rpx;
  ::v-deep .payment {
    position: initial !important;
    &-checked {
      height: auto;
      background: none;
      padding: 0;
      margin-bottom: 12rpx;
      &__icon {
        width: 24rpx;
        height: 24rpx;
        .bar {
          width: 12rpx;
          height: 12rpx;
        }
      }
      &__text {
        font-size: 22rpx;
        margin-left: 8rpx;
      }
    }
    &-goods {
      padding: 0;
      &__button {
        height: 102rpx;
        background: #ffdac8;
        .price {
          .active {
            font-size: 52rpx;
          }
        }
        .original {
          &-discount {
            font-size: 26rpx;
          }
          &-price {
            font-size: 22rpx;
          }
        }
        .btn {
          height: 102rpx;
        }
      }
    }
  }
}
</style>
