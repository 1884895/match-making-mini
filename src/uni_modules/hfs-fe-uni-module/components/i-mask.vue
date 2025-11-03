<template>
  <rich-text v-if="nodes" :class="{ hide: !show }" :nodes="nodeContent" />
  <view v-else class="i-mask" :class="{ hide: !show }" :style="{ display }">
    <slot />
  </view>
</template>

<script>
export default {
  props: {
    // 是否显示内容 true 显示 false 隐藏
    show: {
      type: Boolean,
      default: false,
    },
    display: {
      type: String,
      default: 'inline',
    },
    // 富文本内容 传入后 slot 内容被替换
    nodes: {
      type: [String, Array],
      default: '',
    },
  },
  computed: {
    nodeContent() {
      if (this.show || !this.nodes)
        return this.nodes
      const maskReg = /<[^>]*class="[^"]*mask-[^"]*"[^>]*>/g
      return this.nodes.replace(maskReg, (match) => {
        return match.replace('style="', 'style="filter: blur(5px);color: #333 !important;')
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.i-mask {
  &.hide {
    color: #333 !important;
    filter: blur(10rpx);
  }
}
</style>
