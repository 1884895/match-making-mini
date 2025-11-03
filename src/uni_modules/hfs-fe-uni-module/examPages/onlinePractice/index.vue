<template>
  <view class="online-practice">
    <view class="online-practice__name">
      <image class="edit" src="../static/onlinePractice/edit.png" />
      <zb-dropdown-menu ref="dropdown" @toggle-item="dropdownClick">
        <zb-dropdown-item v-model="options.examId" name="exam" :options="examOptions" @change="changeDropdown" />
      </zb-dropdown-menu>
      <image class="select" src="../static/onlinePractice/select.png" @click.stop="openDropdown" />
    </view>
    <u-tabs :list="briefList.papers || []" key-name="subject" :current="currentTab" :line-width="tabsStyle.lineWidth" :line-height="tabsStyle.lineHeight" :line-color="tabsStyle.lineColor" :inactive-style="tabsStyle.inactiveStyle" :active-style="tabsStyle.activeStyle" :item-style="tabsStyle.itemStyle" @change="subjectClick" />
    <view class="online-practice__container">
      <view class="content">
        <view class="konwledge-list">
          <view class="konwledge-list__item">
            <view class="column select">
              <view class="title">
                选择
              </view>
            </view>
            <view class="column name">
              <view class="title">
                知识点({{ konwledgeList.length }}个)
              </view>
            </view>
            <view class="column level">
              <view class="title">
                推荐度
              </view>
            </view>
          </view>
          <scroll-view class="konwledge-list__scroll" scroll-y>
            <template v-if="konwledgeList.length">
              <view v-for="(item, index) in konwledgeList" :key="index" class="konwledge-list__item" :class="{ 'whiite-background': index % 2 === 0 }">
                <view class="column select">
                  <view class="title" @click="checkKonwledge(item)">
                    <image v-if="isKonwledgeCheck(item)" class="icon" src="../static/onlinePractice/icon_checked.png" />
                    <image v-else class="icon" src="../static/onlinePractice/icon_uncheck.png" />
                  </view>
                </view>
                <view class="column name">
                  <view class="title emphasis">
                    {{ item.name }}
                  </view>
                </view>
                <view class="column level">
                  <view class="title">
                    <view class="star-content">
                      <image v-for="index in item.qlevel" :key="item.id + index" class="star" src="../static/onlinePractice/exam_question_level_star_yellow.png" />
                      <image v-for="index in 5 - item.qlevel" :key="`${item.id}-${index}`" class="star" src="../static/onlinePractice/exam_question_level_star_gray.png" />
                    </view>
                  </view>
                </view>
              </view>
            </template>
            <template v-else>
              <view class="konwledge-list__no-data">
                <view v-if="!originStatus" class="no-paper">
                  <view class="no-paper-title">
                    温馨提示
                  </view>
                  <view class="no-paper-content">
                    <text class="no-paper-content__emphasize">
                      学校暂未上传原卷，
                    </text>
                    若您有原卷可联系客服上传以便开展【在线练习】。所提供原卷一旦被采用，将有礼品相送。
                  </view>
                  <view class="no-paper-customer-service" @click="customerService">
                    <view class="no-paper-customer-service__text">
                      联系客服
                    </view>
                  </view>
                </view>
                <view v-else class="no-paper">
                  <view class="no-paper-title">
                    温馨提示
                  </view>
                  <view class="no-paper-content no-data">
                    暂无数据
                  </view>
                </view>
              </view>
            </template>
          </scroll-view>
        </view>
        <u-gap height="0.5" bg-color="#E6E6E6" />
        <view class="tips">
          <image
            class="tips-image"
            src="../static/onlinePractice/tips.png"
            mode="widthFix"
          />
        </view>
      </view>
    </view>
    <view class="online-practice__footer">
      <view class="btn" @click="startPractice">
        开始练习
      </view>
    </view>
    <view v-if="!isHFSApp" class="export" @click="goOnlinePracticeRecord">
      <text>练习\n记录</text>
    </view>
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" bg-color="transparent" @touchmove.stop.prevent>
      <view class="task-popup vip">
        <view class="task-popup__title">
          温馨提示
        </view>
        <view class="task-popup__content">
          <view class="desc">
            “举一反三练”通过大数据智能算法，为您推荐好题，是好分数VIP会员特色权益之一。
          </view>
          <image class="pic" src="../static/onlinePractice/open_vip_tips.png" mode="widthFix" />
        </view>
        <view class="task-popup__btn" @click="jumpVip">
          立即开通
        </view>
        <view class="task-popup__close" @click="closePopup">
          <u-icon name="close" color="#333333" bold size="32rpx" />
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { isHFSApp, isHFSStudent, isMiniProgram, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  async onLoad(options) {
    this.options = options
    await this.getExamList(this.examId)
    await this.getExamBriefList(this.examId)

    let index = 0
    if (this.paperId) {
      index = this.briefList.papers.findIndex((item) => {
        return item.paperId === this.options.paperId
      })
    }

    this.currentTab = index !== -1 ? index : 0
    this.currentPaper = this.briefList.papers[this.currentTab]
    await this.getPaperKonwledgePointList(this.examId, this.currentPaper.paperId)

    this.showRightButton()
  },
  data() {
    return {
      options: {},
      tagMap: {
        1: '期中',
        2: '期末',
        3: '月考',
        4: '竞赛',
        5: '普通',
      },
      examList: [],
      briefList: [],
      currentTab: 0,
      currentPaper: {},
      tabsStyle: {
        lineWidth: '30rpx',
        lineHeight: '6rpx',
        lineColor: '#FFBA1D',
        inactiveStyle: {
          color: '#939393',
          fontSize: '30rpx',
        },
        activeStyle: {
          color: '#ffba1d',
          fontWeight: '500',
          fontSize: '30rpx',
        },
        itemStyle: {
          height: '76rpx',
          padding: '0 20rpx',
        },
      },
      originStatus: true,
      konwledgeList: [],
      checkedKonwledgeList: [],
      navigatorRecordButtonPic: 'data:image/png;base64,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',
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        type: '',
        params: {},
      },
    }
  },
  computed: {
    isHFSApp() {
      return isHFSApp()
    },
    examProxy() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    examId() {
      return this.options.examId || ''
    },
    paperId() {
      return this.options.paperId || ''
    },
    examOptions() {
      return this.examList.map(v => ({ text: `${uni.$u.timeFormat(v.eventTime, 'yyyymmdd')}${v.grade}${this.tagMap[v.type]}考试`, value: `${v.id}` }))
    },
  },
  methods: {
    dropdownClick() {
      this.$refs.dropdown.style.top = '96rpx'
    },
    async changeDropdown() {
      await this.getExamBriefList(this.options.examId)
      this.currentTab = 0
      this.currentPaper = this.briefList.papers[this.currentTab]
      await this.getPaperKonwledgePointList(this.examId, this.currentPaper.paperId)
    },
    openDropdown() {
      this.$refs.dropdown.toggleItem(0)
    },
    subjectClick(item) {
      if (this.currentPaper.paperId !== item.paperId) {
        this.currentPaper = item
        this.getPaperKonwledgePointList(this.examId, this.currentPaper.paperId)
      }
    },
    isKonwledgeCheck(item) {
      return this.checkedKonwledgeList.findIndex(v => v.id === item.id) > -1
    },
    checkKonwledge(item) {
      const index = this.checkedKonwledgeList.findIndex(v => v.id === item.id)
      if (index > -1) {
        this.checkedKonwledgeList.splice(index, 1)
      }
      else {
        this.checkedKonwledgeList.push(item)
      }
    },
    showRightButton() {
      // #ifdef H5
      if (isHFSApp()) {
        nativeBridge.registerHandler('goOnlinePracticeRecord', () => {
          const target = `${location.origin}/smartPractice/practice/record?examId=${this.examId}`
          nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target }))
        })
        // picHeight: 一倍图的高度
        const buttons = [
          { picture: this.navigatorRecordButtonPic, text: '', actionName: 'goOnlinePracticeRecord()', picHeight: 34 },
        ]
        nativeBridge.callHandler('rightButton', JSON.stringify(buttons))
      }
      // #endif
    },
    goOnlinePracticeRecord() {
      // #ifdef H5
      return uni.navigateTo({
        url: `/smartPractice/practice/record?examId=${this.examId}`,
      })
      // #endif
    },
    customerService() {
      // #ifdef H5
      const isMember = getApp().globalData.userInfo.isMember
      if (this.isMiniProgram) {
        const target = `/pages/wechat/wechatService?isMember=${+isMember}`
        return jWeixin.miniProgram.navigateTo({ url: target })
      }
      const path = isMember ? feConfig.customerServiceVIPLink : feConfig.customerServiceLink
      if (this.isHFSApp) {
        const data = JSON.stringify({ mode: 7, target: 'wwdb589c5c9f4a0905', data: { path } })
        nativeBridge.callHandler('adJump', data)
      }
      else {
        window.open(path)
      }
      // #endif
    },
    showPopup(type, params = {}) {
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    closePopup() {
      this.popup.show = false
    },
    jumpVip() {
      this.closePopup()
      if (isHFSApp()) {
        const eventId = 'ks_zxlx_viptc_ljkt_pay'
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, eventId, data: { eventId } }))
      }
      if (isMiniProgram()) {
        return jWeixin.miniProgram.navigateTo({ url: '/pages/me/member' })
      }

      return uni.navigateTo({ url: '/pages/me/member' })
    },
    async startPractice() {
      if (this.checkedKonwledgeList.length === 0) {
        return uni.$u.toast('请选择知识点')
      }

      if (!getApp().globalData.userInfo.isMember) {
        if (isHFSApp()) {
          if (isHFSStudent()) {
            return uni.$u.toast('请到家长端练习')
          }
          else {
            this.showPopup('vip', { mode: 'bottom' })
            return
          }
        }

        if (isMiniProgram()) {
          return jWeixin.miniProgram.navigateTo({ url: '/pages/me/member' })
        }

        this.showPopup('vip', { mode: 'bottom' })
        return
      }

      const params = {
        examId: this.examId,
        paperId: this.currentPaper.paperId,
        subject: this.currentPaper.subCode,
        knowledges: this.checkedKonwledgeList,
      }
      try {
        const res = await uni.$http.post('/v2/practices/specifics', params)
        const practiceId = res.data.practiceId || ''
        if (practiceId) {
          // #ifdef H5
          if (isHFSApp()) {
            return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${location.origin}/smartPractice/index/index?practiceId=${practiceId}&examId=${this.examId}` }))
          }
          return uni.navigateTo({
            url: `/smartPractice/index/index?practiceId=${practiceId}&examId=${this.examId}`,
          })
          // #endif
        }
      }
      catch (error) {
        if (error.code && error.code === 9932) {
          const practiceId = error.data.practiceId || ''
          if (practiceId) {
            // #ifdef H5
            if (isHFSApp()) {
              return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${location.origin}/smartPractice/index/index?practiceId=${practiceId}&examId=${this.examId}` }))
            }
            return uni.navigateTo({
              url: `/smartPractice/index/index?practiceId=${practiceId}&examId=${this.examId}`,
            })
            // #endif
          }
        }
      }
    },
    async getExamList(examId) {
      const res = await uni.$http.get(`${this.examProxy}/v4/exam/grade?examId=${examId}`)
      this.examList = (res.data || []).reverse()
    },
    // 获取一场考试的简要信息
    async getExamBriefList(examId) {
      const res = await uni.$http.get(`${this.examProxy}/v3/exam/${examId}/brief?withSubPapers=1`)
      this.briefList = res.data
    },
    async getPaperKonwledgePointList(examId, paperId) {
      const res = await uni.$http.get(`${this.examProxy}/v4/exam/cuoti/knowledge-list?examId=${examId}&paperId=${paperId}`)
      this.originStatus = res.data.originStatus
      this.konwledgeList = res.data.knowledges
      this.checkedKonwledgeList = res.data.knowledges.filter(item => item.qlevel > 2)
      if (this.checkedKonwledgeList.length > 5) {
        this.checkedKonwledgeList = this.checkedKonwledgeList.slice(0, 5)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.online-practice {
  min-height: 100vh;

  &__name {
    width: 100%;
    height: 96rpx;
    display: flex;
    align-items: center;
    padding: 0 28rpx;
    box-shadow: 0rpx -1rpx 0rpx 0rpx #e6e6e6 inset;
    .edit {
      width: 32rpx;
      height: 32rpx;
      margin-right: 8rpx;
    }
    .select {
      width: 122rpx;
      height: 34rpx;
      margin-left: 12rpx;
    }
    ::v-deep .zb-dropdown-menu {
      width: fit-content;
      .zb-dropdown-menu__bar {
        height: 96rpx;
        box-shadow: none;
        background-color: transparent;
        .zb-dropdown-menu__title {
          color: #333333;
          font-size: 30rpx;
          padding: 0;
          line-height: 1;
          &--active {
            color: #333333 !important;
          }
          &::after {
            display: none;
          }
        }
      }
      .zb-dropdown-item__content {
        max-height: 332rpx;
        padding: 22rpx 28rpx 0 68rpx;
        border-radius: 0 0 24rpx 24rpx;
      }
      .zb-dropdown-item__option {
        width: 100%;
        padding: 0;
        color: #333333;
        font-size: 28rpx;
        line-height: 40rpx;
        margin-bottom: 24rpx;
        &::after {
          display: none;
        }
        .zb-cell__title {
          &.active-cell__title {
            color: #ffba1d !important;
            &::after {
              border: 6rpx solid #ffba1d;
            }
          }
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            right: 0;
            width: 28rpx;
            height: 28rpx;
            border: 1rpx solid #939393;
            border-radius: 50%;
            transform: translateY(-50%);
            box-sizing: border-box;
          }
        }
        .zb-cell__value {
          display: none;
        }
      }
    }
    .btn {
      width: 156rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #ffffff;
      font-weight: 500;
      background: linear-gradient(225deg, #ffbd57, #ffa822);
      border-radius: 200rpx;
      margin-left: auto;
    }
  }

  &__container {
    min-height: calc(100vh - 96rpx - 76rpx);
    padding-bottom: 128rpx;
    overflow: hidden;
    background: #f6f6f6;

    .content {
      overflow: hidden;
      margin: 24rpx 28rpx;
      background: #ffffff;
      border-radius: 24rpx;

      .konwledge-list {
        overflow: hidden;
        margin: 24rpx 28rpx 40rpx 28rpx;
        height: 500rpx;
        border-radius: 16rpx;

        &__scroll {
          height: 434rpx;
        }

        &__item {
          background: #f8f8f8;

          display: flex;

          &.whiite-background {
            background: #ffffff;
          }

          .column {
            overflow: hidden;
            display: flex;

            .title {
              padding: 18rpx 0 16rpx 0;
              width: 100%;
              font-size: 22rpx;
              color: #939393;

              display: flex;
              align-items: center;
              justify-content: center;

              &.emphasis {
                color: #333333;
              }

              .icon {
                width: 32rpx;
                height: 32rpx;
              }

              .star-content {
                display: flex;
                align-items: center;

                .star {
                  width: 22rpx;
                  height: 22rpx;
                  margin-right: 5rpx;
                }
              }
            }

            &.select {
              width: 108rpx;
            }

            &.name {
              width: calc(100% - 108rpx - 202rpx);
            }

            &.level {
              width: 202rpx;
            }
          }
        }

        &__no-data {
          height: 434rpx;

          display: flex;
          align-items: center;
          justify-content: center;

          .no-paper {
            min-height: 194rpx;
            background: #fff;

            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            &-title {
              width: 112rpx;
              height: 40rpx;
              font-size: 28rpx;
              color: #333333;

              display: flex;
              justify-content: center;
              align-items: center;
            }

            &-content {
              margin-top: 8rpx;
              width: 528rpx;
              height: 108rpx;
              font-size: 26rpx;
              color: #939393;

              &.no-data {
                display: flex;
                justify-content: center;
                align-items: center;
              }

              &__emphasize {
                color: #333333;
                font-weight: 500;
              }
            }

            &-customer-service {
              margin: 30rpx 0 0 0;
              width: 198rpx;
              height: 56rpx;
              background: linear-gradient(225deg, #ffc749, #ffba1d);
              border-radius: 28rpx;

              display: flex;
              justify-content: center;
              align-items: center;

              &__text {
                font-size: 28rpx;
                color: #ffffff;

                display: flex;
                justify-content: center;
                align-items: center;
              }
            }
          }
        }
      }

      .tips {
        margin: 50rpx 28rpx 38rpx 28rpx;

        &-image {
          width: 100%;
        }
      }
    }
  }

  &__footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 128rpx;
    background-color: #fff;
    box-shadow: 0rpx -4rpx 12rpx 0rpx rgba(0, 0, 0, 0.03);

    .btn {
      margin: 20rpx 28rpx 0 28rpx;
      height: 88rpx;
      border-radius: 44rpx;
      background: linear-gradient(225deg, #ffc749, #ffba1d);

      font-size: 30rpx;
      font-weight: 500;
      color: #ffffff;

      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .export {
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
  }

  .task-popup {
    position: relative;
    width: 600rpx;
    background: #ffffff;
    border-radius: 60rpx;
    padding: 48rpx 64rpx 32rpx;
    &__title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 32rpx;
      text-align: center;
    }
    &__content {
      font-size: 30rpx;
      color: #333333;
      line-height: 42rpx;
      .active {
        color: #f8a800;
        font-weight: 500;
      }
    }
    &__container {
      background: #f6f6f6;
      border-radius: 20rpx;
      padding: 18rpx 16rpx 18rpx 18rpx;
      font-size: 28rpx;
      color: #333333;
      .desc {
        display: flex;
        margin-bottom: 20rpx;
        &-title {
          white-space: nowrap;
          color: #939393;
        }
        &-name {
          color: #333333;
        }
      }
      :last-child {
        margin-bottom: 0;
      }
    }
    &__check {
      display: flex;
      align-items: center;
      margin-top: 16rpx;
      .icon {
        width: 30rpx;
        height: 30rpx;
      }
      .count {
        font-size: 24rpx;
        margin-left: 8rpx;
        text-align: left;
        color: #939393;
        .active {
          color: #ffba1d;
        }
      }
    }
    &__tips {
      color: #ff0000;
      font-size: 22rpx;
      margin: 38rpx 0 16rpx;
    }
    &__btn {
      width: 236rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: #ffffff;
      font-weight: 500;
      background: linear-gradient(225deg, #ffc749, #ffba1d);
      border-radius: 36rpx;
      margin: 0 auto;
    }
    &__close {
      position: absolute;
      top: 35rpx;
      right: 40rpx;
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
    &.vip {
      width: 100%;
      padding: 28rpx 34rpx 24rpx;
      border-radius: 44rpx 44rpx 0 0;
      .task-popup {
        &__title {
          margin-bottom: 28rpx;
        }
        &__content {
          margin-bottom: 94rpx;
          padding: 0 32rpx;
          .desc {
            font-size: 28rpx;
            color: #333333;
            line-height: 40rpx;
            margin-bottom: 36rpx;
          }
          .pic {
            width: 100%;
          }
        }
        &__btn {
          width: 682rpx;
          height: 84rpx;
          background: linear-gradient(225deg, #ffa430 0%, #ff7426);
          border-radius: 42rpx;
        }
        &__close {
          top: 28rpx;
          right: 34rpx;
        }
        &::before {
          width: 316rpx;
          height: 166rpx;
          opacity: 0.08;
          background: #67fffe;
          border-radius: 50%;
          filter: blur(100rpx);
        }
        &::after {
          width: 378rpx;
          height: 316rpx;
          opacity: 0.1;
          background: #ffba1d;
          border-radius: 50%;
          filter: blur(100rpx);
        }
      }
    }
  }
}
</style>
