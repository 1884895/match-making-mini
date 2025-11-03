<template>
  <view class="h-scroll" :class="{ active: pageType === 'share' }">
    <view class="h-scroll__bg">
      <image class="tag" :src="resourceUrl + tagMap[pageType]" />
    </view>
    <view class="h-scroll__swiper">
      <swiper class="swiper" autoplay vertical circular :interval="interval">
        <swiper-item v-for="(item, index) in hotList" :key="index" @touchmove.stop.prevent>
          <view v-for="(it, ix) in item" :key="ix" class="swiper-item one-txt-cut">
            <image class="swiper-item__icon" :src="resourceUrl + avatarList[$u.random(0, 3 + ix)]" />
            <view class="swiper-item__text one-txt-cut">
              <text>{{ municipality.includes(it.province) ? `${it.province}市` : `${it.province}省${it.city}市` }}{{ it.schoolName }}{{ it.name }}家长</text>
              <text v-if="pageType === 'operation'">
                已成功邀约{{ it.askCount }}名新同学！
              </text>
              <text v-if="pageType === 'invite'">
                邀约成功！
              </text>
              <text v-if="pageType === 'share'">
                {{ textMap[it.type] }}！
              </text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    pageType: {
      type: String,
      default: '',
    },
    prefix: {
      type: String,
      default: '',
    },
    inviterInfo: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/introduction/',
      interval: 8000,
      municipality: ['北京', '上海', '天津', '重庆'],
      avatarList: ['avatar_1.png', 'avatar_2.png', 'avatar_3.png', 'avatar_4.png', 'avatar_5.png'],
      textMap: {
        1: '成功开通会员',
        2: '获取限时下单额外福利开通会员',
      },
      tagMap: {
        operation: 'scroll_tag_operation.png',
        invite: 'scroll_tag_invite.png',
        share: 'scroll_tag_share.png',
      },
      hotsInfo: [],
    }
  },
  computed: {
    hotList() {
      return this.chunkArray(this.hotsInfo || [], 2)
    },
  },
  created() {
    this.getHotsInfo()
  },
  methods: {
    chunkArray(arr, chunkSize) {
      return arr.reduce((result, item, index) => {
        if (index % chunkSize === 0) {
          result.push([])
        }
        result[result.length - 1].push(item)
        return result
      }, [])
    },
    async getHotsInfo() {
      const res = await uni.$http.get(`${this.prefix}/v3/activity/friend/hot`)
      const { data = [] } = res || {}
      this.hotsInfo = uni.$u.randomArray(data.filter(v => v.sort === 1))
    },
  },
}
</script>

<style lang="scss" scoped>
.h-scroll {
  position: relative;
  background: linear-gradient(180deg, #ebf8bf, #ffffff 28%);
  border: 2rpx solid #ffffff;
  border-radius: 40rpx;
  margin: 12rpx 20rpx 24rpx 22rpx;
  overflow: hidden;
  &.active {
    .h-scroll {
      &__bg {
        .tag {
          width: 478rpx;
          height: 106rpx;
        }
      }
      &__swiper {
        padding-top: 138rpx;
      }
    }
  }
  &__bg {
    position: absolute;
    left: 50%;
    top: 32rpx;
    transform: translateX(-50%);
    .tag {
      width: 404rpx;
      height: 52rpx;
    }
  }
  &__swiper {
    position: relative;
    padding-top: 84rpx;
    z-index: 1;
  }
  .swiper {
    height: 160rpx;
    padding: 36rpx 30rpx;
    box-sizing: border-box;
    &-item {
      display: flex;
      align-items: center;
      margin-bottom: 18rpx;
      &:last-child {
        margin-bottom: 0;
      }
      &__icon {
        width: 36rpx;
        height: 36rpx;
        border-radius: 50%;
        margin-right: 12rpx;
        flex-shrink: 0;
      }
      &__text {
        font-size: 24rpx;
        color: #333333;
      }
    }
  }
  &__item {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
}
</style>
