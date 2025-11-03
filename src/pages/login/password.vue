<template>
  <view class="password">
    <view class="password-title">
      注册账号
    </view>
    <u-form ref="form" :model="form" :rules="rules" error-type="toast">
      <!-- 手机号 -->
      <u-form-item prop="loginName">
        <u-input v-model="form.loginName" type="number" disabled-color="#ffffff" placeholder="请输入手机号" placeholder-style="color: #939393; font-size: 28rpx;" color="#333333" font-size="28rpx" :custom-style="{ border: 'none', background: '#f6f6f6', borderRadius: '48rpx', padding: '20rpx 40rpx 20rpx 32rpx' }" @input="input('loginName')" @focus="input('loginName')" @blur="blur('loginName')">
          <template #prefix>
            <view class="prefix">
              <image class="prefix-icon" :src="`${resourceUrl}register-phone.png`" />
              <u-line color="#e6e6e6" direction="col" :hairline="false" length="32rpx" margin="0 14rpx 0 20rpx" />
            </view>
          </template>
          <template #suffix>
            <view class="suffix">
              <image v-show="suffix.loginName" class="suffix-icon" :src="`${resourceUrl}register-clear.png`" @click="clear('loginName')" />
            </view>
          </template>
        </u-input>
      </u-form-item>
      <!-- 验证码 -->
      <u-form-item prop="code">
        <u-input v-model="form.code" type="number" disabled-color="#ffffff" placeholder="请输入验证码" placeholder-style="color: #939393; font-size: 28rpx;" color="#333333" font-size="28rpx" :custom-style="{ border: 'none', background: '#f6f6f6', borderRadius: '48rpx', padding: '20rpx 40rpx 20rpx 32rpx' }">
          <template #prefix>
            <view class="prefix">
              <image class="prefix-icon" :src="`${resourceUrl}register-code.png`" />
              <u-line color="#e6e6e6" direction="col" :hairline="false" length="32rpx" margin="0 14rpx 0 20rpx" />
            </view>
          </template>
          <template #suffix>
            <view class="suffix password-code">
              <u-button :text="codeText" color="transparent" :custom-style="{ border: 'none', color: '#FF4D2B', fontSize: '28rpx', height: '48rpx' }" :disabled="disabledCode" @click="getCode" />
            </view>
          </template>
        </u-input>
      </u-form-item>
      <!-- 密码 -->
      <u-form-item prop="password">
        <u-input v-model="form.password" :password="!show" disabled-color="#ffffff" placeholder="请设置密码（8-20 位数字、字母、符号）" placeholder-style="color: #939393; font-size: 28rpx;" color="#333333" font-size="28rpx" :custom-style="{ border: 'none', background: '#f6f6f6', borderRadius: '48rpx', padding: '20rpx 40rpx 20rpx 32rpx' }" @input="input('password')" @focus="input('password')" @blur="blur('password')">
          <template #prefix>
            <view class="prefix">
              <image class="prefix-icon" :src="`${resourceUrl}register-password.png`" />
              <u-line color="#e6e6e6" direction="col" :hairline="false" length="32rpx" margin="0 14rpx 0 20rpx" />
            </view>
          </template>
          <template #suffix>
            <view class="suffix">
              <image v-show="suffix.password" class="suffix-icon" :src="`${resourceUrl}register-clear.png`" @click="clear('password')" />
              <image v-show="form.password" class="suffix-icon" :src="`${resourceUrl}${show ? 'register-noeyes.png' : 'register-eyes.png'}`" @click="show = !show" />
            </view>
          </template>
        </u-input>
      </u-form-item>
    </u-form>
    <view class="password-info" @click="checked = !checked">
      <image class="checkbox" :src="`${resourceUrl}${checked ? 'register-select.png' : 'register-default.png'}`" />
      <view class="desc">
        我已阅读并同意
        <text v-for="(item, index) in agreement" :key="index" class="active" @click.stop="agreementDetail(item.url)">
          <text v-if="item.pre" class="pre">
            {{ item.pre }}
          </text>{{ item.name }}
        </text>
      </view>
    </view>
    <view class="password-disabled">
      <u-button :text="options.icode ? '下一步' : '注册'" :custom-style="{ borderRadius: '40rpx', height: '80rpx', color: '#ffffff', fontSize: '30rpx', background: 'linear-gradient(0deg, #FF4D2B, #FF5900)', marginTop: '20rpx' }" :throttle-time="500" :disabled="disabledSubmit" @click="submit" />
    </view>
    <view class="tips">
      <view class="tips-contact" @click="openCustomerServiceChat">
        <image class="tips-contact__icon" :src="`${resourceUrl}register-customer.png`" />客服
      </view>
    </view>
    <u-code ref="uCode" change-text="已发送(xs)" :seconds="seconds" @change="codeChange" @start="disabledCode = true" @end="disabledCode = false" />
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" bg-color="transparent" close-on-click-overlay @close="closePopup">
      <view v-if="popup.type === 'code'" class="code">
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
      <view v-if="popup.type === 'agreement'" class="agreement">
        <view class="agreement-title">
          请阅读并同意以下条款
        </view>
        <view class="agreement-info">
          同意
          <text v-for="(item, index) in agreement" :key="index" class="active" @click.stop="agreementDetail(item.url)">
            <text v-if="item.pre" class="pre">
              {{ item.pre }}
            </text>{{ item.name }}
          </text>
        </view>
        <view class="agreement-button" @click="handleAgreement">
          同意并继续
        </view>
        <view class="agreement-close" @click="closePopup">
          <u-icon name="close" color="#333333" size="36rpx" bold />
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { btoa } from '../../utils/base64'
import { getUserInfo } from '../../utils/login'

