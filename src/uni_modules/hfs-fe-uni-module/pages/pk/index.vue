<template>
  <view class="index" @click="closePop">
    <view class="index-content">
      <view class="img">
        <image class="img-title" :src="`${resourceUrl}index_title.gif`" />
        <image class="img-left" :src="`${resourceUrl}index_star_left.png`" />
        <image class="img-right" :src="`${resourceUrl}index_star_right.png`" />
      </view>
      <view class="index-content__userinfo">
        <image class="icon" :src="`${resourceUrl}avatar.png`" />
        <view class="user">
          <view class="user-name">
            {{ homeInfo.stuName || homeInfo.nickName }}
          </view>
          <view class="user-rank">
            今日剩余挑战次数：{{ taskInfo.chance }}次
          </view>
        </view>
        <view class="challenge" @click="challengeClick">
          与好友挑战
        </view>
      </view>
      <view class="index-content__pk">
        <MouthPk
          ref="mouthPk" :pk-info="homeInfo" :level-map="levelMap" :remain-chance="taskInfo.chance"
          @friend-match="friendMatch"
        />
      </view>
      <view class="index-content__task">
        <HomeTask
          :pk-info="homeInfo" :task-list="taskInfo.taskList" :chance="taskInfo.chance"
          @task-operate="taskOperate" @show-record-list="showPopup('record')"
        />
      </view>
      <RecordPopup
        ref="popup" :pk-info="homeInfo" :pk-share="pkShare" :remain-chance="taskInfo.chance"
        :task-records="taskInfo.taskRecords" @remain-bind="remainBind"
      />
    </view>
    <image class="index-bg" :src="`${resourceUrl}index_bg.png`" />
    <Share ref="share" @success="shareSuccess" />
  </view>
</template>

<script>
import MouthPk from './components/mouthPk.vue'
import HomeTask from './components/homeTask.vue'
import RecordPopup from './components/taskRecord.vue'
import Share from './components/share.vue'
import { nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { MouthPk, HomeTask, RecordPopup, Share },
  data() {
    return {
      resourceUrl: `${feConfig.resourceUrl}/pk/images/`,
      homeInfo: {},
      rankMap: {},
      levelMap: {},
      options: {},
      pkShare: {},
      taskInfo: {},
      isShareTaskTag: false, // 是否是分享活动任务
      isJumpedBind: false, // 是否已经跳转过绑定的标记
      bind: 0, // 识别跳转过来的绑定状态字段
      rankInfoList: [
        {
          rank: 0,
          rankNormalIcon: 'medal/none.png',
          rankNormalBrand: 'medal/none_brand.png',
          rankDisableIcon: 'medal/none_disable.png',
        },
        {
          rank: 1,
          rankNormalIcon: 'medal/bronze.png',
          rankNormalBrand: 'medal/bronze_brand.png',
          rankDisableIcon: 'medal/bronze_disable.png',
        },
        {
          rank: 2,
          rankNormalIcon: 'medal/silver.png',
          rankNormalBrand: 'medal/silver_brand.png',
          rankDisableIcon: 'medal/silver_disable.png',
        },
        {
          rank: 3,
          rankNormalIcon: 'medal/gold.png',
          rankNormalBrand: 'medal/gold_brand.png',
          rankDisableIcon: 'medal/gold_disable.png',
        },
        {
          rank: 4,
          rankNormalIcon: 'medal/platinum.png',
          rankNormalBrand: 'medal/platinum_brand.png',
          rankDisableIcon: 'medal/platinum_disable.png',
        },
        {
          rank: 5,
          rankNormalIcon: 'medal/diamond.png',
          rankNormalBrand: 'medal/diamond_brand.png',
          rankDisableIcon: 'medal/diamond_disable.png',
        },
        {
          rank: 6,
          rankNormalIcon: 'medal/star.png',
          rankNormalBrand: 'medal/star_brand.png',
          rankDisableIcon: 'medal/star_disable.png',
        },
        {
          rank: 7,
          rankNormalIcon: 'medal/king.png',
          rankNormalBrand: 'medal/king_brand.png',
          rankDisableIcon: 'medal/king_disable.png',
        },
      ],
    }
  },
  computed: {
    // 是否需要跳转绑定标记：bind=1且绑定任务status=0
    isNeedJumpBind() {
      return +this.options.bind === 1 && this.taskInfo.taskList.length > 0 && this.taskInfo.taskList.some(item => item.id === '1' && item.status === 0)
    },
  },
  async onLoad(options) {
    this.options = options
    report('pk', 'sy_show')
    await this.getRankLevel()
    if (this.isNeedJumpBind)
      return // 绑定优先级 > 邀请弹窗
    await this.getPkShare(options.inviteCode)
    if (!this.pkShare.PKInfo)
      return
    this.showPopup('accept', this.pkShare)
  },
  onShow() {
    this.getPkInfo()
    this.getTaskList()
  },
  methods: {
    // 获取段位和等级
    async getRankLevel() {
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/pk/rank_name`)
      const { rankMap = {}, levelMap = {} } = res.Data || {}
      this.rankMap = rankMap
      this.levelMap = levelMap
      const list = Object.keys(this.rankMap).map((key) => {
        return {
          rank: key,
          rankName: this.rankMap[key],
          rankNormalIcon: this.rankInfoList[key].rankNormalIcon,
          rankNormalBrand: this.rankInfoList[key].rankNormalBrand,
          rankDisableIcon: this.rankInfoList[key].rankDisableIcon,
        }
      })
      uni.setStorageSync('rankInfoList', list)
    },
    // 获取分享的PK 有inviteCode时调用
    async getPkShare(inviteCode) {
      if (!inviteCode)
        return
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/pk/get_share${uni.$u.queryParams({ inviteCode })}`, {}, { custom: { loading: false } })
      this.pkShare = res.Data || {}
    },
    // （首页）获取用户pk信息
    async getPkInfo() {
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/pk/info`, {}, { custom: { loading: false } })
      this.homeInfo = res.Data || {}
    },
    // 任务记录
    async getTaskList() {
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/pk/task-list`, {}, { custom: { loading: false } })
      this.taskInfo = res.Data || {}
      // 跳转过绑定之后就不在跳转
      if (this.isNeedJumpBind && !this.isJumpedBind) {
        this.bindStudent()
        this.isJumpedBind = true
      }
    },
    challengeClick() {
      report('pk', 'sy_hytz')
      this.showPopup('send')
    },
    // 好友匹配
    friendMatch(code) {
      this.shareFunc(1, code)
    },
    // 绑定学生
    bindStudent() {
      // #ifdef MP-WEIXIN
      uni.navigateTo({ url: '/pages/me/bindStudent' })
      // #endif
      // #ifdef H5
      nativeBridge.callHandler('bindStudent', 'bindStudent')
      // #endif
    },
    // 分享活动、邀请好友
    taskOperate(item) {
      report('pk', item.key)
      if (item.id === '1')
        return this.bindStudent()
      if (item.id === '2') {
        this.isShareTaskTag = true
      }
      this.shareFunc(1, this.homeInfo.lastTheme)
    },
    // 提醒绑定
    remainBind() {
      report('pk', 'sy_qtxtabd')
      this.shareFunc(3, this.homeInfo.lastTheme)
    },
    // 分享方法
    shareFunc(type, code) {
      this.$refs.share.init({ type, name: this.homeInfo.stuName, code })
    },
    // 分享成功
    shareSuccess() {
      if (this.isShareTaskTag) {
        this.taskFinish()
      }
    },
    // 显示记录
    showRecordList() {
      this.$refs.popup && this.$refs.popup.open('send')
    },
    // 显示弹窗（send：邀请弹窗  accept:接受邀请，record：任务记录弹窗）
    showPopup(type, params) {
      this.$refs.popup && this.$refs.popup.open(type, params)
    },
    // 任务完成上报
    async taskFinish() {
      await uni.$http.post(`${feConfig.api.znyx}/api/pk/task-finish`, { taskId: 2 })
      this.getTaskList()
      this.isShareTaskTag = false
    },
    // 关闭弹窗
    closePop() {
      this.$refs.mouthPk && this.$refs.mouthPk.closeLevelPop()
    },
  },
}
</script>

