<template>
  <view class="teacher-invite-register">
    <view class="wrapper">
      <u-form ref="form" :model="form" :rules="rules" error-type="toast">
        <u-form-item v-for="(item) in options" :key="item.key" :prop="item.key">
          <view class="item">
            <view class="item-title">
              <image class="item-title-icon" :class="{ disabled: item.disabled }" :src="resourceUrl + item.icon" mode="widthFix" />
              <view class="item-title-text" :class="{ disabled: item.disabled }">
                {{ item.title }}
              </view>
            </view>
            <view class="item-input">
              <u-input v-model="form[item.key]" :focus="item.key === 'phone'" :type="item.type" :disabled="item.disabled" :placeholder="item.placeholer" placeholder-style="color: #939393; font-size: 28rpx;" :color="item.disabled ? '#939393' : '#333333'" font-size="28rpx" :custom-style="{ height: '40rpx', padding: '0', border: 'none', background: '#ffffff' }">
                <template #suffix>
                  <view v-if="item.key === 'verificationCode'" class="suffix password-code">
                    <u-button :text="codeText" color="transparent" :custom-style="{ background: '#2097ff', border: 'none', borderRadius: '30rpx', color: '#ffffff', fontSize: '26rpx', height: '52rpx' }" :disabled="disabledCode" @click="getCode()" />
                  </view>
                </template>
              </u-input>
            </view>
          </view>
        </u-form-item>
      </u-form>
      <view class="register-button" @click="submit">
        <view class="register-button-text">
          注册并绑定
        </view>
      </view>
      <view class="info" @click="checked = !checked">
        <image class="checkbox" :src="`${resourceUrl}${checked ? 'icon-register-select.png' : 'icon-register-default.png'}`" />
        <view class="desc">
          我已阅读并同意
          <text v-for="(item, index) in agreement" :key="index" class="active" @click.stop="agreementDetail(item.url)">
            <text v-if="item.pre" class="pre">
              {{ item.pre }}
            </text>{{ item.name }}
          </text>
        </view>
      </view>
    </view>
    <u-code ref="uCode" change-text="已发送(xs)" :seconds="seconds" @change="codeChange" @start="disabledCode = true" @end="disabledCode = false" />
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" bg-color="transparent" :close-on-click-overlay="popup.closeOnClickOverlay" @close="closePopup">
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
      <view v-if="popup.type === 'newPromoter'" class="promoter">
        <image class="promoter-bg" :src="`${miniResourceUrl}newPromoter_bg.png`" mode="widthFix" />
        <view class="promoter-btns">
          <image class="promoter-btns__left" :src="`${miniResourceUrl}newPromoter_pay.png`" mode="widthFix" @click="promoterJump('pay')" />
          <image class="promoter-btns__right" :src="`${miniResourceUrl}newPromoter_enter.png`" mode="widthFix" @click="promoterJump('land')" />
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { btoa } from '../../utils/base64'
import { getUserInfo, loginBase, loginByPassword } from '../../utils/login'
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  data() {
    return {
      studentId: '',
      secret: '',
      gzhCode: '',
      resourceUrl: `${feConfig.resourceUrl}/images/teacherInviteRegister/`,
      miniResourceUrl: `${feConfig.resourceUrl}/images/`,
      options: [
        {
          key: 'name',
          icon: 'icon-name.png',
          title: '姓名',
          type: 'text',
          placeholer: '请输入姓名',
          defaultValue: '张三',
          disabled: true,
        },
        {
          key: 'studentNumber',
          icon: 'icon-student-number.png',
          title: '学号',
          type: 'text',
          placeholer: '请输入学号',
          defaultValue: '张三',
          disabled: true,
        },
        {
          key: 'phone',
          icon: 'icon-phone.png',
          title: '手机号',
          type: 'number',
          placeholer: '请输入手机号',
          defaultValue: '',
          disabled: false,
        },
        {
          key: 'verificationCode',
          icon: 'icon-verification-code.png',
          title: '验证码',
          type: 'text',
          placeholer: '请输入短信验证码',
          defaultValue: '',
          disabled: false,
        },
        {
          key: 'password',
          icon: 'icon-password.png',
          title: '密码',
          type: 'password',
          placeholer: '请设置8-20位由数字、字母、符号组成的密码',
          defaultValue: '',
          disabled: false,
        },
      ],
      form: {
        name: '',
        studentNumber: '',
        phone: '',
        verificationCode: '',
        password: '',
      },
      rules: {
        name: {
          required: false,
        },
        studentNumber: {
          required: false,
        },
        phone: [
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
        verificationCode: [
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
      },
      roleType: 2,
      studentInfo: {},
      codeText: '获取验证码',
      disabledCode: false,
      seconds: 60,
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        src: '',
        value: '',
        type: '',
        closeOnClickOverlay: true,
      },
      checked: false,
      agreement: [
        { name: '《好分数应用使用许可》', url: 'https://m2.yunxiao.com/v2/uselicense.html' },
        { name: '《好分数隐私政策》', pre: '、', url: 'https://m2.yunxiao.com/v2/privacypolicy.html' },
        { name: '《儿童隐私政策》', pre: '及', url: 'https://m2.yunxiao.com/v2/childrenPrivacypolicy.html' },
      ],
      actionId: 'teacherNew',
      isTeacherNewPromoter: 0, // 0不上报， 1上报
    }
  },
  methods: {
    async getStudentInfo() {
      const secret = this.secret
      if (secret.length === 0) {
        return uni.$u.toast('缺少必要参数：secret')
      }

      const studentId = this.studentId
      if (studentId.length === 0) {
        return uni.$u.toast('缺少必要参数：studentId')
      }

      const { data: { students, isNewPromoter } } = await uni.$http.get('/v1/classes/students', { secret })
      this.studentInfo = students.find(v => v.id === studentId)
      this.isTeacherNewPromoter = isNewPromoter
      this.form.name = this.studentInfo.name
      this.form.studentNumber = this.studentInfo.xuehao || this.studentInfo.kaohao || ''
    },
    agreementDetail(url) {
      return uni.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(url)}`,
      })
    },
    async getCode(code) {
      this.$refs.form.validateField('phone', async (err) => {
        if (err.length) {
          return uni.$u.toast(err[0].message)
        }
        if (this.$refs.uCode.canGetCode) {
          const params = {
            code,
            phoneNumber: this.form.phone,
            roleType: this.roleType,
          }
          try {
            await uni.$http.post('/v1/be-proxy/v2/native-users/verification-msg-with-captcha', params, { custom: { error: false } })
            uni.$u.toast('验证码已发送')
            this.$refs.uCode.start()
          }
          catch (err) {
            if (err.code === 4048) {
              if (code) {
                uni.$u.toast('验证码错误，请重试')
              }
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
    showPopup(type, params = {}) {
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    closePopup() {
      this.popup.show = false
    },
    async refreshCode() {
      const res = await uni.$http.get(`/v1/be-proxy/v2/users/captcha?phone=${this.form.phone}`, {}, { custom: { loading: false } })
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
    async submit() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      this.$refs.form.validate().then(async (valid) => {
        if (valid) {
          if (!this.checked)
            return (this.showPopup('agreement'))
          // const data = getApp().globalData;
          report('teacherInvite', 'zcy_zcbd_click')
          this.teacherReport('fx_zcbbd')
          const { phone, password, verificationCode } = this.form
          const verificationMsgToken = JSON.stringify({
            phoneNumber: phone,
            password,
            verificationCode,
            roleType: this.roleType,
          })
          let params = {
            code: this.gzhCode,
            roleType: this.roleType,
            deviceType: 4,
            verificationType: 2,
            verificationMsgToken,
          }
          let resp = await uni.$http.post('/v1/accounts/users-without-student', params)
          if (resp && (resp.code === 0 || resp.code === 1 || resp.code === 2001)) {
            params = {
              studentId: that.studentId,
              secret: that.secret,
            }
            resp = await uni.$http.post('/v1/accounts/native-users/bind-students', params)
            if (resp && (resp.code === 0 || resp.code === 1 || resp.code === 2001)) {
              this.teacherReport('fx_zcbbdcg')
              // 登录
              const form = { loginName: phone, password, roleType: 2, rememberMe: 1 }
              const res = await loginByPassword(form)
              const { loginName = '' } = res.data || {}
              const result = await loginBase(loginName, form.roleType)
              if (!result)
                return uni.navigateTo({ url: '/pages/login/login' })

              // 获取用户信息，判断是否打开星推官弹窗
              const userInfo = await getUserInfo({ loading: false, error: false })
              const { schoolId } = userInfo.linkedStudent || {}
              if (schoolId) {
                const isNewPromoter = await this.checkNewPromoter(schoolId)
                if (isNewPromoter) {
                  return this.showPopup('newPromoter', { closeOnClickOverlay: false })
                }
              }
              return uni.reLaunch({ url: '/pages/index/index' })
            }
          }
          // uni.$http.post('/v2/mini/account-register', params).then(async() => {
          //   if (!params.invitationCode) return uni.reLaunch({ url: '/pages/index/index' });
          //   await getUserInfo();
          //   return uni.navigateTo({ url: `/pages/me/bindStudent?invitationCode=${invitationCode}` });
          // }).catch(err => {
          //   uni.showToast({
          //     title: err.errStack,
          //     icon: 'none'
          //   });
          // });
        }
      })
    },
    async checkNewPromoter(schoolId) {
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/ads/user/plan/check-new-promoter`, { schoolId: Number.parseInt(schoolId) })
      const { isNewPromoter = false } = res.data || {}
      return isNewPromoter
    },
    // 新推官跳转
    promoterJump(type) {
      const urlMap = {
        pay: `/pages/me/member?activityType=newPromoter&action=bdy_mzk&actionId=${this.actionId}`,
        land: `/uni_modules/hfs-fe-uni-module/pages/newPromoter/operation?action=bdy_lyrdzk&actionId=${this.actionId}`,
      }
      return uni.reLaunch({ url: urlMap[type] })
    },
    teacherReport(action) {
      this.isTeacherNewPromoter && report(this.actionId, action)
    },
  },
  async onLoad(options) {
    if (options.secret && options.secret.length > 0) {
      this.secret = options.secret
    }

    if (options.studentId && options.studentId.length > 0) {
      this.studentId = options.studentId
    }

    if (options.gzhCode && options.gzhCode.length > 0) {
      this.gzhCode = options.gzhCode
    }

    await this.getStudentInfo()
    this.teacherReport('fx_ljzc')
  },
}
</script>

