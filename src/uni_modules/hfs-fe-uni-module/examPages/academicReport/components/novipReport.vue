<template>
  <view class="example">
    <image class="example-img" :src="imgList[current]" mode="widthFix" />
    <view class="example-content">
      <view v-if="showVip && !isMember" class="example-content_purchase" @click="jumpPage('vip')">
        <image class="icon" src="../../static/academicReport/unlock.png" />
        <text class="text">
          开通会员解锁报告
        </text>
      </view>
      <view class="example-content_report" @click="showReportExample">
        <text class="text">
          查看报告样例
        </text>
        <image class="icon" src="../../static/academicReport/block-right.png" />
      </view>
    </view>
  </view>
</template>

<script>
import { isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    // 0 成绩解读  1 试卷解读 2 失分总结
    current: {
      type: Number,
      default: 0,
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['reportEvent'],
  data() {
    return {
      imgList: [
        require('../../static/academicReport/example_score.png'),
        require('../../static/academicReport/example_paper.png'),
        require('../../static/academicReport/example_lost.png'),
      ],
    }
  },
  computed: {
    isMember() {
      return this.userInfo.isMember || false
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
    showReportExample() {
      this.$emit('reportEvent', 'ks_xqbg_Bbgyl')
      uni.navigateTo({ url: `/uni_modules/hfs-fe-uni-module/examPages/academicReport/reportExample?current=${this.current}` })
    },
    jumpPage(type) {
      const jumpMap = {
        vip: { url: '/pages/me/member', target: 8, params: {}, event: 'ks_xqbg_Bkthy' },
      }
      const { url = '', target, params, event } = jumpMap[type] || {}
      event && this.$emit('reportEvent', event)
      // #ifdef MP-WEIXIN
      if (!url)
        return uni.showToast({ title: '请到APP端体验', icon: 'none' })
      uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      // #endif
      // #ifdef H5
      if (!target)
        return uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target, data: params }))
      // #endif
    },
  },
}
</script>

<style lang="scss" scoped>
.example {
  position: relative;
  &-img {
    width: 100%;
  }
  &-content {
    position: absolute;
    top: 482rpx;
    left: 50%;
    transform: translateX(-50%);
    &_purchase {
      width: 374rpx;
      height: 76rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3f1902;
      border-radius: 48rpx;
      margin-bottom: 32rpx;
      .icon {
        width: 40rpx;
        height: 34rpx;
        margin-right: 10rpx;
      }
      .text {
        font-size: 34rpx;
        color: #fdd891;
      }
    }
    &_report {
      display: flex;
      align-items: center;
      justify-content: center;
      .text {
        display: flex;
        align-items: center;
        font-size: 32rpx;
        color: #333333;
        margin-right: 10rpx;
      }
      .icon {
        width: 16rpx;
        height: 24rpx;
      }
    }
  }
}
</style>
