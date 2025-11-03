<template>
  <view>
    <view class="arena" :style="{ paddingBottom }">
      <!-- #if MP-WEIXIN -->
      <u-navbar title="考试竞技场" auto-back placeholder :title-style="{ color: '#333333', fontSize: '16px', fontWeight: 'bold' }" />
      <!-- #endif -->
      <view class="type">
        <view class="type-list">
          <template v-for="(item, index) in typeList">
            <view v-if="config[item.type] === 2" :key="index" class="type-list__item" @click="handleClick(item)">
              <image class="icon" :src="item.icon" />
              <view class="text">
                {{ item.text }}
              </view>
              <image v-if="item.code === '2003'" class="new" src="../static/academicReport/new.png" mode="widthFix" />
            </view>
          </template>
        </view>
        <view class="type-tips">
          <image class="type-tips__title" src="../static/academicReport/shuoming.png" />
          <image class="type-tips__icon" src="../static/academicReport/shuoming_icon.png" />
          <view class="type-tips__text">
            考试竞技场利用多维度考试数据，提供有用有趣的考试信息帮助学生或家长更加全面的了解学习情况。但是该模块数据有一定敏感性，会因为教育部门或学校隐私相关需求而调整的风险。
          </view>
        </view>
      </view>
      <view class="study">
        <view class="study-title">
          我的功能券
        </view>
        <view class="study-coin">
          <view class="study-coin__num">
            学币剩余:{{ studyCoin }}
          </view>
          <view v-if="isIos && showVip && config.parentPay === 2" class="study-coin__buy" @click="handleBuyCoin">
            充学币<image class="icon" src="../static/academicReport/right.png" />
          </view>
        </view>
      </view>
      <view class="list">
        <template v-for="(item, index) in list">
          <view v-if="config[item.type] === 2" :key="index" class="list-item" @click="handleItem(item)">
            <image class="list-item__bg" src="../static/academicReport/ticket_bg.png" mode="widthFix" />
            <view class="list-item__left">
              <view class="ticket">
                <view v-if="isMember && item.free" class="free">
                  免费
                </view>
                <view v-else class="content">
                  <view class="remain">
                    {{ item.owningCount }}<text class="unit">
                      张
                    </text>
                  </view>
                  <view class="name">
                    兑换券
                  </view>
                </view>
                <image class="bg" :src="item.bg" />
              </view>
              <view class="message">
                <view class="title">
                  {{ item.name }}
                  <view v-if="item.buyedCount > 0" class="buyed">已购买{{ item.buyedCount }}次</view>
                </view>
                <view class="count">
                  <text v-if="item.free">
                    {{ item.vipText }}
                  </text>
                  <template v-if="!item.free && isMember">
                    <text v-if="item.leftFreeChance > 0">
                      {{ item.vipText }}: {{ item.leftFreeChance }}
                    </text>
                    <text v-else>
                      {{ item.vipFinishedText }}
                    </text>
                  </template>
                  <text v-if="!item.free && !isMember">
                    {{ item.novipText }}
                  </text>
                </view>
              </view>
            </view>
            <view v-if="config.parentPay === 2 && (!isMember || !item.free)" class="list-item__right" @click.stop="handleTicket(item)">
              {{ item.studyCoinCost }}学币购买
            </view>
          </view>
        </template>
      </view>
      <view v-if="showInviteEntry" class="invite" @click="inviteNew">
        <image class="invite-img" :src="`${resourceUrl}invite_new.png`" mode="widthFix" />
      </view>
      <!-- 底部开通会员 -->
      <ShortPopup v-if="showShortPopup" :from="shortFrom" :short-info="shortInfo" @close="showShortPopup = false" @abandon="showShortPopup = false" @payment="showShortPopup = false" />
      <ShortYearExpiredPopup v-if="showShortYearExpiredPopup" :from="shortFrom" :short-info="shortInfo" @close="showShortYearExpiredPopup = false" />
      <OldUserPopup v-else-if="upgradeInfo.upgrade" :upgrade-info="upgradeInfo" action="ks_jjc" />
      <template v-else-if="upgradeInfo.upgrade === false">
        <image v-if="showDefaultVip" class="member" :src="`${resourceUrl}arena_vip_bg_new.png`" mode="widthFix" @click="jumpPage('vip', { eventId: 'ks_ksjjc_ljkt_pay' })" />
      </template>
      <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" bg-color="transparent">
        <view class="arena-popup">
          <view class="arena-popup__title">
            温馨提示
          </view>
          <view class="arena-popup__content">
            {{ popup.content }}
          </view>
          <view class="arena-popup__btn">
            <view class="btn close" @click="closePopup">
              取消
            </view>
            <view v-if="popup.confirmType === 'price'" class="btn confirm" @click="paymentVIP">
              去购买
            </view>
            <view v-if="popup.confirmType === 'ticket'" class="btn confirm" @click="handleBuyTicket">
              去购买
            </view>
            <view v-if="popup.confirmType === 'coin'" class="btn confirm" @click="handleBuyCoin">
              去充值
            </view>
          </view>
        </view>
      </u-popup>
    </view>
    <Payment ref="payment" @success="paymentSuccess" @fail="paymentFail" />
  </view>
