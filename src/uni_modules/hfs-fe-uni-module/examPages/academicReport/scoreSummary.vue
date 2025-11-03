<template>
  <view class="score-summary">
    <u-sticky :custom-nav-height="0">
      <INotifyBar :title="Object.keys(examDetail).length && !hideMember && !visible ? '成为会员' : '仅需5分钟，即可掌握成绩总览！'" :sub-title="visible ? '' : '-仅需5分钟，即可掌握成绩总览！'" />
    </u-sticky>
    <view class="summary">
      <view class="summary-info" :class="{ novip: btnVisible }">
        <view class="message">
          <rich-text v-for="(item, index) in diagnoseInfo" :key="index" :nodes="item" />
          <view>
            {{ `每场考试都是对阶段学习成果的检验，希望${studentInfo.studentName}同学借此机会扬优势、补短板、强弱项，通过好分数【黄金3步法】，做到有考试就有提升！` }}
          </view>
        </view>
        <view v-if="!btnVisible" class="connect">
          <image class="connect-icon" :src="`${resourceUrl}connect.png`" mode="heightFix" />
          <image class="connect-icon" :src="`${resourceUrl}connect.png`" mode="heightFix" />
        </view>
      </view>
      <view v-if="Object.keys(examDetail).length && btnVisible" class="entrance entrance-background" @click="jumpVip('ks_cjzl_cjjd_ljkt_pay')">
        开通会员解锁更全面的考试学情分析
        <view class="entrance-btn">
          立即开通
        </view>
        <view class="connect">
          <image class="connect-icon" :src="`${resourceUrl}connect.png`" mode="heightFix" />
          <image class="connect-icon" :src="`${resourceUrl}connect.png`" mode="heightFix" />
        </view>
      </view>
      <view id="point0" class="summary-card" style="padding: 36rpx 28rpx">
        <ScoreOverview :subject-detail="subjectDetail" :exam-overview="examDetail" :config="config" :user-info="userInfo" />
        <view v-if="!reportBtnVisible" class="connect">
          <image class="connect-icon" :src="`${resourceUrl}connect.png`" mode="heightFix" />
          <image class="connect-icon" :src="`${resourceUrl}connect.png`" mode="heightFix" />
        </view>
      </view>
      <!-- 小程序不展示 -->
      <view v-if="Object.keys(examDetail).length && reportBtnVisible" class="entrance" style="margin: 24rpx 0 12rpx 0;" @click="jumpPage({ examId, examName: examDetail.name })">
        请查看以下分析报告了解详情
        <view style="color: #FFBA1D">
          购买单次报告 >
        </view>
      </view>
      <!-- 我的位置 -->
      <view id="point1" class="summary-card" :style="{ marginTop: !reportBtnVisible ? '26rpx' : '0' }">
        <ScoreInterpretation :mode="examDetail.mode || 0" :scroll-top="scrollTop" :exam-id="examId" :paper-id="paperId" :config="config" :user-info="userInfo" :exam-detail="examDetail" />
        <view v-if="!showInviteEntry" class="connect">
          <image class="connect-icon" :src="`${resourceUrl}connect.png`" mode="heightFix" />
          <image class="connect-icon" :src="`${resourceUrl}connect.png`" mode="heightFix" />
        </view>
      </view>
      <!-- 邀请新同学pk -->
      <image v-if="showInviteEntry" class="invite" :src="`${resourceUrl}invite_new.png`" mode="widthFix" @click="inviteNew" />
      <view id="point2" style="margin-top: 26rpx; position: relative">
        <SameLevelChart ref="sameLevel" :user-info="userInfo" :exam-detail="examDetail" />
      </view>
      <view id="point3" style="margin-top: 26rpx; position: relative">
        <PaperInterpretationAll ref="paperInterpretation" :scroll-top="scrollTop" :exam-id="examId" :subject-detail="{ paperId: '0' }" :config="config" :user-info="userInfo" :exam-detail="examDetail" />
      </view>
      <view id="point5" style="margin-top: 26rpx; position: relative">
        <SubjectAnalysis ref="subAnalysis" :scroll-top="scrollTop" :exam-id="examId" :user-info="userInfo" :config="config" :exam-detail="examDetail" />
      </view>
      <image style="margin-top: 25rpx; width: 100%" :src="`${resourceUrl}tips_bg.png`" mode="widthFix" @click="jumpExamRecord('ks_cjzl_Bcjqs')" />
    </view>
    <Footer v-if="Object.keys(examDetail).length && isHiddenBottomVip !== null" :scroll-top="currentScrollTop" :visible="visible || isHiddenBottomVip" />
    <ShortYearExpiredPopup v-if="showShortYearExpiredPopup" :from="shortFrom" :short-info="shortInfo" @close="showShortYearExpiredPopup = false" />
    <ShortYearExpiringPopup v-if="showShortYearExpiringPopup" img-type="score" :from="shortFrom" :short-info="shortInfo" @close="showShortYearExpiringPopup = false" />
  </view>
</template>

