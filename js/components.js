/**
 * Components - UI 组件库
 */

// ========== Toast ==========
const Toast = {
  show(message, duration = 2000) {
    const el = document.getElementById('toast');
    el.innerHTML = `<span>${message}</span>`;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
  },
  success(message) {
    this.show(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52C41A" stroke-width="2.5" style="flex-shrink:0"><path d="M20 6L9 17l-5-5"/></svg> ${message}`);
  },
  error(message) {
    this.show(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF4D4F" stroke-width="2.5" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg> ${message}`, 3000);
  },
  info(message) { this.show(message); }
};

// ========== Modal ==========
const Modal = {
  show(content, options = {}) {
    const mask = document.getElementById('modalMask');
    const container = document.getElementById('modalContent');
    container.innerHTML = content;
    mask.classList.add('show');
    
    if (options.onShow) options.onShow();
    
    mask.onclick = (e) => {
      if (e.target === mask) this.hide();
    };
  },
  hide() {
    document.getElementById('modalMask').classList.remove('show');
  }
};

// ========== TabBar ==========
const TabBar = {
  init() {
    const tabbar = document.getElementById('tabbar');
    tabbar.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab-item');
      if (tab) App.navigateTo(tab.dataset.tab);
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
  },
  hide() {
    document.getElementById('tabbar').style.display = 'none';
  },
  show() {
    document.getElementById('tabbar').style.display = '';
  }
};

// ========== 渲染函数 ==========

// 宠物卡片
function renderPetCard(pet, onClick) {
  const petType = API.petTypes.find(t => t.id === pet.type);
  const emoji = petType?.emoji || '<svg class="icon-32" viewBox="0 0 24 24"><use href="#icon-logo"/></svg>';
  const avatar = pet.avatar
    ? `<img src="${pet.avatar}" alt="${pet.name}">`
    : `<span style="font-size:36px">${emoji}</span>`;

  // 计算宠物年龄
  let ageStr = '';
  if (pet.birthday) {
    const birth = new Date(pet.birthday);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 12) {
      ageStr = `${months}个月`;
    } else {
      const years = Math.floor(months / 12);
      const ms = months % 12;
      ageStr = ms > 0 ? `${years}岁${ms}月` : `${years}岁`;
    }
  }

  return `
    <div class="pet-card" data-pet-id="${pet.id}" onclick="App.navigateTo('petProfile', '${pet.id}')">
      <div class="pet-avatar">${avatar}</div>
      <div class="pet-name">${pet.name}</div>
      <div class="pet-breed">${pet.breed || pet.type || ''} ${ageStr ? '· ' + ageStr : ''}</div>
    </div>
  `;
}

// 诊断类型卡片
function renderDiagnosisTypeCard(type, selected, onClick) {
  const svgIcons = {
    skin: '<svg class="type-icon-svg" viewBox="0 0 24 24"><use href="#icon-skin"/></svg>',
    eye: '<svg class="type-icon-svg" viewBox="0 0 24 24"><use href="#icon-eye"/></svg>',
    ear: '<svg class="type-icon-svg" viewBox="0 0 24 24"><use href="#icon-ear"/></svg>',
    mouth: '<svg class="type-icon-svg" viewBox="0 0 24 24"><use href="#icon-mouth"/></svg>',
    stool: '<svg class="type-icon-svg" viewBox="0 0 24 24"><use href="#icon-stool"/></svg>',
    behavior: '<svg class="type-icon-svg" viewBox="0 0 24 24"><use href="#icon-behavior"/></svg>'
  };
  const names = { skin: '皮肤问题', eye: '眼睛异常', stool: '排泄物异常', behavior: '行为异常', mouth: '口腔问题', ear: '耳部问题' };
  const descs = { skin: '脱毛/红斑/瘙痒', eye: '红肿/分泌物', stool: '形状/颜色异常', behavior: '跛行/呕吐/精神差', mouth: '口臭/牙龈红肿', ear: '红肿/分泌物' };

  return `
    <div class="type-card ${selected ? 'selected' : ''}" data-type="${type}" onclick="Diagnosis.selectType('${type}')">
      <span class="type-icon">${svgIcons[type] || '🔍'}</span>
      <span class="type-name">${names[type]}</span>
      <span class="type-desc">${descs[type]}</span>
    </div>
  `;
}

// 提醒项
function renderReminderItem(reminder, onDone, onDelete) {
  // 兼容旧格式（localStorage）和新格式（API）
  const typeInfo = API.reminderTypes.find(t => t.id === reminder.type) || { svgIcon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5222D" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>', color: '#F5222D', name: '其他' };
  const svgIcon = reminder.svgIcon || typeInfo.svgIcon;
  const color = reminder.color || typeInfo.color;
  const reminderTypeName = reminder.reminderTypeName || typeInfo.name;
  const displayDate = (reminder.reminderDate || reminder.date || '').slice(0, 10);
  const petName = reminder.petName || reminder.pet?.name || '宠物';

  return `
    <div class="reminder-item" data-id="${reminder.id}">
      <div class="reminder-icon" style="background: ${color}20;">
        <span>${svgIcon}</span>
      </div>
      <div class="reminder-info">
        <div class="reminder-title">${reminder.title}</div>
        <div class="reminder-pet"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><ellipse cx="12" cy="14" rx="5" ry="4"/><circle cx="8" cy="9" r="2"/><circle cx="16" cy="9" r="2"/><circle cx="6" cy="13" r="1.5"/><circle cx="18" cy="13" r="1.5"/></svg> ${petName} · ${reminderTypeName}</div>
        <div class="reminder-date"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" style="vertical-align:middle;margin-right:2px;"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>${displayDate}</div>
      </div>
      <div class="reminder-actions">
        <button class="reminder-btn done" data-action="done" title="完成">✓</button>
        <button class="reminder-btn delete" data-action="delete" title="删除">×</button>
      </div>
    </div>
  `;
}

// 帖子卡片
function renderPostCard(post) {
  const petTypeSvg = {
    cat: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="1.5"><ellipse cx="12" cy="14" rx="5" ry="4.5"/><path d="M7 10L5 5L9 9M17 10L19 5L15 9"/><circle cx="10" cy="13" r="0.8" fill="#FF9500" stroke="none"/><circle cx="14" cy="13" r="0.8" fill="#FF9500" stroke="none"/></svg>',
    dog: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="1.5"><ellipse cx="12" cy="14" rx="6" ry="5"/><circle cx="9" cy="8" r="2"/><circle cx="15" cy="8" r="2"/><circle cx="10" cy="13" r="0.8" fill="#FF9500" stroke="none"/><circle cx="14" cy="13" r="0.8" fill="#FF9500" stroke="none"/></svg>',
    rabbit: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="1.5"><ellipse cx="12" cy="15" rx="5" ry="4"/><path d="M9 11L8 4Q9 3 10 5L10 11M15 11L16 4Q15 3 14 5L14 11"/></svg>',
    hamster: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="1.5"><ellipse cx="12" cy="13" rx="6" ry="5"/><circle cx="8.5" cy="11" r="1.8"/><circle cx="15.5" cy="11" r="1.8"/><circle cx="10" cy="13" r="0.6" fill="#FF9500" stroke="none"/><circle cx="14" cy="13" r="0.6" fill="#FF9500" stroke="none"/></svg>'
  };
  const avatarSvg = petTypeSvg[post.author.petType] || petTypeSvg.dog;
  const imagesHtml = post.images && post.images.length > 0
    ? `<div class="post-images">${post.images.map(img => `<img class="post-image" src="${img}" alt="">`).join('')}</div>`
    : '';

  const aiReplyHtml = post.aiReply
    ? `<div class="post-ai-reply">
        <div class="post-ai-reply-header">
          <span class="post-ai-badge" style="background: linear-gradient(135deg, #FF9500, #FF6B00); color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">🤖 AI回复</span>
          <span>${post.author.petName}</span>
        </div>
        <div class="post-ai-text">${post.aiReply}</div>
      </div>`
    : '';

  return `
    <div class="post-card" data-id="${post.id}">
      <div class="post-header">
        <div class="post-avatar" style="background: #FFF2E8; display: flex; align-items: center; justify-content: center;">${avatarSvg}</div>
        <div class="post-author-info">
          <div>
            <span class="post-author-name">${post.author.name}</span>
          </div>
          <div class="post-time">${post.time || ''}</div>
        </div>
      </div>
      ${post.content ? `<div class="post-content">${post.content}</div>` : ''}
      ${imagesHtml}
      ${aiReplyHtml}
      <div class="post-interactions">
        <div class="interaction-btn ${post.isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')" style="cursor:pointer;">
          ${post.isLiked
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="#ff4d4f" stroke="#ff4d4f" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
            : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
          }
          <span>${post.likes || 0}</span>
        </div>
        <div class="interaction-btn" onclick="App.showPostComments('${post.id}')" style="cursor:pointer;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>${post.comments || 0}</span>
        </div>
        <div class="interaction-btn" onclick="App.sharePost('${post.id}')" style="cursor:pointer;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          <span>分享</span>
        </div>
      </div>
    </div>
  `;
}

// 诊断历史卡片
function renderDiagnosisHistoryCard(diagnosis) {
  const severityColors = { danger: '#FF4D4F', warning: '#FAAD14', normal: '#52C41A' };
  const color = severityColors[diagnosis.severity?.class] || '#52C41A';
  
  return `
    <div class="post-card" data-id="${diagnosis.id}" style="margin-bottom: 12px;">
      <div class="post-header">
        <div class="post-avatar" style="background: ${color}20; color: ${color};">
          ${diagnosis.typeIcon || '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9 12h6M12 9v6"/></svg>'}
        </div>
        <div class="post-author-info">
          <div>
            <span class="post-author-name">${diagnosis.typeName || '诊断'}</span>
            <span class="tag" style="background: ${color}20; color: ${color}; margin-left: 8px;">${diagnosis.severity?.label || ''}</span>
          </div>
          <div class="post-time">${diagnosis.date} ${diagnosis.time || ''}</div>
        </div>
      </div>
      ${diagnosis.image ? `<img src="${diagnosis.image}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;margin:8px 0;" alt="诊断图片">` : ''}
      <div class="tags-row" style="margin: 8px 0;">
        ${(diagnosis.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <div class="post-content" style="font-size:14px;color:#666;">
        ${diagnosis.causes?.map(c => `<div style="margin:4px 0;">• ${c}</div>`).join('') || ''}
      </div>
    </div>
  `;
}

// 评论项
function renderCommentItem(comment) {
  const petTypeSvg = {
    cat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="1.5"><ellipse cx="12" cy="14" rx="5" ry="4.5"/><path d="M7 10L5 5L9 9M17 10L19 5L15 9"/><circle cx="10" cy="13" r="0.8" fill="#FF9500" stroke="none"/><circle cx="14" cy="13" r="0.8" fill="#FF9500" stroke="none"/></svg>',
    dog: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="1.5"><ellipse cx="12" cy="14" rx="6" ry="5"/><circle cx="9" cy="8" r="2"/><circle cx="15" cy="8" r="2"/><circle cx="10" cy="13" r="0.8" fill="#FF9500" stroke="none"/><circle cx="14" cy="13" r="0.8" fill="#FF9500" stroke="none"/></svg>'
  };
  const avatarSvg = petTypeSvg[comment.petType] || petTypeSvg.dog;
  return `
    <div class="comment-item" style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">${avatarSvg}</span>
        <span style="font-weight: 500; font-size: 13px;">${comment.author}</span>
        <span style="font-size: 11px; color: #999;">${comment.time}</span>
      </div>
      <div style="font-size: 14px; color: #333; line-height: 1.5;">${comment.content}</div>
    </div>
  `;
}

// 空状态
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

// ========== 表单渲染 ==========

// 添加宠物表单
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
          <label class="form-label">宠物名字 *</label>
          <input type="text" class="form-input" name="name" placeholder="给宠物起个名字" value="${pet?.name || ''}" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">宠物类型</label>
          <div class="type-grid" style="grid-template-columns: repeat(5, 1fr); padding: 0;">
            ${API.petTypes.map(pt => {
              const isSelected = (pet?.type || 'cat') === pt.id;
              const label = pt.name.replace('🐱 ', '').replace('🐶 ', '').replace('🐰 ', '').replace('🐹 ', '').replace('🐾 ', '').replace('🐶 狗狗', '狗狗').replace('🐱 猫咪', '猫咪').replace('🐰 兔子', '兔子').replace('🐹 仓鼠', '仓鼠').replace('🐾 其他', '其他');
              return `<div class="type-card ${isSelected ? 'selected' : ''}" data-type="${pt.id}" onclick="selectPetType(this)" style="padding: 8px 4px;">
                <span class="type-icon" style="font-size: 24px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px;">${pt.emoji}</span>
                <span class="type-name" style="font-size: 11px;">${label}</span>
              </div>`;
            }).join('')}
          </div>
          <input type="hidden" name="type" value="${pet?.type || 'cat'}">
        </div>
        
        <div class="form-group">
          <label class="form-label">品种</label>
          <input type="text" class="form-input" name="breed" placeholder="如：中华田园猫、英国短毛猫" value="${pet?.breed || ''}">
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
            <div class="type-card ${(pet?.gender || '') !== 'male' ? 'selected' : ''}" data-gender="female" onclick="selectGender(this)" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span style="font-size: 20px;">♀</span>
              <span style="font-size: 13px;">母</span>
            </div>
            <div class="type-card ${(pet?.gender || '') === 'male' ? 'selected' : ''}" data-gender="male" onclick="selectGender(this)" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span style="font-size: 20px;">♂</span>
              <span style="font-size: 13px;">公</span>
            </div>
          </div>
          <input type="hidden" name="gender" value="${pet?.gender || 'female'}">
        </div>
        
        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9f9f9; border-radius: 8px;">
            <div>
              <div style="font-size: 14px; font-weight: 500;">已绝育</div>
              <div style="font-size: 12px; color: #999;">是否已完成绝育手术</div>
            </div>
            <label style="position: relative; width: 48px; height: 28px;">
              <input type="checkbox" name="sterilization" ${pet?.sterilization ? 'checked' : ''} style="display: none;">
              <div class="switch ${pet?.sterilization ? 'on' : ''}" onclick="toggleSterilization(this)" style="width: 48px; height: 28px; border-radius: 14px; background: ${pet?.sterilization ? '#52C41A' : '#e0e0e0'}; position: relative; cursor: pointer; transition: background 0.2s;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: white; position: absolute; top: 2px; left: ${pet?.sterilization ? '24px' : '2px'}; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>
              </div>
            </label>
          </div>
        </div>
        
        ${isEdit ? `<button type="button" class="btn btn-danger" onclick="App.deletePet('${pet.id}')" style="width: 100%; margin-bottom: 12px; background: #fff1f0; color: #ff4d4f; border: 1px solid #ff4d4f;">删除宠物</button>` : ''}
        
        <button type="submit" class="btn btn-primary btn-full" style="margin-top: 8px;">
          ${isEdit ? '保存修改' : '添加宠物'}
        </button>
      </form>
    </div>
  `;
}

// 辅助函数
window.selectPetType = function(el) {
  el.closest('.modal-content').querySelectorAll('.type-card[data-type]').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  el.closest('.modal-body').querySelector('[name="type"]').value = el.dataset.type;
};

window.selectGender = function(el) {
  el.closest('.modal-body').querySelectorAll('[data-gender]').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  el.closest('.modal-body').querySelector('[name="gender"]').value = el.dataset.gender;
};

window.toggleSterilization = function(el) {
  const input = el.previousElementSibling;
  input.checked = !input.checked;
  el.style.background = input.checked ? '#52C41A' : '#e0e0e0';
  el.querySelector('div').style.left = input.checked ? '24px' : '2px';
};

// 添加健康记录表单
function renderAddHealthRecordForm(petId, recordType, existingRecords = []) {
  const types = recordType === 'vaccine' 
    ? ['猫三联', '猫白血病', '狂犬疫苗', '狗六联', '狗八联', '其他']
    : ['体内驱虫', '体外驱虫', '弓形虫', '其他'];
  
  return `
    <div class="modal-header">
      <h3 class="modal-title">${recordType === 'vaccine' ? '添加疫苗记录' : '添加驱虫记录'}</h3>
      <div class="modal-close" onclick="Modal.hide()">×</div>
    </div>
    <div class="modal-body">
      <form id="recordForm">
        <input type="hidden" name="petId" value="${petId}">
        <input type="hidden" name="recordType" value="${recordType}">
        
        <div class="form-group">
          <label class="form-label">记录类型</label>
          <select class="form-input" name="type" style="background: #f5f5f5; border: 2px solid #e0e0e0;">
            ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">日期</label>
          <input type="date" class="form-input" name="date" value="${new Date().toISOString().split('T')[0]}" required style="background: #f5f5f5; border: 2px solid #e0e0e0;">
        </div>
        
        ${recordType === 'vaccine' ? `
          <div class="form-group">
            <label class="form-label">下次接种日期</label>
            <input type="date" class="form-input" name="nextDate" style="background: #f5f5f5; border: 2px solid #e0e0e0;">
          </div>
          <div class="form-group">
            <label class="form-label">接种医院</label>
            <input type="text" class="form-input" name="hospital" placeholder="如：XX宠物医院" style="background: #f5f5f5; border: 2px solid #e0e0e0;">
          </div>
          <div class="form-group">
            <label class="form-label">疫苗名称</label>
            <input type="text" class="form-input" name="medicine" placeholder="如：妙三多" style="background: #f5f5f5; border: 2px solid #e0e0e0;">
          </div>
        ` : `
          <div class="form-group">
            <label class="form-label">下次驱虫日期</label>
            <input type="date" class="form-input" name="nextDate" style="background: #f5f5f5; border: 2px solid #e0e0e0;">
          </div>
          <div class="form-group">
            <label class="form-label">驱虫药品</label>
            <input type="text" class="form-input" name="medicine" placeholder="如：拜耳内虫逃" style="background: #f5f5f5; border: 2px solid #e0e0e0;">
          </div>
        `}
        
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" name="done" checked style="width: 18px; height: 18px;">
            <span style="font-size: 14px;">已完成本次${recordType === 'vaccine' ? '接种' : '驱虫'}</span>
          </label>
        </div>
        
        <button type="submit" class="btn btn-primary btn-full">保存记录</button>
      </form>
    </div>
  `;
}

// 评论区
function renderCommentPanel(postId) {
  const comments = Store.getPostComments(postId);
  
  return `
    <div class="modal-header">
      <h3 class="modal-title">评论 (${comments.length})</h3>
      <div class="modal-close" onclick="Modal.hide()">×</div>
    </div>
    <div class="modal-body" style="padding-bottom: 80px;">
      <div class="comments-list" style="max-height: 400px; overflow-y: auto;">
        ${comments.length > 0 
          ? comments.map(c => renderCommentItem(c)).join('')
          : '<div style="text-align: center; padding: 40px; color: #999;">暂无评论，快来抢沙发~</div>'
        }
      </div>
      <div style="position: fixed; bottom: 0; left: 0; right: 0; max-width: 480px; margin: 0 auto; padding: 12px 16px; background: white; border-top: 1px solid #f0f0f0; display: flex; gap: 8px;">
        <input type="text" id="commentInput" placeholder="写下你的评论..." style="flex: 1; padding: 10px 14px; background: #f5f5f5; border-radius: 20px; font-size: 14px;">
        <button onclick="App.submitComment('${postId}')" style="padding: 10px 18px; background: #FF9500; color: white; border-radius: 20px; font-size: 14px; border: none;">发送</button>
      </div>
    </div>
  `;
}

// 诊断历史页面
function renderDiagnosisHistory() {
  const history = Store.getState('diagnosisHistory');

  return `
    <div class="page-content" style="padding: 16px; padding-bottom: 80px;">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <button onclick="App.navigateTo('home')" style="width: 32px; height: 32px; border-radius: 8px; background: #f5f5f5; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M5 12L12 19M5 12L12 5"/></svg>
        </button>
        <h2 style="flex: 1; text-align: center; font-size: 16px; font-weight: 600; color: #333; margin: 0;">诊断历史</h2>
        <div style="width: 32px;"></div>
      </div>

      ${history.length > 0
        ? history.map(d => renderDiagnosisHistoryCard(d)).join('')
        : renderEmptyState('<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" style="margin-bottom:8px;"><use href="#icon-stethoscope"/></svg>', '暂无诊断记录', '使用 AI 诊断功能后会在这里显示历史记录', null, null)
      }
    </div>
  `;
}

// ========== 全局交互函数 ==========

// 提醒类型选择
window.selectReminderType = function(el) {
  el.closest('.type-grid').querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  el.style.borderColor = '#FF9500';
  el.style.background = '#FFFBF5';
};

// 删除帖子
window.deletePost = function(postId) {
  if (!confirm('确定删除这条帖子？')) return;
  Store.deletePost(postId);
  Toast.success('已删除');
  Modal.hide();
  App.navigateTo('community');
};

// 点赞/取消点赞
window.toggleLike = function(postId) {
  Store.toggleLike(postId);
  Pages.render('community');
};

// 宠物类型选择（添加宠物表单）
window.selectPetType = function(el) {
  el.closest('.type-grid').querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
};

// 性别选择
window.selectGender = function(el) {
  el.closest('.gender-selector').querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
};

// 绝育开关
window.toggleSterilization = function(el) {
  const input = el.closest('label').querySelector('input[type="checkbox"]');
  input.checked = !input.checked;
  el.classList.toggle('on', input.checked);
  el.style.background = input.checked ? '#52C41A' : '#e0e0e0';
  el.querySelector('div').style.left = input.checked ? '24px' : '2px';
};

// 保存诊断结果
window.saveDiagnosisResult = function() {
  Toast.success('诊断结果已保存');
  Modal.hide();
};

// 提醒详情
function renderReminderDetail(reminderId) {
  const reminders = Store.getState('reminders') || [];
  const r = reminders.find(x => x.id === reminderId);
  if (!r) return '<div class="modal-body"><p>提醒不存在</p></div>';

  const typeInfo = API.reminderTypes.find(t => t.id === r.type) || { svgIcon: '', color: '#666', name: '其他' };
  const done = r.done;
  const date = (r.reminderDate || r.date || '').slice(0, 10);

  return `
    <div class="modal-header">
      <h3 class="modal-title">提醒详情</h3>
      <div class="modal-close" onclick="Modal.hide()">×</div>
    </div>
    <div class="modal-body" style="padding: 20px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <div style="width: 48px; height: 48px; border-radius: 12px; background: ${typeInfo.color}20; display: flex; align-items: center; justify-content: center;">
          ${typeInfo.svgIcon}
        </div>
        <div>
          <div style="font-size: 16px; font-weight: 600; color: #333;">${r.title}</div>
          <div style="font-size: 13px; color: #999; margin-top: 2px;">${typeInfo.name} · ${r.petName || ''}</div>
        </div>
      </div>
      <div style="background: #f5f5f5; border-radius: 10px; padding: 12px; margin-bottom: 16px;">
        <div style="font-size: 13px; color: #666;">
          <strong>提醒时间：</strong>${date}
        </div>
        <div style="font-size: 13px; color: #666; margin-top: 6px;">
          <strong>状态：</strong>
          <span style="color: ${done ? '#52c41a' : '#faad14'};">${done ? '已完成' : '待完成'}</span>
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        ${!done ? `<button onclick="App.completeReminder('${r.id}')" class="btn btn-primary" style="flex: 1;">标记完成</button>` : ''}
        <button onclick="App.deleteReminder('${r.id}')" class="btn" style="flex: 1; background: #fff1f0; color: #ff4d4f; border: 1px solid #ffccc7;">删除</button>
      </div>
    </div>
  `;
}

// 添加提醒表单
function renderAddReminderForm(pet) {
  const petOptions = Store.getState('pets').map(p =>
    `<option value="${p.id}" ${p.id === pet?.id ? 'selected' : ''}>${p.name}</option>`
  ).join('');

  return `
    <div class="modal-header">
      <h3 class="modal-title">添加提醒</h3>
      <div class="modal-close" onclick="Modal.hide()">×</div>
    </div>
    <form class="modal-body" onsubmit="return false;" style="padding: 20px;">
      <div style="margin-bottom: 14px;">
        <label style="font-size: 13px; color: #666; display: block; margin-bottom: 6px;">选择宠物</label>
        <select name="petId" required style="width: 100%; padding: 10px; border: 1.5px solid #e0e0e0; border-radius: 10px; font-size: 14px; background: #fafafa;">
          <option value="">请选择宠物</option>
          ${petOptions}
        </select>
      </div>
      <div style="margin-bottom: 14px;">
        <label style="font-size: 13px; color: #666; display: block; margin-bottom: 6px;">提醒类型</label>
        <div class="type-grid" style="grid-template-columns: repeat(3, 1fr); gap: 8px;">
          ${API.reminderTypes.map(t => `
            <div class="type-card" data-type="${t.id}" onclick="selectReminderType(this)" style="padding: 8px; text-align: center; border: 1.5px solid #e0e0e0; border-radius: 10px; cursor: pointer;">
              <div style="width: 24px; height: 24px; margin: 0 auto 4px; display: flex; align-items: center; justify-content: center;">${t.svgIcon}</div>
              <div style="font-size: 11px; color: #666;">${t.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="margin-bottom: 14px;">
        <label style="font-size: 13px; color: #666; display: block; margin-bottom: 6px;">提醒标题</label>
        <input type="text" name="title" required placeholder="如：年度疫苗接种" style="width: 100%; padding: 10px; border: 1.5px solid #e0e0e0; border-radius: 10px; font-size: 14px; box-sizing: border-box; background: #fafafa;">
      </div>
      <div style="margin-bottom: 14px;">
        <label style="font-size: 13px; color: #666; display: block; margin-bottom: 6px;">提醒时间</label>
        <input type="date" name="date" required style="width: 100%; padding: 10px; border: 1.5px solid #e0e0e0; border-radius: 10px; font-size: 14px; box-sizing: border-box; background: #fafafa;">
      </div>
      <div style="display: flex; gap: 10px; margin-top: 16px;">
        <button type="button" onclick="Modal.hide()" class="btn" style="flex: 1; background: #f5f5f5; color: #666; border: none; border-radius: 10px; padding: 12px;">取消</button>
        <button type="submit" onclick="App.submitReminder(this.form)" class="btn btn-primary" style="flex: 1; border: none; border-radius: 10px; padding: 12px;">保存</button>
      </div>
    </form>
  `;
}

// 提交提醒
window.submitReminder = function(form) {
  const formData = new FormData(form);
  const selectedType = document.querySelector('.type-grid .type-card.selected');
  const type = API.reminderTypes.find(t => t.id === selectedType?.dataset.type) || API.reminderTypes[0];
  const petId = formData.get('petId');
  const pet = Store.getState('pets').find(p => p.id === petId);

  const reminder = {
    petId,
    petName: pet?.name || '',
    type: type.id,
    title: formData.get('title'),
    reminderDate: formData.get('date'),
    svgIcon: type.svgIcon,
    color: type.color,
    reminderTypeName: type.name
  };

  Store.createReminder(reminder).then(() => {
    Toast.success('提醒已创建');
    Modal.hide();
    App.navigateTo('reminders');
  }).catch(e => {
    Toast.error('创建失败');
  });
};
