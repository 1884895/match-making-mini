<template>
  <view class="all">
    <template v-if="pageConfig.show && pageConfig.isLoading === false">
      <view class="all-item">
        <view id="point2" class="header">
          <view class="header-line" />
          <view class="header-title">
            难度分析
          </view>
        </view>
        <DiffifultyAnalysis :score-rate-level="scoreRateLevel" :exam-detail="subjectExamDetail" event-id="ks_xkfx_ndfx_ljkt_pay" />
        <view id="point3" class="header distribute">
          <view class="header-line" />
          <view class="header-title">
            题型分布
          </view>
        </view>
        <!-- 考试难度 环形图 -->
        <view class="draw">
          <view v-if="ringChartData.series" class="draw-circle">
            <view class="ring">
              <qiun-data-charts type="ring" :canvas2d="true" :in-scroll-view="true" :tooltip-show="visible" :page-scroll-top="scrollTop" :opts="ringOpts" :chart-data="ringChartData" @get-index="getIndex" />
              <view class="title">
                <view class="title-rate">
                  {{ currentDifficulty.scoreRate }}
                </view>
                <view class="title-type">
                  {{ currentDifficulty.type }}
                </view>
              </view>
            </view>
            <view class="legend">
              <view v-for="(item, index) in ringLegendData" :key="index" class="item" :class="[item.show ? '' : 'item-hide']" @click="tapLegend(index)">
                <view class="item-icon" :style="{ backgroundColor: ringOpts.color[index] }" />
                <view v-if="index === 0" class="item-text">
                  <view class="item-text__diffcult active">
                    {{ item.difficult }}题
                  </view>
                  <view class="item-text__split" />
                  <view class="item-text__count active">
                    {{ item.count }}题/{{ item.score }}分
                  </view>
                  <view class="item-text__rate active">
                    {{ item.value }}%
                  </view>
                </view>
                <IMask v-else :show="visible" display="block">
                  <view class="item-text">
                    <view class="item-text__diffcult active">
                      {{ item.difficult }}题
                    </view>
                    <view class="item-text__split" />
                    <view class="item-text__count active">
                      {{ item.count }}题/{{ item.score }}分
                    </view>
                    <view class="item-text__rate active">
                      {{ item.value }}%
                    </view>
                  </view>
                </IMask>
              </view>
            </view>
          </view>
          <view class="draw-analyze">
            <AnalyzeTemplate :custom="true">
              <view class="analyze-template__text">
                <IMask :show="visible" :nodes="ringChartDataGuide" />
              </view>
            </AnalyzeTemplate>
          </view>
          <UnlockMember title="解锁本次考试题型分布" :visible="visible" event-id="ks_xkfx_txfb_ljkt_pay" />
        </view>
        <view class="connect">
          <image class="icon" :src="`${examResourceUrl}connect.png`" />
          <image class="icon" :src="`${examResourceUrl}connect.png`" />
        </view>
      </view>
      <!-- 试题得分 -->
      <view id="point4" class="all-item">
        <view class="header">
          <view class="header-line" />
          <view class="header-title">
            试题得分
          </view>
        </view>
        <view class="scroll" :class="{ noMember: !visible }">
          <view v-if="tableData.length" class="scroll-table">
            <view class="tr">
              <view v-for="(item, index) in columns" :key="index" class="th">
                {{ item.name }}
              </view>
            </view>
            <view v-for="(item, index) in tableData" :key="index" class="tr">
              <view v-for="(columnsItem, columnsIndex) in columns" :key="columnsIndex" class="td">
                <view v-if="columnsItem.key === 'score'">
                  <IMask :show="visible || (!visible && index < 3)">
                    <view v-if="visible || (!visible && index < 3)" class="score">
                      <view class="score-text" :style="{ color: questionStatusColor[item.status] }">
                        {{ item.score }}
                      </view>
                      <image v-if="item.status === 0" class="score-error" :src="`${examResourceUrl}error.png`" />
                      <image v-if="item.status === 1" class="score-half" :src="`${examResourceUrl}half.png`" />
                    </view>
                    <view v-else class="score">{{ item.score }}</view>
                  </IMask>
                </view>
                <view v-else-if="columnsItem.key === 'classAvg'" class="classAvg">
                  <IMask :show="visible || (!visible && index < 3)">
                    {{ item.classAvg }}
                  </IMask>
                </view>
                <view v-else-if="columnsItem.key === 'gradeAvg'" class="gradeAvg">
                  <IMask :show="visible || (!visible && index < 3)">
                    {{ item.gradeAvg }}
                  </IMask>
                </view>
                <view v-else class="text">
                  {{ item[columnsItem.key] }}
                </view>
              </view>
            </view>
          </view>
        </view>
        <UnlockMember title="解锁该学科试题得分详情" :visible="visible" event-id="ks_xkfx_stdf_ljkt_pay" />
      </view>
    </template>
    <IEmpty v-if="!pageConfig.show && pageConfig.isLoading === false" border-radius="24rpx" />
  </view>
