<template>
  <view class="h-scroll">
    <view class="h-scroll__bg">
      <image class="header" :src="`${resourceUrl}header_bg.png`" mode="widthFix" />
      <image v-if="grade !== '0'" class="improve" :src="`${resourceUrl}end_improve.png`" />
      <view v-else class="text">
        <view class="text-title">
          <text class="green">
            春日抄底价
          </text>
          <template v-if="discount">
            <text class="black">
              丨
            </text>
            <text class="red">
              最高低至{{ discount }}折
            </text>
          </template>
        </view>
        <image class="text-icon" :src="`${resourceUrl}fire.png`" />
      </view>
    </view>
    <view class="h-scroll__swiper">
      <swiper class="swiper" autoplay vertical circular :interval="interval">
        <swiper-item v-for="(item, index) in hotList" :key="index" @touchmove.stop.prevent>
          <view v-for="(it, ix) in item" :key="ix" class="swiper-item one-txt-cut">
            <image class="swiper-item__icon" :src="resourceUrl + avatarList[$u.random(0, 3 + ix)]" />
            <view class="swiper-item__text one-txt-cut">
              {{ municipality.includes(it.province) ? `${it.province}市` : `${it.province}省${it.city}市` }}{{ it.schoolName }}{{ it.name }}{{ roleType === 2 ? '家长' : '' }}{{ textMap[it.type] }}成功！
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
    groupInfo: {
      type: Object,
      default: () => {},
    },
    grade: {
      type: String,
      default: '0',
    },
    roleType: {
      type: Number,
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/group/',
      interval: 10000,
      municipality: ['北京', '上海', '天津', '重庆'],
      avatarList: ['avatar_1.png', 'avatar_2.png', 'avatar_3.png', 'avatar_4.png', 'avatar_5.png'],
      textMap: {
        1: '开团',
        2: '参团',
      },
      hotsInfo: [],
    }
  },
  computed: {
    hotList() {
      return this.chunkArray(this.hotsInfo || [], 2)
    },
    goods() {
      return (this.groupInfo.goods || [])
    },
    discount() {
      const { discount = 0 } = this.goods[this.goods.length - 1] || {}
      return discount
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
      const typeMap = {
        1: 1,
        2: 2,
        3: 2,
        4: 2,
        5: 2,
      }
      const res = await uni.$http.get(`${this.prefix}/v3/activity/groupon/hot?type=${typeMap[this.pageType]}`)
      const { data = [] } = res || {}
      this.hotsInfo = uni.$u.randomArray(data.filter(v => v.sort === 1))
    },
  },
}
</script>

<style lang="scss" scoped>
.h-scroll {
  position: relative;
  margin: 12rpx 28rpx 24rpx;
  &__bg {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    .header {
      width: 100%;
    }
    .improve {
      width: 560rpx;
      height: 40rpx;
      position: absolute;
      left: 50%;
      top: 16rpx;
      transform: translateX(-50%);
    }
    .text {
      width: 100%;
      height: 72rpx;
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      .text-title {
        font-family: YEFONTAoYeHei;
        font-size: 32rpx;
        .green {
          color: #4e3b00;
        }
        .black {
          color: #333333;
        }
        .red {
          color: #ff4c4c;
        }
      }
      .text-icon {
        width: 24rpx;
        height: 32rpx;
        margin-left: 4rpx;
      }
    }
  }
  &__swiper {
    position: relative;
    border-radius: 24rpx;
    padding-top: 72rpx;
    z-index: 1;
  }
  .swiper {
    height: 130rpx;
    background: #fff;
    border-radius: 24rpx;
    padding: 20rpx 30rpx;
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
