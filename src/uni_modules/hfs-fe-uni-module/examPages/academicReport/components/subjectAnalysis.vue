<template>
  <view>
    <slot />
    <view class="analysis" style="margin-top: 26rpx">
      <!-- 头部 -->
      <view class="analysis-header">
        <view class="analysis-header__tip">
          学科优劣势
        </view>
        <view style="display: flex;">
          <image
            style="height: 40rpx;"
            :src="`${resourceUrl}icon_subject_pk.png`"
            mode="heightFix"
          />
          <view class="options">
            <view class="options-item" :class="{ active: selectedItem === '年级' }" @click="close('年级', 'ks_cjzl_Bnj')">
              年级
            </view>
            <view class="options-item" :class="{ active: selectedItem === '班级' }" @click="close('班级', 'ks_cjzl_Bbj')">
              班级
            </view>
          </view>
        </view>
      </view>
      <!-- 学科优劣势分析 -->
      <view style="margin-top: 16rpx; overflow: hidden">
        <view v-for="(item, index) in legendData" :key="index" class="item" @click="tapLegend(index)">
          <view class="item-icon" :style="{ backgroundColor: legendColor[index] }" :class="[item.show ? '' : 'item-hide']" />
          <view class="item-text item-text-legend">
            <view :class="[item.show ? '' : 'item-hide']">
              {{ item.name }}
            </view>
            <view class="tip">
              <IMask :nodes="tipsList[index].value" :show="visibility" />
            </view>
          </view>
        </view>
        <view v-if="radarVisible" class="analysis-charts">
          <!-- #ifdef H5 -->
          <template v-if="visibility">
            <image v-for="(item, index) in chartsleader" :key="index" class="analysis-charts-tag" :src="`${resourceUrl}${item.pic === 2 ? 'icon_sub_leader' : 'icon_sub_behind'}.png`" :style="item" />
          </template>
          <!-- #endif -->
          <view class="analysis-radar" :class="{ 'analysis-wx-radar': isWX }">
            <qiun-data-charts
              type="radar"
              :opts="radarOpts"
              :ontouch="true"
              :canvas2d="true"
              :in-scroll-view="true"
              :tooltip-show="false"
              :animation="animation"
              :page-scroll-top="scrollTop"
              :chart-data="radarData"
              @get-index="showRadarToolTip"
              @complete="showRadarToolTip"
            />
          </view>
          <view v-if="!visibility" class="analysis-weaker">
            <image
              style="height: 68rpx"
              mode="heightFix"
              :src="`${resourceUrl}icon_what_weaker.png`"
            />
          </view>
        </view>
        <view v-else class="analysis-charts analysis-dis" style="margin-top: 36rpx">
          <template v-if="visibility">
            <image v-for="(item, index) in chartsleader" :key="index" class="analysis-charts-tag" :src="`${resourceUrl}${item.pic === 2 ? 'icon_sub_leader' : 'icon_sub_behind'}.png`" :style="{ left: `${item.px}px` }" />
          </template>
          <view v-if="!visibility" class="analysis-charts-mask" :style="[maskStyle]">
            <image class="analysis-charts-mask__pic" :src="`${resourceUrl}icon_mask_weaker_level.png`" mode="widthFix" />
          </view>
          <view style="height: 280rpx; width: 100%; display: flex;">
            <qiun-data-charts
              type="column"
              :opts="radarChartOpts"
              :ontouch="true"
              :canvas2d="true"
              :in-scroll-view="true"
              :tooltip-show="false"
              :page-scroll-top="scrollTop"
              :chart-data="radarData"
              @get-index="showColumnToolTip"
              @complete="mixComplete"
            />
          </view>
        </view>
      </view>
      <view v-if="compareGuideText && compareGuideText.length > 0" class="analyze" style="margin-top: 22rpx; font-size: 28rpx">
        <AnalyzeTemplate :custom="true">
          <view class="item-text">
            <view class="explain">
              “通过直观对比学生各学科与年级/班级平均水平的优劣势，及时预警偏科、纠正偏科，保障学生各科全面发展！”
            </view>
            <IMask :show="visibility" :nodes="compareGuideText" />
          </view>
        </AnalyzeTemplate>
      </view>
      <UnlockMember title="解锁本次考试薄弱学科" :visible="visibility" event-id="ks_cjzl_xkyls_ljkt_pay" />
    </view>
  </view>
