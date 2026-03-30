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
    loading: false,
    user: null
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
      }
    ];
    
    this.state.reminders = [
      {
        id: 'r1',
        petId: 'pet_001',
        petName: '奶茶',
        type: 'vaccine',
        title: '猫三联疫苗（加强针）',
        date: '2027-03-15',
        done: false,
        icon: '💉',
        color: '#52C41A',
        reminderTypeName: '疫苗'
      },
      {
        id: 'r2',
        petId: 'pet_001',
        petName: '奶茶',
        type: 'deworm',
        title: '体内驱虫',
        date: '2026-07-01',
        done: false,
        icon: '💊',
        color: '#722ED1',
        reminderTypeName: '驱虫'
      }
    ];
    
    this.state.posts = [
      {
        id: 'post_001',
        author: { name: '橘子de铲屎官', petName: '橘子', petType: 'cat' },
        content: '今天带橘子去打了疫苗，回来就趴着不动了，心疼😢 有什么办法能让主子舒服一点吗？',
        images: [],
        likes: 234,
        comments: 45,
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
        comments: 89,
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
        comments: 56,
        isLiked: false,
        topic: '#宠物健康#',
        time: '6小时前',
        aiReply: '汪汪！感谢分享！本狗子记住了这个经验汪~ 🐶'
      }
    ];
    
    // 保存到 localStorage
    this.save('pets', this.state.pets);
    this.save('reminders', this.state.reminders);
    this.save('posts', this.state.posts);
  },
  
  // 订阅状态变化
  subscribe(callback) {
    this.subscribers.push(callback);
    // 返回取消订阅函数
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
      // 批量更新
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
  
  // 数据操作方法
  addPet(pet) {
    const newPet = { ...pet, id: `pet_${Date.now()}` };
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
  
  saveDiagnosis(diagnosis) {
    const newDiagnosis = { 
      ...diagnosis, 
      id: `diag_${Date.now()}`,
      date: new Date().toLocaleDateString('zh-CN')
    };
    this.state.diagnosisHistory.unshift(newDiagnosis);
    this.save('diagnosisHistory', this.state.diagnosisHistory);
    this.notify();
    return newDiagnosis;
  },
  
  // 生成 AI 宠物回复
  generateAIPetReply(petType, petName) {
    const replies = {
      cat: ['喵~感谢分享喵~ 🐱', '喵呜，这个好有用！', '本喵记住了~谢谢~'],
      dog: ['汪汪！太棒了汪！🐕', '谢谢分享！汪~', '本狗子觉得这个很棒！'],
      default: ['路过~觉得这个很棒！🌟', '感谢分享！', '收藏了~']
    };
    const pool = replies[petType] || replies.default;
    return pool[Math.floor(Math.random() * pool.length)];
  },
  
  // 获取未完成提醒数
  getPendingRemindersCount() {
    return this.state.reminders.filter(r => !r.done).length;
  }
};

// 初始化 store
Store.init();
