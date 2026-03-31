/**
 * Pages - 页面渲染
 */

const Pages = {
  // ========== 首页 ==========
  renderHome() {
    const pets = Store.getState('pets');
    const reminders = Store.getState('reminders');
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingReminders = reminders
      .filter(r => !r.done && new Date(r.reminderDate || r.date) >= now && new Date(r.reminderDate || r.date) <= weekLater)
      .slice(0, 3);
    
    const petsHtml = pets.length > 0
      ? `<div class="pets-scroll">
          <div class="pets-container">
            ${pets.map(pet => renderPetCard(pet)).join('')}
            <div class="pet-card" onclick="App.showAddPetModal()" style="border: 2px dashed var(--border); background: transparent;">
              <div class="pet-avatar" style="background: var(--bg); font-size: 28px;">➕</div>
              <div class="pet-name" style="color: var(--text-light); font-size: 14px;">添加宠物</div>
            </div>
          </div>
        </div>`
      : `<div class="empty-state" style="padding: 40px;">
          <span class="empty-icon">🐾</span>
          <div class="empty-title">还没有添加宠物</div>
          <div class="empty-text">点击下方按钮添加你的毛孩子</div>
          <button class="btn btn-primary" onclick="App.showAddPetModal()">添加宠物</button>
        </div>`;
    
    return `
      <div class="page-content home-page">
        <div class="home-header">
          <h1>你好，${Store.state.user?.nickname || '铲屎官'} 👋</h1>
          <p>今天毛孩子状态如何？</p>
        </div>
        
        ${petsHtml}
        
        <div class="section-header" style="padding-left: 16px;">
          <h2>快捷服务</h2>
        </div>
        <div class="action-grid">
          <div class="action-card" onclick="App.navigateTo('diagnosis')">
            <span class="action-icon">🔬</span>
            <span class="action-name">AI看图诊断</span>
          </div>
          <div class="action-card" onclick="App.navigateTo('community')">
            <span class="action-icon">🌟</span>
            <span class="action-name">宠友圈</span>
          </div>
          <div class="action-card" onclick="App.showDiagnosisHistory()">
            <span class="action-icon">📋</span>
            <span class="action-name">诊断历史</span>
          </div>
          <div class="action-card" onclick="App.navigateTo('reminders')">
            <span class="action-icon">⏰</span>
            <span class="action-name">提醒管理</span>
          </div>
        </div>
        
        ${upcomingReminders.length > 0 ? `
          <div class="section-header">
            <h2>近期提醒 ⏰</h2>
            <span class="section-more" onclick="App.navigateTo('reminders')">查看全部</span>
          </div>
          <div class="reminders-preview" style="padding: 0 16px;">
            ${upcomingReminders.map(r => {
              const typeInfo = API.reminderTypes.find(t => t.id === r.type) || { icon: '📌', color: '#F5222D' };
              const icon = r.icon || typeInfo.icon;
              const color = r.color || typeInfo.color;
              const petName = r.petName || r.pet?.name || '宠物';
              return `
              <div class="reminder-preview-item" data-id="${r.id}">
                <div class="reminder-icon" style="background: ${color}20;">
                  <span>${icon}</span>
                </div>
                <div class="reminder-info">
                  <div class="reminder-title">${r.title}</div>
                  <div class="reminder-pet">🐾 ${petName}</div>
                </div>
                <span class="tag tag-orange">待处理</span>
              </div>`;
            }).join('')}
          </div>
        ` : ''}
        
        <div class="tip-card">
          <div class="tip-header">
            <span>💡</span>
            <span>养宠小贴士</span>
          </div>
          <div class="tip-content">
            春季是宠物皮肤病高发期，注意保持宠物毛发清洁，定期驱虫。如发现宠物频繁抓挠或皮肤异常，请及时使用「AI看图诊断」功能。
          </div>
        </div>
      </div>
    `;
  },
  
  // ========== 诊断页 ==========
  diagnosisState: {
    step: 1,
    selectedType: null,
    selectedPetId: null,
    uploadedImage: null,
    analyzing: false,
    result: null,
    similarCases: []
  },
  
  renderDiagnosis() {
    const s = this.diagnosisState;
    const pets = Store.getState('pets');
    
    // 步骤条
    const stepHtml = `
      <div class="steps-bar">
        <div class="step-item ${s.step >= 1 ? 'active' : ''}">
          <div class="step-num">1</div>
          <span class="step-text">选择宠物</span>
        </div>
        <div class="step-line ${s.step >= 2 ? 'active' : ''}"></div>
        <div class="step-item ${s.step >= 2 ? 'active' : ''}">
          <div class="step-num">2</div>
          <span class="step-text">选择类型</span>
        </div>
        <div class="step-line ${s.step >= 3 ? 'active' : ''}"></div>
        <div class="step-item ${s.step >= 3 ? 'active' : ''}">
          <div class="step-num">3</div>
          <span class="step-text">上传图片</span>
        </div>
        <div class="step-line ${s.step >= 4 ? 'active' : ''}"></div>
        <div class="step-item ${s.step >= 4 ? 'active' : ''}">
          <div class="step-num">4</div>
          <span class="step-text">查看结果</span>
        </div>
      </div>
    `;
    
    let content = '';
    
    // Step 1: 选择宠物
    if (s.step === 1) {
      content = `
        <div class="section-header" style="padding-top: 16px;">
          <h2>🐾 选择要诊断的宠物</h2>
        </div>
        <div style="padding: 0 16px;">
          ${pets.length > 0
            ? `<div class="type-grid" style="grid-template-columns: repeat(2, 1fr);">
                ${pets.map(pet => {
                  const emoji = API.petTypes.find(t => t.id === pet.type)?.emoji || '🐾';
                  const isSelected = s.selectedPetId === pet.id;
                  return `
                    <div class="type-card ${isSelected ? 'selected' : ''}" data-pet-id="${pet.id}" onclick="Diagnosis.selectPet('${pet.id}')" style="padding: 16px;">
                      <span style="font-size: 40px; display: block; margin-bottom: 8px;">${emoji}</span>
                      <span class="type-name">${pet.name}</span>
                      <span class="type-desc">${pet.breed || pet.type}</span>
                    </div>
                  `;
                }).join('')}
              </div>
              ${s.selectedPetId ? `<div style="padding: 16px;"><button class="btn btn-primary btn-full" onclick="Diagnosis.confirmPet()">确认选择 "${pets.find(p => p.id === s.selectedPetId)?.name}"</button></div>` : ''}`
            : `<div class="empty-state">
                <span class="empty-icon">🐾</span>
                <div class="empty-title">还没有宠物</div>
                <button class="btn btn-primary" onclick="App.showAddPetModal()">添加宠物</button>
              </div>`
          }
        </div>
      `;
    }
    // Step 2: 选择类型
    else if (s.step === 2) {
      content = `
        <div class="section-header" style="padding-top: 16px;">
          <h2>🔍 选择诊断类型</h2>
        </div>
        <div class="type-grid">
          ${['skin', 'eye', 'stool', 'behavior', 'mouth', 'ear'].map(type => 
            renderDiagnosisTypeCard(type, s.selectedType === type)
          ).join('')}
        </div>
        ${s.selectedType ? `<div style="padding: 16px;"><button class="btn btn-primary btn-full" onclick="Diagnosis.confirmType()">下一步</button></div>` : ''}
      `;
    }
    // Step 3: 上传图片
    else if (s.step === 3) {
      const typeInfo = {
        skin: { icon: '🔴', name: '皮肤问题' },
        eye: { icon: '👁️', name: '眼睛异常' },
        stool: { icon: '💩', name: '排泄物异常' },
        behavior: { icon: '🌀', name: '行为异常' },
        mouth: { icon: '🦷', name: '口腔问题' },
        ear: { icon: '👂', name: '耳部问题' }
      };
      const info = typeInfo[s.selectedType];
      const pet = pets.find(p => p.id === s.selectedPetId);
      
      if (s.analyzing) {
        content = `
          <div class="preview-section">
            ${s.uploadedImage ? `<img class="preview-image" src="${s.uploadedImage}" alt="预览">` : ''}
            <div class="analyzing-overlay">
              <div class="analyzing-spinner"></div>
              <div class="analyzing-text">AI 正在分析中...</div>
              <div class="analyzing-sub">请稍候，预计需要 10-20 秒</div>
            </div>
          </div>
        `;
      } else if (s.uploadedImage) {
        content = `
          <div class="preview-section">
            <img class="preview-image" src="${s.uploadedImage}" alt="预览">
          </div>
          <div style="padding: 16px; text-align: center;">
            <button class="btn btn-secondary" onclick="Diagnosis.resetUpload()" style="margin-right: 12px;">重新上传</button>
            <button class="btn btn-primary" onclick="Diagnosis.analyze()">🔬 开始AI诊断</button>
          </div>
        `;
      } else {
        content = `
          <div style="padding: 16px; background: #f9f9f9; margin: 0 16px; border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <span style="font-size: 24px;">🐾</span>
              <span style="font-size: 14px; color: #666;">诊断对象：<strong>${pet?.name || ''}</strong></span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 24px;">${info.icon}</span>
              <span style="font-size: 14px; color: #666;">诊断类型：<strong>${info.name}</strong></span>
              <span class="change-type-btn" onclick="Diagnosis.changeType()" style="margin-left: auto; color: #FF9500; font-size: 13px; cursor: pointer;">重选</span>
            </div>
          </div>
          
          <div class="upload-zone" id="uploadZone" style="margin: 24px 16px;">
            <span class="upload-icon">📷</span>
            <span class="upload-text">点击上传宠物图片</span>
            <span class="upload-hint">支持 JPG/PNG，建议图片清晰</span>
          </div>
          
          <div style="padding: 16px; margin: 0 16px; background: var(--bg); border-radius: 12px;">
            <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">📌 拍照建议：</div>
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.8; white-space: pre-line;">${API.getUploadTips(s.selectedType)}</div>
          </div>
          <input type="file" id="imageInput" accept="image/*" style="display: none;">
        `;
      }
    }
    // Step 4: 查看结果
    else if (s.step === 4 && s.result) {
      const r = s.result;
      const severityClass = r.severity.class === 'danger' ? 'severity-danger' : r.severity.class === 'warning' ? 'severity-warning' : '';
      
      content = `
        <div class="result-section" style="padding: 0 16px;">
          <div class="result-card ${severityClass}">
            <div class="severity-header">
              <span style="font-size: 14px; font-weight: 500;">紧急程度</span>
              <span class="severity-badge ${r.severity.class}">${r.severity.label}</span>
            </div>
            <div class="tags-row">
              ${r.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
          
          <div class="result-card" style="margin-top: 12px;">
            <h4 style="font-size: 14px; margin-bottom: 12px;">🔍 可能原因</h4>
            ${r.causes.map((cause, i) => `
              <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                <span style="width: 20px; height: 20px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0;">${i + 1}</span>
                <span style="font-size: 14px; color: var(--text);">${cause}</span>
              </div>
            `).join('')}
          </div>
          
          ${r.homeCare && r.homeCare.length > 0 ? `
            <div class="result-card" style="margin-top: 12px;">
              <h4 style="font-size: 14px; margin-bottom: 12px;">🏠 居家护理建议</h4>
              ${r.homeCare.map(item => `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 13px; color: var(--text-secondary);">
                  <span style="color: var(--success);">✓</span>
                  <span>${item}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="result-card" style="margin-top: 12px;">
            <h4 style="font-size: 14px; margin-bottom: 12px;">💡 AI 分析建议</h4>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">${r.aiAdvice}</p>
          </div>
          
          <div class="disclaimer">
            <p>⚠️ ${r.disclaimer || '本结果由 AI 辅助分析，仅供参考，不能替代专业兽医诊断。如有疑虑，请立即前往正规宠物医院就诊。'}</p>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="Diagnosis.saveResult()">💾 保存结果</button>
            <button class="btn btn-secondary" onclick="Diagnosis.reset()">🔄 重新诊断</button>
          </div>
          
          ${s.similarCases.length > 0 ? `
            <div class="similar-section">
              <div class="similar-header">
                <h4>📖 相似案例参考</h4>
                <span class="similar-count">来自社区 · ${r.similarCount} 条相似讨论</span>
              </div>
              ${s.similarCases.map(c => `
                <div class="case-item">
                  <div class="case-header">
                    <div class="case-author">
                      <div class="case-avatar">👤</div>
                      <div>
                        <div class="case-name">${c.author}</div>
                        <div class="case-pet">${c.petName}</div>
                      </div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                      <span class="case-source ${c.from === '小红书' ? 'xhs' : ''}">${c.from}</span>
                      ${c.solved ? '<span class="tag tag-green" style="font-size: 10px;">已解决</span>' : ''}
                    </div>
                  </div>
                  <div class="case-content">${c.content}</div>
                  <div class="case-footer">
                    <div class="case-stats">
                      <span>👍 ${c.likes}</span>
                    </div>
                    <span class="view-link">查看原帖 →</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }
    
    return `
      <div class="page-content diagnosis-page">
        <div class="diagnosis-header">
          <h1>🔬 AI 看图诊断</h1>
          <p>上传图片，AI 帮你初步判断宠物健康状况</p>
        </div>
        ${stepHtml}
        ${content}
      </div>
    `;
  },
  
  // ========== 社区页 ==========
  renderCommunity() {
    const posts = Store.getState('posts');
    const activeTab = 'hot';
    
    return `
      <div class="page-content community-page">
        <div class="community-header">
          <div class="community-tabs">
            ${['🔥 热门', '✨ 最新', '❤️ 关注'].map((tab, i) => `
              <span class="comm-tab ${i === 0 ? 'active' : ''}">${tab}</span>
            `).join('')}
          </div>
          <button class="new-post-btn" onclick="App.showNewPostModal()">+ 发帖</button>
        </div>
        
        <div class="posts-feed">
          ${posts.length > 0 
            ? posts.map(post => renderPostCard(post)).join('')
            : renderEmptyState('🌟', '还没有帖子', '成为第一个分享的人吧！', '发布帖子', 'App.showNewPostModal()')
          }
        </div>
        
        <div class="fab" onclick="App.showNewPostModal()">+</div>
      </div>
    `;
  },
  
  // ========== 提醒页 ==========
  renderReminders() {
    const reminders = Store.getState('reminders');
    const pets = Store.getState('pets');
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const active = reminders.filter(r => !r.done);
    const completed = reminders.filter(r => r.done);
    
    const todayReminders = active.filter(r => (r.reminderDate || r.date).slice(0,10) === today);
    const tomorrowReminders = active.filter(r => (r.reminderDate || r.date).slice(0,10) === tomorrow);
    const weekReminders = active.filter(r => { const d = r.reminderDate || r.date; return d > tomorrow && d <= weekLater; });
    const laterReminders = active.filter(r => (r.reminderDate || r.date) > weekLater);
    
    const pendingCount = active.length;
    
    const renderGroup = (title, items) => {
      if (items.length === 0) return '';
      return `
        <div class="reminder-group-title">${title}</div>
        ${items.map(r => renderReminderItem(r)).join('')}
      `;
    };
    
    return `
      <div class="page-content reminders-page">
        <div class="reminders-header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1>⏰ 健康提醒</h1>
              <p style="opacity: 0.85; margin-top: 4px;">守护毛孩子健康的每一步</p>
            </div>
            <button class="profile-edit-btn" onclick="App.showAddReminderModal()">+ 添加</button>
          </div>
        </div>
        
        <div class="reminders-stats">
          <div class="stat-card">
            <div class="stat-num">${pendingCount}</div>
            <div class="stat-label">待处理</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color: var(--success);">${completed.length}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color: var(--danger);">${pets.length}</div>
            <div class="stat-label">我的宠物</div>
          </div>
        </div>
        
        <div class="reminders-list">
          ${pendingCount > 0 
            ? `
              ${renderGroup('今天', todayReminders)}
              ${renderGroup('明天', tomorrowReminders)}
              ${renderGroup('本周', weekReminders)}
              ${renderGroup('更早', laterReminders)}
            `
            : renderEmptyState('⏰', '暂无提醒', '添加疫苗、驱虫等健康提醒', '添加提醒', 'App.showAddReminderModal()')
          }
          
          ${completed.length > 0 ? `
            <div class="reminder-group-title" style="margin-top: 24px; color: var(--text-light);">✅ 已完成</div>
            ${completed.slice(0, 5).map(r => {
              const typeInfo = API.reminderTypes.find(t => t.id === r.type) || { icon: '📌' };
              const icon = r.icon || typeInfo.icon;
              const petName = r.petName || r.pet?.name || '宠物';
              return `
              <div class="reminder-item" style="opacity: 0.6;">
                <div class="reminder-icon" style="background: var(--bg);">
                  <span style="opacity: 0.5;">${icon}</span>
                </div>
                <div class="reminder-info">
                  <div class="reminder-title" style="text-decoration: line-through;">${r.title}</div>
                  <div class="reminder-pet">🐾 ${petName}</div>
                </div>
              </div>`;
            }).join('')}
          ` : ''}
        </div>
        
        <div class="fab" onclick="App.showAddReminderModal()">+</div>
      </div>
    `;
  },
  
  // ========== 宠物档案页 ==========
  renderPetProfile(petId) {
    const pets = Store.getState('pets');
    const pet = pets.find(p => p.id === petId);
    
    if (!pet) {
      return `<div class="page-content"><div class="empty-state">宠物不存在</div></div>`;
    }
    
    const emoji = API.petTypes.find(t => t.id === pet.type)?.emoji || '🐾';
    const avatar = pet.avatar 
      ? `<img src="${pet.avatar}" alt="${pet.name}">` 
      : `<span style="font-size: 48px;">${emoji}</span>`;
    
    const genderText = pet.gender === 'male' ? '♂ 公' : pet.gender === 'female' ? '♀ 母' : '-';
    const age = Store.getPetAge(pet.birthday);
    
    const vaccineRecords = pet.vaccineRecords || [];
    const dewormingRecords = pet.dewormingRecords || [];
    
    return `
      <div class="page-content pet-profile-page">
        <div class="profile-header">
          <div class="profile-avatar">${avatar}</div>
          <div class="profile-info">
            <h2>${pet.name}</h2>
            <div class="profile-tags">
              <span class="profile-tag">${API.petTypes.find(t => t.id === pet.type)?.name || pet.type}</span>
              ${pet.breed ? `<span class="profile-tag">${pet.breed}</span>` : ''}
              <span class="profile-tag">${age}</span>
            </div>
          </div>
          <button class="profile-edit-btn" onclick="App.showEditPetModal('${pet.id}')">✏️</button>
        </div>
        
        <div class="info-grid" style="padding: 16px;">
          <div class="info-item">
            <div class="info-label">品种</div>
            <div class="info-value">${pet.breed || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">性别</div>
            <div class="info-value">${genderText}</div>
          </div>
          <div class="info-item">
            <div class="info-label">生日</div>
            <div class="info-value">${pet.birthday || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">体重</div>
            <div class="info-value">${pet.weight ? pet.weight + 'kg' : '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">毛色</div>
            <div class="info-value">${pet.color || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">绝育</div>
            <div class="info-value">${pet.sterilization ? '是' : '否'}</div>
          </div>
        </div>
        
        <div class="health-records-section">
          <div class="section-header" style="padding-left: 0;">
            <h3>💉 疫苗记录</h3>
            <span class="section-more" onclick="App.showAddHealthRecordModal('${pet.id}', 'vaccineRecords')">+ 添加</span>
          </div>
          ${vaccineRecords.length > 0
            ? vaccineRecords.map(v => `
                <div class="record-item">
                  <div class="record-info">
                    <h4>${v.type}</h4>
                    <p>${v.date} · ${v.medicine || v.hospital || ''}</p>
                  </div>
                  <span class="tag ${v.done ? 'tag-green' : 'tag-yellow'}">${v.done ? '已完成' : '待接种'}</span>
                </div>
              `).join('')
            : '<div class="empty-state" style="padding: 20px;"><div class="empty-text">暂无疫苗记录</div></div>'
          }
          
          <div class="section-header" style="padding-left: 0; margin-top: 16px;">
            <h3>💊 驱虫记录</h3>
            <span class="section-more" onclick="App.showAddHealthRecordModal('${pet.id}', 'dewormingRecords')">+ 添加</span>
          </div>
          ${dewormingRecords.length > 0
            ? dewormingRecords.map(d => `
                <div class="record-item">
                  <div class="record-info">
                    <h4>${d.type}</h4>
                    <p>${d.date} · ${d.medicine || ''}</p>
                  </div>
                  <span class="tag ${d.done ? 'tag-green' : 'tag-yellow'}">${d.done ? '已完成' : '待处理'}</span>
                </div>
              `).join('')
            : '<div class="empty-state" style="padding: 20px;"><div class="empty-text">暂无驱虫记录</div></div>'
          }
        </div>
        
        <div style="padding: 16px;">
          <button class="btn btn-secondary btn-full" onclick="App.navigateTo('home')">← 返回首页</button>
        </div>
      </div>
    `;
  },

// ========== 认证页 ==========
authState: {
  mode: 'login', // 'login' | 'register'
  loading: false,
  error: null
},

renderAuth() {
  const s = this.authState;
  const isLogin = s.mode === 'login';
  
  return `
    <div class="auth-page">
      <div class="auth-header">
        <div class="auth-logo">🐾</div>
        <h1 class="auth-title">毛孩子健康助手</h1>
        <p class="auth-subtitle">登录后可同步宠物数据到云端</p>
      </div>
      
      <div class="auth-tabs">
        <button class="auth-tab ${isLogin ? 'active' : ''}" onclick="Pages.switchAuthTab('login')">
          登录
        </button>
        <button class="auth-tab ${!isLogin ? 'active' : ''}" onclick="Pages.switchAuthTab('register')">
          注册
        </button>
      </div>
      
      <div class="auth-form">
        ${s.error ? `<div class="auth-error">${s.error}</div>` : ''}
        
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input 
            type="text" 
            id="authUsername" 
            class="form-input" 
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>
        
        ${!isLogin ? `
          <div class="form-group">
            <label class="form-label">昵称</label>
            <input 
              type="text" 
              id="authNickname" 
              class="form-input" 
              placeholder="请输入昵称（选填）"
              autocomplete="nickname"
            />
          </div>
        ` : ''}
        
        <div class="form-group">
          <label class="form-label">密码</label>
          <input 
            type="password" 
            id="authPassword" 
            class="form-input" 
            placeholder="请输入密码"
            autocomplete="${isLogin ? 'current-password' : 'new-password'}"
          />
        </div>
        
        <button 
          class="btn btn-primary btn-block" 
          id="authSubmitBtn"
          onclick="Pages.submitAuth()"
          ${s.loading ? 'disabled' : ''}
        >
          ${s.loading ? '处理中...' : (isLogin ? '登录' : '注册')}
        </button>
      </div>
      
      ${isLogin ? `
        <div class="auth-footer">
          <p>还没有账号？<a href="#" onclick="Pages.switchAuthTab('register'); return false;">立即注册</a></p>
        </div>
      ` : `
        <div class="auth-footer">
          <p>已有账号？<a href="#" onclick="Pages.switchAuthTab('login'); return false;">立即登录</a></p>
        </div>
      `}
    </div>
    
    <style>
      .auth-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #FFF2E8 0%, #F5F0FF 100%);
        padding: 48px 24px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .auth-header {
        text-align: center;
        margin-bottom: 32px;
      }
      .auth-logo {
        font-size: 64px;
        margin-bottom: 16px;
      }
      .auth-title {
        font-size: 24px;
        font-weight: 600;
        color: var(--text);
        margin: 0 0 8px;
      }
      .auth-subtitle {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
      }
      .auth-tabs {
        display: flex;
        background: var(--card);
        border-radius: var(--radius-lg);
        padding: 4px;
        margin-bottom: 24px;
        width: 100%;
        max-width: 320px;
        box-shadow: var(--shadow-sm);
      }
      .auth-tab {
        flex: 1;
        padding: 12px;
        border: none;
        background: transparent;
        border-radius: var(--radius-md);
        font-size: 15px;
        font-weight: 500;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-base);
      }
      .auth-tab.active {
        background: var(--primary);
        color: white;
      }
      .auth-form {
        width: 100%;
        max-width: 320px;
        background: var(--card);
        border-radius: var(--radius-lg);
        padding: 24px;
        box-shadow: var(--shadow-md);
      }
      .auth-error {
        background: var(--danger-light);
        color: var(--danger);
        padding: 12px;
        border-radius: var(--radius-sm);
        margin-bottom: 16px;
        font-size: 14px;
        text-align: center;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: var(--text);
        margin-bottom: 6px;
      }
      .form-input {
        width: 100%;
        padding: 12px 14px;
        border: 1.5px solid var(--border);
        border-radius: var(--radius-sm);
        font-size: 15px;
        transition: border-color var(--transition-fast);
        box-sizing: border-box;
      }
      .form-input:focus {
        outline: none;
        border-color: var(--primary);
      }
      .btn-block {
        width: 100%;
        margin-top: 8px;
      }
      .auth-footer {
        margin-top: 24px;
        text-align: center;
        font-size: 14px;
        color: var(--text-secondary);
      }
      .auth-footer a {
        color: var(--primary);
        text-decoration: none;
        font-weight: 500;
      }
    </style>
  `;
},

switchAuthTab(mode) {
  this.authState.mode = mode;
  this.authState.error = null;
  const container = document.getElementById('pagesContainer');
  if (container) container.innerHTML = this.renderAuth();
},

async submitAuth() {
  const s = this.authState;
  if (s.loading) return;
  
  const username = document.getElementById('authUsername').value.trim();
  const password = document.getElementById('authPassword').value.trim();
  const nickname = document.getElementById('authNickname')?.value.trim() || username;
  
  if (!username || !password) {
    s.error = '请填写用户名和密码';
    const container = document.getElementById('pagesContainer');
    if (container) container.innerHTML = this.renderAuth();
    return;
  }
  
  if (password.length < 6) {
    s.error = '密码至少6位';
    const container = document.getElementById('pagesContainer');
    if (container) container.innerHTML = this.renderAuth();
    return;
  }
  
  s.loading = true;
  s.error = null;
  const container = document.getElementById('pagesContainer');
  if (container) container.innerHTML = this.renderAuth();
  
  try {
    let res;
    if (s.mode === 'login') {
      res = await API_BASE.login(username, password);
    } else {
      res = await API_BASE.register(username, password, nickname);
    }
    
    if (res.success && res.data && res.data.token) {
      TokenManager.setToken(res.data.token);
      TokenManager.setUser(res.data.user);
      Store.setUser(res.data.user);
      App.hideTabBar();
      App.showLoading('加载数据...');
      Store.loadFromAPI().then(() => {
        App.hideLoading();
        App.navigateTo('home');
        TabBar.updateBadge();
      }).catch(e => {
        App.hideLoading();
        Toast.error('数据加载失败，请刷新重试');
        App.navigateTo('home');
        TabBar.updateBadge();
      });
      return;
    } else {
      s.error = res.message || '操作失败，请重试';
      s.loading = false;
      const c = document.getElementById('pagesContainer');
      if (c) c.innerHTML = Pages.renderAuth();
    }
  } catch (e) {
    console.error('submitAuth error:', e);
    Pages.authState.error = '网络异常，请检查网络连接';
    Pages.authState.loading = false;
    const c = document.getElementById('pagesContainer');
    if (c) c.innerHTML = Pages.renderAuth();
  }
},

};
