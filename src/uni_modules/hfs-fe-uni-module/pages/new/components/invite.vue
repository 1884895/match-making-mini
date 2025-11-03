<template>
  <view class="invited">
    <view class="invited-header">
      <image class="invited-header__title" :src="`${resourceUrl}invite_title.png`" mode="widthFix" />
      <view class="invited-header__count">
        邀约分享名单
      </view>
    </view>
    <view class="invited-content">
      <view class="invited-content__info">
        <view class="sub red">
          若已是微信好友，可一键邀请哦
        </view>
        <view v-if="isHFSAppStudent" class="sub">
          <text class="sub-rate">
            85%
          </text>以上同学选择转发群聊快速邀约哦～
        </view>
        <view v-else class="sub">
          <text class="sub-rate">
            85%
          </text>以上家长选择转发家长群快速邀约哦～
        </view>
        <view class="list">
          <view v-for="(item, index) in list" :key="index" class="item">
            <image class="avatar" :src="`${resourceUrl}avatar_3.png`" />
            <view class="desc txt-cut">
              {{ item.schoolName }}{{ item.grade }}{{ item.className }}{{ item.name }}<text v-if="!isHFSAppStudent">
                家长
              </text>
            </view>
            <view class="operation">
              <view class="operation-button">
                <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareWeixin')" />
                <text>一键单邀/发群</text>
              </view>
              <view class="operation-tips">
                微信好友可一键转发
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="showMask" class="invited-mask" @click="page++">
      <view class="text">
        查看更多
      </view>
      <u-icon name="arrow-down" color="#939393" size="16rpx" bold />
    </view>
    <view class="invited-list">
      <view class="invited-list__item">
        <u-button :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('sharePoster')" />
        <image class="icon" :src="`${resourceUrl}share_img.png`" />
        <text>发送邀请海报</text>
      </view>
      <view class="invited-list__item">
        <u-button :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="share('shareQr')" />
        <image class="icon qr" :src="`${resourceUrl}share_qr.png`" />
        <text>面对面邀约</text>
      </view>
    </view>
  </view>
</template>

<script>
import { isHFSStudent, report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    prefix: {
      type: String,
      default: '',
    },
  },
  emits: ['sharePoster', 'shareQr', 'shareWeixin'],
  data() {
    return {
      actionId: '667b7145925980bc5a2c6393',
      resourceUrl: 'https://fe-resource.haofenshu.com/new/',
      classList: [],
      page: 1,
      pageSize: 10,
      actionMap: {
        sharePoster: 'hdy2_fshb_click',
        shareQr: 'hdy2_mdm_click',
        shareWeixin: 'hdy2_jsyy_click',
      },
    }
  },
  computed: {
    list() {
      return this.classList.slice(0, this.page * this.pageSize)
    },
    showMask() {
      return this.classList.length > this.page * this.pageSize
    },
    isHFSAppStudent() {
      // #ifdef H5
      if (isHFSStudent()) {
        return true
      }
      // #endif
      return false
    },
  },
  created() {
    this.getClassmate()
  },
  methods: {
    async getClassmate() {
      const res = await uni.$http.get(`${this.prefix}/v3/invitation/classmate`)
      this.classList = res.data || {}
    },
    share(type) {
      this.$emit(type)
      report(this.actionId, this.actionMap[type])
    },
  },
}
</script>

<style lang="scss" scoped>
.invited {
  position: relative;
  margin: 0 28rpx 24rpx;
  padding: 20rpx 28rpx 30rpx;
  background: #ffffff;
  border-radius: 32rpx;
  &-header {
    display: flex;
    margin-bottom: 24rpx;
    &__title {
      width: 234rpx;
      height: 60rpx;
    }
    &__count {
      font-size: 26rpx;
      color: #b4814d;
      margin: 14rpx 0 0 12rpx;
    }
  }
  &-content {
    background: linear-gradient(180deg, #ffecbc, #ffffff);
    border-radius: 40rpx;
    padding: 1px;
    &__info {
      padding: 22rpx 26rpx 0;
      background: linear-gradient(180deg, #fffadb, #ffffff 46%);
      border-radius: 40rpx;
      .sub {
        font-size: 26rpx;
        font-weight: 500;
        color: #333;
        &.red {
          margin-bottom: 4rpx;
        }
        &-rate {
          color: #ffa300;
        }
      }
      .list {
        padding-top: 10rpx;
        .item {
          width: 100%;
          height: 124rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1rpx dashed rgba(230, 230, 230, 0.6);
          &:last-child {
            border-bottom: none;
          }
          .avatar {
            width: 66rpx;
            height: 66rpx;
            flex-shrink: 0;
          }
          .desc {
            font-size: 24rpx;
            color: #333333;
            line-height: 34rpx;
            margin: 0 62rpx 0 30rpx;
          }
          .operation {
            &-button {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 182rpx;
              height: 48rpx;
              background: #ffa300;
              border-radius: 24rpx;
              font-size: 22rpx;
              font-weight: 500;
              color: #ffffff;
            }
            &-tips {
              margin-top: 2rpx;
              font-size: 18rpx;
              color: #939393;
              text-align: center;
            }
          }
        }
        &-mask {
          width: 100%;
          height: 96rpx;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          .text {
            font-size: 28rpx;
            color: #939393;
          }
        }
      }
    }
  }
  &-mask {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    .text {
      font-size: 22rpx;
      color: #939393;
    }
  }
  &-list {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16rpx;
    &__item {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 310rpx;
      height: 74rpx;
      font-size: 28rpx;
      font-weight: 500;
      color: #ff9d5c;
      background: #ffffff;
      border: 2rpx solid #ffebdf;
      border-radius: 40rpx;
      .icon {
        width: 38rpx;
        height: 32rpx;
        margin-right: 12rpx;
        &.qr {
          height: 32rpx;
        }
      }
    }
  }
}
</style>
