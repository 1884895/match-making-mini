<template>
  <view class="no">
    <view v-if="!hasStudent" class="no-student">
      <image class="no-student__content" :src="`${resourceUrl}no_bind_student.png`" mode="widthFix" />
      <view class="no-student__footer">
        <view class="btn flex-row-center" @click="bindStudent">
          立即绑定
        </view>
        <view class="question" @click="openCustomerServiceChat">
          有疑问，可<text class="active">
            咨询客服
          </text><u-icon name="arrow-right" :bold="true" color="#FFB100" size="18rpx" />
        </view>
      </view>
    </view>
    <view v-else class="no-data">
      <image class="no-data__content" :src="`${resourceUrl}no_exam_data.png`" mode="widthFix" />
      <view class="no-data__footer">
        <view class="improve">
          <view class="improve-line" />
          <view class="improve-title">
            先来学习提升一下吧?
          </view>
        </view>
        <view class="list">
          <view v-for="(item, index) in improveList" :key="index" class="list-item">
            <view class="list-item__text">
              {{ item.text }}
            </view>
            <view class="list-item__btn flex-row-center" @click="jumpPage(item)">
              {{ item.btntext }}<u-icon class="icon" name="arrow-right" :bold="true" color="#FFB100" size="18rpx" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    hasStudent: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['reportEventParams', 'bindStudent', 'openCustomerServiceChat'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/index/',
      improveList: [
        {
          text: '百位名师带你搞定预习、复习、考前冲刺',
          btntext: '看课程',
          target: '71',
          url: '/pages/course/course',
        },
        {
          text: '同步学练，有练有反馈，难题不过夜',
          btntext: '做练习',
          url: '/practicePages/index/index',
          platform: 'h5',
        },
        {
          text: '海量真卷、模拟卷，巩固知识找手感',
          btntext: '下载试卷',
          url: '/knowledgePages/paperDownload/index',
          platform: 'h5',
        },
        {
          text: '认识自我、定位自我，规划好未来',
          btntext: '做生涯测评',
          target: '77',
        },
      ],
    }
  },
  mounted() {
    if (this.hasStudent)
      this.$emit('reportEventParams', 'ks_sy')
  },
  methods: {
    bindStudent() {
      this.$emit('reportEventParams', 'ks_sy_Bbdxs')
      this.$emit('bindStudent')
    },
    openCustomerServiceChat() {
      this.$emit('openCustomerServiceChat')
    },
    jumpPage(item, params = {}) {
      const { url = '', target, platform } = item
      // #ifdef MP-WEIXIN
      if (!url)
        return uni.showToast({ title: '请到APP端体验', icon: 'none' })
      if (platform === 'h5')
        return uni.navigateTo({ url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}`)}` })
      uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}`, fail: () => this.switchTab(url) })
      // #endif
      // #ifdef H5
      if (!target)
        return uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target, data: params }))
      // #endif
    },
    switchTab(url) {
      uni.switchTab({ url })
    },
  },
}
</script>

<style lang="scss" scoped>
.no {
  position: relative;
  &-student {
    &__content {
      margin: 312rpx auto 108rpx;
      width: 710rpx;
      height: 492rpx;
    }
    &__footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      .btn {
        width: 300rpx;
        height: 74rpx;
        background: linear-gradient(225deg, #ffcd22, #ff9b00);
        border-radius: 38rpx;
        box-shadow:
          0rpx 2rpx 0rpx 0rpx rgba(255, 255, 255, 0.7) inset,
          0rpx -2rpx 0rpx 0rpx rgba(255, 128, 31, 0.53) inset;
        margin-bottom: 24rpx;
        font-size: 32rpx;
        font-weight: 500;
        color: #ffffff;
      }
      .question {
        display: flex;
        font-size: 26rpx;
        color: #333333;
        .active {
          color: #ffb100;
          margin-right: 4rpx;
        }
      }
    }
  }
  &-data {
    &__content {
      width: 494rpx;
      height: 254rpx;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 16vh;
    }
    &__footer {
      width: 100%;
      position: fixed;
      bottom: 0;
      background: #ffffff;
      border-radius: 24rpx 24rpx 0rpx 0rpx;
      padding: 26rpx 24rpx 120rpx 24rpx;
      .improve {
        display: flex;
        align-items: center;
        margin-bottom: 28rpx;
        &-line {
          width: 8rpx;
          height: 34rpx;
          background: #ffba1d;
          border-radius: 4rpx;
          margin-right: 14rpx;
        }
        &-title {
          font-size: 32rpx;
          font-weight: 500;
          color: #333333;
        }
      }
      .list {
        &-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f6f6f6;
          border-radius: 20rpx;
          margin-bottom: 20rpx;
          padding: 23rpx 14rpx 23rpx 20rpx;
          &:last-child {
            margin-bottom: 0;
          }
          &__text {
            font-size: 28rpx;
            color: #333333;
            margin-right: 10rpx;
          }
          &__btn {
            font-size: 30rpx;
            font-weight: 500;
            color: #ffb100;
            flex-shrink: 0;
            .icon {
              margin-left: 2rpx;
            }
          }
        }
      }
    }
  }
}
</style>
