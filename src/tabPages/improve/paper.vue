<template>
  <view class="paper">
    <view class="paper-tab">
      <Tabs :list="briefList.papers" :current="current.index" @change="subjectClick" />
    </view>
    <view class="paper-content">
      <view class="paper-content__title">
        答题卡<view class="line" />
      </view>
      <PaperRemarks :urls="urls" :exam-paper="examPaper" :config="config" @success="handlerSuccess" />
      <view v-for="(item, index) in tempUrls" :key="index" class="paper-content__img">
        <LoadImage :src="item" @click="previewImage(index)" />
      </view>
    </view>
  </view>
</template>

<script>
import tabs from '../../components/tabs.vue'
import loadImage from '../../components/loadImage.vue'
import paperRemarks from './components/paperRemarks.vue'

export default {
  components: {
    Tabs: tabs,
    LoadImage: loadImage,
    PaperRemarks: paperRemarks,
  },
  data() {
    return {
      options: {},
      config: {},
      urls: [],
      tempUrls: [],
      examPaper: {},
      current: {},
      briefList: {},
    }
  },
  async onLoad(options) {
    this.options = options
    const shieldConfig = uni.getStorageSync('shieldConfig')
    const examConfigs = shieldConfig.examConfigs.find(v => +v.examId === +options.examId) || {}
    this.config = Object.assign({}, shieldConfig, examConfigs)
    await this.getExamBriefList(options.examId)
    await this.getExamPaper(this.current)
  },
  methods: {
    subjectClick(item) {
      if (this.current.pid !== item.pid) {
        this.current = item
        this.tempUrls = []
        this.getExamPaper(item)
      }
    },
    handlerSuccess(path, index) {
      this.$set(this.tempUrls, index, path)
    },
    previewImage(index) {
      return uni.previewImage({
        current: index,
        urls: this.tempUrls,
      })
    },
    // 获取一场考试的简要信息
    async getExamBriefList(examId) {
      const res = await uni.$http.get(`/v1/exam-proxy/v3/exam/${examId}/brief?withSubPapers=1`)
      this.briefList = res.data
      this.current = { ...this.briefList.papers[0], index: 0 } || {}
    },
    // 获取试题答题卡
    async getExamPaper({ paperId, pid }) {
      const res = await uni.$http.get(`/v1/exam-proxy/v3/exam/${this.options.examId}/papers/${paperId}/answer-picture?pid=${pid}`)
      this.$set(this, 'urls', res.data.url)
      this.$set(this, 'examPaper', res.data)
    },
  },
}
</script>

<style lang="scss" scoped>
.paper {
  min-height: 100vh;
  background: #f2f2f2;
  &-tab {
    background: #ffffff;
    margin-bottom: 18rpx;
  }
  &-content {
    padding: 30rpx;
    background: #ffffff;
    &__title {
      font-size: 34rpx;
      font-weight: 500;
      color: #282423;
      margin-bottom: 30rpx;
      padding-bottom: 30rpx;
      position: relative;
    }
    &__img {
      margin-bottom: 10rpx;
    }
  }
  .line {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 720rpx;
    height: 1rpx;
    background-color: #e6e6e6;
  }
}
</style>
