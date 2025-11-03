<template>
  <view class="list">
    <Tabs :list="subjects" :current="current" key-name="subject_name" @change="subjectClick" />
    <view v-if="subjectVersion" class="course-version" @click="versionClick">
      当前版本：{{ subjectVersion }}<u-icon name="edit-pen-fill" color="#333" size="34rpx" :custom-style="{ marginLeft: '10rpx' }" />
    </view>
    <u-gap height="15rpx" bg-color="#f6f6f6" />
    <view class="course-list">
      <view v-for="(item, index) in courseList" :key="index" class="course-list__item" @click="toDetail(item)">
        <image class="pic" :src="item.pack_imgurl" />
        <view class="info">
          <view class="title txt-cut">
            {{ item.pack_name }}
          </view>
          <view class="lecturer one-txt-cut">
            讲师：{{ item.teachers.map(v => v.teacher_name).join('、') }}
          </view>
          <view class="desc">
            <view>
              共<text class="active">
                {{ item.section_num }}
              </text>节课
            </view>
            <view class="study">
              {{ item.visit_count }}人已学习
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import tabs from '../../components/tabs.vue'

export default {
  components: { Tabs: tabs },
  data() {
    return {
      subjects: [],
      profile: [],
      searchData: {
        grade: '',
        subject: '',
        type: '',
        version: -1,
        target: 1,
      },
      current: 0,
      pagesize: 10,
      pageindex: 1,
      courseList: [],
    }
  },
  computed: {
    subjectName() {
      const subject = this.subjects[this.current] || {}
      return subject.subject_name || ''
    },
    subjectVersion() {
      const { books = [] } = this.profile
      const book = books.find(v => v.subject === this.subjectName) || {}
      return book.press_version || ''
    },
  },
  async onLoad() {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('courseSend', (data) => {
      const { type, type_name, subjects, grade, profile } = data
      uni.setNavigationBarTitle({ title: type_name })
      this.subjects = subjects
      this.profile = profile
      this.searchData = Object.assign({}, this.searchData, { type, grade, subject: subjects[0].subject })
      this.resetDta()
    })
  },
  methods: {
    async getCourseList() {
      const { pagesize, pageindex } = this
      const res = await uni.$http.get('/v1/be-proxy/api/v3/micro-course/search', { ...this.searchData, pagesize, pageindex })
      this.courseList = this.courseList.concat(res.data || [])
    },
    async getVersion() {
      const res = await uni.$http.get('/v1/be-proxy/tiku_api_proxy/v1/tiku-kecheng-version', { grade: this.profile.grade, subject: this.subjectName, version: this.subjectVersion })
      const { version = -1 } = res.data
      this.searchData.version = `${version},30`
    },
    profileChange(data) {
      const { grade, books } = data.profile
      const { grade: profileGrade, books: profileBooks } = this.profile
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.emit('profileChange', data)
      if (grade !== profileGrade) {
        return uni.navigateBack()
      }
      if (JSON.stringify(books) !== JSON.stringify(profileBooks)) {
        this.profile = data.profile
        this.resetDta()
      }
    },
    subjectClick(item) {
      if (this.current !== item.index) {
        this.current = item.index
        this.searchData.subject = item.subject
        this.resetDta()
      }
    },
    versionClick() {
      return uni.navigateTo({
        url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}/pages/edit/editInfo?subject=${this.subjectName}`)}`,
        events: {
          profileChange: this.profileChange,
        },
      })
    },
    toDetail(item) {
      uni.navigateTo({
        url: `/tabPages/course/detail?pack_id=${item._id}`,
      })
    },
    async resetDta() {
      this.pageindex = 1
      this.courseList = []
      await this.getVersion()
      await this.getCourseList()
    },
  },
  onReachBottom() {
    if (this.courseList.length < this.pagesize * this.pageindex) {
      uni.showToast({
        title: '没有更多了',
        icon: 'none',
      })
    }
    else {
      this.pageindex++
      this.getCourseList()
    }
  },
}
</script>

<style lang="scss" scoped>
.list {
  min-height: 100vh;
  background: #fff;
  .course-version {
    padding: 20rpx 30rpx;
    font-size: 28rpx;
    color: #333333;
    display: flex;
    align-items: center;
  }
  .course-list {
    padding: 0 30rpx;
    &__item {
      display: flex;
      align-items: center;
      padding: 30rpx 0;
      border-bottom: 1px solid #e6e6e6;
      .pic {
        width: 287.5rpx;
        height: 175rpx;
        border-radius: 12.5rpx;
        margin-right: 22rpx;
        flex-shrink: 0;
      }
      .info {
        flex: 1;
      }
      .title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333333;
        margin-bottom: 10rpx;
      }
      .lecturer {
        width: 367rpx;
        font-size: 22rpx;
        color: #939393;
        margin-bottom: 24rpx;
      }
      .desc {
        display: flex;
        align-items: center;
        font-size: 22rpx;
        color: #939393;
        .study {
          margin-left: 27rpx;
        }
        .active {
          color: #ff4d2b;
        }
      }
    }
  }
}
</style>
