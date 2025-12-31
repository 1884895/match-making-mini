<template>
  <view class="home">
    <view class="filter">
      <view class="selection" :class="{ 'selection-active': selected.area !== areas[0] }" @click="openPicker('area')">地区</view>
      <view class="selection" :class="{ 'selection-active': selected.gender !== genders[0] }" @click="openPicker('gender')">性别</view>
      <view class="selection" :class="{ 'selection-active': selected.age !== ages[0] }" @click="openPicker('age')">年龄</view>
      <view class="selection" :class="{ 'selection-active': selected.income !== incomes[0] }" @click="openPicker('income')">收入</view>
    </view>
    <view v-if="showPicker" class="picker-wrap">
      <picker-view
        class="picker-areas"
        :value="values"
        immediate-change="true"
        indicator-class="picker-indicator"
        @change="onChange"
      >
        <picker-view-column>
          <view v-for="(item, index) in pickerOptions" :key="index" class="item" :class="{ 'item-active': index === values[0] }">{{ item.label }}</view>
        </picker-view-column>
      </picker-view>
      <view class="picker-divider" />
      <view class="picker-result">
        ❤️ 筛选内容：
        <block v-if="pickerParts.length">
          <view v-for="(p, i) in pickerParts" :key="i" class="picker-chip">{{ p }}</view>
        </block>
        <text v-else class="picker-empty">未选择</text>
      </view>
      <view class="picker-divider" />
      <view class="picker-btn">
        <view class="picker-btn-item" @click="resetPicker">重置</view>
        <view class="picker-btn-item picker-btn-confirm" @click="confirmPicker">确定</view>
      </view>
    </view>
    <!-- 列表主体 -->
    <view v-if="false" class="list">
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

const fixedImage = 'https://img.iplaysoft.com/wp-content/uploads/2019/free-images/free_stock_photo.jpg'
const placeholder = fixedImage

