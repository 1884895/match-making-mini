<template>
  <view class="express">
    <view class="express-list">
      <view class="express-list__item">
        <view class="header score">
          <view class="header-left">
            <view class="header-left__line" />
            <view class="header-left__title">
              成绩趋势
            </view>
          </view>
        </view>
        <view class="exam mb-24">
          <view class="left">
            {{ currentScore.type || '' }}{{ $u.timeFormat(currentScore.eventTime, 'yyyy-mm-dd') }}
          </view>
          <view v-if="currentScore.scoreType && currentScore.scoreType !== 1" class="exam-text">
            成绩：<text class="value">
              {{ currentScore.score || '' }}
            </text>
          </view>
        </view>
        <view class="chart">
          <qiun-data-charts type="line" :canvas2d="true" :ontouch="true" :in-scroll-view="true" :page-scroll-top="scrollTop" :tooltip-show="false" :opts="detaultLineOpts" :chart-data="scoreChartData" @get-index="showToolTip" />
        </view>
      </view>
      <view class="express-list__item">
        <view class="header">
          <view class="header-left">
            <view class="header-left__line" />
            <view class="header-left__title">
              排名趋势
            </view>
          </view>
        </view>
        <view class="exam mb-24">
          <view class="left">
            {{ currentRank.type || '' }}{{ $u.timeFormat(currentRank.eventTime, 'yyyy-mm-dd') }}
          </view>
          <view v-if="currentRank.rankType && currentRank.rankType !== 1" class="right">
            <view class="exam-text">
              班级{{ rankNameMap[currentRank.rankType] }}: <text class="value">
                {{ currentRank.classRank || '' }}
              </text>
            </view>
            <view class="exam-text ml-16">
              年级{{ rankNameMap[currentRank.rankType] }}: <text class="value">
                {{ currentRank.gradeRank || '' }}
              </text>
            </view>
          </view>
        </view>
        <view class="chart">
          <qiun-data-charts type="line" :canvas2d="true" :ontouch="true" :in-scroll-view="true" :page-scroll-top="scrollTop" :tooltip-show="false" :opts="{ ...detaultLineOpts, ...rankLineOpts }" :chart-data="rankChartData" @get-index="showToolTip" />
        </view>
      </view>
      <view class="express-list__item">
        <view class="header statistics">
          <view class="header-left">
            <view class="header-left__line" />
            <view class="header-left__title">
              考试统计
            </view>
          </view>
        </view>
        <view v-if="types.length" class="chart circle">
          <view class="ring">
            <qiun-data-charts type="ring" :canvas2d="true" :animation="animation" :in-scroll-view="true" :page-scroll-top="scrollTop" :opts="ringOpts" :chart-data="ringChartData" @get-index="getIndex" />
            <view class="title">
              <view class="title-type">
                {{ currentExamItem.type }}
              </view>
              <view class="title-rate">
                {{ currentExamItem.count }}
              </view>
              <view class="title-score">
                {{ currentExamItem.rate }}
              </view>
            </view>
          </view>
          <view class="legend">
            <view v-for="(item, index) in ringLegendData" :key="index" class="item" :class="[item.show ? '' : 'item-hide']" @click="tapLegend(index)">
              <view class="item-icon" :style="{ backgroundColor: ringOpts.color[index] }" />
              <view class="item-text">
                {{ item.name }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="express-single">
      <view class="title">
        单科表现
      </view>
      <view class="tabs">
        <ITabs :list="papers" @change="subjectChange" />
      </view>
      <u-line color="#ededed" margin="0 0 24rpx 0" />
      <view class="detail">
        <view v-for="(item, index) in detailList" :key="index" class="detail-item">
          <view class="detail-item__score">
            {{ currentPaper[item.key] || '-' }}
          </view>
          <view class="detail-item__name">
            {{ item.name }}
          </view>
        </view>
      </view>
      <view class="exam">
        <view class="left">
          {{ currentExpress.type || '' }}{{ $u.timeFormat(currentExpress.eventTime, 'yyyy-mm-dd') }}
        </view>
        <view class="flex-column-end">
          <view v-if="currentExpress.scoreType !== 1" class="exam-text mb-10">
            成绩：<text class="value">
              {{ currentExpress.score || '' }}
            </text>
          </view>
          <view v-if="currentExpress.rankType !== 1" class="flex-row-end">
            <view class="exam-text">
              班级{{ rankNameMap[currentExpress.rankType] }}: <text class="value">
                {{ currentExpress.classRank || '' }}
              </text>
            </view>
            <view class="exam-text ml-16">
              年级{{ rankNameMap[currentExpress.rankType] }}: <text class="value">
                {{ currentExpress.gradeRank || '' }}
              </text>
            </view>
          </view>
        </view>
      </view>
      <view class="chart">
        <qiun-data-charts type="line" :canvas2d="true" :ontouch="true" :in-scroll-view="true" :page-scroll-top="scrollTop" :tooltip-show="false" :opts="{ ...detaultLineOpts, ...expressLineOpts }" :chart-data="expressChartData" @get-index="showToolTip" />
      </view>
    </view>
  </view>
</template>

<script>
import iTabs from '../../../components/i-tabs.vue'
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js'

export default {
  components: { ITabs: iTabs },
  props: {
    scrollTop: {
      type: Number,
      default: 0,
    },
    detail: {
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
      animation: true,
      currentExamItem: {},
      rankNameMap: { 2: '排名', 3: '击败率', 4: '排名' },
      examList: [],
      ringLegendData: [],
      currentScore: {},
      currentRank: {},
      currentExpress: {},
      scoreChartData: {},
      rankChartData: {},
      ringChartData: {},
      expressChartData: {},
      papers: [],
      currentPaper: {},
      types: [],
      detailList: [
        { name: '最高分数', key: 'scoreMax' },
        { name: '平均分数', key: 'scoreAvg' },
        { name: '最高班级排名', key: 'classRankMax' },
        { name: '最高年级排名', key: 'gradeRankMax' },
      ],
      detaultLineOpts: {
        padding: [19, 0, 0, 0],
        color: ['#FFC50C'],
        fontSize: 11,
        fontColor: '#333333',
        enableScroll: true,
        dataLabel: false,
        xAxis: {
          axisLineColor: '#EDEDED',
          fontColor: '#333333',
          fontSize: 11,
          itemCount: 4,
          scrollAlign: 'right',
        },
        yAxis: {
          showTitle: true,
          gridType: 'dash',
          axisLine: false,
          gridColor: '#EDEDED',
          dashLength: 6,
          splitNumber: 4,
          data: [
            {
              axisLine: false,
              min: 0,
              max: 100,
              unit: '%',
              title: '得分率',
              titleOffsetY: -5,
            },
          ],
        },
        legend: {
          show: false,
        },
        extra: {
          line: {
            activeType: 'hollow',
            linearType: 'custom',
            onShadow: true,
          },
          tooltip: {
            legendShow: false,
            borderRadius: 4,
            fontSize: 11,
          },
        },
      },
      rankLineOpts: {
        color: ['#FFC50C', '#33D548'],
        padding: [-20, 0, 0, 0],
        yAxis: {
          showTitle: true,
          gridType: 'dash',
          axisLine: false,
          gridColor: '#EDEDED',
          dashLength: 6,
          splitNumber: 4,
          data: [
            {
              axisLine: false,
              min: 0,
              max: 100,
              unit: '%',
              title: '击败率',
              titleOffsetY: -5,
            },
          ],
        },
        legend: {
          show: true,
          position: 'top',
          float: 'left',
          padding: 5,
          margin: 20,
        },
      },
      expressLineOpts: {
        yAxis: {
          showTitle: true,
          gridType: 'dash',
          axisLine: false,
          gridColor: '#EDEDED',
          dashLength: 6,
          splitNumber: 4,
          data: [
            {
              axisLine: false,
              min: 0,
              max: 100,
              unit: '%',
              title: '击败率',
              titleOffsetY: -5,
            },
          ],
        },
      },
      ringOpts: {
        update: true,
        fontSize: 10,
        fontColor: '#333',
        dataLabel: false,
        padding: [0, 5, 0, 0],
        color: ['#73C0DE', '#1990FF', '#92CB74', '#FAC858', '#EE6666'],
        legend: {
          show: false,
        },
        title: { name: '' },
        subtitle: { name: '' },
        extra: {
          ring: {
            ringWidth: 20,
            activeRadius: 4,
            borderWidth: 1,
            offsetAngle: -90,
          },
          tooltip: {
            showBox: false,
            legendShow: false,
          },
        },
      },
    }
  },
  methods: {
    init() {
      this.setTrendData()
      this.setStatisticsData()
      this.setExpressData()
    },
    subjectChange({ subject = '' }) {
      this.currentPaper = this.papers.find(item => item.subject === subject)
      this.setExpressChartData()
    },
    getIndex({ currentIndex }) {
      currentIndex !== -1 && this.setCurrentExamItem(this.types[currentIndex])
    },
    tapLegend(index) {
      // 注意这里关闭了加载动画，不然点击图例会执行动画效果
      this.animation = false
      this.ringLegendData[index].show = !this.ringLegendData[index].show
      const chartData = {
        series: [
          {
            data: this.ringLegendData,
          },
        ],
      }
      // 这里可以看出，只需要动态改变chartData.series.data.show（饼图类）chartData.series.show（其他图）即可动态改变图形显示与隐藏
      this.ringChartData = JSON.parse(JSON.stringify(chartData))
    },
    setCurrentExamItem(detail = {}) {
      this.currentExamItem = {
        type: `${detail.type}考试`,
        count: `${detail.count}场`,
        rate: `${detail.rate}%`,
      }
    },
    showToolTip(e) {
      const { opts: { series = [] }, event, id, currentIndex } = e
      const index = currentIndex.index
      const textList = []
      // #ifdef MP-WEIXIN
      event.y -= this.scrollTop
      // #endif
      if (index > -1) {
        const { labelText, clickType, list } = series[0]
        this[clickType] = list[index]
        textList.push({ text: labelText[index] })
      }
      uCharts.instance[id].showToolTip(
        { changedTouches: [event] },
        {
          index,
          textList,
        },
      )
    },
    setTrendData() {
      // 获取当前时间时间戳
      const { list = [] } = this.detail
      const categories = list.map((item, index) => `第${index + 1}次`)
      const labelText = list.map(item => item.type)
      const data = list.map(item => item.scoreRate)
      const classRankDefeat = list.map(item => item.classBeat)
      const gradeRankDefeat = list.map(item => item.gradeBeat)

      this.scoreChartData = {
        categories,
        series: [
          {
            name: '',
            labelText,
            data,
            linearColor: [[0, '#FF9305'], [1, '#FFC50C']],
            clickType: 'currentScore',
            list,
          },
        ],
      }
      this.rankChartData = {
        categories,
        series: [
          {
            name: '班级',
            linearColor: [[0, '#FF9305'], [1, '#FFC50C']],
            labelText,
            legendShape: 'circle',
            data: classRankDefeat,
            clickType: 'currentRank',
            list,
          },
          {
            name: '年级',
            linearColor: [[0, '#26C53B'], [1, '#33D548']],
            labelText,
            legendShape: 'circle',
            data: gradeRankDefeat,
            clickType: 'currentRank',
            list,
          },
        ],
      }
      this.currentScore = list[list.length - 1]
      this.currentRank = list[list.length - 1]
    },
    setStatisticsData() {
      const { types = [] } = this.detail
      this.types = types
      this.ringChartData = {
        series: [
          {
            data: types.map((item) => {
              return { name: `${item.type}考试${item.count}场，占比${item.rate}%`, value: item.count, show: true }
            }),
          },
        ],
      }
      this.ringLegendData = this.ringChartData.series[0].data
      this.setCurrentExamItem(this.types[0])
    },
    setExpressData() {
      const { papers = [] } = this.detail
      this.papers = papers
      this.currentPaper = this.papers[0]
      this.setExpressChartData()
    },
    setExpressChartData() {
      const { list = [] } = this.currentPaper
      const categories = list.map((item, index) => `第${index + 1}次`)
      const labelText = list.map(item => item.type)
      const data = list.map(item => item.gradeBeat)
      this.expressChartData = {
        categories,
        series: [
          {
            name: '',
            labelText,
            data,
            linearColor: [[0, '#FF9305'], [1, '#FFC50C']],
            clickType: 'currentExpress',
            list,
          },
        ],
      }
      this.currentExpress = list[list.length - 1]
    },
  },
}
</script>

<style lang="scss" scoped>
.express {
  .exam {
    display: flex;
    justify-content: space-between;
    background: linear-gradient(180deg, #fff9e7, #ffffff 45%);
    border-radius: 8rpx;
    box-shadow: 0 0 12rpx 0 rgba(0, 0, 0, 0.1);
    padding: 12rpx 20rpx 14rpx;
    .left {
      font-size: 22rpx;
      color: #333333;
      padding-top: 4rpx;
    }
    .right {
      display: flex;
    }
    .flex-column-end {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .flex-row-end {
      display: flex;
      align-items: flex-end;
    }
    &-text {
      font-size: 22rpx;
      color: #939393;
      .value {
        font-size: 26rpx;
        color: #333333;
      }
    }
    .ml-16 {
      margin-left: 16rpx;
    }
    .mb-10 {
      margin-bottom: 10rpx;
    }
  }
  .mb-24 {
    margin-bottom: 24rpx;
  }
  &-list {
    background: #ffffff;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    padding: 36rpx 30rpx;
    &:last-child {
      margin-bottom: 0;
    }
    &__item {
      margin-bottom: 40rpx;
      &:last-child {
        margin-bottom: 0;
      }
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
      }
      .statistics {
        margin-bottom: 0;
      }
      .circle {
        display: flex;
        .ring {
          width: 40%;
          height: 300rpx;
          position: relative;
          margin-right: 20rpx;
          .title {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #333;
            text-align: center;
            z-index: 1;
            white-space: nowrap;
            &-type {
              font-size: 26rpx;
            }
            &-rate {
              font-size: 20rpx;
            }
            &-score {
              font-size: 20rpx;
            }
          }
        }
        .legend {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          .item {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            margin-bottom: 5px;
            &:last-child {
              margin-bottom: 0;
            }
            &-icon {
              width: 24rpx;
              height: 24rpx;
              border-radius: 50%;
              margin-right: 4rpx;
            }
            &-text {
              font-size: 22rpx;
              color: black;
            }
            &-hide {
              filter: grayscale(100%);
              .item-text {
                color: #aaaaaa;
              }
            }
          }
        }
      }
      .score {
        margin-bottom: 20rpx;
      }
    }
  }
  &-single {
    background: #ffffff;
    border-radius: 24rpx;
    padding: 32rpx 0 44rpx;
    .title {
      padding: 0 30rpx;
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
    .tabs {
      padding: 0 10rpx;
    }
    .detail {
      margin: 0 30rpx 24rpx 30rpx;
      background: #f8f8f8;
      border-radius: 16rpx;
      padding: 32rpx 20rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        &__score {
          font-size: 28rpx;
          color: #333333;
        }
        &__name {
          font-size: 22rpx;
          color: #939393;
        }
      }
    }
    .exam {
      margin: 0 30rpx 24rpx 30rpx;
      .flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    .chart {
      margin: 0 30rpx;
    }
  }
}
</style>
