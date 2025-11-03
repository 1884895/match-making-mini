<template>
  <view class="marquee">
    <view class="marquee-content">
      <view class="marquee-content__animation">
        <view v-for="(item, index) in hotList" :key="index" class="marquee-list" :style="{ width: `${hotList[index].length * 550}rpx` }">
          <view v-for="(it, i) in hotsInfo" :key="i" class="list-item">
            <image class="icon" :src="`${resourceUrl}share_person_icon.png`" />
            <text class="text">
              <text class="text-item">恭喜{{ it.province }}{{ it.schoolName }}{{ it.name }}家长</text>
              <text v-if="it.type === 1" class="text-item">
                绑定成功！
              </text>
              <text v-if="it.type === 2" class="text-item">
                已成功获得30天免费会员!
              </text>
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    prefix: {
      type: String,
      default: '',
    },
    isAppStudent: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/newPromoter/',
      hotsInfo: [],
    }
  },
  computed: {
    hotList() {
      return this.chunkArray(this.hotsInfo || [], 1)
    },
  },
  created() {
    this.getHotsInfo()
  },
  methods: {
    chunkArray(arr, numChunks) {
      const chunkSize = Math.ceil(arr.length / numChunks)
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
      this.hotsInfo = uni.$u.randomArray(res.data || [])
    },
  },
}
</script>

<style lang="scss" scoped>
.marquee {
  height: 84rpx;
  &-content {
    position: relative;
    z-index: 1;
    &__animation {
      width: 100%;
      padding: 12rpx 0;
      overflow: hidden;
      .marquee-list {
        display: flex;
        align-items: flex-start;
        white-space: nowrap;
        padding-left: 100%;
        animation: Marquee 120s linear infinite;
        .list-item {
          background: rgba(255, 224, 113, 0.5);
          border-image: linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.2),
              rgba(255, 255, 255, 0)
            )
            0.8 0.8;
          border-radius: 25rpx;
          padding: 10rpx 10rpx 10rpx 18rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 27rpx;
          &:nth-of-type(2n) {
            margin-top: 10rpx;
          }
          .icon {
            width: 24rpx;
            height: 24rpx;
            margin-right: 12rpx;
          }
          .text {
            font-size: 20rpx;
            color: #796213;
            &-item {
              white-space: nowrap;
            }
          }
        }
      }
    }
  }
}

@keyframes Marquee {
  from {
    transform: translateX(0%);
  }
  to {
    transform: translateX(-100%);
  }
}
</style>
