<template>
  <view class="me" :style="{ paddingBottom }">
    <view class="me-user">
      <view class="user-info" @click="goPage">
        <view class="user-info__left">
          <image class="user-info__avatar" src="../../static/home/mine_img_avatar_default.png" />
          <view v-if="isLogin" class="user-info__name">
            <template v-if="hasStudent">
              <view v-if="userInfo.roleType === 2" class="name">
                <view>{{ studentInfo.studentName }}的家长</view>
                <view class="student">
                  学生：{{ studentInfo.studentName }}<image v-if="userInfo.isMember" class="vip small" src="../../static/me/home_vip.png" />
                </view>
              </view>
              <view v-else class="name">
                {{ studentInfo.studentName }}
              </view>
            </template>
            <template v-else>
              <view class="name">
                暂未绑定学生
              </view>
            </template>
            <image v-if="userInfo.isMember && userInfo.roleType !== 2" class="vip" src="../../static/me/points_icon_member.png" />
          </view>
          <view v-else class="user-info__name">
            <view class="name">
              请点击登录
            </view>
          </view>
        </view>
        <view v-if="userInfo.roleType === 2" class="user-info__change">
          <image class="add" src="../../static/me/mine_icon_add.png" />
          <view>添加/切换</view>
        </view>
        <image v-if="userInfo.roleType === 1" class="more" src="../../static/me/mine_icon_more.png" />
      </view>
      <view class="member" @click="clickVip">
        <view v-if="userInfo.isMember" class="member-item">
          <view class="member-item__name">
            <view class="text">
              好分数VIP
            </view>
            <view class="time">
              {{ $u.timeFormat(paymentInfo.lastMemberEnd, 'yyyy-mm-dd') }}到期
            </view>
          </view>
          <view class="member-item__button">
            <view>去续费</view>
            <image class="more" src="../../static/me/mine_icon_more.png" />
          </view>
        </view>
        <view v-else class="member-item">
          <view class="member-item__name">
            <view class="text">
              好分数VIP会员
            </view>
          </view>
          <view class="member-item__button">
            <view class="open">
              去开通
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="adsList.length" class="me-ad">
      <AdSwiper height="110rpx" :list="adsList" key-name="picUrl" />
    </view>
    <view class="grid">
      <u-grid :border="false" col="3">
        <u-grid-item v-for="(item, index) in gridList" :key="index" @click="gridClick(item)">
          <image class="grid-icon" :style="{ width: item.style.width, height: item.style.height }" :src="item.icon" />
          <text class="grid-text">
            {{ item.name }}
          </text>
        </u-grid-item>
      </u-grid>
    </view>
    <u-gap height="15rpx" bg-color="#f6f6f6" />
    <u-cell-group :border="false">
      <u-cell icon="/static/me/mine_icon_sz.png" :icon-style="iconStyle" :title-style="titleStyle" size="large" title="设置" is-link @click="toSetting" />
      <u-cell icon="/static/me/mine_icon_khfw.png" :icon-style="iconStyle" :title-style="titleStyle" size="large" title="客户服务" is-link @click="openCustomerServiceChat" />
    </u-cell-group>
  </view>
</template>

<script>
import adSwiper from '../../components/adSwiper.vue'

