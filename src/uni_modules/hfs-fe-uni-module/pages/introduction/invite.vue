<template>
  <view class="invite">
    <Header :page-type="pageType" :inviter-info="inviterInfo" />
    <IProgress ref="progress" :page-type="pageType" :inviter-info="inviterInfo" @order="order" @report="report" />
    <Footer :page-type="pageType" :inviter-info="inviterInfo" />
    <ListScroll :page-type="pageType" :prefix="prefix" :inviter-info="inviterInfo" />
    <Recommend :page-type="pageType" :prefix="prefix" :inviter-info="inviterInfo" @share-weixin="shareWeixin" @report="report" />
    <Customer :page-type="pageType" :payment-info="paymentInfo" :share="showShare" @report="report" />
    <Share v-show="showShare" :page-type="pageType" @share-poster="sharePoster" @share-qr="shareQr" @share-weixin="shareWeixin" @share-ding-ding="shareDingDing" @report="report" />
    <Popup ref="popup" :page-type="pageType" :inviter-info="inviterInfo" @share-weixin="shareWeixin" @share-ding-ding="shareDingDing" @submit="submit" @report="report" />
    <!-- eslint-disable-next-line vue/no-unused-refs -->
    <Painter ref="painter" />
  </view>
</template>

<script>
import Header from './components/header.vue'
import IProgress from './components/progress.vue'
import Footer from './components/footer.vue'
import ListScroll from './components/listScroll.vue'
import Recommend from './components/recommend.vue'
import Customer from './components/customer.vue'
import Share from './components/share.vue'
import Popup from './components/popup.vue'
import Painter from './components/painter.vue'
import mixins from './mixins.js'

export default {
  components: { Header, IProgress, Footer, ListScroll, Recommend, Customer, Share, Popup, Painter }, // eslint-disable-line vue/no-reserved-component-names
  mixins: [mixins],
  data() {
    return {
      pageType: 'invite',
      showShare: false,
    }
  },
  methods: {
    initPage() {
      this.report('invite_show')
      const { askCount = 0, awardConf = [], awardType = 0 } = this.inviterInfo
      const { coin = 0, vip = 0 } = awardConf[askCount] || {}
      const awardMap = {
        1: `${coin}学币`,
        2: `${vip}天会员服务`,
      }
      const tips = awardType > 0 ? awardMap[awardType] : `${coin}学币/${vip}天会员服务`
      this.$refs.popup.open('invite', { tips: awardConf[askCount] ? tips : '' })
    },
    order() {
      const { awardType = 0, friends = [] } = this.inviterInfo
      const statusMap = { 0: '已开通', 1: '已开通', 2: '已退费' }
      this.$refs.popup.open('reservation', {
        awardType,
        title: awardType > 0 ? '奖励记录' : '预约领取奖励',
        columns: [{ name: '用户', key: 'name' }, { name: '开通时间', key: 'time' }, { name: '开通状态', key: 'status' }, { name: '可获奖励', key: 'award' }, { name: '奖励生效时间', key: 'awardTime' }],
        tableData: friends.map((v) => {
          const { name, time, status, awardCoin, awardVip, awardTime } = v
          const awardMap = {
            1: `${awardCoin}学币`,
            2: `${awardVip}天会员`,
          }
          const tips = awardType > 0 ? awardMap[awardType] : `${awardCoin}学币/${awardVip}天会员`
          return { name, time: uni.$u.timeFormat(time, 'yyyy.mm.dd'), status: statusMap[status], award: tips, awardTime: uni.$u.timeFormat(awardTime, 'yyyy.mm.dd') }
        }),
      })
    },
    async submit(type) {
      const { askId } = this.inviterInfo
      await uni.$http.post(`${this.prefix}/v3/activity/friend/award`, { askId, type })
      this.inviterInfo.awardType = type
      this.$refs.popup.open('toast', {
        icon: 'checkmark-circle-fill',
        iconColor: '#28C445',
        title: '奖励预约成功！',
        desc: '好友开通后30天未退费奖励自动生效',
      })
    },
  },
  onPageScroll() {
    uni.$u.debounce(() => {
      const windowHeight = uni.getWindowInfo().windowHeight
      uni.createSelectorQuery().in(this.$refs.progress).select('.progress-content__button').boundingClientRect((data) => {
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
