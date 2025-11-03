<template>
  <view class="invite">
    <image class="invite-head" :src="`${resourceUrl}invite_head_bg.png`" mode="widthFix" />
    <History :inviter-info="inviterInfo" :user-info="userInfo" @show-invite="showInvite" @show-award="showAward" />
    <image class="invite-detail" :src="`${resourceUrl}invite_detail.png`" mode="widthFix" />
    <Share @share-weixin="handleWeixin" @share-copy="handleCopy" />
    <view class="invite-rules" @click="showRules">活动规则</view>
    <Popup ref="popup" :is-member="isMember" :inviter-info="inviterInfo" :award-list="awardList" @share-remind="shareRemind" @share-weixin="shareWeixin" @share-copy="shareCopy" @show-remind-copy="showRemindCopy" />
    <!-- eslint-disable-next-line vue/no-unused-refs -->
    <Painter ref="painter" @open-invite="openInvite" />
  </view>
</template>

<script>
import History from './components/history.vue'
import Share from './components/share.vue'
import Popup from './components/popup.vue'
import Painter from './components/painter.vue'
import mixins from './mixins.js'
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { History, Share, Popup, Painter },
  mixins: [mixins],
  data() {
    return {
      pageType: 'invite',
    }
  },
  async onLoad() {
    report(this.actionId, 'hdy2_show')
    await this.acceptAward()
    this.getAwardList()
  },
  methods: {
    async acceptAward() {
      await uni.$http.post(`${this.prefix}/v3/new-promoter/award`, {}, { custom: { error: false, loading: false } })
    },
    initPage() {
      this.inviterInfo.icode && this.openInvite()
    },
    showAward() {
      this.$refs.popup.open('award', { awardList: this.awardList })
    },
    showInvite() {
      this.$refs.popup.open('share', { title: '提醒朋友绑定！', btnType: 'remind' })
    },
    showRules() {
      uni.navigateTo({ url: '/uni_modules/hfs-fe-uni-module/pages/newPromoter/rule' })
    },
    handleWeixin() {
      report(this.actionId, 'hdy2_wx')
      this.shareWeixin()
    },
    handleCopy() {
      report(this.actionId, 'hdy2_fzlj')
      this.shareCopy()
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
  position: relative;
  min-height: 100vh;
  &-head {
    width: 100%;
  }
  &-detail {
    width: 100%;
  }
  &-rules {
    padding: 4rpx 6rpx 6rpx 18rpx;
    position: absolute;
    top: 520rpx;
    right: 0;
    z-index: 1;
    background: rgba(0, 0, 0, 0.2);
    font-size: 24rpx;
    color: #ffffff;
    border-top-left-radius: 50rpx;
    border-bottom-left-radius: 50rpx;
  }
}
</style>