export default {
  components: { AdSwiper: adSwiper },
  data() {
    return {
      options: {},
      userInfo: {},
      paymentInfo: {},
      iconStyle: {
        width: '40rpx',
        height: '40rpx',
        marginRight: '20rpx',
      },
      titleStyle: {
        fontSize: '30rpx',
        color: '#333333',
      },
      gridList: [
        {
          name: '我的订单',
          icon: require('../../static/me/order.png'),
          style: {
            width: '46rpx',
            height: '53rpx',
          },
          mode: 2,
          url: '/uni_modules/hfs-fe-uni-module/memberPages/member/orderList',
        },
        {
          name: '关注公众号',
          icon: require('../../static/me/weixin.png'),
          style: {
            width: '70rpx',
            height: '57rpx',
          },
          mode: 1,
          url: 'https://mp.weixin.qq.com/s/79fKCcHPpLqvDnqkNnPg1Q',
        },
        {
          name: '我的卡券',
          icon: require('../../static/me/coupon_icon.png'),
          style: {
            width: '70rpx',
            height: '57rpx',
          },
          mode: 4,
          url: '/pages/coupons/index',
        },
      ],
      adsList: [], // 广告列表
      degradeInfo: {},
      showUnpiadPopup: false,
      showUnpaidRemindPopup: false,
      shortFrom: 'mine',
      shortInfo: {},
      showShortPopup: false,
      showShortRemindPopup: false,
      recommend: {},
    }
  },
  computed: {
    isLogin() {
      return !!this.userInfo.userId
    },
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
    hasStudent() {
      return this.userInfo.linkedStudent && (this.userInfo.linkedStudent.isVirtual === 2)
    },
    paddingBottom() {
      if (this.showUnpiadPopup)
        return 'calc(424rpx + env(safe-area-inset-bottom))'
      if (this.showShortPopup)
        return 'calc(444rpx + env(safe-area-inset-bottom))'
      return '180rpx'
    },
  },
  async onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || {}
    this.getAdvert()
    this.isLogin && await this.getPaymentInfo()
  },
  onTabItemTap() {
    this.isLogin && this.getMarketingActivity()
  },
  methods: {
    async initPage() {
      this.getPaymentInfo()
      this.getMarketingActivity()
    },
    // 获取营销活动（按优先级）
    async getMarketingActivity() {
      const marketingStrategies = [
        {
          name: 'degrade', // 待支付
          fetch: this.getDegradeTip,
          check: () => this.showUnpiadPopup,
        },
        {
          name: 'shortToLong', // 短期变长期
          fetch: this.getShortRecommend,
          check: () => this.showShortPopup,
        },
      ]

      for (const strategy of marketingStrategies) {
        await strategy.fetch()
        if (strategy.check())
          break
      }
    },
    // 短期变长期
    async closeShortPopup() {
      this.showShortPopup = false
      const info = await this.recommendGoods()
      if (info.show) {
        this.recommend = info
        this.showShortRemindPopup = true
      }
    },
    async getShortRecommend() {
      const info = await this.recommendGoods({ from: this.shortFrom })
      const { recommendation = {} } = info
      const { memberType = '' } = recommendation
      if (memberType === 'month' || memberType === 'jidu' || memberType === 'halfYear') {
        this.shortInfo = info
        this.showShortPopup = this.shortInfo.show
      }
    },
    async recommendGoods(params = {}) {
      const res = await uni.$http.get('/v1/be-proxy/v3/strategy/recommend-goods', { ...params }, { custom: { loading: false, error: false } })
      return res.data || {}
    },
    closeAllShortPopup() {
      this.showShortPopup = false
      this.showShortRemindPopup = false
    },
    closeAllUnpaidPopup() {
      this.showUnpiadPopup = false
      this.showUnpaidRemindPopup = false
    },
    // 待支付底部弹窗-关闭
    async closeUnpaidPopup(negative) {
      this.showUnpiadPopup = false
      if (negative > 0 && negative < 3)
        this.showUnpaidRemindPopup = true
    },
    // 获取待支付数据
    async getDegradeTip() {
      this.showUnpaidRemindPopup = false
      const res = await uni.$http.get('/v1/be-proxy/v2/payments/degrade-tip', { cid: 'my' }, { custom: { loading: false, error: false } })
      this.degradeInfo = res.data || {}
      const { isNew, degradeType, isDegrade } = this.degradeInfo
      this.showUnpiadPopup = (isDegrade || degradeType === 1) && !isNew
    },
    goPage() {
      if (!this.isLogin) {
        return uni.navigateTo({ url: feConfig.login })
      }
      if (!this.hasStudent) {
        return uni.navigateTo({
          url: '/pages/me/bindStudent',
        })
      }
      return uni.navigateTo({
        url: '/pages/me/studentInfo',
      })
    },
    gridClick(item) {
      const jumpMap = {
        1: () => {
          return uni.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent(item.url)}` })
        },
        2: () => {
          if (!this.isLogin) {
            return uni.navigateTo({ url: feConfig.login })
          }
          return uni.navigateTo({ url: item.url })
        },
        3: () => {
          return uni.navigateToMiniProgram({
            appId: item.app_id,
            path: item.url,
          })
        },
        4: () => {
          if (!this.isLogin) {
            return uni.navigateTo({ url: feConfig.login })
          }
          return uni.navigateTo({ url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}${item.url}`)}` })
        },
      }
      return jumpMap[item.mode]()
    },
    clickVip() {
      if (!this.isLogin) {
        return uni.navigateTo({ url: feConfig.login })
      }
      if (!this.studentInfo.studentId) {
        return uni.navigateTo({ url: '/pages/me/bindStudent' })
      }
      this.closeAllUnpaidPopup()
      return uni.navigateTo({ url: '/pages/me/member' })
    },
    toSetting() {
      if (!this.isLogin) {
        return uni.navigateTo({ url: feConfig.login })
      }
      uni.navigateTo({
        url: '/pages/me/setting',
      })
    },
    openCustomerServiceChat() {
      const options = this.userInfo.isMember ? feConfig.vipCustomer : feConfig.customer
      return wx.openCustomerServiceChat(options)
    },
    async getPaymentInfo() {
      if (this.userInfo.roleType === 1 && !this.hasStudent)
        return
      const res = await uni.$http.get('/v1/be-proxy/v2/user-center/payment-info')
      this.paymentInfo = res.data || {}
    },
    // 获取智能营销广告
    getAdvert() {
      const { grade, schoolId: schoolid } = this.studentInfo
      const { userId: userid, userTag } = this.userInfo
      const url = `${feConfig.api.znyx}/api/ads/user/plan/list-v2`
      const params = {
        grade,
        project_id: feConfig.bannerProjectId,
        schoolid,
        slot_id: feConfig.myBannerSlotId,
        user_tag: userTag,
        userid,
      }
      uni.$http.get(url, params).then((res) => {
        this.adsList = res.data
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.me {
  min-height: 100vh;
  background: #ffffff;
  &-user {
    padding-top: 30rpx;
    background: linear-gradient(180deg, #fafcfd, #f4f8fb);
  }
  &-ad {
    padding: 14rpx 30rpx 0;
  }
  .user-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 52rpx;
    padding: 0 30rpx;
    &__left {
      display: flex;
      align-items: center;
    }
    &__avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      flex-shrink: 0;
    }
    &__name {
      display: flex;
      align-items: center;
      margin-left: 24rpx;
      .name {
        color: #333333;
        font-size: 37rpx;
        font-weight: 600;
        .student {
          font-size: 24rpx;
          font-weight: 400;
          display: flex;
          align-items: center;
        }
      }
      .vip {
        width: 36rpx;
        height: 31rpx;
        margin-left: 10rpx;
        &.small {
          width: 25rpx;
          height: 24rpx;
        }
      }
    }
    .user-info__change {
      font-size: 24rpx;
      color: #333333;
      border: 1rpx solid #4d4d4d;
      border-radius: 60rpx;
      padding: 6rpx 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      .add {
        width: 16rpx;
        height: 16rpx;
        margin-right: 5rpx;
      }
    }
    .more {
      width: 21rpx;
      height: 21rpx;
    }
  }
  .member {
    padding: 0 30rpx;
    &-item {
      width: 100%;
      height: 104rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx 32rpx;
      background: linear-gradient(325deg, #f8cd7b 0%, #f8e6c3);
      border-radius: 16.67rpx 16.67rpx 0rpx 0rpx;
      &__name {
        display: flex;
        align-items: center;
        .text {
          font-size: 32rpx;
          color: #644428;
          font-weight: 600;
        }
        .time {
          font-size: 24rpx;
          color: #644428;
          margin-left: 12rpx;
        }
      }
      &__button {
        font-size: 26rpx;
        color: #644428;
        display: flex;
        align-items: center;
        .open {
          width: 142rpx;
          height: 50rpx;
          font-size: 26rpx;
          color: #ffe8c0;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(270deg, #c38743 93%, #cf934d 10%);
          border-radius: 104.17rpx;
        }
        .more {
          width: 21rpx;
          height: 21rpx;
          margin-left: 6rpx;
        }
      }
    }
  }
  .grid {
    padding: 40rpx 0;
    &-icon {
      margin-bottom: 10rpx;
    }
    &-text {
      font-size: 28rpx;
      color: #333333;
    }
  }
}
</style>
