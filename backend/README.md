# 🐾 毛孩子健康助手 - 后端 API

## 快速启动

```bash
# 无需安装任何依赖！纯 Node.js 内置模块
node src/server.js
```

服务器会在 http://localhost:3000 启动

## API 接口

### 认证
- POST /api/auth/register - 注册
- POST /api/auth/login - 登录

### 宠物
- GET /api/pets - 获取宠物列表
- POST /api/pets - 添加宠物
- PUT /api/pets/:id - 更新宠物
- DELETE /api/pets/:id - 删除宠物

### 健康记录
- GET /api/pets/:id/records - 获取记录
- POST /api/pets/:id/records - 添加记录
- DELETE /api/pets/:id/records/:recordId - 删除记录

### 提醒
- GET /api/reminders - 获取提醒
- POST /api/reminders - 添加提醒
- PUT /api/reminders/:id - 更新提醒
- POST /api/reminders/:id/complete - 标记完成
- DELETE /api/reminders/:id - 删除提醒

### 帖子
- GET /api/posts - 获取帖子
- POST /api/posts - 发帖
- POST /api/posts/:id/like - 点赞
- GET /api/posts/:id/comments - 获取评论
- POST /api/posts/:id/comments - 评论

### AI 诊断
- GET /api/diagnosis - 获取诊断历史
- POST /api/diagnosis - AI 诊断

### 其他
- GET /api/stats - 统计数据
- GET /api/health - 健康检查

## 认证方式

所有需要认证的接口，请在 Header 中添加：
```
Authorization: Bearer <token>
```

token 在登录/注册时获取。
