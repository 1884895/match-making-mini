<template>
  <web-view :src="targetUrl" />
</template>

<script>
export default {
  data() {
    return {
      userInfo: {},
      targetUrl: '',
    }
  },
  onLoad() {
    this.userInfo = uni.getStorageSync('userInfo') || {}
    this.init()
  },
  methods: {
    init() {
      const hfsToken = wx.getStorageSync('cookie').split(';')[0].split('=')[1]
      const userInfo = encodeURIComponent(JSON.stringify(Object.assign({}, this.userInfo, { hfsToken })))
      const url = decodeURIComponent(`${feConfig.mobileUrl}/pages/mine/comparison`)
      this.targetUrl = `${url}?userInfo=${userInfo}`
    },
  },
}
</script>
