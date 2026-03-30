/**
 * Pages - 页面渲染
 */

const Pages = {
  // 渲染首页
  renderHome() {
    const pets = Store.getState('pets');
    const reminders = Store.getState('reminders');
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingReminders = reminders
      .filter(r => !r.done && new Date(r.date) >= now && new Date(r.date) <= weekLater)
      .slice(0, 3);
    
    const petsHtml = pets.length > 0
      ? `<div class="pets-scroll">
          <div class="pets-container">
            ${pets.map(pet => renderPetCard(pet)).join('')}
            <div class="pet-card" onclick="App.showAddPetModal()" style="border: 2px dashed var(--border); background: transparent;">
              <div class="pet-avatar" style="background: var(--bg);">➕</div>
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
          <h1>你好，铲屎官 👋</h1>
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
          <div class="action-card" onclick="App.showPetProfile(App.currentPetId)">
            <span class="action-icon">📋</span>
            <span class="action-name">健康记录</span>
          </div>
          <div class="action-card" onclick="App.navigateTo('community')">
            <span class="action-icon">🌟</span>
            <span class="action-name">宠友圈</span>
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
            ${upcomingReminders.map(r => `
              <div class="reminder-preview-item" data-id="${r.id}">
                <div class="reminder-icon" style="background: ${r.color}20;">
                  <span>${r.icon}</span>
                </div>
                <div class="reminder-info">
                  <div class="reminder-title">${r.title}</div>
                  <div class="reminder-pet">🐾 ${r.petName}</div>
                </div>
                <span class="tag tag-orange">待处理</span>
              </div>
            `).join('')}
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
  
  // 渲染诊断页
  diagnosisState: {
    step: 1,
    selectedType: null,
    uploadedImage: null,
    analyzing: false,
    result: null,
    similarCases: []
  },
  
  renderDiagnosis() {
    const s = this.diagnosisState;
    
    const stepHtml = `
      <div class="steps-bar">
        <div class="step-item ${s.step >= 1 ? 'active' : ''}">
          <div class="step-num">1</div>
          <span class="step-text">选择类型</span>
        </div>
        <div class="step-line ${s.step >= 2 ? 'active' : ''}"></div>
        <div class="step-item ${s.step >= 2 ? 'active' : ''}">
          <div class="step-num">2</div>
          <span class="step-text">上传图片</span>
        </div>
        <div class="step-line ${s.step >= 3 ? 'active' : ''}"></div>
        <div class="step-item ${s.step >= 3 ? 'active' : ''}">
          <div class="step-num">3</div>
          <span class="step-text">查看结果</span>
        </div>
      </div>
    `;
    
    let content = '';
    
    if (s.step === 1) {
      // 选择类型
      content = `
        <div class="section-header" style="padding-top: 16px;">
          <h2>🐾 选择诊断类型</h2>
        </div>
        <div class="type-grid">
          ${['skin', 'eye', 'stool', 'behavior', 'mouth', 'ear'].map(type => 
            renderDiagnosisTypeCard(type, s.selectedType === type)
          ).join('')}
        </div>
      `;
    } else if (s.step === 2) {
      // 上传图片
      const typeInfo = {
        skin: { icon: '🔴', name: '皮肤问题' },
        eye: { icon: '👁️', name: '眼睛异常' },
        stool: { icon: '💩', name: '排泄物异常' },
        behavior: { icon: '🌀', name: '行为异常' },
        mouth: { icon: '🦷', name: '口腔问题' },
        ear: { icon: '👂', name: '耳部问题' }
      };
      const info = typeInfo[s.selectedType];
      
      if (s.analyzing) {
        // 分析中
        content = `
          <div class="preview-section">
            <img class="preview-image" src="${s.uploadedImage}" alt="预览">
            <div class="analyzing-overlay">
              <div class="analyzing-spinner"></div>
              <div class="analyzing-text">AI 正在分析中...</div>
              <div class="analyzing-sub">请稍候，预计需要 10-20 秒</div>
            </div>
          </div>
        `;
      } else if (s.uploadedImage) {
        // 已上传，显示预览
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
        // 上传区域
        content = `
          <div class="selected-type-bar">
            <span>${info.icon} ${info.name}</span>
            <span class="change-type-btn" onclick="Diagnosis.changeType()">重选</span>
          </div>
          <div class="upload-zone" id="uploadZone" style="margin-top: 24px;">
            <span class="upload-icon">📷</span>
            <span class="upload-text">点击上传宠物图片</span>
            <span class="upload-hint">支持 JPG/PNG，建议图片清晰</span>
          </div>
          <div style="padding: 16px 24px; background: var(--bg); margin: 0 16px; border-radius: 12px;">
            <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">📌 拍照建议：</div>
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.8;">
              ${API.getUploadTips(s.selectedType)}
            </div>
          </div>
          <input type="file" id="imageInput" accept="image/*" style="display: none;">
        `;
      }
    } else if (s.step === 3 && s.result) {
      // 查看结果
      const r = s.result;
      const severityClass = r.severity.class === 'danger' ? 'severity-danger' : r.severity.class === 'warning' ? 'severity-warning' : '';
      
      content = `
        <div class="result-section">
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
          
          <div class="result-card" style="margin-top: 12px;">
            <h4 style="font-size: 14px; margin-bottom: 12px;">💡 AI 建议</h4>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">${r.aiAdvice}</p>
          </div>
          
          <div class="disclaimer">
            <p>⚠️ 本结果由 AI 辅助分析，仅供参考，不能替代专业兽医诊断。</p>
            <p>如有疑虑，请立即前往正规宠物医院就诊。</p>
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
                    <span class="case-source ${c.from === '小红书' ? 'xhs' : ''}">${c.from}</span>
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
  
  // 渲染社区页
  renderCommunity() {
    const posts = Store.getState('posts');
    const activeTab = 'hot';
    
    const tabs = ['🔥 热门', '✨ 最新', '❤️ 关注'];
    
    return `
      <div class="page-content community-page">
        <div class="community-header">
          <div class="community-tabs">
            ${tabs.map((tab, i) => `
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
  
  // 渲染提醒页
  renderReminders() {
    const reminders = Store.getState('reminders');
    const pets = Store.getState('pets');
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const active = reminders.filter(r => !r.done);
    const completed = reminders.filter(r => r.done);
    
    // 分组
    const todayReminders = active.filter(r => r.date === today);
    const tomorrowReminders = active.filter(r => r.date === tomorrow);
    const weekReminders = active.filter(r => r.date > tomorrow && r.date <= weekLater);
    const laterReminders = active.filter(r => r.date > weekLater);
    
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
            ${completed.slice(0, 5).map(r => `
              <div class="reminder-item" style="opacity: 0.6;">
                <div class="reminder-icon" style="background: var(--bg);">
                  <span style="opacity: 0.5;">${r.icon}</span>
                </div>
                <div class="reminder-info">
                  <div class="reminder-title" style="text-decoration: line-through;">${r.title}</div>
                  <div class="reminder-pet">🐾 ${r.petName}</div>
                </div>
              </div>
            `).join('')}
          ` : ''}
        </div>
        
        <div class="fab" onclick="App.showAddReminderModal()">+</div>
      </div>
    `;
  },
  
  // 渲染宠物档案页
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
    
    const age = pet.birthday ? Pages.calculateAge(pet.birthday) : '未知';
    
    const genderText = pet.gender === 'male' ? '♂ 公' : pet.gender === 'female' ? '♀ 母' : '-';
    
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
          <button class="profile-edit-btn" onclick="App.showEditPetModal('${pet.id}')">✏️ 编辑</button>
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
            <span class="section-more" onclick="App.showAddRecordModal('${pet.id}', 'vaccine')">+ 添加</span>
          </div>
          ${pet.vaccineRecords && pet.vaccineRecords.length > 0
            ? pet.vaccineRecords.map(v => `
                <div class="record-item">
                  <div class="record-info">
                    <h4>${v.type}</h4>
                    <p>${v.date} · ${v.hospital || ''}</p>
                  </div>
                  <span class="tag ${v.done ? 'tag-green' : 'tag-yellow'}">${v.done ? '已完成' : '待接种'}</span>
                </div>
              `).join('')
            : '<div class="empty-state" style="padding: 20px;"><div class="empty-text">暂无疫苗记录</div></div>'
          }
          
          <div class="section-header" style="padding-left: 0; margin-top: 16px;">
            <h3>💊 驱虫记录</h3>
            <span class="section-more" onclick="App.showAddRecordModal('${pet.id}', 'deworm')">+ 添加</span>
          </div>
          ${pet.dewormingRecords && pet.dewormingRecords.length > 0
            ? pet.dewormingRecords.map(d => `
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
  
  calculateAge(birthday) {
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
  }
};
