<template>
  <view class="pick">
    <view class="pick-goods">
      <view class="pick-goods__header">
        <view class="select">
          <view class="select-btn" @click="clickGrade">
            <text class="active">
              {{ grade || 'TA的年级' }}
            </text><u-icon name="arrow-down-fill" size="24rpx" color="#ffffff" bold />
          </view>
          <view class="select-tips">
            <text class="active">
              *
            </text>选择年级后匹配更精准哦～
          </view>
        </view>
        <image class="rect" :src="`${resourceUrl}behalf_rect.png`" mode="widthFix" />
      </view>
      <view class="pick-goods__content" :class="{ more: selectStyle === 'more' }">
        <scroll-view class="select-scroll" :scroll-x="selectStyle === 'more'" :scroll-left="scrollLeft" scroll-with-animation @scroll="handleScroll">
          <view v-for="item in memberships" :id="`goods-${item.no}`" :key="item.no" class="select-scroll__item" :class="[selectStyle, { active: currentGoods.no === item.no }]" @click="changeGoods(item)">
            <view class="name">
              {{ item.name }}
            </view>
            <view class="price" :class="{ active: item.promotionText }">
              <view class="price-cost">
                {{ item.cost }}<text class="active">
                  元
                </text><view v-if="item.discount && currentGoods.no === item.no" class="price-cost__discount">
                  {{ item.discount }}
                </view>
              </view>
              <view v-if="item.dayPrice" class="price-day">
                <text v-if="item.line">
                  原价：
                </text><text :class="{ through: item.line }">
                  {{ item.dayPrice }}
                </text>
              </view>
            </view>
            <view v-if="item.promotionTop" class="tag">
              {{ item.promotionTop }}
            </view>
            <view v-if="item.promotionText" class="tip">
              {{ item.promotionText }}
            </view>
            <image v-if="currentGoods.no === item.no" class="icon" :src="`${memberUrl}crown.png`" />
          </view>
        </scroll-view>
      </view>
    </view>
    <view class="pick-message">
      <view class="pick-message__header">
        <image class="icon" :src="`${resourceUrl}behalf_heart.png`" mode="widthFix" />
        <view class="text">
          对TA说：
        </view>
      </view>
      <view class="pick-message__content">
        <image class="icon" :src="`${resourceUrl}behalf_edit.png`" mode="widthFix" />
        <u-textarea v-model="say" :placeholder="placeholder" height="100%" maxlength="30" border="none" confirm-type="return" :count="true" :placeholder-style="{ fontSize: '30rpx', color: '#939393' }" />
      </view>
    </view>
    <view class="pick-step">
      <image class="pick-step__img" :src="`${resourceUrl}behalf_step.png`" mode="widthFix" />
    </view>
    <view class="pick-payment">
      <view v-if="studyCoinFloat" class="pick-payment__checked" @click="studyCoinClick">
        <view class="icon">
          <view v-if="useStudyCoin" class="icon-bar" />
        </view>
        <view class="text">
          是否用学币抵扣？（您当前剩余学币{{ studyCoinFloat }}个）
        </view>
      </view>
      <Payment ref="payment" @success="paymentSuccess" @cancel="paymentCancel" @fail="paymentFail">
        <view class="pick-payment__btn" @click="paymentVIP">
          <view>
            立即支付 {{ realPrice }} 元<text v-if="useStudyCoin && goodCoin > 0" class="discount">
              已减{{ goodCoin }}元
            </text>
          </view>
        </view>
      </Payment>
    </view>
    <image class="pick-bg" :src="`${resourceUrl}behalf_gift.png`" mode="widthFix" />
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" :overlay-style="popup.overlayStyle" bg-color="transparent">
      <view v-if="popup.type === 'grade'" class="pick-grade">
        <view class="pick-grade__title">
          <view class="title">
            选择年级
          </view>
          <view class="btn" @click="confirmGrade">
            确定
          </view>
        </view>
        <view v-for="(item, index) in gradeList" :key="index" class="pick-grade__list">
          <view class="title">
            {{ item.type }}
          </view>
          <view class="list">
            <view v-for="(it, ix) in item.list" :key="ix" class="list-item" :class="{ active: popup.grade === it }" @click="selectGrade(it)">
              {{ it }}
            </view>
          </view>
        </view>
      </view>
      <view v-if="popup.type === 'problem'" class="pick-problem">
        <view class="pick-problem__title">
          支付遇到问题？
        </view>
        <view class="pick-problem__desc">
          您的反馈有助于我们更好地为您解决问题
        </view>
        <view class="pick-problem__list">
          <view v-for="(item, index) in problemList" :key="index" class="item" :class="{ active: problem.score === index + 1 }" @click="selectProblem(index + 1)">
            {{ item }}
          </view>
        </view>
        <view class="pick-problem__content">
          <image class="icon" :src="`${resourceUrl}behalf_edit.png`" mode="widthFix" />
          <u-textarea v-model="problem.content" placeholder="写下您遇到的问题或觉得不满的地方" height="100%" maxlength="30" border="none" confirm-type="return" :count="true" :placeholder-style="{ fontSize: '26rpx', color: '#939393' }" />
        </view>
        <view class="pick-problem__btn" @click="confirmProblem">
          提交
        </view>
        <view class="pick-problem__close" @click="closeProblem">
          <u-icon name="close" size="30rpx" color="#5d3a0c" bold />
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import Payment from '../components/payment.vue'
import { payThroughList } from '../member/util.js'
import { isHFSApp, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Payment },
  data() {
    return {
      memberUrl: 'https://fe-resource.haofenshu.com/member/',
      resourceUrl: 'https://fe-resource.haofenshu.com/behalf/',
      options: {},
      say: '',
      placeholder: '送你一份心意，希望你总有新进步！',
      grade: '',
      gradeList: [
        {
          type: '小学',
          list: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
        },
        {
          type: '初中',
          list: ['初一', '初二', '初三'],
        },
        {
          type: '高中',
          list: ['高一', '高二', '高三'],
        },
      ],
      paymentInfo: {},
      goodsList: {},
      currentGoods: {},
      scrollLeft: 0,
      prevDistance: 0,
      useStudyCoin: false,
      problem: {
        score: 0,
        content: '',
      },
      problemList: ['不想要了', '不知道怎么送？', '无法支付', '点错了'],
      popup: {
        show: false,
        mode: 'bottom',
        overlay: true,
        overlayStyle: {
          background: 'rgba(0, 0, 0, 0.7)',
        },
        type: '',
        grade: '',
      },
    }
  },
  computed: {
    prefix() {
      let prefix = '/v1/be-proxy'
      // #ifdef H5
      prefix = feConfig.api.hfs || ''
      // #endif
      return prefix
    },
    memberships() {
      const { memberships = [] } = this.goodsList || {}
      return memberships
    },
    selectStyle() {
      const styles = ['one', 'two', 'three', 'more']
      return styles[Math.min(this.memberships.length - 1, 3)]
    },
    payWayList() {
      return payThroughList()
    },
    payThrough() {
      const { payThrough } = this.payWayList[0] || {}
      return payThrough
    },
    studyCoinFloat() {
      return this.paymentInfo.studyCoinFloat || 0
    },
    goodCoin() {
      return Math.min(this.currentGoods.cost, this.studyCoinFloat)
    },
    realPrice() {
      const { cost } = this.currentGoods
      return this.useStudyCoin ? cost - this.goodCoin : cost
    },
  },
  async onLoad(options) {
    this.options = options
    await this.getPaymentInfo()
    await this.getGoodsList()
  },
  methods: {
    // 获取支付信息
    async getPaymentInfo() {
      const res = await uni.$http.get(`${this.prefix}/v2/user-center/payment-info`)
      this.paymentInfo = res.data || {}
    },
    // 获取商品列表
    async getGoodsList() {
      const res = await uni.$http.get(`${this.prefix}/v2/payments/goods-list-gift?grade=${this.grade}`)
      this.goodsList = res.data || {}
      const goods = this.memberships[this.memberships.length >= 2 ? 1 : 0] || {}
      this.changeGoods(goods)
    },
    changeGoods(item) {
      if (this.currentGoods.no === item.no)
        return
      this.couponList = []
      this.currentCoupon = {}
      this.currentGoods = item
      this.setScrollLeft(item.no)
    },
    handleScroll(e) {
      const distance = e.detail.scrollLeft
      this.prevDistance = distance
    },
    setScrollLeft(no) {
      const query = uni.createSelectorQuery().in(this)
      query.select(`#goods-${no}`).boundingClientRect((rect) => {
        if (!rect)
          return
        const subHalfWidth = rect.width / 2
        const needScroll = rect.left - this.screenHalfWidth + subHalfWidth
        this.scrollLeft = needScroll + this.prevDistance
      }).exec()
    },
    clickGrade() {
      this.showPopup('grade', { grade: this.grade })
    },
    selectGrade(grade) {
      this.popup.grade = grade
    },
    confirmGrade() {
      this.grade = this.popup.grade
      this.getGoodsList()
      this.closePopup()
    },
    selectProblem(index) {
      this.problem.score = index
    },
    closeProblem() {
      this.closePopup()
      // #ifdef H5
      if (isHFSApp() && !this.options.back) {
        return nativeBridge.callHandler('goBack', 'goBack')
      }
      // #endif
      return uni.navigateBack()
    },
    async confirmProblem() {
      const { score, content } = this.problem
      if (!score && !content)
        return uni.$u.toast('请选择问题类型，或者填写问题')
      const params = { type: 2, content, score }
      await uni.$http.post(`${this.prefix}/v2/users/advice`, params)
      uni.$u.toast('提交成功')
      await uni.$u.sleep(1000)
      this.closeProblem()
    },
    studyCoinClick() {
      this.useStudyCoin = !this.useStudyCoin
    },
    paymentVIP() {
      report('behalf', 'sgt_fk_click')
      const params = {
        goodNo: this.currentGoods.no,
        goodType: 1,
        payThrough: this.payThrough,
        studyCoinCount: 0,
        useStudyCoin: this.useStudyCoin ? 1 : 3,
        say: this.say || this.placeholder,
        grade: this.grade,
      }
      this.$refs.payment.paymentVIP(params, '/v2/payments/give-gift')
    },
    paymentSuccess(paymentId) {
      return uni.navigateTo({ url: `/uni_modules/hfs-fe-uni-module/memberPages/behalf/receive?id=${paymentId}` })
    },
    paymentCancel() {
      this.showPopup('problem', { mode: 'center' })
    },
    paymentFail(err) {
      return uni.$u.toast(err.errMsg || err)
    },
    showPopup(type, params = {}) {
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    closePopup() {
      this.popup.show = false
    },
  },
}
</script>

