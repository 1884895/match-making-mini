// 试卷解读
export function allDifficultyAnalyze(options) {
  const guideTemplate = {
    难: '可见试卷难度设置较大，平时要注重难题的练习',
    较难: '试卷难点适度通过考试成绩可以较好的反映该阶段的学习情况',
    中等: '试卷难点适度通过考试成绩可以较好的反映该阶段的学习情况',
    较易: '着重考察本阶段基本知识，结合您家孩子成绩可以看出对基本知识点掌握情况',
    容易: '着重考察本阶段基本知识，结合您家孩子成绩可以看出对基本知识点掌握情况',
  }
  return `本次考试整体难度<span style="color: #FFBA1D">${options.difficulty}</span>，属于<span style="color: #FFBA1D">${options.difficultyLevel}</span>，其中<span style="color: #E50000">${options.hardestSubject}</span>学科难度最高，<span style="color: #00C81F">${options.easiestSubject}</span>学科相比最容易，整体<span style="color: #FFBA1D">${`${options.mostQT}题`}</span>占比较高，<span style="color: #FFBA1D">${guideTemplate[options.mostQT]}</span>。`
}

export function allStructAnalyze(options) {
  return `本次考试<span style="color: #E50000">${options.hardestCountPaper}</span>学科难题数量最多，占单科总分<span style="color: #FFBA1D">${options.hardestCountScoreRate}%</span>，<span style="color: #00C81F">${options.easiestSubject}</span>学科容易题最多，占单科总分<span style="color: #FFBA1D">${options.easiestCountScoreRate}%</span>，本次考试整体题型结构客观题和主观题呈<span style="color: #FFBA1D">${options.structRate}</span>比例。`
}

export function singleDifficultyAnalyze(options) {
  const P1 = `本次试卷难度<span style="color: #FFBA1D">${options.difficulty}</span>，属于<span style="color: #FFBA1D">${options.difficultyLevel}</span>，其中<span style="color: #FFBA1D">${options.mostQT}</span>题<span style="color: #FFBA1D">${options.mostQTScore}</span>分，占比最高<span style="color: #FFBA1D">${options.mostQTRate}%</span>`
  const P2 = options.betterStr ? `，在<span style="color: #00C81F">${options.betterStr}</span>领先班级得分率` : ''
  const P3 = options.weakerStr ? `，在<span style="color: #E50000">${options.weakerStr}</span>落后班级得分率` : ''
  return `${P1 + P2 + P3}。`
}

// 失分总结
export function lostAnalyze(type, userType, options) {
  const guideTemplate = {
    1: {
      难: '平时要针对有难度的试题多做专项练习，突破自己',
      较难: '平时要针对有难度的试题多做专项练习，突破自己',
      中等: '平时要养成收集巩固错题的习惯，稳步提升',
      较易: '平时要注意课堂听讲多练习基础知识',
      容易: '平时要注意课堂听讲多练习基础知识',
    },
    2: {
      难: '建议您的孩子平时要针对有难度的试题多做专项练习，突破自己',
      较难: '建议您的孩子平时要针对有难度的试题多做专项练习，突破自己',
      中等: '建议您的孩子平时要养成收集巩固错题的习惯，稳步提升',
      较易: '建议您的孩子平时要注意课堂听讲多练习基础知识',
      容易: '建议您的孩子平时要注意课堂听讲多练习基础知识',
    },
  }
  const nameMap = {
    1: '你',
    2: '您的孩子',
  }
  const P1 = type ? '本次考试' : '该学科'
  const P2 = (options.mostLostQ && options.mostLostRate) ? `<span style="color: #FFBA1D">${options.mostLostQ}题</span>失分最多，占到总失分<span style="color: #FFBA1D">${options.mostLostRate}%</span>；` : ''
  const P3 = (options.betterStr || options.weakerStr) ? '与同年级对比中在' : ''
  const P4 = options.betterStr ? `<span style="color: #00C81F">${options.betterStr}</span>表现要优于整体水平，` : ''
  const P5 = options.weakerStr ? `<span style="color: #E50000">${options.weakerStr}</span>表现弱于年级水平，` : ''
  const P6 = options.mostLostQ ? `<span style="color: #FFBA1D">${options.mostLostQ}题失分最多${guideTemplate[userType][options.difficultyLevel]}</span>同时通过对比不同层次题型的得分率看出${nameMap[userType]}的差距，` : ''
  return (P1 + P2 + P3 + P4 + P5 + P6).replace(/，$/, '。')
}
export function allImproveAnalyze(userType, options) {
  const guideTemplate = {
    1: options.canRaiseScore ? `本次考试整体可提分空间<span style="color: #FFBA1D">${options.canRaiseScore}</span>分，整体提升后总分年级所处位置就能提升<span style="color: #FFBA1D">${options.canRaiseRank}</span>位，其中<span style="color: #00C81F">${options.maxRaiseSubject}</span>学科提升空间最大，可提升<span style="color: #FFBA1D">${options.maxRaiseScore}</span>分，平时加强对<span style="color: #FFBA1D">${options.maxRaiseSubject}</span>学科的学习。` : '',
    2: options.canRaiseScore ? `您的孩子本次考试整体可提分空间<span style="color: #FFBA1D">${options.canRaiseScore}</span>分，整体提升后总分年级所处位置就能提升<span style="color: #FFBA1D">${options.canRaiseRank}</span>位，其中<span style="color: #00C81F">${options.maxRaiseSubject}</span>学科提升空间最大，可提升<span style="color: #FFBA1D">${options.maxRaiseScore}</span>分，平时加强对<span style="color: #FFBA1D">${options.maxRaiseSubject}</span>学科的学习。` : '',
  }
  return guideTemplate[userType]
}
export function singleImproveAnalyze(options) {
  return (options.canRaiseScore && options.canRaiseRank) ? `该学科可提分空间<span style="color: #FFBA1D">${options.canRaiseScore}</span>分，整体提升后总分年级所处位置就能提升<span style="color: #FFBA1D">${options.canRaiseRank}</span>位。` : ''
}

