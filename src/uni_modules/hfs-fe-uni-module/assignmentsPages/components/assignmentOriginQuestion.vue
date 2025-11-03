<template>
  <view class="assignment-origin-question">
    <!-- 题目内容区 -->
    <scroll-view class="content-scroll" scroll-y>
      <view class="question-container">
        <view v-if="isShowReport" class="question-container__report">
          <view class="report-item">
            总分：<text class="default">{{ getCurrentQuestionScore() }} 分</text>
          </view>
          <view class="report-item">
            我的得分：<text class="my">{{ getCurrentQuestionMyScore() }} 分</text>
          </view>
          <view class="report-item">
            班级平均分：<text class="default">{{ getCurrentQuestionClassAvgScore() }} 分</text>
          </view>
        </view>

        <view class="question-container__header">
          <view class="question-container__type">
            <view class="question-container__type__text">
              {{ currentSelectedQuestion.type }}
            </view>
          </view>
          <view class="question-container__content">
            <view
              v-if="currentSelectedQuestion.description"
              class="question-container__description"
            >
              <HtmlRender :content="currentSelectedQuestion.description" />
            </view>
            <template v-if="currentSelectedQuestion.blocks && currentSelectedQuestion.blocks.stems">
              <view
                v-for="(item, index) in currentSelectedQuestion.blocks.stems"
                :key="index"
                class="question-container__stem"
              >
                <view class="stem">
                  <HtmlRender :content="item.stem" />
                </view>
              </view>
            </template>
          </view>
        </view>

        <template v-if="isShowAnswer && currentSelectedQuestionType !== 3 && currentSelectedQuestion.blocks && currentSelectedQuestion.blocks.stems">
          <view
            v-for="(item, index) in currentSelectedQuestion.blocks.stems"
            :key="index"
            class="question-container__option"
          >
            <template v-if="item.options">
              <view
                v-for="(option, opIndex) in item.options"
                :key="opIndex"
                class="option"
                :class="getOptionClass(opIndex)"
              >
                <view class="option-icon">
                  <image
                    v-if="getIsShowOptionIcon(opIndex)"
                    class="option-icon__img"
                    :src="getOptionIcon(opIndex)"
                  />
                </view>
                <view class="option-index" :class="{ 'my-choice': getIsShowOptionSelectIcon(opIndex) }">{{ opIndex }}</view>
                <HtmlRender :content="option" />
              </view>
            </template>
          </view>
        </template>

        <template v-if="(!isShowAnswer) && currentSelectedQuestionType !== 3 && currentSelectedQuestion.blocks && currentSelectedQuestion.blocks.stems">
          <view
            v-for="(item, index) in currentSelectedQuestion.blocks.stems"
            :key="index"
            class="question-container__option"
          >
            <template v-if="item.options">
              <view
                v-for="(option, opIndex) in item.options"
                :key="opIndex"
                class="option"
                :class="{ selected: currentSelectedQuestion.myAnswer.includes(opIndex) }"
              >
                <view class="option-index" :class="{ 'my-choice': getIsShowOptionSelectIcon(opIndex) }">{{ opIndex }}</view>
                <HtmlRender :content="option" />
              </view>
            </template>
          </view>
        </template>

        <view v-if="currentSelectedQuestionType === 3" class="question-container__my-answer">
          <view class="my-answer__title">【我的作答】</view>
          <view class="my-answer__content">
            <view
              v-for="(item, index) in currentSelectedQuestion.myAnswer"
              :key="index"
              class="my-answer__item"
              @click="previewAnswer(index)"
            >
              <image
                class="my-answer__item__img"
                :src="item.url"
                mode="center"
              />
            </view>
          </view>
        </view>

        <view
          v-if="isShowAnswer && currentSelectedQuestion && currentSelectedQuestion.blocks && currentSelectedQuestion.blocks.answers && currentSelectedQuestion.blocks.answers.join('').length"
          class="question-container__answers"
        >
          <view class="answers-title">【答案】</view>
          <view
            v-for="(ansItem, index) in currentSelectedQuestion.blocks.answers"
            :key="index"
            class="answers-item"
          >
            <HtmlRender v-if="!Array.isArray(ansItem)" :content="ansItem" />
            <view v-for="(ele, ix) in ansItem" v-else :key="ix">
              <HtmlRender :content="ele" />
            </view>
          </view>
        </view>

        <view
          v-if="isShowAnswer && currentSelectedQuestion && currentSelectedQuestion.blocks && currentSelectedQuestion.blocks.explanations && currentSelectedQuestion.blocks.explanations.join('').length"
          class="question-container__explan"
        >
          <view class="explan-title">【解析】</view>
          <view
            v-for="(exItem, index) in currentSelectedQuestion.blocks.explanations"
            :key="index"
            class="explan-item"
          >
            <HtmlRender :content="exItem" />
          </view>
        </view>

        <view
          v-if="isShowAnswer && currentSelectedQuestion && currentSelectedQuestion.blocks && currentSelectedQuestion.blocks.solutions && currentSelectedQuestion.blocks.solutions.join('').length"
          class="question-container__solu"
        >
          <view class="solu-title">【解答】</view>
          <view
            v-for="(soItem, index) in currentSelectedQuestion.blocks.solutions"
            :key="index"
            class="solu-item"
          >
            <HtmlRender :content="soItem" />
          </view>
        </view>

        <view
          v-if="isShowAnswer && currentSelectedQuestion && currentSelectedQuestion.knowledges && currentSelectedQuestion.knowledges.join('').length"
          class="question-container__knowledges"
        >
          <view class="knowledges-title">【考点】</view>
          <view class="knowledges-content">
            <view
              v-for="(knowItem, index) in currentSelectedQuestion.knowledges"
              :key="index"
              class="knowledges-item"
            >
              {{ knowItem.name }}
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部题目导航 -->
    <view class="bottom-navigation">
      <scroll-view class="question-nav" scroll-x :scroll-left="scrollLeft" scroll-with-animation>
        <view class="nav-list">
          <view
            v-for="(item, index) in questions"
            :key="item.id"
            class="nav-item"
            :class="getNavItemClass(item)"
            @click="selectQuestion(item)"
          >
            <text class="nav-num">{{ index + 1 }}</text>
            <text v-if="getIsShowAsideItemText(item)" class="nav-status">{{ getAsideItemText(item) }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import HtmlRender from '../../components/htmlRender.vue'

// 静态资源
import rightIcon from '../static/icon_right.png'
import wrongIcon from '../static/icon_wrong.png'
import { tellQuestionType } from '@/uni_modules/hfs-fe-uni-plugins'

// Props
const props = defineProps({
  assignmentInfo: Object,
})

// 状态定义
const questions = ref<any[]>([])
const currentSelectedQuestion = ref<any>({})
const scrollLeft = ref(0)

// 计算属性
const currentSelectedQuestionType = computed(() => tellQuestionType(currentSelectedQuestion.value))

const isShowReport = computed(() => {
  const assignmentInfo: any = props.assignmentInfo
  return assignmentInfo.report === 1
})

const isShowAnswer = computed(() => {
  const assignmentInfo: any = props.assignmentInfo
  if (assignmentInfo.answerPublishTiming === 0) {
    return assignmentInfo.committed === 2
  }

  if (assignmentInfo.answerPublishTiming === 1) {
    return assignmentInfo.status === 2
  }

  return false
})

// 监听数据变化
watch(() => props.assignmentInfo, () => {
  initData()
})

// 生命周期
onMounted(() => {
  initData()
})

// 初始化数据
function initData() {
  const assignmentInfo: any = props.assignmentInfo
  if (!assignmentInfo.questions || assignmentInfo.questions.length === 0) {
    return
  }

  questions.value = assignmentInfo.questions.map((item: any) => {
    const question = item.kbQuestion
    const questionType = tellQuestionType(question)

    if (questionType === 3) {
      question.myAnswer = (item.httpPath && item.httpPath.map((path: string) => ({
        url: path,
      }))) || []
    }
    else {
      if (item.zuoda && typeof item.zuoda === 'string') {
        question.myAnswer = item.zuoda === '-' ? [] : item.zuoda.split(',')
      }
      else {
        question.myAnswer = (item.zuoda && item.zuoda
          .filter((answer: any) => answer !== '' && answer !== '-')
          .map((answer: string) => answer === '-' ? '' : answer)
        ) || []
      }
    }
    return question
  })

  currentSelectedQuestion.value = questions.value[0]
}

// 选择题目
async function selectQuestion(item: any) {
  currentSelectedQuestion.value = item
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 100,
  })

  // 滚动题号到中间位置
  nextTick(() => {
    const currentIndex = questions.value.findIndex(q => q.id === item.id)
    if (currentIndex >= 0) {
      const itemWidth = 80 + 16 // nav-item width + margin-right (rpx转换为px大约除以2)
      const itemWidthPx = uni.upx2px(itemWidth)
      const containerWidth = uni.getSystemInfoSync().screenWidth
      const targetScrollLeft = Math.max(0, currentIndex * itemWidthPx - containerWidth / 2 + itemWidthPx / 2)

      scrollLeft.value = targetScrollLeft
    }
  })
}

