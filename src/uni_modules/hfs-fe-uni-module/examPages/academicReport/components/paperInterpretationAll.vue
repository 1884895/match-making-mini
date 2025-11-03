<template>
  <view class="all">
    <view class="all-item">
      <view class="header-title">
        难度分析
      </view>
      <DiffifultyAnalysis :score-rate-level="scoreRateLevel" :exam-detail="examDetail" event-id="ks_cjzl_ndfx_ljkt_pay" />
      <view id="point4" class="header-title distribute">
        题型分布
      </view>
      <view class="draw">
        <!-- <view class="draw-tips" v-if="false">
            <view class="draw-tips__title">考试难度</view>
            <Progress :progress-text="visibility ? `得分率${examDetail.scoreRate}%` : ''" :difficulty-level="(explain.difficultySum && explain.difficultySum.difficultyLevel) || ''" :show-progress="visibility"></Progress>
          </view> -->
        <view v-if="ringChartData.series" class="draw-circle">
          <view class="ring">
            <view class="title">
              <view class="title-rate">
                {{ currentDifficulty.scoreRate }}
              </view>
              <view class="title-type">
                {{ currentDifficulty.type }}
              </view>
            </view>
            <qiun-data-charts type="ring" :canvas2d="true" :tooltip-show="visibility" :animation="animation" :in-scroll-view="true" :page-scroll-top="scrollTop" :opts="ringOpts" :chart-data="ringChartData" @get-index="getIndex" />
          </view>
          <view class="legend">
            <view v-for="(item, index) in ringLegendData" :key="index" class="item" :class="[item.show ? '' : 'item-hide']" @click="tapLegend(index)">
              <view class="item-icon" :style="{ backgroundColor: ringOpts.color[index] }" />
              <view v-if="visibility || index === 0" class="item-text">
                <view class="item-text__diffcult active">
                  {{ item.name }}题
                </view>
                <view class="item-text__split" />
                <view class="item-text__count active">
                  {{ item.count }}题/{{ item.score }}分
                </view>
                <view class="item-text__rate active">
                  {{ item.value }}%
                </view>
              </view>
              <IMask v-else :show="visibility" display="block">
                <view class="item-text">
                  <view class="item-text__diffcult active">
                    {{ item.name }}题
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
      </view>
      <view class="analyze">
        <AnalyzeTemplate :custom="true" style="font-size: 28rpx;">
          <view class="item-text item-text-explain">
            <view class="explain">
              “考试难度是考试成绩的影响因素，难度越大，越不易取得高分。因此，不能孤立地看成绩，也要关注考试难度。”
            </view>
            <IMask :show="visibility" :nodes="difficultyExplain" />
          </view>
        </AnalyzeTemplate>
        <UnlockMember title="解锁本次考试题型分布" :visible="visibility" event-id="ks_cjzl_txfb_ljkt_pay" />
      </view>
    </view>
    <view class="connect">
      <image class="connect-icon" :src="`${resourceUrl}connect.png`" mode="heightFix" />
      <image class="connect-icon" :src="`${resourceUrl}connect.png`" mode="heightFix" />
    </view>
  </view>
</template>

<script>
import IMask from '../../../components/i-mask.vue'
import { summaryDifficultyAnalyze } from '../../template/gradeSummary.js'
import analyzeTemplate from './analyzeTemplate.vue'
import diffifultyAnalysis from './difficultyAnalysis.vue'
import unlockMember from './unlockMember.vue'

