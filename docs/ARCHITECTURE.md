# 前后端联通架构方案

> 项目：pet-assistant-h5
> 日期：2026-03-31
> 架构师：AI Assistant

---

## 1. 现状分析

### 1.1 前端模块一览

| 文件 | 职责 | Mock 情况 |
|------|------|-----------|
| `api.js` | AI 诊断、图片处理、知识库配置 | **全量 Mock** — `diagnose()` / `getSimilarCases()` 均为 `setTimeout` 模拟 |
| `store.js` | 状态管理、localStorage 持久化 | 使用 `localStorage` 模拟数据库，用户体系为 `user: null` |
| `app.js` | 路由导航、页面切换、组件事件绑定 | 无 Auth 逻辑 |
| `pages.js` | 各页面渲染逻辑（首页/诊断/社区/提醒/宠物档案） | 无登录注册页面 |
| `components.js` | Toast/Modal/TabBar 等 UI 组件 | 纯 UI，与网络无关 |

### 1.2 具体 Mock 位置

**`api.js` — 完全未连接后端**

```javascript
// diagnose() — 伪造延迟，无任何网络请求
await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
// 返回 hardcode 的 diagnosisKB 数据

// getSimilarCases() — 300ms 延迟后返回 hardcode 数组
await new Promise(resolve => setTimeout(resolve, 300));

// uploadImage() — 仅做本地 canvas 压缩，url = base64，从未调用后端
```

**`store.js` — 数据全在 localStorage**

```javascript
// 所有数据以 'pet_h5_' 前缀存入 localStorage，与后端完全隔离
state: {
  pets: [],        // 来自 localStorage，无 userId 归属
  reminders: [],   // 同上
  posts: [],       // 同上
  user: null,      // ← 关键缺失：无用户身份
  ...
}
```

**`pages.js` — 无登录注册 UI**

- 没有 `renderLogin()` / `renderRegister()` 方法
- TabBar 只有 4 个 Tab：首页 / AI诊断 / 社区 / 提醒
- 社区发帖直接用 localStorage 的 pet 数据作为作者身份

**`app.js` — 无认证拦截**

- `init()` 直接 `navigateTo('home')`，无登录状态检查
- 所有网络操作经过 `API.*`，但 `API.*` 从不真正请求后端

### 1.3 后端现状

- **端口**：3000，已可用
- **认证**：简单 JWT（base64 payload，SHA256 签名，无过期时间字段验证）
- **数据库**：JSON 文件（`db/data.json`），内存操作后持久化
- **密码**：SHA256 简单哈希，无盐值轮转
- **CORS**：`*` 全开放
- **已有端点**：`/api/auth/register`, `/api/auth/login`, `/api/pets`, `/api/reminders`, `/api/posts`, `/api/diagnosis`

### 1.4 核心差距

| 维度 | 前端现状 | 目标 |
|------|---------|------|
| 用户体系 | `user: null`，无登录注册 | 完整 Auth Flow |
| 数据归属 | localStorage，无 userId | 所有数据按 userId 隔离 |
| AI 诊断 | `setTimeout` + hardcode KB | 真实后端推理（或对接外部 AI） |
| 相似案例 | 前端 hardcode 数组 | 后端/数据库查询 |
| Token 管理 | 无 | JWT 存储 + 拦截器 + 刷新 |
| 网络层 | 零 HTTP 调用 | 统一请求层，含错误处理 |

---

## 2. 推荐方案：渐进式改造

### 2.1 为什么不选重构式？

- 前端代码量适中（约 2000 行），结构清晰，SPEC 定义完善
- Store 订阅模式是良好的状态管理基础，只需替换存储后端
- Mock 代码和真实逻辑在同一文件内，边界清晰
- 团队可以逐功能验证，降低一次性上线风险

### 2.2 渐进式改造路线图

