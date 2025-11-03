// 单选题
export const SingleChoice = ['选择题', '单选题', '单项选择题']

// 多选题
export const MultipleChoice = ['多选题', '双项选择题', '多项选择题']

// 题目类型
export const QuestionType = {
  singleChoice: 1,
  multipleChoice: 2,
  subjective: 3,
}

/**
 * 判断题目类型
 * 1: 单选题 2: 多选题 3: 主观题
 * @export tellQuestionType
 * @param {*} question 题目
 * @return
 */
export function tellQuestionType(question) {
  const { source, type, qtype, blocks = {} } = question
  switch (source) {
    case 'exam':
      return SingleChoice.includes(qtype) ? QuestionType.singleChoice : MultipleChoice.includes(qtype) ? QuestionType.multipleChoice : QuestionType.subjective
    case 'pic':
      return QuestionType.subjective
    case 'practice':
    case 'recommend':
    case 'zuoye':
    default:
      if (blocks.types && blocks.types.length > 1)
        return QuestionType.subjective
      return SingleChoice.includes(type) ? QuestionType.singleChoice : MultipleChoice.includes(type) ? QuestionType.multipleChoice : QuestionType.subjective
  }
}
