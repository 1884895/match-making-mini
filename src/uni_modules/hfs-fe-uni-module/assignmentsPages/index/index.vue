<template>
  <view class="assignments-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-bar-status-bar" />
      <view class="nav-bar__content">
        <view class="nav-bar__left" @click="goBack">
          <image class="nav-icon" src="../static/icon_back.png" mode="scaleToFill" />
        </view>
        <view class="nav-bar__center">
          <text class="nav-title">考后作业</text>
        </view>
        <view class="nav-bar__right" />
      </view>
    </view>

    <view class="assignments-index">
      <view v-if="Object.keys(assignmentsList).length === 0" class="empty-state">
        <u-empty mode="data" text="暂无作业" />
      </view>
      <view v-else class="assignments-list">
        <view v-for="(item, key) in assignmentsList" :key="key" class="date-group">
          <view class="date-header">
            <view class="date-text">{{ key }}</view>
          </view>
          <view class="assignment-cards">
            <AssignmentCard
              v-for="assignment in item"
              :key="assignment.paperId"
              :assignment="assignment"
              @action="handleAssignmentAction"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import AssignmentCard from '../components/assignmentCard.vue'
import { fetchAssignmentsList, loginUser } from '../utils/api'
import { formatAssignmentDate } from '../utils/format'
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

let userId: string | null = null
let accountid: string | null = null
let query: any

const assignmentsList = ref<any>({})

onBeforeMount(() => {
  window.location.href = 'https://mspxlj.haofenshu.com/#/postExamPracticePages/index-mobile'
})

onLoad(async (options: AnyObject | undefined) => {
  query = options
  if (!options) {
    return
  }

  accountid = options.accountid
  userId = options.userId
  if (userId != null || accountid != null) {
    await loginUser(userId, accountid)
    await fetchData()
  }
})

onShow(async () => {
  await fetchData()
})

onPullDownRefresh(async () => {
  try {
    await fetchData()
  }
  catch {
    uni.stopPullDownRefresh()
  }
  finally {
    uni.stopPullDownRefresh()
  }
})

async function fetchData() {
  const list = await fetchAssignmentsList()
  assignmentsList.value = formatAssignmentDate(list)
}

function goBack() {
  if (getCurrentPages().length > 1) {
    return uni.navigateBack()
  }
  // #ifdef H5
  nativeBridge.callHandler('goBack', 'goBack')
  // #endif
  // #ifdef MP-WEIXIN
  return uni.navigateBack()
  // #endif
}

function handleAssignmentAction(assignment: any) {
  const commonQuery = Object.entries(query).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&')
  const { status, committed, allowOverdueSubmission } = assignment

  switch (status) {
    case 0:
      return
    case 1:
      switch (committed) {
        case 0:
        case 1: {
          const url = `/uni_modules/hfs-fe-uni-module/assignmentsPages/practice/questions?${commonQuery}&paperId=${assignment.paperId}&title=${assignment.name}`
          return uni.navigateTo({ url })
        }
        case 2: {
          const url = `/uni_modules/hfs-fe-uni-module/assignmentsPages/report/index?${commonQuery}&paperId=${assignment.paperId}&subject=${assignment.subject}`
          return uni.navigateTo({ url })
        }
        default:
          return ''
      }
    case 2:
      switch (committed) {
        case 0:
        case 1: {
          if (allowOverdueSubmission) {
            const url = `/uni_modules/hfs-fe-uni-module/assignmentsPages/practice/questions?${commonQuery}&paperId=${assignment.paperId}&title=${assignment.name}`
            return uni.navigateTo({ url })
          }
          const url = `/uni_modules/hfs-fe-uni-module/assignmentsPages/report/index?${commonQuery}&paperId=${assignment.paperId}&subject=${assignment.subject}`
          return uni.navigateTo({ url })
        }
        case 2: {
          const url = `/uni_modules/hfs-fe-uni-module/assignmentsPages/report/index?${commonQuery}&paperId=${assignment.paperId}&subject=${assignment.subject}`
          return uni.navigateTo({ url })
        }
        default:
          return ''
      }
    default:
      return ''
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/common.scss';
@import '../styles/variables.scss';

.assignments-page {
  min-height: 100vh;
  background-color: $bg-secondary;
}

// 导航栏
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: $bg-primary;

  border-bottom: 2rpx solid $border-color;

  &-status-bar {
    width: 100%;
    background-color: $bg-primary;
    height: env(safe-area-inset-top);
  }

  &__content {
    @include flex-between;
    height: $navbar-height;
    padding: 0 $spacing-base;
  }

  &__left {
    flex-shrink: 0;
    width: 64rpx;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  &__center {
    flex: 1;
    text-align: center;
    margin: 0 $spacing-base;
    min-width: 0;
    overflow: hidden;
  }

  &__right {
    flex-shrink: 0;
    width: 64rpx;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .nav-icon {
    width: 36rpx;
    height: 36rpx;
  }

  .nav-title {
    @include text-ellipsis;
    font-size: $font-size-base;
    color: $text-primary;
    font-weight: 500;
  }
}

// 导航栏占位
.nav-placeholder {
  @include safe-area-top;
  height: $navbar-height;
}

.assignments-index {
  padding: $spacing-base;
  padding-bottom: calc(#{$spacing-base} + constant(safe-area-inset-bottom));
  padding-bottom: calc(#{$spacing-base} + env(safe-area-inset-bottom));
  padding-top: calc(
    #{$navbar-height} + constant(safe-area-inset-top) + #{$spacing-base}
  );
  padding-top: calc(
    #{$navbar-height} + env(safe-area-inset-top) + #{$spacing-base}
  );
}

// 空状态
.empty-state {
  padding-top: 200rpx;
}

// 作业列表
.assignments-list {
  .date-group {
    margin-bottom: $spacing-lg;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .date-header {
    margin-bottom: $spacing-base;
    padding-left: $spacing-sm;

    .date-text {
      font-size: $font-size-md;
      color: $text-secondary;
      font-weight: 500;
    }
  }

  .assignment-cards {
    display: flex;
    flex-direction: column;
    gap: $spacing-base;
  }
}
</style>
