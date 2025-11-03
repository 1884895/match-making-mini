# assignmentsPages 模块文档

此文档为 Claude Code 在 assignmentsPages 模块工作时提供指导。

## 模块概述

assignmentsPages 是好分数移动端的作业功能模块，负责学生作业的展示、答题、提交和报告查看等核心功能。该模块已迁移至 hfs-fe-uni-module 中，采用模块化设计，支持跨项目复用。

## 目录结构

```
assignmentsPages/
├── index/
│   └── index.vue              # 作业列表主页
├── practice/
│   └── questions.vue          # 答题页面
├── report/
│   └── index.vue             # 作业报告页面
├── components/
│   ├── assignmentCard.vue     # 作业卡片组件
│   ├── assignmentOriginQuestion.vue  # 原题展示组件
│   └── assignmentReport.vue   # 报告分析组件
├── static/                    # 静态资源
│   ├── bg_book_*.png         # 学科背景图片
│   ├── icon_*.png           # 功能图标
│   └── report_*.png         # 报告相关图标
├── styles/
│   └── common.scss          # 通用样式
├── utils/
│   ├── api.ts              # API 接口
│   ├── format.ts           # 数据格式化
│   └── assignmentHelpers.ts # 作业工具函数
├── types/
│   └── images.d.ts         # 图片类型声明
└── CLAUDE.md              # 模块文档
```

## 核心页面

### 1. 作业列表页 (`index/index.vue`)

**功能特性：**
- 按日期分组显示作业列表
- 支持下拉刷新
- 作业状态实时更新
- 学科图标自动匹配

**路由配置：**
```json
{
  "path": "index/index",
  "style": {
    "navigationBarTitleText": "巩固练习",
    "enablePullDownRefresh": true
  }
}
```

**关键组件：**
- `AssignmentCard`: 作业卡片展示组件

### 2. 答题页面 (`practice/questions.vue`)

**功能特性：**
- 支持选择题和主观题（拍照）
- 自动保存答案
- 题目导航栏
- 提交确认弹窗

**路由配置：**
```json
{
  "path": "practice/questions",
  "style": {
    "navigationBarTitleText": "作答"
  }
}
```

**题目类型支持：**
- **选择题** (type 1): 单选题
- **多选题** (type 2): 多选题
- **主观题** (type 3): 拍照上传

### 3. 作业报告页 (`report/index.vue`)

**功能特性：**
- Tab 切换（作业原题/作业报告）
- 成绩分析和趋势图表
- 知识点掌握情况
- 失分情况分析

**路由配置：**
```json
{
  "path": "report/index",
  "style": {
    "navigationBarTitleText": "作业报告"
  }
}
```

## 核心组件

### AssignmentCard (`components/assignmentCard.vue`)

作业卡片展示组件，用于作业列表页面。

**Props:**
```typescript
interface Assignment {
  paperId: string
  name: string
  subject: string
  qcount: number
  status: number // 0-未开始, 1-进行中, 2-已结束
  committed: number // 0/1-未提交, 2-已提交
  allowOverdueSubmission?: boolean
  startTime: string
  endTime: string
  committedTime?: string
}
```

**Events:**
- `action`: 点击卡片时触发，传递 assignment 对象

**使用示例：**
```vue
<assignment-card
  :assignment="assignment"
  @action="handleAssignmentAction"
/>
```

### AssignmentOriginQuestion (`components/assignmentOriginQuestion.vue`)

原题展示组件，用于报告页面的作业原题 Tab。

**Props:**
```typescript
interface Props {
  assignmentInfo: any // 作业详情数据
}
```

**功能特性：**
- 题目列表导航
- 答案对比显示
- 题目解析展示
- 考点标签显示

### AssignmentReport (`components/assignmentReport.vue`)

作业报告分析组件，展示成绩趋势和分析数据。

**Props:**
```typescript
interface Props {
  scrollTop: number
  reprotDetail: any // 报告详情数据（注意：保持原有拼写）
}
```

**功能特性：**
- 成绩统计卡片
- 历次成绩趋势图表
- 知识点掌握分析
- 失分情况占比图表

## 工具函数

### API 模块 (`utils/api.ts`)

