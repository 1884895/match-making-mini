<template>
  <view class="forget">
    <u-form ref="form" :model="form" :rules="rules" error-type="toast">
      <u-form-item prop="loginName">
        <u-input v-model="form.loginName" type="number" clearable disabled-color="#ffffff" placeholder="请输入手机号" placeholder-style="color: #cccccc; font-size: 30rpx;" color="#333333" font-size="30rpx" :custom-style="{ border: '2rpx solid #e6e6e6 !important', borderRadius: '6rpx' }" />
      </u-form-item>
      <u-form-item prop="code">
        <u-input v-model="form.code" type="number" clearable disabled-color="#ffffff" placeholder="请输入验证码" placeholder-style="color: #cccccc; font-size: 30rpx;" color="#333333" font-size="30rpx" :custom-style="{ border: '2rpx solid #e6e6e6 !important', borderRadius: '6rpx' }">
          <template #suffix>
            <u-button :text="codeText" color="#FF4D2B" :custom-style="{ borderRadius: '6rpx', fontSize: '28rpx' }" size="mini" :disabled="disabledCode" @click="getCode" />
          </template>
        </u-input>
      </u-form-item>
    </u-form>
    <u-button text="下一步" :custom-style="{ borderRadius: '40rpx', height: '80rpx', color: '#ffffff', fontSize: '30rpx', background: 'linear-gradient(0deg, #FF4D2B, #FF5900)', marginTop: '40rpx' }" :throttle-time="500" @click="submit" />
    <view class="tips">
      <view class="tips-code" @click="modal.show = true">
        收不到验证码？
      </view>
      <view class="tips-contact" @click="openCustomerServiceChat">
        在线服务
      </view>
    </view>
    <u-code ref="uCode" :seconds="seconds" @change="codeChange" @start="disabledCode = true" @end="disabledCode = false" />
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" bg-color="transparent" close-on-click-overlay @close="popup.show = false">
      <view class="code">
        <view class="code-title">
          请先按图形输入正确数字
        </view>
        <view class="code-info" @click="refreshCode">
          <image class="code-info__img" :src="`data:image/svg+xml;base64,${popup.src}`" mode="widthFix" />
          <view class="code-info__text">
            看不清？点击刷新
          </view>
        </view>
        <view class="code-input">
          <u-input v-model="popup.value" placeholder="请输入图中数字" clearable type="number" input-align="center" placeholder-style="color: #cccccc; font-size: 30rpx;" color="#333333" font-size="30rpx" :custom-style="{ border: '2rpx solid #e6e6e6 !important', borderRadius: '6rpx' }" />
        </view>
        <view class="code-button" @click="handleCode">
          确认
        </view>
      </view>
    </u-popup>
    <u-modal :show="modal.show" :title="modal.title" confirm-text="我知道了" confirm-color="#FF4D2B" @confirm="modal.show = false">
      <scroll-view scroll-y="true" style="max-height: 450rpx;">
        <text>{{ modal.content }}</text>
      </scroll-view>
    </u-modal>
  </view>
</template>

<script>
import { btoa } from '../../utils/base64'

export default {
  data() {
    return {
      options: {},
      form: {
        loginName: '',
        code: '',
      },
      rules: {
        loginName: [
          {
            required: true,
            message: '请输入手机号',
          },
          {
            validator: (rule, value, _callback) => {
              return uni.$u.test.mobile(value)
            },
            message: '手机号码不正确',
          },
        ],
        code: [
          {
            required: true,
            message: '请输入验证码',
          },
        ],
      },
      codeText: '获取验证码',
      seconds: 60,
      disabledCode: false,
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        src: '',
        value: '',
      },
      modal: {
        show: false,
        title: '收不到验证码疑问解答',
        content: '收不到验证码可能的情况：\n1、手机装了拦截软件。\n2、手机关机、暂无信号、欠费或者停机。\n3、欠费停机后充值复机第一天内可能无法接收SP短信。\n4、手机在境外使用或者使用境外手机。\n5、网络不好，运营商故障，新号段手机，运营商黑名单等其他原因。\n\n解决方法：\n1、请在安全软件内排查是否验证短信被拦截。\n2、60s后重新获取一次验证码。如果依然无法获取短信，建议换一个时段再尝试。\n3、若你已经多次点击重获验证码，仍无法收到验证码时，你可以到好分数网站：www.haofenshu.com 使用邮箱进行注册。网站注册成功后，就可以使用邮箱作为账号登陆好分数APP。',
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
    openCustomerServiceChat() {
      return wx.openCustomerServiceChat(feConfig.customer)
    },
    async getCode(code) {
      this.$refs.form.validateField('loginName', async (err) => {
        if (err.length) {
          return uni.$u.toast(err[0].message)
        }
        if (this.$refs.uCode.canGetCode) {
          const params = {
            code,
            phoneNumber: this.form.loginName,
            roleType: this.options.roleType,
          }
          try {
            await uni.$http.post('/v1/be-proxy/v2/users/retrieving-msg-code-with-captcha', params, { custom: { error: false } })
            uni.$u.toast('验证码已发送')
            this.$refs.uCode.start()
          }
          catch (err) {
            if (err.code === 4048) {
              this.popup.show = true
              this.popup.src = btoa(err.data.pic)
              return
            }
            return uni.$u.toast(err.msg || '获取验证码失败')
          }
        }
      })
    },
    codeChange(codeText) {
      this.codeText = codeText
    },
    async refreshCode() {
      const res = await uni.$http.get(`/v1/be-proxy/v2/users/captcha?phone=${this.form.loginName}`, {}, { custom: { loading: false } })
      this.popup.src = btoa(res.data.pic)
    },
    async handleCode() {
      const code = this.popup.value.trim()
      if (!code)
        return uni.$u.toast('请输入图中数字')
      await this.getCode(code)
      this.popup.show = false
      this.popup.value = ''
    },
    submit() {
      this.$refs.form.validate().then((valid) => {
        if (valid) {
          const { loginName: phoneNumber, code: retrievingMsgCode } = this.form
          const params = {
            phoneNumber,
            roleType: this.options.roleType,
            retrievingMsgCode,
          }
          uni.$http.post('/v1/be-proxy/v2/users/retrieving-msg-token', params).then((res) => {
            const { retrievingMsgToken: retrievingToken } = res.data
            return uni.redirectTo({
              url: `/pages/login/resetPassword${uni.$u.queryParams({ retrievingToken, retrievingType: 2 })}`,
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
.forget {
  height: 100vh;
  padding: 20rpx 30rpx;
  .tips {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 26rpx;
    margin-top: 20rpx;
    &-code {
      color: #999999;
    }
    &-contact {
      color: #ff4d2b;
    }
  }
  .code {
    width: 625rpx;
    background: #ffffff;
    border-radius: 16.67rpx;
    padding: 40rpx 30rpx;
    &-title {
      font-size: 34rpx;
      color: #333333;
      font-weight: 500;
      margin-bottom: 40rpx;
      text-align: center;
    }
    &-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 40rpx;
      &__img {
        width: 200rpx;
        height: auto;
        margin-bottom: 20rpx;
      }
      &__text {
        font-size: 28rpx;
        color: #939393;
      }
    }
    &-input {
      margin-bottom: 40rpx;
    }
    &-button {
      width: 100%;
      height: 70rpx;
      background: #ff4d2b;
      border-radius: 40rpx;
      color: #ffffff;
      font-size: 30rpx;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
