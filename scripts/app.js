/**
 * 宝宝的第一年 - 主应用入口
 * 负责初始化和协调各模块
 */

import { storageManager } from "./storage-manager.js";
import { router } from "./router.js";
import { stateManager, MONTHS_CONFIG } from "./state-manager.js";
import {
  renderNavigationBar,
  initNavigationInteractions,
  initKeyboardNavigation,
  calculateProgress,
} from "./navigation.js";
import {
  animationController,
  ANIMATION_CONFIG,
} from "./animation-controller.js";
import { photoUploadManager } from "./photo-upload.js";
import { contentEditor } from "./content-editor.js";
import { shareModal } from "./share-modal.js";
import {
  parallaxEffect,
  generateHomeDecorations,
  generateMobileDecorations,
} from "./parallax-effect.js";
import MouseParallax from "./mouse-parallax.js";
import CursorEffects from "./cursor-effects.js";

// 跟踪上一个月份，用于页面切换动画
let previousMonth = null;
let mouseParallaxInstance = null;
let cursorEffectsInstance = null;

/**
 * 更新鼠标视差效果
 * 销毁旧实例并为新页面元素创建新实例
 */
function updateMouseParallax() {
  if (mouseParallaxInstance) {
    mouseParallaxInstance.destroy();
  }

  // 延迟一点初始化，确保 DOM 已就绪
  setTimeout(() => {
    // 检查是否存在视差元素
    if (document.querySelector(".mouse-parallax")) {
      mouseParallaxInstance = new MouseParallax();
    }
  }, 100);
}

/**
 * 渲染首页
 * Requirements: 1.1, 1.3, 1.4
 * 增强：鼠标视差跟随效果，Edge 风格毛玻璃卡片
 */
function renderHomePage() {
  const app = document.getElementById("app");
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // 销毁之前的视差实例
  parallaxEffect.destroy();

  // 先渲染基础结构
  app.innerHTML = `
    <div class="home-page">
      <div class="home-background"></div>

      <div class="home-background"></div>

      <!-- 视差场景容器 -->
      <div class="parallax-scene home-parallax-scene" id="parallax-scene">
        <!-- 装饰卡片将异步加载 -->
      </div>

      <!-- 中心内容: 巨型毛玻璃卡片 -->
      <div class="home-content">
        <div class="home-glass-card">
          <div class="home-logo-icon">✨</div>
          <h1 class="home-title" aria-label="宝宝的第一年">宝宝的第一年</h1>
          <p class="home-subtitle">记录从0到12个月的珍贵时光</p>
          <button
            class="btn btn-primary btn-lg home-cta"
            id="start-journey-btn"
            aria-label="开启之旅，进入宝宝成长记录"
          >
            开启之旅
          </button>
        </div>
      </div>
    </div>
  `;

  // 异步加载装饰卡片
  (async () => {
    const scene = document.getElementById("parallax-scene");
    if (scene) {
      const decorations = isMobile
        ? await generateMobileDecorations()
        : await generateHomeDecorations();
      scene.innerHTML = decorations;

      // 重新初始化视差效果 (Edge 风格)
      parallaxEffect.init(scene);
    }

    // 触发首页加载动画
    requestAnimationFrame(() => {
      initHomeAnimations();
      initHomeInteractions();
      // initHomeParallax(); // 移除旧的调用，直接在上面 init
    });
  })();
}

/**
 * 初始化首页加载动画
 * Requirements: 1.2
 */
function initHomeAnimations() {
  // 标题和按钮延迟出现
  const title = document.querySelector(".home-title");
  const subtitle = document.querySelector(".home-subtitle");
  const ctaBtn = document.querySelector(".home-cta");

  setTimeout(() => {
    if (title) title.classList.add("visible");
  }, 400);

  setTimeout(() => {
    if (subtitle) subtitle.classList.add("visible");
  }, 500);

  setTimeout(() => {
    if (ctaBtn) ctaBtn.classList.add("visible");
  }, 600);
}

/**
 * 初始化首页视差效果
 */
function initHomeParallax() {
  const scene = document.getElementById("parallax-scene");
  if (scene) {
    parallaxEffect.init(scene);
  }
}

/**
 * 初始化首页交互
 * Requirements: 1.5, 1.6
 */
function initHomeInteractions() {
  const startBtn = document.getElementById("start-journey-btn");

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      // 销毁视差效果
      parallaxEffect.destroy();
      // 点击导航到0个月页面
      router.navigate("month", 0);
    });
  }
}

/**
 * 生成动态背景漂浮图标
 * 根据月份阶段生成不同的环境元素
 * @param {number} month
 * @returns {string} HTML 字符串
 */
