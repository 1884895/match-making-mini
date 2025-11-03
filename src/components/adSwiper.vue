<template>
  <view class="ad-swiper">
    <swiper v-if="unitId || list.length" :style="{ height }" :indicator-dots="showDots" autoplay circular indicator-color="rgba(255, 255, 255, 0.35)" indicator-active-color="#FFFFFF" interval="3000" duration="300">
      <swiper-item v-for="(item, index) in adList" :key="index">
        <view class="ad-swiper__item" :style="{ height }">
          <template v-if="unitId">
            <ad v-if="index === 0" :unit-id="unitId" ad-intervals="30" />
            <image v-else class="img" :style="{ height }" :src="item[keyName]" mode="aspectFill" @click="imageClick(index)" />
          </template>
          <template v-else>
            <image class="img" :style="{ height }" :src="item[keyName]" mode="aspectFill" @click="imageClick(index)" />
          </template>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
import { PlatformType } from '@/enums'

export default {
  props: {
    height: {
      type: String,
      default: '200rpx',
    },
    list: {
      type: Array,
      default: () => ([]),
    },
    keyName: {
      type: String,
      default: 'url',
    },
    unitId: {
      type: String,
      default: '',
    },
  },
  computed: {
    adList() {
      if (!this.unitId)
        return this.list
      return [{ [this.keyName]: '' }].concat(this.list)
    },
    showDots() {
      return this.adList.length > 1
    },
  },
  methods: {
    imageClick(index) {
      const data = this.adList[index]
      this.clickSwiper(data)
      this.getMsgId(data)
    },
    clickSwiper(data) {
      if (!data)
        return null
      const { mode, targetUrl: url } = data
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
      }
      return jumpMap[mode]()
    },
    async getMsgId(data) {
      const { id: ads_id, materiaId: materia_id } = data
      const userInfo = uni.getStorageSync('userInfo') || {}
      const params = {
        ads_id,
        ctime: new Date().getTime(),
        equip: PlatformType[uni.$u.os()] || 5,
        materia_id,
        project_id: feConfig.bannerProjectId,
        userid: userInfo.userId || '',
        uuid: uni.getStorageSync('__DC_STAT_UUID'),
      }
      const res = await uni.$http.post(`${feConfig.api.znyx}/api/ads/v2/collect-msg`, { project_id: params.project_id, uuid: params.uuid }, { custom: { loading: false, error: false } })
      const { msgId: msg_id } = res.data
      this.advertLog([{ ...params, msg_id, type: 1 }])
    },
    advertLog(params) {
      uni.$http.post(`${feConfig.api.znyx}/api/ads/v2/push/advertLog`, params, { custom: { loading: false, error: false } })
    },
  },
}
</script>

<style lang="scss" scoped>
.ad-swiper {
  border-radius: 8rpx;
  overflow: hidden;
  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    .img {
      width: 100%;
      border-radius: 8rpx;
    }
  }
}
</style>
