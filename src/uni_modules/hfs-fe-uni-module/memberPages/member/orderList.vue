<template>
  <view class="order">
    <u-sticky :custom-nav-height="0">
      <view class="order-tabs">
        <u-tabs :list="tabList" key-name="name" :line-width="tabsStyle.lineWidth" :line-color="tabsStyle.lineColor" :inactive-style="tabsStyle.inactiveStyle" :active-style="tabsStyle.activeStyle" :item-style="tabsStyle.itemStyle" @change="tabsChange" />
      </view>
    </u-sticky>
    <view class="order-content">
      <OrderItem :list="list" :load-status="loadStatus" @updata-list="getList" />
    </view>
  </view>
</template>

<script>
import orderItem from './components/orderItem'

export default {
  components: { OrderItem: orderItem },
  data() {
    return {
      status: 1,
      list: [],
      loadStatus: false,
      tabList: [{ name: '未付款', value: 1 }, { name: '已完成', value: 2 }],
      tabsStyle: {
        lineColor: '#FFBA1D',
        lineWidth: '56rpx',
        inactiveStyle: {
          color: '#939393',
          fontSize: '32rpx',
        },
        activeStyle: {
          color: '#333333',
          fontWeight: '500',
          fontSize: '32rpx',
        },
        itemStyle: {
          height: '90rpx',
          padding: '0 20rpx',
        },
      },
    }
  },
  computed: {
    beProxy() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/be-proxy'
      // #endif
      return prefix
    },
  },
  onShow() {
    this.getList()
  },
  methods: {
    tabsChange(item) {
      if (item.value === this.status)
        return
      this.status = item.value
      this.list = []
      this.getList()
    },
    async getList() {
      try {
        this.loadStatus = false
        const params = { status: this.status }
        if (params.status === 1)
          params.good = 1
        const res = await uni.$http.get(`${this.beProxy}/v2/payments/records`, params, { custom: { error: false } })
        this.list = res.data
        this.loadStatus = true
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (error) {
        this.loadStatus = true
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.order {
  min-height: 100vh;
  background: #f5f5f5;
  &-tabs {
    background-color: #ffffff;
    box-shadow: 0 1rpx 0 0 #e6e6e6 inset;
    ::v-deep .u-tabs__wrapper__nav__item {
      width: 50%;
    }
    ::v-deep .u-tabs__wrapper__nav__line {
      bottom: 10rpx;
    }
  }
}
</style>
