<template>
  <view class="setting">
    <u-cell-group :border="false" :custom-style="{ background: '#fff', marginBottom: '20rpx' }">
      <u-cell size="large" title="学生信息" :value="hasStudent ? studentInfo.studentName : '未绑定'" is-link @click="viewStudentInfo" />
      <u-cell size="large" title="手机号" :value="userInfo.phoneNumber" />
    </u-cell-group>
    <view class="button">
      <u-button text="退出登录" :throttle-time="500" :hairline="false" color="#FF4D2B" :custom-style="{ border: 'none', borderRadius: '63.54rpx', height: '80rpx' }" @click="logout" />
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      options: {},
      userInfo: {},
    }
  },
  computed: {
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
    hasStudent() {
      return this.userInfo.linkedStudent && (this.userInfo.linkedStudent.isVirtual === 2)
    },
  },
  onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || {}
  },
  methods: {
    viewStudentInfo() {
      if (this.hasStudent) {
        return uni.navigateTo({
          url: '/pages/me/studentInfo',
        })
      }
      return uni.navigateTo({
        url: '/pages/me/bindStudent',
      })
    },
    logout() {
      uni.$http.post('/v2/mini/account-logout').then(() => {
        uni.removeStorageSync('courseCache')
        uni.removeStorageSync('shieldConfig')
        return uni.reLaunch({
          url: '/pages/index/index',
        })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.setting {
  min-height: 100vh;
  background: #f6f6f6;
  .button {
    position: fixed;
    bottom: calc(env(safe-area-inset-bottom) + 100rpx);
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 0 30rpx;
  }
}
</style>
