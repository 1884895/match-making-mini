<template>
  <view class="content" :class="{ contentBottom: signUpStatus }">
    <image v-for="(item, index) in imgList" :key="index" class="content-image" :src="resourceUrl + item" mode="widthFix" />
  </view>
</template>

<script>
export default {
  props: {
    imgList: {
      type: Array,
      default: () => [],
    },
    signUpStatus: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/operations/course/',
    }
  },
}
</script>

<style lang="scss" scoped>
.content {
  width: 100%;
  padding-bottom: 200rpx;
  &-image {
    width: 100%;
  }
}
.contentBottom {
  padding-bottom: 128rpx;
}
</style>
