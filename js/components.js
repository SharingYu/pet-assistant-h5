/**
 * Components - UI 组件
 */

// Toast 组件
const Toast = {
  show(message, duration = 2000) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
  },
  success(message) { this.show(`✅ ${message}`); },
  error(message) { this.show(`❌ ${message}`); },
  info(message) { this.show(message); }
};

// Modal 组件
const Modal = {
  show(content) {
    const mask = document.getElementById('modalMask');
    const container = document.getElementById('modalContent');
    container.innerHTML = content;
    mask.classList.add('show');
    
    // 点击遮罩关闭
    mask.onclick = (e) => {
      if (e.target === mask) this.hide();
    };
  },
  hide() {
    const mask = document.getElementById('modalMask');
    mask.classList.remove('show');
  }
};

// TabBar 组件
const TabBar = {
  init() {
    const tabbar = document.getElementById('tabbar');
    tabbar.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab-item');
      if (tab) {
        const tabName = tab.dataset.tab;
        App.navigateTo(tabName);
      }
    });
  },
  setActive(tabName) {
    document.querySelectorAll('.tab-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });
  },
  updateBadge() {
    const count = Store.getPendingRemindersCount();
    const badge = document.getElementById('reminderBadge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
    }
  }
};

// 渲染宠物卡片
function renderPetCard(pet, onClick) {
  const emoji = API.petTypes.find(t => t.id === pet.type)?.emoji || '🐾';
  const avatar = pet.avatar 
    ? `<img src="${pet.avatar}" alt="${pet.name}">` 
    : `<span style="font-size:36px">${emoji}</span>`;
  
  return `
    <div class="pet-card" data-pet-id="${pet.id}">
      <div class="pet-avatar">${avatar}</div>
      <div class="pet-name">${pet.name}</div>
      <div class="pet-breed">${pet.breed || ''}</div>
    </div>
  `;
}

// 渲染诊断类型卡片
function renderDiagnosisTypeCard(type, selected, onClick) {
  const icons = {
    skin: '🔴', eye: '👁️', stool: '💩', behavior: '🌀', mouth: '🦷', ear: '👂'
  };
  const names = {
    skin: '皮肤问题', eye: '眼睛异常', stool: '排泄物异常', 
    behavior: '行为异常', mouth: '口腔问题', ear: '耳部问题'
  };
  const descs = {
    skin: '脱毛/红斑/瘙痒',
    eye: '红肿/分泌物',
    stool: '形状/颜色异常',
    behavior: '跛行/呕吐/精神差',
    mouth: '口臭/牙龈红肿',
    ear: '红肿/分泌物'
  };
  
  return `
    <div class="type-card ${selected ? 'selected' : ''}" data-type="${type}">
      <span class="type-icon">${icons[type]}</span>
      <span class="type-name">${names[type]}</span>
      <span class="type-desc">${descs[type]}</span>
    </div>
  `;
}

// 渲染提醒项目
function renderReminderItem(reminder, onDone, onDelete) {
  return `
    <div class="reminder-item" data-id="${reminder.id}">
      <div class="reminder-icon" style="background: ${reminder.color}20;">
        <span>${reminder.icon}</span>
      </div>
      <div class="reminder-info">
        <div class="reminder-title">${reminder.title}</div>
        <div class="reminder-pet">🐾 ${reminder.petName} · ${reminder.reminderTypeName}</div>
        <div class="reminder-date">📅 ${reminder.date}</div>
      </div>
      <div class="reminder-actions">
        <button class="reminder-btn done" data-action="done" title="完成">✓</button>
        <button class="reminder-btn delete" data-action="delete" title="删除">×</button>
      </div>
    </div>
  `;
}

// 渲染帖子卡片
function renderPostCard(post, onLike) {
  const emoji = post.author.petType === 'cat' ? '🐱' : post.author.petType === 'dog' ? '🐶' : '🐾';
  const imagesHtml = post.images && post.images.length > 0
    ? `<div class="post-images">${post.images.map(img => `<img class="post-image" src="${img}" alt="">`).join('')}</div>`
    : '';
  
  const aiReplyHtml = post.aiReply
    ? `<div class="post-ai-reply">
        <div class="post-ai-reply-header">
          <span class="post-ai-badge">🐱 AI回复</span>
          <span>${post.author.petName}</span>
        </div>
        <div class="post-ai-text">${post.aiReply}</div>
      </div>`
    : '';
  
  return `
    <div class="post-card" data-id="${post.id}">
      <div class="post-header">
        <div class="post-avatar">${emoji}</div>
        <div class="post-author-info">
          <div>
            <span class="post-author-name">${post.author.name}</span>
            <span class="post-pet-tag">${emoji} ${post.author.petName}</span>
          </div>
          <div class="post-time">${post.time}</div>
        </div>
      </div>
      <div class="post-content">${post.content}</div>
      ${imagesHtml}
      ${aiReplyHtml}
      <div class="post-interactions">
        <div class="interaction-btn ${post.isLiked ? 'liked' : ''}" data-action="like">
          <span class="icon">${post.isLiked ? '❤️' : '🤍'}</span>
          <span>${post.likes}</span>
        </div>
        <div class="interaction-btn" data-action="comment">
          <span class="icon">💬</span>
          <span>${post.comments}</span>
        </div>
        <div class="interaction-btn" data-action="share">
          <span class="icon">↗️</span>
          <span>分享</span>
        </div>
      </div>
    </div>
  `;
}

