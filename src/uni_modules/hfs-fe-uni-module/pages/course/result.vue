<template>
  <view class="result">
    <image class="result-banner" :src="`${resourceUrl}result-top.png`" mode="widthFix" />
    <view class="result-content">
      <template v-if="courseMessage.type === 0 || courseMessage.type === 1">
        <image class="qrcode" show-menu-by-longpress :src="`${resourceUrl}tearcher-qrcode.png`" mode="widthFix" />
        <view class="text">
          {{ wxPlatform ? '长按识别添加老师' : '添加客服获取上课信息' }}
        </view>
      </template>
      <template v-if="courseMessage.type === 2">
        <image class="qrcode" show-menu-by-longpress :src="`${resourceUrl}AI-teacher.png`" mode="widthFix" />
        <view class="text">
          添加老师微信立即体验
        </view>
      </template>
      <image class="line" :src="`${resourceUrl}result-line.png`" mode="widthFix" />
      <view class="tips">
        <template v-if="courseMessage.type === 0">
          <view class="title">
            报名须知：
          </view>
          <view class="message">
            <view class="message-item">
              1.该课程为好分数&高途合作推广；
            </view>
            <view class="message-item">
              2.【上课通知】请留意短信和电话；
            </view>
            <view class="message-item">
              3.更多课程信息请咨询客服；
            </view>
          </view>
        </template>
        <template v-if="courseMessage.type === 1">
          <view class="title">
            购买须知：
          </view>
          <view class="message">
            <view class="message-item">
              1.该产品为好分数&天星教育合作推广；
            </view>
            <view class="message-item">
              2.可添加老师微信查询邮寄信息；
            </view>
          </view>
        </template>
        <template v-if="courseMessage.type === 2">
          <view class="title">
            购买须知：
          </view>
          <view class="message">
            <view class="message-item">
              1.该项目为好分数与百年教育联名合作；
            </view>
            <view class="message-item">
              2.可提供1对1咨询指导；
            </view>
            <view class="message-item">
              3.可出具具体填报方案；
            </view>
            <view class="message-item">
              4.更多问题添加老师微信直接咨询；
            </view>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script>
import mixins from './mixins.js'

export default {
  mixins: [mixins],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/operations/course/',
    }
  },
  computed: {
    wxPlatform() {
      return uni.$u.platform === 'weixin'
    },
  },
}
</script>

<style lang="scss" scoped>
.result {
  min-height: 100vh;
  background: #f6f6f6;
  z-index: -1;
  &-banner {
    width: 100%;
    z-index: 1;
  }
  &-content {
    position: relative;
    z-index: 2;
    margin-top: -40rpx;
    padding: 82rpx 50rpx;
    background: #f6f6f6;
    border-radius: 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    .qrcode {
      width: 288rpx;
      height: 288rpx;
      margin-bottom: 24rpx;
    }
    .text {
      font-size: 32rpx;
      color: #333333;
      margin-bottom: 118rpx;
    }
    .line {
      width: 100%;
      margin-bottom: 74rpx;
    }
    .tips {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      .title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333333;
        margin-bottom: 12rpx;
      }
      .message {
        &-item {
          font-size: 28rpx;
          color: #939393;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>