export default {
  options: {
    styleIsolation: 'shared',
  },
  components: { AnalyzeTemplate: analyzeTemplate, IMask, UnlockMember: unlockMember, DiffifultyAnalysis: diffifultyAnalysis },
  props: {
    scrollTop: {
      type: Number,
      default: 0,
    },
    examId: {
      type: String,
      default: '',
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
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
      explain: {},
      chartData: {},
      ringChartData: {},
      ringLegendData: [],
      animation: true,
      tableData: [],
      strucTableData: [],
      radarOpts: {
        color: ['#ffad0f'],
        dataLabel: false,
        dataPointShape: false,
        fontSize: 12,
        fontColor: '#333333',
        legend: {
          show: false,
        },
        extra: {
          radar: {
            max: 1,
            border: true,
            gridCount: 5,
          },
          tooltip: {
            showBox: false,
          },
          gridColor: '#E9E9E9',
        },
      },
      opts: {
        color: ['#FFBA1D'],
        fontSize: 12,
        fontColor: '#333333',
        dataLabel: true,
        legend: {
          show: false,
        },
        xAxis: {
          fontSize: 12,
          fontColor: '#333333',
          axisLineColor: '#ededed',
        },
        yAxis: {
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
        extra: {
          column: {
            width: 52,
            type: 'group',
            barBorderCircle: false,
            barBorderRadius: [4, 4, 0, 0],
            linearType: 'custom',
            customColor: ['#FFC749'],
          },
          tooltip: {
            legendShow: false,
            borderRadius: 4,
          },
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
      columns: [
        { name: '', key: 'subject' },
        { name: '容易题', key: '容易' },
        { name: '较易题', key: '较易' },
        { name: '中等题', key: '中等' },
        { name: '较难题', key: '较难' },
        { name: '难题', key: '难' },
      ],
      strucColumns: [
        { name: '', key: 'subject' },
        { name: '客观题（分数/题量）', key: '客观题' },
        { name: '主观题（分数/题量）', key: '主观题' },
      ],
      currentDifficulty: {},
      difficultyTypeList: [],
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
    visibility() {
      return this.examDetail && this.examDetail.visible === 1
    },
    difficultyExplain() {
      // rate:等级得分率 difficultyLevel:等级  scoreRate:考试得分率
      const { rate = 0, difficultyLevel = '' } = this.explain.difficultySum || {}
      return summaryDifficultyAnalyze({ rate: rate.toFixed(), difficultyLevel, scoreRate: this.examDetail.scoreRate })
    },
  },
  // mounted() {
  //   this.getQuestionSummary();
  // },
  methods: {
    async getQuestionSummary() {
      try {
        const res = await uni.$http.get(`${this.prefix}/v4/exam/question-summary?examId=${this.examId}`)
        const { papers = [], questionType = {}, explain = {} } = res.data
        this.explain = explain
        const showRadar = papers.length > 2
        this.chartData = {
          categories: papers.map(item => showRadar ? `${item.subject}:${item.difficulty}` : item.subject),
          series: [
            { name: '难度', data: papers.map(item => item.difficulty) },
          ],
        }

        const difficultyList = ['容易', '较易', '中等', '较难', '难']
        this.difficultyTypeList = difficultyList.map((item) => {
          return { ...questionType[item], name: `${item}题` }
        })
        this.setCurrentDifficulty(this.difficultyTypeList[0])
        this.ringChartData = {
          series: [
            {
              data: difficultyList.map((item) => {
                const { count = 0, score = 0, scoreRate = 0 } = questionType[item]
                return { name: item, score, count, value: scoreRate, show: true }
              }),
            },
          ],
        }
        this.ringLegendData = JSON.parse(JSON.stringify(this.ringChartData.series[0].data))
        this.tableData = papers.map((item) => {
          const obj = { subject: item.subject }
          difficultyList.forEach((key) => {
            obj[key] = `${item.questionType[key].count}题/${item.questionType[key].score}分`
          })
          return obj
        })

        const strucList = ['客观题', '主观题']
        this.strucTableData = papers.map((item) => {
          const obj = { subject: item.subject }
          strucList.forEach((key) => {
            obj[key] = `${item.questionStruc[key].score}分/${item.questionStruc[key].count}题`
          })
          return obj
        })
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (error) {
      }
    },
    getIndex({ currentIndex }) {
      if (!this.visibility)
        return
      currentIndex !== -1 && this.setCurrentDifficulty(this.difficultyTypeList[currentIndex])
    },

    tapLegend(index) {
      if (!this.visibility)
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
      // 这里可以看出，只需要动态改变chartData.series.data.show（饼图类）chartData.series.show（其他图）即可动态改变图形显示与隐藏
      this.ringChartData = JSON.parse(JSON.stringify(chartData))
    },
    setCurrentDifficulty(detail) {
      this.currentDifficulty = {
        type: detail.name,
        scoreRate: `${detail.scoreRate}%`,
        score: `${detail.count}题/${detail.score}分`,
      }
    },
    getRatio(x, y) {
      const total = x + y
      const subjectiveRatio = Math.round((x / total) * 10)
      const objectiveRatio = Math.round((y / total) * 10)
      return `${subjectiveRatio}:${objectiveRatio}`
    },
    // 数据格式化
    formateData(value) {
      if (!value)
        return 0
      return value % 1 === 0 ? value : Number(value).toFixed(2)
    },
  },
}
</script>

<style lang="scss" scoped>
.all {
  background-color: white;
  border-radius: 24rpx;
  padding: 36rpx 28rpx;
  position: relative;
  &-item {
    .header {
      display: flex;
      align-items: center;
      &-title {
        display: flex;
        align-items: center;
        font-size: 30rpx;
        color: #333;
        &::before {
          margin-right: 12rpx;
          content: '';
          width: 8rpx;
          height: 30rpx;
          background: #ffba1d;
          border-radius: 4rpx;
        }
      }
    }
    .distribute {
      margin-top: 40rpx;
    }
    .difficulty {
      color: #939393;
      font-size: 22rpx;
      margin-top: 22rpx;
    }
    .draw {
      &-tips {
        margin-top: 20rpx;
        &__title {
          font-size: 22rpx;
          color: #939393;
          margin-bottom: 6rpx;
        }
      }
      &-chart {
        &_column {
          height: 268rpx;
        }
        &_tips {
          font-size: 26rpx;
          color: #939393;
        }
        &_radar {
          height: 400rpx;
        }
      }
      &-circle {
        height: 300rpx;
        display: flex;
        justify-content: space-between;
        .ring {
          width: 280rpx;
          position: relative;
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
              color: #939393;
              font-size: 24rpx;
            }
            &-rate {
              font-size: 44rpx;
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
                width: 140rpx;
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
      }
    }
    .sub {
      font-size: 30rpx;
      color: #333;
      margin-bottom: 22rpx;
    }
    .scroll {
      margin-bottom: 40rpx;
      ::v-deep .table {
        width: fit-content;
        min-width: 100%;
        border: none;
        border-radius: 24rpx;
        overflow: visible;
        .tr {
          border: none;
          &:nth-child(2n) {
            .th,
            .td {
              background: #ffffff;
            }
          }
          &:nth-child(2n - 1) {
            .th,
            .td {
              background: #f8f8f8;
            }
          }
        }
        .th,
        .td {
          white-space: nowrap;
          width: 150rpx;
          height: 66rpx;
          border: none;
          padding: 0;
          font-size: 24rpx;
          color: #939393;
          background: none;
        }
        .td {
          font-size: 26rpx;
          color: #333333;
        }
        .tr {
          .td:first-child,
          .th:first-child {
            font-size: 24rpx;
            color: #939393;
            position: sticky;
            left: 0;
          }
        }
      }
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

  .analyze {
    .item-text-explain {
      flex-direction: column;
      line-height: 44rpx;
      .explain {
        font-style: italic;
        font-size: 26rpx;
        color: #666666;
        line-height: 44rpx;
        margin-bottom: 10rpx;
      }
    }
    &-value {
      color: #939393;
      background: #f6f6f6;
      font-size: 28rpx;
      padding: 17rpx 24rpx;
      border-radius: 10rpx;
      position: relative;
      line-height: 40rpx;
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
  }
}
</style>
