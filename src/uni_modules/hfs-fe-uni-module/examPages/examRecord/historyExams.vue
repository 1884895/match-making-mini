<template>
  <view class="histories">
    <view class="histories-header">
      <view class="option" @click="selectGrade()">
        <view>{{ grade }}</view>
        <image
          class="down-arrow"
          mode="heightFix"
          :src="`${resourceUrl}icon_arrow_down.png`"
        />
      </view>
    </view>
    <view class="histories-content">
      <ExamList ref="examList" :list="examList" :user-info="userInfo" :config="config" :check-length="checkLength" msg="已选择了两场考试">
        <template v-if="checkLength !== 0" #default="slotProps">
          <view class="footer">
            <view v-if="slotProps.data && slotProps.data.length > 0" class="exams">
              <view class="exams-tip">
                已选
              </view>
              <view class="exams-list">
                <view v-for="(item, index) in slotProps.data" :key="index" class="item">
                  <view class="detial one-txt-cut">
                    {{ $u.timeFormat(item.eventTime, 'yyyy-mm-dd') }}{{ item.grade }}{{ `${item.type}考试` }}
                  </view>
                  <u-icon name="close" size="28rpx" color="#333333" @click="deletedExam(item)" />
                </view>
              </view>
            </view>
            <view class="pk">
              <view class="btn cancel" @click="toCheck()">
                取消
              </view>
              <view class="btn begin" @click="toPk()">
                开始pk
                <image
                  class="notice"
                  :src="`${resourceUrl}icon_num_notice_pk.png`"
                />
              </view>
            </view>
          </view>
        </template>
      </ExamList>
    </view>
    <view v-if="showNoVip" class="no-bottom">
      <view class="no-bottom__operate" @click="jumpVip">
        <image class="icon" src="../static/academicReport/unlock.png" />
        <text class="text">
          开通会员解锁全部考试
        </text>
      </view>
      <view class="no-bottom__time">
        <image class="icon" src="../static/examRecord/time.png" />
        <text class="text">
          非会员用户只保存120天考试数据
        </text>
      </view>
    </view>
    <image
      v-if="checkLength === 0"
      class="fuc-pk"
      mode="widthFix"
      :src="`${resourceUrl}icon_exam_fuc_pk.png`"
      @click="toCheck()"
    />
    <u-popup :show="popup.show" mode="bottom" bg-color="white" :round="12" :safe-area-inset-bottom="true" @close="popup.show = false">
      <view class="pop">
        <view class="pop-title">
          选择年级
        </view>
        <view class="pop-line" />
        <view class="pop-list">
          <view v-for="(item, index) in gradeList" :key="index" class="pop-list__item" :class="{ active: grade === item }" @click="gradeClick(item)">
            {{ item }}
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import examList from './components/examList.vue'
import record from './record.js'
import { isHFSApp, nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { ExamList: examList },
  mixins: [record],
  data() {
    return {
      checkLength: 0,
      examList: [],
      grade: '',
      gradeList: [],
      popup: {
        show: false,
      },
      resourceUrl: 'https://fe-resource.haofenshu.com/exam/images/examHistroy/',
      back: 0,
      eventChannel: null,
    }
  },
  computed: {
    showNoVip() {
      return this.checkLength === 0 && !this.authority && this.showVip && this.config.parentPay === 2
    },
    authority() {
      const { examMemberType = 0 } = this.userInfo || {}
      return this.isMember || examMemberType > 0
    },
  },
  onReachBottom() {
    uni.$emit('loadMore')
  },
  async onLoad(options) {
    const { mode = 0, back = false } = options
    mode && this.toCheck()
    this.back = back
    await this.initPage()
    this.eventChannel = this.getOpenerEventChannel()
    this.eventChannel.on('checkExams', (data) => {
      this.$refs.examList.checkItems = data.exams || []
    })
  },

  methods: {
    jumpVip() {
      // #ifdef H5
      if (isHFSApp()) {
        return nativeBridge.callHandler('adJump', JSON.stringify({ mode: 2, target: 8, eventId: 'ks_ksda_lcks_kthy_pay', data: { eventId: 'ks_ksda_lcks_kthy_pay' } }))
      }
      // #endif
      return uni.navigateTo({ url: '/pages/me/member' })
    },
    deletedExam(item) {
      this.$refs.examList.check(item)
    },
    async initPage() {
      await this.getExamArchives()
      this.$refs.examList.init()
    },
    selectGrade() {
      this.popup.show = true
    },
    toPk() {
      const exams = this.$refs.examList.checkItems || []
      if (exams.length < 1) {
        uni.showToast({
          title: '请选择两场考试开始pk',
          icon: 'none',
        })
        return
      };
      const examIds = exams.map(item => item.examId)
      if (this.back) {
        this.eventChannel.emit('toPkExam', { examIds })
        uni.navigateBack()
      }
      else {
        uni.navigateTo({
          url: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/examPk?back=1',
          events: {
            checkExams: (data) => {
              this.$refs.examList.checkItems = data.exams || []
            },
          },
          success: (res) => {
            res.eventChannel.emit('examIds', { examIds })
          },
        })
      }
    },
    toCheck() {
      this.checkLength = Math.abs(this.checkLength - 2)
    },
    gradeClick(item) {
      this.grade = item
      this.popup.show = false
      this.initPage()
    },
    async getExamArchives() {
      const res = await uni.$http.get(`${this.prefix}/v4/exam/archives`, { grade: this.grade || '' })
      const { list, grade, grades } = res.data
      // this.examList = uni.$u.deepClone(list).reverse();
      this.examList = list.reverse();
      (!this.grade || this.grade.lenght === 0) && (this.grade = grade)
      this.gradeList = ['全部', ...grades]
    },
  },
}
</script>

