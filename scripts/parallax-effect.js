/**
 * ParallaxEffect - 鼠标/陀螺仪视差效果管理器
 */

import { storageManager } from "./storage-manager.js";

// 默认宝宝图片占位符 (使用 Picsum Photos 保证稳定性)
// 每个 URL 加不同的随机种子以避免重复
const DEFAULT_BABY_IMAGES = Array.from(
  { length: 13 },
  (_, i) => `https://picsum.photos/seed/baby${i}/400/300`,
);

export const parallaxEffect = {
  container: null,
  layers: [],
  mouseX: 0,
  mouseY: 0,
  targetX: 0,
  targetY: 0,
  animationId: null,
  isActive: false,
  isMobile: false,

  init(container) {
    if (!container) return;
    this.destroy(); // 防止重复初始化
    this.container = container;
    this.layers = Array.from(container.querySelectorAll(".parallax-layer"));
    if (this.layers.length === 0) return;

    this.isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (this.isMobile && window.DeviceOrientationEvent) {
      this.handleOrientation = this.onDeviceOrientation.bind(this);
      window.addEventListener("deviceorientation", this.handleOrientation);
    } else {
      this.handleMouseMove = this.onMouseMove.bind(this);
      this.handleMouseLeave = this.onMouseLeave.bind(this);
      document.addEventListener("mousemove", this.handleMouseMove);
      document.addEventListener("mouseleave", this.handleMouseLeave);
    }

    this.isActive = true;
    this.animate();
  },

  onMouseMove(e) {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    // 计算相对于中心的坐标 (-1 到 1)
    this.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 3;
    this.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 3;
  },

  onMouseLeave() {
    this.targetX = 0;
    this.targetY = 0;
  },

  onDeviceOrientation(e) {
    const gamma = e.gamma || 0;
    const beta = e.beta || 0;
    this.targetX = Math.max(-1, Math.min(1, gamma / 30));
    this.targetY = Math.max(-1, Math.min(1, (beta - 45) / 30));
  },

  animate() {
    if (!this.isActive) return;
    const ease = 0.08; // 增加跟随速度 (0.05 -> 0.08)
    this.mouseX += (this.targetX - this.mouseX) * ease;
    this.mouseY += (this.targetY - this.mouseY) * ease;

    // 增加位移幅度
    const multiplier = this.isMobile ? 100 : 150; // 加强移动范围 (100 -> 150)

    this.layers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth) || 0.1;
      // 根据深度计算位移，深度越大移动越快
      const moveX = this.mouseX * depth * multiplier;
      const moveY = this.mouseY * depth * multiplier;

      // 应用变换，同时保留 JS 中设置的初始位置(left/top)
      // 注意：这里我们只改变 translate，不改变 left/top，所以是相对当前位置偏移
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  },

  destroy() {
    this.isActive = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.handleMouseMove) {
      document.removeEventListener("mousemove", this.handleMouseMove);
      document.removeEventListener("mouseleave", this.handleMouseLeave);
    }
    if (this.handleOrientation) {
      window.removeEventListener("deviceorientation", this.handleOrientation);
    }
    // 重置变换
    this.layers.forEach((layer) => {
      layer.style.transform = "";
    });
    this.container = null;
    this.layers = [];
    this.mouseX = this.mouseY = this.targetX = this.targetY = 0;
    this.animationId = null;
  },
};

/**
 * 获取所有月份的照片
 */
async function getMonthPhotos() {
  const photos = [];
  for (let month = 0; month <= 12; month++) {
    try {
      const photo = await storageManager.getPhoto(month);
      photos.push({
        month,
        url: photo || DEFAULT_BABY_IMAGES[month],
        isDefault: !photo,
      });
    } catch (e) {
      photos.push({
        month,
        url: DEFAULT_BABY_IMAGES[month],
        isDefault: true,
      });
    }
  }
  return photos;
}

