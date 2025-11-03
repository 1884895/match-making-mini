// 回调函数转promise
export function promisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      fn({
        ...obj,
        success(res) { resolve(res) },
        fail(res) { reject(res) },
      })
    })
  }
}
