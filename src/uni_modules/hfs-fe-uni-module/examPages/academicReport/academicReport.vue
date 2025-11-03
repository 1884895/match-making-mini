<template>
  <view class="academic">
    <!-- #if MP-WEIXIN -->
    <u-navbar title="学情报告" auto-back placeholder :bg-color="bgColor" left-icon-color="#fff" :title-style="{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }" />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <u-gap height="30rpx" bg-color="transparent" />
    <!-- #endif -->
    <image class="academic-bg" src="../static/academicReport/academic_bg.png" mode="widthFix" />
    <image class="academic-text" src="../static/academicReport/academic_text.png" mode="widthFix" />
    <view class="academic-detail">
      <view v-if="examDetail.name" class="academic-detail_name">
        <image class="icon" src="../static/academicReport/exam-icon.png" />
        <text class="text">
          {{ examDetail.name }}
        </text>
      </view>
      <view v-if="userInfo.roleType === 1" class="academic-detail_greet">
        {{ studentInfo.studentName.substring(0, 1) }}同学，你好！
      </view>
      <view v-if="userInfo.roleType === 2" class="academic-detail_greet">
        尊敬的家长，您好！
      </view>
      <view class="academic-detail_content">
        <image class="triangle" src="../static/academicReport/triangle.png" />
        <view class="message">
          <rich-text v-for="(item, index) in diagnoseInfo" :key="index" :nodes="item" />
        </view>
      </view>
      <view class="academic-detail_purchase">
        <view class="text">
          请查看以下分析报告了解详情
        </view>
        <view v-if="isHFSAppParent && examDetail.visible !== 1" class="purchase" @click="jumpPage('report', { examId, examName: examDetail.name })">
          <text class="purchase-text">
            购买单次报告
          </text>
          <image class="purchase-icon" src="../static/academicReport/right.png" />
        </view>
      </view>
      <u-line color="#ededed" />
    </view>
    <view class="academic-sticky" />
    <u-sticky :offset-top="topHeight" custom-nav-height="0">
      <view class="academic-tabs">
        <ITabs :list="subjectList" @change="subjectChange" />
      </view>
    </u-sticky>
    <view class="academic-overview">
      <ScoreOverview :subject-detail="subjectDetail" :exam-overview="examDetail" :user-info="userInfo" :config="config" />
    </view>
    <view class="academic-main">
      <view class="academic-main_content">
        <template v-if="examDetail.visible === 1">
          <ScoreInterpretation v-if="current === 0" :mode="examDetail.mode || 0" :scroll-top="scrollTop" :exam-id="examId" :paper-id="subjectDetail.paperId" :config="config" :user-info="userInfo" :exam-detail="examDetail" @jump-page="jumpPage" @report-event="reportEvent" />
          <PaperInterpretation v-if="current === 1" :scroll-top="scrollTop" :exam-id="examId" :subject-detail="subjectDetail" :config="config" :user-info="userInfo" :exam-detail="examDetail" @jump-page="jumpPage" @report-event="reportEvent" />
          <LostSummary v-if="current === 2" :analysis-status="analysisStatus" :scroll-top="scrollTop" :exam-id="examId" :subject-detail="subjectDetail" :config="config" :user-info="userInfo" :exam-detail="examDetail" @jump-page="jumpPage" @report-event="reportEvent" />
        </template>
        <template v-else>
          <NovipReport :current="current" :user-info="userInfo" @report-event="reportEvent" />
        </template>
      </view>
      <view class="academic-main_btns">
        <view v-if="current === 0" class="item" @click="setCurrent(1)">
          下一项《试卷解读》
        </view>
        <view v-if="current === 1" class="middle">
          <view class="item" @click="setCurrent(0)">
            上一项《成绩解读》
          </view>
          <view class="item" @click="setCurrent(2)">
            下一项《失分总结》
          </view>
        </view>
        <view v-if="current === 2" class="item" @click="setCurrent(1)">
          上一项《试卷解读》
        </view>
      </view>
    </view>
    <IGuideStep v-if="showGuideStep" ref="IGuideStep" v-slot="{ props = {} }" :step="step" @done="getGuideStep">
      <view class="academic-step" :style="props.ext && props.ext.style">
        <image class="academic-step__img" :src="props.ext && props.ext.image" mode="widthFix" />
        <view class="academic-step__next" :style="props.ext && props.ext.nextStyle" @click="next">
          {{ props.next }}
        </view>
      </view>
    </IGuideStep>
  </view>
</template>

