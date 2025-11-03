<template>
  <view class="invited">
    <view class="invited-content">
      <view class="invited-content__table">
        <view class="tr">
          <view class="th">
            邀请好友数
          </view>
          <view v-for="(item, index) in awardConf" :key="index" class="td">
            <text>
              邀请第{{ index + 1 }}位<text v-if="index === awardConf.length - 1" class="active">
                \n每邀请一位
              </text>
            </text>
            <image v-if="index === awardConf.length - 1" class="more" :src="`${resourceUrl}invite_more.png`" />
          </view>
        </view>
        <view class="tr">
          <view class="th large">
            您可获得<text class="active">
              （2选1）
            </text>
          </view>
          <view v-for="(item, index) in awardConf" :key="index" class="td">
            <text>
              <text class="dot">
                •
              </text>
              <text class="red">
                {{ item.coin || '' }}
              </text>学币\n
              <text class="dot">
                •
              </text>
              免费续<text class="red">
                {{ item.vip || '' }}
              </text>天会员
            </text>
          </view>
        </view>
        <view class="tr">
          <view class="th">
            新同学可得
          </view>
          <view class="info">
            <text class="info-title">
              新同学下单\n立减<text class="active">
                {{ coupon.couponValue || '' }}元
              </text>
            </text>
            <text class="info-tips">
              限时下单\n再减<text class="active">
                <text class="num">
                  10
                </text>元
              </text>
            </text>
          </view>
        </view>
      </view>
      <view class="invited-content__button">
        <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareWeixin')" />
        <view class="btn">
          立即去邀约
        </view>
      </view>
      <view class="invited-content__list">
        <view class="list-item">
          <u-button :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('sharePoster')" />
          <image class="list-item__icon" :src="`${resourceUrl}share_img.png`" />
          <text>发送邀请海报</text>
        </view>
        <view class="list-item">
          <u-button :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareQr')" />
          <image class="list-item__icon qr" :src="`${resourceUrl}share_qr.png`" />
          <text>面对面邀约</text>
        </view>
      </view>
      <view class="invited-content__desc">
        <view class="title">
          特别说明：
        </view>
        <view>
          <text class="active">
            1. 奖励自由选：
          </text>推荐成功，学币、免费会员天数自由选，奖励可累计！
        </view>
        <view>
          <text class="active">
            2. 怎样都划算：
          </text>a. 学币当钱花，续费1:1抵扣现金；<view class="line">
            b. 会员天数0元续，续多久你决定！
          </view>
        </view>
        <view>
          <text class="active">
            3. 大礼超有面：
          </text>好友可获与你首单邀请同价值大额券，2h内下单再送10元！
        </view>
      </view>
    </view>
    <image class="invited-bg" :src="`${resourceUrl}invite_bg.png`" mode="widthFix" />
  </view>
</template>

<script>
export default {
  props: {
    pageType: {
      type: String,
      default: '',
    },
    inviterInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['report', 'shareWeixin', 'sharePoster', 'shareQr'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/introduction/',
      actionMap: {
        shareWeixin: 'operation_invite_click',
        sharePoster: 'operation_poster_click',
        shareQr: 'operation_qr_click',
      },
    }
  },
  computed: {
    awardConf() {
      return this.inviterInfo.awardConf || []
    },
    couponConf() {
      return this.inviterInfo.couponConf || []
    },
    coupon() {
      return this.couponConf[1] || {}
    },
  },
  methods: {
    share(type) {
      this.$emit(type)
      this.$emit('report', this.actionMap[type])
    },
  },
}
</script>

