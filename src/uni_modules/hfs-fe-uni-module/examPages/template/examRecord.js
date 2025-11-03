const colorMap = {
  yellow: '#FFBA1D',
  green: '#00C81F',
  red: '#E50000',
  black: '#333333',
}
function parseText(text) {
  return text.replace(/@@/g, '</span>').replace(/@(.+?)@/g, (_match, p1) => `<span style="color: ${colorMap[p1]}" class="mask-${p1}">`)
}
export function subjectBalance(options) {
  const P1 = '以学生各学科的成绩指数为基础绘制，图形越均衡说明学科偏科现象越轻，图形阴影面积越大说明成绩越好。'
  const P2 = `<div>拖后腿学科：<span style="color:#E50000">${options.weaker}</span></div>`
  return P1 + P2
}

export function improveSpace(userType, options) {
  const T1 = '@black@继续保持当前的状态，在考试中保持自信和专注。相信自己的实力和付出，并用积极的心态迎接挑战。期待下一次考试顺利，取得优异的成绩！@@'
  const T2 = '@black@在日常学习过程中应注意基础知识的学习，多注意课堂听讲，多巩固错题。对于薄弱知识点要找到科学的学习方法。期待下一次考试的优秀发挥。@@'
  const R1 = {
    1: `通过你考试的整体表现，处于@yellow@${options.level}@@范围。<br>`,
    2: `通过您家孩子考试的整体表现，处于@yellow@${options.level}@@范围。<br>`,
  }
  const R2 = {
    1: { 优秀: T1, 中等偏上: T1, 中等: T2, 中等偏下: T2, 较差: '@black@建议首先要培养好的学习态度，寻找合适的学习方法和学习动力。@@', 较弱: '@black@建议首先要培养好的学习态度，寻找合适的学习方法和学习动力。@@' },
    2: { 优秀: T1, 中等偏上: T1, 中等: T2, 中等偏下: T2, 较差: '@black@建议首先要培养好的学习态度，寻找合适的学习方法和学习动力，作为家长的您应该多多关心、给予鼓励。@@', 较弱: '@black@建议首先要培养好的学习态度，寻找合适的学习方法和学习动力，作为家长的您应该多多关心、给予鼓励。@@' },
  }
  const P1 = R1[userType]
  const P2 = R2[userType][options.level]
  return parseText(P1 + P2)
}
