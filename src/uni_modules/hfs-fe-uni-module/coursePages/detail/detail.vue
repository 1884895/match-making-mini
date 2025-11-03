<template>
  <view class="detail">
    <u-sticky :custom-nav-height="0">
      <view class="detail-video">
        <video v-if="play.url" class="detail-video__item" :src="play.url" :initial-time="initialTime" :title="play.name" :enable-play-gesture="true" :show-casting-button="true" :show-mute-btn="true" :show-screen-lock-button="true" :show-snapshot-button="true" :vslide-gesture-in-fullscreen="true" autoplay controls @timeupdate="timeUpdate" />
        <image v-else class="detail-video__item" :src="courseDetail.pack_imgurl" />
      </view>
    </u-sticky>
    <view v-if="courseDetail.pack_name" class="detail-info">
      <view class="detail-info__title">
        {{ courseDetail.pack_name }}
      </view>
      <view class="detail-info__teacher">
        讲师：{{ (courseDetail.teachers || []).map(v => v.teacher_name).join('、') }}
      </view>
      <view class="detail-info__desc">
        <view>
          共<text class="active">
            {{ courseDetail.section_num }}
          </text>节课
        </view>
        <view class="study">
          {{ courseDetail.visit_count }}人已学习
        </view>
      </view>
    </view>
    <u-gap height="15rpx" bg-color="#F6F6F6" />
    <view class="tabs">
      <Tabs :list="tabList" key-name="name" @change="tabClick" />
    </view>
    <view v-if="current === 1" class="detail-menu">
      <u-collapse v-if="courseDetail.chapters && courseDetail.chapters.length" :border="false" :value="collapseValue">
        <u-collapse-item v-for="(item, index) in courseDetail.chapters" :key="index" :title="`第${index + 1}章 ${item.chapter_name}`" :name="index">
          <view class="collapse-list">
            <view v-for="(it, ix) in item.sections" :id="`section${index}-${ix}`" :key="ix" class="collapse-list__item" @click="playVideo(it, ix, index)">
              <view class="item-info">
                <view class="info">
                  <view class="name" :class="{ active: play.current === `section${index}-${ix}` }">
                    <view class="one-txt-cut">
                      {{ ix + 1 }}.{{ it.section_name }}
                    </view>
                    <view class="item-play">
                      <view class="text">
                        {{ isTryLook(ix, index) ? '试看' : play.current === `section${index}-${ix}` ? '继续播放' : '' }}
                      </view>
                      <image class="icon" src="../static/course/msjt_icon_bf.png" />
                    </view>
                  </view>
                  <view class="time">
                    {{ timeTransform(it.section_time) }}
                  </view>
                </view>
              </view>
            </view>
          </view>
        </u-collapse-item>
      </u-collapse>
      <template v-else>
        <view class="collapse-list list">
          <view v-for="(it, ix) in courseDetail.sections" :id="`section-1-${ix}`" :key="ix" class="collapse-list__item" @click="playVideo(it, ix, -1)">
            <view class="item-info">
              <view class="info">
                <view class="name" :class="{ active: play.current === `section-1-${ix}` }">
                  <view class="one-txt-cut">
                    {{ ix + 1 }}.{{ it.section_name }}
                  </view>
                  <view class="item-play">
                    <view class="text">
                      {{ isTryLook(ix, -1) ? '试看' : play.current === `section-1-${ix}` ? '继续播放' : '' }}
                    </view>
                    <image class="icon" src="../static/course/msjt_icon_bf.png" />
                  </view>
                </view>
                <view class="time">
                  {{ timeTransform(it.section_time) }}
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>
    <view v-if="current === 2" class="detail-desc">
      <view class="detail-desc__title">
        课程简介
      </view>
      <view class="detail-desc__content">
        {{ courseDetail.pack_intro }}
      </view>
      <view class="detail-desc__title">
        课程讲师
      </view>
      <view class="detail-desc__list">
        <view v-for="(item, index) in courseDetail.teachers" :key="index" class="list-item">
          <image class="img" :src="item.teacher_imgurl" />
          <view class="info">
            <view class="info-name">
              {{ item.teacher_name }}<text class="tags">
                {{ item.teacher_desc }}
              </text>
            </view>
            <view class="info-desc">
              {{ item.teacher_intro }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="showVip && !userInfo.isMember" class="open-vip">
      <view>开通VIP会员，观看所有视频</view>
      <view class="open-vip__btn" @click="clickVip">
        立即开通
      </view>
    </view>
  </view>
</template>

<script>
import tabs from '../../components/i-tabs.vue'
import { isHFSApp, isHFSStudent, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Tabs: tabs },
  data() {
    return {
      options: {},
      userInfo: {},
      courseCache: {},
      courseDetail: {},
      play: {
        src: '',
        title: '',
        current: '',
      },
      tabList: [
        {
          name: '课程目录',
          value: 1,
        },
        {
          name: '介绍',
          value: 2,
        },
      ],
      current: 1,
      collapseValue: [0],
      courseTime: {},
    }
  },
  computed: {
    isTryLook() {
      return (ix, index) => {
        return !this.userInfo.isMember && index <= 0 && ix < 3
      }
    },
    initialTime() {
      const { playCurrent = '' } = this.courseCache[this.options.subject] || {}
      if (this.play.current !== playCurrent)
        return 0
      return this.courseTime.currentTime || 0
    },
    prefix() {
      let prefix = '/v1/be-proxy'
      // #ifdef H5
      prefix = feConfig.api.hfs || ''
      // #endif
      return prefix
    },
    showVip() {
      // #ifdef H5
      if (isHFSStudent()) {
        return false
      }
      // #endif
      return true
    },
  },
  onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || getApp().globalData.userInfo || {}
    this.courseCache = uni.getStorageSync(`courseCache_${this.userInfo.userId}`) || {}
    const { collapseValue = [0], courseTime = {}, playCurrent = '' } = this.courseCache[options.subject] || {}
    this.collapseValue = collapseValue
    this.courseTime = courseTime
    this.play.current = playCurrent
    this.getCourseDetail(options.pack_id)
    // #ifdef H5
    nativeBridge.registerHandler('timeUpdate', this.timeUpdate)
    // #endif
  },
  methods: {
    // 获取课程详情
    async getCourseDetail(id) {
      const res = await uni.$http.get(`${this.prefix}/api/v3/micro-course/pack?pack_id=${id}`)
      this.courseDetail = JSON.parse(JSON.stringify(res.data).replace('[chapters]', 'chapters'))
      this.options.subject && this.$nextTick(async () => {
        await uni.$u.sleep(500)
        const query = uni.createSelectorQuery().in(this)
        query.select(`#${this.play.current}`).boundingClientRect((data) => {
          uni.pageScrollTo({ scrollTop: data.top - uni.$u.getPx('450rpx') })
        }).exec()
      })
    },
    tabClick(e) {
      this.current = e.value
    },
    playVideo(item, ix, index) {
      if (!this.userInfo.isMember && !this.isTryLook(ix, index)) {
        if (this.showVip) {
          return uni.showModal({
            title: '温馨提示',
            content: '开通VIP会员，观看所有视频',
            cancelText: '放弃观看',
            confirmText: '去开通',
            confirmColor: '#FF4D2B',
            success: (res) => {
              if (res.confirm) {
                return this.clickVip()
              }
            },
          })
        }
        return uni.showModal({
          title: '温馨提示',
          content: '更多视频课程，请在好分数家长端观看',
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: '#FF4D2B',
        })
      }
      uni.$http.get(`${this.prefix}/api/v3/micro-course/section/video`, {
        section_id: item.section_id,
        domain: 'https://hfs.yunxiao.com',
        isApp: 1,
        platformSource: 1,
      }).then((res) => {
        this.collapseValue = [index]
        const url = res.data.src
        const name = item.section_name
        const current = `section${index}-${ix}`
        // #ifdef H5
        if (isHFSApp()) {
          this.play = { name, current }
          return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 48, data: { url, name, initialTime: this.initialTime } }))
        }
        // #endif
        this.play = { url, name, current }
      })
    },
    clickVip() {
      // #ifdef H5
      if (isHFSApp()) {
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, data: {} }))
      }
      // #endif
      return uni.navigateTo({ url: '/pages/me/member' })
    },
    timeTransform(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}分${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}秒`
    },
    timeUpdate(e) {
      this.courseTime = e.detail
    },
    setCache() {
      if (!this.courseTime.duration)
        return
      const { _id, pack_subject, pack_imgurl, pack_name, teachers, section_num, visit_count } = this.courseDetail
      this.courseCache[pack_subject] = {
        _id,
        pack_imgurl,
        pack_name,
        teachers: teachers.map(v => v.teacher_name).join('、'),
        section_num,
        visit_count,
        courseTime: this.courseTime,
        collapseValue: this.collapseValue,
        playCurrent: this.play.current,
      }
      uni.setStorageSync(`courseCache_${this.userInfo.userId}`, this.courseCache)
    },
  },
  onUnload() {
    this.setCache()
  },
  onHide() {
    this.setCache()
  },
}
</script>

<style lang="scss" scoped>
.detail {
  min-height: 100vh;
  padding-bottom: 200rpx;
  &-video {
    width: 100%;
    height: 422rpx;
    &__item {
      width: 100%;
      height: 100%;
    }
  }
  &-info {
    padding: 30rpx 30rpx 58rpx;
    &__title {
      font-size: 38rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 35rpx;
    }
    &__teacher {
      font-size: 24rpx;
      color: #666666;
      margin-bottom: 22rpx;
    }
    &__desc {
      font-size: 22rpx;
      color: #939393;
      display: flex;
      align-items: center;
      .active {
        color: #ff4d2b;
      }
      .study {
        margin-left: 30rpx;
      }
    }
  }
  .tabs {
    border-bottom: 1rpx solid #e6e6e6;
    ::v-deep .u-tabs__wrapper__nav__item {
      width: 50%;
    }
  }
  &-menu {
    padding: 40rpx 30rpx;
    ::v-deep .u-collapse-item {
      position: relative;
      border-radius: 16rpx;
      box-shadow: 0rpx 2rpx 18rpx 2rpx #f0f1f4;
      margin-bottom: 22rpx;
      .u-cell__body {
        font-size: 30rpx !important;
        font-weight: 500 !important;
        color: #282423 !important;
        padding: 28rpx 30rpx !important;
      }
      &__content__text {
        padding: 0 30rpx !important;
      }
    }
    .collapse-list {
      border-top: 1rpx solid #e6e6e6;
      &.list {
        border-top: none;
      }
      &__item {
        position: relative;
        padding: 24rpx 0rpx 18rpx 0;
        display: flex;
        justify-content: space-between;
        border-bottom: 1rpx dashed #e6e6e6;
        &:last-child {
          border-bottom: none;
        }
        .item-info {
          width: 100%;
          display: flex;
          position: relative;
        }
        .info {
          width: 100%;
          .name {
            font-size: 28rpx;
            color: #333333;
            font-weight: 500;
            line-height: 40rpx;
            margin-bottom: 8rpx;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            &.active {
              color: #ff4d2b;
            }
          }
          .time {
            font-size: 24rpx;
            color: #939393;
          }
        }
        .item-play {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          margin-left: 10rpx;
          .text {
            font-size: 26rpx;
            color: #333333;
            margin-right: 20rpx;
          }
          .icon {
            width: 36rpx;
            height: 36rpx;
          }
        }
      }
    }
  }
  &-desc {
    padding: 30rpx 30rpx 0;
    &__title {
      font-size: 32rpx;
      font-weight: 500;
      color: #000000;
      margin-bottom: 15rpx;
    }
    &__content {
      font-size: 28rpx;
      color: #939393;
      line-height: 38rpx;
      margin-bottom: 34rpx;
    }
    &__list {
      .list-item {
        display: flex;
        padding: 25rpx 0;
        border-bottom: 1rpx solid #e6e6e6;
        &:last-child {
          border-bottom: none;
        }
        .img {
          width: 92rpx;
          height: 92rpx;
          border-radius: 50%;
          margin-right: 20rpx;
          flex-shrink: 0;
        }
        .info {
          .info-name {
            font-size: 34rpx;
            font-weight: 500;
            color: #000000;
            margin-bottom: 12rpx;
            display: flex;
            align-items: center;
            .tags {
              background: #fff3f0;
              border: 1rpx solid #ffd2ca;
              border-radius: 4.17rpx;
              font-size: 20rpx;
              color: #ff4d2b;
              margin-left: 20rpx;
              padding: 1rpx 8rpx;
            }
          }
          .info-desc {
            font-size: 25rpx;
            color: #939393;
            line-height: 34rpx;
          }
        }
      }
    }
  }
  .open-vip {
    position: fixed;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 30rpx;
    color: #333333;
    width: 100%;
    height: 100rpx;
    padding: 0 30rpx;
    background: #ffffff;
    border-top: 1rpx solid #e6e6e6;
    &__btn {
      height: 70rpx;
      width: 200rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #ff4d2b;
      font-size: 30rpx;
      color: #ffffff;
      border-radius: 40rpx;
    }
  }
}
</style>
