<template>
  <view class="invite">
    <Header :page-type="pageType" :group-info="groupInfo" :grade="grade" />
    <IProgress :group-info="groupInfo" :page-type="pageType" :payment-info="paymentInfo" :grade="grade" @share-weixin="shareWeixin" @report="report" @count-finish="countFinish" />
    <ListScroll :page-type="pageType" :prefix="prefix" :group-info="groupInfo" :grade="grade" :role-type="roleType" />
    <Footer :invite="true" :page-type="pageType" :group-info="groupInfo" :grade="grade" />
    <Recommend :page-type="pageType" :prefix="prefix" :group-info="groupInfo" :role-type="roleType" @share-weixin="shareWeixin" @report="report" />
    <Share :page-type="pageType" :group-info="groupInfo" @share-weixin="shareWeixin" @share-ding-ding="shareDingDing" @report="report" />
    <Popup ref="popup" :group-info="groupInfo" :page-type="pageType" @share-weixin="shareWeixin" @share-ding-ding="shareDingDing" @report="report" @count-finish="countFinish" />
  </view>
</template>

<script>
import Header from './components/header.vue'
import IProgress from './components/progress.vue'
import ListScroll from './components/listScroll.vue'
import Footer from './components/footer.vue'
import Recommend from './components/recommend.vue'
import Share from './components/share.vue'
import Popup from './components/popup.vue'
import mixins from './mixins.js'
import { nativeBridge } from '@/uni_modules/hfs-fe-uni-plugins'

export default {
  components: { Header, IProgress, ListScroll, Footer, Recommend, Share, Popup }, // eslint-disable-line vue/no-reserved-component-names
  mixins: [mixins],
  data() {
    return {
      options: {},
    }
  },
  computed: {
    pageType() {
      return this.groupEnd ? '3' : (this.options.type || '2')
    },
  },
  methods: {
    initPage() {
      if (this.pageType === '2')
        this.report(this.groupInfo.isOwner ? 'owner_page2_show' : 'joiner_page2_show')
      if (this.pageType === '3')
        this.report('page3_show')
      this.$refs.popup.open()
    },
    countFinish() {
      return uni.redirectTo({
        url: `${uni.$u.page()}${uni.$u.queryParams(this.options)}`,
      })
    },
    shareWeixin() {
      // #ifdef H5
      const { title, path, imageUrl: cover } = this.getShareWeixinInfo()
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 8, target: 'gh_dad0a8e4dc1c', data: { title, path, cover } }))
      // #endif
    },
    getShareWeixinInfo() {
      const { shareHY = {}, askId } = this.groupInfo
      const { studentName = '好分数' } = this.studentInfo
      const { activityIntroduce = {}, inviteGroup = {} } = shareHY
      const { title, path, imageUrl } = this.pageType === '3' ? activityIntroduce : inviteGroup
      return { title: `${this.pageType === '3' ? '' : studentName}${this.roleType === 2 ? '家长' : ''}${title.replace('XXX', this.groupInfo.realAmount)}`, path: `${path}${uni.$u.queryParams({ askId })}`, imageUrl }
    },
    shareDingDing() {
      const { title, descr, url } = this.getShareDingDingInfo()
      // #ifdef H5
      nativeBridge.callHandler('adJump', JSON.stringify({ mode: 9, target: 1, data: { title, descr, url } }))
      // #endif
      // #ifdef MP-WEIXIN
      uni.setClipboardData({ data: `${title}：${url}`, success: () => { uni.showToast({ title: '复制成功', icon: 'none' }) } })
      // #endif
    },
    getShareDingDingInfo() {
      const { shareDD = {}, askId } = this.groupInfo
      const { studentName = '好分数' } = this.studentInfo
      const { activityIntroduce = {}, inviteGroup = {} } = shareDD
      const { title, descr, url } = this.pageType === '3' ? activityIntroduce : inviteGroup
      return { title: `${this.pageType === '3' ? '' : studentName}${this.roleType === 2 ? '家长' : ''}${title.replace('XXX', this.groupInfo.realAmount)}`, descr, url: `${url}${askId}` }
    },
  },
  onShareAppMessage() {
    return this.getShareWeixinInfo()
  },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>
