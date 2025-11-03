<template>
  <view class="record" :style="{ paddingBottom: renewStyle.paddingBottom }">
    <view v-if="hasStudent">
      <!-- #ifdef MP-WEIXIN -->
      <u-navbar title="考试档案" :placeholder="true" bg-color="#fff" left-icon-color="#333" :title-style="{ color: '#333', fontSize: '16px', fontWeight: 'bold' }" @left-click="leftClick" />
      <!-- #endif -->
      <!-- 顶部 -->
      <view class="record-head">
        <image class="record-head__icon" :src="`${resourceUrl}icon_head.png`" mode="widthFix" />
        <view class="record-head__info">
          <view class="info-persion">
            {{ studentInfo.studentName }}<text class="info-persion__name">
              {{ studentInfo.grade }}{{ studentInfo.className }}
            </text>
          </view>
          <view class="info-school">
            <image class="info-school__icon" :src="`${resourceUrl}icon_school.png`" mode="widthFix" />
            <view class="info-school__name">
              {{ studentInfo.schoolName || '暂无' }}
            </view>
          </view>
        </view>
        <view class="record-head__list">
          <view v-for="(item, index) in messageList" :key="index" class="item">
            <view class="value" :style="{ color: item.color || '#333333', fontSize: item.fontSize || '40rpx' }">
              {{ item.value }}<text v-if="item.value" class="unit">
                {{ item.unit }}
              </text>
            </view>
            <view class="label">
              {{ item.label }}
            </view>
          </view>
        </view>
      </view>
      <!-- 金刚区 -->
      <view class="record-list">
        <view v-for="(item, index) in typeList" :key="index" class="record-list__item" @click="typeClick(item)">
          <image class="icon" :src="resourceUrl + item.icon" mode="widthFix" />
          <view class="label">
            {{ item.label }}
          </view>
        </view>
      </view>
      <!-- 考试pk -->
      <view id="point0" class="record-pk">
        <view class="record-pk__header">
          <view class="header-left">
            <view class="header-left__line" />
            <view class="header-left__title">
              考试PK
            </view>
          </view>
          <view v-if="pkExams.length === 2" class="header-right" @click="selectExam(true)">
            <view class="header-right__text">
              重新PK
            </view>
            <image class="header-right__icon" :src="`${resourceUrl}refresh.png`" mode="widthFix" />
          </view>
        </view>
        <view class="record-pk__content">
          <view v-if="pkExams.length === 0" class="zero common" @click="selectExam">
            <view class="left">
              <view class="left-text">
                对比考试数据，知进退
              </view>
            </view>
            <image class="middle" :src="`${resourceUrl}flat.png`" mode="widthFix" />
            <view class="right flex-row-center">
              <view class="right-button">
                开始PK
              </view>
            </view>
          </view>
          <view v-if="pkExams.length === 1" class="one common">
            <view class="left">
              <view class="left-time">
                {{ $u.timeFormat(preExam.eventTime, 'yyyy-mm-dd') }}
              </view>
              <view class="left-name">
                {{ `${preExam.grade}${preExam.type}考试` }}<text v-if="preExam.examId === lastExam.examId" class="left-name__tag">
                  最新
                </text>
              </view>
            </view>
            <image class="middle" :src="`${resourceUrl}flat.png`" mode="widthFix" />
            <view class="right flex-row-center" @click="selectExam">
              <view class="right-button flex-row-center">
                <image class="right-button__icon" :src="`${resourceUrl}add.png`" mode="widthFix" />
                <view class="right-button__text">
                  选择考试
                </view>
              </view>
            </view>
          </view>
          <view v-if="pkExams.length === 2" class="two common" @click="selectExam(false)">
            <view class="left" :class="{ lose: pkResult === 'lose', win: pkResult === 'win', ping: pkResult === 'ping' }">
              <view class="left-time">
                {{ $u.timeFormat(preExam.eventTime, 'yyyy-mm-dd') }}
              </view>
              <view class="left-name">
                {{ `${preExam.grade}${preExam.type}考试` }}<text v-if="preExam.examId === lastExam.examId" class="left-name__tag">
                  最新
                </text>
              </view>
            </view>
            <image class="middle" :src="`${resourceUrl}${pkResult}.png`" mode="widthFix" />
            <view class="right">
              <view class="right-time">
                {{ $u.timeFormat(nextExam.eventTime, 'yyyy-mm-dd') }}
              </view>
              <view class="right-name">
                <text v-if="nextExam.examId === lastExam.examId" class="right-name__tag">
                  最新
                </text>{{ `${nextExam.grade}${nextExam.type}考试` }}
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 成绩趋势 -->
      <view class="record-trend">
        <view class="record-trend__header">
          <view class="header-left">
            <view class="header-left__line" />
            <view class="header-left__title">
              成绩趋势
            </view>
          </view>
          <view class="header-right" @click="typeClick({ type: 'trend', shortFrom: options.shortFrom || '' })">
            <view class="header-right__text">
              更多
            </view>
            <u-icon name="arrow-right" size="24rpx" color="#939393" />
          </view>
        </view>
        <view class="record-trend__chart">
          <view v-if="!isExamMember" class="mask" :style="[maskStyle]">
            <image class="mask-pic" :src="`${resourceUrl}home_score_hidden.png`" />
          </view>
          <template v-if="scoreChartData.categories && scoreChartData.categories.length">
            <qiun-data-charts type="area" :canvas2d="true" :ontouch="isExamMember" :in-scroll-view="true" :page-scroll-top="scrollTop" :tooltip-show="false" :opts="detaultOpts" :chart-data="scoreChartData" @get-index="showToolTip" @complete="mixComplete" />
          </template>
        </view>
      </view>
      <!-- 薄弱知识点、学科均衡 -->
      <view class="record-footer">
        <view class="record-footer__item" @click="typeClick({ type: 'knowledge', shortFrom: options.shortFrom || '', event: 'ksda_brzsd_Bbrzsd' })">
          <view class="item-title">
            薄弱知识点
          </view>
          <view class="item-sub">
            {{ `共${knowledgeListLength}个知识点` }}
          </view>
          <view class="item-content">
            <view v-if="knowledgeList.length" class="item-content__knowledge">
              <view v-for="(item, index) in knowledges" :key="index" class="knowledge-item">
                <view class="knowledge-item__title one-txt-cut">
                  {{ item.name }}
                </view>
                <view class="knowledge-item__num">
                  错题{{ item.ques_num }}
                </view>
              </view>
            </view>
            <view v-else class="item-content__empty flex-row-center">
              <image class="image" :src="`${resourceUrl}knowledge_empty.png`" mode="widthFix" />
            </view>
            <view class="item-content__btn flex-row-center">
              <view class="btn-text">
                立即查看
              </view>
              <u-icon name="arrow-right" size="30rpx" color="#FFB100" />
            </view>
          </view>
        </view>
        <view class="record-footer__item subject" @click="typeClick({ type: 'express', shortFrom: options.shortFrom || '', event: 'ksda_xkbx_Bxkbx' })">
          <view class="item-title">
            学科均衡
          </view>
          <view class="item-sub">
            看看你的学科均衡
          </view>
          <view class="item-content">
            <view class="item-content__knowledge">
              <image class="radar" :src="`${resourceUrl}radar.png`" mode="widthFix" />
            </view>
            <view class="item-content__btn flex-row-center">
              <view class="btn-text">
                立即查看
              </view>
              <u-icon name="arrow-right" size="30rpx" color="#FFB100" />
            </view>
          </view>
        </view>
      </view>
      <!-- 开通会员 -->
      <ShortYearExpiredPopup v-if="showShortYearExpiredPopup" :from="options.shortFrom || shortFrom" :short-info="shortInfo" @close="options.shortFrom ? showShortYearExpiredPopup = false : goBack()" />
      <ShortYearExpiringPopup v-if="showShortYearExpiringPopup" :from="shortFrom" :short-info="shortInfo" @close="goBack" />
      <RenewTips type="examRecord" :show-renew-btn="config.parentPay === 2 && !isExamMember && isHiddenBottomVip === false" @update-style="updateStyle" />
    </view>
    <view v-else>
      <NoData @bind-student="bindStudent" @open-customer-service-chat="openCustomerServiceChat" @report-event-params="reportEventParams" />
    </view>
  </view>
