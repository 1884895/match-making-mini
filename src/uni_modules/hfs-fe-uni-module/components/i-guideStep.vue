<template>
  <view v-if="showGuide" class="guide" @touchmove.stop.prevent>
    <view :style="guideStyle" class="guide-box">
      <slot :props="guideInfo" :index="index">
        <view class="tips guide-step-tips" :style="tipPosition">
          <view class="text">
            {{ guideInfo.tips }}
          </view>
          <view class="tool-btn">
            <text @click="skip">
              跳过
            </text>
            <view class="next" style="" @click="next">
              {{ guideInfo.next }}
            </view>
          </view>
        </view>
        <view class="arrow" :style="arrowTop" />
      </slot>
    </view>
    <!-- 遮罩层，防止点击 -->
    <view class="v-model" @click="next" />
  </view>
</template>

<script>
export default {
  name: 'IGuideStep',
  props: {
    step: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  emits: ['done'],
  data() {
    return {
      stepName: 'step', // 该提示步骤的名称，用于不在重复展示
      guideList: [{
        el: '',
        tips: '',
        next: '',
        style: '',
      }],
      repeat: false, // 是否重复展示
      index: 0, // 当前展示的索引
      showGuide: true, // 是否显示引导
      guideStyle: '', // 默认样式
      arrowTop: '', // 步骤提示三角形的定位
      tipPosition: '', // 步骤提示的定位
      systemInfo: '', // 屏幕宽度高度等信息
      tipWidth: 200, // 步骤提示默认的宽度
    }
  },
  computed: {
    guideInfo() {
      return this.guideList[this.index]
    },
  },
  mounted() {
    this.guideList = this.step.guideList
    this.stepName = this.step.name
    // 判断对象是否有repeat这个属性
    if (Object.prototype.hasOwnProperty.call(this.step, 'repeat')) {
      this.repeat = this.step.repeat
    }
    const systemInfo = uni.getSystemInfoSync()
    this.systemInfo = systemInfo
    const guide = uni.getStorageSync(this.stepName)
    if (!guide || this.repeat) {
      this.getDomInfo()
    }
    else {
      this.showGuide = false
    }
  },
  methods: {
    // 展示新手提示
    viewTips(data, scrollTop, fixed) {
      if (data) {
        const { windowWidth, windowHeight, statusBarHeight } = this.systemInfo
        // 如果dom宽度大于或者等于窗口宽度,需要重新调整dom展示宽度
        const newWidth = windowWidth - 20
        if (data.width >= newWidth) {
          data.width = newWidth
        }
        // 如果距离左边为0,自动增加一点左边距
        if (data.left === 0) {
          data.left = 10
        }
        const domRW = windowWidth - data.left
        let left = 0
        // 如果dom距离右边没有tips的宽度大的话,就要让tips向左便宜
        if (domRW < this.tipWidth) {
          left = domRW - this.tipWidth - 30
        }
        const index = this.index
        // 步骤条展示的高度需要加上屏幕滚动的高度
        data.top += scrollTop
        // 根据实际情况需要滚动到展示区域 固定定位不需要滚动
        !fixed && uni.pageScrollTo({
          scrollTop: Math.max(data.top - (44 + statusBarHeight), 0),
          duration: 100,
        })
        const obj = Object.assign(this.guideList[index], data)
        // 设置三角形高度
        const arrowTop = data.height + 9
        // 如果dom在屏幕底部的话，重新调整提示框和三角形的定位
        const newHeight = windowHeight - data.bottom
        const query = uni.createSelectorQuery().in(this)
        this.$nextTick(function () {
          query.select('.tips').boundingClientRect()
          query.selectViewport().scrollOffset()
          // eslint-disable-next-line ts/no-this-alias
          const _this = this
          query.exec((res) => {
            const data = res[0] || {}
            let dh = 0
            if (Object.prototype.hasOwnProperty.call(data, 'height')) {
              dh = data.height
            }
            if (newHeight > (dh + 5)) {
              _this.arrowTop = `top:${arrowTop}px;`
              // 设置提示框定位
              _this.tipPosition = `top:${arrowTop + 5}px;left:${left}px;`
            }
            else {
              _this.arrowTop = 'top: -19px;'
              // 设置提示框定位
              _this.tipPosition = `top: -14px;left:${left}px;`
            }
          })
        })
        // 重新设置guideList的值
        this.guideList.splice(index, 1, obj)
        this.guideStyle = this.getStyle()
      }
      else {
        this.index += 1
        this.getDomInfo()
      }
    },
    // 获取步骤提示的主要样式
    getStyle() {
      const { width, height, left, top, padding = 0, style = '' } = this.guideInfo
      return `width: ${width + padding * 2}px;height: ${height + padding * 2}px;left: ${left - padding}px;top: ${top - padding}px;${style}`
    },
    // 获取dom信息
    getDomInfo() {
      const { el, ref, fixed } = this.guideInfo
      const component = this.$root.$refs[ref] || this.$root
      const query = uni.createSelectorQuery().in(component)
      this.$nextTick(() => {
        query.select(el).boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec((res) => {
          const data = res[0] // #the-id节点的上边界坐标
          const scrollTop = res[1].scrollTop // 显示区域的竖直滚动位置
          this.viewTips(data, scrollTop, fixed)
        })
      })
    },
    // 跳过新手提示
    skip() {
      this.showGuide = false
      uni.setStorageSync(this.stepName, 'true')
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 100,
      })
      this.$emit('done')
    },
    // 下一步
    next() {
      if (this.index === this.guideList.length - 1) {
        this.showGuide = false
        uni.setStorageSync(this.stepName, 'true')
        uni.pageScrollTo({
          scrollTop: 0,
          duration: 100,
        })
        this.$emit('done')
      }
      else {
        this.index += 1
        this.getDomInfo()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.v-model {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.guide {
  z-index: 1001;

  .guide-box {
    position: absolute;
    z-index: 10001;
    transition: all 0.2s;
    border-radius: 8rpx;
    margin: 0;
    box-shadow:
      rgba(0, 0, 0, 0.7) 0 0 0 0,
      rgba(0, 0, 0, 0.7) 0 0 0 5000rpx;

    .arrow {
      height: 20rpx;
      width: 20rpx;
      background: #1cbbb4;
      position: absolute;
      top: 144rpx;
      left: 45%;
      transform: rotate(45deg);
    }

    .tips {
      width: 400rpx;
      background: linear-gradient(180deg, #1cbbb4, #0081ff);
      box-shadow: 0px 2px 9px 0px rgba(0, 0, 0, 0.1);
      color: #fff;
      position: absolute;
      top: 152rpx;
      left: -50%;
      padding: 15rpx 20rpx;
      font-size: 28rpx;
      border-radius: 12rpx;

      .text {
      }

      .tool-btn {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 0rpx;
        margin-top: 20rpx;

        .next {
          background: #fff;
          height: 48rpx;
          width: 100rpx;
          text-align: center;
          border-radius: 8rpx;
          color: #666;
          line-height: 48rpx;
          font-size: 24rpx;
        }
      }
    }
  }
}
</style>
