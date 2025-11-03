<template>
  <view v-if="!hiddenPay" class="interactive">
    <view class="interactive-info">
      <view class="interactive-info__user">
        <image class="avatar" :src="avatar" />
        <view class="text">
          <view class="text-name">
            <text>HI～{{ studentInfo.studentName }}同学</text>
            <image v-if="isVip" class="text-name__vip" :src="`${resourceUrl}vip.png`" />
          </view>
          <view class="text-tips">
            <text v-if="isVip">{{ formatTime(paymentInfo.lastMemberEnd, 'YYYY-MM-DD') }} 到期</text>
            <text v-else>开通VIP 尊享<text class="active">32项</text>会员权益</text>
          </view>
        </view>
      </view>
      <view class="interactive-info__select" :class="{ more: selectStyle === 'more' }">
        <scroll-view class="select-scroll" :scroll-x="selectStyle === 'more'" :scroll-left="scrollLeft" scroll-with-animation @scroll="handleScroll">
          <view v-for="(item, index) in memberships" :id="`goods-${item.no}`" :key="index" class="select-scroll__item" :class="[selectStyle, { active: currentGoods.no === item.no }]" @click="changeGoods(item)">
            <view class="name">
              {{ item.name }}
            </view>
            <view class="price" :class="{ active: !isReview && item.promotionText }">
              <view class="price-cost">
                <template v-if="isReview">{{ item.iapCost }}</template>
                <template v-else>
                  <u-count-to v-if="minusPopup && item.minus" ref="countTo" :start-val="item.original" :end-val="item.cost" :autoplay="false" :use-easing="true" :duration="1000" color="#ff381b" font-size="56rpx" :bold="true" @end="countToEnd" />
                  <template v-else>{{ item.cost }}</template>
                </template>
                <text class="active">元</text>
              </view>
              <view v-if="!isReview && item.dayPrice" class="price-day">
                <text v-if="item.line">原价：</text><text :class="{ through: item.line }">{{ item.dayPrice }}</text>
              </view>
            </view>
            <view v-if="!isReview && item.promotionTop" class="tag">
              {{ item.promotionTop }}
            </view>
            <view v-if="!isReview && item.promotionText" class="tip">
              {{ item.promotionText }}
            </view>
            <image v-if="currentGoods.no === item.no" class="icon" :src="`${resourceUrl}crown.png`" />
            <view v-if="item.minus && currentGoods.no === item.no" class="minus" :class="{ stamp: countEnd }">
              <view class="minus-text"><view>立减</view><view class="active">{{ item.minus }}元</view></view>
              <image class="minus-icon" :src="`${resourceUrl}lace.png`" />
            </view>
            <Shrink v-if="item.minus && showShrink" v-model:show="showShrink" :minus="item.minus" @finished="shrinkFinished" />
          </view>
        </scroll-view>
      </view>
    </view>
    <slot name="select">
      <view v-if="!isReview" class="interactive-select">
        <view v-if="studyCoinFloat" class="interactive-select__item" @click="studyCoinClick">
          <image class="icon" :src="`${resourceUrl}coin.png`" />
          <view class="title">
            学币余额：{{ studyCoinFloat }}
          </view>
          <view v-if="goodsCoin" class="tips">
            可抵扣{{ goodsCoin }}元
          </view>
          <image class="selected" :src="useStudyCoin ? `${resourceUrl}select_rect_active.png` : `${resourceUrl}select_rect.png`" />
        </view>
        <view v-if="couponList.length" class="interactive-select__item" @click="couponClick">
          <image class="icon" :src="`${resourceUrl}ticket.png`" />
          <view class="title">
            使用优惠券
          </view>
          <view v-if="discount" class="tips num discount">
            已优惠 {{ discount }} 元
          </view>
          <view v-else class="tips num">
            {{ couponList.length }} 张
          </view>
          <u-icon name="arrow-right" size="24rpx" color="#939393" :custom-style="{ marginLeft: '3rpx' }" />
        </view>
      </view>
    </slot>
    <view v-if="!isReview && showPayment" class="interactive-select pay">
      <view v-for="(item, index) in payWayList" :key="index" class="interactive-select__item" @click="changePayThrough(item)">
        <image class="icon" :class="{ wechat: item.title === '微信支付' }" :src="`${resourceUrl}${payIcon[item.title]}`" />
        <view class="title">
          {{ item.title }}
        </view>
        <image class="selected round" :src="payThrough === item.payThrough ? `${resourceUrl}select_round_active.png` : `${resourceUrl}select_round.png`" />
      </view>
    </view>
    <!-- <view v-if="isAgent && !isReview && !isUnpaid" class="interactive-gift">
      <image class="interactive-gift__icon" :src="`${resourceUrl}gift.png`" mode="widthFix" />
      <view class="interactive-gift__text">
        支持送<text class="active">
          TA
        </text>人
      </view>
      <view class="interactive-gift__btn" @click="jumpPick">
        送给TA
      </view>
    </view> -->
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" :overlay-style="popup.overlayStyle" bg-color="transparent">
      <view class="interactive-popup">
        <view class="interactive-popup__title">
          <view class="cancel" @click="cancelCoupon">
            取消
          </view>
          <view class="title">
            使用优惠券
          </view>
          <view class="confirm" @click="confirmCoupon">
            确定
          </view>
        </view>
        <scroll-view class="interactive-popup__list" scroll-y="true">
          <view v-for="(item, index) in couponList" :key="index" class="coupon-item" @click="changeCoupon(item)">
            <view class="coupon-item__content">
              <view class="count">
                <text>
                  {{ item.discountValue }}<text class="active">
                    元
                  </text>
                </text>
              </view>
              <view class="info">
                <view class="info-text">
                  <view class="info-text__title">
                    {{ item.goodName }}优惠券
                  </view>
                  <view class="info-text__time">
                    有效期：{{ $u.timeFormat(item.availableStartTime, 'yyyy.mm.dd') }}——{{ $u.timeFormat(item.expireTime, 'yyyy.mm.dd') }}
                  </view>
                </view>
                <image class="info-select" :src="popup.coupon.couponId === item.couponId ? `${resourceUrl}select_fill_active.png` : `${resourceUrl}select_fill.png`" mode="widthFix" />
              </view>
            </view>
            <image class="coupon-item__bg" :src="`${resourceUrl}ticket_bg.png`" mode="widthFix" />
          </view>
        </scroll-view>
      </view>
    </u-popup>
    <Payment v-show="showPayment" ref="payment" :unpaid="isUnpaid" @success="checkUpgrade" @cancel="paymentCancel" @fail="paymentFail">
      <view class="wapper">
        <view class="remark">注：虚拟产品，购买后不支持退订</view>
        <view class="payment">
          <slot name="payment">
            <view class="payment-content">
              <view class="payment-content__price">
                <template v-if="realPrice >= 0">
                  ¥<text class="active">
                    {{ realPrice }}
                  </text><text v-if="realDiscount > 0" class="discount">
                    已减{{ realDiscount }}元
                  </text>
                </template>
              </view>
              <view class="payment-content__btn">
                <view v-if="isAgent && !isReview" class="button" @click="otherPayment">
                  找人付
                </view>
                <view class="button pay" @click="paymentVIP">
                  立即支付
                </view>
              </view>
            </view>
          </slot>
          <view class="payment-tips" @click="openProtocol">支付即视为同意<text class="active">《会员协议》</text></view>
        </view>
      </view>
    </Payment>
    <u-popup :show="otherPaymentPopupShow" mode="center" :overlay="true" :overlay-style="popup.overlayStyle" bg-color="transparent">
      <view class="other-payment-popup">
        <view class="other-payment-popup__title">
          <view class="other-payment-popup__title-text">
            应付金额
          </view>
          <view class="other-payment-popup__title-close" @click="otherPaymentPopupShow = false">
            <image
              class="other-payment-popup__title-close-img"
              :src="`${resourceUrl}other-payment-popup-close.png`"
              mode="scaleToFill"
            />
          </view>
        </view>
        <view class="other-payment-popup__content">
          <view class="other-payment-popup__content-amount">
            <text class="rmb">
              ¥
            </text>{{ otherPaymentDetail.amount || 'XXX' }}
          </view>
          <view class="other-payment-popup__content-count-down">
            <view class="other-payment-popup__content-count-down-text">
              支付剩余时间：
            </view>
            <u-count-down :time="otherPaymentDetail.remainSec || 0" format="HH:mm:ss" auto-start @change="countChange">
              <view class="other-payment-popup__content-count-down-count">
                <view class="other-payment-popup__content-count-down-count-item">
                  {{ formatNumber((timeData.hours + timeData.days * 24) || 0) }}
                </view>
                <view class="other-payment-popup__content-count-down-count-item">
                  {{ formatNumber(timeData.minutes || 0) }}
                </view>
                <view class="other-payment-popup__content-count-down-count-item">
                  {{ formatNumber(timeData.seconds || 0) }}
                </view>
              </view>
            </u-count-down>
          </view>
        </view>
        <view class="other-payment-popup__footer">
          <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="sharePayment" />
          <view class="other-payment-popup__footer-button">
            发送给好友
          </view>
        </view>
      </view>
    </u-popup>
    <ExitPopup v-model:show="showExitPopup" :minus="exitGoods.minus" :card="exitGoods.cardType" @back="goBack" />
    <MinusPopup v-model:show="showMinusPopup" :minus="currentGoods.minus" :discount="currentGoods.discount" :card="currentGoods.cardType" :old="themeId === 'small_big'" @finished="minusFinished" />
    <UpgradePopup v-model:show="showUpgradePopup" :avatar="avatar" :name="studentInfo.studentName" :upgrade-info="upgradeInfo" @protocol="openProtocol" @back="goBack" @payment="paymentUpgrade" />
    <DegradePopup v-model:show="showDegradePopup" :degrade-info="degradeInfo" :payment-info="paymentInfo" @unpaid-report="unpaidReport" @payment="paymentDegrade" @close="closeDegradePopup" @protocol="openProtocol" />
    <UnpaidRemindPopup v-model:show="showUnpaidRemindPopup" :short-info="shortInfo" card-type="vipWanliu" :degrade-info="degradeInfo" @close="closeUnpaidRemindPopup" @payment="showUnpaidRemindPopup = false" @payment-success="paymentSuccess" />
    <NewPromoterPopup v-model:show="showNewPromoterPopup" :new-promoter-good-detail="newPromoterGoodDetail" :payment-info="paymentInfo" @payment="paymentNewPromoter" @protocol="openProtocol" />
    <ShortPayPopup v-model:show="showShortPayPopup" :current-goods="currentGoods" :short-info="shortInfo" @payment="paymentShort" @close="closeShortPopup" @protocol="openProtocol" />
    <ShortRemindPopup v-model:show="showShortRemindPopup" :options="options" :recommend="recommend" @payment="closeShortRemindPopup" />
  </view>
