<template>
  <view class="footer">
    <view class="footer-rules">
      <view class="footer-rules-wapper" @click="handleSelect">
        <image class="image" :src="resourceUrl + radioIcon[radioSelect]" />
      </view>
      <view class="text" @click="handleSelect">
        我已阅读并同意
      </view>
      <view class="text" @click="handleJump('rules')">
        《用户信息授权协议》
      </view>
    </view>
    <view class="footer-bottom">
      <view class="member" @click="btnClick">
        <text class="member-text">
          {{ signUpStatus ? courseMessage.finallyStatus : courseMessage.btnText }}
        </text>
      </view>
    </view>
    <u-modal
      :show="modal.show"
      :content="modal.content"
      show-cancel-button
      :confirm-text="modal.confirmText"
      :cancel-text="modal.cancelText"
      :confirm-color="modal.confirmColor"
      :cancel-color="modal.cancelColor"
      @confirm="checkPaymentStatus"
      @cancel="checkPaymentStatus"
    />
    <!-- 9元课程信息收集弹出框 -->
    <u-popup :show="popup.show" :round="popup.round" :mode="popup.mode" @close="closePopup" @open="openPopup">
      <view v-if="course9" class="message">
        <view class="message-title">
          填写报名信息
        </view>
        <view class="message-grade">
          <view class="message-sub__title">
            年级
          </view>
          <view class="message-grade__list">
            <view v-for="item in gradeList" :key="item" class="item" :class="{ active: item === form.grade }" @click="form.grade = item">
              {{ item }}<span class="tag">精选</span>
            </view>
          </view>
        </view>
        <view class="message-phone">
          <view class="message-sub__title">
            联系电话<image class="icon" :src="`${resourceUrl}required.png`" />
          </view>
          <u-input v-model="form.phone" class="message-phone__input" :custom-style="{ background: '#f4f4f4', borderRadius: '6rpx', padding: '16rpx 22rpx', marginTop: '18rpx' }" border="none" placeholder="请输入联系电话" clearable />
        </view>
        <view class="message-gift">
          <view class="message-sub__title message-gift-title">
            课程附赠<image class="icon" :src="`${resourceUrl}handleDown.png`" />
          </view>
          <image class="message-gift__img" :src="`${resourceUrl}9courseGift.png`" mode="widthFix" />
        </view>
        <view class="message-btns">
          <view class="message-btns__btn" @click="handlePay">
            确定报名
          </view>
        </view>
      </view>
      <!-- 298/318课程 -->
      <view v-if="course318" class="message post">
        <view class="message-title post-title">
          填写信息
        </view>
        <view class="box">
          <view class="post-flex-center">
            <view class="message-sub__title">
              姓名<image class="icon" :src="`${resourceUrl}required.png`" />
            </view>
            <u-input v-model="form.name" color="#939393" :custom-style="{ background: '#f4f4f4', borderRadius: '6rpx', padding: '8rpx 22rpx' }" border="none" placeholder="请输入姓名" clearable />
          </view>
          <view class="post-item post-flex-center">
            <view class="message-sub__title">
              电话<image class="icon" :src="`${resourceUrl}required.png`" />
            </view>
            <u-input v-model="form.phone" color="#939393" :custom-style="{ background: '#f4f4f4', borderRadius: '6rpx', padding: '8rpx 22rpx' }" border="none" placeholder="请输入电话" clearable />
          </view>
          <view class="post-item post-flex-start">
            <view class="message-sub__title post-sub__title">
              地址<image class="icon" :src="`${resourceUrl}required.png`" />
            </view>
            <textarea v-model="form.address" class="message-phone__textarea" placeholder-style="color: #c0c4cc" border="none" placeholder="请输入地址" />
          </view>
          <image v-if="form.paperImageUrl" class="post-img post-item" :src="resourceUrl + form.paperImageUrl" mode="widthFix" />
          <view class="message-grade post-item">
            <view class="message-sub__title">
              规格<image class="icon" :src="`${resourceUrl}required.png`" />
            </view>
            <view class="message-grade__list">
              <view v-for="(item, index) in paperList" :key="index" class="item" :class="{ active: item.name === form.paperType }" @click="paperSelect(item)">
                {{ item.name }}
              </view>
            </view>
          </view>
        </view>
        <view class="message-btns">
          <view class="message-btns__btn" @click="handlePay">
            确定购买
          </view>
        </view>
      </view>
      <!-- AI志愿填报卡 -->
      <view v-if="AIGuide" class="message post guide">
        <view class="message-title post-title">
          填写信息
        </view>
        <view class="box">
          <view class="post-flex-center">
            <view class="message-sub__title">
              姓名<image class="icon" :src="`${resourceUrl}required.png`" />
            </view>
            <u-input v-model="form.name" color="#939393" :custom-style="{ background: '#f4f4f4', borderRadius: '6rpx', padding: '8rpx 22rpx' }" border="none" placeholder="请输入姓名" clearable />
          </view>
          <view class="post-item post-flex-center">
            <view class="message-sub__title">
              电话<image class="icon" :src="`${resourceUrl}required.png`" />
            </view>
            <u-input v-model="form.phone" color="#939393" :custom-style="{ background: '#f4f4f4', borderRadius: '6rpx', padding: '8rpx 22rpx' }" border="none" placeholder="请输入电话" clearable />
          </view>
          <view class="post-item post-flex-center">
            <view class="message-sub__title">
              省份<image class="icon" :src="`${resourceUrl}required.png`" />
            </view>
            <u-input v-model="form.province" color="#939393" :custom-style="{ background: '#f4f4f4', borderRadius: '6rpx', padding: '8rpx 22rpx' }" border="none" placeholder="请输入省份" clearable />
          </view>
          <view class="post-item post-flex-center">
            <view class="message-sub__title">
              科目<image class="icon" :src="`${resourceUrl}required.png`" />
            </view>
            <view class="message-subject__list post-flex-center">
              <view v-for="(item, index) in ['理科', '文科']" :key="index" class="item" :class="{ active: item === form.subject }" @click="form.subject = item">
                {{ item }}
              </view>
            </view>
          </view>
        </view>
        <view class="message-btns">
          <view class="message-btns__btn" @click="handlePay">
            确定购买
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
export default {
  props: {
    signUpStatus: {
      type: Boolean,
      default: false,
    },
    accountInfo: {
      type: Object,
      default: () => {},
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
    isLogin: {
      type: Boolean,
      default: false,
    },
    prefix: {
      type: String,
      default: '',
    },
    goodNo: {
      type: String,
      default: '',
    },
    courseMessage: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['update:signUpStatus'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/operations/course/',
      modal: {
        show: false,
        content: '请确认微信支付是否已完成',
        confirmText: '已完成支付',
        cancelText: '未完成支付',
        confirmColor: '#FFBA1D',
        cancelColor: '#939393',
      },
      popup: {
        show: false,
        mode: 'center',
        round: 30,
      },
      radioSelect: false,
      radioIcon: {
        true: 'checkbox-select.png',
        false: 'checkbox-noselect.png',
      },
      paymentOptions: {},
      gradeList: ['高一', '高二', '高三'],
      form: {
        grade: '高一',
        phone: '',
        name: '',
        address: '',
        paperType: '',
        paperImageUrl: '',
        province: '',
        subject: '理科',
      },
      provinceList: [],
      paperList: [
        { name: '安徽', imageUrl: 'anhui.jpg' },
        { name: '河北', imageUrl: 'heibei.jpg' },
        { name: '黑龙江', imageUrl: 'heilongjiang.jpg' },
        { name: '湖南', imageUrl: 'hunan.jpg' },
        { name: '吉林', imageUrl: 'jilin.jpg' },
        { name: '江苏', imageUrl: 'jiangsu.jpg' },
        { name: '江西', imageUrl: 'jiangxi.jpg' },
        { name: '辽宁', imageUrl: 'liaoning.jpg' },
        { name: '全国理', imageUrl: 'quanguoli.jpg' },
        { name: '全国文', imageUrl: 'quanguowen.jpg' },
        { name: '山东', imageUrl: 'shandong.jpg' },
        { name: '通用版', imageUrl: 'tongyong.jpg' },
        { name: '新高考', imageUrl: 'xingaokao.jpg' },
        { name: '新教材理', imageUrl: 'xinjiaocaili.jpg' },
        { name: '新教材文', imageUrl: 'xinjiaocaiwen.jpg' },
      ],
    }
  },
  computed: {
    payThrough() {
      let payThrough = 30
      // #ifdef H5
      payThrough = 31
      // #endif
      return payThrough
    },
    course9() {
      return this.courseMessage.type === 0
    },
    course318() {
      return this.courseMessage.type === 1
    },
    AIGuide() {
      return this.courseMessage.type === 2
    },
  },
  methods: {
    open() {
      this.modal.show = true
    },
    close() {
      this.modal.show = false
    },
    openPopup() {
      this.popup.show = true
    },
    closePopup() {
      this.popup.show = false
    },
    handleSelect() {
      this.radioSelect = !this.radioSelect
    },
    paperSelect(item) {
      this.form.paperType = item.name
      this.form.paperImageUrl = item.imageUrl
    },
    // 立即报名
    btnClick() {
      if (!this.radioSelect) {
        return uni.$u.toast('请阅读并同意《用户信息授权协议》')
      }
      if ((this.course9 && !this.isLogin) || this.course318 || this.AIGuide) {
        return this.openPopup()
      }
      this.handlePay()
    },
    // 9元课报名
    async handlePay() {
      if (this.course9 && !this.isLogin) {
        if (!this.form.phone)
          return uni.$u.toast('请输入联系电话')
        if (!uni.$u.test.mobile(this.form.phone))
          return uni.$u.toast('联系电话格式不正确')
      }
      if (this.course318) {
        if (!this.form.name)
          return uni.$u.toast('请输入姓名')
        if (!this.form.phone)
          return uni.$u.toast('请输入电话')
        if (!uni.$u.test.mobile(this.form.phone))
          return uni.$u.toast('电话格式不正确')
        if (!this.form.address)
          return uni.$u.toast('请输入地址')
        if (!this.form.paperType)
          return uni.$u.toast('请选择规格')
      }
      if (this.AIGuide) {
        if (!this.form.name)
          return uni.$u.toast('请输入姓名')
        if (!this.form.phone)
          return uni.$u.toast('请输入电话')
        if (!uni.$u.test.mobile(this.form.phone))
          return uni.$u.toast('电话格式不正确')
        if (!this.form.province)
          return uni.$u.toast('请输入省份')
        if (!this.form.subject)
          return uni.$u.toast('请选择科目')
      }
      const res = await uni.$http.get(`${this.prefix}/v2/payments/operation-good-list?goodNo=${this.goodNo}`)
      const { data = [] } = res
      const { no = '', type = '' } = data[0] || []
      const params = this.combinationParams(no, type)
      this.operationPayments(params)
    },
    combinationParams(goodNo, goodType) {
      const params = {
        goodNo,
        goodType,
        payThrough: this.payThrough,
        note: {},
      }
      const { name, phone, address, paperType, province, subject } = this.form
      const noteMap = {
        23002: {
          grade: this.isLogin ? (this.userInfo.linkedStudent && this.userInfo.linkedStudent.grade) : this.form.grade,
          phone: this.isLogin ? this.userInfo.phoneNumber : this.form.phone,
        },
        23003: { name, phone, address, paperType },
        23004: { name, phone, address, paperType },
        23005: { name, phone, province, subject },
      }
      // #ifdef MP-WEIXIN
      params.openId = this.accountInfo.openId
      // #endif
      params.note = noteMap[goodNo] || {}
      return params
    },
    // 9元课程发起支付
    async operationPayments(params) {
      const res = await uni.$http.post(`${this.prefix}/v2/payments/operation`, params)
      const { call3rdPartyArg, transactionRecordId } = res.data
      // #ifdef MP-WEIXIN
      this.miniPayment(call3rdPartyArg)
      // #endif
      // #ifdef H5
      this.h5Payment(call3rdPartyArg, transactionRecordId)
      // #endif
    },
    // 小程序发起支付
    miniPayment(call3rdPartyArg) {
      return uni.requestPayment({
        provider: 'wxpay',
        orderInfo: '好分数',
        ...call3rdPartyArg,
        success: () => {
          uni.redirectTo({ url: '/uni_modules/hfs-fe-uni-module/pages/course/result' })
        },
        fail: (err) => {
          return uni.$u.toast(err.errMsg)
        },
      })
    },
    // H5发起支付
    h5Payment(call3rdPartyArg, transactionRecordId) {
      const url = call3rdPartyArg.h5_url || ''
      const { domain, params } = this.urlParser(window.location.href)
      const redirectUrl = encodeURIComponent(`${domain}${uni.$u.queryParams(Object.assign({}, params, { paymentId: transactionRecordId }))}`)
      window.location.replace(`${url}&redirect_url=${redirectUrl}`)
    },
    // 检测支付状态
    checkPaymentStatus() {
      this.close()
      const { paymentId = '' } = this.paymentOptions
      paymentId && this.getOrderStatus(paymentId)
    },
    // 获取订单状态
    async getOrderStatus(paymentId) {
      const res = await uni.$http.get(`${this.prefix}/v2/payments/${paymentId}/third-party-pay-status`)
      const { status } = res.data
      if (status === 3) {
        this.handleJump('result')
        this.$emit('update:signUpStatus', true)
      }
    },
    handleJump(type) {
      const jumpMap = {
        rules: '/uni_modules/hfs-fe-uni-module/pages/course/rules',
        result: `/uni_modules/hfs-fe-uni-module/pages/course/result?goodNo=${this.goodNo}`,
      }
      uni.navigateTo({ url: jumpMap[type] })
    },
    urlParser(url) {
      const obj = {}
      const res = url.split('?')
      res[1] && res[1].split('&').forEach((v) => {
        const [key, value] = v.split('=')
        obj[key] = value
      })
      return {
        domain: res[0],
        query: res[1],
        params: obj,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.footer {
  background: #f6f6f6;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 1;
  &-rules {
    display: flex;
    align-items: center;
    padding: 20rpx 24rpx 20rpx 16rpx;
    &-wapper {
      padding: 0 8rpx;
    }
    .image {
      width: 28rpx;
      height: 28rpx;
    }
    .text {
      font-size: 24rpx;
      color: #ff5323;
    }
  }
  &-bottom {
    width: 100%;
    padding: 20rpx 28rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #ffffff;
    border-radius: 10rpx 10rpx 0 0;
    box-shadow: 0 -2rpx 8rpx 0 rgba(0, 0, 0, 0.07);
    .customer {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      &-icon {
        width: 36rpx;
        height: 34rpx;
        margin-bottom: 8rpx;
      }
      &-text {
        font-size: 22rpx;
        color: #939393;
      }
    }
    .line {
      width: 4rpx;
      height: 68rpx;
      margin: 0 30rpx;
    }
    .member {
      position: relative;
      height: 88rpx;
      background: linear-gradient(80deg, #ff5123 0%, #ff7715 100%);
      border-radius: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      &-text {
        font-size: 36rpx;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }
  ::v-deep .u-modal__content {
    text-align: center;
  }
  .message {
    width: 85vw;
    padding: 74rpx 64rpx 40rpx 64rpx;
    &-title {
      font-size: 36rpx;
      font-weight: 500;
      text-align: center;
    }
    &-sub {
      &__title {
        display: flex;
        font-size: 32rpx;
        line-height: 1.3;
        .icon {
          width: 10rpx;
          height: 10rpx;
        }
      }
    }
    &-grade {
      margin-top: 32rpx;
      &__list {
        margin-top: 26rpx;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        .item {
          position: relative;
          padding: 6rpx 40rpx 10rpx 40rpx;
          font-size: 28rpx;
          background: #f5f5f5;
          border-radius: 28rpx;
          .tag {
            position: absolute;
            right: -34rpx;
            top: -16rpx;
            background: #ffe9e9;
            color: #ff7272;
            font-size: 22rpx;
            font-weight: 500;
            padding: 4rpx 12rpx 4rpx 14rpx;
            border-top-left-radius: 20rpx;
            border-top-right-radius: 20rpx;
            border-bottom-right-radius: 20rpx;
            border-bottom-left-radius: 6rpx;
          }
        }
        .active {
          background: #ff3838;
          color: #ffffff;
        }
      }
    }
    &-phone {
      margin-top: 74rpx;
      &__textarea {
        color: #939393;
        background: #f4f4f4;
        border-radius: 6rpx;
        padding: 8rpx 22rpx;
        flex: 1;
      }
    }
    &-gift {
      margin-top: 88rpx;
      &-title {
        align-items: center;
        .icon {
          width: 32rpx;
          height: 32rpx;
          margin-right: 6rpx;
        }
      }
      &__img {
        width: 100%;
      }
    }
    &-btns {
      margin-top: 36rpx;
      text-align: center;
      &__btn {
        display: inline-block;
        padding: 16rpx 96rpx;
        color: #ffffff;
        font-size: 32rpx;
        font-weight: 500;
        background: linear-gradient(76deg, #ff5123 0%, #ff7715 100%);
        border-radius: 36rpx;
        cursor: pointer;
      }
    }
    &-subject {
      &__list {
        .item {
          margin: 0 10rpx;
          padding: 6rpx 30rpx;
          color: #939393;
          font-size: 28rpx;
          background: #f5f5f5;
          border-radius: 28rpx;
          &.active {
            background: #ff3838;
            color: #ffffff;
          }
        }
      }
    }
  }
  .post {
    padding: 38rpx 46rpx 34rpx 46rpx;
    &-flex {
      &-center {
        display: flex;
        align-items: center;
      }
      &-start {
        display: flex;
        align-items: flex-start;
      }
    }
    &-title {
      margin-bottom: 20rpx;
    }
    &-item {
      margin-top: 20rpx;
    }
    &-img {
      width: 200rpx;
      height: 200rpx;
      border-radius: 6rpx;
    }
    &-sub__title {
      line-height: 50rpx;
    }
    .message-sub__title {
      margin-right: 20rpx;
    }
    .message-grade__list {
      justify-content: flex-start;
      margin-top: 20rpx;
      .item {
        margin: 0 20rpx 20rpx 0;
        padding: 8rpx 40rpx;
        color: #333;
      }
      .active {
        color: #ffffff;
      }
    }
    .box {
      max-height: 70vh;
      overflow-y: auto;
    }
  }
  .guide {
    .post-title {
      margin-bottom: 40rpx;
    }
    .post-item {
      margin-top: 40rpx;
    }
    .message-btns {
      margin-top: 80rpx;
    }
  }
}
</style>
