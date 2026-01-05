<template>
  <view class="filter-selector">
    <view class="filter">
      <view class="selection" :class="{ 'selection-active': displaySelected.area !== areas[0] }" @click="openPicker('area')">地区</view>
      <view class="selection" :class="{ 'selection-active': displaySelected.gender !== genders[0] }" @click="openPicker('gender')">性别</view>
      <view class="selection" :class="{ 'selection-active': displaySelected.age !== ages[0] }" @click="openPicker('age')">年龄</view>
      <view class="selection" :class="{ 'selection-active': displaySelected.income !== incomes[0] }" @click="openPicker('income')">收入</view>
    </view>
    <view v-if="showPicker" class="picker-wrap">
      <picker-view
        class="picker-areas"
        :value="values"
        immediate-change="true"
        indicator-class="picker-indicator"
        @change="onChange"
      >
        <!-- 年龄为两列：左侧为起始年龄（含 '不限'），右侧为起始年龄到 80 的区间 -->
        <picker-view-column v-if="activeFilter === 'age'">
          <view v-for="(item, index) in ageLeftOptions" :key="`left-${index}`" class="item" :class="{ 'item-active': index === values[0] }">{{ item }}</view>
        </picker-view-column>
        <picker-view-column v-if="activeFilter === 'age'">
          <view v-for="(item, index) in ageRightOptions" :key="`right-${index}`" class="item" :class="{ 'item-active': index === values[1] }">{{ item }}</view>
        </picker-view-column>

        <!-- 其他维度仍为单列 -->
        <picker-view-column v-else>
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
  </view>
</template>

