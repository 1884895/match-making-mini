const colorMap = {
  yellow: '#FFB100',
  green: '#00C81F',
  red: '#E50000',
  black: '#333333',
}
const waveMap = {
  '-1': '下降',
  '0': '持平',
  '1': '上升',
}
// 学科分析-我的位置
export function subjectAnalysisMyPosition(options) {
  const difficultyMap = {
    优秀: { name: '优秀水平', value: 'green' },
    中等偏上: { name: '中等偏上水平', value: 'green' },
    中等: { name: '中等水平', value: 'yellow' },
    中等偏下: { name: '中等偏下水平', value: 'red' },
    较差: { name: '较差行列', value: 'red' },
    较弱: { name: '较弱行列', value: 'red' },
  }
  const trendMap = {
    1: { name: '优势学科', value: 'green' },
    2: { name: '良好学科', value: 'green' },
    3: { name: '弱势学科', value: 'red' },
    4: { name: '劣势学科', value: 'red' },
  }
  const { name, value } = difficultyMap[options.level] || {}
  const { name: waveName, value: waveValue } = trendMap[options.weakAdvantageStatus] || {}
  const p1 = `本次考试，${options.subject || ''}成绩位于<span style="color: #FFBA1D">@yellow@${options.myScoreStage}@@</span>${options.rangeName}，处于同分数段的班级人数<span style="color: ${colorMap.yellow}">@yellow@${options.classStuNum}@@</span>人，年级人数<span style="color: ${colorMap.yellow}">@yellow@${options.gradeStuNum}@@</span>人`
  const p2 = name ? `，在年级对比中属于<span style="color: ${colorMap[value]}">@yellow@${name}@@</span>` : ''
  const p3 = waveName ? `，相对来说${options.subject}是本次考试的<span style="color: ${colorMap[waveValue]}">@${colorMap[waveValue]}@${waveName}@@</span>。` : '。'
  const text = p1 + p2 + p3
  return text.replace(/@@/g, '</span>').replace(/@(.+?)@/g, (_match, p1) => `<span style="color: ${colorMap[p1]}" class="mask-${p1}">`)
}

// 学科分析-难度分析
export function difficultyAnalyze(subject, options, compare) {
  const difficultyLevelMap = {
    中等偏易: '"容易题"、"较易题"、"中等题"',
    中等: '"较易题"、"中等题"、"较难题"',
    中等偏难: '"中等题"、"较难题"、"难题"',
  }
  const { difficultyLevel = '', score = 0, rate = 0 } = options.difficultySum || {}
  const P1 = `本次考试，${subject}学科年级平均得分率为<span style="color: ${colorMap.yellow}">@yellow@${options.scoreRate}@@</span>%，属于<span style="color: ${colorMap.yellow}">@yellow@${difficultyLevel}@@</span>，其中@black@${difficultyLevelMap[difficultyLevel]}@@合计@black@${score}分，占比@black@${rate}@@%`
  const P2 = compare.dlWave || compare.dlWave === 0 ? `，与上场考试相比，@yellow@难度有所${waveMap[compare.dlWave]}@@。` : '。'
  const text = P1 + P2
  return text.replace(/@@/g, '</span>').replace(/@(.+?)@/g, (_match, p1) => `<span style="color: ${colorMap[p1]}" class="mask-${p1}">`)
};
