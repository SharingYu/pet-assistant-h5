/* ============================================
   宠物助手 SVG 图标系统
   使用方法: <svg class="icon-[name]" viewBox="0 0 24 24"><use href="#icon-[name]"/></svg>
   或直接插入 SVG 元素
   ============================================ */

/* 插入图标库到页面底部 */
const iconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none;">
  <defs>
    <!-- App Logo: 爪印 -->
    <symbol id="icon-logo" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="#FF9500" opacity="0.15"/>
      <ellipse cx="20" cy="22" rx="8" ry="9" fill="#FF9500"/>
      <circle cx="12" cy="14" r="4" fill="#FF9500"/>
      <circle cx="28" cy="14" r="4" fill="#FF9500"/>
      <circle cx="8" cy="21" r="3.5" fill="#FF9500"/>
      <circle cx="32" cy="21" r="3.5" fill="#FF9500"/>
    </symbol>

    <!-- 首页: 房子 -->
    <symbol id="icon-home" viewBox="0 0 24 24">
      <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </symbol>

    <!-- 诊疗: 听诊器/十字 -->
    <symbol id="icon-stethoscope" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/>
      <path d="M9 12H15M12 9V15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" fill="none"/>
    </symbol>

    <!-- 社区: 聊气泡 -->
    <symbol id="icon-community" viewBox="0 0 24 24">
      <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.6543 20 9.40193 19.7105 8.29176 19.2125C7.70989 18.9273 7.26403 18.4304 7.03439 17.8195C6.80474 17.2086 6.80751 16.5291 7.04221 15.9204C5.16689 14.8105 4 13.0519 4 11C4 6.80558 8.02944 3 12 3C15.9706 3 20 6.80558 20 11C20 11.1382 19.9939 11.2752 19.9819 11.4106C21.0798 11.2248 22.1229 10.8435 23 10.3L23 15C23 15.5523 22.5523 16 22 16L17.586 16L14.707 18.879C14.3166 19.2695 13.6834 19.2695 13.293 18.879L12 17.586L10.707 18.879C10.3166 19.2695 9.68342 19.2695 9.293 18.879L6.414 16L2 16C1.44772 16 1 15.5523 1 15L1 10.3C1.87712 10.8435 2.92021 11.2248 4.01806 11.4106C4.00608 11.2752 4 11.1382 4 11C4 6.80558 8.02944 3 12 3C12.104 3 12.2077 3.00238 12.3108 3.00619" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(1, -1) scale(0.9) translate(-1, 1)"/>
    </symbol>

    <!-- 提醒: 铃铛 -->
    <symbol id="icon-reminder" viewBox="0 0 24 24">
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </symbol>

    <!-- 我的: 用户 -->
    <symbol id="icon-user" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8" fill="none"/>
      <path d="M5 20C5 17.2386 7.23858 15 10 15H14C16.7614 15 19 17.2386 19 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    </symbol>

    <!-- 皮肤问题 -->
    <symbol id="icon-skin" viewBox="0 0 24 24">
      <ellipse cx="12" cy="12" rx="8" ry="6" stroke="currentColor" stroke-width="1.6" fill="none"/>
      <path d="M8 10C8.5 9 9.5 8.5 10 9C10.5 9.5 10 10.5 9 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M14 13C14.5 13.5 15.5 13.5 16 14C15.5 14.5 14 15 13 14.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </symbol>

    <!-- 眼部问题 -->
    <symbol id="icon-eye" viewBox="0 0 24 24">
      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" fill="none"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </symbol>

    <!-- 耳部问题 -->
    <symbol id="icon-ear" viewBox="0 0 24 24">
      <path d="M6 20C6 16 7 13 9 10C11 7 14 5 17 5C18.5 5 19.5 5.5 19.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M6 20C4 18 3 16 3 14C3 11 5 9 6 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M17 5.5C18 6.5 19 8 19 10C19 12 18 14 17 16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    </symbol>

    <!-- 口腔问题 -->
    <symbol id="icon-mouth" viewBox="0 0 24 24">
      <path d="M8 12C8 12 9.5 15 12 15C14.5 15 16 12 16 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M8 12C8 12 9.5 9 12 9C14.5 9 16 12 16 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <line x1="9" y1="12" x2="10" y2="12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="11" y1="12" x2="12" y2="12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="13" y1="12" x2="14" y2="12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </symbol>

    <!-- 消化/排泄问题 -->
    <symbol id="icon-stool" viewBox="0 0 24 24">
      <ellipse cx="12" cy="8" rx="5" ry="3" stroke="currentColor" stroke-width="1.6" fill="none"/>
      <path d="M7 8V13C7 15.2091 9.23858 17 12 17C14.7614 17 17 15.2091 17 13V8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      <path d="M9 17V19C9 19.5523 9.44772 20 10 20H14C14.5523 20 15 19.5523 15 19V17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    </symbol>

    <!-- 行为异常 -->
    <symbol id="icon-behavior" viewBox="0 0 24 24">
      <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" stroke-width="1.6" fill="none"/>
      <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="16" r="1" fill="currentColor"/>
    </symbol>

    <!-- 呼吸问题 -->
    <symbol id="icon-respiratory" viewBox="0 0 24 24">
      <ellipse cx="12" cy="12" rx="4" ry="7" stroke="currentColor" stroke-width="1.6" fill="none"/>
      <path d="M12 5V2M12 22V19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M8 8L6 6M16 8L18 6M8 16L6 18M16 16L18 18" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </symbol>

    <!-- 骨骼问题 -->
    <symbol id="icon-bone" viewBox="0 0 24 24">
      <path d="M5 8L8 5M19 8L16 5M5 16L8 19M19 16L16 19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M8 6L16 18M16 6L8 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="6" cy="6" r="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
      <circle cx="18" cy="6" r="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
      <circle cx="6" cy="18" r="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
      <circle cx="18" cy="18" r="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
    </symbol>

    <!-- 返回箭头 -->
    <symbol id="icon-back" viewBox="0 0 24 24">
      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </symbol>

    <!-- 添加 -->
    <symbol id="icon-add" viewBox="0 0 24 24">
      <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    </symbol>

    <!-- 勾选 -->
    <symbol id="icon-check" viewBox="0 0 24 24">
      <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </symbol>

    <!-- 爱心/点赞 -->
    <symbol id="icon-heart" viewBox="0 0 24 24">
      <path d="M12 21C12 21 4 15.5 4 9.5C4 6.5 6.5 4 9 4C10.7 4 12 5 12 5C12 5 13.3 4 15 4C17.5 4 20 6.5 20 9.5C20 15.5 12 21 12 21Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </symbol>

    <!-- 箭头右 -->
    <symbol id="icon-arrow-right" viewBox="0 0 24 24">
      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </symbol>

    <!-- 图片/图片上传 -->
    <symbol id="icon-image" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.8" fill="none"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
      <path d="M21 15L16 10L8 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </symbol>

    <!-- 宠物类型: 狗 -->
    <symbol id="icon-pet-dog" viewBox="0 0 24 24">
      <ellipse cx="12" cy="14" rx="6" ry="5" stroke="currentColor" stroke-width="1.6" fill="none"/>
      <circle cx="9" cy="8" r="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
      <circle cx="15" cy="8" r="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
      <path d="M5 12L3 9M19 12L21 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="10" cy="13" r="0.8" fill="currentColor"/>
      <circle cx="14" cy="13" r="0.8" fill="currentColor"/>
      <path d="M11 15.5Q12 16.5 13 15.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    </symbol>

    <!-- 宠物类型: 猫 -->
    <symbol id="icon-pet-cat" viewBox="0 0 24 24">
      <ellipse cx="12" cy="14" rx="5" ry="4.5" stroke="currentColor" stroke-width="1.6" fill="none"/>
      <path d="M7 10L5 5L9 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M17 10L19 5L15 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="10" cy="13" r="0.8" fill="currentColor"/>
      <circle cx="14" cy="13" r="0.8" fill="currentColor"/>
      <path d="M12 15.5L12.5 16H11.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
      <path d="M9 17Q12 19 15 17" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    </symbol>

    <!-- 宠物类型: 兔 -->
    <symbol id="icon-pet-rabbit" viewBox="0 0 24 24">
      <ellipse cx="12" cy="15" rx="5" ry="4" stroke="currentColor" stroke-width="1.6" fill="none"/>
      <path d="M9 11L8 4Q9 3 10 5L10 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>
      <path d="M15 11L16 4Q15 3 14 5L14 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>
      <circle cx="10" cy="14" r="0.7" fill="currentColor"/>
      <circle cx="14" cy="14" r="0.7" fill="currentColor"/>
      <path d="M12 16L12 16.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    </symbol>

    <!-- 宠物类型: 仓鼠 -->
    <symbol id="icon-pet-hamster" viewBox="0 0 24 24">
      <ellipse cx="12" cy="13" rx="6" ry="5" stroke="currentColor" stroke-width="1.6" fill="none"/>
      <circle cx="8.5" cy="11" r="1.8" stroke="currentColor" stroke-width="1.2" fill="none"/>
      <circle cx="15.5" cy="11" r="1.8" stroke="currentColor" stroke-width="1.2" fill="none"/>
      <circle cx="10" cy="13" r="0.6" fill="currentColor"/>
      <circle cx="14" cy="13" r="0.6" fill="currentColor"/>
      <path d="M10 15.5Q12 16.5 14 15.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    </symbol>

    <!-- 紧急程度: 低 -->
    <symbol id="icon-level-low" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="#52c41a" stroke-width="1.6" fill="none"/>
      <path d="M8 12L11 15L16 9" stroke="#52c41a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </symbol>

    <!-- 紧急程度: 中 -->
    <symbol id="icon-level-mid" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="#faad14" stroke-width="1.6" fill="none"/>
      <path d="M12 8V12M12 16H12.01" stroke="#faad14" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    </symbol>

    <!-- 紧急程度: 高 -->
    <symbol id="icon-level-high" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="#ff4d4f" stroke-width="1.6" fill="none"/>
      <path d="M12 8V13M12 16H12.01" stroke="#ff4d4f" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    </symbol>
  </defs>
</svg>
`;

// 将图标库注入到页面
document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('beforeend', iconSVG);
});

// 便捷函数：在指定位置插入图标
window.insertIcons = function() {
  if (!document.body.querySelector('svg:last-child') ||
      !document.body.querySelector('svg:last-child').id.includes('logo')) {
    document.body.insertAdjacentHTML('beforeend', iconSVG);
  }
};
