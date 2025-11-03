<template>
  <view class="group">
    <!-- 背景图 -->
    <image v-if="detail.backgroundPic" class="bg" :src="detail.backgroundPic" mode="widthFix" />
    <!-- 二维码 -->
    <view class="qrcode">
      <image class="qrcode-img" :src="detail.qrcode" mode="widthFix" show-menu-by-longpress @longpress="report(isChat ? 'longpressQrcode' : 'pay_page_press')" />
      <view v-if="detail.count" class="qrcode-count">
        目前已有<text class="qrcode-count__text">
          {{ detail.count }}
        </text>人加入群聊
      </view>
    </view>
  </view>
</template>

<script>
import { loginBase } from '../../utils/login'

export default {
  data() {
    return {
      options: {},
      detail: {},
      actionId: '671b097400004eb0673f4ad8',
    }
  },
  computed: {
    isChat() {
      return this.options.chatId
    },
  },
  async onLoad(options) {
    this.options = options
    await loginBase()
    this.bindUnionId()
    if (!options.chatId)
      return this.getPage()
    this.chatInfo()
    this.report('click')
  },
  methods: {
    async getPage() {
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/school-operate/get-page`, { position: 1, ...this.options })
      this.detail = res.Data
    },
    async chatInfo() {
      const params = { chatId: this.options.chatId }
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/school-operate/chat-info`, params)
      this.detail = res.Data
      uni.setNavigationBarTitle({ title: this.detail.pageName })
    },
    report(action) {
      if (!this.isChat)
        return uni.$http.post(`${feConfig.api.znyx}/api/school-operate/action-log`, { action, position: 1, ...this.options }, { custom: { loading: false, error: false } })
      const params = { taskId: this.options.taskId, userId: this.options.userId, action }
      uni.$http.post(`${feConfig.api.znyx}/api/school-operate/action`, params, { custom: { loading: false, error: false } })
    },
    bindUnionId() {
      if (!this.options.userId)
        return
      const data = getApp().globalData
      const params = { unionId: data.accountInfo.unionId, userId: this.options.userId }
      uni.$http.post('/v1/accounts/join-chat', params, { custom: { loading: false, error: false } }).catch(() => {
        this.report('unionIdBindfail')
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.group {
  position: relative;
  .bg {
    width: 100%;
  }
  .qrcode {
    position: absolute;
    bottom: 200rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    &-img {
      width: 400rpx;
      height: 400rpx;
    }
    &-count {
      font-size: 30rpx;
      text-align: center;
      margin-top: 20rpx;
      &__text {
        color: red;
        margin: 0 6rpx;
      }
    }
  }
}
</style>
