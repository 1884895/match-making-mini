<template>
  <view class="login">
    <view class="title">
      欢迎登录
    </view>
    <view class="tabs">
      <view v-for="(item, index) in roleList" :key="index" class="tabs-item" :class="{ active: item.type === form.roleType }" @click="form.roleType = item.type">
        {{ item.name }}登录
      </view>
    </view>
    <view class="form">
      <u-form ref="form" :model="form" :rules="rules" error-type="toast">
        <u-form-item prop="loginName" border-bottom>
          <u-input v-model="form.loginName" type="number" border="none" clearable disabled-color="#ffffff" placeholder="请输入手机号" placeholder-style="color: #cccccc; font-size: 30rpx;" color="#333333" font-size="30rpx" :custom-style="{ height: '50rpx' }" />
        </u-form-item>
        <u-form-item prop="password" border-bottom>
          <u-input v-model="form.password" :password="password" border="none" clearable disabled-color="#ffffff" placeholder="请输入密码" placeholder-style="color: #cccccc; font-size: 30rpx;" color="#333333" font-size="30rpx" :custom-style="{ height: '50rpx', marginTop: '30rpx' }">
            <template #suffix>
              <u-icon name="eye" color="#e6e6e6" size="50rpx" @click="password = !password" />
            </template>
          </u-input>
        </u-form-item>
      </u-form>
    </view>
    <view class="info">
      <u-checkbox-group v-model="checked">
        <u-checkbox shape="circle" active-color="#FF4D2B" name="login" />
      </u-checkbox-group>
      <view class="desc">
        我已阅读并同意
        <text v-for="(item, index) in agreement" :key="index" class="active" @click="agreementDetail(item.url)">
          <text v-if="item.pre" class="pre">
            {{ item.pre }}
          </text>{{ item.name }}
        </text>
      </view>
    </view>
    <u-button text="立即登录" :custom-style="{ borderRadius: '40rpx', height: '80rpx', color: '#ffffff', fontSize: '30rpx', background: 'linear-gradient(0deg, #FF4D2B, #FF5900)' }" :throttle-time="500" @click="handleClick" />
    <view class="role">
      <view class="password" @click="passwordClick">
        忘记密码
      </view>
      <view class="register" @click="registerClick">
        注册新账号
      </view>
    </view>
  </view>
</template>

<script>
import { loginBase, loginByPassword } from '../../utils/login'
import { RoleList } from '@/enums'

export default {
  data() {
    return {
      options: {},
      checked: [],
      form: {
        loginName: '',
        password: '',
        roleType: 2,
        rememberMe: 1,
      },
      password: true,
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
        password: [
          {
            required: true,
            message: '请输入密码',
          },
          {
            min: 8,
            message: '密码不能小于8位',
          },
        ],
      },
      agreement: [
        { name: '《好分数应用使用许可》', url: 'https://m2.yunxiao.com/v2/uselicense.html' },
        { name: '《好分数隐私政策》', pre: '、', url: 'https://m2.yunxiao.com/v2/privacypolicy.html' },
        { name: '《儿童隐私政策》', pre: '及', url: 'https://m2.yunxiao.com/v2/childrenPrivacypolicy.html' },
      ],
    }
  },
  computed: {
    roleList() {
      return RoleList
    },
  },
  onLoad(options) {
    this.options = options
  },
  onReady() {
    this.$refs.form.setRules(this.rules)
  },
  methods: {
    handleClick() {
      if (!this.checked.length) {
        return uni.showToast({
          title: '请先阅读并同意相关协议',
          icon: 'none',
        })
      }
      this.$refs.form.validate().then(async (valid) => {
        if (!valid)
          return
        try {
          const res = await loginByPassword(this.form)
          const { loginName = '' } = res.data
          const result = await loginBase(loginName, this.form.roleType)
          if (!result)
            return
          return uni.reLaunch({
            url: '/pages/index/index',
          })
        }
        catch (err) {
          uni.$u.toast(err.msg || '登录失败')
        }
      })
    },
    agreementDetail(url) {
      return uni.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(url)}`,
      })
    },
    registerClick() {
      return uni.navigateTo({
        url: `/pages/login/register${uni.$u.queryParams(this.options)}`,
      })
    },
    passwordClick() {
      return uni.navigateTo({
        url: `/pages/login/forgetPassword?roleType=${this.form.roleType}`,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.login {
  height: 100vh;
  padding: 60rpx 58rpx 0;
  background: #ffffff;
  .title {
    font-size: 60rpx;
    font-weight: 500;
    color: #333333;
    margin-bottom: 90rpx;
  }
  .tabs {
    display: flex;
    align-items: center;
    margin-bottom: 80rpx;
    .tabs-item {
      position: relative;
      font-size: 34rpx;
      color: #666666;
      margin-right: 66rpx;
      &.active {
        font-weight: 500;
        color: #333333;
        &::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -18rpx;
          transform: translateX(-50%);
          width: 87rpx;
          height: 8rpx;
          background: linear-gradient(0deg, #ff5900, #ff842d);
          border-radius: 40rpx;
        }
      }
      &:last-child {
        &::before {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: -33rpx;
          width: 1rpx;
          height: 26rpx;
          background: #e6e6e6;
          border-radius: 1rpx;
        }
      }
    }
  }
  .form {
    width: 100%;
    margin-bottom: 32rpx;
  }
  .role {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20rpx;
    .password {
      font-size: 26rpx;
      color: #999999;
    }
    .register {
      font-size: 26rpx;
      color: #ff4d2b;
    }
  }
  .info {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
  }
  .desc {
    font-size: 24rpx;
    color: #999999;
  }
  .active {
    color: #ff4d2b;
    .pre {
      color: #999999;
    }
  }
}
</style>
