<template>
  <view class="table">
    <view class="tr">
      <view v-for="(item, index) in columns" :key="index" class="th">
        {{ item.name }}
      </view>
    </view>
    <view v-for="(item, index) in data" :key="index" class="tr">
      <view v-for="(it, ix) in Object.keys(item)" :key="ix" class="td">
        <view>{{ item[columns[ix].key] }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    columns: {
      type: Array,
      required: true,
      default: () => [],
    },
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
}
</script>

<style lang="scss" scoped>
.table {
  border: 1rpx solid #e7e7e7;
  border-radius: 10rpx;
  overflow: hidden;
  .tr {
    display: flex;
    border-bottom: 1rpx solid #e7e7e7;
    &:last-child {
      border-bottom: none;
    }
    .th,
    .td {
      flex: 1;
      font-size: 22rpx;
      padding: 15rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1rpx solid #e7e7e7;
      &:last-child {
        border-right: none;
      }
    }
    .th {
      color: #333333;
      background: #f6f6f6;
    }
    .td {
      color: #939393;
    }
  }
}
</style>
