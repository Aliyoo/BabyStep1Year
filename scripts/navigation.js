/**
 * Navigation Bar 组件
 * 固定底部导航栏，包含上/下月按钮和进度指示
 * Requirements: 3.1, 3.4, 3.5
 */

import { router } from './router.js';

/**
 * 计算进度百分比
 * @param {number} month - 当前月份 (0-12)
 * @returns {number} 进度百分比 (0-100)
 */
export function calculateProgress(month) {
  return Math.round((month / 12) * 100);
}

/**
 * 检查是否可以导航到上一个月
 * @param {number} month - 当前月份
 * @returns {boolean}
 */
export function canNavigatePrev(month) {
  return month > 0;
}

/**
 * 检查是否可以导航到下一个月
 * @param {number} month - 当前月份
 * @returns {boolean}
 */
export function canNavigateNext(month) {
  return month < 12;
}

/**
 * 导航到上一个月
 * Requirements: 3.3
 * @param {number} currentMonth - 当前月份
 */
export function navigateToPrevMonth(currentMonth) {
  if (canNavigatePrev(currentMonth)) {
    router.navigate('month', currentMonth - 1);
  }
}

/**
 * 导航到下一个月
 * Requirements: 3.2
 * @param {number} currentMonth - 当前月份
 */
export function navigateToNextMonth(currentMonth) {
  if (canNavigateNext(currentMonth)) {
    router.navigate('month', currentMonth + 1);
  }
}

/**
 * 渲染导航栏 HTML
 * Requirements: 3.1, 3.4, 3.5
 * @param {number} month - 当前月份 (0-12)
 * @returns {string} 导航栏 HTML
 */
export function renderNavigationBar(month) {
  const progress = calculateProgress(month);
  const prevDisabled = !canNavigatePrev(month);
  const nextDisabled = !canNavigateNext(month);

  return `
    <div class="navigation-bar" role="navigation">
      <span class="nav-label">Start</span>
      
      <button 
        class="nav-btn nav-prev" 
        aria-label="上一个月"
        ${prevDisabled ? 'disabled aria-disabled="true"' : ''}
      >
        <span>←</span>
      </button>
      
      <div class="nav-progress" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
        <div class="nav-progress-bar" onclick="void(0)">
            <div class="nav-progress-value" style="width: ${progress}%"></div>
        </div>
      </div>
      
      <button 
        class="nav-btn nav-next" 
        aria-label="下一个月"
        ${nextDisabled ? 'disabled aria-disabled="true"' : ''}
      >
        <span>→</span>
      </button>

      <span class="nav-label">1st Year</span>
    </div>
  `;
}

/**
 * 初始化导航栏交互
 * @param {number} month - 当前月份
 */
export function initNavigationInteractions(month) {
  const prevBtn = document.querySelector('.nav-prev');
  const nextBtn = document.querySelector('.nav-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      navigateToPrevMonth(month);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      navigateToNextMonth(month);
    });
  }
}

/**
 * 初始化键盘导航
 * @description 允许使用左右方向键切换月份
 */
export function initKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // 忽略在输入框或可编辑元素中的按键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    // 只在月份页面响应键盘导航
    if (router.currentPage === 'month') {
      if (e.key === 'ArrowLeft') {
        router.prevMonth();
      } else if (e.key === 'ArrowRight') {
        router.nextMonth();
      }
    }
  });
}

/**
 * 更新导航栏状态
 * @param {number} month - 当前月份
 */
export function updateNavigationState(month) {
  const prevBtn = document.querySelector('.nav-prev');
  const nextBtn = document.querySelector('.nav-next');
  const progressValue = document.querySelector('.nav-progress-value');

  if (prevBtn) {
    prevBtn.disabled = !canNavigatePrev(month);
    prevBtn.setAttribute('aria-disabled', !canNavigatePrev(month));
  }

  if (nextBtn) {
    nextBtn.disabled = !canNavigateNext(month);
    nextBtn.setAttribute('aria-disabled', !canNavigateNext(month));
  }

  if (progressValue) {
    const progress = calculateProgress(month);
    // 更新宽度而不是 textContent
    progressValue.style.width = `${progress}%`;
    progressValue.dataset.progress = progress;
  }
}
