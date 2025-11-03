<template>
  <web-view :src="targetUrl" @message="handleMessage" />
</template>

<script>
export default {
  data() {
    return {
      targetUrl: '',
    }
  },
  onLoad(options) {
    this.targetUrl = decodeURIComponent(options.url)
    this.reportEvent('webview_browser', this.targetUrl)
  },
  methods: {
    handleMessage(e) {
      const { data } = e.detail
      data.length && data.forEach(v => this.reportEvent(v.type, v.url))
    },
    reportEvent(type, url) {
      const { domain, query, params } = this.urlParser(url)
      wx.reportEvent(type, { webview_id: params.id, webview_domain: domain, webview_query: query, webview_url: url })
    },
    urlParser(url) {
      const obj = {}
      const res = url.split('?')
      res[1] && res[1].split('&').forEach((v) => {
        const [key, value] = v.split('=')
        obj[key] = value
      })
      return {
        domain: res[0],
        query: res[1],
        params: obj,
      }
    },
  },
}
</script>
