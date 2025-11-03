<template>
  <view v-if="inviterInfo.invitations && inviterInfo.invitations.length" class="history">
    <view class="history-header">
      <image class="history-header__title" :src="`${resourceUrl}history_title.png`" mode="widthFix" />
      <view class="history-header__count">
        您已成功邀请{{ inviteSuccessCount }}人
      </view>
    </view>
    <view class="history-content">
      <view class="history-content__list">
        <view v-for="(item, index) in list" :key="index" class="item" :class="{ active: item.status === 1 }">
          <image v-if="statusMap[item.status].showAvatar" class="avatar" :src="`${resourceUrl}avatar.png`" />
          <view v-else class="avatar" />
          <view class="name one-txt-cut">
            {{ item[statusMap[item.status].name] }}<text v-if="!isHFSAppStudent">
              家长
            </text>
          </view>
          <view class="status">
            {{ statusMap[item.status].status }}
          </view>
          <view v-if="item.status === 1" class="tag flex-row-center" @click="openPopup('showInvite')">
            <text>{{ statusMap[item.status].tag }}</text>
          </view>
          <view v-else class="tag flex-row-center" :class="{ hidden: !statusMap[item.status].tag }">
            {{ statusMap[item.status].tag }}
          </view>
        </view>
      </view>
    </view>
    <view v-if="showMask" class="history-mask" @click="page++">
      <view class="text">
        查看更多
      </view>
      <u-icon name="arrow-down" color="#939393" size="16rpx" bold />
    </view>
  </view>
</template>

<script>
import { isHFSStudent, report } from '@/uni_modules/hfs-fe-uni-plugins'

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
  emits: ['showInvite'],
  data() {
    return {
      actionId: '667b7145925980bc5a2c6393',
      resourceUrl: 'https://fe-resource.haofenshu.com/new/',
      statusMap: {
        1: { status: '注册未绑定', tag: '提醒TA', showAvatar: false, name: 'phone' },
        2: { status: '绑定成功', tag: '邀请成功+1', showAvatar: true, name: 'name' },
        3: { status: '老用户', tag: '', showAvatar: true, name: 'name' },
        4: { status: '已注销', tag: '', showAvatar: true, name: 'name' },
        5: { status: '奖励已兑换', tag: '邀请成功+1', showAvatar: true, name: 'name' },
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
    inviteSuccessCount() {
      const { invitations = [] } = this.inviterInfo
      return invitations.filter(item => item.status === 5 || item.status === 2).length
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
      report(this.actionId, 'hdy2_txta_click')
    },
  },
}
</script>

<style lang="scss" scoped>
.history {
  position: relative;
  margin: 0 28rpx 24rpx;
  padding: 20rpx 28rpx 30rpx;
  background: #ffffff;
  border-radius: 32rpx;
  &-header {
    display: flex;
    margin-bottom: 24rpx;
    &__title {
      width: 162rpx;
      height: 66rpx;
    }
    &__count {
      font-size: 26rpx;
      color: #b4814d;
      margin: 22rpx 0 0 14rpx;
    }
  }
  &-content {
    background: linear-gradient(180deg, #ffecbc, #ffffff);
    border-radius: 40rpx;
    padding: 1px;
    &__list {
      padding: 14rpx 28rpx;
      background: linear-gradient(180deg, #fffadb, #ffffff 46%);
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
}
</style>
