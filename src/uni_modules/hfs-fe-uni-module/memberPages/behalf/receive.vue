<template>
  <view class="receive">
    <view class="receive-content">
      <image class="receive-content__bow" :src="`${resourceUrl}behalf_bow.png`" mode="widthFix" />
      <image class="receive-content__color" :src="`${resourceUrl}behalf_color.png`" mode="widthFix" />
      <view class="receive-content__info" :class="{ share: isShare }">
        <view class="title">
          <image class="title-draw" :src="`${resourceUrl}behalf_draw.png`" mode="widthFix" />
          <view class="title-text">
            学业有成卡
          </view>
        </view>
        <view class="good">
          <view class="good-item active">
            <view class="name">
              {{ good.name }}
            </view>
            <view class="price" :class="{ active: good.promotionText }">
              <view class="price-cost">
                {{ good.cost }}<text class="active">
                  元
                </text><view v-if="good.discount" class="price-cost__discount">
                  {{ good.discount }}
                </view>
              </view>
              <view v-if="good.dayPrice" class="price-day">
                <text v-if="good.line">
                  原价：
                </text><text :class="{ through: good.line }">
                  {{ good.dayPrice }}
                </text>
              </view>
            </view>
            <view v-if="good.promotionTop" class="tag">
              {{ good.promotionTop }}
            </view>
            <view v-if="good.promotionText" class="tip">
              {{ good.promotionText }}
            </view>
            <image class="icon" :src="`${memberUrl}crown.png`" />
          </view>
          <view class="good-desc">
            <view class="good-desc__title">
              读懂成绩 提升成绩
            </view>
            <view class="good-desc__text">
              4500万学生的智慧学习方式
            </view>
            <view class="good-desc__text">
              让成绩弯道超车！
            </view>
            <view class="good-desc__btn" @click="jumpVip">
              了解好分数会员<u-icon name="arrow-right" size="22rpx" color="#ff9a00" bold />
            </view>
          </view>
        </view>
        <view class="message">
          <image class="message-clip" :src="`${resourceUrl}behalf_clip.png`" mode="widthFix" />
          <view class="message-title">
            <text class="active">
              {{ pickName }}
            </text>对你说：
          </view>
          <view class="message-desc">
            <text>{{ giftDetail.say }}</text>
          </view>
        </view>
        <view v-if="isShare && studentList.length" class="confirm">
          <view class="confirm-title">
            确认学生：
          </view>
          <view class="confirm-list">
            <view v-for="(item, index) in studentList" :key="index" class="confirm-list__item" :class="{ active: studentId === item.studentId }" @click="changeStudent(item.studentId)">
              <view class="circle" />
              <view class="name">
                学生{{ index + 1 }}：{{ item.studentName }}
              </view>
            </view>
          </view>
        </view>
        <view class="tips">
          <text class="active">
            温馨提醒：
          </text>{{ pickName }}已为你支付{{ good.cost }}元费用，你无需支付任何费用！<text class="hfs">
            注册好分数
          </text>即可领取成功并免费使用。
        </view>
        <view v-if="isShare" class="button">
          <view v-if="giftDetail.giveStatus === 1" class="button-btn active">
            已接收
          </view>
          <view v-else class="button-btn" @click="acceptGift">
            收下礼物
          </view>
        </view>
      </view>
    </view>
    <view v-if="!isShare" class="receive-share">
      <view class="receive-share__list">
        <view class="item">
          <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="shareWeixin" />
          <image class="item-icon" :src="`${resourceUrl}weixin.png`" mode="widthFix" />
          <view class="item-text">
            发送给微信好友
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { isHFSApp, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  data() {
    return {
      memberUrl: 'https://fe-resource.haofenshu.com/member/',
      resourceUrl: 'https://fe-resource.haofenshu.com/behalf/',
      options: {},
      userInfo: {},
      giftDetail: {},
      studentList: [],
      studentId: '',
    }
  },
  computed: {
    prefix() {
      let prefix = '/v1/be-proxy'
      // #ifdef H5
      prefix = feConfig.api.hfs || ''
      // #endif
      return prefix
    },
    isShare() {
      return this.options.share || false
    },
    isLogin() {
      return !!this.userInfo.userId
    },
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
    hasStudent() {
      return this.userInfo.linkedStudent && (this.userInfo.linkedStudent.isVirtual === 2)
    },
    pickName() {
      const { studentName = '', phone = '' } = this.giftDetail || {}
      return studentName || phone
    },
    good() {
      const { good = {} } = this.giftDetail || {}
      return good
    },
  },
  onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    this.studentId = this.studentInfo.studentId || ''
    this.getGiftDetail(options.id)
    this.isLogin && this.getStudentList()
    this.isShare && report('behalf', 'bsr_lpk_show')
  },
  onShow() {
    // #ifdef MP-WEIXIN
    getApp().globalData.redirect_uri = ''
    // #endif
  },
  methods: {
    async getGiftDetail(id) {
      const res = await uni.$http.get(`${this.prefix}/v2/payments/gift-detail?id=${id}`)
      this.giftDetail = res.data || {}
    },
    async getStudentList() {
      const res = await uni.$http.get(`${this.prefix}/v2/user-center/related-students`)
      this.studentList = res.data.filter(v => v.isVirtual === 2)
    },
    changeStudent(studentId) {
      if (this.studentId === studentId)
        return
      this.studentId = studentId
    },
    jumpVip() {
      let url = '/pages/intro/index'
      // #ifdef MP-WEIXIN
      url = `/pages/webview/webview?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}`)}`
      // #endif
      // #ifdef H5
      if (isHFSApp()) {
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${window.location.origin}${url}` }))
      }
      // #endif
      return uni.navigateTo({ url })
    },
    async acceptGift() {
      // #ifdef MP-WEIXIN
      if (!this.isLogin)
        return this.jumpPage('/pages/login/login')
      if (!this.hasStudent)
        return this.jumpPage('/pages/me/bindStudent')
      // #endif
      const params = {
        id: this.options.id,
        studentId: this.studentId,
      }
      await uni.$http.post(`${this.prefix}/v2/payments/accept-gift`, params)
      uni.$u.toast('领取成功')
      report('behalf', 'bsr_sxlw_click')
      await uni.$u.sleep(1000)
      // #ifdef MP-WEIXIN
      uni.reLaunch({ url: '/pages/index/index' })
      // #endif
      // #ifdef H5
      if (isHFSApp()) {
        nativeBridge.callHandler('updateUserInfo', 'updateUserInfo')
        nativeBridge.callHandler('goBack', 'goBack')
      }
      return uni.navigateBack()
      // #endif
    },
    jumpPage(url) {
      // #ifdef MP-WEIXIN
      getApp().globalData.redirect_uri = `${uni.$u.page()}${uni.$u.queryParams(this.options)}`
      return uni.navigateTo({ url })
      // #endif
    },
    shareWeixin() {
      // #ifdef H5
      const { title, path, imageUrl: cover } = this.getShareWeixinInfo()
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 8, target: 'gh_dad0a8e4dc1c', data: { title, path, cover } }))
      // #endif
      report('behalf', 'sgt_lpk_share')
    },
    getShareWeixinInfo() {
      return {
        title: `${this.pickName}付款${this.good.cost}元送你好分数VIP！`,
        path: `/uni_modules/hfs-fe-uni-module/memberPages/behalf/receive${uni.$u.queryParams({ id: this.options.id, share: true })}`,
        imageUrl: `${this.resourceUrl}behalf_gift_share.png`,
      }
    },
  },
  onShareAppMessage() {
    return this.getShareWeixinInfo()
  },
}
</script>

