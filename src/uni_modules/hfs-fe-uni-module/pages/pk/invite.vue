<template>
  <view class="pk-invite">
    <view class="pk-invite-header">
      <view class="pk-invite-header__logo">
        <image
          class="img"
          :src="`${resourceUrl}invite/app_student_logo.png`"
          mode="scaleToFill"
        />
      </view>
      <view class="pk-invite-header__info">
        <view class="app-name">
          好分数学生端
        </view>
        <view class="app-desc">
          4500万学生的智慧学习方式
        </view>
      </view>
    </view>
    <view class="pk-invite-content">
      <view class="content-bg1" />
      <view class="content-bg2" />
      <view class="content-bg3" />
      <view class="content">
        <view class="content-item1">
          <view class="content-item1-title" />
          <view class="content-item1-content">
            <view class="content-item1-content__user-info">
              <view class="content-item1-content__user-info__wrapper">
                <view class="avatar">
                  <image
                    class="avatar-image"
                    :src="`${resourceUrl}avatar.png`"
                  />
                </view>
                <view class="nick-name">
                  <text>{{ shareInfo.PKInfo.nickName || '' }}</text>
                </view>
              </view>
              <view class="content-item1-content__user-info__slogan">
                <image
                  class="slogan-image"
                  :src="`${resourceUrl}invite/content_item1_user_info_slogan.png`"
                  mode="scaleToFill"
                />
              </view>
            </view>
            <view class="content-item1-content__theme-info">
              <view class="theme-info-item">
                <view class="theme-info-item-dot" />
                <view class="theme-info-item-text">
                  <text>知识点：{{ shareInfo.theme.name || '' }}</text>
                </view>
              </view>
              <view class="theme-info-item">
                <view class="theme-info-item-dot" />
                <view class="theme-info-item-text">
                  <text>比赛规则：10道题看谁做得快</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="content-item2" :class="{ bind: bind === 1 }">
          <view v-if="bind === 0" class="content-item2-title" />
          <view v-if="bind === 0" class="content-item2-invite-code-wrapper">
            <text>邀请码：{{ inviteCode }}</text>
            <ILaunchApp class="invite-button" :open-launch="true">
              <view @click="copyInviteCode('yyy_fzqbd')">
                <text>复制去绑定</text>
              </view>
            </ILaunchApp>
          </view>
          <view class="content-item2-tips" :class="{ bind: bind === 1 }" />
        </view>
      </view>
      <ILaunchApp :app-info="appInfo" :open-launch="true">
        <view class="pk-invite-content-footer" @click="copyInviteCode('yyy_jstz')">
          <image
            class="pk-invite-content-footer__img"
            :src="bind === 1 ? `${resourceUrl}invite/pk_invite_footer_bind.png` : `${resourceUrl}invite/pk_invite_footer.png`"
            mode="scaleToFill"
          />
        </view>
      </ILaunchApp>
    </view>
  </view>
</template>

