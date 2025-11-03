<template>
  <view class="area">
    <!-- banner -->
    <view v-if="bannerList.length" class="banner">
      <view v-for="item in bannerList" :key="item._id" class="banner-item">
        <AdSwiper :list="item.items" key-name="picUrl" :height="`${item.height / item.width * 690}rpx`" />
      </view>
    </view>
    <!-- operation -->
    <view v-if="operationList.length" class="operation">
      <view v-for="(item, index) in operationList" :key="index" class="operation-box">
        <template v-if="item.is_show === 1 && item.items.length === 3">
          <!-- 左一右二 -->
          <view class="operation-box-item operation-box-three left">
            <image class="cover" :src="item.items[0].picUrl" :mode="mode" @click="clickSwiper(item.items[0])" />
          </view>
          <view class="operation-box-item operation-box-three right">
            <image class="cover" :src="item.items[1].picUrl" mode="aspectFill" @click="clickSwiper(item.items[1])" />
            <image class="cover" :src="item.items[2].picUrl" mode="aspectFill" @click="clickSwiper(item.items[2])" />
          </view>
        </template>
        <!-- 其余布局 -->
        <template v-else>
          <view v-for="(v, i) in item.items" :key="i" class="operation-box-item" :class="{ 'operation-box-width': operationWidth(item) }">
            <image class="cover" :src="v.picUrl" :mode="mode" @click="clickSwiper(v)" />
          </view>
        </template>
      </view>
    </view>
    <!-- content -->
    <view v-if="contentList.length" class="content">
      <view class="content-title">
        推荐阅读
      </view>
      <view class="list">
        <view v-for="(item, index) in contentList" :key="index" class="list-item">
          <!-- 主题 -->
          <swiper v-if="item.themeList.length" class="swiper" autoplay circular indicator-color="rgba(255, 255, 255, 0.35)" indicator-active-color="#FFFFFF" :indicator-dots="true">
            <swiper-item v-for="v in item.themeList" :key="v.id">
              <view class="theme" @click="jumpThemeDetails(v.id, 0)">
                <view class="theme-header">
                  <view class="theme-header-title">
                    <view class="line" />
                    <view class="name">
                      {{ v.name }}
                    </view>
                  </view>
                  <view class="theme-header-score">
                    {{ `互动值：${fomrate(v.score) || 0}人` }}
                  </view>
                </view>
                <view class="theme-pic">
                  <LoadImage :src="v.coverPic" max-height="199rpx" none-text="加载失败" />
                </view>
              </view>
            </swiper-item>
          </swiper>
          <!-- 文章 -->
          <view v-if="item.articleList.length" class="wapper">
            <view v-for="v in item.articleList" :key="v.id" class="wapper-list" @click="jumpArticleDetails(v.id, 0)">
              <view class="article">
                <view class="article-left">
                  <view class="article-left-title">
                    {{ v.name }}
                  </view>
                  <view class="article-left-desc">
                    <image class="article-left-desc-icon" :mode="mode" src="../../../static/home/eye.png" />
                    <span class="article-left-desc-score">{{ fomrate(v.score) || 0 }}</span>
                  </view>
                </view>
                <image class="article-right" :src="v.coverPic" mode="aspectFill" />
              </view>
              <u-line class="wapper-line" color="#f6f6f6" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import adSwiper from '../../../components/adSwiper.vue'
import loadImage from '../../../components/loadImage.vue'

