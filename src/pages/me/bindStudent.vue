<template>
  <view class="bind">
    <u-sticky>
      <view class="bind-desc">
        <image class="bind-desc__icon" :src="`${resourceUrl}bind-icon.png`" />
        <view class="bind-desc__text">
          绑定后才可以查看考试成绩和分析哦~
        </view>
      </view>
      <view class="bind-select">
        <view class="bind-select__line" />
        <view class="bind-select__text">
          选择绑定方式
        </view>
      </view>
    </u-sticky>
    <view class="bind-form">
      <u-form ref="form" :model="form" :rules="rules" error-type="toast">
        <view class="bind-form__list">
          <view v-for="item in bindList" :key="item.value" class="list-item" @click="bindSelect(item)">
            <view class="list-item__header">
              <image class="icon" :src="`${resourceUrl}${item.value === form.bind ? 'register-select.png' : 'bind-default.png'}`" />
              <view class="text">
                {{ item.name }}
              </view>
            </view>
            <view v-if="item.value === form.bind" class="list-item__content">
              <template v-if="form.bind === '3'">
                <u-form-item border-bottom prop="account">
                  <u-input v-model="form.account" border="none" disabled-color="#ffffff" placeholder="请输入好分数学生版账号" placeholder-style="color: #939393; font-size: 26rpx;" color="#333333" font-size="26rpx" />
                </u-form-item>
                <u-form-item border-bottom prop="password">
                  <u-input v-model="form.password" password border="none" disabled-color="#ffffff" placeholder="请输入学生版账号的密码" placeholder-style="color: #939393; font-size: 26rpx;" color="#333333" font-size="26rpx" />
                </u-form-item>
              </template>
              <template v-if="form.bind === '2'">
                <u-form-item border-bottom prop="name">
                  <u-input v-model="form.name" border="none" disabled-color="#ffffff" placeholder="请输入学生姓名" placeholder-style="color: #939393; font-size: 26rpx;" color="#333333" font-size="26rpx" />
                </u-form-item>
                <u-form-item border-bottom prop="idCard">
                  <u-input v-model="form.idCard" border="none" disabled-color="#ffffff" placeholder="请输入学生身份证号" placeholder-style="color: #939393; font-size: 26rpx;" color="#333333" font-size="26rpx" />
                </u-form-item>
                <u-form-item border-bottom prop="area" @click="showSelectArea = true">
                  <u-input v-model="form.area" disabled border="none" disabled-color="#ffffff" placeholder="选择地区" placeholder-style="color: #939393; font-size: 26rpx;" color="#333333" font-size="26rpx" />
                  <template #right>
                    <u-icon name="arrow-right" color="#939393" />
                  </template>
                </u-form-item>
                <u-form-item border-bottom prop="school" @click="selectSchool">
                  <u-input v-model="schoolValue" disabled border="none" disabled-color="#ffffff" placeholder="选择学校" placeholder-style="color: #939393; font-size: 26rpx;" color="#333333" font-size="26rpx" />
                  <template #right>
                    <u-icon name="arrow-right" color="#939393" />
                  </template>
                </u-form-item>
                <u-form-item border-bottom prop="grade" @click="showSelectGrade = true">
                  <u-input v-model="form.grade" disabled border="none" disabled-color="#ffffff" placeholder="选择年级（选填）" placeholder-style="color: #939393; font-size: 26rpx;" color="#333333" font-size="26rpx" />
                  <template #right>
                    <u-icon name="arrow-right" color="#939393" />
                  </template>
                </u-form-item>
              </template>
              <template v-if="form.bind === '1'">
                <u-form-item border-bottom prop="name">
                  <u-input v-model="form.name" border="none" disabled-color="#ffffff" placeholder="请输入学生姓名" placeholder-style="color: #939393; font-size: 26rpx;" color="#333333" font-size="26rpx" />
                </u-form-item>
                <u-form-item border-bottom prop="number">
                  <u-input v-model="form.number" border="none" disabled-color="#ffffff" placeholder="请输入学号或准考证号" placeholder-style="color: #939393; font-size: 26rpx;" color="#333333" font-size="26rpx" />
                </u-form-item>
              </template>
            </view>
          </view>
        </view>
        <view class="bind-form__submit">
          <u-button text="确定" :custom-style="{ borderRadius: '40rpx', height: '80rpx', color: '#ffffff', fontSize: '30rpx', background: 'linear-gradient(0deg, #FF4D2B, #FF5900)', marginTop: '20rpx' }" :throttle-time="500" :disabled="disabledSubmit" @click="bindStudent" />
        </view>
        <view class="bind-form__tips">
          <view class="tips-contact" @click="openCustomerServiceChat">
            <image class="tips-contact__icon" :src="`${resourceUrl}register-customer.png`" />客服
          </view>
        </view>
      </u-form>
    </view>
    <view v-if="showCountDown" class="bind-time">
      <view class="bind-time__down">
        <image class="pic" src="../../static/me/bind_student.png" />
        <view class="text">
          正在绑定学生，请等待…
        </view>
        <u-count-down :time="30 * 1000" format="ss" @finish="countDownFinish" />
      </view>
    </view>
    <u-picker ref="uPicker" :show="showSelectArea" :columns="areaList" confirm-color="#FF4D2B" :close-on-click-overlay="true" @change="areaChange" @confirm="areaConfirm" @cancel="showSelectArea = false" @close="showSelectArea = false" />
    <u-picker :show="showSelectSchool" key-name="name" :columns="[schoolList]" confirm-color="#FF4D2B" :close-on-click-overlay="true" @confirm="schoolConfirm" @cancel="showSelectSchool = false" @close="showSelectSchool = false" />
    <u-picker :show="showSelectGrade" :columns="[grades]" confirm-color="#FF4D2B" :close-on-click-overlay="true" @confirm="gardeConfirm" @cancel="showSelectGrade = false" @close="showSelectGrade = false" />
    <u-picker :show="showMatchSchool" key-name="schoolName" title="请选择学校" :columns="[matchSchoolList]" confirm-text="绑定" confirm-color="#FF4D2B" :close-on-click-overlay="true" @confirm="matchSchoolConfirm" @cancel="showMatchSchool = false" @close="showMatchSchool = false" />
    <u-picker :show="showBindSchool" key-name="pickerName" title="请确认你的信息" :columns="[bindSchoolList]" confirm-text="绑定" confirm-color="#FF4D2B" :close-on-click-overlay="true" @confirm="bindSchoolConfirm" @cancel="showBindSchool = false" @close="showBindSchool = false" />
    <u-popup :show="popup.show" :mode="popup.mode" :overlay="popup.overlay" bg-color="transparent" close-on-click-overlay @close="popup.show = false">
      <view v-if="popup.type === 2" class="promoter">
        <image class="promoter-bg" :src="invitee.bgImageUrl" mode="widthFix" />
        <view class="promoter-btns">
          <image class="promoter-btns__left" :src="invitee.leftImageUrl" mode="widthFix" @click="promoterJump('pay')" />
          <image class="promoter-btns__right" :src="invitee.rightImageUrl" mode="widthFix" @click="promoterJump('land')" />
        </view>
      </view>
      <view v-else class="award">
        <view class="award-close" @click="popup.show = false" />
        <image class="award-img" :src="`${resourceUrl}new_gift.png`" mode="widthFix" />
        <view class="award-button flex-row-center" @click="handleAward">
          领取福利
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { getUserInfo } from '../../utils/login'
import { BindType } from '@/enums'

