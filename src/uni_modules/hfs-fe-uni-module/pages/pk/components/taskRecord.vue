<template>
  <u-popup :show="popup.show" mode="center" :overlay="true" bg-color="transparent">
    <view class="popup">
      <view v-if="popup.type === 'record'" class="index-popup__record">
        <view class="title">
          <view class="title-bg" />
          <view class="title-name">
            任务记录
          </view>
        </view>
        <view v-if="recordList.length" class="content">
          <scroll-view scroll-y="true" style="max-height: 754rpx">
            <view class="records">
              <view v-for="(item, index) in recordList" :key="index" class="record">
                <view class="record-time">
                  <view class="record-time__icon" />
                  <view class="record-time__title">
                    {{ item.day }}
                  </view>
                </view>
                <view class="record-task">
                  <view class="record-task__content">
                    <view v-for="(task, taskIndex) in item.records" :key="taskIndex" class="item">
                      <view class="item-dot" />
                      <view v-if="task.id === 1 && task.done === 1" class="item-name">
                        绑定成功，挑战次数 +1
                      </view>
                      <view v-if="task.id === 2" class="item-name">
                        分享活动，挑战次数 +1
                      </view>
                      <template v-if="task.id === 3">
                        <view v-if="task.done === 0" class="item-name">
                          邀请<text class="yellow">
                            {{ task.phone }}
                          </text>注册未绑定，去<text class="red" @click="remainBind">
                            提醒TA绑定
                          </text>获得挑战次数
                        </view>
                        <view v-if="task.done === 1" class="item-name">
                          邀请<text class="yellow">
                            {{ task.stuName }}
                          </text>同学绑定成功，挑战次数 +1
                        </view>
                      </template>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
        <view v-else class="empty">
          <image class="empty-img" :src="`${resourceUrl}home_empty.png`" mode="widthFix" />
          <view class="empty-text">
            暂无任务记录~
          </view>
        </view>
        <view class="close" @click="close">
          <u-icon name="close" color="#333333" size="36rpx" bold />
        </view>
      </view>
      <view v-if="popup.type === 'send'" class="index-popup__send">
        <view class="title">
          与好友挑战
        </view>
        <u-input
          v-model="inputInviteCode" class="input"
          :custom-style="{ background: '#f6f6f6', borderRadius: '64rpx', padding: '32rpx 22rpx', marginTop: '38rpx' }"
          border="none" placeholder="输入好友邀请码，即可挑战" clearable
        />
        <view class="button" @click="startChallenge(inputInviteCode)">
          立即挑战
        </view>
        <image class="star" :src="`${resourceUrl}index_popup_star.png`" mode="widthFix" />
        <view class="close" @click="close">
          <u-icon name="close" color="#333333" size="36rpx" bold />
        </view>
      </view>
      <view v-if="popup.type === 'accept'" class="index-popup__accept">
        <view class="content">
          <view class="content-user">
            <view class="content-user__left">
              <view class="user">
                <image class="user-avater" :src="`${resourceUrl}avatar.png`" />
                <view class="user-name">
                  我
                </view>
              </view>
            </view>
            <image class="content-user__center" :src="`${resourceUrl}home_icon_pk.png`" />
            <view class="content-user__right">
              <view class="user">
                <image class="user-avater" :src="`${resourceUrl}avatar.png`" />
                <view class="user-name">
                  好友
                </view>
              </view>
            </view>
          </view>
          <view class="content-title">
            接受好友的挑战
          </view>
          <view class="content-sub">
            邀请码
          </view>
          <view v-if="pkShareInfo.PKInfo && pkShareInfo.PKInfo.inviteCode" class="content-code">
            {{
              pkShareInfo.PKInfo.inviteCode }}
          </view>
          <view class="content-info">
            <view v-if="pkShareInfo.theme && pkShareInfo.theme.name" class="content-info__title">
              {{
                pkShareInfo.theme.name }}
            </view>
            <view v-if="pkShareInfo.PKInfo && pkShareInfo.PKInfo.score" class="content-info__grades">
              好友的成绩：{{
                pkShareInfo.PKInfo.score }}秒/10题
            </view>
          </view>
          <view
            v-if="pkShareInfo.PKInfo && pkShareInfo.PKInfo.inviteCode" class="content-button"
            @click="startChallenge(pkShareInfo.PKInfo.inviteCode)"
          >
            立即挑战
          </view>
        </view>
        <view class="close" @click="close">
          <u-icon name="close" color="#333333" size="36rpx" bold />
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script>
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    taskRecords: {
      type: Array,
      default: () => [],
    },
    pkShare: {
      type: Object,
      default: () => { },
    },
    remainChance: {
      type: Number,
      default: 0,
    },
  },
  emits: ['remainBind'],

  data() {
    return {
      resourceUrl: `${feConfig.resourceUrl}/pk/images/`,
      inputInviteCode: '',
      popup: {
        show: false,
        type: '',
        theme: {},
      },
    }
  },
  computed: {
    recordList() {
      return this.taskRecords || []
    },
    pkShareInfo() {
      return this.pkShare || {}
    },
  },
  methods: {
    remainBind() {
      this.$emit('remainBind')
    },
    open(type, params = {}) {
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    async startChallenge(inviteCode) {
      report('pk', 'sy_hypp_ljtz')
      if (!inviteCode)
        return uni.showToast({ title: '请输入邀请码', icon: 'none' })
      if (this.remainChance === 0)
        return uni.showToast({ title: '做任务增加挑战次数后才能挑战哦~', icon: 'none' })
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/pk/get_share${uni.$u.queryParams({ inviteCode })}`, {}, { custom: { loading: false } })
      const shareInfo = res.Data || {}
      if (!shareInfo)
        return
      const url = '/uni_modules/hfs-fe-uni-module/pages/pk/pk'
      const params = { inviteCode, code: shareInfo.theme.code }
      uni.navigateTo({
        url: `${url}${uni.$u.queryParams(params)}`,
        success: (res) => {
          const innerAudioContext = uni.createInnerAudioContext()
          innerAudioContext.play()
          res.eventChannel.emit('pkAudio', { innerAudioContext })
        },
      })
      this.close()
    },
    close() {
      this.popup.show = false
      this.inputInviteCode = ''
    },
  },
}
</script>

<style lang="scss" scoped>
.index-popup {
  &__record {
    position: relative;
    width: 620rpx;
    min-height: 720rpx;
    background: linear-gradient(180deg, #fff9c0, #ffffff 19%);
    border: 2rpx solid #ffffff;
    border-radius: 52rpx;

    .title {
      margin: 30rpx auto 10rpx auto;
      display: flex;
      flex-direction: column;
      align-items: center;

      &-bg {
        width: 164rpx;
        height: 22rpx;
        margin-top: 30rpx;
        background: #fff87b;
        border-radius: 6rpx;
      }

      &-name {
        margin-top: -50rpx;
        font-size: 36rpx;
        font-weight: 500;
        color: #5d4212;
      }
    }

    .content {
      width: 100%;
      padding: 6rpx 32rpx 38rpx 34rpx;

      .records {
        .record {
          &-time {
            display: flex;
            align-items: center;

            &__icon {
              width: 22rpx;
              height: 22rpx;
              background: #ffffff;
              border: 6rpx solid #ffa516;
              border-radius: 50%;
            }

            &__title {
              font-size: 30rpx;
              font-weight: 500;
              color: #ffa516;
              margin-left: 14rpx;
            }
          }

          &-task {
            position: relative;
            margin-left: 11rpx;
            margin-top: -10rpx;
            margin-bottom: -10rpx;
            border-left: 2rpx dashed #ffba1d;
            padding: 12rpx 0 26rpx 24rpx;

            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              width: 1rpx;
              height: 200%;
              border-left: 2rpx dashed #ffba1d;
              transform: scale(0.5);
              transform-origin: 0 0;
            }

            &__content {
              width: 518rpx;
              background: #fff9f0;
              border-radius: 20rpx;
              padding: 14rpx 16rpx 16rpx 20rpx;

              .item {
                margin-bottom: 16rpx;
                display: flex;

                &:last-child {
                  margin-bottom: 0;
                }

                &-dot {
                  width: 6rpx;
                  height: 6rpx;
                  background: #333333;
                  border-radius: 50%;
                  margin-top: calc(0.5em - 3rpx);
                }

                &-name {
                  margin-left: 8rpx;
                  flex: 1;
                  font-size: 26rpx;
                  color: #333333;

                  .yellow {
                    color: #ffa516;
                  }

                  .red {
                    color: #ff0e0e;
                    text-decoration: underline;
                  }
                }
              }
            }
          }

          &:last-child {
            .record-task {
              border-left: none;

              &::before {
                border-left: none;
              }
            }
          }
        }
      }
    }

    .empty {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      &-img {
        width: 302rpx;
        height: 209rpx;
        margin-bottom: 26rpx;
      }
      &-text {
        font-size: 30rpx;
        color: #939393;
      }
    }

    .close {
      position: absolute;
      top: 30rpx;
      right: 0;
      transform: translateX(-50%);
      width: 52rpx;
      height: 52rpx;
    }
  }

  &__send {
    position: relative;
    width: 536rpx;
    height: 428rpx;
    background: linear-gradient(180deg, #fff9c0, #ffffff 32%);
    border: 2rpx solid #ffffff;
    border-radius: 52rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .title {
      margin-top: 50rpx;
      width: 180rpx;
      height: 50rpx;
      font-size: 36rpx;
      font-weight: 500;
      color: #333333;
    }

    .input {
      width: 480rpx;
      height: 82rpx;
      z-index: 1;
      background: #f6f6f6;
      margin: 38rpx 28rpx 88rpx 28rpx;
    }

    .button {
      width: 388rpx;
      height: 76rpx;
      background: linear-gradient(225deg, #ffbc2c 0%, #ffa112);
      border-radius: 38rpx;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 44rpx;
      font-size: 26rpx;
      font-weight: 500;
      color: #ffffff;
    }

    .star {
      width: 82rpx;
      height: 82rpx;
      position: absolute;
      top: 74rpx;
      left: 28rpx;
    }

    .close {
      position: absolute;
      top: 30rpx;
      right: 0;
      transform: translateX(-50%);
      width: 52rpx;
      height: 52rpx;
    }
  }

  &__accept {
    position: relative;
    width: 536rpx;
    height: 630rpx;
    background: linear-gradient(180deg, #fff9c0, #ffffff 32%);
    border: 2rpx solid #ffffff;
    border-radius: 52rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .content {
      padding: 52rpx 40rpx 38rpx 40rpx;
      display: flex;
      flex-direction: column;
      align-items: center;

      &-user {
        margin-bottom: 24rpx;
        justify-content: center;
        display: flex;

        &__left {
          .user {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            &-avater {
              width: 96rpx;
              height: 96rpx;
              border-radius: 50%;
              border: 3.05rpx solid #416aff;
            }

            &-name {
              width: 88rpx;
              height: 42rpx;
              background: linear-gradient(270deg, #2db8ff, #416aff 3%);
              border-radius: 22rpx;
              font-size: 24rpx;
              margin-top: -22rpx;
              z-index: 1;
              text-align: center;
              display: flex;
              justify-content: center;
              align-items: center;
              font-weight: 500;
              color: #ffffff;
            }
          }
        }

        &__center {
          width: 70rpx;
          height: 68rpx;
          margin: 14rpx 44rpx;
        }

        &__right {
          .user {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            &-avater {
              border-radius: 50%;
              width: 96rpx;
              height: 96rpx;
              border: 3.05rpx solid #ff4646;
            }

            &-name {
              width: 88rpx;
              height: 42rpx;
              background: linear-gradient(270deg, #ff4646, #ff8246 3%);
              border-radius: 22rpx;
              font-size: 24rpx;
              text-align: center;
              margin-top: -22rpx;
              z-index: 1;
              display: flex;
              justify-content: center;
              align-items: center;
              font-weight: 500;
              color: #ffffff;
            }
          }
        }
      }

      &-title {
        font-size: 32rpx;
        font-weight: 500;
        margin-bottom: 14rpx;
        color: #333333;
      }

      &-sub {
        margin-bottom: 6rpx;
        font-size: 26rpx;
        color: #939393;
      }

      &-code {
        font-size: 32rpx;
        font-weight: 500;
        margin-bottom: 24rpx;
        color: #333333;
      }

      &-info {
        width: 456rpx;
        height: 128rpx;
        background: #f6f6f6;
        border-radius: 16rpx;
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: #333333;
        align-items: center;
        margin-bottom: 28rpx;

        &__title {
          font-size: 30rpx;
        }

        &__grades {
          font-size: 24rpx;
        }
      }

      &-button {
        height: 76rpx;
        width: 392rpx;
        background: linear-gradient(225deg, #ffbc2c 0%, #ffa112);
        border-radius: 38rpx;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26rpx;
        font-weight: 500;
        color: #ffffff;
      }
    }

    .close {
      position: absolute;
      top: 30rpx;
      right: 0;
      transform: translateX(-50%);
      width: 52rpx;
      height: 52rpx;
    }
  }
}
</style>
