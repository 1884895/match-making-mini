<template>
  <view class="paper">
    <image class="paper-bg" src="../../static/academicReport/header_bg.png" mode="widthFix" />
    <view class="paper-header">
      <image class="paper-header_icon" src="../../static/academicReport/lost_icon.png" />
      <image class="paper-header_title" src="../../static/academicReport/lost_title.png" />
    </view>
    <view class="paper-content">
      <view class="paper-content_list">
        <template v-if="pageConfig.show && pageConfig.isLoading === false">
          <view class="item">
            <view class="header">
              <view class="header-left">
                <view class="header-left_line" />
                <view class="header-left_title">
                  失分分布
                </view>
              </view>
              <view class="header-right" @click="jumpPage('errorQuestion')">
                <view class="header-right_title">
                  查看错题
                </view>
                <image class="header-right_icon" src="../../static/academicReport/icon_gray_right_arrow.png" />
              </view>
            </view>
            <view class="difficulty">
              <view class="difficulty-list">
                <view v-for="(item, index) in chartDataList" :key="index" class="difficulty-list__item">
                  <view class="chart">
                    <qiun-data-charts :canvas2d="true" type="arcbar" :opts="{ ...arcbarOpts, title: { ...arcbarOpts.title, name: item.name } }" :chart-data="item.chartData" />
                  </view>
                  <view class="score">
                    丢<text class="active">
                      {{ item.myLost }}
                    </text>分/共<text class="total">
                      {{ item.score }}
                    </text>分
                  </view>
                </view>
              </view>
            </view>
            <view class="header custom">
              <view class="header-left">
                <view class="header-left_line" />
                <view class="header-left_title">
                  班级/年级失分对比
                </view>
              </view>
            </view>
            <view v-if="chartData.series" class="draw-chart">
              <qiun-data-charts :canvas2d="true" type="column" :in-scroll-view="true" :page-scroll-top="scrollTop" :opts="opts" :chart-data="chartData" />
            </view>
            <view class="header mt-40">
              <view class="header-left">
                <view class="header-left_line" />
                <view class="header-left_title">
                  差距对比
                </view>
              </view>
              <view v-if="(isMember || isMock) && selectGroup.label" class="header-right" @click="open">
                <view class="header-right_title">
                  {{ `PK${selectGroup.label}` }}
                </view>
                <image class="header-right_down" src="../../static/academicReport/icon_gray_down_arrow.png" />
              </view>
            </view>
            <view class="wapper">
              <view class="compare">
                <view class="compare_list">
                  <view v-for="(item, index) in difficultyList" :key="index" class="compare_list__item">
                    <view class="my line">
                      <u-line-progress :show-text="false" :percentage="lost.myLost[item].rate" :inactive-color="lost.myLost[item].inactiveColor" :active-color="lost.myLost[item].activeColor" height="16rpx" />
                    </view>
                    <view class="title">
                      {{ `${item}题` }}
                    </view>
                    <view class="group line">
                      <u-line-progress :show-text="false" :percentage="lost.compareLost[item].rate" :inactive-color="lost.compareLost[item].inactiveColor" :active-color="lost.compareLost[item].activeColor" height="16rpx" />
                    </view>
                  </view>
                </view>
                <view class="compare_lost">
                  <view class="my name">
                    我的失分
                  </view>
                  <image class="icon" src="../../static/academicReport/pk.png" mode="widthFix" />
                  <view class="group name">
                    {{ selectGroup.label }}失分
                  </view>
                </view>
              </view>
              <view v-if="!isMember && analysisStatus === 1" class="hidden">
                <view v-if="userInfo.roleType === 2" class="hidden__btn" @click="jumpVip">
                  <image class="icon" src="../../static/academicReport/unlock.png" />
                  <text class="text">
                    会员功能
                  </text>
                </view>
              </view>
            </view>
            <AnalyzeTemplate :content="lostGuide" />
          </view>
          <view v-if="isAllSubject" class="item">
            <view class="header">
              <view class="header-left">
                <view class="header-left_line" />
                <view class="header-left_title">
                  提升空间
                </view>
              </view>
            </view>
            <view v-if="spaceChartData.series" class="draw-chart">
              <qiun-data-charts :canvas2d="true" type="column" :in-scroll-view="true" :ontouch="true" :page-scroll-top="scrollTop" :opts="spaceOpts" :chart-data="spaceChartData" />
            </view>
            <template v-if="improveGuide">
              <AnalyzeTemplate :content="improveGuide" />
            </template>
          </view>
          <view v-else class="item">
            <view class="header">
              <view class="header-left">
                <view class="header-left_line" />
                <view class="header-left_title">
                  试题分析
                </view>
              </view>
            </view>
            <view class="question">
              <view class="question-form">
                <view class="question-form__item">
                  <view class="icon" />全错
                </view>
                <view class="question-form__item">
                  <view class="icon yellow" />部分错
                </view>
              </view>
              <view class="list">
                <view v-if="advantageQuestions.length" class="question-analysis">
                  <view class="question-analysis__title">
                    优势得分题
                  </view>
                  <view class="question-analysis__content">
                    <view class="list">
                      <view v-for="(item, index) in advantageQuestions" :key="index" class="number">
                        <view class="icon" :class="{ all: item.score === 0, some: item.score > 0 }" />{{ item.name }}
                      </view>
                    </view>
                    <view class="desc">
                      以上试题你的得分高出同等水平同学，很棒！分析这几题就能发现自己的优势所在，继续保持！
                    </view>
                  </view>
                </view>
                <view v-if="simpleQuestions.length" class="question-analysis">
                  <view class="question-analysis__title">
                    简单丢分题
                  </view>
                  <view class="question-analysis__content">
                    <view class="list">
                      <view v-for="(item, index) in simpleQuestions" :key="index" class="number">
                        <view class="icon" :class="{ all: item.score === 0, some: item.score > 0 }" />{{ item.name }}
                      </view>
                    </view>
                    <view class="desc">
                      从试题难度来看，这些题以你的能力水平应该能够答对，可惜了。认真分析错误原因，避免失误！
                    </view>
                  </view>
                </view>
                <view v-if="potentialQuestions.length" class="question-analysis">
                  <view class="question-analysis__title">
                    潜力追分题
                  </view>
                  <view class="question-analysis__content">
                    <view class="list">
                      <view v-for="(item, index) in potentialQuestions" :key="index" class="number">
                        <view class="icon" :class="{ all: item.score === 0, some: item.score > 0 }" />{{ item.name }}
                      </view>
                    </view>
                    <view class="desc">
                      根据对你和全体考生的水平测算，以上试题在你的能力范围内可以有更好的表现，要加油哟！重点分析扫清知识障碍，就能发现成绩突破口！
                    </view>
                  </view>
                </view>
              </view>
              <view class="tips">
                说明：题号为红色为全部丢分，题号为黄色为部分丢分
              </view>
            </view>
            <template v-if="improveGuide">
              <AnalyzeTemplate :content="improveGuide" />
            </template>
          </view>
        </template>
        <IEmpty v-if="!pageConfig.show && pageConfig.isLoading === false" border-radius="24rpx" />
      </view>
    </view>
    <u-popup :show="popup.show" mode="bottom" bg-color="white" :round="12" :safe-area-inset-bottom="true" @close="popup.show = false">
      <view class="pop">
        <view class="pop-title">
          选择对比
        </view>
        <view class="pop-line" />
        <view v-for="(item, index) in groupList" :key="index" class="pop-item" :class="{ active: selectGroup.value === item.value }" @click="groupClick(item)">
          {{ item.label }}
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import iEmpty from '../../../components/i-empty.vue'
import { allImproveAnalyze, lostAnalyze, singleImproveAnalyze } from '../../template/reportAnalyze.js'
import analyzeTemplate from './analyzeTemplate.vue'