export default {
  data() {
    return {
      resourceUrl: `${feConfig.resourceUrl}/images/`,
      options: {},
      userInfo: {},
      form: {
        bind: '1',
        account: '',
        password: '',
        name: '',
        idCard: '',
        area: '',
        school: '',
        grade: '',
        number: '',
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入学生真实姓名',
          },
        ],
        number: [
          {
            required: true,
            message: '请输入准考证号或学号',
          },
        ],
        idCard: [
          {
            required: true,
            message: '请输入学生身份证号',
          },
          {
            validator: (rule, value, _callback) => {
              return uni.$u.test.idCard(value)
            },
            message: '请输入正确的身份证号',
          },
        ],
        area: [
          {
            required: true,
            message: '请选择地区',
          },
        ],
        school: [
          {
            required: true,
            message: '请选择学校',
          },
        ],
        account: [
          {
            required: true,
            message: '请输入好分数学生版账号',
          },
        ],
        password: [
          {
            required: true,
            message: '请输入好分数学生版密码',
          },
        ],
      },
      bindType: BindType,
      regionList: [],
      areaList: [],
      showSelectArea: false,
      schoolList: [],
      schoolValue: '',
      showSelectSchool: false,
      grades: ['初一', '初二', '初三', '高一', '高二', '高三'],
      showSelectGrade: false,
      identityType: '',
      matchSchoolList: [],
      showMatchSchool: false,
      bindSchoolList: [],
      showBindSchool: false,
      showCountDown: false,
      popup: {
        show: false,
        mode: 'center',
        overlay: true,
        src: '',
        value: '',
        type: '',
      },
      invitee: {},
    }
  },
  computed: {
    isLogin() {
      return !!this.userInfo.userId
    },
    studentInfo() {
      return this.userInfo.linkedStudent || {}
    },
    hasStudent() {
      return this.userInfo.linkedStudent && (this.userInfo.linkedStudent.isVirtual === 2)
    },
    bindList() {
      const bindWay = [
        {
          name: '姓名+学号/考号（推荐方式）',
          value: '1',
        },
        {
          name: '姓名+身份证+学校',
          value: '2',
        },
      ]
      !this.options.id && this.userInfo.roleType === 2 && bindWay.push({
        name: '好分数学生版账号',
        value: '3',
      })
      return bindWay
    },
    disabledSubmit() {
      if (this.form.bind === '1')
        return !this.form.name || !this.form.number
      if (this.form.bind === '2')
        return !this.form.name || !this.form.idCard || !this.form.area || !this.form.school
      if (this.form.bind === '3')
        return !this.form.account || !this.form.password
      return true
    },
  },
  onLoad(options) {
    this.options = options
    this.userInfo = uni.getStorageSync('userInfo') || {}
    const nextChangeTime = this.userInfo.nextChangeTime
    options.id && uni.showModal({
      title: '换绑提示',
      content: `当前绑定学生是${options.name}，${nextChangeTime === 0 ? '每个自然年可换绑一次，请谨慎操作' : `每个自然年可换绑一次，下次换绑时间${uni.$u.timeFormat(nextChangeTime, 'yyyy-mm-dd')}`}`,
      showCancel: false,
      confirmText: nextChangeTime === 0 ? '知道了' : '关闭',
      confirmColor: '#FF4D2B',
      success: (res) => {
        if (res.confirm && nextChangeTime > 0) {
          return uni.navigateBack()
        }
      },
    })
  },
  onReady() {
    this.$refs.form.setRules(this.rules)
  },
  methods: {
    bindSelect(e) {
      this.form.bind = e.value
      e.value === '2' && !this.regionList.length && this.getRegionList()
    },
    selectSchool() {
      if (!this.form.area) {
        return uni.$u.toast('请先选择地区')
      }
      this.showSelectSchool = true
    },
    // 获取全国行政区划
    async getRegionList() {
      const res = await uni.$http.get('/v1/be-proxy/v2/region', {}, { custom: { loading: false } })
      this.regionList = res.data
      // 树形结构转换为多维数组
      this.areaList[0] = this.regionList.map(v => v.name)
      this.areaList[1] = this.regionList[0].cities.map(v => v.name)
      this.areaList[2] = this.regionList[0].cities[0].counties.map(v => v.name)
    },
    // 获取相关学校
    async getSchoolList(province, city, county) {
      const res = await uni.$http.get('/v1/be-proxy/v2/region/schools', {
        province,
        city,
        county,
      })
      this.schoolList = res.data
    },
    areaChange(e) {
      const { columnIndex, indexs, picker = this.$refs.uPicker } = e
      if (columnIndex === 0) {
        picker.setColumnValues(1, this.regionList[indexs[0]].cities.map(v => v.name))
        picker.setColumnValues(2, this.regionList[indexs[0]].cities[indexs[1]].counties.map(v => v.name))
      }
      if (columnIndex === 1) {
        picker.setColumnValues(2, this.regionList[indexs[0]].cities[indexs[1]].counties.map(v => v.name))
      }
    },
    async areaConfirm(e) {
      this.form.area = e.value.join(',')
      this.form.school = ''
      this.schoolValue = ''
      this.showSelectArea = false
      await this.getSchoolList(...e.value)
    },
    schoolConfirm(e) {
      const { id, name } = e.value[0] || {}
      this.form.school = id
      this.schoolValue = name
      this.showSelectSchool = false
    },
    gardeConfirm(e) {
      this.form.grade = e.value[0]
      this.showSelectGrade = false
    },
    bindStudent() {
      this.$refs.form.validate().then((valid) => {
        if (valid) {
          const bindMap = {
            1: () => {
              return this.matchStudentsWithStudyNumber()
            },
            2: () => {
              return this.matchStudentsWithSchool()
            },
            3: () => {
              return this.matchStudentsWithAccount()
            },
          }
          return bindMap[this.form.bind] && bindMap[this.form.bind]()
        }
      })
    },
    matchStudentsWithStudyNumber() {
      uni.$http.get('/v1/be-proxy/v2/users/matched-students', {
        roleType: this.userInfo.roleType,
        studentName: this.form.name,
        identityType: 1,
        identityCode: this.form.number,
      }, {
        custom: {
          error: false,
        },
      }).then((res) => {
        const data = res.data
        this.identityType = data.identityType
        this.matchSchoolList = data.students
        this.showMatchSchool = true
      }).catch(() => {
        return this.showBindAlert()
      })
    },
    matchSchoolConfirm(e) {
      const result = e.value[0]
      this.showMatchSchool = false
      if (result.needAuthCode) {
        return uni.showModal({
          title: '您绑定学生的学校严格保证学生信息安全，需要通过授权码才能绑定成功，若当前没有授权码，请联系学校老师或学校管理员。',
          confirmText: '验证',
          confirmColor: '#FF4D2B',
          editable: true,
          placeholderText: '请填写学校发布的授权码',
          success: (res) => {
            if (res.confirm) {
              if (!res.content.trim()) {
                return uni.$u.toast('请输入授权码')
              }
              return this.judgeBind(result.studentId, res.content)
            }
          },
        })
      }
      return this.judgeBind(result.studentId)
    },
    matchStudentsWithSchool() {
      uni.$http.get('/v1/be-proxy/v2/native-users/matched-students', {
        studentName: this.form.name,
        schoolId: this.form.school,
        grade: this.form.grade,
      }, {
        custom: {
          error: false,
        },
      }).then((res) => {
        this.bindSchoolList = res.data.map(v => ({
          ...v,
          pickerName: `${v.grade + v.className}班，${v.maskedXuehao ? (`学号：${v.maskedXuehao}`) : (v.maskedKaohao ? (`考号：${v.maskedKaohao}`) : '学号/考号：无')}`,
        }))
        this.showBindSchool = true
      }).catch(() => {
        return this.showBindAlert()
      })
    },
    bindSchoolConfirm(e) {
      this.showBindSchool = false
      const studentId = e.value[0].id
      if (this.hasStudent) {
        return this.options.id ? this.realStudentChangeBind(studentId) : this.bindStudentSchoolInfo(studentId)
      }
      return this.studentInfo.studentId ? this.virtualStudentChangeBind(studentId) : this.bindStudentSchoolInfo(studentId)
    },
    matchStudentsWithAccount() {
      const { account, password } = this.form
      const chooseStuId = this.hasStudent ? '' : this.studentInfo.studentId
      uni.$http.post('/v1/be-proxy/v2/native-users/bind-student-by-account', {
        account,
        password,
        chooseStuId,
      }, { custom: { error: false } }).then(() => {
        return this.bindingStudentInfo()
      }).catch((err) => {
        return uni.$u.toast(err.msg || '绑定学生失败')
      })
    },
    judgeBind(studentId, schoolAuthCode) {
      const identityType = this.identityType
      const identityCode = this.form.number
      if (this.hasStudent) {
        return this.options.id ? this.realStudentChangeBind(studentId, schoolAuthCode) : this.bindStudentCertificateInfo(studentId, schoolAuthCode, identityType, identityCode)
      }
      return this.studentInfo.studentId ? this.virtualStudentChangeBind(studentId, schoolAuthCode) : this.bindStudentCertificateInfo(studentId, schoolAuthCode, identityType, identityCode)
    },
    // 基于真实学生换绑
    realStudentChangeBind(studentId, schoolAuthCode) {
      uni.$http.post('/v1/be-proxy/v2/native-users/bind-student', {
        studentId,
        schoolAuthCode,
        selectStudentId: this.options.id,
      }, { custom: { error: false } }).then(() => {
        return this.bindingStudentInfo()
      }).catch((err) => {
        return uni.$u.toast(err.msg || '绑定学生失败')
      })
    },
    // 基于虚拟学生的换绑
    virtualStudentChangeBind(studentId, schoolAuthCode) {
      uni.$http.post('/v1/be-proxy/v2/native-users/bind-real-student', {
        studentId,
        schoolAuthCode,
        chooseStuId: this.studentInfo.studentId,
        bindType: this.form.bind,
      }, { custom: { error: false } }).then(() => {
        return this.bindingStudentInfo()
      }).catch((err) => {
        return uni.$u.toast(err.msg || '绑定学生失败')
      })
    },
    // 通过姓名+学号/考号方式 普通绑定
    bindStudentCertificateInfo(studentId, schoolAuthCode, identityType, identityCode) {
      uni.$http.put('/v1/be-proxy/v2/users/bind-student', {
        studentId,
        schoolAuthCode,
        identityType,
        identityCode,
      }, { custom: { error: false } }).then(() => {
        return this.bindingStudentInfo()
      }).catch((err) => {
        return uni.$u.toast(err.msg || '绑定学生失败')
      })
    },
    // 通过姓名+身份证+学校方式 普通绑定
    bindStudentSchoolInfo(studentId) {
      uni.$http.post('/v1/be-proxy/v2/native-users/bind-students', {
        studentId,
      }, { custom: { error: false } }).then(() => {
        return this.bindingStudentInfo()
      }).catch((err) => {
        return uni.$u.toast(err.msg || '绑定学生失败')
      })
    },
    // 绑定
    async bindingStudentInfo(flag) {
      !flag && (this.showCountDown = true)
      const res = await getUserInfo({ loading: false, error: false })
      if (res.linkedStudent && (res.linkedStudent.isVirtual === 2)) {
        this.showCountDown = false
        if (!res.icode)
          return uni.reLaunch({ url: '/pages/index/index' })
        return this.checkAward(res.icode)
      }
      await uni.$u.sleep(3000)
      this.showCountDown && this.bindingStudentInfo(true)
    },
    // 校验是否弹出三重礼弹出框
    async checkAward(icode) {
      const res = await uni.$http.get('/v1/be-proxy/v3/invitation/invitee-status', { invitationCode: icode })
      this.invitee = res.data || {}
      const { show = false, type } = this.invitee
      if (show)
        return this.openPopup(type)
      return uni.reLaunch({ url: '/pages/index/index' })
    },
    openPopup(type) {
      this.popup = { ...this.popup, show: true, type }
    },
    // 新推官跳转
    promoterJump(type) {
      const urlMap = {
        pay: '/pages/me/member?activityType=newPromoter&action=bdy_mzk',
        land: '/uni_modules/hfs-fe-uni-module/pages/newPromoter/operation?action=bdy_lyrdzk',
      }
      return uni.reLaunch({ url: urlMap[type] })
    },
    // 领取三重礼
    async handleAward() {
      await uni.$http.post('/v1/be-proxy/v3/invitation/invitee-award')
      return uni.showToast({
        title: '领取成功',
        icon: 'none',
        duration: 2000,
        success: () => {
          uni.reLaunch({ url: '/uni_modules/hfs-fe-uni-module/pages/new/operation' })
        },
      })
    },
    countDownFinish() {
      this.showCountDown = false
      return uni.showModal({
        title: '绑定学生失败',
        content: '后台同步学生信息有延迟，您可以执行以下操作',
        cancelText: '返回',
        confirmText: '重试',
        confirmColor: '#FF4D2B',
        success: (res) => {
          if (res.confirm) {
            return this.bindingStudentInfo()
          }
          return uni.navigateBack()
        },
      })
    },
    showBindAlert() {
      return uni.showModal({
        title: this.form.bind === '1' ? '姓名和证件号不匹配!' : '姓名和学校不匹配!',
        content: this.form.bind === '1' ? '证件号通常是学号/准考证号之一，是学校阅卷时学生的唯一识别码。一般是考试时填写在试卷上的号码。例如学校考试时录入为考号，没有录入学号，那么你使用姓名+学号是无法匹配的。如果确认填写了正确的姓名+证件号仍然无法匹配成功，请咨询在线客服。' : '请核对自己的姓名和学校是否正确填写，如果确认无误，请咨询在线客服。您也可以通过证件号绑定学生，证件号通常是学号/准考证号之一，是学校阅卷时学生的唯一识别码，一般是考试时填写在试卷上的号码。',
        showCancel: false,
        confirmText: '我知道了',
        confirmColor: '#FF4D2B',
      })
    },
    openCustomerServiceChat() {
      return wx.openCustomerServiceChat(feConfig.customer)
    },
  },
}
</script>

