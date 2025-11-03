<template>
  <view class="no">
    <image v-if="current === 0" class="no-img" src="../../static/examRecord/express_bg.png" mode="widthFix" />
    <image v-if="current === 1" class="no-img" src="../../static/examRecord/summary_bg.png" mode="widthFix" />
    <view v-if="current === 0 || current === 1" class="no-content">
      <view v-if="showVip" class="vip" @click="jumpVip">
        <image class="icon" src="../../static/academicReport/unlock.png" />
        <text class="text">
          开通会员查看详细内容
        </text>
      </view>
      <view v-else class="tips">
        前往家长端查看
      </view>
    </view>
    <view v-if="current === 2" class="no-bottom">
      <view v-if="showVip" class="no-bottom__operate" @click="jumpVip">
        <image class="icon" src="../../static/academicReport/unlock.png" />
        <text class="text">
          开通会员解锁全部考试
        </text>
      </view>
      <view class="no-bottom__time">
        <image class="icon" src="../../static/examRecord/time.png" />
        <text class="text">
          非会员用户只保存120天考试数据
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import { isHFSApp, isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    current: {
      type: Number,
      default: 0,
    },
    config: {
      type: Object,
      default: () => {},
    },
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
  },
  methods: {
    jumpVip() {
      // #ifdef H5
      if (isHFSApp()) {
        const eventIdMap = { 0: 'ks_ksda_ksbx_kthy_pay', 1: 'ks_ksda_kszj_kthy_pay', 2: 'ks_ksda_lcks_kthy_pay' }
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, eventId: eventIdMap[this.current], data: { eventId: eventIdMap[this.current] } }))
      }
      // #endif
      return uni.navigateTo({ url: '/pages/me/member' })
    },
  },
}
</script>

<style lang="scss" scoped>
.no {
  position: relative;
  &-img {
    width: 100%;
  }
  &-content {
    position: absolute;
    top: 418rpx;
    left: 50%;
    transform: translateX(-50%);
    .vip {
      padding: 16rpx 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3f1902;
      border-radius: 48rpx;
    }
    .icon {
      width: 40rpx;
      height: 34rpx;
      margin-right: 10rpx;
    }
    .text {
      font-size: 32rpx;
      color: #fdd891;
      white-space: nowrap;
    }
    .tips {
      font-size: 30rpx;
      color: #333333;
      text-align: center;
    }
  }
  &-bottom {
    width: 100%;
    padding: 22rpx 0 14rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: #fff2d8;
    border-radius: 24rpx 0 0 24rpx;
    box-shadow: 0 -4rpx 16rpx 0 rgba(0, 0, 0, 0.06);
    position: fixed;
    bottom: env(safe-area-inset-bottom);
    left: 0;
    &__operate {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3f1902;
      border-radius: 48rpx;
      padding: 16rpx 32rpx;
      margin-bottom: 10rpx;
      .icon {
        width: 40rpx;
        height: 34rpx;
        margin-right: 10rpx;
      }
      .text {
        font-size: 32rpx;
        color: #fdd891;
        white-space: nowrap;
      }
    }
    &__time {
      display: flex;
      align-items: center;
      justify-content: center;
      .icon {
        width: 22rpx;
        height: 22rpx;
        margin-right: 6rpx;
      }
      .text {
        font-size: 22rpx;
        color: #333333;
      }
    }
  }
}
</style>
