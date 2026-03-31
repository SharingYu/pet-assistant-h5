/**
 * Store - 数据状态管理
 * API 驱动的状态管理，登录态由 app.js 控制
 */

const Store = {
  // 状态
  state: {
    currentTab: 'home',
    pets: [],
    reminders: [],
    posts: [],
    diagnosisHistory: [],
    comments: [],
    loading: false,
    user: null,
    settings: {
      notifications: true,
      theme: 'light'
    }
  },

  // 订阅者
  subscribers: [],

  // 初始化（登录态由 app.js 控制，不再自动加载 localStorage 数据）
  init() {
    this.state.pets = [];
    this.state.reminders = [];
    this.state.posts = [];
    this.state.diagnosisHistory = [];
    this.state.comments = [];
    this.state.settings = this.load('settings') || this.state.settings;
    this.state.user = TokenManager.getUser(); // 可能为 null
    console.log('Store initialized', this.state);
  },

  // 从 API 加载数据（登录后调用）
  async loadFromAPI() {
    if (!TokenManager.isLoggedIn()) return;
    try {
      const [petsRes, remindersRes, postsRes] = await Promise.all([
        API_BASE.getPets(),
        API_BASE.getReminders(),
        API_BASE.getPosts()
      ]);
      if (petsRes.success) {
        // 并行加载每只宠物的健康记录
        const petsWithRecords = await Promise.all(
          (petsRes.data || []).map(async pet => {
            const [vaccineRes, dewormRes] = await Promise.all([
              API_BASE.getHealthRecords(pet.id, 'vaccine'),
              API_BASE.getHealthRecords(pet.id, 'deworm')
            ]);
            return {
              ...pet,
              vaccineRecords: vaccineRes.success ? (vaccineRes.data || []) : [],
              dewormingRecords: dewormRes.success ? (dewormRes.data || []) : []
            };
          })
        );
        this.state.pets = petsWithRecords;
      }
      if (remindersRes.success) {
        // 适配后端 reminderDate → date
        this.state.reminders = (remindersRes.data || []).map(r => ({
          ...r,
          date: r.reminderDate || r.date
        }));
      }
      if (postsRes.success) {
        this.state.posts = postsRes.data || [];
      }
      this.notify();
    } catch (e) {
      console.error('loadFromAPI failed:', e);
    }
  },

  // 订阅状态变化
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  },

  // 发布状态变化
  notify() {
    this.subscribers.forEach(cb => cb(this.state));
  },

  // 设置状态
  setState(key, value) {
    if (typeof key === 'object') {
      Object.assign(this.state, key);
    } else {
      this.state[key] = value;
    }
    this.notify();
  },

  // 获取状态
  getState(key) {
    return key ? this.state[key] : this.state;
  },

  // 本地存储操作（仅用于 settings）
  load(key) {
    try {
      const data = localStorage.getItem(`pet_h5_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Failed to load ${key}:`, e);
      return null;
    }
  },

  save(key, value) {
    try {
      localStorage.setItem(`pet_h5_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save ${key}:`, e);
    }
  },

  // ========== 用户操作 ==========
  setUser(user) {
    this.state.user = user;
    if (user) TokenManager.setUser(user);
    this.notify();
  },

  logout() {
    TokenManager.clear();
    this.state.user = null;
    this.state.pets = [];
    this.state.reminders = [];
    this.state.posts = [];
    this.state.diagnosisHistory = [];
    this.state.comments = [];
    this.notify();
  },

  // ========== 宠物操作 ==========
  async addPet(pet) {
    try {
      const res = await API_BASE.createPet(pet);
      if (res.success) {
        this.state.pets.push(res.data);
        this.notify();
        return res.data;
      }
    } catch (e) {
      console.error('addPet failed:', e);
    }
    return null;
  },

  async updatePet(id, updates) {
    try {
      await API_BASE.updatePet(id, updates);
      const idx = this.state.pets.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.state.pets[idx] = { ...this.state.pets[idx], ...updates };
        this.notify();
      }
    } catch (e) {
      console.error('updatePet failed:', e);
    }
  },

  async deletePet(id) {
    try {
      await API_BASE.deletePet(id);
      this.state.pets = this.state.pets.filter(p => p.id !== id);
      this.notify();
    } catch (e) {
      console.error('deletePet failed:', e);
    }
  },

  async addHealthRecord(petId, recordType, record) {
    // recordType: 'vaccineRecords' or 'dewormingRecords'
    // 转换为后端用的 category: 'vaccine' or 'deworm'
    const category = recordType.replace('Records', '');
    try {
      const res = await API_BASE.createHealthRecord(petId, { ...record, recordType: category });
      if (res.success) {
        const pet = this.state.pets.find(p => p.id === petId);
        if (pet) {
          if (!pet[recordType]) pet[recordType] = [];
          pet[recordType].push(res.data);
          this.notify();
        }
        return res.data;
      }
    } catch (e) {
      console.error('addHealthRecord failed:', e);
    }
    return null;
  },

  async deleteHealthRecord(petId, recordType, recordId) {
    try {
      await API_BASE.deleteHealthRecord(petId, recordId);
      const pet = this.state.pets.find(p => p.id === petId);
      if (pet && pet[recordType]) {
        pet[recordType] = pet[recordType].filter(r => r.id !== recordId);
        this.notify();
      }
    } catch (e) {
      console.error('deleteHealthRecord failed:', e);
    }
  },

  // ========== 提醒操作 ==========
  async addReminder(reminder) {
    try {
      const res = await API_BASE.createReminder(reminder);
      if (res.success) {
        // 适配后端返回的 reminderDate → date
        const newReminder = {
          ...res.data,
          date: res.data.reminderDate || res.data.date
        };
        this.state.reminders.push(newReminder);
        this.notify();
        return newReminder;
      }
    } catch (e) {
      console.error('addReminder failed:', e);
    }
    return null;
  },

  async completeReminder(id) {
    try {
      await API_BASE.completeReminder(id);
      const reminder = this.state.reminders.find(r => r.id === id);
      if (reminder) {
        reminder.done = true;
        this.notify();
      }
    } catch (e) {
      console.error('completeReminder failed:', e);
    }
  },

  async deleteReminder(id) {
    try {
      await API_BASE.deleteReminder(id);
      this.state.reminders = this.state.reminders.filter(r => r.id !== id);
      this.notify();
    } catch (e) {
      console.error('deleteReminder failed:', e);
    }
  },

  // ========== 社区操作 ==========
  async addPost(post) {
    try {
      const res = await API_BASE.createPost(post);
      if (res.success) {
        this.state.posts.unshift(res.data);
        this.notify();
        return res.data;
      }
    } catch (e) {
      console.error('addPost failed:', e);
    }
    return null;
  },

  async toggleLike(postId) {
    try {
      await API_BASE.likePost(postId);
      const post = this.state.posts.find(p => p.id === postId);
      if (post) {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
        this.notify();
      }
    } catch (e) {
      console.error('toggleLike failed:', e);
    }
  },

  async addComment(postId, content, petName, petType) {
    try {
      await API_BASE.addComment(postId, content);
      const newComment = {
        id: `c_${Date.now()}`,
        postId,
        author: `${petName}家长`,
        petName,
        petType,
        content,
        time: '刚刚'
      };
      this.state.comments.push(newComment);
      const post = this.state.posts.find(p => p.id === postId);
      if (post) post.comments++;
      this.notify();
      return newComment;
    } catch (e) {
      console.error('addComment failed:', e);
    }
    return null;
  },

  getPostComments(postId) {
    return this.state.comments.filter(c => c.postId === postId);
  },

  // ========== 诊断操作 ==========
  saveDiagnosis(diagnosis) {
    // 本地存储诊断记录
    const newDiagnosis = {
      ...diagnosis,
      id: `diag_${Date.now()}`,
      date: new Date().toLocaleDateString('zh-CN'),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    this.state.diagnosisHistory.unshift(newDiagnosis);
    this.save('diagnosisHistory', this.state.diagnosisHistory);
    this.notify();
    return newDiagnosis;
  },

  async deleteDiagnosis(id) {
    try {
      await API_BASE.deleteDiagnosis(id);
      this.state.diagnosisHistory = this.state.diagnosisHistory.filter(d => d.id !== id);
      this.save('diagnosisHistory', this.state.diagnosisHistory);
      this.notify();
    } catch (e) {
      console.error('deleteDiagnosis failed:', e);
    }
  },

  // ========== 设置操作 ==========
  updateSettings(updates) {
    this.state.settings = { ...this.state.settings, ...updates };
    this.save('settings', this.state.settings);
    this.notify();
  },

  // ========== 工具方法 ==========
  generateAIPetReply(petType, petName) {
    const replies = {
      cat: [
        '喵~感谢分享喵~ 🐱',
        '喵呜，这个好有用！',
        '本喵记住了~谢谢~',
        '喵~今天的阳光真舒服呢~ ☀️',
        '铲屎官你好呀喵~ 🐾'
      ],
      dog: [
        '汪汪！太棒了汪！🐕',
        '谢谢分享！汪~',
        '本狗子觉得这个很棒！',
        '汪！今天心情好好汪~ 🦴',
        '主人好！本汪来啦~ 🐶'
      ],
      rabbit: [
        '咕咕~这个好有趣~ 🐰',
        '兔兔觉得很不错呢~',
        '谢谢分享咕~ 🌿'
      ],
      default: [
        '路过~觉得这个很棒！🌟',
        '感谢分享！',
        '收藏了~ 🐾'
      ]
    };
    const pool = replies[petType] || replies.default;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  getPendingRemindersCount() {
    return this.state.reminders.filter(r => !r.done).length;
  },

  getPetAge(birthday) {
    if (!birthday) return '未知';
    const birth = new Date(birthday);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years > 0) {
      return `${years}岁${months > 0 ? months + '月' : ''}`;
    } else {
      const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + months;
      return `${Math.max(1, totalMonths)}月`;
    }
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    return date.toLocaleDateString('zh-CN');
  }
};
