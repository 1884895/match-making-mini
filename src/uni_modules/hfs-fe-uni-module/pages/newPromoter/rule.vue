<template>
  <view class="rule">
    <image class="rule-img" :src="`${resourceUrl}activity_rules.png`" mode="widthFix" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/newPromoter/',
    }
  },
  onLoad() {
    uni.setNavigationBarTitle({ title: '活动规则' })
  },
}
</script>

<style lang="scss" scoped>
.rule {
  min-height: 100vh;
  &-img {
    width: 100%;
  }
}
</style>
