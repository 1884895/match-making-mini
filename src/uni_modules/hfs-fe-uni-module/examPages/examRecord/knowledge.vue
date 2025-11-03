<template>
  <view class="knowledge">
    <!-- #if MP-WEIXIN -->
    <u-navbar title="薄弱知识点" auto-back placeholder :title-style="{ color: '#333333', fontSize: '16px', fontWeight: 'bold' }" />
    <!-- #endif -->
    <u-sticky bg-color="#fff" :offset-top="topHeight" custom-nav-height="0">
      <u-line color="#ededed" />
      <view class="knowledge-tabs">
        <ITabs :list="subjectList" :current="current" key-name="name" @change="subjectChange" />
      </view>
    </u-sticky>
    <view class="knowledge-content" :class="{ 'knowledge-content-novip': !isMember }">
      <view class="knowledge-content__sub">
        <view class="icon" />共计{{ tableData.length }}个知识点
      </view>
      <view class="knowledge-content__table">
        <view class="tr">
          <view v-for="(item, index) in columns" :key="index" class="th" :style="{ width: item.width }">
            {{ item.name }}
          </view>
        </view>
        <IMask :show="isMember">
          <view style="display: inline-block; width: 100%">
            <view v-for="(item, index) in tableData" :key="index" class="tr">
              <view v-for="(it, ix) in columns" :key="ix" class="td" @click="jumpCard(item, it.key)">
                <view class="text">
                  {{ item[it.key] }}
                </view>
              </view>
            </view>
          </view>
        </IMask>
        <IEmpty v-if="!tableData.length" border-radius="24rpx" />
      </view>
    </view>
    <view class="footer">
      <view class="footer-btn">
        <view class="btn recorder" @click="practiceRecord()">
          练习记录
        </view>
        <view class="btn" @click="startPractice()">
          智能练习
        </view>
      </view>
      <view v-if="showDefaultVip" class="novip">
        <image class="novip-img" :src="`${resourceUrl}vip_icon.png`" />
        <view class="novip-tip">
          <image class="novip-icon" :src="`${resourceUrl}icon_tip_open_knowledges.png`" mode="widthFix" />
          <view class="text">
            会员专享32项会员权益
          </view>
        </view>
        <image class="novip-rb" mode="heightFix" :src="`${resourceUrl}icon_novip_rb_icon.png`" />
        <view class="novip-open" @click="jumpVip()">
          立即开通
        </view>
        <view class="novip-close">
          <u-icon name="close" color="#494f2e" size="28rpx" @click="close = true" />
        </view>
      </view>
    </view>
    <ShortYearExpiredPopup v-if="showShortYearExpiredPopup" :from="options.shortFrom || shortFrom" :short-info="shortInfo" @close="showShortYearExpiredPopup = false" />
  </view>
</template>