</template>

<script>
import dayjs from 'dayjs'
import Payment from '../../components/payment.vue'
import { deviceType, payThroughEnum, payThroughList } from '../util.js'
import UnpaidRemindPopup from '../../../components/unpaidRemindPopup.vue'
import ShortPayPopup from '../../../components/shortPayPopup.vue'
import ShortRemindPopup from '../../../components/shortRemindPopup.vue'
import ExitPopup from './exitPopup.vue'
import MinusPopup from './minusPopup.vue'
import UpgradePopup from './upgradePopup.vue'
import DegradePopup from './degradePopup.vue'
import NewPromoterPopup from './newPromoterPopup.vue'
import Shrink from './shrink.vue'
import { formatNumber, isHFSApp, isHFSStudent, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Payment, ExitPopup, MinusPopup, UpgradePopup, Shrink, DegradePopup, UnpaidRemindPopup, NewPromoterPopup, ShortPayPopup, ShortRemindPopup },
  emits: ['closeUnpaidRemindPopup', 'checkExitPopup', 'startPayment', 'paymentCancel', 'paymentFail', 'checkShortExit'],
  data() {
    return {
      options: {},
      resourceUrl: 'https://fe-resource.haofenshu.com/member/',
      paymentInfo: {},
      goodsList: {},
      couponList: [],
      currentGoods: {},
      scrollLeft: 0,
      prevDistance: 0,
      useStudyCoin: false,
      currentCoupon: {},
      payThrough: null,
      orderDetail: {},
      payIcon: {
        微信支付: 'wechat_pay.png',
        支付宝: 'alipay.png',
      },
      popup: {
        show: false,
        mode: 'bottom',
        overlay: true,
        overlayStyle: {
          background: 'rgba(0, 0, 0, 0.7)',
        },
        coupon: {},
      },
      aid: '',
      bid: '',
      cid: '',
      otherPaymentId: '',
      otherPaymentDetail: {},
      otherPaymentPopupShow: false,
      timeData: {},
      showExitPopup: false,
      showMinusPopup: false,
      showUpgradePopup: false,
      showDegradePopup: false,
      showUnpaidRemindPopup: false,
      showShrink: false,
      exitGoods: {},
      upgradeInfo: {},
      degradeInfo: {},
      countEnd: false,
      startTime: '',
      newPromoterGoodDetail: {},
      showNewPromoterPopup: false,
      currentGoods: {},
      recommend: {},
      showShortPayPopup: false,
      showShortRemindPopup: false,
      shortInfo: {},
    }
  },
  computed: {
    showVip() {
      // #ifdef H5
      if (isHFSStudent()) {
        return false
      }
      // #endif
      return true
    },
    showPayment() {
      // #ifdef MP-WEIXIN
      if (uni.$u.os() === 'ios' && (this.userInfo.phoneNumber === '18538365667' || this.studentInfo.isVirtual === 1))
        return false
      // #endif
      return true
    },
    userInfo() {
      return uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    },
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
    avatar() {
      return this.userInfo.avatar || `${this.resourceUrl}avatar.png`
    },
    myClassGroup() {
      return this.userInfo.myClassGroup || ''
    },
    isVip() {
      const { isMember = false } = (this.paymentInfo.isMember && this.paymentInfo) || this.userInfo
      return isMember
    },
    hiddenPay() {
      const { hiddenPay = false } = this.goodsList || {}
      return hiddenPay
    },
    memberships() {
      const { memberships = [] } = this.goodsList || {}
      if (this.isReview && memberships.length > 1)
        return memberships.filter(v => v.no === '1001')
      return memberships
    },
    themeId() {
      const { themeId = '' } = this.goodsList || {}
      return themeId
    },
    minusPopup() {
      const { minusPopup = 0 } = this.goodsList || {}
      return minusPopup
    },
    selectStyle() {
      const styles = ['one', 'two', 'three', 'more']
      return styles[Math.min(this.memberships.length - 1, 3)]
    },
    screenHalfWidth() {
      return uni.$u.sys().windowWidth / 2
    },
    studyCoinFloat() {
      return this.paymentInfo.studyCoinFloat || 0
    },
    discount() {
      return this.currentCoupon.discountValue || 0
    },
    discountPrice() {
      return Math.max(0, this.currentGoods[this.isReview ? 'iapCost' : 'cost'] - this.discount)
    },
    goodsCoin() {
      return Math.min(this.discountPrice, this.studyCoinFloat)
    },
    realPrice() {
      return this.useStudyCoin ? this.discountPrice - this.goodsCoin : this.discountPrice
    },
    realDiscount() {
      return this.useStudyCoin ? this.discount + this.goodsCoin : this.discount
    },
    prefix() {
      let prefix = '/v1/be-proxy'
      // #ifdef H5
      prefix = feConfig.api.hfs || ''
      // #endif
      return prefix
    },
    isReview() {
      // #ifdef H5
      return +this.$route.query.isReview
      // #endif
    },
    isUnpaid() {
      return !!this.orderDetail.id
    },
    payWayList() {
      return payThroughList()
    },
    isAgent() {
      return this.userInfo.agent === 1
    },
    activityType() {
      return this.options.activityType
    },
    actionId() {
      return this.options.actionId || 'newPromoter'
    },
  },
  mounted() {
    // #ifdef H5
    this.aid = this.$route.query.aid || ''
    this.bid = this.$route.query.bid || ''
    this.cid = this.$route.query.cid || ''
    this.options = this.$route.query
    // #endif
    // #ifdef MP-WEIXIN
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options
    this.options = options
    this.aid = options.aid || ''
    this.bid = options.bid || ''
    this.cid = options.cid || ''
    // #endif
    this.startTime = dayjs()
  },
  beforeUnmount() {
    if (!this.options.unpayId)
      return
    const endTime = dayjs()
    const diffTime = endTime.diff(this.startTime, 'second')
    this.unpaidReport(diffTime >= 5 ? 4 : 5, 'payPage')
  },
  methods: {
    async init() {
      await this.getPaymentInfo()
      await this.getGoodsList()
      if (this.hiddenPay)
        return this.shieldPay('暂不支持使用该功能')
      if (!this.showPayment)
        return this.shieldPay('由于相关规定要求，暂不支持IOS用户在线开通，如需帮助请联系客服！')
      const goods = this.memberships[this.memberships.length >= 2 ? 1 : 0] || {}
      this.exitGoods = goods
      this.changeGoods(goods)
      const payWay = this.isReview ? payThroughEnum.IOSIAP : this.payWayList[0]
      this.changePayThrough(payWay || {})
      await this.handlePopupsByPriority() // 执行弹窗优先级逻辑
      this.showPopupAnimation()
    },
    async unpaid(orderDetail) {
      this.orderDetail = orderDetail
      await this.getPaymentInfo()
      const { good = {}, payThrough } = this.orderDetail || {}
      this.goodsList = { memberships: [good] }
      this.changeGoods(good)
      const payWay = this.payWayList.find(v => v.payThrough === payThrough) || this.payWayList[0]
      this.changePayThrough(payWay || {})
    },
    // 获取支付信息
    async getPaymentInfo() {
      const res = await uni.$http.get(`${this.prefix}/v2/user-center/payment-info`)
      this.paymentInfo = res.data || {}
    },
    // 获取商品列表
    async getGoodsList() {
      const res = await uni.$http.get(`${this.prefix}/v2/payments/goods-list-v2`)
      this.goodsList = res.data || {}
    },
    // 获取优惠券
    async getCouponList(no) {
      if (this.themeId === 'short_long')
        return
      const res = await uni.$http.get(`${this.prefix}/v2/payments/coupons/receives?goodNo=${no}&goodType=1&useStatus=1`, {}, { custom: { loading: false, error: false } })
      this.couponList = (res.data || []).filter(v => v.goodNo === no)
      this.currentCoupon = this.couponList[0] || {}
    },
    // 支付完成检查是否要升级
    async checkUpgrade(id) {
      if (this.activityType === 'newPromoter') {
        report(this.actionId, 'bdy_gmcg')
        return uni.redirectTo({ url: '/uni_modules/hfs-fe-uni-module/pages/newPromoter/operation' })
      }
      this.exitGoods = {}
      const res = await uni.$http.get(`${this.prefix}/v2/payments/check-upgrade?id=${id}`)
      const { upgrade = false } = res.data || {}
      if (!upgrade)
        return this.paymentSuccess()
      this.upgradeInfo = { ...res.data, paymentId: id }
      this.showUpgradePopup = true
    },
    // 待支付弹窗
    async getDegradeTip() {
      const res = await uni.$http.get(`${this.prefix}/v2/payments/degrade-tip`, { cid: this.cid })
      this.degradeInfo = res.data || {}
      this.$emit('checkExitPopup', this.degradeInfo)
      if (this.degradeInfo.id === this.options.unpayId) {
        this.shrinkFinished()
        this.showDegradePopup = true
      }
    },
    // 新推官商品详情
    async getNewPromoterGood() {
      const res = await uni.$http.post(`${this.prefix}/v3/new-promoter/invitee-week-check`)
      if (res.data) {
        this.newPromoterGoodDetail = res.data
        this.showNewPromoterPopup = true
        this.shrinkFinished()
      }
    },
    // 短期变长期商品详情
    async getShortToLongGood() {
      await this.shortReport()
      const goodNo = this.options.goodNo || ''
      const goodItem = this.memberships.find(v => v.no === goodNo) || {}
      if (goodNo && goodItem.no) {
        this.currentGoods = { ...goodItem, dayPrice: goodItem.dayPriceNew, showServiceTo: true }
        this.showShortPayPopup = true
        this.shrinkFinished()
      }
      this.$emit('checkShortExit')
    },
    async shortReport() {
      this.shortInfo = await this.recommendGoods()
      const { recommendation = {} } = this.shortInfo
      const { memberType = '', stage = '' } = recommendation
      const isYearExpiring = memberType === 'year' && stage.startsWith('expiring')
      memberType && report(isYearExpiring ? 'year_expiring' : 'short_long', `${memberType}_vip_open_page`)
    },
    // 埋点
    async unpaidReport(action, value) {
      if (Object.keys(this.degradeInfo).length === 0)
        return
      const { degradeType, degradeLevel, cardType, cid } = this.degradeInfo
      const params = {
        cardType: value || cardType,
        action, // 1：关闭广告  2：放弃  3：支付
        degradeType,
        degradeLevel,
        cid,
      }
      return await uni.$http.post(`${this.prefix}/v3/action/unpay-degrade`, params, { custom: { loading: false, error: false } })
    },
    shieldPay(content) {
      return uni.showModal({
        title: '温馨提示',
        content,
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#ffba1d',
        success: (res) => {
          if (res.confirm)
            return this.goBack()
        },
      })
    },
    changeGoods(item) {
      if (this.currentGoods.no === item.no)
        return
      this.couponList = []
      this.currentCoupon = {}
      this.currentGoods = item
      !this.isReview && !this.isUnpaid && item.useConpon && this.getCouponList(item.no)
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
    studyCoinClick() {
      this.useStudyCoin = !this.useStudyCoin
    },
    couponClick() {
      this.popup.coupon = this.currentCoupon
      this.popup.show = true
    },
    confirmCoupon() {
      const { coupon } = this.popup
      this.currentCoupon = coupon
      this.cancelCoupon()
    },
    cancelCoupon() {
      this.popup.coupon = {}
      this.popup.show = false
    },
    changeCoupon(item) {
      const { coupon = {} } = this.popup
      if (coupon.couponId === item.couponId)
        return
      this.popup.coupon = item
    },
    changePayThrough({ payThrough = null }) {
      if (this.payThrough === payThrough)
        return
      this.payThrough = payThrough
    },
    paymentVIP(opts) {
      this.$emit('startPayment')
      const params = this.isUnpaid
        ? {
            id: this.orderDetail.id,
            payThrough: this.payThrough,
            aid: opts.aid,
            bid: opts.bid,
            cid: opts.cid,
          }
        : {
            couponId: this.currentCoupon.couponId,
            goodNo: this.currentGoods.no,
            goodType: 1,
            payThrough: this.payThrough,
            studyCoinCount: 0,
            useStudyCoin: this.useStudyCoin ? 1 : 3,
            themeId: this.themeId || undefined,
            aid: this.aid,
            bid: this.bid,
            cid: this.cid,
          }
      this.$refs.payment.paymentVIP(params)
    },
    paymentUpgrade(id) {
      this.$emit('startPayment')
      const params = {
        id,
        payThrough: this.payThrough,
      }
      this.$refs.payment.paymentVIP(params, '/v2/payments/upgrade')
    },
    // 底部支付弹窗-关闭
    async closeDegradePopup() {
      this.showDegradePopup = false
      this.$emit('checkExitPopup')
    },
    closeUnpaidRemindPopup() {
      this.$emit('closeUnpaidRemindPopup')
    },
    showDegradeExit() {
      this.showDegradePopup = false
      this.showUnpaidRemindPopup = true
    },
    paymentDegrade(options) {
      this.$emit('startPayment')
      const params = {
        ...options,
        payThrough: this.payThrough,
      }
      this.$refs.payment.paymentVIP(params, '/v2/payments/degrade')
    },
    paymentNewPromoter() {
      const params = {
        deviceType: deviceType(),
        goodNo: this.newPromoterGoodDetail.no, // 固定商品
        goodType: 1, // 固定参数 goodType goodNo
        payThrough: this.payThrough,
        studyCoinCount: 0, // 不支持学币
        useStudyCoin: 3,
        aid: 'xtg',
        bid: '',
        cid: '',
      }
      this.$refs.payment.paymentVIP(params, '/v2/payments')
    },
    async otherPayment() {
      const accountInfo = getApp().globalData.accountInfo || {}
      const params = {
        couponId: this.currentCoupon.couponId,
        goodNo: this.currentGoods.no,
        goodType: 1,
        payThrough: this.payThrough,
        studyCoinCount: 0,
        useStudyCoin: this.useStudyCoin ? 1 : 3,
        gift: 2,
        deviceType: deviceType(),
      }
      if (this.payThrough === 30) {
        params.openId = accountInfo.openId
      }
      const res = await uni.$http.post(`${this.prefix}/v2/payments/`, params)
      const paymentId = res.data.paymentId
      this.otherPaymentId = paymentId
      const otherPaymentDetailRes = await uni.$http.get(`${this.prefix}/v2/payments/gift-detail`, { id: paymentId })
      this.otherPaymentDetail = otherPaymentDetailRes.data
      this.otherPaymentPopupShow = true
    },
    paymentSuccess() {
      if (this.myClassGroup) {
        const url = `${this.myClassGroup}&position=2`
        // #ifdef MP-WEIXIN
        uni.reLaunch({ url })
        // #endif
        // #ifdef H5
        this.init()
        nativeBridge.callHandler('adJump', JSON.stringify({ mode: 4, target: 'gh_dad0a8e4dc1c', data: { path: url } }))
        // #endif
        return
      }
      // #ifdef MP-WEIXIN
      uni.reLaunch({ url: '/pages/index/index' })
      // #endif
      // #ifdef H5
      this.init()
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 78 }))
      // #endif
    },
    paymentCancel() {
      this.$emit('paymentCancel')
    },
    paymentFail(err) {
      this.$emit('paymentFail')
      return uni.$u.toast(err.errMsg || err)
    },
    openProtocol() {
      let url = '/pages/agreement/index'
      // #ifdef MP-WEIXIN
      url = `/pages/webview/webview?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}`)}`
      // #endif
      // #ifdef H5
      if (isHFSApp()) {
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${window.location.origin}${url}` }))
      }
      // #endif
      return uni.navigateTo({ url })
    },
    jumpPick() {
      report('behalf', 'sgt_rk_click')
      return uni.navigateTo({ url: '/uni_modules/hfs-fe-uni-module/memberPages/behalf/pick?back=true' })
    },
    countChange(e) {
      this.timeData = e
    },
    formatNumber,
    sharePayment() {
      report('behalf', 'zrf_qq_share')
      // #ifdef H5
      const { title, path, imageUrl: cover } = this.getShareWeixinInfo()
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 8, target: 'gh_dad0a8e4dc1c', data: { title, path, cover } }))
      // #endif
    },
    getShareWeixinInfo() {
      return {
        title: '请帮我代付吧～',
        path: `/uni_modules/hfs-fe-uni-module/memberPages/behalf/detail${uni.$u.queryParams({ paymentId: this.otherPaymentId })}`,
        imageUrl: `${this.resourceUrl}other_pay_share.png`,
      }
    },
    // 统一处理弹窗优先级
    async handlePopupsByPriority() {
      // 弹窗配置：优先级从高到低
      const popupConfigs = [
        {
          name: 'degrade', // 待支付弹窗 - 优先级最高
          condition: () => this.options.unpayId,
          action: async () => await this.getDegradeTip(),
        },
        {
          name: 'shortToLong', // 短期变长期弹窗 - 优先级第二
          condition: () => this.activityType === 'shortToLong',
          action: async () => await this.getShortToLongGood(),
        },
        {
          name: 'newPromoter', // 新推官弹窗 - 优先级第三
          condition: () => this.activityType === 'newPromoter',
          action: async () => {
            this.options.action && report(this.actionId, this.options.action)
            await this.getNewPromoterGood()
          },
        },
        // 后续新增弹窗只需在此添加配置，按优先级顺序排列
      ]

      // 按优先级顺序执行，只显示第一个满足条件的弹窗
      for (const popup of popupConfigs) {
        if (popup.condition()) {
          await popup.action()
          break // 只执行第一个满足条件的弹窗
        }
      }
    },
    showPopupAnimation() {
      if (this.isReview || !this.minusPopup || !this.currentGoods.minus || this.degradeInfo.id || this.showNewPromoterPopup || this.showShortPayPopup)
        return
      this.showMinusPopup = true
    },
    // 短期变长期支付
    paymentShort() {
      const params = {
        deviceType: deviceType(),
        goodNo: this.currentGoods.no, // 固定商品
        goodType: 1, // 固定参数 goodType goodNo
        payThrough: this.payThrough,
        studyCoinCount: 0, // 不支持学币
        useStudyCoin: 3,
        aid: 'xtg',
        bid: '',
        cid: '',
      }
      this.$refs.payment.paymentVIP(params, '/v2/payments')
    },
    closeShortRemindPopup() {
      this.showShortRemindPopup = false
      this.showShortPayPopup = false
      this.$emit('checkExitPopup')
    },
    closeShortPopup() {
      this.$emit('checkShortExit')
    },
    async showShortExit() {
      const info = await this.recommendGoods()
      if (!info.show)
        return this.goBack()
      this.recommend = info
      this.showShortRemindPopup = true
    },
    async recommendGoods() {
      const res = await uni.$http.get(`${this.prefix}/v3/strategy/recommend-goods`, {}, { custom: { loading: false, error: false } })
      return res.data || {}
    },
    showExit() {
      if (!this.exitGoods.minus)
        return this.goBack()
      this.showExitPopup = true
    },
    shrinkFinished() {
      this.$refs.countTo && this.$refs.countTo[0].start()
    },
    minusFinished() {
      this.showShrink = true
    },
    countToEnd() {
      this.countEnd = true
    },
    formatTime(time, format) {
      if (!time)
        return
      return dayjs(time).format(format)
    },
    goBack() {
      if (getCurrentPages().length > 1)
        return uni.navigateBack()
      // #ifdef H5
      if (isHFSApp()) {
        return nativeBridge.callHandler('goBack', 'goBack')
      }
      // #endif
      return uni.navigateBack()
    },
  },
}
</script>