</template>

<script>
import Payment from '../../memberPages/components/payment'
import OldUserPopup from '../components/oldUserPopup.vue'
import ShortPopup from '../../components/shortPopup.vue'
import ShortYearExpiredPopup from '../../components/shortYearExpiredPopup.vue'
import { deviceType, payThroughList } from '../../memberPages/member/util.js'
import { isHFSApp, isHFSParent, isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Payment, OldUserPopup, ShortPopup, ShortYearExpiredPopup },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
      options: {},
      config: {},
      list: [],
      studyCoin: 0,
      upgradeInfo: {},
      userInfo: {},
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        confirmType: 'ticket',
        content: '',
      },
      currentTicket: {},
      typeList: [
        {
          icon: require('../static/academicReport/bagua.png'),
          bg: require('../static/academicReport/ticket_bagua.png'),
          text: '八卦报告',
          type: 'gossipReport',
          code: '2002',
          free: true, // 会员免费
          fn: 'checkGossipVisible',
          vipText: '会员免费使用',
          vipFinishedText: '会员免费使用',
          novipText: '会员免费使用',
        },
        {
          icon: require('../static/academicReport/chengji.png'),
          bg: require('../static/academicReport/ticket_chengji.png'),
          text: '成绩PK',
          type: 'examPk',
          code: '2003',
          fn: 'jumpPage',
          vipText: '本场考试剩余免费次数',
          vipFinishedText: '本场考试已用完',
          novipText: '6次/单次考试',
        },
        {
          icon: require('../static/academicReport/banji.png'),
          bg: require('../static/academicReport/ticket_banji.png'),
          text: '班级穿越',
          type: 'cross',
          code: '2005',
          fn: 'jumpPage',
          vipText: '今日剩余免费次数',
          vipFinishedText: '今日已用完',
          novipText: '会员每日免费3次',
        },
        {
          icon: require('../static/academicReport/moni.png'),
          bg: require('../static/academicReport/ticket_moni.png'),
          text: '模拟成绩',
          type: 'simulation',
          code: '2006',
          fn: 'jumpPage',
          vipText: '本场考试剩余免费次数',
          vipFinishedText: '本场考试已用完',
          novipText: '3次/单次考试',
        },
      ],
      defaultBg: require('../static/academicReport/ticket_moni.png'),
      shortFrom: 'examArena',
      shortInfo: {},
      showShortPopup: false,
      showShortYearExpiredPopup: false,
      isHiddenBottomVip: null, // 一年过期会员活动对象不显示底部vip
      hasCalledShortToLong: false, // 标记是否已经调用过 shortToLong 接口
    }
  },
  computed: {
    isIos() {
      return uni.$u.os() === 'ios'
    },
    isMember() {
      return this.userInfo.isMember || false
    },
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/be-proxy'
      // #endif
      return prefix
    },
    examProxy() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    showVip() {
      // #ifdef H5
      if (isHFSStudent()) {
        return false
      }
      // #endif
      return true
    },
    isHFSAppStudent() {
      // #ifdef H5
      if (isHFSStudent()) {
        return true
      }
      // #endif
      return false
    },
    isHFSAppParent() {
      // #ifdef H5
      if (isHFSParent()) {
        return true
      }
      // #endif
      return false
    },
    showInviteEntry() {
      return this.isHFSAppStudent && this.userInfo.agent === 1
    },
    configOptions() {
      const { scoreType, rankType, score, classRank, gradeRank } = this.config
      const params = { scoreType, rankType, score, classRank, gradeRank }
      return uni.$u.platform === 'weixin' ? params : ''
    },
    payWayList() {
      return payThroughList()
    },
    payThrough() {
      const { payThrough } = this.payWayList[0] || {}
      return payThrough
    },
    showDefaultVip() {
      return this.showVip && this.config.parentPay === 2 && !this.isMember && this.isHiddenBottomVip === false
    },
    paddingBottom() {
      if (this.showShortPopup)
        return 'calc(444rpx + env(safe-area-inset-bottom))'
      if (this.upgradeInfo.upgrade)
        return 'calc(320rpx + env(safe-area-inset-bottom))'
      if (this.showDefaultVip)
        return '300rpx'
      return '20rpx'
    },
  },
  async onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    const shieldConfig = uni.getStorageSync('shieldConfig')
    const examConfigs = shieldConfig.examConfigs.find(v => +v.examId === +options.examId) || {}
    this.config = Object.assign({}, shieldConfig, examConfigs)
    this.reportEvent('ks_ksjjc_Pksjjc')
  },
  onShow() {
    this.getMyTickets()
  },
  methods: {
    inviteNew() {
      // #ifdef H5
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${feConfig.operationUrl}/#/uni_modules/hfs-fe-uni-module/pages/new/operation` }))
      // #endif
    },
    async getMyTickets() {
      const res = await uni.$http.get(`${this.prefix}/v2/point-mall/sold-good/myTickets`, { examId: this.options.examId })
      const { studyCoin = 0, tickets = [] } = res.data
      tickets.sort((a, b) => a.code - b.code)
      this.list = tickets.map((item) => {
        const { bg = '', type = '', free = false, vipText, vipFinishedText, novipText = '' } = this.typeList.find(v => v.code === item.code) || {}
        return { ...item, type, bg: bg || this.defaultBg, free, vipText, vipFinishedText, novipText }
      })
      this.studyCoin = studyCoin
      this.getMarketingActivity()
    },
    // 获取营销活动（按优先级）
    async getMarketingActivity() {
      const marketingStrategies = [
        {
          name: 'shortToLong', // 短期变长期
          fetch: this.getShortRecommend,
          check: () => this.showShortPopup || this.showShortYearExpiredPopup,
          shouldCall: () => !this.hasCalledShortToLong, // 只在第一次调用
        },
        {
          name: 'upgrade', // 小转大
          fetch: this.getUpgrade,
          check: () => this.upgradeInfo.upgrade,
          shouldCall: () => true, // 每次都调用
        },
      ]

      for (const strategy of marketingStrategies) {
        // 检查是否应该调用该策略
        if (!strategy.shouldCall || strategy.shouldCall()) {
          await strategy.fetch()
          // 如果是 shortToLong，标记为已调用
          if (strategy.name === 'shortToLong') {
            this.hasCalledShortToLong = true
          }
          if (strategy.check())
            break
        }
      }
    },
    async getShortRecommend() {
      const res = await uni.$http.get(`${this.prefix}/v3/strategy/recommend-goods`, { from: this.options.shortFrom || this.shortFrom }, { custom: { loading: false, error: false } })
      this.shortInfo = res.data || {}

      const { recommendation = {}, show = false, showed = false } = this.shortInfo
      const { memberType = '', stage = '' } = recommendation
      this.isHiddenBottomVip = show || showed
      if (memberType === 'year' && stage === 'expired') {
        this.showShortYearExpiredPopup = true
        return
      }
      if (memberType === 'month' || memberType === 'jidu' || memberType === 'halfYear') {
        this.showShortPopup = this.shortInfo.show
      }
    },
    async getUpgrade() {
      const res = await uni.$http.get(`${this.prefix}/v2/payments/upgrade-popup`, {}, { custom: { loading: false, error: false } })
      this.upgradeInfo = res.data || {}
    },
    handleClick(item) {
      this[item.fn](item.type)
    },
    handleItem(item) {
      const row = this.typeList.find(v => +v.code === +item.code)
      this[row.fn](row.type)
    },
    // 八卦报告跳转前判断
    async checkGossipVisible(type) {
      const { gossipVisible, mode, examId } = this.options
      if (this.isMember || +gossipVisible === 1)
        return this.jumpPage(type)
      // 获取最新考试详情，兼容webview返回到当前页面重复扣券
      if (+gossipVisible !== 1) {
        const examDetail = await this.getExamDetail()
        if (+examDetail.gossipVisible === 1)
          return this.jumpPage(type)
      }
      const { owningCount = 0 } = this.list.find(v => +v.code === 2002) || {}
      if (owningCount || isHFSApp()) {
        const params = { examId, virtualGoodCode: '2002', mode, config: this.configOptions }
        let url = `/pages/growth/exchange${uni.$u.queryParams(params)}`
        // #ifdef MP-WEIXIN
        url = `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}`)}`
        // #endif
        return uni.navigateTo({ url })
      }
      // #ifdef MP-WEIXIN
      uni.navigateTo({ url: '/pages/me/member' })
      // #endif
    },
    jumpPage(type, options = {}) {
      const { examId, mode, className, examName, scoreS, classRankS, grade, examType, time } = this.options
      const jumpMap = {
        gossipReport: { url: '/pages/examArena/gossipReport', params: { examId, mode, config: this.configOptions }, webview: uni.$u.platform === 'weixin', event: 'ks_ksjjc_Bbgbg' },
        examPk: { url: '/pages/examArena/PK/index', params: { examId, grade, examType, time, config: this.configOptions }, webview: uni.$u.platform === 'weixin', event: 'ks_ksjjc_Bcjpk' },
        cross: { url: '/pages/examArena/cross', params: { examId, className, examName, scoreS, classRankS, config: this.configOptions }, webview: uni.$u.platform === 'weixin', event: 'ks_ksjjc_Bbjcy' },
        simulation: { url: '/pages/examArena/simulation', params: { examId, examName, scoreS, classRankS, config: this.configOptions }, webview: uni.$u.platform === 'weixin', event: 'ks_ksjjc_Bmncj' },
        vip: { url: '/pages/me/member', target: 8, params: { ...options } },
        ticket: { url: '', target: 69, params: { virtualGoodCode: Number.parseFloat(options.code) } },
      }
      const { url = '', target, params, webview, event } = jumpMap[type] || {}
      // #ifdef MP-WEIXIN
      if (!url)
        return uni.showToast({ title: '请到APP端体验', icon: 'none' })
      if (webview)
        return uni.navigateTo({ url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}?examDetail=${encodeURIComponent(JSON.stringify(params))}`)}` })
      // #endif
      // #ifdef H5
      event && this.reportEventParams(event)
      if (!target)
        return uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      if (isHFSApp())
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target, data: params }))
      // #endif
      uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
    },
    handleTicket(item) {
      if (this.studyCoin >= item.studyCoinCost) {
        this.popup.content = `当前学币剩余：${this.studyCoin}，是否花费${item.studyCoinCost}学币购买${item.name}？`
        this.popup.confirmType = 'ticket'
      }
      else if (this.isIos) {
        this.popup.content = '学币不足，是否前往充值？'
        this.popup.confirmType = 'coin'
      }
      else {
        this.popup.content = `学币不足，是否花费￥${item.studyCoinCost} 购买${item.name}？`
        this.popup.confirmType = 'price'
      }
      this.currentTicket = item
      this.popup.show = true
    },
    async handleBuyTicket() {
      this.closePopup()
      const { soldGood = '', specificationKey: specification = '' } = this.currentTicket
      const params = { number: 1, payThrough: 2, soldGood, specification }
      await uni.$http.post(`${this.prefix}/v2/point-mall/exchange/sold-good`, params)
      await this.getMyTickets()
      uni.showToast({ title: '购买成功', icon: 'none' })
    },
    async paymentVIP() {
      this.closePopup()
      const res = await uni.$http.get(`${this.prefix}/v2/payments/ticket-good-list?no=${this.currentTicket.code} `)
      const { goods = [] } = res.data || {}
      const { no, type } = goods[0] || {}
      const params = {
        goodNo: no,
        goodType: type,
        payThrough: this.payThrough,
        studyCoinCount: 0,
        useStudyCoin: 3,
        deviceType: deviceType(),
      }
      this.$refs.payment.paymentVIP(params)
    },
    async paymentSuccess() {
      await this.getMyTickets()
      uni.showToast({ title: '购买成功', icon: 'none' })
    },
    paymentFail(err) {
      return uni.$u.toast(err.errMsg || err)
    },
    handleBuyCoin() {
      this.closePopup()
      // #ifdef MP-WEIXIN
      uni.showToast({ title: '请前往APP购买', icon: 'none' })
      // #endif
      // #ifdef H5
      const isReview = isHFSParent() && this.isIos ? 1 : 0
      const url = `/uni_modules/hfs-fe-uni-module/memberPages/member/member?coin=1&isReview=${isReview}`
      if (isHFSApp())
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${location.origin}${url}`, data: {} }))
      uni.navigateTo({ url })
      // #endif
    },
    closePopup() {
      this.popup.show = false
    },
    reportEvent(event) {
      // #ifdef H5
      if (!event || typeof event !== 'string')
        return
      nativeBridge.callHandler('UMengEvent', event)
      // #endif
    },
    reportEventParams(event) {
      // #ifdef H5
      if (!event || typeof event !== 'string')
        return
      nativeBridge.callHandler('UmengEventParams', event)
      // #endif
    },
    async getExamDetail() {
      const res = await uni.$http.get(`${this.examProxy}/v4/exam/home-page`, { examId: this.options.examId })
      const { list = [] } = res.data || {}
      return list[0] || {}
    },
  },
}
</script>

