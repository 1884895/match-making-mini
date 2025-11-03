<template>
  <view class="level">
    <view class="level-header">
      <view class="level-header__tip">
        同层次对比
      </view>
    </view>
    <view class="level-chart">
      <IMask :show="visibility" :nodes="totalCountTip" />
      <view v-if="visibility" class="level-same">
        <view class="level-same-progress" :style="{ flex: `${beat / 100}` }">
          <view class="level-same-text">
            <view class="level-same-rate" :class="{ left: (beat < 5), right: (beat > 95) }">
              {{ `击败率：${beat}%` }}
            </view>
            <image class="level-same-icon" :src="`${resourceUrl}icon_samelevel_rate.png`" mode="heightFix" />
          </view>
        </view>
        <view class="level-same-right" style="width: 32rpx; background: #FFBA1D" />
      </view>
      <view v-else class="level-same level-same-novip" style="justify-content: center">
        <image
          :src="`${resourceUrl}icon_defeat_rate.png`"
          mode="heightFix"
          style="height: 32rpx"
        />
      </view>
      <view class="compare">
        <view class="yAxis">
          <image
            class="yAxis-arrow"
            :src="`${resourceUrl}icon_y_arrow.png`"
            mode="widthFix"
          />
        </view>
        <view class="xAxis">
          <view v-for="(item, index) in [min, ...levels, max]" :key="index" class="xAxis-item" :class="{ top: index === levels.length + 1, above: index !== levels.length + 1 && index === myIndex + 1 }">
            <view v-if="showLevel" class="xAxis-item-content">
              <view
                v-if="index !== 0 && index !== levels.length + 1"
                class="xAxis-item-column"
                :style="{ width: `${maxCount !== 0 ? item.count / maxCount * 100 : 0}%` }"
                :class="{ mine: myIndex === index }"
              >
                <view class="xAxis-item-column__level">
                  <IMask :show="visibility">
                    {{ item.level || '' }}
                  </IMask>
                </view>
                <view class="xAxis-item-column__num">
                  <IMask :show="visibility">
                    {{ (item.count || 0) }}
                  </IMask>人
                </view>
              </view>
              <image
                v-if="index === levels.length + 1"
                class="tip"
                :src="`${resourceUrl}icon_same_level_top_line.png`"
                mode="heightFix"
              />
            </view>
            <view v-if="showLevel && index > 0 && index === myIndex" class="xAxis-item-extra" :style="{ marginBottom: `${64 / 2}rpx` }">
              <view class="line-container">
                <view v-if="visibility" class="dot" />
                <view v-else class="dot-novip">
                  <image
                    class="icon"
                    :src="`${resourceUrl}icon_level_no_vip.png`"
                  />
                </view>
                <view class="max-line" :style="{ height: `${64 * (levels.length - myIndex + 0.5) - (myIndex === 3 ? 0 : (2 + myIndex % 2))}rpx` }">
                  <image
                    class="max-line-icon"
                    :src="`${resourceUrl}icon_yellow_line_arrow.png`"
                    mode="widthFix"
                  />
                  <view class="line" />
                  <view v-if="myScore >= 0" class="differ" :class="{ self: myIndex >= levels.length }">
                    差距<IMask :show="visibility">
                      {{ parseFloat((max.min - myScore).toFixed(2)) }}
                    </IMask>分
                  </view>
                </view>
                <view v-if="myIndex < levels.length" class="same-line" :style="{ height: `${64 * 0.5}rpx` }">
                  <image
                    class="same-line-icon"
                    :src="`${resourceUrl}icon_line_green_arrow.png`"
                    mode="widthFix"
                  />
                  <view class="line" />
                  <view v-if="myScore >= 0" class="differ">
                    差距<IMask :show="visibility">
                      <view>{{ `${parseFloat(sameLineDiff.toFixed(2))}` }}</view>
                    </IMask>分
                  </view>
                </view>
              </view>
            </view>
            <view v-if="isRepeat ? (index === 1 || index === 4) : item.min > -1" class="yAxis-label">
              <IMask :show="visibility">
                {{ `${item.min}分` }}
              </IMask>
            </view>
          </view>
        </view>
      </view>
      <view style="margin-top: 32rpx; font-size: 28rpx">
        <AnalyzeTemplate :custom="true">
          <view class="item-text">
            <view class="explain">
              “好分数根据学生学业水平将学生划分为不同层级，清晰自己在同层级中的优劣势才能有的放矢地制定计划实现层级跃迁。知己知彼才能实现新超越！”
            </view>
            <IMask v-if="sameLevelText && sameLevelText.length > 0" :show="visibility" :nodes="sameLevelText" />
          </view>
        </AnalyzeTemplate>
      </view>
      <UnlockMember title="解锁本次考试同层次对比" :visible="visibility" event-id="ks_cjzl_tccfx_ljkt_pay" />
    </view>
    <view class="connect">
      <image class="connect-icon" :src="`${resourceUrl}connect.png`" mode="heightFix" />
      <image class="connect-icon" :src="`${resourceUrl}connect.png`" mode="heightFix" />
    </view>
  </view>
