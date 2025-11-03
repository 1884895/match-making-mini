<template>
  <view class="open">
    <Header :page-type="pageType" :group-info="groupInfo" :grade="grade" />
    <Play :page-type="pageType" :group-info="groupInfo" :open-group-info="openGroupInfo" :payment-info="paymentInfo" :grade="grade" />
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
import Play from './components/play.vue'
import Vip from './components/vip.vue'
import Footer from './components/footer.vue'
import ListScroll from './components/listScroll.vue'
import Payment from './components/payment.vue'
import mixins from './mixins.js'

export default {
  components: { Header, Marquee, Play, Vip, Footer, ListScroll, Payment }, // eslint-disable-line vue/no-reserved-component-names
  mixins: [mixins],
  data() {
    return {}
  },
  computed: {
    pageType() {
      return '1'
    },
  },
  methods: {
    initPage() {
      this.report('page1_show')
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
      // #ifdef MP-WEIXIN
      wx.enableAlertBeforeUnload({ message: '退出后，将错过【底价购会员】确定退出吗？' })
      // #endif
    },
    paymentReport(activityType) {
      this.report(activityType ? 'page1_more_purchase_btn_click' : 'one_purchase_btn_click')
    },
    paymentSuccessReport(activityType) {
      this.report(activityType ? 'owner_pay_success_count' : 'one_purchase_pay_success')
    },
  },
  onShareAppMessage() {
    const { shareHY = {} } = this.groupInfo
    const { activityIntroduce = {} } = shareHY
    return {
      title: activityIntroduce.title,
      path: '/uni_modules/hfs-fe-uni-module/pages/group/open',
      imageUrl: activityIntroduce.imageUrl,
    }
  },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>