// 获取侧边栏题号样式
function getAsideQuestionNumClass(item: any) {
  const assignmentInfo: any = props.assignmentInfo
  const originQuestion = assignmentInfo.questions.find((question: any) => question.kbQuestion.id === item.id)

  if (assignmentInfo.committed !== 2) {
    if (currentSelectedQuestion.value.id === item.id) {
      return 'uncommit selected'
    }
    return 'uncommit'
  }
  else {
    if (assignmentInfo.correct === 0) {
      if (originQuestion.type === 2) {
        if (currentSelectedQuestion.value.id === item.id) {
          return 'uncorrect selected'
        }
        return 'uncorrect'
      }
    }
  }

  if (currentSelectedQuestion.value.id === item.id) {
    return 'selected'
  }

  if (originQuestion) {
    if (originQuestion.myScore === originQuestion.score) {
      return 'green'
    }
    if (originQuestion.myScore > 0 && originQuestion.myScore < originQuestion.score) {
      return 'yellow'
    }
    if (originQuestion.myScore === 0) {
      return 'red'
    }
  }
  return ''
}

// 获取选项样式
function getOptionClass(opIndex: any) {
  const assignmentInfo: any = props.assignmentInfo
  const originQuestion = assignmentInfo.questions.find((question: any) => question.kbQuestion.id === currentSelectedQuestion.value.id)
  const myAnswer = originQuestion.zuoda || []
  const answer = originQuestion.answer.split('')

  if (answer.includes(opIndex)) {
    return 'right'
  }

  if (myAnswer.includes(opIndex) && !answer.includes(opIndex)) {
    return 'wrong'
  }

  return ''
}

