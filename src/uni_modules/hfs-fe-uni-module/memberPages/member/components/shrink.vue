<template>
  <view v-if="props.show" class="shrink">
    <l-svga ref="svga" />
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  show: boolean
  minus: number
}>(), {
  show: false,
  minus: 0,
})
const emits = defineEmits(['update:show', 'finished'])
const svga: any = ref(null)
const resourceUrl = 'https://fe-resource.haofenshu.com/member/'

function svgaRender() {
  svga.value.render(async (parser: any, player: any) => {
    try {
      const videoItem = await parser.load(`${resourceUrl}suoxiao.svga`)
      await player.setVideoItem(videoItem)
      // #ifdef H5
      player.setText({ text: props.minus, color: '#FFFFFF', size: `${uni.upx2px(96)}px`, family: 'minusFont' }, 'jiage_5E830F9B-6E25-4692-B225-8A048E7E77B8')
      // #endif
      // #ifdef MP-WEIXIN
      player.setText({ text: props.minus, color: '#FFFFFF', size: uni.upx2px(96), family: 'minusFont', offset: { x: 0, y: 15 } }, 'jiage_5E830F9B-6E25-4692-B225-8A048E7E77B8')
      // #endif
      player.loops = 1
      player.startAnimation()
      player.onFinished(() => {
        emits('update:show', false)
        emits('finished')
      })
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (e) {
      emits('update:show', false)
      emits('finished')
    }
  })
}

onMounted(() => svgaRender())
</script>

<style lang="scss" scoped>
.shrink {
  position: absolute;
  top: 0;
  left: 0;
  width: 200rpx;
  height: 200rpx;
  z-index: 100;
}
</style>
