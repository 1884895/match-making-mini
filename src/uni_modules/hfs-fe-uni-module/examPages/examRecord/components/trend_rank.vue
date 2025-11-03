<template>
  <view class="score">
    <view class="score-chart">
      <view v-if="!isExamMember" class="mask" :style="[maskStyle]">
        <image class="mask-pic" :src="`${resourceUrl}trend_rank_member.png`" />
      </view>
      <template v-if="chartData.categories && chartData.categories.length">
        <qiun-data-charts type="line" :canvas2d="true" :ontouch="isExamMember" :in-scroll-view="true" :page-scroll-top="scrollTop" :tooltip-show="false" :opts="{ ...detaultOpts, ...rankOpts }" :chart-data="chartData" @get-index="showToolTip" @complete="mixComplete" />
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
      rankOpts: {
        color: ['#C7D1FF', '#ADF1F0'],
        padding: [-20, 5, 0, 0],
        yAxis: {
          showTitle: true,
          splitNumber: 3,
          gridType: 'dash',
          gridColor: '#D4D4D4',
          dashLength: 6,
          data: [
            {
              title: '击败率',
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
        },
      },
    }
  },
  computed: {
    examItem() {
      return this.examList[this.currentIndex] || {}
    },
    options() {
      return [
        { label: '类别', key: 'type', show: true },
        { label: '值', key: 'value', show: this.isExamMember },
      ]
    },
    tableData() {
      const { gradeRank = '', classRank = '', gradeBeat = 0, gradeStuNum = 0, eventTime = '', rankType } = this.examItem
      const name = this.getTypeMap(rankType)
      return [
        { type: `年级${name}`, value: gradeRank, valueUnit: '' },
        { type: `班级${name}`, value: classRank, valueUnit: '' },
        { type: '年级击败率', value: gradeBeat, valueUnit: '%' },
        { type: '考试总人数', value: gradeStuNum, valueUnit: '' },
        { type: '考试时间', value: eventTime ? uni.$u.timeFormat(eventTime, 'yyyy.mm.dd') : '', valueUnit: '' },
      ]
    },
    chartData() {
      const list = this.examList
      const categories = list.map(item => this.formatTimestamp(item.eventTime))
      const labelText = list.map(item => item.type)
      const classBeat = list.map(item => item.classBeat)
      const gradeBeat = list.map(item => item.gradeBeat)
      return {
        categories,
        series: [
          { name: '班级', labelText, data: classBeat, legendShape: 'circle' },
          { name: '年级', labelText, data: gradeBeat, legendShape: 'circle' },
        ],
      }
    },
  },
  methods: {
    getTypeMap(rankType) {
      const typeMap = { 2: '排名', 3: '击败率', 4: '排名', 5: '排名', 6: '击败率' }
      return typeMap[rankType] || '排名'
    },
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
        const { type, eventTime, gradeRank, classRank, rankType } = this.examItem
        textList.push(...[
          {
            text: `${type}考试${uni.$u.timeFormat(eventTime, 'yyyy.mm.dd')}`,
          },
          {
            text: `年级${this.getTypeMap(rankType)}：${gradeRank}`,
          },
          {
            text: `班级${this.getTypeMap(rankType)}：${classRank}`,
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
    height: 456rpx;
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