<script>
import INotifyBar from '../../components/i-notifyBar.vue'
import { examSummary } from '../template/examSummary.js'
import shortYearExpiredPopup from '../../components/shortYearExpiredPopup.vue'
import shortYearExpiringPopup from '../../components/shortYearExpiringPopup.vue'
import paperInterpretationAll from './components/paperInterpretationAll.vue'
import exam from './exam.js'
import sameLevelChart from './components/sameLevelChart.vue'
import scoreOverview from './components/scoreOverview.vue'
import subjectAnalysis from './components/subjectAnalysis.vue'
import scoreInterpretation from './components/scoreInterpretation.vue'
import Footer from './components/footer.vue'
import { isHFSApp, isHFSParent, isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { SameLevelChart: sameLevelChart, INotifyBar, ScoreInterpretation: scoreInterpretation, SubjectAnalysis: subjectAnalysis, ScoreOverview: scoreOverview, PaperInterpretationAll: paperInterpretationAll, Footer, ShortYearExpiredPopup: shortYearExpiredPopup, ShortYearExpiringPopup: shortYearExpiringPopup }, // eslint-disable-line vue/no-reserved-component-names
  mixins: [exam],
  props: {
  },
  data() {
    return {
      pageType: 'scoreSummary',
      diagnoseInfo: {},
      paperId: '',
      subjectDetail: {},
    }
  },
  computed: {
    hideMember() {
      const { hideMember = false } = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
      return hideMember
    },
    examId() {
      return this.options.examId || ''
    },
    examTitle() {
      return this.options.examTitle || ''
    },
    btnVisible() {
      let visible = !this.visible
      // #ifdef H5
      visible = visible && isHFSParent()
      // #endif
      return visible
    },
    reportBtnVisible() {
      let wpWeiXin = false
      // #ifdef MP-WEIXIN
      wpWeiXin = true
      // #endif
      return !wpWeiXin && this.btnVisible
    },
    isHFSAppStudent() {
      // #ifdef H5
      if (isHFSStudent()) {
        return true
      }
      // #endif
      return false
    },
    showInviteEntry() {
      return this.isHFSAppStudent && this.userInfo.agent === 1
    },
  },
  methods: {
    jumpVip(eventId) {
      // #ifdef MP-WEIXIN
      uni.navigateTo({ url: '/pages/me/member' })
      // #endif
      // #ifdef H5
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, eventId, data: { eventId } }))
      // #endif
    },
    inviteNew() {
      // #ifdef H5
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${feConfig.operationUrl}/#/uni_modules/hfs-fe-uni-module/pages/new/operation` }))
      // #endif
    },
    jumpPage(params) {
      const url = `/uni_modules/hfs-fe-uni-module/memberPages/member/singleReport${uni.$u.queryParams(params)}`
      // #ifdef H5
      if (isHFSApp())
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${location.origin}${url}`, data: {} }))
      // #endif
      uni.navigateTo({ url })
    },
    async initPage() {
      this.getShortRecommend()
      this.getGuide(this.examDetail)
      this.$refs.subAnalysis.getExamAnalysis(this.examId)
      this.$refs.paperInterpretation.getQuestionSummary()
      this.$refs.sameLevel.getExamLevel(this.examId, this.visible)
      this.paperId = '0'
      this.subjectDetail = { paperId: '0' }
    },
    async getGuide({ level, compare = null }) {
      const response = await uni.$http.get(`${this.prefix}/v4/exam/score-reports/guide?examId=${this.examId}`)
      const guide = response.data || {}
      this.diagnoseInfo = examSummary(this.userInfo.roleType, this.studentInfo.studentName, this.isMember, level, compare, guide, this.config)
    },
  },
}
</script>

<style lang="scss" scoped>
.score-summary {
  background: #f6f6f6;
  position: relative;
  padding-bottom: 100rpx;
  .marquee {
    width: 100%;
  }
  .summary {
    min-height: 100vh;
    margin: 0 28rpx;
    padding: 20rpx 0 50rpx 0;
    .entrance {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 24rpx;
      color: #939393;
      position: relative;
      &-background {
        height: 78rpx;
        background: white;
        padding: 0 28rpx;
        border-radius: 0 0 24rpx 24rpx;
        border-top: #e6e6e6 1rpx solid;
      }
      &-btn {
        width: 146rpx;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 48rpx;
        background: linear-gradient(225deg, #ffa430 0%, #ff7426);
        border-radius: 30rpx;
      }
    }
    &-info {
      position: relative;
      padding: 28rpx 32rpx 32rpx;
      background: linear-gradient(189deg, #ffe8b8, #ffffff 14%);
      border: 2rpx solid #ffffff;
      border-radius: 24rpx;
      .message {
        line-height: 44rpx;
        font-size: 28rpx;
        color: #666666;
      }
    }
    .novip {
      border-radius: 24rpx 24rpx 0 0;
    }
    &-card {
      background: #ffe8b8;
      position: relative;
      margin-top: 26rpx;
      background: white;
      border-radius: 24rpx;
      .title {
        font-size: 30rpx;
        color: #333333;
        display: flex;
        align-items: center;
        &::before {
          margin-right: 12rpx;
          content: '';
          width: 8rpx;
          height: 30rpx;
          background: #ffba1d;
          border-radius: 4rpx;
        }
      }
      &-distribute {
        margin-top: 24rpx;
      }
    }
  }
  .invite {
    width: 100%;
    margin-top: 26rpx;
  }
  .connect {
    display: flex;
    position: absolute;
    z-index: 2;
    bottom: -46rpx;
    left: 20rpx;
    right: 20rpx;
    justify-content: space-between;
    &-icon {
      height: 66rpx;
    }
  }
}
</style>
