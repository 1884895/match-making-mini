<template>
  <view class="payment">
    <image class="img" :src="image" mode="widthFix" />
    <u-gap height="20rpx" bg-color="#f6f6f6" />
    <view class="open">
      <view class="title">
        开通会员
      </view>
      <u-form ref="form" :model="form" :rules="rules" error-type="toast" :label-style="labelStyle">
        <u-form-item prop="phone">
          <view class="open-input">
            <u-input v-model="form.phone" type="number" clearable shape="square" disabled-color="#ffffff" placeholder="请输入手机号" maxlength="11" @input="getStudent" />
          </view>
          <view v-if="student" class="open-info">
            <view v-if="student === -1" class="open-info__item">
              <image class="img" src="../../static/me/warnno.png" />
              <view>未注册用户</view>
            </view>
            <view v-else class="open-info__item">
              <image class="img" src="../../static/me/paydone.png" />
              <view>{{ student }}</view>
            </view>
          </view>
        </u-form-item>
      </u-form>
      <view v-for="(item, index) in goodsList" :key="index" class="open-item" :class="{ active: currentGoods.id === item.id }" @click="selectedGoods(item)">
        <view class="open-item__text">
          {{ item.name }}
        </view>
        <view class="open-item__selected">
          <view class="money">
            <text class="active">
              ￥
            </text>{{ item.price }}
          </view>
          <image v-if="currentGoods.id === item.id" class="icon" src="../../static/me/rech_icon_swit.png" />
          <view v-else class="circle" />
        </view>
      </view>
      <u-button text="立即开通" color="#FFBA1D" :custom-style="{ borderRadius: '40rpx', height: '80rpx' }" :throttle-time="500" @click="submit" />
    </view>
    <u-gap height="20rpx" bg-color="#f6f6f6" />
    <view class="question">
      <view class="title">
        常见问题
      </view>
      <view class="question-item">
        <view class="question-item__title">
          1.我已经注册了好分数
        </view>
        <view class="question-item__desc">
          请填写您注册好分数时填写的手机号，充值成功后即可在24小时内成为会员。
        </view>
      </view>
      <view class="question-item">
        <view class="question-item__title">
          2.我还没有注册好分数
        </view>
        <view class="question-item__desc">
          如果您还未注册好分数，请使用您常用的手机号码充值，完成后使用该手机注册好分数即可正常成为会员。
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAccountInfo } from '../../utils/login'

export default {
  data() {
    return {
      image: `${feConfig.resourceUrl}/images/vip_payment.png`,
      goodsList: [],
      currentGoods: {},
      labelStyle: {
        color: '#333333',
        fontSize: '30rpx',
      },
      form: {
        phone: '',
      },
      rules: {
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
      },
      student: '',
      accountInfo: {},
      channel: '',
      user: '',
    }
  },
  async onLoad(options) {
    this.channel = options.channel || this.qrCodeHandle(options.q).channel
    this.user = options.user || this.qrCodeHandle(options.q).user || ''
    const res = await getAccountInfo()
    this.accountInfo = res.data
    await this.getGoodsList()
  },
  onReady() {
    this.$refs.form.setRules(this.rules)
  },
  methods: {
    // 二维码处理
    qrCodeHandle(qr) {
      const obj = {}
      const res = decodeURIComponent(qr).split('?')
      res[1] && res[1].split('&').forEach((v) => {
        const [key, value] = v.split('=')
        obj[key] = value
      })
      return obj
    },
    // 获取商品列表
    async getGoodsList() {
      const { openId } = this.accountInfo
      const res = await uni.$http.get(`/v1/membership-promotions/good-list?openId=${openId}`)
      this.goodsList = res.data || []
      this.currentGoods = this.goodsList[0]
    },
    // 获取学生信息
    async getStudent() {
      if (!uni.$u.test.mobile(this.form.phone))
        return
      try {
        const res = await uni.$http.get('/v1/membership-promotions/student', { phone: this.form.phone })
        this.student = res.data || -1
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (err) {
        this.student = -1
      }
    },
    submit() {
      this.$refs.form.validate().then((valid) => {
        valid && this.payment()
      })
    },
    // 支付
    payment() {
      wx.reportEvent('become_member', { channel: this.channel, user: this.user }) // 支付上报
      const { openId } = this.accountInfo
      const params = {
        id: this.currentGoods.id,
        phone: this.form.phone,
        openId,
        payThrough: 30,
        channel: this.channel,
        seller: this.user,
      }
      uni.$http.post('/v1/membership-promotions/payment', params).then((res) => {
        const { wechatArg } = res.data
        uni.requestPayment({
          provider: 'wxpay',
          orderInfo: '好分数',
          ...wechatArg,
          success: () => {
            wx.reportEvent('become_member_success', { channel: this.channel, user: this.user }) // 支付成功上报
            return uni.navigateTo({
              url: '/pages/me/success',
            })
          },
          fail: (err) => {
            // eslint-disable-next-line no-console
            console.log(`fail:${JSON.stringify(err)}`)
          },
        })
      })
    },
    selectedGoods(item) {
      if (this.currentGoods.id === item.id)
        return
      this.currentGoods = item
    },
  },
  onShareAppMessage() {
    return {
      title: '成为好分数会员',
      path: `/pages/me/payment${uni.$u.queryParams({ channel: this.channel, user: this.user })}`,
      imageUrl: `${feConfig.resourceUrl}/images/paymentShare.png`,
    }
  },
}
</script>

<style lang="scss" scoped>
.payment {
  min-height: 100vh;
  background: #fff;
  .img {
    width: 100%;
  }
  .title {
    font-size: 34rpx;
    font-weight: 500;
    color: #333333;
    margin-bottom: 10rpx;
  }
  .open,
  .question {
    padding: 30rpx 40rpx;
  }
  .open {
    &-input {
      display: flex;
      align-items: center;
      margin-bottom: 10rpx;
    }
    &-info {
      &__item {
        display: flex;
        align-items: center;
        .img {
          width: 34rpx;
          height: 30rpx;
          margin-right: 10rpx;
        }
      }
    }
    &-item {
      width: 100%;
      height: 80rpx;
      border: 2rpx solid #ffba1d;
      border-radius: 12.5rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 30rpx;
      margin-bottom: 30rpx;
      &.active {
        background: linear-gradient(180deg, #ffe5aa, #fffffb);
      }
      &__text {
        font-size: 32rpx;
        color: #333333;
      }
      &__selected {
        display: flex;
        align-items: center;
        .money {
          font-size: 36rpx;
          color: #ffba1d;
          .active {
            font-size: 30rpx;
          }
        }
        .icon {
          width: 40rpx;
          height: 40rpx;
          margin-left: 20rpx;
        }
        .circle {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          border: 1rpx solid #ffba1d;
          margin-left: 20rpx;
        }
      }
    }
  }
  .question {
    &-item {
      padding: 20rpx 0;
      border-bottom: 1rpx solid #eeeeee;
      &:last-child {
        border-bottom: none;
      }
      &__title {
        font-size: 28rpx;
        color: #333333;
        margin-bottom: 10rpx;
      }
      &__desc {
        font-size: 24rpx;
        color: #666666;
      }
    }
  }
}
</style>
