<template>
  <view class="claim">
    <view v-for="(item, index) in claimExamList" :key="index" class="claim-item" @click="examClick(item)">
      <view class="claim-item__name">
        {{ item.name }}
      </view>
      <view class="claim-item__time">
        {{ `考试时间：${item.eventTime}` }}
      </view>
      <view class="claim-item__id">
        {{ `考试编号：${item.examId}` }}
      </view>
    </view>
    <view v-if="!claimExamList.length" class="empty">
      <u-empty text="暂无考试数据" mode="list" icon-size="70" />
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      claimExamList: [],
    }
  },
  computed: {
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/be-proxy'
      // #endif
      return prefix
    },
  },
  async onLoad() {
    await this.getClaimExamBriefInfo()
  },
  methods: {
    async getClaimExamBriefInfo() {
      const res = await uni.$http.get(`${this.prefix}/v2/students/grade-last-exams`)
      this.claimExamList = res.data || []
    },
    examClick(item) {
      return uni.navigateTo({
        url: `/uni_modules/hfs-fe-uni-module/examPages/exam/paper?examId=${item.examId}`,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.claim {
  padding: 20rpx 30rpx 0;
  background: #f2f2f2;
  min-height: 100vh;
  &-item {
    padding: 36rpx 0 30rpx;
    background: #ffffff;
    border-radius: 15rpx;
    margin-bottom: 20rpx;
    &__name {
      margin-left: 28rpx;
      margin-right: 28rpx;
      color: #4a4a4a;
      font-size: 28rpx;
      font-weight: bold;
    }
    &__time {
      margin-top: 14rpx;
      margin-left: 28rpx;
      color: #666;
      font-size: 24rpx;
    }
    &__id {
      margin-top: 14rpx;
      margin-left: 28rpx;
      color: #666;
      font-size: 24rpx;
    }
  }
  .empty {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
