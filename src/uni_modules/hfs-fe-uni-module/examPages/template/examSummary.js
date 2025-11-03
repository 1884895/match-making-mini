const colorMap = {
  '-1': '#E50000',
  '0': '#FFBA1D',
  '1': '#00C81F',
}

const userMap = {
  1: '你的',
  2: '您的孩子',
}

const trendMap = {
  '-1': '下降',
  '0': '持平',
  '1': '提升',
}

const scoreRangeMap = {
  '-1': '***',
  '0': '保持稳定',
  '1': '略有提升，请继续努力',
  '2': '略有下降',
  '3': '小幅提升，保持住这个趋势',
  '4': '小幅下降',
  '5': '提升很大',
  '6': '下降很大，需要引起关注',
  '7': '突飞猛进',
  '8': '大幅下降，需要关注最近的学习状态',
}

const rankRangeMap = {
  '-1': '***',
  '0': '保持稳定',
  '1': '小幅提升',
  '2': '小幅下降',
  '3': '提升很大',
  '4': '下降很大，需要引起关注',
  '5': '突飞猛进',
  '6': '大幅下降，需要引起关注',
}

export function examSummary(userType, studentName, isMember, level, compare, guide, config) {
  const P2 = {
    1: {
      优秀: '祝贺你，本次考试成绩很优秀！',
      中等偏上: '祝贺你，本次考试成绩位于较优秀之列！',
      中等: '本次考试成绩不错哦，但与优秀比较还存在一定的差距。',
      中等偏下: '本次考试的成绩，与优秀学生比较还存在有一定的差距。',
      较弱: '从本次的考试成绩看，差距还是存在的。',
      较差: '从本次的考试成绩看，差距还是存在的。',
    },
    2: {
      优秀: `向您祝贺，<span style="color: ${colorMap[0]}">${studentName}</span>同学的成绩很优秀啦！`,
      中等偏上: `向您祝贺，<span style="color: ${colorMap[0]}">${studentName}</span>同学的成绩位于较优秀之列！`,
      中等: `<span style="color: ${colorMap[0]}">${studentName}</span>同学本次考试的成绩不错，但与优秀比较还存在一定的差距。`,
      中等偏下: `<span style="color: ${colorMap[0]}">${studentName}</span>同学本次考试的成绩，与优秀学生比较还存在有一定的差距。`,
      较弱: `从<span style="color: ${colorMap[0]}">${studentName}</span>同学本次的考试成绩看，差距还是比较大。`,
      较差: `从<span style="color: ${colorMap[0]}">${studentName}</span>同学本次的考试成绩看，差距还是比较大。`,
    },
  }
  const P3 = () => {
    if (!compare)
      return ''
    const { scoreType, rankType, classRank: classRankType, gradeRank: gradeRankType } = config
    const { score, scoreWave, scoreRange, classRankWave, classRank, classRankRange, gradeRankWave, gradeRank, gradeRankRange } = compare
    const isRank = rankType === 2 || rankType === 5
    const trendScore = scoreType === 2 ? `<span style="color: ${colorMap[scoreWave]}">${trendMap[scoreWave]}${scoreWave === 0 ? '' : `${score}分`}</span>` : `<span style="color: ${colorMap[scoreRange === 0 ? 0 : scoreRange === -1 || scoreRange % 2 === 0 ? -1 : 1]}">${scoreRangeMap[scoreRange]}</span>`
    const trendClassRank = isRank && (classRankType === 2) ? `<span style="color: ${colorMap[classRankWave]}">${trendMap[classRankWave]}${classRankWave === 0 ? '' : `${classRank}名`}</span>` : `<span style="color: ${colorMap[classRankRange === 0 ? 0 : classRankRange === -1 || classRankRange % 2 === 0 ? -1 : 1]}">${rankRangeMap[classRankRange]}</span>`
    const trendGradeRank = isRank && (gradeRankType === 2) ? `<span style="color: ${colorMap[gradeRankWave]}">${trendMap[gradeRankWave]}${gradeRankWave === 0 ? '' : `${gradeRank}名`}</span>` : `<span style="color: ${colorMap[gradeRankRange === 0 ? 0 : gradeRankRange === -1 || gradeRankRange % 2 === 0 ? -1 : 1]}">${rankRangeMap[gradeRankRange]}</span>`
    return `对比上一次${userMap[userType]}考试成绩${trendScore}，班级排名${trendClassRank}，年级排名${trendGradeRank}。`
  }
  const P4 = () => {
    const { paperNum, bestSubject, bestSubjectUnexpectLostScore: score, worstSubject, worstSubjectExcellentQuestionNum: num } = guide
    if ((score + num <= 0) || paperNum === 1)
      return ''
    const str = `这次考试中<span style="color: ${colorMap[1]}">${bestSubject}</span>学科表现最优秀，继续保持学科优势！相对来说<span style="color: ${colorMap[-1]}">${worstSubject}</span>学科表现最弱，不过也有<span style="color: ${colorMap[0]}">${num}</span>题的答题表现超出同层次的平均水平，还是很有潜力的。希望再接再厉。`
    const openVip = !isMember && userType === 2 ? `<a style="color: ${colorMap[-1]}">开通会员查看更详细的内容带您读懂考试。</a>` : ''
    return `${str}${openVip}`
  }
  return {
    P2: config.scoreComment === 2 ? P2[userType][level] : '',
    P3: P3(),
    P4: P4(),
  }
}
