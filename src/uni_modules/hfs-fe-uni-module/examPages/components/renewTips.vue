<template>
  <view v-if="!hideMember && show" class="renew">
    <!-- 考试首页底部开通会员 -->
    <view v-if="type === 'examList'" class="renew-member" @click="jumpVip('ks_sy_ljkt_pay')">
      <view class="renew-member__content">
        <image class="icon" :src="`${resourceUrl}vip_icon.png`" />
        <view class="text">
          <image v-if="expiredMember" class="text-icon" :src="`${resourceUrl}vip_icon_expired.png`" />
          <image v-else class="text-icon" :src="`${resourceUrl}vip_text.png`" />
          <text>解锁全部会员功能</text>
        </view>
        <view class="btn">
          {{ expiredMember ? '去续费' : '立即开通' }}
        </view>
      </view>
      <view class="renew-member__close" @click.stop="closeTip('ks_ljkt_Bgb')">
        <u-icon name="close" color="#AE633C" size="28rpx" />
      </view>
      <image class="renew-member__bg" :src="`${resourceUrl}vip_bg.png`" />
    </view>
    <!-- 考试档案底部开通会员 -->
    <view v-if="type === 'examRecord'" class="renew-member" @click="jumpVip('ksda_sy_kthy_pay')">
      <image class="renew-member__record" :src="`${resourceUrl}home_vip.png`" mode="widthFix" />
    </view>
  </view>
</template>

<script>
import { isHFSApp, isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    type: {
      type: String,
      default: '',
    },
    showRenewBtn: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['updateStyle'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/renew/',
      renew: {},
      clickClose: false,
    }
  },
  computed: {
    prefix() {
      let prefix = '/v1/be-proxy'
      // #ifdef H5
      prefix = feConfig.api.hfs || ''
      // #endif
      return prefix
    },
    showVip() {
      // #ifdef H5
      if (this.type === 'examList')
        return true
      if (isHFSStudent()) {
        return false
      }
      // #endif
      return true
    },
    show() {
      return this.showVip && this.showRenewBtn && !this.clickClose
    },
    userInfo() {
      return uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    },
    hideMember() {
      const { hideMember = false } = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
      return hideMember
    },
    expiredMember() {
      const { isMember, memberEnd } = this.userInfo
      return !isMember && memberEnd
    },
  },
  watch: {
    show: {
      handler() {
        this.updateStyle()
      },
      immediate: true,
    },
  },
  methods: {
    closeTip(event) {
      this.clickClose = true
      this.updateStyle()
      this.reportEvent(event)
    },
    jumpVip(eventId) {
      // #ifdef H5
      if (isHFSApp()) {
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, eventId, data: { eventId } }))
      }
      // #endif
      return uni.navigateTo({ url: '/pages/me/member' })
    },
    reportEvent(event) {
      // #ifdef H5
      if (!event || typeof event !== 'string')
        return
      nativeBridge.callHandler('UMengEvent', event)
      // #endif
    },
    updateStyle() {
      const paddingBottom = { examList: '150rpx', examRecord: '350rpx' }
      this.$emit('updateStyle', { paddingBottom: `calc(env(safe-area-inset-bottom) + ${this.show ? paddingBottom[this.type] : '80rpx'})` })
    },
  },
}
</script>

<style lang="scss" scoped>
.renew {
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 9999;
  &-member {
    width: 100%;
    position: relative;
    &__content {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 42rpx 0 36rpx;
      z-index: 1;
      .icon {
        width: 54rpx;
        height: 54rpx;
        margin-right: 14rpx;
      }
      .text {
        font-size: 22rpx;
        color: #6c4600;
        margin-right: 26rpx;
        flex: 1;
        &-icon {
          width: 286rpx;
          height: 28rpx;
          margin-bottom: 4rpx;
        }
      }
      .btn {
        width: 154rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26rpx;
        font-weight: 500;
        color: #ffffff;
        background: linear-gradient(225deg, #ffa430 0%, #ff7426);
        border-radius: 30rpx;
      }
    }
    &__record {
      width: 100%;
    }
    &__close {
      position: absolute;
      top: 4rpx;
      right: 0;
      padding: 6rpx;
      z-index: 1;
    }
    &__bg {
      width: 100%;
      height: 112rpx;
    }
  }
}
</style>
