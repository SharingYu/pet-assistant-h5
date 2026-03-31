/**
 * http.js - 统一请求层
 * 包含：TokenManager + HTTP拦截器 + 所有API端点封装
 */

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
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  isLoggedIn() {
    return !!this.getToken() && !this.isExpired();
  }
};

// ========== HTTP 客户端 ==========

async function request(method, path, body = null) {
  const token = TokenManager.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const options = { method, headers };
  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`http://localhost:3000${path}`, options);
    const data = await res.json();

    if (res.status === 401) {
      TokenManager.clear();
      window.dispatchEvent(new CustomEvent('auth:expired'));
      return { success: false, message: '登录已过期，请重新登录' };
    }

    return data;
  } catch (err) {
    return { success: false, message: '网络异常，请检查网络连接' };
  }
}

// ========== API 封装 ==========

const API_BASE = {
  // 认证
  async login(username, password) {
    return request('POST', '/api/auth/login', { username, password });
  },

  async register(username, password, nickname) {
    return request('POST', '/api/auth/register', { username, password, nickname });
  },

  // 宠物
  async getPets() {
    return request('GET', '/api/pets');
  },

  async createPet(petData) {
    return request('POST', '/api/pets', petData);
  },

  async updatePet(id, updates) {
    return request('PUT', `/api/pets/${id}`, updates);
  },

  async deletePet(id) {
    return request('DELETE', `/api/pets/${id}`);
  },

  async getHealthRecords(petId, type) {
    return request('GET', `/api/pets/${petId}/records?type=${type || ''}`);
  },

  async createHealthRecord(petId, recordData) {
    return request('POST', `/api/pets/${petId}/records`, recordData);
  },

  async deleteHealthRecord(petId, recordId) {
    return request('DELETE', `/api/pets/${petId}/records/${recordId}`);
  },

  // 提醒
  async getReminders(includeDone = false) {
    return request('GET', `/api/reminders?includeDone=${includeDone}`);
  },

  async createReminder(reminderData) {
    return request('POST', '/api/reminders', reminderData);
  },

  async updateReminder(id, updates) {
    return request('PUT', `/api/reminders/${id}`, updates);
  },

  async completeReminder(id) {
    return request('POST', `/api/reminders/${id}/complete`);
  },

  async deleteReminder(id) {
    return request('DELETE', `/api/reminders/${id}`);
  },

  // 社区
  async getPosts(tab = 'hot') {
    return request('GET', `/api/posts?tab=${tab}`);
  },

  async createPost(postData) {
    return request('POST', '/api/posts', postData);
  },

  async likePost(postId) {
    return request('POST', `/api/posts/${postId}/like`);
  },

  async getComments(postId) {
    return request('GET', `/api/posts/${postId}/comments`);
  },

  async addComment(postId, content) {
    return request('POST', `/api/posts/${postId}/comments`, { content });
  },

  async deletePost(postId) {
    return request('DELETE', `/api/posts/${postId}`);
  },

  // AI 诊断（暂时走mock，后续替换为真实AI）
  async diagnose(type, imageData) {
    return request('POST', '/api/diagnosis', { type, image: imageData });
  },

  async getDiagnosis() {
    return request('GET', '/api/diagnosis');
  },

  async deleteDiagnosis(id) {
    return request('DELETE', `/api/diagnosis/${id}`);
  },

  // 统计数据
  async getStats() {
    return request('GET', '/api/stats');
  }
};
