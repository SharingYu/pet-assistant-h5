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
          <svg class="icon-40" viewBox="0 0 40 40"><use href="#icon-logo"/></svg>
          <div class="empty-title">还没有添加宠物</div>
          <div class="empty-text">点击下方按钮添加你的毛孩子</div>
          <button class="btn btn-primary" onclick="App.showAddPetModal()">添加宠物</button>
        </div>`;

    // 统计信息
    const petCount = pets.length;
    const reminderCount = reminders.filter(r => !r.done).length;
    const todayReminders = reminders.filter(r => {
      if (r.done) return false;
      const d = new Date(r.reminderDate || r.date);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length;

    return `
      <div class="page-content home-page">
        <div class="home-header" style="background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%); color: white; padding: 20px 16px 16px; margin: -12px -16px 0; border-radius: 0 0 20px 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="font-size: 22px; margin: 0 0 4px;">你好，${Store.state.user?.nickname || '铲屎官'}</h1>
              <p style="margin: 0; opacity: 0.9; font-size: 13px;">${petCount > 0 ? '毛孩子们等你照顾～' : '添加你的第一个宠物吧'}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 28px; font-weight: 700;">${petCount}</div>
              <div style="font-size: 11px; opacity: 0.85;">只宠物</div>
            </div>
          </div>
          ${todayReminders > 0 ? `
          <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 8px 12px; margin-top: 12px; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span style="font-size: 13px;">今日有 <strong>${todayReminders}</strong> 个提醒待处理</span>
          </div>
          ` : ''}
        </div>
        
        ${petsHtml}
        
        <div class="section-header" style="padding-left: 16px;">
          <h2>快捷服务</h2>
        </div>
        <div class="action-grid">
          <div class="action-card" onclick="App.navigateTo('diagnosis')">
            <span class="action-icon"><svg class="icon-20" viewBox="0 0 24 24"><use href="#icon-stethoscope"/></svg></span>
            <span class="action-name">AI看图诊断</span>
          </div>
          <div class="action-card" onclick="App.navigateTo('community')">
            <span class="action-icon"><svg class="icon-20" viewBox="0 0 24 24"><use href="#icon-community"/></svg></span>
            <span class="action-name">宠友圈</span>
          </div>
          <div class="action-card" onclick="App.showDiagnosisHistory()">
            <span class="action-icon"><svg class="icon-20" viewBox="0 0 24 24"><use href="#icon-stethoscope"/></svg></span>
            <span class="action-name">诊断历史</span>
          </div>
          <div class="action-card" onclick="App.navigateTo('reminders')">
            <span class="action-icon"><svg class="icon-20" viewBox="0 0 24 24"><use href="#icon-reminder"/></svg></span>
            <span class="action-name">提醒管理</span>
          </div>
        </div>
        
        ${upcomingReminders.length > 0 ? `
          <div class="section-header">
            <h2>近期提醒 <svg class="icon-16" viewBox="0 0 24 24"><use href="#icon-reminder"/></svg></h2>
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
                  <div class="reminder-pet"><svg class="icon-16" viewBox="0 0 24 24"><use href="#icon-logo"/></svg> ${petName}</div>
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
    selectedPetType: null,  // 宠物类型：dog/cat/rabbit/hamster
    selectedPetName: null,
    symptoms: '',           // 用户描述的症状
    uploadedImage: null,
    analyzing: false,
    result: null,
    similarCases: []
  },
  
  renderDiagnosis() {
    const s = this.diagnosisState;
    const pets = Store.getState('pets');

    // 诊断页顶部导航栏
    const headerHtml = `
      <div class="diagnosis-header-bar" style="display: flex; align-items: center; padding: 12px 16px; background: #fff; border-bottom: 1px solid #f0f0f0; position: sticky; top: 0; z-index: 50;">
        <button class="page-back-btn" onclick="Diagnosis.goBack()" style="position: static; transform: none; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border: none; cursor: pointer; color: #333;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M5 12L12 19M5 12L12 5"/></svg>
        </button>
        <div style="flex: 1; text-align: center; font-size: 16px; font-weight: 600; color: #333;">AI 分诊</div>
        <div style="width: 32px;"></div>
      </div>
    `;

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
          <span class="step-text">选择部位</span>
        </div>
        <div class="step-line ${s.step >= 3 ? 'active' : ''}"></div>
        <div class="step-item ${s.step >= 3 ? 'active' : ''}">
          <div class="step-num">3</div>
          <span class="step-text">描述症状</span>
        </div>
        <div class="step-line ${s.step >= 4 ? 'active' : ''}"></div>
        <div class="step-item ${s.step >= 4 ? 'active' : ''}">
          <div class="step-num">4</div>
          <span class="step-text">上传图片</span>
        </div>
        <div class="step-line ${s.step >= 5 ? 'active' : ''}"></div>
        <div class="step-item ${s.step >= 5 ? 'active' : ''}">
          <div class="step-num">5</div>
          <span class="step-text">查看结果</span>
        </div>
      </div>
    `;
    
    let content = '';
    
    // Step 1: 选择宠物
    if (s.step === 1) {
      content = `
        <div class="section-header" style="padding-top: 16px;">
          <h2><svg class="icon-20" viewBox="0 0 24 24"><use href="#icon-logo"/></svg> 选择要诊断的宠物</h2>
        </div>
        <div style="padding: 0 16px;">
          ${pets.length > 0
            ? `<div class="type-grid" style="grid-template-columns: repeat(2, 1fr);">
                ${pets.map(pet => {
                  const emoji = API.petTypes.find(t => t.id === pet.type)?.emoji || '<svg class="icon-32" viewBox="0 0 24 24"><use href="#icon-logo"/></svg>';
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
                <svg class="icon-40" viewBox="0 0 40 40"><use href="#icon-logo"/></svg>
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
          <h2><svg class="icon-20" viewBox="0 0 24 24"><use href="#icon-stethoscope"/></svg> 选择诊断类型</h2>
        </div>
        <div class="type-grid">
          ${['skin', 'eye', 'stool', 'behavior', 'mouth', 'ear'].map(type =>
            renderDiagnosisTypeCard(type, s.selectedType === type)
          ).join('')}
        </div>
        ${s.selectedType ? `<div style="padding: 16px;"><button class="btn btn-primary btn-full" onclick="Diagnosis.confirmType()">下一步</button></div>` : ''}
      `;
    }
    // Step 3: 描述症状
    else if (s.step === 3) {
      const typeInfo = {
        skin: { icon: '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-skin"/></svg>', name: '皮肤问题', placeholder: '如：背部脱毛、红斑、瘙痒、狗狗一直抓挠等' },
        eye: { icon: '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-eye"/></svg>', name: '眼睛异常', placeholder: '如：眼睛发红、流泪、分泌物增多、眯眼等' },
        stool: { icon: '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-stool"/></svg>', name: '排泄物异常', placeholder: '如：拉稀2天、食欲下降、呕吐黄色液体等' },
        behavior: { icon: '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-behavior"/></svg>', name: '行为异常', placeholder: '如：精神差、嗜睡、抽搐、走路不稳等' },
        mouth: { icon: '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-mouth"/></svg>', name: '口腔问题', placeholder: '如：口臭、牙龈红肿、流口水、牙齿松动等' },
        ear: { icon: '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-ear"/></svg>', name: '耳部问题', placeholder: '如：耳朵发红、有异味、甩头、抓耳朵等' }
      };
      const info = typeInfo[s.selectedType] || { icon: '🔍', name: '其他', placeholder: '请描述宠物的症状' };

      content = `
        <div class="section-header" style="padding-top: 16px;">
          <h2><svg class="icon-20" viewBox="0 0 24 24"><use href="#icon-add"/></svg> 描述症状</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">详细描述有助于AI更准确分诊</p>
        </div>
        <div style="padding: 0 16px;">
          <div style="background: #f5f5f5; border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 28px;">${info.icon}</span>
            <div>
              <div style="font-size: 14px; font-weight: 500;">${pet?.name || ''} - ${info.name}</div>
              <div style="font-size: 12px; color: var(--text-secondary);">选择部位：${info.name}</div>
            </div>
            <span onclick="Diagnosis.changeType()" style="margin-left: auto; color: #FF9500; font-size: 13px; cursor: pointer;">重选</span>
          </div>

          <div style="margin-bottom: 16px;">
            <textarea
              id="symptomInput"
              class="symptom-textarea"
              placeholder="${info.placeholder}"
              rows="4"
              style="width: 100%; padding: 14px; border: 1.5px solid #e0e0e0; border-radius: 12px; font-size: 14px; line-height: 1.6; resize: none; box-sizing: border-box; outline: none; transition: border-color 0.2s;"
              onfocus="this.style.borderColor='#FF9500'"
              onblur="this.style.borderColor='#e0e0e0'"
            >${s.symptoms || ''}</textarea>
            <div style="text-align: right; font-size: 12px; color: #999; margin-top: 4px;">选填，不填写也可提交</div>
          </div>

          <div style="background: #FFF9E6; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;">
            <div style="font-size: 12px; color: #996600; line-height: 1.6;">
              💡 <strong>小技巧：</strong>描述越详细，分诊越准确<br>
              • 持续多久了？<br>
              • 吃过什么异常的东西？<br>
              • 有没有其他伴随症状？
            </div>
          </div>

          <button class="btn btn-primary btn-full" onclick="Diagnosis.confirmSymptoms()">下一步</button>
          <div style="text-align: center; margin-top: 12px;">
            <span onclick="Diagnosis.backToType()" style="color: #999; font-size: 13px; cursor: pointer;">← 返回上一步</span>
          </div>
        </div>
      `;
    }
    // Step 4: 上传图片
    else if (s.step === 4) {
      const typeInfo = {
        skin: { icon: '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-skin"/></svg>', name: '皮肤问题' },
        eye: { icon: '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-eye"/></svg>', name: '眼睛异常' },
        stool: { icon: '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-stool"/></svg>', name: '排泄物异常' },
        behavior: { icon: '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-behavior"/></svg>', name: '行为异常' },
        mouth: { icon: '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-mouth"/></svg>', name: '口腔问题' },
        ear: { icon: '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-ear"/></svg>', name: '耳部问题' }
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
          <div style="padding: 0 16px; text-align: center;">
            <div style="text-align: left; background: #f5f5f5; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px;">
              <div style="font-size: 12px; color: #999;">已填写的症状：<span style="color: #666;">${s.symptoms || '无'}</span></div>
            </div>
            <button class="btn btn-secondary" onclick="Diagnosis.resetUpload()" style="margin-right: 12px;">重新上传</button>
            <button class="btn btn-primary" onclick="Diagnosis.analyze()"><svg class="icon-16" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:4px"><use href="#icon-stethoscope"/></svg>开始AI诊断</button>
            <div style="margin-top: 10px;">
              <span onclick="Diagnosis.analyze()" style="color: #FF9500; font-size: 13px; cursor: pointer;">（不上传图片，直接诊断）</span>
            </div>
          </div>
        `;
      } else {
        content = `
          <div style="padding: 16px; background: #f9f9f9; margin: 0 16px; border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
              <span style="font-size: 24px;">🐾</span>
              <span style="font-size: 14px; color: #666;">诊断对象：<strong>${pet?.name || ''}</strong></span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
              <span style="font-size: 24px;">${info.icon}</span>
              <span style="font-size: 14px; color: #666;">诊断类型：<strong>${info.name}</strong></span>
              <span onclick="Diagnosis.changeType()" style="margin-left: auto; color: #FF9500; font-size: 13px; cursor: pointer;">重选</span>
            </div>
            ${s.symptoms ? `
            <div style="background: #fff; border-radius: 8px; padding: 10px 12px; margin-bottom: 4px;">
              <div style="font-size: 12px; color: #999; margin-bottom: 2px;">已填写的症状：</div>
              <div style="font-size: 13px; color: var(--text);">${s.symptoms}</div>
            </div>
            ` : ''}
            <div style="text-align: right;">
              <span onclick="Diagnosis.backToType()" style="color: #FF9500; font-size: 13px; cursor: pointer;">修改症状</span>
            </div>
          </div>

          <div class="upload-zone" id="uploadZone" style="margin: 24px 16px;">
            <span class="upload-icon"><svg class="icon-32" viewBox="0 0 24 24"><use href="#icon-image"/></svg></span>
            <span class="upload-text">点击上传宠物图片</span>
            <span class="upload-hint">支持 JPG/PNG，建议图片清晰（可跳过）</span>
          </div>

          <div style="padding: 16px; margin: 0 16px; background: var(--bg); border-radius: 12px;">
            <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">📌 拍照建议：</div>
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.8; white-space: pre-line;">${API.getUploadTips(s.selectedType)}</div>
          </div>

          <div style="padding: 16px;">
            <button class="btn btn-primary btn-full" onclick="Diagnosis.analyze()"><svg class="icon-16" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:4px"><use href="#icon-stethoscope"/></svg>开始AI诊断（不上传图片也可）</button>
          </div>
          <input type="file" id="imageInput" accept="image/*" style="display: none;">
        `;
      }
    }
    // Step 4: 查看结果
    else if (s.step === 5 && s.result) {
      const r = s.result;
      const severityClass = r.severity.class === 'danger' ? 'severity-danger' : r.severity.class === 'warning' ? 'severity-warning' : '';
      const homeCareItems = Array.isArray(r.homeCare) ? r.homeCare : (r.homeCare?.canDo || []);
      const avoidItems = Array.isArray(r.homeCare) ? [] : (r.homeCare?.avoid || []);

      content = `
        <div class="result-section" style="padding: 0 16px;">
          ${r.triage ? `
          <div class="result-card ${severityClass}" style="margin-bottom: 12px;">
            <div class="severity-header">
              <span style="font-size: 14px; font-weight: 500;">分诊结果</span>
              <span class="severity-badge ${r.severity.class}">${r.severity.label}</span>
            </div>
            ${r.summary ? `<p style="font-size: 14px; color: var(--text); margin: 8px 0 0; line-height: 1.5;">${r.summary}</p>` : ''}
          </div>
          ` : ''}

          ${r.visualAnalysis ? `
          <div class="result-card" style="margin-bottom: 12px;">
            <h4 style="font-size: 14px; margin-bottom: 8px;"><svg class="icon-16" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:4px;color:var(--primary)"><use href="#icon-image"/></svg>图片分析</h4>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">${r.visualAnalysis}</p>
          </div>
          ` : ''}

          ${r.urgentRedFlags && r.urgentRedFlags.length > 0 ? `
          <div class="result-card severity-danger" style="margin-bottom: 12px; border: 1px solid #ff3b30;">
            <h4 style="font-size: 14px; margin-bottom: 8px; color: #ff3b30;">🚨 红色警示（立即就医）</h4>
            ${r.urgentRedFlags.map(flag => `
              <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
                <svg class="icon-16" viewBox="0 0 24 24" style="color:#ff3b30;vertical-align:middle"><use href="#icon-level-high"/></svg>
                <span style="font-size: 13px; color: #333;">${flag}</span>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div class="result-card" style="margin-bottom: 12px;">
            <h4 style="font-size: 14px; margin-bottom: 12px;"><svg class="icon-16" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:4px;color:var(--primary)"><use href="#icon-stethoscope"/></svg>可能原因</h4>
            ${(r.causes || r.tags || []).map((cause, i) => `
              <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                <span style="width: 20px; height: 20px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0;">${i + 1}</span>
                <span style="font-size: 14px; color: var(--text);">${cause}</span>
              </div>
            `).join('')}
          </div>

          ${(homeCareItems.length > 0 || avoidItems.length > 0) ? `
          <div class="result-card" style="margin-bottom: 12px;">
            <h4 style="font-size: 14px; margin-bottom: 10px;"><svg class="icon-16" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:4px;color:var(--primary)"><use href="#icon-home"/></svg>居家护理建议</h4>
            ${homeCareItems.length > 0 ? `
              <div style="margin-bottom: 8px;">
                <div style="font-size: 12px; color: var(--success); margin-bottom: 4px;">✓ 推荐做</div>
                ${homeCareItems.map(item => `
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 13px; color: var(--text-secondary);">
                    <span style="color: var(--success);">✓</span>
                    <span>${item}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${avoidItems.length > 0 ? `
              <div>
                <div style="font-size: 12px; color: #ff3b30; margin-bottom: 4px;">✗ 避免做</div>
                ${avoidItems.map(item => `
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 13px; color: var(--text-secondary);">
                    <span style="color: #ff3b30;">✗</span>
                    <span>${item}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          ` : ''}

          ${r.consultNow ? `
          <div class="result-card" style="margin-bottom: 12px; border-left: 3px solid #FF9500; background: #fffbf0;">
            <h4 style="font-size: 14px; margin-bottom: 6px;"><svg class="icon-16" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:4px;color:#FF9500"><use href="#icon-stethoscope"/></svg>就医建议</h4>
            <p style="font-size: 14px; color: var(--text); line-height: 1.5;">${r.consultNow}</p>
          </div>
          ` : ''}

          ${r.aiAdvice && !r.consultNow ? `
          <div class="result-card" style="margin-bottom: 12px;">
            <h4 style="font-size: 14px; margin-bottom: 12px;"><svg class="icon-16" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:4px;color:var(--primary)"><use href="#icon-stethoscope"/></svg>AI 分析建议</h4>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">${r.aiAdvice}</p>
          </div>
          ` : ''}

          ${r.aiUsed ? `
          <div style="text-align: center; font-size: 11px; color: #999; margin-bottom: 8px;">
            🤖 AI模型：${r.aiUsed === 'qwen-vl-plus' ? '通义千问VL（图像理解）' : '本地模拟'}
          </div>
          ` : ''}

          <div class="disclaimer">
            <p>⚠️ ${r.disclaimer || '本结果由 AI 辅助分析，仅供参考，不能替代专业兽医诊断。如有疑虑，请立即前往正规宠物医院就诊。'}</p>
          </div>

          ${r.communityRefs && r.communityRefs.length > 0 ? `
          <div class="community-refs-section" style="margin: 16px; padding: 14px; background: #f8f7ff; border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color: #6366f1; flex-shrink: 0;"><path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.6543 20 9.40193 19.7105 8.29176 19.2125C7.70989 18.9273 7.26403 18.4304 7.03439 17.8195C6.80474 17.2086 6.80751 16.5291 7.04221 15.9204C5.16689 14.8105 4 13.0519 4 11C4 6.80558 8.02944 3 12 3C12.104 3 12.2077 3.00238 12.3108 3.00619" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" transform="scale(0.9) translate(1,-1)"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M8 12H16M12 8V16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              <span style="font-size: 13px; font-weight: 600; color: #4f46e5;">💬 还有其他用户有一样的疑问</span>
            </div>
            ${r.communityRefs.slice(0, 3).map((ref, i) => `
              <div style="background: #fff; border-radius: 8px; padding: 10px 12px; margin-bottom: ${i < 2 ? '8px' : '0'};">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <span style="font-size: 11px; background: ${ref.platform === '小红书' ? '#ff2442' : ref.platform === '知乎' ? '#0084ff' : '#666'}; color: white; padding: 1px 6px; border-radius: 4px;">${ref.platform}</span>
                </div>
                <div style="font-size: 13px; color: #333; line-height: 1.4; margin-bottom: 3px;">${ref.title}</div>
                <div style="font-size: 11px; color: #888; line-height: 1.4;">${ref.summary}</div>
              </div>
            `).join('')}
            <div style="text-align: center; margin-top: 8px;">
              <span style="font-size: 11px; color: #999;">以上内容来自公共平台，仅供參考</span>
            </div>
          </div>
          ` : ''}

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
        ${headerHtml}
        <div style="background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%); padding: 16px 16px 12px; color: white;">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 2px;">AI 分诊助手</div>
          <div style="font-size: 12px; opacity: 0.9;">智能分析 · 专业准确 · 初步分诊</div>
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
            ${[
              { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>', label: '热门' },
              { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>', label: '最新' },
              { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>', label: '关注' }
            ].map((tab, i) => `
              <span class="comm-tab ${i === 0 ? 'active' : ''}" style="display: flex; align-items: center; gap: 4px;">${tab.icon}${tab.label}</span>
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
              <h1><svg class="icon-20" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 6px; color: #FF9500;"><use href="#icon-reminder"/></svg>健康提醒</h1>
              <p style="opacity: 0.85; margin-top: 4px;">守护毛孩子健康的每一步</p>
            </div>
            <button onclick="App.showAddReminderModal()" style="background: linear-gradient(135deg, #FF9500, #FF6B00); color: white; border: none; border-radius: 20px; width: 36px; height: 36px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(255,149,0,0.3);">+</button>
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
            : renderEmptyState('<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" style="margin-bottom:8px;"><use href="#icon-reminder"/></svg>', '暂无提醒', '添加疫苗、驱虫等健康提醒', '添加提醒', 'App.showAddReminderModal()')
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
                  <div class="reminder-pet"><svg class="icon-16" viewBox="0 0 24 24"><use href="#icon-logo"/></svg> ${petName}</div>
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

    const petType = API.petTypes.find(t => t.id === pet.type);
    const avatar = pet.avatar
      ? `<img src="${pet.avatar}" alt="${pet.name}">`
      : `<svg class="icon" viewBox="0 0 24 24" style="width:48px;height:48px;"><use href="#${petType?.icon || 'icon-logo'}"/></svg>`;

    const genderText = pet.gender === 'male' ? '♂ 公' : pet.gender === 'female' ? '♀ 母' : '-';
    const age = Store.getPetAge(pet.birthday);

    // 返回按钮
    const backBtn = `
      <div style="display: flex; align-items: center; padding: 12px 16px; background: #fff; border-bottom: 1px solid #f0f0f0;">
        <button onclick="App.navigateTo('home')" style="width: 32px; height: 32px; border-radius: 8px; background: #f5f5f5; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M5 12L12 19M5 12L12 5"/></svg>
        </button>
        <span style="flex: 1; text-align: center; font-size: 16px; font-weight: 600; color: #333; margin-right: 32px;">宠物档案</span>
      </div>
    `;
    
    const vaccineRecords = pet.vaccineRecords || [];
    const dewormingRecords = pet.dewormingRecords || [];
    
    return `
      <div class="page-content pet-profile-page">
        ${backBtn}
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
          <button class="profile-edit-btn" onclick="App.showEditPetModal('${pet.id}')" style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
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
            <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><path d="M18 2l4 4M7.5 20.5L19 9l-4-4L3.5 16.5 2 22l5.5-1.5z"/></svg>疫苗记录</h3>
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
            <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>驱虫记录</h3>
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
        <div class="auth-logo"><svg class="icon" viewBox="0 0 40 40" style="width:56px;height:56px;"><use href="#icon-logo"/></svg></div>
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
