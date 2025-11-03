<template>
  <view class="share">
    <!-- eslint-disable-next-line -->
    <l-painter ref="painter" hidden useCORS></l-painter>
    <u-overlay :show="show" :z-index="10170" :opacity="0.7" @click="show = false">
      <image class="share-img" :src="tempUrl" mode="widthFix" />
      <view class="share-popup">
        <view class="share-popup__item" @click.stop="share(4)">
          <image class="icon" :src="`${resourceUrl}pk_weixin.png`" />
          <view class="text">
            微信好友
          </view>
        </view>
        <view class="share-popup__item" @click.stop="share(5)">
          <image class="icon" :src="`${resourceUrl}pk_pyq.png`" />
          <view class="text">
            朋友圈
          </view>
        </view>
        <view class="share-popup__item" @click.stop="share(2)">
          <image class="icon" :src="`${resourceUrl}pk_qq.png`" />
          <view class="text">
            QQ好友
          </view>
        </view>
        <view class="share-popup__item" @click.stop="save">
          <image class="icon" :src="`${resourceUrl}pk_download.png`" />
          <view class="text">
            保存图片
          </view>
        </view>
      </view>
    </u-overlay>
  </view>
</template>

<script>
import { isHFSParent, isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  emits: ['success'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/pk/images/',
      tempUrl: '',
      tempCode: '',
      show: false,
    }
  },
  computed: {
    qrUrl() {
      return `${window.location.origin}/#/uni_modules/hfs-fe-uni-module/pages/pk/invite`
    },
    platform() {
      // #ifdef H5
      if (isHFSStudent())
        return 'student'
      if (isHFSParent())
        return 'parent'
      return 'student'
      // #endif
    },
  },
  methods: {
    /**
     * type：类型, code：题型, name：名字 必传
     * type 区分分享类型
     * 1：pk 邀请
     * 2：战绩分享，传 rankName，rankNormalIcon
     * 3：提醒绑定
     */
    async init({ type, code, name, rankName = '', rankNormalIcon = '' }) {
      const tempCode = `${type}${code}${name}${rankName}${rankNormalIcon}`
      if (this.tempUrl && this.tempCode === tempCode)
        return this.showPopup()
      this.tempCode = tempCode
      const inviteCode = await this.getInviteCode(code)
      const shareUrl = `${this.qrUrl}${uni.$u.queryParams({ inviteCode, platform: this.platform })}`
      const board = {
        css: {
          width: '662rpx',
          background: 'transparent',
        },
      }
      const views = {
        1: [
          {
            type: 'image',
            src: `${this.resourceUrl}pk_invite.png`,
            css: {
              width: '662rpx',
            },
          },
          {
            type: 'text',
            text: `${name.slice(0, 3)}${name.length > 3 ? '...' : ''}`,
            css: {
              position: 'absolute',
              top: '328rpx',
              left: '158rpx',
              color: '#416AFF',
              fontSize: '30rpx',
            },
          },
          {
            type: 'text',
            text: inviteCode,
            css: {
              position: 'absolute',
              bottom: '75rpx',
              left: '400rpx',
              color: '#5D4212',
              fontSize: '44rpx',
            },
          },
          {
            type: 'qrcode',
            text: shareUrl,
            css: {
              position: 'absolute',
              bottom: '92rpx',
              left: '74rpx',
              width: '150rpx',
              height: '150rpx',
            },
          },
        ],
        2: [
          {
            type: 'image',
            src: `${this.resourceUrl}pk_challenge.png`,
            css: {
              width: '662rpx',
            },
          },
          {
            type: 'text',
            text: `${name}同学：`,
            css: {
              position: 'absolute',
              top: '74rpx',
              left: '78rpx',
              color: '#333333',
              fontSize: '36rpx',
            },
          },
          {
            type: 'text',
            text: `【${rankName}】段位`,
            css: {
              position: 'absolute',
              top: '246rpx',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#333333',
              fontSize: '36rpx',
              fontWeight: 'bold',
            },
          },
          {
            type: 'image',
            src: `${this.resourceUrl}${rankNormalIcon}`,
            css: {
              position: 'absolute',
              top: '296rpx',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '300rpx',
              height: '300rpx',
            },
          },
          {
            type: 'text',
            text: inviteCode,
            css: {
              position: 'absolute',
              bottom: '65rpx',
              left: '400rpx',
              color: '#5D4212',
              fontSize: '44rpx',
            },
          },
          {
            type: 'qrcode',
            text: shareUrl,
            css: {
              position: 'absolute',
              bottom: '84rpx',
              left: '74rpx',
              width: '150rpx',
              height: '150rpx',
            },
          },
        ],
        3: [
          {
            type: 'image',
            src: `${this.resourceUrl}pk_bind.png`,
            css: {
              width: '662rpx',
            },
          },
          {
            type: 'text',
            text: inviteCode,
            css: {
              position: 'absolute',
              bottom: '75rpx',
              left: '358rpx',
              color: '#5D4212',
              fontSize: '44rpx',
            },
          },
          {
            type: 'qrcode',
            text: `${shareUrl}&bind=1`,
            css: {
              position: 'absolute',
              bottom: '92rpx',
              left: '74rpx',
              width: '150rpx',
              height: '150rpx',
            },
          },
        ],
      }
      board.views = views[type]
      this.$refs.painter.render(board)
      // #ifdef H5
      this.h5CanvasToTempFilePath()
      // #endif
      // #ifdef MP-WEIXIN
      this.miniCanvasToTempFilePath()
      // #endif
    },
    async getInviteCode(themeCode) {
      const params = { themeCode: `${themeCode}`, platform: 1 }
      // #ifdef MP-WEIXIN
      params.platform = 2
      // #endif
      const res = await uni.$http.post(`${feConfig.api.hfs}/v3/invitation/code`, params, { custom: { loading: false, error: false } })
      return res.data
    },
    miniCanvasToTempFilePath() {
      this.$refs.painter.canvasToTempFilePathSync({
        fileType: 'jpg',
        pathType: 'url',
        quality: 0.8,
        success: (res) => {
          this.tempUrl = res.tempFilePath
          this.showPopup()
        },
      })
    },
    h5CanvasToTempFilePath() {
      this.$refs.painter.canvasToTempFilePathSync({
        fileType: 'png',
        success: (res) => {
          this.tempUrl = res.tempFilePath
          this.showPopup()
        },
      })
    },
    showPopup() {
      // #ifdef H5
      this.show = true
      // #endif
      // #ifdef MP-WEIXIN
      wx.showShareImageMenu({ path: this.tempUrl })
      // #endif
    },
    share(target) {
      this.$emit('success')
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 9, target, data: { base64Image: this.tempUrl } }))
    },
    save() {
      this.$emit('success')
      nativeBridge.callHandler('saveImage', JSON.stringify({ base64Image: this.tempUrl }))
    },
  },
}
</script>

<style lang="scss" scoped>
.share {
  &-img {
    width: 662rpx;
    margin: 80rpx auto 200rpx;
  }
  &-popup {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 750rpx;
    height: 180rpx;
    background: #ffffff;
    border-radius: 32rpx 32rpx 0 0;
    box-shadow: 0rpx -4rpx 8rpx 0rpx rgba(83, 196, 95, 0.2);
    display: flex;
    justify-content: space-evenly;
    padding-top: 34rpx;
    &__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      .icon {
        width: 72rpx;
        height: 72rpx;
        margin-bottom: 8rpx;
      }
      .text {
        font-size: 24rpx;
        color: #333333;
      }
    }
  }
}
</style>
