<template>
  <view class="exam">
    <view class="exam-content">
      <!-- #ifdef MP-WEIXIN -->
      <u-navbar title="历次考试" :auto-back="true" :placeholder="true" :bg-color="bgColor" left-icon-color="#fff" :title-style="{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <u-gap height="30rpx" bg-color="transparent" />
      <!-- #endif -->
      <view class="exam-content__list">
        <view v-for="(item, index) in examList" :key="index" class="list-item">
          <view class="list-item__title">
            <view class="title one-txt-cut">
              <text>{{ item.name }}</text><text v-if="!isMember && item.analysisStatus === 1">
                （已购）
              </text>
            </view>
            <view v-if="index === 0" class="new">
              最新考试
            </view>
          </view>
          <view class="list-item__desc">
            <view class="time">
              <image class="icon" src="../static/academicReport/exam-icon.png" />
              <text>{{ examType[item.type] }}{{ $u.timeFormat(item.time, 'yyyy-mm-dd') }}</text>
            </view>
            <view class="type">
              <text v-if="item.mode === 3 || item.mode === 4">
                新高考
              </text>
              <text v-if="item.mode === 2">
                {{ item.groupName }}
              </text>
            </view>
          </view>
          <view class="list-item__score">
            <template v-if="configScore(item.examId) === 1">
              <view class="score">
                应考试组织方要求，本次考试成绩不予发布
              </view>
            </template>
            <template v-else>
              <!-- 配置了成绩等级 -->
              <template v-if="configScoreType(item.examId) === 3">
                <view class="score">
                  成绩等级：<text class="active">
                    {{ item.scoreS }}
                  </text>
                </view>
              </template>
              <template v-else>
                <view class="flex-row-start">
                  <!-- 如果考试类型是1或者2，展示总成绩 -->
                  <view class="score">
                    {{ item.mode === 3 || item.mode === 4 ? '赋分' : '总成绩' }}：<text class="active">
                      {{ item.scoreS }}/{{ item.manfen }}
                    </text>
                  </view>
                  <!-- 如果考试类型是3或者4，展示原始成绩 -->
                  <view v-if="item.mode === 3 || item.mode === 4" class="score" style="margin-left: 10rpx;">
                    原始：<text class="active">
                      {{ item.scoreBeforeGradingS }}/{{ item.manfenBeforeGrading }}
                    </text>
                  </view>
                </view>
              </template>
            </template>
            <view class="btn" @click="jumpExam(item)">
              查看考试
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="showVip && !isMember" class="exam-footer" @click="jumpVip">
      <view class="exam-footer__content">
        <view class="title">
          <image class="icon" src="../static/index/diamond.png" />开通会员解锁全部考试
        </view>
        <view class="desc">
          <image class="icon" src="../static/index/clock.png">
            {{ limitTip }}
          </image>
        </view>
      </view>
      <image class="exam-footer__bg" src="../static/index/vip_bg.png" />
    </view>
    <image class="exam-bg" src="../static/index/header.png" mode="widthFix" />
  </view>
</template>