```
Phase 1 (1-2天)  →  搭建网络层 + Auth UI
Phase 2 (1-2天)  →  替换 Pets/Reminders 数据层
Phase 3 (1-2天)  →  替换社区 Posts 数据层
Phase 4 (1-2天)  →  替换 AI 诊断数据层
Phase 5 (1天)    →  数据迁移 + 清理 Mock
```

### 2.3 Phase 1 详解：网络层 + Auth UI

**新增文件：`js/http.js`**

```
┌─────────────────────────────────────────────────────┐
│  http.js (新增)                                      │
│  ├── httpClient — 统一请求方法，支持拦截器            │
│  ├── TokenManager — token 存取 / 刷新 / 过期检测      │
│  └── api — 所有后端端点的调用封装                     │
├─────────────────────────────────────────────────────┤
│  api.js (改造)                                       │
│  ├── 移除 diagnose() / getSimilarCases() mock 逻辑  │
│  ├── 调用 http.js 中的 api.*                        │
│  └── 保留 KB 配置（知识库纯前端缓存/参考用）          │
├─────────────────────────────────────────────────────┤
│  store.js (改造)                                     │
│  ├── user 状态从 null → 真实 user 对象               │
│  ├── 登出时清空所有 localStorage，换用后端数据        │
│  └── 保留 initSampleData() 作为游客模式兜底          │
├─────────────────────────────────────────────────────┤
│  pages.js (改造)                                     │
│  ├── 新增 renderLogin() / renderRegister()          │
│  ├── 新增 renderProfile() — 用户个人中心              │
│  └── TabBar 新增「我的」Tab                          │
├─────────────────────────────────────────────────────┤
│  app.js (改造)                                       │
│  ├── App.init() 先检查登录状态，再导航               │
│  ├── 401 响应 → 跳转登录页                          │
│  └── 登录成功后恢复原页面                            │
└─────────────────────────────────────────────────────┘
```

---

## 3. 改动清单

### 3.1 新增文件

| 文件 | 说明 |
|------|------|
| `js/http.js` | HTTP 客户端、Token 管理器、API 调用封装 |
| `js/pages/auth.js` | 登录/注册页面渲染（可内联到 pages.js） |
| `css/auth.css` | 登录注册页样式 |
| `js/utils.js` | 通用工具函数（日期格式化、参数校验等） |

### 3.2 需改造的文件

| 文件 | 改动内容 |
|------|---------|
| `api.js` | 移除 `diagnose()` / `getSimilarCases()` 的 `setTimeout` mock，改为调用 `http.js` |
| `store.js` | `user` 字段改造、登录/登出方法、数据按 `userId` 隔离 |
| `pages.js` | 新增 `renderLogin()`、`renderRegister()`、`renderProfile()` |
| `app.js` | Auth 拦截逻辑、`navigateTo` 权限控制 |
| `index.html` | 引入新 JS/CSS，TabBar 新增「我的」Tab |

### 3.3 API 对应关系

| 前端操作 | 当前实现 | 目标后端端点 |
|---------|---------|------------|
| 登录 | `Store.state.user = null` | `POST /api/auth/login` |
| 注册 | 无 | `POST /api/auth/register` |
| 获取宠物列表 | `Store.state.pets` | `GET /api/pets` |
| 添加宠物 | `Store.addPet()` | `POST /api/pets` |
| 编辑宠物 | `Store.updatePet()` | `PUT /api/pets/:id` |
| 删除宠物 | `Store.deletePet()` | `DELETE /api/pets/:id` |
| 获取提醒 | `Store.state.reminders` | `GET /api/reminders` |
| 添加提醒 | `Store.addReminder()` | `POST /api/reminders` |
| 完成任务 | `Store.completeReminder()` | `POST /api/reminders/:id/complete` |
| 删除提醒 | `Store.deleteReminder()` | `DELETE /api/reminders/:id` |
| 获取帖子 | `Store.state.posts` | `GET /api/posts` |
| 发帖 | `Store.addPost()` | `POST /api/posts` |
| 点赞 | `Store.toggleLike()` | `POST /api/posts/:id/like` |
| AI 诊断 | `API.diagnose()` mock | `POST /api/diagnosis` |
| 相似案例 | `API.getSimilarCases()` mock | 复用 `GET /api/posts`（按 topic 过滤） |
| 诊断历史 | `Store.saveDiagnosis()` | `GET /api/diagnosis` |

