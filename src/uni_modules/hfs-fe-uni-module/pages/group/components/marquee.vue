<template>
  <view class="marquee">
    <u-notice-bar :text="hotList" duration="3000" direction="column" color="#fff" font-size="26rpx" bg-color="rgba(0,0,0,0.20)" />
  </view>
</template>

<script>
export default {
  options: {
    styleIsolation: 'shared',
  },
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
    roleType: {
      type: Number,
    },
  },
  data() {
    return {
      textMap: {
        1: '开团',
        2: '参团',
      },
      hotsInfo: [],
    }
  },
  computed: {
    hotList() {
      return this.hotsInfo.map(v => `恭喜${v.province}${v.schoolName}${v.name}${this.roleType === 2 ? '家长' : ''}${this.textMap[v.type]}成功`)
    },
  },
  created() {
    this.getHotsInfo()
  },
  methods: {
    async getHotsInfo() {
      const typeMap = {
        1: 1,
        4: 2,
        5: 2,
      }
      const res = await uni.$http.get(`${this.prefix}/v3/activity/groupon/hot?type=${typeMap[this.pageType]}`)
      this.hotsInfo = uni.$u.randomArray(res.data || [])
    },
  },
}
</script>

<style lang="scss" scoped>
.marquee {
  position: fixed;
  top: 14rpx;
  left: 18rpx;
  width: calc(100% - 36rpx);
  z-index: 10;
  ::v-deep .u-notice-bar {
    padding: 10rpx 32rpx;
    border-radius: 28rpx;
  }
}
</style>
