// API 相关接口

interface LoginParams {
  userId?: string | null
  accountid?: string | null
}

export interface Assignment {
  startTime: string | number | Date
  endTime: string | number | Date
  committedTime?: string | number | Date
  status: number  // 0-未开始, 1-进行中, 2-已结束
  committed: number  // 0/1-未提交, 2-已提交
  allowOverdueSubmission?: boolean
  paperId: string
  name: string
  subject: string
}

/**
 * 用户登录
 */
export async function loginUser(userId: string | null, accountid: string | null): Promise<void> {
  let params: LoginParams | undefined
  
  if (userId != null) {
    params = { userId }
  }
  if (!params && accountid != null) {
    params = { accountid }
  }
  if (!params) return
  
  const response: any = await uni.$http.post('/v2/users/sessions/seewo', params)
  const hfsToken = response.data?.token
  if (hfsToken) {
    uni.setStorageSync('hfsToken', hfsToken)
  }
}

/**
 * 获取作业列表
 */
export async function fetchAssignmentsList(): Promise<Assignment[]> {
  const response: any = await uni.$http.get('/v2/online-exams/zuoye-list')
  return response.data?.list || []
}