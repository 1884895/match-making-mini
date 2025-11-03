/**
 * H5端图片压缩
 * @export compressImage
 * @param {string} path 图片路径
 * @param {number} quality 图片质量
 * @param {number} scale 图片缩放比例
 * @return {string}
 */
export function compressImage(path, quality = 0.8, scale = 1) {
  return new Promise((resolve, reject) => {
    // #ifdef H5
    const image = new Image()
    image.setAttribute('crossOrigin', 'Anonymous')
    image.src = path
    image.onload = function () {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const width = image.width * scale
      const height = image.height * scale
      canvas.width = width
      canvas.height = height
      ctx.drawImage(image, 0, 0, width, height)
      const result = canvas.toDataURL('image/jpeg', quality)
      resolve(result)
      canvas.height = canvas.width = 0
    }
    image.onerror = (error) => {
      reject(error)
    }
    // #endif
  })
}
