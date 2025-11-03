<template>
  <view class="header">
    <view class="header-rule" @click="ruleClick">
      <text>活动\n规则</text>
    </view>
    <view class="header-text">
      活动剩余时间：{{ activeRemain }}天
    </view>
    <image v-if="pageType" class="header-pic" :src="resourceUrl + picMap[pageType][grade]" mode="widthFix" />
  </view>
</template>

<script>
export default {
  props: {
    pageType: {
      type: String,
      default: '',
    },
    groupInfo: {
      type: Object,
      default: () => {},
    },
    grade: {
      type: String,
      default: '0',
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/group/',
      picMap: {
        1: {
          0: 'operation_header.png',
          五年级: 'operation_header_small.png',
          六年级: 'operation_header_small.png',
          初三: 'operation_header_middle.png',
          初四: 'operation_header_middle.png',
          高三: 'operation_header_high.png',
        },
        2: {
          0: 'operation_header.png',
          五年级: 'operation_header_small.png',
          六年级: 'operation_header_small.png',
          初三: 'operation_header_middle.png',
          初四: 'operation_header_middle.png',
          高三: 'operation_header_high.png',
        },
        3: {
          0: 'operation_header.png',
          五年级: 'operation_header_small.png',
          六年级: 'operation_header_small.png',
          初三: 'operation_header_middle.png',
          初四: 'operation_header_middle.png',
          高三: 'operation_header_high.png',
        },
        4: {
          0: 'share_header_invite.png',
          五年级: 'share_header_invite_small.png',
          六年级: 'share_header_invite_small.png',
          初三: 'share_header_invite_middle.png',
          初四: 'share_header_invite_middle.png',
          高三: 'share_header_invite_high.png',
        },
        5: {
          0: 'share_header_success.png',
          五年级: 'share_header_success_small.png',
          六年级: 'share_header_success_small.png',
          初三: 'share_header_success_middle.png',
          初四: 'share_header_success_middle.png',
          高三: 'share_header_success_high.png',
        },
      },
    }
  },
  computed: {
    activeRemain() {
      const { activeRemain = 0 } = this.groupInfo || {}
      return Math.floor(activeRemain / (24 * 3600))
    },
  },
  methods: {
    ruleClick() {
      return uni.navigateTo({
        url: '/uni_modules/hfs-fe-uni-module/pages/group/rule',
        success: (res) => {
          res.eventChannel.emit('activeRules', {
            activeRules: this.groupInfo.activeRules,
          })
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.header {
  position: relative;
  width: 100%;
  &-rule {
    width: 56rpx;
    height: 56rpx;
    color: #ffffff;
    font-size: 18rpx;
    font-weight: bold;
    position: absolute;
    top: 84rpx;
    right: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 22rpx;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 16rpx;
    z-index: 1;
  }
  &-text {
    font-size: 24rpx;
    color: #ffffff;
    position: absolute;
    top: 414rpx;
    left: 282rpx;
    z-index: 1;
  }
  &-pic {
    width: 100%;
  }
}
</style>
