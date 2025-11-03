<template>
  <view class="launch-app">
    <template v-if="showLaunch">
      <slot />
      <!-- #ifdef H5 -->
      <wx-open-launch-app class="launch-app__btn" :appid="appId" :extinfo="extInfo" @ready="ready" @launch="launch" @error="error">
        <!-- eslint-disable-next-line vue/require-component-is -->
        <component is="script" type="text/wxtag-template">
          <!-- 元素必须有尺寸，否则无法触发呼端，但不要求元素被点击才能触发 -->
          <div class="wx-btn" style="position: absolute; width: 100%; height: 100%; opacity: 0; z-index: 1;" />
        </component>
      </wx-open-launch-app>
      <!-- #endif -->
    </template>
    <view v-else @click="launchAppInH5">
      <slot />
    </view>
  </view>
</template>

<script>
import { isHFSParent, isHFSStudent, isQQ, isWechat } from '@/uni_modules/hfs-fe-uni-plugins'

const HFSAppId = {
  student: 'wx21cc529ead337366', // 学生端
  parent: 'wxf5af4bddc9646a9d', // 家长端
}
const AppConfig = {
  // 好分数家长端
  wxf5af4bddc9646a9d: {
    iosSchema: 'HFSParent://',
    itunes: 'https://itunes.apple.com/cn/app/id1112859166',
    androidSchema: 'haofenshu://parent/launcher',
    yyb: 'https://a.app.qq.com/o/simple.jsp?pkgname=com.yunxiao.hfs4p',
  },
  // 好分数学生端
  wx21cc529ead337366: {
    iosSchema: 'HaoFenShu://',
    itunes: 'https://itunes.apple.com/cn/app/id1037944189',
    androidSchema: 'haofenshu://student/launcher',
    yyb: 'https://a.app.qq.com/o/simple.jsp?pkgname=com.yunxiao.haofenshu',
  },
}
export default {
  props: {
    appInfo: {
      type: Object,
    },
    openLaunch: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: 'parent',
    },
  },
  emits: ['launch'],
  computed: {
    platform() {
      if (isHFSStudent())
        return 'student'
      if (isHFSParent())
        return 'parent'
      return this.$route.query.platform || this.role || 'parent'
    },
    appId() {
      return HFSAppId[this.platform]
    },
    appConfig() {
      return AppConfig[this.appId]
    },
    extInfo() {
      return JSON.stringify(this.appInfo) || ''
    },
    adInfo() {
      return this.extInfo && `?ad=${this.extInfo}`
    },
    isWechat() {
      return isWechat()
    },
    isQQ() {
      return isQQ()
    },
    isIos() {
      return uni.$u.os() === 'ios'
    },
    showLaunch() {
      return this.openLaunch && this.isWechat
    },
  },
  methods: {
    ready() {},
    launch() {
      this.$emit('launch')
    },
    error() {
      this.launchAppInH5()
    },
    launchAppInH5() {
      const { androidSchema, iosSchema, yyb, itunes } = this.appConfig
      const platform = {
        ios: { key: 'ios_schema', schema: iosSchema, yyb, link: itunes },
        android: { key: 'android_schema', schema: androidSchema, yyb },
      }
      this.launchApp(platform[uni.$u.os()])
    },
    launchApp({ key, schema, yyb, link }) {
      const src = `${schema}${this.adInfo}`
      const yybSrc = `${yyb}${(this.extInfo || this.isQQ) ? `&${key}=${encodeURIComponent(src)}` : ''}`
      if (this.isWechat || this.isQQ) {
        return (window.location = yybSrc)
      }
      window.location = src
      const timer = window.setTimeout(() => {
        window.location = link || yybSrc
        window.clearTimeout(timer)
        return false
      }, 2000)
    },
  },
}
</script>

<style lang="scss" scoped>
.launch-app {
  position: relative;
  &__btn {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
  }
}
</style>