<style lang="scss" scoped>
.arena {
  min-height: 100vh;
  background-color: #f6f6f6;
  padding: 20rpx 0;
  .type {
    background: #ffffff;
    border-radius: 0 0 24px 24px;
    padding: 40rpx 30rpx;
    margin-bottom: 20rpx;
    &-list {
      display: flex;
      margin-bottom: 20rpx;
      &__item {
        width: calc(100% / 4);
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        .icon {
          width: 104rpx;
          height: 104rpx;
          margin-bottom: 10rpx;
        }
        .text {
          font-size: 26rpx;
          color: #333333;
        }
        .new {
          width: 60rpx;
          height: 28rpx;
          position: absolute;
          top: 0;
          right: 0;
        }
      }
    }
    &-tips {
      position: relative;
      padding: 22rpx 30rpx;
      background: #f8f8f8;
      border-radius: 24rpx;
      &__title {
        width: 68rpx;
        height: 28rpx;
        margin-bottom: 6rpx;
      }
      &__icon {
        width: 84rpx;
        height: 66rpx;
        position: absolute;
        top: 22rpx;
        right: 24rpx;
      }
      &__text {
        position: relative;
        font-size: 24rpx;
        color: #333333;
      }
    }
  }
  .study {
    background: #ffffff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    &-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
    &-coin {
      display: flex;
      align-items: center;
      &__num {
        font-size: 26rpx;
        color: #333333;
      }
      &__buy {
        display: flex;
        align-items: center;
        margin-left: 30rpx;
        font-size: 26rpx;
        color: #ffba1d;
        .icon {
          width: 12rpx;
          height: 16rpx;
          margin-left: 10rpx;
        }
      }
    }
  }
  .list {
    padding: 20rpx 30rpx;
    &-item {
      position: relative;
      padding: 18rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;
      &:last-child {
        margin-bottom: 0;
      }
      &__bg {
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }
      &__left {
        position: relative;
        display: flex;
        align-items: center;
        .ticket {
          position: relative;
          margin-right: 18rpx;
          .bg {
            width: 110rpx;
            height: 118rpx;
          }
          .content {
            width: 100%;
            position: absolute;
            bottom: 10rpx;
            left: 0;
            color: #ffba1d;
            text-align: center;
            z-index: 1;
            .remain {
              font-size: 40rpx;
              font-weight: 500;
              .unit {
                font-size: 18rpx;
                margin-left: 4rpx;
              }
            }
            .name {
              font-size: 22rpx;
            }
          }
          .free {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 30rpx;
            color: #ffba1d;
            white-space: nowrap;
            z-index: 1;
          }
        }
        .message {
          .title {
            display: flex;
            align-items: center;
            font-size: 30rpx;
            font-weight: 500;
            color: #333333;
            margin-bottom: 4rpx;
            .buyed {
              padding: 2rpx 4rpx;
              background: #ffe0e0;
              border: 2rpx solid #ffcdcd;
              border-radius: 4rpx;
              font-size: 22rpx;
              font-weight: 400;
              color: #ff2424;
              margin-left: 4rpx;
            }
          }
          .count {
            font-size: 26rpx;
            color: #939393;
          }
        }
      }
      &__right {
        width: 168rpx;
        height: 58rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background: #fff7e5;
        border-radius: 30rpx;
        font-size: 24rpx;
        font-weight: 500;
        color: #ffba1d;
      }
    }
  }
  .invite {
    padding: 0 30rpx;
    &-img {
      width: 100%;
    }
  }
  .member {
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    box-shadow: 0 -4rpx 16rpx 0 rgba(0, 0, 0, 0.06);
    z-index: 9999;
  }

  &-popup {
    position: relative;
    width: 600rpx;
    background: #ffffff;
    border-radius: 60rpx;
    padding: 48rpx;
    text-align: center;
    &__title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 32rpx;
    }
    &__content {
      font-size: 30rpx;
      color: #333333;
      margin-bottom: 62rpx;
    }
    &__btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      z-index: 1;
      .btn {
        width: 236rpx;
        height: 72rpx;
        font-size: 32rpx;
        font-weight: 500;
        border-radius: 38rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .close {
        color: #939393;
        border: 2rpx solid #939393;
      }
      .confirm {
        color: #ffffff;
        background: linear-gradient(225deg, #ffc749, #ffba1d);
      }
    }
    &__close {
      position: absolute;
      top: 45rpx;
      right: 35rpx;
      z-index: 1;
    }
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 252rpx;
      height: 166rpx;
      opacity: 0.08;
      background: #67fffe;
      border-radius: 50%;
      filter: blur(100rpx);
    }
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      width: 302rpx;
      height: 316rpx;
      opacity: 0.1;
      background: #ffba1d;
      border-radius: 50%;
      filter: blur(100rpx);
    }
  }
}
</style>