<script>
export default {
  name: 'FilterSelector',
  props: {
    // 筛选相关（v-model 绑定为选中 label）
    selected: {
      type: Object,
      required: true,
      default: () => ({ area: '不限', gender: '不限', age: '不限', income: '无收入要求' }),
    },

    // 原始 option 字符串
    areas: {
      type: Array,
      default: () => ['不限', '北京', '上海', '广州', '深圳', '杭州', '成都'],
    },
    genders: {
      type: Array,
      default: () => ['不限', '男', '女'],
    },
    ages: {
      type: Array,
      default: () => ['不限', '18-24', '25-30', '31-40', '40+'],
    },
    incomes: {
      type: Array,
      default: () => ['无收入要求', '4000以上', '6000以上', '8000以上', '10000以上', '12000以上', '14000以上', '16000以上', '18000以上', '20000以上', '22000以上', '24000以上', '26000以上', '28000以上', '30000以上'],
    },
  },
  emits: ['update:selected', 'change'],
  data() {
    return {
      showPicker: false,
      values: [0],
      activeFilter: '',
      // 临时选择数据（点击确定时才同步到父组件）
      tempSelected: { area: '不限', gender: '不限', age: '不限', income: '无收入要求' },
    }
  },
  computed: {
    // 生成 options 格式 [{label,value}]
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
    // 年龄左列：包含"不限"然后 20-70
    ageLeftOptions() {
      const arr = ['不限']
      for (let i = 20; i <= 70; i++) arr.push(String(i))
      return arr
    },
    // 年龄右列：基于当前左列选中值动态生成（从 left 到 80），当左列为"不限"返回 ['不限']
    ageRightOptions() {
      const leftIdx = (this.values && this.values[0]) ? this.values[0] : 0
      const leftVal = this.ageLeftOptions[leftIdx]
      if (!leftVal || leftVal === '不限')
        return ['不限']
      const start = Number(leftVal)
      const arr = []
      for (let i = start; i <= 80; i++) arr.push(String(i))
      return arr
    },
    // 当前 picker 要展示的 option 列表，基于 activeFilter
    pickerOptions() {
      if (this.activeFilter === 'area')
        return this.areasOptions
      if (this.activeFilter === 'gender')
        return this.gendersOptions
      if (this.activeFilter === 'age')
        return this.agesOptions // fallback for non-two-column uses
      if (this.activeFilter === 'income')
        return this.incomesOptions
      return this.areasOptions
    },
    // 用于显示的选中值（picker 打开时使用 tempSelected，否则使用 selected）
    displaySelected() {
      return {
        area: this.tempSelected.area !== this.selected.area ? this.tempSelected.area : this.selected.area,
        gender: this.tempSelected.gender !== this.selected.gender ? this.tempSelected.gender : this.selected.gender,
        age: this.tempSelected.age !== this.selected.age ? this.tempSelected.age : this.selected.age,
        income: this.tempSelected.income !== this.selected.income ? this.tempSelected.income : this.selected.income,
      }
    },
    // picker 中显示的结果（严格按 area+gender+age+income 顺序），使用 tempSelected
    pickerParts() {
      const t = this.tempSelected || {}
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
  },
  watch: {
    selected: {
      handler(newVal) {
        // 当外部传入的 selected 变化时，同步到内部 tempSelected
        this.tempSelected = { ...newVal }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    onChange(e) {
      // 选择变化时：更新索引并写入 tempSelected（用于立即更新显示），不立即同步到父组件
      const raw = e.detail.value
      const incoming = Array.isArray(raw) ? raw : [raw]
      const prevVals = (this.values || []).slice()
      this.values = incoming
      if (!this.activeFilter)
        return

      if (this.activeFilter === 'age') {
        // 两列 picker：values = [leftIdx, rightIdx]
        const leftIdx = Number(this.values[0] || 0)
        let rightIdx = Number(this.values[1] || 0)
        const prevLeftIdx = Number(prevVals[0] || 0)
        const prevRightIdx = Number(prevVals[1] || 0)

        // 左侧为"不限"
        if (leftIdx === 0) {
          this.tempSelected.age = '不限'
          // 保证 values 长度为 2，右侧为 0
          this.values = [0, 0]
          return
        }

        const leftVal = Number(this.ageLeftOptions[leftIdx])
        // 生成右侧数组
        const rights = []
        for (let i = leftVal; i <= 80; i++) rights.push(String(i))

        // 如果左侧发生变化，尝试保留之前的右侧数值（如果它仍在新区间内），否则选择 left+10 或最大 80
        if (leftIdx !== prevLeftIdx) {
          // 计算之前的右侧实际年龄值
          let prevRightValNum = null
          if (prevLeftIdx > 0) {
            const prevLeftVal = Number(this.ageLeftOptions[prevLeftIdx])
            prevRightValNum = prevLeftVal + prevRightIdx
          }
          if (prevRightValNum !== null && prevRightValNum >= leftVal && prevRightValNum <= 80) {
            rightIdx = prevRightValNum - leftVal
          }
          else {
            const defaultRight = Math.min(leftVal + 10, 80)
            rightIdx = defaultRight - leftVal
          }
          this.values = [leftIdx, rightIdx]
        }
        else {
          // 一般情况：修正越界
          if (rightIdx < 0 || rightIdx >= rights.length) {
            const defaultRight = Math.min(leftVal + 10, 80)
            rightIdx = defaultRight - leftVal
            this.values = [leftIdx, rightIdx]
          }
        }
        const rightVal = rights[rightIdx]
        this.tempSelected.age = `${leftVal}-${rightVal}`
        return
      }

      // 其他维度为单列
      const opt = (this.pickerOptions || [])[this.values[0]]
      const val = opt ? opt.value : (this.pickerOptions[0] && this.pickerOptions[0].value)
      if (this.activeFilter === 'area')
        this.tempSelected.area = val
      else if (this.activeFilter === 'gender')
        this.tempSelected.gender = val
      else if (this.activeFilter === 'income')
        this.tempSelected.income = val
    },
    // 打开指定维度的 picker，并回显已选项
    openPicker(filter) {
      this.activeFilter = filter
      const current = this.tempSelected[filter]
      if (filter === 'age') {
        // 解析 tempSelected.age，格式如 '20-30' 或 '不限'
        if (!current || current === '不限') {
          this.values = [0, 0]
        }
        else {
          const m = String(current).match(/^(\d+)-(\d+)$/)
          if (m) {
            const left = Number(m[1])
            const right = Number(m[2])
            const leftIdx = Math.max(0, (left - 20) + 1) // +1 因为 0 为 '不限'
            const rightIdx = Math.max(0, right - left)
            // 修正边界
            const leftIdxClamped = Math.min(Math.max(leftIdx, 0), this.ageLeftOptions.length - 1)
            const rights = []
            const leftVal = Number(this.ageLeftOptions[leftIdxClamped] || 20)
            for (let i = leftVal; i <= 80; i++) rights.push(String(i))
            const rightIdxClamped = Math.min(Math.max(rightIdx, 0), rights.length - 1)
            this.values = [leftIdxClamped, rightIdxClamped]
          }
          else {
            this.values = [0, 0]
          }
        }
      }
      else {
        const idx = this.getIndexForFilter(filter, current)
        this.values = [idx]
      }
      this.showPicker = true
    },

    // Reset: 将筛选全部重置为默认并应用，然后关闭 picker
    resetPicker() {
      this.tempSelected = { area: '不限', gender: '不限', age: '不限', income: '无收入要求' }
      this.$emit('update:selected', { ...this.tempSelected })
      this.$emit('change', { ...this.tempSelected })
      this.showPicker = false
      this.activeFilter = ''
    },

    // Confirm: 在点击确定时统一应用筛选并关闭 picker
    confirmPicker() {
      this.$emit('update:selected', { ...this.tempSelected })
      this.$emit('change', { ...this.tempSelected })
      this.showPicker = false
      this.activeFilter = ''
    },

    // 返回指定 filter 对应 options 的索引（label 或 value 均可匹配）
    getIndexForFilter(filter, val) {
      const arr = (filter === 'area' && this.areas) || (filter === 'gender' && this.genders) || (filter === 'age' && this.ages) || (filter === 'income' && this.incomes) || []
      const idx = arr.findIndex(v => v === val)
      return idx >= 0 ? idx : 0
    },
  },
}
</script>

<style lang="scss" scoped>
.filter-selector {
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
</style>
