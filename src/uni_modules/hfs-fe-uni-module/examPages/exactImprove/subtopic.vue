<template>
  <view class="subtopic">
    <view class="subtopic-content">
      <!-- #ifdef MP-WEIXIN -->
      <u-navbar title="查看小题分" :placeholder="true" :bg-color="bgColor" left-icon-color="#fff" :title-style="{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }" @left-click="goBack" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <u-gap height="30rpx" bg-color="transparent" />
      <!-- #endif -->
      <u-gap height="24rpx" bg-color="transparent" />
      <view class="subtopic-content__tabs">
        <view class="title">
          <image class="title-icon" src="../static/index/exam_icon.png" />
          <view class="title-text one-txt-cut">
            {{ briefList.name }}
          </view>
        </view>
        <ITabs :list="briefList.papers" :current="current.index" @change="subjectClick" />
      </view>
      <view class="subtopic-content__table">
        <ITable :columns="columns" :data="tableData" />
      </view>
    </view>
    <image class="subtopic-bg" src="../static/index/header.png" mode="widthFix" />
  </view>
</template>

<script>
import iTabs from '../../components/i-tabs.vue'
import iTable from '../../components/i-table.vue'

export default {
  components: { ITabs: iTabs, ITable: iTable },
  data() {
    return {
      options: {},
      current: {},
      briefList: {},
      questions: [],
      columns: [
        { name: '题号', key: 'name' },
        { name: '总分', key: 'manfen' },
        { name: '得分', key: 'scoreS' },
        { name: '作答', key: 'my_answer' },
      ],
      bgColor: 'transparent',
    }
  },
  computed: {
    examProxy() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    tableData() {
      return this.questions.map((item) => {
        const { name = '-', manfen = '-', scoreS = '-', my_answer = '-' } = item
        return { name, manfen, scoreS, my_answer }
      })
    },
  },
  async onLoad(options) {
    this.options = options
    await this.getExamBriefList(options.examId)
    await this.getExamQuestionDetail(this.current)
  },
  methods: {
    subjectClick(item) {
      if (this.current.pid !== item.pid) {
        this.current = item
        this.getExamQuestionDetail(item)
      }
    },
    goBack() {
      return uni.navigateBack()
    },
    // 获取一场考试的简要信息
    async getExamBriefList(examId) {
      const res = await uni.$http.get(`${this.examProxy}/v3/exam/${examId}/brief?withSubPapers=1`)
      this.briefList = res.data
      this.current = { ...this.briefList.papers[0], index: 0 } || {}
    },
    // 获取一场考试科目题目分析详情
    async getExamQuestionDetail({ paperId }) {
      const res = await uni.$http.get(`${this.examProxy}/v3/exam/${this.options.examId}/papers/${paperId}/question-list`)
      this.$set(this, 'questions', res.data)
    },
  },
  onPageScroll({ scrollTop }) {
    this.bgColor = scrollTop > 10 ? '#ffc43f' : 'transparent'
  },
}
</script>

<style lang="scss" scoped>
.subtopic {
  position: relative;
  min-height: 100vh;
  background: #f6f6f6;
  padding-bottom: 60rpx;
  &-content {
    width: 100%;
    position: relative;
    z-index: 1;
    &__tabs {
      background: #ffffff;
      border-radius: 24rpx;
      padding-left: 28rpx;
      margin-bottom: 24rpx;
      .title {
        height: 86rpx;
        display: flex;
        align-items: center;
        border-bottom: 1rpx solid #ededed;
        padding: 0 28rpx;
        margin-left: -28rpx;
        &-icon {
          width: 22rpx;
          height: 28rpx;
          margin-right: 10rpx;
          flex-shrink: 0;
        }
        &-text {
          flex: 1;
          font-size: 28rpx;
          color: #333333;
        }
      }
    }
    &__table {
      background: #ffffff;
      padding: 28rpx;
      border-radius: 24rpx;
      ::v-deep .table {
        border: none;
        border-radius: 16rpx;
        .tr {
          border: none;
          &:nth-child(2n) {
            background: #ffffff;
          }
          &:nth-child(2n - 1) {
            background: #f8f8f8;
          }
        }
        .th,
        .td {
          min-height: 66rpx !important;
          border: none !important;
          padding: 0 !important;
          font-size: 22rpx !important;
          color: #939393 !important;
          background: none !important;
          text-align: center;
        }
        .td {
          font-size: 26rpx !important;
          color: #333333 !important;
          font-weight: 500;
        }
      }
    }
  }
  &-bg {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
