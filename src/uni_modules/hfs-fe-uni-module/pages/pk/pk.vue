<template>
  <view class="pk">
    <view v-if="schedule === 'match'" class="pk-match">
      <view class="pk-match__info">
        <view class="pk-match__title">
          <u-transition :show="showMatch" mode="fade" duration="1000">
            <image class="star" :src="`${resourceUrl}pk_star.png`" mode="widthFix" />
            <view class="title">
              {{ theme.name }}
            </view>
          </u-transition>
        </view>
        <view class="pk-match__list">
          <view class="pk-match__item">
            <u-transition :show="showMatch" mode="fade-left" duration="1000">
              <view class="content">
                <view class="content-avatar">
                  <image class="content-avatar__icon" :src="`${resourceUrl}avatar.png`" mode="widthFix" />
                  <view class="content-avatar__name">
                    <text class="active">
                      我
                    </text>
                  </view>
                </view>
                <view class="content-nickname">
                  <view class="text">
                    {{ myPKInfo.stuName || myPKInfo.nickName }}
                  </view>
                </view>
                <view class="content-win">
                  <text>
                    <text class="active">
                      {{ myPKInfo.win }}
                    </text>胜场
                  </text>
                </view>
              </view>
              <image class="bg" :src="`${resourceUrl}pk_p.png`" mode="widthFix" />
            </u-transition>
          </view>
          <view class="pk-match__item rival">
            <u-transition :show="showMatch" mode="fade-right" duration="1000">
              <view class="content">
                <view class="content-avatar">
                  <image class="content-avatar__icon" :src="`${resourceUrl}avatar.png`" mode="widthFix" />
                  <view class="content-avatar__name">
                    <text class="active">
                      对手
                    </text>
                  </view>
                </view>
                <view v-if="opponent.nickName" class="content-nickname">
                  <view class="text">
                    {{ opponent.stuName || opponent.nickName }}
                  </view>
                </view>
                <template v-else>
                  <view v-if="isRobot" class="content-progress">
                    匹配中<view class="dot">
                      ...
                    </view>
                  </view>
                  <view v-else class="content-wait">
                    等待好友加入<view class="dot">
                      ...
                    </view>
                  </view>
                </template>
                <view v-if="opponent.nickName" class="content-win">
                  <text>
                    <text class="active">
                      {{ opponent.win }}
                    </text>胜场
                  </text>
                </view>
              </view>
              <image class="bg" :src="`${resourceUrl}pk_k.png`" mode="widthFix" />
            </u-transition>
          </view>
          <view class="pk-match__lightning">
            <u-transition :show="showMatch" mode="fade-zoom" duration="1000">
              <image class="pic" :src="`${resourceUrl}pk_lightning.png`" mode="widthFix" />
            </u-transition>
          </view>
        </view>
      </view>
      <view class="pk-match__bg">
        <image class="one" :src="`${resourceUrl}pk_star_one.png`" mode="widthFix" />
        <image class="group" :src="`${resourceUrl}pk_star_group.png`" mode="widthFix" />
        <image class="calc" :src="`${resourceUrl}pk_calc.png`" mode="widthFix" />
      </view>
    </view>
    <view v-if="schedule === 'countdown'" class="pk-countdown">
      <view class="pk-countdown__content">
        <image class="countdown" :src="`${resourceUrl}pk_countdown.png`" mode="widthFix" />
        <image v-if="countDown > 1" class="ready" :src="`${resourceUrl}pk_ready.png`" mode="widthFix" />
        <image v-else class="go" :src="`${resourceUrl}pk_go.png`" mode="widthFix" />
      </view>
    </view>
    <view v-if="questions.length" class="pk-content">
      <view class="pk-content__header">
        <view class="header-item">
          <view class="header-item__avatar">
            <image class="icon" :src="`${resourceUrl}avatar.png`" mode="widthFix" />
            <view class="name">
              <text class="active">
                我
              </text>
            </view>
          </view>
          <view class="header-item__num">
            已答{{ index + 1 }}题
          </view>
        </view>
        <view class="header-item rival">
          <view class="header-item__avatar">
            <image class="icon" :src="`${resourceUrl}avatar.png`" mode="widthFix" />
            <view class="name">
              <text class="active">
                对手
              </text>
            </view>
          </view>
          <view v-if="isRobot" class="header-item__num">
            已答{{ robotIndex }}题
          </view>
          <view v-else class="header-item__num">
            {{ opponent.time }}秒
          </view>
        </view>
        <image class="header-icon" :src="`${resourceUrl}pk_lightning_small.png`" />
      </view>
      <view class="pk-content__question">
        <view class="questions">
          <QuestionRender :question="questionItem" :custom-style="{ color: '#66451b', fontSize: `${96 - itemLength * 4}rpx` }">
            <template #default="{ props }">
              <view class="questions-rect" :class="{ compare: props.isCompare }" :style="{ fontSize: `${80 - selectedLength * 6}rpx` }">
                <QuestionItem :item="selected || '?'" :is-fraction="isFraction" />
              </view>
            </template>
          </QuestionRender>
        </view>
        <view class="time">
          <view class="time-text">
            {{ $u.timeFormat(duration * 1000 || 1, 'MM : ss') }}
          </view>
          <image class="time-icon" :src="`${resourceUrl}pk_${isPlay ? 'play' : 'pause'}.png`" mode="widthFix" @click="audioPause" />
        </view>
        <image class="frame" :src="`${resourceUrl}pk_frame.png`" mode="widthFix" />
      </view>
      <view class="pk-content__answer">
        <view v-for="(item, index) in questionItem.options" :key="index" class="answer-item" @click="selectAnswer(item)">
          <image v-if="selected === item.answer && item.right" class="answer-item__icon right" :src="`${resourceUrl}pk_right.png`" mode="widthFix" />
          <image v-if="selected === item.answer && !item.right" class="answer-item__icon wrong" :src="`${resourceUrl}pk_wrong.png`" mode="widthFix" />
          <view class="answer-item__text">
            <QuestionItem :item="item.answer" :is-fraction="isFraction" />
          </view>
        </view>
      </view>
    </view>
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" :overlay-style="popup.overlayStyle" bg-color="transparent">
      <view v-if="popup.type === 'back'" class="pk-popup__tips">
        <view class="title">
          温馨提示
        </view>
        <view class="content">
          中途离开将会被记为失败哦，确定要离开吗？
        </view>
        <view class="button">
          <view class="btn" @click="goBack">
            离开
          </view>
          <view class="btn active" @click="closePopup">
            继续答题
          </view>
        </view>
      </view>
      <view v-if="popup.type === 'timeout'" class="pk-popup__tips">
        <view class="title">
          温馨提示
        </view>
        <view class="content">
          本局答题时间过长，已被记为失败，集中注意力再来答题吧~
        </view>
        <view class="button">
          <view class="btn active fill" @click="goBack">
            返回
          </view>
        </view>
      </view>
      <view v-if="popup.type === 'result'" class="pk-popup__result">
        <view class="content">
          <image v-if="popup.pkType === 1" class="content-header" :src="`${resourceUrl}pk_victory.png`" mode="widthFix" />
          <image v-if="popup.pkType === 2" class="content-header" :src="`${resourceUrl}pk_tie.png`" mode="widthFix" />
          <image v-if="popup.pkType === 3" class="content-header" :src="`${resourceUrl}pk_fail.png`" mode="widthFix" />
          <view class="content-title">
            +{{ popup.currentScore }}战力值
          </view>
          <view class="content-time">
            用时{{ duration }}秒
          </view>
          <view class="content-list">
            <view class="content-list__item">
              <view class="avatar">
                <image v-if="popup.pkType === 1" class="avatar-crown" :src="`${resourceUrl}pk_crown.png`" mode="widthFix" />
                <image class="avatar-icon" :src="`${resourceUrl}avatar.png`" mode="widthFix" />
                <view class="avatar-name">
                  <text class="active">
                    我
                  </text>
                </view>
              </view>
              <view class="nickname">
                {{ popup.myPKInfo.stuName || popup.myPKInfo.nickName }}
              </view>
              <view class="win">
                胜{{ popup.myPKInfo.win }}场
              </view>
            </view>
            <view class="content-list__item rival">
              <view class="avatar">
                <image v-if="popup.pkType === 3" class="avatar-crown" :src="`${resourceUrl}pk_crown.png`" mode="widthFix" />
                <image class="avatar-icon" :src="`${resourceUrl}avatar.png`" mode="widthFix" />
                <view class="avatar-name">
                  <text class="active">
                    对手
                  </text>
                </view>
              </view>
              <view class="nickname">
                {{ popup.opponent.stuName || popup.opponent.nickName }}
              </view>
              <view class="win">
                胜{{ popup.opponent.win }}场
              </view>
            </view>
          </view>
          <view class="content-review" @click="goReview">
            本局回顾<u-icon name="arrow-right" color="rgba(93,74,20,0.7)" bold size="24rpx" custom-style="margin-left: 5rpx;" />
          </view>
          <view class="content-close" @click="goBack">
            <u-icon name="close" color="#5D4A14" bold size="32rpx" />
          </view>
          <view class="content-button">
            <view class="btn" @click="shareChallenge">
              分享战绩
            </view>
            <view class="btn active" @click="goRank">
              查看PK榜
            </view>
          </view>
        </view>
        <image class="bg" :src="`${resourceUrl}pk_end_bg.png`" mode="widthFix" />
        <view v-if="popup.isUp" class="up" @click="popup.isUp = false">
          <view class="up-content">
            <view class="up-content__dan">
              <view class="brand">
                <view class="brand-name">
                  {{ popup.rankName }}
                </view>
                <image class="brand-icon" :src="`${resourceUrl}${popup.rankNormalBrand}`" mode="widthFix" />
              </view>
              <image class="icon" :src="`${resourceUrl}${popup.rankNormalIcon}`" mode="widthFix" />
            </view>
            <image class="up-content__light" :src="`${resourceUrl}pk_light_large.png`" mode="widthFix" />
            <image class="up-content__text" :src="`${resourceUrl}pk_up.png`" mode="widthFix" />
          </view>
        </view>
      </view>
    </u-popup>
    <Share ref="share" />
  </view>
