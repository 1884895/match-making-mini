<template>
  <view class="joint">
    <image class="background" src="../static/jointReport/lkbg_bg_tbtp.png" mode="widthFix" />
    <view class="joint-content">
      <u-navbar title="联考报告" bg-color="transparent" auto-back placeholder left-icon-color="#ffffff" :title-style="{ color: '#ffffff' }" />
      <view class="joint-content__info">
        <view class="title">
          {{ briefList.name }}
        </view>
        <view class="desc">
          <image class="icon" src="../static/jointReport/scores_icon_lb.png" /><text>本次参与联考的学校有{{ schoolNumber }}所，考生{{ studentNumber }}人</text>
        </view>
        <view class="list">
          <template v-for="(item, index) in scoreData">
            <view v-if="item.show" :key="index" class="item">
              <view class="score">
                {{ item.score }}
              </view>
              <view class="text">
                {{ item.text }}
              </view>
            </view>
          </template>
        </view>
      </view>
      <view v-if="liankaoReportStage" class="joint-content__segment">
        <view class="joint-title">
          <image class="icon" src="../static/jointReport/lkbo_icon_btzs_left.png" /><text class="text">
            联考分数段分布
          </text><image class="icon" src="../static/jointReport/lkbo_icon_btzs_right.png" />
        </view>
        <view class="tabs">
          <Tabs :list="briefList.papers || []" @change="subjectClick" />
        </view>
        <view class="chat">
          <image class="logo" src="../static/jointReport/lkbg_logo_xa.png" />
          <view class="dialog">
            <view v-if="liankaoReportRank" class="desc">
              你的本次考试所处位置<text class="active">
                {{ jointReportInfo.rankS }}
              </text>
            </view>
            <view v-else class="desc">
              <u-icon name="lock-fill" color="#ccc" size="40rpx" />
            </view>
            <image class="bg" src="../static/jointReport/oval.png" />
          </view>
        </view>
        <view class="list">
          <view class="item">
            你的成绩 <text class="active">
              {{ chartAllSubjectData.myScore }}
            </text> 分，所处分数阶段为 <text class="active">
              {{ gardeSection.min || '' }}-{{ gardeSection.max || '' }}
            </text>
          </view>
          <view class="item">
            该分数段共有学生 <text class="active">
              {{ gardeSection.stuNum }}
            </text> 人
          </view>
          <template v-if="chartAllSubjectData.groups">
            <view v-if="chartAllSubjectData.myIndex === chartAllSubjectData.groups.length - 1" class="item">
              本次成绩处于领先地位，继续努力再创新高
            </view>
            <view v-else class="item">
              若你成绩提高 <text class="active">
                {{ jointReportInfo.raiseScore }}
              </text> 分，你将超过 <text class="active">
                {{ jointReportInfo.raiseRank }}
              </text> 人
            </view>
          </template>
        </view>
        <view class="chart">
          <qiun-data-charts type="column" :canvas2d="true" :opts="opts" :chart-data="chartData" :tooltip-show="false" @get-index="showColumnTooltip" />
        </view>
      </view>
      <view v-if="liankaoReportMax" class="joint-content__score">
        <view class="joint-title">
          <image class="icon" src="../static/jointReport/lkbo_icon_btzs_left.png" /><text class="text">
            各科最高分
          </text><image class="icon" src="../static/jointReport/lkbo_icon_btzs_right.png" />
        </view>
        <view class="list">
          <view class="item">
            <view class="info">
              <image class="icon" src="../static/jointReport/scores_icon_zf.png" />
              <view class="desc">
                <view class="title">
                  {{ briefList.mode === 3 ? '全系总分最高' : '总分最高' }}
                </view>
                <view class="tip">
                  {{ briefList.mode === 3 ? overviewInfo.groupHighestComeFrom : overviewInfo.manfenHighestComeFrom }}
                </view>
              </view>
            </view>
            <view class="score">
              {{ briefList.mode === 3 ? overviewInfo.groupHighestScore : overviewInfo.manfenHighestScore }}
            </view>
          </view>
          <view v-for="(item, index) in overviewInfo.subjectHighestScore" :key="index" class="item">
            <view class="info">
              <image class="icon" :src="subjectImgMap[item.subject] || '../static/jointReport/scores_icon_qt.png'" />
              <view class="desc">
                <view class="title">
                  {{ item.subject }}最高
                </view>
                <view class="tip">
                  {{ item.school }}
                </view>
              </view>
            </view>
            <view class="score">
              {{ item.score }}
            </view>
          </view>
        </view>
      </view>
      <view class="joint-content__school">
        <view class="joint-title">
          <image class="icon" src="../static/jointReport/lkbo_icon_btzs_left.png" /><text class="text">
            联考学校
          </text><image class="icon" src="../static/jointReport/lkbo_icon_btzs_right.png" />
        </view>
        <view class="list">
          <view class="item title">
            <view>联考学校</view>
            <view>参考人数</view>
          </view>
          <view v-for="(item, index) in overviewInfo.schoolList" :key="index" class="item">
            <view>{{ item.schoolName }}</view>
            <view>{{ item.attendStuNum }}</view>
          </view>
        </view>
      </view>
    </view>
    <image v-if="!liankaoVisible" class="sample" src="../static/jointReport/scores_icon_yl.png" />
    <OpenVip :is-member="liankaoVisible" />
  </view>
