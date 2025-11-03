<template>
  <view class="operation">
    <Header :page-type="pageType" :inviter-info="inviterInfo" />
    <Invite ref="invite" :page-type="pageType" :inviter-info="inviterInfo" @share-poster="sharePoster" @share-qr="shareQr" @share-weixin="shareWeixin" @report="report" />
    <Marquee :page-type="pageType" :prefix="prefix" :inviter-info="inviterInfo" />
    <Vip />
    <Footer :page-type="pageType" :inviter-info="inviterInfo" />
    <ListScroll :page-type="pageType" :prefix="prefix" :inviter-info="inviterInfo" />
    <Recommend :page-type="pageType" :prefix="prefix" :inviter-info="inviterInfo" @share-weixin="shareWeixin" @report="report" />
    <Customer :page-type="pageType" :payment-info="paymentInfo" :share="showShare" @report="report" />
    <Share v-show="showShare" :page-type="pageType" @share-poster="sharePoster" @share-qr="shareQr" @share-weixin="shareWeixin" @share-ding-ding="shareDingDing" @report="report" />
    <!-- eslint-disable-next-line vue/no-unused-refs -->
    <Popup ref="popup" :page-type="pageType" :inviter-info="inviterInfo" />
    <!-- eslint-disable-next-line vue/no-unused-refs -->
    <Painter ref="painter" />
  </view>
</template>

<script>
import Header from './components/header.vue'
import Invite from './components/invite.vue'
import Marquee from './components/marquee.vue'
import Vip from './components/vip.vue'
import Footer from './components/footer.vue'
import ListScroll from './components/listScroll.vue'
import Recommend from './components/recommend.vue'
import Customer from './components/customer.vue'
import Share from './components/share.vue'
import Popup from './components/popup.vue'
import Painter from './components/painter.vue'
import mixins from './mixins.js'

export default {
  components: { Header, Invite, Marquee, Vip, Footer, ListScroll, Recommend, Customer, Share, Popup, Painter }, // eslint-disable-line vue/no-reserved-component-names
  mixins: [mixins],
  data() {
    return {
      pageType: 'operation',
      showShare: false,
    }
  },
  methods: {
    initPage() {
      this.report('operation_show')
      const { askCount = 0 } = this.inviterInfo
      if (askCount > 0) {
        return uni.redirectTo({ url: '/uni_modules/hfs-fe-uni-module/pages/introduction/invite' })
      }
    },
  },
  onPageScroll() {
    uni.$u.debounce(() => {
      const windowHeight = uni.getWindowInfo().windowHeight
      uni.createSelectorQuery().in(this.$refs.invite).select('.invited-content__button').boundingClientRect((data) => {
        this.showShare = !(data.top <= windowHeight && data.top > 0)
      }).exec()
    }, 10)
  },
  onShareAppMessage() {
    return this.getShareWeixinInfo()
  },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>