---

## 4. 认证设计

### 4.1 整体流程

```
用户打开APP
    │
    ▼
App.init() 检查 Token
    │
    ├─── Token 存在且未过期 ──→ 自动登录 ──→ 请求用户信息 ──→ 进入首页
    │
    └─── Token 不存在/已过期 ──→ 跳转登录页
                                      │
                               用户输入账号密码
                                      │
                               POST /api/auth/login
                                      │
                               获得 JWT Token
                                      │
                               存储 Token + userInfo
                                      │
                               恢复之前页面的导航
```

### 4.2 Token 存储策略

**存储位置：`localStorage`**

```javascript
// 键名设计
'pet_h5_token'     → JWT 字符串
'pet_h5_user'       → { id, username, nickname } JSON
```

**不推荐使用 `sessionStorage`**：SPA 单页应用中，用户刷新页面需重新登录，体验差。

**不推荐使用 Cookie**：当前后端无 CSRF 防护，且 H5 跨域场景下 Cookie 携带规则复杂。

### 4.3 TokenManager 设计

```javascript
const TokenManager = {
  TOKEN_KEY: 'pet_h5_token',
  USER_KEY: 'pet_h5_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  },

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  isExpired() {
    // 后端 JWT payload exp 为 Date.now() + 30天
    // 前端解码 exp 字段判断
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now();
    } catch {
      return true; // 格式错误视为过期
    }
  },

  isLoggedIn() {
    return !!this.getToken() && !this.isExpired();
  }
};
```

### 4.4 HTTP 拦截器

```javascript
async function request(url, options = {}) {
  const token = TokenManager.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();

    // 401 → Token 过期或无效
    if (res.status === 401) {
      TokenManager.clear();
      // 触发全局跳转登录（通过事件总线）
      window.dispatchEvent(new CustomEvent('auth:expired'));
      return { success: false, message: '登录已过期，请重新登录' };
    }

    return data;
  } catch (err) {
    return { success: false, message: '网络异常，请检查网络连接' };
  }
}
```

### 4.5 App.init() 登录态检查

```javascript
// app.js
init() {
  // 立即检查登录态
  if (TokenManager.isLoggedIn()) {
    // 自动登录：设置 Store user，恢复页面
    Store.setState('user', TokenManager.getUser());
    this.navigateTo('home');
  } else {
    // 未登录：展示欢迎页/登录页
    this.navigateTo('login');
  }

  // 全局监听 Token 过期
  window.addEventListener('auth:expired', () => {
    Toast.error('登录已过期，请重新登录');
    TokenManager.clear();
    this.navigateTo('login');
  });

  TabBar.init();
  Store.subscribe(() => this.onStateChange());
}
```

### 4.6 注册/登录 API 映射

```javascript
// http.js 中
export const AuthAPI = {
  async login(username, password) {
    return request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  async register(username, password, nickname) {
    return request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, nickname })
    });
  }
};
```

### 4.7 渐进式接入注意事项

- Phase 1 上线后，后端支持不带 Token 访问 `/api/auth/*`
- 宠物/提醒等数据端点必须带 Token，后端已实现 `auth()` 中间件
- 前端在 Token 过期时，应展示"登录已过期"而非直接报错，给用户清晰指引

---

## 5. 风险 & 应对

### 风险 1：后端 JWT 实现简陋

**风险描述**：
后端使用 `Buffer.from(JSON.stringify(payload)).toString('base64')` 生成 JWT，无标准签名（HMAC），任何人都可伪造任意 payload 的 Token。

**影响**：严重 — 攻击者可伪造任意用户身份

