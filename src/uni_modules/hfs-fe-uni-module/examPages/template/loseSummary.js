const colorMap = {
  yellow: '#FFB100',
  green: '#00C81F',
  red: '#E50000',
  black: '#333333',
}

function parseText(text) {
  return text.replace(/@@/g, '</span>').replace(/@(.+?)@/g, (_match, p1) => `<span style="color: ${colorMap[p1]}" class="mask-${p1}">`)
}

export function losePointsDistribution(questionTypeList, subject, options) {
  const getText = (baseList, next) => {
    const typeList = questionTypeList.filter(v => baseList.includes(v.type))
    const score = typeList.reduce((p, v) => p + v.myLost, 0)
    const scores = typeList.reduce((p, v) => p + v.score, 0)
    const baseArr = baseList.map(v => `@red@${v}@@题`)
    const mark = '、'
    const textMap = {
      1: `${scores > 0 ? `${baseArr.join(mark)}已被你轻松拿下，` : ''}建议挑战@yellow@${next}题@@，实现自我突破！`,
      2: `${baseArr.join(mark)}仅丢了@black@${score}@@分，可以快速订正，然后重点聚焦@yellow@${next}题@@，向更高水平迈进！`,
      3: `${baseArr.join(mark)}丢了@black@${score}@@分，需要花费一定量的时间，认真复习。同时，还需要分配一定时间在@yellow@${next}题@@上，实现稳步提升。`,
      4: `${baseArr.join(mark)}丢了@black@${score}@@分，可以优先查缺补漏，巩固基础。在学有余力情况下，再挑战部分@yellow@${next}题@@，适当拓展。`,
    }
    return textMap[options.lostType]
  }
  const levelMap = {
    优秀: () => {
      const max = questionTypeList.reduce((p, v) => p.myRatio < v.myRatio ? v : p)
      return `其中@red@${max.type}@@题失分@black@${max.myLost}@@分，占比最高，需要重点关注。`
    },
    良好: () => {
      const baseList = ['容易', '较易', '中等', '较难']
      return getText(baseList, '难')
    },
    中等: () => {
      const baseList = ['容易', '较易', '中等']
      return getText(baseList, '较难')
    },
    偏弱: () => {
      const baseList = ['容易', '较易']
      return getText(baseList, '中等')
    },
  }
  const text = `在${subject}学科，成绩@yellow@${options.relationLevel}@@，${levelMap[options.relationLevel]()}`
  return parseText(text)
}

export function losePointsContrast(questionTypeList) {
  const getText = (type, lost) => {
    const goodText = questionTypeList.filter(v => v.myLost < v[lost]).map(v => `@green@${v.type}@@题`).join('、')
    const badText = questionTypeList.filter(v => v.myLost > v[lost]).map(v => `@red@${v.type}@@题`).join('、')
    if (!goodText && !badText)
      return ''
    let text = `与@yellow@${type}@@对比中`
    goodText && (text += `在${goodText}失分表现要优于整体水平；`)
    badText && (text += `在${badText}失分表现弱于整体水平；`)
    return text
  }
  const getRatioText = () => {
    const ratioNextList = questionTypeList.map((v, i) => {
      const nextType = questionTypeList[i + 1] || {}
      if (v.score > 0 && nextType.score > 0 && Math.round(v.myRatio * 100) > Math.round(nextType.myRatio * 100)) {
        v.nextType = nextType
      }
      return v
    }).filter(v => v.nextType)
    if (ratioNextList.length) {
      const nextText = ratioNextList.map(v => `@red@${v.type}@@题的失分比例比@red@${v.nextType.type}@@题高`).join('，')
      const typeText = ratioNextList.map(v => `@red@${v.type}@@题`).join('、')
      return `<br/>${nextText}，有些异常，需要重点分析一下${typeText}的失分情况。除了知识和能力因素外，虽然存在一定的偶然性，但更可能是平时的练习习惯问题，比如读题粗心或者漏题等，需要针对性改进。`
    }
    return '<br/>各类题的失分占比，与题的难题，比较一致，重点加强知识的查缺补漏。'
  }
  const text = `${getText('班级', 'classLost')}${getText('年级', 'gradeLost')}${getRatioText()}`
  return parseText(text)
}