// 渲染空状态
function renderEmptyState(icon, title, text, buttonText, onClick) {
  return `
    <div class="empty-state">
      <span class="empty-icon">${icon}</span>
      <div class="empty-title">${title}</div>
      <div class="empty-text">${text}</div>
      ${buttonText ? `<button class="btn btn-primary" onclick="${onClick}">${buttonText}</button>` : ''}
    </div>
  `;
}

// 渲染添加宠物表单
function renderAddPetForm(pet = null) {
  const isEdit = !!pet;
  return `
    <div class="modal-header">
      <h3 class="modal-title">${isEdit ? '编辑宠物' : '添加宠物'}</h3>
      <div class="modal-close" onclick="Modal.hide()">×</div>
    </div>
    <div class="modal-body">
      <form id="petForm">
        <div class="form-group">
          <label class="form-label">宠物名字</label>
          <input type="text" class="form-input" name="name" placeholder="给宠物起个名字" value="${pet?.name || ''}" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">宠物类型</label>
          <div class="type-grid" style="grid-template-columns: repeat(3, 1fr); padding: 0;">
            ${API.petTypes.map(pt => `
              <div class="type-card ${(pet?.type || '') === pt.id ? 'selected' : ''}" data-type="${pt.id}" onclick="selectPetType(this)">
                <span class="type-icon">${pt.emoji}</span>
                <span class="type-name">${pt.name.replace('🐱 ', '').replace('🐶 ', '').replace('🐰 ', '').replace('🐹 ', '').replace('🐾 ', '')}</span>
              </div>
            `).join('')}
          </div>
          <input type="hidden" name="type" value="${pet?.type || 'cat'}">
        </div>
        
        <div class="form-group">
          <label class="form-label">品种</label>
          <input type="text" class="form-input" name="breed" placeholder="如：中华田园猫" value="${pet?.breed || ''}">
        </div>
        
        <div class="form-group">
          <label class="form-label">生日</label>
          <input type="date" class="form-input" name="birthday" value="${pet?.birthday || ''}">
        </div>
        
        <div class="form-group">
          <label class="form-label">体重 (kg)</label>
          <input type="number" step="0.1" class="form-input" name="weight" placeholder="如：4.5" value="${pet?.weight || ''}">
        </div>
        
        <div class="form-group">
          <label class="form-label">性别</label>
          <div style="display: flex; gap: 12px;">
            <div class="type-card ${(pet?.gender || '') !== 'male' ? 'selected' : ''}" data-gender="female" onclick="selectGender(this)" style="flex: 1;">
              <span class="type-icon">♀</span>
              <span class="type-name">母</span>
            </div>
            <div class="type-card ${(pet?.gender || '') === 'male' ? 'selected' : ''}" data-gender="male" onclick="selectGender(this)" style="flex: 1;">
              <span class="type-icon">♂</span>
              <span class="type-name">公</span>
            </div>
          </div>
          <input type="hidden" name="gender" value="${pet?.gender || 'female'}">
        </div>
        
        <div class="form-group">
          <label class="form-label" style="display: flex; align-items: center; justify-content: space-between;">
            已绝育
            <label class="switch" style="transform: scale(0.8);">
              <input type="checkbox" name="sterilization" ${pet?.sterilization ? 'checked' : ''}>
            </label>
          </label>
        </div>
        
        <button type="submit" class="btn btn-primary btn-full" style="margin-top: 16px;">
          ${isEdit ? '保存修改' : '添加宠物'}
        </button>
      </form>
    </div>
  `;
}

// 辅助函数
window.selectPetType = function(el) {
  document.querySelectorAll('[data-type]').forEach(c => {
    if (c.classList.contains('type-card') && c.closest('#petForm')) {
      c.classList.remove('selected');
    }
  });
  el.classList.add('selected');
  document.querySelector('[name="type"]').value = el.dataset.type;
};

window.selectGender = function(el) {
  document.querySelectorAll('[data-gender]').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  document.querySelector('[name="gender"]').value = el.dataset.gender;
};