<style lang="scss" scoped>
.teacher-invite-register {
  background: #daeeff;
  padding: 32rpx 28rpx;

  .wrapper {
    min-height: calc(100vh - 64rpx);
    background: #ffffff;
    border-radius: 24rpx;

    ::v-deep .u-form-item__body {
      padding: 0 !important;
    }

    .item {
      margin: 0 24rpx;
      height: 132rpx;
      border-bottom: 1rpx solid #e6e6e6;

      display: flex;
      flex-direction: column;
      justify-content: center;

      &-title {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;

        &-icon {
          margin: 0 8rpx 0 4rpx;
          width: 24rpx;
        }

        &-text {
          height: 36rpx;
          font-size: 26rpx;
          color: #333333;

          &.disabled {
            color: #939393;
          }
        }
      }

      &-input {
        height: 40rpx;
        margin-top: 8rpx;

        ::v-deep .u-button__text {
          font-size: 26rpx !important;
        }
      }
    }

    .register-button {
      margin: 102rpx 38rpx 0;
      height: 92rpx;
      background: #2097ff;
      border-radius: 46rpx;

      display: flex;
      justify-content: center;
      align-items: center;

      &-text {
        font-size: 32rpx;
        font-weight: 500;
        color: #ffffff;
      }
    }

    .info {
      padding: 0 36rpx;
      display: flex;
      align-items: flex-start;
      margin-top: 28rpx;
      margin-bottom: 40rpx;
      .checkbox {
        display: inline-flex;
        width: 28rpx;
        height: 28rpx;
        margin: 8rpx 8rpx 0 0;
        flex-shrink: 0;
      }
      .desc {
        font-size: 24rpx;
        color: #333333;
        .active {
          color: #2097ff;
          .pre {
            color: #333333;
          }
        }
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

  .promoter {
    position: relative;
    &-bg {
      width: 534rpx;
      height: 706rpx;
    }
    &-btns {
      width: calc(100% - 40rpx);
      position: absolute;
      bottom: 24rpx;
      left: 20rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &__left {
        width: 230rpx;
        height: 80rpx;
      }
      &__right {
        width: 254rpx;
        height: 80rpx;
      }
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
