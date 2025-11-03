<template>
  <view class="score-overview">
    <view class="score-overview__top">
      <view class="tip">
        <view class="tip-line" />
        <text class="tip-txt">
          成绩概览
        </text>
      </view>
      <view v-if="!isAll && comment.content" class="score-overview__teacher" @click="showPopup('comment')">
        <image class="icon" :src="`${examResourceUrl}teacher.png`" />
        <text class="comment">
          教师评价
        </text>
        <u-icon name="arrow-right" size="24rpx" color="#FFB100" />
      </view>
    </view>

    <view class="score-overview__container">
      <view class="score-overview__detail">
        <!-- 分数被屏蔽隐藏 -->
        <view class="score-overview__content">
          <view class="score-overview__ranks star">
            <view class="score-overview__yellow mask-4">
              {{ curExamOverView.score || '' }}<text v-if="show('scoreType') && curExamOverView.score" class="unit">
                分
              </text>
            </view>
            <template v-if="config.scoreType === 3">
              <view v-if="curExamOverView.star > 0" class="star-item">
                <view class="star-item__progress" :style="{ width: `${(curExamOverView.star / 5) * 100}%` }">
                  <view class="bar">
                    <image v-for="index in 5" :key="index" class="star-item__icon" src="../../static/academicReport/star_active.png" />
                  </view>
                </view>
                <image v-for="index in 5" :key="index" class="star-item__icon" src="../../static/academicReport/star.png" />
              </view>
              <image class="question" :src="`${examResourceUrl}single_question.png`" @click="showLevel" />
            </template>
          </view>
          <view class="score-overview__label">
            <view class="title">
              {{ isAll ? '总成绩' : '单科成绩' }}
            </view>
            <view v-if="showCompare && curExamOverView.compare.scoreWave" class="flex-row-center">
              <image :src="examResourceUrl + compareIconMap[curExamOverView.compare.scoreWave]" class="diff" />
              <text v-if="show('scoreType')" class="up" :style="{ color: weakeColor(curExamOverView.compare.scoreWave) }">
                {{ `${curExamOverView.compare.score || ''}分` }}
              </text>
            </view>
          </view>
          <!-- scoreType等于2且为新高考类型显示原始分数 -->
          <view v-if="show('scoreType', 2) && (curExamOverView.mode === 3 || curExamOverView.mode === 4)" class="score-overview__origin">
            {{ `(原始 ${curExamOverView.scoreBeforeGrading}/${curExamOverView.manfenBeforeGrading})` }}
          </view>
        </view>
        <!-- 班级排名被屏蔽隐藏 -->
        <u-line margin="22rpx 0 0 0" length="76rpx" direction="col" color="#FFCB54" dashed />
        <view class="score-overview__content">
          <view class="score-overview__ranks">
            <view class="score-overview__yellow mask-10">
              {{ (curExamOverView.classRank || '') }}<text v-if="curExamOverView.classRank" class="unit">
                {{ rankSuffix[1] }}
              </text>
            </view>
            <image v-if="config.rankType === 4" class="question" :src="`${examResourceUrl}single_question.png`" @click="showPart" />
          </view>
          <view class="score-overview__label">
            <view class="title">
              {{ `班级${rankSuffix[0]}` }}
            </view>
            <view v-if="showCompare && curExamOverView.compare.classRankWave" class="flex-row-center">
              <image :src="examResourceUrl + compareIconMap[curExamOverView.compare.classRankWave]" class="diff" />
              <text v-if="show('rankType')" class="up" :style="{ color: weakeColor(curExamOverView.compare.classRankWave) }">
                {{ (curExamOverView.compare.classRank || '') }}
              </text>
            </view>
          </view>
        </view>
        <!-- 年级排名被屏蔽隐藏 -->
        <u-line margin="22rpx 0 0 0" length="76rpx" direction="col" color="#FFCB54" dashed />
        <view class="score-overview__content">
          <IMask :show="visible">
            <view class="score-overview__ranks">
              <view class="score-overview__yellow mask-10">
                {{ (curExamOverView.gradeRank || '') }}<text v-if="curExamOverView.gradeRank" class="unit">
                  {{ rankSuffix[1] }}
                </text>
              </view>
              <image v-if="config.rankType === 4" class="question" :src="`${examResourceUrl}single_question.png`" @click="showPart" />
            </view>
          </IMask>
          <view class="score-overview__label">
            <view class="title">
              {{ `年级${rankSuffix[0]}` }}
            </view>
            <IMask v-if="showCompare && curExamOverView.compare.gradeRankWave" :show="visible">
              <view class="flex-row-center">
                <image :src="examResourceUrl + compareIconMap[curExamOverView.compare.gradeRankWave]" class="diff" />
                <text v-if="show('rankType')" class="up" :style="{ color: weakeColor(curExamOverView.compare.gradeRankWave) }">
                  {{ (curExamOverView.compare.gradeRank || '') }}
                </text>
              </view>
            </IMask>
          </view>
        </view>
      </view>
      <u-line margin="28rpx 0 24rpx" color="#FFCB54" dashed />
      <!-- 年级最高、平均，班级最高、平均 -->
      <view class="score-overview__scores">
        <view v-for="item in scoreList" :key="item.key" class="container">
          <IMask :show="item.addMask ? visible : true">
            <view class="scores-item star">
              <view class="mask-4">
                {{ curExamOverView[item.key] }}
              </view>
              <view v-if="curExamOverView[item.starKey] > 0 && config.scoreType === 3" class="star-item">
                <view class="star-item__progress" :style="{ width: `${(curExamOverView[item.starKey] / 5) * 100}%` }">
                  <view class="bar">
                    <image v-for="index in 5" :key="index" class="star-item__icon" src="../../static/academicReport/star_active.png" />
                  </view>
                </view>
                <image v-for="index in 5" :key="index" class="star-item__icon" src="../../static/academicReport/star.png" />
              </view>
            </view>
          </IMask>
          <view class="label">
            {{ item.name }}
          </view>
        </view>
      </view>
    </view>
    <u-popup :show="popup.show" mode="center" :safe-area-inset-bottom="true" bg-color="transparent" @close="closePopup">
      <view v-if="popup.type === 'comment'" class="index-popup">
        <view class="index-popup__title">
          教师评价
        </view>
        <scroll-view scroll-y="true" class="index-popup__scroll">
          <view class="comment">
            <view class="comment-info">
              <view class="comment-teacher">
                {{ comment.teacherName }}
              </view>
              <view class="comment-time">
                {{ `评价时间${formatTime(comment.time)}` }}
              </view>
            </view>
            <view class="comment-content">
              {{ comment.content }}
            </view>
          </view>
        </scroll-view>
        <view class="index-popup__btn">
          <view class="btn confirm" @click="closePopup">
            关闭
          </view>
        </view>
      </view>
      <view v-if="popup.type === 'tips'" class="index-popup tips">
        <view class="index-popup__title">
          提示
        </view>
        <view class="index-popup__content">
          <view>{{ popup.title }}</view>
          <view v-if="popup.tips" class="active">
            {{ popup.tips }}
          </view>
        </view>
        <scroll-view class="index-popup__scroll" scroll-y="true">
          <ITable :columns="popup.columns" :data="popup.tableData" />
        </scroll-view>
        <view class="index-popup__btn">
          <view class="btn confirm" @click="closePopup">
            我知道了
          </view>
        </view>
        <view class="index-popup__close" @click="closePopup">
          <u-icon name="close" color="#979797" bold size="28rpx" />
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import IMask from '../../../components/i-mask.vue'
import iTable from '../../../components/i-table.vue'

