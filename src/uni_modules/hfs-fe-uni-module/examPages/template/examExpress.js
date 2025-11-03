/**
 * A
 * bestSubject: '数学',      // M3-D1-1
 * gradeRank: 187,         // M3-D1-2
 * gradeRankType: 1        // enums.RankType 1-班级所处位置 2-排名 3-击败率 4-学历 5-不显示
 * gradeDefeatRatio: 30,   // 年级击败率，等第开启时返回-1
 * gradeRankPart: 'A1',    // 年级等第，非会员：A、B、C、D、E，会员：A1~A5...E，
 * difference: 18,         // M3-D1-3
 * contribution: 10,       // M3-D1-4
 * unexpectLost: 18        // M3-D1-5
 *
 * B
 * worstSubject: '数学', // M3-D2-1
 * gradeRank: 19,          // M3-D2-2
 * gradeRankType: 1        //enums.RankType 1-班级所处位置 2-排名 3-击败率 4-学历 5-不显示
 * gradeDefeatRatio: 30,   // 年级击败率，等第开启时返回-1
 * gradeRankPart: 'A1',    // 年级等第，非会员：A、B、C、D、E，会员：A1~A5...E，
 * difference: 18,         // M3-D2-3
 * contribution: -1        // M3-D2-4
 *
 * C
 * subject: '数学',
 * excellentQuestions: [{
 *  questionId: '5a1170a50000094f3bb29a73',
 *  name: '一.1',
 *  difference: 3.12,
 *  type: 1,        // enums.QusetionType
 *  knowledge: [{
 *   id: 120981
 *   name: '一元二次方程'
 *  }]
 * }]
 *
 * D
 * subject: '数学',
 * unexpectWrongQuestions: [{
 *   questionId: '5a1170a50000094f3bb29a73',
 *   name: '一.1',
 *   difference: 3.12,
 *   type: 1,        // enums.QusetionType
 *   knowledge: [{
 *     id: 120981,
 *     name: '一元二次方程'
 *   }]
 * }]，
 * canRaiseWrongQuestions: [{
 *   questionId: '5a1170a50000094f3bb29a73',
 *   name: '一.1',
 *   difference: 3.12,
 *   type: 1,        // enums.QusetionType
 *   knowledge: [{
 *     id: 120981,
 *     name: '一元二次方程'
 *   }]
 * }]
 */
