<template>
  <view class="home">
    <FilterSelector
      v-model:selected="selected"
      @change="onFilterChange"
    />
    <!-- 列表主体 -->
    <view class="list">
      <!-- 正常数据列表，两列（卡片必须是 .grid 的直接子元素） -->
      <view class="grid">
        <view
          v-for="(item, idx) in filteredList"
          :key="item.id || idx"
          class="card"
          :class="{ 'full-width': item.isUpload }"
          @click="item.isUpload ? openUpload() : openDetail(item)"
        >
          <template v-if="!item.isUpload">
            <image class="thumb" :src="item.image || placeholder" mode="aspectFill" />
            <view class="meta">
              <view class="row"><text class="label">居住地：</text><text class="value">{{ item.location || item.city || '未填写' }}</text></view>
              <view class="row"><text class="label">月收入：</text><text class="value">{{ item.income || '未填写' }}</text></view>
              <view class="row"><text class="label">房子：</text><text class="value">{{ displayFlag(item.house) }}</text></view>
              <view class="row"><text class="label">车子：</text><text class="value">{{ displayFlag(item.car) }}</text></view>
            </view>
          </template>
          <template v-else>
            <view class="upload-content">
              <view class="upload-text-area">
                <text class="upload-text">您未上传资料</text>
              </view>
              <view class="upload-btn" @click.stop="openUpload">
                <text class="btn-text">上传资料</text>
              </view>
            </view>
          </template>
        </view>

        <!-- 空状态 -->
        <view v-if="!filteredList.length" class="empty">暂无匹配内容</view>
      </view>
    </view>
  </view>
</template>

<script>
// 本地 json 数据将被打包到应用中
import localList from './list.json'
import FilterSelector from '@/components/filter-selector.vue'

const fixedImage = 'https://img.iplaysoft.com/wp-content/uploads/2019/free-images/free_stock_photo.jpg'
const placeholder = fixedImage

export default {
  components: {
    FilterSelector,
  },
  data() {
    return {
      // 筛选相关（v-model 绑定为选中 label）
      selected: { area: '不限', gender: '不限', age: '不限', income: '无收入要求' },

      // 列表相关
      allItems: [], // 从 json 加载的全部数据
      placeholder,
    }
  },

  computed: {
    // 根据 selected 对 allItems 进行简单过滤
    filteredList() {
      const list = this.allItems.filter((item) => {
        if (this.selected.area && this.selected.area !== '不限' && item.location !== this.selected.area)
          return false
        if (this.selected.gender && this.selected.gender !== '不限' && item.gender && item.gender !== this.selected.gender)
          return false
        if (this.selected.age && this.selected.age !== '不限' && item.ageRange && item.ageRange !== this.selected.age)
          return false
        if (this.selected.income && this.selected.income !== '无收入要求' && item.income !== this.selected.income) {
          if (!String(item.income).includes(this.selected.income.replace('+', '')))
            return false
        }
        return true
      })

      // 在索引为2的位置插入上传入口
      if (list.length > 2) {
        list.splice(2, 0, { id: 'upload', isUpload: true })
      }
      return list
    },
  },

  async onLoad() {
    // 加载本地数据
    this.loadLocalData()
  },

  // 页面下拉刷新（uni-app 约定）
  onPullDownRefresh() {
    this.loadLocalData()
    uni.stopPullDownRefresh()
  },

  methods: {
    // 筛选条件变化时的处理
    onFilterChange(newSelected) {
      this.selected = { ...newSelected }
    },

    // 本地 json 加载
    loadLocalData() {
      try {
        const mapped = (localList || []).map(item => ({
          ...item,
          image: item.image || fixedImage,
        }))
        this.allItems = mapped
      }
      catch (e) {
        console.error('loadLocalData error', e)
        this.allItems = []
      }
    },

    openDetail(item) {
      const id = item && (item.id || item._id) ? (item.id || item._id) : ''
      uni.navigateTo({ url: `/pages/detail/detail?id=${id}` })
    },

    openUpload() {
      uni.showToast({
        title: '上传功能开发中',
        icon: 'none',
      })
    },

    displayFlag(val) {
      if (val === true)
        return '有'
      if (val === false)
        return '无'
      return '未填写'
    },
  },
}
</script>

<style lang="scss" scoped>
/* 把样式全部限定在 .home 下，防止影响其他页面 */
.home {
  min-height: 100vh;
  background: #f6f6f6;
  /* 列表/卡片样式（筛选样式由 FilterSelector 组件内部控制） */
  .list {
    width: 100%;
    margin-top: 10rpx;
    padding: 10rpx 28rpx 120rpx;
  }
  .grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 20rpx;
    padding-bottom: 20rpx;
  }
  .card {
    width: 48%;
    background: #fff;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);
  }
  .thumb {
    width: 100%;
    height: 240rpx;
    background: #eee;
  }
  .meta {
    padding: 18rpx;
  }
  .row {
    display: flex;
    margin-bottom: 8rpx;
    align-items: center;
  }
  .label {
    color: #888;
    font-size: 26rpx;
    width: 120rpx;
  }
  .value {
    color: #333;
    font-size: 28rpx;
    flex: 1;
  }
  .empty {
    text-align: center;
    color: #999;
    padding: 80rpx 0;
  }
  .card.full-width {
    width: 100%;
  }
  .upload-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 150rpx;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
    padding: 0 30rpx;
  }
  .upload-text-area {
    flex: 1;
  }
  .upload-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: 500;
  }
  .upload-btn {
    padding: 16rpx 32rpx;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50rpx;
    border: 2rpx solid #fff;
  }
  .btn-text {
    font-size: 26rpx;
    color: #fff;
    font-weight: 500;
  }
}
</style>
