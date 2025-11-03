<template>
  <view class="share-popup">
    <view class="share-popup__title">
      {{ shareTitle[pageType] }}
    </view>
    <view class="share-popup__list">
      <view class="list-item">
        <u-button open-type="share" :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="shareWeixin" />
        <image class="list-item__icon" :src="`${resourceUrl}weixin.png`" />
        <text>分享至微信</text>
      </view>
      <view class="list-item">
        <u-button :custom-style="{ height: '100%', background: 'transparent', border: 'none', position: 'absolute', left: '0', top: '0', zIndex: '10' }" @click="shareDingDing" />
        <image class="list-item__icon" :src="`${resourceUrl}dingding.png`" />
        <text>分享至钉钉</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  components: { },
  props: {
    pageType: {
      type: String,
      default: '',
    },
    groupInfo: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['shareWeixin', 'shareDingDing', 'report'],
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/group/',
      shareTitle: {
        1: '继续邀请好友',
        2: '继续邀请好友',
        3: '分享活动给更多人',
      },
      ownerAction: {
        1: 'owner_page2_invite_btn_click',
        2: 'owner_page2_invite_btn_click',
        3: 'page3_share_btn_click',
      },
      joinerAction: {
        1: 'joiner_page2_invite_btn_click',
        2: 'joiner_page2_invite_btn_click',
        3: 'page3_share_btn_click',
      },
    }
  },
  computed: {
    action() {
      return this.groupInfo.isOwner ? this.ownerAction : this.joinerAction
    },
  },
  methods: {
    shareWeixin() {
      this.$emit('shareWeixin')
      this.$emit('report', this.action[this.pageType])
    },
    shareDingDing() {
      this.$emit('shareDingDing')
      this.$emit('report', this.action[this.pageType])
    },
  },
}
</script>

<style lang="scss" scoped>
.share-popup {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 292rpx;
  height: calc(292rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  z-index: 999;
  &__title {
    color: #333333;
    font-size: 36rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 28rpx;
  }
  &__list {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    .list-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: bold;
      color: #333333;
      &__icon {
        width: 100rpx;
        height: 100rpx;
        margin-bottom: 22rpx;
      }
    }
  }
}
</style>