</template>

<script>
import IMask from '../../../components/i-mask.vue'
import iEmpty from '../../../components/i-empty.vue'
import { difficultyAnalyze } from '../../template/subjectAnalyze.js'
import analyzeTemplate from './analyzeTemplate.vue'
import unlockMember from './unlockMember.vue'
import diffifultyAnalysis from './difficultyAnalysis.vue'

export default {
  options: {
    styleIsolation: 'shared',
  },
  components: { AnalyzeTemplate: analyzeTemplate, UnlockMember: unlockMember, IMask, IEmpty: iEmpty, DiffifultyAnalysis: diffifultyAnalysis },
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
    isMock: {
      type: Boolean,
      default: false,
    },
    examDetail: {
      type: Object,
      default: () => {},
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
    subjectExamDetail: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam',
      examResourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
      pageConfig: {
        show: true,
        isLoading: null,
      },
      explain: {},
      chartData: {},
      strucChartData: {},
      strucLegendData: [],
      strucAnimation: true,
      ringChartData: {},
      ringLegendData: [],
      animation: true,
      tableData: [],
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
            ringWidth: 23,
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
      expandOpts: {
        color: ['#FAC858', '#1990FF'],
      },
      columns: [
        { name: '题号', key: 'name' },
        { name: '得分', key: 'score', custom: true },
        { name: '总分', key: 'manfen' },
        { name: '班级平均分', key: 'classAvg', custom: true },
        { name: '年级平均分', key: 'gradeAvg', custom: true },
      ],
      currentDifficulty: {},
      difficultyTypeList: [],
      currentStruc: {},
      strucTypeList: [],
      questionStatusColor: ['#E50000', '#FFB100', '#333333'],
    }
  },
  computed: {
    scoreRateLevel() {
      return this.explain.scoreRateLevel || {}
    },
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    visible() {
      return this.examDetail && this.examDetail.visible === 1
    },
    progressText() {
      return this.visible ? `得分率: ${this.subjectExamDetail.scoreRate}%` : ''
    },
    ringChartDataGuide() {
      const { scoreRate, compare = {} } = this.subjectExamDetail
      return difficultyAnalyze(this.subjectDetail.subject, { ...this.explain, scoreRate }, compare)
    },
    opts() {
      return {
        fontSize: 11,
        fontColor: '#333333',
        dataLabel: false,
        color: ['#FFC749', '#EDF0FF', '#D2F7F6'],
        padding: [-5, 5, 0, 0],
        xAxis: {
          fontSize: 11,
          fontColor: '#333333',
        },
        yAxis: {
          showTitle: true,
          gridType: 'dash',
          gridColor: '#EDEDED',
          splitNumber: 4,
          data: [
            {
              axisLine: false,
              max: 100,
              unit: '%',
              title: '',
              fontColor: '#939393',
              fontSize: 11,
            },
          ],
        },
        legend: {
          show: this.visible,
          position: 'top',
          float: 'left',
          padding: 5,
          margin: 12,
          fontSize: 13,
          fontColor: '#333333',
        },
        extra: {
          column: {
            width: 14,
            seriesGap: 1,
            barBorderCircle: false,
            barBorderRadius: [4, 4, 0, 0],
            linearType: 'custom',
            customColor: ['#FFBA1D', '#D5DDFF', '#ABF1F0'],
          },
        },
      }
    },
  },
  watch: {
    subjectDetail: {
      handler(val) {
        if (!Object.keys(val).length)
          return
        this.getServerData()
      },
      immediate: true,
    },
  },
  methods: {
    async getServerData() {
      try {
        this.pageConfig = { show: true, isLoading: null }
        const params = { examId: this.examId, paperId: this.subjectDetail.paperId }
        let res = {}
        if (this.isMock) {
          const resp = await uni.$u.http.get(`${this.resourceUrl}/mock/paper/question-summary/${params.paperId}.json`)
          res = resp.data || {}
        }
        else {
          res = await uni.$http.get(`${this.prefix}/v4/exam/paper/question-summary`, params)
        }
        this.pageConfig = { show: true, isLoading: false }
        const { questionStruc = [], questionType = {}, explain = {}, questions = [] } = res.data
        this.explain = explain
        const difficultyList = ['容易', '较易', '中等', '较难', '难']
        this.difficultyTypeList = difficultyList.map((item) => {
          return { ...questionType[item], name: `${item}题` }
        })
        this.setCurrentValue('currentDifficulty', this.difficultyTypeList[0])
        // 难度分析-圆环图
        this.ringChartData = {
          series: [
            {
              data: difficultyList.map((difficult) => {
                const { count = 0, score = 0, rate = 0 } = questionType[difficult]
                return { difficult, count, score, value: rate, show: true }
              }),
            },
          ],
        }
        this.ringLegendData = JSON.parse(JSON.stringify(this.ringChartData.series[0].data))
        // 难度分析-柱状图
        const myRateList = []
        const classRateList = []
        const gradeRateList = []
        difficultyList.forEach((item) => {
          const { myScoreRate = 0, classScoreRate = 0, gradeScoreRate = 0 } = questionType[item]
          myRateList.push(this.formateData(myScoreRate))
          classRateList.push(this.formateData(classScoreRate))
          gradeRateList.push(this.formateData(gradeScoreRate))
        })
        this.chartData = {
          categories: difficultyList.map(item => `${item}题`),
          series: [
            { name: '我的', legendShape: 'circle', data: myRateList },
            { name: '班级', legendShape: 'circle', data: classRateList },
            { name: '年级', legendShape: 'circle', data: gradeRateList },
          ],
        }
        // 题型结构-圆环图
        const strucList = ['客观题', '主观题']
        this.strucTypeList = strucList.map((item) => {
          return { ...questionStruc[item], name: item }
        })
        this.setCurrentValue('currentStruc', this.strucTypeList[0])
        this.strucChartData = {
          series: [
            {
              data: strucList.map((item) => {
                const { count = 0, score = 0, rate = 0 } = questionStruc[item] || {}
                return { name: `${item}${count}题/${score}分，占比${rate}%`, value: rate, show: true }
              }),
            },
          ],

        }
        this.strucLegendData = JSON.parse(JSON.stringify(this.strucChartData.series[0].data))
        // 试题得分
        this.tableData = questions.map((item) => {
          return {
            ...item,
            scoreRate: `${this.formateData(item.scoreRate * 100, 0)}%`,
            classAvg: this.formateData(item.classAvg, 1),
            gradeAvg: this.formateData(item.gradeAvg, 1),
          }
        })
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (error) {
        this.pageConfig = { show: false, isLoading: false }
      }
    },
    getIndex({ currentIndex }) {
      if (!this.visible)
        return
      currentIndex !== -1 && this.setCurrentValue('currentDifficulty', this.difficultyTypeList[currentIndex])
    },
    tapStrucLegend(index) {
      // 注意这里关闭了加载动画，不然点击图例会执行动画效果
      this.strucAnimation = false
      this.strucLegendData[index].show = !this.strucLegendData[index].show
      const chartData = {
        series: [
          {
            data: this.strucLegendData,
          },
        ],
      }
      this.strucChartData = JSON.parse(JSON.stringify(chartData))
    },
    tapLegend(index) {
      if (!this.visible)
        return
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
      this.ringChartData = JSON.parse(JSON.stringify(chartData))
    },
    getStrucIndex({ currentIndex }) {
      currentIndex !== -1 && this.setCurrentValue('currentStruc', this.strucTypeList[currentIndex])
    },
    setCurrentValue(key, detail) {
      this[key] = {
        type: detail.name,
        scoreRate: `${detail.rate || 0}%`,
        score: `${detail.count || 0}题/${detail.score || 0}分`,
      }
    },
    // 数据格式化
    formateData(value, n = 2) {
      if (!value)
        return 0
      return value % 1 === 0 ? value : Number(value).toFixed(n)
    },
  },
}
</script>

