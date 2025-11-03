<template>
  <view class="practice-question">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-bar-status-bar" />
      <view class="nav-bar__content">
        <view class="nav-bar__left" @click="navBack">
          <image class="nav-icon" src="../static/icon_back.png" mode="scaleToFill" />
        </view>
        <view class="nav-bar__center">
          <text class="nav-title">{{ title }}</text>
        </view>
        <view class="nav-bar__right" @click="submit">
          <text class="nav-btn">交卷</text>
        </view>
      </view>
    </view>

    <!-- 题目内容区 -->
    <scroll-view class="question-area" scroll-y :scroll-top="scrollTop">
      <view class="question-container">
        <!-- 题目头部 -->
        <view class="question-header">
          <view class="question-type">
            <text class="type-text">{{ currentSelectedQuestion.type }}</text>
          </view>
        </view>

        <!-- 题目内容 -->
        <view class="question-content">
          <view v-if="currentSelectedQuestion.description" class="question-description">
            <htmlRender :content="currentSelectedQuestion.description" />
          </view>
          <template v-if="currentSelectedQuestion.blocks && currentSelectedQuestion.blocks.stems">
            <view v-for="(item, index) in currentSelectedQuestion.blocks.stems" :key="index" class="question-stem">
              <htmlRender :content="item.stem" />
            </view>
          </template>
        </view>
        <!-- 选择题选项 -->
        <template v-if="currentSelectedQuestionType !== 3 && currentSelectedQuestion.blocks && currentSelectedQuestion.blocks.stems">
          <view v-for="(item, index) in currentSelectedQuestion.blocks.stems" :key="index" class="options-container">
            <template v-if="item.options">
              <view
                v-for="(option, opIndex) in item.options" :key="opIndex"
                class="option-item"
                :class="{ 'option-selected': currentSelectedQuestion.myAnswer.includes(opIndex) }"
                @click="optionClick(opIndex)"
              >
                <view class="option-index">
                  <text>{{ opIndex }}</text>
                </view>
                <view class="option-content">
                  <htmlRender :content="option" />
                </view>
              </view>
            </template>
          </view>
        </template>

        <!-- 拍照题 -->
        <template v-if="currentSelectedQuestionType === 3">
          <u-upload :file-list="fileList" preview-full-image @after-read="afterRead">
            <view class="upload-area">
              <image class="upload-icon" src="../static/icon_camera.png" mode="widthFix" />
              <text class="upload-text">拍照答题</text>
            </view>
          </u-upload>
          <view v-if="currentSelectedQuestion.myAnswer && currentSelectedQuestion.myAnswer.length" class="answer-images">
            <view
              v-for="(item, index) in currentSelectedQuestion.myAnswer" :key="index"
              class="answer-image-item" @click="previewAnswer(index)"
            >
              <image class="answer-image" :src="item.url" mode="aspectFill" />
              <view class="delete-btn" @click.stop="deleteMyAnswer(item)">
                <image class="delete-icon" src="../static/icon_delete.png" mode="scaleToFill" />
              </view>
            </view>
          </view>
        </template>
      </view>
    </scroll-view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <!-- 题目快速导航 -->
      <scroll-view class="question-nav" scroll-x :scroll-left="scrollLeft" scroll-with-animation>
        <view class="question-nav-list">
          <view
            v-for="(item, index) in questions" :key="item.id"
            class="nav-item"
            :class="{
              'nav-item-current': currentSelectedQuestion.id === item.id,
              'nav-item-answered': item.myAnswer && item.myAnswer.length > 0,
            }"
            @click="selectQuestion(item)"
          >
            <text>{{ index + 1 }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <u-popup mode="center" :show="popupInfo.isShowPopup" bg-color="transparent" :close-on-click-overlay="false" overlay-opacity="0.5">
      <view class="practice-question__popup">
        <view class="popup-title">确定要交卷吗？</view>
        <view class="popup-content">还有 {{ popupInfo.info.emptyAnswerNumber }} 题未作答，交卷后答案将不能修改</view>
        <view class="popup-button">
          <view class="popup-button__cancel" @click="popupInfo.isShowPopup = false">
            <view class="popup-button__cancel__text">取消</view>
          </view>
          <view class="popup-button__confirm" @click="confirmSubmit">
            <view class="popup-button__confirm__text">确定</view>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script lang="ts" setup>
import htmlRender from '@/components/htmlRender.vue'
import { tellQuestionType, uploadFile } from '@/uni_modules/hfs-fe-uni-plugins'

let userId: string | null = null
let accountid: string | null = null
let paperId: string | null = null
let assignmentInfo: any = {}
const title = ref('')
const imageOSSCache: any = {}
const questions = ref<any[]>([])
const currentSelectedQuestion = ref<any>({})
const fileList = ref<any>([])
const popupInfo = ref<any>({
  isShowPopup: false,
  info: {
    emptyAnswerNumber: 0,
  },
})
const scrollTop = ref(0)
const scrollLeft = ref(0)

const currentSelectedQuestionType = computed(() => tellQuestionType(currentSelectedQuestion.value))

onLoad(async (options: any) => {
  userId = options.userId
  accountid = options.accountid
  paperId = options.paperId
  title.value = options.title
  if ((userId != null || accountid != null) && paperId != null) {
    await login(userId, accountid)
    await fetchData()
  }
})

async function login(userId: string | null, accountid: string | null) {
  let params
  if (userId != null) {
    params = {
      userId,
    }
  }
  if (!params && accountid != null) {
    params = {
      accountid,
    }
  }
  if (!params)
    return
  const { data: { token: hfsToken } } = await uni.$http.post('/v2/users/sessions/seewo', params) as any
  hfsToken && uni.setStorageSync('hfsToken', hfsToken)
}

async function fetchData() {
  const params = {
    paperId,
  }
  const { data } = await uni.$http.get('/v2/online-exams/zuoye-detail', params)
  assignmentInfo = data
  questions.value = assignmentInfo.questions.map((item: any) => {
    const question = item.kbQuestion
    const questionType = tellQuestionType(question)
    if (questionType === 3) {
      question.myAnswer = (item.httpPath && item.httpPath.map((item: any) => {
        return {
          url: item,
        }
      })) || []
    }
    else {
      if (item.zuoda && typeof item.zuoda === 'string') {
        if (item.zuoda === '-') {
          question.myAnswer = []
        }
        else {
          question.myAnswer = item.zuoda.split(',')
        }
      }
      else {
        question.myAnswer = (item.zuoda && item.zuoda.filter((item: any) => item !== '' && item !== '-').map((item: string) => {
          if (item === '-') {
            return ''
          }
          return item
        })) || []
      }
    }
    return question
  })
  currentSelectedQuestion.value = questions.value[0]
}

async function navBack() {
  await saveQuestionMyAnswer()
  goBack()
}

function goBack() {
  if (getCurrentPages().length > 1) {
    return uni.navigateBack()
  }
  // #ifdef H5
  // nativeBridge.callHandler('goBack', 'goBack')
  history.go(-1)
  // #endif
  // #ifdef MP-WEIXIN
  return uni.navigateBack()
  // #endif
}

async function submit() {
  const emptyAnswerQuestions = questions.value.filter(item => !item.myAnswer || item.myAnswer.length === 0)
  const isHasEmptyAnswer = emptyAnswerQuestions.length > 0
  if (!isHasEmptyAnswer) {
    await submitQuestionMyAnswer()
    goBack()
    return
  }
  popupInfo.value.isShowPopup = isHasEmptyAnswer
  popupInfo.value.info.emptyAnswerNumber = emptyAnswerQuestions.length
}

async function confirmSubmit() {
  popupInfo.value.isShowPopup = false
  await submitQuestionMyAnswer()
  goBack()
}

async function selectQuestion(item: any) {
  await saveQuestionMyAnswer()
  currentSelectedQuestion.value = item

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

function optionClick(option: any) {
  const type = tellQuestionType(currentSelectedQuestion.value)
  const typeMap: any = {
    1: async () => {
      const index = currentSelectedQuestion.value.myAnswer.indexOf(option)
      if (index > -1) {
        currentSelectedQuestion.value.myAnswer.splice(index, 1)
      }
      else {
        currentSelectedQuestion.value.myAnswer = []
        currentSelectedQuestion.value.myAnswer.push(option)
      }
    },
    2: () => {
      const index = currentSelectedQuestion.value.myAnswer.indexOf(option)
      if (index > -1) {
        currentSelectedQuestion.value.myAnswer.splice(index, 1)
      }
      else {
        currentSelectedQuestion.value.myAnswer.push(option)
      }
    },
  }
  typeMap[type]()
}

async function afterRead(event: any) {
  currentSelectedQuestion.value.myAnswer.push(event.file)
}

function deleteMyAnswer(item: any) {
  const index = currentSelectedQuestion.value.myAnswer.indexOf(item)
  if (index > -1) {
    currentSelectedQuestion.value.myAnswer.splice(index, 1)
  }
}

async function getQuestionMyAnswer() {
  const answerObj: any = {
    subjectId: assignmentInfo.subjectId,
    committed: false,
    keguanti: [],
    images: [],
  }

  for (let i = 0; i < questions.value.length; i++) {
    const item = questions.value[i]
    const type = tellQuestionType(item)
    if (type === 3) {
      const blockid = assignmentInfo.questions.find((oriItm: any) => oriItm.kbQuestion.id === item.id).blockid
      const imageObj: any = {
        blockid,
        files: [],
      }
      for (let i = 0; i < (item.myAnswer || []).length; i++) {
        const answer = item.myAnswer[i]
        const fileName = answer.name
        let key = imageOSSCache[fileName]
        if (!key) {
          const match = answer.url.match(/baidu-raw\/(?:[^/]+\/)*[^/?]+/)
          key = match ? match[0] : undefined
          if (key) {
            imageObj.files.push(key)
            continue
          }
        }
        if (!key) {
          key = await uploadFile(answer, {
            keyPrefix: `baidu-raw/zuoye/${assignmentInfo.subjectId}/${assignmentInfo.kaohao}`,
            bucketName: 'ayx-yuejuan',
          })
        }
        imageObj.files.push(key)
        imageOSSCache[fileName] = key
      }
      answerObj.images.push(imageObj)
    }
    else {
      if (!item.myAnswer || item.myAnswer.length === 0) {
        answerObj.keguanti.push('-')
        continue
      }
      answerObj.keguanti.push(item.myAnswer.join(''))
    }
  }
  return answerObj
}

async function saveQuestionMyAnswer() {
  const params = await getQuestionMyAnswer()
  await uni.$http.post('/v2/online-exams/zuoye-submit', params)
}

async function submitQuestionMyAnswer() {
  const params = await getQuestionMyAnswer()
  params.committed = true
  await uni.$http.post('/v2/online-exams/zuoye-submit', params)
}

function previewAnswer(index: any) {
  uni.previewImage({
    current: index,
    showmenu: false,
    urls: currentSelectedQuestion.value.myAnswer.map((item: any) => item.url),
    indicator: 'default',
    loop: false,
    longPressActions: {
      itemList: [],
      itemColor: '#333',
      success: () => {},
      fail: () => {},
      complete: () => {},
    },
    success: () => {},
    fail: () => {},
    complete: () => {},
  })
}
</script>

<style lang="scss" scoped>
@import '../styles/common.scss';
@import '../styles/variables.scss';

.practice-question {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-secondary;
}

// 顶部导航栏
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: $bg-primary;

  border-bottom: 2rpx solid $border-color;

  &-status-bar {
    width: 100%;
    background-color: $bg-primary;
    height: env(safe-area-inset-top);
  }

  &__content {
    @include flex-between;
    height: $navbar-height;
    padding: 0 $spacing-base;
  }

  &__left {
    flex-shrink: 0;
    width: 64rpx;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  &__center {
    flex: 1;
    text-align: center;
    margin: 0 $spacing-base;
    min-width: 0;
    overflow: hidden;
  }

  &__right {
    flex-shrink: 0;
    width: 120rpx;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .nav-icon {
    width: 36rpx;
    height: 36rpx;
  }

  .nav-title {
    @include text-ellipsis;
    font-size: $font-size-base;
    color: $text-primary;
    font-weight: 500;
  }

  .nav-btn {
    font-size: $font-size-sm;
    color: $primary-color;
    padding: 10rpx 20rpx;
    border: 2rpx solid $primary-color;
    border-radius: $radius-round;
    width: 100%;
    height: 40rpx;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }
}

// 题目内容区
.question-area {
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
  background-color: $bg-primary;
  padding-bottom: $spacing-xl; // 确保内容不被底部导航遮挡
}

// 题目头部
.question-header {
  margin-bottom: $spacing-base;

  .question-type {
    display: inline-block;
    padding: 8rpx 16rpx;
    background-color: rgba($primary-color, 0.1);
    border-radius: $radius-base;

    .type-text {
      font-size: $font-size-sm;
      color: $primary-color;
      font-weight: 500;
    }
  }
}

// 题目内容
.question-content {
  margin-bottom: $spacing-lg;

  .question-description,
  .question-stem {
    font-size: $font-size-md;
    color: $text-primary;
    line-height: 1.6;
    margin-bottom: $spacing-base;
  }
}

// 选项容器
.options-container {
  margin-top: $spacing-base;
}

.option-item {
  display: flex;
  align-items: center;
  min-height: 88rpx;
  margin-bottom: $spacing-base;
  padding: $spacing-base $spacing-md;
  background-color: $bg-secondary;
  border-radius: $radius-lg;
  transition: all $duration-fast;

  &.option-selected {
    background-color: $primary-color;

    .option-index {
      background-color: $text-white;

      text {
        color: $primary-color;
      }
    }

    .option-content {
      color: $text-white;
    }
  }

  .option-index {
    @include flex-center;
    width: 48rpx;
    height: 48rpx;
    margin-right: $spacing-base;
    background-color: $bg-primary;
    border-radius: $radius-round;
    flex-shrink: 0;

    text {
      font-size: $font-size-base;
      color: $text-primary;
      font-weight: 500;
    }
  }

  .option-content {
    flex: 1;
    font-size: $font-size-base;
    color: $text-regular;
    line-height: 1.5;
  }
}

// 拍照上传区域
.upload-area {
  @include flex-center;
  padding: 0 100rpx;
  flex-direction: column;
  width: 100%;
  height: 200rpx;
  margin-top: $spacing-lg;
  border: 2rpx dashed $text-secondary;
  border-radius: $radius-lg;
  background-color: $bg-secondary;

  .upload-icon {
    width: 80rpx;
    margin-bottom: $spacing-sm;
  }

  .upload-text {
    font-size: $font-size-base;
    color: $text-secondary;
  }
}

// 答案图片列表
.answer-images {
  display: flex;
  flex-wrap: wrap;
  margin: $spacing-lg -$spacing-xs 0;

  .answer-image-item {
    position: relative;
    width: calc(33.333% - #{$spacing-xs * 2});
    margin: 0 $spacing-xs $spacing-lg;
    aspect-ratio: 1;

    .answer-image {
      width: 100%;
      height: 100%;
      border-radius: $radius-base;
    }

    .delete-btn {
      position: absolute;
      top: -30rpx;
      right: -30rpx;
      @include flex-center;
      width: 60rpx;
      height: 60rpx;

      .delete-icon {
        width: 32rpx;
        height: 32rpx;
      }
    }
  }
}

// 底部导航
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $bg-primary;
  border-top: 2rpx solid $border-color;
  @include safe-area-bottom;

  // 题目快速导航
  .question-nav {
    height: 120rpx;
    padding: $spacing-sm 0;

    .question-nav-list {
      display: flex;
      padding: 0 $spacing-base 0 $spacing-base;
      width: fit-content;

      .nav-item {
        @include flex-center;
        width: 80rpx;
        height: 80rpx;
        margin-right: $spacing-sm;
        background-color: $bg-secondary;
        border-radius: $radius-base;
        flex-shrink: 0;

        &:last-child {
          margin-right: 0;
        }

        text {
          font-size: $font-size-base;
          color: $text-primary;
        }

        &.nav-item-current {
          background-color: $primary-color;

          text {
            color: $text-white;
            font-weight: bold;
          }
        }

        &.nav-item-answered:not(.nav-item-current) {
          background-color: rgba($primary-color, 0.1);

          text {
            color: $primary-color;
          }
        }
      }
    }
  }
}

// 弹窗样式
.practice-question__popup {
  width: 600rpx;
  padding: $spacing-xl $spacing-lg 0 $spacing-lg;
  background-color: $bg-primary;
  border-radius: $radius-lg;

  .popup-title {
    font-size: $font-size-xl;
    font-weight: 500;
    color: $text-primary;
    text-align: center;
    margin-bottom: $spacing-base;
  }

  .popup-content {
    font-size: $font-size-base;
    color: $text-secondary;
    text-align: center;
    margin-bottom: $spacing-xl;
    line-height: 1.5;
  }

  .popup-button {
    display: flex;
    margin: 0 -$spacing-lg;
    margin-top: $spacing-lg;
    border-top: 2rpx solid $border-color;

    &__cancel,
    &__confirm {
      @include flex-center;
      flex: 1;
      height: 88rpx;
      font-size: $font-size-md;

      &:active {
        opacity: 0.8;
      }
    }

    &__cancel {
      color: $text-regular;
      border-right: 2rpx solid $border-color;
    }

    &__confirm {
      color: $primary-color;
      font-weight: 500;
    }
  }
}
</style>
