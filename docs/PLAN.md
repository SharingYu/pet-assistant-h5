# Phase 2 实施计划：前端末端联通

## 目标概述

Phase 2 核心目标是将前端从 mock 数据切换为真实后端 API 调用（端口 3000），同时完成用户认证体系。主要原则：

- **渐进式替换**：按优先级逐模块替换，避免一次性大规模改动导致难以调试
- **验证先行**：每个子步骤完成后立即验证，再进入下一步
- **依赖清晰**：记录每步的输入、输出和前置依赖

---

## 阶段 1：基础联通（API 层改造）

> 目标：前端能成功调用后端真实接口，数据能读能写，不再依赖 localStorage mock 数据

### 步骤 1.1 — API 层适配：引入真实请求

**文件**: `js/api.js`

**改动**:
- 新增 `API_BASE` 常量指向 `http://localhost:3000`
- 新增 `token` 管理：存储在 `localStorage` 键 `pet_h5_token`，读取附加到请求头 `Authorization: Bearer <token>`
- 将所有 mock 方法（diagnose、getSimilarCases、uploadImage 等）改为真实 HTTP 调用，诊断相关方法暂时保留 mock 逻辑（AI 诊断为独立模块）
- 统一响应格式：用 `response.json()` → 提取 `data`，错误时 `toast` 提示

**依赖**: 无（从零开始）

**验证**:
- 手动测试 `fetch('http://localhost:3000/api/health')` 返回 `{status:'ok'}`
- 确认请求头包含 `Authorization`

---

### 步骤 1.2 — Store 层改造：从 localStorage 切换到 API 驱动

**文件**: `js/store.js`

**改动**:
- `init()` 不再从 localStorage 读取 pets/reminders/posts 等初始数据，改为空状态
- 各类数据操作（addPet、updatePet、addReminder 等）改为调用 `API.*` 方法发真实请求
- 保留发布-订阅机制（render 仍依赖 Store 状态）
- `load()` / `save()` 仅保留给 settings 使用（主题、通知开关等轻量配置）

**依赖**: 步骤 1.1 完成

**验证**:
- `Store.state.pets` 初始为空数组
- 调用 `API.getPets()` 后 Store 更新，UI 自动刷新

---

### 步骤 1.3 — 宠物列表页数据联通

**文件**: `js/pages.js`（renderHome 部分）、`js/components.js`

**改动**:
- 首页加载时调用 `API.getPets()` 填充宠物卡片
- 宠物卡片点击逻辑不变（跳 pet-profile）
- 「添加宠物」卡片触发 modal（已有），modal 提交时调用 `API.createPet()`

**依赖**: 步骤 1.2 完成

**验证**:
- 打开首页，等待 1-2 秒（网络请求），宠物列表正确渲染
- 添加新宠物后，列表出现新卡片，刷新页面数据仍在（后端持久化）

---

### 步骤 1.4 — 宠物详情页数据联通

**文件**: `js/pages.js`（renderPetProfile 部分）

**改动**:
- 进入宠物详情页时调用 `API.getPets()` 找到当前宠物（前端过滤）
- 疫苗/驱虫记录调用 `API.getHealthRecords(petId, type)` 填充
- 添加记录时调用 `API.createHealthRecord()`
- 删除记录时调用 `API.deleteHealthRecord()`

**依赖**: 步骤 1.3 完成

**验证**:
- 宠物详情页正确显示宠物信息和健康记录
- 添加一条疫苗记录，刷新页面记录仍在

---

### 步骤 1.5 — 提醒页数据联通

**文件**: `js/pages.js`（renderReminders 部分）

**改动**:
- 提醒页加载时调用 `API.getReminders(includeDone=false)`
- 添加提醒调用 `API.createReminder()`
- 标记完成调用 `API.completeReminder(id)`
- 删除提醒调用 `API.deleteReminder(id)`

**依赖**: 步骤 1.2 完成

**验证**:
- 提醒列表正确显示待完成事项
- 标记完成后条目消失（或移入已完成区域）
- 刷新页面已完成状态持久化

---

### 步骤 1.6 — 社区页数据联通

**文件**: `js/pages.js`（renderCommunity 部分）

**改动**:
- 加载时调用 `API.getPosts(tab='hot')` 获取帖子列表
- 发帖调用 `API.createPost({content, images, topic})`
- 点赞调用 `API.likePost(postId)`
- 评论调用 `API.getComments(postId)` / `API.addComment(postId, content)`
- 删除帖子调用 `API.deletePost(postId)`

**依赖**: 步骤 1.2 完成

