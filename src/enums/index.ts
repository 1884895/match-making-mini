// 考试类型
export const ExamType = {
  1: '期中考试',
  2: '期末考试',
  3: '月考',
  4: '竞赛',
  5: '普通考试',
  6: '联考',
  7: '单元测试',
  8: '模块检测',
  9: '专项复习',
  10: '入学考',
  11: '问卷',
}

// 绑定类型
export const BindType = {
  1: '姓名+学号/考号（推荐方式）',
  2: '姓名+身份证+学校',
  3: '好分数学生版账号',
}

// 角色列表
export const RoleList = [
  {
    type: 2,
    name: '家长',
  },
  {
    type: 1,
    name: '学生',
  },
]

// 平台类型
export const PlatformType = {
  ios: 1,
  android: 2,
  window: 3,
  mac: 4,
}

/**
 * 首页工具配置
 * name: 名字
 * type: key
 * path: 跳转路径
 * platform: 平台
 * login: 是否需要登录
 * bindStudent: 是否需要绑定学生
 * setVersion: 是否需要设置版本
 */
export const BrowserType = {
  version: { name: '设置教材版本', type: 'version', path: `${feConfig.mobileUrl}/pages/edit/editInfo`, platform: 'h5', login: true, bindStudent: false, setVersion: false },
  exam: { name: '考试', type: 'exam', path: '/uni_modules/hfs-fe-uni-module/examPages/index/index', platform: 'mini', login: true, bindStudent: false, setVersion: false },
  record: { name: '考试档案', type: 'record', path: '/uni_modules/hfs-fe-uni-module/examPages/examRecord/index', platform: 'mini', login: true, bindStudent: false, setVersion: false },
  wrongBook: { name: '错题本', type: 'wrongBook', path: `${feConfig.mobileUrl}/questionPages/index/index`, platform: 'h5', login: true, bindStudent: false, setVersion: false },
  course: { name: '课程', type: 'course', path: '/pages/course/course', platform: 'mini', login: true, bindStudent: false, setVersion: false },
  practice: { name: '练习', type: 'practice', path: `${feConfig.mobileUrl}/practicePages/index/index`, platform: 'h5', login: true, bindStudent: false, setVersion: true },
  paperDownload: { name: '试卷下载', type: 'paperDownload', path: `${feConfig.mobileUrl}/knowledgePages/paperDownload/index`, platform: 'h5', login: true, bindStudent: false, setVersion: false },
  aboutUs: { name: '玩转好分数', type: 'aboutUs', path: `${feConfig.mobileUrl}/pages/intro/index`, platform: 'h5', login: false, bindStudent: false, setVersion: false },
  group: { name: '团购狂欢', type: 'group', path: '/uni_modules/hfs-fe-uni-module/pages/group/open', platform: 'mini', login: true, bindStudent: true, setVersion: false },
  invite: { name: '0元续会员', type: 'invite', path: '/uni_modules/hfs-fe-uni-module/pages/introduction/operation', platform: 'mini', login: true, bindStudent: true, setVersion: false },
  myClassGroup: { name: '我的班级群', type: 'myClassGroup', path: '', platform: 'mini', login: true, bindStudent: true, setVersion: false },
}
