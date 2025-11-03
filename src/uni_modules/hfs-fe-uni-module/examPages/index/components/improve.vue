<template>
  <view class="improve">
    <view class="improve-content">
      <view v-if="!isCustomVersion" class="improve-content__header">
        <view class="line" />
        <view class="title">
          考后复习提升，黄金<image class="title-num" :src="`${resourceUrl}three.png`" />步法
        </view>
      </view>
      <view class="improve-content__step">
        <view v-for="(item, index) in steps" :key="index" class="step-item">
          <view v-if="!isCustomVersion" class="step-item__header">
            <image class="icon" :src="resourceUrl + item.titleIcon" mode="widthFix" />
            <view class="title">
              {{ item.title }}
            </view>
          </view>
          <view class="step-item__list" :class="{ 'no-line': isCustomVersion }">
            <view v-for="(it, i) in item.modules" :key="i" class="list-item" @click="taskClick(it)">
              <image class="list-item__icon" :src="resourceUrl + it.icon" />
              <image v-if="!hideMember && showVip" class="list-item__vip" :src="`${resourceUrl}vip.png`" />
              <view class="list-item__message">
                <view class="title">
                  {{ it.title }}
                </view>
                <view class="sub">
                  {{ it.subTitle }}
                </view>
              </view>
              <view v-if="!examPoint[examItem.examId + it.type]" class="list-item__point" />
              <image v-if="it.showGif" class="list-item__gif" :src="`${resourceUrl}export_icon.gif`" />
              <image v-if="showGifKey === it.gifKey" class="list-item__gif" :src="`${resourceUrl}gif_final.png`" />
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="!hideMember && showArena" class="improve-arena" @click="taskClick({ type: 'arena', event: 'ks_syksjjc_Bksjjcl' })">
      <view class="improve-arena__content">
        <image class="icon" :src="`${resourceUrl}arena.png`" />
        <view class="text">
          考试竞技场
        </view>
      </view>
      <u-icon name="arrow-right" :bold="true" color="#333" size="22rpx" />
    </view>
  </view>
</template>