// 成绩解读
// 成绩分布-解读模版
// type: 0-单科 1-全科
export function distributeAnalyze(type, userType, options, config) {
  const trendMap = {
    '-1': '落后',
    '0': '持平',
    '1': '超出',
  }
  const R1 = {
    1: '通过考试难度和所处位置可以分析出你现阶段学习情况非常扎实，请继续保持住优势。也会因为想要保持完美的成绩而承受巨大的压力。要关注自己的健康发展，正确对待平时的失误。',
    2: '通过考试难度和所处位置可以分析出您的孩子现阶段学习情况非常扎实，请继续保持住优势。孩子也会因为想要保持完美的成绩而承受巨大的压力。家长要关注孩子的健康发展，引导孩子正确对待平时的失误。',
  }
  const R2 = {
    1: '因为本次考试难度比较大，你取得当前名次与优秀学生还是存在一定差距，平时多做练习提升知识薄弱点，消除差距。',
    2: '因为本次考试难度比较大，您的孩子取得当前名次与优秀学生还是存在一定差距，平时多做练习提升知识薄弱点，消除差距。',
  }
  const R3 = {
    1: '虽然本次考试难度比较大但是你的问题不仅仅在于知识的掌握，还有学习方法和学习动力等方面的因素。',
    2: '虽然本次考试难度比较大但是您孩子的问题不仅仅在于知识的掌握，还有学习方法和学习动力等方面的因素。家长应该多多关心、给予鼓励。',
  }
  const R4 = {
    1: '虽然本次考试难度整体比较容易，你能取得好的名次和平常的努力分不开，但是不要骄傲，请继续加油！',
    2: '虽然本次考试难度比较容易，您家孩子能取得好的成绩和平常的努力分不开，但是不要骄傲，请继续加油！',
  }
  const R5 = {
    1: '本次考试难度比较容易结合你的位置，还是需要加强知识扎实度，平时需要多多积累，想要再有提升，需要从学科思维、学习方法等更深层次分析。',
    2: '本次考试难度比较容易结合您家孩子的位置，还是需要加强知识扎实度，平时需要多多积累，想要再有提升，需要从学科思维、学习方法等更深层次分析。',
  }
  const R6 = {
    1: '你的问题不仅仅在于知识的掌握，还有学习方法和学习动力等方面的因素。',
    2: '您孩子的问题不仅仅在于知识的掌握，还有学习方法和学习动力等方面的因素。家长应该多多关心、给予鼓励。',
  }
  const T1 = { 优秀: R1, 中等偏上: R1, 中等: R2, 中等偏下: R2, 较差: R3 }
  const T2 = { 优秀: R4, 中等偏上: R4, 中等: R5, 中等偏下: R5, 较差: R6 }
  const summary = { 难: T1, 较难: T1, 中等: T1, 较易: T2, 容易: T2 }

  const P1 = () => {
    const allP1 = {
      1: `从成绩分布你处于<span style="color: #FFBA1D">${options.level}</span>范围，`,
      2: `从成绩分布您的孩子处于<span style="color: #FFBA1D">${options.level}</span>范围，`,
    }
    const allP21 = {
      1: `<span style="color: #FFBA1D">${trendMap[options.classAvgWave]}班级平均分${options.classAvg}</span>，`,
      2: `<span style="color: #FFBA1D">${trendMap[options.classAvgWave]}班级平均分${options.classAvg}</span>，`,
    }
    const allP22 = {
      1: `<span style="color: #FFBA1D">${trendMap[options.gradeAvgWave]}年级平均分${options.gradeAvg}</span>，`,
      2: `<span style="color: #FFBA1D">${trendMap[options.gradeAvgWave]}年级平均分${options.gradeAvg}</span>，`,
    }
    const allP2 = (config.classAvg === 2 ? allP21[userType] : '') + (config.gradeAvg === 2 ? allP22[userType] : '')
    const allP3 = {
      1: `从整体来看本次考试难度<span style="color: #FFBA1D">${options.difficulty}</span>属于<span style="color: #FFBA1D">${options.difficultyLevel}</span>，`,
      2: `从整体来看本次考试难度<span style="color: #FFBA1D">${options.difficulty}</span>属于<span style="color: #FFBA1D">${options.difficultyLevel}</span>，`,
    }
    const singleP1 = {
      1: `该学科你处于<span style="color: #FFBA1D">${options.level}</span>范围，`,
      2: `该学科您的孩子处于<span style="color: #FFBA1D">${options.level}</span>范围，`,
    }
    const singleP21 = {
      1: `<span style="color: #FFBA1D">${trendMap[options.classAvgWave]}班级平均分${options.classAvg}</span>，`,
      2: `<span style="color: #FFBA1D">${trendMap[options.classAvgWave]}班级平均分${options.classAvg}</span>，`,
    }
    const singleP22 = {
      1: `<span style="color: #FFBA1D">${trendMap[options.gradeAvgWave]}年级平均分${options.gradeAvg}</span>，`,
      2: `<span style="color: #FFBA1D">${trendMap[options.gradeAvgWave]}年级平均分${options.gradeAvg}</span>，`,
    }
    const singleP2 = (config.classAvg === 2 ? singleP21[userType] : '') + (config.gradeAvg === 2 ? singleP22[userType] : '')
    const singleP3 = {
      1: `本次考试难度<span style="color: #FFBA1D">${options.difficulty}</span>属于<span style="color: #FFBA1D">${options.difficultyLevel}</span>，`,
      2: `本次考试难度<span style="color: #FFBA1D">${options.difficulty}</span>属于<span style="color: #FFBA1D">${options.difficultyLevel}</span>，`,
    }
    return type ? allP1[userType] + allP2 + allP3[userType] : singleP1[userType] + singleP2 + singleP3[userType]
  }

  const P2 = summary[options.difficultyLevel][options.level][userType]

  return P1() + P2
}

