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
  success(message) { this.show(`<span style="color:#52C41A">✓</span> ${message}`); },
  error(message) { this.show(`<span style="color:#FF4D4F">✗</span> ${message}`); },
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
  }
};

// ========== 渲染函数 ==========

// 宠物卡片
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

// 诊断类型卡片
function renderDiagnosisTypeCard(type, selected, onClick) {
  const icons = { skin: '🔴', eye: '👁️', stool: '💩', behavior: '🌀', mouth: '🦷', ear: '👂' };
  const names = { skin: '皮肤问题', eye: '眼睛异常', stool: '排泄物异常', behavior: '行为异常', mouth: '口腔问题', ear: '耳部问题' };
  const descs = { skin: '脱毛/红斑/瘙痒', eye: '红肿/分泌物', stool: '形状/颜色异常', behavior: '跛行/呕吐/精神差', mouth: '口臭/牙龈红肿', ear: '红肿/分泌物' };
  
  return `
    <div class="type-card ${selected ? 'selected' : ''}" data-type="${type}">
      <span class="type-icon">${icons[type]}</span>
      <span class="type-name">${names[type]}</span>
      <span class="type-desc">${descs[type]}</span>
    </div>
  `;
}

// 提醒项
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

// 帖子卡片
function renderPostCard(post) {
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

// 诊断历史卡片
function renderDiagnosisHistoryCard(diagnosis) {
  const severityColors = { danger: '#FF4D4F', warning: '#FAAD14', normal: '#52C41A' };
  const color = severityColors[diagnosis.severity?.class] || '#52C41A';
  
  return `
    <div class="post-card" data-id="${diagnosis.id}" style="margin-bottom: 12px;">
      <div class="post-header">
        <div class="post-avatar" style="background: ${color}20; color: ${color};">
          ${diagnosis.typeIcon || '🔬'}
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
  const emoji = comment.petType === 'cat' ? '🐱' : comment.petType === 'dog' ? '🐶' : '🐾';
  return `
    <div class="comment-item" style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="font-size: 18px;">${emoji}</span>
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
              const label = pt.name.replace('🐱 ', '').replace('🐶 ', '').replace('🐰 ', '').replace('🐹 ', '').replace('🐾 ', '');
              return `<div class="type-card ${isSelected ? 'selected' : ''}" data-type="${pt.id}" onclick="selectPetType(this)" style="padding: 8px 4px;">
                <span class="type-icon" style="font-size: 24px;">${pt.emoji}</span>
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
      <div class="section-header" style="padding: 0; margin-bottom: 16px;">
        <h2 style="font-size: 18px;">🔬 诊断历史</h2>
      </div>
      
      ${history.length > 0
        ? history.map(d => renderDiagnosisHistoryCard(d)).join('')
        : renderEmptyState('🔬', '暂无诊断记录', '使用 AI 诊断功能后会在这里显示历史记录', null, null)
      }
    </div>
  `;
}
