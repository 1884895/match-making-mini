<template>
  <view class="home">
    <FilterSelector
      v-model:selected="selected"
      @change="onFilterChange"
    />
    <!-- 列表主体 -->
    <view class="list">
      <!-- 骨架屏（首次加载） -->
      <view v-if="loading && page === 1" class="skeleton-wrap">
        <view v-for="n in 4" :key="`sk-${n}`" class="card">
          <view class="thumb skeleton" />
          <view class="meta">
            <view class="row"><view class="s-line short" /></view>
            <view class="row"><view class="s-line" /></view>
            <view class="row"><view class="s-line" /></view>
            <view class="row"><view class="s-line long" /></view>
          </view>
        </view>
      </view>

      <!-- 正常数据列表，两列（卡片必须是 .grid 的直接子元素） -->
      <view v-else class="grid">
        <view
          v-for="(item, idx) in filteredList"
          :key="item.id || idx"
          class="card"
          @click="openDetail(item)"
        >
          <image class="thumb" :src="item.image || placeholder" mode="aspectFill" />
          <view class="meta">
            <view class="row"><text class="label">居住地：</text><text class="value">{{ item.location || item.city || '未填写' }}</text></view>
            <view class="row"><text class="label">月收入：</text><text class="value">{{ item.income || '未填写' }}</text></view>
            <view class="row"><text class="label">房子：</text><text class="value">{{ displayFlag(item.house) }}</text></view>
            <view class="row"><text class="label">车子：</text><text class="value">{{ displayFlag(item.car) }}</text></view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="!filteredList.length && !loading" class="empty">暂无匹配内容</view>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="loading && page > 1" class="footer">加载中...</view>
      <view v-else-if="noMore && filteredList.length" class="footer">没有更多了</view>
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
      loading: false,
      refreshing: false,
      allItems: [], // 从 json 加载的全部数据
      list: [], // 当前页面展示的数据（分页）
      page: 1,
      pageSize: 10,
      total: 0,
      noMore: false,
      listHeight: 0,
      placeholder,
    }
  },

  computed: {
    // 根据 selected 对 list 进行简单过滤
    filteredList() {
      return this.list.filter((item) => {
        if (this.selected.area && this.selected.area !== '不限' && item.location !== this.selected.area)
          return false
        if (this.selected.gender && this.selected.gender !== '不限' && item.gender && item.gender !== this.selected.gender)
          return false
        if (this.selected.age && this.selected.age !== '不限' && item.ageRange && item.ageRange !== this.selected.age)
          return false
        if (this.selected.income && this.selected.income !== '不限' && item.income !== this.selected.income) {
          if (!String(item.income).includes(this.selected.income.replace('+', '')))
            return false
        }
        return true
      })
    },
  },

  async onLoad() {
    // 计算列表高度（保持原逻辑）
    uni.getSystemInfo({
      success: (res) => {
        this.listHeight = Math.max((res.windowHeight || 600) - 120, 200)
      },
    })

    // 加载本地数据并分页
    this.loadLocalData()
    this.loadPage(1)
  },

  // 页面下拉/上拉（uni-app 约定）
  onPullDownRefresh() {
    this.refreshing = true
    this.page = 1
    this.loadPage(1)
  },
  onReachBottom() {
    if (this.loading || this.noMore)
      return
    this.page += 1
    this.loadPage(this.page)
  },

  methods: {
    // 筛选条件变化时的处理
    onFilterChange(newSelected) {
      this.selected = { ...newSelected }
      this.applyFilterResetPage()
    },

    applyFilterResetPage() {
      this.page = 1
      this.loadPage(1)
    },

    // 本地 json 加载
    loadLocalData() {
      try {
        const mapped = (localList || []).map(item => ({
          ...item,
          image: item.image || fixedImage,
        }))
        this.allItems = mapped
        this.total = mapped.length
      }
      catch (e) {
        console.error('loadLocalData error', e)
        this.allItems = []
        this.total = 0
      }
    },

    // 分页载入当前 page（本地切片）
    async loadPage(page = 1) {
      this.loading = true
      try {
        const start = (page - 1) * this.pageSize
        const end = start + this.pageSize
        const slice = this.allItems.slice(start, end)

        if (page === 1)
          this.list = slice
        else this.list = this.list.concat(slice)

        this.noMore = this.list.length >= this.total || slice.length < this.pageSize
      }
      catch (err) {
        console.error('loadPage error', err)
        if (page === 1)
          this.list = []
      }
      finally {
        this.loading = false
        if (this.refreshing) {
          uni.stopPullDownRefresh()
          this.refreshing = false
        }
      }
    },

    openDetail(item) {
      const id = item && (item.id || item._id) ? (item.id || item._id) : ''
      uni.navigateTo({ url: `/pages/detail/detail?id=${id}` })
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
}

/* 列表/卡片样式（筛选样式由 FilterSelector 组件内部控制） */
.home .list {
  width: 100%;
  margin-top: 10rpx;
}
.home .grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20rpx;
  padding-bottom: 20rpx;
}
.home .card {
  width: 48%;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 18rpx;
}
.home .thumb {
  width: 100%;
  height: 240rpx;
  background: #eee;
}
.home .meta {
  padding: 18rpx;
}
.home .row {
  display: flex;
  margin-bottom: 8rpx;
  align-items: center;
}
.home .label {
  color: #888;
  font-size: 26rpx;
  width: 120rpx;
}
.home .value {
  color: #333;
  font-size: 28rpx;
  flex: 1;
}
.home .loading,
.home .footer {
  text-align: center;
  color: #999;
  padding: 20rpx 0;
}
.home .skeleton {
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
.home .s-line {
  height: 28rpx;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 6rpx;
  margin: 8rpx 0;
}
.home .s-line.short {
  width: 40%;
  height: 20rpx;
}
.home .s-line.long {
  width: 90%;
}
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
.home .empty {
  text-align: center;
  color: #999;
  padding: 80rpx 0;
}
</style>