<style lang="scss" scoped>
.all {
  border-radius: 24rpx;
  &-item {
    position: relative;
    background: #ffffff;
    border-radius: 24rpx;
    padding: 36rpx 28rpx;
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      &-line {
        width: 8rpx;
        height: 30rpx;
        background: #ffba1d;
        border-radius: 4rpx;
        margin-right: 12rpx;
      }
      &-title {
        font-size: 30rpx;
        color: #333333;
      }
    }
    .distribute {
      margin-top: 40rpx;
    }
    .draw {
      &-tips {
        margin-bottom: 20rpx;
        &__title {
          font-size: 22rpx;
          color: #939393;
          margin-bottom: 6rpx;
        }
      }
      &-circle {
        height: 280rpx;
        display: flex;
        justify-content: space-between;
        margin-bottom: 20rpx;
        .ring {
          width: 300rpx;
          position: relative;
          .title {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 1;
            white-space: nowrap;
            &-type {
              font-size: 24rpx;
              color: #939393;
            }
            &-rate {
              color: #333;
              font-size: 40rpx;
              font-weight: 500;
            }
          }
        }
        .legend {
          width: 450rpx;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          .item {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 16rpx;
            &:last-child {
              margin-bottom: 0;
            }
            &-icon {
              width: 18rpx;
              height: 18rpx;
              border-radius: 50%;
              flex-shrink: 0;
              margin-right: 10rpx;
            }
            &-text {
              display: flex;
              align-items: center;
              &__diffcult {
                width: 72rpx;
                font-size: 24rpx;
                color: #333333;
                margin-right: 10rpx;
                white-space: nowrap;
              }
              &__split {
                width: 2rpx;
                height: 18rpx;
                background-color: #939393;
                margin-right: 8rpx;
              }
              &__count {
                width: 114rpx;
                font-size: 24rpx;
                color: #333333;
                margin-right: 22rpx;
                white-space: nowrap;
              }
              &__rate {
                font-size: 22rpx;
                color: #939393;
              }
            }
            &-hide {
              filter: grayscale(100%);
              .item-text {
                .active {
                  color: #aaaaaa;
                }
                &__split {
                  background-color: #aaaaaa;
                }
              }
            }
          }
        }
        .strucRing {
          margin-bottom: 20rpx;
        }
      }
      &-analyze {
        margin: 24rpx 0;
      }
    }
    .sub {
      font-size: 30rpx;
      color: #333;
      margin-bottom: 22rpx;
    }
    .scroll {
      &.noMember {
        margin-bottom: 20rpx;
      }
      &-table {
        border: none;
        border-radius: 24rpx;
        overflow: visible;
        .tr {
          display: flex;
          &:nth-child(2n) {
            background: #ffffff;
            .td:first-child,
            .th:first-child {
              background: #ffffff;
            }
          }
          &:nth-child(2n - 1) {
            background: #f8f8f8;
            .td:first-child,
            .th:first-child {
              background: #f8f8f8;
            }
          }
          .td:first-child,
          .th:first-child {
            color: #939393;
            position: sticky;
            left: 0;
            z-index: 1;
          }
        }
        .th,
        .td {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          height: 66rpx;
          border: none;
          padding: 0;
          font-size: 24rpx;
          color: #939393;
          background: none;
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
          font-size: 26rpx;
          .star {
            width: 160rpx;
            position: relative;
            display: flex;
            align-items: center;
            &-progress {
              width: 0;
              position: absolute;
              top: 0;
              left: 0;
              overflow: hidden;
              z-index: 1;
              .bar {
                width: 160rpx;
                display: flex;
                align-items: center;
              }
            }
            &-icon {
              width: 28rpx;
              height: 28rpx;
              margin-right: 4rpx;
              &:last-child {
                margin-right: 0;
              }
            }
          }
        }
        .score {
          display: flex;
          align-items: center;
          width: 100%;
          margin-left: 60rpx;
          &-error {
            width: 28rpx;
            height: 28rpx;
            margin-left: 4rpx;
          }
          &-half {
            width: 30rpx;
            height: 30rpx;
            margin-left: 8rpx;
          }
        }
      }
    }
    &:first-child {
      margin-bottom: 24rpx;
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
}
</style>