**核心接口：**
```typescript
// 用户登录
function loginUser(userId: string | null, accountid: string | null): Promise<void>

// 获取作业列表
function fetchAssignmentsList(): Promise<Assignment[]>
```

### 格式化模块 (`utils/format.ts`)

**主要功能：**
```typescript
// 格式化作业日期分组
function formatAssignmentDate(list: Assignment[]): GroupedAssignments

// 获取状态文本
function getStatusText(item: Assignment): string

// 获取按钮文本
function getButtonText(item: Assignment): string
```

### 作业助手模块 (`utils/assignmentHelpers.ts`)

**工具函数：**
```typescript
// 获取学科封面图片
function getSubjectCoverImage(subject: string): string

// 获取作业状态CSS类名
function getStatusClass(assignment: Assignment): string
```

## 状态管理

### 作业状态枚举

```typescript
enum AssignmentStatus {
  NOT_STARTED = 0, // 未开始
  IN_PROGRESS = 1, // 进行中
  ENDED = 2 // 已结束
}

enum CommittedStatus {
  NOT_SUBMITTED = 0, // 未提交
  SUBMITTING = 1, // 提交中
  SUBMITTED = 2 // 已提交
}
```

### 状态逻辑

**按钮显示逻辑：**
- 未开始：显示"未开始"（禁用）
- 进行中 + 未提交：显示"开始学习"或"继续学习"
- 进行中 + 已提交：显示"查看试题"
- 已结束 + 未提交 + 可补做：显示"立即补做"
- 已结束 + 未提交 + 不可补做：显示"查看试题"
- 已结束 + 已提交：显示"查看报告"

## API 接口

### 作业相关接口

```typescript
// 获取作业列表
GET /v2/online-exams/zuoye-list

// 获取作业详情
GET /v2/online-exams/zuoye-detail?paperId={paperId}

// 保存作业答案
POST /v2/online-exams/zuoye-submit
{
  subjectId: string,
  committed: boolean,
  keguanti: string[],
  images: Array<{blockid: string, files: string[]}>
}

// 获取作业报告
GET /v2/online-exams/zuoye-report?paperId={paperId}&subject={subject}

// 用户登录
POST /v2/users/sessions/seewo
{
  userId?: string,
  accountid?: string
}
```

## 样式规范

### 颜色变量 (`styles/common.scss`)

```scss
$primary-color: #ffa800; // 主色调
$text-color: #333333; // 主文本色
$text-color-light: #939393; // 浅文本色
$success-color: #00c103; // 成功色
$danger-color: #ff4900; // 错误色
$bg-color: #f6f6f6; // 背景色
$border-color: #e6e6e6; // 边框色
```

### Toast 样式覆写

模块包含对 uni-app Toast 组件的全局样式覆写，统一视觉风格。

## 路由配置

在 `pages.json` 中的分包配置：

```json
{
  "root": "uni_modules/hfs-fe-uni-module/assignmentsPages",
  "pages": [
    {
      "path": "index/index",
      "style": {
        "navigationBarTitleText": "巩固练习",
        "enablePullDownRefresh": true
      }
    },
    {
      "path": "practice/questions",
      "style": {
        "navigationBarTitleText": "作答"
      }
    },
    {
      "path": "report/index",
      "style": {
        "navigationBarTitleText": "作业报告"
      }
    }
  ]
}
```

## 开发注意事项

### 1. TypeScript 支持

模块完全使用 TypeScript 开发，包含完整的类型定义。所有工具函数和组件都有明确的类型注解。

### 2. 平台兼容性

使用条件编译处理不同平台差异：
```typescript
// #ifdef H5
// H5 特定代码
// #endif

// #ifdef MP-WEIXIN
// 微信小程序特定代码
// #endif
```

### 3. 数据格式化

**重要提醒：**
- 得分率差值会自动格式化为最多两位小数
- 答案数据需要根据题目类型进行不同处理
- 图片上传使用 OSS 存储，需要正确的文件路径格式

### 4. 错误处理

组件内置了完善的错误处理机制，特别是图表组件的 tooltip 功能，确保在数据异常时不会影响整体功能。

### 5. 性能优化

- 使用计算属性缓存复杂计算
- 图表组件采用懒加载
- 图片资源使用适当的压缩格式

## 测试建议

### 1. 功能测试

