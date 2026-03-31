/**
 * 毛孩子健康助手 - 轻量后端 API
 * 纯 Node.js 内置模块，零依赖
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');

// ============ 配置 ============
const PORT = process.env.PORT || 3000;
const DB_DIR = path.join(__dirname, '../db');
const DATA_FILE = path.join(DB_DIR, 'data.json');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// 确保目录存在
[DB_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ============ 数据库 ============
const DB = {
  data: {
    users: [],
    pets: [],
    healthRecords: [],
    reminders: [],
    posts: [],
    comments: [],
    likes: [],
    diagnoses: []
  },
  
  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        this.data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
          } else {
        this.save();
          }
    } catch (e) {
      console.error('数据库加载失败:', e);
      this.save();
    }
  },
  
  save() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
  },
  
  // 生成 ID
  genId() {
    return crypto.randomUUID();
  },
  
  // 用户操作
  users: {
    findByUsername(username) {
      return DB.data.users.find(u => u.username === username);
    },
    findById(id) {
      return DB.data.users.find(u => u.id === id);
    },
    create(user) {
      const newUser = { id: DB.genId(), ...user, createdAt: new Date().toISOString() };
      DB.data.users.push(newUser);
      DB.save();
      return newUser;
    },
    update(id, updates) {
      const idx = DB.data.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        DB.data.users[idx] = { ...DB.data.users[idx], ...updates };
        DB.save();
        return DB.data.users[idx];
      }
      return null;
    }
  },
  
  // 宠物操作
  pets: {
    findByUser(userId) {
      return DB.data.pets.filter(p => p.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    findById(id, userId) {
      return DB.data.pets.find(p => p.id === id && p.userId === userId);
    },
    create(pet) {
      const newPet = { id: DB.genId(), ...pet, createdAt: new Date().toISOString() };
      DB.data.pets.push(newPet);
      DB.save();
      return newPet;
    },
    update(id, userId, updates) {
      const idx = DB.data.pets.findIndex(p => p.id === id && p.userId === userId);
      if (idx !== -1) {
        DB.data.pets[idx] = { ...DB.data.pets[idx], ...updates };
        DB.save();
        return DB.data.pets[idx];
      }
      return null;
    },
    delete(id, userId) {
      const len = DB.data.pets.length;
      DB.data.pets = DB.data.pets.filter(p => !(p.id === id && p.userId === userId));
      DB.save();
      return DB.data.pets.length < len;
    }
  },
  
  // 健康记录
  healthRecords: {
    findByPet(petId, userId, type) {
      let records = DB.data.healthRecords.filter(r => r.petId === petId && r.userId === userId);
      if (type) records = records.filter(r => (r.recordType || r.type) === type);
      return records.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
    },
    create(record) {
      const newRecord = { id: DB.genId(), ...record, createdAt: new Date().toISOString() };
      DB.data.healthRecords.push(newRecord);
      DB.save();
      return newRecord;
    },
    delete(id, userId) {
      const len = DB.data.healthRecords.length;
      DB.data.healthRecords = DB.data.healthRecords.filter(r => !(r.id === id && r.userId === userId));
      DB.save();
      return DB.data.healthRecords.length < len;
    }
  },
  
  // 提醒
  reminders: {
    findByUser(userId, includeDone = false) {
      let reminders = DB.data.reminders.filter(r => r.userId === userId);
      if (!includeDone) reminders = reminders.filter(r => !r.done);
      return reminders.sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
    },
    create(reminder) {
      const newReminder = { id: DB.genId(), ...reminder, done: false, createdAt: new Date().toISOString() };
      DB.data.reminders.push(newReminder);
      DB.save();
      return newReminder;
    },
    update(id, userId, updates) {
      const idx = DB.data.reminders.findIndex(r => r.id === id && r.userId === userId);
      if (idx !== -1) {
        DB.data.reminders[idx] = { ...DB.data.reminders[idx], ...updates };
        DB.save();
        return DB.data.reminders[idx];
      }
      return null;
    },
    complete(id, userId) {
      return this.update(id, userId, { done: true });
    },
    delete(id, userId) {
      const len = DB.data.reminders.length;
      DB.data.reminders = DB.data.reminders.filter(r => !(r.id === id && r.userId === userId));
      DB.save();
      return DB.data.reminders.length < len;
    }
  },
  
  // 帖子
  posts: {
    findByUser(userId, tab = 'hot') {
      let posts = [...DB.data.posts];
      if (tab === 'hot') {
        posts.sort((a, b) => b.likes - a.likes || new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return posts;
    },
    findById(id) {
      return DB.data.posts.find(p => p.id === id);
    },
    create(post) {
      const newPost = { 
        id: DB.genId(), 
        ...post, 
        likes: 0, 
        commentsCount: 0,
        createdAt: new Date().toISOString() 
      };
      DB.data.posts.push(newPost);
      DB.save();
      return newPost;
    },
    like(postId, userId) {
      const postIdx = DB.data.posts.findIndex(p => p.id === postId);
      if (postIdx === -1) return null;
      
      const existingLikeIdx = DB.data.likes.findIndex(l => l.postId === postId && l.userId === userId);
      let liked = false;
      
      if (existingLikeIdx !== -1) {
        DB.data.likes.splice(existingLikeIdx, 1);
        DB.data.posts[postIdx].likes--;
        liked = false;
      } else {
        DB.data.likes.push({ id: DB.genId(), postId, userId, createdAt: new Date().toISOString() });
        DB.data.posts[postIdx].likes++;
        liked = true;
      }
      
      DB.save();
      return { liked, likes: DB.data.posts[postIdx].likes };
    },
    isLiked(postId, userId) {
      return DB.data.likes.some(l => l.postId === postId && l.userId === userId);
    },
    delete(id, userId) {
      const len = DB.data.posts.length;
      DB.data.posts = DB.data.posts.filter(p => !(p.id === id && p.userId === userId));
      DB.save();
      return DB.data.posts.length < len;
    },
    getComments(postId) {
      return DB.data.comments.filter(c => String(c.postId) === String(postId)).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    addComment(comment) {
      const newComment = { id: DB.genId(), ...comment, createdAt: new Date().toISOString() };
      DB.data.comments.push(newComment);
      
      const postIdx = DB.data.posts.findIndex(p => p.id === comment.postId);
      if (postIdx !== -1) DB.data.posts[postIdx].commentsCount++;
      
      DB.save();
      return newComment;
    }
  },
  
  // 诊断
  diagnoses: {
    findByUser(userId, limit = 20) {
      return DB.data.diagnoses
        .filter(d => d.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
    },
    create(diagnosis) {
      const newDiagnosis = { id: DB.genId(), ...diagnosis, createdAt: new Date().toISOString() };
      DB.data.diagnoses.push(newDiagnosis);
      DB.save();
      return newDiagnosis;
    },
    delete(id, userId) {
      const len = DB.data.diagnoses.length;
      DB.data.diagnoses = DB.data.diagnoses.filter(d => !(d.id === id && d.userId === userId));
      DB.save();
      return DB.data.diagnoses.length < len;
    }
  }
};

// ============ 工具函数 ============

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || 'pet_assistant_secret_2024_prod';
const JWT_EXPIRES_IN = '30d';

// 密码哈希（bcrypt）
const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// 认证中间件（同步版本，用于路由参数解析）
function auth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

// 同步签发token辅助
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// CORS 白名单
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3001,http://localhost:3000').split(',');

function setCors(res, req) {
  const origin = req.headers.origin || '';
  const allowed = CORS_ORIGINS.includes('*') || CORS_ORIGINS.includes(origin);
  res.setHeader('Access-Control-Allow-Origin', allowed ? origin : CORS_ORIGINS[0] || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// JSON 响应
function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ============ 路由处理 ============

const routes = {
  // 认证
  'POST /api/auth/register': async (req, res, userId, body, params, query) => {
    const { username, password, nickname } = body || {};
    if (!username || !password) {
      return json(res, { success: false, message: '用户名和密码不能为空' }, 400);
    }
    if (DB.users.findByUsername(username)) {
      return json(res, { success: false, message: '用户名已存在' }, 400);
    }
    const hashed = await hashPassword(password);
    const user = DB.users.create({
      username, 
      password: hashed, 
      nickname: nickname || username 
    });
    const token = signToken({ userId: user.id, username: user.username });
    json(res, { success: true, data: { token, user: { id: user.id, username: user.username, nickname: user.nickname } } });
  },
  
  'POST /api/auth/login': async (req, res, userId, body, params, query) => {
    const { username, password } = body || {};
    const user = DB.users.findByUsername(username);
    if (!user || !(await verifyPassword(password, user.password))) {
      return json(res, { success: false, message: '用户名或密码错误' }, 401);
    }
    const token = signToken({ userId: user.id, username: user.username });
    json(res, { success: true, data: { token, user: { id: user.id, username: user.username, nickname: user.nickname } } });
  },
  
  // 宠物
  'GET /api/pets': (req, res, userId, body, params, query) => {
    json(res, { success: true, data: DB.pets.findByUser(userId) });
  },
  
  'POST /api/pets': (req, res, userId, body, params, query) => {
    if (!body.name) return json(res, { success: false, message: '宠物名字不能为空' }, 400);
    const pet = DB.pets.create({ ...body, userId });
    json(res, { success: true, data: pet });
  },
  
  'PUT /api/pets/:id': (req, res, userId, body, params, query) => {
    const pet = DB.pets.update(params.id, userId, body);
    if (!pet) return json(res, { success: false, message: '宠物不存在' }, 404);
    json(res, { success: true, data: pet });
  },
  
  'DELETE /api/pets/:id': (req, res, userId, body, params, query) => {
    DB.pets.delete(params.id, userId);
    json(res, { success: true, message: '删除成功' });
  },
  
  // 健康记录
  'GET /api/pets/:id/records': (req, res, userId, body, params, query) => {
    const records = DB.healthRecords.findByPet(params.id, userId, query.type);
    json(res, { success: true, data: records });
  },
  
  'POST /api/pets/:id/records': (req, res, userId, body, params, query) => {
    if (!DB.pets.findById(body.petId || body.petId, userId)) {
      return json(res, { success: false, message: '宠物不存在' }, 404);
    }
    const record = DB.healthRecords.create({ ...body, userId });
    json(res, { success: true, data: record });
  },
  
  'DELETE /api/pets/:id/records/:recordId': (req, res, userId, body, params, query) => {
    DB.healthRecords.delete(params.recordId, userId);
    json(res, { success: true, message: '删除成功' });
  },
  
  // 提醒
  'GET /api/reminders': (req, res, userId, body, params, query) => {
    json(res, { success: true, data: DB.reminders.findByUser(userId, query.include_done === 'true') });
  },
  
  'POST /api/reminders': (req, res, userId, body, params, query) => {
    if (!body.petId || !body.title || !body.reminderDate) {
      return json(res, { success: false, message: '缺少必要参数' }, 400);
    }
    const reminder = DB.reminders.create({ ...body, userId });
    json(res, { success: true, data: reminder });
  },
  
  'PUT /api/reminders/:id': (req, res, userId, body, params, query) => {
    const reminder = DB.reminders.update(params.id, userId, body);
    if (!reminder) return json(res, { success: false, message: '提醒不存在' }, 404);
    json(res, { success: true, data: reminder });
  },
  
  'POST /api/reminders/:id/complete': (req, res, userId, body, params, query) => {
    DB.reminders.complete(params.id, userId);
    json(res, { success: true, message: '已标记完成' });
  },
  
  'DELETE /api/reminders/:id': (req, res, userId, body, params, query) => {
    DB.reminders.delete(params.id, userId);
    json(res, { success: true, message: '删除成功' });
  },
  
  // 帖子
  'GET /api/posts': (req, res, userId, body, params, query) => {
    const posts = DB.posts.findByUser(userId, query.tab);
    const result = posts.map(p => ({ ...p, isLiked: DB.posts.isLiked(p.id, userId) }));
    json(res, { success: true, data: result });
  },
  
  'POST /api/posts': (req, res, userId, body, params, query) => {
    if (!body.content) return json(res, { success: false, message: '内容不能为空' }, 400);
    const post = DB.posts.create({ ...body, userId });
    json(res, { success: true, data: { ...post, isLiked: false } });
  },
  
  'POST /api/posts/:id/like': (req, res, userId, body, params, query) => {
    const result = DB.posts.like(params.id, userId);
    if (!result) return json(res, { success: false, message: '帖子不存在' }, 404);
    json(res, { success: true, ...result });
  },
  
  'GET /api/posts/:id/comments': (req, res, userId, body, params, query) => {
    const _params = params;
    const _postId = _params.id;
    const _postIdStr = String(_postId);
    const filtered = DB.data.comments.filter(c => {
      const cmp = String(c.postId) === _postIdStr;
        return cmp;
    });
    const result = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    json(res, { success: true, data: result });
  },
  
  'POST /api/posts/:id/comments': (req, res, userId, body, params, query) => {
    if (!body.content) return json(res, { success: false, message: '评论内容不能为空' }, 400);
    const comment = DB.posts.addComment({ ...body, postId: params.id, userId });
    json(res, { success: true, data: comment });
  },
  
  'DELETE /api/posts/:id': (req, res, userId, body, params, query) => {
    DB.posts.delete(params.id, userId);
    json(res, { success: true, message: '删除成功' });
  },
  
  // 诊断
  'GET /api/diagnosis': (req, res, userId, body, params, query) => {
    json(res, { success: true, data: DB.diagnoses.findByUser(userId) });
  },
  
  'POST /api/diagnosis': (req, res, userId, body, params, query) => {
    if (!body.type) return json(res, { success: false, message: '请选择诊断类型' }, 400);
    
    // 模拟 AI 诊断（后续可接入真实 AI）
    const result = mockDiagnose(body.type);
    const diagnosis = DB.diagnoses.create({ ...body, ...result, userId });
    json(res, { success: true, data: diagnosis });
  },
  
  'DELETE /api/diagnosis/:id': (req, res, userId, body, params, query) => {
    DB.diagnoses.delete(params.id, userId);
    json(res, { success: true, message: '删除成功' });
  },
  
  // 统计
  'GET /api/stats': (req, res, userId, body, params, query) => {
    const stats = {
      pets: DB.pets.findByUser(userId).length,
      reminders: DB.reminders.findByUser(userId).length,
      posts: DB.posts.findByUser(userId).length,
      diagnoses: DB.diagnoses.findByUser(userId).length
    };
    json(res, { success: true, data: stats });
  },
  
  // 健康检查
  'GET /api/health': (req, res, userId, body, params, query) => {
    json(res, { status: 'ok', timestamp: new Date().toISOString() });
  }
};

// 模拟 AI 诊断
const DIAGNOSIS_KB = {
  skin: { tags: ['皮肤红斑', '脱毛', '瘙痒'], causes: ['真菌感染', '过敏性皮炎', '湿疹'], severity: 'warning', severityLabel: '🟡 建议就医' },
  eye: { tags: ['眼部红肿', '分泌物'], causes: ['结膜炎', '角膜炎'], severity: 'warning', severityLabel: '🟡 建议就医' },
  stool: { tags: ['软便', '稀便'], causes: ['消化不良', '肠炎'], severity: 'normal', severityLabel: '🟢 居家观察' },
  behavior: { tags: ['精神差', '嗜睡'], causes: ['季节性倦怠', '轻微不适'], severity: 'normal', severityLabel: '🟢 居家观察' },
  mouth: { tags: ['口臭', '牙龈红肿'], causes: ['牙周病', '牙菌斑'], severity: 'normal', severityLabel: '🟢 居家观察' },
  ear: { tags: ['耳道红肿', '分泌物'], causes: ['耳螨感染', '细菌性耳炎'], severity: 'normal', severityLabel: '🟢 居家观察' }
};

function mockDiagnose(type) {
  const kb = DIAGNOSIS_KB[type] || DIAGNOSIS_KB.skin;
  return {
    severity: kb.severity,
    severityLabel: kb.severityLabel,
    tags: kb.tags,
    causes: kb.causes,
    suggestion: '建议持续观察，如有异常及时就医。',
    aiAdvice: kb.causes[0] + '可能导致以上症状，请密切关注。',
    disclaimer: '本结果由 AI 辅助分析，仅供参考，不能替代专业兽医诊断。'
  };
}

// ============ 服务器启动 ============
DB.load();

const server = http.createServer((req, res) => {
  setCors(res, req);
  
  if (req.method === 'OPTIONS') {
    return json(res, { success: true });
  }
  
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const query = parsed.query;
  const user = auth(req);
  
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    let parsedBody = {};
    try {
      if (body) parsedBody = JSON.parse(body);
    } catch {}
    
    // 匹配路由
    const key = `${req.method} ${pathname}`;
    
    // 提取路由参数
    let handler = null;
    let params = {};
    
    for (const [route, h] of Object.entries(routes)) {
      params = {};
      const [method, path] = route.split(' ');
      if (method !== req.method) continue;
      
      const pathParts = path.split('/');
      const reqParts = pathname.split('/');
      
      if (pathParts.length !== reqParts.length) {
            continue;
      }
      
      let match = true;
      params = {};
      
      for (let i = 1; i < pathParts.length; i++) {
        if (pathParts[i].startsWith(':')) {
          const k = pathParts[i].slice(1);
          const v = reqParts[i];
                params[k] = v;
        } else if (pathParts[i] !== reqParts[i]) {
                match = false;
          break;
        }
      }
      
      if (match) {
            handler = h;
        break;
      }
    }
    
    if (handler) {
      // 路由参数固定传5个：userId, body, params, query
      const _userId = user?.userId;
      const _body = parsedBody;
      const _params = params;
      const _query = query;
      
      const callHandler = (h) => {
        // 尝试多种签名
        if (h.length >= 5) {
          return h(req, res, _userId, _body, _params, _query);
        } else if (h.length === 4) {
          return h(req, res, _userId, _body, _params);
        } else if (h.length === 3) {
          return h(req, res, _userId, _body);
        } else {
          return h(req, res);
        }
      };
      
      try {
        const result = callHandler(handler);
        if (result && typeof result.then === 'function') {
          result.catch(e => { console.error('路由处理错误:', e); json(res, { success: false, message: '服务器错误' }, 500); });
        }
      } catch (e) { console.error('路由处理错误:', e); json(res, { success: false, message: '服务器错误' }, 500); }
    } else {
      json(res, { success: false, message: '接口不存在' }, 404);
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🐾 毛孩子健康助手 API 服务器           ║
╠════════════════════════════════════════════╣
║   端口: ${PORT}
║   状态: 运行中 ✅
║   文档: http://localhost:${PORT}/api/health
╚════════════════════════════════════════════╝
  `);
});
