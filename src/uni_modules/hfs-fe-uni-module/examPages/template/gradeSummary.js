const colorMap = {
  yellow: '#FFB100',
  green: '#00C81F',
  red: '#E50000',
  black: '#333333',
}

// 基础的变量样式 黄色
const baseStyle = 'style="color: #FFBA1D"'

// 成绩总览-我的位置
export function summaryMyPosition(options) {
  const T0 = `${options.studentName}同学`
  const T1 = `位于<span ${baseStyle}>@yellow@${options.myScoreStage}@@</span>${options.rangeName}，`
  const L1 = `处于同分数段的班级人数<span ${baseStyle}>@yellow@${options.classStuNum}@@</span>人，年级人数<span ${baseStyle}>@yellow@${options.gradeStuNum}@@</span>人，在年级对比中属于<span ${baseStyle}>@yellow@${options.level}水平@@</span>，`
  const L2 = (!options.improveScore || options.improveScore === '0') ? '' : `迈入更高分数段还需再提升<span ${baseStyle}>@yellow@${options.improveScore}@@</span>分。`
  const L3 = {
    较弱: '提升空间大，做好错题订正，就能有提升！',
    中等偏下: '所有的差距都可以用努力缩短！',
    中等: '坚持努力，争取突破成绩瓶颈期！',
    中等偏上: '距离优秀行列已经很近了，加油！',
    优秀: '此分数段高手如云，保持优秀就是保持持续超越！',
  }
  const R1 = `${L1}${L2}@black@${L3[options.level]}@@`
  const R2 = `${L1}@black@${L3[options.level]}@@`
  const T2 = { 较弱: R1, 中等偏下: R1, 中等: R1, 中等偏上: R1, 优秀: R2 }
  const WHAT = T0 + T1 + T2[options.level]
  const HOW = {
    较弱: '建议根据好分数智能推荐做好错题订正，打好基础，稳步提升！',
    中等偏下: '建议根据好分数智能推荐做好错题订正，清除薄弱扫除盲区！',
    中等: '建议根据好分数智能推荐做好错题订正，清除卡壳点、开拓新思路，潜移默化中习得高效复习方式！',
    中等偏上: '建议根据好分数智能推荐做好错题订正，消灭薄弱，追平距离优秀的最后一公里，我们顶峰见！',
    优秀: '建议根据好分数智能推荐做好错题订正之余，多练举一反三题，在开拓视野中磨砺锋芒！',
  }
  const text = `${WHAT}<br>@black@${HOW[options.level]}@@`
  return parseText(text)
};
// 成绩总览-同层次对比
export function summarySameLevelCompare(options) {
  const { level = '', studentName = '', count = 0, myIndex = 0, beat = 0, myScore = 0, max = 0, levels = [] } = options
  const P1 = `此次考试，${studentName}同学与年级中的<span ${baseStyle}>@yellow@${count}@@</span>人同处于<span ${baseStyle}>@yellow@${level}@@</span>层级。`
  const sameLevel = levels[myIndex]
  const P2 = `击败了同层级<span ${baseStyle}>@yellow@${beat}%@@</span>的学生，在同层对比中属于<span ${baseStyle}>@yellow@${sameLevel.level}@@</span>。`
  const scoreText = myScore >= 0 ? `由上图可知，${studentName}同学与同层<span ${baseStyle}>@yellow@${sameLevel.level}@@</span>水平最高分相差<span ${baseStyle}>@yellow@${Number.parseFloat((sameLevel.max - myScore).toFixed(2))}@@</span>分，与层级最高分相差<span ${baseStyle}>@yellow@${Number.parseFloat((max - myScore).toFixed(2))}@@</span>分。` : ''
  return parseText(`${P1}<br>${P2}${scoreText}<br>了解与同层级同学的分差有助于制定合理的短期目标，在一个个小目标达成中<span ${baseStyle}>完成层级跃迁！</span>记得定个小目标哦～`)
}
// 成绩总览-难度分析
export function summaryDifficultyAnalyze(options) {
  const P1 = `本场考试年级得分率<span ${baseStyle}>@yellow@${options.scoreRate}@@</span>%，整体题目<span ${baseStyle}>@yellow@${options.difficultyLevel}@@</span>。`
  // const P2 = options && options.changeValue ? `与上场考试相比，难度有所<span ${baseStyle}>@yellow@${options.changeValue}@@</span>。` : '';
  const P3 = '其中，'
  const P4 = {
    中等偏易: `<span ${baseStyle}>@yellow@${options.difficultyLevel}@@</span>题占比较高<span ${baseStyle}>@yellow@${options.rate}@@</span>%，此类题侧重于考察对@black@单一知识的了解、识记、理解及多知识点的简单运用@@。`,
    中等: `<span ${baseStyle}>@yellow@${options.difficultyLevel}@@</span>题占比较高<span ${baseStyle}>@yellow@${options.rate}@@</span>%，此类题侧重于考察对@black@单一知识的识记、理解及多知识点的运用@@。`,
    中等偏难: `<span ${baseStyle}>@yellow@${options.difficultyLevel}@@</span>题占比较高<span ${baseStyle}>@yellow@${options.rate}@@</span>%，此类题侧重于考察对@black@知识点的理解、掌握及综合运用@@。`,
  }
  const WHAT = P1 + P3 + P4[options.difficultyLevel]
  const HOW = '在了解整体考试难度后，可以继续查看学科优劣势。 '
  const text = `${WHAT}<br>${HOW}`
  return parseText(text)
}
export function difficultyAnalysis(options) {
  const { subject = '', scoreRate = 0, rateConfig = [], level = '', wave = 0 } = options || {}
  if (!rateConfig || rateConfig.length === 0) {
    return parseText(`本次考试年级得分率：<span ${baseStyle}>@yellow@${scoreRate}@@</span>得分率在0-1范围之内，越大代表越简单反之越难。`)
  }
  const S1 = `${!subject ? '本次考试' : `<span ${baseStyle}>@yellow@${subject}@@</span>学科`}年级得分率：<span ${baseStyle}>@yellow@${scoreRate}@@</span>，`
  const S2 = `根据平台大数据分析${!subject ? '考试' : `<span ${baseStyle}>@yellow@${subject}@@</span>学科`}平均得分率：<span ${baseStyle}>@yellow@${rateConfig[1]}@@</span>，`
  const S3 = '绝大多数得分率分布在：' + `<span ${baseStyle}>@yellow@${rateConfig[0]}@@</span>至<span ${baseStyle}>@yellow@${rateConfig[2]}@@</span>之间，`
  const S4 = ['得分率低于平均得分率，', '得分率与平均得分率接近，', '得分率高于平均得分率，']
  return parseText(`${S1 + S2 + S3 + S4[wave]}<span ${baseStyle}>@yellow@${level}@@</span>。`)
}
// 成绩总览-学科优劣势
export function summarySubjectStrengthAndWeakness(options) {
  const colors = {
    '-1': '#E50000',
    '0': '#FFB100',
    '1': '#00C81F',
  }
  const trendInfo = {
    0: { name: '落后', color: '@red@' },
    1: { name: '相接近', color: '@yellow@' },
    2: { name: '领先', color: '@green@' },
  }
  const S1 = splitFunc(options[2], trendInfo[2].name, trendInfo[2].color, colors[1])
  const S2 = splitFunc(options[0], trendInfo[0].name, trendInfo[0].color, colors[-1])
  const S3 = splitFunc(options[1], trendInfo[1].name, trendInfo[1].color, colors[0])

  const WHAT = `在与${options.type}平均水平对比中，${[S1, S2, S3].filter(v => v !== '').join('，')}。`
  const HOW = () => {
    if (S2 + S3 === '') {
      return `<span>@black@各学科全面领先，为${options.studentName}同学点赞！通过考后提升@@<span style="color: #FFBA1D">@yellow@“黄金3步法”@@</span>@black@及时进行@@<span style="color: #FFBA1D">@yellow@错题订正@@</span>@black@及举一反三@@<span style="color: #FFBA1D">@yellow@练习@@</span>@black@，持续见好题@@！</span>`
    }
    if (S1 + S3 === '') {
      return '<span>@black@暂时落后的日子都用来积蓄力量吧！通过考后提升@@<span style="color: #FFBA1D">@yellow@“黄金3步法”@@</span>@black@及时进行@@<span style="color: #FFBA1D">@yellow@错题订正@@</span>@black@及@@<span style="color: #FFBA1D">@yellow@练习@@</span>@black@，持续向下扎根、向上生长@@！</span>'
    }
    if (S1 + S2 === '') {
      return '<span>@black@各学科均接近平均水平，向前一步即可迈进更高水平！通过考后提升@@<span style="color: #FFBA1D">@yellow@“黄金3步法”@@</span>@black@及时进行@@<span style="color: #FFBA1D">@yellow@错题订正@@</span>@black@及@@<span style="color: #FFBA1D">@yellow@举一反三练习@@</span>@black@，突破成绩瓶颈期@@！</span>'
    };
    return '<span>@black@木桶能装多少水，取决于桶壁上最短的那块木板！通过考后提升@@<span style="color: #FFBA1D">@yellow@“黄金3步法”@@</span>@black@及时进行@@<span style="color: #FFBA1D">@yellow@错题订正@@</span>@black@及@@<span style="color: #FFBA1D">@yellow@练习@@</span>@black@，巩固优势、补足弱势@@！</span>'
  }
  const text = `${WHAT}<br>${HOW()}`
  return parseText(text)
};

/**
 * 通用的拼接 学科数组的方法
 * 返回值eg ： 优势学科：语文、数学
 * @param {科目数组} subjectList
 * @param {科目趋势描述} trend
 * @param {趋势蒙层颜色} trendColor
 * @param {科目蒙层颜色} subjectColor
 * @return
 */
function splitFunc(subjectList, trend, trendColor, subjectColor) {
  let result = ''
  if (subjectList && subjectList.length) {
    result += `${trend}学科是`
    subjectList.forEach((subject, index) => {
      result += `<span style="color:${subjectColor}">${trendColor}${subject}@@</span>`
      if (index !== subjectList.length) {
        result += index !== subjectList.length - 1 ? '、' : ''
      }
    })
  }
  return result
}
/**
 * 通用的替换蒙层效果的方法
 * @param {文本} text
 * @return
 */
function parseText(text) {
  return text.replace(/@@/g, '</span>').replace(/@(.+?)@/g, (_match, p1) => `<span style="color: ${colorMap[p1]}" class="mask-${p1}">`)
}