- 作业列表加载和刷新
- 不同状态作业的按钮显示
- 答题流程完整性测试
- 报告页面数据展示

### 2. 兼容性测试

- H5 平台功能验证
- 微信小程序兼容性
- 不同设备屏幕适配

### 3. 边界情况测试

- 网络异常处理
- 数据为空的显示
- 长文本内容的布局

## 维护指南

### 1. 添加新的学科

在 `utils/assignmentHelpers.ts` 中更新学科图片映射：

```typescript
const subjectCoverImageMap: SubjectCoverMap = {
  // 添加新学科
  新学科: newSubjectImage,
}
```

### 2. 修改题目类型

在 `practice/questions.vue` 中的 `optionClick` 函数添加新的类型处理逻辑。

### 3. 更新 API 接口

修改 `utils/api.ts` 中的接口函数，确保类型定义同步更新。

## 依赖说明

### 核心依赖

- `dayjs`: 日期处理
- `@/uni_modules/qiun-data-charts`: 图表组件
- `@/uni_modules/hfs-fe-uni-plugins`: 业务插件

### 组件依赖

- `uview-plus`: UI 组件库（u-upload, u-popup, u-tabs 等）
- `@/components/htmlRender`: HTML 内容渲染组件

确保在使用此模块前，项目中已正确安装和配置这些依赖。

## 模块迁移工作总结

### 迁移概况

assignmentsPages 模块已成功从 `src/assignmentsPages/` 迁移至 `src/uni_modules/hfs-fe-uni-module/assignmentsPages/`，实现了模块化管理和跨项目复用的目标。

### 主要工作内容

#### 1. 架构重构 (✅ 已完成)

**目录结构优化：**
- 从平面式文件组织改为分层式模块结构
- 按功能划分页面目录 (index/, practice/, report/)
- 分离组件、工具、样式和静态资源

**模块化设计：**
- 实现了独立的业务模块，支持跨项目复用
- 采用 uni_modules 规范，便于维护和升级
- 清晰的模块边界和职责划分

#### 2. 页面和组件迁移 (✅ 已完成)

**核心页面重构：**
- `index.vue` → `index/index.vue`: 作业列表主页
- `practiceQuestions.vue` → `practice/questions.vue`: 答题页面
- `report.vue` → `report/index.vue`: 作业报告页面

**组件拆分优化：**
- `assignmentCard.vue`: 作业卡片组件，提高复用性
- `assignmentOriginQuestion.vue`: 原题展示组件，保持向后兼容
- `assignmentReport.vue`: 报告分析组件，增强数据处理能力

#### 3. TypeScript 迁移 (✅ 已完成)

**文件转换：**
- `dataFormat.js` → 拆分为 `api.ts`, `format.ts`, `assignmentHelpers.ts`
- 添加完整的 TypeScript 类型定义
- 创建 `types/images.d.ts` 处理静态资源类型

**类型安全：**
- 所有组件和函数都有明确的类型注解
- 接口和数据结构的标准化定义
- 编译时类型检查，减少运行时错误

#### 4. 路径和引用修复 (✅ 已完成)

**静态资源路径：**
- 更新所有图片和样式文件的相对路径
- 从 `../../static/` 修正为 `../static/`
- 样式导入路径从 `../../style/` 修正为 `../styles/`

**模块导入优化：**
- 工具函数的模块化导入
- 组件引用路径的统一管理
- 第三方依赖的标准化引用

#### 5. 错误修复和优化 (✅ 已完成)

**关键问题解决：**
- 修复图表组件的 tooltip 错误 (clientX/offsetTop 未定义)
- 解决数据格式化的无限小数问题
- 修复 ESLint 规范违规 (unused variables, parseFloat 等)
- 保持向后兼容性 (如 `reprotDetail` 拼写保持原样)

**性能优化：**
- 数值格式化函数的精度控制
- 图表组件的错误边界处理
- 计算属性的合理使用

#### 6. 路由配置更新 (✅ 已完成)

**分包配置：**
```json
{
  "root": "uni_modules/hfs-fe-uni-module/assignmentsPages",
  "pages": [
    { "path": "index/index", "style": { "navigationBarTitleText": "巩固练习", "enablePullDownRefresh": true } },
    { "path": "practice/questions", "style": { "navigationBarTitleText": "作答" } },
    { "path": "report/index", "style": { "navigationBarTitleText": "作业报告" } }
  ]
}
```

