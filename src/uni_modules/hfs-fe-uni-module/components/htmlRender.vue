<template>
  <div v-katex:auto class="html-render" v-html="prefix + convertContent" />
</template>

<script>
import { characters, cjkMark, latexRegex } from '@/uni_modules/hfs-fe-uni-plugins'

const latexReg = new RegExp(latexRegex, 'gm')
const rules = Object.keys(characters)
const regex = new RegExp(rules.join('|'), 'g')
const cjk = Object.keys(cjkMark)
const cjkRegex = new RegExp(cjk.join('|'), 'g')
export default {
  props: {
    prefix: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
      default: '',
    },
  },
  computed: {
    convertContent() {
      if (!this.content)
        return ''
      // 替换字符
      let result = this.content.replace(regex, matched => characters[rules.find(v => new RegExp(v).test(matched))])
      // 替换中文符号
      result = result.replace(latexReg, match => match.replace(cjkRegex, matched => cjkMark[matched]))
      return result
    },
  },
}
</script>

<style lang="scss" scoped>
.html-render {
  display: inline;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;

  ::v-deep table {
    border: 1rpx solid #e6e6e6;
    border-collapse: collapse;
    min-width: 100%;
    td,
    th {
      border: 1rpx solid #e6e6e6;
    }
  }

  ::v-deep img {
    max-width: 100% !important;
  }
}
</style>