// 是否显示选项图标
function getIsShowOptionIcon(opIndex: any) {
  const assignmentInfo: any = props.assignmentInfo
  const originQuestion = assignmentInfo.questions.find((question: any) => question.kbQuestion.id === currentSelectedQuestion.value.id)
  const myAnswer = originQuestion.zuoda || []
  const answer = originQuestion.answer.split('')

  return answer.includes(opIndex) || (myAnswer.includes(opIndex) && !answer.includes(opIndex))
}

// 获取选项图标
function getOptionIcon(opIndex: any) {
  const assignmentInfo: any = props.assignmentInfo
  const originQuestion = assignmentInfo.questions.find((question: any) => question.kbQuestion.id === currentSelectedQuestion.value.id)
  const myAnswer = originQuestion.zuoda || []
  const answer = originQuestion.answer.split('')

  if (answer.includes(opIndex)) {
    return rightIcon
  }

  if (myAnswer.includes(opIndex) && !answer.includes(opIndex)) {
    return wrongIcon
  }

  return ''
}

// 是否显示选项选中图标
function getIsShowOptionSelectIcon(opIndex: any) {
  const assignmentInfo: any = props.assignmentInfo
  const originQuestion = assignmentInfo.questions.find((question: any) => question.kbQuestion.id === currentSelectedQuestion.value.id)
  const myAnswer = originQuestion.zuoda || []
  return myAnswer.includes(opIndex)
}

// 获取当前题目分数
function getCurrentQuestionScore() {
  if (!currentSelectedQuestion.value.id) {
    return ''
  }
  const assignmentInfo: any = props.assignmentInfo
  const originQuestion = assignmentInfo.questions.find((question: any) => question.kbQuestion.id === currentSelectedQuestion.value.id)
  return originQuestion.score
}

