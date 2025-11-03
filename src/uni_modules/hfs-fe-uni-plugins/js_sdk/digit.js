/**
 * 格式化数字
 * @param {number} n 数字
 * @return {string | number}
 */
export function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 将大数字转为以万，亿为单位
 * @export tranNumber
 * @param {number} num 数字
 * @param {number} point 保留小数点位数
 * @return {string}
 */
export function tranNumber(num, point) {
  if (num === undefined || num === null)
    return 0
  const numStr = num.toString().split('.')[0]
  if (numStr.length < 5)
    return numStr
  if (numStr.length >= 5 && numStr.length <= 8) {
    const decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point)
    return `${Number.parseFloat(`${Number.parseInt(`${num / 10000}`)}.${decimal}`)}万`
  }
  if (numStr.length > 8) {
    const decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point)
    return `${Number.parseFloat(`${Number.parseInt(`${num / 100000000}`)}.${decimal}`)}亿`
  }
}

export function strToNum(str) {
  if (str && str.length > 0) {
    return str.replace(/[七八九]/g, (item) => {
      return item === '七' ? 7 : item === '八' ? 8 : 9
    })
  }
  else {
    return str
  }
}
