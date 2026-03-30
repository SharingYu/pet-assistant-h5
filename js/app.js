/**
 * App - 主应用入口
 */

const App = {
  currentTab: 'home',
  currentPetId: null,
  
  init() {
    // 初始化 TabBar
    TabBar.init();
    
    // 订阅 store 变化
    Store.subscribe(() => this.onStateChange());
    
    // 绑定导航
    this.bindNavigation();
    
    // 渲染首页
    this.navigateTo('home');
    
    // 更新 badge
    TabBar.updateBadge();
    
    console.log('App initialized');
  },
  
  // 导航到页面
  navigateTo(tab, data = null) {
    this.currentTab = tab;
    TabBar.setActive(tab);
    
    const container = document.getElementById('pagesContainer');
    
    switch (tab) {
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
  
  // 状态变化回调
  onStateChange() {
    // 根据当前状态重新渲染
    if (this.currentTab === 'home') {
      this.navigateTo('home');
    } else if (this.currentTab === 'reminders') {
      this.navigateTo('reminders');
    } else if (this.currentTab === 'community') {
      this.navigateTo('community');
    }
    
    // 更新 badge
    TabBar.updateBadge();
  },
  
  // 绑定导航事件
  bindNavigation() {
    // 导航通过 TabBar 的点击事件处理
  },
  
  // 绑定首页事件
  bindHomeEvents() {
    // 宠物卡片点击
    document.querySelectorAll('.pet-card[data-pet-id]').forEach(card => {
      card.addEventListener('click', () => {
        const petId = card.dataset.petId;
        this.showPetProfile(petId);
      });
    });
  },
  
  // 显示宠物档案
  showPetProfile(petId) {
    this.navigateTo('pet-profile', petId);
  },
  
  // 绑定诊断页事件
  bindDiagnosisEvents() {
    const s = Pages.diagnosisState;
    
    // 类型选择
    document.querySelectorAll('.type-card[data-type]').forEach(card => {
      card.addEventListener('click', () => {
        if (s.step === 1) {
          s.selectedType = card.dataset.type;
          s.step = 2;
          this.navigateTo('diagnosis');
        }
      });
    });
    
    // 上传区域
    const uploadZone = document.getElementById('uploadZone');
    const imageInput = document.getElementById('imageInput');
    
    if (uploadZone && imageInput) {
      uploadZone.addEventListener('click', () => imageInput.click());
      imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }
  },
  
  // 处理图片上传
  async handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const s = Pages.diagnosisState;
    const result = await API.uploadImage(file);
    
    if (result.success) {
      s.uploadedImage = result.data.url;
      this.navigateTo('diagnosis');
    } else {
      Toast.error('上传失败');
    }
  },
  
  // 绑定社区事件
  bindCommunityEvents() {
    // 点赞
    document.querySelectorAll('[data-action="like"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.post-card');
        const postId = card.dataset.id;
        Store.toggleLike(postId);
      });
    });
  },
  
  // 绑定提醒事件
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
  
  // 绑定宠物档案事件
  bindPetProfileEvents() {
    // 返回按钮等
  },
  
  // 显示添加宠物弹窗
  showAddPetModal() {
    Modal.show(renderAddPetForm());
    this.bindPetForm();
  },
  
  // 显示编辑宠物弹窗
  showEditPetModal(petId) {
    const pet = Store.getState('pets').find(p => p.id === petId);
    if (pet) {
      Modal.show(renderAddPetForm(pet));
      this.bindPetForm(petId);
    }
  },
  
  // 绑定宠物表单
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
      } else {
        Store.addPet(petData);
        Toast.success('添加成功');
      }
      
      Modal.hide();
    });
  },
  
  // 显示添加提醒弹窗
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
            <select class="form-input" name="petId" style="background: var(--bg); border: 2px solid var(--border);">
              ${petOptions}
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">提醒类型</label>
            <div id="typeGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 0;">
              ${typeOptions}
            </div>
            <input type="hidden" name="type" value="vaccine">
          </div>
          
          <div class="form-group">
            <label class="form-label">提醒事项</label>
            <input type="text" class="form-input" name="title" placeholder="如：猫三联疫苗（第三针）" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">提醒日期</label>
            <input type="date" class="form-input" name="date" required>
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
        document.querySelector('[name="type"]').value = card.dataset.type;
      });
    });
    
    // 第一个默认选中
    document.querySelector('#typeGrid .type-card').classList.add('selected');
    
    // 绑定表单提交
    const form = document.getElementById('reminderForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const pet = pets.find(p => p.id === formData.get('petId'));
      const type = API.reminderTypes.find(t => t.id === formData.get('type'));
      
      const reminder = {
        petId: formData.get('petId'),
        petName: pet?.name || '',
        type: formData.get('type'),
        title: formData.get('title'),
        date: formData.get('date'),
        icon: type?.icon || '📌',
        color: type?.color || '#FF9500',
        reminderTypeName: type?.name || '提醒'
      };
      
      Store.addReminder(reminder);
      Toast.success('提醒已添加');
      Modal.hide();
    });
  },
  
  // 显示新帖子弹窗
  showNewPostModal() {
    const pets = Store.getState('pets');
    
    if (pets.length === 0) {
      Toast.info('请先添加宠物');
      this.showAddPetModal();
      return;
    }
    
    const petOptions = pets.map((p, i) => `<option value="${p.id}">${p.name}</option>`).join('');
    const topicOptions = API.topics.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
    
    Modal.show(`
      <div class="modal-header">
        <h3 class="modal-title">发布帖子</h3>
        <div class="modal-close" onclick="Modal.hide()">×</div>
      </div>
      <div class="modal-body">
        <form id="postForm">
          <div class="form-group">
            <label class="form-label">以哪个宠物身份发帖</label>
            <select class="form-input" name="petId" style="background: var(--bg); border: 2px solid var(--border);">
              ${petOptions}
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">内容</label>
            <textarea class="form-input" name="content" rows="4" placeholder="分享你家毛孩子的日常..." required style="resize: none;"></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">话题标签</label>
            <select class="form-input" name="topic" style="background: var(--bg); border: 2px solid var(--border);">
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
  }
};

// 诊断相关方法
const Diagnosis = {
  reset() {
    Pages.diagnosisState = {
      step: 1,
      selectedType: null,
      uploadedImage: null,
      analyzing: false,
      result: null,
      similarCases: []
    };
    App.navigateTo('diagnosis');
  },
  
  resetUpload() {
    Pages.diagnosisState.uploadedImage = null;
    App.navigateTo('diagnosis');
  },
  
  changeType() {
    Pages.diagnosisState.step = 1;
    Pages.diagnosisState.selectedType = null;
    App.navigateTo('diagnosis');
  },
  
  async analyze() {
    const s = Pages.diagnosisState;
    s.analyzing = true;
    App.navigateTo('diagnosis');
    
    // 调用 AI 诊断
    const result = await API.diagnose(s.selectedType, s.uploadedImage);
    
    if (result.success) {
      s.result = result.data;
      s.step = 3;
      
      // 获取相似案例
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

// 初始化 App
document.addEventListener('DOMContentLoaded', () => App.init());
