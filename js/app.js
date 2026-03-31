/**
 * App - 主应用入口
 */

const App = {
  currentTab: 'home',
  currentPetId: null,
  
  init() {
    // 注册 Token 过期监听
    window.addEventListener('auth:expired', () => {
      Toast.error('登录已过期，请重新登录');
      this.logout();
    });
    
    TabBar.init();
    Store.subscribe(() => this.onStateChange());
    this.bindNavigation();
    
    // 根据登录态决定首页
    if (TokenManager.isLoggedIn()) {
      Store.setUser(TokenManager.getUser());
      App.showLoading('加载宠物数据...');
      Store.loadFromAPI().then(() => {
        App.hideLoading();
        this.navigateTo('home');
        TabBar.updateBadge();
      }).catch(() => {
        App.hideLoading();
        Toast.error('加载失败，请刷新重试');
      });
    } else {
      this.navigateTo('auth');
      TabBar.hide();
    }
    
    console.log('App initialized');
  },
  
  navigateTo(tab, data = null) {
    // 未登录状态只能访问 auth 页
    if (tab !== 'auth' && !TokenManager.isLoggedIn()) {
      this.navigateTo('auth');
      return;
    }
    
    this.currentTab = tab;
    if (tab !== 'auth') TabBar.setActive(tab);
    
    const container = document.getElementById('pagesContainer');
    
    switch (tab) {
      case 'auth':
        container.innerHTML = Pages.renderAuth();
        break;
      case 'home':
        container.innerHTML = Pages.renderHome();
        this.bindHomeEvents();
        break;
      case 'diagnosis':
        container.innerHTML = Pages.renderDiagnosis();
        this.bindDiagnosisEvents();
        break;
      case 'community':
        container.innerHTML = Pages.renderCommunity();
        this.bindCommunityEvents();
        break;
      case 'reminders':
        container.innerHTML = Pages.renderReminders();
        this.bindReminderEvents();
        break;
      case 'pet-profile':
        this.currentPetId = data;
        container.innerHTML = Pages.renderPetProfile(data);
        this.bindPetProfileEvents();
        break;
    }
  },
  
  onStateChange() {
    if (this.currentTab === 'home') this.navigateTo('home');
    else if (this.currentTab === 'reminders') this.navigateTo('reminders');
    else if (this.currentTab === 'community') this.navigateTo('community');
    TabBar.updateBadge();
  },
  
  bindNavigation() {},
  
  bindHomeEvents() {
    document.querySelectorAll('.pet-card[data-pet-id]').forEach(card => {
      card.addEventListener('click', () => {
        this.navigateTo('pet-profile', card.dataset.petId);
      });
    });
  },
  
  bindDiagnosisEvents() {
    const uploadZone = document.getElementById('uploadZone');
    const imageInput = document.getElementById('imageInput');
    
    if (uploadZone && imageInput) {
      uploadZone.addEventListener('click', () => imageInput.click());
      imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }
  },
  
  bindCommunityEvents() {
    document.querySelectorAll('[data-action="like"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.post-card');
        Store.toggleLike(card.dataset.id);
      });
    });
    
    document.querySelectorAll('[data-action="comment"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.post-card');
        this.showCommentModal(card.dataset.id);
      });
    });
  },
  
  bindReminderEvents() {
    document.querySelectorAll('.reminder-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = btn.closest('.reminder-item');
        const id = item.dataset.id;
        const action = btn.dataset.action;
        
        if (action === 'done') {
          Store.completeReminder(id);
          Toast.success('已完成 ✓');
        } else if (action === 'delete') {
          Store.deleteReminder(id);
          Toast.success('已删除');
        }
      });
    });
  },
  
  bindPetProfileEvents() {},
  
  // ========== 宠物 ==========
  showAddPetModal() {
    Modal.show(renderAddPetForm());
    this.bindPetForm();
  },
  
  showEditPetModal(petId) {
    const pet = Store.getState('pets').find(p => p.id === petId);
    if (pet) {
      Modal.show(renderAddPetForm(pet));
      this.bindPetForm(petId);
    }
  },
  
  bindPetForm(existingId = null) {
    const form = document.getElementById('petForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const petData = {
        name: formData.get('name'),
        type: formData.get('type'),
        breed: formData.get('breed'),
        birthday: formData.get('birthday'),
        gender: formData.get('gender'),
        weight: parseFloat(formData.get('weight')) || 0,
        sterilization: form.querySelector('[name="sterilization"]').checked
      };
      
      if (!petData.name) {
        Toast.error('请输入宠物名字');
        return;
      }
      
      if (existingId) {
        Store.updatePet(existingId, petData);
        Toast.success('保存成功');
        Modal.hide();
        this.navigateTo('pet-profile', existingId);
      } else {
        const newPet = Store.addPet(petData);
        Toast.success('添加成功');
        Modal.hide();
        this.navigateTo('home');
      }
    });
  },
  
  deletePet(petId) {
    if (confirm('确定要删除这个宠物吗？')) {
      Store.deletePet(petId);
      Modal.hide();
      Toast.success('已删除');
      this.navigateTo('home');
    }
  },
  
  // ========== 健康记录 ==========
  showAddHealthRecordModal(petId, recordType) {
    const formType = recordType === 'vaccineRecords' ? 'vaccine' : 'deworm';
    Modal.show(renderAddHealthRecordForm(petId, formType));
    
    const form = document.getElementById('recordForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const record = {
        type: formData.get('type'),
        date: formData.get('date'),
        nextDate: formData.get('nextDate') || '',
        hospital: formData.get('hospital') || '',
        medicine: formData.get('medicine') || '',
        done: form.querySelector('[name="done"]').checked
      };
      
      Store.addHealthRecord(petId, recordType, record);
      Toast.success('记录已添加');
      Modal.hide();
      this.navigateTo('pet-profile', petId);
    });
  },
  
  // ========== 提醒 ==========
  showAddReminderModal() {
    const pets = Store.getState('pets');
    
    if (pets.length === 0) {
      Toast.info('请先添加宠物');
      this.showAddPetModal();
      return;
    }
    
    const petOptions = pets.map((p, i) => `<option value="${p.id}" ${i === 0 ? 'selected' : ''}>${p.name}</option>`).join('');
    const typeOptions = API.reminderTypes.map(t => 
      `<div class="type-card" data-type="${t.id}" style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">${t.icon}</span>
        <span class="type-name">${t.name}</span>
      </div>`
    ).join('');
    
    Modal.show(`
      <div class="modal-header">
        <h3 class="modal-title">添加健康提醒</h3>
        <div class="modal-close" onclick="Modal.hide()">×</div>
      </div>
      <div class="modal-body">
        <form id="reminderForm">
          <div class="form-group">
            <label class="form-label">选择宠物</label>
            <select class="form-input" name="petId" style="background: #f5f5f5; border: 2px solid #e0e0e0;">
              ${petOptions}
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">提醒类型</label>
            <div id="typeGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 0;">
              ${typeOptions}
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">提醒事项</label>
            <input type="text" class="form-input" name="title" placeholder="如：猫三联疫苗（第三针）" required style="background: #f5f5f5; border: 2px solid #e0e0e0;">
          </div>
          
          <div class="form-group">
            <label class="form-label">提醒日期</label>
            <input type="date" class="form-input" name="date" required style="background: #f5f5f5; border: 2px solid #e0e0e0;">
          </div>
          
          <button type="submit" class="btn btn-primary btn-full" style="margin-top: 16px;">保存提醒</button>
        </form>
      </div>
    `);
    
    // 绑定类型选择
    document.querySelectorAll('#typeGrid .type-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('#typeGrid .type-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
    document.querySelector('#typeGrid .type-card').classList.add('selected');
    
    const form = document.getElementById('reminderForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const selectedType = document.querySelector('#typeGrid .type-card.selected');
      const pet = pets.find(p => p.id === formData.get('petId'));
      const type = API.reminderTypes.find(t => t.id === selectedType?.dataset.type) || API.reminderTypes[0];
      
      const reminder = {
        petId: formData.get('petId'),
        petName: pet?.name || '',
        type: selectedType?.dataset.type || 'other',
        title: formData.get('title'),
        reminderDate: formData.get('date'),
        icon: type.icon,
        color: type.color,
        reminderTypeName: type.name
      };
      
      Store.addReminder(reminder);
      Toast.success('提醒已添加');
      Modal.hide();
    });
  },
  
  // ========== 社区 ==========
  showNewPostModal() {
    const pets = Store.getState('pets');
    
    if (pets.length === 0) {
      Toast.info('请先添加宠物');
      this.showAddPetModal();
      return;
    }
    
    const petOptions = pets.map((p, i) => `<option value="${p.id}">${p.name}</option>`).join('');
    const topicOptions = API.topics.map(t => `<option value="${t.name}">${t.icon} ${t.name}</option>`).join('');
    
    Modal.show(`
      <div class="modal-header">
        <h3 class="modal-title">发布帖子</h3>
        <div class="modal-close" onclick="Modal.hide()">×</div>
      </div>
      <div class="modal-body">
        <form id="postForm">
          <div class="form-group">
            <label class="form-label">以哪个宠物身份发帖</label>
            <select class="form-input" name="petId" style="background: #f5f5f5; border: 2px solid #e0e0e0;">
              ${petOptions}
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">内容</label>
            <textarea class="form-input" name="content" rows="4" placeholder="分享你家毛孩子的日常..." required style="resize: none; background: #f5f5f5; border: 2px solid #e0e0e0;"></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">话题标签</label>
            <select class="form-input" name="topic" style="background: #f5f5f5; border: 2px solid #e0e0e0;">
              ${topicOptions}
            </select>
          </div>
          
          <button type="submit" class="btn btn-primary btn-full" style="margin-top: 16px;">发布</button>
        </form>
      </div>
    `);
    
    const form = document.getElementById('postForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const pet = pets.find(p => p.id === formData.get('petId'));
      
      const post = {
        author: {
          name: `${pet.name}的家长`,
          petName: pet.name,
          petType: pet.type
        },
        content: formData.get('content'),
        topic: formData.get('topic'),
        images: []
      };
      
      Store.addPost(post);
      Toast.success('发布成功');
      Modal.hide();
    });
  },
  
  showCommentModal(postId) {
    Modal.show(renderCommentPanel(postId));
  },
  
  submitComment(postId) {
    const input = document.getElementById('commentInput');
    const content = input.value.trim();
    if (!content) return;
    
    const pets = Store.getState('pets');
    const pet = pets[0];
    
    Store.addComment(postId, content, pet?.name || '铲屎官', pet?.type || 'cat');
    input.value = '';
    Toast.success('评论成功');
    
    // 刷新评论区
    Modal.show(renderCommentPanel(postId));
  },
  
  // ========== 诊断历史 ==========
  showDiagnosisHistory() {
    const container = document.getElementById('pagesContainer');
    container.innerHTML = renderDiagnosisHistory();
  },
  
  // ========== 认证 ==========
  logout() {
    Store.logout();
    TabBar.hide();
    this.navigateTo('auth');
  },
  
  hideTabBar() {
    document.getElementById('tabbar').style.display = 'none';
  },
  
  showTabBar() {
    document.getElementById('tabbar').style.display = '';
  },
  
  // ========== Loading ==========
  showLoading(text = '加载中...') {
    const el = document.getElementById('loadingOverlay');
    if (!el) return;
    el.querySelector('div:last-child').textContent = text;
    el.style.display = 'flex';
    requestAnimationFrame(() => { el.style.opacity = '1'; });
  },
  
  hideLoading() {
    const el = document.getElementById('loadingOverlay');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => { el.style.display = 'none'; }, 300);
  },
  
  // ========== 图片上传 ==========
  handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      Toast.error('请上传图片文件');
      return;
    }
    
    // 检查文件大小 (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      Toast.error('图片大小不能超过10MB');
      return;
    }
    
    API.uploadImage(file).then(result => {
      if (result.success) {
        Diagnosis.setImage(result.data.url);
      } else {
        Toast.error('上传失败');
      }
    });
  }
};

