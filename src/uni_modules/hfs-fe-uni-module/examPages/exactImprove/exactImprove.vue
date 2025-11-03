<template>
  <view class="improve">
    <!-- #if MP-WEIXIN -->
    <u-navbar title="精准提升" auto-back placeholder :bg-color="bgColor" left-icon-color="#fff" :title-style="{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }" />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <u-gap height="30rpx" bg-color="transparent" />
    <!-- #endif -->
    <image class="improve-bg" src="../static/academicReport/academic_bg.png" mode="widthFix" />
    <image class="improve-text" src="../static/academicReport/improve_desc.png" mode="widthFix" />
    <view class="improve-detail">
      <view class="improve-detail_name">
        <image class="icon" src="../static/academicReport/exam-icon.png" />
        <text class="text">
          {{ examDetail.name }}
        </text>
      </view>
      <view class="improve-detail_history" @click="handleRecord">
        <view class="content">
          <image class="icon" src="../static/academicReport/improve_history_icon.png" />
          <text class="text">
            本次考试练习记录
          </text>
        </view>
        <view class="operation">
          <text class="text">
            查看
          </text>
          <image class="icon" src="../static/academicReport/improve_history_right.png" />
        </view>
      </view>
      <u-line color="#ededed" />
    </view>
    <u-sticky :offset-top="topHeight" custom-nav-height="0">
      <view class="improve-detail_tabs">
        <ITabs :list="subjectList" @change="subjectChange" />
      </view>
    </u-sticky>
    <view class="improve-point">
      <view class="improve-point_header">
        薄弱知识点<image class="icon" src="../static/academicReport/improve_vip.png" />
      </view>
      <view v-if="tableData.length" class="improve-point_table">
        <view class="tr">
          <view v-for="(item, index) in columns" :key="index" class="th">
            {{ item.name }}
          </view>
        </view>
        <view v-for="(item, index) in tableData" :key="index" class="tr">
          <view v-for="(it, ix) in columns" :key="ix" class="td" @click="jumpCard(item, it.key)">
            <template v-if="it.custom">
              <view v-if="item[it.key] >= 0" class="star">
                <view class="star-progress" :style="{ width: `${(item[it.key] / 5) * 100}%` }">
                  <view class="bar">
                    <image v-for="index in 5" :key="index" class="star-icon" src="../static/academicReport/star_active.png" />
                  </view>
                </view>
                <image v-for="index in 5" :key="index" class="star-icon" src="../static/academicReport/star.png" />
              </view>
            </template>
            <view v-else class="text">
              {{ item[it.key] }}
            </view>
          </view>
        </view>
      </view>
      <template v-if="!tableData.length && loadFinally">
        <!-- <view class="update" v-if="visible && isShow" @click="handleUpdate">戳我更新</view> -->
        <IEmpty border-radius="24rpx" padding="50rpx 0 100rpx 0" />
      </template>
    </view>
    <view class="btns">
      <view v-if="tableData.length" class="practice" :style="{ marginBottom: showVip && !visible ? '14rpx' : '36rpx' }" @click="handlePractice">
        <view class="practice-item">
          <image class="icon" src="../static/academicReport/improve_practice_icon.png" />智能练习
        </view>
      </view>
      <view v-if="showVip && !visible" class="member" @click="jumpPage('vip')">
        <image class="member-bg" src="../static/academicReport/member_bg.png" mode="widthFix" />
        <view class="member-item">
          <image class="icon" src="../static/academicReport/unlock.png" />开通会员解锁薄弱知识点
        </view>
      </view>
    </view>
    <u-popup :show="popup.show" :mode="popup.mode" :round="popup.round" :close-on-click-overlay="false">
      <view class="loading">
        <image class="loading-bg" src="../static/academicReport/practice-loading.gif" mode="widthFix" />
        <view class="loading-text">
          正在为你的薄弱知识点智能出题~
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import iTabs from '../../components/i-tabs.vue'
import iEmpty from '../../components/i-empty.vue'
import { isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { ITabs: iTabs, IEmpty: iEmpty },
  data() {
    return {
      options: {},
      userInfo: {},
      examDetail: {},
      tableData: [],
      subjectList: [],
      subject: '',
      scrollTop: 0,
      topHeight: 0,
      paperId: '',
      columns: [
        { name: '知识点名称', key: 'name' },
        { name: '掌握情况', key: 'level', custom: true },
      ],
      bgColor: 'transparent',
      isShow: true,
      loadFinally: false,
      popup: {
        show: false,
        round: 20,
        mode: 'center',
      },
    }
  },
  computed: {
    isMember() {
      return this.userInfo.isMember || false
    },
    visible() {
      return this.isMember || +this.options.analysisStatus === 1
    },
    prefix() {
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
  },
  onPageScroll(e) {
    this.scrollTop = e.scrollTop
    this.bgColor = e.scrollTop > 0 ? '#FFA822' : 'transparent'
  },
  async onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    // #ifdef MP-WEIXIN
    this.getTopHeight()
    // #endif
    this.reportEvent('ks_jzts_Pjzts')
    await this.getSubjectList()
    await this.getKnowledges()
  },
  methods: {
    getTopHeight() {
      uni.getSystemInfo({
        success: (e) => {
          this.topHeight = e.statusBarHeight + 44
        },
      })
    },
    subjectChange({ subject = '' }) {
      this.subject = subject
      this.paperId = this.subjectList.find(item => item.subject === subject).id
      this.tableData = []
      this.getKnowledges()
    },
    async handleUpdate() {
      uni.showLoading({ title: '正在计算数据', mask: true })
      await uni.$http.get(`${this.prefix}/tiku_api_proxy/v1/student/profile/week_knowledges/mining?examId=${this.options.examId}`, {}, { custom: { loading: false, error: false } })
      this.isShow = false
      uni.hideLoading()
      this.getKnowledges()
    },
    async getSubjectList() {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/papers?examId=${this.options.examId}`)
      const { papers = [] } = res.data
      const { subject = '', id = '' } = papers[0] || {}
      this.examDetail = res.data || {}
      this.subjectList = papers
      this.subject = subject
      this.paperId = id
    },
    async getKnowledges() {
      if (!this.paperId)
        return ''
      if (!this.visible) {
        this.columns = [
          { name: '知识点名称', key: 'name' },
          { name: '掌握情况', key: 'level' },
        ]
        this.tableData = [
          { name: 'xxxx知识点', level: '***' },
          { name: 'xxxx知识点', level: '***' },
          { name: 'xxxx知识点', level: '***' },
          { name: 'xxxx知识点', level: '***' },
          { name: 'xxxx知识点', level: '***' },
          { name: 'xxxx知识点', level: '***' },
          { name: 'xxxx知识点', level: '***' },
          { name: 'xxxx知识点', level: '***' },
        ]
        return
      }
      try {
        this.loadFinally = false
        const params = { examId: this.options.examId, paperId: this.paperId, subject: this.subject }
        const res = await uni.$http.get(`${this.prefix}/v2/practices/weak-knowledges`, params)
        const { knowledges = [] } = res.data[0] || {}
        this.tableData = knowledges.map((item) => {
          return { ...item, level: item.level / 2 }
        })
      }
      finally {
        this.loadFinally = true
      }
    },
    async handlePractice() {
      if (!this.visible && !this.showVip)
        return uni.showToast({ title: '请前往家长端体验', icon: 'none' })
      if (!this.visible && this.showVip)
        return this.jumpPage('vip')

      const { examId } = this.options
      const subject = this.subjectList.find(item => item.subject === this.subject).subCode
      const params = { examId, paperId: this.paperId, planType: 2, subject }
      this.popup.show = true
      const res = await uni.$http.post(`${this.prefix}/v2/practices/specifics`, params, { custom: { error: false, loading: false } }).then(res => res).catch(err => err)
      await uni.$u.sleep(500)
      this.popup.show = false
      const { practiceId = '' } = res.data || {}
      if (!practiceId)
        return uni.showToast({ title: res.msg, icon: 'none' })
      this.JumpH5('practice', { practiceId, from: 1 })
    },
    handleRecord() {
      this.JumpH5('record', { examId: this.options.examId, examName: this.examDetail.name })
    },
    JumpH5(type, params = {}) {
      const jumpMap = {
        practice: { url: '/smartPractice/index/index', event: 'ks_znlx_Bznlx' },
        record: { url: '/smartPractice/practice/record' },
        card: { url: '/knowledgePages/paperDetail/knowledgeCard' },
      }
      const { url = '', event } = jumpMap[type] || {}
      event && this.reportEvent(event)
      // #ifdef MP-WEIXIN
      uni.navigateTo({ url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}${uni.$u.queryParams(params)}`)}` })
      // #endif
      // #ifdef H5
      uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      // #endif
    },
    jumpPage(type) {
      const { examId } = this.options
      const jumpMap = {
        practice: { url: '', target: 62, params: { examId, paperId: this.paperId, subject: this.subjectList.find(item => item.subject === this.subject).subCode }, event: 'ks_znlx_Bznlx' },
        record: { url: '', target: 63, params: { examId, examName: this.examDetail.name } },
        vip: { url: '/pages/me/member', target: 8, params: {}, event: 'ks_jzts_Bkthy' },
      }
      const { url = '', target, params, event } = jumpMap[type] || {}
      event && this.reportEvent(event)
      // #ifdef MP-WEIXIN
      if (!url)
        return uni.showToast({ title: '请到APP端体验', icon: 'none' })
      uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      // #endif
      // #ifdef H5
      if (!target)
        return uni.navigateTo({ url: `${url}${uni.$u.queryParams(params)}` })
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target, data: params }))
      // #endif
    },
    jumpCard(item, key) {
      if (!this.visible)
        return ''
      if (key === 'name')
        this.JumpH5('card', { id: item.id })
    },
    reportEvent(event) {
      // #ifdef H5
      if (!event || typeof event !== 'string')
        return
      nativeBridge.callHandler('UMengEvent', event)
      // #endif
    },
  },
}
</script>

<style lang="scss" scoped>
.improve {
  position: relative;
  min-height: 100vh;
  background-color: #f6f6f6;
  padding-bottom: 80px;
  &-bg {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }
  &-text {
    position: relative;
    margin: 0 0 16rpx 52rpx;
    padding-top: 16rpx;
    width: 360rpx;
    z-index: 1;
  }
  &-detail {
    position: relative;
    background: #ffffff;
    border-radius: 24rpx 24rpx 0 0;
    overflow: hidden;
    &_name {
      display: flex;
      align-items: center;
      margin: 20rpx 30rpx 0 30rpx;
      .icon {
        width: 18rpx;
        height: 24rpx;
        margin-right: 10rpx;
      }
      .text {
        font-size: 24rpx;
        color: #939393;
      }
    }
    &_history {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 24rpx;
      border: 2rpx solid #e2e2e2;
      border-radius: 12rpx;
      margin: 16rpx 30rpx 32rpx 30rpx;
      .content {
        display: flex;
        align-items: center;
        .icon {
          width: 32rpx;
          height: 30rpx;
          margin-right: 8rpx;
        }
        .text {
          font-size: 30rpx;
          color: #333333;
        }
      }
      .operation {
        display: flex;
        align-items: center;
        .text {
          font-size: 30rpx;
          color: #939393;
          margin-right: 8rpx;
        }
        .icon {
          width: 14rpx;
          height: 22rpx;
        }
      }
    }
    &_tabs {
      background-color: #ffffff;
      padding: 0 30rpx;
    }
  }
  &-point {
    background: #ffffff;
    min-height: 400rpx;
    border-radius: 24rpx;
    margin: 20rpx 30rpx 30rpx 30rpx;
    padding: 24rpx 30rpx 100rpx 30rpx;
    &_header {
      display: flex;
      align-items: center;
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 20rpx;
      .icon {
        width: 32rpx;
        height: 28rpx;
        margin-left: 10rpx;
      }
    }
    &_table {
      border-radius: 24rpx;
      overflow: visible;
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
        width: 50%;
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
        .star {
          width: 160rpx;
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
              width: 160rpx;
              display: flex;
              align-items: center;
            }
          }
          &-icon {
            width: 28rpx;
            height: 28rpx;
            margin-right: 4rpx;
            &:last-child {
              margin-right: 0;
            }
          }
        }
      }
      .tr {
        .td:first-child {
          font-size: 24rpx;
          color: #599afc;
        }
      }
    }
    .update {
      width: 262rpx;
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(225deg, #ffc749, #ffba1d);
      border-radius: 56rpx;
      font-size: 30rpx;
      font-weight: 500;
      color: #ffffff;
      margin: 106rpx auto 36rpx;
    }
  }
  .btns {
    width: 100%;
    position: fixed;
    bottom: 0;
    .practice {
      width: 100%;
      display: flex;
      justify-content: center;
      &-item {
        width: 534rpx;
        height: 88rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(225deg, #ffc749, #ffba1d);
        border-radius: 56rpx;
        font-size: 30rpx;
        color: #ffffff;
        .icon {
          width: 26rpx;
          height: 24rpx;
          margin-right: 12rpx;
        }
      }
    }
    .member {
      width: 100%;
      position: relative;
      box-shadow: 0 -4rpx 16rpx 0 rgba(0, 0, 0, 0.06);
      &-bg {
        width: 100%;
      }
      &-item {
        position: absolute;
        top: 50%;
        left: 50%;
        display: flex;
        align-items: center;
        white-space: nowrap;
        transform: translate(-50%, -50%);
        background: linear-gradient(225deg, #481c01, #3f1902);
        border-radius: 48rpx;
        padding: 16rpx 66rpx 16rpx 62rpx;
        font-size: 32rpx;
        font-weight: 500;
        color: #fdd891;
        .icon {
          width: 40rpx;
          height: 34rpx;
          margin-right: 14rpx;
        }
      }
    }
  }
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 80rpx;
    &-bg {
      width: 120rpx;
      height: 120rpx;
      margin-bottom: 40rpx;
    }
    &-text {
      font-size: 28rpx;
      color: #282423;
    }
  }
}
</style>
