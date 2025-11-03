<template>
  <view v-if="!hideMember && showVip && !visible" class="footer" @click="jumpVip">
    <view v-if="scrollTop < 20" class="footer-default">
      <image class="footer-default__bg" :src="resourceUrl + imgMap[type].bgImg" mode="widthFix" />
      <view class="footer-default__btn flex-row-center">
        立即开通
      </view>
      <image class="footer-default__tips" :src="`${resourceUrl}member_tips.png`" mode="widthFix" />
    </view>
    <view v-else class="footer-close">
      <image class="footer-close__bg" :src="resourceUrl + imgMap[type].bgSmallImg" mode="widthFix" />
      <view class="footer-close__btn flex-row-center">
        立即开通
      </view>
    </view>
  </view>
</template>

<script>
import { isHFSApp, isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    type: {
      type: String,
      default: 'score',
    },
    scrollTop: {
      type: Number,
      default: 0,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
      imgMap: {
        score: {
          bgImg: 'score_member.png',
          bgSmallImg: 'score_member_small.png',
          eventId: 'ks_cjzl_ljkt_pay',
        },
        subject: {
          bgImg: 'subject_member.png',
          bgSmallImg: 'subject_member_small.png',
          eventId: 'ks_xkfx_ljkt_pay',
        },
        lose: {
          bgImg: 'lose_member.png',
          bgSmallImg: 'lose_member_small.png',
          eventId: 'ks_sfzj_ljkt_pay',
        },
      },
    }
  },
  computed: {
    hideMember() {
      const { hideMember = false } = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
      return hideMember
    },
    showVip() {
      // #ifdef H5
      if (isHFSStudent()) {
        return false
      }
      // #endif
      return true
    },
  },
  methods: {
    jumpVip() {
      // #ifdef H5
      if (isHFSApp()) {
        const { eventId = '' } = this.imgMap[this.type] || {}
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, eventId, data: { eventId } }))
      }
      // #endif
      return uni.navigateTo({ url: '/pages/me/member' })
    },
  },
}
</script>

<style lang="scss" scoped>
.footer {
  width: 100%;
  position: fixed;
  bottom: 0;
  z-index: 9999;
  &-default {
    position: relative;
    &__bg {
      width: 100%;
      height: 268rpx;
    }
    &__btn {
      position: absolute;
      bottom: 16rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 666rpx;
      height: 72rpx;
      background: linear-gradient(225deg, #ffa430 0%, #ff7426);
      border-radius: 36rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #ffffff;
    }
    &__tips {
      width: 304rpx;
      height: 48rpx;
      position: absolute;
      bottom: 82rpx;
      left: 53%;
    }
  }
  &-close {
    position: relative;
    &__bg {
      width: 100%;
      height: 88rpx;
    }
    &__btn {
      width: 164rpx;
      height: 60rpx;
      position: absolute;
      right: 30rpx;
      top: 50%;
      transform: translateY(-50%);
      background: linear-gradient(225deg, #ffa430 0%, #ff7426);
      border-radius: 36rpx;
      font-size: 28rpx;
      font-weight: bold;
      color: #ffffff;
    }
  }
}
</style>