export default {
  components: { AdSwiper: adSwiper, LoadImage: loadImage },
  props: {
    operationDetail: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      mode: 'widthFix',
    }
  },
  computed: {
    bannerList() {
      return this.operationDetail?.banner?.map(item => ({
        ...item,
        items: item.items.flatMap(({ materia_list: materiaList = [], ...rest }) => materiaList.map(materia => ({ ...rest, ...materia }))) || [],
      })) || []
    },
    operationList() {
      return this.operationDetail.operation || []
    },
    contentList() {
      const list = this.operationDetail.content || []
      const arr = []
      list.length && list.forEach((item) => {
        const themeList = []; const articleList = []
        item.items.forEach((subItem) => {
          subItem.type === 'theme' ? themeList.push(subItem) : articleList.push(subItem)
        })
        arr.push({ themeList, articleList })
      })
      return arr
    },
  },
  methods: {
    jumpThemeDetails(themeId, current) {
      wx.reportEvent('home_theme_click')
      return uni.navigateTo({
        url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.operationUrl}/#/pages/find/themeDetails?themeId=${themeId}&current=${current}`)}`,
      })
    },
    jumpArticleDetails(articleId, _current) {
      wx.reportEvent('home_article_click')
      return uni.navigateTo({
        url: `/pages/browser/browser?url=${encodeURIComponent(`${feConfig.operationUrl}/#/pages/find/articleDetails?id=${articleId}`)}`,
      })
    },
    getHeight(item) {
      if (!item.height || !item.width)
        return '200rpx'
      return `${item.height / item.width * 690}rpx`
    },
    fomrate(num) {
      if (num > 10000) {
        return `${(num / 10000).toFixed(1)}w`
      }
      return num
    },
    clickSwiper(data) {
      if (!data)
        return null
      wx.reportEvent('home_operation_click')
      const { mode, target: url } = data
      const jumpMap = {
        0: () => {},
        1: () => {
          return uni.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent(url)}` })
        },
        2: () => {
          return uni.navigateTo({ url, fail: () => uni.switchTab({ url }) })
        },
        3: () => {
          return uni.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent(url)}` })
        },
        4: () => {
          return uni.navigateToMiniProgram({
            appId: url,
            path: data.data.path,
          })
        },
        7: () => {
          const options = {
            extInfo: {
              url: data.data.path,
            },
            corpId: url,
          }
          wx.openCustomerServiceChat(options)
        },
      }
      return jumpMap[mode]()
    },
    operationWidth(item) {
      return !(item.items.length === 1 || (item.items.length === 2 && item.row === 2))
    },
  },
}
</script>

<style lang="scss" scoped>
.area {
  .cover {
    display: block;
    width: 100%;
  }
  .banner {
    &-item {
      margin-bottom: 20rpx;
    }
  }
  .operation {
    margin-bottom: 46rpx;
    &-box {
      position: relative;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-bottom: 10rpx;
      &-item {
        width: 100%;
        overflow: hidden;
        margin-bottom: 10rpx;
        border-radius: 20rpx;
        .cover {
          border-radius: 20rpx;
        }
      }
      &-width {
        width: calc(50% - 8rpx);
      }
      &-three {
        width: calc(50% - 8rpx);
        .cover {
          height: calc(50% - 8rpx);
        }
      }
    }
    .right {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
  .content {
    &-title {
      font-size: 34rpx;
      font-weight: 500;
      color: #282423;
      margin-bottom: 16rpx;
    }
    .list {
      &-item {
        .swiper {
          margin-bottom: 25rpx;
          .theme {
            background: #ffffff;
            border-radius: 20rpx;
            padding: 25rpx 22rpx;
            &-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 20rpx;
              &-title {
                margin-left: -22rpx;
                display: flex;
                align-items: center;
                flex: 1;
                overflow: hidden;
                margin-right: 6rpx;
                .line {
                  width: 8rpx;
                  height: 26rpx;
                  background: #ffba1d;
                  margin-right: 25rpx;
                }
                .name {
                  font-size: 30rpx;
                  font-weight: 500;
                  color: #282423;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }
              &-score {
                padding: 3rpx 10rpx;
                background: #fff6e1;
                border-radius: 6rpx;
                font-size: 25rpx;
                color: #ffba1d;
                flex-shrink: 0;
              }
            }
            &-pic {
              overflow: hidden;
              border-radius: 20rpx;
            }
          }
        }
        .wapper {
          overflow: hidden;
          border-radius: 20rpx;
          &-list {
            .article {
              background: #ffffff;
              padding: 30rpx 20rpx;
              display: flex;
              justify-content: space-between;
              align-items: center;
              &-left {
                flex: 1;
                &-title {
                  min-height: 108rpx;
                  font-size: 26rpx;
                  line-height: 52rpx;
                  color: #333333;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  margin-bottom: 20rpx;
                }
                &-desc {
                  display: flex;
                  align-items: center;
                  &-icon {
                    width: 30rpx;
                    margin-right: 14rpx;
                  }
                  &-score {
                    font-size: 25rpx;
                    color: #939393;
                  }
                }
              }
              &-right {
                width: 222rpx;
                height: 145rpx;
                margin-left: 20rpx;
                border-radius: 8rpx;
              }
            }
          }
        }
      }
    }
  }
}
</style>