export default {
  data() {
    return {
      showPicker: false,
      values: [0],
      activeFilter: '',
      // 筛选相关（v-model 绑定为选中 label）
      selected: { area: '不限', gender: '不限', age: '不限', income: '不限' },

      // 原始 option 字符串（也可直接定义为对象数组）
      areas: ['不限', '北京', '上海', '广州', '深圳', '杭州', '成都'],
      genders: ['不限', '男', '女'],
      ages: ['不限', '18-24', '25-30', '31-40', '40+'],
      incomes: ['不限', '1k-5k', '5k-10k', '10k-20k', '20k+'],

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
    // 生成 u-dropdown 需要的 options 格式 [{label,value}]
    areasOptions() {
      return this.areas.map(v => ({ label: v, value: v }))
    },
    gendersOptions() {
      return this.genders.map(v => ({ label: v, value: v }))
    },
    agesOptions() {
      return this.ages.map(v => ({ label: v, value: v }))
    },
    incomesOptions() {
      return this.incomes.map(v => ({ label: v, value: v }))
    },
    // 当前 picker 要展示的 option 列表，基于 activeFilter
    pickerOptions() {
      if (this.activeFilter === 'area')
        return this.areasOptions
      if (this.activeFilter === 'gender')
        return this.gendersOptions
      if (this.activeFilter === 'age')
        return this.agesOptions
      if (this.activeFilter === 'income')
        return this.incomesOptions
      return this.areasOptions
    },
    pickerTitle() {
      if (this.activeFilter === 'area')
        return '选择地区'
      if (this.activeFilter === 'gender')
        return '选择性别'
      if (this.activeFilter === 'age')
        return '选择年龄'
      if (this.activeFilter === 'income')
        return '选择收入'
      return ''
    },
    // picker 中显示的结果（严格按 area+gender+age+income 顺序），直接使用 selected
    pickerResult() {
      const t = this.selected || {}
      const parts = []
      if (t.area && t.area !== this.areas[0])
        parts.push(t.area)
      if (t.gender && t.gender !== this.genders[0])
        parts.push(t.gender)
      if (t.age && t.age !== this.ages[0])
        parts.push(t.age)
      if (t.income && t.income !== this.incomes[0])
        parts.push(t.income)
      return parts.join('')
    },
    // 返回单独的 picker 部分数组，便于渲染为 chip（直接使用 selected）
    pickerParts() {
      const t = this.selected || {}
      const parts = []
      if (t.area && t.area !== this.areas[0])
        parts.push(t.area)
      if (t.gender && t.gender !== this.genders[0])
        parts.push(t.gender)
      if (t.age && t.age !== this.ages[0])
        parts.push(t.age)
      if (t.income && t.income !== this.incomes[0])
        parts.push(t.income)
      return parts
    },

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

    onChange(e) {
      // 选择变化时：更新索引并立即写入 selected（即时应用筛选，不关闭 picker）
      this.values = e.detail.value
      if (!this.activeFilter)
        return
      const opt = (this.pickerOptions || [])[this.values[0]]
      const val = opt ? opt.value : (this.pickerOptions[0] && this.pickerOptions[0].value)
      if (this.activeFilter === 'area')
        this.selected.area = val
      else if (this.activeFilter === 'gender')
        this.selected.gender = val
      else if (this.activeFilter === 'age')
        this.selected.age = val
      else if (this.activeFilter === 'income')
        this.selected.income = val
    },
    // 打开指定维度的 picker，并回显已选项（直接使用 selected）
    openPicker(filter) {
      this.activeFilter = filter
      const current = this.selected[filter]
      const idx = this.getIndexForFilter(filter, current)
      this.values = [idx]
      this.showPicker = true
    },

    // Reset: 将筛选全部重置为默认并应用，然后关闭 picker
    resetPicker() {
      this.selected = { area: '不限', gender: '不限', age: '不限', income: '不限' }
      this.applyFilterResetPage()
      this.showPicker = false
      this.activeFilter = ''
    },

    // Confirm: 在点击确定时统一应用筛选并关闭 picker
    confirmPicker() {
      this.applyFilterResetPage()
      this.showPicker = false
      this.activeFilter = ''
    },
    // （取消/确认逻辑已移除，选择会在 onChange 时立即提交）
    open() {
      // 展开某个下来菜单时，先关闭原来的其他菜单的高亮
      // 同时内部会自动给当前展开项进行高亮
      this.$refs.uDropdownRef.highlight()
    },
    close(index) {
      // 关闭的时候，给当前项加上高亮
      // 当然，您也可以通过监听dropdown-item的@change事件进行处理
      this.$refs.uDropdownRef.highlight(index)
    },
    // 替代 watch：up-dropdown-item 的 change 事件处理
    onFilterChange(key, payload) {
      const val = (payload && payload.value !== undefined) ? payload.value : payload
      this.selected[key] = val === undefined ? '' : val
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

    // 返回指定 filter 对应 options 的索引（label 或 value 均可匹配）
    getIndexForFilter(filter, val) {
      const arr = (filter === 'area' && this.areas) || (filter === 'gender' && this.genders) || (filter === 'age' && this.ages) || (filter === 'income' && this.incomes) || []
      const idx = arr.findIndex(v => v === val)
      return idx >= 0 ? idx : 0
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
  .filter {
    background: linear-gradient(90deg, #fff0f2, #fff6f8);
    display: flex;
    align-items: center;
    padding: 6rpx;
    .selection {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      height: 84rpx;
      line-height: 84rpx;
      text-align: center;
      font-size: 28rpx;
      color: #333; /* 默认文字颜色 */
      font-weight: bold;
    }
    /* 激活状态仅修改文字颜色 */
    .selection-active {
      color: #ab5151;
    }
  }
  .picker-areas {
    width: 100%;
    background-color: transparent;
    height: 400rpx;
    .item {
      font-size: 24rpx;
      line-height: 64rpx;
      color: #333; /* 默认文字颜色 */
      text-align: center;
      transition:
        transform 0.18s ease,
        color 0.18s ease,
        font-size 0.18s ease;
      &-active {
        color: #ff4d4f; /* 选中为红色 */
        font-size: 28rpx;
        font-weight: bold;
        transform: scale(1.06);
        text-shadow: 0 1rpx 0 rgba(0, 0, 0, 0.04);
      }
    }
  }
  .picker-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    background: #fff; /* 白色背景 */
    border: 1rpx solid #eee; /* 浅灰边框 */
    border-bottom-left-radius: 24rpx; /* 更大底部圆角 */
    border-bottom-right-radius: 24rpx; /* 更大底部圆角 */
    padding-bottom: 12rpx;
    .picker-result {
      padding: 12rpx 16rpx;
      font-size: 26rpx;
      color: #9b3040;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.6),
        rgba(255, 255, 255, 0.3)
      );
      border-bottom: 1rpx solid rgba(212, 175, 55, 0.06);
      font-weight: 600;
    }
    .picker-chip {
      display: inline-block;
      background: #fff; /* 白色背景 */
      border: 1rpx solid #ff4d4f; /* 红色描边 */
      color: #ff4d4f; /* 红色字体 */
      padding: 6rpx 12rpx;
      border-radius: 8rpx;
      margin-left: 10rpx;
      font-size: 24rpx;
      box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.06);
    }
    .picker-empty {
      color: #999;
      margin-left: 8rpx;
      font-size: 24rpx;
    }
    .picker-divider {
      height: 1rpx;
      background: rgba(0, 0, 0, 0.06);
      width: 100%;
    }
    .picker-btn {
      display: flex;
      justify-content: flex-end; /* 右对齐 */
      padding: 12rpx;
      background: transparent;
      gap: 12rpx;
      align-items: center;
    }
    .picker-btn-item {
      flex: none; /* 不拉伸，按内容宽度 */
      display: inline-block;
      text-align: center;
      padding: 10rpx 20rpx; /* 调整为左右内边距，使按钮更紧凑 */
      background: #fff0f3;
      border-radius: 8rpx;
      color: #9b3040;
      font-size: 26rpx;
      border: 1rpx solid rgba(212, 175, 55, 0.06);
      box-shadow: 0 4rpx 12rpx rgba(155, 48, 64, 0.06);
      min-width: 120rpx; /* 确保按钮有合理最小宽度 */
    }
    .picker-btn-confirm {
      background: linear-gradient(90deg, #ff6b81, #ff4d6d);
      color: #fff;
      border: 1rpx solid rgba(212, 175, 55, 0.12);
      box-shadow: 0 6rpx 18rpx rgba(255, 77, 109, 0.12);
    }
  }
  .picker-indicator {
    height: 60rpx;
    border-top: 1rpx solid rgba(212, 175, 55, 0.12);
    border-bottom: 1rpx solid rgba(212, 175, 55, 0.12);
  }
}

/* 列表/卡片样式（筛选样式由 up-dropdown 自带样式控制） */
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
