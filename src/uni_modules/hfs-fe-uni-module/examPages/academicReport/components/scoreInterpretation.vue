<template>
  <view>
    <view class="interpretation">
      <view class="interpretation-content">
        <!-- 成绩分布:成绩被屏蔽时不展示 -->
        <view class="distribution">
          <view class="distribution-tip">
            {{ title }}
          </view>
          <view class="distribution-position">
            <view class="distribution-position__details">
              <view class="distribution-position__column">
                <view class="distribution-position__item">
                  <view class="distribution-position__value">
                    <IMask v-if="myScoreStage" :show="visible" display="inline-flex">
                      <view>{{ myScoreStage }}</view>
                    </IMask>
                  </view>
                  <view class="lable">
                    {{ `所处${rangeName}` }}
                  </view>
                </view>
              </view>
              <view class="distribution-position__column distribution-position__line">
                <IMask display="inline-flex" :show="posClassStuCount === 2">
                  <view class="distribution-position__item">
                    <view class="distribution-position__value">
                      <IMask :show="visible" display="inline-flex">
                        <view>{{ `${classStuNum}人` }}</view>
                      </IMask>
                    </view>
                    <view class="lable">
                      {{ `${rangeName}班级人数` }}
                    </view>
                  </view>
                </IMask>
              </view>
              <view class="distribution-position__column distribution-position__line">
                <IMask display="inline-flex" :show="posGradeStuCount === 2">
                  <view class="distribution-position__item">
                    <view class="distribution-position__value">
                      <IMask :show="visible" display="inline-flex">
                        <view>{{ `${gradeStuNum}人` }}</view>
                      </IMask>
                    </view>
                    <view class="lable">
                      {{ `${rangeName}年级人数` }}
                    </view>
                  </view>
                </IMask>
              </view>
            </view>
          </view>
          <view class="distribution-charts" :class="{ noMember: !visible }">
            <view v-if="visible">
              {{ `总人数：${allStuNum}人` }}
            </view>
            <view class="distribution-charts__column">
              <view v-if="!visible" class="mask" :style="[maskStyle]">
                <image class="mask-pic" :src="`${examResourceUrl}no_location.png`" />
              </view>
              <qiun-data-charts
                type="column"
                :ontouch="true"
                :opts="opts"
                :tooltip-show="false"
                :canvas2d="true"
                :chart-data="chartData"
                :in-scroll-view="true"
                :page-scroll-top="scrollTop"
                @get-index="showScoreStageTip"
                @complete="mixComplete"
              />
            </view>
          </view>
          <view style="font-size: 28rpx; margin-top: 24rpx">
            <AnalyzeTemplate :custom="true">
              <view class="item-text">
                <view v-if="isAll" class="explain">
                  “了解自己在当前考试中的位置、与更高分数段的差距才能科学制定新阶段新目标！”
                </view>
                <IMask :show="visible" :nodes="distributeGuide" />
              </view>
            </AnalyzeTemplate>
          </view>
          <UnlockMember title="解锁本次考试所处位置" :visible="visible" :event-id="isAll ? 'ks_cjzl_wdwz_ljkt_pay' : 'ks_xkfx_wdwz_ljkt_pay'" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import IMask from '../../../components/i-mask.vue'
