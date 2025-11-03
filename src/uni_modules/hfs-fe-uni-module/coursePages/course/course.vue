<template>
  <view class="course">
    <u-navbar :height="navbarHeight" placeholder>
      <template #left>
        <view class="navbar-left" @click="gradeClick">
          <view class="navbar-left__grade">
            {{ profile.grade || '选择年级' }}<u-icon name="arrow-down-fill" color="#333333" size="18rpx" :custom-style="{ marginLeft: '10rpx' }" />
          </view>
          <view class="navbar-left__text">
            版本教材
          </view>
        </view>
      </template>
    </u-navbar>
    <view class="course-content">
      <!-- #ifdef MP-WEIXIN -->
      <AdSwiper v-if="adsList.length > 0" height="234rpx" :list="adsList" key-name="picUrl" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <u-swiper v-if="adsList.length > 0" :list="adsList" height="234rpx" key-name="picUrl" indicator indicator-mode="dot" @click="clickSwiper" />
      <!-- #endif -->
      <view class="course-content__type">
        <u-grid :border="false" :col="Math.max(4, types.length)">
          <u-grid-item v-for="(item, index) in types" :key="index" @click="clickType(item)">
            <view class="type-item">
              <image class="icon" :src="typesIcon[item.type] || typesIcon[0]" />
              <text class="text">
                {{ item.type_name }}
              </text>
            </view>
          </u-grid-item>
        </u-grid>
      </view>
      <view class="course-content__list">
        <view class="list-title">
          正在看
        </view>
        <view v-if="Object.keys(courseList).length" class="course-list">
          <view v-for="(item, index) in courseList" :key="index" class="course-list__item" @click="toDetail(item, index)">
            <image class="pic" :src="item.pack_imgurl" />
            <view class="info">
              <view class="title txt-cut">
                {{ item.pack_name }}
              </view>
              <view class="lecturer one-txt-cut">
                讲师：{{ item.teachers }}
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
        <view v-else class="course-empty">
          <image class="course-empty__img" :src="`${resourceUrl}study_img_empty.png`" />
          <view class="course-empty__text">
            暂无观看记录~
          </view>
          <view class="course-empty__btn" @click="toStudy">
            去学习
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// #ifdef MP-WEIXIN
import adSwiper from '../../../../components/adSwiper.vue'
// #endif
import { isHFSParent, isHarmony, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  // #ifdef MP-WEIXIN
  components: { AdSwiper: adSwiper },
  // #endif
  data() {
    return {
      resourceUrl: `${feConfig.resourceUrl}/images/`,
      userInfo: {},
      adsList: [], // 广告列表
      profile: {},
      courseOption: [],
      courseList: {},
      typesIcon: {
        0: require('../static/course/tongbu.png'),
        1: require('../static/course/tongbu.png'),
        28: require('../static/course/fuxi.png'),
        5: require('../static/course/tongbu.png'),
        6: require('../static/course/zhuanti.png'),
        29: require('../static/course/zhuanqu.png'),
        31: require('../static/course/yuxi.png'),
        32: require('../static/course/zhuanqu.png'),
      },
    }
  },
  computed: {
    isLogin() {
      return !!this.userInfo.userId
    },
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
    grades() {
      const { grade, period } = this.profile
      return this.courseOption.find(v => v.grade_name === grade || v.grade_name === period) || {}
    },
    types() {
      const { types = [] } = this.grades
      return types
    },
    navbarHeight() {
      let height = 44
      // #ifdef H5
      isHarmony() && (height = 82)
      // #endif
      return height
    },
    prefix() {
      let prefix = '/v1/be-proxy'
      // #ifdef H5
      prefix = feConfig.api.hfs || ''
      // #endif
      return prefix
    },
    projectId() {
      let projectId = feConfig.bannerProjectId
      // #ifdef H5
      projectId = isHFSParent() ? feConfig.parentProId : feConfig.studentProId
      // #endif
      return projectId
    },
    slotId() {
      let slotId = feConfig.courseBannerSlotId
      // #ifdef H5
      slotId = isHFSParent() ? feConfig.parentCourseSlotId : feConfig.studentCourseSlotId
      // #endif
      return slotId
    },
  },
  async onLoad() {
    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    this.getAdvert()
    await this.getPersonalSetting()
    await this.getCourseOption()
  },
  onShow() {
    this.courseList = uni.getStorageSync(`courseCache_${this.userInfo.userId}`) || {}
  },
  methods: {
    // 获取智能营销广告
    getAdvert() {
      const { grade, schoolId: schoolid } = this.studentInfo
      const { userId: userid, userTag } = this.userInfo
      const url = `${feConfig.api.znyx}/api/ads/user/plan/list-v2`
      const params = {
        grade,
        project_id: this.projectId,
        schoolid,
        slot_id: this.slotId,
        user_tag: userTag,
        userid,
      }
      uni.$http.get(url, params).then((res) => {
        this.adsList = res.data
      })
    },
    // 获取个人设置（区域年级教材）
    async getPersonalSetting() {
      try {
        const res = await uni.$http.get(`${this.prefix}/tiku_api_proxy/v1/books/profile`, {}, { custom: { error: false } })
        const { book_profile: profile = {} } = res.data
        this.profile = profile
      }
      catch (err) {
        this.profile = { grade: '初一', period: '初中' }
        return uni.$u.toast(err.msg || '获取个人设置失败')
      }
    },
    // 获取课程配置
    async getCourseOption() {
      const res = await uni.$http.get(`${this.prefix}/api/v4/micro-course/pack/options`)
      this.courseOption = res.data
    },
    profileChange(data) {
      this.profile = data.profile
    },
    gradeClick() {
      let url = '/pages/edit/editInfo?back=true'
      // #ifdef MP-WEIXIN
      if (!this.isLogin)
        return uni.redirectTo({ url: feConfig.login })
      url = `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.mobileUrl}${url}`)}`
      // #endif
      return uni.navigateTo({
        url,
        events: {
          profileChange: this.profileChange,
        },
      })
    },
    clickSwiper(index) {
      // #ifdef H5
      nativeBridge.callHandler('adJump', JSON.stringify(this.adsList[index]))
      // #endif
    },
    clickType(item) {
      return uni.navigateTo({
        url: '/uni_modules/hfs-fe-uni-module/coursePages/list/list',
        events: {
          profileChange: this.profileChange,
        },
        success: (res) => {
          res.eventChannel.emit('courseSend', { ...item, grade: this.grades.grade, profile: this.profile })
        },
      })
    },
    toDetail(item, index) {
      uni.navigateTo({
        url: `/uni_modules/hfs-fe-uni-module/coursePages/detail/detail?pack_id=${item._id}&subject=${index}`,
      })
    },
    toStudy() {
      if (!this.isLogin)
        return uni.redirectTo({ url: feConfig.login })
      return this.clickType(this.types[0])
    },
  },
}
</script>

<style lang="scss" scoped>
.course {
  min-height: 100vh;
  padding-bottom: 40rpx;
  .navbar-left {
    &__grade {
      display: flex;
      align-items: center;
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 4rpx;
    }
    &__text {
      font-size: 20rpx;
      color: #939393;
    }
  }
  &-content {
    padding: 24rpx 30rpx 0;
    &__type {
      margin: 45rpx 0 40rpx;
      .type-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .icon {
          width: 56rpx;
          height: 56rpx;
          margin-bottom: 25rpx;
        }
        .text {
          font-size: 26rpx;
          color: #333333;
        }
      }
    }
    &__list {
      .list-title {
        position: relative;
        font-size: 28rpx;
        font-weight: 500;
        color: #333333;
        padding: 0 0 17rpx 20rpx;
        border-bottom: 1rpx solid #e6e6e6;
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: calc(50% - 9rpx);
          transform: translateY(-50%);
          width: 7rpx;
          height: 26rpx;
          background: #ff4d2b;
        }
      }
      .course-list {
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
      .course-empty {
        height: 592rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        &__img {
          width: 210rpx;
          height: 186rpx;
          margin-bottom: 15rpx;
        }
        &__text {
          font-size: 28rpx;
          color: #939393;
          margin-bottom: 15rpx;
        }
        &__btn {
          width: 272rpx;
          height: 73rpx;
          font-size: 34rpx;
          font-weight: 500;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(223deg, #ff7257 2%, #ff4d2b 98%);
          border-radius: 59rpx;
          box-shadow: 0rpx 4rpx 14rpx 0rpx rgba(255, 79, 46, 0.25);
        }
      }
    }
  }
}
</style>
