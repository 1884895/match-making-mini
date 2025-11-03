<template>
  <view class="painter">
    <!-- eslint-disable-next-line -->
    <l-painter ref="painter" hidden useCORS></l-painter>
  </view>
</template>

<script>
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  emits: ['openInvite'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/newPromoter/',
      tempUrl: '',
    }
  },
  methods: {
    init(qrUrl) {
      if (this.tempUrl)
        return this.share()
      const board = {
        css: {
          width: '670rpx',
          background: 'transparent',
        },
        views: [
          {
            type: 'image',
            src: `${this.resourceUrl}poster_bg.png`,
            css: {
              width: '670rpx',
            },
          },
          {
            type: 'qrcode',
            text: qrUrl,
            css: {
              position: 'absolute',
              bottom: '110rpx',
              left: '76rpx',
              width: '106rpx',
              height: '106rpx',
            },
          },
        ],
      }
      this.$refs.painter.render(board)
      this.h5CanvasToTempFilePath()
    },
    h5CanvasToTempFilePath() {
      this.$refs.painter.canvasToTempFilePathSync({
        fileType: 'png',
        success: (res) => {
          this.tempUrl = res.tempFilePath
          this.share()
        },
      })
    },
    share() {
      this.$emit('openInvite')
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 9, target: 4, data: { base64Image: this.tempUrl } }))
    },
    save() {
      nativeBridge.callHandler('saveImage', JSON.stringify({ base64Image: this.tempUrl }))
    },
  },
}
</script>

<style lang="scss" scoped>
.painter {
  &-img {
    width: 550rpx;
    margin: 140rpx auto 32rpx;
  }
  &-desc {
    font-size: 26rpx;
    color: #ffffff;
    text-align: center;
    margin-bottom: 14rpx;
    .active {
      color: #ff9e41;
    }
  }
  &-popup {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 750rpx;
    height: 254rpx;
    background: #e6e6e6;
    border-radius: 32rpx 32rpx 0 0;
    display: flex;
    justify-content: space-evenly;
    padding-top: 34rpx;
    &__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      .icon {
        width: 100rpx;
        height: 100rpx;
        margin-bottom: 10rpx;
      }
      .text {
        font-size: 24rpx;
        color: #333333;
      }
    }
  }
}
</style>
