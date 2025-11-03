<template>
  <view />
</template>

<script>
import { getUserInfo, loginBase } from '../../utils/login'
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  data() {
    return {
      options: {},
    }
  },
  async onLoad(options) {
    this.options = options
    options.actionId && report(options.actionId, options.action)
    await this.authentication()
  },
  methods: {
    async authentication() {
      uni.removeStorageSync('cookie')
      uni.removeStorageSync('userInfo')
      const res = await loginBase()
      if (!res)
        return
      // 获取储存的cookie
      const cookie = uni.getStorageSync('cookie')
      // 校验cookie是否存在
      if (cookie) {
        await getUserInfo()
      }
      // 未登录也跳转首页
      this.jumpPage()
    },
    jumpPage() {
      uni.reLaunch({
        url: getApp().globalData.redirect_uri || '/pages/home/home',
        success: () => {
          getApp().globalData.redirect_uri = ''
        },
      })
    },
  },
}
</script>