<style lang="scss" scoped>
.receive {
  min-height: 100vh;
  padding: 202rpx 42rpx 200rpx;
  background: #e2e2e2;
  &-content {
    position: relative;
    width: 100%;
    padding: 10rpx;
    background: linear-gradient(135deg, #ffc054, #f5961f);
    border-radius: 52rpx;
    &__bow {
      position: absolute;
      left: -46rpx;
      top: -124rpx;
      width: 380rpx;
      height: 294rpx;
    }
    &__color {
      position: absolute;
      right: 10rpx;
      bottom: 10rpx;
      width: 168rpx;
      height: 168rpx;
    }
    &__info {
      width: 100%;
      height: 100%;
      padding: 138rpx 18rpx 88rpx;
      border: 2.28rpx solid #ffffff;
      border-radius: 48rpx;
      background:
        url('https://fe-resource.haofenshu.com/behalf/behalf_cloud.png'),
        linear-gradient(180deg, #fffdf6, #fff7d4);
      &.share {
        padding-bottom: 24rpx;
        .message {
          margin-bottom: 16rpx;
        }
      }
      .title {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 62rpx;
        &-draw {
          width: 252rpx;
          height: 24rpx;
        }
        &-text {
          position: absolute;
          top: calc(-100% - 24rpx);
          left: 50%;
          transform: translateX(-50%);
          color: #5f3e00;
          font-size: 48rpx;
          font-weight: bold;
        }
      }
      .good {
        width: 100%;
        display: flex;
        align-items: center;
        background: linear-gradient(180deg, #ffffff, #fffde5);
        border: 2rpx solid #f9e2c2;
        border-radius: 20rpx;
        margin-bottom: 24rpx;
        padding: 36rpx 26rpx 28rpx;
        &-item {
          position: relative;
          display: flex;
          align-items: center;
          flex-direction: column;
          width: 192rpx;
          height: 168rpx;
          padding-top: 34rpx;
          background: linear-gradient(163deg, #ffecb5, #fff6de 81%);
          border: 2rpx solid #ffc55f;
          border-radius: 20rpx;
          .name {
            color: #70450f;
            font-size: 24rpx;
            font-weight: bold;
          }
          .price {
            z-index: 1;
            &-cost {
              color: #ff381b;
              font-size: 40rpx;
              font-weight: bold;
              position: relative;
              .active {
                font-size: 18rpx;
                color: #5d3a0c;
                margin-left: 2rpx;
              }
              &__discount {
                position: absolute;
                top: 0;
                right: 0;
                transform: translateX(90%);
                background: rgba(255, 0, 0, 0.1);
                border-radius: 4rpx;
                padding: 2rpx 6rpx;
                font-size: 12rpx;
                color: #ff0000;
              }
            }
            &-day {
              color: #70450f;
              font-size: 16rpx;
              text-align: center;
              margin-top: -6rpx;
              .through {
                text-decoration: line-through;
              }
            }
          }
          .tag {
            position: absolute;
            top: -12rpx;
            left: -2rpx;
            height: 32rpx;
            font-size: 18rpx;
            color: #ffffff;
            font-weight: 500;
            display: flex;
            align-items: center;
            background: linear-gradient(225deg, #ff450e, #ff880c);
            border-radius: 26rpx 2rpx 26rpx 2rpx;
            padding: 0 24rpx;
            z-index: 1;
          }
          .tip {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 26rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #976000;
            font-size: 14rpx;
            background: linear-gradient(225deg, #ffd766, #ffc55f);
            border-radius: 0 0 18rpx 18rpx;
            z-index: 1;
          }
          .icon {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 98rpx;
            height: 92rpx;
          }
        }
        &-desc {
          flex: 1;
          margin-left: 22rpx;
          &__title {
            color: #333333;
            font-size: 24rpx;
            font-weight: bold;
            margin-bottom: 4rpx;
          }
          &__text {
            color: #666666;
            font-size: 24rpx;
            margin-bottom: 4rpx;
          }
          &__btn {
            color: #ff9a00;
            font-size: 22rpx;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-top: 29rpx;
          }
        }
      }
      .message {
        position: relative;
        width: 100%;
        background: #ffffff;
        border: 2rpx solid #f9e2c2;
        border-radius: 24rpx;
        margin-bottom: 62rpx;
        padding: 22rpx 28rpx;
        &-clip {
          position: absolute;
          top: -12rpx;
          right: 20rpx;
          width: 66rpx;
          height: 60rpx;
        }
        &-title {
          width: fit-content;
          height: 45rpx;
          font-size: 26rpx;
          color: #333333;
          border-bottom: 2rpx solid #ffda84;
          margin-bottom: 19rpx;
          .active {
            font-weight: bold;
          }
        }
        &-desc {
          color: #ffa12b;
          font-size: 28rpx;
          font-weight: bold;
          line-height: 40rpx;
        }
      }
      .confirm {
        padding: 0 14rpx;
        margin-bottom: 24rpx;
        &-title {
          color: #333333;
          font-size: 28rpx;
          font-weight: bold;
          margin-bottom: 16rpx;
        }
        &-list {
          display: flex;
          align-items: center;
          &__item {
            display: flex;
            align-items: center;
            margin-right: 40rpx;
            .circle {
              width: 28rpx;
              height: 28rpx;
              border: 2rpx solid #939393;
              border-radius: 50%;
              margin-right: 8rpx;
            }
            .name {
              color: #939393;
              font-size: 26rpx;
            }
            &.active {
              .circle {
                border: 8rpx solid #ff8000;
              }
              .name {
                color: #ff8000;
              }
            }
            &:last-child {
              margin-right: 0;
            }
          }
        }
      }
      .tips {
        color: #939393;
        font-size: 24rpx;
        line-height: 44rpx;
        padding-left: 4rpx;
        .active {
          color: #333333;
          font-weight: bold;
        }
        .hfs {
          color: #666666;
          font-weight: bold;
        }
      }
      .button {
        margin-top: 16rpx;
        &-btn {
          width: 386rpx;
          height: 76rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 32rpx;
          font-weight: bold;
          background: linear-gradient(225deg, #ffa430 0%, #ff7426);
          border-radius: 42rpx;
          margin: 0 auto;
          &.active {
            color: #ffa268;
            background: #ffdeb2;
          }
        }
      }
    }
  }
  &-share {
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 999;
    background: #ffffff;
    border-radius: 40rpx 40rpx 0 0;
    padding: 20rpx 0;
    padding: 20rpx 0 calc(env(safe-area-inset-bottom) + 20rpx);
    &__list {
      display: flex;
      align-items: center;
      justify-content: center;
      .item {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        ::v-deep .u-button {
          &::before {
            opacity: 0 !important;
          }
        }
        &-icon {
          width: 72rpx;
          height: 72rpx;
          margin-bottom: 12rpx;
        }
        &-text {
          color: #333333;
          font-size: 26rpx;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
