<template>
  <view class="original">
    <view class="original-tab">
      <Tabs :list="briefList.papers" :current="current.index" @change="subjectClick" />
    </view>
    <view class="original-content">
      <view v-for="(item, index) in urls" :key="index" class="original-content__img">
        <LoadImage :src="item" @click="previewImage(index)" />
      </view>
    </view>
  </view>
</template>

<script>
import tabs from '../../components/tabs.vue'
import loadImage from '../../components/loadImage.vue'

export default {
  components: {
    Tabs: tabs,
    LoadImage: loadImage,
  },
  data() {
    return {
      options: {},
      urls: [],
      briefList: {},
      current: {},
    }
  },
  async onLoad(options) {
    this.options = options
    await this.getExamBriefList(options.examId)
    await this.getExamPaper(this.current)
  },
  methods: {
    subjectClick(item) {
      if (this.current.pid !== item.pid) {
        this.current = item
        this.getExamPaper(item)
      }
    },
    previewImage(index) {
      return uni.previewImage({
        current: index,
        urls: this.urls,
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
      this.$set(this, 'urls', res.data.paperPic)
    },
  },
}
</script>

<style lang="scss" scoped>
.original {
  min-height: 100vh;
  background: #f2f2f2;
  &-tab {
    background: #ffffff;
    margin-bottom: 18rpx;
  }
  &-content {
    padding: 30rpx;
    background: #ffffff;
    &__img {
      margin-bottom: 10rpx;
    }
  }
}
</style>