import { subjectAnalysisMyPosition } from '../../template/subjectAnalyze.js'
import { summaryMyPosition } from '../../template/gradeSummary.js'
import unlockMember from './unlockMember.vue'
import analyzeTemplate from './analyzeTemplate.vue'
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js'
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { AnalyzeTemplate: analyzeTemplate, IMask, UnlockMember: unlockMember },
  props: {
    scrollTop: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      default: '我的位置',
    },
    examId: {
      type: String,
      default: '',
    },
    paperId: {
      type: String,
      default: '',
    },
    config: {
      type: Object,
      default: () => {},
    },
    mode: {
      type: Number,
      default: 0,
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
    examDetail: {
      type: Object,
      default: () => {},
    },
    subjectDetail: {
      type: Object,
      default: () => {},
    },
    subjectStatus: {
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
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
      examResourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
      analyisData: {},
      posClassStuCount: 2,
      posGradeStuCount: 2,
      isRankPart: true,
      myScoreStage: '', // 我的位置分数段
      allStuNum: 0, // 考试总人数
      classStuNum: 0,
      gradeStuNum: 0,
      opts: {
        enableScroll: false,
        color: ['#FFEFCC'],
        unit: '分',
        fontSize: 10,
        fontColor: '#54423D',
        dataLabel: false,
        legend: {
          show: false,
        },
        xAxis: {
          axisLineColor: '#EDEDED',
          fontColor: '#939393',
          fontSize: 11,
          labelCount: 4,
        },
        yAxis: {
          data: [
            {
              format: 'yAxisFixed',
              unit: '人',
              tofix: 0,
              axisLine: false,
              fontColor: '#939393',
              fontSize: 11,
            },
          ],
          gridColor: '#EDEDED',
          gridType: 'dash',
          dashLength: 6,
        },
        extra: {
          column: {
            type: 'group',
            categoryGap: 2,
            barBorderRadius: [3.5, 3.5, 0, 0],
            // activeBgColor: '#FFBA1D',
            activeBgOpacity: 0,
            linearType: 'opacity',
            linearOpacity: 0.8,
          },
          tooltip: {
            legendShow: false,
            borderRadius: 4,
            fontSize: 11,
          },
        },
      },
      maskStyle: {},
      chartData: {},
      myGradeIndex: 0,
    }
  },
  computed: {
    rangeName() {
      return this.analyisData.scoreStage === 2 ? '分数段' : '档位'
    },
    groupType() {
      return [2, 3].includes(this.mode) ? 1 : 0
    },
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    isAll() {
      return !this.paperId || this.paperId === '0'
    },
    visible() {
      return this.examDetail && this.examDetail.visible === 1
    },
    distributeGuide() {
      return this.isAll ? this.getScoreSummaryMyPosition() : this.getSubjectAnalysisMyPosition()
    },
  },
  watch: {
    paperId: {
      handler(val) {
        if (!Object.keys(val).length)
          return
        this.getData()
      },
      immediate: true,
    },
  },
  methods: {
    jumpVip() {
      // #ifdef MP-WEIXIN
      uni.navigateTo({ url: '/pages/me/member' })
      // #endif
      // #ifdef H5
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, data: {} }))
      // #endif
    },
    getData() {
      this.getAnalysis(this.examId, this.paperId || '')
    },
    mixComplete(e) {
      const { area, pix } = e.opts
      const [top, right, bottom, left] = area.map(v => `${v / pix}px`)
      this.maskStyle = { top, right, bottom, left }
      if (this.visible) {
        const calPoints = e.opts.chartData.calPoints[0] || []
        e.currentIndex = { index: this.myGradeIndex }
        e.event = calPoints[e.currentIndex.index]
        this.showScoreStageTip(e)
      }
    },
    showScoreStageTip(e) {
      // #ifdef MP-WEIXIN
      e.event.y -= this.scrollTop
      // #endif
      const index = e.currentIndex.index
      const textList = []
      if (index > -1) {
        const groups = this.analyisData.groups || []
        textList.push(...[
          {
            text: this.analyisData.scoreStage === 2 ? `分数段：${groups[index].min}-${groups[index].max}\r\r` : `档位：${groups[index].level}`,
          },
          {
            text: this.posClassStuCount === 2 ? `班级人数：${groups[index].classStuNum}` : '',
          },
          {
            text: this.posGradeStuCount === 2 ? `年级人数：${groups[index].gradeStuNum}` : '',
          },
        ])
      }
      uCharts.instance[e.id].showToolTip(
        { changedTouches: [e.event] },
        {
          index,
          textList: textList.filter(item => item.text && item.text.length > 0),
        },
      )
    },
    show(key, val) {
      return this.config && this.config[key] === (val || 2)
    },
    setChartData(groups, myGradeIndex, isScoreStage) {
      this.chartData = {
        categories: groups.map(v => isScoreStage ? `${v.max}分` : v.level),
        series: [
          {
            name: isScoreStage ? '分数段' : '档位',
            data: groups.map((v, i) => {
              if (i === myGradeIndex) {
                this.myScoreStage = isScoreStage ? `${v.min}-${v.max}` : v.level
                this.classStuNum = v.classStuNum
                this.gradeStuNum = v.gradeStuNum
                return {
                  value: v.gradeStuNum,
                  color: '#FFB100',
                }
              }
              return v.gradeStuNum
            }),
          },
        ],
      }
    },
    setExamExtraInfo(analyisData) {
      this.allStuNum = analyisData.gradeStuNum || 0
      this.analyisData = analyisData
      this.myGradeIndex = this.analyisData.myGradeIndex
      this.setChartData(analyisData.groups || [], analyisData.myGradeIndex, analyisData.scoreStage === 2)
    },
    async getAnalysis(examId, paperId) {
      try {
        const groupType = this.groupType
        const prodUrl = this.prefix + (this.isAll ? `/v4/exam/same-group-analysis${uni.$u.queryParams({ examId, groupType })}` : `/v4/exam/paper/same-group-analysis${uni.$u.queryParams({ examId, paperId, groupType })}`)
        const res = await uni.$http.get(prodUrl)
        const { posGradeStuCount = 2, posClassStuCount = 2 } = res.data || {}
        this.posClassStuCount = posClassStuCount
        this.posGradeStuCount = posGradeStuCount
        this.setExamExtraInfo(res.data)
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {}
    },
    getScoreSummaryMyPosition() {
      const { scoreStage = 0, groups = [], myGradeIndex = 0, score = 0, scoreType = 0 } = this.analyisData || {}
      const { min = 0 } = groups[myGradeIndex + 1] || {}
      const improveScore = scoreType === 2 && scoreStage === 2 ? Math.max(0, min - score).toFixed() : ''
      const { studentName = '' } = this.userInfo.linkedStudent || {}
      const options = {
        improveScore,
        level: this.examDetail.level,
        studentName,
        myScoreStage: this.myScoreStage,
        rangeName: this.rangeName,
        classStuNum: this.classStuNum,
        gradeStuNum: this.gradeStuNum,
      }
      return summaryMyPosition(options)
    },
    getSubjectAnalysisMyPosition() {
      const options = {
        level: this.subjectExamDetail.level,
        subject: this.subjectDetail.subject,
        myScoreStage: this.myScoreStage,
        rangeName: this.rangeName,
        classStuNum: this.classStuNum,
        gradeStuNum: this.gradeStuNum,
        weakAdvantageStatus: this.subjectStatus[this.subjectDetail.subject],
      }
      return subjectAnalysisMyPosition(options)
    },
    formateData(value) {
      if (!value)
        return 0
      return value % 1 === 0 ? value : Number(value).toFixed(2)
    },
  },
}
</script>