**跳转路径更新：**
- 所有页面内的导航路径已更新为新的模块路径
- 保持参数传递的完整性和正确性

### 技术改进

#### 1. 代码质量提升
- **ESLint 合规**: 解决所有代码规范问题
- **TypeScript 支持**: 完整的类型安全
- **模块化设计**: 清晰的职责分离
- **错误处理**: 完善的异常边界

#### 2. 维护性增强
- **文档完善**: 详细的模块使用说明
- **注释标准**: 关键逻辑的清晰注释
- **命名规范**: 统一的命名约定
- **测试友好**: 易于单元测试的结构

#### 3. 性能优化
- **按需加载**: 分包加载策略
- **资源优化**: 静态资源的合理组织
- **计算缓存**: computed 属性的有效使用
- **渲染优化**: 条件渲染和列表优化

### 向后兼容性

#### 1. API 接口保持不变
- 所有现有的 API 调用保持兼容
- 数据结构和格式维持原样
- 业务逻辑行为一致

#### 2. 功能特性完整保留
- 作业列表的分组和排序逻辑
- 答题流程的完整性
- 报告页面的数据展示
- 用户交互体验一致

#### 3. 数据格式兼容
- 保持原有的 prop 名称 (如 `reprotDetail`)
- 维持答案数据结构
- 状态判断逻辑不变

### 质量保证

#### 1. 全面测试验证
- **功能测试**: 所有核心功能正常运行
- **兼容性测试**: H5 和小程序平台验证
- **回归测试**: 现有功能无异常
- **性能测试**: 加载和响应速度正常

#### 2. 代码审查
- **架构设计**: 模块结构合理
- **代码规范**: 符合项目标准
- **安全性**: 无安全隐患
- **可维护性**: 易于后续开发

### 项目影响

#### 1. 正面影响
- **模块复用**: 支持跨项目使用
- **维护效率**: 集中式的模块管理
- **开发体验**: TypeScript 支持和更好的工具链
- **代码质量**: 标准化的代码结构

#### 2. 风险控制
- **无破坏性变更**: 现有功能完全保留
- **平滑迁移**: 用户无感知的升级
- **回滚能力**: 可快速回退到原版本
- **文档支持**: 完整的变更记录

### 后续建议

#### 1. 持续监控
- 监控新模块的运行状态
- 收集用户反馈和性能指标
- 关注错误日志和异常情况

#### 2. 进一步优化
- 考虑引入单元测试
- 优化图表组件的性能
- 探索更好的状态管理方案

#### 3. 文档维护
- 及时更新使用文档
- 记录重要变更历史
- 提供开发指南和最佳实践

这次迁移工作成功实现了模块化改造的目标，为项目的可维护性和可扩展性奠定了良好基础。

## 移动端适配优化 (2024年更新)

### 概述
在模块迁移完成后，我们对整个 assignmentsPages 模块进行了全面的移动端适配优化，从 Pad 设计转换为手机端设计，采用 750rpx 基准宽度，确保在各种移动设备上的良好显示效果。

### 核心样式系统

#### 1. 移动端变量系统 (`styles/variables.scss`) ✅