// 获取当前题目我的得分
function getCurrentQuestionMyScore() {
  if (!currentSelectedQuestion.value.id) {
    return ''
  }
  const assignmentInfo: any = props.assignmentInfo
  const originQuestion = assignmentInfo.questions.find((question: any) => question.kbQuestion.id === currentSelectedQuestion.value.id)
  return originQuestion.myScore
}

// 获取当前题目班级平均分
function getCurrentQuestionClassAvgScore() {
  if (!currentSelectedQuestion.value.id) {
    return ''
  }
  const assignmentInfo: any = props.assignmentInfo
  const originQuestion = assignmentInfo.questions.find((question: any) => question.kbQuestion.id === currentSelectedQuestion.value.id)
  return originQuestion.classAvg || ''
}

// 获取侧边栏文本
function getAsideItemText(item: any) {
  const assignmentInfo: any = props.assignmentInfo
  const originQuestion = assignmentInfo.questions.find((question: any) => question.kbQuestion.id === item.id)

  if (assignmentInfo.committed !== 2) {
    if (originQuestion.type === 2) {
      return item.myAnswer.length ? '已作答' : ''
    }
    return item.myAnswer.join('')
  }

  if (assignmentInfo.correct === 0) {
    if (originQuestion.type === 2) {
      return '待批改'
    }
  }

  return ''
}

// 是否显示侧边栏文本
function getIsShowAsideItemText(item: any) {
  const text = getAsideItemText(item)
  return text !== ''
}

// 预览答案图片
function previewAnswer(index: number) {
  uni.previewImage({
    current: index,
    showmenu: false,
    urls: currentSelectedQuestion.value.myAnswer.map((item: any) => item.url),
    indicator: 'default',
    loop: false,
  })
}

