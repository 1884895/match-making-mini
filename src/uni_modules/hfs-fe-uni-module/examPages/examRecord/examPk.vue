<template>
  <view class="pk">
    <view class="head">
      <image class="head-bg" :src="`${resourceUrl}head_bg.png`" mode="widthFix" />
      <view class="head-list">
        <view v-for="item in [0, 1]" :key="item" class="head-list__item" :class="{ right: item === 1, empty: !exams[item] }">
          <view v-if="item === 0" class="blur" />
          <template v-if="exams[item]">
            <view v-if="showTag(exams[item].eventTime)" class="tag">
              <view class="tag-text">
                最新
              </view>
            </view>
            <view class="name">
              {{ getExamTime(item) + getExamName(item) }}
            </view>
            <view class="info">
              <view class="info-item">
                总分：{{ exams[item].manfen }}分
              </view>
              <view class="info-item">
                学科：{{ exams[item].paperCount }}科
              </view>
            </view>
            <view class="icon">
              <u-icon label="切换考试" name="arrow-down" :label-color="examEnum[item].color" :color="examEnum[item].color" label-size="24rpx" size="24rpx" label-pos="left" @click="selectExam(item === 0 ? 1 : 0)" />
            </view>
          </template>
          <view v-else class="select" @click="selectExam(item === 0 ? 1 : 0)">
            <u-icon label="选择考试" name="plus" bold :label-color="examEnum[item].color" :color="examEnum[item].color" label-size="30rpx" size="28rpx" />
          </view>
        </view>
      </view>
      <view class="head-operate">
        <view class="head-operate__remain">
          {{ getRemainName }}
        </view>
        <view class="head-operate__btn" @click="btnPk">
          <image class="btn-bg" :src="`${resourceUrl}head_btn_bg.png`" mode="widthFix" />
          <image v-if="!isExamMember && showVip" class="btn-vip" :src="`${resourceUrl}icon_white_no_vip.png`" mode="widthFix" />
          <view class="btn-text">
            {{ isPk ? '重新' : '开始' }}<view class="btn-text__pk">
              PK
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="compare">
      <view v-if="isExamMember && exams.length > 0" class="compare-content">
        <view class="compare-content__exam" :class="{ noTag: !(winIndex === 0 || winIndex === 1) }">
          <image class="exam-bg" :src="resourceUrl + examCompareBg" mode="widthFix" />
          <view class="exam-win">
            <view v-for="item in [0, 1]" :key="item" class="exam-win__item" :class="{ left: item === 0, right: item === 1, hightLight: highLight(item) }">
              <view v-if="winIndex === 0 || winIndex === 1" class="item-tag" :class="{ show: winIndex === item }">
                <image class="item-tag__icon" :src="resourceUrl + examEnum[item].goodIcon" mode="widthFix" />
                <view class="item-tag__text">
                  表现更好
                </view>
              </view>
              <view class="item-info">
                <image v-if="item === 0" class="item-info__icon" :src="resourceUrl + getPkIcon(item)" mode="widthFix" />
                <image v-if="!exams[item]" class="item-info__empty" :src="`${resourceUrl}compare_exam_right_question.png`" mode="widthFix" />
                <view v-else class="item-info__message">
                  <view class="time">
                    {{ getExamTime(item) }}
                  </view>
                  <view class="name">
                    {{ getExamName(item) }}
                  </view>
                </view>
                <image v-if="item === 1" class="item-info__icon" :class="{ active: !exams[item] }" :src="resourceUrl + getPkIcon(item)" mode="widthFix" />
              </view>
            </view>
          </view>
          <view class="exam-process">
            <view v-for="item in [0, 1]" :key="item" class="exam-process__com" :class="{ left: item === 0, right: item === 1, active: highLight(item) }" :style="{ width: `${Math.abs(item - percentage) * 100}%` }">
              <view v-if="isPk" class="value" :class="{ active: highLight(item) }">
                {{ exams[item].win }}<text class="value-unit">
                  项
                </text>
              </view>
              <view v-if="item === 0" class="icon">
                <image v-if="!isPk" class="icon-or" :src="`${resourceUrl}compare_exam_question.png`" mode="widthFix" />
                <image v-else class="icon-vs" :src="`${resourceUrl}icon_exam_vs.png`" mode="widthFix" />
              </view>
            </view>
            <image class="exam-process__line" :src="`${resourceUrl}process_line.png`" mode="heightFix" />
          </view>
        </view>
        <view v-if="isPk" class="compare-content__summary">
          <view class="summary-head">
            <view class="summary-head__line" />
            <image class="summary-head__title" :src="`${resourceUrl}summary_title.png`" />
          </view>
          <view v-if="examGuide" class="summary-template">
            <rich-text :nodes="examGuide" />
          </view>
          <image class="summary-icon" :src="`${resourceUrl}summary_icon.png`" />
        </view>
        <scroll-view v-if="subjectList.length > 0" class="compare-content__tabs" :scroll-into-view="`tabIndex-${tabIndex}`" scroll-with-animation scroll-x="true" scroll-left="0">
          <view class="tabs-list">
            <view v-for="(item, index) in subjectList" :id="`tabIndex-${index}`" :key="index" class="tabs-list__item" :class="{ tabActive: tabIndex === index }" @click="subjectClick(index)">
              <view class="name">
                {{ item.subject }}
              </view>
              <image v-if="item.wave" class="icon" :class="{ width: item.wave === -2 }" :src="resourceUrl + subjectIcon[item.wave][tabIndex === index ? 'active' : 'default']" />
            </view>
          </view>
        </scroll-view>
        <view class="compare-content__result">
          <view v-for="item in [0, 1]" :key="item" class="column" :class="{ left: item === 0, right: item === 1, hightLight: highLight(item) }">
            <view v-if="isPk && !papers[item]" class="column-lack">
              <image class="column-lack__icon" :src="resourceUrl + examEnum[item].lackIcon" mode="widthFix" />
              <view class="column-lack__text">
                {{ `${getExamTime(item)}${getExamName(item)}中未考${subjectList[tabIndex].subject}学科。` }}
              </view>
            </view>
            <template v-else>
              <template v-for="(it, idx) in pkList">
                <view v-if="it.show" :key="idx" class="column-item" :class="{ active: (isPk && papers[item][`${it.key}PK`] === 1) || subjectItem.wave === -2 }">
                  <view class="column-item__info">
                    <view class="name">
                      {{ it.name }}
                    </view>
                    <view v-if="showColumnVaule(item, it)" class="value">
                      {{ papers[item][it.key] + it.unit }}
                    </view>
                  </view>
                  <view class="column-item__line">
                    <view v-if="isPk && papers[item][it.rate]" class="value" :style="{ width: `${papers[item][it.rate]}%` }" />
                  </view>
                </view>
              </template>
            </template>
          </view>
        </view>
        <view v-if="subjectGuide" class="compare-content__explain">
          <rich-text :nodes="subjectGuide" />
        </view>
      </view>
      <image v-else class="compare-empty" :src="`${resourceUrl}compare_empty.png`" mode="widthFix" />
    </view>
    <view v-if="!isExamMember && !close && showVip" class="novip">
      <image class="novip-img" :src="`${indexResourceUrl}vip_icon.png`" />
      <view class="novip-tip">
        <image class="novip-icon" :src="`${resourceUrl}icon_open_exam_pk.png`" mode="widthFix" />
        <view class="text">
          会员专享32项会员权益
        </view>
      </view>
      <image class="novip-rb" mode="heightFix" :src="`${indexResourceUrl}icon_novip_rb_icon.png`" />
      <view class="novip-open" @click="jumpPage(vip, { eventId: 'ksda_kspk_dbkthy_pay' })">
        立即开通
      </view>
      <view class="novip-close">
        <u-icon name="close" color="#494f2e" size="28rpx" @click="close = true" />
      </view>
    </view>
    <!-- #if MP-WEIXIN -->
    <view class="record" @click="handleRecord">
      PK记录
    </view>
    <!-- #endif -->
    <u-popup :show="popShow" mode="center" round="44rpx" @close="popShow = false">
      <view class="pop">
        <view class="title">
          提示
        </view>
        <view class="msg">
          今日考试PK次数已用完
        </view>
        <view class="close">
          <u-icon name="close" size="36rpx" color="#333333" @click="popShow = false" />
        </view>
        <view class="know" @click="popShow = false">
          知道了
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { examSummary, subjectSummary } from '../template/examPk.js'
import record from './record.js'
import { isHFSApp, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  mixins: [record],
  data() {
    return {
      indexResourceUrl: 'https://fe-resource.haofenshu.com/exam/images/index/',
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/examPK/',
      iconMap: require('../rightButton/iconMap.json'),
      popShow: false,
      examType: { 1: '期中', 2: '期末', 3: '月考', 4: '竞赛', 5: '普通' },
      examIds: [],
      remainTimes: 0,
      exams: [],
      explain: {},
      examGuide: '',
      tabIndex: 0,
      subjectList: [],
      close: false,
      vip: { type: 'vip' },
      back: 0, // 0:不是自考试列表
      examEnum: {
        0: { color: '#416AFF', goodIcon: 'compare_exam_left_good.png', winIcon: 'compare_exam_left_icon.png', lackIcon: 'subject_lack_left_empty.png' },
        1: { color: '#ECAB00', goodIcon: 'compare_exam_right_good.png', winIcon: 'compare_exam_right_icon.png', lackIcon: 'subject_lack_right_empty.png' },
      },
      subjectIcon: {
        '1': { default: 'subject_up.png', active: 'subject_up_active.png' },
        '-1': { default: 'subject_down.png', active: 'subject_down_active.png' },
        '-2': { default: 'subject_lack.png', active: 'subject_lack_active.png' },
      },
      eventChannel: null,
    }
  },

  async onLoad(option) {
    const { pk = 'true', back = 0 } = option
    this.back = back
    this.eventChannel = this.getOpenerEventChannel()
    this.eventChannel.on('examIds', (data) => {
      this.examIds = data.examIds || []
      this.init(JSON.parse(pk))
    })
  },
  onShow() {
    this.showRightButton()
  },
  onUnload() {
    this.cancelRightButton()
  },
  onHide() {
    this.cancelRightButton()
  },
  computed: {
    isPk() {
      const [exam1 = {}, exam2 = {}] = this.exams || []
      return exam1.win !== undefined && exam2.win !== undefined
    },
    percentage() {
      if (!this.isPk)
        return 0.5
      const [exam1 = {}, exam2 = {}] = this.exams || []
      return exam1.win / (exam1.win + exam2.win)
    },
    getRemainName() {
      const messages = {
        member: { remain: `今日PK剩余：${this.remainTimes}次`, none: '今日PK剩余：0次' },
        nonMember: { remain: `免费体验${this.remainTimes}次`, none: this.showVip ? '会员：3次/天' : '' },
      }
      return this.remainTimes > 0 ? messages[this.isExamMember ? 'member' : 'nonMember'].remain : messages[this.isExamMember ? 'member' : 'nonMember'].none
    },
    // -1:没pk 0:左赢 1:右赢 2:平局
    winIndex() {
      if (!this.isPk)
        return -1
      const [exam1 = {}, exam2 = {}] = this.exams || []
      return exam1.win === exam2.win ? 2 : (exam1.win > exam2.win ? 0 : 1)
    },
    examCompareBg() {
      if (!this.isPk)
        return 'compare_exam_default.png'
      const [exam1 = {}, exam2 = {}] = this.exams || []
      return exam1.win === exam2.win ? 'compare_exam_flat.png' : (exam1.win > exam2.win ? 'compare_exam_lwin.png' : 'compare_exam_rwin.png')
    },
    subjectItem() {
      return this.subjectList[this.tabIndex] || {}
    },
    papers() {
      return this.subjectItem.papers || []
    },
    subjectGuide() {
      const { explain = {}, subject } = this.subjectItem
      return Object.keys(explain).length ? subjectSummary({ ...explain, subject }) : ''
    },
    pkList() {
      return [{ key: 'score', name: '成绩', rate: 'scoreRate', unit: '', show: true }, { key: 'gradeRank', name: '年级排名', rate: 'gradeRankBeat', unit: '', show: true }, { key: 'classRank', name: '班级排名', rate: 'classRankBeat', unit: '', show: true }, { key: 'scoreRate', name: '得分率', rate: 'scoreRate', unit: '%', show: true }, { key: 'sameLevelBeat', name: '同层次击败率', rate: 'sameLevelBeat', unit: '%', show: this.tabIndex === 0 }, { key: 'difficulty', name: '难度系数', rate: 'difficultyRate', unit: '', show: true },
      ]
    },
  },
  methods: {
    cancelRightButton() {
      // #ifdef H5
      if (isHFSApp()) {
        nativeBridge.callHandler('rightButton', JSON.stringify([]))
      }
      // #endif
    },
    showRightButton() {
      // #ifdef H5
      if (isHFSApp()) {
        nativeBridge.registerHandler('examIndexJumpExamRecord', () => {
          nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${location.origin}/uni_modules/hfs-fe-uni-module/examPages/examRecord/pkRecord` }))
        })
        nativeBridge.callHandler('rightButton', JSON.stringify([{ picture: this.iconMap.examPkRecord, text: '', actionName: 'examIndexJumpExamRecord()', picHeight: 14 }]))
      }
      // #endif
    },
    handleRecord() {
      uni.navigateTo({ url: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/pkRecord' })
    },
    async init(isPk = true) {
      await this.pk()
      if (!isPk) {
        const pkRecords = uni.getStorageSync('exam_pk_records') || {}
        const list = pkRecords[this.studentInfo.studentId][0] || []
        this.setDataByRecord(list)
      }
    },
    subjectClick(index) {
      this.tabIndex = index
    },
    selectExam(index) {
      const exams = this.exams.filter((val, num) => index === num)
      if (this.back) {
        this.eventChannel.emit('checkExams', { exams })
        return uni.navigateBack()
      }
      uni.navigateTo({
        url: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/historyExams?mode=2&back=1',
        events: {
          toPkExam: (data) => {
            this.examIds = data.examIds || []
            this.pk()
          },
        },
        success: (res) => {
          res.eventChannel.emit('checkExams', { exams })
        },
      })
    },
    btnPk() {
      if (this.remainTimes === 0) {
        if (this.isExamMember)
          return (this.popShow = true)
        if (this.showVip)
          return this.jumpPage(this.vip, { eventId: 'ksda_kspk_kthy_pay' })
        return uni.showToast({ title: '请前往家长端体验', icon: 'none' })
      }
      if (this.examIds.length < 2)
        return uni.showToast({ title: '请选择两场考试开始pk', icon: 'none' })
      this.pk()
    },
    async pk() {
      const res = await uni.$http.post(`${this.prefix}/v4/exam/archives/pk`, { examIds: this.examIds.map(item => Number(item)) })
      const { remainTimes, explain = {}, exams = [], subjects = [] } = res.data || {}
      const subjectsList = subjects.sort((a, _b) => a.wave === -2 ? 1 : -1)
      this.explain = explain
      this.exams = exams
      this.remainTimes = remainTimes
      this.exams = this.exams.map(item => ({ ...item, examId: item.id, type: this.examType[item.type] }))
      this.subjectList = subjectsList.length ? [{ subject: '综合表现', papers: [...this.exams], explain: {}, wave: 0 }, ...subjectsList] : [] // wave: -2是缺一次考试， -1下降 0持平，1上升
      this.getExamSummary()
      if (this.isPk) {
        const records = uni.getStorageSync('exam_pk_records')
        const currentStudentRecords = records[this.studentInfo.studentId] || []
        currentStudentRecords.unshift({ ...res.data, exams: this.exams, time: new Date().getTime() })
        uni.setStorageSync('exam_pk_records', { ...records, [this.studentInfo.studentId]: currentStudentRecords })
      }
      else {
        if (this.exams.length === 2 && this.isExamMember)
          this.popShow = true
      }
    },
    setDataByRecord(data) {
      const { explain = {}, exams = [], subjects = [] } = data || {}
      const subjectsList = subjects.sort((a, _b) => a.wave === -2 ? 1 : -1)
      this.examIds = exams.map(item => item.examId || item.id)
      this.explain = explain
      this.exams = exams
      this.subjectList = subjectsList.length ? [{ subject: '综合表现', papers: [...this.exams], explain: {}, wave: 0 }, ...subjectsList] : []
      this.getExamSummary()
    },
    getExamSummary() {
      const exam1Title = this.getExamTime(0) + this.getExamName(0)
      const exam2Title = this.getExamTime(1) + this.getExamName(1)
      this.examGuide = examSummary({ ...this.explain, exam1Title, exam2Title, winIndex: this.winIndex })
    },
    getExamName(val) {
      const { grade = '', type = '普通' } = this.exams[val] || {}
      return `${grade + type}考试`
    },
    getExamTime(val) {
      const { eventTime = '' } = this.exams[val] || {}
      return uni.$u.timeFormat(eventTime, 'yyyy/mm/dd')
    },
    showTag(time) {
      const diff = new Date().getTime() - time
      return diff / 3600000 / 24 <= 7
    },
    highLight(index) {
      return index === this.winIndex || this.winIndex === -1 || this.winIndex === 2
    },
    getPkIcon(index) {
      if (this.highLight(index))
        return this.examEnum[index].winIcon
      return 'compare_exam_lose_icon.png'
    },
    showColumnVaule(item, it) {
      const papersItem = this.papers[item] || {}
      const value = papersItem[it.key]
      return this.isPk && value !== '**' && value !== undefined
    },
  },
}
</script>

<style lang="scss" scoped>
.pk {
  min-height: 100vh;
  background: #f6f6f6;
  .head {
    position: relative;
    height: 432rpx;
    padding: 36rpx 28rpx 0;
    overflow: hidden;
    &-bg {
      width: 750rpx;
      height: 768rpx;
      position: absolute;
      top: 0;
      left: 0;
    }
    &-list {
      display: flex;
      justify-content: space-between;
      position: relative;
      margin-bottom: 28rpx;
      z-index: 1;
      &__item {
        position: relative;
        width: calc(50% - 8rpx);
        height: 176rpx;
        padding: 36rpx 16rpx 16rpx 16rpx;
        background: linear-gradient(
          196deg,
          rgba(255, 255, 255, 0.6),
          rgba(255, 255, 255, 0.9) 84%
        );
        border: 2rpx solid #ffffff;
        border-radius: 16rpx;
        overflow: hidden;
        .blur {
          position: absolute;
          top: 0;
          right: 0;
          width: 140rpx;
          height: 140rpx;
          border-radius: 50%;
          transform: translate(50%, -50%);
          background: #dbe3ff;
          filter: blur(40rpx);
        }
        .tag {
          position: absolute;
          top: 0;
          left: 0;
          font-size: 22rpx;
          color: #939393;
          padding: 0 17rpx;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 8rpx 0;
          transform: skewX(-15deg);
          &-text {
            transform: skewX(15deg);
          }
        }
        .name {
          position: relative;
          font-size: 26rpx;
          color: #333333;
          margin-bottom: 22rpx;
          white-space: nowrap;
          z-index: 1;
        }
        .info {
          &-item {
            font-size: 22rpx;
            color: #666666;
            margin-bottom: 2rpx;
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
        .icon {
          position: absolute;
          right: 24rpx;
          bottom: 16rpx;
        }
        .select {
          width: 194rpx;
          height: 54rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2rpx solid rgba(65, 106, 255, 0.3);
          border-radius: 38rpx;
          ::v-deep .u-icon__label {
            font-weight: bold;
          }
        }
        &.right {
          background: linear-gradient(
            196deg,
            rgba(255, 255, 255, 0.6),
            rgba(255, 255, 255, 0.9) 84%
          );
          .select {
            border: 2rpx solid rgba(241, 181, 0, 0.3);
          }
        }
        &.empty {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16rpx;
        }
      }
    }
    &-operate {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 1;
      &__remain {
        font-size: 24rpx;
        color: #5e3921;
        margin-bottom: 8rpx;
      }
      &__btn {
        width: 498rpx;
        height: 76rpx;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        .btn-bg {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
        }
        .btn-vip {
          width: 34rpx;
          height: 32rpx;
          margin-right: 12rpx;
        }
        .btn-text {
          position: relative;
          display: flex;
          align-items: center;
          font-size: 30rpx;
          font-weight: bold;
          color: #ffffff;
          z-index: 1;
          &__pk {
            font-size: 32rpx;
          }
        }
      }
    }
  }
  .compare {
    position: relative;
    margin-top: -34rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), #ffffff 2%);
    border: 2rpx solid #ffffff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 36rpx 28rpx 86rpx 28rpx;
    min-height: calc(100vh - 398rpx);
    z-index: 1;
    &-content {
      &__exam {
        position: relative;
        padding: 12rpx 16rpx 22rpx;
        .exam-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 216rpx;
        }
        .exam-win {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 34rpx;
          &__item {
            position: relative;
            display: flex;
            flex-direction: column;
            .item-tag {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 106rpx;
              height: 30rpx;
              background: #c8d3ff;
              border-radius: 6rpx;
              visibility: hidden;
              margin: 0 0 6rpx 2rpx;
              &.show {
                visibility: visible;
              }
              &__icon {
                width: 18rpx;
                height: 18rpx;
                margin-right: 4rpx;
              }
              &__text {
                font-size: 18rpx;
                color: #416aff;
              }
            }
            .item-info {
              display: flex;
              align-items: center;
              &__icon {
                width: 72rpx;
                height: 72rpx;
                margin-right: 14rpx;
              }
              &__empty {
                width: 88rpx;
                height: 44rpx;
              }
              &__message {
                color: #939393;
                .time {
                  opacity: 0.7;
                  font-size: 24rpx;
                }
                .name {
                  font-size: 28rpx;
                  font-weight: bold;
                }
              }
            }
            &.left {
              &.hightLight {
                .item-info__message {
                  color: #416aff;
                }
              }
            }
            &.right {
              align-items: flex-end;
              .item-tag {
                right: 18rpx;
              }
              .item-info {
                &__icon {
                  margin: 0 0 0 14rpx;
                  &.active {
                    margin-left: 50rpx;
                  }
                }
                &__message {
                  text-align: right;
                }
              }
              &.hightLight {
                .item-tag {
                  background: #fff5d6;
                  &__text {
                    color: #ecab00;
                  }
                }
                .item-info__message {
                  color: #ecab00;
                }
              }
            }
          }
        }
        .exam-process {
          position: relative;
          z-index: 1;
          width: 658rpx;
          height: 40rpx;
          background: linear-gradient(90deg, #e6e6e6 50%, #e7e7e7 100%);
          border-radius: 20rpx;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 52rpx;
          &__com {
            position: relative;
            padding: 0 20rpx;
            min-width: 88rpx;
            height: 100%;
            background: #e6e6e6;
            .value {
              position: relative;
              display: flex;
              align-items: center;
              opacity: 0.7;
              font-size: 26rpx;
              font-weight: bold;
              color: #939393;
              z-index: 2;
              &-unit {
                font-size: 20rpx;
                font-weight: 400;
                margin-left: 4rpx;
              }
              &.active {
                color: #ffffff;
                .value-unit {
                  color: #ffffff;
                }
              }
            }
            .icon {
              position: absolute;
              top: 50%;
              transform: translate(50%, -50%);
              right: 0;
              z-index: 2;
              &-vs {
                width: 46rpx;
                height: 30rpx;
              }
              &-or {
                width: 116rpx;
                height: 36rpx;
              }
            }
          }
          .left {
            &.active {
              background: linear-gradient(270deg, #76b9ff, #4b72ff);
            }
          }
          .right {
            flex-grow: 1;
            display: flex;
            justify-content: flex-end;
            &.active {
              background: linear-gradient(90deg, #ffd862 37%, #f1b500 100%);
            }
          }
          &__line {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            right: 0;
            z-index: 1;
          }
        }
        &.noTag {
          padding-top: 22rpx;
        }
      }
      &__summary {
        position: relative;
        padding: 22rpx 28rpx 24rpx;
        background: #fffbd4;
        margin-bottom: 36rpx;
        border-radius: 16rpx;
        .summary-head {
          display: flex;
          align-items: center;
          margin-bottom: 16rpx;
          &__line {
            width: 8rpx;
            height: 28rpx;
            background: #ffb100;
            border-radius: 8rpx;
            margin-right: 12rpx;
          }
          &__title {
            width: 60rpx;
            height: 28rpx;
          }
        }
        .summary-template {
          position: relative;
          font-size: 28rpx;
          color: #333333;
          z-index: 1;
          line-height: 44rpx;
        }
        .summary-icon {
          width: 206rpx;
          height: 120rpx;
          position: absolute;
          top: -40rpx;
          right: 0;
        }
      }
      &__tabs {
        width: 100%;
        white-space: nowrap;
        margin-bottom: 28rpx;
        .tabs-list {
          display: flex;
          align-items: center;
          &__item {
            display: flex;
            align-items: center;
            background: #f6f6f6;
            border: 2rpx solid #f6f6f6;
            border-radius: 28rpx;
            font-size: 28rpx;
            font-weight: 400;
            color: #939393;
            border-radius: 28rpx;
            padding: 6rpx 28rpx;
            margin-right: 16rpx;
            &:last-child {
              margin-right: 0;
            }
            &.tabActive {
              background: #fffcf3;
              border: 2rpx solid #f1b500;
              font-weight: bold;
              color: #f1b500;
            }
            .icon {
              width: 20rpx;
              height: 28rpx;
              margin-left: 6rpx;
              &.width {
                width: 24rpx;
                height: 24rpx;
              }
            }
          }
        }
      }
      &__result {
        display: flex;
        justify-content: space-between;
        margin-bottom: 14rpx;
        .column {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: calc(50% - 7rpx);
          background: #f6f6f6;
          border-radius: 24rpx;
          padding: 36rpx 40rpx 50rpx 28rpx;
          &-item {
            width: 100%;
            margin-bottom: 42rpx;
            &:last-child {
              margin-bottom: 0;
            }
            &__info {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 8rpx;
              .name {
                font-size: 22rpx;
                color: #939393;
              }
              .value {
                font-size: 24rpx;
                color: #939393;
              }
            }
            &__line {
              height: 8rpx;
              border-radius: 8rpx;
              background: rgba(51, 51, 51, 0.1);
              .value {
                height: 100%;
                border-radius: 8rpx;
                background: rgba(51, 51, 51, 0.1);
              }
            }
          }
          &-lack {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            &__icon {
              width: 52rpx;
              height: 52rpx;
              margin-bottom: 18rpx;
            }
            &__text {
              font-size: 24rpx;
              color: #416aff;
            }
          }
          &.left {
            &.hightLight {
              background: #f4f6ff;
              .column-item__line {
                background: rgba(65, 106, 255, 0.1);
                .value {
                  background: rgba(65, 106, 255, 0.2);
                }
              }
            }
            .active {
              .column-item__info {
                .name {
                  color: #333333;
                }
                .value {
                  color: #416aff;
                  font-weight: bold;
                }
              }
              .column-item__line {
                background: rgba(65, 106, 255, 0.1);
                .value {
                  background: #416aff;
                }
              }
            }
          }
          &.right {
            &.hightLight {
              background: #fffcf3;
              .column-item__line {
                background: rgba(241, 181, 0, 0.1);
                .value {
                  background: rgba(241, 181, 0, 0.2);
                }
              }
            }
            .active {
              .column-item__info {
                .name {
                  color: #333333;
                }
                .value {
                  color: #f1b500;
                  font-weight: bold;
                }
              }
              .column-item__line {
                background: rgba(241, 181, 0, 0.1);
                .value {
                  background: #f1b500;
                }
              }
            }
            .column-item__info {
              flex-direction: row-reverse;
            }
            .column-lack__text {
              color: #f1b500;
            }
            .column-item__line {
              transform: rotate(180deg);
            }
          }
        }
      }
      &__explain {
        background: #fffbd4;
        border: 2rpx solid #ffdd00;
        border-radius: 24rpx;
        padding: 16rpx 28rpx;
        font-size: 26rpx;
        color: #333333;
        line-height: 40rpx;
      }
    }
    &-empty {
      width: 654rpx;
      height: 642rpx;
      margin: 22rpx auto 0;
    }
  }
  .record {
    position: fixed;
    bottom: 150rpx;
    right: 30rpx;
    color: #ffffff;
    width: 100rpx;
    height: 100rpx;
    font-size: 26rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: linear-gradient(270deg, #ffba1d, #ffc749);
    line-height: 30rpx;
    z-index: 99;
  }

  .novip {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    width: 100%;
    height: 102rpx;
    background: #fff8e9;
    padding: 0 28rpx;
    &-img {
      width: 54rpx;
      height: 54rpx;
    }
    &-tip {
      display: flex;
      flex-direction: column;
      margin-left: 12rpx;
      .text {
        font-size: 24rpx;
        color: #6c4600;
        line-height: 34rpx;
      }
    }
    &-icon {
      width: 276rpx;
      height: 28rpx;
    }
    &-open {
      position: absolute;
      right: 48rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 154rpx;
      height: 60rpx;
      background: linear-gradient(225deg, #ffa430 0%, #ff7426);
      border-radius: 30rpx;
      font-size: 26rpx;
      color: white;
      line-height: 60rpx;
      text-align: center;
    }
    &-close {
      position: absolute;
      width: 28rpx;
      height: 28rpx;
      top: 6rpx;
      right: 6rpx;
    }
    &-rb {
      position: absolute;
      bottom: 0;
      right: 0;
      height: 100%;
    }
  }
  .pop {
    font-size: 30rpx;
    width: 532rpx;
    height: 372rpx;
    display: flex;
    align-items: center;
    border-radius: 44rpx;
    color: #333333;
    flex-direction: column;
    background: linear-gradient(180deg, #fff3b9, #ffffff 24%);
    .title {
      font-size: 36rpx;
      margin-top: 32rpx;
    }
    .msg {
      margin-top: 48rpx;
      text-align: center;
    }
    .close {
      width: 30rpx;
      height: 30rpx;
      position: absolute;
      right: 30rpx;
      top: 30rpx;
    }
    .know {
      width: 396rpx;
      color: white;
      margin-top: 94rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 70rpx;
      background: linear-gradient(225deg, #ffc749, #ffba1d);
      border-radius: 58rpx;
    }
  }
}
</style>