创建了完整的移动端样式变量系统：
```scss
// 基于 750rpx 设计稿的移动端适配
$navbar-height: 88rpx;          // 导航栏高度
$font-size-base: 28rpx;         // 基础字号
$spacing-base: 24rpx;           // 基础间距
$radius-base: 16rpx;            // 基础圆角

// 安全区域适配
@mixin safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

@mixin safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

#### 2. 导航栏系统优化

**统一导航栏设计：**
- 高度：88rpx，适配移动端
- 返回按钮：36rpx × 36rpx，易于点击
- 标题：支持长文本截断和省略
- iOS 安全区域适配

**导航栏功能增强：**
```javascript
function goBack() {
  if (getCurrentPages().length > 1) {
    return uni.navigateBack()
  }
  // 原生桥接支持
  nativeBridge.callHandler('goBack', 'goBack')
}
```

### 页面级优化

#### 1. 作业列表页 (`index/index.vue`) ✅

**主要改进：**
- 添加导航栏，支持原生交互
- 作业卡片高度固定为 200rpx
- 使用 u-empty 组件替代自定义空状态
- 完整的 iOS 安全区域适配

**作业卡片优化：**
- 卡片尺寸：200rpx 高度，4:3 图片比例
- 标题单行显示，超出省略
- 按钮和文字间距优化
- 状态指示器重新设计

#### 2. 答题页面 (`practice/questions.vue`) ✅

**核心功能优化：**
- 移除冗余的进度条，节省空间
- 优化选项样式，option-index 添加圆形背景
- 拍照区域九宫格布局（3×3）
- 删除按钮优化：无背景，60rpx 点击区域

**题目导航优化：**
- 高度统一为 120rpx
- 题号按钮：80rpx × 80rpx
- 自动滚动到中心位置，支持动画
- 最后一个按钮去除右边距

**选项显示增强：**
```scss
.option-index {
  @include flex-center;
  width: 48rpx;
  height: 48rpx;
  background-color: $bg-primary;
  border-radius: $radius-round;
  
  &.my-choice {
    color: $primary-color;
    font-weight: bold;
  }
}
```

**错误处理改进：**
- 添加 myAnswer 安全检查，防止 undefined 错误
- 完善的边界条件处理

#### 3. 作业报告页 (`report/index.vue`) ✅

**导航栏优化：**
- 修复 tab 侵占返回按钮区域的问题
- 左侧留出 88rpx 空间给返回按钮
- tab 高度统一为 88rpx

**原题展示组件优化：**
- 移除冗余的 question-progress 组件
- content-scroll 使用固定定位，精确控制高度
- 题目导航统一样式，支持自动滚动

### 组件级优化

#### 1. AssignmentCard 组件

**移动端适配：**
- 卡片高度：200rpx（固定）
- 图片区域：260rpx 宽度
- 标题：单行显示，@include text-ellipsis
- 按钮区域：优化间距和字号

#### 2. AssignmentOriginQuestion 组件

**主要改进：**
- 删除顶部进度显示（冗余）
- question-nav 高度统一为 120rpx
- 支持题号自动滚动到中心
- option-index 添加用户选择标识

**用户选择标识：**
```scss
.option-index.my-choice {
  color: $primary-color;
  font-weight: bold;
}
```

### 交互体验优化

#### 1. 滚动体验

**自动滚动实现：**
```javascript
async function selectQuestion(item: any) {
  // ... 其他逻辑
  
  nextTick(() => {
    const currentIndex = questions.value.findIndex(q => q.id === item.id)
    if (currentIndex >= 0) {
      const itemWidth = 80 + 16
      const itemWidthPx = uni.upx2px(itemWidth)
      const containerWidth = uni.getSystemInfoSync().screenWidth
      const targetScrollLeft = Math.max(0, 
        currentIndex * itemWidthPx - containerWidth / 2 + itemWidthPx / 2)
      
      scrollLeft.value = targetScrollLeft
    }
  })
}
```

#### 2. 动画增强

- scroll-with-animation: 平滑滚动动画
- 按钮点击反馈：transform: scale(0.98)
- 过渡动画：transition: all 0.2s

### 布局系统重构

#### 1. 响应式设计

**基于 750rpx 的适配：**
- 所有尺寸使用 rpx 单位
- 字体大小梯度：24rpx → 48rpx
- 间距系统：8rpx → 64rpx
- 圆角系统：8rpx → 32rpx

#### 2. 九宫格布局

**答案图片展示：**
```scss
.answer-images {
  display: flex;
  flex-wrap: wrap;
  
  .answer-image-item {
    width: calc(33.333% - #{$spacing-xs * 2});
    margin: 0 $spacing-xs $spacing-lg;
    aspect-ratio: 1; // 1:1 正方形
  }
}
```

### 技术优化总结

#### 1. 性能优化
- 使用 aspect-ratio 替代固定高度
- 优化图片加载和显示
- 减少不必要的 DOM 渲染

#### 2. 用户体验
- 统一的视觉语言
- 流畅的动画过渡
- 直观的状态反馈
- 易用的触控交互

#### 3. 代码质量
- 完善的错误边界处理
- 统一的命名规范
- 模块化的样式组织
- 类型安全的实现

### 测试覆盖

#### 1. 功能测试
- ✅ 作业列表加载和展示
- ✅ 答题流程完整性
- ✅ 报告页面数据显示
- ✅ 题目导航自动滚动

#### 2. 兼容性测试
- ✅ iOS 安全区域适配
- ✅ Android 不同屏幕尺寸
- ✅ H5 和小程序平台
- ✅ 不同分辨率设备

#### 3. 交互测试
- ✅ 触控操作响应
- ✅ 滚动性能优化
- ✅ 动画流畅度
- ✅ 错误状态处理

### 维护指南更新

#### 1. 样式修改
- 修改 `styles/variables.scss` 中的变量
- 保持 rpx 单位的一致性
- 遵循移动端设计规范

#### 2. 组件开发
- 使用统一的 mixin 和变量
- 添加必要的安全检查
- 支持不同状态显示

#### 3. 性能监控
- 关注滚动性能
- 监控内存使用情况
- 优化图片加载策略

这次移动端适配优化工作全面提升了 assignmentsPages 模块的用户体验，为移动端用户提供了原生级别的交互体验。

## 导航栏架构优化 (2025年7月更新)

### 概述
对 assignmentsPages 模块中所有页面的导航栏进行了统一的架构优化，采用分层设计，将状态栏高度和导航内容分离，提供更好的适配性和维护性。

### 改动内容

#### 1. 导航栏结构重构

**旧结构：**
```vue
<view class="nav-bar">
  <view class="nav-bar__left">...</view>
  <view class="nav-bar__center">...</view>
  <view class="nav-bar__right">...</view>
</view>
```

**新结构：**
```vue
<view class="nav-bar">
  <view class="nav-bar-status-bar" />
  <view class="nav-bar__content">
    <view class="nav-bar__left">...</view>
    <view class="nav-bar__center">...</view>
    <view class="nav-bar__right">...</view>
  </view>
</view>
```

#### 2. 样式系统优化

**核心改动：**
```scss
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: $bg-primary;
  border-bottom: 2rpx solid $border-color;

  &-status-bar {
    width: 100%;
    background-color: $bg-primary;
    height: env(safe-area-inset-top);
  }

  &__content {
    @include flex-between;
    height: $navbar-height;
    padding: 0 $spacing-base;
  }
}
```

**关键变化：**
- 移除了导航栏上的 `@include safe-area-top` mixin
- 添加独立的 `nav-bar-status-bar` 元素处理状态栏高度
- 导航内容包裹在 `nav-bar__content` 中，保持固定高度

#### 3. 影响范围

**已更新页面：**
- `index/index.vue` - 作业列表页
- `practice/questions.vue` - 练习题目页  
- `report/index.vue` - 作业报告页（使用 `nav-status-bar` 命名）

### 技术优势

#### 1. 更清晰的职责分离
- 状态栏高度由独立元素处理
- 导航内容区域高度固定，不受状态栏影响
- 便于理解和维护的结构

#### 2. 更好的适配性
- 在不同设备上状态栏高度自适应
- 导航栏内容始终保持一致的高度和对齐
- 避免了混合计算带来的复杂性

#### 3. 统一的实现方式
- 所有页面采用相同的导航栏架构
- 减少了代码重复和维护成本
- 便于后续的统一调整和优化

### 注意事项

1. **命名一致性**：report/index.vue 使用了 `nav-status-bar` 而非 `nav-bar-status-bar`，这是因为其使用了不同的 CSS 命名空间
2. **内容区域调整**：确保页面内容的 padding-top 已正确计算，包含了状态栏和导航栏的高度
3. **向后兼容**：此改动不影响功能，仅优化了内部实现

## AssignmentReport 横向布局优化 (2025年7月)

### 主要变更
对 `assignmentReport.vue` 顶部三个得分指标进行横向布局优化：

**布局调整：**
- 从垂直堆叠改为横向并列显示
- 三个卡片等宽分布（`flex: 1`）
- 卡片内部改为图标在上、文字在下的垂直布局

**尺寸优化：**
- 图标：120rpx → 80rpx（减少33%）
- 数值字体：`$font-size-xxl` → `$font-size-xl`
- 标签字体：`$font-size-base` → `$font-size-sm`
- 卡片间距和内边距适当减小

**效果：**节省垂直空间，提升移动端显示效果，用户可在一屏内查看所有关键数据。
