<template>
  <view class="home">
    wo shi shou ye
  </view>
</template>

<script>
import { formatNumber } from '@/uni_modules/hfs-fe-uni-plugins'
import { BrowserType } from '@/enums'

export default {
  data() {
    return {
      resourceUrl: `${feConfig.resourceUrl}/images/`,
      memberUrl: 'https://fe-resource.haofenshu.com/member/',
      options: {},
      userInfo: {}, // 用户信息
      popupInfo: {}, // 弹窗信息
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
      },
      timeData: {},
      configControl: {},
      typeList: [
        {
          icon: 'home-exam-icon.png',
          title: '考试',
          subtitle: '看成绩｜纠错题',
          type: 'exam',
          style: { background: 'linear-gradient(180deg,#ffaa2b 0%, #ffc570)' },
        },
        {
          icon: 'home-record-icon.png',
          title: '考试档案',
          subtitle: '知进退｜找突破',
          type: 'record',
          style: { background: 'linear-gradient(180deg,#4ca0ff, #81bcff)' },
        },
        {
          icon: 'home-book-icon.png',
          title: 'AI错题本',
          subtitle: '录错题｜做复习',
          type: 'wrongBook',
          style: { background: 'linear-gradient(180deg,#3dd987 1%, #4ded99 100%)' },
        },
      ],
      actionId: '671b097400004eb0673f4ad8',
      studyList: [
        { title: '课程', type: 'course', icon: 'tools-course.png', show: true },
        { title: '练习', type: 'practice', icon: 'tools-practice.png', show: true },
        { title: '试卷下载', type: 'paperDownload', icon: 'tools-paper.png', show: true },
        { title: '团购狂欢', type: 'group', icon: 'tools-group.png', topIcon: 'tools-hot.png', show: true },
        { title: '0元续会员', type: 'invite', icon: 'tools-invite.png', show: true },
        { title: '玩转好分数', type: 'aboutUs', icon: 'tools-ljwm.png', show: true },
        { title: '我的班级群', type: 'myClassGroup', icon: 'tools-class.png', action: 'entrance_page_click', show: true },
      ],
      profile: {
        grade: '',
      },
      regionStr: '',
      menuButtomWidth: '',
      operationDetail: {},
      degradeInfo: {},
      showUnpaid: false,
      shortInfo: {},
      raiseInfo: {},
      shortFrom: 'homePage',
    }
  },
  computed: {
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
    hasStudent() {
      return this.userInfo.linkedStudent && (this.userInfo.linkedStudent.isVirtual === 2)
    },
    isLogin() {
      return !!this.userInfo.userId
    },
    version() {
      const { grade } = this.profile || {}
      const { regionStr } = this
      const arr = [grade, regionStr].filter(Boolean)
      return arr.join('/')
    },
    noPayOrder() {
      return this.popupInfo.noPayOrder || {}
    },
    discount() {
      const { couponDeduce = 0, studyCoinDeduce = 0 } = this.noPayOrder
      return couponDeduce + studyCoinDeduce
    },
    couponInfo() {
      return this.popupInfo.coupon || {}
    },
  },
  async onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || {}
    this.getMenuButtonInfo()
    this.getOperationDetail()
    this.getConfigControl()
    if (this.isLogin) {
      this.getPersonalSetting()
      this.getShieldConfig()
      this.getMarketingActivity()
    }
    uni.$on('updateDegradePopup', () => {
      this.getDegradeTip(true)
    })
  },
  methods: {
    formatNumber,
    // 获取营销活动（按优先级）
    async getMarketingActivity() {
      const marketingStrategies = [
        {
          name: 'degrade', // 待支付
          fetch: this.getDegradeTip,
          check: () => this.degradeInfo.id,
        },
        {
          name: 'shortToLong', // 短期变长期
          fetch: this.getShortRecommend,
          check: () => this.shortInfo.show,
        },
        {
          name: 'popupInfo', // 广告配置
          fetch: this.getPopupInfo,
          check: () => this.popup.show,
        },
      ]

      for (const strategy of marketingStrategies) {
        await strategy.fetch()
        if (strategy.check())
          break
      }
    },

    // 获取短期变长期推荐
    async getShortRecommend() {
      const res = await uni.$http.get('/v1/be-proxy/v3/strategy/recommend-goods', { from: this.shortFrom }, { custom: { loading: false, error: false } })
      this.shortInfo = res.data || {}

      const { recommendation = {} } = this.shortInfo
      const { memberType = '', stage = '', isFirstLogin = false } = recommendation
      if (memberType === 'year' && (stage === 'expired' || (stage.startsWith('expiring') && isFirstLogin))) {
        const response = await uni.$http.get('/v1/be-proxy/v4/exam/latest-raise-info', {}, { custom: { loading: false, error: false } })
        this.raiseInfo = response.data || {}
      }
    },
    // 获取屏蔽配置
    async getShieldConfig() {
      const res = await uni.$http.get('/v1/be-proxy/v2/config/school/hidden-config')
      this.config = res.data
      uni.setStorageSync('shieldConfig', res.data)
    },
    // 获取运营详情
    async getOperationDetail() {
      if (!this.isLogin || this.userInfo.phoneNumber === '18538365667')
        return
      const { feedToken = '' } = this.userInfo
      const header = { Authorization: `Basic ${feedToken}` }
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/homepage/section-app`, { role: 3 }, { header })
      this.operationDetail = res.data || {}
    },
    getMenuButtonInfo() {
      const res = wx.getMenuButtonBoundingClientRect()
      this.menuButtomWidth = `margin-right: ${res.width + 5}px`
    },
    // 联系客服
    connectCustomer() {
      const options = this.userInfo.isMember ? feConfig.vipCustomer : feConfig.customer
      return wx.openCustomerServiceChat(options)
    },
    // 跳转webview
    jumpWebView(typeParams) {
      wx.reportEvent('home_utils_click', { home_utils: typeParams })
      const { type, path, platform, login, bindStudent, setVersion } = BrowserType[typeParams]
      if (login && !this.isLogin) {
        return uni.navigateTo({ url: feConfig.login })
      }
      if (bindStudent && !this.hasStudent) {
        return uni.navigateTo({ url: '/pages/me/bindStudent' })
      }
      if (setVersion && !this.version) {
        return uni.navigateTo({
          url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}/pages/edit/editInfo`)}`,
          events: {
            profileChange: this.profileChange,
          },
        })
      }
      // 埋点
      const { action = '' } = this.studyList.find(item => item.type === typeParams) || {}
      if (action) {
        const { grade = '', schoolId = '', studentId = '' } = this.studentInfo
        const params = { action, userId: this.userInfo.userId, studentId, grade, schoolId }
        uni.$http.post(`${feConfig.api.znyx}/api/school-operate/action-log`, params, { custom: { loading: false, error: false } })
      }
      const url = platform === 'h5' ? `/pages/browser/browser?url=${encodeURIComponent(path)}&type=${type}` : path
      url && uni.navigateTo({
        url,
        fail: () => this.switchTab(url),
        events: {
          profileChange: this.profileChange,
          regionChange: this.regionChange,
        },
      })
    },
    switchTab(url) {
      uni.switchTab({ url })
    },
    profileChange(data) {
      this.profile = data.profile
    },
    regionChange(data) {
      this.regionStr = data.regionStr
    },
    clickVip() {
      if (!this.isLogin) {
        return uni.navigateTo({ url: feConfig.login })
      }
      if (!this.hasStudent) {
        return this.$u.toast('请绑定学生')
      }
      this.popup.show && this.$set(this.popup, 'show', false)
      return uni.navigateTo({ url: '/pages/me/member' })
    },
    gradeClick() {
      this.jumpWebView('version')
    },
    // 获取个人设置（区域年级教材）
    async getPersonalSetting() {
      const res = await uni.$http.get('/v1/be-proxy/tiku_api_proxy/v1/books/profile', {}, { custom: { error: false } })
      const { book_profile: profile = {}, region = {} } = res.data
      const { province = '', city = '' } = region
      this.profile = profile
      this.regionStr = `${province}${city}`
    },
    // 获取首页工具配置
    async getConfigControl() {
      const res = await uni.$http.get('/v1/be-proxy/v2/config/control')
      const configControl = res.data || {}
      this.configControl = configControl
      const controlMap = {
        group: { show: 'grouponShow', title: 'grouponShowName' },
        invite: { show: 'inviteShow' },
        myClassGroup: { show: 'myClassGroup', title: 'myClassName' },
      }
      for (let i = 0; i < this.studyList.length; i++) {
        const item = this.studyList[i]
        const controlItem = controlMap[item.type] || {}
        if (controlItem.show) {
          item.show = configControl[controlItem.show]
        }
        if (controlItem.title && configControl[controlItem.title]) {
          item.title = configControl[controlItem.title]
        }
      }
      if (this.configControl.myClassGroup)
        BrowserType.myClassGroup.path = this.configControl.myClassGroup
    },
    // 待支付弹窗
    async getDegradeTip(isUseing) {
      const res = await uni.$http.get('/v1/be-proxy/v2/payments/degrade-tip', { cid: 'sy_tc' })
      this.degradeInfo = res.data || {}
      const { isDegrade, degradeType, isNew } = this.degradeInfo
      const isUnpaid = (isDegrade === false && degradeType === 0) || isNew // 待支付类型弹窗
      this.showUnpaid = isUseing ? isUnpaid : !!this.degradeInfo.id
    },
    // 获取当前弹窗类型
    async getPopupInfo() {
      const res = await uni.$http.get('/v1/be-proxy/v2/payments/popup-v2')
      this.popupInfo = res.data
      const { type } = res.data
      type > 1 && (this.popup.show = true)
    },
    countChange(e) {
      this.timeData = e
    },
    countFinish() {
      this.popup.show = false
    },
    continuePay() {
      this.popup.show = false
      return uni.navigateTo({ url: `/uni_modules/hfs-fe-uni-module/memberPages/member/unpaid?id=${this.noPayOrder.id}` })
    },
  },
  onShareAppMessage() {
    return {
      title: '好分数查看你的专属学情报告',
      path: '/pages/index/index',
      imageUrl: `${feConfig.resourceUrl}/images/homeShare.jpg`,
    }
  },
}
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  padding: 30rpx 30rpx 60rpx 30rpx;
  background: #f6f6f6;
  .info {
    display: flex;
    align-items: center;
    &-avatar {
      width: 62rpx;
      height: 62rpx;
    }
    &-area {
      display: flex;
      align-items: center;
      margin-left: 12rpx;
      font-size: 24rpx;
      color: #333333;
    }
  }
  .customer {
    display: flex;
    align-items: center;
    margin-right: 190rpx;
    &-tem {
      display: flex;
      align-items: center;
      &-avatar {
        width: 40rpx;
        height: 40rpx;
        margin-right: 12rpx;
      }
      &-text {
        font-size: 28rpx;
        color: #333333;
      }
    }
  }
  .type {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 23rpx;
    &-item {
      position: relative;
      width: 222rpx;
      height: 250rpx;
      border-radius: 36rpx;
      padding: 28rpx 16rpx 18rpx 24rpx;
      &__content {
        position: absolute;
        top: 24rpx;
        left: 26rpx;
        .title {
          font-size: 36rpx;
          font-weight: bold;
          color: #ffffff;
        }
        .subtitle {
          font-size: 26rpx;
          color: #ffffff;
          margin-bottom: 16rpx;
        }
        .icon {
          width: 104rpx;
          height: 106rpx;
          margin-left: auto;
        }
      }
    }
  }
  .tools {
    width: 100%;
    padding-top: 14rpx;
    background-color: #ffffff;
    border-radius: 20rpx;
    box-shadow:
      0 0 18rpx 0 rgba(240, 241, 244, 0.5),
      0 2rpx 18rpx 2rpx rgba(240, 241, 244, 0.5);
    &-title {
      font-size: 30rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 25rpx;
      display: flex;
      align-items: center;
      .line {
        width: 8rpx;
        height: 26rpx;
        background: #ffba1d;
        margin-right: 14rpx;
      }
    }
    &-list {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      &-item {
        width: 25%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: 14rpx;
        position: relative;
        .icon {
          width: 60rpx;
          height: 60rpx;
          margin-bottom: 10rpx;
        }
        .hot {
          width: 34rpx;
          height: 22rpx;
          position: absolute;
          right: 34rpx;
          top: -8rpx;
        }
        .title {
          font-size: 25rpx;
          color: #282423;
        }
        &:last-child {
          margin-right: auto;
        }
      }
    }
    &-study {
      margin-bottom: 20rpx;
    }
  }
  &-btn {
    position: fixed;
    bottom: 100rpx;
    right: 0;
    width: 150rpx;
  }
  .unpaid,
  .coupon {
    position: relative;
    width: 586rpx;
    background: linear-gradient(180deg, #ffe8bc, #ffffff 23%);
    border: 2rpx solid #ffffff;
    border-radius: 44rpx;
    padding-bottom: 36rpx;
    &-note {
      position: absolute;
      top: -98rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 246rpx;
      height: 192rpx;
    }
    &-order {
      width: 288rpx;
      height: 38rpx;
      margin: 86rpx auto 16rpx;
    }
    &-info {
      position: relative;
      width: 524rpx;
      margin: 0 auto 20rpx;
      &__content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 42rpx 0 0 47rpx;
        .title {
          font-size: 40rpx;
          color: #9b4f00;
          font-weight: bold;
        }
        .desc {
          display: flex;
          align-items: center;
          font-size: 22rpx;
          color: rgba(155, 79, 0, 0.9);
          .active {
            font-size: 32rpx;
            font-weight: bold;
            color: rgba(234, 42, 42, 0.9);
            margin-right: 4rpx;
            &.discount {
              margin: 0 8rpx;
            }
          }
        }
      }
      &__bg {
        width: 524rpx;
        height: 206rpx;
      }
    }
    .countdown {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
      color: #333333;
      margin-bottom: 24rpx;
      &-icon {
        width: 30rpx;
        height: 34rpx;
        margin-right: 12rpx;
      }
      .count {
        display: flex;
        align-items: center;
        margin-right: 8rpx;
        .count-item {
          width: 44rpx;
          height: 36rpx;
          position: relative;
          background: #fff5f5;
          border-radius: 6rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30rpx;
          font-weight: bold;
          color: #ff4545;
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
    &-button {
      width: 514rpx;
      height: 92rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 32rpx;
      font-weight: bold;
      background: linear-gradient(225deg, #ffa430 0%, #ff7426);
      border-radius: 46rpx;
      margin: 0 auto;
    }
    &-close {
      position: absolute;
      right: 0;
      top: -90rpx;
      width: 48rpx;
      height: 48rpx;
    }
  }
  .coupon {
    &-crown {
      position: absolute;
      top: -98rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 246rpx;
      height: 166rpx;
    }
    &-ticket {
      width: 308rpx;
      height: 52rpx;
      margin: 92rpx auto 30rpx;
    }
    &-info {
      position: relative;
      width: 514rpx;
      margin: 0 auto 38rpx;
      &__content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        padding: 0 16rpx;
        z-index: 1;
        .price {
          width: 130rpx;
          color: #ff0000;
          font-size: 24rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          .active {
            font-size: 52rpx;
            font-weight: bold;
          }
        }
        .text {
          flex: 1;
          padding-left: 24rpx;
          &-name {
            color: #764514;
            font-size: 30rpx;
            font-weight: bold;
            margin-bottom: 6rpx;
          }
          &-tips {
            color: #ff3636;
            font-size: 24rpx;
          }
        }
      }
      &__bg {
        width: 514rpx;
        height: 152rpx;
      }
    }
  }
  .renew {
    position: relative;
    &-info {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding-top: 140rpx;
      &__title {
        font-size: 38rpx;
        color: #664422;
        margin-bottom: 19rpx;
        text-align: center;
        padding: 0 30rpx;
      }
      &__desc {
        font-size: 24rpx;
        color: #664422;
        margin-bottom: 34rpx;
        line-height: 34rpx;
        text-align: center;
        padding: 0 30rpx;
      }
      &__content {
        position: relative;
        .content-title {
          position: absolute;
          top: 20rpx;
          left: 70rpx;
          display: flex;
          align-items: center;
          font-size: 25rpx;
          color: #f7e3bb;
          font-weight: 500;
          .vip {
            width: 69rpx;
            height: 30rpx;
            margin-left: 10rpx;
          }
        }
        .content-bg {
          width: 100%;
        }
      }
      &__button {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        .button {
          width: 477rpx;
        }
      }
    }
    &-bg {
      width: 570rpx;
    }
    .close {
      position: absolute;
      left: 50%;
      bottom: -100rpx;
      transform: translateX(-50%);
      width: 52rpx;
      height: 52rpx;
    }
  }
}
</style>