</template>

<script>
import IMask from '../../../components/i-mask.vue'
import { summarySameLevelCompare } from '../../template/gradeSummary.js'
import analyzeTemplate from './analyzeTemplate.vue'
import unlockMember from './unlockMember.vue'

export default {
  components: { AnalyzeTemplate: analyzeTemplate, IMask, UnlockMember: unlockMember },
  props: {
    userInfo: {
      type: Object,
      default: () => {},
    },
    examDetail: {
      type: Object,
      default: () => { },
    },
  },
  data() {
    return {
      mockData: `{
        "myScore": 85,
        "levels": [
          {
              "max": 100,
              "min": 92,
              "count": 33
          },
          {
              "max": 92,
              "min": 83,
              "count": 45
          },
          {
              "max": 83,
              "min": 76,
              "count": 53
          }
        ],
        "min": 76,
        "max": 100,
        "count": 131,
        "myIndex": 1,
        "beat": 46,
        "level": "优秀"
      }`,
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
      lineHeight: 0,
      myIndex: 1,
      levels: [],
      myScore: 0,
      levelNames: ['中等偏上', '中等', '中等偏下'],
      min: { min: 0 },
      max: { min: 100 },
      maxCount: 0,
      totalCount: 0,
      beat: 0,
      sameLevelText: '',
      isRepeat: false,
      sameLineDiff: 0,
    }
  },
  computed: {
    totalCountTip() {
      return `同层次共：<span style="color: #939393" class="mask-yellow">${this.totalCount}</span>人`
    },
    visibility() {
      return this.examDetail && this.examDetail.visible === 1
    },
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    showLevel() {
      return this.levels && this.levels.length > 0
    },
  },
  methods: {
    async getExamLevel(examId, visible) {
      let levelData = {}
      if (visible) {
        const { data = {} } = await uni.$http.get(`${this.prefix}/v4/exam/same-level-analysis?examId=${examId}`)
        levelData = data
      }
      else {
        levelData = JSON.parse(this.mockData)
      }
      const { level = '', levels = [], myIndex = 0, min = 0, count = 0, max = 100, myScore = 0, beat = 0 } = levelData
      this.sameLineDiff = levels[myIndex - 1] ? levels[myIndex - 1].min - myScore : 0
      this.myScore = myScore
      this.min.min = min === 0 ? -1 : 0
      this.max.min = max
      this.totalCount = count
      this.beat = beat.toFixed(0)
      const tempList = levels.map((item, index) => {
        this.maxCount = Math.max(this.maxCount, item.count)
        return { ...item, level: this.levelNames[index] || '' }
      })
      const { studentName = '' } = this.userInfo.linkedStudent || {}
      this.sameLevelText = summarySameLevelCompare({ level, studentName, beat, max, myScore, count, myIndex, levels: tempList })
      this.levels = tempList.reverse()
      this.myIndex = levels.length - myIndex
      const yAxisValues = [max, ...this.levels.map(item => item.min)]
      const uniqueArr = yAxisValues.reduce((prev, curr) => prev.includes(curr) ? prev : [...prev, curr], [])
      this.isRepeat = uniqueArr.length !== yAxisValues.length
    },
  },
}
</script>

