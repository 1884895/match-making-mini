<template>
  <view>
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
        lineColor: '#FF4D2B',
        inactiveStyle: {
          color: '#939393',
        },
        activeStyle: {
          color: '#282423',
          fontWeight: '500',
        },
        itemStyle: {
          height: '90rpx',
          padding: '0 34rpx',
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
