/**
 * PhotoUpload - 照片上传管理器
 * 负责照片上传 UI、文件验证和存储
 * Requirements: 11.1, 11.3, 11.4, 11.5, 11.6
 */

import { storageManager } from "./storage-manager.js";

// 支持的文件类型
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
// 最大文件大小 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * 验证文件类型
 * @param {File} file - 文件对象
 * @returns {boolean} 是否为有效类型
 */
export function validateFileType(file) {
  if (!file || !file.type) return false;
  return SUPPORTED_TYPES.includes(file.type);
}

/**
 * 验证文件大小
 * @param {File} file - 文件对象
 * @returns {boolean} 是否在大小限制内
 */
export function validateFileSize(file) {
  if (!file || typeof file.size !== "number") return false;
  return file.size <= MAX_FILE_SIZE;
}

/**
 * 验证文件（类型和大小）
 * @param {File} file - 文件对象
 * @returns {{ valid: boolean, error?: string }} 验证结果
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: "请选择文件" };
  }

  if (!validateFileType(file)) {
    return {
      valid: false,
      error: "不支持的文件格式，请选择 JPG、PNG 或 WebP 图片",
    };
  }

  if (!validateFileSize(file)) {
    return { valid: false, error: "文件过大，请选择小于 5MB 的图片" };
  }

  return { valid: true };
}

/**
 * 创建图片预览 URL
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 预览 URL
 */
export function createPreviewUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("无效的文件"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.readAsDataURL(file);
  });
}

/**
 * PhotoUploadManager 类
 * 管理照片上传的完整流程
 */
export class PhotoUploadManager {
  constructor() {
    this.currentMonth = null;
    this.onPhotoChange = null;
  }

  /**
   * 初始化照片上传区域
   * @param {number} month - 当前月份
   * @param {HTMLElement} container - 容器元素
   * @param {Function} onPhotoChange - 照片变化回调
   */
  async init(month, container, onPhotoChange) {
    this.currentMonth = month;
    this.onPhotoChange = onPhotoChange;

    // 加载已保存的照片
    const savedPhoto = await storageManager.getPhoto(month);

    // 渲染上传区域
    this.render(container, savedPhoto);

    // 绑定事件
    this.bindEvents(container);
  }

  /**
   * 渲染照片上传区域
   * @param {HTMLElement} container - 容器元素
   * @param {string|null} photoUrl - 已保存的照片 URL
   */
  render(container, photoUrl) {
    if (!container) return;

    if (photoUrl) {
      container.innerHTML = this.renderPhotoPreview(photoUrl);
    } else {
      container.innerHTML = this.renderUploadArea();
    }
  }

  /**
   * 渲染上传区域 HTML
   * @returns {string} HTML 字符串
   */
  renderUploadArea() {
    return `
      <div class="photo-upload" role="button" tabindex="0" aria-label="点击上传${this.currentMonth}个月宝宝照片">
        <input type="file"
               class="photo-file-input"
               accept="image/jpeg,image/png,image/webp"
               aria-hidden="true"
               style="display: none;">
        <span class="photo-upload-icon">📷</span>
        <span class="photo-upload-text">点击上传宝宝照片</span>
        <span class="photo-upload-hint">支持 JPG、PNG、WebP 格式</span>
      </div>
    `;
  }

