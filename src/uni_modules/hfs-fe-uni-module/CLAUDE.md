# hfs-fe-uni-module 业务模块开发指南

此文档为 Claude Code 在开发和维护 uni-app 业务模块时提供指导。

## 模块概述

hfs-fe-uni-module 是好分数应用的核心业务模块，采用 uni_modules 规范，支持在多个 uni-app 项目间复用页面、组件和插件。

## 模块结构设计

### 1. 目录组织原则

```
hfs-fe-uni-module/
├── components/          # 通用组件库
├── examPages/          # 考试业务页面
├── coursePages/        # 课程业务页面
├── memberPages/        # 会员业务页面
├── pages/             # 其他功能页面
├── package.json       # 模块配置
└── readme.md         # 模块说明
```

### 2. 功能模块划分

**按业务领域划分：**
- `examPages/` - 考试相关功能（核心业务）
  - `academicReport/` - 学术报告分析
  - `examRecord/` - 考试记录管理
  - `index/` - 考试主页面
  - `examArena/` - 考试竞技场
  - `exactImprove/` - 精准提升

- `coursePages/` - 课程相关功能
- `memberPages/` - 会员系统
- `pages/` - 营销和社交功能

### 3. 组件库设计模式

**通用组件（components/）：**
- 命名规范：`i-` 前缀（如 `i-empty.vue`, `i-table.vue`）
- 职责单一：每个组件专注一个功能
- 高度可配置：通过 props 支持多种使用场景
- 无业务逻辑：只负责 UI 展示，不包含具体业务

**组件示例：**
```vue
// i-empty.vue - 空状态组件
<template>
  <view class="empty" :style="{ padding, backgroundColor, borderRadius }">
    <image class="img" src="../examPages/static/academicReport/empty.png" mode="widthFix" />
  </view>
</template>

<script>
export default {
  props: {
    padding: { type: String, default: '150rpx 0 300rpx 0' },
    backgroundColor: { type: String, default: '#fff' },
    borderRadius: { type: String, default: '0' }
  }
}
</script>
```

## 页面组织模式

### 1. 页面结构规范

每个业务模块内部按以下结构组织：
```
examPages/
├── index/              # 主页面目录
│   ├── index.vue      # 主页面文件
│   └── components/    # 页面专用组件
├── static/           # 静态资源
└── template/         # 模板和工具函数
```

### 2. 组件层次设计

- **页面级组件**：完整的业务页面
- **容器组件**：负责数据获取和状态管理
- **展示组件**：纯 UI 组件，通过 props 接收数据
- **工具组件**：通用功能组件（弹窗、表格等）

### 3. 数据流管理

- 使用 props 进行父子组件通信
- 使用 emit 向上传递事件
- 复杂状态使用 Pinia 全局状态管理
- 业务逻辑抽取到 composables 或 utils

## 模块配置规范

### 1. package.json 配置

```json
{
  "id": "hfs-fe-uni-module",
  "displayName": "hfs-fe-uni-module",
  "version": "1.0.0",
  "description": "hfs-fe-uni-module",
  "keywords": ["hfs-fe-uni-module"]
}
```

### 2. Git Submodule 集成

模块通过 Git Submodule 方式集成到多个项目：
- [hfs-fe-operations](https://git.iyunxiao.com/HFS-FE/hfs-fe-operations)
- [hfs-fe-portal-miniprogram](https://git.iyunxiao.com/HFS-FE/hfs-fe-portal-miniprogram)

## 开发最佳实践

### 1. 代码组织

**工具函数模式：**
```javascript
// template/examRecord.js - 业务工具函数
const colorMap = {
  yellow: '#FFBA1D',
  green: '#00C81F',
  red: '#E50000'
}

function parseText(text) {
  return text.replace(/@@/g, '</span>')
    .replace(/@(.+?)@/g, (match, p1) =>
      `<span style="color: ${colorMap[p1]}">`)
}

export function improveSpace(userType, options) {
  // 业务逻辑处理...
  return parseText(result)
}
```

**配置常量管理：**
```javascript
// util.js - 配置常量
export const payThroughEnum = {
  Mini: { payThrough: 30, title: '微信支付' },
  H5Wechat: { payThrough: 31, title: '微信支付' },
  IOSIAP: { payThrough: 15, title: 'IAP' }
}
```

### 2. 平台兼容性

使用条件编译处理不同平台差异：
```vue
<template>
  <!-- #ifdef MP-WEIXIN -->
  <u-navbar :title="title" bg-color="#fff" />
  <!-- #endif -->
  <!-- #ifdef H5 -->
  <u-gap height="8rpx" bg-color="transparent" />
  <!-- #endif -->
</template>
```

### 3. 静态资源管理

- 按功能模块组织静态资源
- 使用相对路径引用
- 图片资源统一放在对应模块的 `static/` 目录

### 4. 组件设计原则

- **单一职责**：每个组件只负责一个明确的功能
- **高内聚低耦合**：组件内部逻辑紧密，对外依赖最小
- **可配置性**：通过 props 提供灵活的配置选项
- **可复用性**：避免硬编码，支持多场景使用

## 创建新业务模块指南

### 1. 目录结构

```
your-module/
├── package.json          # 模块配置
├── readme.md            # 模块说明
├── components/          # 通用组件
├── pages/              # 业务页面
├── static/             # 静态资源
└── utils/              # 工具函数
```

### 2. 基础配置

创建 `package.json`：
```json
{
  "id": "your-module-name",
  "displayName": "模块显示名称",
  "version": "1.0.0",
  "description": "模块描述",
  "keywords": ["关键词"]
}
```

### 3. 开发流程

1. **规划模块结构**：按业务功能划分目录
2. **抽取通用组件**：识别可复用的 UI 组件
3. **实现业务页面**：开发具体功能页面
4. **配置模块信息**：完善 package.json 和文档
5. **测试集成**：在目标项目中测试模块功能

### 4. 注意事项

- 保持模块独立性，避免与主项目强耦合
- 使用 uni-app 标准 API，确保跨平台兼容
- 遵循项目的代码规范和命名约定
- 及时更新文档，说明模块用法和变更

## 维护指南

- 定期更新依赖版本
- 保持向后兼容性
- 记录重要变更历史
- 提供清晰的升级指南

## 已完成的业务模块

### assignmentsPages 模块

assignmentsPages 模块已成功迁移并投入使用。该模块提供作业管理的完整功能，包括作业列表、在线答题和成绩报告等核心能力。

**模块特点：**
- 完整的 TypeScript 支持
- 模块化的组件设计
- 跨平台兼容性
- 完善的错误处理机制

**详细文档：** 请参考 `assignmentsPages/CLAUDE.md`
