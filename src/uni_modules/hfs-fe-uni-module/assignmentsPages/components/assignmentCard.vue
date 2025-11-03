<template>
  <view class="assignment-card" @click="$emit('action', assignment)">
    <image
      class="card-cover-img"
      :src="getSubjectCoverImage(assignment.subject)"
      mode="heightFix"
    />
    <view class="card-info">
      <view class="card-info__header">
        <view class="title">
          {{ assignment.name }}
        </view>
        <view class="question-num">
          <image
            class="question-num__icon"
            src="../static/icon_pen.png"
            mode="scaleToFill"
          />
          <view class="question-num__text">
            {{ assignment.qcount }}题
          </view>
        </view>
      </view>
      <view class="card-info__bottom">
        <view class="text" :class="getBottomTextClass(assignment)">
          {{ getBottomText(assignment) }}
        </view>
        <view class="button" :class="getBottomButtonClass(assignment)">
          {{ getBottomButtonText(assignment) }}
          <image
            v-if="isShowBottonButtonIcon(getBottomButtonText(assignment))"
            class="button-icon"
            src="../static/icon_arrow_right.png"
            mode="widthFix"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { getButtonText, getStatusText, getSubjectCoverImage } from '../utils/assignmentHelpers'

interface Assignment {
  paperId: string
  name: string
  subject: string
  qcount: number
  status: number
  committed: number
  allowOverdueSubmission?: boolean
  startTime: string
  endTime: string
  committedTime?: string
}

const { assignment } = defineProps<{
  assignment: Assignment
}>()

defineEmits<{
  action: [assignment: Assignment]
}>()

// 状态映射
const statusClassMap: any = {
  0: 'unstart',
  1: 'unstop',
  2: 'stopped',
}

const submitClassMap: any = {
  0: 'unsubmit',
  1: 'unsubmit',
  2: 'submitted',
}

function getBottomTextClass(item: Assignment) {
  const { status, committed, allowOverdueSubmission } = item
  const statusClass = statusClassMap[status]
  const submitClass = submitClassMap[committed]
  if (status === 2) {
    if (allowOverdueSubmission) {
      return `${statusClass} ${submitClass} continue`
    }
  }
  return `${statusClass} ${submitClass}`
}

function getBottomText(item: Assignment) {
  return getStatusText(item)
}

function getBottomButtonClass(item: Assignment) {
  const { status, committed, allowOverdueSubmission } = item
  const statusClass = statusClassMap[status]
  const submitClass = submitClassMap[committed]
  if (status === 2) {
    if (allowOverdueSubmission) {
      return `${statusClass} ${submitClass} continue`
    }
  }
  return `${statusClass} ${submitClass}`
}

function getBottomButtonText(item: Assignment) {
  return getButtonText(item)
}

function isShowBottonButtonIcon(text: string) {
  return ['查看试题', '查看报告'].includes(text)
}
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';

.assignment-card {
  width: 100%;
  height: 200rpx;
  background-color: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  display: flex;
  overflow: hidden;
  transition: all $duration-fast;

  &:active {
    transform: scale(0.98);
    box-shadow: none;
  }

  .card-cover-img {
    flex-shrink: 0;
    width: 260rpx;
    height: 200rpx;
    object-fit: cover;
  }

  .card-info {
    flex: 1;
    min-width: 0;
    padding: $spacing-sm $spacing-md;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &__header {
      .title {
        @include text-ellipsis;
        font-size: $font-size-md;
        color: $text-primary;
        font-weight: 500;
        line-height: 1.4;
        margin-bottom: $spacing-xs;
      }

      .question-num {
        display: flex;
        align-items: center;
        gap: $spacing-xs;

        &__icon {
          width: 24rpx;
          height: 24rpx;
        }

        &__text {
          font-size: $font-size-xs;
          color: $text-secondary;
        }
      }
    }

    &__bottom {
      @include flex-between;
      align-items: center;

      .text {
        font-size: 22rpx;
        line-height: 1;
        margin-right: $spacing-sm;
        flex-shrink: 0;
        white-space: nowrap;

        &.unstart {
          color: $text-secondary;
        }

        &.unstop {
          &.unsubmit {
            color: $success-color;
          }

          &.submitted {
            color: $text-secondary;
          }
        }

        &.stopped {
          &.submitted {
            color: $text-secondary;
          }

          &.unsubmit {
            color: $danger-color;
          }
        }
      }

      .button {
        @include flex-center;
        font-size: $font-size-sm;
        transition: all $duration-fast;

        &-icon {
          width: 24rpx;
          margin-left: $spacing-xs;
        }

        &.unstart {
          padding: 10rpx 24rpx;
          background-color: $bg-secondary;
          border-radius: $radius-round;
          font-weight: 500;
          color: $text-secondary;
        }

        &.unstop {
          &.unsubmit {
            padding: 10rpx 24rpx;
            background-color: rgba($primary-color, 0.1);
            border: 2rpx solid $primary-color;
            border-radius: $radius-round;
            color: $primary-color;

            &.continue {
              background-color: $primary-color;
              color: $text-white;
              border-color: $primary-color;
            }
          }

          &.submitted {
            color: $text-primary;
          }
        }

        &.stopped {
          &.submitted {
            color: $text-primary;
          }

          &.unsubmit {
            color: $text-primary;

            &.continue {
              padding: 10rpx 24rpx;
              background-color: $danger-color;
              border-radius: $radius-round;
              color: $text-white;
            }
          }
        }
      }
    }
  }
}
</style>
