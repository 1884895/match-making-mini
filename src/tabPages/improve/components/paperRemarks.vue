<template>
  <view class="remarks">
    <view v-for="(item, index) in content" :key="index">
      <l-painter ref="painter" :board="item" hidden @done="done(index)" />
    </view>
  </view>
</template>

<script>
const OBJECTIVE_QUESTION = 2 // 客观题
const OPTION_REFUSED = -100 // 选做题未做，score 返回 -100
export default {
  props: {
    urls: {
      type: Array,
      default: () => ([]),
    },
    examPaper: {
      type: Object,
      default: () => ({}),
    },
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['success'],
  data() {
    return {
      maxWidth: 750, // 最大宽度
      content: [],
      objectiveList: [],
      subjectiveList: [],
      pointsList: [],
    }
  },
  computed: {
    showScore() {
      return this.config && this.config.score === 2 && this.config.scoreType === 2
    },
    showPaperInspection() {
      return this.config && this.config.paperInspection === 2
    },
  },
  watch: {
    urls: {
      handler(val) {
        this.resetData()
        val && val.length && this.init(val)
      },
      deep: true,
    },
  },
  methods: {
    async init(val) {
      // 不显示批改痕迹，直接返回原图
      if (!this.showPaperInspection) {
        return val.forEach((v, i) => this.$emit('success', v, i))
      }

      uni.showLoading({ title: '加载中', mask: true })
      const totalMarks = this.totalMarks() // 左上角总分

      for (let i = 0; i < val.length; i++) {
        const src = val[i]
        const res = await uni.getImageInfo({ src }) // 获取图片信息

        // 图片信息获取失败，直接返回原图
        if (!res[1]) {
          uni.hideLoading()
          this.$emit('success', src, i)
          this.content.push({})
          continue
        }

        // 图片宽度大于最大宽度，缩放
        const { width } = res[1]
        const realWidth = width > this.maxWidth ? this.maxWidth : width
        const scale = realWidth / width

        // 试卷图片
        const board = {
          css: {
            width: realWidth,
          },
          views: [{
            type: 'image',
            src,
            css: {
              width: realWidth,
            },
          }],
        }

        // 分数未被屏蔽，显示总分 && 双评 && 分数转化
        if (this.showScore) {
          // 左上角总分
          totalMarks.index === i && board.views.push(totalMarks)

          // 双评、分数转化痕迹
          const doubleConvert = this.doubleConvert()
          doubleConvert.index === i && board.views.push(doubleConvert)
        }

        // 客观题痕迹
        const objectiveMarks = this.objectiveMarks(scale, i)
        objectiveMarks.length && board.views.push(...objectiveMarks)

        // 主观题痕迹
        const subjectiveMarks = this.subjectiveMarks(scale, src, i)
        subjectiveMarks.length && board.views.push(...subjectiveMarks)

        this.content.push(board)
      }
    },
    totalMarks() {
      const { questions = [], isShuangPing, isScoreConvert, score } = this.examPaper
      let objectiveScore = 0 // 客观题得分
      let subjectiveScore = 0 // 主观题得分
      questions.forEach((question) => {
        const qScore = question.score !== OPTION_REFUSED ? question.score : 0
        const trasRatioScore = isScoreConvert ? qScore * (question.trasRatio || 1) : qScore
        if (question.type === OBJECTIVE_QUESTION) {
          objectiveScore += trasRatioScore
          this.objectiveList.push(question)
        }
        else {
          subjectiveScore += trasRatioScore
          this.subjectiveList.push(question)
        }
      })
      isShuangPing && (subjectiveScore = score - objectiveScore)
      return {
        index: 0,
        type: 'text',
        text: `总得分：${Number.parseFloat(score.toFixed(2))}分\n-客观题：${Number.parseFloat(objectiveScore.toFixed(2))}分\n-主观题：${Number.parseFloat(subjectiveScore.toFixed(2))}分\n客观题说明：\n-红色填涂为错误\n-蓝色填涂为正确`,
        css: {
          position: 'fixed',
          top: 10,
          left: 20,
          color: '#F00',
          fontSize: 16,
        },
      }
    },
    objectiveMarks(scale, index) {
      const answerOptions = this.objectiveList.reduce((acc, cur) => acc.concat(cur.answerOption || []), [])
      const result = answerOptions.map((v) => {
        return {
          ...v,
          type: 'text',
          text: v.option,
          css: {
            fontSize: v.h * scale * 0.8,
            verticalAlign: 'middle',
            textAlign: 'center',
            position: 'fixed',
            top: v.y * scale,
            left: v.x * scale,
            width: v.w * scale,
            height: v.h * scale,
            background: v.right === 1 ? '#4671D5' : '#f00',
          },
        }
      })
      return result.filter(v => v.index === index)
    },
    subjectiveMarks(scale, url, index) {
      const result = []

      // 合并url相同的题目
      const subjectiveObj = this.subjectiveList.reduce((res, current) => {
        const url = current.url[0]
        !res[url] && (res[url] = [])
        res[url].push(current)
        return res
      }, {})
      Object.keys(subjectiveObj).forEach((v) => {
        const urlParams = this.urlParser(url)
        const queryParams = this.queryParser(this.urlParser(v).url)
        if (urlParams.url === queryParams.url) {
          const { x, y, w } = queryParams.params

          // 分数未被屏蔽 且 图片地址有坐标信息（即不是在线考试图片）显示小题右上角得分/满分
          if (this.showScore && x) {
            const text = this.getTextInfo(subjectiveObj[v])
            // 近似计算文本宽度
            const textWidth = text.length * 14 - text.replace(/[\u4E00-\u9FA5]/g, '').length * 7
            result.push({
              type: 'text',
              text,
              css: {
                position: 'fixed',
                left: (Number.parseFloat(x) || 0) * scale + (Number.parseFloat(w) || 0) * scale - textWidth,
                top: (Number.parseFloat(y) || 0) * scale + 10,
                color: '#F00',
                fontSize: 14,
              },
            })
          }

          // 老师打分痕迹 图片地址有坐标信息（即不是在线考试图片）显示
          if (x && this.examPaper.isExam2) {
            subjectiveObj[v].forEach((k) => {
              if (k.remark2.length) {
                const marks = this.scoreMarks(k.remark2, scale, (Number.parseFloat(x) || 0), (Number.parseFloat(y) || 0), index)
                result.push(...marks)
              }
            })
          }
        }
      })
      return result
    },
    getTextInfo(list) {
      // 多题合并
      if (list.length > 1) {
        const totalScore = list.reduce((acc, cur) => acc + cur.score, 0)
        const totalManfen = list.reduce((acc, cur) => acc + cur.manfen, 0)
        const smallScore = list.map(v => v.score).join(',')
        return `${totalScore}分/${totalManfen}分(小题分:${smallScore})`
      }
      const item = list[0]
      return `${item.score}分/${item.manfen}分`
    },
    // 打分痕迹
    scoreMarks(remarks, scale, left, top, index) {
      const result = []
      remarks.forEach((v) => {
        // 7种类型的痕迹1：矩形 2：文本 3：路径 4：对号 5：叉号 6：半对 10：快捷打分
        const remarksMap = {
          1: () => {
            result.push({
              type: 'view',
              css: {
                position: 'fixed',
                left: (left + v.x) * scale,
                top: (top + v.y) * scale,
                with: v.w * scale,
                height: v.h * scale,
                border: '2px solid #F00',
              },
            })
          },
          2: (font) => {
            result.push({
              type: 'text',
              text: v.content && v.content.split(',')[0],
              css: {
                position: 'fixed',
                left: (left + v.x) * scale,
                top: (top + v.y) * scale,
                color: '#F00',
                fontSize: font || 14,
              },
            })
          },
          3: () => {
            if (!v.content)
              return
            const points = v.content.split(' ').map(k => k.split(',')).map(([x, y]) => [(left + Number.parseFloat(x)) * scale, (top + Number.parseFloat(y)) * scale])
            !this.pointsList[index] && (this.pointsList[index] = [])
            this.pointsList[index].push(points)
          },
          4: (src) => {
            result.push({
              type: 'image',
              src: src || require('../../static/improve/rightTag.png'),
              css: {
                position: 'fixed',
                left: (left + v.x) * scale,
                top: (top + v.y) * scale,
                with: 24,
                height: 24,
              },
            })
          },
          5: () => {
            return remarksMap[4](require('../../static/improve/wrongTag.png'))
          },
          6: () => {
            return remarksMap[4](require('../../static/improve/hrightTag.png'))
          },
          10: () => {
            return remarksMap[2](18)
          },
        }
        remarksMap[v.type] && remarksMap[v.type]()
      })
      return result
    },
    doubleConvert() {
      const { isShuangPing, isScoreConvert } = this.examPaper
      if (!isShuangPing && !isScoreConvert)
        return {}
      const params = {
        index: 0,
        type: 'image',
        css: {
          position: 'fixed',
          top: 10,
          right: 60,
          width: 117,
          height: 117,
        },
      }
      isShuangPing && (params.src = require('../../static/improve/test_img_qzcl.png'))
      isScoreConvert && (params.src = require('../../static/improve/test_img_fszs.png'))
      return params
    },
    // url解析
    // 百度云 example: "https://bj.bcebos.com/v1/ayx-yuejuan/baidu-raw/2857264/32901/3/000309/0493F176-61BA-11EA-B700-C46516196F68.png@c_1,x_203,y_836,w_408,h_522?authorization=bce-auth-v1/d937cfdf182a4a6ca9ad3e02d70c5d3d/2020-03-09T12:33:46Z/604800/host/7f4622a100c7bbfc36fd38d124910e695bbd6482e74fba215369026df807afac"
    urlParser(url, mark = '?', hyphen = '&', keys = '=') {
      const obj = {}
      const res = decodeURIComponent(url).split(mark)
      res[1] && res[1].split(hyphen).forEach((v) => {
        const [key, value] = v.split(keys)
        obj[key] = value
      })
      return {
        url: res[0],
        params: obj,
      }
    },
    // 参数解析
    // 百度云 example: "https://bj.bcebos.com/v1/ayx-yuejuan/baidu-raw/2857264/32901/3/000309/0493F176-61BA-11EA-B700-C46516196F68.png@c_1,x_203,y_836,w_408,h_522"
    queryParser(url) {
      return this.urlParser(url, '@', ',', '_')
    },
    async done(index) {
      const content = this.content[index]
      const points = this.pointsList[index]

      // 如果没有阅卷痕迹，直接返回原图
      if (content.views.length < 2 && !points) {
        uni.hideLoading()
        return this.$emit('success', this.urls[index], index)
      }

      const painter = this.$refs.painter[index]
      await this.drawPoints(painter, index)
      // 生成图片
      painter.canvasToTempFilePathSync({
        fileType: 'png',
        pathType: 'url',
        quality: 1,
        success: (res) => {
          uni.hideLoading()
          this.$emit('success', res.tempFilePath, index)
        },
      })
    },
    // 画老师打分痕迹的路径
    async drawPoints(painter, index) {
      const ctx = await painter.getContext()
      const pointsList = this.pointsList[index]
      if (!pointsList)
        return
      for (let i = 0; i < pointsList.length; i++) {
        const points = pointsList[i]
        const [x, y] = points[0]
        ctx.beginPath()
        ctx.moveTo(x, y)
        for (let m = 1; m < points.length; m++) {
          const point = points[m]
          ctx.lineTo(point[0], point[1])
        }
        ctx.lintWidth = 2
        ctx.strokeStyle = '#F00'
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()
      }
    },
    resetData() {
      this.content = []
      this.objectiveList = []
      this.subjectiveList = []
      this.pointsList = []
      this.clearCache()
    },
    // 清理缓存
    clearCache() {
      const fs = uni.getFileSystemManager()
      const res = fs.statSync(`${uni.env.USER_DATA_PATH}/`, true)
      res.forEach((v) => {
        if (!uni.$u.test.image(v.path))
          return
        fs.unlinkSync(`${uni.env.USER_DATA_PATH}/${v.path}`)
      })
    },
  },
}
</script>
