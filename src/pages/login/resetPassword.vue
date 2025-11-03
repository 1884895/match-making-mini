<template>
  <view class="reset">
    <u-form ref="form" :model="form" :rules="rules" error-type="toast">
      <u-form-item prop="password">
        <u-input v-model="form.password" password clearable disabled-color="#ffffff" placeholder="请输入8位及以上英文、数字、符号密码" placeholder-style="color: #cccccc; font-size: 30rpx;" color="#333333" font-size="30rpx" :custom-style="{ border: '2rpx solid #e6e6e6 !important', borderRadius: '6rpx' }" />
      </u-form-item>
      <u-form-item prop="confirm">
        <u-input v-model="form.confirm" password clearable disabled-color="#ffffff" placeholder="请再次输入密码" placeholder-style="color: #cccccc; font-size: 30rpx;" color="#333333" font-size="30rpx" :custom-style="{ border: '2rpx solid #e6e6e6 !important', borderRadius: '6rpx' }" />
      </u-form-item>
    </u-form>
    <u-button text="确认" :custom-style="{ borderRadius: '40rpx', height: '80rpx', color: '#ffffff', fontSize: '30rpx', background: 'linear-gradient(0deg, #FF4D2B, #FF5900)', marginTop: '40rpx' }" :throttle-time="500" @click="submit" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      options: {},
      form: {
        password: '',
        confirm: '',
      },
      rules: {
        password: [
          {
            required: true,
            message: '请输入登录密码',
          },
          {
            min: 8,
            message: '登录密码不能小于8位',
          },
        ],
        confirm: [
          {
            required: true,
            message: '请再次输入密码',
          },
          {
            validator: () => {
              return this.form.password === this.form.confirm
            },
            message: '两次输入密码不一致',
          },
        ],
      },
    }
  },
  onLoad(options) {
    this.options = options
  },
  onReady() {
    this.$refs.form.setRules(this.rules)
  },
  methods: {
    submit() {
      this.$refs.form.validate().then((valid) => {
        if (valid) {
          const params = {
            password: this.form.password,
            ...this.options,
          }
          uni.$http.put('/v1/be-proxy/v2/users/forgot-password', params).then(async () => {
            uni.showToast({
              title: '修改密码成功',
              icon: 'none',
            })
            await uni.$u.sleep(1000)
            return uni.reLaunch({
              url: '/pages/login/login',
            })
          }).catch((err) => {
            uni.showToast({
              title: err.msg,
              icon: 'none',
            })
          })
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.reset {
  height: 100vh;
  padding: 20rpx 30rpx;
}
</style>
