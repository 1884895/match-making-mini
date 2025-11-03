<template>
  <view class="operation">
    <!-- #ifdef MP-WEIXIN -->
    <image class="operation-bg" :src="`${resourceUrl}operation_bg_wx.png`" mode="widthFix" />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <image v-if="isHFSAppStudent" class="operation-bg" :src="`${resourceUrl}operation_bg_app_student.png`" mode="widthFix" />
    <image v-else class="operation-bg" :src="`${resourceUrl}operation_bg_app.png`" mode="widthFix" />
    <!-- #endif -->
    <image class="operation-rules" :src="`${resourceUrl}rules.png`" mode="widthFix" @click="showRules" />
    <view class="operation-footer" @click="handleEnter">
      <view class="operation-footer__button flex-row-center">
        <image class="run" :src="`${resourceUrl}operation_run.png`" mode="widthFix" />
        <view class="text">
          立即进入活动
        </view>
        <image class="hand" :src="`${resourceUrl}operation_hand.gif`" mode="widthFix" />
      </view>
    </view>
    <Popup ref="popup" />
  </view>
</template>

<script>
import Popup from './components/popup.vue'
import mixins from './mixins.js'
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Popup },
  mixins: [mixins],
  data() {
    return {
      pageType: 'operation',
    }
  },
  onLoad() {
    report(this.actionId, 'hdy1_show')
  },
  methods: {
    initPage() {
      const { hasCode, icode } = this.inviterInfo
      if (hasCode)
        return uni.redirectTo({ url: `/uni_modules/hfs-fe-uni-module/pages/new/invite?icode=${icode}` })
      this.$refs.popup.open('rules')
    },
    handleEnter() {
      report(this.actionId, 'hdy1_jrhd_click')
      uni.navigateTo({ url: '/uni_modules/hfs-fe-uni-module/pages/new/invite' })
    },
    showRules() {
      report(this.actionId, 'hdy1_dhgz_click')
      this.$refs.popup.open('rules')
    },
  },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
.operation {
  position: relative;
  &-bg {
    width: 100%;
  }
  &-rules {
    width: 198rpx;
    height: 54rpx;
    position: absolute;
    top: 426rpx;
    right: 22rpx;
    z-index: 1;
  }
  &-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #ffffff;
    border-radius: 24rpx 24rpx 0 0;
    box-shadow: 0 -4rpx 8rpx 0 rgba(83, 196, 95, 0.2);
    padding: 18rpx 44rpx 30rpx;
    padding: 18rpx 44rpx calc(env(safe-area-inset-bottom) + 30rpx);
    &__button {
      position: relative;
      width: 660rpx;
      height: 96rpx;
      background: linear-gradient(180deg, #ff6a34, #ffca45);
      border: 1rpx solid #fff5d9;
      border-radius: 49rpx;
      box-shadow:
        0 4rpx 8rpx 0 rgba(0, 0, 0, 0.06),
        0 2rpx 6rpx 0 rgba(255, 255, 255, 0.5) inset;
      .run {
        width: 72rpx;
        height: 68rpx;
        position: absolute;
        top: 12rpx;
        left: 160rpx;
      }
      .text {
        font-size: 32rpx;
        font-weight: 500;
        color: #ffffff;
      }
      .hand {
        width: 170rpx;
        height: 130rpx;
        position: absolute;
        top: 24rpx;
        right: 0;
      }
    }
  }
}
</style>