<script>
import iLaunchApp from '../../components/i-launchApp.vue'
import { isWechat, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { ILaunchApp: iLaunchApp },
  data() {
    return {
      inviteCode: '',
      bind: 0,
      resourceUrl: 'https://fe-resource.haofenshu.com/pk/images/',
      shareInfo: {
        PKInfo: {},
        theme: {},
      },
    }
  },
  computed: {
    appInfoTarget() {
      if (this.bind === 1) {
        return encodeURIComponent(`${window.location.origin}/#/uni_modules/hfs-fe-uni-module/pages/pk/index?inviteCode=${this.inviteCode}&bind=1`)
      }
      return encodeURIComponent(`${window.location.origin}/#/uni_modules/hfs-fe-uni-module/pages/pk/index?inviteCode=${this.inviteCode}`)
    },
    appInfo() {
      return {
        mode: 1,
        target: this.appInfoTarget,
      }
    },
  },
  created() {
    this.initWeiXinConfig()
  },
  methods: {
    async initWeiXinConfig() {
      if (!isWechat())
        return
      const res = await uni.$http.get(`${feConfig.api.wechat || ''}/v1/configs/jssdk-config?url=${encodeURIComponent(location.href.split('#')[0])}`, {}, { custom: { loading: false, error: false }, withCredentials: true })
      try {
        const wxConfig = Object.assign({}, {
          debug: false,
          jsApiList: ['showOptionMenu'],
          openTagList: ['wx-open-launch-app'],
        }, res.data)
        jWeixin.config(wxConfig)
      }
      catch (err) {
        console.log(err) // eslint-disable-line no-console
      }
    },
    async getShareInfo() {
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/pk/get_share`, { inviteCode: this.inviteCode })
      this.shareInfo = res.Data
    },
    copyInviteCode(key) {
      report('pk', key)
      uni.setClipboardData({ data: `${this.inviteCode}`, success: () => { uni.showToast({ title: '复制成功', icon: 'none', duration: 2000 }) } })
    },
  },
  onLoad(options) {
    report('pk', 'yyy_show')
    this.inviteCode = options.inviteCode
    this.bind = +options.bind || 0
    this.getShareInfo()
  },
}
</script>

<style lang="scss" scoped>
.pk-invite {
  min-height: 100vh;
  background: #ffca59 71%;

  &-header {
    display: flex;
    align-items: center;
    padding: 0 32rpx;
    height: 108rpx;
    background-color: #fff;

    &__logo {
      width: 72rpx;
      height: 72rpx;
      margin-right: 16rpx;

      .img {
        width: 100%;
        height: 100%;
      }
    }

    &__info {
      display: flex;
      flex-direction: column;

      color: #333333;

      .app-name {
        height: 42rpx;
        font-size: 30rpx;
        font-weight: 500;
      }

      .app-desc {
        height: 34rpx;
        font-size: 24rpx;
      }
    }
  }

  &-content {
    position: relative;
    width: 100%;
    background: linear-gradient(192deg, #ffb23d, #ffca59 71%);

    &-footer {
      padding: 20rpx 0 42rpx;
      width: 100%;

      display: flex;
      align-items: center;
      justify-content: center;

      &__img {
        width: 674rpx;
        height: 114rpx;
      }
    }
  }

  .content-bg1 {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 1006rpx;
    background: url(https://fe-resource.haofenshu.com/pk/images/invite/bg_item1.png)
      no-repeat;
    background-size: 100% 100%;
  }

  .content-bg2 {
    position: absolute;
    right: 0;
    top: 0;
    width: 420rpx;
    height: 364rpx;
    background: url(https://fe-resource.haofenshu.com/pk/images/invite/bg_item2.png)
      no-repeat;
    background-size: 100% 100%;
  }

  .content-bg3 {
    position: absolute;
    right: 36rpx;
    top: 5rpx;
    width: 154rpx;
    height: 156rpx;
    background: url(https://fe-resource.haofenshu.com/pk/images/invite/bg_item3.png)
      no-repeat;
    background-size: 100% 100%;
  }

  .content {
    position: relative;

    padding-top: 46rpx;
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;

    &-item1 {
      width: 694rpx;
      height: 524rpx;
      background: url(https://fe-resource.haofenshu.com/pk/images/invite/content_item1_bg.png)
        no-repeat;
      background-size: 100% 100%;

      display: flex;
      flex-direction: column;
      align-items: center;

      &-title {
        margin-top: 34rpx;
        width: 391rpx;
        height: 58rpx;
        background: url(https://fe-resource.haofenshu.com/pk/images/invite/content_item1_title.png)
          no-repeat;
        background-size: 100% 100%;
      }

      &-content {
        margin-top: 28rpx;
        width: 614rpx;
        height: 338rpx;
        background: #fff9eb;
        border-radius: 40rpx;

        &__user-info {
          padding: 0 28rpx;
          width: 614rpx;
          height: 176rpx;
          background: url(https://fe-resource.haofenshu.com/pk/images/invite/content_item1_user_info_bg.png)
            no-repeat;
          background-size: 100% 100%;

          display: flex;
          align-items: center;

          &__wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .avatar {
            width: 84rpx;
            height: 84rpx;
            border-radius: 50%;
            border: #ffa300 4rpx solid;

            display: flex;
            align-items: center;
            justify-content: center;

            &-image {
              width: 80rpx;
              height: 80rpx;
            }
          }

          .nick-name {
            margin-top: 4rpx;
            height: 40rpx;
            font-size: 28rpx;
            color: #5d440c;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }

          &__slogan {
            margin-left: 46rpx;
            width: 396rpx;
            height: 43rpx;

            .slogan-image {
              width: 100%;
              height: 100%;
            }
          }
        }

        &__theme-info {
          margin-top: 28rpx;
          padding: 0 28rpx;

          .theme-info-item {
            height: 52rpx;

            display: flex;
            align-items: center;

            &-dot {
              width: 12rpx;
              height: 12rpx;
              background: #ffac00;
              border-radius: 50%;
            }

            &-text {
              margin-left: 12rpx;
              height: 52rpx;
              font-size: 28rpx;
              color: #333333;

              display: flex;
              align-items: center;
            }
          }
        }
      }
    }

    &-item2 {
      position: relative;
      margin-top: 20rpx;
      width: 694rpx;
      height: 494rpx;
      background: #ffffff;
      border-radius: 40rpx;

      display: flex;
      flex-direction: column;
      align-items: center;

      &.bind {
        height: 300rpx;
      }

      &-title {
        margin-top: 34rpx;
        width: 392rpx;
        height: 44rpx;
        background: url(https://fe-resource.haofenshu.com/pk/images/invite/content_item2_title.png)
          no-repeat;
        background-size: 100% 100%;
      }

      &-invite-code-wrapper {
        position: relative;
        margin: 20rpx 40rpx;
        padding: 0 32rpx;
        width: calc(100% - 80rpx);
        height: 68rpx;
        border-radius: 34rpx;
        background: #f6f6f6;
        font-size: 28rpx;
        color: #939393;

        display: flex;
        align-items: center;

        .invite-button {
          position: absolute;
          right: 0;
          top: 0;
          width: 214rpx;
          height: 68rpx;
          background: #ffa300;
          border-radius: 34rpx;
          font-size: 28rpx;
          font-weight: 500;
          color: #ffffff;

          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      &-tips {
        width: 614rpx;
        height: 286rpx;
        background: url(https://fe-resource.haofenshu.com/pk/images/invite/content_item2_tips.png)
          no-repeat;
        background-size: 100% 100%;

        &.bind {
          margin-top: 32rpx;
          width: 614rpx;
          height: 228rpx;
          background: url(https://fe-resource.haofenshu.com/pk/images/invite/content_item2_bind_tips.png)
            no-repeat;
          background-size: 100% 100%;
        }
      }
    }
  }
}
</style>
