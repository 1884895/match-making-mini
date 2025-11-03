<template>
  <view class="trend" :class="{ novip: showDefaultVip }">
    <u-sticky :custom-nav-height="0">
      <view class="trend-header">
        <view class="trend-header__tabs">
          <view v-for="(item, index) in tabs" :key="index" class="tabs-item" :class="{ active: item.value === current }" @click="tabClick(item)">
            {{ item.label }}
          </view>
        </view>
      </view>
    </u-sticky>
    <view class="trend-content">
      <view class="trend-content__main">
        <Score v-if="current === 'score'" :exam-list="examList" :papers="papers" :exam-detail="examDetail" :detault-opts="detaultOpts" :scroll-top="scrollTop" :is-exam-member="isExamMember" :resource-url="resourceUrl" />
        <Rank v-if="current === 'rank'" :exam-list="examList" :papers="papers" :exam-detail="examDetail" :detault-opts="detaultOpts" :scroll-top="scrollTop" :is-exam-member="isExamMember" :resource-url="resourceUrl" />
        <Subject v-if="current === 'subject'" :exam-list="examList" :papers="papers" :exam-detail="examDetail" :detault-opts="detaultOpts" :scroll-top="scrollTop" :is-exam-member="isExamMember" :resource-url="resourceUrl" />
      </view>
    </view>
    <view v-if="showDefaultVip" class="member">
      <image class="member-pic" :src="`${resourceUrl}score_trend_vip.png`" mode="widthFix" @click="jumpPage({ type: 'vip' }, { eventId: 'ksda_cjqs_kthy_pay' })" />
      <view class="member-close" @click.stop="closeMember = true" />
    </view>
    <ShortYearExpiredPopup v-if="showShortYearExpiredPopup" :from="options.shortFrom || shortFrom" :short-info="shortInfo" @close="showShortYearExpiredPopup = false" />
  </view>
</template>

<script>
import ShortYearExpiredPopup from '../../components/shortYearExpiredPopup.vue'
import score from './components/trend_score.vue'
import rank from './components/trend_rank.vue'
import subject from './components/trend_subject.vue'
import record from './record.js'

export default {
  components: { Score: score, Rank: rank, Subject: subject, ShortYearExpiredPopup },
  mixins: [record],
  data() {
    return {
      options: {},
      current: 'score',
      tabs: [
        { label: '总分趋势', value: 'score' },
        { label: '排名趋势', value: 'rank' },
        { label: '学科成绩趋势', value: 'subject' },
      ],
      examDetail: {},
      examList: [],
      papers: [],
      closeMember: false,
      detaultOpts: {
        padding: [19, 0, 0, 0],
        color: ['#FFB100'],
        fontSize: 11,
        fontColor: '#939393',
        enableScroll: true,
        dataLabel: false,
        xAxis: {
          axisLineColor: '#EDEDED',
          fontColor: '#939393',
          fontSize: 11,
          itemCount: 4,
          scrollAlign: 'right',
        },
        yAxis: {
          showTitle: false,
          gridType: 'dash',
          gridColor: '#D4D4D4',
          dashLength: 6,
          splitNumber: 3,
          data: [
            {
              axisLine: false,
              min: 0,
              format: 'yAxisFixed',
            },
          ],
        },
        legend: {
          show: false,
        },
        extra: {
          area: {
            gradient: true,
            opacity: 1,
          },
          tooltip: {
            gridType: 'dash',
            gridColor: '#FFB100',
            legendShow: false,
            borderRadius: 4,
            fontSize: 11,
          },
        },
      },
      shortInfo: {},
      shortFrom: 'examRecord',
      showShortYearExpiredPopup: false,
      isHiddenBottomVip: null, // 一年过期会员活动对象不显示底部vip
    }
  },
  computed: {
    beProxy() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/be-proxy'
      // #endif
      return prefix
    },
    showDefaultVip() {
      return this.showVip && this.config.parentPay === 2 && !this.isExamMember && !this.closeMember && this.isHiddenBottomVip === false
    },
  },
  onLoad(options) {
    this.options = options
    options.current && (this.current = options.current)
    this.getExamArchives()
    this.getShortRecommend()
  },
  methods: {
    tabClick(item) {
      this.current = item.value
    },
    async getExamArchives() {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/archives`, { grade: this.grade || '' })
      const { list = [], papers = [] } = res.data
      this.examList = list.filter(item => item.rscore !== -1)
      this.papers = papers
      this.examDetail = res.data
    },
    async getShortRecommend() {
      const res = await uni.$http.get(`${this.beProxy}/v3/strategy/recommend-goods`, { from: this.options.shortFrom || this.shortFrom }, { custom: { loading: false, error: false } })
      this.shortInfo = res.data || {}

      const { recommendation = {}, show = false, showed = false } = this.shortInfo
      const { memberType = '', stage = '' } = recommendation
      this.isHiddenBottomVip = show || showed
      if (memberType === 'year' && stage === 'expired') {
        this.showShortYearExpiredPopup = true
        this.hadShowShortYearExpiredPopup = true
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.trend {
  min-height: 100vh;
  background-color: #f6f6f6;
  padding-bottom: 60rpx;
  &.novip {
    padding-bottom: 120rpx;
  }
  &-header {
    height: 118rpx;
    background: #ffffff;
    border-radius: 0 0 24rpx 24rpx;
    padding: 0 28rpx;
    display: flex;
    align-items: center;
    &__tabs {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 76rpx;
      background: #f6f6f6;
      border-radius: 38rpx;
      .tabs-item {
        font-size: 30rpx;
        color: #939393;
        padding: 0 30rpx;
        &.active {
          width: 240rpx;
          height: 100%;
          background: linear-gradient(225deg, #ffc749, #ffba1d);
          border-radius: 38rpx;
          font-size: 30rpx;
          font-weight: bold;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
  &-content {
    padding: 20rpx 28rpx;
    &__main {
      border-radius: 24rpx;
      background: #ffffff;
      padding: 28rpx 24rpx 24rpx;
    }
  }
  .member {
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    box-shadow: 0 -4rpx 16rpx 0 rgba(0, 0, 0, 0.06);
    z-index: 9999;
    &-pic {
      width: 100%;
      height: 100%;
    }
    &-close {
      width: 46rpx;
      height: 46rpx;
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}
</style>
