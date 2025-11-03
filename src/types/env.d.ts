/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'uview-plus'

declare module '@/uni_modules/hfs-fe-uni-plugins'
