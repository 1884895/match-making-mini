<template>
  <view class="academic">
    <u-sticky custom-nav-height="0">
      <view class="academic-tabs">
        <ITabs :list="subjectList" @change="subjectChange" />
      </view>
    </u-sticky>
    <view class="academic-main">
      <view class="academic-main_content">
        <ScoreInterpretation v-if="current === 0" :scroll-top="scrollTop" :exam-id="examId" :subject-detail="subjectDetail" :config="config" :user-info="userInfo" :exam-detail="examDetail" :is-mock="true" />
        <PaperInterpretation v-if="current === 1" :scroll-top="scrollTop" :exam-id="examId" :subject-detail="subjectDetail" :config="config" :user-info="userInfo" :exam-detail="examDetail" :is-mock="true" />
        <LostSummary v-if="current === 2" :scroll-top="scrollTop" :exam-id="examId" :subject-detail="subjectDetail" :config="config" :exam-detail="examDetail" :user-info="userInfo" :is-mock="true" />
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
  </view>
</template>

<script>
import iTabs from '../../components/i-tabs.vue'
import scoreInterpretation from './components/scoreInterpretation.vue'
import paperInterpretation from './components/paperInterpretation.vue'
import lostSummary from './components/lostSummary.vue'

export default {
  components: { ScoreInterpretation: scoreInterpretation, PaperInterpretation: paperInterpretation, LostSummary: lostSummary, ITabs: iTabs },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam',
      examId: '1699865',
      subjectDetail: {},
      examDetail: {},
      userInfo: {},
      scrollTop: 0,
      topHeight: 0,
      subjectList: [],
      current: '', // 0 成绩解读， 1 试卷解读  2 失分总结
      config: { classRank: 2, gradeRank: 2, stageRank: 2, classAvg: 2, classDefeat: 2, gradeAvg: 2, gradeDefeat: 2, liankaoReportAvg: 2, liankaoReportRank: 2, liankaoReportMax: 2, liankaoReportStage: 2, xbAnswer: 2, scoreStage: 2, score: 2, scoreSingle: 2, cross: 2, simulation: 2, examPk: 2, gossipReport: 2, liankaoReport: 2, examAnalysisReport: 2, paperInspection: 2, scoreComment: 2, rankCount: 2, paperPicScore: 2, questionScore: 2, paperPic: 2, answerPic: 2, parentPay: 2, studentAd: 2, parentAd: 2, parentThirdAd: 2, studentThirdAd: 2, grade: '高三', nonvipClassRank: 2, nonvipGradeRank: 0, scoreType: 2, rankType: 2, rankDegree: 2, examPK: 2, examConfigs: [], vipCacheTime: 60, noVipCacheTime: 600, examHiddenCount: 0 },
    }
  },
  onPageScroll(e) {
    uni.$u.debounce(() => { this.scrollTop = e.scrollTop }, 200)
  },
  onLoad(options) {
    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    const { current = 0 } = options
    this.current = Number.parseFloat(current)
    this.getExamOverview()
  },
  methods: {
    setCurrent(index) {
      this.current = index
    },
    subjectChange({ paperId = '' }) {
      this.subjectDetail = this.subjectList.find(item => item.paperId === paperId)
    },
    // 获取学情报告
    async getExamOverview() {
      const res = await uni.$u.http.get(`${this.resourceUrl}/mock/overview/${this.examId}.json`)
      const { papers = [] } = res.data.data
      this.examDetail = res.data.data
      this.subjectList = papers.length > 1 ? [{ subject: '全科', paperId: '0' }, ...papers] : papers
      this.subjectChange({ paperId: this.subjectList[0].paperId })
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
  &-tabs {
    background-color: #ffffff;
  }
  &-overview {
    margin: 24rpx 28rpx;
    padding: 20rpx 24rpx 24rpx 24rpx;
    background-color: #ffffff;
    border-radius: 24rpx;
  }
  &-main {
    margin: 24rpx 28rpx 0 28rpx;
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
}
</style>
