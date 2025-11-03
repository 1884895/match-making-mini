<!-- eslint-disable vue/no-unused-refs -->
<template>
  <view class="operation">
    <image class="operation-bg" :src="`${resourceUrl}operation_bg.png`" mode="widthFix" />
    <view class="operation-rules" @click="showRules">活动规则</view>
    <view class="operation-footer" @click="handleEnter">
      <image class="operation-footer__sign" :src="`${resourceUrl}operation_sign.png`" mode="widthFix" />
    </view>
    <Customer :is-member="isMember" />
    <Popup ref="popup" @share-weixin="handleWeixin" @share-copy="handleCopy" />
    <Painter ref="painter" />
  </view>
</template>

<script>
import mixins from './mixins.js'
import Customer from './components/customer.vue'
import Popup from './components/popup.vue'
import Painter from './components/painter.vue'
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Customer, Popup, Painter },
  mixins: [mixins],
  data() {
    return {
      pageType: 'operation',
    }
  },
  onLoad(options) {
    report(this.actionId, 'hdy1_show')
    options.action && report(options.actionId || this.actionId, options.action)
  },
  onShow() {
    if (this.inviterInfo.icode)
      uni.redirectTo({ url: `/uni_modules/hfs-fe-uni-module/pages/newPromoter/invite?icode=${this.inviterInfo.icode}` })
  },
  methods: {
    initPage() {
      const { hasCode, icode } = this.inviterInfo
      if (hasCode)
        return uni.redirectTo({ url: `/uni_modules/hfs-fe-uni-module/pages/newPromoter/invite?icode=${icode}` })
    },
    async handleEnter() {
      report(this.actionId, 'hdy1_yjbm')
      await this.getInvitationCode()
      this.$refs.popup.open('share', { title: '分享给好友' })
    },
    handleWeixin() {
      report(this.actionId, 'hdy1_wx')
      this.shareWeixin()
    },
    handleCopy() {
      report(this.actionId, 'hdy1_fzlj')
      this.shareCopy()
    },
    showRules() {
      uni.navigateTo({ url: '/uni_modules/hfs-fe-uni-module/pages/newPromoter/rule' })
    },
  },
  onShareAppMessage() {
    return this.getShareWeixinInfo()
  },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
.operation {
  position: relative;
  padding-bottom: 0;
  padding-bottom: calc(env(safe-area-inset-bottom));
  &-bg {
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
  &-footer {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    padding: 0 26rpx 54rpx;
    padding: 0 26rpx calc(env(safe-area-inset-bottom) + 54rpx);
    z-index: 9999;
    &__sign {
      width: 100%;
      height: 108rpx;
    }
  }
}
</style>