<style lang="scss" scoped>
.interactive {
  &-info {
    background: #ffffff;
    border-radius: 0 0 24rpx 24rpx;
    margin-bottom: 24rpx;
    padding: 40rpx 0 32rpx;
    &__user {
      display: flex;
      align-items: center;
      padding: 0 28rpx;
      .avatar {
        width: 80rpx;
        height: 80rpx;
        margin-right: 16rpx;
      }
      .text {
        &-name {
          display: flex;
          align-items: center;
          color: #333333;
          font-size: 30rpx;
          font-weight: bold;
          margin-bottom: 2rpx;
          &__vip {
            width: 90rpx;
            height: 34rpx;
            margin-left: 13rpx;
            flex-shrink: 0;
          }
        }
        &-tips {
          font-size: 24rpx;
          color: #939393;
          .active {
            color: #ff2a2a;
          }
        }
      }
    }
    &__select {
      padding: 0 28rpx;
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
          height: 236rpx;
          padding-top: 40rpx;
          margin-top: 58rpx;
          background: #fefdf8;
          border: 2rpx solid #ffeccb;
          border-radius: 22rpx;
          transition: width 0.1s;
          .name {
            color: #333333;
            font-size: 26rpx;
            font-weight: bold;
          }
          .price {
            z-index: 1;
            &-cost {
              color: #ff381b;
              font-size: 56rpx;
              font-weight: Bold;
              .active {
                font-size: 24rpx;
                color: #5d3a0c;
                margin-left: 4rpx;
              }
            }
            &-day {
              color: #939393;
              font-size: 22rpx;
              text-align: center;
              .through {
                text-decoration: line-through;
              }
            }
          }
          .tag {
            position: absolute;
            top: -18rpx;
            left: -2rpx;
            height: 42rpx;
            font-size: 24rpx;
            color: #ffffff;
            font-weight: 500;
            display: flex;
            align-items: center;
            background: linear-gradient(225deg, #ff450e, #ff880c);
            border-radius: 36rpx 2rpx 36rpx 2rpx;
            padding: 0 24rpx;
            z-index: 1;
          }
          .tip {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 40rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #915d00;
            font-size: 18rpx;
            background: #ffeccb;
            border-radius: 0 0 20rpx 20rpx;
            z-index: 1;
          }
          .icon {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 116rpx;
            height: 102rpx;
          }
          .minus {
            position: absolute;
            top: 0;
            right: 0;
            opacity: 0;
            &.stamp {
              transform-origin: center;
              animation: stamp 1s cubic-bezier(0.1, 0.7, 0.1, 1) forwards;
            }
            &-text {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
              color: #ff0000;
              font-size: 14rpx;
              text-align: center;
              line-height: 1.1;
              .active {
                font-size: 18rpx;
                font-weight: bold;
              }
            }
            &-icon {
              width: 66rpx;
              height: 62rpx;
            }
          }
          &.one {
            width: 100%;
            height: 156rpx;
            flex-direction: row;
            padding: 0 0 0 62rpx;
            margin-top: 76rpx;
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
            width: 286rpx;
            margin-right: 24rpx;
            &.active {
              width: 384rpx;
            }
          }
          &.three {
            width: 204rpx;
            margin-right: 16rpx;
            &.active {
              width: 252rpx;
            }
          }
          &.more {
            width: 204rpx;
            margin-right: 16rpx;
            &.active {
              width: 240rpx;
            }
            &:first-child {
              margin-left: 28rpx;
            }
            &:last-child {
              margin-right: 28rpx;
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
  &-select {
    background: #ffffff;
    border-radius: 24rpx;
    padding: 0 28rpx;
    margin-bottom: 8rpx;
    &.pay {
      margin-bottom: 24rpx;
    }
    &__item {
      height: 96rpx;
      display: flex;
      align-items: center;
      &:nth-child(2) {
        border-top: 1rpx solid #e6e6e6;
      }
      .icon {
        width: 36rpx;
        height: 36rpx;
        margin-right: 16rpx;
        &.wechat {
          width: 38rpx;
          height: 32rpx;
          margin-right: 14rpx;
        }
      }
      .title {
        font-size: 28rpx;
        color: #333333;
        margin-right: 12rpx;
      }
      .tips {
        font-size: 24rpx;
        color: #939393;
        &.num {
          margin-left: auto;
        }
        &.discount {
          color: #ff3737;
        }
      }
      .selected {
        width: 36rpx;
        height: 36rpx;
        margin-left: auto;
        &.round {
          width: 38rpx;
          height: 38rpx;
        }
      }
    }
  }
  &-gift {
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28rpx;
    margin-bottom: 24rpx;
    background: linear-gradient(175deg, #ffd997 0%, #fff5d4 94%);
    border: 2rpx solid #ffffff;
    border-width: 2rpx 0;
    border-radius: 12rpx;
    &__icon {
      width: 48rpx;
      height: 48rpx;
      margin-right: 16rpx;
    }
    &__text {
      flex: 1;
      font-size: 28rpx;
      color: #333333;
      .active {
        color: #ff2929;
      }
    }
    &__btn {
      width: 164rpx;
      height: 60rpx;
      color: #935d00;
      font-size: 26rpx;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffd77b;
      border-radius: 30rpx;
    }
  }
  &-popup {
    width: 100%;
    height: 728rpx;
    background: #ffffff;
    padding: 28rpx 0;
    border-radius: 24rpx 24rpx 0 0;
    &__title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 30rpx;
      padding: 0 32rpx;
      margin-bottom: 48rpx;
      .cancel {
        color: #939393;
      }
      .title {
        font-size: 32rpx;
        color: #333333;
        font-weight: bold;
      }
      .confirm {
        color: #ffb100;
      }
    }
    &__list {
      height: 580rpx;
      padding: 0 28rpx;
      .coupon-item {
        width: calc(100vw - 56rpx);
        position: relative;
        margin-bottom: 24rpx;
        &__content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          z-index: 1;
          .count {
            width: 150rpx;
            height: 100%;
            font-size: 52rpx;
            color: #ff0000;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            .active {
              font-size: 24rpx;
              font-weight: normal;
            }
          }
          .info {
            flex: 1;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 34rpx;
            &-text {
              &__title {
                font-size: 28rpx;
                font-weight: bold;
                color: #333333;
                margin-bottom: 6rpx;
              }
              &__time {
                color: #939393;
                font-size: 24rpx;
              }
            }
            &-select {
              width: 40rpx;
              height: 40rpx;
            }
          }
        }
        &__bg {
          width: 100%;
        }
      }
    }
  }
  .wapper {
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 999;
    background: #f6f6f6;
    padding-top: 10rpx;
    .remark {
      font-size: 22rpx;
      color: #939393;
      padding: 0 18rpx;
      margin-bottom: 10rpx;
    }
  }
  .payment {
    padding: 20rpx 0 12rpx;
    padding: 20rpx 0 calc(env(safe-area-inset-bottom) + 12rpx);
    background: #ffffff;
    border-radius: 24rpx 24rpx 0 0;
    box-shadow: 0rpx -4rpx 12rpx 0rpx rgba(0, 0, 0, 0.04);
    &-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24rpx;
      margin: -10rpx 0 22rpx;
      &__price {
        color: #ff3434;
        font-size: 24rpx;
        font-weight: bold;
        .active {
          font-size: 56rpx;
          margin: 0 10rpx;
        }
        .discount {
          color: #939393;
          font-weight: normal;
        }
      }
      &__btn {
        width: 440rpx;
        height: 84rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 200rpx;
        overflow: hidden;
        .button {
          width: 50%;
          height: 100%;
          color: #ffecab;
          font-size: 30rpx;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(270deg, #4e4e4e, #333333);
          &.pay {
            flex: 1;
            color: #ffffff;
            background: linear-gradient(270deg, #ff461f, #ff782b);
          }
        }
      }
    }
    &-tips {
      font-size: 22rpx;
      color: #939393;
      text-align: center;
      .active {
        color: #ffba1d;
      }
    }
  }

  .other-payment-popup {
    width: calc(100vw - 136rpx);
    height: 496rpx;
    background: linear-gradient(180deg, #fffdc4, #ffffff 18%);
    border-radius: 76rpx;

    &__title {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      padding: 50rpx 0 52rpx 0;

      &-text {
        height: 50rpx;
        font-size: 36rpx;
        font-weight: 500;
        color: #5d3a0c;
      }

      &-close {
        position: absolute;
        top: 45rpx;
        right: 52rpx;
        width: 54rpx;
        height: 56rpx;

        &-img {
          width: 100%;
          height: 100%;
        }
      }
    }

    &__content {
      &-amount {
        display: flex;
        align-items: baseline;
        justify-content: center;

        height: 84rpx;
        font-size: 60rpx;
        font-weight: 500;
        color: #333333;

        .rmb {
          margin-right: 10rpx;
          font-size: 32rpx;
        }
      }

      &-count-down {
        margin-top: 62rpx;
        display: flex;
        justify-content: center;

        &-text {
          height: 36rpx;
          font-size: 26rpx;
          color: #333333;
        }

        &-count {
          display: flex;
          align-items: center;
          margin-right: 8rpx;

          &-item {
            width: 44rpx;
            height: 36rpx;
            position: relative;
            background: #ffeaea;
            border-radius: 6rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30rpx;
            font-weight: bold;
            color: #ff3b3b;
            margin-right: 24rpx;

            &::after {
              content: '：';
              position: absolute;
              top: 50%;
              right: -34rpx;
              transform: translateY(-50%);
            }

            &:last-child {
              margin-right: 0;

              &::after {
                display: none;
              }
            }
          }
        }
      }
    }

    &__footer {
      position: relative;
      margin-top: 38rpx;
      padding: 0 126rpx;
      height: 72rpx;

      display: flex;
      align-items: center;
      justify-content: center;

      &-button {
        width: 100%;
        height: 72rpx;
        background: linear-gradient(225deg, #ffa430 0%, #ff7426);
        border-radius: 42rpx;
        font-size: 32rpx;
        font-weight: 500;
        color: #ffffff;

        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
@keyframes stamp {
  0% {
    transform: translateZ(400rpx) scale(2);
    opacity: 0;
  }
  100% {
    transform: translateZ(0) scale(1);
    opacity: 1;
  }
}
</style>
