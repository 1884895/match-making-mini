<template>
  <view class="paper">
    <view v-for="(item, index) in paperList" :key="index" class="paper-item">
      <view v-if="item.image && item.image.length > 0">
        <view class="paper-item__card">
          <view class="paper-item__btn" @click="sureMyPaper(item)">
            是我的答题卡
          </view>
        </view>
        <image class="paper-item__image" :src="item.image[0]" @click="previewImage(item.image[0])" />
      </view>
    </view>
    <u-modal :show="paperShow" title="确认提醒" show-cancel-button close-on-click-overlay confirm-text="是我的" cancel-text="不是我的" confirm-color="#FF4D2B" content="确认是否是您的考卷，认领之后本场考试不可再次认领，请谨慎操作" @close="paperShow = false" @cancel="paperShow = false" @confirm="submitMyPaper" />
  </view>
</template>

<script>
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  data() {
    return {
      options: {},
      paperShow: false,
      paper: {},
      paperList: [],
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
  async onLoad(options) {
    this.options = options
    await this.getClaimExamPaperInfo(options.examId)
  },
  methods: {
    // 获取同名学生答题卡列表
    async getClaimExamPaperInfo(examId) {
      const res = await uni.$http.get(`${this.prefix}/v2/students/exam-student?examId=${examId}`)
      this.paperList = res.data || []
    },
    previewImage(url) {
      return uni.previewImage({
        urls: [url],
      })
    },
    sureMyPaper(item) {
      this.paperShow = true
      this.paper = item
    },
    async submitMyPaper() {
      this.paperShow = false
      const params = {
        examId: this.options.examId,
        chooseStudentId: this.paper.studentId,
      }
      await uni.$http.post(`${this.prefix}/v2/students/migrate-exam`, params)
      return uni.showToast({
        title: '认领成功',
        duration: 2000,
        success: () => {
          // #ifdef MP-WEIXIN
          uni.reLaunch({ url: '/pages/index/index' })
          // #endif
          // #ifdef H5
          nativeBridge.callHandler('goBack', 'goBack')
          // #endif
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.paper {
  padding: 20rpx 30rpx 0;
  background: #f2f2f2;
  min-height: 100vh;
  &-item {
    background-color: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    &__image {
      width: 100%;
    }
    &__card {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
    &__btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 220rpx;
      height: 60rpx;
      font-size: 28rpx;
      text-align: center;
      color: #fff;
      background-color: #ff4d2b;
      border-radius: 30rpx;
      margin-bottom: 20rpx;
    }
  }
}
</style>
