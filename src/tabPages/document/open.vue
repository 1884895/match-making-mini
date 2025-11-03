<template>
  <view class="open">
    <view class="open-content">
      <image class="icon" :src="`${resourceUrl}${options.suffix || 'pdf'}.png`" />
      <text class="text">
        {{ options.name || '' }}
      </text>
    </view>
    <view class="open-btn">
      <u-button text="打开" :custom-style="{ width: '45%', borderRadius: '40rpx', height: '80rpx', color: '#ffba1d', fontSize: '30rpx', border: '1rpx solid #ffba1d' }" :throttle-time="500" @click="openFile" />
      <u-button text="分享" :custom-style="{ width: '45%', borderRadius: '40rpx', height: '80rpx', color: '#ffffff', fontSize: '30rpx', border: 'none', background: 'linear-gradient(225deg,#ffd300, #ffba1d)' }" :throttle-time="500" @click="shareFile" />
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      resourceUrl: `${feConfig.resourceUrl}/images/`,
      options: {},
      filePath: '',
    }
  },
  onLoad(options) {
    this.options = options
    uni.setNavigationBarTitle({ title: options.name || '下载文件' })
    const url = decodeURIComponent(options.url || getApp().globalData.document || '')
    this.init(url)
  },
  methods: {
    async init(url) {
      if (!url)
        return uni.$u.toast('文件不存在')
      this.filePath = /^https?:\/\//.test(url) ? await this.downloadFile(url) : await this.writeFile(url)
    },
    downloadFile(url) {
      uni.showLoading({ title: '下载中', mask: true })
      return new Promise((resolve) => {
        const { name, suffix } = this.options
        const filePath = `${uni.env.USER_DATA_PATH}/${name}.${suffix}`
        return uni.downloadFile({
          url,
          filePath,
          success: () => {
            return resolve(filePath)
          },
          fail: (err) => {
            return uni.showToast({ title: err.errMsg || '下载失败', icon: 'none' })
          },
          complete: () => {
            return uni.hideLoading()
          },
        })
      })
    },
    writeFile(url) {
      uni.showLoading({ title: '下载中', mask: true })
      return new Promise((resolve) => {
        const { name, suffix, encoding } = this.options
        const filePath = `${uni.env.USER_DATA_PATH}/${name}.${suffix}`
        const fs = uni.getFileSystemManager()
        return fs.writeFile({
          data: url,
          encoding: encoding || 'base64',
          filePath,
          success: () => {
            return resolve(filePath)
          },
          fail: (err) => {
            return uni.showToast({ title: err.errMsg || '下载失败', icon: 'none' })
          },
          complete: () => {
            return uni.hideLoading()
          },
        })
      })
    },
    openFile() {
      if (!this.filePath)
        return uni.$u.toast('文件不存在')
      return uni.openDocument({ filePath: this.filePath, showMenu: true })
    },
    shareFile() {
      if (!this.filePath)
        return uni.$u.toast('文件不存在')
      return uni.shareFileMessage({ filePath: this.filePath })
    },
  },
}
</script>

<style lang="scss" scoped>
.open {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 58rpx 0;
  &-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 80rpx;
    .icon {
      width: 160rpx;
      height: 160rpx;
      margin-bottom: 60rpx;
    }
    .text {
      font-size: 32rpx;
      color: #333333;
      text-align: center;
    }
  }
  &-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
