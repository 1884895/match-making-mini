<template>
  <view class="share">
    <Header :page-type="pageType" :group-info="groupInfo" :grade="grade" />
    <IProgress v-if="pageType === '4'" :group-info="groupInfo" :page-type="pageType" :payment-info="paymentInfo" :grade="grade" @report="report" @count-finish="countFinish" />
    <Play v-if="pageType === '5'" :page-type="pageType" :group-info="groupInfo" :open-group-info="openGroupInfo" :payment-info="paymentInfo" :grade="grade" />
    <Marquee :page-type="pageType" :prefix="prefix" :group-info="groupInfo" :role-type="roleType" />
    <Vip :group-info="groupInfo" :grade="grade" />
    <Footer :page-type="pageType" :group-info="groupInfo" :grade="grade" />
    <ListScroll :page-type="pageType" :prefix="prefix" :group-info="groupInfo" :grade="grade" :role-type="roleType" />
    <Payment ref="payment" :page-type="pageType" :prefix="prefix" :group-info="groupInfo" :open-group-info="openGroupInfo" :payment-info="paymentInfo" :account-info="accountInfo" @report="report" @payment-report="paymentReport" @payment-success-report="paymentSuccessReport" />
  </view>
</template>

<script>
import Header from './components/header.vue'
import Marquee from './components/marquee.vue'
import IProgress from './components/progress.vue'
import Play from './components/play.vue'
import Vip from './components/vip.vue'
import Footer from './components/footer.vue'
import ListScroll from './components/listScroll.vue'
import Payment from './components/payment.vue'
import mixins from './mixins.js'

export default {
  components: { Header, Marquee, IProgress, Play, Vip, Footer, ListScroll, Payment }, // eslint-disable-line vue/no-reserved-component-names
  mixins: [mixins],
  data() {
    return {
      options: {},
    }
  },
  computed: {
    pageType() {
      return this.groupEnd ? '5' : '4'
    },
  },
  methods: {
    initPage() {
      this.report(this.groupEnd ? 'activity_share_page_show' : 'share_page_show')
      const { joinAskId = '' } = this.groupInfo
      if (joinAskId) {
        return uni.redirectTo({
          url: `/uni_modules/hfs-fe-uni-module/pages/group/invite?askId=${joinAskId}`,
        })
      }
      if (this.options.paymentId) {
        this.$refs.payment.open()
        this.$refs.payment.paymentOptions = this.options
      }
      this.getOpenGroupInfo()
    },
    countFinish() {
      return uni.redirectTo({
        url: `${uni.$u.page()}${uni.$u.queryParams(this.options)}`,
      })
    },
    paymentReport(activityType, askId) {
      this.report(askId ? 'share_page_owner_btn_click' : 'share_page_join_btn_click')
    },
    paymentSuccessReport(activityType) {
      this.report(activityType ? 'share_page_pay_success_count' : 'one_purchase_pay_success')
    },
  },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>
