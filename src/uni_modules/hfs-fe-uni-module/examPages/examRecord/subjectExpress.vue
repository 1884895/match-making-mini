<template>
  <view class="express" :class="{ novip: showDefaultVip }">
    <!-- 对比 -->
    <view id="point0" class="compare">
      <view class="compare-header">
        <view class="compare-header__line" />
        <view class="compare-header__title">
          学科雷达图
        </view>
      </view>
      <view class="compare-analyze">
        <view v-if="selectGroup.label" class="compare-analyze__pk" @click="open">
          <image class="pk-icon" :src="`${exportResourceUrl}icon_subject_pk.png`" />
          <view class="pk-content">
            {{ selectGroup.label }}
            <u-icon name="arrow-down" color="#939393" size="28rpx" :custom-style="{ marginLeft: '10rpx' }" />
          </view>
        </view>
        <view class="compare-analyze__chart">
          <qiun-data-charts v-if="radarChartData.categories && radarChartData.categories.length > 2" type="radar" :canvas2d="true" :in-scroll-view="true" :page-scroll-top="scrollTop" :opts="radarOpts" :ontouch="isExamMember" :tooltip-show="false" :chart-data="radarChartData" @get-index="showRadarToolTip" @complete="radarMixComplete" />
          <qiun-data-charts v-else type="column" :canvas2d="true" :in-scroll-view="true" :ontouch="isExamMember" :page-scroll-top="scrollTop" :opts="opts" :chart-data="radarChartData" @get-index="showColumnToolTip" />
        </view>
        <view v-if="analyzeGuide" class="compare-analyze__text">
          <AnalyzeTemplate :custom="true" :guide="true">
            <view class="item-text">
              <IMask :show="isExamMember" :nodes="analyzeGuide" />
            </view>
          </AnalyzeTemplate>
        </view>
      </view>
    </view>
    <!-- 学科tabs -->
    <u-sticky :custom-nav-height="0">
      <view class="tabs">
        <u-tabs :list="papers" key-name="subject" :line-color="tabsStyle.lineColor" :inactive-style="tabsStyle.inactiveStyle" :active-style="tabsStyle.activeStyle" :item-style="tabsStyle.itemStyle" @change="subjectChange" />
      </view>
    </u-sticky>
    <view class="single">
      <!-- 学科详情 -->
      <view class="single-info">
        <view v-for="(item, index) in detailList" :key="index" class="single-info__item flex-row-center">
          <view class="item-content">
            <IMask :show="isExamMember">
              <view class="item-content__score">
                {{ paperDetail[item.key] || '' }}
              </view>
            </IMask>
            <view class="item-content__name">
              {{ item.name }}
            </view>
          </view>
          <u-line v-if="index < 4" color="#e6e6e6" length="60rpx" direction="col" :dashed="true" />
        </view>
      </view>
      <!-- 单科成绩 -->
      <view id="point1" class="single-score single-common">
        <view class="single-common__header">
          <view class="header-line" />
          <view class="header-title">
            单科成绩趋势
          </view>
        </view>
        <view class="single-common__detail">
          <view class="detail-exam">
            <image class="detail-exam__icon" :src="`${resourceUrl}subject_icon.png`" />
            <view class="detail-exam__text">
              {{ scoreDetail.type || '普通' }}考试<text v-if="scoreDetail.eventTime">
                {{ $u.timeFormat(scoreDetail.eventTime, 'yyyy.mm.dd') }}
              </text>
            </view>
          </view>
          <view class="detail-content">
            <view class="detail-content__item">
              得分率：
              <IMask :show="isExamMember">
                <text v-if="scoreDetail.scoreRate || scoreDetail.scoreRate === 0" class="text">
                  {{ `${scoreDetail.scoreRate}%` }}
                </text>
              </IMask>
            </view>
            <view v-if="scoreDetail.scoreType !== 1" class="detail-content__item">
              成绩：
              <IMask :show="isExamMember">
                <text v-if="scoreDetail.score || scoreDetail.score === 0" class="text">
                  {{ scoreDetail.score }}/{{ scoreDetail.manfen }}
                </text>
              </IMask>
            </view>
          </view>
        </view>
        <view class="single-score__chart">
          <view v-if="!isExamMember" class="mask" :style="[scoreMaskStyle]">
            <image class="mask-pic" :src="`${resourceUrl}subject_express_score.png`" />
          </view>
          <qiun-data-charts type="area" :canvas2d="true" :ontouch="isExamMember" :in-scroll-view="true" :page-scroll-top="scrollTop" :tooltip-show="false" :opts="{ ...detaultOpts }" :chart-data="scoreData" @get-index="scoreToolTip" @complete="scoreMixComplete" />
        </view>
      </view>
      <!-- 单科排名 -->
      <view id="point2" class="single-rank single-common">
        <view class="single-common__header">
          <view class="header-line" />
          <view class="header-title">
            单科排名趋势
          </view>
        </view>
        <view class="single-common__detail">
          <view class="detail-exam">
            <image class="detail-exam__icon" :src="`${resourceUrl}subject_icon.png`" />
            <view class="detail-exam__text">
              {{ rankDetail.type || '普通' }}考试<text v-if="rankDetail.eventTime">
                {{ $u.timeFormat(rankDetail.eventTime, 'yyyy.mm.dd') }}
              </text>
            </view>
          </view>
          <view class="detail-content">
            <view class="detail-content__item">
              年级击败率：
              <IMask :show="isExamMember">
                <text v-if="rankDetail.gradeBeat || rankDetail.gradeBeat === 0" class="text">
                  {{ `${rankDetail.gradeBeat}%` }}
                </text>
              </IMask>
            </view>
            <view v-if="rankDetail.rankType !== 1" class="detail-content__item">
              班级{{ getTypeMap(rankDetail.rankType) }}：
              <IMask :show="isExamMember">
                <text class="text">
                  {{ rankDetail.classRank || '' }}
                </text>
              </IMask>
            </view>
            <view class="detail-content__item">
              考试总人数：
              <IMask :show="isExamMember">
                <text class="text">
                  {{ rankDetail.gradeStuNum || '' }}
                </text>
              </IMask>
            </view>
            <view v-if="rankDetail.rankType !== 1" class="detail-content__item">
              年级{{ getTypeMap(rankDetail.rankType) }}：
              <IMask :show="isExamMember">
                <text class="text">
                  {{ rankDetail.gradeRank || '' }}
                </text>
              </IMask>
            </view>
          </view>
        </view>
        <view class="single-rank__chart">
          <view v-if="!isExamMember" class="mask" :style="[rankMaskStyle]">
            <image class="mask-pic" :src="`${resourceUrl}subject_express_rank.png`" />
          </view>
          <qiun-data-charts type="line" :canvas2d="true" :ontouch="isExamMember" :in-scroll-view="true" :page-scroll-top="scrollTop" :tooltip-show="false" :opts="{ ...detaultOpts, ...rankOpts }" :chart-data="rankData" @get-index="rankToolTip" @complete="rankMixComplete" />
        </view>
      </view>
      <!-- 题型得分 -->
      <view id="point3" class="single-type single-common">
        <view class="single-common__header">
          <view class="header-line" />
          <view class="header-title">
            题型得分
          </view>
        </view>
        <view class="single-type__chart">
          <view v-for="(item, index) in questionTypeData" :key="index" class="item">
            <view class="item-chart">
              <qiun-data-charts type="arcbar" :canvas2d="true" :opts="{ ...arcbarOpts, title: { ...arcbarOpts.title, name: item.name } }" :chart-data="item.chartData" />
            </view>
            <view class="item-score">
              得分率：<IMask :show="isExamMember">
                <text class="active">
                  {{ item.scoreRate }}
                </text>
              </IMask>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 开通会员 -->
    <view v-if="showDefaultVip" class="member">
      <image class="member-pic" :src="`${resourceUrl}subject_express_vip.png`" mode="widthFix" @click="jumpPage({ type: 'vip' }, { eventId: 'ksda_xkbx_kthy_pay' })" />
      <view class="member-close" @click.stop="closeMember = true" />
    </view>
    <ShortYearExpiredPopup v-if="showShortYearExpiredPopup" :from="options.shortFrom || shortFrom" :short-info="shortInfo" @close="showShortYearExpiredPopup = false" />
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
import { improveSpace } from '../template/examRecord'
import IMask from '../../components/i-mask.vue'
import ShortYearExpiredPopup from '../../components/shortYearExpiredPopup.vue'
import analyzeTemplate from '../academicReport/components/analyzeTemplate.vue'
import compareLevel from './components/compare_level'
import record from './record.js'
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js'

