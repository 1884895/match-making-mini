<template>
  <view class="exam">
    <view class="exam-item">
      <view class="exam-item__explain">
        <image class="icon" src="../../static/academicReport/shuoming_icon.png" />
        <view class="template">
          <view class="count">
            本年级一共考试{{ examSummary.examCount }}场
          </view>
          <view class="text">
            <view class="point" />在{{ examSummary.scoreMaxExam.time }}考试中取得<text class="yellow">
              {{ examSummary.scoreMaxExam.score }}
            </text>{{ Number(examSummary.scoreMaxExam.scoreType) === 2 ? '分' : '' }}成绩最好
          </view>
          <view class="text">
            <view class="point" />在{{ examSummary.rankMaxExam.time }}考试中年级排名最好为<text class="yellow">
              {{ examSummary.rankMaxExam.gradeRank }}
            </text>
          </view>
          <view class="text">
            <view class="point" />在{{ examSummary.classRankMaxExam.time }}考试中班级排名最好为<text class="yellow">
              {{ examSummary.classRankMaxExam.classRank }}
            </text>
          </view>
          <view class="text">
            <view class="point" />整体处于<text class="yellow">
              {{ examSummary.level }}
            </text>范围
          </view>
          <view class="text">
            <view class="point" /><text class="green">
              {{ examSummary.better }}
            </text>学科表现最好，<text class="red">
              {{ examSummary.weaker }}
            </text>学科有待提升
          </view>
        </view>
      </view>
      <view class="exam-item__analyze">
        <view class="header mb-0">
          <view class="header-left">
            <view class="header-left__line" />
            <view class="header-left__title">
              学科分析
            </view>
          </view>
          <view v-if="selectGroup.label" class="header-right" @click="open">
            {{ `PK${selectGroup.label}` }}
            <image class="header-right__icon" src="../../static/academicReport/icon_gray_down_arrow.png" />
          </view>
        </view>
        <view class="chart mb-24">
          <qiun-data-charts v-if="radarChartData.categories && radarChartData.categories.length > 2" type="radar" :canvas2d="true" :in-scroll-view="true" :page-scroll-top="scrollTop" :opts="radarOpts" :ontouch="true" :tooltip-show="false" :chart-data="radarChartData" @get-index="showRadarToolTip" @complete="showRadarToolTip" />
          <qiun-data-charts v-else type="column" :canvas2d="true" :in-scroll-view="true" :ontouch="true" :page-scroll-top="scrollTop" :opts="opts" :chart-data="radarChartData" @get-index="showColumnToolTip" />
        </view>
        <view v-if="analyzeGuide" class="text">
          <AnalyzeTemplate :content="analyzeGuide" />
        </view>
      </view>
    </view>
    <view class="exam-item knowledge">
      <view class="header">
        <view class="header-left">
          <view class="header-left__line" />
          <view class="header-left__title">
            薄弱知识点
          </view>
        </view>
      </view>
      <view class="exam-item__tabs">
        <ITabs :list="subjectList" @change="subjectChange" />
      </view>
      <u-line color="#ededed" margin="0 0 24rpx 0" />
      <view class="exam-item__sub">
        <view class="icon" />共计{{ allData.length }}个知识点
      </view>
      <view class="exam-item__table">
        <view class="tr">
          <view v-for="(item, index) in columns" :key="index" class="th" :style="{ width: item.width }">
            {{ item.name }}
          </view>
        </view>
        <view v-for="(item, index) in tableData" :key="index" class="tr">
          <view v-for="(it, ix) in columns" :key="ix" class="td" @click="jumpCard(item, it.key)">
            <view class="text">
              {{ item[it.key] }}
            </view>
          </view>
        </view>
      </view>
      <view v-if="allData.length > 10" class="exam-item__more" @click="handleMore">
        查看更多
      </view>
    </view>
    <view class="exam-item">
      <view class="exam-item__score">
        <view class="header">
          <view class="header-left">
            <view class="header-left__line" />
            <view class="header-left__title">
              题型得分
            </view>
          </view>
        </view>
        <view class="list">
          <view v-for="(item, index) in chartDataList" :key="index" class="item">
            <view class="chart">
              <qiun-data-charts type="arcbar" :canvas2d="true" :opts="{ ...arcbarOpts, title: { ...arcbarOpts.title, name: item.name } }" :chart-data="item.chartData" />
            </view>
            <view class="score">
              得分率 <text class="active">
                {{ item.scoreRate }}
              </text>
            </view>
          </view>
        </view>
      </view>
      <view class="exam-item__guide">
        <view class="header">
          <view class="header-left">
            <view class="header-left__line" />
            <view class="header-left__title">
              学习指导
            </view>
          </view>
        </view>
        <view class="study">
          <rich-text class="template-content_message" :nodes="studyGuide" />
        </view>
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
import analyzeTemplate from '../../academicReport/components/analyzeTemplate.vue'
import iTabs from '../../../components/i-tabs.vue'
import { improveSpace, subjectBalance } from '../../template/examRecord'
import compareLevel from './compare_level'
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js'

