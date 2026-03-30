/**
 * Store - 数据状态管理
 * 简单的发布-订阅模式状态管理
 */

const Store = {
  // 状态
  state: {
    currentTab: 'home',
    pets: [],
    reminders: [],
    posts: [],
    diagnosisHistory: [],
    comments: [],  // 评论区
    loading: false,
    user: null,
    settings: {
      notifications: true,
      theme: 'light'
    }
  },
  
  // 订阅者
  subscribers: [],
  
  // 初始化
  init() {
    // 从 localStorage 加载数据
    this.state.pets = this.load('pets') || [];
    this.state.reminders = this.load('reminders') || [];
    this.state.posts = this.load('posts') || [];
    this.state.diagnosisHistory = this.load('diagnosisHistory') || [];
    this.state.comments = this.load('comments') || [];
    this.state.settings = this.load('settings') || this.state.settings;
    
    // 如果没有数据，初始化示例数据
    if (this.state.pets.length === 0) {
      this.initSampleData();
    }
    
    console.log('Store initialized', this.state);
  },
  
  // 初始化示例数据
  initSampleData() {
    this.state.pets = [
      {
        id: 'pet_001',
        name: '奶茶',
        type: 'cat',
        avatar: '',
        breed: '中华田园猫',
        birthday: '2022-03-15',
        gender: 'female',
        weight: 4.5,
        color: '橘色',
        sterilization: true,
        vaccineRecords: [
          { id: 'v1', type: '猫三联', date: '2026-03-15', nextDate: '2027-03-15', done: true, hospital: '宠物医院', medicine: '妙三多' }
        ],
        dewormingRecords: [
          { id: 'd1', type: '体内驱虫', date: '2026-01-01', nextDate: '2026-07-01', done: true, medicine: '拜耳内虫逃' }
        ]
      },
      {
        id: 'pet_002',
        name: '豆豆',
        type: 'dog',
        avatar: '',
        breed: '柴犬',
        birthday: '2021-06-20',
        gender: 'male',
        weight: 12.3,
        color: '黄白色',
        sterilization: false,
        vaccineRecords: [],
        dewormingRecords: []
      }
    ];
    
    this.state.reminders = [
      { id: 'r1', petId: 'pet_001', petName: '奶茶', type: 'vaccine', title: '猫三联疫苗（加强针）', date: '2027-03-15', done: false, icon: '💉', color: '#52C41A', reminderTypeName: '疫苗' },
      { id: 'r2', petId: 'pet_001', petName: '奶茶', type: 'deworm', title: '体内驱虫', date: '2026-07-01', done: false, icon: '💊', color: '#722ED1', reminderTypeName: '驱虫' },
      { id: 'r3', petId: 'pet_002', petName: '豆豆', type: 'vaccine', title: '狂犬疫苗', date: '2026-04-10', done: false, icon: '💉', color: '#52C41A', reminderTypeName: '疫苗' },
      { id: 'r4', petId: 'pet_002', petName: '豆豆', type: 'bath', title: '洗澡美容', date: '2026-04-05', done: false, icon: '🛁', color: '#13C2C2', reminderTypeName: '洗澡' }
    ];
    
    this.state.posts = [
      {
        id: 'post_001',
        author: { name: '橘子de铲屎官', petName: '橘子', petType: 'cat' },
        content: '今天带橘子去打了疫苗，回来就趴着不动了，心疼😢 有什么办法能让主子舒服一点吗？',
        images: [],
        likes: 234,
        comments: 12,
        isLiked: false,
        topic: '#养宠日常#',
        time: '2小时前',
        aiReply: '喵~疫苗后精神差是正常反应，铲屎官可以给主子准备安静的窝，多喂水，别打扰它休息喵~ ❤️'
      },
      {
        id: 'post_002',
        author: { name: '奶茶妈', petName: '奶茶', petType: 'cat' },
        content: '奶茶最近学会了开门...我应该高兴还是害怕？每次出门都要担心它跑出去#猫咪迷惑行为#',
        images: [],
        likes: 567,
        comments: 45,
        isLiked: true,
        topic: '#猫咪迷惑行为#',
        time: '4小时前',
        aiReply: '汪！喵喵喵~本汪也好奇门外有什么！铲屎官快装个儿童锁吧汪~ 🐾'
      },
      {
        id: 'post_003',
        author: { name: '大黄爸', petName: '大黄', petType: 'dog' },
        content: '分享一下我家狗皮肤病治疗经验：维克药浴 + 口服药，两周基本痊愈。关键是坚持，不要断药！',
        images: [],
        likes: 189,
        comments: 23,
        isLiked: false,
        topic: '#宠物健康#',
        time: '6小时前',
        aiReply: '汪汪！感谢分享！本狗子记住了这个经验汪~ 🐶'
      },
      {
        id: 'post_004',
        author: { name: '铲屎官阿华', petName: '年糕', petType: 'cat' },
        content: '年糕终于驱虫完成了！这次乖乖吃药没有吐出来，进步超大🎉 #猫咪成长记录#',
        images: [],
        likes: 345,
        comments: 34,
        isLiked: false,
        topic: '#猫咪成长记录#',
        time: '昨天',
        aiReply: '喵~年糕真棒！本喵小时候驱虫也很乖的~继续保持喵~ ✨'
      }
    ];
    
    this.state.comments = [
      { id: 'c1', postId: 'post_001', author: '豆豆妈', petName: '豆豆', petType: 'dog', content: '我家狗子打完疫苗也这样，别担心2-3天就好了', time: '1小时前' },
      { id: 'c2', postId: 'post_001', author: '年糕妈', petName: '年糕', petType: 'cat', content: '可以喂点益生菌，我家猫咪用的效果不错', time: '30分钟前' }
    ];
    
    this.state.diagnosisHistory = [];
    
    // 保存到 localStorage
    this.save('pets', this.state.pets);
    this.save('reminders', this.state.reminders);
    this.save('posts', this.state.posts);
    this.save('comments', this.state.comments);
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
  
  // 本地存储操作
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
  
  // ========== 宠物操作 ==========
  addPet(pet) {
    const newPet = { 
      ...pet, 
      id: `pet_${Date.now()}`,
      vaccineRecords: pet.vaccineRecords || [],
      dewormingRecords: pet.dewormingRecords || []
    };
    this.state.pets.push(newPet);
    this.save('pets', this.state.pets);
    this.notify();
    return newPet;
  },
  
  updatePet(id, updates) {
    const idx = this.state.pets.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.state.pets[idx] = { ...this.state.pets[idx], ...updates };
      this.save('pets', this.state.pets);
      this.notify();
    }
  },
  
  deletePet(id) {
    this.state.pets = this.state.pets.filter(p => p.id !== id);
    this.save('pets', this.state.pets);
    this.notify();
  },
  
  addHealthRecord(petId, recordType, record) {
    const pet = this.state.pets.find(p => p.id === petId);
    if (pet) {
      const newRecord = { ...record, id: `record_${Date.now()}` };
      if (!pet[recordType]) pet[recordType] = [];
      pet[recordType].push(newRecord);
      this.save('pets', this.state.pets);
      this.notify();
      return newRecord;
    }
    return null;
  },
  
  deleteHealthRecord(petId, recordType, recordId) {
    const pet = this.state.pets.find(p => p.id === petId);
    if (pet && pet[recordType]) {
      pet[recordType] = pet[recordType].filter(r => r.id !== recordId);
      this.save('pets', this.state.pets);
      this.notify();
    }
  },
  
  // ========== 提醒操作 ==========
  addReminder(reminder) {
    const newReminder = { ...reminder, id: `r_${Date.now()}`, done: false };
    this.state.reminders.push(newReminder);
    this.save('reminders', this.state.reminders);
    this.notify();
    return newReminder;
  },
  
  completeReminder(id) {
    const reminder = this.state.reminders.find(r => r.id === id);
    if (reminder) {
      reminder.done = true;
      this.save('reminders', this.state.reminders);
      this.notify();
    }
  },
  
  deleteReminder(id) {
    this.state.reminders = this.state.reminders.filter(r => r.id !== id);
    this.save('reminders', this.state.reminders);
    this.notify();
  },
  
  // ========== 社区操作 ==========
  addPost(post) {
    const newPost = { 
      ...post, 
      id: `post_${Date.now()}`,
      likes: 0,
      comments: 0,
      isLiked: false,
      time: '刚刚',
      aiReply: this.generateAIPetReply(post.author.petType, post.author.petName)
    };
    this.state.posts.unshift(newPost);
    this.save('posts', this.state.posts);
    this.notify();
    return newPost;
  },
  
  toggleLike(postId) {
    const post = this.state.posts.find(p => p.id === postId);
    if (post) {
      post.isLiked = !post.isLiked;
      post.likes += post.isLiked ? 1 : -1;
      this.save('posts', this.state.posts);
      this.notify();
    }
  },
  
  addComment(postId, content, petName, petType) {
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
    
    // 更新帖子评论数
    const post = this.state.posts.find(p => p.id === postId);
    if (post) post.comments++;
    
    this.save('comments', this.state.comments);
    this.save('posts', this.state.posts);
    this.notify();
    return newComment;
  },
  
  getPostComments(postId) {
    return this.state.comments.filter(c => c.postId === postId);
  },
  
  // ========== 诊断操作 ==========
  saveDiagnosis(diagnosis) {
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
  
  deleteDiagnosis(id) {
    this.state.diagnosisHistory = this.state.diagnosisHistory.filter(d => d.id !== id);
    this.save('diagnosisHistory', this.state.diagnosisHistory);
    this.notify();
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
  
  // 获取宠物年龄
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
  
  // 格式化日期
  formatDate(dateStr) {
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

// 初始化 store
Store.init();