**验证**:
- 帖子列表正确渲染，点赞数真实
- 发帖后立即显示在列表顶部，刷新后仍在
- 评论加载正常

---

## 阶段 2：认证流程（登录/注册 + Token 管理）

> 目标：用户必须登录才能使用，Token 贯穿所有 API 调用

### 步骤 2.1 — 登录/注册 UI 新增

**文件**: `js/pages.js`（新增 `renderAuth` 函数）、`js/components.js`（新增 auth 相关组件）

**改动**:
- 新增 auth 页面（两个 tab：登录 / 注册），包含：
  - 注册：用户名、密码、昵称 三个输入框
  - 登录：用户名、密码 两个输入框
- 设计要求：简洁移动端友好，单页无刷新切换
- 在 auth 页面顶部说明"登录后可同步宠物数据到云端"

**依赖**: 阶段 1 无依赖（auth UI 独立）

**验证**:
- 打开应用首先看到登录页
- 填写正确信息点注册 → 成功 → 跳转首页
- 填写错误信息 → 友好错误提示

---

### 步骤 2.2 — 登录/注册 API 集成

**文件**: `js/api.js`

**改动**:
- `API.login(username, password)` → POST `/api/auth/login`，成功后存储 token
- `API.register(username, password, nickname)` → POST `/api/auth/register`，成功后自动登录（获取 token）
- 登录成功后 `Store.setState({ user: { id, username, nickname } })`

**依赖**: 步骤 2.1 完成

**验证**:
- 注册新用户 → 收到 token → 首页右上角显示昵称
- 关闭标签页再打开 → 读取本地 token → 自动登录 → 进入首页

---

### 步骤 2.3 — Token 持久化和自动登录

**文件**: `js/store.js`、`js/app.js`

**改动**:
- `Store.init()` 检查 localStorage 是否有 `pet_h5_token`，有则设置到 `API.token`
- 应用初始化时如果无 token → 强制跳转 auth 页面
- `App` 增加 `logout()` 方法：清除 token、跳转 auth 页
- 首页头部显示用户昵称 + 退出按钮

**依赖**: 步骤 2.2 完成

**验证**:
- 无 token 时打开应用 → 强制登录页
- 登录后进入首页，昵称显示在顶部
- 点击退出 → 返回登录页

---

### 步骤 2.4 — 请求拦截：未登录状态处理

**文件**: `js/api.js`

**改动**:
- 所有 API 请求在 401 响应时自动 `logout()` 并提示"登录已过期，请重新登录"
- Token 过期（后端 JWT exp）处理同上
- 网络错误统一 toast 提示"网络异常，请检查网络连接"

**依赖**: 步骤 2.3 完成

**验证**:
- 手动删除 localStorage token，刷新页面 → 跳登录页
- 模拟 401 响应 → toast 提示 → 跳登录页

---

## 阶段 3：核心功能（宠物管理 + 提醒 + AI 诊断）

> 目标：三大核心功能在 Phase 2 结束时完整可用，用户可正常流转

### 步骤 3.1 — 宠物管理完整流程

**文件**: `js/pages.js`（pet-profile）、`js/components.js`（pet-form）

**改动**:
- 宠物编辑：调用 `API.updatePet(id, updates)`
- 宠物删除：调用 `API.deletePet(id)`，删除后返回首页
- 宠物头像上传：复用现有的 `uploadImage`，上传后拿到 URL 再提交 pet

**依赖**: 阶段 1.4 完成

**验证**:
- 编辑宠物信息 → 刷新页面信息正确
- 删除宠物 → 列表无此宠物
- 上传头像 → 头像正确显示

---

### 步骤 3.2 — 提醒完整流程 + 到期通知

**文件**: `js/pages.js`（reminders）、`js/api.js`

**改动**:
- 提醒编辑：调用 `API.updateReminder(id, updates)`
- 新增时间选择器（已有组件，补全日期时间选择）
- 提醒按时间分组展示（今日 / 本周 / 已过期 / 已完成）
- 提醒设置成功 toast 提示

**依赖**: 阶段 1.5 完成

**验证**:
- 创建提醒时选择具体日期时间
- 提醒列表按日期正确分组
- 编辑提醒时间 → 列表顺序自动更新

---

### 步骤 3.3 — AI 诊断联通（历史记录）

**文件**: `js/pages.js`（diagnosis）、`js/api.js`

**改动**:
- 诊断提交时调用 `API.createDiagnosis({type, imageUrl, ...})`
- 诊断历史页调用 `API.getDiagnosis()` 加载历史
- 删除诊断记录调用 `API.deleteDiagnosis(id)`
- 诊断结果展示复用现有 UI（只替换数据来源）

