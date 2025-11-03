<template>
  <view class="score">
    <view class="score-chart">
      <view v-if="!isExamMember" class="mask" :style="[maskStyle]">
        <image class="mask-pic" :src="`${resourceUrl}trend_score_member.png`" />
      </view>
      <template v-if="chartData.categories && chartData.categories.length">
        <qiun-data-charts type="area" :canvas2d="true" :ontouch="isExamMember" :in-scroll-view="true" :page-scroll-top="scrollTop" :tooltip-show="false" :opts="{ ...detaultOpts, ...scoreOpts }" :chart-data="chartData" @get-index="showToolTip" @complete="mixComplete" />
      </template>
    </view>
    <view class="score-content">
      <TrendTable :table-data="tableData" :exam-item="examItem" :options="options" />
    </view>
  </view>
</template>

<script>
import trendTable from './trend_table.vue'
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js'

export default {
  components: { TrendTable: trendTable },
  props: {
    examList: {
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
      currentIndex: 0,
      maskStyle: {}, // 图表遮罩样式
    }
  },
  computed: {
    options() {
      return [
        { label: '类别', key: 'type', show: true },
        { label: '值', key: 'value', show: this.isExamMember },
      ]
    },
    examItem() {
      return this.examList[this.currentIndex] || {}
    },
    tableData() {
      const { score = 0, manfen = 0, scoreRate = 0, paperCount = 0, eventTime = '' } = this.examItem
      return [
        { type: '成绩', value: score, valueUnit: `/${manfen}` },
        { type: '得分率', value: scoreRate, valueUnit: '%' },
        { type: '考试科目', value: paperCount, valueUnit: '科' },
        { type: '考试时间', value: eventTime ? uni.$u.timeFormat(eventTime, 'yyyy.mm.dd') : '', valueUnit: '' },
      ]
    },
    chartData() {
      const list = this.examList
      const categories = list.map(item => this.formatTimestamp(item.eventTime))
      const labelText = list.map(item => item.type)
      const data = list.map(item => item.rscore)
      return {
        categories,
        series: [
          { name: '', labelText, data },
        ],
      }
    },
    scoreOpts() {
      const manfenData = this.examList.map(item => item.manfen)
      const max = Math.max(...manfenData)
      return {
        yAxis: {
          showTitle: false,
          gridType: 'dash',
          gridColor: '#D4D4D4',
          dashLength: 6,
          splitNumber: 3,
          data: [
            {
              axisLine: false,
              min: 0,
              max,
              format: 'yAxisFixed',
            },
          ],
        },
      }
    },
  },
  methods: {
    mixComplete(e) {
      const { area, pix } = e.opts
      const [top, right, bottom, left] = area.map(v => `${v / pix}px`)
      this.maskStyle = { top, right, bottom, left }
      if (this.isExamMember) {
        const index = this.examList.length - 1
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
        this.currentIndex = index
        const { type, eventTime, score, manfen, paperCount } = this.examItem
        textList.push(...[
          {
            text: `${type}考试${uni.$u.timeFormat(eventTime, 'yyyy.mm.dd')}`,
          },
          { text: `成绩：${score}/${manfen}` },
          {
            text: `科目：${paperCount}科`,
          },
        ])
      }
      uCharts.instance[e.id].showToolTip(
        { changedTouches: [e.event] },
        { index, textList },
      )
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    },
  },
}
</script>

<style lang="scss" scoped>
.score {
  &-chart {
    position: relative;
    height: 420rpx;
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
}
</style>
