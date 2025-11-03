<template>
  <view class="share">
    <!-- #ifdef H5 -->
    <view class="share-launch">
      <ILaunchApp ref="iLaunchApp">
        <view class="share-launch__content">
          <image class="icon" src="../static/index/share_title.png" />
          <view class="btn">
            打开APP
          </view>
        </view>
      </ILaunchApp>
    </view>
    <!-- #endif -->
    <view class="share-content">
      <view class="share-content__message">
        <view class="header">
          <image class="header-icon" src="../static/index/share_icon.png" />
          <view class="header-title">
            考试解读
          </view>
        </view>
        <image class="comma" src="../static/academicReport/template_comma.png" />
        <view class="text">
          <rich-text v-for="(item, index) in diagnoseInfo" :key="index" :nodes="item" />
        </view>
      </view>
      <ExamList :exam-item="examItem" :is-member="isMember" :has-student="true" :is-share="true" :config="config" @jump-page="jumpPage" @show-popup="showPopup" />
      <Improve :exam-item="examItem" :has-student="true" :config="config" @show-popup="showPopup" @jump-page="jumpPage" />
    </view>
    <!-- #ifdef H5 -->
    <image class="share-bg" src="../static/index/header.png" mode="widthFix" />
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image class="share-bg" src="../static/index/share_bg.png" mode="widthFix" />
    <!-- #endif -->
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" bg-color="transparent">
      <view v-if="popup.type === 'tips'" class="share-popup tips">
        <view class="share-popup__title">
          提示
        </view>
        <view class="share-popup__content">
          <view>{{ popup.title }}</view>
          <view v-if="popup.tips" class="active">
            {{ popup.tips }}
          </view>
        </view>
        <scroll-view class="share-popup__scroll" scroll-y="true">
          <ITable :columns="popup.columns" :data="popup.tableData" />
        </scroll-view>
        <view class="share-popup__btn">
          <view class="btn confirm" @click="closePopup">
            我知道了
          </view>
        </view>
        <view class="share-popup__close" @click="closePopup">
          <u-icon name="close" color="#979797" bold size="28rpx" />
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import iTable from '../../components/i-table.vue'
import iLaunchApp from '../../components/i-launchApp.vue'
import { examSummary } from '../template/examSummary.js'
import improve from './components/improve.vue'
import examList from './components/examList.vue'

export default {
  components: { ExamList: examList, Improve: improve, ITable: iTable, ILaunchApp: iLaunchApp },
  data() {
    return {
      options: {},
      examItem: {},
      guide: {},
      diagnoseInfo: {},
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        type: '',
        title: '',
        tips: '',
        columns: [],
        tableData: [],
      },
    }
  },
  computed: {
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    config() {
      return this.examItem.config || {}
    },
    isMember() {
      return this.examItem.isMember || false
    },
  },
  async onLoad(options) {
    this.options = options
    await this.getExamOverview()
    await this.getGuide()
    this.getDiagnoseInfo()
  },
  methods: {
    async getExamOverview() {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/overview${uni.$u.queryParams(this.options)}`)
      this.examItem = res.data || {}
    },
    async getGuide() {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/score-reports/guide${uni.$u.queryParams(this.options)}`)
      this.guide = res.data || {}
    },
    getDiagnoseInfo() {
      const { compare, level, studentName } = this.examItem
      uni.setNavigationBarTitle({ title: `${studentName}的学情报告` })
      this.diagnoseInfo = examSummary(+this.options.userType, studentName, this.isMember, level, compare, this.guide, this.config)
    },
    jumpPage() {
      // #ifdef H5
      this.$refs.iLaunchApp.launchAppInH5()
      // #endif
      // #ifdef MP-WEIXIN
      return uni.reLaunch({ url: '/pages/index/index' })
      // #endif
    },
    showPopup(type, params = {}) {
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    closePopup() {
      this.popup.show = false
    },
  },
}
</script>

<style lang="scss" scoped>
.share {
  position: relative;
  min-height: 100vh;
  background: #f6f6f6;
  &-content {
    width: 100%;
    position: relative;
    z-index: 1;
    padding: 28rpx 0 50rpx;
    &__message {
      position: relative;
      padding: 24rpx 28rpx;
      margin: 0 28rpx 24rpx;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.8),
        #ffffff 29%
      );
      border-radius: 24rpx;
      box-shadow: 0rpx 2rpx 0rpx 0rpx #ffffff inset;
      .header {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;
        &-icon {
          width: 32rpx;
          height: 36rpx;
        }
        &-title {
          color: #333333;
          font-size: 32rpx;
          font-weight: bold;
          margin-left: 10rpx;
        }
      }
      .comma {
        width: 88rpx;
        height: 70rpx;
        position: absolute;
        top: 32rpx;
        right: 36rpx;
      }
      .text {
        position: relative;
        font-size: 26rpx;
        color: #333333;
        line-height: 44rpx;
        z-index: 1;
      }
    }
  }
  &-bg {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  &-launch {
    position: sticky;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 100;
    &__content {
      height: 96rpx;
      padding: 0 30rpx;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .icon {
        width: 320rpx;
        height: 44rpx;
      }
      .btn {
        width: 166rpx;
        height: 56rpx;
        font-size: 28rpx;
        color: #ffa100;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2rpx solid #ffa100;
        border-radius: 40rpx;
      }
    }
  }
  &-popup {
    position: relative;
    width: 600rpx;
    background: #ffffff;
    border-radius: 60rpx;
    padding: 48rpx;
    text-align: center;
    &__title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 32rpx;
    }
    &__content {
      font-size: 30rpx;
      color: #333333;
      margin-bottom: 62rpx;
    }
    &__btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      z-index: 1;
      .btn {
        width: 236rpx;
        height: 72rpx;
        font-size: 32rpx;
        font-weight: 500;
        border-radius: 38rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .close {
        color: #939393;
        border: 2rpx solid #939393;
      }
      .confirm {
        color: #ffffff;
        background: linear-gradient(225deg, #ffc749, #ffba1d);
      }
    }
    &__close {
      position: absolute;
      top: 45rpx;
      right: 35rpx;
      z-index: 1;
    }
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 252rpx;
      height: 166rpx;
      opacity: 0.08;
      background: #67fffe;
      border-radius: 50%;
      filter: blur(100rpx);
    }
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      width: 302rpx;
      height: 316rpx;
      opacity: 0.1;
      background: #ffba1d;
      border-radius: 50%;
      filter: blur(100rpx);
    }
    &.tips {
      padding: 62rpx 40rpx 40rpx;
      .share-popup {
        &__title {
          margin-bottom: 22rpx;
        }
        &__content {
          font-size: 26rpx;
          line-height: 36rpx;
          margin-bottom: 24rpx;
          text-align: left;
          .active {
            color: #eeab12;
          }
        }
        &__scroll {
          max-height: 390rpx;
          margin-bottom: 46rpx;
          ::v-deep .table {
            border: none;
            border-radius: 24rpx;
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
              height: 60rpx !important;
              border: none !important;
              padding: 0 !important;
              font-size: 26rpx !important;
              color: #939393 !important;
              background: none !important;
            }
            .td {
              font-size: 30rpx !important;
              color: #333333 !important;
            }
          }
        }
        &__btn {
          justify-content: center;
        }
      }
      &::before {
        height: 146rpx;
      }
      &::after {
        height: 276rpx;
      }
    }
  }
}
</style>