**依赖**: 阶段 1 完成（诊断 AI 逻辑保留在 mock，后端 `mockDiagnose` 逐步替换）

**验证**:
- 选择诊断类型 + 上传图片 → 提交 → 显示诊断结果
- 诊断记录存入历史，刷新后历史存在
- 删除历史记录 → 列表更新

---

### 步骤 3.4 — 首页数据初始化（登录后首次加载）

**文件**: `js/app.js`、`js/store.js`

**改动**:
- 登录成功后立即调用 `API.getPets()` 和 `API.getReminders()` 预加载数据
- 首页渲染等待数据加载完成（loading 状态）
- 避免首次登录后页面空白（数据未到达前闪烁）

**依赖**: 阶段 2 + 阶段 1.3 完成

**验证**:
- 登录后跳转首页 → 看到短暂 loading → 宠物列表出现
- 无数据时显示引导添加宠物的 empty state

---

## 步骤详情汇总

### 步骤清单

| # | 步骤名 | 文件 | 优先级 |
|---|--------|------|--------|
| 1.1 | API 层引入真实请求 | api.js | P0 |
| 1.2 | Store 层切换为 API 驱动 | store.js | P0 |
| 1.3 | 宠物列表页数据联通 | pages.js | P1 |
| 1.4 | 宠物详情页数据联通 | pages.js | P1 |
| 1.5 | 提醒页数据联通 | pages.js | P1 |
| 1.6 | 社区页数据联通 | pages.js | P1 |
| 2.1 | 登录/注册 UI 新增 | pages.js, components.js | P0 |
| 2.2 | 登录/注册 API 集成 | api.js | P0 |
| 2.3 | Token 持久化和自动登录 | store.js, app.js | P0 |
| 2.4 | 请求拦截：未登录处理 | api.js | P1 |
| 3.1 | 宠物管理完整流程 | pages.js, components.js | P1 |
| 3.2 | 提醒完整流程 + 分组 | pages.js | P1 |
| 3.3 | AI 诊断联通（历史） | pages.js, api.js | P1 |
| 3.4 | 首页数据初始化优化 | app.js | P2 |

### 详细步骤

---

**1.1 — API 层引入真实请求**
- **文件**: `js/api.js`
- **改动**:
  - 新增 `const API_BASE = 'http://localhost:3000'`
  - 新增 `setToken(token)` / `getToken()` 读写 localStorage `pet_h5_token`
  - 新增 `async request(method, path, body, params)` 方法，统一处理 fetch、CORS、Authorization 头、401 响应
  - 将 `api.js` 顶部的 mock `diagnosisKB`、`topics`、`reminderTypes`、`petTypes` 保留（这些是静态配置，不走网络）
  - 诊断方法 `diagnose()`、`getSimilarCases()` 暂时保持 mock（后续接入真实 AI）
- **依赖**: 无
- **验证**: 手动 `fetch('http://localhost:3000/api/health')` 返回正常 JSON

---

**1.2 — Store 层切换为 API 驱动**
- **文件**: `js/store.js`
- **改动**:
  - `init()` 改为：清空 pets/reminders/posts/diagnosisHistory，尝试从 localStorage 恢复 user（如果有 token）
  - 所有 CRUD 方法（addPet、updatePet、deletePet、addReminder、completeReminder、deleteReminder、addPost、toggleLike、addComment、saveDiagnosis 等）改为 `await API.xxx(...)` 调用
  - 保留 `generateAIPetReply()`（纯前端逻辑）
  - 保留订阅-发布机制
- **依赖**: 步骤 1.1
- **验证**: 在控制台手动 `await API.getPets()` 返回数组后，Store.state.pets 正确更新

---

**1.3 — 宠物列表页数据联通**
- **文件**: `js/pages.js`（renderHome）
- **改动**: 首页 onMount 时调用 `API.getPets()` 填充宠物列表，其余逻辑不变
- **依赖**: 步骤 1.2
- **验证**: 首页显示真实宠物数据，添加宠物后刷新页面数据不丢失

---

**1.4 — 宠物详情页数据联通**
- **文件**: `js/pages.js`（renderPetProfile）
- **改动**: 进入时通过 petId 调用 `API.getPets()` 获取完整宠物数据，健康记录调用 `API.getHealthRecords(petId, type)`
- **依赖**: 步骤 1.3
- **验证**: 宠物详情页正确显示疫苗/驱虫记录，增删改记录有效

---

