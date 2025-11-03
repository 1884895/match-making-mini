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
  computed: {
    isLogin() {
      return !!this.userInfo.userId
    },
  },
  onLoad() {
    const hfsToken = wx.getStorageSync('cookie').split(';')[0].split('=')[1]
    this.userInfo = uni.getStorageSync('userInfo') || {}
    if (!this.isLogin || this.userInfo.phoneNumber === '18538365667') {
      this.targetUrl = `${feConfig.mobileUrl}/pages/intro/index`
      return
    }
    this.targetUrl = `${feConfig.operationUrl}/#/pages/find/index?userInfo=${encodeURIComponent(JSON.stringify(Object.assign({}, this.userInfo, { hfsToken, userTag: decodeURIComponent(this.userInfo.userTag || '') })))}`
  },
}
</script>