<style lang="scss" scoped>
.bind {
  min-height: 100vh;
  background: #f6f6f6;
  &-desc {
    display: flex;
    align-items: center;
    background: #ffe9e5;
    padding: 16rpx 28rpx 18rpx;
    &__icon {
      width: 32rpx;
      height: 30rpx;
      margin-right: 12rpx;
    }
    &__text {
      font-size: 26rpx;
      color: #ff4d2b;
    }
  }
  &-select {
    display: flex;
    align-items: center;
    background: #ffffff;
    border-radius: 0 0 24rpx 24rpx;
    padding: 26rpx 28rpx;
    &__line {
      width: 6rpx;
      height: 30rpx;
      background: #ff4d2b;
      border-radius: 6rpx;
      margin-right: 12rpx;
    }
    &__text {
      font-size: 30rpx;
      font-weight: bold;
      color: #333333;
    }
  }
  &-form {
    padding: 24rpx 28rpx;
    &__list {
      margin-bottom: 120rpx;
      .list-item {
        width: 100%;
        background: #ffffff;
        border-radius: 24rpx;
        padding: 22rpx 28rpx 24rpx;
        margin-bottom: 24rpx;
        &:last-child {
          margin-bottom: 0;
        }
        &__header {
          display: flex;
          align-items: center;
          .icon {
            width: 26rpx;
            height: 26rpx;
            margin-right: 14rpx;
          }
          .text {
            font-size: 28rpx;
            color: #333333;
          }
        }
        &__content {
          padding: 0 6rpx 0 38rpx;
          ::v-deep .u-form-item__body {
            padding: 32rpx 0 12rpx;
          }
        }
      }
    }
    &__submit {
      ::v-deep .u-button--disabled {
        opacity: 1 !important;
        background: #e6e6e6 !important;
      }
    }
    &__tips {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      font-size: 26rpx;
      margin-top: 24rpx;
      .tips-contact {
        display: flex;
        align-items: center;
        color: #ff4d2b;
        &__icon {
          width: 30rpx;
          height: 30rpx;
          margin-right: 4rpx;
        }
      }
    }
  }
  &-time {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.36);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    &__down {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .pic {
        width: 226rpx;
        height: 296rpx;
        margin-bottom: 28rpx;
      }
      .text {
        font-size: 32rpx;
        font-weight: 500;
        color: #f9f9f9;
      }
      ::v-deep .u-count-down {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        .u-count-down__text {
          font-size: 80rpx;
          font-weight: 500;
          color: #ff4d2b;
        }
      }
    }
  }
  .customer {
    font-size: 28rpx;
    color: #ff4d2b;
    text-align: right;
    margin-top: 20rpx;
  }
  .promoter {
    position: relative;
    &-bg {
      width: 534rpx;
      height: 706rpx;
    }
    &-btns {
      width: calc(100% - 40rpx);
      position: absolute;
      bottom: 24rpx;
      left: 20rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &__left {
        width: 230rpx;
        height: 80rpx;
      }
      &__right {
        width: 254rpx;
        height: 80rpx;
      }
    }
  }
  .award {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &-close {
      width: 70rpx;
      height: 70rpx;
      position: absolute;
      top: 250rpx;
      right: 110rpx;
    }
    &-img {
      width: 100%;
      margin-bottom: 18rpx;
    }
    &-button {
      width: 340rpx;
      height: 80rpx;
      background: linear-gradient(315deg, #fd6024, #ffb349);
      border-radius: 40rpx;
      font-size: 32rpx;
      font-weight: 500;
      color: #ffffff;
    }
  }
}
</style>