export default {
  components: { AnalyzeTemplate: analyzeTemplate, IMask, ShortYearExpiredPopup },
  mixins: [record],
  data() {
    return {
      options: {},
      exportResourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
      detail: {},
      popup: {
        show: false,
      },
      closeMember: false,
      radarChartData: {},
      scoreMaskStyle: {}, // 图表遮罩样式
      scoreData: {}, // 单科成绩图表数据
      rankMaskStyle: {}, // 图表遮罩样式
      rankData: {}, // 单科排名图表数据
      questionTypeData: [], // 题型得分图表数据
      selectGroup: {},
      analyzeGuide: '',
      papers: [],
      groupList: [
        { label: '学霸组', value: 1, compareLevel: ['优秀', '中等偏上'] },
        { label: '优秀组', value: 2, compareLevel: ['中等'] },
        { label: '中等组', value: 3, compareLevel: ['中等偏下'] },
        { label: '待提高组', value: 4, compareLevel: ['较弱'] },
        { label: '基础薄弱组', value: 5, compareLevel: [] },
      ],
      detailList: [
        { name: '最高分数', key: 'scoreMax' },
        { name: '平均分数', key: 'scoreAvg' },
        { name: '最高班级排名', key: 'classRankMax' },
        { name: '最高年级排名', key: 'gradeRankMax' },
      ],
      paperDetail: {},
      subjectList: [], // 学科所有考试列表
      scoreDetail: {},
      rankDetail: {},
      tabsStyle: {
        lineColor: 'transparent',
        inactiveStyle: {
          color: '#939393',
          fontSize: '30rpx',
          padding: '6rpx 30rpx',
        },
        activeStyle: {
          color: '#FFFFFF',
          fontSize: '30rpx',
          fontWeight: '500',
          background: '#ffb100',
          borderRadius: '30rpx',
          padding: '6rpx 30rpx',
        },
        itemStyle: {
          height: '104rpx',
          padding: '0 4rpx',
        },
      },
      // 柱状图配置
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
      // 雷达图配置
      radarOpts: {
        color: ['#FFBA1D', '#65B1FF'],
        dataLabel: false,
        dataPointShape: false,
        fontSize: 12,
        fontColor: '#939393',
        padding: [5, 0, 5, -5],
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
      // 默认折线图配置
      detaultOpts: {
        padding: [19, 0, 0, 0],
        color: ['#FFB100'],
        fontSize: 11,
        fontColor: '#939393',
        enableScroll: true,
        dataLabel: false,
        xAxis: {
          axisLineColor: '#EDEDED',
          fontColor: '#939393',
          fontSize: 11,
          itemCount: 4,
          scrollAlign: 'right',
        },
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
              format: 'yAxisFixed',
            },
          ],
        },
        legend: {
          show: false,
        },
        extra: {
          area: {
            gradient: true,
            opacity: 1,
          },
          tooltip: {
            gridType: 'dash',
            gridColor: '#FFB100',
            legendShow: false,
            borderRadius: 4,
            fontSize: 11,
          },
        },
      },
      // 排名折线图配置
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
      // 环形图配置
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
      shortInfo: {},
      shortFrom: 'examRecord',
      showShortYearExpiredPopup: false,
      isHiddenBottomVip: null, // 一年过期会员活动对象不显示底部vip
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
    showDefaultVip() {
      return this.showVip && this.config.parentPay === 2 && !this.isExamMember && !this.closeMember && this.isHiddenBottomVip === false
    },
  },
  async onLoad(options) {
    this.options = options
    await this.getExamArchives()
    this.getShortRecommend()
    if (options.point) {
      await uni.$u.sleep(500)
      uni.createSelectorQuery().in(this).select(`#${options.point}`).boundingClientRect((data) => {
        uni.pageScrollTo({ scrollTop: data.top - uni.$u.getPx('104rpx'), duration: 0 })
      }).exec()
    }
  },
  methods: {
    open() {
      this.popup.show = true
    },
    close() {
      this.popup.show = false
    },
    subjectChange({ subject = '' }) {
      if (!subject)
        return
      this.paperDetail = this.papers.find(item => item.subject === subject)
      this.setSingleChartData()
      this.getSubjectQuestionSummary()
    },
    groupClick(item) {
      this.selectGroup = item
      this.setCompareGroup()
      this.close()
    },
    // 设置学科雷达图数据
    setRadarChartData() {
      const { papers = [], explain = {} } = this.detail
      this.selectGroup = this.groupList.find(item => item.compareLevel.includes(explain.level)) || {}
      this.radarChartData = {
        categories: papers.map(item => this.isExamMember ? item.subject : '学科xx'),
        fillOpacity: 1,
        series: [
          { name: '我的得分率', data: papers.map(item => item.avgRate) },
        ],
      }
      this.analyzeGuide = improveSpace(this.userInfo.roleType, explain)
      this.setCompareGroup()
    },
    // 学科雷达图数据--pk组
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
    // 学科雷达图-图表渲染完成
    radarMixComplete(e) {
      const { center, radius } = e.opts.chartData.radarData
      const { pixelRatio } = e.opts
      e.currentIndex = 0
      e.event = { x: center.x / pixelRatio, y: (center.y - radius) / pixelRatio }
      this.showRadarToolTip(e)
    },
    // 学科雷达图点击
    showRadarToolTip(e) {
      if (!this.isExamMember)
        return
      // #ifdef MP-WEIXIN
      e.event && (e.event.y -= this.scrollTop)
      // #endif
      const index = e.currentIndex
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

    // 设置单科趋势图表数据
    setSingleChartData() {
      let { list = [] } = this.paperDetail
      list = list.filter(item => item.rscore !== -1)
      const categories = list.map(item => this.formatTimestamp(item.eventTime))
      const labelText = list.map(item => item.type)
      const data = list.map(item => item.rscore)

      const classBeat = list.map(item => item.classBeat)
      const gradeBeat = list.map(item => item.gradeBeat)
      this.scoreData = {
        categories,
        series: [
          { name: '', labelText, data },
        ],
      }
      this.rankData = {
        categories,
        series: [
          { name: '班级', labelText, data: classBeat, legendShape: 'circle' },
          { name: '年级', labelText, data: gradeBeat, legendShape: 'circle' },
        ],
      }
      this.subjectList = list
    },
    // 单科成绩趋势-图表加载完成
    scoreMixComplete(e) {
      const { area, pix } = e.opts
      const [top, right, bottom, left] = area.map(v => `${v / pix}px`)
      this.scoreMaskStyle = { top, right, bottom, left }

      const index = this.subjectList.length - 1
      const calPoints = e.opts.chartData.calPoints[0] || []
      e.currentIndex = { index }
      e.event = calPoints[e.currentIndex.index]
      this.scoreToolTip(e)
    },
    // 单科趋势-成绩趋势
    scoreToolTip(e) {
      // #ifdef MP-WEIXIN
      e.event.y -= this.scrollTop
      // #endif
      const textList = []
      const index = e.currentIndex.index
      this.scoreDetail = this.subjectList[index]
      if (!this.isExamMember)
        return
      if (index > -1) {
        const { type, eventTime, score, manfen } = this.scoreDetail
        textList.push(...[
          {
            text: `${type}考试${uni.$u.timeFormat(eventTime, 'yyyy.mm.dd')}`,
          },
          {
            text: `成绩：${score}/${manfen}`,
          },
        ])
      }
      uCharts.instance[e.id].showToolTip(
        { changedTouches: [e.event] },
        { index, textList },
      )
    },
    // 单科成绩趋势-图表加载完成
    rankMixComplete(e) {
      const { area, pix } = e.opts
      const [top, right, bottom, left] = area.map(v => `${v / pix}px`)
      this.rankMaskStyle = { top, right, bottom, left }

      const index = this.subjectList.length - 1
      const calPoints = e.opts.chartData.calPoints[0] || []
      e.currentIndex = { index }
      e.event = calPoints[e.currentIndex.index]
      this.rankToolTip(e)
    },
    // 单科趋势-排名趋势
    rankToolTip(e) {
      // #ifdef MP-WEIXIN
      e.event.y -= this.scrollTop
      // #endif
      const textList = []
      const index = e.currentIndex.index
      this.rankDetail = this.subjectList[index]
      if (!this.isExamMember)
        return
      if (index > -1) {
        const { type, eventTime, gradeRank, classRank, rankType } = this.rankDetail
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
    getTypeMap(rankType) {
      const typeMap = { 2: '排名', 3: '击败率', 4: '排名', 5: '排名', 6: '击败率' } // 展示等第时，文案也显示“排名”
      return typeMap[rankType] || '排名'
    },
    // 获取考试档案详情
    async getExamArchives() {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/archives`, { grade: this.grade || '' })
      const { papers = [] } = res.data
      this.detail = res.data
      this.papers = papers
      this.setRadarChartData()
      this.subjectChange({ subject: papers[0].subject })
    },
    // 获取学科题型占比
    async getSubjectQuestionSummary() {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/archives/paper-question-summary`, { subject: this.paperDetail.subject })
      const { questionStatis = {} } = res.data
      const difficultyList = ['容易', '较易', '中等', '较难', '难']
      this.questionTypeData = difficultyList.map((item) => {
        const { myScore = 0, score = 0 } = questionStatis[item] || {}
        return {
          ...questionStatis[item],
          name: `${item}题`,
          scoreRate: `${myScore !== 0 && score !== 0 ? Math.round(myScore / score * 100) : 0}%`,
          chartData: {
            series: [
              { name: item, data: myScore / score },
            ],
          },
        }
      })
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    },
    async getShortRecommend() {
      const res = await uni.$http.get(`${this.beProxy}/v3/strategy/recommend-goods`, { from: this.options.shortFrom || this.shortFrom }, { custom: { loading: false, error: false } })
      this.shortInfo = res.data || {}

      const { recommendation = {}, show = false, showed = false } = this.shortInfo
      const { memberType = '', stage = '' } = recommendation
      this.isHiddenBottomVip = show || showed
      if (memberType === 'year' && stage === 'expired') {
        this.showShortYearExpiredPopup = true
        this.hadShowShortYearExpiredPopup = true
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.express {
  min-height: 100vh;
  background-color: #f6f6f6;
  padding-bottom: 60rpx;
  &.novip {
    padding-bottom: 120rpx;
  }
  .compare {
    padding: 28rpx 28rpx 24rpx;
    background: linear-gradient(180deg, #ffffff 6%, rgba(255, 255, 255, 0));
    &-header {
      display: flex;
      align-items: center;
      &__line {
        width: 8rpx;
        height: 32rpx;
        background: #ffba1d;
        border-radius: 4rpx;
        margin-right: 10rpx;
      }
      &__title {
        font-size: 30rpx;
        color: #333333;
      }
    }
    &-analyze {
      position: relative;
      &__pk {
        display: flex;
        align-items: center;
        position: absolute;
        top: 30rpx;
        right: 0rpx;
        z-index: 2;
        .pk-icon {
          width: 50rpx;
          height: 40rpx;
          margin-right: 10rpx;
        }
        .pk-content {
          display: flex;
          align-items: center;
          background: #f6f6f6;
          border-radius: 8rpx;
          padding: 8rpx 16rpx;
          font-size: 24rpx;
          color: #939393;
        }
      }
      &__chart {
        height: 532rpx;
      }
    }
  }
  .tabs {
    background: linear-gradient(197deg, #fff0bf, #ffffff 30%);
    border: 2rpx solid #ffffff;
    border-radius: 24rpx 24rpx 0 0;
    ::v-deep .u-tabs__wrapper__nav__item:first-child {
      padding-left: 28rpx !important;
    }
  }
  .single {
    padding: 24rpx 28rpx 0;
    &-info {
      background: #ffffff;
      border-radius: 24rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 28rpx 0 30rpx;
      margin-bottom: 24rpx;
      &__item {
        width: 25%;
        .item-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          &__score {
            font-size: 36rpx;
            color: #ffba1d;
            margin-bottom: 2rpx;
          }
          &__name {
            font-size: 24rpx;
            color: #939393;
          }
        }
      }
    }
    &-common {
      background: #ffffff;
      border-radius: 24rpx;
      padding: 26rpx 24rpx 34rpx;
      margin-bottom: 24rpx;
      &__header {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;
        .header-line {
          width: 8rpx;
          height: 32rpx;
          background: #ffba1d;
          border-radius: 4rpx;
          margin-right: 10rpx;
        }
        .header-title {
          font-size: 30rpx;
          color: #333333;
        }
      }
      &__detail {
        padding: 18rpx 24rpx 12rpx;
        background: #fffcf2;
        .detail-exam {
          display: flex;
          align-items: center;
          margin-bottom: 14rpx;
          &__icon {
            width: 26rpx;
            height: 28rpx;
            margin-right: 8rpx;
          }
          &__text {
            font-size: 28rpx;
            color: #333333;
          }
        }
        .detail-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          &__item {
            width: 50%;
            display: flex;
            align-items: center;
            font-size: 24rpx;
            color: #939393;
            margin-bottom: 4rpx;
            &:nth-of-type(odd) {
              justify-content: flex-start;
            }
            &:nth-of-type(even) {
              justify-content: flex-end;
            }
            .text {
              font-size: 28rpx;
              color: #333333;
            }
          }
        }
      }
    }
    &-score {
      &__chart {
        position: relative;
        height: 264rpx;
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
    &-rank {
      .single-common__detail {
        margin-bottom: 30rpx;
      }
      &__chart {
        position: relative;
        height: 320rpx;
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
    &-type {
      .single-common__header {
        margin-bottom: 40rpx;
      }
      &__chart {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        .item {
          width: calc(100% / 3);
          display: flex;
          align-items: center;
          flex-direction: column;
          margin-bottom: 20rpx;
          &-chart {
            width: 168rpx;
            height: 168rpx;
            margin-bottom: 12rpx;
          }
          &-score {
            font-size: 24rpx;
            color: #939393;
            .active {
              color: #333333;
            }
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
  .member {
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    box-shadow: 0 -4rpx 16rpx 0 rgba(0, 0, 0, 0.06);
    z-index: 9999;
    &-pic {
      width: 100%;
      height: 100%;
    }
    &-close {
      width: 46rpx;
      height: 46rpx;
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}
</style>
