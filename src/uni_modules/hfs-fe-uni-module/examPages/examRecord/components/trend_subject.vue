<template>
  <view class="score">
    <view class="score-chart">
      <view v-if="!isExamMember" class="mask" :style="[maskStyle]">
        <image class="mask-pic" :src="`${resourceUrl}trend_score_member.png`" mode="aspectFill" />
      </view>
      <template v-if="chartData.categories && chartData.categories.length">
        <qiun-data-charts type="line" :canvas2d="true" :ontouch="isExamMember" :in-scroll-view="true" :page-scroll-top="scrollTop" :tooltip-show="false" :opts="{ ...detaultOpts, ...subjectOpts }" :chart-data="chartData" @get-index="showToolTip" @complete="mixComplete" />
      </template>
    </view>
    <view class="score-content">
      <TrendTable :table-data="tableData" :options="options" :show-header="true" />
    </view>
  </view>
</template>

<script>
import trendTable from './trend_table.vue'
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js'

export default {
  components: { TrendTable: trendTable },
  props: {
    papers: {
      type: Array,
      default: () => [],
    },
    detaultOpts: {
      type: Object,
      default: () => ({}),
    },
    scrollTop: {
      type: Number,
      default: 0,
    },
    examDetail: {
      type: Object,
      default: () => ({}),
    },
    isExamMember: {
      type: Boolean,
      default: false,
    },
    resourceUrl: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      maskStyle: {}, // 图表遮罩样式
      currentIndex: 0,
      subjectOpts: {
        padding: [-20, 5, 0, 0],
        xAxis: {
          axisLineColor: '#EDEDED',
          fontColor: '#ffffff',
          fontSize: 11,
          itemCount: 4,
          scrollAlign: 'right',
        },
        yAxis: {
          showTitle: true,
          splitNumber: 3,
          gridType: 'dash',
          gridColor: '#D4D4D4',
          dashLength: 6,
          data: [
            {
              title: '得分率',
              axisLine: false,
              unit: '%',
              min: 0,
              max: 100,
              format: 'yAxisFixed',
              titleOffsetY: -5,
            },
          ],
        },
        legend: {
          show: true,
          position: 'top',
          float: 'left',
          fontSize: 13,
          fontColor: '#333333',
          margin: 20,
          itemGap: 20,
          lineHeight: 20,
        },
      },
    }
  },
  computed: {
    maxList() {
      return this.papers.reduce((pre, cur) => {
        return pre.length > cur.list.length ? pre : cur.list
      }, [])
    },
    papersList() {
      return this.papers.map((item) => {
        return { ...item, list: [...Array.from({ length: this.maxList.length - item.list.length }).fill({ scoreRate: null }), ...item.list] }
      })
    },
    options() {
      return [
        { label: '学科', key: 'subject', show: true },
        { label: '分数', key: 'score', show: this.isExamMember },
        { label: '得分率', key: 'scoreRate', show: this.isExamMember },
      ]
    },
    tableData() {
      const list = []
      this.papersList.forEach((item) => {
        const it = item.list[this.currentIndex] || {}
        if (it.score !== undefined) {
          list.push({ subject: item.subject, score: it.score, scoreUnit: `/${it.manfen}`, scoreRate: it.scoreRate, scoreRateUnit: '%' })
        }
      })
      return list
    },
    chartData() {
      const colorList = ['#FFDBD3', '#FFEADC', '#B9EDFF', '#DCDEFF', '#DBF3FF', '#D7E6FF', '#DFFFD2', '#CBF0E4', '#FFEDCD', '#BCEDE9', '#BDD3BC', '#B3D8EC', '#B9D0FF', '#E9C4F1']
      const betterColor = '#36D34E'
      const weakerColor = '#E50000'
      const { explain = {} } = this.examDetail
      return {
        categories: this.maxList.map((item, index) => index),
        series: this.papersList.map((item, index) => {
          return {
            name: item.subject,
            data: item.list && item.list.length ? item.list.map(it => it.scoreRate) : [],
            legendShape: 'circle',
            color: item.subject === explain.better ? betterColor : item.subject === explain.weaker ? weakerColor : colorList[index],
          }
        }),
      }
    },
  },
  methods: {
    mixComplete(e) {
      const { area, pix } = e.opts
      const [top, right, bottom, left] = area.map(v => `${v / pix}px`)
      this.maskStyle = { top, right, bottom, left }
      if (this.isExamMember) {
        const { categories } = e.opts
        const index = categories[categories.length - 1]
        const calPoints = e.opts.chartData.calPoints[0] || []
        e.currentIndex = { index }
        e.event = calPoints[e.currentIndex.index]
        this.showToolTip(e)
      }
    },
    showToolTip(e) {
      // #ifdef MP-WEIXIN
      e.event.y -= this.scrollTop
      // #endif
      const textList = []
      const index = e.currentIndex.index
      if (index > -1) {
        const { series } = e.opts
        this.currentIndex = index
        series.forEach((item) => {
          const subjectItemList = this.papersList.find(paper => paper.subject === item.name).list
          if (subjectItemList[index].score && subjectItemList[index].manfen) {
            textList.push({ text: `${item.name}：${subjectItemList[index].score}/${subjectItemList[index].manfen}` })
          }
        })
      }
      uCharts.instance[e.id].showToolTip(
        { changedTouches: [e.event] },
        { index, textList },
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.score {
  &-chart {
    position: relative;
    height: 480rpx;
    margin-bottom: 36rpx;
    .mask {
      position: absolute;
      z-index: 100;
      background-color: #ffffff;
      &-pic {
        width: 100%;
        height: 100%;
      }
    }
  }
  &-content {
    ::v-deep .table {
      .table-content__list {
        .td:last-child {
          box-shadow: none;
        }
      }
    }
  }
}
</style>