export default {
  data() {
    return {
      resourceUrl: `${feConfig.resourceUrl}/images/`,
      options: {},
      form: {
        loginName: '',
        code: '',
        password: '',
        confirm: '',
        invitationCode: '',
      },
      show: false, // 密码是否可见
      suffix: {
        loginName: false,
        code: false,
        password: false,
      },
      checked: false,
      agreement: [
        { name: '《好分数应用使用许可》', url: 'https://m2.yunxiao.com/v2/uselicense.html' },
        { name: '《好分数隐私政策》', pre: '、', url: 'https://m2.yunxiao.com/v2/privacypolicy.html' },
        { name: '《儿童隐私政策》', pre: '及', url: 'https://m2.yunxiao.com/v2/childrenPrivacypolicy.html' },
      ],
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
      codeText: '获取验证码',
      seconds: 60,
      disabledCode: false,
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        src: '',
        value: '',
        type: '',
      },
    }
  },
  computed: {
    disabledSubmit() {
      return !this.form.loginName || !this.form.code || !this.form.password
    },
  },
  onLoad(options) {
    this.options = options
    this.form.invitationCode = options.icode || ''
  },
  onReady() {
    this.$refs.form.setRules(this.rules)
  },
  methods: {
    showPopup(type, params = {}) {
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    closePopup() {
      this.popup.show = false
    },
    input(key) {
      if (this.form[key])
        return (this.suffix[key] = true)
      this.suffix[key] = false
    },
    blur(key) {
      this.suffix[key] = false
    },
    clear(key) {
      this.form[key] = ''
      this.suffix[key] = false
    },
    agreementDetail(url) {
      return uni.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(url)}`,
      })
    },
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
            await uni.$http.post('/v1/be-proxy/v2/native-users/verification-msg-with-captcha', params, { custom: { error: false } })
            uni.$u.toast('验证码已发送')
            this.$refs.uCode.start()
          }
          catch (err) {
            if (err.code === 4048) {
              this.showPopup('code')
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
      this.closePopup()
      this.popup.value = ''
    },
    handleAgreement() {
      this.closePopup()
      this.checked = true
      this.submit()
    },
    submit() {
      this.$refs.form.validate().then((valid) => {
        if (valid) {
          if (!this.checked)
            return (this.showPopup('agreement'))
          const data = getApp().globalData
          const { loginName: phone, password, code: vcode, invitationCode } = this.form
          const params = {
            phone,
            unionId: data.accountInfo.unionId,
            roleType: this.options.roleType,
            password,
            vcode,
            invitationCode,
          }
          uni.$http.post('/v2/mini/account-register', params).then(async () => {
            if (!params.invitationCode)
              return uni.reLaunch({ url: '/pages/index/index' })
            await getUserInfo()
            return uni.navigateTo({ url: `/pages/me/bindStudent?invitationCode=${invitationCode}` })
          }).catch((err) => {
            uni.showToast({
              title: err.errStack,
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
.password {
  height: 100vh;
  padding: 20rpx 30rpx;
  &-title {
    font-size: 48rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 72rpx;
  }
  ::v-deep .u-form {
    margin-bottom: 80rpx;
    .u-form-item {
      margin-bottom: 28rpx;
      &:last-child {
        margin-bottom: 0;
      }
      .u-form-item__body {
        padding: 0;
      }
      .prefix {
        display: flex;
        align-items: center;
        &-icon {
          width: 48rpx;
          height: 48rpx;
        }
      }
      .suffix {
        display: flex;
        align-items: center;
        .u-button:before {
          background-color: transparent;
        }
        &-icon {
          width: 36rpx;
          height: 36rpx;
          margin-right: 20rpx;
          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
  }
  &-info {
    display: flex;
    align-items: flex-start;
    margin-bottom: 40rpx;
    .checkbox {
      display: inline-flex;
      width: 22rpx;
      height: 22rpx;
      margin: 8rpx 8rpx 0 0;
      flex-shrink: 0;
    }
    .desc {
      font-size: 22rpx;
      color: #b1b1b1;
      .active {
        color: #ff4d2b;
        .pre {
          color: #b1b1b1;
        }
      }
    }
  }
  &-code {
    ::v-deep .u-button--disabled {
      opacity: 1 !important;
      color: #939393 !important;
    }
  }
  &-disabled {
    ::v-deep .u-button--disabled {
      opacity: 1 !important;
      background: #e6e6e6 !important;
    }
  }
  .tips {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 26rpx;
    margin-top: 28rpx;
    &-contact {
      display: flex;
      align-items: center;
      color: #ff4d2b;
      &__icon {
        width: 30rpx;
        height: 30rpx;
        margin-right: 4rpx;
      }
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
  .agreement {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 576rpx;
    background: #ffffff;
    border-radius: 24rpx;
    padding: 38rpx 52rpx 40rpx;
    position: relative;
    &-title {
      font-size: 36rpx;
      color: #333333;
      margin-bottom: 24rpx;
    }
    &-info {
      font-size: 24rpx;
      color: #939393;
      margin-bottom: 32rpx;
      .active {
        color: #ff4d2b;
        .pre {
          color: #939393;
        }
      }
    }
    &-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 412rpx;
      height: 72rpx;
      background: #ff4d2b;
      border-radius: 36rpx;
      font-size: 28rpx;
      font-weight: bold;
      color: #ffffff;
    }
    &-close {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
    }
  }
}
</style>
