<template>
  <view class="register">
    <view class="title">
      请选择注册角色
    </view>
    <view class="type">
      <view v-for="(item, index) in roleList" :key="index" class="type-item" @click="role = item.type">
        <image class="icon" :src="roleImages[`${role === item.type ? 'selected' : ''}${item.type}`]" />
      </view>
    </view>
    <view class="fixed">
      <u-button text="进行注册" :custom-style="{ borderRadius: '40rpx', height: '80rpx', color: '#ffffff', fontSize: '30rpx', background: 'linear-gradient(0deg, #FF4D2B, #FF5900)' }" :throttle-time="500" @click="handleNext" />
    </view>
  </view>
</template>

<script>
import { RoleList } from '@/enums'

export default {
  data() {
    return {
      options: {},
      roleImages: {
        1: require('../../static/login/student.png'),
        selected1: require('../../static/login/student_selected.png'),
        2: require('../../static/login/parent.png'),
        selected2: require('../../static/login/parent_selected.png'),
      },
      role: '',
    }
  },
  computed: {
    roleList() {
      return RoleList
    },
  },
  onLoad(options) {
    this.options = options
    this.role = this.roleList[0].type
  },
  methods: {
    async handleNext() {
      if (!this.role) {
        return uni.showToast({
          title: '请选择角色',
          icon: 'none',
        })
      }
      uni.navigateTo({
        url: `/pages/login/password${uni.$u.queryParams({ ...this.options, roleType: this.role })}`,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.register {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  padding: 60rpx 58rpx 0;
  .title {
    width: 100%;
    font-size: 50rpx;
    color: #333333;
    font-weight: 500;
    margin-bottom: 120rpx;
  }
  .type {
    display: flex;
    align-items: center;
    &-item {
      &:last-child {
        margin-left: 40rpx;
      }
      .icon {
        width: 232rpx;
        height: 291rpx;
      }
    }
  }
  .fixed {
    width: 100%;
    position: fixed;
    bottom: 225rpx;
    left: 50%;
    transform: translateX(-50%);
    padding: 0 58rpx;
  }
}
</style>
