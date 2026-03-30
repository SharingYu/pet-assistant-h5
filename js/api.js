/**
 * API - 模拟 API 服务
 * 支持 Mock 数据，未来可替换为真实 API
 */

const API = {
  // 诊断知识库
  diagnosisKB: {
    skin: {
      tags: ['皮肤红斑', '脱毛', '瘙痒', '皮屑'],
      causes: ['真菌感染（猫癣）', '过敏性皮炎', '湿疹', '体外寄生虫'],
      advice: '保持患处清洁干燥，避免宠物舔舐。可使用宠物专用碘伏擦拭。如范围扩大或脱毛加剧，请就医做真菌培养检查。',
      severity: { level: 'warning', label: '建议就医', class: 'warning' }
    },
    eye: {
      tags: ['眼部红肿', '分泌物', '眯眼', '浑浊'],
      causes: ['结膜炎', '角膜炎', '过敏反应', '外伤'],
      advice: '用温水轻轻擦拭眼部，观察24-48小时。如出现脓性分泌物、眼睛浑浊或眯眼加剧，请立即就医。',
      severity: { level: 'warning', label: '建议就医', class: 'warning' }
    },
    stool: {
      tags: ['软便', '稀便', '颜色异常'],
      causes: ['消化不良', '肠炎', '寄生虫感染', '食物过敏'],
      advice: '近期喂食清淡易消化食物（煮熟鸡胸肉+米饭），补充益生菌。如持续软便超过3天或出现血便，请做粪便检查。',
      severity: { level: 'normal', label: '居家观察', class: 'success' }
    },
    behavior: {
      tags: ['精神差', '嗜睡', '食欲下降'],
      causes: ['季节性倦怠', '轻微不适', '关节问题', '老年宠物正常老化'],
      advice: '持续观察食欲和饮水量，测量体温（犬猫正常38-39.2℃）。如超过24小时不进食或出现呕吐、腹泻，请就医。',
      severity: { level: 'normal', label: '居家观察', class: 'success' }
    },
    mouth: {
      tags: ['口臭', '牙龈红肿', '牙结石'],
      causes: ['牙周病', '牙菌斑', '口腔感染'],
      advice: '开始使用宠物牙刷/漱口水日常清洁。牙龈红肿可能需要麻醉下洗牙处理。口腔问题严重时会影响心脏和肾脏。',
      severity: { level: 'normal', label: '居家观察', class: 'success' }
    },
    ear: {
      tags: ['耳道红肿', '分泌物', '异味', '甩头'],
      causes: ['耳螨感染', '细菌性耳炎', '真菌感染'],
      advice: '使用宠物专用耳部清洁液清理外耳道，不要用棉签深插。如分泌物持续或宠物剧烈甩头，请就医做显微镜检查。',
      severity: { level: 'normal', label: '居家观察', class: 'success' }
    }
  },
  
  // 话题标签
  topics: [
    { id: 'daily', name: '#晒宠#', desc: '分享日常' },
    { id: 'health', name: '#宠物健康#', desc: '健康讨论' },
    { id: 'skin', name: '#皮肤病#', desc: '皮肤问题' },
    { id: 'food', name: '#宠物饮食#', desc: '吃什么好' },
    { id: 'behavior', name: '#行为问题#', desc: '行为训练' }
  ],
  
  // 提醒类型
  reminderTypes: [
    { id: 'vaccine', icon: '💉', color: '#52C41A', name: '疫苗' },
    { id: 'deworm', icon: '💊', color: '#722ED1', name: '驱虫' },
    { id: 'checkup', icon: '🏥', color: '#1890FF', name: '体检' },
    { id: 'bath', icon: '🛁', color: '#13C2C2', name: '洗澡' },
    { id: 'medicine', icon: '💊', color: '#FAAD14', name: '用药' },
    { id: 'other', icon: '📌', color: '#F5222D', name: '其他' }
  ],
  
  // 宠物类型
  petTypes: [
    { id: 'cat', name: '🐱 猫咪', emoji: '🐱' },
    { id: 'dog', name: '🐶 狗狗', emoji: '🐶' },
    { id: 'rabbit', name: '🐰 兔子', emoji: '🐰' },
    { id: 'hamster', name: '🐹 仓鼠', emoji: '🐹' },
    { id: 'other', name: '🐾 其他', emoji: '🐾' }
  ],
  
  // AI 诊断（Mock）
  async diagnose(type, imageData) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const kb = this.diagnosisKB[type] || this.diagnosisKB.skin;
    
    // 随机选择标签和原因
    const tagCount = Math.floor(Math.random() * 2) + 1;
    const tags = [...kb.tags].sort(() => Math.random() - 0.5).slice(0, tagCount);
    
    const causeCount = Math.floor(Math.random() * 2) + 1;
    const causes = [...kb.causes].sort(() => Math.random() - 0.5).slice(0, causeCount);
    
    // 随机严重程度（主要是 normal 和 warning）
    const roll = Math.random();
    let severity;
    if (roll > 0.9) {
      severity = { level: 'danger', label: '立即就医', class: 'danger' };
    } else if (roll > 0.5) {
      severity = { level: 'warning', label: '建议就医', class: 'warning' };
    } else {
      severity = { level: 'normal', label: '居家观察', class: 'success' };
    }
    
    return {
      success: true,
      data: {
        type,
        typeName: this.getTypeName(type),
        typeIcon: this.getTypeIcon(type),
        tags,
        causes,
        severity,
        suggestion: kb.advice,
        aiAdvice: kb.advice,
        image: imageData,
        similarCount: Math.floor(Math.random() * 200) + 50
      }
    };
  },
  
  // 获取类型名称
  getTypeName(type) {
    const names = {
      skin: '皮肤问题',
      eye: '眼睛异常',
      stool: '排泄物异常',
      behavior: '行为异常',
      mouth: '口腔问题',
      ear: '耳部问题'
    };
    return names[type] || '未知问题';
  },
  
  // 获取类型图标
  getTypeIcon(type) {
    const icons = {
      skin: '🔴',
      eye: '👁️',
      stool: '💩',
      behavior: '🌀',
      mouth: '🦷',
      ear: '👂'
    };
    return icons[type] || '❓';
  },
  
  // 获取相似案例（Mock）
  async getSimilarCases(type) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const cases = {
      skin: [
        { author: '铲屎官小李', petName: '橘子', petType: 'cat', content: '我家猫最近掉毛严重，皮肤发红，试了碘伏和皮特芬效果一般...后来发现是猫粮过敏，换了低敏粮好了！', likes: 234, from: '小红书', tag: '已解决' },
        { author: '宠物家长阿华', petName: '豆豆', petType: 'dog', content: '分享一下我家狗皮肤病治疗过程，用了维克药浴配合口服药，两周基本痊愈。关键是要坚持！', likes: 189, from: '小红书', tag: '经验分享' }
      ],
      eye: [
        { author: '喵星人日记', petName: '咪咪', petType: 'cat', content: '猫咪眼睛发红流泪以为是上火，检查发现是衣原体感染，吃了多西环素一周好了。', likes: 156, from: '小红书', tag: '已解决' }
      ],
      stool: [
        { author: '养宠日记本', petName: '年糕', petType: 'cat', content: '换粮导致的软便，拉了3天，精神很好所以没去医院，喂了益生菌调整好了。建议大家换粮要循序渐进！', likes: 312, from: '小红书', tag: '经验分享' },
        { author: '新手铲屎官', petName: '小白', petType: 'dog', content: '狗狗拉血便吓死我了，结果是吃了鸡骨头划伤肠道...以后再也不乱喂了！', likes: 456, from: '小红书', tag: '教训' }
      ],
      behavior: [
        { author: '毛孩子家长', petName: '大黄', petType: 'dog', content: '老年犬突然不爱动了，以为是天气热，检查发现是心脏问题...提醒大家定期体检很重要！', likes: 278, from: '小红书', tag: '提醒' }
      ],
      mouth: [
        { author: '口腔健康宠物', petName: '团子', petType: 'cat', content: '猫咪牙结石导致牙龈发炎，洗牙后配合口腔凝胶，现在吃嘛嘛香！', likes: 198, from: '小红书', tag: '已解决' }
      ],
      ear: [
        { author: '养猫日记', petName: '布丁', petType: 'cat', content: '猫咪老是挠耳朵，甩头，检查发现是耳螨，用了大宠爱配合耳漂，一周见效！', likes: 267, from: '小红书', tag: '已解决' }
      ]
    };
    
    return cases[type] || cases.skin;
  },
  
  // 上传图片（Mock）
  async uploadImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          success: true,
          data: {
            url: e.target.result,
            filename: file.name
          }
        });
      };
      reader.readAsDataURL(file);
    });
  },
  
  // 获取提示文本
  getUploadTips(type) {
    const tips = {
      skin: '• 皮肤问题：拍摄患处全景+特写，保持光线充足',
      eye: '• 眼睛问题：正面拍摄双眼，确保眼部清晰可见',
      stool: '• 排泄物：拍摄清晰照片，尽量在排出后30分钟内拍摄',
      behavior: '• 行为问题：拍摄异常姿态视频更佳',
      mouth: '• 口腔问题：侧面拍摄口腔张开状态',
      ear: '• 耳部问题：拍摄耳道内部照片'
    };
    return tips[type] || tips.skin;
  }
};
