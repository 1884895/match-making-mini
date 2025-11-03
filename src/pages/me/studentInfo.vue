<template>
  <view class="student-info">
    <view class="student-info__title">
      <view>学生姓名</view>
      <view v-if="allowAddStudent" class="add" @click="addStudent">
        添加学生
      </view>
    </view>
    <view class="student-info__list">
      <u-radio-group v-model="student" :border-bottom="true" :gap="0" placement="column" icon-placement="right" @change="studentChange">
        <template v-if="userInfo.roleType === 1">
          <u-radio :label="studentInfo.studentName" :name="studentInfo.studentId" inactive-color="#CCCCCC" active-color="#FF4D2B" label-color="#333333" label-size="30rpx" :custom-style="{ padding: '28rpx 0', margin: '0', border: 'none' }" />
        </template>
        <template v-if="userInfo.roleType === 2">
          <u-radio v-for="(item, index) in studentList" :key="index" :label="item.studentName" :name="item.studentId" inactive-color="#CCCCCC" active-color="#FF4D2B" label-color="#333333" label-size="30rpx" :custom-style="{ padding: '28rpx 0', margin: '0', border: index === studentList.length - 1 ? 'none' : '' }" />
        </template>
      </u-radio-group>
    </view>
    <view class="student-info__title">
      基本信息
    </view>
    <u-cell-group :border="false" :custom-style="{ fontSize: '30rpx', color: '#333333', marginBottom: '20rpx' }">
      <view class="student-info__list cell">
        <u-cell size="large" title="学习阶段" :value="profile.grade || '-'" is-link @click="profileClick" />
        <u-cell size="large" title="版本教材" :value="`${profile.books && profile.books.length ? '已' : '未'}设置`" is-link @click="profileClick($event, true)" />
        <u-cell size="large" title="所属地区" :value="regionStr || '-'" :border="false" is-link @click="regionClick" />
      </view>
    </u-cell-group>
    <u-cell-group :border="false" :custom-style="{ fontSize: '30rpx', color: '#333333' }">
      <view class="student-info__list cell">
        <u-cell size="large" title="学校" :value="studentInfo.schoolName || '-'" />
        <u-cell v-if="studentInfo.xuehao" size="large" title="学号" :value="studentInfo.xuehao[0] || '-'" />
        <u-cell v-if="studentInfo.kaohao" size="large" title="准考证号" :value="studentInfo.kaohao[0] || '-'" :border="false" />
      </view>
    </u-cell-group>
    <u-button text="去换绑" :throttle-time="500" :hairline="false" color="#FF4D2B" :custom-style="{ border: 'none', borderRadius: '63.54rpx', height: '80rpx' }" @click="changeBindStudent" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      options: {},
      userInfo: {},
      studentList: [],
      customProfile: {},
      student: '',
      profile: {},
      regionStr: '',
    }
  },
  computed: {
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
    allowAddStudent() {
      return this.userInfo.roleType === 2 && this.studentList.length < 2
    },
  },
  async onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || {}
    this.userInfo.roleType === 2 && await this.getStudentList()
    this.student = this.studentInfo.studentId
    this.getCustomProfile()
    this.getPersonalSetting()
  },
  methods: {
    // 获取已绑定的所有学生
    async getStudentList() {
      const res = await uni.$http.get('/v1/be-proxy/v2/user-center/related-students')
      this.studentList = res.data.filter(v => v.isVirtual === 2)
    },
    // 获取个性化设置
    async getCustomProfile() {
      const res = await uni.$http.get('/v1/be-proxy/v2/user-center/custom-profile', {}, { custom: { error: false } })
      this.customProfile = res.data
    },
    // 获取个人设置（区域年级教材）
    async getPersonalSetting() {
      const res = await uni.$http.get('/v1/be-proxy/tiku_api_proxy/v1/books/profile', {}, { custom: { error: false } })
      const { book_profile: profile = {}, region = {} } = res.data
      const { province = '', city = '' } = region
      this.profile = profile
      this.regionStr = `${province}${city}`
    },
    regionChange(data) {
      this.regionStr = data.regionStr
    },
    profileChange(data) {
      this.profile = data.profile
    },
    // 学生切换
    async studentChange(e) {
      if (e === this.studentInfo.studentId) {
        return
      }
      await uni.$http.post('/v1/be-proxy/v2/user-center/sessions', { studentId: e })
      return uni.showToast({
        title: '切换成功',
        duration: 2000,
        success: () => {
          uni.reLaunch({
            url: '/pages/index/index',
          })
        },
      })
    },
    changeBindStudent() {
      return uni.navigateTo({
        url: `/pages/me/bindStudent?id=${this.studentInfo.studentId}&name=${this.studentInfo.studentName}`,
      })
    },
    addStudent() {
      return uni.navigateTo({
        url: '/pages/me/bindStudent',
      })
    },
    profileClick(e, subject) {
      return uni.navigateTo({
        url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}/pages/edit/editInfo${subject ? '?subject=true' : ''}`)}`,
        events: {
          profileChange: this.profileChange,
          regionChange: this.regionChange,
        },
      })
    },
    regionClick() {
      return uni.navigateTo({
        url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}/pages/edit/editArea`)}`,
        events: {
          regionChange: this.regionChange,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.student-info {
  min-height: 100vh;
  background: #ffffff;
  padding: 30rpx;
  &__title {
    font-size: 32rpx;
    font-weight: 500;
    color: #282423;
    margin-bottom: 24rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .add {
      color: #ff4d2b;
    }
  }
  &__list {
    background: #ffffff;
    border-radius: 10.42rpx;
    padding: 0 40rpx;
    box-shadow: 0rpx 0rpx 18.75rpx 2.08rpx #f0f1f4;
    margin-bottom: 38rpx;
    &.cell {
      margin-bottom: 25rpx;
      ::v-deep .u-cell__body {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
    }
  }
}
</style>