export default {
  components: { IMask, ITable: iTable },
  props: {
    subjectDetail: {
      type: Object,
      default: () => {},
    },
    examOverview: {
      type: Object,
      default: () => {},
    },
    config: {
      type: Object,
      default: () => {},
    },
    isMock: {
      type: Boolean,
      default: false,
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['subjectExamOverview'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/exam',
      examResourceUrl: 'https://fe-resource.haofenshu.com/exam/images/academicReport/',
      curExamOverView: {}, // 当前考试概览
      comment: {},
      compareIconMap: {
        '-1': 'score_down.png',
        '1': 'score_up.png',
      },
      scoreList: [
        { name: '年级最高', key: 'gradeMax', starKey: 'gradeMaxStar', addMask: false },
        { name: '年级平均', key: 'gradeAvg', starKey: 'gradeAvgStar', addMask: true },
        { name: '班级最高', key: 'classMax', starKey: 'classMaxStar', addMask: false },
        { name: '班级平均', key: 'classAvg', starKey: 'classAvgStar', addMask: true },
      ],
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        type: '',
        title: '',
        tips: '',
        columns: [],
        tableData: [],
      },
    }
  },
  computed: {
    prefix() {
      let prefix = ''
      // #ifdef MP-WEIXIN
      prefix = '/v1/exam-proxy'
      // #endif
      return prefix
    },
    isAll() {
      return this.subjectDetail.paperId === '0'
    },
    showCompare() {
      return this.curExamOverView && this.curExamOverView.compare
    },
    visible() {
      return this.examOverview && this.examOverview.visible === 1
    },
    rankSuffix() {
      // 1：不展示排名 2:排名，3：击败率， 4：等第， 5：排名区间；6：击败率区间
      const defaultRank = ['排名', '名']
      const arr = [defaultRank, defaultRank, ['击败率', ''], ['等第', ''], defaultRank, ['击败率', '']]
      return this.config.rankType ? (arr[this.config.rankType - 1] || defaultRank) : defaultRank
    },
  },
  watch: {
    subjectDetail: {
      handler(val) {
        if (!Object.keys(val).length)
          return
        if (this.isAll) {
          this.curExamOverView = this.examOverview
          this.comment = this.curExamOverView.comment || {}
        }
        else {
          this.curExamOverView = {}
          this.getSingleExamOverview(this.subjectDetail.paperId)
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    formatTime(time) {
      return time ? uni.$u.timeFormat(time, 'yyyy-mm-dd') : ''
    },
    show(key, val) {
      if (!this.visible)
        return false
      if (key)
        return this.config && this.config[key] === (val || 2)
      return true
    },
    async getSingleExamOverview(paperId) {
      let res = {}
      if (this.isMock) {
        const resp = await uni.$u.http.get(`${this.resourceUrl}/mock/paper/overview/${paperId}.json`)
        res = resp.data || {}
      }
      else {
        res = await uni.$http.get(`${this.prefix}/v4/exam/paper/overview?examId=${this.examOverview.examId}&paperId=${paperId}`)
      }
      this.curExamOverView = res.data || {}
      this.curExamOverView.difficulty = this.formateData(this.curExamOverView.difficulty)
      this.curExamOverView.scoreRate = this.formateData(this.curExamOverView.scoreRate * 100, 0)
      this.comment = this.curExamOverView.comment || {}
      this.$emit('subjectExamOverview', this.curExamOverView || {})
    },
    weakeColor(wake) {
      return wake < 0 ? '#E50000' : '#00c81f'
    },
    showLevel() {
      const { scoreLevel = {}, levelConfig } = this.config
      const levels = scoreLevel.levels || levelConfig || []
      const params = {
        title: '应教育政策要求，不显示具体成绩数值，仅显示等级，等级划分的规则如下：',
        tips: '注：实星数量越多代表越优秀',
        columns: [{ name: '等级名称', key: 'name' }, { name: '相对总分比例范围', key: 'range' }],
        tableData: levels.map(({ name, start, end }) => ({ name, range: `${start}%~${end}%` })),
      }
      this.showPopup('tips', params)
    },
    showPart() {
      const params = {
        title: '应教育政策要求，不显示具体排名信息仅显示等第。等第划分规则如下：',
        columns: [{ name: '等第', key: 'name' }, { name: '对应排名(水平前%)', key: 'range' }],
        tableData: [
          { name: 'A1', range: '0~1' },
          { name: 'A2', range: '1~3' },
          { name: 'A3', range: '3~6' },
          { name: 'A4', range: '6~10' },
          { name: 'A5', range: '10~15' },
          { name: 'B1', range: '15~21' },
          { name: 'B2', range: '21~28' },
          { name: 'B3', range: '28~36' },
          { name: 'B4', range: '36~43' },
          { name: 'B5', range: '43~50' },
          { name: 'C1', range: '50~56' },
          { name: 'C2', range: '56~64' },
          { name: 'C3', range: '64~71' },
          { name: 'C4', range: '71~78' },
          { name: 'C5', range: '78~84' },
          { name: 'D1', range: '84~89' },
          { name: 'D2', range: '89~93' },
          { name: 'D3', range: '93~96' },
          { name: 'D4', range: '96~98' },
          { name: 'D5', range: '98~99' },
          { name: 'E', range: '99~100' },
        ],
      }
      this.showPopup('tips', params)
    },
    showPopup(type, params = {}) {
      this.popup = { ...this.popup, show: true, type, ...params }
    },
    closePopup() {
      this.popup.show = false
    },
    formateData(value, n = 2) {
      if (!value)
        return 0
      return value % 1 === 0 ? value : Number(value).toFixed(n)
    },
  },
}
</script>

<style lang="scss" scoped>
.score-overview {
  .star {
    display: flex;
    align-items: baseline;
    &-item {
      position: relative;
      display: flex;
      align-items: center;
      margin-left: 2rpx;
      &__progress {
        width: 0;
        position: absolute;
        top: 0;
        left: 0;
        overflow: hidden;
        z-index: 1;
        background-color: #f6f6f6;
        .bar {
          width: 100rpx;
          display: flex;
          align-items: center;
        }
      }
      &__icon {
        width: 16rpx;
        height: 16rpx;
      }
    }
  }
  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #333;
    margin-bottom: 24rpx;
    .tip {
      display: flex;
      align-items: center;
      &-line {
        width: 8rpx;
        height: 30rpx;
        background: #ffba1d;
        border-radius: 4rpx;
        margin-right: 12rpx;
      }
      &-txt {
        font-size: 30rpx;
      }
    }
  }
  &__teacher {
    display: flex;
    align-items: center;
    justify-content: center;
    .icon {
      width: 32rpx;
      height: 28rpx;
      margin-right: 8rpx;
    }
    .comment {
      font-size: 26rpx;
      color: #ffb100;
      margin-right: 2rpx;
    }
  }
  &__container {
    background: #fff8e8;
    border-radius: 24rpx;
    box-shadow: 0rpx 1rpx 0rpx 0rpx #ffe7b2 inset;
    padding: 20rpx 12rpx 24rpx;
  }
  &__detail {
    display: flex;
    justify-content: space-between;
  }
  &__content {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: flex-start;
    width: calc(100% / 3);
    position: relative;
  }
  &__ranks {
    position: relative;
    margin-bottom: 2rpx;
    .question {
      width: 20rpx;
      height: 20rpx;
      position: absolute;
      top: 6rpx;
      right: -22rpx;
    }
    .star {
      &-item {
        width: 100rpx;
        margin-left: 4rpx;
        &__icon {
          width: 20rpx;
          height: 20rpx;
        }
      }
    }
  }
  &__label {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #939393;
    .title {
      font-size: 26rpx;
      color: #333333;
    }
    .diff {
      width: 16rpx;
      height: 22rpx;
      margin: 0 6rpx;
    }
    .up {
      font-size: 20rpx;
    }
  }
  &__origin {
    width: 100%;
    font-size: 20rpx;
    text-align: center;
    color: #333333;
    margin-bottom: 2rpx;
  }
  &__yellow {
    font-size: 40rpx;
    height: 56rpx;
    color: #ffba1d;
    font-weight: 500;
    .unit {
      font-size: 20rpx;
      color: #333333;
      margin-left: 4rpx;
      font-weight: 400;
    }
  }
  &__middle {
    margin: 28rpx 0 24rpx;
  }
  &__scores {
    display: flex;
    justify-content: space-between;
    font-size: 28rpx;
    text-align: center;
    color: rgba(51, 51, 51, 0.6);
    .label {
      font-size: 22rpx;
      color: rgba(51, 51, 51, 0.6);
    }
    .container {
      width: 25%;
      position: relative;
      ::v-deep .scores-item {
        width: 100%;
        height: 40rpx;
        display: inline-flex;
        justify-content: center;
      }
    }
  }
  .index-popup {
    position: relative;
    width: 600rpx;
    background: #ffffff;
    border-radius: 60rpx;
    padding: 48rpx;
    text-align: center;
    &__title {
      font-size: 38rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 32rpx;
    }
    &__scroll {
      max-height: 450rpx;
      min-height: 300rpx;
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 62rpx;
      text-align: left;
      background: #f8f8f8;
      border-radius: 16rpx;
    }
    &__btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      z-index: 1;
      .btn {
        width: 236rpx;
        height: 72rpx;
        font-size: 34rpx;
        font-weight: 500;
        border-radius: 38rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .confirm {
        color: #ffffff;
        background: linear-gradient(225deg, #ffc749, #ffba1d);
      }
    }
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 252rpx;
      height: 166rpx;
      opacity: 0.08;
      background: #67fffe;
      border-radius: 50%;
      filter: blur(100rpx);
    }
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      width: 302rpx;
      height: 316rpx;
      opacity: 0.1;
      background: #ffba1d;
      border-radius: 50%;
      filter: blur(100rpx);
    }
    .comment {
      padding: 28rpx 30rpx;
      &-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #333333;
      }
      &-teacher {
        font-size: 32rpx;
      }
      &-time {
        font-size: 26rpx;
      }
      &-content {
        margin-top: 24rpx;
        color: #939393;
        line-height: 40rpx;
      }
    }
    &__close {
      position: absolute;
      top: 45rpx;
      right: 35rpx;
      z-index: 1;
    }
    &.tips {
      padding: 62rpx 40rpx 40rpx;
      .index-popup {
        &__title {
          margin-bottom: 22rpx;
        }
        &__content {
          font-size: 26rpx;
          line-height: 36rpx;
          margin-bottom: 24rpx;
          text-align: left;
          .active {
            color: #eeab12;
          }
        }
        &__scroll {
          max-height: 390rpx;
          margin-bottom: 46rpx;
          ::v-deep .table {
            border: none;
            border-radius: 24rpx;
            .tr {
              border: none;
              &:nth-child(2n) {
                background: #ffffff;
              }
              &:nth-child(2n - 1) {
                background: #f8f8f8;
              }
            }
            .th,
            .td {
              height: 60rpx !important;
              border: none !important;
              padding: 0 !important;
              font-size: 26rpx !important;
              color: #939393 !important;
              background: none !important;
            }
            .td {
              font-size: 30rpx !important;
              color: #333333 !important;
            }
          }
        }
        &__btn {
          justify-content: center;
        }
      }
      &::before {
        height: 146rpx;
      }
      &::after {
        height: 276rpx;
      }
    }
  }
  &__hidden {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8rpx;
    backdrop-filter: blur(8rpx);
    z-index: 10;
  }
}
.mask {
  &-4 {
    min-width: 20rpx;
    padding: 0 4rpx;
  }
  &-10 {
    min-width: 40rpx;
    padding: 0 8rpx;
  }
}
@supports not (backdrop-filter: none) {
  .score-overview__hidden {
    background: #e4e4e4;
    filter: blur(10rpx);
  }
}
</style>
