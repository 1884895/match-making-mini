<template>
  <view class="recommend">
    <view class="recommend-bg">
      <image class="recommend-bg__header" :src="`${resourceUrl}header_bg.png`" mode="widthFix" />
      <image class="recommend-bg__hot" :src="resourceUrl + bgMap[pageType]" />
    </view>
    <view class="recommend-content">
      <view class="recommend-content__info">
        <view class="title">
          推荐分享名单
        </view>
        <view class="share">
          <view class="share-sub red">
            若已是微信好友，可一键邀请哦
          </view>
          <view class="share-sub">
            85%以上{{ roleType === 2 ? '家长' : '' }}选择转发{{ roleType === 2 ? '家长' : '' }}群快速成团哦～
          </view>
          <view class="share-list">
            <view v-for="(item, index) in shareList" :key="index" class="share-list__item">
              <view class="avatar">
                <image class="avatar-icon" :src="resourceUrl + avatarList[0]" />
                <text class="avatar-text">
                  {{ typeMap[item.type] }}
                </text>
              </view>
              <view class="desc txt-cut">
                {{ item.schoolName }}{{ item.grade }}{{ item.className }}{{ item.name }}{{ roleType === 2 ? '家长' : '' }}
              </view>
              <view class="button">
                <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="shareWeixin" />
                <text>已有微信？\n一键单邀/发群</text>
              </view>
            </view>
            <view v-if="showMask" class="share-list__mask" @click="page++">
              <view class="text">
                查看班级更多用户
              </view>
              <u-icon name="arrow-down" color="#939393" size="30rpx" bold />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  components: { },
  props: {
    pageType: {
      type: String,
      default: '',
    },
    prefix: {
      type: String,
      default: '',
    },
    groupInfo: {
      type: Object,
      default: () => {},
    },
    roleType: {
      type: Number,
    },
  },
  emits: ['shareWeixin', 'report'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/group/',
      avatarList: ['avatar_1.png', 'avatar_2.png', 'avatar_3.png', 'avatar_4.png', 'avatar_5.png'],
      typeMap: {
        1: '待续费用户',
        2: '注册用户',
        3: '意向用户',
      },
      bgMap: {
        2: 'method_group.png',
        3: 'method_share.png',
      },
      ownerAction: {
        1: 'owner_pay_success_pop_click',
        2: 'owner_continue_invite_pop_click',
        3: 'continue_share_pop_click',
      },
      joinerAction: {
        1: 'joiner_pay_success_pop_click',
        2: 'joiner_continue_invite_btn_click',
        3: 'continue_share_pop_click',
      },
      shareInfo: [],
      page: 1,
      pageSize: 10,
    }
  },
  computed: {
    shareList() {
      return this.shareInfo.slice(0, this.page * this.pageSize)
    },
    showMask() {
      return this.shareInfo.length > this.page * this.pageSize
    },
    action() {
      return this.groupInfo.isOwner ? this.ownerAction : this.joinerAction
    },
  },
  created() {
    this.getShareInfo()
  },
  methods: {
    async getShareInfo() {
      const res = await uni.$http.get(`${this.prefix}/v3/activity/groupon/classmates`)
      this.shareInfo = res.data || []
    },
    shareWeixin() {
      this.$emit('shareWeixin')
      this.$emit('report', this.action[this.pageType])
    },
  },
}
</script>

<style lang="scss" scoped>
.recommend {
  position: relative;
  margin: 12rpx 28rpx 24rpx;
  &-bg {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    &__header {
      width: 100%;
    }
    &__hot {
      width: 192rpx;
      height: 30rpx;
      position: absolute;
      left: 50%;
      top: 18rpx;
      transform: translateX(-50%);
    }
  }
  &-content {
    position: relative;
    border-radius: 24rpx;
    padding-top: 72rpx;
    z-index: 1;
    &__info {
      background: #fff;
      border-radius: 24rpx;
      padding: 0 13rpx;
    }
    .title {
      height: 76rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #ff7302;
      font-weight: 500;
    }
    .share {
      background-image: linear-gradient(
        180deg,
        #f2fff2 0%,
        rgba(250, 255, 250, 0) 100%
      );
      border-radius: 34rpx;
      padding: 18rpx 30rpx;
      &-sub {
        font-size: 26rpx;
        font-weight: 500;
        color: #ff2706;
        &.red {
          color: #ff7302;
          margin-bottom: 4rpx;
        }
      }
      &-list {
        padding-top: 10rpx;
        &__item {
          width: 100%;
          height: 124rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1rpx solid rgba(230, 230, 230, 0.6);
          &:last-child {
            border-bottom: none;
          }
          .avatar {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            &-icon {
              width: 48rpx;
              height: 48rpx;
              margin-bottom: 4rpx;
            }
            &-text {
              font-size: 24rpx;
              color: #939393;
            }
          }
          .desc {
            font-size: 26rpx;
            color: #333333;
            line-height: 36rpx;
            margin: 0 12rpx;
          }
          .button {
            position: relative;
            width: 168rpx;
            height: 84rpx;
            font-size: 22rpx;
            color: #e75143;
            line-height: 32rpx;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2rpx solid #e75143;
            border-radius: 12rpx;
            flex-shrink: 0;
          }
        }
        &__mask {
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
}
</style>