<style lang="scss" scoped>
.histories {
  position: relative;
  min-height: 100vh;
  background-color: #f6f6f6;
  &-header {
    height: 96rpx;
    display: flex;
    padding: 0 0 0 34rpx;
    align-items: center;
    background: white;
    .option {
      width: 188rpx;
      height: 56rpx;
      display: flex;
      white-space: nowrap;
      align-items: center;
      justify-content: space-between;
      border-radius: 28rpx;
      font-size: 28rpx;
      color: #939393;
      background: #f6f6f6;
      padding: 0 24rpx;
    }
    .down-arrow {
      height: 10rpx;
    }
  }

  &-content {
    margin: 24rpx 28rpx;
    padding-bottom: 200rpx;
  }
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    .tip {
      width: 84rpx;
      height: 40rpx;
      font-size: 28rpx;
      text-align: center;
      color: #333333;
    }
    .exams {
      position: absolute;
      width: 100%;
      bottom: 120rpx;
      background: white;
      border-top-left-radius: 30rpx;
      border-top-right-radius: 30rpx;
      padding: 0 22rpx;
      &-tip {
        width: 84rpx;
        height: 40rpx;
        display: flex;
        align-items: center;
        font-weight: bold;
        margin-top: 20rpx;
        font-size: 28rpx;
        text-align: center;
        color: #333333;
        &::before {
          content: '';
          display: flex;
          width: 6rpx;
          height: 28rpx;
          background: #ffb100;
          border-radius: 4rpx;
          margin-right: 13rpx;
        }
      }
      &-list {
        display: flex;
        height: 114rpx;
        .item {
          width: 336rpx;
          height: 46rpx;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 24rpx;
          color: #333333;
          background: #f6f6f6;
          border-radius: 30rpx;
          margin: 20rpx 6rpx;
          padding: 0 12rpx;
        }
      }
    }
    .pk {
      width: 100%;
      position: absolute;
      bottom: 0;
      height: 148rpx;
      display: flex;
      padding: 0 28rpx;
      align-items: flex-end;
      color: #939393;
      background: #ffffff;
      border-radius: 24rpx 24rpx 0rpx 0rpx;
      box-shadow: 0rpx -4rpx 8rpx 0rpx rgba(0, 0, 0, 0.03);
      .btn {
        margin-bottom: 8rpx;
        height: 80rpx;
        font-size: 32rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 58rpx;
      }
      .cancel {
        width: 194rpx;
        border: 2rpx solid #f6f6f6;
        background: white;
        margin-right: 20rpx;
      }
      .begin {
        position: relative;
        flex-grow: 1;
        color: white;
        background: linear-gradient(225deg, #ffc749, #ffba1d);
      }
      .notice {
        position: absolute;
        width: 292rpx;
        height: 60rpx;
        bottom: 56rpx;
        right: 0;
      }
    }
  }

  .fuc-pk {
    position: fixed;
    right: 0;
    bottom: 480rpx;
    width: 108rpx;
    height: 132rpx;
  }

  .pop {
    padding-bottom: 19rpx;
    &-line {
      width: 100%;
      height: 27rpx;
      border-top: 1rpx solid #ededed;
    }
    &-title {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 32rpx;
      color: #333333;
      height: 95rpx;
    }
    &-list {
      display: flex;
      flex-wrap: wrap;
      max-height: 45vh;
      overflow-y: scroll;
      padding: 10rpx;
      &__item {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12rpx 53rpx;
        font-size: 26rpx;
        color: #333333;
        border: 2rpx solid #e6e6e6;
        border-radius: 32rpx;
        margin: 10rpx;
        &.active {
          color: #ffffff;
          background: #ffba1d;
        }
      }
    }
  }
  .no-bottom {
    width: 100%;
    padding: 22rpx 0 14rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: #fff2d8;
    border-radius: 24rpx 0 0 24rpx;
    box-shadow: 0 -4rpx 16rpx 0 rgba(0, 0, 0, 0.06);
    position: fixed;
    bottom: 0;
    left: 0;
    &__operate {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3f1902;
      border-radius: 48rpx;
      padding: 16rpx 32rpx;
      margin-bottom: 10rpx;
      .icon {
        width: 40rpx;
        height: 34rpx;
        margin-right: 10rpx;
      }
      .text {
        font-size: 32rpx;
        color: #fdd891;
        white-space: nowrap;
      }
    }
    &__time {
      display: flex;
      align-items: center;
      justify-content: center;
      .icon {
        width: 22rpx;
        height: 22rpx;
        margin-right: 6rpx;
      }
      .text {
        font-size: 22rpx;
        color: #333333;
      }
    }
  }
}
</style>