</template>

<script>
import QuestionItem from './components/questionItem.vue'
import QuestionRender from './components/questionRender.vue'
import Share from './components/share.vue'
import { nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { QuestionItem, QuestionRender, Share },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/pk/images/',
      audioUrl: 'https://fe-resource.haofenshu.com/pk/audio/',
      options: {},
      schedule: 'match',
      showMatch: true,
      myPKInfo: {},
      opponent: {},
      theme: {},
      countDown: 2,
      duration: 0,
      questions: [],
      index: 0,
      robotCount: 1,
      selected: '',
      isPlay: true,
      isFinish: false,
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        overlayStyle: {
          background: 'rgba(0, 0, 0, 0.7)',
        },
        type: '',
      },
      innerAudioContext: {},
      audioContext: uni.createInnerAudioContext(),
    }
  },
  computed: {
    isRobot() {
      return !this.options.inviteCode
    },
    robotIndex() {
      const { internal = {} } = this.opponent || {}
      const num = internal[this.duration]
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.robotCount = num || this.robotCount
      return this.robotCount
    },
    questionItem() {
      return this.questions[this.index] || {}
    },
    isFraction() {
      const { numType } = this.questionItem
      return numType === 2
    },
    itemLength() {
      if (this.isFraction)
        return 2
      const { item1 = 0, item2 = 0 } = this.questionItem
      return `${item1}${item2}`.length
    },
    selectedLength() {
      if (this.isFraction)
        return 4
      return this.selected ? `${this.selected}`.length : 0
    },
    rankInfoList() {
      return uni.getStorageSync('rankInfoList') || []
    },
  },
  onLoad(options) {
    this.options = options
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('pkAudio', (data) => {
      this.innerAudioContext = data.innerAudioContext
    })
    this.randomMatch()
    // #ifdef H5
    this.backClick()
    // #endif
  },
  onUnload() {
    this.audioDestroy()
  },
  beforeUnmount() {
    this.audioDestroy()
  },
  methods: {
    // 获取匹配信息
    async getMatchInfo() {
      const { code, inviteCode } = this.options
      return await uni.$http.get(`${feConfig.api.znyx}/api/pk/opponent${uni.$u.queryParams({ code, inviteCode })}`, {}, { custom: { loading: false } })
    },
    // 获取题目
    async getQuestions() {
      const { code } = this.options
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/pk/questions${uni.$u.queryParams({ code })}`, {}, { custom: { loading: false } })
      const { questions = [] } = res.Data || {}
      this.questions = questions
      uni.setNavigationBarTitle({ title: `共${questions.length}题` })
    },
    // 提交答题时间
    async submitDuration() {
      const res = await uni.$http.post(`${feConfig.api.znyx}/api/pk/finish`, { duration: this.duration })
      const { myPKInfo, opponent, isUp, currentScore, type, rank, rankName } = res.Data || {}
      const { rankNormalIcon, rankNormalBrand } = this.rankInfoList[rank] || {}
      this.showPopup('result', { myPKInfo, opponent, isUp, currentScore, pkType: type, rankName, rankNormalIcon, rankNormalBrand })
    },
    // 匹配对手
    async randomMatch() {
      const res = await this.getMatchInfo()
      const { myPKInfo = {}, opponent = {}, theme = {} } = res.Data || {}
      uni.setNavigationBarTitle({ title: theme.name })
      this.myPKInfo = myPKInfo
      this.theme = theme
      this.getQuestions()
      await this.randomWait(1000, 2000)
      this.opponent = opponent
      await this.randomWait(1000, 2000)
      this.showMatch = false
      await uni.$u.sleep(1000)
      this.countDownLoading()
    },
    // 倒计时
    countDownLoading() {
      this.schedule = 'countdown'
      this.playAudio(`${this.audioUrl}go.mp3`)
      this.timer(() => {
        this.countDown--
        if (this.countDown <= 0) {
          this.startAnswer()
          return true
        }
      })
    },
    // 开始答题
    startAnswer() {
      this.schedule = 'answer'
      this.playAudio(`${this.audioUrl}bgm.mp3`, true)
      this.timer(() => {
        if (this.isFinish)
          return true
        this.duration++
      })
    },
    // 选择答案
    async selectAnswer(item) {
      if (this.isFinish)
        return
      this.selected = item.answer
      await uni.$u.sleep(300)
      this.selected = ''
      if (item.right) {
        this.playAudioOnce(`${this.audioUrl}right.mp3`)
        return this.nextQuestion()
      }
      this.playAudioOnce(`${this.audioUrl}wrong.mp3`)
    },
    nextQuestion() {
      if (this.isFinish)
        return
      if (this.index >= this.questions.length - 1) {
        this.isFinish = true
        this.playAudio(`${this.audioUrl}finish.mp3`)
        this.submitDuration()
        return
      }
      this.index++
    },
    backClick() {
      // #ifdef H5
      nativeBridge.registerHandler('backClick', () => {
        const page = uni.$u.page()
        if (page.includes('pages/pk/pk') && !this.isFinish)
          return this.showPopup('back')
        return this.goBack()
      })
      nativeBridge.callHandler('leftButton', 'backClick()')
      // #endif
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
    goReview() {
      return uni.navigateTo({
        url: '/uni_modules/hfs-fe-uni-module/pages/pk/review',
        success: (res) => {
          res.eventChannel.emit('pkInfo', { questions: this.questions, duration: this.duration, theme: this.theme })
        },
      })
    },
    goRank() {
      return uni.navigateTo({
        url: '/uni_modules/hfs-fe-uni-module/pages/pk/rank',
      })
    },
    shareChallenge() {
      report('pk', 'sy_fxzj')
      const { rankName, rankNormalIcon } = this.popup
      this.$refs.share.init({ type: 2, name: this.myPKInfo.stuName, code: this.theme.code, rankName, rankNormalIcon })
    },
    playAudio(src, loop = false) {
      if (!this.isPlay)
        return
      Object.assign(this.innerAudioContext, { src, loop, autoplay: true })
      this.innerAudioContext.onCanplay(() => {
        this.innerAudioContext.play()
      })
    },
    playAudioOnce(src) {
      if (!this.isPlay)
        return
      Object.assign(this.audioContext, { src, autoplay: true })
      this.audioContext.onCanplay(() => {
        this.audioContext.play()
      })
    },
    audioPause() {
      if (this.isPlay && !this.innerAudioContext.paused) {
        this.isPlay = false
        this.innerAudioContext.pause()
      }
      else {
        this.isPlay = true
        this.innerAudioContext.play()
      }
    },
    audioDestroy() {
      this.isPlay = false
      this.innerAudioContext && this.innerAudioContext.destroy()
      this.audioContext && this.audioContext.destroy()
    },
    async randomWait(min, max) {
      const time = uni.$u.random(min, max)
      await uni.$u.sleep(time)
    },
    async timer(fn, time = 1000) {
      if (!fn)
        return
      while (true) {
        await uni.$u.sleep(time)
        const res = await fn()
        if (res)
          break
      }
    },
    showPopup(type, params = {}) {
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    closePopup() {
      this.popup.show = false
    },
  },
}
</script>

<style lang="scss" scoped>
.pk {
  min-height: 100vh;
  background: #fcf5db;
  &-match {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100%;
    min-height: 100vh;
    z-index: 100;
    &__info {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1;
    }
    &__title {
      padding-top: 82rpx;
      margin-bottom: 180rpx;
      .star {
        width: 470rpx;
        height: 158rpx;
        margin: 0 auto;
      }
      .title {
        color: #ffffff;
        font-size: 52rpx;
        font-weight: bold;
        text-align: center;
        margin-top: -68rpx;
      }
    }
    &__list {
      position: relative;
    }
    &__item {
      position: relative;
      width: 408rpx;
      height: 326rpx;
      .content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        &-avatar {
          position: absolute;
          left: 66rpx;
          width: 132rpx;
          height: 132rpx;
          border-radius: 50%;
          border: 4rpx solid #416aff;
          transform: translateY(-50%);
          &__icon {
            width: 100%;
            height: 100%;
          }
          &__name {
            position: absolute;
            right: -94rpx;
            top: 50%;
            width: 118rpx;
            height: 42rpx;
            font-size: 24rpx;
            color: #ffffff;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 38rpx;
            background-image: linear-gradient(270deg, #2db8ff 0%, #416aff 97%);
            border: 2rpx solid rgba(255, 255, 255, 0.3);
            border-radius: 6rpx;
            transform: translateY(-50%) skewX(-10deg);
            z-index: -1;
            .active {
              transform: skewX(10deg);
            }
          }
        }
        &-nickname {
          position: absolute;
          left: 132rpx;
          top: 74rpx;
          color: #ffffff;
          font-size: 28rpx;
          font-weight: bold;
          white-space: nowrap;
          .text {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
          }
        }
        &-progress,
        &-wait {
          position: absolute;
          right: 66rpx;
          top: 50%;
          color: #ffffff;
          font-size: 44rpx;
          font-weight: bold;
          transform: translateY(-50%);
          .dot {
            display: inline-flex;
            width: 1.5em;
            overflow: hidden;
            animation: dot 3s infinite step-start;
          }
        }
        &-wait {
          right: 26rpx;
          font-size: 36rpx;
        }
        &-win {
          position: absolute;
          left: 0;
          bottom: 44rpx;
          width: 228rpx;
          height: 118rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26rpx;
          color: #ffffff;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.3),
            rgba(255, 255, 255, 0)
          );
          .active {
            font-size: 52rpx;
            font-weight: bold;
            margin-right: 10rpx;
          }
        }
      }
      .bg {
        width: 408rpx;
        height: 326rpx;
      }
      &.rival {
        position: absolute;
        top: 128rpx;
        right: 0;
        .content {
          &-avatar {
            left: auto;
            right: 66rpx;
            border-color: #ff4646;
            &__name {
              left: -94rpx;
              background-image: linear-gradient(
                270deg,
                #ff4646 0%,
                #ff8246 97%
              );
              border: 2rpx solid rgba(255, 255, 255, 0.3);
            }
          }
          &-nickname {
            left: auto;
            right: 132rpx;
          }
          &-win {
            left: auto;
            right: 0;
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0),
              rgba(255, 255, 255, 0.3)
            );
          }
        }
      }
    }
    &__lightning {
      position: absolute;
      top: 26rpx;
      left: 45%;
      z-index: 2;
      .pic {
        width: 80rpx;
        height: 312rpx;
      }
    }
    &__bg {
      width: 100%;
      height: 100%;
      padding-top: 266rpx;
      background-image: linear-gradient(180deg, #ffc203 0%, #fff7ca 20%);
      .one {
        width: 128rpx;
        height: 124rpx;
      }
      .group {
        margin: 24rpx 0 0 auto;
        width: 220rpx;
        height: 218rpx;
      }
      .calc {
        margin: 200rpx 0 0 auto;
        width: 148rpx;
        height: 162rpx;
      }
    }
  }
  &-countdown {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100%;
    min-height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    z-index: 100;
    &__content {
      padding-top: 300rpx;
      .countdown {
        width: 100%;
        height: 442rpx;
      }
      .ready,
      .go {
        position: absolute;
        left: 50%;
        top: 486rpx;
        transform: translateX(-50%);
        width: 438rpx;
        height: 218rpx;
        z-index: 1;
      }
      .go {
        width: 170rpx;
        height: 156rpx;
      }
    }
  }
  &-content {
    padding: 48rpx 28rpx 0;
    &__header {
      position: relative;
      display: flex;
      align-items: center;
      margin-bottom: 60rpx;
      .header-item {
        position: relative;
        width: 50%;
        height: 82rpx;
        display: flex;
        align-items: center;
        background: linear-gradient(90deg, #4172ff, #41a0ff 95%);
        border-radius: 200rpx 0 0 200rpx;
        &__avatar {
          position: absolute;
          left: 20rpx;
          bottom: 22rpx;
          width: 92rpx;
          height: 92rpx;
          border-radius: 50%;
          border: 3rpx solid #416aff;
          z-index: 1;
          .icon {
            width: 100%;
            height: 100%;
          }
          .name {
            position: absolute;
            right: -78rpx;
            top: 4rpx;
            width: 118rpx;
            height: 42rpx;
            font-size: 24rpx;
            color: #ffffff;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 38rpx;
            background-image: linear-gradient(270deg, #2db8ff 0%, #416aff 97%);
            border: 2rpx solid rgba(255, 255, 255, 0.3);
            border-radius: 6rpx;
            transform: skewX(-10deg);
            z-index: -1;
            .active {
              transform: skewX(10deg);
            }
          }
        }
        &__num {
          width: 100%;
          font-size: 30rpx;
          color: #ffffff;
          font-weight: bold;
          padding-left: 158rpx;
        }
        &.rival {
          background: linear-gradient(
            88deg,
            #ff8839 2%,
            #ff5044 95%,
            #ff5044 95%
          );
          border-radius: 0 200rpx 200rpx 0;
          .header-item {
            &__avatar {
              left: auto;
              right: 20rpx;
              border-color: #ff4646;
              .name {
                left: -78rpx;
                padding-right: 40rpx;
                background-image: linear-gradient(
                  270deg,
                  #ff4646 0%,
                  #ff8246 97%
                );
                border: 2rpx solid rgba(255, 255, 255, 0.3);
              }
            }
            &__num {
              padding-left: 0;
              padding-right: 158rpx;
              text-align: right;
            }
          }
        }
      }
      .header-icon {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 82rpx;
      }
    }
    &__question {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 114rpx;
      .questions {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        &-rect {
          width: 144rpx;
          height: 144rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffedca;
          border-radius: 24rpx;
          flex-shrink: 0;
          &.compare {
            margin: 0 44rpx;
          }
        }
      }
      .time {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 88rpx;
        z-index: 10;
        &-text {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32rpx;
          color: #9e4c22;
          font-weight: bold;
          z-index: 1;
        }
        &-icon {
          position: absolute;
          top: 50%;
          right: 44rpx;
          width: 44rpx;
          height: 44rpx;
          transform: translateY(-50%);
        }
      }
      .frame {
        width: 100%;
        height: 562rpx;
        z-index: 1;
      }
    }
    &__answer {
      .answer-item {
        position: relative;
        width: 100%;
        height: 112rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fffbf3;
        border: 2rpx solid #fdd688;
        border-radius: 32rpx;
        box-shadow: 0rpx 4rpx 0rpx 0rpx #fbaa46;
        margin-bottom: 40rpx;
        &__icon {
          position: absolute;
          bottom: 0;
          right: 36rpx;
          &.wrong {
            width: 52rpx;
            height: 52rpx;
          }
          &.right {
            width: 60rpx;
            height: 52rpx;
          }
        }
        &__text {
          color: #333333;
          font-size: 40rpx;
        }
      }
    }
  }
  &-popup {
    &__tips {
      width: 544rpx;
      background: linear-gradient(180deg, #fff9c0, #ffffff 19%);
      border: 2rpx solid #ffffff;
      border-radius: 52rpx;
      padding: 30rpx 36rpx 36rpx;
      .title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333333;
        text-align: center;
        margin-bottom: 36rpx;
      }
      .content {
        font-size: 32rpx;
        color: #333333;
        line-height: 44rpx;
        margin-bottom: 66rpx;
      }
      .button {
        display: flex;
        justify-content: space-between;
        .btn {
          width: 230rpx;
          height: 76rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32rpx;
          color: #939393;
          background: #e6e6e6;
          border-radius: 42rpx;
          &.fill {
            width: 100%;
          }
          &.active {
            background: linear-gradient(225deg, #ffbc2c 0%, #ffa112);
            color: #ffffff;
          }
        }
      }
    }
    &__result {
      position: relative;
      width: 654rpx;
      .content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 84rpx 0 36rpx;
        z-index: 1;
        &-header {
          position: absolute;
          top: -256rpx;
          left: 50%;
          width: 100%;
          height: 308rpx;
          transform: translateX(-50%);
        }
        &-title {
          position: relative;
          color: #5d4a14;
          font-size: 40rpx;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20rpx;
          &::before {
            content: '';
            position: absolute;
            left: 50%;
            bottom: 0;
            width: 228rpx;
            height: 18rpx;
            background: #ffd369;
            border-radius: 10rpx;
            transform: translateX(-50%);
            z-index: -1;
          }
        }
        &-time {
          color: #5d4a14;
          font-size: 32rpx;
          text-align: center;
          margin-bottom: 26rpx;
        }
        &-list {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 60rpx;
          &__item {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            margin-bottom: 66rpx;
            .avatar {
              position: relative;
              width: 112rpx;
              height: 112rpx;
              border-radius: 50%;
              margin-bottom: 18rpx;
              border: 4rpx solid #416aff;
              &-crown {
                position: absolute;
                top: -32rpx;
                left: -32rpx;
                width: 72rpx;
                height: 72rpx;
                z-index: 1;
              }
              &-icon {
                width: 100%;
                height: 100%;
              }
              &-name {
                position: absolute;
                right: -82rpx;
                top: 50%;
                width: 118rpx;
                height: 42rpx;
                font-size: 24rpx;
                color: #ffffff;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                padding-right: 38rpx;
                background-image: linear-gradient(
                  270deg,
                  #2db8ff 0%,
                  #416aff 97%
                );
                border: 2rpx solid rgba(255, 255, 255, 0.3);
                border-radius: 6rpx;
                transform: translateY(-50%) skewX(-10deg);
                z-index: -1;
                .active {
                  transform: skewX(10deg);
                }
              }
            }
            .nickname {
              color: #5d4a14;
              font-size: 28rpx;
              font-weight: bold;
              margin-bottom: 2rpx;
            }
            .win {
              font-size: 24rpx;
              color: rgba(93, 74, 20, 0.7);
            }
            &.rival {
              .avatar {
                border-color: #ff4646;
                &-crown {
                  left: 64rpx;
                  transform: rotateY(180deg);
                }
                &-name {
                  left: -82rpx;
                  background-image: linear-gradient(
                    270deg,
                    #ff4646 0%,
                    #ff8246 97%
                  );
                  border: 2rpx solid rgba(255, 255, 255, 0.3);
                }
              }
            }
          }
        }
        &-review {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28rpx;
          color: rgba(93, 74, 20, 0.7);
        }
        &-close {
          position: absolute;
          top: 40rpx;
          right: 40rpx;
        }
        &-button {
          position: absolute;
          bottom: -136rpx;
          left: 0;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .btn {
            width: 322rpx;
            height: 96rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36rpx;
            color: #333333;
            background: #ffffff;
            border-radius: 54rpx;
            &.active {
              color: #ffffff;
              font-weight: bold;
              background: linear-gradient(225deg, #ffbc2c 0%, #ffa112);
            }
          }
        }
      }
      .bg {
        width: 100%;
        height: 578rpx;
      }
      .up {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.7);
        &-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          &__dan {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
            .brand {
              position: absolute;
              bottom: 60rpx;
              left: 50%;
              transform: translateX(-50%);
              z-index: 1;
              &-name {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                color: #ffffff;
                font-size: 48rpx;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1;
              }
              &-icon {
                width: 266rpx;
                height: 82rpx;
              }
            }
            .icon {
              width: 380rpx;
              height: 380rpx;
            }
          }
          &__light {
            width: 628rpx;
            height: 628rpx;
          }
          &__text {
            width: 340rpx;
            height: 47rpx;
            margin: -32rpx auto 0;
          }
        }
      }
    }
  }
}
@keyframes dot {
  0% {
    width: 0;
    margin-right: 1.5em;
  }
  33% {
    width: 0.2em;
    margin-right: 1.3em;
  }
  66% {
    width: 0.5em;
    margin-right: 1em;
  }
  100% {
    width: 1.5em;
    margin-right: 0;
  }
}
</style>
