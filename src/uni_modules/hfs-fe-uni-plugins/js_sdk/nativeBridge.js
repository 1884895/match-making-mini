// #ifdef H5
const u = navigator.userAgent
// Android终端
const isAndroid = u.includes('Android') || u.includes('Adr')
// iOS 终端
const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
// 鸿蒙
const isHarmony = u.includes('OpenHarmony') || u.includes('ArkWeb')
// 注册回调函数
function setupWebViewJavascriptBridge(callback) {
  if ((isAndroid || isHarmony) && window.HFS) {
    !window.HFS.callHandler && (window.HFS.callHandler = (...args) => window.HFS[args.shift()](...args.filter(Boolean)))
    !window.HFS.registerHandler && (window.HFS.registerHandler = (...args) => window[args.shift()] = args.pop())
    callback(window.HFS)
  }
  if (isiOS && window.__wxjs_environment !== 'miniprogram') {
    if (window.WebViewJavascriptBridge) {
      window.WebViewJavascriptBridge.registerHandler = (...args) => window[args.shift()] = args.pop()
      return callback(window.WebViewJavascriptBridge)
    }
    if (window.WVJBCallbacks) {
      return window.WVJBCallbacks.push(callback)
    }
    window.WVJBCallbacks = [callback]
    const WVJBIframe = document.createElement('iframe')
    WVJBIframe.style.display = 'none'
    WVJBIframe.src = 'https://__bridge_loaded__'
    document.documentElement.appendChild(WVJBIframe)
    setTimeout(() => {
      document.documentElement.removeChild(WVJBIframe)
    }, 0)
  }
}
// #endif

export const nativeBridge = {
  // js调APP方法 （参数分别为:app提供的方法名  传给app的数据  回调）
  callHandler(name, data, callback) {
    // #ifdef H5
    setupWebViewJavascriptBridge((bridge) => {
      if ((isAndroid || isHarmony) && bridge[name]) {
        const res = bridge.callHandler(name, data)
        return callback && callback(res)
      }
      isiOS && bridge.callHandler('OCHandler', { [name]: data }, callback)
    })
    // #endif
  },
  // APP调js方法 （参数分别为:js提供的方法名  回调）
  registerHandler(name, callback) {
    // #ifdef H5
    setupWebViewJavascriptBridge((bridge) => {
      bridge.registerHandler(name, (data, responseCallback) => {
        callback(data, responseCallback)
      })
    })
    // #endif
  },
}