<style lang="scss" scoped>
.interpretation {
  position: relative;
  &-content {
    background: white;
    border-radius: 24rpx;
    position: relative;
    padding: 36rpx 28rpx;
  }
  &-content__trend {
    margin-top: 24rpx;
  }
}
.distribution {
  &-tip {
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
  &-chart {
    padding: 0 30rpx 28rpx;
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
  &-position {
    color: #939393;
    font-size: 24rpx;
    background: white;
    border-radius: 24rpx;
    &__content {
      display: flex;
      align-items: center;
      font-size: 26rpx;
    }
    &__icon {
      width: 18rpx;
      height: 22rpx;
      margin-right: 8rpx;
    }
    &__details {
      margin-top: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 144rpx;
      background: #fff8e8;
      border-radius: 16rpx;
      box-shadow: 0rpx 1rpx 0rpx 0rpx #ffe7b2 inset;
    }
    &__column {
      display: flex;
      width: calc(100% / 3);
      position: relative;
      justify-content: center;
    }
    &__line::before {
      content: '';
      height: 60rpx;
      border-left: 1rpx dashed #d7d7d7;
      left: 0;
      top: 50%;
      position: absolute;
      transform: translateY(-50%);
    }
    &__item {
      text-align: center;
      font-size: 26rpx;
      color: rgba(51, 51, 51, 0.6);
      .lable {
        margin-top: 4rpx;
      }
    }
    &__value {
      font-size: 36rpx;
      color: #ffba1d;
      height: 50rpx;
      justify-content: center;
      display: flex;
      align-items: center;
      font-weight: 500;
    }
  }
  &-charts {
    position: relative;
    font-size: 24rpx;
    color: #939393;
    text-align: right;
    margin: 12rpx 0 16rpx;
    &.noMember {
      margin-top: 26rpx;
    }
    &__column {
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
    &__value {
      margin-bottom: 24rpx;
    }
  }
  .novip {
    margin-bottom: 24rpx;
  }
  &-trend {
    background: linear-gradient(180deg, #fff9e7, #ffffff 45%);
    border-radius: 8rpx;
    margin-top: 24rpx;
    box-shadow: 0 0 12rpx 0 rgba(0, 0, 0, 0.1);
    font-size: 24rpx;
    color: #333333;
    padding: 16rpx 20rpx;
    &__text {
      color: '#939393';
    }
    &__exam,
    &__details {
      display: flex;
      justify-content: space-between;
    }
    &__analyze {
      margin-top: 28rpx;
    }
  }
  &-legends {
    margin-top: 30rpx;
    display: flex;
    &__title {
      display: flex;
      align-items: center;
      font-size: 28rpx;
      color: #333333;
    }
    &__class::before {
      margin-right: 10rpx;
      content: '';
      display: flex;
      width: 24rpx;
      height: 24rpx;
      background: #ffba1d;
      border-radius: 50%;
    }
    &__grade {
      margin-left: 30rpx;
    }
    &__grade::before {
      margin-right: 10rpx;
      content: '';
      display: flex;
      width: 24rpx;
      height: 24rpx;
      background: #26c53b;
      border-radius: 50%;
    }
  }
  &_hidden {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8rpx;
    backdrop-filter: blur(8rpx);
    z-index: 10;
    &__btn {
      width: 250rpx;
      height: 57rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3f1902;
      border-radius: 48rpx;
      .icon {
        width: 30rpx;
        height: 26rpx;
        margin-right: 10rpx;
      }
      .text {
        font-size: 30rpx;
        color: #fdd891;
      }
    }
  }
  .item-text {
    color: #333333;
    font-size: 28rpx;
    line-height: 48rpx;
    .explain {
      font-style: italic;
      font-size: 26rpx;
      color: #666666;
      line-height: 44rpx;
      margin-bottom: 10rpx;
    }
  }
}
@supports not (backdrop-filter: none) {
  .distribution_hidden {
    background: rgba(255, 255, 255, 0.9);
  }
}
</style>
