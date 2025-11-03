<template>
  <view class="rules">
    <view class="bold">
      一、定义
    </view>
    <view>"信息授权方"：本协议中指的是拥有用户个人信息的网站、应用程序等。</view>
    <view>"第三方"：本协议中指的是将个人信息用于特定目的的实体或个人。</view>
    <view>"用户"：本协议中指的是提交个人信息的个人或实体。</view>
    <view class="bold">
      二、授权范围
    </view>
    <view>用户同意将个人信息授权给第三方，以用于提供特定服务或实现特定目的。</view>
    <view>授权范围应与收集和使用个人信息的合法性和正当性相一致。</view>
    <view>授权期限应与收集和使用个人信息的合法性和正当性相一致。</view>
    <view class="bold">
      三、个人信息的使用和保护
    </view>
    <view>第三方应仅在授权范围内使用个人信息，并采取合理的技术和管理措施保护个人信息的安全和隐私。</view>
    <view>第三方不得将个人信息共享给任何其他实体或个人，除非得到信息授权方的明确书面同意或法律要求。</view>
    <view>第三方应遵守相关法律法规和监管要求，对个人信息进行合法、合规的使用和管理。</view>
    <view class="bold">
      四、用户的权利和保障措施
    </view>
    <view>用户有权要求信息授权方更正、删除或限制使用其个人信息。</view>
    <view>用户有权撤销对个人信息的授权，并要求删除已共享的个人信息。</view>
    <view>信息授权方应采取合理的技术和管理措施保障用户的个人信息的安全和隐私。</view>
    <view>信息授权方应对第三方的使用行为进行监督和管理，确保个人信息的安全和隐私。</view>
  </view>
</template>

<script>
export default {
  data() {
    return {

    }
  },

  methods: {

  },
}
</script>

<style lang="scss" scoped>
.rules {
  min-height: 100vh;
  font-size: 28rpx;
  padding: 40rpx;
  line-height: 1.5;
  .bold {
    font-weight: 500;
    font-size: 34rpx;
    margin: 20rpx 0 10rpx 0;
  }
}
</style>