  /**
   * 渲染照片预览 HTML (3D 翻转拍立得风格)
   * @param {string} photoUrl - 照片 URL
   * @returns {string} HTML 字符串
   */
  renderPhotoPreview(photoUrl) {
    // 生成一个随机的"拍摄日期"（模拟，因为文件API获取不到原始拍摄日期）
    const date = new Date();
    date.setMonth(date.getMonth() - (12 - this.currentMonth)); // 简单的模拟回推
    const dateStr = date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // 随机的父母寄语
    const notes = [
      "最珍贵的礼物 ❤️",
      "你的笑容治愈了一切",
      "慢慢长大，不急不躁",
      "这一刻，永恒铭记",
      "Love you forever",
      "你是我们的骄傲 🌟",
    ];
    const randomNote = notes[Math.floor(Math.random() * notes.length)];

    return `
      <div class="flip-card-container">
        <div class="flip-card-inner">
          <!-- 正面：照片 -->
          <div class="flip-card-front">
            <div class="polaroid-img-wrapper">
              <img src="${photoUrl}" alt="${this.currentMonth}个月宝宝照片">
            </div>

            <!-- 操作浮层 -->
            <div class="photo-preview-overlay">
              <input type="file"
                     class="photo-file-input"
                     accept="image/jpeg,image/png,image/webp"
                     aria-hidden="true"
                     style="display: none;">
              <button class="btn btn-secondary photo-change-btn" aria-label="更换照片">📷</button>
              <button class="btn btn-secondary photo-delete-btn" aria-label="删除照片">🗑️</button>
            </div>
          </div>

          <!-- 背面：寄语 -->
          <div class="flip-card-back">
            <p class="handwritten-note">"${randomNote}"</p>
            <div class="note-date">📅 记录于 ${dateStr}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 绑定事件处理
   * @param {HTMLElement} container - 容器元素
   */
  bindEvents(container) {
    if (!container) return;

    const uploadArea = container.querySelector(".photo-upload");
    const fileInput = container.querySelector(".photo-file-input");
    const changeBtn = container.querySelector(".photo-change-btn");
    const deleteBtn = container.querySelector(".photo-delete-btn");

    // 点击上传区域触发文件选择
    if (uploadArea) {
      uploadArea.addEventListener("click", () => fileInput?.click());
      uploadArea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fileInput?.click();
        }
      });
    }

    // 更换照片按钮
    if (changeBtn) {
      changeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput?.click();
      });
    }

    // 删除照片按钮
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleDelete(container);
      });
    }

    // 文件选择处理
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (file) {
          this.handleFileSelect(file, container);
        }
      });
    }
  }

  /**
   * 处理文件选择
   * @param {File} file - 选择的文件
   * @param {HTMLElement} container - 容器元素
   */
  async handleFileSelect(file, container) {
    // 验证文件
    const validation = validateFile(file);
    if (!validation.valid) {
      this.showError(container, validation.error);
      return;
    }

    try {
      // 显示加载状态
      this.showLoading(container);

      // 创建预览
      const previewUrl = await createPreviewUrl(file);

      // 保存到存储
      await storageManager.savePhoto(this.currentMonth, file);

      // 更新 UI
      this.render(container, previewUrl);
      this.bindEvents(container);

      // 触发回调
      if (this.onPhotoChange) {
        this.onPhotoChange(previewUrl);
      }
    } catch (error) {
      console.error("照片上传失败:", error);
      this.showError(container, "照片上传失败，请重试");
      this.render(container, null);
      this.bindEvents(container);
    }
  }

  /**
   * 处理删除照片
   * @param {HTMLElement} container - 容器元素
   */
  async handleDelete(container) {
    try {
      await storageManager.deletePhoto(this.currentMonth);
      this.render(container, null);
      this.bindEvents(container);

      if (this.onPhotoChange) {
        this.onPhotoChange(null);
      }
    } catch (error) {
      console.error("删除照片失败:", error);
      this.showError(container, "删除失败，请重试");
    }
  }

  /**
   * 显示加载状态
   * @param {HTMLElement} container - 容器元素
   */
  showLoading(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="photo-loading">
        <span class="photo-loading-spinner">⏳</span>
        <span class="photo-loading-text">正在上传...</span>
      </div>
    `;
  }

  /**
   * 显示错误提示
   * @param {HTMLElement} container - 容器元素
   * @param {string} message - 错误信息
   */
  showError(container, message) {
    // 创建错误提示元素
    const existingError = container.querySelector(".photo-error");
    if (existingError) {
      existingError.remove();
    }

    const errorEl = document.createElement("div");
    errorEl.className = "photo-error";
    errorEl.textContent = message;
    errorEl.setAttribute("role", "alert");
    container.appendChild(errorEl);

    // 3秒后自动移除
    setTimeout(() => {
      errorEl.remove();
    }, 3000);
  }
}

// 导出单例
export const photoUploadManager = new PhotoUploadManager();

// 导出常量供测试使用
export { SUPPORTED_TYPES, MAX_FILE_SIZE };
