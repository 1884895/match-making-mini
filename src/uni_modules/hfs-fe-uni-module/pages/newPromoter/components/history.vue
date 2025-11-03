<template>
  <view class="history">
    <view class="history-content">
      <view class="history-content__header">
        <image class="title" :src="`${resourceUrl}invite_history_bg.png`" mode="widthFix" />
        <view class="count">您已成功邀请 {{ inviterInfo.invited || 0 }} 人</view>
        <view class="award" @click="openPopup('showAward')" />
      </view>
      <view class="history-content__info">
        <template v-if="inviterInfo.invitations && inviterInfo.invitations.length">
          <view class="list">
            <view v-for="(item, index) in list" :key="index" class="item" :class="{ active: item.status === 1 }">
              <image v-if="statusMap[item.status].showAvatar" class="avatar" :src="`${resourceUrl}avatar.png`" />
              <view v-else class="avatar" />
              <view class="name one-txt-cut">{{ item[statusMap[item.status].name] }}<template v-if="!isHFSAppStudent && item.status !== 1">家长</template></view>
              <view class="status">{{ statusMap[item.status].status }}</view>
              <view v-if="item.status === 1" class="tag flex-row-center" @click="openPopup('showInvite')">{{ statusMap[item.status].tag }}</view>
              <view v-else class="tag flex-row-center" :class="{ hidden: !statusMap[item.status].tag }">{{ statusMap[item.status].tag }}</view>
            </view>
          </view>
          <view v-if="showMask" class="mask" @click="page++">
            <view class="text">查看更多</view>
            <u-icon name="arrow-down" color="#939393" size="16rpx" bold />
          </view>
        </template>
        <view v-else class="empty">尚未邀请成功，还需继续努力～</view>
      </view>
    </view>
  </view>
</template>

<script>
import { isHFSStudent } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    inviterInfo: {
      type: Object,
      default: () => ({}),
    },
    userInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['showInvite', 'showAward'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/newPromoter/',
      statusMap: {
        1: { status: '注册未绑定', tag: '提醒TA', showAvatar: false, name: 'phone' },
        2: { status: '绑定成功', tag: '邀请成功+1', showAvatar: true, name: 'name' },
        3: { status: '老用户', tag: '', showAvatar: true, name: 'name' },
        4: { status: '已注销', tag: '', showAvatar: true, name: 'name' },
        5: { status: '奖励已兑换', tag: '邀请成功+1', showAvatar: true, name: 'name' },
        6: { status: '非本校', tag: '', showAvatar: true, name: 'name' },
      },
      page: 1,
      pageSize: 5,
    }
  },
  computed: {
    list() {
      const { invitations = [] } = this.inviterInfo
      return invitations.slice(0, this.page * this.pageSize)
    },
    showMask() {
      const { invitations = [] } = this.inviterInfo
      return invitations.length > this.page * this.pageSize
    },
    studentInfo() {
      return this.userInfo.linkedStudent || {}
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
  methods: {
    openPopup(type) {
      this.$emit(type)
    },
  },
}
</script>

<style lang="scss" scoped>
.history {
  position: relative;
  padding: 48rpx 38rpx 16rpx;
  background: linear-gradient(180deg, rgba(34, 201, 255, 0.9), #22c9ff 100%);
  border-top-left-radius: 18rpx;
  border-top-right-radius: 18rpx;
  margin-top: -284rpx;
  &-content {
    background: #ffffff;
    border-bottom-left-radius: 40rpx;
    border-bottom-right-radius: 40rpx;
    &__header {
      display: flex;
      position: relative;
      .title {
        width: 100%;
        height: 116rpx;
      }
      .count {
        font-size: 36rpx;
        font-weight: bold;
        color: #333333;
        position: absolute;
        top: 26rpx;
        left: 32rpx;
      }
      .award {
        width: 246rpx;
        height: 86rpx;
        position: absolute;
        top: 0;
        right: 0;
      }
    }
    &__info {
      padding: 0 18rpx 45rpx;
      .list {
        padding: 14rpx 28rpx;
        background: linear-gradient(180deg, #fffde0, #ffffff 100%);
        border-radius: 40rpx;
        .item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1rpx dashed #ffe7aa;
          height: 76rpx;
          &:last-child {
            border-bottom: none;
          }
          .avatar {
            width: 48rpx;
            height: 48rpx;
            border-radius: 50%;
            background: #e6e6e6;
          }
          .name {
            font-size: 24rpx;
            color: #333333;
            width: 180rpx;
          }
          .status {
            font-size: 24rpx;
            color: #333333;
            width: 150rpx;
          }
          .tag {
            width: 144rpx;
            height: 44rpx;
            background: #ffe9c1;
            border-radius: 28rpx;
            font-size: 22rpx;
            color: #ffa300;
            position: relative;
            &.hidden {
              opacity: 0;
            }
          }
          &.active {
            .status {
              color: #ffa300;
            }
            .tag {
              background: #ffa300;
              color: #ffffff;
            }
          }
        }
      }
      .mask {
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
      .empty {
        font-size: 28rpx;
        color: #939393;
        text-align: center;
      }
    }
  }
}
</style>
