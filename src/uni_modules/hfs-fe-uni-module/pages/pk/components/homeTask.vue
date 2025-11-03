<template>
  <view class="task">
    <view class="task-title">
      <image class="task-title__icon" :src="`${resourceUrl}home_icon_task.png`" />
    </view>
    <view class="task-desc">
      每日基础挑战次数{{ pkInfo.playLimit }}次，完成任务可获得奖励次数！当日奖励次数有剩余可顺延～
    </view>
    <view class="task-count">
      <image class="task-count__icon" :src="`${resourceUrl}home_fight_2.png`" />
      <view class="task-count__num">
        今日剩余挑战次数：{{ chance }}
      </view>
    </view>
    <view v-for="(item, index) in tasks" :key="index" class="task-list">
      <view class="task-list__item">
        <image class="icon" :src="resourceUrl + item.icon" />
        <view class="info">
          <view class="info-name">
            {{ item.name }}
          </view>
          <view class="info-sub">
            {{ item.subName }}
          </view>
        </view>
        <view class="action" :class="{ done: item.status === 1 }" @click="taskOperate(item)">
          {{ item.status === 1
            ? item.doneStr : item.toDoStr }}
        </view>
      </view>
    </view>
    <view class="task-record" @click="showRecordList">
      <view class="task-record__title">
        查看任务记录
      </view>
      <image class="task-record__icon" :src="`${resourceUrl}home_record_more.png`" />
    </view>
  </view>
</template>

<script>
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  props: {
    pkInfo: {
      type: Object,
      default: () => ({}),
    },
    taskList: {
      type: Array,
      default: () => [],
    },
    chance: {
      type: Number,
      default: 0,
    },
  },
  emits: ['showRecordList', 'taskOperate'],
  data() {
    return {
      resourceUrl: `${feConfig.resourceUrl}/pk/images/`,
    }
  },
  computed: {
    tasks() {
      const taskMap = {
        1: {
          key: 'sy_qbd',
          icon: 'home_icon_bind.png',
          subName: '绑定成功+1次',
          doneStr: '已完成',
          toDoStr: '去绑定',
        },
        2: {
          key: 'sy_qfx',
          icon: 'home_icon_share.png',
          subName: '每日分享+1次',
          doneStr: '已完成',
          toDoStr: '去分享',
        },
        3: {
          key: 'sy_qyq',
          icon: 'home_icon_invite.png',
          subName: '每邀约1名好友绑定成功+1次',
          doneStr: '已完成',
          toDoStr: '去邀请',
        },
      }
      return this.taskList.map(task => ({ ...task, ...taskMap[task.id] }))
    },
  },
  methods: {
    showRecordList() {
      report('pk', 'sy_ckrwjl')
      this.$emit('showRecordList')
    },
    taskOperate(item) {
      if (item.status === 1)
        return
      this.$emit('taskOperate', item)
    },
  },
}
</script>

<style lang="scss" scoped>
.task {
  width: 100%;
  height: 678rpx;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  border-radius: 32rpx;

  &-title {
    display: flex;
    justify-content: center;

    &__icon {
      margin: 28rpx 0 16rpx 0;
      width: 412rpx;
      height: 38rpx;
    }
  }

  &-desc {
    margin: 0 26rpx 0 28rpx;
    font-size: 26rpx;
    color: #939393;
  }

  &-count {
    width: 638rpx;
    margin: 16rpx 28rpx 0 28rpx;
    background: #fff9ed;
    border-radius: 20rpx;
    align-items: center;
    display: flex;

    &__icon {
      width: 28rpx;
      margin: 24rpx 12rpx 24rpx 24rpx;
      height: 28rpx;
    }

    &__num {
      height: 42rpx;
      margin: 16rpx 0 18rpx 0;
      font-size: 30rpx;
      color: #ffaa00;
    }
  }

  &-list {
    width: 694rpx;

    &__item {
      height: 112rpx;
      display: flex;
      align-items: center;

      .icon {
        width: 60rpx;
        margin: 26rpx 8rpx 26rpx 28rpx;
        height: 60rpx;
      }

      .info {
        flex: 1;
        margin: 18rpx 5rpx 18rpx 16rpx;

        &-name {
          font-size: 28rpx;
          color: #333333;
        }

        &-sub {
          font-size: 24rpx;
          color: #939393;
        }
      }

      .action {
        width: 140rpx;
        height: 52rpx;
        margin: 30rpx 28rpx 20rpx 5rpx;
        background: linear-gradient(225deg, #ffbc2c 0%, #ffa112);
        border-radius: 26rpx;
        text-align: center;
        align-items: center;
        display: flex;
        justify-content: center;
        font-size: 26rpx;
        font-weight: 500;
        color: #ffffff;

        &.done {
          background: #d8d8d8;
        }
      }
    }
  }

  &-record {
    display: flex;
    justify-content: center;
    align-items: center;

    &__title {
      padding: 24rpx 0rpx 24rpx 0;
      font-size: 26rpx;
      color: #ffb522;
    }

    &__icon {
      margin-left: 5rpx;
      width: 17rpx;
      height: 17rpx;
    }
  }
}
</style>