<style lang="scss" scoped>
.pick {
  position: relative;
  min-height: 100vh;
  padding: 128rpx 28rpx 200rpx;
  background: linear-gradient(181deg, #fae48e 0%, #ffeebd 64%, #fff8e3 87%);
  &-goods {
    position: relative;
    width: 100%;
    background: #ffffff;
    border-radius: 0 0 24rpx 24rpx;
    margin-bottom: 32rpx;
    z-index: 1;
    &__header {
      position: absolute;
      top: -90rpx;
      left: 0;
      width: 100%;
      height: 112rpx;
      .select {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        padding: 16rpx 0 0 34rpx;
        z-index: 1;
        &-btn {
          width: 188rpx;
          height: 52rpx;
          color: #ffffff;
          font-size: 28rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 20rpx;
          background: #ff9b34;
          border-radius: 34rpx;
          .active {
            margin-right: 5rpx;
            white-space: nowrap;
          }
        }
        &-tips {
          color: #666666;
          font-size: 24rpx;
          margin-left: 18rpx;
          .active {
            color: #ff0000;
            margin-right: 5rpx;
          }
        }
      }
      .rect {
        width: 100%;
        height: 100%;
      }
    }
    &__content {
      padding: 0 16rpx 32rpx;
      &.more {
        padding: 0;
      }
      .select-scroll {
        width: 100%;
        white-space: nowrap;
        &__item {
          position: relative;
          display: inline-flex;
          align-items: center;
          flex-direction: column;
          height: 216rpx;
          padding-top: 36rpx;
          margin-top: 56rpx;
          background: #fefdf8;
          border: 2rpx solid #ffeccb;
          border-radius: 18rpx;
          transition: width 0.1s;
          .name {
            color: #333333;
            font-size: 24rpx;
            font-weight: bold;
          }
          .price {
            z-index: 1;
            &-cost {
              color: #ff381b;
              font-size: 52rpx;
              font-weight: Bold;
              position: relative;
              .active {
                font-size: 22rpx;
                color: #5d3a0c;
                margin-left: 2rpx;
              }
              &__discount {
                position: absolute;
                top: 0;
                right: 0;
                transform: translateX(90%);
                background: rgba(255, 0, 0, 0.1);
                border-radius: 6rpx;
                padding: 2rpx 8rpx;
                font-size: 16rpx;
                color: #ff0000;
              }
            }
            &-day {
              color: #939393;
              font-size: 20rpx;
              text-align: center;
              .through {
                text-decoration: line-through;
              }
            }
          }
          .tag {
            position: absolute;
            top: -16rpx;
            left: -2rpx;
            height: 40rpx;
            font-size: 22rpx;
            color: #ffffff;
            font-weight: 500;
            display: flex;
            align-items: center;
            background: linear-gradient(225deg, #ff450e, #ff880c);
            border-radius: 34rpx 2rpx 34rpx 2rpx;
            padding: 0 24rpx;
            z-index: 1;
          }
          .tip {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 36rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #915d00;
            font-size: 16rpx;
            background: #ffeccb;
            border-radius: 0 0 18rpx 18rpx;
            z-index: 1;
          }
          .icon {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 98rpx;
            height: 92rpx;
          }
          &.one {
            width: 100%;
            height: 156rpx;
            flex-direction: row;
            padding: 0 0 0 62rpx;
            margin-top: 56rpx;
            &.active {
              background: linear-gradient(168deg, #ffecb5, #fff6de 100%);
            }
            .name {
              font-size: 32rpx;
              margin-right: 84rpx;
            }
            .price {
              display: flex;
              align-items: baseline;
              &.active {
                margin-top: -30rpx;
              }
              &-cost {
                .active {
                  color: #ff381b;
                }
              }
              &-day {
                color: #f59a00 !important;
                padding: 2rpx 6rpx;
                background: rgba(255, 138, 27, 0.1);
                border-radius: 8rpx;
                margin-left: 12rpx;
              }
            }
            .tip {
              left: 274rpx;
              bottom: 30rpx;
              color: #70450f !important;
              font-size: 24rpx;
              width: auto;
              height: auto;
              background: none !important;
            }
            .icon {
              width: 148rpx;
              height: 122rpx;
            }
          }
          &.two {
            width: 274rpx;
            margin-right: 24rpx;
            &.active {
              width: 364rpx;
            }
          }
          &.three {
            width: 188rpx;
            margin-right: 20rpx;
            &.active {
              width: 246rpx;
            }
          }
          &.more {
            width: 188rpx;
            margin-right: 20rpx;
            &.active {
              width: 230rpx;
            }
            &:first-child {
              margin-left: 16rpx;
            }
            &:last-child {
              margin-right: 16rpx;
            }
          }
          &.active {
            background: linear-gradient(163deg, #ffecb5, #fff6de 81%);
            border: 2rpx solid #ffc55f;
            .name {
              color: #70450f;
            }
            .price {
              &-day {
                color: #70450f;
              }
            }
            .tip {
              color: #976000;
              background: linear-gradient(225deg, #ffd766, #ffc55f);
            }
          }
          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
  }
  &-message {
    background: linear-gradient(164deg, #ffe0a6, #ffffff 26%);
    border: 2rpx solid #ffffff;
    border-radius: 24rpx;
    padding: 30rpx 22rpx 38rpx;
    margin-bottom: 138rpx;
    &__header {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;
      .icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 13rpx;
      }
      .text {
        color: #333333;
        font-size: 32rpx;
        font-weight: bold;
      }
    }
    &__content {
      position: relative;
      height: 204rpx;
      background: #fffcf5;
      border: 2rpx solid #ffe6ba;
      border-radius: 20rpx;
      overflow: hidden;
      .icon {
        position: absolute;
        top: 26rpx;
        left: 22rpx;
        width: 32rpx;
        height: 30rpx;
        z-index: 1;
      }
      ::v-deep .u-textarea {
        padding: 24rpx 22rpx 24rpx 68rpx;
        height: 100%;
        &__field {
          color: #333333;
          font-size: 30rpx;
        }
      }
    }
  }
  &-step {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 29rpx;
    &__img {
      width: 100%;
      height: 124rpx;
    }
  }
  &-payment {
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 999;
    padding: 24rpx 28rpx;
    padding: 24rpx 28rpx calc(env(safe-area-inset-bottom) + 24rpx);
    background: #ffffff;
    border-radius: 24rpx 24rpx 0 0;
    box-shadow: 0rpx -4rpx 12rpx 0rpx rgba(0, 0, 0, 0.04);
    &__checked {
      width: 100%;
      display: flex;
      align-items: center;
      margin-bottom: 28rpx;
      .icon {
        width: 28rpx;
        height: 28rpx;
        border-radius: 50%;
        border: 2rpx solid #939393;
        position: relative;
        &-bar {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 14rpx;
          height: 14rpx;
          background: #939393;
          border-radius: 50%;
        }
      }
      .text {
        font-size: 24rpx;
        color: #939393;
        margin-left: 12rpx;
      }
    }
    &__btn {
      width: 100%;
      height: 84rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 32rpx;
      font-weight: bold;
      background: linear-gradient(225deg, #ffa430 0%, #ff7426);
      border-radius: 42rpx;
      .discount {
        color: #ffffff;
        font-size: 24rpx;
        font-weight: normal;
        margin-left: 10rpx;
      }
    }
  }
  &-bg {
    position: absolute;
    top: -34rpx;
    right: 0;
    width: 158rpx;
    height: 174rpx;
  }
  &-grade {
    width: 100%;
    background: #ffffff;
    padding: 32rpx 38rpx 60rpx;
    border-radius: 24rpx 24rpx 0 0;
    &__title {
      display: flex;
      align-items: center;
      margin-bottom: 26rpx;
      .title {
        flex: 1;
        color: #333333;
        font-size: 36rpx;
        font-weight: bold;
        text-align: center;
        padding-left: calc(32 / 36 * 2em);
      }
      .btn {
        color: #ffb100;
        font-size: 32rpx;
        font-weight: bold;
      }
    }
    &__list {
      padding-bottom: 8rpx;
      .title {
        position: relative;
        color: #333333;
        font-size: 32rpx;
        font-weight: bold;
        padding-left: 21rpx;
        margin-bottom: 20rpx;
        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          width: 8rpx;
          height: 36rpx;
          background: #ffb100;
          border-radius: 6rpx;
        }
      }
      .list {
        display: flex;
        flex-wrap: wrap;
        &-item {
          width: calc((100% - 48rpx) / 3);
          height: 64rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333333;
          font-size: 28rpx;
          background: #f6f6f6;
          border-radius: 34rpx;
          margin: 0 24rpx 24rpx 0;
          &.active {
            color: #ff8000;
            font-weight: bold;
            background: rgba(255, 128, 0, 0.1);
            border: 2rpx solid #ffd7ae;
          }
          &:nth-child(3n) {
            margin-right: 0;
          }
        }
      }
    }
  }
  &-problem {
    position: relative;
    width: 612rpx;
    padding: 50rpx 54rpx 42rpx;
    background: linear-gradient(180deg, #fffdc4, #ffffff 18%);
    border-radius: 76rpx;
    &__title {
      color: #5d3a0c;
      font-size: 36rpx;
      font-weight: bold;
      text-align: center;
      margin-bottom: 28rpx;
    }
    &__desc {
      color: #996f38;
      font-size: 28rpx;
      margin-bottom: 28rpx;
      text-align: center;
    }
    &__list {
      display: flex;
      flex-wrap: wrap;
      padding-bottom: 4rpx;
      .item {
        width: calc((100% - 16rpx) / 2);
        height: 86rpx;
        color: #333333;
        font-size: 28rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 16rpx 16rpx 0;
        background: #f6f6f6;
        border-radius: 16rpx;
        &.active {
          background: #fffaee;
          border: 2rpx solid #ffb100;
        }
        &:nth-child(2n) {
          margin-right: 0;
        }
      }
    }
    &__content {
      position: relative;
      height: 198rpx;
      background: #ffffff;
      border: 2rpx solid #e6e6e6;
      border-radius: 16rpx;
      margin-bottom: 26rpx;
      overflow: hidden;
      .icon {
        position: absolute;
        top: 20rpx;
        left: 20rpx;
        width: 32rpx;
        height: 30rpx;
        z-index: 1;
        filter: grayscale(100%);
      }
      ::v-deep .u-textarea {
        padding: 18rpx 20rpx 24rpx 64rpx;
        height: 100%;
        &__field {
          color: #333333;
          font-size: 26rpx;
        }
      }
    }
    &__btn {
      width: 306rpx;
      height: 72rpx;
      color: #ffffff;
      font-size: 32rpx;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(225deg, #ffa430 0%, #ff7426);
      border-radius: 42rpx;
      margin: 0 auto;
    }
    &__close {
      position: absolute;
      top: 45rpx;
      right: 50rpx;
    }
  }
}
</style>
