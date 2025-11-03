<script setup lang="ts">
import { checkUpdate } from './utils'

defineOptions({
  globalData: {
    accountInfo: null, // 账号信息
    phoneNumber: null, // 手机号
    buyedList: [], // 已购买列表
    redirect_uri: '', // 回调地址
  },
})

onLaunch(() => {
  // #ifndef H5
  checkUpdate() // 小程序检测版本升级
  // #endif
})

onShow(() => {})

onHide(() => {})
</script>

<style lang="scss">
@import './assets/styles/reset.scss';
@import 'uview-plus/index.scss';
</style>
