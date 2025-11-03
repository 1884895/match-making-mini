<template>
  <view class="record">
    <u-navbar title="练习记录" auto-back placeholder :title-style="{ color: '#333333', fontSize: '36rpx', fontWeight: 'bold' }" />
    <view class="detail">
      <view class="detail-header">
        <view class="detail-header_left">
          <image class="icon" src="../static/academicReport/exam-icon.png" />
          <text class="text">
            20240102初三月考
          </text>
        </view>
        <view class="detail-header_right">
          考试时间2023-12-22
        </view>
      </view>
      <u-line color="#ededed" />
      <view class="detail-tabs">
        <ITabs :list="subjectList" @change="subjectChange" />
      </view>
    </view>
    <view v-if="list.length" class="list">
      <view v-for="(item, index) in list" :key="index" class="item">
        <view class="item-left">
          <view class="time">
            练习时间：{{ item.time }}
          </view>
          <view class="question">
            <view class="count">
              题数<view class="num">
                {{ item.count }}题
              </view>
            </view>
            <view class="count">
              答对率<view class="num">
                {{ item.rate }}%
              </view>
            </view>
          </view>
        </view>
        <view class="item-right">
          查看报告
        </view>
      </view>
    </view>
    <IEmpty v-else />
  </view>
</template>

<script>
import iTabs from '../../components/i-tabs.vue'
import iEmpty from '../../components/i-empty.vue'

export default {
  components: { ITabs: iTabs, IEmpty: iEmpty },
  data() {
    return {
      subjectList: [{ subject: '全科' }, { subject: '语文' }, { subject: '数学' }, { subject: '英语' }, { subject: '英语' }, { subject: '英语' }, { subject: '英语' }, { subject: '英语' }, { subject: '英语' }],
      subject: '',
      list: [],
    }
  },
  onLoad() {
    this.getSubjectList()
  },
  methods: {
    subjectChange({ subject = '' }) {
      this.subject = subject
    },
    getSubjectList() {
      this.subject = this.subjectList[1].subject
    },
  },
}
</script>

<style lang="scss" scoped>
.record {
  min-height: 100vh;
  background-color: #f6f6f6;
  .detail {
    background: #ffffff;
    border-radius: 0 0 24rpx 24rpx;
    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 30rpx 32rpx 30rpx;
      &_left {
        display: flex;
        align-items: center;
        .icon {
          width: 18rpx;
          height: 24rpx;
          margin-right: 10rpx;
        }
        .text {
          font-size: 28rpx;
          font-weight: 500;
          color: #333333;
        }
      }
      &_right {
        font-size: 24rpx;
        color: #939393;
      }
    }
    &-tabs {
      margin: 0 30rpx;
    }
  }
  .list {
    padding: 20rpx 30rpx 100rpx 30rpx;
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      border-radius: 24rpx;
      margin-bottom: 24rpx;
      padding: 22rpx 30rpx;
      &:last-child {
        margin-bottom: 0;
      }
      &-left {
        .time {
          font-size: 24rpx;
          color: #939393;
          margin-bottom: 14rpx;
        }
        .question {
          display: flex;
          .count {
            display: flex;
            align-items: center;
            margin-right: 60rpx;
            font-size: 24rpx;
            color: #939393;
            &:last-child {
              margin-right: 0;
            }
            .num {
              font-size: 32rpx;
              color: #333333;
              margin-left: 10rpx;
            }
          }
        }
      }
      &-right {
        background: linear-gradient(225deg, #ffc749, #ffba1d);
        border-radius: 30rpx;
        padding: 10rpx 32rpx;
        font-size: 28rpx;
        color: #ffffff;
      }
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
