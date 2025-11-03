import dayjs from 'dayjs'
import type { Assignment } from './api'

export interface GroupedAssignments {
  [key: string]: Assignment[]
}

/**
 * 格式化作业日期分组
 */
export function formatAssignmentDate(list: Assignment[]): GroupedAssignments {
  const todayKey = dayjs().format('MM-DD')
  const grouped: GroupedAssignments = {}
  
  list.forEach((item) => {
    let key = dayjs(item.startTime).format('MM-DD')
    if (key === todayKey) {
      key = '今天'
    }
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(item)
  })
  
  return grouped
}

/**
 * 获取状态文本
 */
export function getStatusText(item: Assignment): string {
  const { status, committed } = item
  const today = dayjs().format('MM/DD')
  let starday = dayjs(item.startTime).format('MM/DD')
  let endDay = dayjs(item.endTime).format('MM/DD')
  let committedDay = item.committedTime ? dayjs(item.committedTime).format('MM/DD') : ''
  
  if (today === starday) starday = '今天'
  if (today === endDay) endDay = '今天'
  if (today === committedDay) committedDay = '今天'
  
  const startTime = dayjs(item.startTime).format('HH:mm')
  const endTime = dayjs(item.endTime).format('HH:mm')
  const committedTime = item.committedTime ? dayjs(item.committedTime).format('HH:mm') : ''
  
  switch (status) {
    case 0:
      return `未开始，将于${starday}${starday === '今天' ? '' : ' '}${startTime}开始`
    case 1:
      switch (committed) {
        case 0:
        case 1:
          return `未完成，要求${endDay}${endDay === '今天' ? '' : ' '}${endTime}完成`
        case 2:
          return `未结束，${committedDay}${committedDay === '今天' ? '' : ' '}${committedTime}提交`
        default:
          return ''
      }
    case 2:
      switch (committed) {
        case 0:
        case 1:
          return `已结束，要求${endDay}${endDay === '今天' ? '' : ' '}${endTime}完成`
        case 2:
          return `已结束，${committedDay}${committedDay === '今天' ? '' : ' '}${committedTime}提交`
        default:
          return ''
      }
    default:
      return ''
  }
}

/**
 * 获取按钮文本
 */
export function getButtonText(item: Assignment): string {
  const { status, committed, allowOverdueSubmission } = item
  
  switch (status) {
    case 0:
      return '未开始'
    case 1:
      switch (committed) {
        case 0:
          return '开始学习'
        case 1:
          return '继续学习'
        case 2:
          return '查看试题'
        default:
          return ''
      }
    case 2:
      switch (committed) {
        case 0:
          if (allowOverdueSubmission) {
            return '立即补做'
          }
          return '查看试题'
        case 1:
          if (allowOverdueSubmission) {
            return '立即补做'
          }
          return '查看试题'
        case 2:
          return '查看报告'
        default:
          return ''
      }
    default:
      return ''
  }
}