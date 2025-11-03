<template>
  <view class="paper">
    <image class="paper-bg" src="../../static/academicReport/header_bg.png" mode="widthFix" />
    <view class="paper-header">
      <image class="paper-header_icon" src="../../static/academicReport/paper_icon.png" />
      <image class="paper-header_title" src="../../static/academicReport/paper_title.png" />
    </view>
    <view class="paper-content">
      <view class="paper-content_item">
        <PaperInterpretationAll v-if="subjectDetail.paperId === '0'" :scroll-top="scrollTop" :exam-id="examId" :subject-detail="subjectDetail" :config="config" :user-info="userInfo" :exam-detail="examDetail" :is-mock="isMock" @jump-page="jumpPage" />
        <PaperInterpretationSingle v-if="subjectDetail.paperId !== '0'" :scroll-top="scrollTop" :exam-id="examId" :subject-detail="subjectDetail" :config="config" :user-info="userInfo" :exam-detail="examDetail" :is-mock="isMock" @jump-page="jumpPage" />
      </view>
    </view>
  </view>
</template>

<script>
import paperInterpretationAll from './paperInterpretationAll.vue'
import paperInterpretationSingle from './paperInterpretationSingle.vue'

export default {
  components: { PaperInterpretationAll: paperInterpretationAll, PaperInterpretationSingle: paperInterpretationSingle },
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
    userInfo: {
      type: Object,
      default: () => {},
    },
    examDetail: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['jumpPage'],
  methods: {
    jumpPage(type, params) {
      this.$emit('jumpPage', type, params)
    },
  },
}
</script>

<style lang="scss" scoped>
.paper {
  position: relative;
  overflow: hidden;
  border-radius: 24rpx;
  &-bg {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  &-header {
    position: relative;
    display: flex;
    align-items: center;
    height: 44rpx;
    margin: 20rpx 28rpx 16rpx 28rpx;
    &_icon {
      width: 32rpx;
      height: 36rpx;
      margin-right: 10rpx;
    }
    &_title {
      width: 144rpx;
      height: 36rpx;
    }
  }
  &-content {
    position: relative;
    background-color: #ffffff;
    border-radius: 24rpx;
    min-height: 600rpx;
    &_item {
      background-color: #ffffff;
      border-radius: 24rpx;
    }
  }
}
</style>
