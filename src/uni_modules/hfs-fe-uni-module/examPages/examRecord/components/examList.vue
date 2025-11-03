<template>
  <view class="list" :style="{ marginBottom: !isMember ? '150rpx' : '0' }">
    <view v-for="(item, index) in examList" :key="index" class="content">
      <view class="list-item" :class="{ 'content-checked': checkLength > 0 }">
        <view class="list-item__exam">
          <view class="name one-txt-cut">
            {{ item.name }}<text v-if="!isMember && item.analysisStatus === 1">
              （已购）
            </text>
          </view>
          <view v-if="index === 0" class="tag">
            最新考试
          </view>
        </view>
        <view class="list-item__sub">
          <view class="wapper">
            <image class="icon" src="../../static/academicReport/exam-icon.png" />
            <view class="time">
              {{ $u.timeFormat(item.eventTime, 'yyyy-mm-dd') }}{{ item.grade }}{{ `${item.type}考试` }}
            </view>
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
        <view class="list-item__operation">
          <template v-if="configScore(item.examId) === 1">
            <view class="score">
              应考试组织方要求，本次考试成绩不予发布
            </view>
          </template>
          <template v-else>
            <!-- 配置了成绩等级 -->
            <template v-if="configScoreType(item.examId) === 3">
              <view class="score">
                成绩等级：<text class="value">
                  {{ item.score }}
                </text>
              </view>
            </template>
            <template v-else>
              <view class="flex-row-start">
                <!-- 如果考试类型是1或者2，展示总成绩 -->
                <view class="score">
                  {{ item.mode === 3 || item.mode === 4 ? '赋分' : '总成绩' }}：<text class="value">
                    {{ item.score }}/{{ item.manfen }}
                  </text>
                </view>
                <!-- 如果考试类型是3或者4，展示原始成绩 -->
                <view v-if="item.mode === 3 || item.mode === 4" class="score" style="margin-left: 10rpx;">
                  原始：<text class="value">
                    {{ item.scoreBeforeGrading }}/{{ item.manfenBeforeGrading }}
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
      <image
        v-if="checkLength > 0"
        class="check"
        :src="resourceUrl + (checkItems.map(val => val.examId).includes(item.examId) ? 'icon_circle_selected.png' : 'icon_circle_default.png')"
        @click="check(item)"
      />
    </view>
    <slot :data="checkItems" />
  </view>
</template>

<script>
export default {
  props: {
    userInfo: {
      type: Object,
      default: () => {},
    },
    list: {
      type: Array,
      default: () => [],
    },
    config: {
      type: Object,
      default: () => {},
    },
    options: {
      type: Object,
      default: () => {},
    },
    checkLength: {
      type: Number,
      default: 0, // 0-仅展示
    },
    msg: {
      type: String,
      default: undefined,
    },

  },
  data() {
    return {
      checkItems: [],
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/examHistroy/',
      examList: [],
      size: 10,
    }
  },
  computed: {
    isMember() {
      return this.userInfo.isMember || false
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
  created() {
    uni.$on('loadMore', this.loadMore)
  },
  unmounted() {
    uni.$off('loadMore')
  },
  methods: {
    check(item) {
      if (this.checkLength <= 0)
        return
      if (!this.checkItems.map(val => val.examId).includes(item.examId)) {
        (this.checkItems.length < this.checkLength && this.checkItems.push(item)) || (uni.showToast({ title: this.msg, icon: 'none' }))
      }
      else {
        this.checkItems = this.checkItems.filter(val => val.examId !== item.examId)
      }
    },
    init() {
      if (!this.list.length)
        return
      this.examList = this.list.slice(0, this.size)
    },
    loadMore() {
      if (this.examList.length < this.list.length) {
        const start = this.examList.length
        this.examList.push(...this.list.slice(start, start + this.size))
      }
      else {
        uni.showToast({ title: '没有更多了', icon: 'none' })
      }
    },
    jumpExam({ examId }) {
      uni.navigateTo({ url: `/uni_modules/hfs-fe-uni-module/examPages/index/index?examId=${examId}` })
    },
  },
}
</script>

<style lang="scss" scoped>
.list {
  min-height: calc(100vh - 190rpx);
  .content {
    position: relative;
    margin-bottom: 24rpx;
    &-checked {
      margin: 0 0 0 60rpx;
    }
    .check {
      width: 40rpx;
      height: 40rpx;
      margin: 0 20rpx 0 0;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
  &-item {
    flex-grow: 1;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 22rpx 24rpx 26rpx 24rpx;
    &__exam {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10rpx;
      .name {
        font-size: 28rpx;
        font-weight: 500;
        color: #333333;
      }
      .tag {
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
    &__sub {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24rpx;
      .wapper {
        display: flex;
        align-items: center;
        .icon {
          width: 18rpx;
          height: 24rpx;
          margin-right: 10rpx;
        }
        .time {
          font-size: 24rpx;
          color: #939393;
        }
      }
      .type {
        font-size: 24rpx;
        color: #333333;
      }
    }
    &__operation {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      .score {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #939393;
        .value {
          font-size: 30rpx;
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
</style>