<style lang="scss" scoped>
@import './font.scss';

.index {
  position: relative;
  min-height: 100vh;
  padding-bottom: 40rpx;
  background: #fff7ca;

  &-content {
    width: 100vw;
    height: 100%;
    min-height: 100vh;
    z-index: 2;
    position: relative;

    .img {
      position: relative;
      width: 100%;
      display: flex;
      height: 156rpx;

      &-title {
        width: 354rpx;
        height: 88rpx;
        left: 198rpx;
        z-index: 2;
        justify-content: center;
        position: absolute;
        top: 36rpx;
      }

      &-left {
        top: 22rpx;
        width: 46rpx;
        height: 46rpx;
        z-index: 3;
        position: absolute;
        left: 196rpx;
      }

      &-right {
        width: 52rpx;
        height: 52rpx;
        top: 87rpx;
        z-index: 3;
        position: absolute;
        right: 186rpx;
      }
    }

    &__userinfo {
      display: flex;
      height: 124rpx;
      align-items: center;
      width: 100%;
      background: linear-gradient(90deg, #ffdd72, rgba(255, 221, 114, 0) 100%);

      .icon {
        width: 88rpx;
        height: 88rpx;
        border-radius: 50%;
        margin: 18rpx 0 18rpx 34rpx;
        border: 2.79rpx solid #ffca00;
      }

      .user {
        flex: 1;
        margin-left: 22rpx;
        display: flex;
        flex-direction: column;
        justify-content: center;

        &-name {
          font-size: 32rpx;
          font-weight: 500;
          color: #5d4212;
        }

        &-rank {
          margin-top: 6rpx;
          opacity: 0.7;
          font-size: 24rpx;
          color: #5d4212;
        }
      }

      .challenge {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 188rpx;
        height: 66rpx;
        margin: 30rpx 28rpx 28rpx 0;
        background: linear-gradient(225deg, #ff9840, #ff641d);
        border-radius: 46rpx;
        font-size: 28rpx;
        font-weight: 500;
        color: #ffffff;
      }
    }

    &__pk {
      padding: 20rpx 28rpx 0rpx 28rpx;
      z-index: 1;
    }

    &__task {
      padding: 20rpx 28rpx 0rpx 28rpx;
    }
  }

  &-bg {
    width: 100%;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
  }
}
</style>