</template>

<script>
import renewTips from '../components/renewTips.vue'
import ShortYearExpiredPopup from '../../components/shortYearExpiredPopup.vue'
import ShortYearExpiringPopup from '../../components/shortYearExpiringPopup.vue'
import NoData from '../index/components/noData.vue'
import record from './record.js'
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js'
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { RenewTips: renewTips, ShortYearExpiredPopup, ShortYearExpiringPopup, NoData },
  mixins: [record],
  data() {
    return {
      detail: {},
      renewStyle: {},
      popup: {
        show: false,
      },
      typeList: [
        { label: '历次考试', type: 'history', icon: 'icon_history.png', event: 'ksda_lcks_Blcks' },
        { label: '成绩趋势', type: 'trend', icon: 'icon_trend.png', event: 'ksda_cjqs_Bcjqs' },
        { label: '学科表现', type: 'express', icon: 'icon_express.png', event: 'ksda_xkbx_Bxkbx' },
        { label: '薄弱知识点', type: 'knowledge', icon: 'icon_knowledge.png', event: 'ksda_brzsd_Bbrzsd' },
      ],
      knowledgeList: [],
      knowledges: [],
      pkExams: [],
      lastExam: {}, // 最新一次考试
      scoreChartData: {},
      maskStyle: {}, // 图表遮罩样式
      shortInfo: {},
      shortFrom: 'examRecord',
      showShortYearExpiredPopup: false, // 一年过期弹窗
      showShortYearExpiringPopup: false, // 一年临期弹窗
      isHiddenBottomVip: null, // 一年过期会员活动对象不显示底部vip
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
    }
  },
  computed: {
    hasStudent() {
      const userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
      return userInfo.linkedStudent && (userInfo.linkedStudent.isVirtual === 2)
    },
    preExam() {
      return this.pkExams.length ? this.pkExams[0] : {}
    },
    hideMember() {
      const { hideMember = false } = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
      return hideMember
    },
    nextExam() {
      return this.pkExams.length > 1 ? this.pkExams[1] : {}
    },
    pkResult() {
      const { win: preWin } = this.preExam
      const { win: nextWin } = this.nextExam
      return preWin === nextWin ? 'ping' : preWin > nextWin ? 'win' : 'lose'
    },
    knowledgeListLength() {
      if (!this.isMember)
        return '**'
      return this.knowledgeList.length || 0
    },
    messageList() {
      const { explain = {}, rankType, examCount = '', scoreMax = '', classRankMax = '', gradeRankMax = '' } = this.detail || {}
      const typeMap = { 2: '排名', 3: '击败率', 4: '排名', 5: '排名', 6: '击败率' }
      const name = typeMap[rankType] || '排名'
      return [
        { label: '考试总次数', key: 'examCount', value: examCount, unit: '次', fontSize: '' },
        { label: '最高分数', key: 'scoreMax', value: scoreMax, unit: '', fontSize: '' },
        { label: `班级最高${name}`, key: 'classRankMax', value: classRankMax, unit: '', fontSize: '' },
        { label: `年级最高${name}`, key: 'gradeRankMax', value: gradeRankMax, unit: '', fontSize: '' },
        { label: '优势学科', key: 'better', value: explain.better || '', color: '#10CB17', unit: '', fontSize: '32rpx' },
        { label: '劣势学科', key: 'weaker', value: explain.weaker || '', color: '#FF3D07', unit: '', fontSize: '32rpx' },
      ]
    },
    recommendation() {
      return this.shortInfo?.recommendation || {}
    },
    memberType() {
      return this.recommendation?.memberType || ''
    },
    stage() {
      return this.recommendation?.stage || ''
    },
    isYearExpired() {
      return this.memberType === 'year' && this.stage === 'expired'
    },
    isYearExpiring() {
      return this.memberType === 'year' && this.stage.startsWith('expiring')
    },
  },
  async onLoad(options) {
    await this.getExamArchives()
    this.getknowledges()
    this.getShortRecommend()
    options.point && uni.createSelectorQuery().in(this).select(`#${options.point}`).boundingClientRect((data) => {
      uni.pageScrollTo({ scrollTop: data.top, duration: 0 })
    }).exec()
  },
  onShow() {
    const pkRecords = uni.getStorageSync('exam_pk_records') || {}
    const list = pkRecords[this.studentInfo.studentId] || []
    const { exams = [] } = list[0] || {}
    if (exams.length)
      this.pkExams = exams
  },
  methods: {
    updateStyle(style) {
      this.renewStyle = style
    },
    selectExam(isPk) {
      const pkExamsLength = this.pkExams.length
      this.reportEventParams('ksda_cjpk_Bcjpk')
      if (pkExamsLength === 2) {
        uni.navigateTo({
          url: `/uni_modules/hfs-fe-uni-module/examPages/examRecord/examPk?pk=${isPk}`,
          success: (res) => {
            res.eventChannel.emit('examIds', [])
          },
        })
        return
      };
      uni.navigateTo({
        url: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/historyExams?mode=2',
        success: (res) => {
          res.eventChannel.emit('checkExams', { exams: [...this.pkExams] })
        },
      })
    },

    bindStudent() {
      // #ifdef MP-WEIXIN
      uni.navigateTo({ url: '/pages/me/bindStudent' })
      // #endif
      // #ifdef H5
      nativeBridge.callHandler('bindStudent', 'bindStudent')
      // #endif
    },
    openCustomerServiceChat() {
      // #ifdef MP-WEIXIN
      const options = this.isMember ? feConfig.vipCustomer : feConfig.customer
      wx.openCustomerServiceChat(options)
      // #endif
      return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: '12', data: {} }))
    },
    typeClick(item, params = {}) {
      const dataMap = {
        history: { url: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/historyExams', options: {} }, // 历次考试
        trend: { url: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/scoreTrend', options: { shortFrom: this.options.shortFrom || '' } }, // 成绩趋势
        express: { url: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/subjectExpress', options: { shortFrom: this.options.shortFrom || '' } }, // 学科趋势
        knowledge: { url: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/knowledge', options: { shortFrom: this.options.shortFrom || '' } }, // 薄弱知识点
      }
      const { url = '', options = {} } = dataMap[item.type] || {}
      item.event && this.reportEventParams(item.event)
      uni.navigateTo({ url: `${url}${uni.$u.queryParams({ ...options, ...params })}` })
    },

    setPkData() {
      const { list = [] } = this.detail
      this.lastExam = list[list.length - 1]
      if (this.pkExams.length || !list.length)
        return
      const diffTime = (new Date().getTime() - new Date(this.lastExam.eventTime).getTime()) / 1000 / 60 / 60 / 24
      if (diffTime <= 7)
        this.pkExams.push({ ...this.lastExam })
    },
    setChartData() {
      let { list = [] } = this.detail
      list = list.filter(item => item.rscore !== -1)
      const categories = list.map(item => this.formatTimestamp(item.eventTime))
      const labelText = list.map(item => item.type)
      const data = list.map(item => item.rscore)
      const manfenData = list.map(item => item.manfen)
      this.detaultOpts.yAxis.data[0].max = Math.max(...manfenData)
      this.scoreChartData = {
        categories,
        series: [
          { name: '', labelText, data },
        ],
      }
    },
    mixComplete(e) {
      const { area, pix } = e.opts
      const [top, right, bottom, left] = area.map(v => `${v / pix}px`)
      this.maskStyle = { top, right, bottom, left }
      if (this.isExamMember) {
        const { list = [] } = this.detail
        const index = list.length - 1
        const calPoints = e.opts.chartData.calPoints[0] || []
        e.currentIndex = { index }
        e.event = calPoints[e.currentIndex.index]
        this.showToolTip(e)
      }
    },
    showToolTip(e) {
      // #ifdef MP-WEIXIN
      e.event.y -= this.scrollTop
      // #endif
      const index = e.currentIndex.index
      const textList = []
      if (index > -1) {
        const { list = [] } = this.detail
        const { type, eventTime, score, manfen, paperCount } = list[index]
        textList.push(...[
          {
            text: `${type}考试${uni.$u.timeFormat(eventTime, 'yyyy.mm.dd')}`,
          },
          {
            text: `成绩：${score}/${manfen}`,
          },
          {
            text: `科目：${paperCount}科`,
          },
        ])
      }
      uCharts.instance[e.id].showToolTip(
        { changedTouches: [e.event] },
        { index, textList },
      )
    },
    async getExamArchives() {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/archives`, { grade: this.grade || '' })
      this.detail = res.data
      this.setChartData()
      this.setPkData()
    },
    async getknowledges() {
      if (!this.isMember) {
        this.knowledges = []
        this.knowledgeList = []
        return
      }
      const res = await uni.$http.get(`${this.beProxy}/v2/practices/weak-knowledges`)
      const { data = [] } = res
      const allknowledges = data.reduce((pre, cur) => {
        return pre.concat(cur.knowledges)
      }, [])
      this.knowledgeList = allknowledges
      this.knowledges = allknowledges.sort(() => Math.random() - 0.5).slice(0, 3)
    },
    reportEventParams(event) {
      // #ifdef H5
      if (!event || typeof event !== 'string')
        return
      nativeBridge.callHandler('UmengEventParams', event)
      // #endif
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    },
    async getShortRecommend() {
      this.shortInfo = await this.recommendGoods({ from: this.options.shortFrom || this.shortFrom })
      const { show = false, showed = false } = this.shortInfo
      this.isHiddenBottomVip = show || showed
      if (this.isYearExpired && this.shortInfo.show && this.options.shortFrom === 'examIndex') {
        this.showShortYearExpiredPopup = true
        return
      }
      // #ifdef H5
      this.backClick()
      // #endif
    },
    async recommendGoods(params = {}) {
      const res = await uni.$http.get(`${this.beProxy}/v3/strategy/recommend-goods`, { ...params }, { custom: { loading: false, error: false } })
      return res.data || {}
    },
    backClick() {
      // #ifdef H5
      nativeBridge.registerHandler('backClick', () => {
        const page = uni.$u.page()
        if (!this.hideMember && page.includes('examPages/examRecord/index')) {
          return this.leftClick()
        }
        return this.goBack()
      })
      nativeBridge.callHandler('leftButton', 'backClick()')
      // #endif
    },
    async leftClick() {
      const { show = false } = await this.recommendGoods({ from: this.options.shortFrom || this.shortFrom })
      if (this.isYearExpired && show && !this.showShortYearExpiredPopup && !this.options.shortFrom)
        return this.showShortYearExpiredPopup = true
      if (this.isYearExpiring && show && !this.showShortYearExpiringPopup) {
        return this.showShortYearExpiringPopup = true
      }
      this.goBack()
    },
    goBack() {
      if (getCurrentPages().length > 1)
        return uni.navigateBack()
      // #ifdef H5
      nativeBridge.callHandler('goBack', 'goBack')
      // #endif
      // #ifdef MP-WEIXIN
      return uni.navigateBack()
      // #endif
    },
  },
}
</script>

<style lang="scss" scoped>
.record {
  min-height: 100vh;
  background-color: #f6f6f6;
  padding: 24rpx 28rpx 80rpx;
  &-head {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(210deg, #ffd24e, #ffb73e 57%);
    border-radius: 24rpx;
    padding: 14rpx 4rpx 4rpx;
    margin-bottom: 24rpx;
    &__icon {
      width: 296rpx;
      height: 296rpx;
      position: absolute;
      top: 0;
      right: 0;
    }
    &__info {
      display: flex;
      justify-content: space-between;
      padding: 0 24rpx;
      margin-bottom: 10rpx;
      .info-persion {
        font-size: 28rpx;
        color: #724900;
        &__name {
          opacity: 0.7;
          font-size: 24rpx;
          color: #724900;
          margin-left: 12rpx;
        }
      }
      .info-school {
        display: flex;
        align-items: center;
        &__icon {
          width: 24rpx;
          height: 24rpx;
          margin-right: 8rpx;
        }
        &__name {
          opacity: 0.7;
          font-size: 24rpx;
          color: #724900;
        }
      }
    }
    &__list {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 17rpx 40rpx 4rpx;
      flex-wrap: wrap;
      background: #ffffff;
      border-radius: 20rpx;
      .item {
        width: calc(100% / 3);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        margin-bottom: 16rpx;
        .value {
          font-size: 40rpx;
          font-weight: bold;
          height: 52rpx;
          width: 100%;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0 10rpx;
          .unit {
            font-size: 22rpx;
            color: #333333;
            margin-left: 2rpx;
          }
        }
        .label {
          font-size: 26rpx;
          color: #939393;
          height: 36rpx;
        }
      }
    }
  }
  &-list {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18rpx;
    margin-bottom: 20rpx;
    &__item {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      .icon {
        width: 76rpx;
        height: 76rpx;
      }
      .label {
        font-size: 24rpx;
        color: #333333;
      }
    }
  }
  &-pk {
    background: #ffffff;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    padding: 24rpx 28rpx;
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24rpx;
      .header-right {
        display: flex;
        align-items: center;
        background: #fff7e5;
        border-radius: 24rpx;
        padding: 6rpx 16rpx;
        &__text {
          font-size: 26rpx;
          color: #ffb100;
        }
        &__icon {
          width: 24rpx;
          height: 24rpx;
          margin-left: 6rpx;
        }
      }
    }
    &__content {
      .common {
        display: flex;
        justify-content: space-between;
        height: 118rpx;
        .left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: calc(50% - 42rpx);
          height: 100%;
          background: #f4f6ff;
          border-radius: 16rpx 0 0 16rpx;
          padding-left: 20rpx;
          z-index: 2;
          &-time {
            font-size: 24rpx;
            color: rgba(65, 106, 255, 0.7);
          }
          &-name {
            display: flex;
            align-items: center;
            font-size: 28rpx;
            color: #416aff;
            font-weight: bold;
            white-space: nowrap;
            &__tag {
              background: rgba(65, 106, 255, 0.1);
              border-radius: 8rpx;
              padding: 0 6rpx;
              margin-left: 6rpx;
              font-size: 22rpx;
              color: #416aff;
              white-space: nowrap;
            }
          }
        }
        .middle {
          flex-shrink: 0;
        }
        .right {
          position: relative;
          height: 100%;
          background: #fffcf3;
          color: #ecab00;
          border-radius: 0 16rpx 16rpx 0;
          flex: 1;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          padding-right: 20rpx;
          &-button {
            border: 2rpx solid #ecab00;
            border-radius: 38rpx;
            color: #ecab00;
          }
          &-time {
            font-size: 24rpx;
            color: rgba(236, 171, 0, 10.7);
          }
          &-name {
            font-size: 28rpx;
            color: #ecab00;
            font-weight: bold;
            white-space: nowrap;
            &__tag {
              background: rgba(255, 67, 67, 0.1);
              border-radius: 8rpx;
              padding: 0 6rpx;
              margin-right: 6rpx;
              font-size: 22rpx;
              color: #ecab00;
              white-space: nowrap;
            }
          }
        }
      }
      .zero {
        .left {
          position: relative;
          &-text {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            left: 14rpx;
            white-space: nowrap;
            z-index: 1;
            font-size: 28rpx;
            color: #416aff;
            font-weight: bold;
          }
        }
        .middle {
          width: 84rpx;
          height: 118rpx;
        }
        .right {
          &-button {
            font-size: 30rpx;
            font-weight: bold;
            padding: 10rpx 49rpx;
          }
        }
      }
      .one {
        .middle {
          width: 84rpx;
          height: 118rpx;
        }
        .right {
          &-button {
            padding: 10rpx 27rpx 10rpx 22rpx;
            &__icon {
              width: 26rpx;
              height: 26rpx;
              margin-right: 10rpx;
            }
            &__text {
              font-size: 30rpx;
              font-weight: bold;
            }
          }
        }
      }
      .two {
        position: relative;
        .left {
          width: 41%;
        }
        .middle {
          width: 190rpx;
          height: 118rpx;
        }
        .right {
          width: 31%;
        }
        .win {
          width: 41%;
        }
        .lose {
          width: 31%;
        }
        .ping {
          width: calc(50% - 95rpx);
        }
      }
    }
  }
  &-trend {
    width: 694rpx;
    height: 368rpx;
    background: #ffffff;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    padding: 24rpx 28rpx 28rpx 28rpx;
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .header-right {
        display: flex;
        align-items: center;
        &__text {
          margin-right: 4rpx;
          font-size: 28rpx;
          color: #939393;
        }
      }
    }
    &__chart {
      position: relative;
      height: 260rpx;
      .mask {
        position: absolute;
        z-index: 100;
        background-color: #ffffff;
        &-pic {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  &-footer {
    display: flex;
    justify-content: space-between;
    &__item {
      width: calc(50% - 9rpx);
      background: #ffffff;
      border-radius: 24rpx;
      padding: 20rpx 12rpx 12rpx 12rpx;
      .item-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 4rpx;
        padding-left: 14rpx;
      }
      .item-sub {
        font-size: 26rpx;
        color: #939393;
        padding-left: 14rpx;
      }
      .item-content {
        background: linear-gradient(180deg, #ffffff, #fff9f0);
        border-radius: 20rpx;
        padding: 0 18rpx 22rpx;
        &__knowledge {
          height: 204rpx;
          padding-top: 32rpx;
          .knowledge-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8rpx;
            &:last-child {
              margin-bottom: 0;
            }
            &__title {
              font-size: 26rpx;
              color: #333333;
            }
            &__num {
              font-size: 22rpx;
              color: #939393;
              flex-shrink: 0;
              margin-left: 34rpx;
            }
          }
          .radar {
            width: 168rpx;
            height: 162rpx;
          }
        }
        &__empty {
          height: 204rpx;
          padding-top: 20rpx;
          align-items: flex-start;
          .image {
            width: 162rpx;
            height: 166rpx;
          }
        }
        &__btn {
          .btn-text {
            font-size: 26rpx;
            font-weight: bold;
            color: #ffb100;
            margin-right: 4rpx;
          }
        }
      }
    }
    .subject {
      .item-content {
        padding: 0 74rpx 22rpx;
        &__knowledge {
          padding-top: 16rpx;
        }
      }
    }
  }
  .header-left {
    display: flex;
    align-items: center;
    &__line {
      width: 8rpx;
      height: 32rpx;
      background: #ffba1d;
      border-radius: 4rpx;
      margin-right: 10rpx;
    }
    &__title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
    }
  }
}
</style>