</template>

<script>
import tabs from '../../components/tabs.vue'
import openVip from '../../components/openVip.vue'
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js'

export default {
  components: { Tabs: tabs, OpenVip: openVip },
  data() {
    return {
      options: {},
      config: {},
      userInfo: {},
      overviewInfo: {},
      jointReportInfo: {},
      chartAllSubjectData: {},
      briefList: {},
      currentPaper: {},
      opts: {
        color: ['#FBC434'],
        unit: '分',
        fontSize: 10,
        fontColor: '#54423D',
        dataLabel: false,
        legend: {
          show: false,
        },
        yAxis: {
          data: [
            {
              format: 'yAxisFixed',
              unit: '人',
              tofix: 0,
            },
          ],
        },
        extra: {
          column: {
            type: 'group',
            categoryGap: 2,
          },
          tooltip: {
            legendShow: false,
            borderRadius: 4,
          },
        },
      },
      chartData: {},
      subjectImgMap: {
        语文: require('../static/jointReport/scores_icon_yw.png'),
        数学: require('../static/jointReport/scores_icon_sx.png'),
        英语: require('../static/jointReport/scores_icon_yy.png'),
        物理: require('../static/jointReport/scores_icon_wl.png'),
        化学: require('../static/jointReport/scores_icon_hx.png'),
        政治: require('../static/jointReport/scores_icon_zz.png'),
        历史: require('../static/jointReport/scores_icon_ls.png'),
        生物: require('../static/jointReport/scores_icon_sw.png'),
        地理: require('../static/jointReport/scores_icon_dl.png'),
        科学: require('../static/jointReport/scores_icon_kx.png'),
      },
    }
  },
  computed: {
    showScore() {
      return this.config.score === 2
    },
    liankaoVisible() {
      return this.userInfo.isMember || +this.options.liankaoVisible === 1
    },
    liankaoReportAvg() {
      return this.config.liankaoReportAvg === 2
    },
    liankaoReportMax() {
      return this.config.liankaoReportMax === 2
    },
    liankaoReportStage() {
      return this.config.liankaoReportStage === 2
    },
    liankaoReportRank() {
      return this.config.liankaoReportRank === 2
    },
    showChart() {
      // 分数段未屏蔽
      return this.config.scoreStage === 2
    },
    schoolNumber() {
      return (this.overviewInfo.schoolList || []).length || 0
    },
    studentNumber() {
      return (this.overviewInfo.schoolList || []).reduce((total, item) => total + item.attendStuNum, 0)
    },
    scoreData() {
      return [
        {
          score: this.overviewInfo.myScore,
          text: '你的成绩',
          show: this.showScore,
        },
        {
          score: this.overviewInfo.avg,
          text: '联考平均分',
          show: this.liankaoReportAvg,
        },
        {
          score: this.overviewInfo.manfenHighestScore,
          text: '联考最高分',
          show: this.liankaoReportMax,
        },
      ]
    },
    groupType() {
      return [2, 3].includes(this.briefList.mode) ? 1 : 0
    },
    gardeSection() {
      const { myIndex, groups = [] } = this.chartAllSubjectData
      return groups[myIndex]
    },
  },
  async onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || {}
    const shieldConfig = uni.getStorageSync('shieldConfig')
    const examConfigs = shieldConfig.examConfigs.find(v => +v.examId === +options.examId) || {}
    this.config = Object.assign({}, shieldConfig, examConfigs)
    await this.init()
  },
  methods: {
    async init(flag) {
      const examId = this.options.examId
      !flag && await this.getExamBriefList(examId)
      if (this.briefList.papers && this.briefList.papers.length) {
        const { paperId } = this.currentPaper || this.briefList.papers[0]
        if (!this.currentPaper.paperId || this.currentPaper.paperId === -1) {
          await this.getJointReportInfo(examId)
          await this.getChartAllSubjectData(examId)
        }
        else {
          await this.getSingleSubjectData(examId, paperId)
          await this.getChartSingleSubjectData(examId, paperId)
        }
      }
    },
    // 获取联考学科信息
    async getExamBriefList(examId) {
      const url = this.liankaoVisible ? `/v1/exam-proxy/v3/exam/${examId}/brief?withSubPapers=0` : `${feConfig.resourceUrl}/mock/liankao-report/brief.json`
      const res = await uni.$http.get(url)
      this.briefList = res.data
      this.briefList.papers.unshift({ paperId: -1, subject: '全部' })
      this.currentPaper = { ...this.briefList.papers[0], index: 0 } || {}
    },
    // 联考概览信息
    async getJointReportInfo(examId) {
      try {
        const url = this.liankaoVisible ? `/v1/exam-proxy/v3/exam/${examId}/liankao-report/overview?groupType=${this.groupType}` : `${feConfig.resourceUrl}/mock/liankao-report/overview.json`
        const res = await uni.$http.get(url)
        this.overviewInfo = res.data
        this.jointReportInfo = res.data
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (err) {
        this.jointReportInfo = {}
      }
    },
    // 获取图表全科同组数据
    async getChartAllSubjectData(examId) {
      try {
        const url = this.liankaoVisible ? `/v1/exam-proxy/v3/exam/${examId}/liankao-report/same-group-analysis` : `${feConfig.resourceUrl}/mock/liankao-report/same-group-analysis.json`
        const res = await uni.$http.get(url)
        this.chartAllSubjectData = res.data
        this.setChartData(res.data.groups || [], res.data.myIndex)
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (err) {
        this.chartData = {}
      }
    },
    // 获取单科数据
    async getSingleSubjectData(examId, paperId) {
      try {
        const url = this.liankaoVisible ? `/v1/exam-proxy/v3/exam/${examId}/paper/${paperId}/liankao-report/overview?groupType=${this.groupType}` : `${feConfig.resourceUrl}/mock/liankao-report/${paperId}/overview.json`
        const res = await uni.$http.get(url)
        this.jointReportInfo = res.data
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (err) {
        this.jointReportInfo = {}
      }
    },
    // 获取图表单科同组数据
    async getChartSingleSubjectData(examId, paperId) {
      try {
        const url = this.liankaoVisible ? `/v1/exam-proxy/v3/exam/${examId}/papers/${paperId}/liankao-report/same-group-analysis` : `${feConfig.resourceUrl}/mock/liankao-report/${paperId}/same-group-analysis.json`
        const res = await uni.$http.get(url)
        this.chartAllSubjectData = res.data
        this.setChartData(res.data.groups || [], res.data.myIndex)
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (err) {
        this.chartData = {}
      }
    },
    subjectClick(item) {
      if (this.currentPaper.paperId !== item.paperId) {
        this.currentPaper = item
        this.init(true)
      }
    },
    setChartData(groups, myIndex) {
      this.opts.xAxis = {
        labelCount: this.showChart ? 4 : null,
        format: this.showChart ? 'seriesUnit' : '',
        fontSize: 10,
        fontColor: '#54423D',
      }
      this.chartData = {
        categories: groups.map(v => this.showChart ? v.min : v.level),
        series: [
          {
            name: this.showChart ? '分数段' : '档位',
            data: groups.map((v, i) => {
              if (this.showChart && i === myIndex) {
                return {
                  value: v.stuNum,
                  color: '#FF4D2B',
                }
              }
              return v.stuNum
            }),
          },
        ],
      }
    },
    showColumnTooltip(e) {
      const index = e.currentIndex.index
      const textList = []
      if (index > -1) {
        const groups = this.chartAllSubjectData.groups || []
        textList.push(...[
          {
            text: this.showChart ? `分数段：${groups[index].min}-${groups[index].max}\r\r` : `档位：${groups[index].level}`,
          },
          {
            text: `学生数：${groups[index].stuNum}`,
          },
        ])
      }
      uCharts.instance[e.id].showToolTip(
        { changedTouches: [e.event] },
        {
          index,
          textList,
        },
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.joint {
  position: relative;
  min-height: 100vh;
  background: #ffffff;
  .background {
    width: 100%;
  }
  &-title {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40rpx;
    .icon {
      width: 55rpx;
      height: 25rpx;
    }
    .text {
      font-size: 34rpx;
      font-weight: 500;
      color: #282423;
      margin: 0 20rpx;
    }
  }
  &-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 0 30rpx 200rpx;
    margin-top: 30rpx;
    &__info {
      width: 100%;
      background: #ffffff;
      padding: 50rpx 30rpx;
      border-radius: 10.42rpx;
      box-shadow: 0rpx 2.08rpx 27.08rpx 0rpx rgba(219, 219, 219, 0.51);
      margin-bottom: 75rpx;
      .title {
        font-size: 34rpx;
        font-weight: 500;
        text-align: center;
        color: #333333;
        margin-bottom: 20rpx;
      }
      .desc {
        display: flex;
        align-items: center;
        padding: 5rpx 30rpx;
        font-size: 23rpx;
        color: #666666;
        background: #f9f9f9;
        border-radius: 20.83rpx;
        margin-bottom: 40rpx;
        .icon {
          width: 24rpx;
          height: 20rpx;
          margin-right: 16rpx;
        }
      }
      .list {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 22rpx;
        .item {
          display: flex;
          flex-direction: column;
          align-items: center;
          .score {
            font-size: 50rpx;
            font-weight: 500;
            color: #333333;
            margin-bottom: 4rpx;
          }
          .text {
            font-size: 25rpx;
            color: #939393;
          }
        }
      }
    }
    &__segment {
      margin-bottom: 75rpx;
      .tabs {
        margin: 0 -30rpx 48rpx;
        border-bottom: 1rpx solid #e6e6e6;
      }
      .chat {
        display: flex;
        align-items: center;
        margin: 0 0 36rpx 10rpx;
        .logo {
          width: 148rpx;
          height: 137rpx;
          margin-right: 12rpx;
          flex-shrink: 0;
        }
        .dialog {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 466rpx;
          height: 124rpx;
          .desc {
            display: flex;
            align-items: center;
            font-size: 30rpx;
            color: #666666;
            z-index: 1;
            .active {
              color: #333333;
              font-size: 42rpx;
              font-weight: 600;
              margin-left: 16rpx;
            }
          }
          .bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 466rpx;
            height: 124rpx;
          }
        }
      }
      .list {
        margin: 0 0 18rpx 38.42rpx;
        .item {
          position: relative;
          display: flex;
          align-items: center;
          font-size: 25rpx;
          color: #666666;
          margin: 0 0 2rpx 16rpx;
          &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: -26.42rpx;
            transform: translateY(-50%);
            width: 10.42rpx;
            height: 10.42rpx;
            background: #ffba1d;
            border-radius: 50%;
          }
          .active {
            color: #ff4d2b;
          }
        }
      }
      .chart {
        width: 100%;
        height: 280rpx;
      }
    }
    &__score {
      margin-bottom: 75rpx;
      .list {
        .item {
          display: flex;
          justify-content: space-between;
          padding: 20rpx 30rpx;
          border: 1rpx solid #e6e6e6;
          border-radius: 4.17rpx;
          margin-bottom: 25rpx;
          &:last-child {
            margin-bottom: 0;
          }
        }
        .info {
          display: flex;
          .icon {
            width: 48rpx;
            height: 48rpx;
            margin-right: 20rpx;
          }
          .desc {
            .title {
              font-size: 30rpx;
              color: #333333;
              margin-bottom: 5rpx;
            }
            .tip {
              font-size: 25rpx;
              color: #939393;
            }
          }
          .score {
            font-size: 30rpx;
            font-weight: 500;
            color: #4e3f3c;
          }
        }
      }
    }
    &__school {
      .list {
        border: 1rpx solid #e6e6e6;
        border-radius: 10.42rpx;
        .item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #333333;
          font-size: 30rpx;
          padding: 0 30rpx;
          margin-bottom: 44rpx;
          &.title {
            color: #666666;
            background: #f9f9f9;
            padding: 25rpx 30rpx;
            border-bottom: 1rpx solid #e6e6e6;
          }
        }
      }
    }
  }
  .sample {
    position: fixed;
    top: 260rpx;
    right: 60rpx;
    width: 148rpx;
    height: 104rpx;
  }
}
</style>