/**
 * 生成首页装饰卡片 HTML
 */
export async function generateHomeDecorations() {
  const photos = await getMonthPhotos();

  const cards = [
    { depth: 0.2, x: "5%", y: "10%", w: 220, h: 160, rotate: -8, month: 0 },
    { depth: 0.5, x: "18%", y: "25%", w: 160, h: 220, rotate: 6, month: 1 },
    { depth: 0.3, x: "8%", y: "60%", w: 180, h: 180, rotate: -4, month: 2 },
    { depth: 0.6, x: "20%", y: "80%", w: 240, h: 160, rotate: 10, month: 3 },
    { depth: 0.4, x: "75%", y: "8%", w: 260, h: 170, rotate: 5, month: 4 },
    { depth: 0.7, x: "60%", y: "15%", w: 150, h: 200, rotate: -12, month: 5 },
    { depth: 0.25, x: "80%", y: "55%", w: 180, h: 240, rotate: 8, month: 6 },
    { depth: 0.55, x: "65%", y: "75%", w: 220, h: 150, rotate: -5, month: 7 },
    { depth: 0.45, x: "45%", y: "-10%", w: 200, h: 150, rotate: 15, month: 8 },
    { depth: 0.8, x: "40%", y: "95%", w: 190, h: 250, rotate: -10, month: 9 },
  ];

  return cards
    .map((c, i) => {
      const photo = photos[c.month];
      return `
    <div class="parallax-layer" data-depth="${c.depth}" style="
      position: absolute;
      left: ${c.x};
      top: ${c.y};
      will-change: transform;
      z-index: 1; /* 确保在背景之上 */
      pointer-events: none;
    ">
      <div class="photo-card" style="
        width: ${c.w}px;
        height: ${c.h}px;
        --rotate: ${c.rotate}deg;
        --delay: ${0.1 + i * 0.08}s;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        overflow: hidden;
        background: #2a2a2a;
        border: 1px solid rgba(255,255,255,0.15);
      ">
        <img src="${photo.url}" alt="${c.month}个月" style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.9;
        " loading="lazy" />
        ${
          photo.isDefault
            ? ""
            : `
        <div class="photo-badge" style="
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0,0,0,0.6);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        ">${c.month}个月</div>`
        }
      </div>
    </div>
  `;
    })
    .join("");
}

/**
 * 生成移动端装饰卡片 HTML
 */
export async function generateMobileDecorations() {
  const photos = await getMonthPhotos();

  const cards = [
    { depth: 0.2, x: "2%", y: "5%", w: 120, h: 90, rotate: -10, month: 0 },
    { depth: 0.4, x: "5%", y: "35%", w: 100, h: 130, rotate: 8, month: 2 },
    { depth: 0.3, x: "3%", y: "70%", w: 110, h: 85, rotate: -5, month: 4 },
    { depth: 0.25, x: "70%", y: "3%", w: 115, h: 88, rotate: 12, month: 6 },
    { depth: 0.5, x: "72%", y: "38%", w: 105, h: 135, rotate: -8, month: 8 },
    { depth: 0.35, x: "68%", y: "72%", w: 120, h: 92, rotate: 6, month: 10 },
  ];

  return cards
    .map((c, i) => {
      const photo = photos[c.month];
      return `
    <div class="parallax-layer" data-depth="${c.depth}" style="
      position: absolute;
      left: ${c.x};
      top: ${c.y};
      will-change: transform;
      z-index: 1;
    ">
      <div class="photo-card" style="
        width: ${c.w}px;
        height: ${c.h}px;
        --rotate: ${c.rotate}deg;
        --delay: ${0.1 + i * 0.1}s;
        border-radius: 12px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        background: #f0f0f0;
      ">
        <img src="${photo.url}" alt="${c.month}个月" style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        " loading="lazy" />
      </div>
    </div>
  `;
    })
    .join("");
}

export default parallaxEffect;
