<template>
  <view class="index" :style="{ paddingBottom }">
    <view class="index-content">
      <!-- #ifdef MP-WEIXIN -->
      <u-navbar :title="title" :placeholder="true" bg-color="#fff" left-icon-color="#333" :title-style="{ color: '#333', fontSize: '16px', fontWeight: 'bold' }" @left-click="leftClick" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <u-gap height="8rpx" bg-color="transparent" />
      <!-- #endif -->
      <u-gap height="8rpx" bg-color="transparent" />
      <template v-if="isShow">
        <view v-if="Object.keys(claimExamItem).length" class="claim">
          <view class="claim-header">
            <view class="claim-header__title one-txt-cut">
              {{ $u.timeFormat(claimExamItem.eventTime, 'yyyymmdd') }}{{ claimExamItem.name || '' }}
            </view>
            <view class="claim-header__replace flex-row-center" @click.stop="examChange({ current: 2, scroll: true })">
              <image class="icon" :src="`${examResourceUrl}replace.png`" />切换考试
            </view>
          </view>
          <image class="claim-content" :src="`${examResourceUrl}claim_exam_tips.png`" mode="widthFix" />
          <view class="claim-footer">
            <view class="claim-footer__btn flex-row-center" @click="claimExam">
              立即认领
            </view>
            <view class="claim-footer__question" @click="openCustomerServiceChat">
              有疑问，可<text class="active">
                咨询客服
              </text><u-icon name="arrow-right" :bold="true" color="#FFB100" size="18rpx" />
            </view>
          </view>
        </view>
        <template v-else-if="Object.keys(examItem).length">
          <ExamList ref="examList" :exam-item="examItem" :is-member="isMember" :has-student="hasStudent" :show-guide-step="showGuideStep" :config="hiddenConfig" @exam-change="examChange" @jump-page="jumpPage" @bind-student="bindStudent" @show-popup="showPopup" @share-weixin="shareWeixin" @report-event-params="reportEventParams" />
          <Improve ref="improve" :short-info="shortInfo" :exam-item="examItem" :exam-point="examPoint" :has-student="hasStudent" :config="hiddenConfig" @show-popup="showPopup" @show-express="showExpress" @jump-page="jumpPage" @report-event="reportEvent" @report-event-params="reportEventParams" />
        </template>
        <NoData v-else :has-student="hasStudent" @bind-student="bindStudent" @open-customer-service-chat="openCustomerServiceChat" @report-event-params="reportEventParams" />
      </template>
    </view>
    <view class="index-point" />
    <!-- 提醒弹窗 -->
    <UnpaidPopup v-if="showUnpiadPopup" :degrade-info="degradeInfo" @payment-success="initPage" @close="closeUnpaidPopup" @abandon="closeAllUnpaidPopup" @payment="closeAllUnpaidPopup" />
    <UnpaidRemindPopup v-model:show="showUnpaidRemindPopup" :degrade-info="degradeInfo" @close="goBack" @payment="closeAllUnpaidPopup" />
    <ShortPopup v-if="showShortPopup" :from="shortFrom" :short-info="shortInfo" @close="closeShortPopup" @abandon="showShortPopup = false" @payment="closeAllShortPopup" @go-back="goBack" />
    <ShortRemindPopup v-model:show="showShortRemindPopup" :recommend="recommend" @payment="closeAllShortPopup" />
    <ShortYearExpiredPopup v-if="showShortYearExpiredPopup" :from="shortFrom" :short-info="shortInfo" @close="goBack" />
    <ShortYearExpiringPopup v-if="showShortYearExpiringPopup" :from="shortFrom" :short-info="shortInfo" @close="goBack" />
    <OldUserPopup v-if="upgradeInfo.upgrade" :upgrade-info="upgradeInfo" action="ks_sy" />
    <RenewTips v-if="Object.keys(examItem).length && upgradeInfo.upgrade === false" type="examList" :show-renew-btn="examItem.visible !== 1 && isHiddenBottomVip === false" @update-style="updateStyle" />
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" bg-color="transparent">
      <view v-if="popup.type === 'exam'" class="index-popup">
        <view class="index-popup__title">
          温馨提示
        </view>
        <view class="index-popup__content">
          您有待认领的考试，快去看看吧！
        </view>
        <view class="index-popup__btn">
          <view class="btn close" @click="closePopup">
            取消
          </view>
          <view class="btn confirm" @click="claimExam">
            去认领
          </view>
        </view>
      </view>
      <view v-if="popup.type === 'tips'" class="index-popup tips">
        <view class="index-popup__title">
          提示
        </view>
        <view class="index-popup__content">
          <view>{{ popup.title }}</view>
          <view v-if="popup.tips" class="active">
            {{ popup.tips }}
          </view>
        </view>
        <scroll-view class="index-popup__scroll" scroll-y="true">
          <ITable :columns="popup.columns" :data="popup.tableData" />
        </scroll-view>
        <view class="index-popup__btn">
          <view class="btn confirm" @click="closePopup">
            我知道了
          </view>
        </view>
        <view class="index-popup__close" @click="closePopup">
          <u-icon name="close" color="#979797" bold size="28rpx" />
        </view>
      </view>
      <view v-if="popup.type === 'express'" class="index-popup express">
        <view class="index-popup__content">
          <view class="subtitle">
            考试成绩已发布快速了解孩子本次考试情况
          </view>
          <view v-if="choice" class="analysis">
            <view class="analysis-title">
              {{ hasSelect.select }}、{{ hasSelect.value }}
            </view>
            <view class="analysis-select">
              <view v-for="(item, index) in selectItem" :key="index" class="analysis-select__item" :class="{ active: (!newChoice && item.key === choice) || item.key === newChoice }" @click="setSelection(item.key, true)">
                <text>{{ item.select }}</text>
                <view v-if="newChoice && item.key === choice" class="right">
                  <u-icon name="checkmark" color="#ffffff" size="14rpx" />
                </view>
              </view>
            </view>
            <scroll-view class="analysis-scroll" :scroll-top="popup.scrollTop" scroll-y="true" @scroll="onScroll">
              <view class="analysis-scroll__text">
                <rich-text v-for="(item, index) in diagnoseInfo" :key="index" class="rich" :nodes="item" />
              </view>
              <view v-if="newChoice && !isMember" class="analysis-scroll__mask" @touchmove.stop.prevent>
                <text v-if="showVip">
                  开通会员查看详细解读内容
                </text>
              </view>
            </scroll-view>
            <view v-if="showVip && !isMember" class="analysis-btn vip" @click="jumpVip('ks_kssd_kthy_pay')">
              <image class="icon" src="../static/index/diamond.png" />开通会员
            </view>
            <view v-else class="analysis-btn" @click="closePopup('ks_kssd_Bqr')">
              确认
            </view>
          </view>
          <view v-else class="select">
            <view v-for="(item, index) in diagnoseSelect" :key="index" class="select-item" :class="{ active: item.key === choice }" @click="setSelection(item.key)">
              {{ item.select }}、{{ item.value }}
            </view>
          </view>
        </view>
        <image class="index-popup__bg" src="../static/index/express_bg.png" mode="widthFix" />
        <view class="index-popup__close" @click="closePopup('ks_kssd_Bgb')">
          <u-icon name="close" color="#979797" bold size="28rpx" />
        </view>
      </view>
      <view v-if="popup.type === 'notice'" class="index-popup notice">
        <view class="index-popup__title">
          温馨提示
        </view>
        <view class="index-popup__content">
          {{ popup.message }}
        </view>
        <view class="index-popup__btn">
          <view class="btn confirm" @click="closePopup">
            确认
          </view>
        </view>
      </view>
      <view v-if="popup.type === 'detainment'" class="detainment">
        <view class="detainment-content">
          <view class="minus">您已累计消费金额<text class="minus-count">{{ upgradeInfo.addup }}</text>元</view>
          <view class="reduce">{{ upgradeInfo.upGood.minus }}<text class="reduce-unit">元</text></view>
          <view class="name">现开通{{ upgradeInfo.upGood.name }}</view>
          <view class="price">
            <view class="price-text">仅</view>
            <view class="price-count">{{ upgradeInfo.upGood.cost }}</view>
            <view class="price-text">元</view>
          </view>
          <view class="btns">
            <view class="btns-item btns-abandon" @click="handleAbandon">放弃福利</view>
            <view class="btns-item btns-accept" @click="handleAccept">收下福利</view>
          </view>
        </view>
        <image class="detainment-bg" :src="`${examResourceUrl}detainment_bg.png`" mode="widthFix" />
      </view>
      <!-- 我的班级群 -->
      <view v-if="popup.type === 'classGroup'" class="group">
        <image class="group-bg" :src="`${examResourceUrl}group_bg.png`" mode="widthFix" @click="jumpGroup" />
        <view class="group-close" @click="goBack">
          <u-icon name="close" color="#ffffff" bold size="34rpx" />
        </view>
      </view>
    </u-popup>
    <IGuideStep v-if="showGuideStep" ref="IGuideStep" v-slot="{ props = {} }" :step="step" @done="getGuideStep">
      <view class="index-step" :style="props.ext && props.ext.style" @click="next">
        <image v-if="props.ext && props.ext.image" class="index-step__img" :src="`https://fe-resource.haofenshu.com/exam/images/index/${props.ext.image}`" mode="widthFix" />
        <view class="index-step__next" :style="props.ext && props.ext.nextStyle">
          {{ props.next }}
        </view>
      </view>
    </IGuideStep>
    <AdPopup v-if="!hideMember" ref="adPopup" :ads-list="adsList" key-name="picUrl" />
  </view>