<script>
import { isHFSStudent } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    examItem: {
      type: Object,
      default: () => ({}),
    },
    hasStudent: {
      type: Boolean,
      default: false,
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    examPoint: {
      type: Object,
      default: () => ({}),
    },
    shortInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['reportEvent', 'reportEventParams', 'showExpress', 'jumpPage'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/index/',
      receiveList: [],
      cuoti_dz: false,
      cuoti_jyfs: false,
      cuoti_jgl: false,
      showGifKey: '',
    }
  },
  computed: {
    hideMember() {
      const { hideMember = false } = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
      return hideMember
    },
    // 是否为定制版本，屏蔽导出错题功能
    isCustomVersion() {
      return uni.getStorageSync('isCustomVersion') === true
    },
    beProxy() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/be-proxy'
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
    analysisStatus() {
      return this.examItem.analysisStatus
    },
    showArena() {
      const { gossipReport, examPk, cross, simulation } = this.config
      return [gossipReport, examPk, cross, simulation].includes(2)
    },
    examTitle() {
      const tagMap = { 1: '期中', 2: '期末', 3: '月考', 4: '竞赛', 5: '普通' }
      const { grade, type, time } = this.examItem
      const timeFormat = uni.$u.timeFormat(time, 'yyyymmdd')
      return `${timeFormat + grade + tagMap[type]}考试`
    },
    subjectStatus() {
      const { papers = [] } = this.examItem || {}
      return papers.reduce((acc, cur) => {
        acc[cur.subject] = cur.weakAdvantageStatus
        return acc
      }, {})
    },
    steps() {
      const allSteps = [
        {
          title: '成绩解读',
          titleIcon: 'step_1.png',
          modules: [
            {
              icon: 'score_overview.png',
              title: '成绩总览',
              type: 'scoreSummary',
              event: 'ks_sycjzl_Bcjzl',
              params: { analysisStatus: this.analysisStatus, examTitle: this.examTitle },
            },
            {
              icon: 'subject_analyze.png',
              title: '学科分析',
              type: 'subjectAnalysis',
              event: 'ks_syxkfx_Bxkfx',
              params: { analysisStatus: this.analysisStatus, examTitle: this.examTitle, subjectStatus: encodeURIComponent(JSON.stringify(this.subjectStatus)) },
            },
          ],
        },
        {
          title: '查漏补缺',
          titleIcon: 'step_2.png',
          modules: [
            {
              icon: 'lose_point.png',
              title: '失分总结',
              type: 'loseSummary',
              event: 'ks_sysfzl_Bsfzl',
              params: { analysisStatus: this.analysisStatus, examTitle: this.examTitle },
            },
            {
              icon: 'error_correct.png',
              title: '错题订正',
              type: 'analysis',
              event: 'ks_syctdz_Bctdz',
              showGif: this.cuoti_dz,
              gifKey: 'cuoti_dz',
              params: { config: uni.$u.platform === 'h5' ? '' : encodeURIComponent(JSON.stringify({ score: this.config.score, scoreType: this.config.scoreType })), received: this.getReceived('cuoti_dz') },
            },
          ],
        },
        {
          title: '巩固提升',
          titleIcon: 'step_3.png',
          modules: [
            {
              icon: 'similar_question.png',
              title: '举一反三练',
              subTitle: '触类旁通',
              type: 'practice',
              event: 'ks_syjyfsl_Bjyfsl',
              showGif: this.cuoti_jyfs,
              gifKey: 'cuoti_jyfs',
              params: { analysisStatus: this.analysisStatus, examId: `${this.examItem.examId}&type=2&received=${this.getReceived('cuoti_jyfs')}` },
            },
            {
              icon: 'error_practice.png',
              title: '错题间隔练',
              subTitle: '对抗遗忘',
              type: 'interval',
              event: 'ks_syctjgl_Bjctjgl',
              showGif: this.cuoti_jgl,
              gifKey: 'cuoti_jgl',
              params: { analysisStatus: this.analysisStatus, examId: `${this.examItem.examId}&type=3&received=${this.getReceived('cuoti_jgl')}` },
            },
          ],
        },
      ]

      // 定制版本只保留特定模块
      if (this.isCustomVersion) {
        return allSteps.map(step => ({
          ...step,
          modules: step.modules.filter(module =>
            ['scoreSummary', 'subjectAnalysis', 'loseSummary', 'analysis'].includes(module.type),
          ),
        })).filter(step => step.modules.length > 0)
      }

      return allSteps
    },
  },
  methods: {
    async getTicket() {
      const res = await uni.$http.get(`${this.beProxy}/v3/grow/func-ticket`, { code: '2023', func: 'cuoti' }, { custom: { loading: false, error: false } })
      this.receiveList = res.data || []
      this.gifControl()
    },
    // gif动画控制
    gifControl() {
      const sort = ['cuoti_dz', 'cuoti_jyfs', 'cuoti_jgl']
      const filterSort = sort.filter(item => !this.receiveList.some(v => v.func_to === item))
      let index = 0
      let timer = null
      const tick = () => {
        if (index >= filterSort.length) {
          this.showGifKey = filterSort[0] || ''
          filterSort.forEach(v => (this[v] = false))
          return timer && clearInterval(timer)
        }
        filterSort.forEach(v => (this[v] = false))
        this[filterSort[index]] = true
        index++
      }
      tick()
      timer = setInterval(tick, 3020)// gif动画时间不足3s
    },
    // 是否已领取，未领取返回需要领取的key
    getReceived(key) {
      const has = this.receiveList.some(v => v.func_to === key)
      return has ? '' : key
    },
    showExpress() {
      // #ifdef H5
      this.$emit('reportEvent', 'ks_kssd_Bkssd')
      // #endif
      this.$emit('showExpress', 'express')
    },
    taskClick(item) {
      // #ifdef H5
      item.event && this.$emit('reportEventParams', item.event)
      // #endif
      const { examId } = this.examItem
      if (this.hasStudent && !examId)
        return uni.$u.toast('暂无考试数据')
      if (item.type === 'arena') {
        const { recommendation = {} } = this.shortInfo || {}
        const { memberType = '', stage = '' } = recommendation
        const isYearExpired = memberType === 'year' && stage === 'expired'
        const { gossipVisible, mode, className, name: examName, score: scoreS, classRank: classRankS, grade, type, time } = this.examItem
        item.params = { gossipVisible, mode, className, examName, scoreS, classRankS, shortFrom: isYearExpired ? 'examIndex' : '', grade, examType: type, time }
      }
      uni.setStorageSync('exam_point', { ...this.examPoint, [examId + item.type]: true })
      this.$emit('jumpPage', item.type, { examId: `${examId}`, ...(item.params || {}) })
    },
  },
}
</script>