<style lang="scss" scoped>
.invited {
  position: relative;
  background: linear-gradient(108deg, #f2ffaa, #c8f5af 83%);
  box-shadow: 0rpx 2rpx 0rpx 0rpx #ffffff inset;
  border-radius: 40rpx;
  margin: -228rpx 20rpx 24rpx 22rpx;
  padding: 178rpx 0 22rpx;
  overflow: hidden;
  &-content {
    position: relative;
    z-index: 1;
    &__table {
      width: 100%;
      height: 490rpx;
      display: flex;
      padding: 0 22rpx;
      margin-bottom: 32rpx;
      .tr {
        width: 300rpx;
        &:first-child {
          width: 175rpx;
          padding-right: 4rpx;
        }
        &:last-child {
          width: 189rpx;
          padding-left: 4rpx;
        }
      }
      .td,
      .th {
        width: 100%;
        height: 98rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-bottom: 4rpx;
      }
      .td {
        font-size: 24rpx;
        font-weight: bold;
        color: #4d2300;
        .active {
          font-size: 18rpx;
          font-weight: normal;
        }
        .more {
          width: 28rpx;
          height: 32rpx;
          margin-left: 4rpx;
        }
        .dot {
          margin-right: 10rpx;
        }
        .red {
          color: #ff3308;
        }
      }
      .th {
        font-size: 26rpx;
        font-weight: bold;
        color: #ffffff;
        &.large {
          font-size: 32rpx;
        }
        .active {
          font-size: 24rpx;
          margin-top: 0.4em;
        }
      }
      .info {
        width: 100%;
        height: 386rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        &-title {
          font-size: 26rpx;
          font-weight: 500;
          color: #4d2300;
          text-align: center;
          margin-bottom: 8rpx;
          .active {
            color: #ff7100;
          }
          .icon {
            width: 48rpx;
            height: 38rpx;
          }
        }
        &-tips {
          position: relative;
          font-size: 22rpx;
          font-weight: 500;
          color: #6baf42;
          text-align: center;
          line-height: 32rpx;
          .active {
            color: #ff7100;
          }
          .num {
            font-size: 28rpx;
          }
          &::before,
          &::after {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            font-size: 36rpx;
            color: #54b22a;
          }
          &::before {
            content: '（';
            left: -40rpx;
          }
          &::after {
            content: '）';
            right: -40rpx;
          }
        }
      }
    }
    &__button {
      position: relative;
      width: 660rpx;
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, #ff862c, #ff9c4c 49%, #ff862c 98%);
      border-radius: 54rpx;
      margin: 0 auto;
      &::after {
        content: '';
        display: flex;
        width: 238rpx;
        height: 36rpx;
        position: absolute;
        left: 50%;
        bottom: 18rpx;
        transform: translateX(-50%);
        background: #ff8425;
        border-radius: 50%;
        filter: blur(20rpx);
      }
      .btn {
        position: relative;
        width: 640rpx;
        height: 72rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36rpx;
        font-weight: 500;
        color: #ffffff;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.3),
          rgba(255, 255, 255, 0) 59%
        );
        border-radius: 44rpx;
        box-shadow:
          2rpx 4rpx 4rpx 0rpx rgba(255, 173, 106, 0.6) inset,
          -2rpx 4rpx 4rpx 0rpx rgba(255, 207, 174, 0.29) inset;
        z-index: 1;
      }
    }
    &__list {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      padding-top: 16rpx;
      margin-bottom: 28rpx;
      .list-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 320rpx;
        height: 74rpx;
        font-size: 28rpx;
        font-weight: 500;
        color: #ff7424;
        background: #dfffdf;
        border: 2rpx solid #ff7424;
        border-radius: 40rpx;
        margin-bottom: 28rpx;
        &__icon {
          width: 38rpx;
          height: 32rpx;
          margin-right: 12rpx;
          &.qr {
            height: 32rpx;
          }
        }
      }
    }
    &__desc {
      font-size: 20rpx;
      color: #333333;
      line-height: 32rpx;
      padding: 0 16rpx 0 24rpx;
      .title {
        font-size: 22rpx;
        font-weight: 500;
      }
      .active {
        font-weight: 500;
      }
      .line {
        padding-left: 7.2em;
      }
    }
  }
  &-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 708rpx;
  }
}
</style>
