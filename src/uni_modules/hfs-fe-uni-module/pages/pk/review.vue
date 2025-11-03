<template>
  <view class="review">
    <view class="review-data">
      <view class="review-data__title">
        <view class="line" />
        <view class="title">
          答题数据
        </view>
      </view>
      <view class="review-data__content">
        <view v-for="(item, index) in totalList" :key="index" class="item">
          <view class="item-num">
            <view class="item-num__text">
              {{ item.count }}
            </view>
            <view class="item-num__unit">
              {{ item.unit }}
            </view>
          </view>
          <view class="item-desc">
            <image class="item-desc__icon" :src="item.icon" />
            <view class="item-desc__text">
              {{ item.name }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="review-data">
      <view class="review-data__title">
        <view class="line" />
        <view class="title">
          答题详情
        </view>
      </view>
      <view class="review-data__content">
        <view class="container">
          <view class="container-title">
            {{ theme.name }}
          </view>
          <view
            v-for="(questionItem, itemIndex) in questions" :key="itemIndex"
            class="container-list" :class="{ isSingleLine: theme.code === 41 }"
          >
            <view class="questions">
              <QuestionRender :question="questionItem" :custom-style="{ color: '#66451b', fontSize: '28rpx' }">
                <view class="questions-rect" :class="{ compare: questionItem.calculate === 'compare' }">
                  <QuestionItem class="questions-text" :item="getRightAnswer(questionItem)" :is-fraction="questionItem.numType === 2" />
                  <image class="questions-right" :src="`${resourceUrl}pk_right.png`" />
                </view>
              </QuestionRender>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import questionItem from './components/questionItem.vue'
import questionRender from './components/questionRender.vue'

export default {
  components: { QuestionItem: questionItem, QuestionRender: questionRender },
  data() {
    return {
      resourceUrl: `${feConfig.resourceUrl}/pk/images/`,
      questions: [],
      duration: 0,
      theme: {},
    }
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('pkInfo', (data) => {
      const { questions, duration, theme } = data
      this.questions = questions
      this.duration = duration
      this.theme = theme
    })
  },
  computed: {
    totalList() {
      const res = [
        {
          name: '答对',
          icon: `${this.resourceUrl}result_right.png`,
          count: this.questions.length,
          unit: '题',
        },
        {
          name: '用时',
          icon: `${this.resourceUrl}result_time.png`,
          count: this.duration,
          unit: '秒',
        },
        {
          name: '速度',
          icon: `${this.resourceUrl}result_speed.png`,
          count: Number.parseFloat(this.duration / this.questions.length).toFixed(2),
          unit: '秒/题',
        },
      ]
      return res
    },
  },
  methods: {
    getRightAnswer(item) {
      return item.options.filter(option => option.right)[0].answer
    },
  },

}
</script>

<style lang="scss" scoped>
.review {
  min-height: 100vh;
  height: 100%;
  background: #fcf5db;
  padding: 24rpx 28rpx;

  &-data {
    width: 100%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), #ffffff);
    border: 2rpx solid #ffffff;
    border-radius: 32rpx;
    margin-bottom: 24rpx;
    padding: 24rpx 0 36rpx 0;

    &__title {
      display: flex;
      align-items: center;
      margin-left: 28rpx;

      .line {
        width: 8rpx;
        height: 30rpx;
        background: #ffb522;
        border-radius: 6rpx;
      }

      .title {
        height: 44rpx;
        width: auto;
        margin-left: 13rpx;
        font-size: 32rpx;
        font-weight: 500;
        color: #333333;
      }
    }

    &__content {
      display: flex;
      justify-content: center;
      margin-top: 24rpx;

      .item {
        display: flex;
        flex-direction: column;
        flex: 1;
        align-items: center;
        justify-content: center;

        &-num {
          display: flex;
          align-items: baseline;

          &__text {
            height: 60rpx;
            font-size: 44rpx;
            font-weight: 500;
            color: #ffaa00;
          }

          &__unit {
            height: 34rpx;
            font-size: 24rpx;
            color: #939393;
            margin-left: 2rpx;
          }
        }

        &-desc {
          display: flex;
          align-items: center;
          margin-top: 4rpx;

          &__icon {
            width: 22rpx;
            height: 22rpx;
          }

          &__text {
            height: 34rpx;
            font-size: 24rpx;
            text-align: center;
            color: #939393;
            margin-left: 4rpx;
          }
        }
      }

      .container {
        width: 100%;
        justify-content: center;
        background: #fffae8;
        border-radius: 24rpx;
        margin: 20rpx 28rpx 0 28rpx;
        padding: 52rpx 0 90rpx 0;

        &-title {
          height: 42rpx;
          font-size: 30rpx;
          text-align: center;
          font-weight: 500;
          margin-bottom: 36rpx;
          color: #66451b;
        }

        &-list {
          flex-wrap: wrap;
          min-width: 50%;
          display: inline-flex;
          justify-content: center;

          &.isSingleLine {
            min-width: 100%;
          }

          .questions {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 34rpx;

            &-rect {
              position: relative;
              padding: 6rpx 8rpx;
              min-height: 52rpx;
              min-width: 52rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffeeb1;
              border-radius: 8rpx;
              flex-shrink: 0;

              &.compare {
                margin: 0 44rpx;
              }
            }

            &-text {
              font-size: 28rpx;
              font-weight: 500;
              color: #66451b;
            }

            &-right {
              position: absolute;
              width: 38rpx;
              height: 24rpx;
              bottom: -10rpx;
            }
          }
        }
      }
    }
  }
}
</style>
