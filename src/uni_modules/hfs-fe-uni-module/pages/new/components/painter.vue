<template>
  <view class="painter">
    <!-- eslint-disable-next-line -->
    <l-painter ref="painter" hidden useCORS></l-painter>
    <u-overlay :show="show" @click="show = false">
      <image class="painter-img" :src="tempUrl" mode="widthFix" />
      <view class="painter-desc">
        新同学绑定后除了免费查成绩还可得<text class="active">
          新人{{ isHFSAppStudent ? '二' : '三' }}重礼！
        </text>
      </view>
      <view class="painter-desc">
        新同学绑定后你将获得<text class="active">
          相应奖励!
        </text>
      </view>
      <view class="painter-popup">
        <view class="painter-popup__item" @click.stop="share(4)">
          <image class="icon" :src="`${resourceUrl}painter_weixin.png`" />
          <view class="text">
            分享至微信
          </view>
        </view>
        <view class="painter-popup__item" @click.stop="share(5)">
          <image class="icon" :src="`${resourceUrl}painter_pyq.png`" />
          <view class="text">
            分享至朋友圈
          </view>
        </view>
        <view class="painter-popup__item" @click.stop="save">
          <image class="icon" :src="`${resourceUrl}painter_download.png`" />
          <view class="text">
            保存到本地
          </view>
        </view>
      </view>
    </u-overlay>
  </view>
</template>

<script>
import { isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  emits: ['openInvite'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/new/',
      tempUrl: '',
      show: false,
    }
  },
  computed: {
    isHFSAppStudent() {
      // #ifdef H5
      if (isHFSStudent()) {
        return true
      }
      // #endif
      return false
    },
    isMiniProgram() {
      return uni.$u.platform === 'weixin'
    },
  },
  methods: {
    getImgUrl() {
      if (this.isMiniProgram)
        return 'poster_wx.png'
      if (this.isHFSAppStudent)
        return 'poster_app_student.png'
      return 'poster_app.png'
    },
    init(qrUrl, directShare = true) {
      if (this.tempUrl)
        return this.showPopup(directShare)
      const board = {
        css: {
          width: '670rpx',
          background: 'transparent',
        },
        views: [
          {
            type: 'image',
            src: this.resourceUrl + this.getImgUrl(),
            css: {
              width: '670rpx',
            },
          },
          {
            type: 'qrcode',
            text: qrUrl,
            css: {
              position: 'absolute',
              bottom: '140rpx',
              left: '72rpx',
              width: '106rpx',
              height: '106rpx',
            },
          },
        ],
      }
      this.$refs.painter.render(board)
      // #ifdef H5
      this.h5CanvasToTempFilePath(directShare)
      // #endif
      // #ifdef MP-WEIXIN
      this.miniCanvasToTempFilePath(directShare)
      // #endif
    },
    miniCanvasToTempFilePath(directShare) {
      this.$refs.painter.canvasToTempFilePathSync({
        fileType: 'jpg',
        pathType: 'url',
        quality: 0.8,
        success: (res) => {
          this.tempUrl = res.tempFilePath
          this.showPopup(directShare)
        },
      })
    },
    h5CanvasToTempFilePath(directShare) {
      this.$refs.painter.canvasToTempFilePathSync({
        fileType: 'png',
        success: (res) => {
          this.tempUrl = res.tempFilePath
          this.showPopup(directShare)
        },
      })
    },
    showPopup(directShare) {
      if (directShare)
        return this.share(4)
      // #ifdef H5
      this.show = true
      // #endif
      // #ifdef MP-WEIXIN
      wx.showShareImageMenu({
        path: this.tempUrl,
        success: () => {
          this.$emit('openInvite')
        },
      })
      // #endif
    },
    share(target) {
      this.$emit('openInvite')
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 9, target, data: { base64Image: this.tempUrl } }))
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
