<template>
  <view class="rule">
    <rich-text class="rule-rich" :nodes="activeRules" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeRules: '',
    }
  },
  onLoad() {
    uni.setNavigationBarTitle({ title: '活动规则' })
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('activeRules', (data) => {
      this.activeRules = data.activeRules
    })
  },
}
</script>

<style lang="scss" scoped>
.rule {
  min-height: 100vh;
  ::v-deep .rule-rich {
    img {
      max-width: 100% !important;
    }
    [alt] {
      max-width: 100% !important;
    }
  }
}
</style>
