<template>
  <view class="share">
    <!-- #ifdef H5 -->
    <view class="share-launch">
      <ILaunchApp>
        <view class="share-launch__content">
          <image class="logo" :src="`${resourceUrl}share_logo.png`" mode="widthFix" />
          <view class="message">
            <view class="title">
              下载APP，免费查成绩
            </view>
            <view class="sub">
              完成注册绑定就能查到成绩啦～
            </view>
          </view>
        </view>
      </ILaunchApp>
    </view>
    <!-- #endif -->
    <view class="share-info">
      <Marquee :prefix="prefix" :is-app-student="isHFSAppStudent" />
      <image class="share-info__bg" :src="`${resourceUrl}share_head_bg.png`" mode="widthFix" />
      <!-- #ifdef MP-WEIXIN -->
      <view class="share-info__title">
        一个<text class="tag">
          免费查成绩
        </text>的小程序
      </view>
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <view class="share-info__title">
        一个<text class="tag">
          免费查成绩
        </text>的APP
      </view>
      <!-- #endif -->
      <Vip />
      <view class="share-info__button flex-row-center">
        <!-- #ifdef MP-WEIXIN -->
        <view v-if="!isLogin" class="btn flex-row-center" @click="jumpLogin('yyy_dl_click')">
          去登录
        </view>
        <view v-else-if="!hasStudent" class="btn flex-row-center" @click="jumpBind">
          去绑定
        </view>
        <view v-else class="btn flex-row-center" @click="jumpOperation">
          参加活动
        </view>
        <!-- #endif -->
      </view>
    </view>
    <view class="share-flow" :class="{ top: isH5 }">
      <!-- #ifdef MP-WEIXIN -->
      <image class="share-flow__title bottom" :src="`${resourceUrl}share_title.png`" mode="widthFix" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <image class="share-flow__title" :src="`${resourceUrl}share_title.png`" mode="widthFix" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <ILaunchApp>
        <view class="share-flow__copy">
          <view class="value">
            邀请码: {{ options.icode || '' }}
          </view>
          <view class="text flex-row-center" @click="handleCopy">
            复制去注册
          </view>
        </view>
      </ILaunchApp>
      <view class="share-flow__remind">注册绑定务必填写邀请码，才可获得奖励哦~</view>
      <!-- #endif -->
      <!-- #ifdef MP-WEIXIN -->
      <image class="share-flow__detail" :src="`${resourceUrl}share_flow_wx.png`" mode="widthFix" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <image class="share-flow__detail" :src="`${resourceUrl}share_flow.png`" mode="widthFix" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <ILaunchApp>
        <view class="share-flow__open flex-row-center">
          打开好分数<u-icon class="right" name="arrow-right" color="#FFA300" size="14" />
        </view>
      </ILaunchApp>
      <!-- #endif -->
      <!-- #ifdef MP-WEIXIN -->
      <view class="share-flow__open" />
      <!-- #endif -->
    </view>
    <image class="share-recommend" :src="`${resourceUrl}share_recommend.png`" mode="widthFix" />
    <view class="share-tips">
      <view class="share-tips__title">
        重要提示：
      </view>
      <view class="share-tips__content">
        1. 完成绑定就能查到成绩啦  2.注册绑定务必填写邀请码，才可获得奖励哦~
      </view>
    </view>
    <view class="share-footer" :class="{ gap: isH5 }">
      <!-- #ifdef MP-WEIXIN -->
      <view v-if="!isLogin" class="share-footer__button flex-row-center" @click="jumpLogin('yyy_dl_click')">
        去登录<image class="run" :src="`${resourceUrl}operation_run.png`" mode="widthFix" />
      </view>
      <view v-else-if="!hasStudent" class="share-footer__button flex-row-center" @click="jumpBind">
        去绑定<image class="run" :src="`${resourceUrl}operation_run.png`" mode="widthFix" />
      </view>
      <view v-else class="share-footer__button flex-row-center" @click="jumpOperation">
        参加活动<image class="run" :src="`${resourceUrl}operation_run.png`" mode="widthFix" />
      </view>
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <ILaunchApp>
        <view class="share-footer__copy">
          <view class="value">
            邀请码: {{ options.icode || '' }}
          </view>
          <view class="text flex-row-center" @click="handleCopy">
            复制去注册
          </view>
        </view>
      </ILaunchApp>
      <!-- #endif -->
    </view>
  </view>
</template>

