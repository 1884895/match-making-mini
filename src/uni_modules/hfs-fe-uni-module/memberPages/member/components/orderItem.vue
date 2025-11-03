<template>
  <view class="order-item">
    <view v-if="list && list.length" class="order-item__list">
      <view v-for="(item, index) in list" :key="index" class="list-item" @click="handleDetail(item)">
        <view class="list-item__time">
          下单时间：{{ formtTime(item.time) }}
        </view>
        <view class="list-item__message">
          <image class="message-icon" :src="resourceUrl + (item.gift === 1 ? 'order_gift_icon.png' : 'order_icon.png')" />
          <text class="message-text">
            {{ item.goodName }}
          </text>
          <view v-if="item.gift === 1 && item.status === 2" class="message-alert" :style="{ background: item.giveStatus === 0 ? '#ffb100' : '#e6e6e6', color: item.giveStatus === 0 ? '#ffffff' : '#939393' }" @click="handleGiftAlert(item)">
            {{ item.giveStatus === 0 ? '去赠送/提醒' : '已送出' }}
          </view>
        </view>
        <u-line color="#e6e6e6" margin="20rpx 0" />
        <view class="list-item__content">
          <view v-if="item.status === 1" class="pay">
            <view class="pay-cancel" @click.stop="showDialog(item)">
              取消订单
            </view>
            <view class="pay-btn" @click.stop="paymentVIP(item)">
              立即支付 {{ item.amount }} 元
            </view>
          </view>
          <view v-if="item.status === 2" class="complete">
            <view class="complete-through">
              支付方式：{{ getPayThrough(item.payThrough) }}
            </view>
            <view class="complete-content">
              <view class="complete-content__time">
                支付时间：{{ formtTime(item.notifyTime) }}
              </view>
              <view class="complete-content__amount">
                实付：<text class="text">
                  {{ `￥${item.amount}` }}
                </text>
              </view>
            </view>
          </view>
        </view>
        <view v-if="item.status === 1" class="list-item__status">
          <text class="status-text">
            剩余：
          </text>
          <u-count-down :time="item.remainSec" format="HH:mm:ss" @finish="handleFinish(item)" />
        </view>
        <view v-if="item.status === 2">
          <image class="list-item__final" :src="resourceUrl + (item.giveStatus === 0 ? 'order_status_pink.png' : 'order_status_gray.png')" />
          <view class="list-item__final-text" :style="{ color: item.giveStatus === 0 ? '#FF3B3B' : '#999999' }">
            {{ item.gift === 1 ? (item.giveStatus === 0 ? '未激活' : '已激活') : '已完成' }}
          </view>
        </view>
      </view>
    </view>
    <image v-if="loadStatus && list.length === 0" class="empty" :src="`${resourceUrl}empty.png`" mode="widthFix" />
    <Payment ref="payment" :unpaid="true" @success="paymentSuccess" @fail="paymentFail" />
    <u-popup :show="popup.show" :mode="popup.mode" :round="popup.round" :safe-area-inset-bottom="false">
      <view class="order-item__pop">
        <view class="title flex-row-center">
          确认要取消该订单吗？
        </view>
        <view class="btns flex-row-start">
          <view class="btn-item flex-row-center cancel" @click="popup.show = false">
            取消
          </view>
          <view class="btn-item flex-row-center confirm" @click="handleConfirm">
            确认
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import Payment from '../../components/payment.vue'
import { payThroughList, payThroughMap } from '../util.js'
import { isHFSApp, nativeBridge, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Payment },
  props: {
    loadStatus: {
      type: Boolean,
      default: false,
    },
    list: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['updataList'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/member/',
      popup: {
        show: false,
        mode: 'center',
        round: 6,
      },
      orderDetail: {},
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
    userInfo() {
      return uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    },
    myClassGroup() {
      return this.userInfo.myClassGroup || ''
    },
    payWayList() {
      return payThroughList()
    },
  },
  methods: {
    handleDetail(item) {
      if (item.status !== 1)
        return
      const url = `/uni_modules/hfs-fe-uni-module/memberPages/member/unpaid?id=${item.id}`
      // #ifdef H5
      if (isHFSApp()) {
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 1, target: `${window.location.origin}${url}` }))
      }
      // #endif
      return uni.navigateTo({ url })
    },
    showDialog(item) {
      this.popup.show = true
      this.orderDetail = item
    },
    handleFinish(item) {
      const index = this.list.findIndex(v => v.id === item.id)
      this.list.splice(index, 1) // eslint-disable-line vue/no-mutating-props
    },
    // 取消订单
    async handleConfirm() {
      const { status } = await this.getOrderStatus(this.orderDetail)
      if (status !== 1)
        return uni.showToast({ title: '订单已取消', icon: 'none' })

      const { id: paymentId } = this.orderDetail
      await uni.$http.delete(`${this.beProxy}/v2/payments/${paymentId}`, { custom: { loading: false } })
      this.popup.show = false
      uni.showToast({ title: '订单已取消', icon: 'none', success: () => this.$emit('updataList') })
    },
    async paymentVIP(item) {
      const { status } = await this.getOrderStatus(item)
      if (status !== 1)
        return uni.showToast({ title: '订单已取消', icon: 'none' })

      const params = { id: item.id }
      const { payThrough = '' } = this.payWayList.find(v => v.payThrough === item.payThrough) || this.payWayList[0]
      params.payThrough = payThrough
      this.$refs.payment.paymentVIP(params)
    },
    paymentSuccess() {
      if (this.myClassGroup) {
        const url = `${this.myClassGroup}&position=2`
        // #ifdef MP-WEIXIN
        uni.reLaunch({ url })
        // #endif
        // #ifdef H5
        nativeBridge.callHandler('adJump', JSON.stringify({ mode: 4, target: 'gh_dad0a8e4dc1c', data: { path: url } }))
        // #endif
        return
      }
      // #ifdef MP-WEIXIN
      uni.reLaunch({ url: '/pages/index/index' })
      // #endif
      // #ifdef H5
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 78 }))
      // #endif
    },
    paymentFail(err) {
      return uni.$u.toast(err.errMsg || err)
    },
    async getOrderStatus(item) {
      const { id: paymentId } = item
      const res = await uni.$http.get(`${this.beProxy}/v2/payments/${paymentId}/third-party-pay-status `, {}, { custom: { loading: false } })
      return res.data
    },
    formtTime(val) {
      return uni.$u.timeFormat(val, 'yyyy/mm/dd hh:MM:ss')
    },
    getPayThrough(val) {
      return payThroughMap[val] || '其他'
    },
    handleGiftAlert(item) {
      if (item.gift === 1 && item.giveStatus === 0) {
        report('behalf', 'wddd_qzs_click')
        uni.navigateTo({ url: `/uni_modules/hfs-fe-uni-module/memberPages/behalf/receive?id=${item.id}` })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.order-item {
  &__list {
    padding: 20rpx 28rpx 50rpx;
    .list-item {
      position: relative;
      background: #ffffff;
      border-radius: 24rpx;
      padding: 22rpx 28rpx 20rpx;
      margin-bottom: 24rpx;
      &__time {
        font-size: 24rpx;
        color: #939393;
        margin-bottom: 28rpx;
      }
      &__message {
        display: flex;
        align-items: center;
        .message-icon {
          width: 44rpx;
          height: 44rpx;
          margin-right: 10rpx;
        }
        .message-text {
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
        }
        .message-alert {
          position: absolute;
          right: 28rpx;
          width: 220rpx;
          height: 60rpx;
          font-size: 28rpx;
          text-align: center;
          line-height: 60rpx;
          border-radius: 15px;
        }
      }
      &__content {
        .pay {
          display: flex;
          justify-content: space-between;
          align-items: center;
          &-cancel {
            font-size: 24rpx;
            color: #666666;
            margin-right: 28rpx;
          }
          &-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-grow: 1;
            height: 62rpx;
            background: linear-gradient(225deg, #ffa430 0%, #ff7426);
            border-radius: 42rpx;
            font-size: 28rpx;
            font-weight: bold;
            color: #ffffff;
          }
        }
        .complete {
          &-through {
            font-size: 26rpx;
            color: #333333;
            margin-bottom: 10rpx;
          }
          &-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            &__time {
              font-size: 26rpx;
              color: #333333;
            }
            &__amount {
              font-size: 24rpx;
              color: #939393;
              .text {
                font-size: 24rpx;
                font-weight: bold;
                color: #ff0000;
              }
            }
          }
        }
      }
      &__status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: absolute;
        top: 16rpx;
        right: 20rpx;
        display: flex;
        align-items: center;
        .status-text {
          font-size: 24rpx;
          color: #939393;
        }
        ::v-deep .u-count-down__text {
          font-size: 28rpx;
          font-weight: bold;
          color: #ffb100;
        }
      }
      &__final {
        width: 134rpx;
        height: 42rpx;
        position: absolute;
        top: 0rpx;
        right: 0rpx;
      }
      &__final-text {
        width: 134rpx;
        height: 42rpx;
        position: absolute;
        top: 0rpx;
        right: 0rpx;
        font-size: 24rpx;
        line-height: 42rpx;
        text-align: center;
      }
    }
  }
  &__pop {
    width: 640rpx;
    height: 280rpx;
    padding: 60rpx 46rpx 0;
    .title {
      font-size: 30rpx;
      color: #333333;
      margin-bottom: 60rpx;
    }
    .btns {
      justify-content: space-between;
      .btn-item {
        width: 260rpx;
        height: 82rpx;
        border-radius: 40rpx;
        font-size: 32rpx;
        &.cancel {
          background-color: #f6f6f6;
          color: #333333;
        }
        &.confirm {
          background-color: #ffba1d;
          color: #ffffff;
        }
      }
    }
  }
  .empty {
    width: 474rpx;
    height: 328rpx;
    margin: 150rpx auto 0;
  }
}
</style>
