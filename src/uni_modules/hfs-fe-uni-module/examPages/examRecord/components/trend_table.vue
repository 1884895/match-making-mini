<template>
  <view class="table">
    <view class="table-title">
      <image class="table-title__icon" :src="`${resourceUrl}trend_table_icon.png`" mode="widthFix" />
      <view class="table-title__text">
        考试数据
      </view>
    </view>
    <view class="table-content">
      <view v-if="showHeader" class="table-content__tr">
        <view v-for="item in options" :key="item.key" class="td">
          <view class="info">
            <view class="info__label">
              {{ item.label }}
            </view>
          </view>
        </view>
      </view>
      <view class="table-content__list">
        <view v-for="item in tableData" :key="item.key" class="td">
          <view v-for="it in options" :key="it.key" class="info">
            <view class="info-message">
              <view class="info-message__label">
                <IMask :show="it.show">
                  {{ item[it.key] }}
                </IMask>
              </view>
              <view v-if="item[it.key] && item[`${it.key}Unit`]" class="info-message__unit">
                <IMask :show="it.show">
                  {{ item[`${it.key}Unit`] }}
                </IMask>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-if="examItem.examId" class="table-content__btns" @click="handleExamDetail">
        <view class="btns-text">
          查看考试
        </view>
        <u-icon name="arrow-right" size="30rpx" color="#FFB100" />
      </view>
    </view>
  </view>
</template>

<script>
import IMask from '../../../components/i-mask.vue'

export default {
  components: { IMask },
  props: {
    options: {
      type: Array,
      default: () => {
        return []
      },
    },
    tableData: {
      type: Array,
      default: () => {
        return []
      },
    },
    examItem: {
      type: Object,
      default: () => ({}),
    },
    showHeader: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/record/',
    }
  },
  methods: {
    handleExamDetail() {
      uni.navigateTo({ url: `/uni_modules/hfs-fe-uni-module/examPages/index/index?examId=${this.examItem.examId}` })
    },
  },
}
</script>

<style lang="scss" scoped>
.table {
  background: #fff9e4;
  border-radius: 24rpx;
  padding: 26rpx 28rpx 30rpx;
  &-title {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
    &__icon {
      width: 30rpx;
      height: 30rpx;
      margin-right: 8rpx;
    }
    &__text {
      font-size: 30rpx;
      color: #724900;
    }
  }
  &-content {
    .td {
      height: 76rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    &__tr {
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0rpx -1rpx 0rpx 0rpx rgba(114, 73, 0, 0.1) inset;
      .td {
        opacity: 0.7;
        font-size: 26rpx;
        color: #724900;
        display: flex;
        justify-content: center;
        width: 30%;
        &:first-child {
          justify-content: flex-start;
        }
        &:last-child {
          justify-content: flex-end;
        }
      }
    }
    &__list {
      .td {
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0rpx -1rpx 0rpx 0rpx rgba(114, 73, 0, 0.1) inset;
        .info {
          font-size: 32rpx;
          font-weight: bold;
          color: #724900;
          width: 30%;
          &-message {
            display: flex;
            align-items: baseline;
            justify-content: center;
            &__unit {
              font-size: 22rpx;
              font-weight: 400;
              color: #724900;
              margin-left: 2rpx;
            }
          }
          &:first-child {
            .info-message {
              font-weight: 400;
              font-size: 28rpx;
              color: #724900;
              justify-content: flex-start;
            }
          }
          &:last-child {
            .info-message {
              justify-content: flex-end;
            }
          }
        }
      }
    }
    &__btns {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 20rpx;
      .btns-text {
        font-size: 28rpx;
        color: #ffb100;
        margin-right: 4rpx;
      }
    }
    &__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 76rpx;
      box-shadow: 0 -1rpx 0 0 rgba(114, 73, 0, 0.1) inset;
    }
  }
}
</style>
