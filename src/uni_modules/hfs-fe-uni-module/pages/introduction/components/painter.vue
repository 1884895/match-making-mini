<template>
  <view class="painter">
    <!-- eslint-disable-next-line -->
    <l-painter ref="painter" hidden useCORS></l-painter>
    <u-overlay :show="show" @click="show = false">
      <image class="painter-img" :src="tempUrl" mode="widthFix" />
      <view class="painter-desc">
        新同学开通会员后你将获得相应<text class="active">
          学币/延长会员天数
        </text>
      </view>
      <view class="painter-desc">
        新同学也将获得与你<text class="active">
          首单邀请奖励同价值优惠
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
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/introduction/',
      qrUrl: 'https://operation.haofenshu.com/#/introduction',
      tempUrl: '',
      show: false,
    }
  },
  methods: {
    init(inviterInfo) {
      if (this.tempUrl)
        return this.showPopup()
      const { growDays = 0, couponConf = [], activityId = '', askId = '' } = inviterInfo
      const { couponValue = 0 } = couponConf[1] || {}
      const board = {
        css: {
          width: '624rpx',
          background: 'transparent',
        },
        views: [
          {
            type: 'image',
            src: `${this.resourceUrl}painter_bg.png`,
            css: {
              width: '624rpx',
            },
          },
          {
            type: 'text',
            text: growDays,
            css: {
              position: 'absolute',
              top: '234rpx',
              right: '120rpx',
              width: '78rpx',
              color: '#FF2525',
              fontSize: '32rpx',
              textAlign: 'center',
            },
          },
          {
            type: 'text',
            text: couponValue,
            css: {
              position: 'absolute',
              top: '410rpx',
              left: '158rpx',
              color: '#FFF3B7',
              fontSize: '52rpx',
            },
          },
          {
            type: 'text',
            text: `送你${couponValue}元优惠券`,
            css: {
              position: 'absolute',
              top: '415rpx',
              left: '272rpx',
              color: '#FFF',
              fontSize: '26rpx',
            },
          },
          {
            type: 'qrcode',
            text: this.qrUrl + uni.$u.queryParams({ activityId, askId }),
            css: {
              position: 'absolute',
              bottom: '197rpx',
              left: '148rpx',
              width: '98rpx',
              height: '98rpx',
            },
          },
        ],
      }
      this.$refs.painter.render(board)
      // #ifdef H5
      this.h5CanvasToTempFilePath()
      // #endif
      // #ifdef MP-WEIXIN
      this.miniCanvasToTempFilePath()
      // #endif
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
    margin: 30rpx auto 32rpx;
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
