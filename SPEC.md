# 毛孩子健康助手 H5 - 产品规范

## 1. Concept & Vision

移动优先的宠物健康+社交 H5 应用。界面温暖友好，操作流畅直观。让宠物主人轻松管理宠物健康、获取 AI 诊断建议、在社区分享交流。

**slogan**: "你家毛孩子的健康+社交管家"

---

## 2. Design Language

### Aesthetic Direction
温暖治愈系，像打开一个宠物主题的日记本。圆润的卡片、微妙的渐变、柔和的阴影。

### Color Palette
```
--primary:     #FF9500    橙色，主色调，温暖有活力
--primary-dark:#FF6B00    深橙，hover/active 状态
--secondary:   #722ED1    紫色，用于 AI/特殊功能
--bg:          #F5F5F5    浅灰背景
--card:        #FFFFFF    白色卡片
--text:        #333333    主文字
--text-light:  #999999    次要文字
--success:     #52C41A    绿色，成功/健康
--warning:     #FAAD14    黄色，警告
--danger:      #FF4D4F    红色，紧急/危险
```

### Typography
- Primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- Scale: 12px / 14px / 16px / 18px / 20px / 24px / 32px / 48px
- Weight: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spatial System
- Base unit: 4px
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48px
- Border radius: 8px (small) / 12px (medium) / 16px (large) / 24px (card)
- Card padding: 16px (mobile), 24px (tablet)

### Motion Philosophy
- Transitions: 200ms ease for micro-interactions, 300ms ease-out for page transitions
- Tab switching: 150ms slide
- Cards: subtle hover lift (translateY -2px, shadow increase)
- Loading: skeleton shimmer animation
- No jarring animations; everything should feel natural

### Visual Assets
- Icons: Emoji-based for warmth (🐾 🐱 🐶 💉 🔬 🌟 ⏰)
- Images: Rounded corners (12px), subtle shadow
- Decorative: Soft gradients, subtle patterns

---

## 3. Layout & Structure

### Page Structure
移动端优先的单页应用 (SPA)，底部 TabBar 导航。

```
┌─────────────────────────┐
│       Status Bar        │  (system)
├─────────────────────────┤
│                         │
│      Content Area       │  (scrollable)
│      (max-width: 480px)│
│      centered           │
│                         │
├─────────────────────────┤
│   TabBar (fixed bottom) │
└─────────────────────────┘
```

### TabBar Navigation
4 个主 Tab：
1. **首页** 🏠 - 宠物卡片 + 快捷入口
2. **AI诊断** 🔬 - 看图诊断核心功能
3. **社区** 🌟 - 宠物社交 Feed
4. **提醒** ⏰ - 健康提醒管理

### Responsive Strategy
- Mobile (< 480px): 单列布局，全屏 TabBar
- Tablet (>= 480px): 内容居中，两侧留白

---

## 4. Features & Interactions

### 4.1 首页 (Home)

**宠物卡片轮播**
- 横向滚动，展示所有宠物
- 点击卡片 → 进入宠物档案页
- 长按/右滑 → 删除宠物

**快捷入口网格**
- 2x2 网格：AI诊断 / 健康记录 / 宠友圈 / 提醒管理
- 点击 → 跳转对应 Tab

**近期提醒列表**
- 显示未来 7 天内的提醒
- 点击 → 标记完成

### 4.2 AI 看图诊断 (Diagnosis)

**步骤流**
```
[选择类型] → [上传图片] → [AI分析] → [查看结果+相似案例]
```

**Step 1: 选择诊断类型**
- 6 种类型以卡片网格展示
- 皮肤 🔴 / 眼睛 👁️ / 排泄物 💩 / 行为 🌀 / 口腔 🦷 / 耳部 👂
- 选中高亮，边框变为橙色

**Step 2: 上传图片**
- 点击虚线区域 → 调用相机/相册
- 上传后显示预览 + "重新上传" 按钮
- 指导文字提示最佳拍摄角度

**Step 3: AI 分析中**
- 显示上传图片预览
- 覆盖半透明遮罩 + 旋转加载动画
- 文字："AI 正在分析中... 请稍候"

**Step 4: 查看结果**
- 紧急程度标签：🟢 居家观察 / 🟡 建议就医 / 🔴 立即就医
- 症状标签列表
- 可能原因（1-2 条）
- AI 建议处置方案
- 相似案例参考（来自社区/小红书）
- 免责声明："仅供参考，不替代兽医诊断"

**操作按钮**
- "💾 保存结果" → 存入本地诊断历史
- "🔄 重新诊断" → 重置流程

### 4.3 宠物社区 (Community)

**Tab 切换**
- 热门 🔥 / 最新 ✨ / 关注 ❤️

**Feed 列表**
- 卡片式帖子
- 卡片内容：头像+昵称+宠物名 / 正文 / 图片 / 点赞评论数 / AI宠物回复
- 宠物身份标识（🐱/🐶）badge

**交互**
- 双击/点击❤️ → 点赞动画 + 数字+1
- 点击 💬 → 评论面板滑出
- 点击右上角 "..." → 分享/举报

**发帖**
- 底部 FAB 按钮 (+) → 弹出发布页
- 选择宠物身份 → 写内容 → 选话题标签 → 发布

### 4.4 健康提醒 (Reminders)

**统计卡片**
- 待处理 X 个 / 已完成 X 个 / 宠物数

**提醒列表**
- 按日期分组（今天 / 明天 / 本周 / 更早）
- 每条：图标 + 标题 + 宠物名 + 日期
- 左滑 → 删除
- 点击 ✓ → 标记完成