export default {
  components: { AnalyzeTemplate: analyzeTemplate, IEmpty: iEmpty },
  props: {
    scrollTop: {
      type: Number,
      default: 0,
    },
    examId: {
      type: String,
      default: '',
    },
    subjectDetail: {
      type: Object,
      default: () => {},
    },
    config: {
      type: Object,
      default: () => {},
    },
    examDetail: {
      type: Object,
      default: () => {},
    },
    isMock: {
      type: Boolean,
      default: false,
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
    analysisStatus: {
      type: Number,
      default: 0,
    },
  },
  emits: ['jumpPage'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam',
      pageConfig: {
        show: true,
        isLoading: null,
      },
      chartData: {},
      spaceChartData: {},
      chartDataList: [],
      questions: [],
      difficultyList: ['容易', '较易', '中等', '较难', '难'],
      lost: {
        myLost: {},
        compareLost: {},
      },
      groupList: [
        { label: '学霸组', value: '学霸', reflect: '优秀', questionTypeLostScore: {} },
        { label: '优秀组', value: '优秀', reflect: '中等偏上', questionTypeLostScore: {} },
        { label: '中等组', value: '中等', reflect: '中等', questionTypeLostScore: {} },
        { label: '待提高组', value: '待提高', reflect: '中等偏下', questionTypeLostScore: {} },
        { label: '基础薄弱组', value: '基础薄弱', reflect: '较差', questionTypeLostScore: {} },
      ],
      selectGroup: {},
      popup: {
        show: false,
      },
      lostGuide: '',
      improveGuide: '',
      arcbarOpts: {
        color: ['#F8B132'],
        title: {
          color: '#333333',
          fontSize: 13,
        },
        subtitle: {
          name: '',
        },
        extra: {
          arcbar: {
            type: 'circle',
            width: 10,
            startAngle: 1.5,
            backgroundColor: '#FCF4DC',
          },
        },
      },
      opts: {
        fontSize: 11,
        fontColor: '#333333',
        color: ['#FFBA1D', '#56AEFF', '#37DA4C'],
        padding: [-10, 0, 0, 5],
        dataLabel: false,
        xAxis: {
          fontSize: 11,
          fontColor: '#333333',
        },
        yAxis: {
          gridType: 'dash',
          gridColor: '#EDEDED',
          data: [
            {
              axisLine: false,
              unit: '分',
            },
          ],
        },
        legend: {
          position: 'top',
          float: 'left',
          margin: 25,
        },
        extra: {
          column: {
            width: 14,
            seriesGap: 1,
            barBorderCircle: false,
            barBorderRadius: [4, 4, 0, 0],
            linearType: 'custom',
            customColor: ['#FFC749', '#1A91FF', '#26C53B'],
          },
        },
      },
      spaceOpts: {
        fontSize: 11,
        fontColor: '#333333',
        color: ['#FFBA1D'],
        padding: [25, 0, 0, 5],
        xAxis: {
          itemCount: 6,
          fontSize: 11,
          fontColor: '#333333',
        },
        yAxis: {
          showTitle: true,
          gridType: 'dash',
          gridColor: '#EDEDED',
          data: [
            {
              axisLine: false,
              unit: '分',
              title: '学科提升',
              titleFontSize: 14,
              titleOffsetY: -10,
            },
          ],
        },
        legend: {
          show: false,
        },
        extra: {
          column: {
            barBorderCircle: false,
            barBorderRadius: [4, 4, 0, 0],
            linearType: 'custom',
            customColor: ['#FFC749'],
          },
        },
      },
    }
  },
  computed: {
    // 是否为定制版本，屏蔽导出错题功能
    isCustomVersion() {
      return uni.getStorageSync('isCustomVersion') === true
    },
    isMember() {
      return this.userInfo.isMember || false
    },
    isAllSubject() {
      return this.subjectDetail.paperId === '0'
    },
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    // 简单丢分题
    simpleQuestions() {
      return (this.questions || []).filter(v => v.questionAnalysisTag === 1)
    },
    // 潜力追分题
    potentialQuestions() {
      return (this.questions || []).filter(v => v.questionAnalysisTag === 2)
    },
    // 优势得分题
    advantageQuestions() {
      return (this.questions || []).filter(v => v.questionAnalysisTag === 3)
    },
  },
  watch: {
    subjectDetail: {
      async handler(val) {
        if (!Object.keys(val).length)
          return
        await this.getLostQuestionSummary()
        await this.getLostQuestionSummaryGroup()
      },
      immediate: true,
    },
  },
  methods: {
    open() {
      this.popup.show = true
    },
    close() {
      this.popup.show = false
    },
    groupClick(item) {
      this.selectGroup = item
      this.setCompareGroup()
      this.close()
    },
    setCompareGroup() {
      const colorMap = {
        default: { inactiveColor: '#F1F1F1', activeColor: '#D4D4D4' },
        select: { inactiveColor: '#FFEFCC', activeColor: '#FFBA1D' },
      }
      Object.keys(this.lost.compareLost).forEach((item, _index) => {
        const { questionTypeLostScore } = this.selectGroup
        const lost = questionTypeLostScore[item]
        const score = this.lost.compareLost[item].score
        const rate = lost && score ? Math.round(lost / score * 100) : 0
        const myLost = this.lost.myLost[item].lost
        const compareLostColor = myLost > lost ? colorMap.select : colorMap.default
        const myLostColor = myLost > lost ? colorMap.default : colorMap.select
        this.lost.compareLost[item] = { ...this.lost.compareLost[item], lost, rate, ...compareLostColor }
        this.lost.myLost[item] = { ...this.lost.myLost[item], ...myLostColor }
      })
    },
    async getLostQuestionSummaryGroup() {
      const mockUrl = this.resourceUrl + (this.isAllSubject ? `/mock/lost-question-summary/group/${this.examId}.json` : `/mock/paper/lost-question-summary/group/${this.subjectDetail.paperId}.json`)
      const prodUrl = this.prefix + (this.isAllSubject ? `/v4/exam/lost-question-summary/group?examId=${this.examId}` : `/v4/exam/paper/lost-question-summary/group?examId=${this.examId}&paperId=${this.subjectDetail.paperId}`)
      let res = {}
      if (this.isMock) {
        const resp = await uni.$u.http.get(mockUrl)
        res = resp.data || {}
      }
      else {
        if (!this.isMember)
          return
        res = await uni.$http.get(prodUrl)
      }
      const { levelGroup = {} } = res.data || {}
      this.groupList.forEach((item) => {
        const { qStatis = {} } = levelGroup[item.value] || {}
        this.difficultyList.forEach((v) => {
          const { avgLost = 0 } = qStatis[v] || {}
          item.questionTypeLostScore[v] = avgLost
        })
      })
      const index = this.groupList.findIndex(item => item.reflect === this.examDetail.level)
      this.selectGroup = this.groupList[index - 1 > 0 ? index - 1 : 0]
      this.setCompareGroup()
    },
    async getLostQuestionSummary() {
      try {
        this.pageConfig = { show: true, isLoading: null }
        const mockUrl = this.resourceUrl + (this.isAllSubject ? `/mock/lost-question-summary/${this.examId}.json` : `/mock/paper/lost-question-summary/${this.subjectDetail.paperId}.json`)
        const prodUrl = this.prefix + (this.isAllSubject ? `/v4/exam/lost-question-summary?examId=${this.examId}` : `/v4/exam/paper/lost-question-summary?examId=${this.examId}&paperId=${this.subjectDetail.paperId}`)
        let res = {}
        if (this.isMock) {
          const resp = await uni.$u.http.get(mockUrl)
          res = resp.data || {}
        }
        else {
          res = await uni.$http.get(prodUrl)
        }
        this.pageConfig = { show: true, isLoading: false }
        const { questionType = {}, explain = {} } = res.data
        explain.betterStr = explain.better.map(item => `${item}题`).join('、')
        explain.weakerStr = explain.weaker.map(item => `${item}题`).join('、')
        // 失分分布-圆环图
        this.chartDataList = this.difficultyList.map((item) => {
          const { myLost = 0, score = 0 } = questionType[item]
          return {
            ...questionType[item],
            name: `${item}题`,
            chartData: {
              series: [
                {
                  name: item,
                  data: myLost / score,
                },
              ],
            },
          }
        })
        // 班级/年级失分对比
        const myLostList = []
        const classLostList = []
        const gradeLostList = []
        this.difficultyList.forEach((item) => {
          const { myLost = 0, classLost = 0, gradeLost = 0 } = questionType[item]
          myLostList.push(this.formateData(myLost))
          classLostList.push(this.formateData(classLost))
          gradeLostList.push(this.formateData(gradeLost))
        })
        this.chartData = {
          categories: this.difficultyList.map(item => `${item}题`),
          series: [
            { name: '我的', legendShape: 'circle', data: myLostList },
            { name: '班级', legendShape: 'circle', data: classLostList },
            { name: '年级', legendShape: 'circle', data: gradeLostList },
          ],
        }
        // 差距对比
        const myLost = {}
        const compareLost = {}
        this.difficultyList.forEach((item) => {
          const { myLost: lost = 0, score = 0 } = questionType[item]
          myLost[item] = { lost, score, rate: lost && score ? Math.round(lost / score * 100) : 0, inactiveColor: '#FFEFCC', activeColor: '#FFBA1D' }
          compareLost[item] = { lost: '', score, rate: '', inactiveColor: '#F1F1F1', activeColor: '#D4D4D4' }
        })
        this.lost = { myLost, compareLost }
        // 全科-提升空间
        if (this.isAllSubject) {
          const { papers = [] } = res.data
          this.spaceChartData = {
            categories: papers.map(item => item.subject),
            series: [
              {
                name: '',
                data: papers.map(item => item.canRaiseScore),
              },
            ],
          }
          this.spaceOpts = { ...this.spaceOpts, enableScroll: papers.length > 6 }
          this.lostGuide = lostAnalyze(1, this.userInfo.roleType, { ...explain, difficultyLevel: this.examDetail.difficultyLevel })
          this.improveGuide = allImproveAnalyze(this.userInfo.roleType, explain)
        }
        // 单科-试题分析
        if (!this.isAllSubject) {
          const { questions = [] } = res.data
          this.questions = questions
          this.lostGuide = lostAnalyze(0, this.userInfo.roleType, { ...explain, difficultyLevel: this.examDetail.difficultyLevel })
          this.improveGuide = singleImproveAnalyze(explain)
        }
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (error) {
        this.pageConfig = { show: false, isLoading: false }
      }
    },
    // 数据格式化
    formateData(value) {
      if (!value)
        return 0
      return value % 1 === 0 ? value : Number(value).toFixed(2)
    },
    jumpPage(type) {
      this.$emit('jumpPage', type, { examId: this.examId, paperId: this.subjectDetail.paperId || '' })
    },
    jumpVip() {
      this.$emit('jumpPage', 'vip')
    },
  },
}
</script>

<style lang="scss" scoped>
.paper {
  position: relative;
  overflow: hidden;
  border-radius: 24rpx;
  &-bg {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  &-header {
    position: relative;
    display: flex;
    align-items: center;
    height: 44rpx;
    margin: 20rpx 28rpx 16rpx 28rpx;
    &_icon {
      width: 32rpx;
      height: 36rpx;
      margin-right: 10rpx;
    }
    &_title {
      width: 144rpx;
      height: 36rpx;
    }
  }
  &-content {
    position: relative;
    background-color: #fffaef;
    border-radius: 24rpx;
    &_list {
      background-color: #ffffff;
      min-height: 600rpx;
      border-radius: 24rpx;
      .item {
        background: #ffffff;
        border-radius: 24rpx;
        padding: 24rpx 30rpx 30rpx 30rpx;
        &:first-child {
          margin-bottom: 24rpx;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 26rpx;
          &-left {
            display: flex;
            align-items: center;
            &_line {
              width: 8rpx;
              height: 30rpx;
              background: #ffba1d;
              border-radius: 4rpx;
              margin: -2rpx 12rpx 0 0;
            }
            &_title {
              font-size: 30rpx;
              color: #333333;
            }
          }
          &-right {
            display: flex;
            align-items: center;
            padding: 8rpx 16rpx;
            background: #f8f8f8;
            border-radius: 6rpx;
            &_title {
              font-size: 28rpx;
              color: #333333;
            }
            &_icon {
              width: 12rpx;
              height: 20rpx;
              margin-left: 10rpx;
            }
            &_down {
              width: 20rpx;
              height: 10rpx;
              margin-left: 10rpx;
            }
          }
          &.custom {
            margin-bottom: 0;
          }
          &.mt-40 {
            margin-bottom: 40rpx;
          }
        }
        .draw {
          &-chart {
            margin-bottom: 44rpx;
            height: 452rpx;
          }
        }
        .compare {
          margin-bottom: 28rpx;
          &_list {
            &__item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 44rpx;
              &:last-child {
                margin-bottom: 0;
              }
              .line {
                width: 250rpx;
              }
              .my {
                transform: rotate(-180deg);
              }
              .title {
                font-size: 28rpx;
                color: #333333;
              }
            }
          }
          &_lost {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            .name {
              background: linear-gradient(225deg, #ffc749, #ffba1d);
              font-size: 28rpx;
              color: #ffffff;
              font-weight: 500rpx;
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              z-index: 1;
            }
            .my {
              padding: 2rpx 30rpx 2rpx 58rpx;
              border-radius: 200rpx 0 0 200rpx;
              right: calc(50% + 40rpx);
            }
            .group {
              padding: 2rpx 48rpx 2rpx 30rpx;
              border-radius: 0 200rpx 200rpx 0;
              position: absolute;
              top: 50%;
              left: calc(50% + 40rpx);
            }
            .icon {
              width: 100rpx;
              height: 106rpx;
              position: relative;
              z-index: 2;
            }
          }
        }
        .difficulty {
          .difficulty-list {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            &__item {
              width: calc(100% / 3);
              display: flex;
              align-items: center;
              flex-direction: column;
              margin-bottom: 40rpx;
            }
            .chart {
              width: 168rpx;
              height: 168rpx;
              margin-bottom: 12rpx;
            }
            .score {
              font-size: 22rpx;
              color: #333333;
              .active {
                color: #f8b132;
              }
              .total {
                color: #1990ff;
              }
            }
          }
        }
        .question {
          &-form {
            display: flex;
            align-items: center;
            margin-bottom: 24rpx;
            &__item {
              display: flex;
              align-items: center;
              font-size: 28rpx;
              color: #333333;
              margin-right: 60rpx;
              .icon {
                width: 26rpx;
                height: 26rpx;
                border-radius: 50%;
                background: #ff5f5f;
                margin-right: 10rpx;
              }
              .yellow {
                background: #ffba1d;
              }
              &:last-child {
                margin-right: 0;
              }
            }
          }
          &-analysis {
            margin-bottom: 30rpx;
            &__title {
              font-size: 30rpx;
              color: #333333;
              margin-bottom: 20rpx;
            }
            &__content {
              padding: 22rpx 26rpx;
              background: #f8f8f8;
              border-radius: 16px;
              .list {
                display: flex;
                flex-wrap: wrap;
                .number {
                  display: flex;
                  align-items: center;
                  font-size: 26rpx;
                  font-weight: 500;
                  color: #333333;
                  margin: 0 40rpx 10rpx 0;
                  .icon {
                    width: 12rpx;
                    height: 12rpx;
                    border-radius: 50%;
                    margin-right: 10rpx;
                  }
                  .all {
                    background-color: #ff5f5f;
                  }
                  .some {
                    background-color: #ffba1d;
                  }
                }
              }
              .desc {
                font-size: 28rpx;
                color: #939393;
                line-height: 1.5;
              }
            }
          }
          .list {
            .question-analysis:last-child {
              margin-bottom: 0;
            }
          }
          .tips {
            font-size: 24rpx;
            color: #939393;
            margin: 16rpx 0 36rpx;
          }
        }
      }
    }
  }
  .pop {
    padding-bottom: 19rpx;
    &-line {
      width: 100%;
      height: 27rpx;
      border-top: 1rpx solid #ededed;
      padding-bottom: 20rpx;
    }
    &-title {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 34rpx;
      color: #333333;
      height: 95rpx;
    }
    &-item {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      height: 80rpx;
      margin: 7rpx 30rpx;
      color: #333333;
      background: #f8f8f8;
      border-radius: 14rpx;
      &.active {
        color: #ffffff;
        background: #ffba1d;
      }
    }
  }
}

.wapper {
  position: relative;
  min-height: 200rpx;
  .hidden {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8rpx;
    backdrop-filter: blur(8rpx);
    z-index: 10;
    &__btn {
      width: 250rpx;
      height: 57rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3f1902;
      border-radius: 48rpx;
      .icon {
        width: 30rpx;
        height: 26rpx;
        margin-right: 10rpx;
      }
      .text {
        font-size: 30rpx;
        color: #fdd891;
      }
    }
  }
  @supports not (backdrop-filter: none) {
    .hidden {
      background: rgba(255, 255, 255, 0.9);
    }
  }
}
</style>
