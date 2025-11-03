<template>
  <view class="tabs">
    <u-tabs :list="list" :key-name="keyName" :current="current" :line-color="tabsStyle.lineColor" :inactive-style="tabsStyle.inactiveStyle" :active-style="tabsStyle.activeStyle" :item-style="tabsStyle.itemStyle" @change="change" />
  </view>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => ([]),
    },
    keyName: {
      type: String,
      default: 'subject',
    },
    current: {
      type: [Number, String],
      default: 0,
    },
  },
  emits: ['change'],
  data() {
    return {
      tabsStyle: {
        lineColor: '#FFBA1D',
        inactiveStyle: {
          color: '#939393',
          fontSize: '30rpx',
        },
        activeStyle: {
          color: '#ffba1d',
          fontWeight: '500',
          fontSize: '30rpx',
        },
        itemStyle: {
          height: '90rpx',
          padding: '0 20rpx',
        },
      },
    }
  },
  methods: {
    change(e) {
      this.$emit('change', e)
    },
  },
}
</script>
