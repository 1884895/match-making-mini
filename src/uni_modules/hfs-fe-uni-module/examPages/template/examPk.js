const colorMap = {
  yellow: '#FFB100',
}
const waveMap = {
  '-1': '下降',
  '0': '持平',
  '1': '上升',
}
// 考试pk总结
export function examSummary(options) {
  const { exam1Title, exam2Title, score, scoreWave, classRank, classRankWave, gradeRank, gradeRankWave, winIndex } = options || {}
  const scoreText = waveMap[scoreWave] + (scoreWave ? `${score}分` : '')
  const gradeRankText = waveMap[gradeRankWave] + (gradeRankWave ? `${gradeRank}名` : '')
  const classRankText = waveMap[classRankWave] + (classRankWave ? `${classRank}名` : '')
  const allMap = { 0: '优于', 1: '弱于', 2: '持平于' }
  return `${exam1Title}与${exam2Title}相对比成绩<span style="color: ${colorMap.yellow}">${scoreText}</span>，年级排名<span style="color: ${colorMap.yellow}">${gradeRankText}</span>，班级排名<span style="color: ${colorMap.yellow}">${classRankText}</span>，整体表现要${allMap[winIndex]}对比考试。`
}

// 考试pk-单科总结
export function subjectSummary(options) {
  return `${options.subject}学科相对比成绩<span style="color: ${colorMap.yellow}">${waveMap[options.scoreWave]}${options.score}分</span>，年级排名<span style="color: ${colorMap.yellow}">${waveMap[options.gradeRankWave]}${options.gradeRank}名</span>，班级排名<span style="color: ${colorMap.yellow}">${waveMap[options.classRankWave]}${options.classRank}名</span>。`
};
