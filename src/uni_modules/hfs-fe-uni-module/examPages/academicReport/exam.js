import { isHFSApp, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
      options: {},
      userInfo: {},
      config: {},
      examDetail: {},
      scrollTop: 0,
      currentScrollTop: 0,
      shortInfo: {},
      shortFrom: 'examIndex',
      showShortYearExpiredPopup: false,
      showShortYearExpiringPopup: false,
      hasShownExpiringPopup: false,
      isHiddenBottomVip: null,
      pageHeight: 0, // 缓存页面高度
      windowHeight: 0, // 缓存窗口高度
      tabsStyle: {
        lineColor: 'transparent',
        inactiveStyle: {
          color: '#939393',
          fontSize: '28rpx',
          padding: '4rpx 30rpx',
          textAlign: 'center',
        },
        activeStyle: {
          color: '#ffba1d',
          fontWeight: '500',
          fontSize: '28rpx',
          backgroundColor: 'rgba(255,186,29,0.20)',
          padding: '4rpx 30rpx',
          textAlign: 'center',
          borderRadius: '28rpx',
        },
        itemStyle: {
          height: '80rpx',
          padding: 0,
        },
      },
    }
  },
  computed: {
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    beProxy() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/be-proxy'
      // #endif
      return prefix
    },
    isMember() {
      return this.userInfo.isMember || false
    },
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
    visible() {
      return this.examDetail && this.examDetail.visible === 1
    },
  },
  async onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    const shieldConfig = uni.getStorageSync('shieldConfig') || {}
    const examConfigs = (shieldConfig.examConfigs || []).find(v => +v.examId === +options.examId) || {}
    this.config = Object.assign({}, shieldConfig, examConfigs)
    await this.getExamOverview()
    this.initScroll()
  },
  onPageScroll(e) {
    uni.$u.debounce(() => { this.scrollTop = e.scrollTop }, 200)
    this.currentScrollTop = e.scrollTop
    this.checkScrollToBottom(e)
  },
  methods: {
    async initScroll() {
      if (!this.options.point)
        return
      await uni.$u.sleep(500)
      const pageMap = {
        scoreSummary: { point0: this, point1: this, point2: this, point3: this, point4: this.$refs.paperInterpretation, point5: this },
        subjectAnalysis: { point0: this, point1: this, point2: this.$refs.paperInterpretationSingle, point3: this.$refs.paperInterpretationSingle, point4: this.$refs.paperInterpretationSingle },
        loseSummary: { point0: this, point1: this, point2: this, point3: this, point4: this },
      }
      const thisMap = pageMap[this.pageType]
      uni.createSelectorQuery().in(thisMap[this.options.point]).select(`#${this.options.point}`).boundingClientRect((data) => {
        if (!data)
          return
        uni.pageScrollTo({ scrollTop: data.top - uni.$u.getPx('82rpx'), duration: 0 })
      }).exec()
    },
    // 获取学情报告
    async getExamOverview() {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/overview?examId=${this.options.examId}`)
      this.examDetail = res.data || {}
      this.examDetail.difficulty = Number.parseFloat(this.examDetail.difficulty).toFixed(2)
      this.examDetail.scoreRate = (this.examDetail.scoreRate * 100).toFixed(0)
      this.initPage()
      // #ifdef H5
      isHFSApp() && nativeBridge.callHandler('commitPointsTask', JSON.stringify({ taskId: 33 }))
      // #endif
    },
    jumpExamRecord(event) {
      this.reportEventParams(event)
      uni.redirectTo({ url: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/index' })
    },
    reportEventParams(event) {
      // #ifdef H5
      if (!event || typeof event !== 'string')
        return
      nativeBridge.callHandler('UmengEventParams', event)
      // #endif
    },
    // 通用的获取短期推荐方法
    async getShortRecommend() {
      const res = await uni.$http.get(`${this.beProxy}/v3/strategy/recommend-goods`, { from: this.shortFrom }, { custom: { loading: false, error: false } })
      this.shortInfo = res.data || {}

      const { recommendation = {}, show = false, showed = false } = this.shortInfo
      const { memberType = '', stage = '' } = recommendation
      this.isHiddenBottomVip = show || showed

      if (memberType === 'year' && stage === 'expired') {
        this.showShortYearExpiredPopup = true
      }
    },
    // 初始化页面高度缓存
    async initPageHeight() {
      // 获取并缓存窗口高度
      const systemInfo = uni.getSystemInfoSync()
      this.windowHeight = systemInfo.windowHeight

      // 根据页面类型选择选择器
      const selectorMap = {
        scoreSummary: '.score-summary',
        subjectAnalysis: '.analysis',
        loseSummary: '.summary',
      }

      const selector = selectorMap[this.pageType]
      if (!selector)
        return

      // 查询并缓存页面高度
      uni.createSelectorQuery().in(this).select(selector).boundingClientRect((data) => {
        if (data)
          this.pageHeight = data.height
      }).exec()
    },
    // 检测是否滚动到底部
    checkScrollToBottom(e) {
      // 提前判断，避免不必要的计算
      if (this.hasShownExpiringPopup || !this.shouldShowExpiringPopup())
        return

      const scrollTop = e.scrollTop

      // 如果还没缓存页面高度，且滚动距离超过 300，则初始化缓存
      if (!this.pageHeight && scrollTop > 300) {
        this.initPageHeight()
        return
      }

      // 使用缓存值计算距离底部的距离
      if (this.pageHeight) {
        const distanceToBottom = this.pageHeight - scrollTop - this.windowHeight

        // 距离底部小于 100px 时显示弹窗
        if (distanceToBottom < 100) {
          this.hasShownExpiringPopup = true
          this.showShortYearExpiringPopup = true
        }
      }
    },
    // 判断是否应该显示临期弹窗
    shouldShowExpiringPopup() {
      const { recommendation = {} } = this.shortInfo
      const { memberType = '', stage = '' } = recommendation
      return memberType === 'year' && stage && stage.startsWith('expiring')
    },
  },
}