**应对**：
- 短期：后端引入 `jsonwebtoken` 库（`npm install jsonwebtoken`），使用强密钥（环境变量 `JWT_SECRET`）签发标准 RS256/HS256 Token
- 前端解码 `exp` 字段的逻辑无需改动（标准 JWT 格式兼容）
- 建议同时实现 Refresh Token（7 天有效期），短期 Token 缩短为 15 分钟

---

### 风险 2：密码明文/SHA256 无盐

**风险描述**：
后端密码用 `sha256(password + JWT_SECRET)` 存储，无随机盐。彩虹表攻击可在秒级破解常见密码。

**应对**：
- 短期：在注册时加盐 `sha256(password + username + JWT_SECRET)`，延缓彩虹表攻击
- 中期：引入 `bcrypt`（`npm install bcrypt`），迁移旧用户下次登录时自动升级
- 不影响前端改造进度，但应尽早处理

---

### 风险 3：CORS 全开放

**风险描述**：
`Access-Control-Allow-Origin: *` 允许任意域名接入，在生产环境是严重安全问题。

**应对**：
- 开发/测试阶段：保持 `*`，方便调试
- 上线前：改为白名单模式，从环境变量读取允许的 origin 列表
- 前端 H5 部署域名确定后，配置 `ALLOWED_ORIGINS=https://your-domain.com`

---

### 风险 4：localStorage 与后端数据不一致

**风险描述**：
Phase 1-4 改造期间，游客模式用 localStorage，已登录用户用后端。切换时数据"漂移"（localStorage 有数据但后端无，或反之）。

**应对**：
- 策略 A（推荐）：**互斥存储** — 登录后清空 localStorage 中的 pets/reminders/posts，全部从后端拉取
- 策略 B：**合并存储** — localStorage 作为离线缓存，后端作为 source of truth，每次打开 App 优先请求后端
- 建议 Phase 1 上线前实现**数据迁移引导**：用户首次登录时，将 localStorage 中的宠物/提醒等合并到后端（逐条 `POST`，后端去重）

---

### 风险 5：AI 诊断后端为 Mock

**风险描述**：
当前后端 `/api/diagnosis` 内部是 `mockDiagnose()` hardcode 知识库，非真实 AI。

**应对**：
- 短期：前端 `api.js` 保留本地 KB 作为 fallback，当后端请求失败时使用前端 mock 结果（改善体验）
- 中期：接入真实 AI 服务（通义千问/DeepSeek API），后端只做转发和鉴权
- 前端展示诊断结果时必须显示免责声明（已有），即使接入真 AI 也必须保留

---

### 风险 6：后端无请求限流/频率限制

**风险描述**：
社区发帖/点赞/诊断等接口无限制，可能被恶意刷接口。

**应对**：
- 短期：在后端加简单内存限流（如 `Map<userId, count>`，60 秒内同接口最多 30 次）
- 中期：引入 `express-rate-limit` 或独立限流服务
- 前端无改动，但应在后端文档中注明限流策略

---

### 风险 7：跨设备数据同步

**风险描述**：
目前数据在 localStorage，换设备后数据全无。用户无预期"云端同步"。

**应对**：
- Phase 1-4 完成后，用户数据已存储于后端天然解决
- 前端可在设置页显示"同步状态"（最后同步时间）
- 不影响改造路线，但应告知用户这是改造的隐性收益

---

## 附录：推荐后端加固清单（改造期间同步完成）

```
[ ] 引入 jsonwebtoken 替代自实现 JWT
[ ] 引入 bcryptjs 替代 SHA256 密码存储
[ ] 添加 Refresh Token 机制
[ ] CORS 从 * 改为白名单
[ ] 添加请求限流（内存版，上线前替换为 Redis 版）
[ ] /api/auth/* 保持无需认证，其余端点强制认证
[ ] 统一错误响应格式 { success, message, data? }
[ ] 添加请求日志（开发调试用）
[ ] db/data.json 备份机制（每次写入前备份 .bak）
```

---

*本文档为技术分析输出，不含实际代码实现。*
