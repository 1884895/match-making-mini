<template>
  <view class="invite">
    <IProgress ref="progress" :inviter-info="inviterInfo" :prefix="prefix" :lead-data="leadData" @show-award="showAward" @select-award="selectAward" @show-rules="showRules" />
    <History :inviter-info="inviterInfo" :user-info="userInfo" @show-invite="showInvite" />
    <Invite :prefix="prefix" @share-poster="sharePoster" @share-qr="shareQr" @share-weixin="shareWeixin" />
    <Customer :is-member="isMember" />
    <Share @share-weixin="shareWeixin" @share-copy="shareCopy" />
    <Popup ref="popup" :prefix="prefix" :lead-data="leadData" :is-member="isMember" :inviter-info="inviterInfo" @share-remind="shareRemind" @share-weixin="shareWeixin" @share-copy="shareCopy" @show-remind-copy="showRemindCopy" @jump-page="jumpPage" @close-invite="closeInvite" @get-invitation="getInvitation" />
    <!-- eslint-disable-next-line vue/no-unused-refs -->
    <Painter ref="painter" @open-invite="openInvite" />
  </view>
</template>

<script>
import IProgress from './components/progress.vue'
import History from './components/history.vue'
import Invite from './components/invite.vue'
import Customer from './components/customer.vue'
import Share from './components/share.vue'
import Popup from './components/popup.vue'
import Painter from './components/painter.vue'
import mixins from './mixins.js'
import { isHFSStudent, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { IProgress, History, Invite, Customer, Share, Popup, Painter },
  mixins: [mixins],
  data() {
    return {
      pageType: 'invite',
      leadData: {
        text: '邀请朋友，冲刺进度！',
        role: 'role.png',
        roleGif: 'role-1.gif',
      },
    }
  },
  computed: {
    showVip() {
      // #ifdef H5
      if (isHFSStudent()) {
        return false
      }
      // #endif
      return true
    },
    inviteSuccessCount() {
      const { invitations = [] } = this.inviterInfo
      return invitations.filter(item => item.status === 2).length
    },
  },
  onLoad() {
    report(this.actionId, 'hdy2_show')
  },
  methods: {
    initPage(continueInvite) {
      const { invited, icode, awarded } = this.inviterInfo
      if (invited || awarded)
        this.leadData = this.getLeadData(this.inviterInfo)
      if (icode && continueInvite) {
        this.$refs.popup.open('invite', { title: '继续邀约！' })
        report(this.actionId, 'yytc_show')
      }
      else {
        this.$refs.progress.showGif = true
      }
    },
    closeInvite() {
      this.$refs.progress.showGif = true
    },
    getLeadData(inviterInfo) {
      const typeMap = { 1: `${inviterInfo.awardCount}天延时包`, 2: `${inviterInfo.awardCount}元优惠券`, 3: `功能券*${inviterInfo.awardCount}` }
      const dataMap = {
        1: {
          text: `已邀约${inviterInfo.invited}位朋友，继续加油！`,
          role: 'role.png',
          roleGif: 'role-2.gif',
        },
        2: {
          text: `恭喜获得${typeMap[inviterInfo.awarded]}，继续挑战赢更多！`,
          role: 'role.png',
          roleGif: 'role-3.gif',
        },
      }
      if (inviterInfo.awarded)
        return dataMap[2]
      return dataMap[1]
    },
    showAward(params) {
      this.$refs.popup.open('award', params)
    },
    showInvite() {
      this.$refs.popup.open('invite', { title: '提醒朋友绑定！', btnType: 'remind' })
      report(this.actionId, 'txtc_show')
    },
    selectAward() {
      const { awardVip, awardCoupon, awardTicket } = this.inviterInfo
      const params = {
        invited: this.inviteSuccessCount,
        ticketList: [
          { couponName: '延时包', type: 1, unit: '天', count: awardVip, tips: '会员适用', disabled: !this.isMember },
          { couponName: '功能券包', type: 3, unit: '', count: awardTicket, tips: '非会员适用', disabled: false },
        ],
      }
      if (!this.isHFSAppStudent)
        params.ticketList.push({ couponName: '优惠券', type: 2, unit: '￥', count: awardCoupon, tips: '通用', disabled: !this.showVip })
      params.ticketList.sort((a, b) => {
        return a.disabled - b.disabled
      })
      this.$refs.popup.open('select', params)
    },
    showRules() {
      this.$refs.popup.open('rules')
    },
    jumpPage(type, params = {}) {
      const jumpMap = {
        vip: { url: '/pages/me/member', target: 8, params: {}, mode: 2 },
        coupons: { url: '', target: `${feConfig.mobileUrl}/pages/growth/coupons`, params: {}, mode: 1 },
      }
      const { url = '', target, mode } = jumpMap[type] || {}
      // #ifdef MP-WEIXIN
      if (!url)
        return uni.showToast({ title: '请到APP端体验', icon: 'none' })
      uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      // #endif
      // #ifdef H5
      if (!target)
        return uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      nativeBridge.callHandler('adJump', JSON.stringify({ mode, target, data: params }))
      // #endif
    },
  },
  onShareAppMessage(e) {
    const { name = '' } = e.target.dataset || {}
    return name === 'remind' ? this.getShareRemindInfo() : this.getShareWeixinInfo()
  },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
.invite {
  min-height: 100vh;
}
</style>