<style lang="scss" scoped>
.improve {
  position: relative;
  margin: 0 28rpx;
  &-content {
    background: #ffffff;
    padding: 20rpx 28rpx 0;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    &__header {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      .line {
        width: 8rpx;
        height: 32rpx;
        background: #ffba1d;
        border-radius: 4rpx;
        margin-right: 16rpx;
      }
      .title {
        display: flex;
        font-size: 30rpx;
        font-weight: bold;
        color: #333333;
        &-num {
          width: 26rpx;
          height: 38rpx;
          margin: 0 6rpx;
        }
      }
    }
    &__step {
      overflow: hidden;
      .step-item {
        margin-bottom: 6rpx;
        &:last-child {
          margin-bottom: 8rpx;
        }
        &__header {
          display: flex;
          align-items: center;
          .icon {
            width: 28rpx;
            height: 22rpx;
            margin-right: 6rpx;
          }
          .title {
            font-size: 28rpx;
            color: #333333;
          }
        }
        &__list {
          position: relative;
          display: flex;
          align-items: center;
          padding: 12rpx 0 16rpx 8rpx;
          margin-left: 14rpx;
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 1rpx;
            height: 200%;
            border-left: 2rpx dashed #ffba1d;
            transform: scale(0.5);
            transform-origin: 0 0;
          }
          &.no-line {
            margin-left: 0;
            padding-left: 0;
            &::before {
              display: none;
            }
          }
          .list-item {
            position: relative;
            display: flex;
            align-items: center;
            width: calc(50% - 12rpx);
            height: 120rpx;
            margin-left: 12rpx;
            background: #f6f6f6;
            border-radius: 16rpx;
            padding-left: 22rpx;
            &__icon {
              width: 66rpx;
              height: 66rpx;
              margin-right: 6rpx;
            }
            &__vip {
              position: absolute;
              top: 6rpx;
              left: 56rpx;
              width: 46rpx;
              height: 28rpx;
            }
            &__message {
              .title {
                font-size: 28rpx;
                font-weight: bold;
                color: #333333;
              }
              .sub {
                font-size: 24rpx;
                color: #939393;
              }
            }
            &__point {
              position: absolute;
              top: -4rpx;
              right: -4rpx;
              width: 24rpx;
              height: 24rpx;
              background: #ff3b0d;
              border: 4rpx solid #ffffff;
              border-radius: 50%;
            }
            &__gif {
              position: absolute;
              top: -108rpx;
              left: 22rpx;
              width: 200rpx;
              height: 200rpx;
            }
          }
        }
      }
    }
  }
  &-arena {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20rpx 0 28rpx;
    background: #ffffff;
    height: 72rpx;
    border-radius: 20rpx;
    &__content {
      display: flex;
      align-items: center;
      .icon {
        width: 36rpx;
        height: 36rpx;
        margin-right: 10rpx;
      }
      .text {
        font-size: 28rpx;
        color: #333333;
      }
    }
  }
  &-express {
    position: absolute;
    right: 6rpx;
    top: -16rpx;
    width: 102rpx;
    height: 94rpx;
  }
}
</style>
