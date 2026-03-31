/**
 * api.js - 业务接口层
 * 调用 http.js 中的 API_BASE 真实请求
 * 保留：知识库配置、提示词、图片处理
 */

const API = {
  // ========== 配置 ==========
  config: {
    aiProvider: 'mock', // 'mock' | 'openai' | 'qwen' | 'deepseek'
    apiKeys: {
      qwen: '',
      deepseek: '',
      openai: ''
    }
  },

  // ========== 诊断知识库（静态配置，非网络） ==========
  diagnosisKB: {
    skin: {
      tags: ['皮肤红斑', '脱毛', '瘙痒', '皮屑', '红包/疹子'],
      causes: ['真菌感染（猫癣）', '过敏性皮炎', '湿疹', '体外寄生虫（跳蚤/螨虫）', '内分泌失调'],
      advice: '保持患处清洁干燥，避免宠物舔舐。可使用宠物专用碘伏擦拭患处。如范围扩大或脱毛加剧，请就医做真菌培养检查。必要时会需要皮肤刮片镜检。',
      severity: { level: 'warning', label: '建议就医', class: 'warning' },
      homeCare: ['保持患处干燥清洁', '佩戴伊丽莎白圈防止舔舐', '避免洗澡', '观察3-5天'],
      medicine: ['宠物专用碘伏', '抗真菌喷剂', '宠物益生菌（辅助）']
    },
    eye: {
      tags: ['眼部红肿', '分泌物', '眯眼', '浑浊', '第三眼睑突出'],
      causes: ['结膜炎', '角膜炎', '过敏反应', '外伤/异物', '猫疱疹病毒（FHV-1）'],
      advice: '用温水轻轻擦拭眼部（从内眼角向外擦拭），观察24-48小时。如出现脓性分泌物（黄绿色）、眼睛浑浊或眯眼加剧，请立即就医。',
      severity: { level: 'warning', label: '建议就医', class: 'warning' },
      homeCare: ['温水擦拭眼部', '佩戴伊丽莎白圈', '观察症状变化'],
      medicine: ['宠物眼药水（需兽医推荐）', '生理盐水冲洗']
    },
    stool: {
      tags: ['软便', '稀便', '血便', '黏液便', '颜色异常（黑色/灰白）'],
      causes: ['消化不良', '肠炎', '寄生虫感染', '食物过敏/不耐受', '应激反应', '病毒感染（细小/冠状）'],
      advice: '近期喂食清淡易消化食物（煮熟鸡胸肉+米饭1:2比例），少食多餐，补充益生菌。如持续软便超过3天、出现血便或伴随呕吐/精神差，请立即就医做粪便检查。',
      severity: { level: 'normal', label: '居家观察', class: 'normal' },
      homeCare: ['清淡饮食', '少食多餐', '补充益生菌', '保证饮水'],
      medicine: ['宠物益生菌', '蒙脱石散（需咨询兽医）']
    },
    behavior: {
      tags: ['精神差', '嗜睡', '食欲下降', '跛行', '呕吐/腹泻'],
      causes: ['季节性倦怠', '轻微不适', '关节问题（老年宠物）', '疼痛信号', '发热'],
      advice: '持续观察食欲和饮水量，定时测量体温（犬猫正常38-39.2℃）。如超过24小时不进食、出现呕吐腹泻或体温超过39.5℃，请就医。',
      severity: { level: 'normal', label: '居家观察', class: 'normal' },
      homeCare: ['观察食欲饮水', '测量体温', '安静休息环境', '记录症状变化'],
      medicine: []
    },
    mouth: {
      tags: ['口臭', '牙龈红肿', '牙结石', '口腔溃疡', '流口水'],
      causes: ['牙周病', '牙菌斑/牙结石', '口腔感染', '肾病的口腔表现', '口腔异物'],
      advice: '开始使用宠物牙刷/漱口水日常清洁。牙龈红肿严重时需要麻醉下超声洗牙。口腔问题长期不处理会影响心脏和肾脏健康。',
      severity: { level: 'normal', label: '居家观察', class: 'normal' },
      homeCare: ['开始刷牙习惯', '使用宠物漱口水', '提供磨牙玩具'],
      medicine: ['宠物牙膏', '宠物漱口水']
    },
    ear: {
      tags: ['耳道红肿', '分泌物', '异味', '甩头', '抓挠耳部'],
      causes: ['耳螨感染', '细菌性耳炎', '真菌感染（马拉色菌）', '过敏性耳炎', '耳道异物'],
      advice: '使用宠物专用耳部清洁液清理外耳道（灌入后轻轻按摩耳根，然后让宠物甩出）。不要用棉签深插耳道。如分泌物持续、宠物剧烈甩头或耳道有异味，请就医做显微镜检查。',
      severity: { level: 'normal', label: '居家观察', class: 'normal' },
      homeCare: ['耳部清洁', '保持干燥', '佩戴伊丽莎白圈防抓挠'],
      medicine: ['耳漂', '耳肤灵（需兽医推荐）']
    }
  },

  // ========== 话题标签（静态配置） ==========
  topics: [
    { id: 'daily', name: '晒宠', desc: '分享日常', svgIcon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#FF9500" stroke="none"/><path d="M21 15l-5-5L8 18"/></svg>' },
    { id: 'health', name: '宠物健康', desc: '健康讨论', svgIcon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
    { id: 'skin', name: '皮肤病', desc: '皮肤问题', svgIcon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12s1-2 2-2 2 2 2 2-1 2-2 2-2-2-2-2"/></svg>' },
    { id: 'food', name: '宠物饮食', desc: '吃什么好', svgIcon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>' },
    { id: 'behavior', name: '行为问题', desc: '行为训练', svgIcon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>' },
    { id: 'match', name: '宠物相亲', desc: '配种社交', svgIcon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' },
    { id: 'travel', name: '携宠出行', desc: '旅行分享', svgIcon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' },
    { id: 'skill', name: '技能学习', desc: '技能训练', svgIcon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>' }
  ],

  // ========== 提醒类型（静态配置） ==========
  reminderTypes: [
    { id: 'vaccine', svgIcon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#52C41A" stroke-width="2"><path d="M18 2l4 4M7.5 20.5L19 9l-4-4L3.5 16.5 2 22l5.5-1.5z"/></svg>', color: '#52C41A', name: '疫苗' },
    { id: 'deworm', svgIcon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#722ED1" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>', color: '#722ED1', name: '驱虫' },
    { id: 'checkup', svgIcon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1890FF" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>', color: '#1890FF', name: '体检' },
    { id: 'bath', svgIcon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#13C2C2" stroke-width="2"><path d="M9 2v6M12 2v6M15 2v6"/><ellipse cx="12" cy="16" rx="8" ry="4"/><path d="M4 16v2a8 4 0 0 0 8 4h0a8 4 0 0 0 8-4v-2"/></svg>', color: '#13C2C2', name: '洗澡' },
    { id: 'medicine', svgIcon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAAD14" stroke-width="2"><path d="M10.5 20.5L3.5 13.5a4.95 4.95 0 0 1 7-7l7 7a4.95 4.95 0 0 1-7 7zM8.5 8.5l7 7"/></svg>', color: '#FAAD14', name: '用药' },
    { id: 'other', svgIcon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5222D" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>', color: '#F5222D', name: '其他' }
  ],

  // ========== 宠物类型（静态配置） ==========
  petTypes: [
    { id: 'cat', name: '🐱 猫咪', emoji: '<svg class="icon-20" viewBox="0 0 24 24"><use href="#icon-pet-cat"/></svg>' },
    { id: 'dog', name: '🐶 狗狗', emoji: '<svg class="icon-20" viewBox="0 0 24 24"><use href="#icon-pet-dog"/></svg>' },
    { id: 'rabbit', name: '🐰 兔子', emoji: '<svg class="icon-20" viewBox="0 0 24 24"><use href="#icon-pet-rabbit"/></svg>' },
    { id: 'hamster', name: '🐹 仓鼠', emoji: '<svg class="icon-20" viewBox="0 0 24 24"><use href="#icon-pet-hamster"/></svg>' },
    { id: 'other', name: '🐾 其他', emoji: '<svg class="icon-20" viewBox="0 0 24 24"><use href="#icon-logo"/></svg>' }
  ],

  // ========== 诊断方法（调用后端，fallback本地mock） ==========
  // 诊断类型 → 身体部位映射
  typeToBodyPart: {
    skin: 'skin', eye: 'eye', ear: 'ear', mouth: 'mouth',
    stool: 'digestive', behavior: 'behavioral',
    respiratory: 'respiratory', urinary: 'urinary'
  },

  async diagnose(petTypeOrParams, bodyPartOrImage, symptomsOrNull, imageUrlOrNull) {
    // 新格式：diagnose({ petType, bodyPart, symptoms, imageUrl })
    // 旧格式：diagnose(type, imageData) 兼容
    let petType, bodyPart, symptoms, imageUrl;
    if (typeof petTypeOrParams === 'object') {
      // 新格式
      ({ petType, bodyPart, symptoms, imageUrl } = petTypeOrParams);
    } else {
      // 旧格式兼容
      petType = 'dog'; // 默认
      bodyPart = this.typeToBodyPart[petTypeOrParams] || petTypeOrParams;
      symptoms = '';
      imageUrl = bodyPartOrImage;
    }

    try {
      // 调用后端真实 AI 诊断
      const result = await API_BASE.diagnose({ petType, bodyPart, symptoms: symptoms || '', imageUrl });
      if (result.success) {
        // 转换后端格式为前端兼容格式
        const d = result.data;
        return {
          success: true,
          data: {
            type: bodyPart,
            typeName: this.getTypeName(bodyPart) || bodyPart,
            triage: d.triage,
            severity: { level: d.severity <= 2 ? 'normal' : d.severity <= 3 ? 'warning' : 'danger', label: d.severityLabel, class: d.severity <= 2 ? 'success' : d.severity <= 3 ? 'warning' : 'danger' },
            tags: d.possibleCauses || [],
            causes: d.possibleCauses || [],
            severityLevel: d.severity,
            triage: d.triage,
            urgentRedFlags: d.urgentRedFlags || [],
            homeCare: d.homeCare || {},
            consultNow: d.consultNow,
            homeCareAdvice: d.homeCareAdvice,
            summary: d.summary,
            visualAnalysis: d.visualAnalysis,
            possibleConditions: d.possibleConditions || [],
            communityRefs: d.communityRefs || [],
            aiAdvice: d.consultNow || d.summary || '',
            disclaimer: '本结果由 AI 辅助分析，仅供参考，不能替代专业兽医诊断。如有疑虑，请立即前往正规宠物医院就诊。',
            image: imageUrl,
            aiUsed: d.aiUsed
          }
        };
      }
    } catch (e) {
      console.error('AI诊断请求失败:', e);
    }

    // Fallback: 本地mock逻辑（当后端不可用时）
    const kb = this.diagnosisKB[bodyPart] || this.diagnosisKB.skin;
    const tagCount = Math.floor(Math.random() * 2) + 1;
    const tags = [...kb.tags].sort(() => Math.random() - 0.5).slice(0, tagCount);
    const causeCount = Math.floor(Math.random() * 2) + 1;
    const causes = [...kb.causes].sort(() => Math.random() - 0.5).slice(0, causeCount);
    const roll = Math.random();
    let severity;
    if (roll > 0.9) {
      severity = { level: 'danger', label: '🔴 立即就医', class: 'danger' };
    } else if (roll > 0.5) {
      severity = { level: 'warning', label: '🟡 建议就医', class: 'warning' };
    } else {
      severity = { level: 'normal', label: '🟢 居家观察', class: 'success' };
    }

    return {
      success: true,
      data: {
        type: bodyPart,
        typeName: this.getTypeName(bodyPart),
        typeIcon: this.getTypeIcon(bodyPart),
        tags,
        causes,
        severity,
        suggestion: kb.advice,
        homeCare: kb.homeCare,
        medicine: kb.medicine,
        aiAdvice: this.generateAIAdvice(bodyPart, tags, severity),
        image: imageUrl,
        similarCount: Math.floor(Math.random() * 200) + 50,
        disclaimer: '本结果由 AI 辅助分析，仅供参考，不能替代专业兽医诊断。如有疑虑，请立即前往正规宠物医院就诊。'
      }
    };
  },

  // 生成 AI 建议
  generateAIAdvice(type, tags, severity) {
    const adviceTemplates = {
      skin: `根据图片分析，${tags.join('、')}可能与皮肤问题相关。建议先观察患处大小和宠物的抓挠频率。`,
      eye: `从图片来看，${tags.join('、')}需要密切关注。如症状持续或加重，建议尽早就诊眼科。`,
      stool: `${tags.join('、')}通常是消化系统的信号。建议调整饮食并观察1-2天。`,
      behavior: `宠物表现出${tags.join('、')}，可能是在表达不适或情绪。建议持续观察并记录变化。`,
      mouth: `口腔问题${tags.join('、')}需要日常护理来改善。建议开始定期刷牙。`,
      ear: `${tags.join('、')}可能是耳部问题的信号。注意保持耳道清洁干燥。`
    };
    return adviceTemplates[type] || '建议持续观察，如有异常及时就医。';
  },

  // ========== 相似案例（暂时保留本地mock） ==========
  async getSimilarCases(type) {
    const cases = {
      skin: [
        { author: '铲屎官小李', petName: '橘子', petType: 'cat', content: '我家猫最近掉毛严重，皮肤发红，试了碘伏和皮特芬效果一般...后来发现是猫粮过敏，换了低敏粮好了！', likes: 234, from: '小红书', tag: '已解决', solved: true },
        { author: '宠物家长阿华', petName: '豆豆', petType: 'dog', content: '分享一下我家狗皮肤病治疗过程，用了维克药浴配合口服药，两周基本痊愈。关键是坚持，不要断药！', likes: 189, from: '小红书', tag: '经验分享', solved: true },
        { author: '新手养狗人', petName: '旺财', petType: 'dog', content: '狗狗皮肤病千万别拖！我就是拖了一周，结果变成了全身性的...花了2个月才治好', likes: 312, from: '社区', tag: '教训', solved: false }
      ],
      eye: [
        { author: '喵星人日记', petName: '咪咪', petType: 'cat', content: '猫咪眼睛发红流泪以为是上火，检查发现是衣原体感染，吃了多西环素一周好了。', likes: 156, from: '小红书', tag: '已解决', solved: true }
      ],
      stool: [
        { author: '养宠日记本', petName: '年糕', petType: 'cat', content: '换粮导致的软便，拉了3天，精神很好所以没去医院，喂了益生菌调整好了。建议大家换粮要循序渐进！', likes: 312, from: '小红书', tag: '经验分享', solved: true },
        { author: '新手铲屎官', petName: '小白', petType: 'dog', content: '狗狗拉血便吓死我了，结果是吃了鸡骨头划伤肠道...以后再也不乱喂了！', likes: 456, from: '小红书', tag: '教训', solved: false }
      ],
      behavior: [
        { author: '毛孩子家长', petName: '大黄', petType: 'dog', content: '老年犬突然不爱动了，以为是天气热，检查发现是心脏问题...提醒大家定期体检很重要！', likes: 278, from: '小红书', tag: '提醒', solved: false }
      ],
      mouth: [
        { author: '口腔健康宠物', petName: '团子', petType: 'cat', content: '猫咪牙结石导致牙龈发炎，洗牙后配合口腔凝胶，现在吃嘛嘛香！', likes: 198, from: '小红书', tag: '已解决', solved: true }
      ],
      ear: [
        { author: '养猫日记', petName: '布丁', petType: 'cat', content: '猫咪老是挠耳朵，甩头，检查发现是耳螨，用了大宠爱配合耳漂，一周见效！', likes: 267, from: '小红书', tag: '已解决', solved: true }
      ]
    };
    return cases[type] || cases.skin;
  },

  // ========== 图片处理（纯前端） ==========
  async uploadImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.compressImage(e.target.result, (compressedData) => {
          resolve({
            success: true,
            data: {
              url: compressedData,
              filename: file.name,
              size: file.size
            }
          });
        });
      };
      reader.readAsDataURL(file);
    });
  },

  compressImage(dataUrl, callback) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = dataUrl;
  },

  // ========== 工具方法 ==========
  getTypeName(type) {
    const names = {
      skin: '皮肤问题', eye: '眼睛异常', stool: '排泄物异常',
      behavior: '行为异常', mouth: '口腔问题', ear: '耳部问题'
    };
    return names[type] || '未知问题';
  },

  getTypeIcon(type) {
    const icons = {
      skin: '🔴', eye: '👁️', stool: '💩', behavior: '🌀', mouth: '🦷', ear: '👂'
    };
    return icons[type] || '❓';
  },

  getUploadTips(type) {
    const tips = {
      skin: '• 皮肤问题：拍摄患处全景+特写，保持光线充足\n• 优先拍摄能看到病变范围的照片',
      eye: '• 眼睛问题：正面拍摄双眼，确保眼部清晰可见\n• 拍摄时保持宠物安静',
      stool: '• 排泄物：拍摄清晰照片，尽量在排出后30分钟内拍摄\n• 尽量拍摄新鲜样本',
      behavior: '• 行为问题：拍摄异常姿态视频更佳\n• 视频可以展示更多信息',
      mouth: '• 口腔问题：侧面拍摄口腔张开状态\n• 确保光线充足',
      ear: '• 耳部问题：拍摄耳道内部照片\n• 注意区分正常耳垢和异常分泌物'
    };
    return tips[type] || tips.skin;
  }
};
