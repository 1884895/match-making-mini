<template>
  <view class="vip">
    <view class="vip-bg">
      <image class="vip-bg__header" :src="`${resourceUrl}header_bg.png`" mode="widthFix" />
      <image v-if="grade !== '0'" class="vip-bg__tag" :src="`${resourceUrl}end_vip_tag.png`" />
      <image v-else class="vip-bg__tag" :src="`${resourceUrl}vip_tag.png`" />
    </view>
    <view class="vip-content">
      <view class="vip-content__info">
        <scroll-view class="vip-content__scroll" :scroll-left="scrollLeft" scroll-x="true" scroll-with-animation @scroll="handleScroll">
          <view class="vip-content__list">
            <view v-for="(item, index) in vipList" :id="`tabs_${index}`" :key="index" class="list-item" :class="{ active: current === index }" @click="scrollClick(index)">
              <view class="list-item__tabs">
                <image :src="item.tabs" mode="widthFix" :style="{ width: item.tabWidth }" />
              </view>
              <text class="list-item__text">
                {{ item.text }}
              </text>
            </view>
          </view>
        </scroll-view>
        <view class="vip-content__banner">
          <u-swiper :list="vipList" :current="current" height="514rpx" previous-margin="42rpx" next-margin="42rpx" circular radius="20rpx" bg-color="#ffffff" key-name="banner" @change="swiperChange" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    groupInfo: {
      type: Object,
      default: () => {},
    },
    grade: {
      type: String,
      default: '0',
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/group/',
      current: 0,
      scrollLeft: 0,
      prevDistance: 0,
    }
  },
  computed: {
    vipList() {
      return [
        {
          tabs: 'vip_tabs_1.png',
          tabWidth: '94rpx',
          text: '成绩总览',
          banner: 'vip_banner_1.png',
        },
        {
          tabs: 'vip_tabs_2.png',
          tabWidth: '94rpx',
          text: '学科分析',
          banner: 'vip_banner_2.png',
        },
        {
          tabs: 'vip_tabs_3.png',
          tabWidth: '94rpx',
          text: '失分总结',
          banner: 'vip_banner_3.png',
        },
        {
          tabs: 'vip_tabs_4.png',
          tabWidth: '94rpx',
          text: '拍照录题',
          banner: 'vip_banner_4.png',
        },
        {
          tabs: 'vip_tabs_5.png',
          tabWidth: '94rpx',
          text: '考试错题',
          banner: 'vip_banner_5.png',
        },
        {
          tabs: 'vip_tabs_6.png',
          tabWidth: '94rpx',
          text: '试题讲解',
          banner: 'vip_banner_6.png',
        },
        {
          tabs: 'vip_tabs_7.png',
          tabWidth: '94rpx',
          text: '错题导出打印',
          banner: 'vip_banner_7.png',
        },
        {
          tabs: 'vip_tabs_8.png',
          tabWidth: '94rpx',
          text: '智选错题',
          banner: 'vip_banner_8.png',
        },
        {
          tabs: 'vip_tabs_9.png',
          tabWidth: '94rpx',
          text: '错题订正',
          banner: 'vip_banner_9.png',
        },
        {
          tabs: 'vip_tabs_10.png',
          tabWidth: '94rpx',
          text: '错题举一反三练',
          banner: 'vip_banner_10.png',
        },
        {
          tabs: 'vip_tabs_11.png',
          tabWidth: '94rpx',
          text: '课程视频',
          banner: 'vip_banner_11.png',
        },
        {
          tabs: 'vip_tabs_12.png',
          tabWidth: '94rpx',
          text: '试卷下载',
          banner: 'vip_banner_12.png',
        },
        {
          tabs: 'vip_tabs_13.png',
          tabWidth: '94rpx',
          text: '学霸答案',
          banner: 'vip_banner_13.png',
        },
        {
          tabs: 'vip_tabs_14.png',
          tabWidth: '94rpx',
          text: '更多会员权益',
          banner: 'vip_banner_14.png',
        },
      ].map((v) => {
        return {
          ...v,
          banner: this.resourceUrl + v.banner,
          tabs: this.resourceUrl + v.tabs,
        }
      })
    },
    screenHalfWidth() {
      return uni.$u.sys().windowWidth / 2
    },
  },
  methods: {
    handleScroll(e) {
      const distance = e.detail.scrollLeft
      this.prevDistance = distance
    },
    scrollClick(index) {
      this.current = index
      this.moveCenter(index)
    },
    swiperChange(e) {
      this.current = e.current
      this.moveCenter(e.current)
    },
    moveCenter(index) {
      const query = uni.createSelectorQuery().in(this)
      query.select(`#tabs_${index}`).boundingClientRect((rect) => {
        const subHalfWidth = rect.width / 2
        const needScroll = rect.left - this.screenHalfWidth + subHalfWidth
        this.scrollLeft = needScroll + this.prevDistance
      }).exec()
    },
  },
}
</script>

<style lang="scss" scoped>
.vip {
  position: relative;
  margin: 12rpx 28rpx;
  &-bg {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    &__header {
      width: 100%;
    }
    &__tag {
      width: 320rpx;
      height: 84rpx;
      position: absolute;
      left: 50%;
      top: 12rpx;
      transform: translateX(-50%);
    }
  }
  &-content {
    position: relative;
    border-radius: 24rpx;
    padding-top: 104rpx;
    z-index: 1;
    &__info {
      width: 100%;
      background: #fff;
      border-radius: 24rpx;
      padding: 36rpx 0 44rpx;
    }
    &__scroll {
      white-space: nowrap;
      margin-bottom: 20rpx;
    }
    &__list {
      display: inline-flex;
      .list-item {
        width: 96rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-right: 80rpx;
        &:first-child {
          margin-left: 42rpx;
        }
        &__tabs {
          width: 94rpx;
          height: 94rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background: #feedc3;
          margin-bottom: 10rpx;
        }
        &__text {
          font-size: 24rpx;
          color: #939393;
        }
        &.active {
          .list-item__tabs {
            background: #feedc3;
            border: 4rpx solid #ff9f0a;
          }
          .list-item__text {
            color: #333333;
            font-weight: bold;
          }
        }
      }
    }
  }
}
</style>
