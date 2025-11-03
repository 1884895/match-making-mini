export default {
  data() {
    return {
      // type 0 高途9元课； 1 天星教育 298/318密押卷
      courseEnum: {
        23002: {
          name: '9元课',
          btnText: '9元立即报名',
          finallyStatus: '您已成功报名',
          type: 0,
          imgList: [
            'page1.png',
            'page2.png',
          ],
        },
        23003: {
          name: '298元课',
          btnText: '298元立即购买',
          finallyStatus: '您已成功购买',
          type: 1,
          imgList: [
            '318-1.png',
            '318-2.png',
            '318-3.png',
            '318-4.png',
            '318-5.png',
            '318-6.png',
            '318-7.png',
            '318-8.png',
            '318-9.png',
          ],
        },
        23004: {
          name: '318元课',
          btnText: '318元立即购买',
          finallyStatus: '您已成功购买',
          type: 1,
          imgList: [
            '318-1.png',
            '318-2.png',
            '318-3.png',
            '318-4.png',
            '318-5.png',
            '318-6.png',
            '318-7.png',
            '318-8.png',
            '318-9.png',
          ],
        },
        23005: {
          name: 'AI志愿填报卡',
          btnText: '立即购买',
          finallyStatus: '您已成功购买',
          type: 2,
          imgList: [
            'AI-1.png',
          ],
        },
      },
      goodNo: '',
      courseMessage: {},
    }
  },
  async onLoad(options) {
    this.goodNo = options.goodNo || '23002'
    this.courseMessage = this.courseEnum[this.goodNo] || {}
  },
}