function generateAmbientIcons(month) {
  const icons = [];
  let iconSet = [];

  if (month <= 3) {
    // 0-3月：安睡梦境
    iconSet = ["🌙", "⭐", "☁️", "🍼", "👶"];
  } else if (month <= 8) {
    // 4-8月：活力探索
    iconSet = ["☀️", "🧸", "🧩", "🎈", "🥁"];
  } else {
    // 9-12月：快乐学步
    iconSet = ["👣", "🎂", "🎁", "👑", "🌈"];
  }

  // 随机生成 6-8 个漂浮图标
  const count = 6 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const icon = iconSet[Math.floor(Math.random() * iconSet.length)];
    const left = Math.random() * 100;
    const duration = 15 + Math.random() * 15; // 15-30s
    const delay = Math.random() * -20; // 负延迟确保立即显示
    const size = 20 + Math.random() * 30; // 20-50px

    icons.push(`
      <div class="float-icon" style="
        left: ${left}%;
        font-size: ${size}px;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
      ">${icon}</div>
    `);
  }

  return `<div class="ambient-layer">${icons.join("")}</div>`;
}

/**
 * 渲染月份页面
 * Requirements: 2.1, 2.3, 2.5
 */
function renderMonthPage(month) {
  const app = document.getElementById("app");
  const config = stateManager.getMonthConfig(month);
  const monthData = stateManager.getMonthData(month);

  if (!config) return;

  // 如果是12个月，渲染总结页
  if (month === 12) {
    renderSummaryPage(config, monthData);
    return;
  }

      <!-- 统一梦幻背景 -->
      <div class="page-background" id="page-background"></div>

      <!-- 动态环境层 -->
      ${ambientIcons}

      <!-- 装饰图片区域 (保持原有视差结构) -->
      <div class="decoration-image decoration-left-top month-decoration mouse-parallax" data-depth="0.2" data-delay="100">
        <div class="decoration-placeholder" style="background: ${config.accentColor}40"></div>
      </div>
      <div class="decoration-image decoration-left-middle month-decoration mouse-parallax" data-depth="0.4" data-delay="200">
        <div class="decoration-placeholder" style="background: ${config.accentColor}30"></div>
      </div>
      <div class="decoration-image decoration-left-bottom month-decoration mouse-parallax" data-depth="0.15" data-delay="300">
        <div class="decoration-placeholder" style="background: ${config.accentColor}40"></div>
      </div>
      <div class="decoration-image decoration-right-top month-decoration mouse-parallax" data-depth="-0.2" data-delay="150">
        <div class="decoration-placeholder" style="background: ${config.accentColor}30"></div>
      </div>
      <div class="decoration-image decoration-right-middle month-decoration mouse-parallax" data-depth="-0.4" data-delay="250">
        <div class="decoration-placeholder" style="background: ${config.accentColor}40"></div>
      </div>
      <div class="decoration-image decoration-right-bottom month-decoration mouse-parallax" data-depth="-0.15" data-delay="350">
        <div class="decoration-placeholder" style="background: ${config.accentColor}30"></div>
      </div>

      <!-- 内容卡片区域 -->
      <article class="page-content" aria-label="${month}个月成长记录">
        <span class="month-tag" aria-label="月份标签">${month}个月</span>
        <h1 class="month-title">${config.title}</h1>
        <p class="month-subtitle">${config.englishTitle}</p>

        <!-- Content Card 组件 -->
        <div class="content-card month-content-card" id="content-card">
          ${renderContentCard(month, config, monthData)}
        </div>
      </article>

      <!-- 导航栏组件 -->
      ${renderNavigationBar(month)}
    </div>
  `;

  // 触发月份页面动画
  requestAnimationFrame(() => {
    initMonthAnimations(month);
    initNavigationInteractions(month);
  });
}

// ... renderSummaryPage (保持不变，或稍后应用同样的 ambientIcons) ...

/**
 * 渲染 Content Card 组件
 * Requirements: 2.3, 12.7, 12.8
 * Update: 使用 Sticker 风格里程碑
 */
function renderContentCard(month, config, monthData) {
  // 优先从 localStorage 读取已保存的数据
  const savedData = storageManager.getMonthData(month);
  const displayData = savedData && savedData.customized ? savedData : null;

  const story = displayData?.story || monthData?.story || config.defaultStory;
  const milestones =
    displayData?.milestones ||
    monthData?.milestones ||
    config.defaultMilestones;

  // 生成当天的日期作为默认寄语日期
  const dateStr = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!-- 照片展示区: PhotoUploadManager 会寻找 #photo-section-{month} 并填充内容 -->
    <!-- 我们在这里只提供容器，具体的 flip-card 结构由 PhotoUploadManager 负责生成 -->
    <div class="card-photo-section" id="photo-section-${month}">
      <!-- 动态内容 -->
    </div>

    <!-- 成长故事区 -->
    <div class="card-story-section">
      <h2 class="story-title">📖 成长故事</h2>
      <p class="story-content">${story}</p>
    </div>

    <!-- 里程碑数据区 (Sticker Style) -->
    <div class="card-milestones-section">
      <h2 class="milestones-title">🏆 成长成就</h2>
      <div class="milestones-grid">
        ${milestones
          .map(
            (m, index) => `
          <div class="sticker-item ${m.completed ? "completed" : ""}" style="--rotation: ${Math.random() * 10 - 5}deg">
            <div class="sticker-check">✓</div>
            <div class="sticker-badge">🏅</div>
            <span class="sticker-label">${m.label}</span>
            ${m.value && m.value !== "待记录" ? `<span class="milestone-value-tag">${m.value}</span>` : ""}
          </div>
        `,
          )
          .join("")}
      </div>
    </div>

    <!-- 编辑按钮 - Requirements: 12.1 -->
    <div class="card-actions">
      <button class="btn btn-secondary edit-btn" aria-label="编辑${month}个月成长记录">
        ✏️ 编辑
      </button>
    </div>
  `;
}

