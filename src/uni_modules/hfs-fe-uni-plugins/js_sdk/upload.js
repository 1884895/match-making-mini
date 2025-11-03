import { promisify } from './promisify.js'
// #ifdef VUE2
import { http } from '@/plugins/luch-request/config.js'
// #endif
// 获取上传参数
async function getUploadParams(options) {
  const params = {
    keyPrefix: 'lianxi',
    bucketName: 'ayx-hfs',
    needPrefix: '1',
    ...options,
  }
  let res = {}
  // #ifdef VUE2
  res = await http.get(options.url || '/v3/api/post-policy/bdy', { params })
  // #endif
  // #ifdef VUE3
  uni.$http.get && (res = await uni.$http.get(options.url || '/v3/api/post-policy/bdy', params))
  uni.$http.Get && (res = await uni.$http.Get(options.url || '/v3/api/post-policy/bdy', { params }))
  // #endif
  return res.data
}

// 上传文件
export async function uploadFile(file, options = {}, full = false) {
  if (!file)
    return ''
  const policyData = await getUploadParams(options)
  const uploadFile = promisify(uni.uploadFile)
  const { accessKey, host, keyPrefix, policy, signature } = policyData
  const suffix = file.name.substring(file.name.lastIndexOf('.'))
  const key = `${keyPrefix}/${new Date().getTime()}${suffix}`
  await uploadFile({
    url: `https://${host}`,
    filePath: file.url,
    name: 'file',
    header: {
      'x-bce-acl': 'public-read',
    },
    formData: {
      key,
      accessKey,
      policy,
      signature,
    },
  })
  return full ? `https://${host}/${key}` : key
}