<script>
import { isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'
import { ExamType } from '@/enums'

export default {
  data() {
    return {
      options: {},
      config: {},
      userInfo: {}, // 用户信息
      examList: [], // 考试列表
      page: 1,
      total: 0,
      limitTip: '',
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
    showVip() {
      // #ifdef H5
      if (isHFSStudent()) {
        return false
      }
      // #endif
      return true
    },
    isMember() {
      return this.userInfo.isMember || false
    },
    examType() {
      return ExamType || {}
    },
    configScoreType() {
      return (examId) => {
        if (!this.config.examConfigs.length) {
          return this.config.scoreType
        }
        const examConfig = this.config.examConfigs.find(item => +item.examId === +examId)
        if (!examConfig)
          return this.config.scoreType
        return examConfig.scoreType
      }
    },
    configScore() {
      return (examId) => {
        if (!this.config.examConfigs.length) {
          return this.config.score
        }
        const examConfig = this.config.examConfigs.find(item => +item.examId === +examId)
        if (!examConfig)
          return this.config.score
        return examConfig.score
      }
    },
  },
  async onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    this.config = uni.getStorageSync('shieldConfig') || {}
    await this.getExamList()
  },
  methods: {
    // 获取考试列表
    getExamList() {
      const params = {
        start: (this.page - 1) * 10,
        limit: 10,
      }
      if (this.total && this.page - 1 >= this.total / 10) {
        return uni.showToast({
          title: '没有更多了',
          icon: 'none',
          duration: 2000,
        })
      }
      uni.$http.get(`${this.examProxy}/v3/exam/list`, params).then((res) => {
        const { list = [], totalCount = 0, limitTip = '非会员只能查看120天内考试，会员支持查看全部考试' } = res.data
        this.examList = this.examList.concat(list)
        this.total = totalCount
        this.limitTip = limitTip
      })
    },
    jumpExam({ examId }) {
      return uni.navigateTo({ url: `/uni_modules/hfs-fe-uni-module/examPages/index/index?examId=${examId}` })
    },
    jumpVip() {
      // #ifdef MP-WEIXIN
      uni.navigateTo({ url: '/pages/me/member' })
      // #endif
      // #ifdef H5
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, data: {} }))
      // #endif
    },
  },
  onReachBottom() {
    this.page = this.page + 1
    this.getExamList()
  },
  onPageScroll({ scrollTop }) {
    this.bgColor = scrollTop > 10 ? '#ffc43f' : 'transparent'
  },
}
</script>

<style lang="scss" scoped>
.exam {
  position: relative;
  min-height: 100vh;
  background: #f6f6f6;
  padding-bottom: 150rpx;
  &-content {
    width: 100%;
    position: relative;
    z-index: 1;
    &__list {
      margin: 0 28rpx 0;
      padding-top: 12rpx;
      .list-item {
        background: #ffffff;
        border-radius: 16rpx;
        padding: 22rpx 24rpx 26rpx;
        margin-bottom: 24rpx;
      }
      .list-item__title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10rpx;
        .title {
          color: #333333;
          font-size: 28rpx;
          font-weight: bold;
        }
        .new {
          width: 116rpx;
          height: 40rpx;
          color: #939393;
          font-size: 24rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f8f8;
          border-radius: 8rpx;
          flex-shrink: 0;
          margin-left: 10rpx;
        }
      }
      .list-item__desc {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24rpx;
        .time {
          color: #939393;
          font-size: 24rpx;
          display: flex;
          align-items: center;
          .icon {
            width: 22rpx;
            height: 26rpx;
            margin-right: 8rpx;
          }
        }
        .type {
          font-size: 24rpx;
          color: #333333;
        }
      }
      .list-item__score {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .score {
          display: flex;
          align-items: center;
          font-size: 25rpx;
          color: #939393;
          .active {
            font-size: 28rpx;
            color: #333333;
          }
        }
        .btn {
          width: 176rpx;
          height: 56rpx;
          color: #ffffff;
          font-size: 28rpx;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(225deg, #ffc749, #ffba1d);
          border-radius: 28rpx;
          flex-shrink: 0;
        }
      }
    }
  }
  &-footer {
    position: fixed;
    left: 0;
    bottom: 0;
    bottom: env(safe-area-inset-bottom);
    width: 100%;
    z-index: 100;
    &__content {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1;
      .title {
        width: 534rpx;
        height: 76rpx;
        color: #fdd891;
        font-size: 32rpx;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(225deg, #481c01, #3f1902);
        border-radius: 48rpx;
        margin-bottom: 10rpx;
        .icon {
          width: 40rpx;
          height: 34rpx;
          margin-right: 14rpx;
        }
      }
      .desc {
        color: #333333;
        font-size: 22rpx;
        display: flex;
        align-items: center;
        .icon {
          width: 22rpx;
          height: 22rpx;
          margin-right: 6rpx;
        }
      }
    }
    &__bg {
      width: 100%;
      height: 156rpx;
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