// ========== Diagnosis Controller ==========
const Diagnosis = {
  selectPet(petId) {
    Pages.diagnosisState.selectedPetId = petId;
    App.navigateTo('diagnosis');
  },
  
  confirmPet() {
    const petId = Pages.diagnosisState.selectedPetId;
    if (petId) {
      const pets = Store.getState('pets');
      const pet = pets.find(p => p.id === petId);
      if (pet) {
        Pages.diagnosisState.selectedPetType = pet.type;
        Pages.diagnosisState.selectedPetName = pet.name;
      }
      Pages.diagnosisState.step = 2;
      App.navigateTo('diagnosis');
    }
  },
  
  confirmType() {
    if (Pages.diagnosisState.selectedType) {
      Pages.diagnosisState.step = 3;
      App.navigateTo('diagnosis');
    }
  },

  confirmSymptoms() {
    const s = Pages.diagnosisState;
    const textarea = document.getElementById('symptomInput');
    if (textarea) {
      s.symptoms = textarea.value.trim();
    }
    s.step = 4;
    App.navigateTo('diagnosis');
  },

  changeType() {
    Pages.diagnosisState.step = 2;
    Pages.diagnosisState.selectedType = null;
    Pages.diagnosisState.symptoms = '';
    App.navigateTo('diagnosis');
  },

  backToType() {
    Pages.diagnosisState.step = 2;
    App.navigateTo('diagnosis');
  },
  
  setImage(imageUrl) {
    Pages.diagnosisState.uploadedImage = imageUrl;
    App.navigateTo('diagnosis');
  },
  
  resetUpload() {
    Pages.diagnosisState.uploadedImage = null;
    App.navigateTo('diagnosis');
  },
  
  reset() {
    Pages.diagnosisState = {
      step: 1,
      selectedType: null,
      selectedPetId: null,
      uploadedImage: null,
      analyzing: false,
      result: null,
      similarCases: []
    };
    App.navigateTo('diagnosis');
  },
  
  async analyze() {
    const s = Pages.diagnosisState;
    s.analyzing = true;
    App.navigateTo('diagnosis');

    // 新格式：petType + bodyPart + symptoms + imageUrl
    const result = await API.diagnose({
      petType: s.selectedPetType || 'dog',
      bodyPart: s.selectedType,
      symptoms: s.symptoms || '',
      imageUrl: s.uploadedImage
    });

    if (result.success) {
      s.result = result.data;
      s.step = 5;
      s.similarCases = await API.getSimilarCases(s.selectedType);
    } else {
      Toast.error('诊断失败，请重试');
    }

    s.analyzing = false;
    App.navigateTo('diagnosis');
  },
  
  saveResult() {
    const s = Pages.diagnosisState;
    if (s.result) {
      Store.saveDiagnosis(s.result);
      Toast.success('已保存到诊断历史');
    }
  }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => App.init());