<script>
import iTabs from '../../components/i-tabs.vue'
import IMask from '../../components/i-mask.vue'
import iEmpty from '../../components/i-empty.vue'
import ShortYearExpiredPopup from '../../components/shortYearExpiredPopup.vue'
import record from './record.js'
import { isHFSApp, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { ITabs: iTabs, IMask, IEmpty: iEmpty, ShortYearExpiredPopup },
  mixins: [record],
  data() {
    return {
      options: {},
      close: false,
      total: 0,
      subjectList: [{ subject: '语文', name: '语文' }, { subject: '数学', name: '数学' }, { subject: '英语', name: '英语' }, { subject: '物理', name: '物理' }, { subject: '化学', name: '化学' }, { subject: '生物', name: '生物' }, { subject: '历史', name: '历史' }, { subject: '地理', name: '地理' }],
      current: 0,
      curSubject: {},
      topHeight: 0,
      tableData: [],
      knowledges: [],
      vip: { type: 'vip' },
      columns: [
        { name: '知识点名称', key: 'name' },
        { name: '错题量', key: 'ques_num' },
        { name: '考试概率', key: 'chance' },
        { name: '中/高考分值', key: 'totalScore' },
      ],
      loading: false,
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/index/',
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
      return !this.isMember && !this.close && this.showVip && this.config.parentPay === 2 && this.isHiddenBottomVip === false
    },
  },
  onLoad(options) {
    this.options = options
    this.getShortRecommend()
    // #ifdef MP-WEIXIN
    this.getTopHeight()
    // #endif
    if (!this.isMember) {
      this.createMockData()
    }
    else {
      this.getknowledges()
    }
  },
  methods: {
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
    createMockData() {
      const mockKnowledge = { name: '全命题作文', chance: '58%', score: 25.36, ques_num: 7, totalScore: 44 }
      for (let index = 0; index < this.subjectList.length; index++) {
        const { subject = '', subjectCode = 1 } = this.subjectList[index]
        const knowledges = this.subjectList.map(() => ({ ...mockKnowledge, subject }))
        this.knowledges.push({ subject, subjectCode, knowledges })
      }
      this.subjectChange({ subject: this.subjectList[0].subject, subjectCode: this.subjectList[0].subjectCode })
    },
    async startPractice() {
      if (!this.isMember) {
        if (this.showVip) {
          this.jumpVip()
        }
        else {
          uni.$u.toast('请前往家长端体验')
        }
        return
      }
      const { knowledges = [], subjectCode } = this.knowledges.find(item => item.subjectCode === this.curSubject.subjectCode)
      if (knowledges.length === 0) {
        return uni.$u.toast('该科目无知识点,暂无法开始练习')
      }
      const params = {
        examId: '',
        paperId: '',
        subject: subjectCode,
        knowledges: knowledges.slice(0, 10),
      }
      try {
        const res = await uni.$http.post(`${this.beProxy}/v2/practices/specifics`, params)
        const practiceId = res.data.practiceId || ''
        if (practiceId) {
          // #ifdef H5
          if (isHFSApp()) {
            nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${location.origin}/smartPractice/index/index?practiceId=${practiceId}` }))
            return
          }
          uni.navigateTo({
            url: `/smartPractice/index/index?practiceId=${practiceId}&examId=${this.examId}`,
          })
          // #endif
          // #ifdef MP-WEIXIN
          uni.navigateTo({ url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}/smartPractice/index/index${uni.$u.queryParams({ practiceId })}`)}` })
          // #endif
        }
      }
      catch (error) {
        if (error.code && error.code === 9932) {
          const practiceId = error.data.practiceId || ''
          if (practiceId) {
            // #ifdef H5
            if (isHFSApp()) {
              nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${location.origin}/smartPractice/index/index?practiceId=${practiceId}` }))
              return
            }
            uni.navigateTo({
              url: `/smartPractice/index/index?practiceId=${practiceId}&examId=${this.examId}`,
            })
            // #endif
            // #ifdef MP-WEIXIN
            uni.navigateTo({ url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}/smartPractice/index/index${uni.$u.queryParams({ practiceId })}`)}` })
            // #endif
          }
        }
      }
    },
    practiceRecord() {
      // #ifdef H5
      uni.navigateTo({ url: '/smartPractice/practice/record' })
      // #endif
      // #ifdef MP-WEIXIN
      uni.navigateTo({ url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}/smartPractice/practice/record`)}` })
      // #endif
    },
    jumpVip() {
      this.jumpPage(this.vip, { eventId: 'ksda_brzsd_kthy_pay' })
    },
    async getknowledges() {
      const res = await uni.$http.get(`${this.beProxy}/v2/practices/weak-knowledges`)
      const { data = [] } = res
      this.knowledges = data.map(item => ({
        ...item,
        knowledges: item.knowledges.map(i => ({
          ...i,
          totalScore: i.score && i.chance ? Math.round(i.score / i.chance) : 0,
          chance: `${Math.round(i.chance * 100)}%`,
        })),
      }))
      this.subjectList = data.map(item => ({ subjectCode: item.subjectCode, subject: item.subject, name: (item.knowledges ? `${item.subject}(${item.knowledges.length})` : item.subject) }))
      if (this.subjectList.length > 0) {
        this.subjectChange({ subject: this.subjectList[0].subject, subjectCode: this.subjectList[0].subjectCode })
      }
    },
    getTopHeight() {
      uni.getSystemInfo({
        success: (e) => {
          this.topHeight = e.statusBarHeight + 44
        },
      })
    },
    subjectChange(sub) {
      this.curSubject = sub
      const { subject = '' } = sub
      const { knowledges = [] } = this.knowledges.find(item => item.subject === subject)
      this.tableData = knowledges
      uni.pageScrollTo({ scrollTop: 0, duration: 0 })
    },
    jumpCard(item, key) {
      if (!this.isMember) {
        return
      }
      if (key === 'name') {
        // #ifdef MP-WEIXIN
        uni.navigateTo({ url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}/knowledgePages/paperDetail/knowledgeCard?id=${item.id}`)}` })
        // #endif
        // #ifdef H5
        uni.navigateTo({ url: `/knowledgePages/paperDetail/knowledgeCard?id=${item.id}` })
        // #endif
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.knowledge {
  min-height: 100vh;
  background-color: #f6f6f6;
  padding-bottom: 160rpx;
  &-tabs {
    background: #ffffff;
    border-radius: 0 0 24rpx 24rpx;
    padding: 0 20rpx;
  }
  &-content {
    margin: 24rpx 30rpx 80rpx;
    background: #ffffff;
    border-radius: 24rpx;
    padding: 24rpx 30rpx;
    &-novip {
      max-height: 726rpx;
      overflow: hidden;
      position: relative;
    }
    &__sub {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #333333;
      margin-bottom: 20rpx;
      .icon {
        width: 18rpx;
        height: 18rpx;
        background: #ffba1d;
        border-radius: 50%;
        margin-right: 10rpx;
      }
    }
    &__table {
      border-radius: 24rpx;
      overflow: visible;
      margin-bottom: 24rpx;
      .tr {
        display: flex;
        &:nth-child(2n) {
          background: #ffffff;
        }
        &:nth-child(2n - 1) {
          background: #f8f8f8;
        }
      }
      .th,
      .td {
        flex: 1;
        padding: 15rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 66rpx;
        background: none;
        width: 25%;
        .text {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
      .th {
        font-size: 22rpx;
        color: #939393;
      }
      .td {
        color: #333333;
        font-size: 24rpx;
        .icon {
          width: 28rpx;
          height: 28rpx;
          margin-right: 4rpx;
          &:last-child {
            margin-right: 0;
          }
        }
      }
      .tr {
        .td:first-child {
          font-size: 24rpx;
          color: #599afc;
          display: flex;
          justify-content: flex-start;
        }
      }
    }
  }
  .practice-record {
    width: 100%;
    text-align: center;
    margin-top: 116rpx;
    font-size: 26rpx;
    color: #ffb100;
  }
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    &-btn {
      display: flex;
      align-items: center;
      padding: 28rpx;
      padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
      justify-content: space-between;
      border-radius: 24rpx 24rpx 0rpx 0rpx;
      box-shadow: 0rpx -4rpx 8rpx 0rpx rgba(0, 0, 0, 0.03);
      .btn {
        width: 424rpx;
        height: 80rpx;
        font-size: 32rpx;
        line-height: 80rpx;
        text-align: center;
        color: white;
        background: linear-gradient(225deg, #ffc749, #ffba1d);
        border-radius: 58rpx;
      }
      .recorder {
        width: 250rpx;
        background: #f6f6f6;
        color: #939393;
      }
    }
    .novip {
      position: relative;
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
        width: 380rpx;
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
        width: 28rpx;
        height: 28rpx;
        position: absolute;
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
  }
}
</style>
