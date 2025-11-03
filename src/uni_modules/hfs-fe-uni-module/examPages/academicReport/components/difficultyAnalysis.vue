<template>
  <view class="difficulty-analysis">
    <view class="level">
      难度：<IMask :show="visible">
        {{ `${scoreRateLevel.level || ''}` }}
      </IMask>
    </view>
    <view class="chart" :class="{ 'chart-only': !rateConfig || rateConfig.length === 0 }">
      <view v-if="rateConfig && rateConfig.length > 0" class="range" :style="{ right: `${100 - rateConfig[2] * 100}%` }">
        <view class="range-progress">
          <view class="dot left" />
          <view class="dot right" />
          <view class="dot rate" :style="{ left: `${avgRateLeft}%` }">
            <view class="avg">
              <image
                class="up-arrow"
                :src="`${resourceUrl}icon_difficulty_up_arrow.png`"
                mode="heightFix"
              />
              <view class="avg-rate">
                平均得分率<IMask :show="visible">
                  {{ `${rateConfig[1]}` || '' }}
                </IMask>
              </view>
            </view>
          </view>
        </view>
        <view class="range-bound">
          <view class="line1" />
          <view class="line2" />
        </view>
        <view class="range-bound-value">
          <view class="value value-left">
            <IMask :show="visible">
              {{ rateConfig[0] || '' }}
            </IMask>
          </view>
          <view class="value value-right">
            <IMask :show="visible">
              {{ rateConfig[2] || '' }}
            </IMask>
          </view>
        </view>
        <view class="range-footer">
          <view class="content content-left" />
          <view class="tip">
            <view>通过大数据分析</view>80%考试得分率分布范围
          </view>
          <view class="content content-right" />
        </view>
      </view>
      <image
        class="right-arrow"
        :src="`${resourceUrl}icon_difficulty_right_arrow.png`"
        mode="heightFix"
      />
      <view class="score" :style="{ left: `${scoreRateleft}%` }">
        <image
          class="icon"
          :src="`${resourceUrl}icon_difficulty_trigon.png`"
          mode="scaleToFill"
        />
        <view class="score-rate">
          <view class="text" :style="{ transform: `translateX(-${sLeft}%)` }">
            本场考试得分率<IMask :show="visible">
              {{ `${examDetail.scoreRate / 100}` || '' }}
            </IMask>
          </view>
          <image
            class="up-icon"
            :src="`${resourceUrl}icon_samelevel_rate.png`"
            mode="heightFix"
          />
        </view>
      </view>
      <view class="lable">
        难
      </view>
      <view class="lable easy">
        易
      </view>
    </view>
    <view class="analyze">
      <AnalyzeTemplate :custom="true" style="font-size: 28rpx;">
        <view class="item-text item-text-explain">
          <view class="explain">
            “通过对比历次考试得分率和当前考试得分率，可以评估考试难度变化趋势，了解学生所处的竞争环境，从而更有针对性地指导学生学习。”
          </view>
          <IMask :show="visible" :nodes="analysisText" />
        </view>
      </AnalyzeTemplate>
      <UnlockMember title="解锁本次考试难度分析" :visible="visible" :event-id="eventId" />
    </view>
  </view>
</template>

<script>
import IMask from '../../../components/i-mask.vue'
import { difficultyAnalysis } from '../../template/gradeSummary.js'
import analyzeTemplate from './analyzeTemplate.vue'
import unlockMember from './unlockMember.vue'

export default {
  components: { AnalyzeTemplate: analyzeTemplate, IMask, UnlockMember: unlockMember },
  props: {
    eventId: {
      type: String,
      default: '',
    },
    scoreRateLevel: {
      type: Object,
      default: () => {},
    },
    examDetail: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
    }
  },
  computed: {
    visible() {
      return this.examDetail && this.examDetail.visible === 1
    },
    sLeft() {
      if (this.scoreRateleft < 10)
        return 10
      if (this.scoreRateleft > 90)
        return 90
      return 50
    },
    rateConfig() {
      return this.scoreRateLevel.rateConfig || []
    },
    analysisText() {
      const { subject = '', scoreRate = 0 } = this.examDetail || {}
      return difficultyAnalysis({ subject, scoreRate: scoreRate / 100, rateConfig: this.rateConfig, level: this.scoreRateLevel.level || '', wave: this.scoreRateLevel.wave + 1 || 0 })
    },
    avgRateLeft() {
      const avgRate = this.rateConfig[1]
      const lowestRate = this.rateConfig[0]
      const highestRate = this.rateConfig[2]
      return ((avgRate - lowestRate) / (highestRate - lowestRate)) * 100
    },
    scoreRateleft() {
      const { scoreRate = 0 } = this.examDetail || {}
      const lowestRate = this.rateConfig[0]
      const highestRate = this.rateConfig[2]
      let flex = 0
      const rate = Math.min(100, scoreRate) / 100
      if (rate < lowestRate) {
        flex = rate / lowestRate * (highestRate - 0.45)
      }
      else if (lowestRate <= rate && rate <= highestRate) {
        flex = highestRate - 0.45 + 0.45 * (rate - lowestRate) / (highestRate - lowestRate)
      }
      else {
        flex = rate
      }
      return flex * 100
    },
  },
}
</script>

