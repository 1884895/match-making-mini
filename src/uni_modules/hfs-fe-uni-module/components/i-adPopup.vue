<template>
  <u-popup :show="popup.show" :mode="popup.mode" :bg-color="popup.bgColor" :overlay-style="popup.overlayStyle" :duration="popup.duration" :close-on-click-overlay="popup.closeOnClickOverlay" @touchmove.stop.prevent>
    <view class="info">
      <view class="info-close" @click="popup.show = false">
        <u-icon name="close-circle" color="#ddd" size="24" />
      </view>
      <image class="info-img" :src="adInfo[keyName]" @click="imageClick" />
    </view>
  </u-popup>
</template>

<script>
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'
// #ifdef MP-WEIXIN
import { PlatformType } from '@/enums'
// #endif

export default {
  props: {
    adsList: {
      type: Array,
      default: () => [],
    },
    keyName: {
      type: String,
      default: 'url',
    },
  },
  data() {
    return {
      popup: {
        show: false,
        mode: 'center',
        duration: 200,
        closeOnClickOverlay: true,
        bgColor: 'transparent',
        overlayStyle: { background: 'rgba(0, 0, 0, 0.85)' },
      },
      adInfo: {},
    }
  },
  methods: {
    open() {
      this.popup.show = true
    },
    close() {
      this.popup.show = false
    },
    showPopup(list) {
      if (!list.length)
        return
      const localAdslist = uni.getStorageSync('localAdslist') || {}
      const today = uni.$u.timeFormat(new Date(), 'yyyy-mm-dd')

      const detail = list[0] || {}
      const { id = '' } = detail
      if ((localAdslist[id] && localAdslist[id] !== today) || !Object.keys(localAdslist).length) {
        this.adInfo = detail
        localAdslist[id] = today
        uni.setStorageSync('localAdslist', localAdslist)
        this.open()
      }
    },
    imageClick() {
      // #ifdef H5
      nativeBridge.callHandler('adJump', JSON.stringify(this.adInfo))
      // #endif
      // #ifdef MP-WEIXIN
      this.clickSwiper(this.adInfo)
      this.getMsgId(this.adInfo)
      // #endif
      this.popup.show = false
    },
    clickSwiper(data) {
      if (!data)
        return null
      const { mode, targetUrl: url } = data
      const jumpMap = {
        0: () => {},
        1: () => {
          return uni.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent(url)}` })
        },
        2: () => {
          return uni.navigateTo({ url, fail: () => uni.switchTab({ url }) })
        },
        3: () => {
          return uni.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent(url)}` })
        },
        4: () => {
          return uni.navigateToMiniProgram({
            appId: url,
            path: data.data.path,
          })
        },
      }
      return jumpMap[mode]()
    },
    async getMsgId(data) {
      const { id: ads_id, materiaId: materia_id } = data
      const userInfo = uni.getStorageSync('userInfo') || {}
      const params = {
        ads_id,
        ctime: new Date().getTime(),
        equip: PlatformType[uni.$u.os()] || 5,
        materia_id,
        project_id: feConfig.bannerProjectId,
        userid: userInfo.userId || '',
        uuid: uni.getStorageSync('__DC_STAT_UUID'),
      }
      const res = await uni.$http.post(`${feConfig.api.znyx}/api/ads/v2/collect-msg`, { project_id: params.project_id, uuid: params.uuid }, { custom: { loading: false, error: false } })
      const { msgId: msg_id } = res.data
      this.advertLog([{ ...params, msg_id, type: 1 }])
    },
    advertLog(params) {
      uni.$http.post(`${feConfig.api.znyx}/api/ads/v2/push/advertLog`, params, { custom: { loading: false, error: false } })
    },
  },
}
</script>

<style lang="scss" scoped>
.info {
  position: relative;
  &-close {
    position: absolute;
    top: -60rpx;
    right: -20rpx;
    z-index: 1;
  }
  &-img {
    width: 70vw;
    height: calc(70vw / 810 * 1035);
  }
}
</style>
