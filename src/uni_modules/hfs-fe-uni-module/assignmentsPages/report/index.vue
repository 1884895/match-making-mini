<template>
  <view class="assignment-report">
    <view class="assignment-report__nav">
      <view class="nav-status-bar" />
      <view class="nav-content">
        <view class="nav-content__left" @click="goBack()">
          <view class="nav-left__icon">
            <image
              class="nav-left__icon__img"
              src="../static/icon_back.png"
              mode="scaleToFill"
            />
          </view>
        </view>
        <view class="tabs-container">
          <u-tabs :list="tabList" line-color="#FFA800" :active-style="{ color: '#FFA800', fontSize: '28rpx', fontWeight: '500' }" :inactive-style="{ color: '#939393', fontSize: '28rpx' }" line-width="33.33" line-height="6rpx" :item-style="{ height: '88rpx' }" :current="tabsCurrent" :scrollable="false" @click="tabsClick" />
        </view>
      </view>
    </view>
    <assignment-origin-question v-if="currentTabName === '作业原题'" :assignment-info="assignmentInfo" />
    <assignment-report v-if="currentTabName === '作业报告'" :assignment-info="assignmentInfo" :reprot-detail="reprotDetail" :scroll-top="scrollTop" />
  </view>
</template>

<script lang="ts" setup>
import assignmentOriginQuestion from '../components/assignmentOriginQuestion.vue'
import assignmentReport from '../components/assignmentReport.vue'

let userId: string | null = null
let accountid: string | null = null
let paperId: string | null = null
let subject: string | null = null

const assignmentInfo: any = ref({})
const reprotDetail = ref({})
const scrollTop = ref(0)
const tabList = computed(() => {
  const { status, allowOverdueSubmission, committed, report } = assignmentInfo.value

  if (status === 2) {
    if (!allowOverdueSubmission && committed !== 2)
      return [{ name: '作业原题', disabled: false }]

    return [
      { name: '作业报告', disabled: report !== 1 },
      { name: '作业原题', disabled: false },
    ]
  }

  return [
    { name: '作业报告', disabled: true },
    { name: '作业原题', disabled: false },
  ]
})
const tabsCurrent = ref(0)
const currentTabName = ref('作业原题')

onLoad(async (options: any) => {
  accountid = options.accountid
  userId = options.userId
  paperId = options.paperId
  subject = options.subject
  if ((userId != null || accountid != null) && paperId != null) {
    await login(userId, accountid)
    await fetchData()
  }
})
onPageScroll((e: any) => {
  uni.$u.debounce(() => { scrollTop.value = e.scrollTop }, 200)
  scrollTop.value = e.scrollTop
})
function goBack() {
  if (getCurrentPages().length > 1) {
    return uni.navigateBack()
  }
  // #ifdef H5
  // nativeBridge.callHandler('goBack', 'goBack')
  history.go(-1)
  // #endif
  // #ifdef MP-WEIXIN
  return uni.navigateBack()
  // #endif
}
async function login(userId: string | null, accountid: string | null) {
  let params
  if (userId != null) {
    params = {
      userId,
    }
  }
  if (!params && accountid != null) {
    params = {
      accountid,
    }
  }
  if (!params)
    return
  const { data: { token: hfsToken } } = await uni.$http.post('/v2/users/sessions/seewo', params) as any
  hfsToken && uni.setStorageSync('hfsToken', hfsToken)
}

async function fetchData() {
  const params = {
    paperId,
  }
  const { data } = await uni.$http.get('/v2/online-exams/zuoye-detail', params)
  assignmentInfo.value = data
  assignmentInfo.value.report = assignmentInfo.value.report || 0
  assignmentInfo.value.correct = assignmentInfo.value.correct || 0

  const { status, allowOverdueSubmission, committed, report } = assignmentInfo.value

  if (report === 1)
    getZuoyeReport()

  if (status === 2) {
    if (!allowOverdueSubmission && committed !== 2) {
      setTabValues(0, '作业原题')
      return
    }
    setTabValues(report === 1 ? 0 : 1, report === 1 ? '作业报告' : '作业原题')
    return
  }
  setTabValues(1, '作业原题')
}

function setTabValues(tabIndex: number, tabName: string) {
  tabsCurrent.value = tabIndex
  currentTabName.value = tabName
}

function tabsClick(item: any) {
  if (item.name === '作业报告') {
    if (assignmentInfo.value.report !== 1) {
      return uni.showToast({ title: '作业报告尚未生成', icon: 'none' })
    }
  }
  currentTabName.value = item.name
}

async function getZuoyeReport() {
  const params = { paperId, subject }
  const res = await uni.$http.get('/v2/online-exams/zuoye-report', params)
  reprotDetail.value = res.data || {}
}
</script>

<style lang="scss" scoped>
@import '../styles/common.scss';
@import '../styles/variables.scss';

.assignment-report {
  height: 100vh;
  background-color: $bg-secondary;

  padding-top: $navbar-height;
  padding-top: calc(env(safe-area-inset-top) + $navbar-height);

  &__nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background-color: $bg-primary;
    border-bottom: 2rpx solid $border-color;

    .nav-status-bar {
      width: 100%;
      background-color: $bg-primary;
      height: env(safe-area-inset-top);
    }

    .nav-content {
      @include flex-center;
      height: $navbar-height;

      &__left {
        width: 64rpx;
        padding: 0 $spacing-base;
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .nav-left__icon {
          &__img {
            width: 36rpx;
            height: 36rpx;
          }
        }
      }

      .tabs-container {
        flex: 1;
        margin: 0 88rpx 0 88rpx; // 左侧留出返回按钮空间
        min-width: 0;
        overflow: hidden;
      }
    }
  }
}
</style>