<style lang="scss" scoped>
.difficulty-analysis {
  font-size: 22rpx;
  color: #939393;
  .lable {
    position: absolute;
    top: 16rpx;
  }
  .easy {
    right: 0;
  }
  .level {
    margin-top: 20rpx;
    display: flex;
  }
  .score {
    position: absolute;
    margin-left: -12rpx;
    display: flex;
    flex-direction: row;
    white-space: nowrap;
    justify-content: center;
    z-index: 1;
    .icon {
      width: 24rpx;
      height: 20rpx;
    }
    &-rate {
      position: absolute;
      color: white;
      margin-left: -12rpx;
      .text {
        padding: 0 6rpx;
        bottom: 15rpx;
        position: absolute;
        display: inline-flex;
        border-radius: 8rpx;
        background: #ff6c08;
        line-height: 32rpx;
        font-size: 22rpx;
      }

      .up-icon {
        height: 8rpx;
        position: absolute;
        bottom: 9rpx;
      }
    }
  }
  .chart {
    position: relative;
    width: 100%;
    height: 8rpx;
    background: #ffe9b5;
    border-radius: 10rpx;
    display: flex;
    align-items: center;
    margin: 90rpx 0 182rpx;
    &-only {
      margin: 90rpx 0 60rpx;
    }
    .range {
      position: absolute;
      width: 45%;
      top: 0;
      background: linear-gradient(
        180deg,
        rgba(255, 193, 0, 0.2),
        rgba(255, 177, 0, 0)
      );
      &-progress {
        display: flex;
        position: relative;
        align-items: center;
        height: 8rpx;
        width: 100%;
        z-index: 1;
        background: linear-gradient(270deg, #ffba1d, #ffde3e);
        .dot {
          width: 18rpx;
          position: absolute;
          height: 18rpx;
          background: #ffffff;
          border: 4rpx solid #ffb100;
          border-radius: 50%;
        }
        .rate {
          margin-left: -8rpx;
          background: #ffb100;
          border: 4rpx solid #ffffff;
          white-space: nowrap;
          display: flex;
          justify-content: center;
          .avg {
            margin-top: 32rpx;
            font-size: 22rpx;
            color: #333333;
            .up-arrow {
              height: 6rpx;
              left: 50%;
              transform: translateX(-50%);
            }
            &-rate {
              background: rgba(255, 177, 0, 0.2);
              border-radius: 8rpx;
              line-height: 32rpx;
              display: flex;
              padding: 0 6rpx;
            }
          }
        }
        .left {
          margin-left: -9rpx;
        }
        .right {
          left: 100%;
          margin-left: -9rpx;
        }
      }
      &-bound {
        position: relative;
        width: 100%;
        height: 12rpx;
        .line1 {
          height: 100%;
          position: absolute;
          border-left: 2rpx solid #ffb100;
        }
        .line2 {
          height: 100%;
          left: 100%;
          position: absolute;
          border-right: 2rpx solid #ffb100;
        }
        &-value {
          width: 100%;
          line-height: 32rpx;
          position: relative;
          display: flex;
          justify-content: space-between;
          .value {
            width: 50;
            display: flex;
            justify-content: center;
            color: #333333;
            line-height: 32rpx;
            &-left {
              margin-left: -25rpx;
            }
            &-right {
              margin-right: -25rpx;
            }
          }
        }
      }
      &-footer {
        position: relative;
        height: 92rpx;
        display: flex;
        justify-content: space-between;
        width: 100%;
        .content {
          flex: 1;
          border-bottom: 2rpx solid #ffb100;
          height: 78rpx;
          &-right {
            margin-right: -2rpx;
            border-bottom-right-radius: 20rpx;
            border-right: 2rpx solid #ffb100;
          }
          &-left {
            border-bottom-left-radius: 20rpx;
            border-left: 2rpx solid #ffb100;
          }
        }
        .tip {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          font-size: 18rpx;
          text-align: center;
          color: #ffb100;
          margin-bottom: -14rpx;
          line-height: 28rpx;
        }
      }
    }
    .right-arrow {
      height: 28rpx;
      position: absolute;
      right: 0;
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
