<template>
  <view v-if="!hideMember && showVip && !visible" class="member" @click="jumpVip">
    <image class="member-icon" :src="`${resourceUrl}lock.png`" />
    <view class="member-title">
      {{ title }}
    </view>
    <view class="member-btns">
      <view class="member-btns__btn">
        立即开通
      </view>
      <u-icon name="arrow-right" size="22rpx" color="#6C4600" />
    </view>
  </view>
</template>

<script>
import { isHFSApp, isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    visible: {
      type: Boolean,
      default: false,
    },
    eventId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
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
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, eventId: this.eventId, data: { eventId: this.eventId } }))
      }
      // #endif
      return uni.navigateTo({ url: '/pages/me/member' })
    },
  },
}
</script>

<style lang="scss" scoped>
.member {
  width: 100%;
  display: flex;
  align-items: center;
  height: 58rpx;
  background: #fff2d8;
  border-radius: 16rpx;
  padding: 0 20rpx;
  justify-content: space-between;
  margin-top: 24rpx;
  &-icon {
    width: 20rpx;
    height: 24rpx;
    margin-right: 14rpx;
  }
  &-title {
    font-size: 24rpx;
    color: #6c4600;
    flex: 1;
  }
  &-btns {
    display: flex;
    align-items: center;
    &__btn {
      font-size: 26rpx;
      font-weight: bold;
      color: #6c4600;
      margin-right: 4rpx;
    }
  }
}
</style>