// 成绩趋势-解读模版
export function scoreTrend(userType, options) {
  const trendMap = {
    '-1': {
      name: '下降',
      color: '#E50000',
    },
    '0': {
      name: '平稳',
      color: '#FFBA1D',
    },
    '1': {
      name: '增长',
      color: '#00C81F',
    },
  }
  const guideMap = {
    1: `从成绩趋势可以看出你的成绩<span style="color: ${trendMap[options.scoreWave].color}">${trendMap[options.scoreWave].name}</span>趋势，班级排名<span style="color: ${trendMap[options.classRankWave].color}">${trendMap[options.classRankWave].name}</span>，年级排名<span style="color: ${trendMap[options.gradeRankWave].color}">${trendMap[options.gradeRankWave].name}</span>，`,
    2: `从成绩趋势可以看出您家孩子成绩<span style="color: ${trendMap[options.scoreWave].color}">${trendMap[options.scoreWave].name}</span>趋势，班级排名<span style="color: ${trendMap[options.classRankWave].color}">${trendMap[options.classRankWave].name}</span>，年级排名<span style="color: ${trendMap[options.gradeRankWave].color}">${trendMap[options.gradeRankWave].name}</span>，`,
  }
  const R1 = {
    '1': {
      '1': '请继续保持努力优势，不要骄傲。',
      '-1': '保持好当前学习状态，请继续努力！',
    },
    '-1': {
      '1': '成绩呈下降，需要注意分析原因。',
      '-1': '整体呈下降趋势需要家长注意一下。',
    },
  }
  const R2 = {
    '1': {
      '1': '请保持好学习的状态，再接再厉！',
      '-1': '成绩呈增长，距离优秀还有一定距离，请继续加油！',
    },
    '-1': {
      '1': '成绩呈下降，需要注意分析原因。',
      '-1': '最近学习成绩呈下降趋势需要家长注意一下。',
    },
  }
  const R3 = {
    '1': {
      '1': '很棒的学习状态，再进一步，加油！！',
      '-1': '很棒的学习状态，再进一步，加油！！',
    },
    '-1': {
      '1': '寻找适合的学习方法，培养好的学习习惯。',
      '-1': '寻找适合的学习方法，培养好的学习习惯。',
    },
  }
  const P1 = guideMap[userType]
  const summary = { 优秀: R1, 中等偏上: R1, 中等: R2, 中等偏下: R2, 较差: R3 }
  const P2 = summary[options.level][options.scoreWave][options.gradeRankWave]
  return P1 + P2
}

// 学科分析-解读模版
export function subjectAnalyze(options) {
  const P1 = '本次考试'
  const P2 = options.better ? `优势学科为<span style="color: #00C81F">${options.better}</span>；` : ''
  const P3 = options.weakerStr ? `薄弱学科为<span style="color: #E50000">${options.weakerStr}</span>，` : ''
  const P4 = '绿色表示学科成绩比较好，高度越高，成绩越好。红色代表学生学科成绩需注意提高，高度越高，越需要学生注意。'
  return (options.better || options.weakerStr) ? P1 + P2 + P3 + P4 : ''
}
