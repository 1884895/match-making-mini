<template>
  <view class="report">
    <view class="report-list">
      <view v-for="(item, index) in list" :key="index" class="report-list__item">
        <image class="item-icon" :src="item.icon" mode="widthFix" />
        <view class="item-content">
          <view class="item-content__value">
            {{ reprotDetail[item.valueKey] }}
            <view v-if="item.sumKey && reprotDetail[item.sumKey]" class="active">
              {{ `/${reprotDetail[item.sumKey]}` }}
            </view>
          </view>
          <view class="item-content__name">{{ item.name }}</view>
        </view>
      </view>
    </view>

    <view class="report-content">
      <view class="report-content__header">
        <view class="line" />
        <view class="name">历次成绩趋势</view>
      </view>
      <view class="report-content__tips">
        本次作业得分 {{ reprotDetail.myScore }} 分，班级排名为 {{ reprotDetail.curRank }}{{ reprotDetail.diffRank ? `，相较上次作业，在班级中${reprotDetail.diffRank > 0 ? '进步' : '退步'}了 ${Math.abs(reprotDetail.diffRank)} 名。` : '。' }}
      </view>
      <view class="report-content__chart">
        <qiun-data-charts
          type="area"
          :canvas2d="true"
          :ontouch="true"
          :in-scroll-view="true"
          :tooltip-show="false"
          :page-scroll-top="scrollTop"
          :opts="areaOpts"
          :chart-data="areaChartData"
          @get-index="showToolTip"
          @complete="mixComplete"
        />
      </view>
    </view>

    <view class="report-content">
      <view class="report-content__header">
        <view class="line" />
        <view class="name">知识点分析</view>
      </view>
      <view v-if="knowledges.length" class="report-content__tips">
        本次作业共考察了 {{ knowledges.length }} 个知识点{{ weakKnowledges.length ? `，其中有 ${weakKnowledges.length} 个知识点是你掌握相对薄弱的，建议后续能有针对性练习。` : '。' }}
      </view>
      <view class="report-content__table report-content__knowledge">
        <view class="tr">
          <view v-for="(item, index) in columns" :key="index" class="th">{{ item.name }}</view>
        </view>
        <template v-if="knowledges.length">
          <view v-for="(item, index) in knowledges" :key="index" class="tr">
            <view v-for="(columnsItem, columnsIndex) in columns" :key="columnsIndex" class="td">
              <view v-if="columnsItem.key === 'qs'" class="qs">
                <text v-for="(qsItem, qsIndex) in item[columnsItem.key]" :key="qsIndex" class="text">
                  {{ qsItem }}
                  <text v-if="qsIndex < item[columnsItem.key].length - 1">、</text>
                </text>
              </view>
              <view
                v-else
                class="text"
                :class="{ red: (columnsItem.key === 'name' || columnsItem.key === 'diffRate') && item.diffRate < 0 }"
              >
                {{ formatValue(item[columnsItem.key], columnsItem.key) }}<text v-if="columnsItem.unit">{{ columnsItem.unit }}</text>
              </view>
            </view>
          </view>
        </template>
        <view v-else class="empty">暂无数据</view>
      </view>
    </view>

    <view v-if="difficultys.length" class="report-content">
      <view class="report-content__header">
        <view class="line" />
        <view class="name">失分情况占比</view>
      </view>
      <view v-if="lostMostItem.name" class="report-content__tips lost">
        通过分析失分情况占比发现你的主要失分点在【{{ lostMostItem.name }}】，可以在错题中查看你失分原因。
      </view>
      <view class="report-content__info">
        <view class="info-chart">
          <qiun-data-charts
            type="ring"
            :canvas2d="true"
            :in-scroll-view="true"
            :page-scroll-top="scrollTop"
            :opts="ringOpts"
            :chart-data="ringChartData"
          />
        </view>
        <view class="report-content__table info-table">
          <view class="tr">
            <view v-for="(item, index) in lostColumns" :key="index" class="th">{{ item.name }}</view>
          </view>
          <view v-for="(item, index) in difficultys" :key="index" class="tr">
            <view v-for="(columnsItem, columnsIndex) in lostColumns" :key="columnsIndex" class="td">
              <view v-if="columnsItem.key === 'qs'" class="qs">
                <text v-for="(qsItem, qsIndex) in item[columnsItem.key]" :key="qsIndex" class="text">
                  {{ qsItem }}
                  <text v-if="qsIndex < item[columnsItem.key].length - 1">、</text>
                </text>
              </view>
              <view v-else class="text">
                {{ item[columnsItem.key] }}<text v-if="columnsItem.unit">{{ columnsItem.unit }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import dayjs from 'dayjs'

// 静态资源
import reportMyScore from '../static/report_my_score.png'
import reportClassScore from '../static/report_class_score.png'
import reportClassRank from '../static/report_class_rank.png'
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js'

// Props
const props = withDefaults(defineProps<{
  scrollTop: number
  reprotDetail: any
}>(), {
  scrollTop: 0,
  reprotDetail: () => ({}),
})

// 配置数据
const list = [
  { name: '我的得分', valueKey: 'myScore', sumKey: 'manfen', icon: reportMyScore },
  { name: '班级均分', valueKey: 'classAvg', sumKey: '', icon: reportClassScore },
  { name: '班级排名', valueKey: 'curRank', sumKey: 'classNum', icon: reportClassRank },
]

const columns = [
  { name: '知识点', key: 'name', unit: '' },
  { name: '得分率', key: 'myScoreRate', unit: '%' },
  { name: '班级得分率', key: 'classScoreRate', unit: '%' },
  { name: '得分率差值', key: 'diffRate', unit: '%' },
  { name: '对应题号', key: 'qs', unit: '' },
]

const lostColumns = [
  { name: '难度', key: 'name', unit: '' },
  { name: '失分率', key: 'lossRate', unit: '%' },
  { name: '对应题号', key: 'qs', unit: '' },
]

// 图表配置
const areaOpts = {
  padding: [10, 0, 10, 0],
  color: ['#FFA800'],
  fontSize: 14,
  fontColor: '#939393',
  enableScroll: true,
  dataLabel: false,
  dataPointShape: false,
  xAxis: {
    axisLineColor: '#E6E6E6',
    fontColor: '#939393',
    fontSize: 14,
    itemCount: 6,
    scrollAlign: 'right',
    marginTop: 14,
  },
  yAxis: {
    showTitle: false,
    gridType: 'dash',
    gridColor: '#E6E6E6',
    dashLength: 6,
    data: [
      {
        axisLine: false,
        format: 'yAxisFixed',
      },
    ],
  },
  legend: {
    show: false,
  },
  extra: {
    area: {
      type: 'curve',
      gradient: true,
    },
    tooltip: {
      showBox: true,
      gridType: 'dash',
      gridColor: '#FFA800',
      legendShow: false,
      borderRadius: 4,
      fontSize: 14,
      boxPadding: 7,
      lineHeight: 20,
    },
  },
}

const ringOpts = {
  padding: [10, 0, 10, 0],
  fontSize: 14,
  fontColor: '#333',
  color: ['#00A5FF', '#FFA800', '#92CB74', '#FAC858', '#EE6666'],
  legend: {
    show: false,
  },
  title: { name: '' },
  subtitle: { name: '' },
  extra: {
    ring: {
      ringWidth: 40,
      offsetAngle: -90,
    },
    tooltip: {
      showBox: false,
      legendShow: false,
    },
  },
}

// 状态定义
const currentIndex = ref(0)

// 计算属性
const scrollTop = computed(() => props.scrollTop || 0)
const reprotDetail = computed(() => props.reprotDetail || {})
const knowledges = computed(() => reprotDetail.value.knowledges || [])
const weakKnowledges = computed(() => knowledges.value.filter((item: any) => item.diffRate < 0) || [])
const papers = computed(() => reprotDetail.value.papers ? [...reprotDetail.value.papers].reverse() : [])
const paperItem = computed(() => papers.value[currentIndex.value] || {})

const areaChartData = computed(() => {
  return {
    categories: papers.value.map((item: any) => dayjs(item.time).format('YYYY/MM/DD')),
    series: [
      { name: '', data: papers.value.map((item: any) => item.score) },
    ],
  }
})

const difficultys = computed(() =>
  reprotDetail.value.difficultys?.map((item: any) => ({ ...item, name: `${item.name}题` })) || [],
)

const lostMostItem = computed(() => {
  return difficultys.value.reduce((prev: any, curr: any) => {
    return (curr.lossRate || 0) > (prev.lossRate || 0) ? curr : prev
  }, {})
})

const ringChartData = computed(() => {
  return {
    series: [
      {
        data: difficultys.value.map((item: any) => {
          return { ...item, value: item.lossRate || 0, labelText: `${`${item.name} ${item.lossRate}`}%` }
        }),
      },
    ],
  }
})

// 格式化数值显示
function formatValue(value: any, key: string): string {
  // 如果是得分率差值，需要格式化小数
  if (key === 'diffRate' && typeof value === 'number') {
    // 四舍五入到两位小数
    const rounded = Math.round(value * 100) / 100
    
    // 如果是整数，直接返回
    if (rounded % 1 === 0) {
      return rounded.toString()
    }
    
    // 格式化为最多两位小数，去除末尾的0
    return Number.parseFloat(rounded.toFixed(2)).toString()
  }
  
  // 其他情况直接返回原值
  return value?.toString() || ''
}

// 方法
function mixComplete(e: any) {
  const index = papers.value.length - 1
  const calPoints = e.opts.chartData.calPoints[0] || []
  e.currentIndex = { index }
  e.event = calPoints[e.currentIndex.index]
  showToolTip(e)
}
function showToolTip(e: any) {
  // #ifdef MP-WEIXIN
  e.event.y -= scrollTop.value
  // #endif
  const textList = []
  const index = e.currentIndex.index
  if (index > -1) {
    currentIndex.value = index
    const { score, time } = paperItem.value
    textList.push(...[
      {
        text: `${dayjs(time).format('YYYY/MM/DD')}`,
      },
      {
        text: `得分：${score}`,
      },
    ])
  }
  uCharts.instance[e.id].showToolTip(
    { changedTouches: [e.event] },
    { index, textList },
  )
}
</script>

<style lang="scss" scoped>
@import '../styles/common.scss';
@import '../styles/variables.scss';

.report {
  padding: $spacing-base;
  padding-bottom: calc(#{$spacing-xl} + constant(safe-area-inset-bottom));
  padding-bottom: calc(#{$spacing-xl} + env(safe-area-inset-bottom));
  background-color: $bg-secondary;
  min-height: 100vh;

  &-list {
    display: flex;
    flex-direction: row;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;

    &__item {
      flex: 1;
      padding: $spacing-sm;
      background-color: $bg-primary;
      border-radius: $radius-base;
      box-shadow: $shadow-sm;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .item-icon {
        width: 80rpx;
        height: 80rpx;
        margin-bottom: $spacing-xs;
        flex-shrink: 0;
      }

      .item-content {
        width: 100%;

        &__value {
          display: flex;
          align-items: baseline;
          justify-content: center;
          font-size: $font-size-xl;
          font-weight: bold;
          color: $text-primary;
          line-height: 1.2;
          margin-bottom: $spacing-xs;

          .active {
            font-size: $font-size-sm;
            color: $text-secondary;
            font-weight: 400;
            margin-left: $spacing-xs;
          }
        }

        &__name {
          font-size: $font-size-sm;
          color: $text-secondary;
        }
      }
    }
  }

  &-content {
    background-color: $bg-primary;
    border-radius: $radius-lg;
    margin-bottom: $spacing-lg;
    padding: $spacing-md;
    box-shadow: $shadow-sm;

    &:last-child {
      margin-bottom: 0;
    }

    &__header {
      display: flex;
      align-items: center;
      margin-bottom: $spacing-base;

      .line {
        width: 8rpx;
        height: 32rpx;
        background-color: $primary-color;
        border-radius: $radius-sm;
        margin-right: $spacing-sm;
      }

      .name {
        font-size: $font-size-lg;
        font-weight: bold;
        color: $text-primary;
      }
    }

    &__tips {
      background-color: rgba($primary-color, 0.05);
      border: 2rpx solid rgba($primary-color, 0.3);
      border-radius: $radius-base;
      padding: $spacing-base;
      font-size: $font-size-sm;
      margin-bottom: $spacing-md;
      line-height: 1.5;
      color: $text-primary;

      &.lost {
        margin-bottom: $spacing-base;
      }
    }

    &__chart {
      height: 500rpx;
      margin: $spacing-base 0;
    }

    &__table {
      border: 2rpx solid $border-color;
      border-radius: $radius-base;
      overflow: hidden;
      font-size: $font-size-xs;

      .tr {
        display: flex;

        &:nth-child(2n) {
          background-color: $bg-primary;
        }

        &:nth-child(2n - 1) {
          background-color: $bg-secondary;
        }
      }

      .th,
      .td {
        flex: 1;
        @include flex-center;
        min-height: 80rpx;
        padding: $spacing-sm;
        border-right: 2rpx solid $border-color;
        border-bottom: 2rpx solid $border-color;
        overflow: hidden;

        &:last-child {
          border-right: none;
        }

        .text {
          @include text-ellipsis;
          width: 100%;
          text-align: center;

          &.red {
            color: $danger-color;
          }
        }
      }

      .th {
        font-size: $font-size-xs;
        color: $text-secondary;
        font-weight: 500;
        background-color: $bg-secondary;
      }

      .td {
        font-size: $font-size-xs;
        color: $text-primary;
      }

      .empty {
        text-align: center;
        font-size: $font-size-sm;
        color: $text-secondary;
        padding: $spacing-lg 0;
      }
    }

    &__knowledge {
      // 移动端表格滚动
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      
      .tr {
        min-width: 700rpx;
      }

      .th,
      .td {
        &:first-child {
          flex: 2;
          justify-content: flex-start;
          padding-left: $spacing-base;
          position: sticky;
          left: 0;
          background-color: inherit;
        }

        &:nth-child(2),
        &:nth-child(3),
        &:nth-child(4) {
          flex: 1;
          min-width: 120rpx;
        }

        &:last-child {
          flex: 1.5;
          min-width: 150rpx;
        }
      }
      
      .qs {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: $spacing-xs;
        
        .text {
          font-size: $font-size-xs;
        }
      }
    }

    &__info {
      display: flex;
      flex-direction: column;
      gap: $spacing-base;

      .info-chart {
        width: 100%;
        height: 400rpx;
      }

      .info-table {
        width: 100%;
        
        .tr {
          min-width: auto;
        }

        .th,
        .td {
          &:first-child {
            flex: 1.5;
          }
          
          &:nth-child(2) {
            flex: 1;
          }
          
          &:last-child {
            flex: 2;
          }
        }
      }
    }
  }
}
</style>