// 获取导航项样式类
function getNavItemClass(item: any) {
  const baseClass = getAsideQuestionNumClass(item)
  const isSelected = currentSelectedQuestion.value.id === item.id
  return {
    'nav-item': true,
    'selected': isSelected,
    'green': baseClass.includes('green') && !isSelected,
    'yellow': baseClass.includes('yellow') && !isSelected,
    'red': baseClass.includes('red') && !isSelected,
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/common.scss';
@import '../styles/variables.scss';

.assignment-origin-question {
  display: flex;
  flex-direction: column;
  height: calc(100vh - #{$navbar-height});
  height: calc(100vh - #{$navbar-height} - env(safe-area-inset-top));
  background-color: $bg-secondary;

  // 内容滚动区
  .content-scroll {
    position: fixed;
    top: calc(#{$navbar-height} + constant(safe-area-inset-top));
    top: calc(#{$navbar-height} + env(safe-area-inset-top));
    left: 0;
    right: 0;
    bottom: 120rpx; // 为底部导航留出空间
    bottom: calc(120rpx + env(safe-area-inset-bottom));
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    background-color: $bg-primary;
  }

  .question-container {
    padding: $spacing-base;

    &__report {
      @include flex-between;
      background-color: rgba($primary-color, 0.05);
      padding: $spacing-base;
      border-radius: $radius-base;
      margin-bottom: $spacing-base;

      .report-item {
        font-size: $font-size-sm;
        color: $text-secondary;
        line-height: 1.8;

        .default {
          color: $text-primary;
          font-weight: 500;
        }

        .my {
          color: $danger-color;
          font-weight: 500;
        }
      }
    }

    &__header {
      margin-bottom: $spacing-base;
    }

    &__type {
      display: inline-block;
      padding: 8rpx 16rpx;
      background-color: rgba($primary-color, 0.1);
      border-radius: $radius-base;
      margin-bottom: $spacing-base;

      &__text {
        font-size: $font-size-sm;
        color: $primary-color;
        font-weight: 500;
      }
    }

    &__description,
    &__stem {
      font-size: $font-size-md;
      color: $text-primary;
      line-height: 1.6;
      margin-bottom: $spacing-base;
    }

    &__option {
      margin-top: $spacing-sm;

      .option {
        position: relative;
        min-height: 88rpx;
        margin-bottom: $spacing-base;
        padding: $spacing-base $spacing-md;
        background-color: $bg-secondary;
        border-radius: $radius-lg;
        font-size: $font-size-base;
        color: $text-primary;
        display: flex;
        align-items: center;

        &.selected {
          background-color: $primary-color;
          color: $text-white;

          .option-index {
            background-color: $text-white;
            color: $primary-color;
          }
        }

        &.right {
          background-color: rgba($success-color, 0.1);
          color: $text-primary;
        }

        &.wrong {
          background-color: rgba($danger-color, 0.1);
          color: $text-primary;
        }

        &-index {
          @include flex-center;
          width: 48rpx;
          height: 48rpx;
          margin-right: $spacing-base;
          background-color: $bg-primary;
          border-radius: $radius-round;
          font-weight: 500;
          font-size: $font-size-base;
          color: $text-primary;
          flex-shrink: 0;

          &.my-choice {
            color: $primary-color;
            font-weight: bold;
          }
        }

        &-icon {
          margin-right: $spacing-base;
          width: 48rpx;
          height: 48rpx;

          &__img {
            width: 100%;
            height: 100%;
          }
        }

        &-select {
          position: absolute;
          right: $spacing-md;
          width: 36rpx;
          height: 36rpx;
          border: 4rpx solid $text-secondary;
          border-radius: 50%;
        }
      }
    }

    &__my-answer {
      margin-top: $spacing-lg;

      .my-answer__title {
        font-size: $font-size-md;
        font-weight: 500;
        color: $text-primary;
        margin-bottom: $spacing-base;
      }

      .my-answer__content {
        display: flex;
        flex-wrap: wrap;
        margin: 0 (-$spacing-sm);
      }

      .my-answer__item {
        width: calc(50% - #{$spacing-sm * 2});
        margin: $spacing-sm;
        height: 240rpx;
        border-radius: $radius-base;
        overflow: hidden;

        &__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    &__answers,
    &__explan,
    &__solu {
      margin-top: $spacing-lg;

      .answers-title,
      .explan-title,
      .solu-title {
        font-size: $font-size-md;
        font-weight: 500;
        color: $text-primary;
        margin-bottom: $spacing-base;
      }

      .answers-item,
      .explan-item,
      .solu-item {
        font-size: $font-size-base;
        color: $text-primary;
        line-height: 1.6;
        padding-left: $spacing-base;
      }
    }

    &__knowledges {
      margin-top: $spacing-lg;

      .knowledges-title {
        font-size: $font-size-md;
        font-weight: 500;
        color: $text-primary;
        margin-bottom: $spacing-base;
      }

      .knowledges-content {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-sm;
      }

      .knowledges-item {
        padding: 12rpx 32rpx;
        font-size: $font-size-sm;
        font-weight: 500;
        color: $primary-color;
        background-color: rgba($primary-color, 0.1);
        border-radius: $radius-round;
      }
    }
  }

  // 底部题目导航
  .bottom-navigation {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: $bg-primary;
    border-top: 2rpx solid $border-color;
    @include safe-area-bottom;

    .question-nav {
      height: 120rpx;
      padding: $spacing-sm 0;

      .nav-list {
        display: flex;
        padding: 0 $spacing-base 0 $spacing-base;
        width: fit-content;

        .nav-item {
          @include flex-center;
          flex-direction: column;
          width: 80rpx;
          height: 80rpx;
          margin-right: $spacing-sm;
          background-color: $bg-secondary;
          border-radius: $radius-base;
          flex-shrink: 0;
          transition: all $duration-fast;

          &:last-child {
            margin-right: 0;
          }

          &:active {
            transform: scale(0.95);
          }

          text {
            font-size: $font-size-base;
            color: $text-primary;
          }

          .nav-num {
            font-size: $font-size-sm;
            color: $text-primary;
            font-weight: 500;
          }

          .nav-status {
            font-size: 20rpx;
            color: $text-secondary;
            margin-top: 2rpx;
            line-height: 1;
          }

          // 状态样式
          &.selected {
            background-color: $primary-color;

            text,
            .nav-num,
            .nav-status {
              color: $text-white;
            }
          }

          &.green {
            border: 2rpx solid $success-color;

            .nav-num {
              color: $success-color;
            }
          }

          &.yellow {
            border: 2rpx solid $warning-color;

            .nav-num {
              color: $warning-color;
            }
          }

          &.red {
            border: 2rpx solid $danger-color;

            .nav-num {
              color: $danger-color;
            }
          }
        }
      }
    }
  }
}
</style>
