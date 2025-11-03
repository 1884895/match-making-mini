<template>
  <view class="paper-download">
    <view class="paper-download__content">
      <image class="icon" :src="`${resourceUrl}docx.png`" />
      <text class="text">
        {{ options.name || '' }}
      </text>
    </view>
    <template v-if="buyed || (!buyed && cost)">
      <u-button :text="btnText" :custom-style="{ borderRadius: '40rpx', height: '80rpx', color: '#ffffff', fontSize: '30rpx', background: 'linear-gradient(0deg, #FF4D2B, #FF5900)' }" :throttle-time="500" @click="handleClick" />
      <view class="paper-download__tips">
        注：若内容不全，请使用电脑版WPS或金山文档打开试卷
      </view>
    </template>
  </view>
</template>

<script>
export default {
  data() {
    return {
      resourceUrl: `${feConfig.resourceUrl}/images/`,
      options: {},
      buyedList: [],
    }
  },
  computed: {
    buyed() {
      return +this.options.buyed
    },
    cost() {
      return +this.options.cost
    },
    btnText() {
      return `${this.buyed ? '' : `${this.cost}学币`}下载`
    },
  },
  onLoad(options) {
    this.options = options
    this.buyedList = getApp().globalData.buyedList || []
    this.buyedList.includes(this.options.id) && (this.options.buyed = 1)
    uni.setNavigationBarTitle({ title: this.options.name || '下载' })
  },
  methods: {
    handleClick() {
      wx.reportEvent('paper_download')
      if (this.buyed) {
        return this.downloadFile()
      }
      if (this.cost) {
        return this.payment()
      }
    },
    downloadFile() {
      uni.showLoading({ title: '下载中', mask: true })
      const { id, name } = this.options
      return uni.downloadFile({
        url: `${feConfig.api.hfs}/tiku_api_proxy/v1/exampapers/download?paper_id=${id}`,
        header: {
          'deviceType': 7,
          'hfs-token': wx.getStorageSync('cookie').split(';')[0].split('=')[1],
        },
        filePath: `${uni.env.USER_DATA_PATH}/${name}.docx`,
        success: (res) => {
          return uni.openDocument({
            filePath: res.filePath,
            showMenu: true,
          })
        },
        fail: (err) => {
          return uni.showToast({ title: err.errMsg || '下载失败', icon: 'none' })
        },
        complete: () => {
          return uni.hideLoading()
        },
      })
    },
    // 支付
    async payment() {
      const { openId } = getApp().globalData.accountInfo || {}
      const paymentParams = await this.getPaymentParams(openId)
      return uni.requestPayment({
        provider: 'wxpay',
        orderInfo: '好分数',
        ...paymentParams.wechatOfficialArg,
        success: () => {
          return this.paymentSuccess()
        },
        fail: (err) => {
          // eslint-disable-next-line no-console
          console.log(`fail:${JSON.stringify(err)}`)
        },
      })
    },
    // 获取支付参数
    async getPaymentParams(openId) {
      const { no: goodNo, type: goodType, id } = this.options
      const params = {
        couponId: '',
        goodNo,
        goodType,
        payThrough: 30,
        studyCoinCount: 0,
        useStudyCoin: 3,
        note: {
          paper_id: id,
        },
        openId,
      }
      const res = await uni.$http.post('/v1/be-proxy/v2/payments', params)
      return res.data || {}
    },
    paymentSuccess() {
      wx.reportEvent('paper_download_success')
      this.options.buyed = 1
      !this.buyedList.includes(this.options.id) && getApp().globalData.buyedList.push(this.options.id)
      this.downloadFile()
    },
  },
}
</script>

<style lang="scss" scoped>
.paper-download {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 58rpx 0;
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 80rpx;
    .icon {
      width: 128rpx;
      height: 128rpx;
      margin-bottom: 40rpx;
    }
    .text {
      font-size: 32rpx;
      color: #333333;
      text-align: center;
    }
  }
  &__tips {
    font-size: 24rpx;
    color: #999999;
    text-align: center;
    margin-top: 40rpx;
  }
}
</style>
