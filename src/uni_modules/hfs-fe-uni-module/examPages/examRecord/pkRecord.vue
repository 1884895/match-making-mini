<template>
  <view class="record">
    <template v-for="(item, index) in records">
      <view v-if="item.exams && item.exams.length === 2" :key="index" class="record-item">
        <view class="record-item__info">
          <view class="left">
            <view class="left-time">
              {{ getExamTime(item.exams[0]) }}
            </view>
            <view class="left-name">
              {{ getExamName(item.exams[0]) }}
            </view>
          </view>
          <image class="middle" :src="`${resourceUrl}record_icon${item.winIndex}.png`" mode="widthFix" />
          <view class="right">
            <view class="right-time">
              {{ getExamTime(item.exams[1]) }}
            </view>
            <view class="right-name">
              {{ getExamName(item.exams[1]) }}
            </view>
          </view>
        </view>
        <view class="record-item__operate">
          <view class="operate-time">
            {{ $u.timeFormat(item.time, 'yyyy-mm-dd hh:MM:ss') }}
          </view>
          <view class="operate-delete" @click="handleDelete(item)">
            <image class="operate-delete__icon" :src="`${resourceUrl}recod_delete.png`" mode="widthFix" />
            <view class="operate-delete__text">
              删除
            </view>
          </view>
        </view>
      </view>
    </template>
    <IEmpty v-if="!records.length" border-radius="24rpx" background-color="#f6f6f6" />
  </view>
</template>

<script>
import iEmpty from '../../components/i-empty.vue'
import record from './record.js'

export default {
  components: { IEmpty: iEmpty },
  mixins: [record],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/examPK/',
      pkRecords: [],
    }
  },
  computed: {
    currentStudentRecords() {
      return this.pkRecords[this.studentInfo.studentId] || []
    },
    records() {
      return this.currentStudentRecords.map((item) => {
        const [exam1 = {}, exam2 = {}] = item.exams || []
        const winIndex = (exam1.win === exam2.win ? 2 : (exam1.win > exam2.win ? 0 : 1))
        return { ...item, winIndex }
      })
    },
  },
  onLoad() {
    this.pkRecords = uni.getStorageSync('exam_pk_records') || {}
  },
  methods: {
    handleDelete(item) {
      const list = this.currentStudentRecords.filter(record => record.time !== item.time)
      this.pkRecords = { ...this.pkRecords, [this.studentInfo.studentId]: list }
      uni.setStorageSync('exam_pk_records', { ...this.pkRecords })
      uni.showToast({ title: '删除成功', icon: 'none', duration: 2000 })
    },
    getExamName(item) {
      const { grade = '', type = '普通' } = item || {}
      return `${grade + type}考试`
    },
    getExamTime(item) {
      const { eventTime = '' } = item || {}
      return uni.$u.timeFormat(eventTime, 'yyyy/mm/dd')
    },
  },
}
</script>

<style lang="scss" scoped>
.record {
  padding: 24rpx 28rpx 80rpx;
  min-height: 100vh;
  background: #f6f6f6;
  &-item {
    background: #ffffff;
    border-radius: 24rpx;
    padding: 24rpx 28rpx;
    margin-bottom: 24rpx;
    &:last-child {
      margin-bottom: 0;
    }
    &__info {
      width: 100%;
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      .left {
        width: calc(50% - 99rpx);
        height: 100%;
        padding: 8rpx 20rpx;
        background: #f4f6ff;
        border-radius: 16rpx 0 0 16rpx;
        &-time {
          font-size: 24rpx;
          color: rgba(65, 106, 255, 0.7);
          margin-bottom: 2rpx;
        }
        &-name {
          font-size: 28rpx;
          font-weight: bold;
          color: #416aff;
        }
      }
      .middle {
        width: 198rpx;
        height: 92rpx;
      }
      .right {
        width: calc(50% - 99rpx);
        height: 100%;
        padding: 8rpx 20rpx;
        text-align: right;
        background: #fffcf3;
        border-radius: 0 16rpx 16rpx 0;
        &-time {
          font-size: 24rpx;
          color: rgba(241, 181, 0, 0.7);
          margin-bottom: 2rpx;
        }
        &-name {
          font-size: 28rpx;
          font-weight: bold;
          color: #f1b500;
        }
      }
    }
    &__operate {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .operate-time {
        font-size: 24rpx;
        color: #333333;
      }
      .operate-delete {
        display: flex;
        align-items: center;
        &__icon {
          width: 28rpx;
          height: 28rpx;
          margin-right: 8rpx;
        }
        &__text {
          font-size: 28rpx;
          color: #939393;
        }
      }
    }
  }
}
</style>
