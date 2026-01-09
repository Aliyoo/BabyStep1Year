/**
 * AnimationController - 动画控制器
 * 负责页面切换动画、背景渐变、内容淡入淡出、进度数字动画
 * Requirements: 4.1-4.5
 */

import { MONTHS_CONFIG } from './state-manager.js';

/**
 * 动画配置常量
 */
const ANIMATION_CONFIG = {
  backgroundDuration: 400,    // 背景色渐变过渡时长 (ms) - Requirements: 4.1
  contentFadeOutDuration: 300, // 内容淡出时长 (ms) - Requirements: 4.2
  contentFadeInDuration: 300,  // 内容淡入时长 (ms) - Requirements: 4.3
  decorationDuration: 500,     // 装饰图片过渡时长 (ms) - Requirements: 4.4
  progressAnimationDuration: 400 // 进度数字动画时长 (ms) - Requirements: 4.5
};

/**
 * AnimationController 类
 * 管理所有页面切换相关的动画
 */
class AnimationController {
  constructor() {
    this.isAnimating = false;
  }

  /**
   * 获取月份的渐变背景样式
   * @param {number} month - 月份 (0-12)
   * @returns {string} CSS 渐变字符串
   */
  getMonthGradient(month) {
    const config = MONTHS_CONFIG[month];
    if (!config) return '';
    
    if (config.isRainbow) {
      return `linear-gradient(180deg, ${config.gradient.start}, ${config.gradient.middle}, ${config.gradient.end})`;
    }
    return `linear-gradient(180deg, ${config.gradient.start}, ${config.gradient.end})`;
  }

  /**
   * 执行元素淡出动画
   * Requirements: 4.2
   * @param {HTMLElement} element - 要淡出的元素
   * @param {number} duration - 动画时长 (ms)
   * @returns {Promise<void>}
   */
  fadeOut(element, duration = ANIMATION_CONFIG.contentFadeOutDuration) {
    return new Promise((resolve) => {
      if (!element) {
        resolve();
        return;
      }

      element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
      element.style.opacity = '0';
      element.style.transform = 'translateY(-20px)';

      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  /**
   * 执行元素淡入动画（带缩放效果）
   * Requirements: 4.3
   * @param {HTMLElement} element - 要淡入的元素
   * @param {number} duration - 动画时长 (ms)
   * @returns {Promise<void>}
   */
  fadeIn(element, duration = ANIMATION_CONFIG.contentFadeInDuration) {
    return new Promise((resolve) => {
      if (!element) {
        resolve();
        return;
      }

      // 先设置初始状态
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px) scale(0.95)';
      
      // 强制重绘
      element.offsetHeight;

      element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
      element.style.opacity = '1';
      element.style.transform = 'translateY(0) scale(1)';

      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  /**
   * 执行背景色渐变过渡
   * Requirements: 4.1
   * @param {HTMLElement} backgroundElement - 背景元素
   * @param {number} toMonth - 目标月份
   * @param {number} duration - 动画时长 (ms)
   * @returns {Promise<void>}
   */
  transitionBackground(backgroundElement, toMonth, duration = ANIMATION_CONFIG.backgroundDuration) {
    return new Promise((resolve) => {
      if (!backgroundElement) {
        resolve();
        return;
      }

      const newGradient = this.getMonthGradient(toMonth);
      backgroundElement.style.transition = `background ${duration}ms ease`;
      backgroundElement.style.background = newGradient;

      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  /**
   * 执行装饰图片淡出淡入过渡
   * Requirements: 4.4
   * @param {NodeList|Array} decorations - 装饰图片元素列表
   * @param {number} duration - 动画时长 (ms)
   * @returns {Promise<void>}
   */
  transitionDecorations(decorations, duration = ANIMATION_CONFIG.decorationDuration) {
    return new Promise((resolve) => {
      if (!decorations || decorations.length === 0) {
        resolve();
        return;
      }

      const halfDuration = duration / 2;

      // 淡出
      decorations.forEach((el) => {
        el.style.transition = `opacity ${halfDuration}ms ease`;
        el.style.opacity = '0';
      });

      // 淡入
      setTimeout(() => {
        decorations.forEach((el, index) => {
          const delay = index * 50; // 依次淡入
          setTimeout(() => {
            el.style.transition = `opacity ${halfDuration}ms ease`;
            el.style.opacity = '1';
          }, delay);
        });
      }, halfDuration);

      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  /**
   * 执行进度数字计数动画
   * Requirements: 4.5
   * @param {HTMLElement} progressElement - 进度显示元素
   * @param {number} fromProgress - 起始进度 (0-100)
   * @param {number} toProgress - 目标进度 (0-100)
   * @param {number} duration - 动画时长 (ms)
   * @returns {Promise<void>}
   */
  animateProgress(progressElement, fromProgress, toProgress, duration = ANIMATION_CONFIG.progressAnimationDuration) {
    return new Promise((resolve) => {
      if (!progressElement) {
        resolve();
        return;
      }

      const startTime = performance.now();
      const diff = toProgress - fromProgress;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用 easeOutCubic 缓动函数
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(fromProgress + diff * easeProgress);
        
        progressElement.textContent = `${currentValue}%`;
        progressElement.dataset.progress = currentValue;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * 执行完整的月份切换动画序列
   * Requirements: 4.1-4.5
   * @param {number} fromMonth - 起始月份
   * @param {number} toMonth - 目标月份
   * @param {Object} elements - 页面元素引用
   * @param {HTMLElement} elements.background - 背景元素
   * @param {HTMLElement} elements.content - 内容卡片元素
   * @param {NodeList} elements.decorations - 装饰图片元素
   * @param {HTMLElement} elements.progress - 进度显示元素
   * @returns {Promise<void>}
   */
  async transitionToMonth(fromMonth, toMonth, elements) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const { background, content, decorations, progress } = elements;
    const fromProgress = Math.round((fromMonth / 12) * 100);
    const toProgress = Math.round((toMonth / 12) * 100);

    try {
      // 1. 开始背景渐变过渡 (同时进行)
      const backgroundPromise = this.transitionBackground(background, toMonth);

      // 2. 内容淡出
      await this.fadeOut(content);

      // 3. 装饰图片过渡 (与背景同时)
      const decorationPromise = this.transitionDecorations(decorations);

      // 4. 等待背景过渡完成
      await backgroundPromise;

      // 5. 进度数字动画
      this.animateProgress(progress, fromProgress, toProgress);

      // 6. 等待装饰图片过渡完成
      await decorationPromise;

    } finally {
      this.isAnimating = false;
    }
  }

  /**
   * 准备内容淡入（在新内容渲染后调用）
   * @param {HTMLElement} content - 内容元素
   * @returns {Promise<void>}
   */
  async prepareContentFadeIn(content) {
    if (!content) return;
    
    // 设置初始状态
    content.style.opacity = '0';
    content.style.transform = 'translateY(20px) scale(0.95)';
    
    // 强制重绘
    content.offsetHeight;
    
    // 执行淡入
    await this.fadeIn(content);
  }

  /**
   * 检查是否正在执行动画
   * @returns {boolean}
   */
  isTransitioning() {
    return this.isAnimating;
  }

  /**
   * 重置动画状态
   */
  reset() {
    this.isAnimating = false;
  }
}

// 导出单例（浏览器环境）
let animationController;
if (typeof window !== 'undefined') {
  animationController = new AnimationController();
}

// ES Module 导出
export { AnimationController, animationController, ANIMATION_CONFIG };