/**
 * 初始化月份页面动画和交互
 * @param {number} month - 当前月份
 */
function initMonthAnimations(month) {
  // 装饰图片依次淡入
  const decorations = document.querySelectorAll(".month-decoration");
  decorations.forEach((el) => {
    const delay = parseInt(el.dataset.delay) || 0;
    setTimeout(() => {
      el.classList.add("visible");
    }, delay);
  });

  // 内容卡片淡入
  const contentCard = document.querySelector(".month-content-card");
  if (contentCard) {
    setTimeout(() => {
      contentCard.classList.add("visible");
    }, 200);
  }

  // 初始化照片上传区域
  const photoSection = document.getElementById(`photo-section-${month}`);
  if (photoSection) {
    photoUploadManager.init(month, photoSection, (photoUrl) => {
      console.log("照片已更新:", photoUrl ? "已上传" : "已删除");
    });
  }

  // 初始化内容编辑器 - Requirements: 12.1
  contentEditor.init(month, (savedData) => {
    console.log("内容已保存:", savedData);
  });

  // 更新鼠标视差
  updateMouseParallax();
}

/**
 * 根据路由渲染页面
 */
function renderPage(page, month) {
  switch (page) {
    case "home":
      renderHomePage();
      break;
    case "month":
      renderMonthPage(month);
      break;
    default:
      renderHomePage();
  }
}

/**
 * 执行带动画的月份切换
 * Requirements: 4.1-4.5
 * @param {number} fromMonth - 起始月份
 * @param {number} toMonth - 目标月份
 */
async function transitionToMonth(fromMonth, toMonth) {
  // 如果正在动画中，跳过
  if (animationController.isTransitioning()) return;

  const background = document.getElementById("page-background");
  const content = document.getElementById("content-card");
  const decorations = document.querySelectorAll(".month-decoration");
  const progress = document.querySelector(".nav-progress-value");

  // 执行页面切换动画序列
  await animationController.transitionToMonth(fromMonth, toMonth, {
    background,
    content,
    decorations,
    progress,
  });

  // 动画完成后渲染新页面
  renderMonthPage(toMonth);
}

/**
 * 处理页面切换（带动画支持）
 * @param {string} page - 页面类型
 * @param {number} month - 月份
 */
async function handlePageChange(page, month) {
  // 如果是月份页面之间的切换，使用动画
  if (page === "month" && previousMonth !== null && previousMonth !== month) {
    await transitionToMonth(previousMonth, month);
  } else {
    // 其他情况直接渲染
    renderPage(page, month);
  }

  // 更新上一个月份记录
  if (page === "month") {
    previousMonth = month;
  } else {
    previousMonth = null;
  }
}

// 应用初始化
document.addEventListener("DOMContentLoaded", () => {
  console.log("宝宝的第一年 - 应用已加载");

  // 初始化路由监听
  router.onRouteChange((page, month) => {
    console.log(`路由变化: ${page}, 月份: ${month}`);
    handlePageChange(page, month);

    if (page === "month") {
      stateManager.setCurrentMonth(month);
      storageManager.saveProgress(month);
    }
  });

  // 订阅状态变化
  stateManager.subscribe((state) => {
    console.log("状态更新:", state);
  });

  // 初始渲染

  renderPage(router.currentPage, router.currentMonth);

  // 初始化键盘导航
  initKeyboardNavigation();

  // 初始化光标特效

  cursorEffectsInstance = new CursorEffects();

  // 初始化 previousMonth

  if (router.currentPage === "month") {
    previousMonth = router.currentMonth;
  }
});

// 导出供全局使用
export {
  storageManager,
  router,
  stateManager,
  MONTHS_CONFIG,
  renderHomePage,
  renderMonthPage,
  animationController,
  photoUploadManager,
  contentEditor,
  shareModal,
  parallaxEffect,
};
