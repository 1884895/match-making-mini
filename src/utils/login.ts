import { promisify } from '@/uni_modules/hfs-fe-uni-plugins'
import ajax from '@/plugins/uni-ajax'

/**
 * 静默登录
 */
export async function loginBase(phoneNumber: string, type: number) {
  try {
    const res = await getAccountInfo(phoneNumber)
    getApp().globalData!.accountInfo = res.data
    const { users, unionId } = res.data
    if (!users || !users.length)
      return res.data
    const { userId, type: roleType, key } = users.length > 1
      ? users.find((v: any) => v.type === type)
      : users.pop()
    // 只有一个角色时自动登录
    await loginByRole({ userId, roleType, key, unionId })
    return res.data
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (err: any) {
    return uni.reLaunch({ url: '/pages/home/home' })
  }
}

// 根据code、手机号获取好分数账号信息、cookie及UnionID
export async function getAccountInfo(phone?: string | number) {
  const login = promisify(uni.login)
  const { code } = await login()
  const { query } = uni.getEnterOptionsSync()
  const { gzhAppId, gzhOpenId } = query
  return await ajax.get('/v2/mini/account-related-user', { code, phone, gzhAppId, gzhOpenId })
}

// 选择角色登录
export async function loginByRole(params: any) {
  return await ajax.post('/v2/mini/account-login', params)
}

// 账号密码登录
export async function loginByPassword(params: any) {
  return await ajax.post('/v1/be-proxy/v2/users/sessions', params)
}

// 获取用户信息
export async function getUserInfo(custom: any) {
  const res = await ajax.get('/v1/be-proxy/v2/user-center/user-snapshot', {}, { custom })
  uni.setStorageSync('userInfo', res.data)
  return res.data
}