**添加提醒**
- FAB (+) → 表单弹窗
- 选择宠物 / 选择类型（💉疫苗/💊驱虫/🏥体检/🛁洗澡/💊用药/📌其他）
- 填写标题 / 选择日期
- 保存 → 列表更新 + Toast 提示

### 4.5 宠物档案 (Pet Profile)

**入口**：首页宠物卡片点击

**宠物头像 + 基本信息**
- 头像（可点击更换）
- 名字 / 类型 / 品种 / 生日 / 体重 / 性别 / 绝育状态

**健康记录**
- 疫苗记录列表（名称/日期/下次日期/状态）
- 驱虫记录列表
- 添加记录按钮

**操作**
- 编辑 → 表单模式，可修改所有字段
- 添加健康记录 → 选择类型 + 日期 + 备注

---

## 5. Component Inventory

### TabBar
- **Default**: 图标灰色 + 文字
- **Active**: 图标橙色 + 文字橙色 + 上方圆角指示器
- **Badge**: 右上角红点（待处理提醒数）

### PetCard (首页轮播)
- 圆形头像 / 宠物名 / 品种 / 体重 badge
- **Hover**: translateY(-2px), shadow 增强
- **Active**: scale(0.98)

### ActionCard (快捷入口)
- 圆角方形 / 图标 + 文字
- **Hover**: 背景色加深 5%

### DiagnosisTypeCard
- 大图标 + 名称 + 描述
- **Default**: 白底灰边框
- **Selected**: 橙色边框 + 浅橙背景

### UploadZone
- 虚线边框区域
- **Default**: 灰色虚线 + 相机图标 + 提示文字
- **Hover**: 边框颜色变深
- **Drag-over**: 橙色虚线 + 橙色背景 10%

### ResultCard
- 左彩边标识紧急程度（绿/黄/红）
- 标签行 / 原因列表 / 建议文字

### PostCard
- 头像+昵称行 / 正文 / 图片网格 / 互动栏
- **Hover**: 卡片微微上浮

### ReminderItem
- 左侧图标（圆形彩色背景）
- 中间：标题 + 宠物名 + 日期
- 右侧：状态标签
- **Swipe-left**: 显示删除按钮

### Modal / Popup
- 底部弹出式（mobile native feel）
- 半透明遮罩
- 圆角顶部 24px
- 支持拖拽关闭

### Toast
- 居中显示
- 2 秒后自动消失
- 支持 ✅成功 / ⚠️警告 / ❌错误 三种图标

### EmptyState
- 大 emoji + 标题 + 描述 + 可选操作按钮

### LoadingSpinner
- 橙色旋转圆环
- 配合文字说明

---

## 6. Technical Approach

### Architecture
- **纯前端 SPA**：HTML + CSS + Vanilla JavaScript
- 无框架依赖，轻量快速
- 模块化 JS（ES6 import/export）
- CSS 变量管理主题

### Data Storage
- **localStorage** 存储所有数据（宠物/提醒/帖子/诊断历史）
- 数据结构 JSON，明文存储
- 未来可接入云端 API

### File Structure
```
h5/
├── index.html              # 单页应用入口
├── css/
│   ├── variables.css      # CSS 变量/主题
│   ├── base.css           # 重置 + 基础样式
│   ├── components.css     # 组件样式
│   └── pages.css         # 页面特定样式
├── js/
│   ├── app.js             # 主入口 + 路由
│   ├── store.js           # 数据状态管理
│   ├── api.js             # API 封装（支持 mock）
│   ├── components/        # UI 组件
│   │   ├── tabbar.js
│   │   ├── modal.js
│   │   └── toast.js
│   └── pages/
│       ├── home.js
│       ├── diagnosis.js
│       ├── community.js
│       ├── reminder.js
│       └── pet-profile.js
└── images/                # 静态资源
```

### AI 诊断 API 接口（Mock）
```javascript
// POST /api/diagnosis
// Request: { type: 'skin', image: base64 }
// Response: { success, data: { tags, causes, severity, suggestion } }
```

### 社区 API 接口（Mock）
```javascript
// GET  /api/posts?tab=hot&page=1
// POST /api/posts         { petId, content, images, topic }
// POST /api/posts/:id/like
// GET  /api/topics
```

### 提醒 API 接口
```javascript
// GET  /api/reminders
// POST /api/reminders     { petId, type, title, date }
// PUT  /api/reminders/:id  { done: true }
// DEL  /api/reminders/:id
```

---

## 7. Pages (Routes)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | 宠物卡片 + 快捷入口 |
| `/diagnosis` | Diagnosis | AI 看图诊断流程 |
| `/community` | Community | 宠物社交 Feed |
| `/reminders` | Reminders | 健康提醒列表 |
| `/pet/:id` | PetProfile | 宠物档案详情 |
| `/pet/:id/edit` | PetEdit | 编辑宠物信息 |

---

## 8. State Management

全局 store 对象，结构：

```javascript
{
  currentTab: 'home',
  pets: [...],
  reminders: [...],
  posts: [...],
  diagnosisHistory: [...],
  ui: {
    loading: false,
    modal: null,
    toast: null
  }
}
```

页面通过订阅 store 变化自动 re-render。

---

## 9. Accessibility

- 所有可交互元素有 `:focus` 样式
- 图片有 `alt` 文本
- 颜色对比度符合 WCAG AA
- 支持系统暗色模式（future）

---

## 10. Performance Targets

- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Lighthouse Score: > 90
- Bundle size: < 200KB (未压缩 HTML+CSS+JS)