<script>
import iLaunchApp from '../../components/i-launchApp.vue'
import Marquee from './components/marquee.vue'
import Vip from './components/vip.vue'
import mixins from './mixins.js'
import { isHFSStudent, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Marquee, Vip, ILaunchApp: iLaunchApp }, // eslint-disable-line vue/no-reserved-component-names
  mixins: [mixins],
  data() {
    return {
      pageType: 'share',
      resourceUrl: 'https://fe-resource.haofenshu.com/newPromoter/',
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
    isHFSAppStudent() {
      // #ifdef H5
      if (isHFSStudent() || this.$route.query.platform === 'student') {
        return true
      }
      // #endif
      return false
    },
    isH5() {
      let H5 = false
      // #ifdef H5
      H5 = true
      // #endif
      return H5
    },
  },
  onLoad() {
    report(this.actionId, 'fx_show')
    uni.setNavigationBarTitle({ title: '好分数官方下载' })
  },
  methods: {
    initPage() {

    },
    handleCopy() {
      report(this.actionId, 'fx_fzqzc')
      uni.setClipboardData({ data: this.options.icode, success: () => { uni.showToast({ title: '复制成功', icon: 'none', duration: 2000 }) } })
    },
  },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
.share {
  &-launch {
    position: sticky;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 100;
    &__content {
      height: 104rpx;
      padding: 0 30rpx;
      background: #fff;
      display: flex;
      align-items: center;
      .logo {
        width: 48rpx;
        height: 52rpx;
        margin-right: 16rpx;
      }
      .message {
        display: flex;
        flex-direction: column;
        margin-right: auto;
        .title {
          font-size: 28rpx;
          color: #333333;
          margin-bottom: 2rpx;
        }
        .sub {
          font-size: 22rpx;
          color: #ffa100;
        }
      }
      .btn {
        width: 180rpx;
        height: 60rpx;
        font-size: 30rpx;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(230deg, #ffa100 9%, #ffc700 93%);
        border-radius: 34rpx;
      }
    }
  }
  &-info {
    position: relative;
    width: 100%;
    height: 666rpx;
    &__bg {
      width: 100%;
      position: absolute;
      left: 0;
      top: 0;
    }
    &__title {
      position: relative;
      font-size: 40rpx;
      font-weight: 500;
      color: #333333;
      text-align: center;
      line-height: 66rpx;
      margin-bottom: 56rpx;
      .tag {
        color: #ff4c21;
        font-size: 48rpx;
      }
    }
    &__button {
      position: relative;
      .btn {
        width: 636rpx;
        height: 68rpx;
        background: linear-gradient(225deg, #ff8e00, #ff7a00);
        border-radius: 34rpx;
        font-size: 32rpx;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }
  &-flow {
    padding-top: 28rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    margin-bottom: 16rpx;
    position: relative;
    &.top {
      margin-top: -84rpx;
    }
    &__title {
      width: 552rpx;
      height: 44rpx;
      margin-bottom: 32rpx;
      &.bottom {
        margin-bottom: 22rpx;
      }
    }
    &__copy {
      position: relative;
      width: 662rpx;
      background: #f6f6f6;
      border-radius: 44rpx;
      padding: 14rpx 30rpx;
      margin-bottom: 18rpx;
      .value {
        font-size: 28rpx;
        color: #ff0000;
      }
      .text {
        position: absolute;
        top: 0;
        right: 0;
        width: 214rpx;
        height: 68rpx;
        background: #ffa300;
        border-radius: 44rpx;
        font-size: 28rpx;
        font-weight: 500;
        color: #ffffff;
      }
    }
    &__remind {
      font-size: 22rpx;
      color: #ffa300;
      align-self: flex-start;
      margin: 0 72rpx 20rpx;
    }
    &__detail {
      width: 100%;
      height: 662rpx;
    }
    &__open {
      width: 100%;
      padding: 20rpx;
      font-size: 28rpx;
      color: #ffa300;
      .right {
        margin-right: 8rpx;
      }
    }
  }
  &-recommend {
    width: 100%;
    height: 1120rpx;
  }
  &-tips {
    padding: 12rpx 28rpx;
    &__title {
      font-size: 20rpx;
      color: #ff5e5e;
      margin-bottom: 4rpx;
    }
    &__content {
      font-size: 20rpx;
      color: #939393;
    }
  }
  &-footer {
    width: 100%;
    padding: 20rpx 80rpx 32rpx;
    position: fixed;
    bottom: 0;
    left: 0;
    background: #ffffff;
    &.gap {
      padding: 20rpx 28rpx 32rpx;
    }
    &__button {
      position: relative;
      width: 100%;
      height: 84rpx;
      background: linear-gradient(180deg, #ff6a34, #ffca45);
      border: 1rpx solid #ffffff;
      border-radius: 43rpx;
      box-shadow:
        0 4rpx 8rpx 0 rgba(0, 0, 0, 0.06),
        0 2rpx 6rpx 0 rgba(255, 255, 255, 0.5) inset;
      font-size: 32rpx;
      font-weight: 500;
      color: #ffffff;
      .run {
        position: absolute;
        top: 8rpx;
        right: 164rpx;
        width: 72rpx;
        height: 68rpx;
      }
    }
    &__copy {
      position: relative;
      background: #ffeedd;
      border-radius: 44rpx;
      padding: 22rpx 46rpx;
      margin-bottom: 18rpx;
      border: 2rpx solid #ffd0b8;
      .value {
        font-size: 28rpx;
        color: #ff5f00;
      }
      .text {
        position: absolute;
        top: 0;
        right: 0;
        width: 298rpx;
        height: 84rpx;
        background: linear-gradient(180deg, #ff6a34, #ffca45);
        border-radius: 44rpx;
        font-size: 28rpx;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }
}
</style>
