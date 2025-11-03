<template>
  <view class="marquee">
    <view class="marquee-bg">
      <image class="marquee-bg__hot" :src="`${resourceUrl}hot.png`" />
    </view>
    <view class="marquee-content">
      <view class="marquee-content__animation">
        <view v-for="(item, index) in hotList" :key="index" class="marquee-list" :style="{ width: `${hotList[index].length * 550}rpx` }">
          <view v-for="(it, ix) in item" :key="ix" class="list-item">
            <image class="icon" :src="`${resourceUrl}flower.png`" />
            <text class="text">
              <text>恭喜{{ it.province }}{{ it.schoolName }}{{ it.name }}家长</text>
              <text v-if="pageType === 'operation'">
                已成功邀约{{ it.askCount }}名新同学
              </text>
              <text v-if="pageType === 'share'">
                已成功{{ textMap[it.type] }}
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
      hotsInfo: [],
      textMap: {
        1: '开通会员',
        2: '获取限时下单额外福利开通会员',
      },
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
  position: relative;
  margin: 0 20rpx 24rpx 22rpx;
  background: linear-gradient(180deg, #ebf8bf, #ffffff 43%);
  border: 2rpx solid #ffffff;
  border-radius: 40rpx;
  overflow: hidden;
  &-bg {
    position: absolute;
    left: 50%;
    top: 32rpx;
    transform: translateX(-50%);
    &__hot {
      width: 248rpx;
      height: 44rpx;
    }
  }
  &-content {
    position: relative;
    padding-top: 84rpx;
    z-index: 1;
    &__animation {
      width: 100%;
      padding: 46rpx 0;
      overflow: hidden;
      .marquee-list {
        display: flex;
        align-items: center;
        white-space: nowrap;
        margin-bottom: 20rpx;
        padding-left: 100%;
        animation: Marquee 60s linear infinite;
        &:nth-child(2) {
          animation: Marquee 50s linear infinite;
        }
        &:last-child {
          margin-bottom: 0;
          animation: Marquee 35s linear infinite;
        }
        .list-item {
          background: #ebffeb;
          border-image: linear-gradient(180deg, #ffffff, rgba(255, 255, 255, 0))
            0.5 0.5;
          border-radius: 25rpx;
          padding: 8rpx 18rpx 8rpx 14rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20rpx;
          .icon {
            width: 36rpx;
            height: 36rpx;
            margin-right: 6rpx;
          }
          .text {
            font-size: 22rpx;
            color: #571d00;
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
