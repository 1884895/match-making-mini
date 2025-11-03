<template>
  <view class="analysis">
    <u-sticky :custom-nav-height="0">
      <INotifyBar :title="Object.keys(subjectDetail).length && !visible ? '成为会员' : '仅需3分钟，即可掌握单科学情！' " :sub-title="visible ? '' : '- 仅需3分钟，即可掌握单科学情！'" />
    </u-sticky>
    <view class="analysis-content">
      <u-sticky :custom-nav-height="0">
        <view class="subject-tabs" :class="{ visible }">
          <u-tabs :list="subjectList" key-name="subject" :line-color="tabsStyle.lineColor" :inactive-style="tabsStyle.inactiveStyle" :active-style="tabsStyle.activeStyle" :item-style="tabsStyle.itemStyle" @change="subjectChange" />
        </view>
      </u-sticky>
      <u-line color="#f6f6f6" :hairline="false" />
      <view class="analysis-content__item analysis-content__subject">
        <view id="point0" class="subject-overview">
          <ScoreOverview :subject-detail="subjectDetail" :exam-overview="examDetail" :config="config" :user-info="userInfo" @subject-exam-overview="subjectExamOverview" />
          <view class="connect">
            <image class="icon" :src="`${resourceUrl}connect.png`" />
            <image class="icon" :src="`${resourceUrl}connect.png`" />
          </view>
        </view>
      </view>
      <view id="point1" class="analysis-content__item analysis-content__distribution">
        <ScoreInterpretation v-if="options.examId" :mode="examDetail.mode || 0" :scroll-top="scrollTop" :exam-id="options.examId" :subject-exam-detail="subjectExamDetail" :subject-detail="subjectDetail" :paper-id="subjectDetail.paperId" :config="config" :user-info="userInfo" :exam-detail="examDetail" :subject-status="subjectStatus" />
        <view class="connect">
          <image class="icon" :src="`${resourceUrl}connect.png`" />
          <image class="icon" :src="`${resourceUrl}connect.png`" />
        </view>
      </view>
      <view class="analysis-content__item analysis-content__diffcult">
        <!-- eslint-disable-next-line vue/no-unused-refs -->
        <PaperInterpretationSingle ref="paperInterpretationSingle" :scroll-top="scrollTop" :exam-id="options.examId" :subject-exam-detail="subjectExamDetail" :subject-detail="subjectDetail" :config="config" :user-info="userInfo" :exam-detail="examDetail" />
      </view>
      <view class="analysis-content__trend">
        <image class="trend-bg" :src="`${resourceUrl}tips_bg.png`" mode="widthFix" @click="jumpExamRecord('ks_xkfx_Bcjqs')" />
      </view>
    </view>
    <Footer v-if="Object.keys(examDetail).length && isHiddenBottomVip !== null" type="subject" :scroll-top="currentScrollTop" :visible="visible || isHiddenBottomVip" />
    <ShortYearExpiredPopup v-if="showShortYearExpiredPopup" :from="shortFrom" :short-info="shortInfo" @close="showShortYearExpiredPopup = false" />
    <ShortYearExpiringPopup v-if="showShortYearExpiringPopup" img-type="subject" :from="shortFrom" :short-info="shortInfo" @close="showShortYearExpiringPopup = false" />
  </view>
</template>

<script>
import INotifyBar from '../../components/i-notifyBar.vue'
import ShortYearExpiredPopup from '../../components/shortYearExpiredPopup.vue'
import ShortYearExpiringPopup from '../../components/shortYearExpiringPopup.vue'
import ScoreOverview from './components/scoreOverview.vue'
import PaperInterpretationSingle from './components/paperInterpretationSingle.vue'
import ScoreInterpretation from './components/scoreInterpretation.vue'
import Footer from './components/footer.vue'
import exam from './exam.js'

export default {
  components: { INotifyBar, ScoreOverview, PaperInterpretationSingle, ScoreInterpretation, Footer, ShortYearExpiredPopup, ShortYearExpiringPopup }, // eslint-disable-line vue/no-reserved-component-names
  mixins: [exam],
  data() {
    return {
      pageType: 'subjectAnalysis',
      subjectDetail: {},
      subjectList: [],
      subjectExamDetail: {},
      trendMap: {
        '-1': '下降',
        '0': '平稳',
        '1': '上升',
      },
    }
  },
  computed: {
    subjectStatus() {
      const { subjectStatus } = this.options
      return subjectStatus ? JSON.parse(decodeURIComponent(subjectStatus)) : {}
    },
  },
  methods: {
    initPage() {
      this.getShortRecommend()
      const { papers = [] } = this.examDetail
      this.subjectList = papers.map((item) => {
        return {
          ...item,
          badge: {
            value: '.',
            type: this.subjectStatus[item.subject].toString(),
          },
        }
      })
      this.subjectChange({ paperId: this.subjectList[0].paperId })
    },
    subjectChange({ paperId = '' }) {
      this.subjectDetail = this.subjectList.find(item => item.paperId === paperId)
    },
    subjectExamOverview(data) {
      this.subjectExamDetail = data
    },
  },
}
</script>

<style lang="scss" scoped>
.analysis {
  min-height: 100vh;
  background: #f6f6f6;
  &-content {
    padding: 20rpx 28rpx 140rpx;
    &__item {
      position: relative;
      margin-bottom: 24rpx;
      &:last-child {
        margin-bottom: 0;
      }
    }
    &__subject {
      background-color: #ffffff;
      border-radius: 0 0 24rpx 24rpx;
      .subject-overview {
        position: relative;
        padding: 25rpx 28rpx 36rpx;
      }
    }
    .subject-tabs {
      background-color: #ffffff;
      border-radius: 24rpx 24rpx 0 0;
      ::v-deep .u-tabs__wrapper__nav__item {
        &:first-child {
          padding-left: 28rpx !important;
        }
        &:nth-last-child(2) {
          padding-right: 28rpx !important;
        }
        .u-badge {
          display: none;
        }
      }
    }
    .visible {
      ::v-deep .u-tabs__wrapper__nav__item {
        .u-badge {
          display: block;
          position: relative;
          visibility: hidden;
          padding: 0;
          margin: 0 !important;
          &::after {
            content: '';
            position: absolute;
            background-size: 100% 100%;
            top: -12rpx;
            right: 6rpx;
            width: 22rpx;
            height: 22rpx;
            visibility: visible;
          }
          &--1::after {
            background-image: url('https://fe-resource.haofenshu.com/exam/images/index/advantage.png');
          }
          &--2::after {
            background-image: url('https://fe-resource.haofenshu.com/exam/images/index/good.png');
          }
          &--3::after {
            background-image: url('https://fe-resource.haofenshu.com/exam/images/index/weak.png');
          }
          &--4::after {
            background-image: url('https://fe-resource.haofenshu.com/exam/images/index/inferior.png');
          }
        }
      }
    }
    &__distribution {
      ::v-deep .interpretation-content {
        padding: 36rpx 28rpx;
      }
    }
    &__trend {
      .trend-bg {
        width: 100%;
        height: 128rpx;
      }
    }
    .connect {
      width: 100%;
      padding: 0 18rpx;
      position: absolute;
      bottom: -46rpx;
      left: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9;
      .icon {
        width: 18rpx;
        height: 70rpx;
      }
    }
  }
}
</style>