<style lang="scss" scoped>
.level {
  position: relative;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 36rpx 28rpx;
  color: #333333;
  font-size: 30rpx;
  &-same {
    display: flex;
    position: relative;
    align-items: center;
    background: #ffe9b5;
    margin-top: 64rpx;
    border-radius: 8rpx;
    height: 16rpx;
    &-novip {
      margin-top: 16rpx;
    }
    &-progress {
      position: relative;
      display: flex;
      align-items: center;
      height: 16rpx;
      border-radius: 8rpx 0rpx 0rpx 8rpx;
      background: linear-gradient(270deg, #ffba1d 95%, #ffde3e);
    }
    &-text {
      position: absolute;
      align-items: center;
      color: white;
      display: flex;
      font-size: 26rpx;
      justify-content: center;
      left: 100%;
      width: 32rpx;
      height: 32rpx;
      background: white;
      border: 8rpx solid #ff6c08;
      border-radius: 20rpx;
      box-shadow: 0rpx 0rpx 8rpx 0rpx #ffc5c5;
      .left {
        left: -40rpx;
      }
      .right {
        right: -40rpx;
      }
    }
    &-icon {
      position: absolute;
      height: 10rpx;
      bottom: 35rpx;
    }
    &-rate {
      position: absolute;
      width: 180rpx;
      bottom: 42rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 38rpx;
      background: #ff6c08;
      border-radius: 40rpx;
      font-size: 24rpx;
      color: white;
    }
    &-right {
      display: flex;
      height: 16rpx;
      background: linear-gradient(270deg, #ffba1d 95%, #ffde3e);
    }
  }
  &-chart {
    margin-top: 20rpx;
    font-size: 22rpx;
    color: #939393;
    .compare {
      display: flex;
      margin-top: 25rpx;
      .yAxis {
        display: flex;
        border-right: 2rpx #d4d4d4 solid;
        position: relative;
        margin-left: 60rpx;
        &-arrow {
          width: 28rpx;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        &-label {
          width: 58rpx;
          height: 1rpx;
          display: flex;
          align-items: center;
          justify-content: right;
          font-size: 22rpx;
          color: #939393;
          position: absolute;
          bottom: 0;
          left: -68rpx;
          white-space: nowrap;
        }
      }
      .xAxis {
        flex: 1;
        display: flex;
        position: relative;
        flex-direction: column-reverse;
        .top {
          border-bottom: 1rpx dashed #ffb100;
        }
        .above {
          border-bottom: 1rpx dashed #00c81f;
        }
        &-item {
          height: 64rpx;
          position: relative;
          border-bottom: 1rpx dashed #d4d4d4;
          .mine {
            height: 54rpx;
            background: linear-gradient(90deg, #ffc749, #ffba1d);
          }
          &-content {
            flex: 1;
            margin-top: 5rpx;
            height: 54rpx;
            font-size: 22rpx;
            color: #785300;
            margin-right: 180rpx;
            .tip {
              height: 46rpx;
              position: absolute;
              right: 0;
              bottom: 0;
            }
          }
          &-column {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 100%;
            background: linear-gradient(270deg, #fff0ce, #fff9ed);
            border-radius: 0 8rpx 8rpx 0;
            &__level {
              margin-left: 6rpx;
              margin-right: 18rpx;
              white-space: nowrap;
            }
            &__num {
              white-space: nowrap;
              margin-right: 10rpx;
              display: flex;
            }
          }
          &-extra {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 180rpx;
            height: 100%;
            .line-container {
              position: absolute;
              display: flex;
              left: 16rpx;
              bottom: 0;
            }
            .dot,
            .dot-novip {
              width: 22rpx;
              position: absolute;
              bottom: -12rpx;
              z-index: 2;
              height: 22rpx;
              background: white;
              border: 6rpx solid #ffb100;
              border-radius: 50%;
              display: flex;
              justify-content: center;
              align-items: center;
              .icon {
                background: white;
                width: 32rpx;
                height: 32rpx;
                position: absolute;
              }
              &-content {
                color: #333333;
                font-size: 24rpx;
                display: flex;
                justify-content: center;
                flex-direction: column;
                align-items: center;
                top: 26rpx;
                white-space: nowrap;
                position: absolute;
              }
              &-text {
                color: #939393;
                white-space: nowrap;
              }
            }
            .max-line {
              position: absolute;
              height: 100%;
              bottom: 0;
              left: 4rpx;
              display: flex;
              justify-content: center;
              .line {
                height: 100%;
                border-right: 2rpx dashed #ffb100;
              }
              .differ {
                color: #ffb100;
                display: flex;
                position: absolute;
                white-space: nowrap;
                left: 8rpx;
                top: 13rpx;
                font-size: 22rpx;
              }
              .self {
                left: 24rpx;
              }
              &-icon {
                width: 13rpx;
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1;
              }
            }
            .same-line {
              position: absolute;
              bottom: 0;
              height: 100%;
              left: 18rpx;
              display: flex;
              justify-content: center;
              .line {
                border-right: 2rpx dashed #00c81f;
              }
              &-icon {
                width: 13rpx;
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1;
              }
              .differ {
                position: absolute;
                display: flex;
                white-space: nowrap;
                color: #00c81f;
                font-size: 22rpx;
                top: 7rpx;
                left: 12rpx;
              }
            }
          }
        }
      }
    }
    .item-text {
      display: flex;
      flex-direction: column;
      font-size: 28rpx;
      color: #333333;
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
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 30rpx;
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