</template>

<script>
import dayjs from 'dayjs'
import iTable from '../../components/i-table.vue'
import IGuideStep from '../../components/i-guideStep.vue'
import AdPopup from '../../components/i-adPopup.vue'
import { examExpress } from '../template/examExpress.js'
import renewTips from '../components/renewTips.vue'
import oldUserPopup from '../components/oldUserPopup.vue'
import unpaidPopup from '../../components/unpaidPopup.vue'
import unpaidRemindPopup from '../../components/unpaidRemindPopup.vue'
import shortPopup from '../../components/shortPopup.vue'
import shortYearExpiredPopup from '../../components/shortYearExpiredPopup.vue'
import shortYearExpiringPopup from '../../components/shortYearExpiringPopup.vue'
import shortRemindPopup from '../../components/shortRemindPopup.vue'
import noData from './components/noData.vue'
import improve from './components/improve.vue'
import examList from './components/examList.vue'
import { isHFSApp, isHFSStudent, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { ExamList: examList, Improve: improve, NoData: noData, ITable: iTable, IGuideStep, AdPopup, RenewTips: renewTips, OldUserPopup: oldUserPopup, UnpaidPopup: unpaidPopup, UnpaidRemindPopup: unpaidRemindPopup, ShortPopup: shortPopup, ShortYearExpiredPopup: shortYearExpiredPopup, ShortYearExpiringPopup: shortYearExpiringPopup, ShortRemindPopup: shortRemindPopup },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/hfs-fe-portal-miniprogram',
      examResourceUrl: 'https://fe-resource.haofenshu.com/exam/images/index/',
      iconMap: require('../rightButton/iconMap.json'),
      options: {},
      config: {},
      userInfo: {},
      examItem: {},
      isShow: false,
      claimExamItem: [],
      title: '考试',
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        type: '',
        title: '',
        tips: '',
        columns: [],
        tableData: [],
        scrollTop: 0,
      },
      choice: '',
      newChoice: '',
      tagMap: {
        1: '期中',
        2: '期末',
        3: '月考',
        4: '竞赛',
        5: '普通',
      },
      selectItem: [
        {
          key: 1,
          select: 'A',
        },
        {
          key: 2,
          select: 'B',
        },
        {
          key: 3,
          select: 'C',
        },
        {
          key: 4,
          select: 'D',
        },
      ],
      diagnoseInfo: {},
      step: {
        name: 'exam_guide_step',
        guideList: [
          {
            el: '.exam-list__content',
            next: '下一步',
            ref: 'examList',
            ext: {
              style: 'width: 554rpx;height: 228rpx;top: calc(100% + 18rpx);left: 102rpx;',
              image: uni.$u.platform === 'weixin' ? 'guide_step_wx_1.png' : 'guide_step_1.png',
              nextStyle: 'top: calc(100% + 38rpx);right: 0',
            },
            padding: 5,
          },
          {
            el: '.improve-content',
            next: '下一步',
            ref: 'improve',
            ext: {
              style: 'width: 580rpx;height: 258rpx;top: -282rpx;left: 88rpx;',
              image: uni.$u.platform === 'weixin' ? 'guide_step_wx_2.png' : 'guide_step_2.png',
              nextStyle: 'top: calc(100% - 66rpx);right: 0',
            },
            padding: 5,
          },
          {
            el: '.info-replace',
            next: uni.$u.platform === 'weixin' ? '完成' : '下一步',
            ref: 'examList',
            ext: {
              style: 'width: 526rpx;height: 276rpx;top: calc(100% + 14rpx);left: -220rpx;',
              image: uni.$u.platform === 'weixin' ? 'guide_step_wx_3.png' : 'guide_step_3.png',
              nextStyle: 'top: calc(100% + 30rpx);right: 0',
            },
            padding: 5,
          },
          // #ifdef H5
          {
            el: '.index-point',
            next: '完成',
            ext: {
              style: 'width: 610rpx;height: 286rpx;top: calc(100% + 30rpx);left: -580rpx;',
              image: 'guide_step_4.png',
              nextStyle: 'top: calc(100% + 30rpx);right: 0',
            },
            padding: 5,
          },
          // #endif
        ],
      },
      /**
       * url 小程序路由
       * target app端路由
       * event 上报事件名
       * webview 是否新开webview
       */
      routeAuth: {
        history: { url: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/historyExams' }, // 考试历史
        record: { url: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/index' }, // 考试档案
        test: { target: 53, event: 'ks_zycy_Bzycy' }, // 作业测验
        report: { url: '/uni_modules/hfs-fe-uni-module/examPages/academicReport/academicReport' }, // 学情报告
        liankao: { url: '/pages/jointReport/jointReport', webview: uni.$u.platform === 'weixin' }, // 联考报告
        analysis: { url: '/improvePages/improve', webview: true }, // 错题订正
        improve: { url: '/uni_modules/hfs-fe-uni-module/examPages/exactImprove/exactImprove' }, // 精准提升
        original: { url: '/pages/paperDetail/index', target: 57, webview: uni.$u.platform === 'weixin' }, // 查看原卷
        sheet: { url: '/pages/paperDetail/index', target: 58, webview: uni.$u.platform === 'weixin' }, // 查看答题卡
        subtitle: { url: '/pages/paperDetail/index', target: 59, webview: uni.$u.platform === 'weixin' }, // 查看小题分
        export: { target: 60 }, // 导出错题
        achievement: { url: '/uni_modules/hfs-fe-uni-module/examPages/academicReport/academicReport' }, // 成绩解读
        papers: { url: '/uni_modules/hfs-fe-uni-module/examPages/academicReport/academicReport' }, // 试卷解读
        summarize: { url: '/uni_modules/hfs-fe-uni-module/examPages/academicReport/academicReport' }, // 失分总结
        arena: { url: '/uni_modules/hfs-fe-uni-module/examPages/examArena/examArena' }, // 考试竞技场
        scoreSummary: { url: '/uni_modules/hfs-fe-uni-module/examPages/academicReport/scoreSummary' }, // 成绩总览
        subjectAnalysis: { url: '/uni_modules/hfs-fe-uni-module/examPages/academicReport/subjectAnalysis' }, // 学科分析
        loseSummary: { url: '/uni_modules/hfs-fe-uni-module/examPages/academicReport/loseSummary' }, // 失分总览
        practice: { url: '/pages/export/index', target: 60, webview: uni.$u.platform === 'weixin' }, // 举一反三练
        interval: { url: '/pages/export/index', target: 60, webview: uni.$u.platform === 'weixin' }, // 错题间隔练
      },
      showGuideStep: false,
      adsList: [], // 广告列表
      examPoint: {},
      renewStyle: {},
      upgradeInfo: {},
      degradeInfo: {},
      showUnpiadPopup: false,
      showUnpaidRemindPopup: false,
      showShortPopup: false,
      showShortRemindPopup: false,
      showShortYearExpiredPopup: false, // 一年过期弹窗
      showShortYearExpiringPopup: false, // 一年临期弹窗
      shortInfo: {},
      recommend: {}, // 消极反馈后最新推荐商品
      shortFrom: 'examIndex',
      negative: 0,
      backType: '',
      isCustomVersion: false, // 是否为定制版本，屏蔽会员功能
      myClassGroup: '', // 我的班级群链接
      classGroupShows: [], // 班级群弹窗显示时间数组
      isHiddenBottomVip: null, // 一年过期会员活动对象不显示底部vip
    }
  },
  computed: {
    showVip() {
      // #ifdef H5
      if (isHFSStudent()) {
        return false
      }
      // #endif
      return true
    },
    isSingle() {
      return this.options.examId
    },
    isMember() {
      return this.userInfo.isMember || false
    },
    beProxy() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/be-proxy'
      // #endif
      return prefix
    },
    hideMember() {
      const { hideMember = false } = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
      return hideMember
    },
    examProxy() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
    hasStudent() {
      return this.userInfo.linkedStudent && (this.userInfo.linkedStudent.isVirtual === 2)
    },
    examId() {
      return this.examItem.examId || ''
    },
    diagnoseSelect() {
      const text = this.userInfo.roleType === 2 ? '孩子' : ''
      return [
        {
          key: 1,
          select: 'A',
          value: `${text}哪科学得最好？`,
        },
        {
          key: 2,
          select: 'B',
          value: `${text}哪科问题最多？`,
        },
        {
          key: 3,
          select: 'C',
          value: `${text.replace('孩子', '孩子的')}优势学科有多好？`,
        },
        {
          key: 4,
          select: 'D',
          value: `${text.replace('孩子', '孩子的')}劣势学科有多弱？`,
        },
      ]
    },
    hasSelect() {
      return this.diagnoseSelect.find(item => (!this.newChoice && item.key === this.choice) || item.key === this.newChoice)
    },
    hiddenConfig() {
      const examConfigs = (this.config.examConfigs || []).find(v => +v.examId === +this.examId) || {}
      return Object.assign({}, this.config, examConfigs)
    },
    adParams() {
      let slotId = ''
      let projectId = ''
      // #ifdef H5
      slotId = isHFSStudent() ? feConfig.studentExamIndexSlotId : feConfig.parentExamIndexSlotId
      projectId = isHFSStudent() ? feConfig.studentProId : feConfig.parentProId
      // #endif
      // #ifdef MP-WEIXIN
      slotId = feConfig.examIndexSlotId
      projectId = feConfig.bannerProjectId
      // #endif
      return { slotId, projectId }
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
    paddingBottom() {
      if (this.showUnpiadPopup)
        return 'calc(424rpx + env(safe-area-inset-bottom))'

      if (this.showShortPopup && (this.memberType === 'month' || this.memberType === 'halfYear' || this.memberType === 'jidu'))
        return 'calc(444rpx + env(safe-area-inset-bottom))'
      if (this.upgradeInfo.upgrade)
        return 'calc(340rpx + env(safe-area-inset-bottom))'
      return this.renewStyle.paddingBottom || '80rpx'
    },
  },
  onShow() {
    this.showRightButton()
    if (this.degradeInfo.id && this.showUnpiadPopup === false) {
      this.closeUnpaidPopup(0)
    }
    this.examPoint = uni.getStorageSync('exam_point') || {}
    const selectExamId = uni.getStorageSync('selectExamId') || ''
    if (selectExamId && selectExamId !== this.options.examId) {
      this.options.examId = selectExamId
      uni.removeStorageSync('selectExamId')
      this.claimExamItem = {}
      this.getHomeInfo()
    }
  },
  onHide() {
    // #ifdef H5
    isHFSApp() && nativeBridge.callHandler('rightButton', JSON.stringify([{ picture: '', text: '', actionName: '', picHeight: 0 }]))
    // #endif
  },
  async onLoad(options) {
    this.options = options
    this.isCustomVersion = options.isCustomVersion === '1' // 获取定制版本参数

    // 存储到本地（布尔值），只有本地没有时才存储
    if (uni.getStorageSync('isCustomVersion') === undefined || uni.getStorageSync('isCustomVersion') === '') {
      uni.setStorageSync('isCustomVersion', this.isCustomVersion)
    }

    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    // 加载班级群频次数据
    this.classGroupShows = uni.getStorageSync(`classGroup_${this.userInfo.userId || 'default'}`) || []
    // #ifdef H5
    !this.isSingle && this.reportEvent('ks_sy_Psy')
    // #endif
    this.initPage()
  },
  // 页面销毁
  onUnload() {
    // #ifdef H5
    if (isHFSApp()) {
      nativeBridge.callHandler('rightButton', JSON.stringify([]))
    }
    // #endif
  },
  methods: {
    async initPage() {
      await this.getShieldConfig()
      if (!this.hasStudent)
        return (this.isShow = true)
      uni.setNavigationBarTitle({ title: this.title })
      await this.getClaimExamBriefInfo()
      if (Object.keys(this.claimExamItem).length)
        return (this.isShow = true)
      await this.getHomeInfo()
      if (!Object.keys(this.examItem).length)
        return (this.isShow = true)
      this.getGuideStep()
      this.showRightButton()
    },
    showRightButton() {
      // #ifdef H5
      if (isHFSApp()) {
        nativeBridge.registerHandler('examIndexJumpExamRecord', () => {
          this.reportEventParams('ks_syksda_Bksda')
          this.jumpPage('record', { shortFrom: 'examIndex' })
        })
        // picHeight: 一倍图的高度
        nativeBridge.callHandler('rightButton', JSON.stringify([{ picture: this.iconMap.examRecord, text: '', actionName: 'examIndexJumpExamRecord()', picHeight: 28 }]))
      }
      // #endif
    },
    async handleAbandon() {
      await uni.$http.post(`${this.beProxy}/v2/payments/upgrade-popup/lost-interest`, {}, { custom: { loading: false, error: false } })
      this.goBack()
    },
    handleAccept() {
      report('small_big', 'ks_sy_tc_qkk')
      this.closePopup()
      this.jumpVip()
    },
    closeAllUnpaidPopup() {
      this.showUnpiadPopup = false
      this.showUnpaidRemindPopup = false
    },
    // 待支付底部弹窗-关闭
    async closeUnpaidPopup(negative) {
      this.showUnpiadPopup = false
      this.negative = negative
      // #ifdef H5
      this.backClick()
      // #endif
    },
    // 获取待支付数据
    async getDegradeTip() {
      this.showUnpaidRemindPopup = false
      const res = await uni.$http.get(`${this.beProxy}/v2/payments/degrade-tip`, { cid: 'ks_sy' })
      this.degradeInfo = res.data || {}
      const { isNew, degradeType, isDegrade } = this.degradeInfo
      this.showUnpiadPopup = (isDegrade || degradeType === 1) && !isNew
      // #ifdef H5
      this.backClick()
      // #endif
    },
    // 小转大弹出框
    async getUpgrade() {
      const res = await uni.$http.get(`${this.beProxy}/v2/payments/upgrade-popup`, { page: 'exam' })
      this.upgradeInfo = res.data || {}
      // #ifdef H5
      this.backClick()
      // #endif
    },
    backClick() {
      // #ifdef H5
      nativeBridge.registerHandler('backClick', () => {
        const page = uni.$u.page()
        if (!this.hideMember && page.includes('examPages/index/index')) {
          return this.leftClick()
        }
        return this.goBack()
      })
      nativeBridge.callHandler('leftButton', 'backClick()')
      // #endif
    },
    async leftClick() {
      this.$refs.adPopup.close()
      // 我的班级群
      if (this.myClassGroup)
        return this.showPopup('classGroup')

      // 待支付
      if (this.negative > 0 && this.negative < 3)
        return this.showUnpaidRemindPopup = true

      // 短期变长期
      if (this.backType === 'short') {
        // 一年过期会员
        if (this.isYearExpired || this.isYearExpiring) {
          const { show = false } = await this.recommendGoods({ from: this.shortFrom })
          if (this.isYearExpired && show && !this.showShortYearExpiredPopup) {
            return this.showShortYearExpiredPopup = true
          }
          if (this.isYearExpiring && show && !this.showShortYearExpiringPopup) {
            return this.showShortYearExpiringPopup = true
          }
          return this.goBack()
        }
        // 月度、季度、半年过期活动活动
        if (this.userInfo.roleType === 2)
          return this.shortExit()
      }

      // 小转大
      const { interest = '', upgrade = false } = this.upgradeInfo
      if (interest === 1 && upgrade)
        return this.showPopup('detainment')
      this.goBack()
    },
    updateStyle(style) {
      this.renewStyle = style
    },
    async getAdvert() {
      const { grade, schoolId: schoolid } = this.studentInfo
      const { userId: userid, userTag } = this.userInfo
      const { projectId, slotId } = this.adParams
      const url = `${feConfig.api.znyx}/api/ads/user/plan/list-v2`
      const params = {
        grade,
        project_id: projectId,
        schoolid,
        slot_id: slotId,
        user_tag: userTag,
        userid,
      }
      const res = await uni.$http.get(url, params, { custom: { loading: false } })
      this.adsList = res.data || []
      this.$refs.adPopup.showPopup(this.adsList)
    },
    // 获取屏蔽配置
    async getShieldConfig() {
      if (this.isSingle)
        return (this.config = uni.getStorageSync('shieldConfig') || {})
      const res = await uni.$http.get(`${this.beProxy}/v2/config/school/hidden-config`, {}, { custom: { error: false } })
      this.config = res.data
      uni.setStorageSync('shieldConfig', res.data)
    },
    // 获取首页信息
    async getHomeInfo() {
      try {
        this.isShow = false
        const res = await uni.$http.get(`${this.examProxy}/v4/exam/home-page`, { examId: this.options.examId })
        const { list = [] } = res.data
        this.examItem = list[0] || {}
        this.options.examId = this.examItem.examId
        this.$refs.examList && this.$refs.examList.init(this.examItem.examId)
        this.isShow = true
        this.teacherReport()
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {
        this.isShow = true
      }
    },
    async teacherReport() {
      const teacherReportList = uni.getStorageSync('teacherReportList') || []
      const { examId = '' } = this.examItem
      if (teacherReportList.includes(examId))
        return
      await uni.$http.post(`${this.beProxy}/v2/students/viewed-exam`, { examId }, { custom: { error: false, loading: false } })
      uni.setStorageSync('teacherReportList', [...teacherReportList, examId])
    },
    // 获取用户最近一场考试
    async getClaimExamBriefInfo() {
      if (this.isSingle)
        return
      try {
        const res = await uni.$http.get(`${this.beProxy}/v2/students/grade-last-exams`, {}, { custom: { error: false } })
        const list = res.data || []
        this.claimExamItem = list[0] || {}
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {}
    },
    // 获取用户对一场考试选择的分析维度
    async getSelection(examId) {
      if (!examId || this.examItem.paperCount <= 1)
        return
      try {
        const res = await uni.$http.get(`${this.examProxy}/v4/exam/score-report/analysis-selection?examId=${examId}`, {}, { custom: { error: false } })
        this.choice = res.data.choice
        await this.getDiagnoseInfo(examId, res.data.choice)
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {}
    },
    // 为一场考试选择分析维度
    async setSelection(choice, change = false) {
      // #ifdef H5
      this.reportEvent('ks_kssd_Bxx')
      // #endif
      const examId = this.examId
      if (!change || (change && this.isMember)) {
        await uni.$http.post(`${this.examProxy}/v4/exam/score-report/analysis-selection`, { choice, examId })
        this.choice = choice
      }
      if (change && !this.isMember) {
        this.newChoice = this.choice === choice ? '' : choice
      }
      this.getDiagnoseInfo(examId, choice)
    },
    async getDiagnoseInfo(examId, choice) {
      const urls = {
        1: `${this.examProxy}/v4/exam/score-report/purchase-guide/good-level`,
        2: `${this.examProxy}/v4/exam/score-report/purchase-guide/bad-level`,
        3: `${this.examProxy}/v4/exam/score-report/purchase-guide/best-subject-shining-point`,
        4: `${this.examProxy}/v4/exam/score-report/purchase-guide/worst-subject-bad-point`,
      }
      const choiceMap = {
        1: 'A',
        2: 'B',
        3: 'C',
        4: 'D',
      }
      this.popup.scrollTop = 0
      const res = await uni.$http.get(`${urls[choice]}?examId=${examId}`, {}, { custom: { loading: false } })
      this.diagnoseInfo = examExpress(this.userInfo.roleType, choiceMap[choice], res.data, this.isMember, this.config)
    },
    async getGuideStep() {
      const step = uni.getStorageSync(this.step.name) || false
      if (this.hasStudent && !this.isSingle && !step)
        return (this.showGuideStep = true)
      this.showGuideStep = false
      // 定制版本屏蔽会员相关功能和广告
      if (this.isCustomVersion) {
        return
      }
      // 一年过期会员活动隐藏底部开通vip
      const { show = false, showed = false } = await this.recommendGoods()
      this.isHiddenBottomVip = show || showed
      // 按优先级处理营销弹窗
      await this.getMarketingPopupStrategies()
      await this.getAdvert()
      !this.isMember && this.$refs.improve.getTicket()
    },
    // 弹窗优先级控制
    async getMarketingPopupStrategies() {
      const strategies = [
        {
          name: 'classGroup', // 班级群挽留 - 最高优先级
          fetch: async () => await this.getGroupConfig(),
          check: () => !!this.myClassGroup,
        },
        {
          name: 'degrade', // 待支付弹窗
          fetch: async () => this.showVip && await this.getDegradeTip(),
          check: () => this.showUnpiadPopup,
        },
        {
          name: 'shortToLong', // 短期变长期弹窗
          fetch: async () => await this.getShortRecommend(),
          check: () => this.showShortPopup,
        },
        {
          name: 'upgrade', // 小转大弹窗
          fetch: async () => await this.getUpgrade(),
          check: () => this.upgradeInfo.upgrade,
        },
      ]

      for (const strategy of strategies) {
        await strategy.fetch()
        if (strategy.check()) {
          break
        }
      }
    },
    jumpGroup() {
      // #ifdef MP-WEIXIN
      uni.reLaunch({ url: this.myClassGroup })
      // #endif
      // #ifdef H5
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 4, target: 'gh_dad0a8e4dc1c', data: { path: this.myClassGroup } }))
      this.goBack()
      // #endif
    },
    // 班级群弹窗频次控制：检查并记录
    manageClassGroupShow(record = false) {
      const now = dayjs()
      const today = now.format('YYYY-MM-DD')
      const weekStart = now.startOf('week').format('YYYY-MM-DD')

      const thisWeekShows = this.classGroupShows.filter(dateStr => dateStr >= weekStart)
      const todayShows = thisWeekShows.filter(dateStr => dateStr.startsWith(today))
      const weekDaysCount = new Set(thisWeekShows.map(dateStr => dateStr.slice(0, 10))).size

      // 检查限制：今日<2次 && 本周已显示天数<3天
      const canShow = todayShows.length < 2 && weekDaysCount < 3

      if (record && canShow) {
        this.classGroupShows = [...thisWeekShows, now.format('YYYY-MM-DD HH:mm:ss')]
        uni.setStorageSync(`classGroup_${this.userInfo.userId || 'default'}`, this.classGroupShows)
      }

      return canShow
    },
    // 获取我的班级群配置
    async getGroupConfig() {
      if (!this.userInfo?.showClassGroup)
        return
      // 检查频次限制
      if (!this.manageClassGroupShow()) {
        this.myClassGroup = ''
        return
      }
      const { grade } = this.studentInfo
      const res = await uni.$http.get(`${this.beProxy}/v2/config/class-group`, { grade }, { custom: { loading: false, error: false } })
      const { myClassGroup } = res.data || {}
      this.myClassGroup = myClassGroup
      // #ifdef H5
      this.backClick()
      // #endif
    },
    // 获取短期变长期数据
    async getShortRecommend() {
      const info = await this.recommendGoods({ from: this.shortFrom })
      this.shortInfo = info || {}
      if (this.isYearExpired || this.isYearExpiring) {
        this.backType = 'short'
        // #ifdef H5
        this.backClick()
        // #endif
        return
      }
      this.showShortPopup = info.show
    },
    // 短期变长期
    closeShortPopup() {
      this.backType = 'short'
      this.showShortPopup = false
      // #ifdef H5
      this.backClick()
      // #endif
    },
    closeAllShortPopup() {
      this.showShortPopup = false
      this.showShortRemindPopup = false
    },
    async shortExit() {
      const info = await this.recommendGoods() // 不传from，只要有短变长数据就返回
      if (!info.show)
        return this.goBack()
      this.recommend = info
      this.showShortRemindPopup = true
    },
    async recommendGoods(params = {}) {
      const res = await uni.$http.get(`${this.beProxy}/v3/strategy/recommend-goods`, { ...params }, { custom: { loading: false, error: false } })
      return res.data || {}
    },
    examChange(params) {
      this.reportEventParams('ks_syqhks_Bqhks')
      this.jumpPage('history', params)
    },
    jumpPage(type, params = {}) {
      if (!this.routeAuth[type])
        return
      if (!this.hasStudent)
        return this.bindStudent()
      const { url, target, event, webview } = this.routeAuth[type]
      // #ifdef MP-WEIXIN
      if (!url)
        return uni.showToast({ title: '请到APP端体验', icon: 'none' })
      if (webview)
        return uni.navigateTo({ url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}${uni.$u.queryParams({ ...params })}`)}` })
      uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      // #endif
      // #ifdef H5
      event && this.reportEvent(event)
      if (isHFSApp()) {
        if (webview)
          return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${location.origin}${url}${uni.$u.queryParams({ ...params })}` }))
        if (target)
          return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target, data: params }))
      }
      uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      // #endif
    },
    bindStudent() {
      // #ifdef MP-WEIXIN
      uni.navigateTo({ url: '/pages/me/bindStudent' })
      // #endif
      // #ifdef H5
      nativeBridge.callHandler('bindStudent', 'bindStudent')
      // #endif
    },
    claimExam() {
      // #ifdef H5
      this.reportEventParams('ks_sy_Brlks')
      // #endif
      uni.navigateTo({ url: '/uni_modules/hfs-fe-uni-module/examPages/exam/claim' })
    },
    jumpVip(eventId) {
      // #ifdef H5
      if (isHFSApp()) {
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, eventId, data: { eventId } }))
      }
      // #endif
      return uni.navigateTo({ url: '/pages/me/member' })
    },
    async showExpress(type, params = {}) {
      this.choice = ''
      this.newChoice = ''
      this.diagnoseInfo = {}
      await this.getSelection(this.examId)
      this.showPopup(type, params)
    },
    showPopup(type, params = {}) {
      if (type === 'classGroup') {
        this.manageClassGroupShow(true)
      }
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    closePopup(event) {
      this.popup.show = false
      // #ifdef H5
      event && this.reportEvent(event)
      // #endif
    },
    onScroll({ detail }) {
      this.popup.scrollTop = detail.scrollTop
    },
    next() {
      this.$refs.IGuideStep.next()
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
    async shareWeixin() {
      // #ifdef H5
      this.reportEvent('ks_sy_Pfx')
      const platform = isHFSStudent() ? 'student' : 'parent'
      const { title, path, imageUrl: picture, content = '一款陪伴孩子学习的好助手' } = await this.getShareWeixinInfo()
      nativeBridge.callHandler('toShare', JSON.stringify({ title, content, picture, url: `${window.location.origin}${path}&platform=${platform}` }))
      // #endif
    },
    async getShareWeixinInfo() {
      const res = await uni.$http.get(`${this.examProxy}/v4/exam/share?examId=${this.examId}`)
      return {
        title: '我正在使用好分数查看成绩报告，邀请你也来查成绩！',
        imageUrl: `${this.resourceUrl}/images/homeShare.jpg`,
        path: `/uni_modules/hfs-fe-uni-module/examPages/index/share${uni.$u.queryParams(res.data)}`,
      }
    },
    openCustomerServiceChat() {
      // #ifdef MP-WEIXIN
      const options = this.isMember ? feConfig.vipCustomer : feConfig.customer
      wx.openCustomerServiceChat(options)
      // #endif
      return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: '12', data: {} }))
    },
    reportEvent(event) {
      // #ifdef H5
      if (!event || typeof event !== 'string')
        return
      nativeBridge.callHandler('UMengEvent', event)
      // #endif
    },
    reportEventParams(event) {
      // #ifdef H5
      if (!event || typeof event !== 'string')
        return
      nativeBridge.callHandler('UmengEventParams', event)
      // #endif
    },
  },
  async onShareAppMessage() {
    return await this.getShareWeixinInfo()
  },
}
</script>

<style lang="scss" scoped>
.index {
  position: relative;
  min-height: 100vh;
  background: #f6f6f6;
  &-point {
    position: absolute;
    top: -20rpx;
    right: 80rpx;
  }
  &-content {
    width: 100%;
    position: relative;
    z-index: 1;
    .claim {
      &-header {
        display: flex;
        align-items: center;
        height: 102rpx;
        background: linear-gradient(180deg, #ffffff 50%, #f6f6f6);
        border-radius: 24rpx 24rpx 0rpx 0rpx;
        backdrop-filter: blur(8rpx);
        padding: 24rpx 28rpx 38rpx 28rpx;
        margin-bottom: 238rpx;
        &__title {
          font-size: 28rpx;
          color: #333333;
          margin-right: 12rpx;
        }
        &__replace {
          width: 156rpx;
          height: 46rpx;
          background: linear-gradient(225deg, #ffbd57, #ffa822);
          border-radius: 200rpx;
          font-size: 24rpx;
          font-weight: 500;
          color: #ffffff;
          .icon {
            width: 18rpx;
            height: 16rpx;
            margin-right: 8rpx;
          }
        }
      }
      &-content {
        margin: 0 auto 94rpx;
        width: 710rpx;
        height: 492rpx;
      }
      &-footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        &__btn {
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
        &__question {
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
  }
  &-bg {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
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
      .index-popup {
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
    &.express {
      padding: 0;
      overflow: hidden;
      .index-popup {
        &__content {
          position: relative;
          z-index: 1;
          padding-top: 110rpx;
          margin-bottom: 0;
          .subtitle {
            font-size: 26rpx;
            color: #3381ff;
            margin-bottom: 26rpx;
          }
          .select {
            padding: 40rpx;
            background: #ffffff;
            border-radius: 20rpx 20rpx 0 0;
            box-shadow: 0rpx -8rpx 32rpx 0rpx rgba(144, 200, 225, 0.1);
            &-item {
              width: 100%;
              height: 92rpx;
              font-size: 28rpx;
              color: #333333;
              display: flex;
              align-items: center;
              padding-left: 32rpx;
              background: #f8f8f8;
              border-radius: 46rpx;
              margin-bottom: 38rpx;
              &.active {
                color: #ffffff;
                font-weight: 500;
                background: #ffba1d;
              }
            }
          }
          .analysis {
            padding: 20rpx 40rpx 36rpx;
            background: #ffffff;
            border-radius: 20rpx 20rpx 0 0;
            box-shadow: 0rpx -8rpx 32rpx 0rpx rgba(144, 200, 225, 0.1);
            &-title {
              width: 100%;
              height: 78rpx;
              font-size: 28rpx;
              color: #333333;
              font-weight: 500;
              display: flex;
              align-items: center;
              padding-left: 32rpx;
              background: #f8f8f8;
              border-radius: 8rpx;
              margin-bottom: 10rpx;
            }
            &-select {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 10rpx;
              &__item {
                position: relative;
                width: calc((100% - 30rpx) / 4);
                height: 56rpx;
                font-size: 28rpx;
                color: #333333;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f8f8f8;
                border-radius: 8rpx;
                &.active {
                  background: #ffc53f;
                  color: #ffffff;
                  font-weight: 500;
                }
                .right {
                  position: absolute;
                  right: 0;
                  top: 0;
                  width: 30rpx;
                  height: 22rpx;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #ffc53f;
                  border-radius: 0rpx 8rpx 0rpx 4rpx;
                }
              }
            }
            &-scroll {
              position: relative;
              width: 100%;
              max-height: 350rpx;
              background: #f8f8f8;
              border-radius: 8rpx;
              margin-bottom: 36rpx;
              &__text {
                color: #333333;
                padding: 20rpx;
                font-size: 24rpx;
                text-align: left;
                line-height: 34rpx;
                .rich {
                  display: inline-flex;
                  margin-bottom: 10rpx;
                }
              }
              &__mask {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                font-size: 28rpx;
                color: #333333;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 8rpx;
                backdrop-filter: blur(6rpx);
              }
            }
            &-btn {
              width: 184rpx;
              height: 72rpx;
              color: #ffffff;
              font-size: 32rpx;
              font-weight: 500;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(225deg, #ffc749, #ffba1d);
              border-radius: 36rpx;
              margin: 0 auto;
              &.vip {
                width: 260rpx;
                height: 76rpx;
                color: #fdd891;
                background: #3f1902;
                border-radius: 48rpx;
                .icon {
                  width: 40rpx;
                  height: 34rpx;
                  margin-right: 10rpx;
                }
              }
            }
          }
        }
        &__bg {
          width: 100%;
          position: absolute !important;
          top: 0;
          left: 0;
        }
      }
    }
    &.notice {
      .index-popup {
        &__content {
          text-align: left;
        }
        &__btn {
          justify-content: center;
        }
      }
    }
  }
  .detainment {
    position: relative;
    &-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 248rpx 70rpx 0;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      .minus {
        font-size: 30rpx;
        color: #7d4e39;
        margin-bottom: 94rpx;
        padding-left: 18rpx;
        align-self: flex-start;
        line-height: 42rpx;
        &-count {
          font-weight: bold;
          color: #ff0000;
        }
      }
      .reduce {
        font-size: 56rpx;
        font-weight: bold;
        color: #ff0000;
        position: relative;
        margin-bottom: 74rpx;
        line-height: 72rpx;
        &-unit {
          position: absolute;
          left: calc(100% + 4rpx);
          top: 28rpx;
          font-size: 24rpx;
          color: #333333;
          line-height: 34rpx;
        }
      }
      .name {
        font-size: 28rpx;
        font-weight: bold;
        color: #5d230c;
        line-height: 40rpx;
      }
      .price {
        display: flex;
        margin-bottom: 48rpx;
        &-count {
          font-size: 72rpx;
          font-weight: bold;
          color: #ff381b;
          margin: 0 4rpx;
          line-height: 92rpx;
        }
        &-text {
          font-size: 28rpx;
          color: #5d3a0c;
          margin-top: 36rpx;
        }
      }
      .btns {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;
        &-item {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 224rpx;
          height: 80rpx;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 56rpx;
          font-size: 30rpx;
          font-weight: bold;
          color: #ffffff;
        }
        &-accept {
          background: rgba(255, 218, 38, 1);
          color: #333333;
        }
      }
    }
    &-bg {
      width: 610rpx;
      height: 810rpx;
    }
  }
  .group {
    position: relative;
    &-bg {
      width: 500rpx;
    }
    &-close {
      position: absolute;
      top: -28rpx;
      right: 48rpx;
    }
  }
  &-step {
    position: absolute;
    &__img {
      width: 100%;
    }
    &__next {
      position: absolute;
      width: 170rpx;
      height: 66rpx;
      font-size: 28rpx;
      color: #ffffff;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(315deg, #ff6600, #ffa400);
      border-radius: 38rpx;
    }
  }
}
@supports not (backdrop-filter: none) {
  .analysis-scroll__mask {
    background: #e4e4e4 !important;
  }
}
</style>
