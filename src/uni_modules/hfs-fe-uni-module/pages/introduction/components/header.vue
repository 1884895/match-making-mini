<template>
  <view class="header">
    <view class="header-rule" @click="ruleClick">
      活动规则
    </view>
    <image v-if="pageType" class="header-pic" :src="resourceUrl + picMap[pageType]" mode="widthFix" />
  </view>
</template>

<script>
export default {
  props: {
    pageType: {
      type: String,
      default: '',
    },
    inviterInfo: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/introduction/',
      picMap: {
        operation: 'operation_header.png',
        invite: 'operation_header.png',
        share: 'operation_header_share.png',
      },
    }
  },
  methods: {
    ruleClick() {
      return uni.navigateTo({
        url: '/uni_modules/hfs-fe-uni-module/pages/introduction/rule',
        success: (res) => {
          res.eventChannel.emit('activeRules', {
            activeRules: this.inviterInfo.activeRules,
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
    width: 116rpx;
    height: 36rpx;
    color: #333333;
    font-size: 22rpx;
    position: absolute;
    top: 12rpx;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 200rpx 0 0 200rpx;
    z-index: 1;
  }
  &-pic {
    width: 100%;
  }
}
</style>
