<template>
  <view class="summary">
    <u-sticky :custom-nav-height="0">
      <INotifyBar :title="Object.keys(raiseInfo).length && !visible ? '成为会员' : '仅需3分钟，即可掌握单科失分情况！' " :sub-title="visible ? '' : ' - 仅需3分钟，即可掌握单科失分情况！'" />
    </u-sticky>
    <view class="summary-content">
      <view v-if="raiseInfo.classBaseRaiseRank || raiseInfo.baseRaiseRank || raiseInfo.classHardRaiseRank || raiseInfo.hardRaiseRank" id="point0" class="summary-content__item improve">
        <view class="improve-title">
          <image class="improve-title__icon" :src="`${resourceUrl}quanke.png`" />
          <view class="improve-title__text">全科统计</view>
        </view>
        <view v-if="raiseInfo.classBaseRaiseRank || raiseInfo.baseRaiseRank" class="improve-item">
          <view class="title">
            基础可提升空间<image class="question" :src="`${resourceIndex}question.png`" mode="widthFix" @click="showPopup('base')" />
          </view>
          <view class="rank">
            <view class="rank-num">
              <view class="active">
                <IMask :show="visible">
                  {{ raiseInfo.baseRaiseScore }}
                </IMask>
              </view>分
            </view>
            <view class="rank-list">
              <view class="rank-list__item">
                <view class="text">
                  班级排名提升
                </view>
                <view class="num">
                  <view class="active">
                    <IMask :show="visible">
                      {{ `${raiseInfo.classBaseRaiseRank}`.replace('**', '会员') }}
                    </IMask>
                  </view>位
                </view>
                <view class="progress" :style="{ width: `${raiseInfo.classBaseRaiseRank / sectionMax * 32}rpx`, minWidth: '32rpx' }" />
              </view>
              <view class="rank-list__item">
                <view class="text">
                  年级排名提升
                </view>
                <view class="num">
                  <view class="active">
                    <IMask :show="visible">
                      {{ `${raiseInfo.baseRaiseRank}`.replace('**', '会员') }}
                    </IMask>
                  </view>位
                </view>
                <view class="progress" :style="{ width: `${raiseInfo.baseRaiseRank / sectionMax * 32}rpx`, minWidth: '32rpx' }" />
              </view>
            </view>
          </view>
        </view>
        <view v-if="raiseInfo.classHardRaiseRank || raiseInfo.hardRaiseRank" class="improve-item">
          <view class="title">
            拔高可提升空间<image class="question" :src="`${resourceIndex}question.png`" mode="widthFix" @click="showPopup('hard')" />
          </view>
          <view class="rank">
            <view class="rank-num">
              <view class="active">
                <IMask :show="visible">
                  {{ raiseInfo.hardRaiseScore }}
                </IMask>
              </view>分
            </view>
            <view class="rank-list">
              <view class="rank-list__item">
                <view class="text">
                  班级排名提升
                </view>
                <view class="num">
                  <view class="active">
                    <IMask :show="visible">
                      {{ `${raiseInfo.classHardRaiseRank}`.replace('**', '会员') }}
                    </IMask>
                  </view>位
                </view>
                <view class="progress" :style="{ width: `${raiseInfo.classHardRaiseRank / sectionMax * 32}rpx`, minWidth: '32rpx' }" />
              </view>
              <view class="rank-list__item">
                <view class="text">
                  年级排名提升
                </view>
                <view class="num">
                  <view class="active">
                    <IMask :show="visible">
                      {{ `${raiseInfo.hardRaiseRank}`.replace('**', '会员') }}
                    </IMask>
                  </view>位
                </view>
                <view class="progress" :style="{ width: `${raiseInfo.hardRaiseRank / sectionMax * 32}rpx`, minWidth: '32rpx' }" />
              </view>
            </view>
          </view>
        </view>
        <view class="connect">
          <image class="icon" :src="`${resourceUrl}connect.png`" />
          <image class="icon" :src="`${resourceUrl}connect.png`" />
        </view>
      </view>
      <view class="summary-content__shim" />
      <u-sticky :custom-nav-height="0">
        <view class="summary-content__tabs">
          <u-tabs :list="subjectList" key-name="subject" :line-color="tabsStyle.lineColor" :inactive-style="tabsStyle.inactiveStyle" :active-style="tabsStyle.activeStyle" :item-style="tabsStyle.itemStyle" @change="subjectChange" />
        </view>
      </u-sticky>
      <u-line color="#f6f6f6" :hairline="false" />
      <view v-if="explain.classBaseRaiseRank || explain.baseRaiseRank || explain.classHardRaiseRank || explain.hardRaiseRank" id="point4" class="summary-content__space">
        <view class="item-title">
          提升空间
        </view>
        <view class="item-sub">{{ subjectDetail.subject }}学科</view>
        <view class="space-list">
          <view v-if="explain.classBaseRaiseRank || explain.baseRaiseRank" class="space-list__item">
            <view class="score">
              <view class="active">
                <IMask :show="visible">
                  {{ explain.baseRaiseScore }}
                </IMask>
              </view>分
            </view>
            <view class="text">
              基础可提升空间
            </view>
            <view class="rank">
              <view class="rank-item">
                <view class="rank-item__num">
                  <IMask :show="visible">
                    {{ explain.classBaseRaiseRank }}位
                  </IMask>
                </view>
                <view class="rank-item__text">
                  班级排名提升
                </view>
              </view>
              <view class="rank-item">
                <view class="rank-item__num">
                  <IMask :show="visible">
                    {{ explain.baseRaiseRank }}位
                  </IMask>
                </view>
                <view class="rank-item__text">
                  年级排名提升
                </view>
              </view>
            </view>
          </view>
          <view v-if="explain.classHardRaiseRank || explain.hardRaiseRank" class="space-list__item">
            <view class="score">
              <view class="active">
                <IMask :show="visible">
                  {{ explain.hardRaiseScore }}
                </IMask>
              </view>分
            </view>
            <view class="text">
              拔高可提升空间
            </view>
            <view class="rank">
              <view class="rank-item">
                <view class="rank-item__num">
                  <IMask :show="visible">
                    {{ explain.classHardRaiseRank }}位
                  </IMask>
                </view>
                <view class="rank-item__text">
                  班级排名提升
                </view>
              </view>
              <view class="rank-item">
                <view class="rank-item__num">
                  <IMask :show="visible">
                    {{ explain.hardRaiseRank }}位
                  </IMask>
                </view>
                <view class="rank-item__text">
                  年级排名提升
                </view>
              </view>
            </view>
          </view>
        </view>
        <UnlockMember title="解锁该学科提升空间" :visible="visible" event-id="ks_sfzj_tskj_ljkt_pay" />
        <view class="connect">
          <image class="icon" :src="`${resourceUrl}connect.png`" />
          <image class="icon" :src="`${resourceUrl}connect.png`" />
        </view>
      </view>
      <view id="point1" class="summary-content__item distribution" :class="{ raidus: explain.classBaseRaiseRank || explain.baseRaiseRank || explain.classHardRaiseRank || explain.hardRaiseRank }">
        <view class="distribution-content">
          <view class="item-title">
            失分分布
          </view>
          <view class="distribution-content__list">
            <view v-for="(item, index) in chartDataList" :key="index" class="list-item">
              <template v-if="visible || item.score >= 0">
                <view class="chart">
                  <qiun-data-charts :canvas2d="true" type="arcbar" :opts="{ ...arcbarOpts, title: { ...arcbarOpts.title, name: item.ratio }, subtitle: { ...arcbarOpts.subtitle, name: item.name } }" :chart-data="item.chartData" />
                </view>
                <view v-if="showScore" class="score">
                  丢<text class="active">
                    {{ item.myLost }}
                  </text>分/共<text class="total">
                    {{ item.score }}
                  </text>分
                </view>
                <view v-else class="score">
                  丢<text class="active">
                    {{ item.ratio }}
                  </text>分
                </view>
              </template>
              <template v-else>
                <image class="pic" :src="item.pic" mode="widthFix" />
              </template>
            </view>
          </view>
          <AnalyzeTemplate :custom="true">
            <view class="item-text">
              <IMask :show="visible" :nodes="distributionText" />
            </view>
          </AnalyzeTemplate>
          <UnlockMember title="解锁该学科失分分布情况" :visible="visible" event-id="ks_sfzj_sffb_ljkt_pay" />
        </view>
        <view class="connect">
          <image class="icon" :src="`${resourceUrl}connect.png`" />
          <image class="icon" :src="`${resourceUrl}connect.png`" />
        </view>
      </view>
      <view id="point2" class="summary-content__item contrast">
        <view class="item-title">
          失分对比
        </view>
        <view class="chart">
          <view v-if="!visible" class="chart-mask" :style="[maskStyle]">
            <image class="chart-mask__pic" :src="`${resourceUrl}mix_mask.png`" />
          </view>
          <qiun-data-charts :canvas2d="true" type="mix" :opts="mixOpts" :in-scroll-view="true" :page-scroll-top="scrollTop" :chart-data="mixData" @complete="mixComplete" />
        </view>
        <AnalyzeTemplate :custom="true">
          <view class="item-text">
            <IMask :show="visible" :nodes="contrastText" />
          </view>
        </AnalyzeTemplate>
        <UnlockMember title="解锁该学科失分对比" :visible="visible" event-id="ks_sfzj_sfdb_ljkt_pay" />
        <view class="connect">
          <image class="icon" :src="`${resourceUrl}connect.png`" />
          <image class="icon" :src="`${resourceUrl}connect.png`" />
        </view>
      </view>
      <view id="point3" class="summary-content__item analysis">
        <view class="item-title">
          错题归类分析
        </view>
        <view class="analysis-subtitle">
          <view class="text">
            全错
          </view>
          <view class="text">
            部分错
          </view>
        </view>
        <view class="analysis-list">
          <template v-for="(item, index) in questionsList">
            <view v-if="item.list && item.list.length" :key="index" class="analysis-list__item" :class="{ active: item.level === 1 }">
              <view class="title">
                <text>{{ item.title }}</text>
                <view class="title-star">
                  <view v-if="item.level === 1" class="title-star__icon">
                    <image class="icon" :src="`${resourceUrl}star_gray.png`" mode="widthFix" />
                  </view>
                  <template v-else>
                    <view class="title-star__icon">
                      <image v-for="ix in item.level" :key="ix" class="icon" :src="`${resourceUrl}star_light.png`" mode="widthFix" />
                    </view>
                    <view class="title-star__icon">
                      <image v-for="ix in 5 - item.level" :key="ix" class="icon" :src="`${resourceUrl}star_dark.png`" mode="widthFix" />
                    </view>
                  </template>
                </view>
                <image class="title-arrow" :src="`${resourceUrl}arrow_right.png`" mode="widthFix" />
              </view>
              <view class="content">
                <view v-for="(topic, topicIndex) in item.list" :key="topicIndex" class="content-topic" :class="{ all: topic.score === 0, some: topic.score > 0 }">
                  <IMask :show="visible">
                    {{ topic.name }}
                  </IMask>
                </view>
                <view class="content-desc">
                  {{ item.desc }}
                </view>
              </view>
            </view>
          </template>
        </view>
        <UnlockMember title="解锁该学科错题分析" :visible="visible" event-id="ks_sfzj_ctfx_ljkt_pay" />
      </view>
      <view v-if="lostQuestionSummary.wrongCount" class="summary-content__correct" @click="toWrong">
        <image class="icon" :src="`${resourceUrl}wrong.png`" mode="widthFix" />
        <view class="text">
          <view class="text-title">
            {{ subjectDetail.subject }}考试错题<text class="active">
              {{ lostQuestionSummary.wrongCount }}
            </text>题
          </view>
          <view class="text-desc">
            马上去订正错题
          </view>
        </view>
        <u-icon name="arrow-right" size="30rpx" color="#333333" bold />
      </view>
    </view>
    <Footer v-if="Object.keys(examDetail).length && isHiddenBottomVip !== null" type="lose" :scroll-top="currentScrollTop" :visible="visible || isHiddenBottomVip" />
    <ShortYearExpiredPopup v-if="showShortYearExpiredPopup" :from="shortFrom" :short-info="shortInfo" @close="showShortYearExpiredPopup = false" />
    <ShortYearExpiringPopup v-if="showShortYearExpiringPopup" img-type="lose" :from="shortFrom" :short-info="shortInfo" @close="showShortYearExpiringPopup = false" />
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" bg-color="transparent" @touchmove.stop.prevent>
      <view class="summary-popup">
        <view class="summary-popup__title">
          温馨提示
        </view>
        <view class="summary-popup__content">
          <rich-text :nodes="popup.desc[popup.type]" />
        </view>
        <view class="summary-popup__btn" @click="closePopup">
          我知道了
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import INotifyBar from '../../components/i-notifyBar.vue'
import IMask from '../../components/i-mask.vue'
import ShortYearExpiredPopup from '../../components/shortYearExpiredPopup.vue'
import ShortYearExpiringPopup from '../../components/shortYearExpiringPopup.vue'
import { losePointsContrast, losePointsDistribution } from '../template/loseSummary.js'
import analyzeTemplate from './components/analyzeTemplate.vue'
import unlockMember from './components/unlockMember.vue'
import Footer from './components/footer.vue'
import exam from './exam.js'
import { isHFSApp, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { INotifyBar, IMask, AnalyzeTemplate: analyzeTemplate, UnlockMember: unlockMember, Footer, ShortYearExpiredPopup, ShortYearExpiringPopup }, // eslint-disable-line vue/no-reserved-component-names
  mixins: [exam],
  data() {
    return {
      pageType: 'loseSummary',
      resourceIndex: 'https://fe-resource.haofenshu.com/exam/images/index/',
      subjectList: [],
      subjectDetail: {},
      raiseInfo: {},
      lostQuestionSummary: {},
      difficultyList: ['容易', '较易', '中等', '较难', '难'],
      questionTypeList: [],
      chartDataList: [],
      arcbarOpts: {
        color: ['#FFBA1D'],
        title: {
          color: '#333333',
          fontSize: 15,
        },
        subtitle: {
          color: '#939393',
          fontSize: 12,
        },
        extra: {
          arcbar: {
            type: 'circle',
            width: 14,
            startAngle: 1.5,
            lineCap: 'butt',
            backgroundColor: '#FFF7E5',
          },
        },
      },
      distributionText: '',
      mixData: {},
      mixOpts: {
        fontSize: 11,
        fontColor: '#939393',
        dataLabel: false,
        padding: [0, 5, 0, 0],
        xAxis: {
          fontSize: 11,
          fontColor: '#939393',
          axisLineColor: '#EDEDED',
        },
        yAxis: {
          gridType: 'dash',
          gridColor: '#EDEDED',
          showTitle: false,
          data: [
            {
              axisLine: false,
            },
          ],
        },
        legend: {
          position: 'top',
          float: 'left',
          fontSize: 13,
          fontColor: '#333333',
        },
        extra: {
          mix: {
            column: {
              width: 14,
              seriesGap: 1,
              barBorderCircle: false,
              barBorderRadius: [4, 4, 0, 0],
              linearType: 'custom',
              customColor: ['#FFBA1D', '#C7D1FF', '#ADF1F0'],
            },
          },
        },
      },
      contrastText: '',
      maskStyle: {},
      questionsList: [
        {
          level: 5,
          title: '必练·推荐',
          desc: '此类题所含知识点与考察方式属于学生所处能力层级必须掌握的，掌握不好会影响后续知识点的学习，建议学生优先练习掌握。',
        },
        {
          level: 3,
          title: '拔高·推荐',
          desc: '此类题所含知识点与考察方式一般较为综合，但属于学生所处能力层级深入思考后有能力掌握的，掌握后能有效拔高应对相应知识点不同考察方式的能力，建议学生加强练习。',
        },
        {
          level: 1,
          title: '暂不推荐',
          desc: '此类题所含知识点与考察方式对于学生所处能力层级来说掌握难度过大，建议学生暂不练习或学有余力时练习。',
        },
      ],
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        type: '',
        desc: {
          base: '<span style="font-weight: bold">【基础可提升空间】</span>在学生能力范围内，应该掌握但出现了错误的题目，我们使用“<span style="color: #FFB100;font-weight: bold">必练·推荐⭐️⭐️⭐️⭐️⭐️</span>”来标记。这些错题失分总和，就是基础可提升空间。通过“错题订正”结合“错题间隔练”，将获得稳步提升。',
          hard: '<span style="font-weight: bold">【拔高可提升空间】</span>在学生能力范围之上，需要努力“跳一跳”才能掌握的错题，我们使用“<span style="color: #FFB100;font-weight: bold">拔高·推荐⭐️⭐️⭐️</span>”来标记。这些错题失分总和，就是拔高可提升空间。通过“错题订正”结合“举一反三练”，将获得显著提升。',
        },
      },
    }
  },
  computed: {
    examId() {
      return this.options.examId || ''
    },
    paperId() {
      return this.subjectDetail.paperId || ''
    },
    explain() {
      return this.lostQuestionSummary.explain || {}
    },
    sectionMax() {
      const { classBaseRaiseRank = 0, baseRaiseRank = 0, classHardRaiseRank = 0, hardRaiseRank = 0 } = this.raiseInfo
      return Math.max(classBaseRaiseRank, baseRaiseRank, classHardRaiseRank, hardRaiseRank) / 5
    },
    showScore() {
      const { score, scoreType } = this.config
      return scoreType === 2 && score === 2
    },
  },
  methods: {
    initPage() {
      this.getShortRecommend()
      this.subjectList = this.examDetail.papers || []
      this.subjectChange({ paperId: this.subjectList[0].paperId })
      this.getRaiseInfo()
    },
    subjectChange({ paperId = '' }) {
      if (!paperId || paperId === this.paperId)
        return
      this.subjectDetail = this.subjectList.find(item => item.paperId === paperId)
      this.getLostQuestionSummary()
    },
    async getRaiseInfo() {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/raise-info?examId=${this.examId}`)
      this.raiseInfo = res.data || {}
    },
    async getLostQuestionSummary() {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/paper/lost-question-summary?examId=${this.examId}&paperId=${this.paperId}`)
      this.lostQuestionSummary = res.data || {}
      this.questionTypeHandler()
      this.getChartDataList()
      this.getDistributionText()
      this.getMixData()
      this.getContrastText()
      this.getQuestionsList()
    },
    questionTypeHandler() {
      const { questionType = {} } = this.lostQuestionSummary
      this.questionTypeList = this.difficultyList.map((item, index) => {
        const { myLost = 0, classLost = 0, gradeLost = 0, score = 0 } = questionType[item] || {}
        return {
          ...questionType[item],
          name: `${item}题`,
          type: item,
          win: myLost < classLost && myLost < gradeLost,
          myRatio: myLost / score || 0,
          classRatio: classLost / score || 0,
          gradeRatio: gradeLost / score || 0,
          pic: `${this.resourceUrl}distribution_${index}.png`,
        }
      })
    },
    // 失分分布-圆环图
    getChartDataList() {
      this.chartDataList = this.questionTypeList.map((item) => {
        const { name, myRatio } = item
        return {
          ...item,
          ratio: `${(myRatio * 100).toFixed(0)}%`,
          chartData: {
            series: [
              {
                name,
                data: myRatio,
              },
            ],
          },
        }
      })
    },
    getDistributionText() {
      this.distributionText = losePointsDistribution(this.questionTypeList, this.subjectDetail.subject, this.explain)
    },
    // 失分对比
    getMixData() {
      const categories = this.questionTypeList.map(item => item.name)
      const myRatioData = this.questionTypeList.map(item => (item.myRatio).toFixed(2))
      const classRatioData = this.questionTypeList.map(item => (item.classRatio).toFixed(2))
      const gradeRatioData = this.questionTypeList.map(item => (item.gradeRatio).toFixed(2))
      this.mixData = {
        categories,
        series: [
          {
            name: '我的',
            type: 'column',
            color: '#FFC749',
            legendShape: 'circle',
            data: myRatioData,
          },
          {
            name: '班级',
            type: 'column',
            color: '#EDF0FF',
            legendShape: 'circle',
            data: classRatioData,
          },
          {
            name: '年级',
            type: 'column',
            color: '#D2F7F6',
            legendShape: 'circle',
            data: gradeRatioData,
          },
          {
            name: '',
            type: 'line',
            color: '#F0A700',
            textSize: 0.1,
            disableLegend: true,
            legendShape: 'none',
            connectNulls: true,
            data: myRatioData.map((item, index) => this.questionTypeList[index].score === 0 ? null : item),
          },
          {
            name: '',
            type: 'line',
            color: '#8698EC',
            lineType: 'dash',
            textSize: 0.1,
            disableLegend: true,
            legendShape: 'none',
            connectNulls: true,
            data: classRatioData.map((item, index) => this.questionTypeList[index].score === 0 ? null : item),
          },
          {
            name: '',
            type: 'line',
            color: '#5ED9D7',
            lineType: 'dash',
            textSize: 0.1,
            disableLegend: true,
            legendShape: 'none',
            connectNulls: true,
            data: gradeRatioData.map((item, index) => this.questionTypeList[index].score === 0 ? null : item),
          },
        ],
      }
    },
    getContrastText() {
      this.contrastText = losePointsContrast(this.questionTypeList)
    },
    getQuestionsList() {
      const { questions = {} } = this.lostQuestionSummary
      this.questionsList = this.questionsList.map(v => ({ ...v, list: questions[v.level] || [] }))
    },
    toWrong() {
      const url = `/improvePages/improve${uni.$u.queryParams({ examId: this.examId, paperId: this.paperId })}`
      // #ifdef MP-WEIXIN
      const { score, scoreType } = this.config
      uni.navigateTo({ url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}&config=${JSON.stringify({ score, scoreType })}`)}` })
      // #endif
      // #ifdef H5
      this.reportEventParams('ks_sfzj_Bctdz')
      if (isHFSApp()) {
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${location.origin}${url}` }))
      }
      return uni.navigateTo({ url })
      // #endif
    },
    mixComplete(e) {
      const { area, pix } = e.opts
      const [top, right, bottom, left] = area.map(v => `${v / pix}px`)
      this.maskStyle = { top, right, bottom, left }
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
.summary {
  min-height: 100vh;
  background: #f6f6f6;
  &-content {
    padding: 20rpx 28rpx 100rpx;
    padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
    &__item {
      position: relative;
      margin-bottom: 24rpx;
      &:last-child {
        margin-bottom: 12rpx;
      }
      &.improve {
        padding: 26rpx 32rpx 36rpx;
        background: linear-gradient(190deg, #ffe8b8, #ffffff 10%);
        border-radius: 24rpx;
        .improve-title {
          display: flex;
          align-items: center;
          margin-bottom: 24rpx;
          &__icon {
            width: 36rpx;
            height: 36rpx;
            margin-right: 12rpx;
          }
          &__text {
            font-size: 32rpx;
            color: #333333;
          }
        }
        .improve-item {
          height: 144rpx;
          padding: 18rpx 24rpx;
          background: #fff8e8;
          border-radius: 20rpx;
          margin-bottom: 12rpx;
          box-shadow: 0rpx 2rpx 0rpx 0rpx #ffffff inset;
          &:last-child {
            margin-bottom: 0;
          }
          .title {
            font-size: 28rpx;
            color: #333333;
            display: flex;
            align-items: center;
            .question {
              width: 20rpx;
              height: 20rpx;
              margin-left: 6rpx;
            }
          }
          .rank {
            display: flex;
            align-items: center;
            &-num {
              width: 208rpx;
              font-size: 24rpx;
              color: #333333;
              text-align: center;
              margin-right: 16rpx;
              flex-shrink: 0;
              .active {
                display: inline;
                font-size: 56rpx;
                color: #ffb100;
                font-weight: bold;
                margin-right: 6rpx;
              }
            }
            &-list {
              &__item {
                display: flex;
                align-items: center;
                font-size: 20rpx;
                color: rgba(51, 51, 51, 0.6);
                margin-bottom: 4rpx;
                .num {
                  width: 70rpx;
                  text-align: right;
                  margin-right: 8rpx;
                  .active {
                    display: inline;
                    color: #ffb100;
                  }
                }
                .progress {
                  height: 10rpx;
                  background-image: linear-gradient(
                    270deg,
                    #ffba1d 5%,
                    #ffde3e 100%
                  );
                  border-radius: 8rpx;
                }
              }
            }
          }
        }
      }
      &.distribution {
        padding-bottom: 36rpx;
        background: #ffffff;
        border-radius: 0 0 28rpx 30rpx;
        &.raidus {
          border-radius: 24rpx 28rpx 30rpx;
        }
        .distribution {
          &-content {
            padding: 24rpx 28rpx 0;
            &__list {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              margin-bottom: 8rpx;
              .list-item {
                width: calc(100% / 3);
                display: flex;
                align-items: center;
                flex-direction: column;
                margin-bottom: 30rpx;
                .chart {
                  width: 180rpx;
                  height: 180rpx;
                  margin-bottom: 12rpx;
                }
                .score {
                  font-size: 26rpx;
                  color: #333333;
                  white-space: nowrap;
                  .active {
                    color: #e50000;
                  }
                  .total {
                    color: #ffb100;
                  }
                }
                .pic {
                  width: 212rpx;
                }
              }
            }
          }
        }
      }
      &.contrast {
        padding: 36rpx 28rpx;
        background: #ffffff;
        border-radius: 24rpx;
        .chart {
          position: relative;
          height: 360rpx;
          margin-bottom: 38rpx;
          &-mask {
            position: absolute;
            z-index: 100;
            &__pic {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
      &.analysis {
        padding: 36rpx 28rpx 44rpx;
        background: #ffffff;
        border-radius: 24rpx;
        margin-bottom: 12rpx;
        .analysis {
          &-subtitle {
            display: flex;
            align-items: center;
            margin-bottom: 20rpx;
            .text {
              position: relative;
              font-size: 22rpx;
              color: #939393;
              padding-left: 26rpx;
              &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 16rpx;
                height: 16rpx;
                background: #e50000;
                border-radius: 50%;
              }
              &:last-child {
                margin-left: 34rpx;
                &::before {
                  background: #ffba1d;
                }
              }
            }
          }
          &-list {
            &__item {
              padding: 0 6rpx 6rpx;
              background: linear-gradient(180deg, #ffc140 0%, #ffeec6);
              border-radius: 16rpx;
              margin-bottom: 24rpx;
              &:last-child {
                margin-bottom: 0;
              }
              &.active {
                background: #f6f6f6;
                .title {
                  color: #939393;
                }
              }
              .title {
                height: 68rpx;
                font-size: 26rpx;
                color: #623000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-left: 14rpx;
                &-star {
                  flex: 1;
                  display: flex;
                  align-items: center;
                  margin-left: 8rpx;
                  &__icon {
                    display: flex;
                    align-items: center;
                    .icon {
                      width: 30rpx;
                      height: 28rpx;
                    }
                  }
                }
                &-arrow {
                  width: 320rpx;
                  height: 74rpx;
                }
              }
              .content {
                padding: 18rpx 20rpx 20rpx;
                background: linear-gradient(
                  180deg,
                  rgba(255, 255, 255, 0.7),
                  #ffffff 20%
                );
                border: 2rpx solid #ffffff;
                border-radius: 16rpx;
                &-topic {
                  position: relative;
                  display: inline-flex;
                  align-items: center;
                  flex-wrap: wrap;
                  font-size: 24rpx;
                  color: #333333;
                  font-weight: bold;
                  padding-left: 22rpx;
                  margin-right: 40rpx;
                  &::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 12rpx;
                    height: 12rpx;
                    border-radius: 50%;
                  }
                  &.all {
                    &::before {
                      background: #ff5f5f;
                    }
                  }
                  &.some {
                    &::before {
                      background: #ffba1d;
                    }
                  }
                }
                &-desc {
                  font-size: 26rpx;
                  color: #939393;
                  margin-top: 10rpx;
                }
              }
            }
          }
        }
      }
    }
    &__shim {
      width: 100%;
      height: 96rpx;
      margin-bottom: -72rpx;
      background: #ffffff;
      border-radius: 24rpx 24rpx 0 0;
    }
    &__tabs {
      background: #ffffff;
      ::v-deep .u-tabs__wrapper__nav__item:first-child {
        padding-left: 28rpx !important;
      }
      ::v-deep .u-tabs__wrapper__nav__item:nth-last-child(2) {
        padding-right: 28rpx !important;
      }
    }
    &__correct {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 104rpx;
      padding: 0 28rpx;
      background: linear-gradient(
        132deg,
        rgba(255, 239, 192, 0.8),
        #ffffff 11%,
        #ffffff 45%
      );
      border: 2rpx solid #ffffff;
      border-radius: 24rpx;
      margin-bottom: 12rpx;
      .icon {
        width: 52rpx;
        height: 52rpx;
        margin-right: 16rpx;
        flex-shrink: 0;
      }
      .text {
        flex: 1;
        margin-right: 16rpx;
        &-title {
          font-size: 26rpx;
          color: #333333;
          .active {
            color: #ffb100;
          }
        }
        &-desc {
          font-size: 24rpx;
          color: #939393;
        }
      }
    }
    &__space {
      padding: 24rpx 28rpx 30rpx;
      background: #ffffff;
      border-radius: 0 0 24rpx 24rpx;
      margin-bottom: 24rpx;
      position: relative;
      .space {
        &-list {
          width: 100%;
          display: flex;
          align-items: center;
          background: #f6f6f6;
          border-radius: 20rpx;
          padding: 30rpx 0;
          &__item {
            width: 50%;
            flex: 1;
            text-align: center;
            &:nth-child(2) {
              position: relative;
              &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                width: 0;
                height: 100%;
                border-left: 1rpx dashed #dddddd;
              }
            }
            .score {
              font-size: 24rpx;
              color: #333333;
              .active {
                display: inline;
                font-size: 56rpx;
                color: #ffb100;
                font-weight: bold;
                margin-right: 6rpx;
              }
            }
            .text {
              font-size: 26rpx;
              color: #333333;
              margin-bottom: 32rpx;
            }
            .rank {
              display: flex;
              align-items: center;
              justify-content: space-evenly;
              &-item {
                color: #939393;
                &__num {
                  font-size: 24rpx;
                }
                &__text {
                  font-size: 22rpx;
                }
              }
            }
          }
        }
      }
    }
    .item-title {
      position: relative;
      font-size: 30rpx;
      color: #333333;
      padding-left: 20rpx;
      margin-bottom: 20rpx;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 30rpx;
        background: #ffba1d;
        border-radius: 4rpx;
      }
    }
    .item-sub {
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 10rpx;
    }
    .item-text {
      color: #333333;
      font-size: 28rpx;
      line-height: 48rpx;
    }
    .connect {
      width: 100%;
      padding: 0 18rpx;
      position: absolute;
      bottom: -46rpx;
      left: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9;
      .icon {
        width: 18rpx;
        height: 70rpx;
      }
    }
  }
  &-popup {
    position: relative;
    width: 600rpx;
    background: #ffffff;
    border-radius: 60rpx;
    padding: 48rpx 40rpx 32rpx;
    &__title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 26rpx;
      text-align: center;
    }
    &__content {
      font-size: 30rpx;
      color: #333333;
      line-height: 42rpx;
      margin-bottom: 58rpx;
    }
    &__btn {
      width: 270rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: #ffffff;
      font-weight: 500;
      background: linear-gradient(225deg, #ffc749, #ffba1d);
      border-radius: 36rpx;
      margin: 0 auto;
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