<script>
import iTabs from '../../components/i-tabs.vue'
import { examSummary } from '../template/examSummary.js'
import IGuideStep from '../../components/i-guideStep.vue'
import scoreInterpretation from './components/scoreInterpretation.vue'
import paperInterpretation from './components/paperInterpretation.vue'
import lostSummary from './components/lostSummary.vue'
import scoreOverview from './components/scoreOverview.vue'
import novipReport from './components/novipReport.vue'
import { isHFSApp, isHFSParent, isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { ITabs: iTabs, ScoreInterpretation: scoreInterpretation, PaperInterpretation: paperInterpretation, LostSummary: lostSummary, NovipReport: novipReport, ScoreOverview: scoreOverview, IGuideStep },
  data() {
    return {
      userInfo: {},
      config: {},
      subjectList: [],
      subjectDetail: {},
      diagnoseInfo: {},
      current: 0, // 0 成绩解读， 1 试卷解读  2 失分总结
      analysisStatus: 0,
      scrollTop: 0,
      topHeight: 0,
      examDetail: {},
      examId: '',
      bgColor: 'transparent',
      step: {
        name: 'exam_academic_step',
        guideList: [
          {
            el: '.academic-tabs',
            next: '下一步',
            ext: {
              style: 'width: 420rpx;height: 202rpx;top: calc(100% + 18rpx);left: 146rpx;',
              image: '../static/academicReport/step_1.png',
              nextStyle: 'top: calc(100% + 40rpx);right: 0',
            },
            padding: 5,
          },
          {
            el: '.academic-main_btns',
            next: '完成',
            ext: {
              style: 'width: 620rpx;height: 282rpx;bottom: calc(100% + 18rpx);left: 42rpx;',
              image: '../static/academicReport/step_2.png',
              nextStyle: 'bottom: 10rpx;right: 0',
            },
            fixed: true,
            padding: 5,
          },
        ],
      },
      showGuideStep: false,
      pageScrollTop: 0,
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
    isMember() {
      return this.userInfo.isMember || false
    },
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
    showVip() {
      // #ifdef H5
      if (isHFSStudent()) {
        return false
      }
      // #endif
      return true
    },
    isHFSAppParent() {
      // #ifdef H5
      if (isHFSParent()) {
        return true
      }
      // #endif
      return false
    },
  },
  onPageScroll(e) {
    uni.$u.debounce(() => { this.scrollTop = e.scrollTop }, 200)
    this.bgColor = e.scrollTop > 0 ? '#FFA822' : 'transparent'
  },
  onLoad(options) {
    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    const shieldConfig = uni.getStorageSync('shieldConfig')
    const examConfigs = shieldConfig.examConfigs.find(v => +v.examId === +options.examId) || {}
    this.config = Object.assign({}, shieldConfig, examConfigs)
    const { examId = '', current = 0, analysisStatus = 0 } = options
    this.examId = examId
    this.current = Number.parseFloat(current)
    this.analysisStatus = Number.parseFloat(analysisStatus)
    this.reportEvent('ks_xqbg_Pxqbg')
    // #ifdef MP-WEIXIN
    this.getTopHeight()
    // #endif
    this.getExamOverview()
  },
  methods: {
    getGuideStep() {
      const step = uni.getStorageSync(this.step.name) || false
      if (!step)
        return (this.showGuideStep = true)
      this.showGuideStep = false
      // #ifdef H5
      isHFSApp() && nativeBridge.callHandler('commitPointsTask', JSON.stringify({ taskId: 33 }))
      // #endif
    },
    getScrollTop() {
      const query = uni.createSelectorQuery().in(this)
      query.select('.academic-sticky').boundingClientRect((res) => {
        let offset = 0
        // #ifdef MP-WEIXIN
        offset = this.topHeight
        // #endif
        this.pageScrollTop = res.top - offset + this.scrollTop
      }).exec()
    },
    getTopHeight() {
      uni.getSystemInfo({
        success: (e) => {
          this.topHeight = e.statusBarHeight + 44
        },
      })
    },
    subjectChange({ paperId = '' }) {
      this.subjectDetail = this.subjectList.find(item => item.paperId === paperId)
    },
    async setCurrent(index) {
      const { visible = '' } = this.examDetail
      if (visible !== 1) {
        uni.showLoading({ title: '加载中', mask: true })
        await uni.$u.sleep(500)
        uni.hideLoading()
      }
      this.current = index
      uni.pageScrollTo({ scrollTop: this.pageScrollTop, duration: 0 })
    },
    // 获取学情报告
    async getExamOverview() {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/overview?examId=${this.examId}`)
      const { papers = [] } = res.data
      this.examDetail = res.data
      this.examDetail.difficulty = Number.parseFloat(this.examDetail.difficulty).toFixed(2)
      this.subjectList = papers.length > 1 ? [{ subject: '全科', paperId: '0' }, ...papers] : papers
      this.subjectChange({ paperId: this.subjectList[0].paperId })
      this.getGuide(res.data)
    },
    async getGuide({ level, compare = null }) {
      const response = await uni.$http.get(`${this.prefix}/v4/exam/score-reports/guide?examId=${this.examId}`)
      const guide = response.data || {}
      this.diagnoseInfo = examSummary(this.userInfo.roleType, this.studentInfo.studentName, this.isMember, level, compare, guide, this.config)
      this.getGuideStep()
      await uni.$u.sleep(500)
      this.getScrollTop()
    },
    jumpPage(type, params = {}) {
      const jumpMap = {
        report: { url: '', target: 61, event: 'ks_xqbg_Bgmbg' },
        errorQuestion: { url: '/improvePages/improve', target: 68 },
        vip: { url: '/pages/me/member', target: 8, params: {} },
      }
      const { url = '', target, event } = jumpMap[type] || {}
      event && this.reportEvent(event)
      // #ifdef MP-WEIXIN
      if (!url)
        return uni.showToast({ title: '请到APP端体验', icon: 'none' })
      uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      // #endif
      // #ifdef H5
      if (!target)
        return uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target, data: params }))
      // #endif
    },
    next() {
      this.$refs.IGuideStep.next()
    },
    reportEvent(event) {
      // #ifdef H5
      if (!event || typeof event !== 'string')
        return
      nativeBridge.callHandler('UMengEvent', event)
      // #endif
    },
  },
}
</script>

<style lang="scss" scoped>
.academic {
  position: relative;
  min-height: 100vh;
  background-color: #f6f6f6;
  padding-bottom: 80px;
  &-bg {
    width: 750rpx;
    height: 336rpx;
    position: absolute;
    left: 0;
    top: 0;
  }
  &-text {
    position: relative;
    margin: 0 0 16rpx 52rpx;
    padding-top: 16rpx;
    width: 414rpx;
    z-index: 1;
  }
  &-detail {
    position: relative;
    background: #ffffff;
    border-radius: 24rpx 24rpx 0 0;
    border-bottom: 1rpx solid #ededed;
    overflow: hidden;
    z-index: 1;
    &_name {
      display: flex;
      align-items: center;
      margin: 20rpx 30rpx 0 30rpx;
      .icon {
        width: 18rpx;
        height: 24rpx;
        margin-right: 10rpx;
      }
      .text {
        font-size: 26rpx;
        color: #939393;
      }
    }
    &_greet {
      margin: 12rpx 30rpx 4rpx 30rpx;
      font-size: 34rpx;
      color: #333333;
      font-weight: 500;
    }
    &_content {
      margin: 0 30rpx 20rpx 30rpx;
      .triangle {
        width: 40rpx;
        height: 16rpx;
        margin-left: 40rpx;
      }
      .message {
        padding: 20rpx 30rpx;
        background: #f8f8f8;
        font-size: 28rpx;
        color: #333333;
        line-height: 44rpx;
      }
    }
    &_purchase {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 30rpx 20rpx 30rpx;
      .text {
        font-size: 26rpx;
        color: #939393;
      }
      .purchase {
        display: flex;
        align-items: center;
        &-text {
          font-size: 26rpx;
          color: #ffba1d;
        }
        &-icon {
          width: 12rpx;
          height: 16rpx;
          margin-left: 10rpx;
        }
      }
    }
  }
  &-tabs {
    background-color: #ffffff;
    padding: 0 30rpx;
  }
  &-overview {
    margin: 24rpx 28rpx;
    padding: 10rpx 24rpx 24rpx 24rpx;
    background-color: #ffffff;
    border-radius: 24rpx;
  }
  &-main {
    padding: 0 28rpx;
    &_content {
      min-height: 60vh;
    }
    &_btns {
      width: 100%;
      display: flex;
      justify-content: center;
      position: fixed;
      bottom: 40rpx;
      bottom: calc(env(safe-area-inset-bottom) + 40rpx);
      left: 0;
      z-index: 999;
      padding: 0 30rpx;
      .middle {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
      .item {
        padding: 18rpx 10rpx 14rpx 22rpx;
        background: linear-gradient(225deg, #ffc749, #ffba1d);
        border-radius: 36rpx;
        box-shadow: 0 0 12rpx 0 rgba(255, 169, 50, 0.2);
        font-size: 30rpx;
        color: #ffffff;
      }
    }
  }
  &-step {
    position: absolute;
    &__img {
      width: 100%;
    }
    &__next {
      position: absolute;
      width: 170rpx;
      height: 66rpx;
      font-size: 30rpx;
      color: #ffffff;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(315deg, #ff6600, #ffa400);
      border-radius: 38rpx;
    }
  }
}
</style>
