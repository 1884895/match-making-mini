<template>
  <view class="browser">
    <web-view :src="targetUrl" @message="handleMessage" />
  </view>
</template>

<script>
import URL from '../../utils/url'

export default {
  data() {
    return {
      options: {},
      userInfo: {},
      targetUrl: '',
    }
  },
  computed: {
    location() {
      return new URL(this.targetUrl)
    },
  },
  onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || {}
    this.init()
  },
  methods: {
    init() {
      const hfsToken = wx.getStorageSync('cookie').split(';')[0].split('=')[1]
      const userInfo = encodeURIComponent(JSON.stringify(Object.assign({}, this.userInfo, { hfsToken, userTag: decodeURIComponent(this.userInfo.userTag || '') })))
      const url = decodeURIComponent(this.options.url || this.qrCodeHandle(this.options.q).url || '')
      this.targetUrl = `${url}${url.includes('?') ? '&' : '?'}userInfo=${userInfo}`
    },
    handleMessage(e) {
      const { data = [] } = e.detail
      data.length && data.forEach((v) => {
        v.action && this.eventChannel(v)
        v.global && this.setGlobalData(v)
      })
    },
    eventChannel(e) {
      const { action, data } = e
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.emit(action, data)
    },
    setGlobalData(e) {
      const { global, data } = e
      getApp().globalData[global] = data
    },
    // 二维码处理
    qrCodeHandle(qr) {
      const obj = {}
      const res = decodeURIComponent(qr).split('?')
      res[1] && res[1].split('&').forEach((v) => {
        const [key, value] = v.split('=')
        obj[key] = value
      })
      return obj
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