export function examExpress(userType, select, options, isMember, config) {
  const P1A = (subject) => {
    return {
      1: `这次考试你表现最好的学科是<span style="color: #FFBA1D">${subject}</span>学科。`,
      2: `这次考试您孩子表现最好的学科是<span style="color: #FFBA1D">${subject}</span>学科。`,
    }
  }
  const P1B = (subject) => {
    return {
      1: `这次考试你表现最不足的学科是<span style="color: #FFBA1D">${subject}</span>学科。`,
      2: `这次考试您孩子表现最不足的学科是<span style="color: #FFBA1D">${subject}</span>学科。`,
    }
  }
  const P2 = {
    1: '是否意外？评价学科表现不单纯看分数高低，因为各科考试有难有易，还要看自己在全体同学中的相对表现，以及综合评估自身能力后的具体表现。',
    2: '是否意外？评价孩子的学科表现不单纯看分数高低，因为各科考试有难有易，还要看他在全体学生中的相对表现，以及综合评估自身能力后的具体表现。',
  }
  const A = () => {
    const P3 = {
      1: `以下几条诊断信息，可以帮助你了解<span style="color: #FFBA1D">${options.bestSubject}</span>学科的情况：`,
      2: `以下几条诊断信息，可以帮助您了解<span style="color: #FFBA1D">${options.bestSubject}</span>学科的情况：  `,
    }
    const P31func = () => {
      let P31 = '- 这个学科的成绩是各学科中最靠前的，'
      if (config.rankDegree === 2) {
        switch (options.gradeRankType) {
          case 1:
            P31 += `在全校处于<span style="color: #FFBA1D">${options.gradeRank}</span>位`
            break
          case 2:
            P31 += `在全校排第<span style="color: #FFBA1D">${options.gradeRank}</span>名`
            break
          case 3:
            P31 += `击败了学校<span style="color: #FFBA1D">${options.gradeDefeatRatio}%</span>的学生`
            break
          case 4:
          case 5:
            break
          default:
            P31 += `在全校处于<span style="color: #FFBA1D">${options.gradeRank}</span>位`
            break
        }
      }
      else {
        P31 += `所处年级等第为<span style="color: #FFBA1D">${options.gradeRankPart}</span>，`
      }
      P31 += '在本次考试中是相对有优势的学科。'
      return P31
    }
    const P32 = {
      1: `- 与同类水平的同学相比，你在这科的表现比他们更突出，分数高出<span style="color: #FFBA1D">${Number.parseFloat(options.difference.toFixed(2))}</span>分！你要注意保持这个优势，要知道“不进则退”哦。`,
      2: `- 与同类水平学生群体的特征比较，您孩子在这科的表现比他们更突出，分数高出<span style="color: #FFBA1D">${Number.parseFloat(options.difference.toFixed(2))}</span>分！要让孩子注意保持这个优势，要知道“不进则退”啊。`,
    }
    const P33 = {
      1: `- 从自身的综合水平来看，这科成绩对总分提高的作用比其它学科都大，贡献率为<span style="color: #FFBA1D">${options.contribution}</span>，更是超越了拖后腿的学科。`,
      2: `- 从您孩子自身的综合水平看，这科成绩对他总分提高的作用比其它学科都大，贡献率为<span style="color: #FFBA1D">${options.contribution}</span>，更是超越了拖后腿的学科。${isMember ? '' : '详细了解各学科发展水平，建议购买完整报告。'}`,
    }
    return {
      P1: P1A(options.bestSubject)[userType],
      P2: P2[userType],
      P3: P3[userType],
      P31: P31func(),
      P32: options.difference > 0 ? P32[userType] : '',
      P33: options.contribution > 0 ? P33[userType] : '',
    }
  }

  const B = () => {
    const P3 = {
      1: `以下几条诊断信息，可以帮助你了解<span style="color: #FFBA1D">${options.worstSubject}</span>学科的情况：`,
      2: `以下几条诊断信息，可以帮助您了解<span style="color: #FFBA1D">${options.worstSubject}</span>学科的情况：  `,
    }
    const P31func = () => {
      let P31 = '- 这个学科的成绩是各学科中最靠后的，'
      if (config.rankDegree === 2) {
        switch (options.gradeRankType) {
          case 1:
            P31 += `在全校处于<span style="color: #FFBA1D">${options.gradeRank}</span>位`
            break
          case 2:
            P31 += `在全校排第<span style="color: #FFBA1D">${options.gradeRank}</span>名`
            break
          case 3:
            P31 += `击败了学校<span style="color: #FFBA1D">${options.gradeDefeatRatio}%</span>的学生`
            break
          case 4:
          case 5:
            break
          default:
            P31 += `在全校处于<span style="color: #FFBA1D">${options.gradeRank}</span>位`
            break
        }
      }
      else {
        P31 += `所处年级等第为<span style="color: #FFBA1D">${options.gradeRankPart}</span>，`
      }
      P31 += '在本次考试中是相对薄弱的学科。'
      return P31
    }
    const P32 = {
      1: `- 与同类水平的同学相比，你在这科的表现比他们有逊色，分数低了<span style="color: #FFBA1D">${Number.parseFloat(options.difference.toFixed(2))}</span>分。你要加油弥补这个差距，及时补齐短板哦。`,
      2: `- 与同类水平学生群体的特征比较，您孩子这科的表现比他们有逊色，分数低了<span style="color: #FFBA1D">${Number.parseFloat(options.difference.toFixed(2))}</span>分。要让孩子注意弥补这个差距，及时补齐短板。`,
    }
    const P33 = {
      1: `- 从自身的综合水平来看，这科成绩对总分提高有拖后腿的现象，贡献率为<span style="color: #FFBA1D">${options.contribution}</span>，${options.contribution < 0 ? '是负值，' : ''}不是很理想呢。`,
      2: `- 从您孩子自身的综合水平看，这科成绩对总分提高有拖后腿的现象，贡献率为<span style="color: #FFBA1D">${options.contribution}</span>，${options.contribution < 0 ? '是负值，' : ''}不是很理想。${isMember ? '' : '详细了解各学科发展水平，建议购买完整报告。'}`,
    }
    const P4 = {
      1: `虽然你在<span style="color: #FFBA1D">${options.worstSubject}</span>学科上的表现欠佳，但还是不少闪光点的，有些题答得还很不错呢！`,
      2: `虽然您孩子在<span style="color: #FFBA1D">${options.worstSubject}</span>学科上的表现欠佳，但还是不少闪光点的，有些题答得还很不错呢！`,
    }
    return {
      P1: P1B(options.worstSubject)[userType],
      P2: P2[userType],
      P3: P3[userType],
      P31: P31func(),
      P32: options.difference > 0 ? P32[userType] : '',
      P33: P33[userType],
      P4: P4[userType],
    }
  }

  const C = () => {
    const kgNames = []
    const kgScores = []
    const zgNames = []
    const zgScores = []
    const knowledgeNames = []
    for (let i = 0; i < options.excellentQuestions.length; i++) {
      const item = options.excellentQuestions[i]
      if (item.type === 1) {
        zgNames.push(item.name)
        zgScores.push(Number.parseFloat(item.difference.toFixed(2)))
      }
      else {
        kgNames.push(item.name)
        kgScores.push(Number.parseFloat(item.difference.toFixed(2)))
      }
      item.knowledge.forEach((knowledge) => {
        knowledgeNames.push(knowledge.name)
      })
    }
    const P3 = () => {
      if (!kgNames.length && !zgNames.length && !knowledgeNames.length) {
        return {
          1: '与同类水平的同学比较，你的这科表现在单道题上的优势并不明显。建议根据试题的难度，从易到难逐题分析，找到突破。你可以做得更好的。加油！',
          2: '与同类水平学生群体比较，您孩子的这科表现在单道题上的优势并不明显。建议根据试题的难度，从易到难逐题分析，找到突破。您孩子可以做得好。',
        }
      }
      return {
        1: '有几点具体的分析：',
        2: '有几点具体的分析：',
      }
    }
    const P31 = {
      1: `- 从客观题看，你在第<span style="color: #E50000">${kgNames.join('，')}</span>题表现比较突出，比同类群体的平均分要分别高出<span style="color: #FFBA1D">${kgScores.join('，')}</span>分。`,
      2: `- 从客观题看，您孩子在第<span style="color: #E50000">${kgNames.join('，')}</span>题表现比较突出，比同类群体的平均分要分别高出<span style="color: #FFBA1D">${kgScores.join('，')}</span>分。`,
    }
    const P32 = {
      1: `- 从主观题看，你在第<span style="color: #E50000">${zgNames.join('，')}</span>题表现比较突出，比同类群体的平均分要分别高出<span style="color: #FFBA1D">${zgScores.join('，')}</span>分。`,
      2: `- 从主观题看，您孩子在第<span style="color: #E50000">${zgNames.join('，')}</span>题表现比较突出，比同类群体的平均分要分别高出<span style="color: #FFBA1D">${zgScores.join('，')}</span>分。`,
    }
    const P33 = {
      1: `- 联系考试的内容，你在本学科知识内容方面<span style="color: #E50000">${knowledgeNames.join('，')}</span>等知识点的掌握、理解和应用上，是比较牢固的。`,
      2: `- 联系考试的内容，您孩子在本学科知识内容方面<span style="color: #E50000">${knowledgeNames.join('，')}</span>等知识点的掌握、理解和应用上，是比较牢固的。`,
    }
    return {
      P1: P1A(options.subject)[userType],
      P2: P2[userType],
      P3: P3()[userType],
      P31: kgNames.length ? P31[userType] : '',
      P32: zgNames.length ? P32[userType] : '',
      P33: knowledgeNames.length ? P33[userType] : '',
    }
  }

  const D = () => {
    const names = []
    let score = 0
    options.unexpectWrongQuestions.forEach((item) => {
      score += item.difference
      names.push(item.name)
    })
    const P3 = () => {
      if (!names.length) {
        return {
          1: '与同类水平的同学比较，你的这科表现在单道题上的劣势并不明显。建议根据试题的难度，从易到难逐题分析，找到突破。你可以做得更好的。加油！',
          2: '与同类水平学生群体比较，您孩子的这科表现在单道题上的劣势并不明显。建议根据试题的难度，从易到难逐题分析，找到突破。您孩子可以做得好。',
        }
      }
      return {
        1: '存在几个值得注意的地方：',
        2: '存在几个值得注意的地方：',
      }
    }
    const P4 = {
      1: `以你的水平，有几题是不该丢分的，比如<span style="color: #E50000">${names.join('，')}</span>题。这几题对你来说可是送分题，要仔细分析下失分原因，相信你可以轻松解决这一问题。这一下子可就是<span style="color: #FFBA1D">${Number.parseFloat(Math.abs(score).toFixed(2))}</span>分的提升空间哦！`,
      2: `以您孩子的水平，有几题是不应该丢分的，比如<span style="color: #E50000">${names.join('，')}</span>题。这几题对您孩子应该是送分的题目，要仔细分析下失分原因，您的孩子应该可以轻松解决这一问题。这一下子可就是<span style="color: #FFBA1D">${Number.parseFloat(Math.abs(score).toFixed(2))}</span>分的提升空间啦！`,
    }
    return {
      P1: P1B(options.subject)[userType],
      P2: P2[userType],
      P3: P3()[userType],
      P4: names.length ? P4[userType] : '',
    }
  }

  const selectMap = { A, B, C, D }

  return selectMap[select]()
};