**1.5 — 提醒页数据联通**
- **文件**: `js/pages.js`（renderReminders）
- **改动**: 调用 `API.getReminders()` 加载，`completeReminder()` / `deleteReminder()` / `createReminder()` 均走 API
- **依赖**: 步骤 1.2
- **验证**: 提醒操作实时同步，刷新不丢失

---

**1.6 — 社区页数据联通**
- **文件**: `js/pages.js`（renderCommunity）
- **改动**: 发帖/点赞/评论/删除均调用真实 API
- **依赖**: 步骤 1.2
- **验证**: 帖子点赞数真实，评论加载正常

---

**2.1 — 登录/注册 UI 新增**
- **文件**: `js/pages.js`（新增 `renderAuth`）、`js/components.js`（新增 auth 表单组件）
- **改动**: 新增 auth 页面，支持 tab 切换登录/注册，所有输入框移动端友好
- **依赖**: 无
- **验证**: 未登录状态下打开应用显示 auth 页面

---

**2.2 — 登录/注册 API 集成**
- **文件**: `js/api.js`
- **改动**: 新增 `API.login()` / `API.register()`，成功后 `setToken()` 并更新 Store.user
- **依赖**: 步骤 2.1
- **验证**: 注册新账号成功，自动跳转首页并显示昵称

---

**2.3 — Token 持久化和自动登录**
- **文件**: `js/store.js`、`js/app.js`
- **改动**: Store.init() 检查 token → 自动登录态；新增 logout() 清除 token；首页显示昵称和退出
- **依赖**: 步骤 2.2
- **验证**: 关闭重开浏览器 → 自动进入首页（token 有效期内）

---

**2.4 — 请求拦截：未登录处理**
- **文件**: `js/api.js`
- **改动**: 401 响应时 toast 提示 + 跳登录页；网络错误统一提示
- **依赖**: 步骤 2.3
- **验证**: 手动清 token 后操作 → 提示并跳转

---

**3.1 — 宠物管理完整流程**
- **文件**: `js/pages.js`、`js/components.js`
- **改动**: 编辑/删除宠物、头像上传均走 API，支持宠物头像 URL 存储展示
- **依赖**: 步骤 1.4
- **验证**: 完整 CRUD 流程，刷新后数据正确

---

**3.2 — 提醒完整流程 + 分组**
- **文件**: `js/pages.js`
- **改动**: 提醒按 今日/本周/已过期/已完成 分组展示，时间选择器完善
- **依赖**: 步骤 1.5
- **验证**: 提醒正确分组，编辑后位置自动更新

---

**3.3 — AI 诊断联通（历史）**
- **文件**: `js/pages.js`、`js/api.js`
- **改动**: 诊断结果保存到后端 `POST /api/diagnosis`，历史从 `GET /api/diagnosis` 加载
- **依赖**: 步骤 1 完成
- **验证**: 诊断记录存入后端，刷新历史列表不丢失

---

**3.4 — 首页数据初始化优化**
- **文件**: `js/app.js`
- **改动**: 登录后立即预加载 pets + reminders，加载中显示 skeleton 或 loading
- **依赖**: 步骤 2.3 + 1.3
- **验证**: 登录后跳转首页 → loading 动画 → 完整数据渲染

---

## 优先级执行顺序

```
P0（阻塞链，必须先做）:
1.1 → 1.2 → 2.1 → 2.2 → 2.3

P1（功能可用性，承接 P0）:
1.3 → 1.4 → 1.5 → 1.6 → 2.4 → 3.1 → 3.2 → 3.3

P2（体验优化，最后做）:
3.4
```

## 测试策略

1. **API 可用性**：后端 `GET /api/health` 确认服务在线
2. **逐模块验证**：每步完成后在浏览器控制台手动调用对应 API 方法，确认返回数据正确
3. **功能流测试**：
   - 注册 → 登录 → 添加宠物 → 添加提醒 → 发帖 → AI 诊断 → 全流程可跑通
4. **异常测试**：
   - 无 token 时操作 → 强制跳转
   - 网络断开 → 友好提示
   - 注册用户名重复 → 错误提示
5. **持久化验证**：每个操作完成后刷新页面，数据不丢失

## 注意事项

- 诊断 AI 逻辑（`mockDiagnose`）在 Phase 2 保持前端 mock，不影响用户体验；后端已有 `mockDiagnose` 基础，后续可平滑切换
- 所有后端 API 均为 JSON，Content-Type 统一为 `application/json`
- Token 有效期 30 天，后端 JWT 过期后需重新登录（步骤 2.4 处理）
- 前端不做分页（宠物数量有限），社区帖子暂不实现分页（Phase 3 可按需扩展）