export default {
  components: { AnalyzeTemplate: analyzeTemplate, ITabs: iTabs },
  props: {
    scrollTop: {
      type: Number,
      default: 0,
    },
    detail: {
      type: Object,
      default: () => {},
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
    config: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      analyzeGuide: '',
      studyGuide: '',
      popup: {
        show: false,
      },
      radarChartData: {},
      selectGroup: {},
      tableData: [],
      subject: '',
      allData: [],
      knowledges: [],
      columns: [
        { name: '知识点名称', key: 'name' },
        { name: '错题量', key: 'ques_num' },
        { name: '考试概率', key: 'chance' },
        { name: '中/高考分值', key: 'totalScore' },
      ],
      groupList: [
        { label: '学霸组', value: 1, compareLevel: ['优秀', '中等偏上'] },
        { label: '优秀组', value: 2, compareLevel: ['中等'] },
        { label: '中等组', value: 3, compareLevel: ['中等偏下'] },
        { label: '待提高组', value: 4, compareLevel: ['较差'] },
        { label: '基础薄弱组', value: 5, compareLevel: [] },
      ],
      subjectList: [],
      radarOpts: {
        color: ['#FFBA1D', '#2998FF'],
        dataLabel: false,
        dataPointShape: false,
        fontSize: 12,
        fontColor: '#333333',
        legend: {
          show: true,
          position: 'top',
          float: 'left',
          fontSize: 13,
        },
        extra: {
          radar: {
            gridType: 'radar',
            gridColor: '#CCCCCC',
            opacity: 0.2,
            max: 1,
            border: true,
            gridCount: 5,
            labelShow: true,
          },
          tooltip: {
            legendShow: false,
          },
          gridColor: '#E9E9E9',
        },
      },
      opts: {
        fontSize: 11,
        fontColor: '#333333',
        color: ['#FFBA1D', '#37DA4C'],
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
              min: 0,
              max: 1,
              axisLine: false,
            },
          ],
          disabled: false,
          disableGrid: true,
          splitNumber: 1,
        },
        legend: {
          position: 'top',
          float: 'left',
          margin: 25,
        },
        extra: {
          column: {
            seriesGap: 1,
            barBorderCircle: false,
            barBorderRadius: [4, 4, 0, 0],
            linearType: 'custom',
            customColor: ['#FFC749', '#26C53B'],
            linearOpacity: 0.75,
          },
          tooltip: {
            legendShow: false,
          },
        },
      },
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
      chartDataList: [],
    }
  },
  computed: {
    beProxy() {
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
    examSummary() {
      const { examCount = 0, explain = {} } = this.detail
      const { rankMaxExam = {}, classRankMaxExam = {}, scoreMaxExam = {}, ...arg } = explain
      return {
        ...arg,
        examCount,
        rankMaxExam: { ...rankMaxExam, time: uni.$u.timeFormat(rankMaxExam.time, 'yyyy.mm.dd') },
        scoreMaxExam: { ...scoreMaxExam, time: uni.$u.timeFormat(scoreMaxExam.time, 'yyyy.mm.dd') },
        classRankMaxExam: { ...classRankMaxExam, time: uni.$u.timeFormat(classRankMaxExam.time, 'yyyy.mm.dd') },
      }
    },
  },
  methods: {
    init() {
      this.setRadarChartData()
      this.getknowledges()
      this.getQuestionSummary()
    },
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
    subjectChange({ subject = '' }) {
      const { knowledges = [] } = this.knowledges.find(item => item.subject === subject)
      this.subject = subject
      this.allData = knowledges
      this.tableData = knowledges.slice(0, 10)
    },
    jumpCard(item, key) {
      if (key === 'name') {
        // #ifdef MP-WEIXIN
        uni.navigateTo({ url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}/knowledgePages/paperDetail/knowledgeCard?id=${item.id}`)}` })
        // #endif
        // #ifdef H5
        uni.navigateTo({ url: `/knowledgePages/paperDetail/knowledgeCard?id=${item.id}` })
        // #endif
      }
    },
    handleMore() {
      uni.navigateTo({
        url: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/knowledge',
        success: (res) => {
          res.eventChannel.emit('knowledges', { list: this.knowledges, subject: this.subject })
        },
      })
    },
    async getQuestionSummary() {
      const res = await uni.$http.get(`${this.examProxy}/v4/exam/archives/question-summary`)
      const { questionStatis = {} } = res.data
      const difficultyList = ['容易', '较易', '中等', '较难', '难']
      this.chartDataList = difficultyList.map((item) => {
        const { myScore = 0, score = 0 } = questionStatis[item]
        return {
          ...questionStatis[item],
          name: `${item}题`,
          scoreRate: `${Math.round(myScore / score * 100)}%`,
          chartData: {
            series: [
              { name: item, data: myScore / score },
            ],
          },
        }
      })
      const { explain = {} } = this.detail
      this.studyGuide = improveSpace(this.userInfo.roleType, explain)
    },
    async getknowledges() {
      const res = await uni.$http.get(`${this.beProxy}/v2/practices/weak-knowledges`)
      const { data = [] } = res
      this.knowledges = data.map(item => ({
        ...item,
        knowledges: item.knowledges.map(i => ({
          ...i,
          totalScore: i.score && i.chance ? Math.round(i.score / i.chance) : 0,
          chance: `${Math.round(i.chance * 100)}%`,
        })),
      }))
      this.subjectList = data.map(item => ({ subject: item.subject }))
      this.subjectChange({ subject: this.subjectList[0].subject })
    },
    setRadarChartData() {
      const { papers = [], explain = {} } = this.detail
      this.selectGroup = this.groupList.find(item => item.compareLevel.includes(explain.level))
      this.radarChartData = {
        categories: papers.map(item => item.subject),
        series: [
          { name: '我的得分率', data: papers.map(item => item.avgRate) },
        ],
      }
      this.analyzeGuide = subjectBalance(explain)
      this.setCompareGroup()
    },
    setCompareGroup() {
      const { papers = [] } = this.detail
      const dataObj = {
        name: `${this.selectGroup.label}得分率`,
        data: papers.map((item) => {
          const list = compareLevel[item.subject] || compareLevel._
          return list.find(i => i.level === this.selectGroup.value).rate
        }),
      }
      this.$set(this.radarChartData.series, 1, dataObj)
    },
    showColumnToolTip(e) {
      // #ifdef MP-WEIXIN
      e.event.y -= this.scrollTop
      // #endif
      const index = e.currentIndex.index
      let textList = []
      if (index > -1) {
        const { series = [] } = e.opts
        textList = series.map((item, i) => {
          const text = `${item.name}：${Math.round(series[i].data[index] * 100 || 0)}%`
          return { text, show: item.show }
        })
      }
      uCharts.instance[e.id].showToolTip(
        { changedTouches: [e.event] },
        {
          index,
          textList: textList.filter(v => v.show),
        },
      )
    },
    showRadarToolTip(e) {
      // #ifdef MP-WEIXIN
      e.event && (e.event.y -= this.scrollTop)
      // #endif
      if (e.type === 'complete') {
        const { center, radius } = e.opts.chartData.radarData
        const { pixelRatio } = e.opts
        e.event = { x: center.x / pixelRatio, y: (center.y - radius) / pixelRatio }
      }
      const index = e.currentIndex || 0
      const textList = []
      if (index > -1) {
        const { series = [], categories = [] } = e.opts || {}
        textList.push(...[
          { text: categories[index], show: true },
          { text: `${series[0].name}：${Math.round(series[0].data[index] * 100 || 0)}%`, show: series[0].show },
          { text: `${series[1].name}：${Math.round(series[1].data[index] * 100 || 0)}%`, show: series[1].show },
        ])
      }
      uCharts.instance[e.id].showToolTip(
        { changedTouches: [e.event] },
        {
          index,
          textList: textList.filter(v => v.show),
        },
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.exam {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    &-left {
      display: flex;
      align-items: center;
      &__line {
        width: 8rpx;
        height: 30rpx;
        background: #ffba1d;
        border-radius: 4rpx;
        margin: -2rpx 12rpx 0 0;
      }
      &__title {
        font-size: 28rpx;
        color: #333333;
      }
    }
    &-right {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26rpx;
      color: #333333;
      background: #f8f8f8;
      border-radius: 6rpx;
      padding: 8rpx 20rpx;
      &__icon {
        width: 20rpx;
        height: 10rpx;
        margin-left: 10rpx;
      }
    }
    &.mb-0 {
      margin-bottom: 0;
    }
  }
  &-item {
    background: #ffffff;
    border-radius: 24rpx;
    padding: 32rpx 30rpx;
    margin-bottom: 24rpx;
    &:last-child {
      margin-bottom: 0;
    }
    &__explain {
      position: relative;
      background: #f8f8f8;
      border-radius: 16rpx;
      padding: 20rpx 24rpx;
      margin-bottom: 46rpx;
      .icon {
        position: absolute;
        top: 20rpx;
        right: 16rpx;
        width: 84rpx;
        height: 66rpx;
      }
      .template {
        position: relative;
        z-index: 1;
        .count {
          font-size: 28rpx;
          font-weight: 500;
          color: #333333;
          margin-bottom: 8rpx;
        }
        .text {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 4rpx;
          font-size: 26rpx;
          color: #333333;
          line-height: 44rpx;
          .point {
            width: 8rpx;
            height: 8rpx;
            border-radius: 50%;
            background: #333333;
            margin: 18rpx 10rpx 0 0;
          }
          .yellow {
            color: #ffba1d;
          }
          .red {
            color: #e50000;
          }
          .green {
            color: #00c81f;
          }
        }
      }
    }
    &__tabs {
      padding: 0 10rpx;
    }
    &__sub {
      padding: 0 30rpx;
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #333333;
      margin-bottom: 20rpx;
      .icon {
        width: 18rpx;
        height: 18rpx;
        background: #ffba1d;
        border-radius: 50%;
        margin-right: 10rpx;
      }
    }
    &__table {
      padding: 0 30rpx;
      border-radius: 24rpx;
      overflow: visible;
      margin-bottom: 24rpx;
      .tr {
        display: flex;
        &:nth-child(2n) {
          background: #ffffff;
        }
        &:nth-child(2n - 1) {
          background: #f8f8f8;
        }
      }
      .th,
      .td {
        flex: 1;
        padding: 15rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 66rpx;
        background: none;
        width: 25%;
        .text {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
      .th {
        font-size: 22rpx;
        color: #939393;
      }
      .td {
        color: #333333;
        font-size: 24rpx;
        .icon {
          width: 28rpx;
          height: 28rpx;
          margin-right: 4rpx;
          &:last-child {
            margin-right: 0;
          }
        }
      }
      .tr {
        .td:first-child {
          font-size: 24rpx;
          color: #599afc;
          display: flex;
          justify-content: flex-start;
        }
      }
    }
    &__more {
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 200rpx;
      height: 72rpx;
      font-size: 28rpx;
      font-weight: 500;
      color: #ffffff;
      text-shadow: 0 0 12rpx 0 rgba(255, 169, 50, 0.2);
      background: linear-gradient(225deg, #ffc749, #ffba1d);
      border-radius: 36rpx;
      box-shadow: 0 0 12rpx 0 rgba(255, 169, 50, 0.2);
    }
    &__score {
      .list {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        .item {
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
          font-size: 24rpx;
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
    &__guide {
      .study {
        background: #f8f8f8;
        border-radius: 16rpx;
        padding: 20rpx 24rpx;
        font-size: 26rpx;
        color: #333333;
        line-height: 44rpx;
      }
    }
  }
  .knowledge {
    padding: 32rpx 0;
    .header {
      padding: 0 30rpx;
      margin-bottom: 0;
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
      font-size: 32rpx;
      color: #333333;
      height: 95rpx;
    }
    &-item {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
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
  .mb-24 {
    margin-bottom: 40rpx;
  }
}
</style>
