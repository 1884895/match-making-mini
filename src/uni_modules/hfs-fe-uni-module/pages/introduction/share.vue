<template>
  <view class="share">
    <Header :page-type="pageType" :inviter-info="inviterInfo" />
    <Coupon ref="coupon" :page-type="pageType" :prefix="prefix" :inviter-info="inviterInfo" :account-info="accountInfo" :payment-info="paymentInfo" :coupon-list="couponList" @count-finish="countFinish" @payment-success="paymentSuccess" @report="report" />
    <Marquee :page-type="pageType" :prefix="prefix" :inviter-info="inviterInfo" />
    <Vip />
    <Footer :page-type="pageType" :inviter-info="inviterInfo" />
    <ListScroll :page-type="pageType" :prefix="prefix" :inviter-info="inviterInfo" />
    <Customer :page-type="pageType" :payment-info="paymentInfo" @report="report" />
    <Payment v-show="showPayment" :page-type="pageType" :prefix="prefix" :inviter-info="inviterInfo" :account-info="accountInfo" :payment-info="paymentInfo" :coupon-list="couponList" @payment-success="paymentSuccess" @report="report" />
    <Popup ref="popup" :page-type="pageType" :inviter-info="inviterInfo" @coupon="collectCoupon" @report="report" />
  </view>
</template>

<script>
import Header from './components/header.vue'
import Coupon from './components/coupon.vue'
import Marquee from './components/marquee.vue'
import Vip from './components/vip.vue'
import Footer from './components/footer.vue'
import ListScroll from './components/listScroll.vue'
import Customer from './components/customer.vue'
import Payment from './components/payment.vue'
import Popup from './components/popup.vue'
import mixins from './mixins.js'

export default {
  components: { Header, Coupon, Marquee, Vip, Footer, ListScroll, Customer, Payment, Popup }, // eslint-disable-line vue/no-reserved-component-names
  mixins: [mixins],
  data() {
    return {
      pageType: 'share',
      showPayment: false,
    }
  },
  methods: {
    async initPage() {
      this.report('share_show')
      const { couponConf = [] } = this.inviterInfo
      couponConf.length && this.$refs.popup.open('coupon', { couponConf: couponConf.reverse() })
      this.countFinish()
    },
    async collectCoupon(couponConf) {
      for (let i = 0; i < couponConf.length; i++) {
        try {
          const { couponGroup } = couponConf[i]
          await this.getCoupon(couponGroup)
        }
        catch (err) {
          this.showError(err)
          break
        }
      }
      this.$refs.popup.close()
      this.countFinish()
    },
    async countFinish() {
      await this.getCouponList()
    },
    paymentSuccess() {
      this.report('share_pay_success')
      this.$refs.popup.open('operation')
    },
  },
  onPageScroll() {
    uni.$u.debounce(() => {
      const windowHeight = uni.getWindowInfo().windowHeight
      uni.createSelectorQuery().in(this.$refs.coupon).select('.coupon').boundingClientRect((data) => {
        this.showPayment = !(data.top <= windowHeight && data.top > 0)
      }).exec()
    }, 10)
  },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>