</template>

<script>
import IMask from '../../../components/i-mask.vue'
import { summarySubjectStrengthAndWeakness } from '../../template/gradeSummary.js'
import analyzeTemplate from './analyzeTemplate.vue'
import unlockMember from './unlockMember.vue'
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js'
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { AnalyzeTemplate: analyzeTemplate, IMask, UnlockMember: unlockMember },
  props: {
    examId: {
      type: String,
      default: '',
    },
    scrollTop: {
      type: Number,
      default: 0,
    },
    showChart: {
      type: Boolean,
      default: true,
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
    config: {
      type: Object,
      default: () => { },
    },
    examDetail: {
      type: Object,
      default: () => { },
    },
  },
  data() {
    return {
      chartsleader: [],
      maskStyle: {},
      sameMaskStyle: {},
      mockDdKeys: ['classAvgRankPart', 'classRankPart', 'gradeAvgRankPart', 'gradeRankPart'],
      mockKeys: ['classAvgBeat', 'classBeat', 'gradeAvgBeat', 'gradeBeat'],
      mockData: `
      {
        "examClassBeat": 75,
        "classRankPart": "B2",
        "examGradeBeat": 57,
        "gradeRankPart": "B4",
        "paper":
            {
                "className": "479",
                "gradeCompare": 0,
                "gradeCompare": 1,
                "paperId": "8981443-17",
                "subject": "英语",
                "score": "95.5",
                "manfen": 100,
                "subPaperType": 0,
                "gradeAvg": "60",
                "gradeBeat": 91,
                "gradeRankPart": "A4",
                "classAvg": "60",
                "classBeat": 100,
                "classRankPart": "A1",
                "sameGroupAvg": "79.5",
                "sameGroupAvgBeat": 50,
                "sameGroupBeat": 100,
                "subjectContribution": 0.19,
                "classRank": "100%",
                "classStuNum": 49,
                "gradeRank": "91%",
                "gradeStuNum": 1691,
                "sameGroupRank": 1,
                "sameGroupStuNum": 98,
                "groupKey": "all",
                "difficulty": 0.69,
                "difficultyLevel": "中等",
                "gradeAvgRank": 978,
                "gradeCompare": 2,
                "classAvgRank": 30,
                "classCompare": 2,
                "contribution": 0.49,
                "gradeAvgRankPart": "C2",
                "classAvgRankPart": "C2",
                "gradeAvgBeat": 42,
                "classAvgBeat": 39,
                "cheatOrgScore": "95.5"
          }
      }`,
      gradMaxY: 60,
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
      showColumnChart: true,
      radarVisible: true,
      paperAnalysis: {},
      selectedItem: '年级',
      radarData: {}, // stageRank同分数段被屏蔽时，雷达图不再展示
      legendData: [],
      animation: true,
      tipsList: [],
      radarOpts: {
        padding: [0, 0, 0, 0],
        // color: ['#FFBA1D', '#2998FF'],
        dataLabel: false, // 是否显示图表y轴数据
        enableScroll: false,
        dataPointShape: false,
        fontSize: 11,
        fontColor: '#939393',
        legend: {
          show: false,
        },
        extra: {
          radar: {
            gridType: 'radar',
            gridColor: '#D4D4D4',
            gridCount: 3,
            opacity: 0.2,
            labelShow: true,
            border: true,
            borderWidth: 2,
          },
          tooltip: {
            legendShow: false,
            borderRadius: 4,
          },
        },
      },
      baseOps: {
        dataLabel: false,
        fontColor: '#939393',
        fontSize: 11,
        legend: {
          margin: 18,
          position: 'top',
          float: 'left',
        },
        xAxis: {
          marginTop: 6,
          axisLine: false,
          disableGrid: true,
          fontSize: 11,
          itemCount: 4,
          fontColor: '#939393',
        },
        extra: {
          column: {
            linearType: 'opacity',
            linearOpacity: '0.75',
            type: 'group',
            width: 15,
            activeBgColor: '#000000',
            activeBgOpacity: 0.08,
            seriesGap: 2,
            barBorderRadius: [
              3.5,
              3.5,
              0,
              0,
            ],
          },
          tooltip: {
            legendShape: 'circle',
            showBox: true,
            legendShow: false,
            borderRadius: 4,
          },
        },
      },
      radarChartOpts: {
        legend: {
          show: false,
        },
        yAxisArea: [
          {
            type: 'A',
            min: 31,
            max: 40,
          },
          {
            type: 'B',
            min: 21,
            max: 30,
          },
          {
            type: 'C',
            min: 11,
            max: 20,
          },
          {
            type: 'D',
            min: 1,
            max: 10,
          },
          {
            type: 'E',
            min: 0,
            max: 0,
          },
        ],
      },
      tendColumnChartOpts: {
        color: ['#ff7a7a', '#00c81f'],
        legend: {
          show: false,
        },
        extra: {
          column: {
            barBorderCircle: true,
            linearType: 'opacity',
            linearOpacity: '0.75',
            type: 'group',
            width: 15,
            activeBgColor: '#000000',
            activeBgOpacity: 0.08,
            seriesGap: 2,
          },
          tooltip: {
            legendShape: 'circle',
            showBox: true,
            legendShow: false,
            borderRadius: 4,
          },
        },
      },
      columnChartOpts: {
        legend: {
          show: false,
        },
        yAxis: {
          disableGrid: false,
          gridType: 'dash',
          dashLength: '6',
          gridColor: '#f6f6f6',
          fontSize: 10,
          splitNumber: 4,
          data: [
            {
              min: 0,
              // max: 100,
              axisLine: false,
              unit: '分',
            },
          ],
        },
      },
      columnChartData: {},
      compareGuide: '',
    }
  },
  computed: {
    isWX() {
      let isWeixin = false
      // #ifdef MP-WEIXIN
      isWeixin = true
      // #endif
      return isWeixin
    },
    studentName() {
      const { linkedStudent = {} } = this.userInfo
      return linkedStudent.studentName || ''
    },
    compareGuideText() {
      const { classCompare = [], gradeCompare = [] } = this.paperAnalysis || {}
      const options = this.selectedItem === '班级' ? classCompare : gradeCompare
      const data = {
        ...options,
        type: this.selectedItem,
        studentName: this.studentName,
      }
      return options ? summarySubjectStrengthAndWeakness(data) : ''
    },
    legendColor() {
      const itemColors = { 班级: '#C7D1FF', 年级: '#ADF1F0' }
      return ['#FFBA1D', itemColors[this.selectedItem]]
    },
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    showDengDi() {
      const keys = { 年级: 'gradeRank', 班级: 'classRank' }
      // 班级和年级被屏蔽的情况下展示等第
      return !this.show(keys[this.selectedItem], 2) || this.show('rankType', 4)
    },
    visibility() {
      return this.examDetail && this.examDetail.visible === 1
    },
  },
  methods: {
    mixSameComplete(e) {
      const { area, pix } = e.opts
      const [top, right, bottom, left] = area.map(v => `${v / pix}px`)
      this.sameMaskStyle = { top, right, bottom, left }
    },
    mixComplete(e) {
      const { area, categories, chartData, pix } = e.opts
      const { eachSpacing, xAxisPoints } = chartData
      const { papers = [] } = this.paperAnalysis || {}
      const key = this.selectedItem === '班级' ? 'classCompare' : 'gradeCompare'
      this.chartsleader = papers.map((v, index) => {
        return v[key] !== 1 ? { px: (xAxisPoints[index] + eachSpacing / 2 + categories[index].length * 6), pic: v[key] } : ''
      }).filter(v => v !== '')
      const [top, right, bottom, left] = area.map(v => `${v / pix}px`)
      this.maskStyle = { top, right, bottom, left }
    },
    createRandom() {
      const mock = JSON.parse(this.mockData)
      const tepmPapers = []
      const papers = this.examDetail.papers || []
      for (let index = 0; index < papers.length; index++) {
        const random = index === 0 ? 1 : uni.$u.random(0, 100) / 100
        const deRandom = index === 0 ? 0 : uni.$u.random(0, 40) / 10
        for (let pos = 0; pos < this.mockKeys.length; pos++) {
          const key = this.mockKeys[pos]
          if (pos % 2 !== 0) {
            mock.paper[key] = (this.gradMaxY * uni.$u.random(0, 100) / 100).toFixed()
          }
          else {
            mock.paper[key] = (this.gradMaxY * random).toFixed()
          }
        }
        for (let dkIndex = 0; dkIndex < this.mockDdKeys.length; dkIndex++) {
          const deKey = this.mockDdKeys[dkIndex]
          if (dkIndex % 2 !== 0) {
            mock.paper[deKey] = this.radarChartOpts.yAxisArea[deRandom.toFixed()].type
          }
          else {
            mock.paper[deKey] = this.radarChartOpts.yAxisArea[(uni.$u.random(0, 40) / 10).toFixed()].type
          }
        }
        tepmPapers.push({ ...mock.paper, subject: '学科xx' })
      }
      this.paperAnalysis = { examClassBeat: 75, examGradeBeat: 57, papers: tepmPapers }
    },
    getScoreType() {
      // 1:不展示分数 2:分数，3:等级
      const examConfig = this.config.examConfigs.find(v => +v.examId === +this.examId) || {}
      const isScore = examConfig.score ? examConfig.score === 2 : this.config.score === 2
      return isScore ? (examConfig.scoreType || this.config.scoreType) : 1
    },
    show(name, val) {
      const result = val || 2
      return this.config[name] === result
    },
    degreeToCount(degree) {
      const degreeMap = { A: 4, B: 3, C: 2, D: 1, E: 0 }
      const strArr = degree.split('')
      return degreeMap[strArr[0]] * 10 - (strArr[1] || 0)
    },
    dealsSubject(subject) {
      return subject.slice(0, Math.min(this.visibility ? 2 : 4, subject.length))
    },
    setRadarData() {
      const data = this.paperAnalysis
      const yAxis = {
        disableGrid: false,
        gridType: 'dash',
        dashLength: '6',
        gridColor: '#f6f6f6',
        fontSize: 10,
      };
      (this.radarVisible ? this.radarOpts : this.radarChartOpts).color = this.legendColor
      this.radarChartOpts = { ...this.baseOps, ...this.radarChartOpts, yAxis, color: this.legendColor }
      this.radarChartOpts.extra.column.width = 30
      this.radarChartOpts.yAxis.splitNumber = 4
      if (!this.showDengDi) {
        this.radarChartOpts.yAxis.data = [{ axisLine: false, max: 100, unit: '%', tofix: 1 }]
        this.radarOpts.extra.radar.max = 100 + (this.radarOpts.extra.radar.borderWidth || 0)
        const keys = { 班级: ['classAvgBeat', 'classBeat'], 年级: ['gradeAvgBeat', 'gradeBeat'] }[this.selectedItem]
        this.radarData = {
          categories: data.papers.map(item => `${this.dealsSubject(item.subject)}${this.radarVisible && this.visibility ? (`${item[keys[1]]}%`) : ''}`),
          series: [
            {
              name: '我的击败率',
              data: data.papers.map(item => item[keys[1]]),
            },
            {
              name: this.selectedItem,
              data: data.papers.map(item => item[keys[0]]),
            },
          ],
        }
        this.tipsList = [
          { name: '我的击败率', value: `<span>（班级击败率：<span style="color: #939393" class="mask-yellow">${data.examClassBeat}%</span>，年级击败率：<span style="color: #939393" class="mask-yellow">${data.examGradeBeat}%</span>）</span>` },
          { name: this.selectedItem, value: '（各科平均水平所处位置）' },
        ]
      }
      else {
        // 转换为等第
        const keys = { 班级: ['classAvgRankPart', 'classRankPart'], 年级: ['gradeAvgRankPart', 'gradeRankPart'] }[this.selectedItem]
        this.radarChartOpts.yAxis.data = [{ axisLine: false, min: 0, max: 40, format: 'yAxisFormat', unit: '' }]
        this.radarOpts.extra.radar.max = 40
        this.radarData = {
          categories: data.papers.map(item => `${this.dealsSubject(item.subject)}${this.radarVisible && this.visibility ? (item[keys[1]]) : ''}`),
          series: [
            {
              name: '我的等第',
              data: data.papers.map(item => this.degreeToCount(item[keys[1]])),
              value: data.papers.map(item => item[keys[1]]),
              format: 'seriesValue',
            },
            {
              name: this.selectedItem,
              data: data.papers.map(item => this.degreeToCount(item[keys[0]])),
              value: data.papers.map(item => item[keys[0]]),
              format: 'seriesValue',
            },
          ],
        }
        this.tipsList = [
          { name: '我的等第', value: `（班级等第：<span style="color: #939393" class="mask-yellow">${data.classRankPart}</span>，年级等第：<span style="color: #939393" class="mask-yellow">${data.gradeRankPart}</span>）` },
          { name: this.selectedItem, value: '（各科平均水平所处位置）' },
        ]
      }
      this.legendData = this.radarData.series.map(item => ({ ...item, show: true }))
    },
    tapLegend(index) {
      // 注意这里关闭了加载动画，不然点击图例会执行动画效果
      this.animation = false
      this.legendData[index].show = !this.legendData[index].show
      const chartData = {
        categories: this.radarData.categories,
        series: this.legendData,
      }
      this.radarData = JSON.parse(JSON.stringify(chartData))
    },
    showColumnToolTip(e) {
      // #ifdef MP-WEIXIN
      e.event.y -= this.scrollTop
      // #endif
      const index = e.currentIndex.index
      let textList = []
      if (index > -1) {
        const { series = [], yAxis = {} } = e.opts
        textList = series.map((item, _i) => {
          const val = item.value ? item.value[index] : `${item.data[index]}${yAxis.data[0].unit}`
          const text = `${item.name}：${val}`
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
    showToolTip(e) {
      // #ifdef MP-WEIXIN
      e.event.y -= this.scrollTop
      // #endif
      const index = e.currentIndex.index
      const textList = []
      if (index > -1) {
        const { series = [] } = e.opts || {}
        textList.push(...[
          {
            text: series && series.length > 0 ? `${series[0].name}：${series[0].data[index]}分` : '',
            show: series[0].show,
          },
          {
            text: series && series.length > 0 ? `${series[1].name}：${series[1].data[index]} 分` : '',
            show: series[1].show,
          },
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
    showRadarToolTip(e) {
      if (!this.visibility) {
        return
      }
      // #ifdef MP-WEIXIN
      e.event && (e.event.y -= this.scrollTop)
      // #endif
      if (e.type === 'complete') {
        const { center, radius } = e.opts.chartData.radarData
        const { pixelRatio } = e.opts
        e.event = { x: center.x / pixelRatio, y: (center.y - radius) / pixelRatio }
        this.radarComplete(e)
      }
      const index = e.currentIndex || 0
      const textList = []
      if (index > -1) {
        const { series = [] } = e.opts || {}
        const showDefeat = !this.showDengDi
        const { papers } = this.paperAnalysis || {}
        const paper = papers[index] || ''
        textList.push(...[
          {
            text: paper.subject || '',
            show: true,
          },
          {
            text: showDefeat ? `${series[0].name}：${series[0].data[index] || 0}%` : `${series[0].name}：${series[0].value[index] || ''}`,
            show: series[0].show,
          },
          {
            text: showDefeat ? `${series[1].name}：${series[1].data[index] || 0}%` : `${series[1].name}：${series[1].value[index] || ''}`,
            show: series[1].show,
          },
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
    radarComplete(e) {
      const { categories, chartData, pix } = e.opts
      const { center, radius, angleList } = chartData.radarData
      const papersList = this.paperAnalysis.papers.map(v => this.selectedItem === '班级' ? v.classCompare : v.gradeCompare)
      const measureText = (text, fontSize) => {
        const textList = text.split('')
        let width = 0
        for (let i = 0; i < textList.length; i++) {
          const char = textList[i]
          if (/[a-z]/i.test(char)) {
            width += 7
          }
          else if (/\d/.test(char)) {
            width += 5.5
          }
          else if (/\./.test(char)) {
            width += 2.7
          }
          else if (/-/.test(char)) {
            width += 3.25
          }
          else if (/:/.test(char)) {
            width += 2.5
          }
          else if (/[\u4E00-\u9FA5]/.test(char)) {
            width += 10
          }
          else if (/\(|\)/.test(char)) {
            width += 3.73
          }
          else if (/\s/.test(char)) {
            width += 2.5
          }
          else if (/%/.test(char)) {
            width += 8
          }
          else {
            width += 10
          }
        }
        return width * fontSize / 10
      }
      this.chartsleader = angleList.map((angle, index) => {
        const position = {
          x: (radius + 13 * pix) * Math.cos(angle),
          y: (radius + 13 * pix) * Math.sin(angle),
        }
        const location = {
          x: center.x + position.x,
          y: center.y - position.y,
        }
        const width = measureText(categories[index], 11)
        if (Math.abs(position.x - 0) < 1e-10) {
          location.x += width / 2 + 1
        }
        else if (position.x < 0) {
          location.x += 1
        }
        else {
          location.x += width + 2
        }
        return { left: `${location.x}px`, top: `${location.y - 4}px`, pic: papersList[index] }
      }).filter(v => v.pic !== 1)
    },
    setColumnChartData() {
      this.showColumnChart = !this.visibility || (this.show('scoreSingle') && this.getScoreType() === 2)
      if (!this.showColumnChart) {
        return
      }
      const data = this.paperAnalysis
      this.columnChartOpts.color = ['#FFBA1D', '#D2E9FF']
      this.columnChartOpts = { ...this.baseOps, ...this.columnChartOpts, enableScroll: data.papers.length > 6 }
      this.columnChartData = {
        categories: data.papers.map(item => this.dealsSubject(item.subject)),
        series: [
          {
            name: '我的',
            legendShape: 'circle',
            data: data.papers.map(item => item.score),
          },
          {
            name: '同层次',
            legendShape: 'circle',
            data: data.papers.map(item => item.sameGroupAvg),
          },
        ],
      }
      this.columnChartOpts.extra.column.width = 15
      let max = 10
      this.columnChartData.series.forEach((item) => {
        max = Math.max(max, ...item.data)
      })
      this.columnChartOpts.yAxis.data[0].max = Math.ceil(max / 4) * 4
    },
    async getExamAnalysis(examId) {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/papers-analysis?examId=${examId}`)
      this.paperAnalysis = res && res.code === 0 ? res.data : ''
      if (!this.visibility) {
        // 无权查看需要mock数据
        this.createRandom()
      }
      this.radarVisible = this.paperAnalysis && this.paperAnalysis.papers.length > 2
      this.setRadarData()
      this.setColumnChartData()
      const { papers = [] } = this.paperAnalysis
      const claSubject = { 0: [], 1: [], 2: [] }
      const glaSubject = { 0: [], 1: [], 2: [] }
      const sameLevel = { 0: [], 1: [], 2: [] }// 0 劣势， 1接近，2优势
      for (let index = 0; index < papers.length; index++) {
        const { subject = '', classCompare = 0, gradeCompare = 0, sameGroupAvg = '', score = '' } = papers[index]
        claSubject[classCompare].push(subject)
        glaSubject[gradeCompare].push(subject)
        if (!Number.isNaN(Number(sameGroupAvg)) && !Number.isNaN(Number(score))) {
          const key = score > sameGroupAvg ? 2 : (score === sameGroupAvg ? 1 : 0)
          sameLevel[key].push(subject)
        }
      }
      this.paperAnalysis.classCompare = claSubject
      this.paperAnalysis.gradeCompare = glaSubject
      this.paperAnalysis.sameLevel = sameLevel
    },
    close(item, event) {
      this.selectedItem = item
      this.setRadarData()
      this.setColumnChartData()
      this.reportEventParams(event)
    },
    reportEventParams(event) {
      // #ifdef H5
      if (!event || typeof event !== 'string')
        return
      nativeBridge.callHandler('UmengEventParams', event)
      // #endif
    },
  },
}
</script>

<style lang="scss" scoped>
.analysis {
  position: relative;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 36rpx 28rpx;
  color: #333333;
  font-size: 30rpx;

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 30rpx;
    .options {
      display: flex;
      padding: 4rpx;
      font-size: 24rpx;
      color: #939393;
      background: #f6f6f6;
      border-radius: 6rpx;
      &-item {
        width: 90rpx;
        height: 42rpx;
        display: flex;
        padding: 4rpx 20rpx;
        align-items: center;
        justify-content: center;
      }
      .active {
        color: #ffba1d;
        background: white;
        border-radius: 6rpx;
      }
    }
    &__tip {
      display: flex;
      align-items: center;
      &::before {
        margin-right: 12rpx;
        content: '';
        display: flex;
        width: 8rpx;
        height: 30rpx;
        background: #ffba1d;
        border-radius: 4rpx;
      }
    }
    &__pk {
      padding: 0 16rpx;
      height: 52rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f8f8;
      border-radius: 6rpx;
      font-size: 28rpx;
    }
    &__image {
      width: 20rpx;
      height: 10rpx;
      box-sizing: border-box;
      margin-left: 6rpx;
    }
  }
  &-weaker {
    width: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
  }
  &-dis {
    align-items: center;
    display: flex;
  }
  &-wx-radar {
    height: 550rpx !important;
  }
  &-radar {
    width: 100%;
    height: 480rpx;
  }
  &-charts {
    position: relative;
    &-tag {
      position: absolute;
      bottom: 3px;
      width: 20px;
      height: 11px;
      z-index: 2;
    }
    &-mask {
      position: absolute;
      z-index: 100;
      background: white;
      &__pic {
        position: absolute;
        bottom: 0;
        width: 100%;
      }
    }
  }
  // .legend {
  //   display: flex;
  //   margin: 20rpx 0 10rpx;
  //   flex-direction: column;
  .item {
    display: flex;
    align-items: center;
    margin-top: 14rpx;
    &-icon {
      width: 22rpx;
      height: 22rpx;
      border-radius: 50%;
      margin-right: 8rpx;
    }
    &-text {
      display: flex;
      align-items: center;
      flex-direction: column;
      font-size: 28rpx;
      color: #333333;
      line-height: 44rpx;
      &-legend {
        flex-direction: row;
        line-height: 40rpx;
      }
      .explain {
        font-style: italic;
        font-size: 26rpx;
        color: #666666;
        line-height: 44rpx;
        margin-bottom: 10rpx;
      }
      .tip {
        color: #939393;
        font-size: 22rpx;
      }
    }
    &-hide {
      filter: grayscale(100%);
      color: #aaaaaa;
    }
  }
  // }
  .tips {
    display: flex;
    margin-bottom: 20rpx;
    &-item {
      font-size: 24rpx;
      color: #939393;
      margin-right: 10rpx;
      &:last-child {
        margin-right: 0;
      }
    }
  }
  &-tend {
    display: flex;
    align-items: center;
    color: #333333;
    font-size: 30rpx;

    &__help {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 10rpx;
      width: 26rpx;
      height: 26rpx;
      border-radius: 13rpx;
      border: 3rpx solid #333333;
      font-size: 22rpx;
    }
  }
  &-qiun {
    margin-top: 0 !important;
  }
  &-value {
    color: #939393;
    background: #f6f6f6;
    font-size: 28rpx;
    padding: 17rpx 24rpx;
    border-radius: 10rpx;
    overflow: hidden;
    margin-top: 24rpx;
    line-height: 40rpx;
    position: relative;
    &__bg {
      position: absolute;
      background: white;
      bottom: 0;
      right: 0;
      width: 72rpx;
      height: 106rpx;
      border-start-end-radius: 10rpx;
    }
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
