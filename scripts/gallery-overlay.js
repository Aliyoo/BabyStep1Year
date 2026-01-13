/**
 * gallery-overlay.js
 * 负责展示全屏照片画廊，实现“散开”炫酷交互
 */

import { stateManager } from "./state-manager.js";
import { photoUploadManager } from "./photo-upload.js";
import { storageManager } from "./storage-manager.js";

class GalleryOverlay {
  constructor() {
    this.overlay = null;
    this.currentMonth = null;
    this.init();
  }

  init() {
    // 预先创建 DOM 结构但不显示
    this.overlay = document.createElement("div");
    this.overlay.className = "gallery-overlay";
    this.overlay.innerHTML = `
      <div class="gallery-backdrop"></div>
      <div class="gallery-container">
        <div class="gallery-header">
           <h2 class="gallery-title">Memories</h2>
           <button class="gallery-close-btn">×</button>
        </div>
        <div class="gallery-grid" id="gallery-grid">
           <!-- Photos injected here -->
        </div>
        <div class="gallery-actions">
           <button class="btn-add-photo" id="gallery-add-btn">
             + Add Photo
           </button>
           <input type="file" id="gallery-file-input" multiple accept="image/*" style="display: none">
        </div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    // Bind events
    this.overlay.querySelector(".gallery-close-btn").addEventListener("click", () => this.close());
    this.overlay.querySelector(".gallery-backdrop").addEventListener("click", () => this.close());
    
    // Upload binding
    const addBtn = this.overlay.querySelector("#gallery-add-btn");
    const fileInput = this.overlay.querySelector("#gallery-file-input");
    
    addBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => this.handleUpload(e));
  }

  /**
   * 打开画廊
   * @param {number} month 
   */
  open(month) {
    this.currentMonth = month;
    const monthData = stateManager.getMonthData(month);
    const photos = monthData?.photos || [];

    // 1. Render Photos
    this.renderGrid(photos);

    // 2. Animate In
    this.overlay.classList.add("active");
    
    // Staggered animation for grid items
    const items = this.overlay.querySelectorAll(".gallery-item");
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 50}ms`;
        item.classList.add("animate-in");
    });
  }

  close() {
    this.overlay.classList.remove("active");
    setTimeout(() => {
        // Cleanup if needed
    }, 300);
  }

  renderGrid(photos) {
    const grid = this.overlay.querySelector("#gallery-grid");
    grid.innerHTML = "";

    if (photos.length === 0) {
        grid.innerHTML = `<div class="empty-state">No photos yet. Add some memories!</div>`;
        return;
    }

    photos.forEach((url, index) => {
        const div = document.createElement("div");
        div.className = "gallery-item";
        div.innerHTML = `
            <img src="${url}" loading="lazy" alt="Memory ${index + 1}" />
            <button class="gallery-delete-btn" data-index="${index}">×</button>
        `;
        
        // Delete action
        div.querySelector(".gallery-delete-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            this.deletePhoto(index);
        });

        // Click to view large? (Optional, maybe lightbox later)
        
        grid.appendChild(div);
    });
  }

  async handleUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            stateManager.addMonthPhoto(this.currentMonth, event.target.result);
            // Save to storage
            const updated = stateManager.getMonthData(this.currentMonth);
            await storageManager.saveMonthPhotos(this.currentMonth, updated.photos);
            
            this.renderGrid(updated.photos);
        };
        reader.readAsDataURL(file);
    }
    e.target.value = "";
  }

  async deletePhoto(index) {
      if (confirm("Remove this memory?")) {
          stateManager.removeMonthPhoto(this.currentMonth, index);
          
          // Save to storage
          const updated = stateManager.getMonthData(this.currentMonth);
          await storageManager.saveMonthPhotos(this.currentMonth, updated.photos);
          
          this.renderGrid(updated.photos || []);
      }
  }
}

export const galleryOverlay = new GalleryOverlay();
