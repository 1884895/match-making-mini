// 学科封面图片映射
import chineseCoverImage from '../static/bg_book_chinese.png'
import mathCoverImage from '../static/bg_book_math.png'
import englishCoverImage from '../static/bg_book_english.png'
import physicsCoverImage from '../static/bg_book_physics.png'
import chemistryCoverImage from '../static/bg_book_chemistry.png'
import biologyCoverImage from '../static/bg_book_biology.png'
import politicsCoverImage from '../static/bg_book_politics.png'
import historyCoverImage from '../static/bg_book_history.png'
import geographyCoverImage from '../static/bg_book_geography.png'
import otherCoverImage from '../static/bg_book_other.png'

import type { Assignment } from './api'

type SubjectCoverMap = {
  [key: string]: string
}

const subjectCoverImageMap: SubjectCoverMap = {
  语文: chineseCoverImage,
  数学: mathCoverImage,
  英语: englishCoverImage,
  物理: physicsCoverImage,
  化学: chemistryCoverImage,
  生物: biologyCoverImage,
  政治: politicsCoverImage,
  历史: historyCoverImage,
  地理: geographyCoverImage,
  其他: otherCoverImage,
}

/**
 * 获取学科封面图片
 */
export function getSubjectCoverImage(subject: string): string {
  return subjectCoverImageMap[subject] ?? subjectCoverImageMap['其他']
}

/**
 * 获取学科封面图片 - 别名，保持向后兼容
 */
export const getCoverImageBySubject = getSubjectCoverImage

/**
 * 获取作业状态的CSS类名
 */
export function getStatusClass(assignment: Assignment): string {
  // 已结束状态
  if (assignment.status === 2) {
    // 已结束且不允许补交且未提交
    if (!assignment.allowOverdueSubmission && assignment.committed !== 2) {
      return 'missed'
    }
    // 已提交
    if (assignment.committed === 2) {
      return 'completed'
    }
    // 可补交未提交
    return 'can-makeup'
  }
  
  // 进行中
  if (assignment.status === 1) {
    // 已提交
    if (assignment.committed === 2) {
      return 'completed'
    }
    // 未提交
    return 'in-progress'
  }
  
  // 未开始
  return 'not-started'
}

/**
 * 获取状态文本 - 重新导出
 */
export { getStatusText, getButtonText } from './format'