<template>
  <view class="exam-list">
    <view class="exam-list__detail">
      <view v-if="Object.keys(examItem).length">
        <view class="exam-list__header">
          <view class="info">
            <view class="info-title one-txt-cut">
              {{ $u.timeFormat(examItem.time, 'yyyymmdd') }}{{ examItem.grade || '' }}{{ tagMap[examItem.type] }}考试
            </view>
            <view v-if="!isShare" class="info-replace flex-row-center" @click.stop="examChange">
              <image class="info-replace__icon" :src="`${resourceUrl}replace.png`" />切换考试
            </view>
          </view>
          <view class="info">
            <view v-if="!isShare" class="info-share" @click.stop="handleShare">
              <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="shareWeixin" />
              <view class="info-share__text">
                分享<image class="icon" :src="`${resourceUrl}share.png`" />
              </view>
            </view>
          </view>
        </view>
        <view class="exam-list__content">
          <!-- 全屏蔽 -->
          <image v-if="config._score === 1 && config._scoreSingle === 1 && config._classRank === 1 && config._gradeRank === 1" class="hidden" :src="`${resourceUrl}hidden_all.png`" mode="widthFix" />
          <template v-else>
            <view class="result">
              <!-- 总成绩 -->
              <view class="result-chart" :class="{ active: config.scoreType === 3 }">
                <image v-if="config._score === 1 && config._scoreSingle === 1" class="result-chart__hidden" :src="`${resourceUrl}hidden_score_icon.png`" mode="widthFix" />
                <template v-if="config.scoreType === 3">
                  <view class="result-chart__chart active-chart">
                    <view class="level">
                      <text>{{ examItem.score }}</text>
                      <view class="level-info">
                        <image class="level-icon" :src="`${resourceUrl}question.png`" @click.stop="showLevel" />
                        <text v-if="examItem.mode === 2">
                          {{ examItem.groupName }}
                        </text>
                        <text v-if="examItem.mode === 3 || examItem.mode === 4">
                          新高考
                        </text>
                      </view>
                    </view>
                    <view v-if="examItem.star > 0" class="star">
                      <view class="star-progress" :style="{ width: `${(examItem.star / 5) * 100}%` }">
                        <view class="bar">
                          <image v-for="index in 5" :key="index" class="star-icon" src="../../static/academicReport/star_active.png" />
                        </view>
                      </view>
                      <image v-for="index in 5" :key="index" class="star-icon" src="../../static/academicReport/star.png" />
                    </view>
                  </view>
                </template>
                <template v-else>
                  <view class="result-chart__info">
                    <view class="score">
                      <view v-if="examItem.mode === 2" class="score-sub">
                        {{ examItem.groupName }}
                      </view>
                      <view v-if="examItem.mode === 3 || examItem.mode === 4" class="score-sub">
                        新高考
                      </view>
                      <view class="score-all">
                        <text class="active">
                          {{ examItem.score }}
                        </text>/{{ examItem.manfen }}
                      </view>
                      <view v-if="examItem.mode === 3 || examItem.mode === 4" class="score-text">
                        （原始 {{ examItem.scoreBeforeGrading }}/{{ examItem.manfenBeforeGrading }}）
                      </view>
                    </view>
                  </view>
                  <view class="result-chart__chart">
                    <qiun-data-charts type="arcbar" :canvas2d="true" :opts="opts" :chart-data="getChartData(examItem)" />
                  </view>
                </template>
              </view>
              <!-- 考试勋章 -->
              <view class="result-ranking">
                <view v-if="visible" class="result-ranking__item mb-12" @click.stop="jumpAppraise">
                  考试勋章<image v-if="scoreBadge[examItem.scoreMedal]" class="icon" :src="scoreBadge[examItem.scoreMedal]" /><image v-if="scoreBadge[examItem.progressMedal]" class="icon ml-0" :src="progressiveBadge[examItem.progressMedal]" /><u-icon name="arrow-right" :bold="true" color="#333" size="22rpx" />
                </view>
                <view v-if="showVip && !visible" class="result-ranking__item mb-12">
                  考试勋章<image class="icon vip" :src="`${resourceUrl}medal_vip.png`" mode="widthFix" />
                </view>
                <view v-if="config._classRank === 2" class="result-ranking__item result-ranking__end" @click.stop="showPart">
                  <text v-if="config.rankType === 2 || config.rankType === 5">
                    班级排名
                  </text>
                  <text v-if="config.rankType === 3 || config.rankType === 6">
                    班级击败率
                  </text>
                  <text v-if="config.rankType === 4">
                    班级等第
                  </text>
                  <text class="score">
                    {{ examItem.classRank }}{{ examItem.classStuNum ? `/${examItem.classStuNum}人` : '' }}
                  </text>
                  <image v-if="config.rankType === 4" class="question" :src="`${resourceUrl}question.png`" />
                </view>
                <view v-if="config._gradeRank === 2" class="result-ranking__item result-ranking__end" @click.stop="showPart">
                  <text v-if="config.rankType === 2 || config.rankType === 5">
                    年级排名
                  </text>
                  <text v-if="config.rankType === 3 || config.rankType === 6">
                    年级击败率
                  </text>
                  <text v-if="config.rankType === 4">
                    年级等第
                  </text>
                  <text class="score">
                    {{ examItem.gradeRank }}{{ examItem.gradeStuNum ? `/${examItem.gradeStuNum}人` : '' }}
                  </text>
                  <image v-if="config.rankType === 4 && config.classRank !== 2" class="question" :src="`${resourceUrl}question.png`" />
                </view>
              </view>
              <image v-if="config._classRank === 1 && config._gradeRank === 1" class="result-rank" :src="`${resourceUrl}hidden_rank_icon.png`" mode="widthFix" />
            </view>
            <!-- 展示排名提醒 -->
            <view v-if="!hideMember && config.scoreType === 3 && (config.score === 2 || config.scoreSingle === 2) && isShowRemind" class="notice" @click.stop="showRemind">
              <u-icon class="notice-left" name="volume-fill" :bold="true" color="#939393" size="24rpx" />
              <view class="notice-content">
                <view class="notice-content__text">
                  <view class="message">
                    {{ remindText }}
                  </view>
                  <view class="message">
                    {{ remindText }}
                  </view>
                </view>
              </view>
              <view class="notice-right" @click.stop="closeRemind">
                <u-icon name="close" :bold="true" color="#333333" size="22rpx" />
              </view>
            </view>
            <!-- 科目 -->
            <image v-if="config._score === 1 && config._scoreSingle === 1" class="hidden" :src="`${resourceUrl}hidden_score.png`" mode="widthFix" />
            <view v-else class="subject">
              <view class="subject-score">
                <view v-for="(it, ix) in scoreList" :key="ix" class="subject-score__list">
                  <view v-for="(sub, subIndex) in it" :key="subIndex" class="subject-item">
                    <view class="subject-item__title">
                      <view class="one-txt-cut">
                        {{ sub.subject }}
                      </view><image v-if="visible && subjectWeakAdvantage[sub.weakAdvantageStatus]" class="tag" :src="resourceUrl + subjectWeakAdvantage[sub.weakAdvantageStatus]" />
                    </view>
                    <view v-if="config.scoreType === 3" class="subject-item__score">
                      <text class="active">
                        {{ sub.score }}
                      </text>
                      <view v-if="sub.star > 0" class="star">
                        <view class="star-progress" :style="{ width: `${(sub.star / 5) * 100}%` }">
                          <view class="bar">
                            <image v-for="index in 5" :key="index" class="star-icon" :src="`${resourceUrl}star_active.png`" />
                          </view>
                        </view>
                        <image v-for="index in 5" :key="index" class="star-icon" :src="`${resourceUrl}star.png`" />
                      </view>
                    </view>
                    <view v-else class="subject-item__score">
                      <text class="active">
                        {{ sub.score }}
                      </text>/{{ sub.manfen }}
                    </view>
                  </view>
                  <view v-if="showRelease && examItem.papers.length % 3 !== 0 && ix === scoreList.length - 1" class="subject-tips">
                    <view class="subject-tips__publish">
                      <view class="text">
                        成绩陆续发布中
                      </view>
                      <view class="dot" />
                      <view class="dot" />
                      <view class="dot" />
                    </view>
                  </view>
                </view>
              </view>
              <view v-if="showRelease && examItem.papers.length % 3 === 0" class="subject-tips">
                <view class="subject-tips__publish">
                  <view class="text">
                    成绩陆续发布中
                  </view>
                  <view class="dot" />
                  <view class="dot" />
                  <view class="dot" />
                </view>
              </view>
            </view>
          </template>
          <!-- 原卷、答题卡、小题分 -->
          <view class="task">
            <view v-for="(item, index) in taskList" :key="index" class="task-item flex-row-center" @click.stop="taskClick(item)">
              <image class="task-item__icon" :src="resourceUrl + item.image" />
              <view class="task-item__title">
                {{ item.title }}
              </view>
              <u-icon name="arrow-right" :bold="true" color="#333" size="18rpx" />
            </view>
          </view>
          <!-- 已购考试报告 -->
          <view v-if="!isMember && examItem.analysisStatus === 1" class="sign">
            已购
          </view>
        </view>
        <view v-if="showLiankao" class="exam-list__footer">
          <view class="footer-content">
            <image class="footer-content__book" :src="`${resourceUrl}report_book.png`" mode="widthFix" />
            <view class="footer-content__text">您有一份新的联考报告待查收</view>
            <image class="footer-content__new" :src="`${resourceUrl}report_new.png`" mode="widthFix" />
          </view>
          <view class="footer-btns" @click.stop="jumpLiankao(examItem)">去查看</view>
        </view>
      </view>
      <view v-else class="exam-list__none">
        <view class="popup">
          <view class="popup-title">
            温馨提示
          </view>
          <view class="popup-content">
            <text v-if="hasStudent">
              暂无考试数据
            </text>
            <view v-else class="popup-content__bind">
              <text>当前账号暂未绑定学生账号，想要体验完整考试功能，请立即绑定！</text>
              <view class="btn" @click="bindStudent">
                立即绑定
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { isHFSApp, isHFSParent, isHFSStudent } from '@/uni_modules/hfs-fe-uni-plugins'

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
    isMember: {
      type: Boolean,
      default: false,
    },
    showGuideStep: {
      type: Boolean,
      default: false,
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    isShare: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['reportEventParams', 'jumpPage', 'showPopup', 'bindStudent', 'examChange', 'shareWeixin'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/index/',
      remindText: '本次考试应要求以等级展示成绩，购买VIP会员或单次报告，都无法查看具体分数。',
      isShowRemind: true,
      tagMap: {
        1: '期中',
        2: '期末',
        3: '月考',
        4: '竞赛',
        5: '普通',
      },
      scoreBadge: {
        1: require('../../static/index/medal_a.png'),
        2: require('../../static/index/medal_b.png'),
        3: require('../../static/index/medal_c.png'),
        4: require('../../static/index/medal_d.png'),
        5: require('../../static/index/medal_e.png'),
        6: require('../../static/index/medal_f.png'),
      },
      progressiveBadge: {
        1: require('../../static/index/medal_gold.png'),
        2: require('../../static/index/medal_silver.png'),
        3: require('../../static/index/medal_bronze.png'),
        4: require('../../static/index/medal_comeon.png'),
        5: require('../../static/index/medal_notice.png'),
      },
      subjectWeakAdvantage: {
        1: 'advantage.png',
        2: 'good.png',
        3: 'weak.png',
        4: 'inferior.png',
      },
      opts: {
        title: {
          name: '',
        },
        subtitle: {
          name: '',
        },
        extra: {
          arcbar: {
            width: 6.4,
            startAngle: 1,
            endAngle: 0,
            backgroundColor: '#FFF1DB',
          },
        },
      },
    }
  },
  computed: {
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/be-proxy'
      // #endif
      return prefix
    },
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
    isHFSAppParent() {
      // #ifdef H5
      if (isHFSParent()) {
        return true
      }
      // #endif
      return false
    },
    isIos() {
      return uni.$u.os() === 'ios'
    },
    hideMember() {
      const { hideMember = false } = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
      return hideMember
    },
    isAndroid() {
      return uni.$u.os() === 'android'
    },
    visible() {
      return this.examItem && this.examItem.visible === 1
    },
    showRelease() {
      const { publishStatus } = this.examItem || {}
      return publishStatus !== 1
    },
    showLiankao() {
      return this.examItem.liankaoStatus === 1 && this.config.liankaoReport === 2
    },
    taskList() {
      const { score, scoreType, paperInspection, paperPic } = this.config
      const params = { tab: 0, tabIndex: 0, score, scoreType, paperInspection, paperPic }
      return [
        {
          title: '原卷',
          vip: false,
          type: 'original',
          image: 'original.png',
          event: 'ks_syyj_Byj',
          params,
        },
        {
          title: '答题卡',
          vip: false,
          type: 'sheet',
          image: 'sheet.png',
          event: 'ks_sydtk_Bdtk',
          params: { ...params, tab: 1, tabIndex: 1 },
        },
        {
          title: '小题分',
          vip: false,
          type: 'subtitle',
          image: 'subtitle.png',
          event: 'ks_syxtf_Bxtf',
          params: { ...params, tab: 2, tabIndex: 2 },
        },
      ]
    },
    examIdsMap() {
      return uni.getStorageSync('exam_closeRemind') || []
    },
    scoreList() {
      return this.chunkArray(this.examItem.papers || [], 3)
    },
    configOptions() {
      const { score, liankaoReportAvg, liankaoReportMax, liankaoReportStage, liankaoReportRank, scoreStage, rankType } = this.config
      const params = { score, liankaoReportAvg, liankaoReportMax, liankaoReportStage, liankaoReportRank, scoreStage, rankType }
      return uni.$u.platform === 'weixin' ? encodeURIComponent(JSON.stringify(params)) : ''
    },
  },
  methods: {
    init(examId) {
      if (!this.examIdsMap[examId])
        this.isShowRemind = true
    },
    closeRemind() {
      const examIdsMap = { ...this.examIdsMap, [this.examItem.examId]: true }
      uni.setStorageSync('exam_closeRemind', examIdsMap)
      this.isShowRemind = false
    },
    handleShare() {
      this.$emit('reportEventParams', 'ks_syfx_Bfx')
    },
    taskClick(item) {
      // #ifdef H5
      item.event && this.$emit('reportEventParams', item.event)
      // #endif
      const { examId } = this.examItem
      if (this.hasStudent && !examId)
        return uni.$u.toast('暂无考试数据')
      let query = { examId: `${examId}`, ...(item.params || {}) }
      // #ifdef H5
      if (isHFSApp()) {
        if (this.isIos || this.isAndroid) {
          const { tab, ...arg } = item.params
          query = { examId: `${examId}&${uni.$u.queryParams(arg, false)}`, ...(item.params || {}) }
        }
      }
      // #endif
      this.$emit('jumpPage', item.type, query)
    },
    chunkArray(arr, chunkSize) {
      return arr.reduce((result, item, index) => {
        if (index % chunkSize === 0) {
          result.push([])
        }
        result[result.length - 1].push(item)
        return result
      }, [])
    },
    getChartData(item) {
      const data = item.score / item.manfen
      return {
        series: [
          {
            name: '成绩',
            data: data || 0,
            color: '#FFBA1D',
          },
        ],
      }
    },
    showLevel() {
      const { scoreLevel = {}, levelConfig } = this.config
      const levels = scoreLevel.levels || levelConfig || []
      const params = {
        title: '应教育政策要求，不显示具体成绩数值，仅显示等级，等级划分的规则如下：',
        tips: '注：实星数量越多代表越优秀',
        columns: [{ name: '等级名称', key: 'name' }, { name: '相对总分比例范围', key: 'range' }],
        tableData: levels.map(({ name, start, end }) => ({ name, range: `${start}%~${end}%` })),
      }
      this.$emit('showPopup', 'tips', params)
    },
    showRemind() {
      this.$emit('showPopup', 'notice', { message: this.remindText })
    },
    showPart() {
      const params = {
        title: '应教育政策要求，不显示具体排名信息仅显示等第。等第划分规则如下：',
        columns: [{ name: '等第', key: 'name' }, { name: '对应排名(水平前%)', key: 'range' }],
        tableData: [
          { name: 'A1', range: '0~1' },
          { name: 'A2', range: '1~3' },
          { name: 'A3', range: '3~6' },
          { name: 'A4', range: '6~10' },
          { name: 'A5', range: '10~15' },
          { name: 'B1', range: '15~21' },
          { name: 'B2', range: '21~28' },
          { name: 'B3', range: '28~36' },
          { name: 'B4', range: '36~43' },
          { name: 'B5', range: '43~50' },
          { name: 'C1', range: '50~56' },
          { name: 'C2', range: '56~64' },
          { name: 'C3', range: '64~71' },
          { name: 'C4', range: '71~78' },
          { name: 'C5', range: '78~84' },
          { name: 'D1', range: '84~89' },
          { name: 'D2', range: '89~93' },
          { name: 'D3', range: '93~96' },
          { name: 'D4', range: '96~98' },
          { name: 'D5', range: '98~99' },
          { name: 'E', range: '99~100' },
        ],
      }
      this.$emit('showPopup', 'tips', params)
    },
    bindStudent() {
      this.$emit('bindStudent')
    },
    jumpAppraise() {
      const { name, time, scoreMedal, progressMedal } = this.examItem
      const { rankType } = this.config
      uni.navigateTo({ url: `/uni_modules/hfs-fe-uni-module/examPages/index/medal${uni.$u.queryParams({ rankType, name, time: uni.$u.timeFormat(time, 'yyyy-mm-dd'), scoreMedal, progressMedal })}` })
      this.$emit('reportEventParams', 'ks_syksxz_Bksxz')
    },
    examChange() {
      this.$emit('examChange', { current: 2, scroll: true })
    },
    async jumpLiankao({ examId, liankaoVisible, name: examName, mode: groupType }) {
      if (this.isMember || +liankaoVisible === 1) {
        return this.$emit('jumpPage', 'liankao', { examId, liankaoVisible, examName, groupType, config: this.configOptions })
      }
      // 获取最新的考试详情
      if (+liankaoVisible !== 1) {
        const examDetail = await this.getExamDetail()
        if (+examDetail.liankaoVisible === 1)
          return this.$emit('jumpPage', 'liankao', { examId, liankaoVisible, examName, groupType, config: this.configOptions })
      }
      const count = await this.getTicketsCount(2013)
      if (count || isHFSApp()) {
        const params = { examId, liankaoVisible, examName, groupType, config: this.configOptions, virtualGoodCode: '2013' }
        let url = `/pages/growth/exchange${uni.$u.queryParams(params)}`
        // #ifdef MP-WEIXIN
        url = `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}`)}`
        // #endif
        return uni.navigateTo({ url })
      }
      // #ifdef MP-WEIXIN
      uni.navigateTo({ url: '/pages/me/member' })
      // #endif
    },
    async getTicketsCount(code) {
      const res = await uni.$http.get(`${this.prefix}/v2/point-mall/sold-good/myTickets`)
      const { tickets = [] } = res.data
      const ticketsItem = tickets.find(item => +item.code === +code) || {}
      return ticketsItem.owningCount || 0
    },
    async getExamDetail() {
      const { examId } = this.examItem
      const res = await uni.$http.get(`${this.examProxy}/v4/exam/home-page`, { examId })
      const { list = [] } = res.data || {}
      return list[0] || {}
    },
    shareWeixin() {
      return this.$emit('shareWeixin')
    },
  },
}
</script>

<style lang="scss" scoped>
.exam-list {
  position: relative;
  &__detail {
    position: relative;
  }
  &__header {
    display: flex;
    justify-content: space-between;
    background: linear-gradient(180deg, #fff3cb 48%, #f6f6f6 89%);
    border-radius: 24rpx 24rpx 0rpx 0rpx;
    padding: 24rpx 34rpx 114rpx 28rpx;
    border-top: 2rpx solid rgba(255, 255, 255, 0.8);
    .info {
      display: flex;
      align-items: center;
      &-title {
        font-size: 28rpx;
        color: #333333;
        margin-right: 12rpx;
      }
      &-replace {
        width: 156rpx;
        height: 46rpx;
        background: linear-gradient(275deg, #ffbd57, #ffa822);
        border-radius: 200rpx;
        font-size: 24rpx;
        font-weight: bold;
        color: #ffffff;
        &__icon {
          width: 18rpx;
          height: 16rpx;
          margin-right: 8rpx;
        }
      }
      &-share {
        position: relative;
        height: 36rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        &__text {
          display: flex;
          align-items: center;
          font-size: 26rpx;
          color: #ffba1d;
          .icon {
            width: 24rpx;
            height: 24rpx;
            margin-left: 8rpx;
          }
        }
      }
    }
  }
  &__content {
    position: relative;
    background: #ffffff;
    border-radius: 32rpx 32rpx 24rpx 24rpx;
    padding: 20rpx 30rpx;
    margin: -90rpx 28rpx 24rpx 28rpx;
    .result {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12rpx;
      z-index: 1;
      overflow: hidden;
      &-chart {
        position: relative;
        height: 168rpx;
        overflow: hidden;
        flex-shrink: 0;
        &__hidden {
          position: absolute;
          left: 0;
          top: 0;
          width: 362rpx;
          height: 190rpx;
          z-index: 10;
        }
        &__chart {
          width: 300rpx;
          height: 300rpx;
          .level {
            font-size: 68rpx;
            color: #333333;
            font-weight: bold;
            display: flex;
            &-icon {
              width: 20rpx;
              height: 20rpx;
              margin-left: -10rpx;
            }
            &-info {
              font-size: 20rpx;
              color: #939393;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              margin-left: 14rpx;
              padding: 15rpx 0;
            }
          }
          .star {
            width: 220rpx;
            position: relative;
            display: flex;
            align-items: center;
            &-progress {
              width: 0;
              position: absolute;
              top: 0;
              left: 0;
              overflow: hidden;
              z-index: 1;
              .bar {
                width: 220rpx;
                display: flex;
                align-items: center;
              }
            }
            &-icon {
              width: 36rpx;
              height: 36rpx;
              margin-right: 8rpx;
              &:last-child {
                margin-right: 0;
              }
            }
          }
        }
        &__info {
          width: 210rpx;
          height: 210rpx;
          position: absolute;
          left: 50%;
          top: 100%;
          transform: translate(-50%, -58%);
          background: linear-gradient(180deg, #fffaf2, #ffffff);
          border-radius: 50%;
          box-shadow:
            0rpx -10rpx 10rpx 0rpx rgba(255, 231, 194, 0.5),
            0rpx 4rpx 6rpx 0rpx rgba(255, 255, 255, 0.7) inset;
          .score {
            height: 60%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            z-index: 1;
            &-sub {
              font-size: 20rpx;
              color: #939393;
            }
            &-all {
              font-size: 20rpx;
              color: #939393;
              .active {
                font-size: 42rpx;
                color: #333333;
                font-weight: bold;
                margin-right: 6rpx;
              }
            }
            &-text {
              font-size: 20rpx;
              color: #939393;
            }
          }
        }
        &.active {
          display: flex;
          align-items: center;
          .active-chart {
            display: flex;
            flex-direction: column;
            align-items: center;
            height: auto;
          }
        }
      }
      &-ranking {
        &__item {
          font-size: 24rpx;
          color: #939393;
          margin-bottom: 10rpx;
          display: flex;
          align-items: center;
          white-space: nowrap;
          .score {
            color: #333333;
            font-size: 24rpx;
            margin-left: 18rpx;
          }
          .icon {
            width: 64rpx;
            height: 64rpx;
            margin-left: 12rpx;
            &.ml-0 {
              margin-left: 0;
            }
            &.vip {
              width: 54rpx;
              height: 24rpx;
            }
          }
          .question {
            width: 20rpx;
            height: 20rpx;
            margin-left: 15rpx;
            align-self: center;
          }
          &:last-child {
            margin-bottom: 0;
          }
        }
        &__end {
          align-items: flex-end;
        }
        .mb-12 {
          margin-bottom: 12rpx;
        }
      }
      &-rank {
        position: absolute;
        right: 0;
        top: -10rpx;
        width: 266rpx;
        height: 190rpx;
      }
    }
    .tips {
      margin-bottom: 16rpx;
      ::v-deep .u-notice-bar {
        padding: 9rpx 24rpx;
      }
    }
    .notice {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 52rpx;
      background: #f6f6f6;
      border-radius: 12rpx;
      margin-bottom: 16rpx;
      &-left {
        margin: 0 10rpx 0 24rpx;
      }
      &-content {
        flex: 1;
        flex-wrap: nowrap;
        overflow: hidden;
        &__text {
          display: flex;
          .message {
            width: fit-content;
            word-break: keep-all;
            white-space: nowrap;
            animation: moveX 20s linear infinite;
            font-size: 20rpx;
            color: #939393;
            &:last-child {
              padding-left: 40rpx;
            }
          }
        }
      }
      &-right {
        padding: 16rpx;
      }
    }
    .hidden {
      width: 100%;
    }
    .subject {
      position: relative;
      padding: 14rpx 0;
      background: #f6f6f6;
      border-radius: 24rpx;
      margin-bottom: 12rpx;
      &-score {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        &__list {
          width: 100%;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          &:last-child {
            .subject-item {
              &::after {
                display: none;
              }
            }
          }
        }
        .subject-tips {
          width: 210rpx;
          display: flex;
          justify-content: center;
          margin-top: 0;
        }
      }
      &-tips {
        display: flex;
        justify-content: center;
        align-items: baseline;
        margin-top: 20rpx;
        &__publish {
          display: flex;
          justify-content: center;
          align-items: baseline;
          .text {
            font-size: 22rpx;
            color: #939393;
            white-space: nowrap;
          }
          .dot {
            width: 6rpx;
            height: 6rpx;
            background-color: #c8c8c8;
            border-radius: 50%;
            margin-left: 6rpx;
            &:nth-of-type(2) {
              animation: jump 1s linear infinite;
            }
            &:nth-of-type(3) {
              animation: jump 1s linear infinite;
              animation-delay: 0.25s;
            }
            &:nth-of-type(4) {
              animation: jump 1s linear infinite;
              animation-delay: 1.5s;
            }
          }
        }
      }
      &-item {
        position: relative;
        width: calc(100% / 3);
        padding: 10rpx 10rpx 10rpx 46rpx;
        &__title {
          width: 100%;
          font-size: 24rpx;
          color: #939393;
          display: flex;
          align-items: center;
          margin-bottom: 4rpx;
          .tag {
            width: 30rpx;
            height: 30rpx;
            margin-left: 6rpx;
            flex-shrink: 0;
          }
        }
        &__score {
          display: flex;
          align-items: baseline;
          font-size: 24rpx;
          color: #939393;
          .active {
            font-size: 28rpx;
            color: #333333;
          }
          .star {
            width: 100rpx;
            position: relative;
            display: flex;
            align-items: center;
            margin-left: 4rpx;
            &-progress {
              width: 0;
              position: absolute;
              top: 0;
              left: 0;
              overflow: hidden;
              z-index: 1;
              background-color: #f6f6f6;
              .bar {
                width: 100rpx;
                display: flex;
                align-items: center;
              }
            }
            &-icon {
              width: 20rpx;
              height: 20rpx;
            }
          }
        }
        &::before {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 60rpx;
          border-left: 1rpx dashed #e7e7e7;
        }
        &::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: 136rpx;
          border-bottom: 1rpx dashed #e7e7e7;
        }
        &:nth-child(3n) {
          &::before {
            display: none;
          }
        }
      }
    }
    .task {
      width: 100%;
      display: flex;
      &-item {
        width: calc(100% / 3);
        height: 58rpx;
        background: #f6f6f6;
        border-radius: 16rpx;
        margin-right: 12rpx;
        &:last-child {
          margin-right: 0;
        }
        &__icon {
          width: 24rpx;
          height: 24rpx;
          margin-right: 6rpx;
        }
        &__title {
          font-size: 24rpx;
          color: #333333;
          margin-right: 16rpx;
        }
      }
    }
    .sign {
      padding: 2rpx 14rpx;
      font-size: 22rpx;
      color: #fcdc8f;
      border: 2rpx solid #fcdc8f;
      border-radius: 8rpx;
      position: absolute;
      left: 8rpx;
      top: 10rpx;
    }
  }
  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 104rpx;
    background: linear-gradient(135deg, #fffae5, rgba(255, 239, 192, 0.8));
    border: 2rpx solid #ffe29f;
    margin: 0 28rpx 24rpx;
    padding: 0 20rpx 0 16rpx;
    border-radius: 20rpx;
    .footer-content {
      display: flex;
      align-items: center;
      position: relative;
      &__book {
        width: 68rpx;
        height: 68rpx;
        margin-right: 10rpx;
      }
      &__text {
        font-size: 28rpx;
        font-weight: bold;
        color: #523b07;
      }
      &__new {
        position: absolute;
        top: -14rpx;
        right: -60rpx;
        width: 76rpx;
        height: 40rpx;
      }
    }
    .footer-btns {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 144rpx;
      height: 56rpx;
      background: #ffffff;
      border-radius: 28rpx;
      font-size: 26rpx;
      font-weight: bold;
      color: #333333;
    }
  }
  &__more {
    position: absolute;
    left: 100%;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 20rpx;
    background: #f6f6f6;
    border-radius: 24rpx;
    .text {
      font-size: 30rpx;
      color: #939393;
      margin-left: 15rpx;
      writing-mode: vertical-lr;
      letter-spacing: 6rpx;
    }
  }
  &__left,
  &__right {
    width: 90rpx;
    height: 90rpx;
    position: absolute;
    top: 416rpx;
    z-index: 10;
  }
  &__left {
    left: -28rpx;
  }
  &__right {
    right: -28rpx;
  }
  &__none {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10rpx auto 32rpx;
    .popup {
      width: 530rpx;
      height: 306rpx;
      padding: 20rpx 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      background: linear-gradient(180deg, #fffae0, #ffffff 30%, #ffffff);
      border-radius: 30rpx;
      box-shadow: 0rpx 4rpx 12rpx 0rpx rgba(0, 0, 0, 0.06);
      &-title {
        width: 100%;
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
        text-align: center;
      }
      &-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30rpx;
        color: #333333;
        text-align: center;
        line-height: 44rpx;
        &__bind {
          margin: 0 30rpx;
          .btn {
            width: 238rpx;
            height: 64rpx;
            font-size: 30rpx;
            color: #ffffff;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 28rpx auto 0;
            background: linear-gradient(225deg, #ffc749, #ffba1d);
            border-radius: 40rpx;
          }
        }
        &__shield {
          margin: 0 64rpx;
        }
      }
    }
  }
}
@supports not (backdrop-filter: none) {
  .result-chart__hidden {
    background: #f9f9f9 !important;
    border-radius: 24rpx;
  }
  .result-rank,
  .exam-list__none {
    background: #fff !important;
  }
}
@keyframes moveX {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
@keyframes jump {
  0% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-6rpx);
  }
  50%,
  100% {
    transform: translateY(0);
  }
}
</style>
