/**
 * ContentEditor - 内容编辑管理器
 * 负责月份页面的成长故事和里程碑数据编辑
 * Requirements: 12.1, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8
 */

import { storageManager } from './storage-manager.js';
import { stateManager, MONTHS_CONFIG } from './state-manager.js';

class ContentEditor {
  constructor() {
    this.isEditing = false;
    this.currentMonth = null;
    this.originalData = null;
    this.onSaveCallback = null;
  }

  /**
   * 初始化编辑器
   * @param {number} month - 当前月份
   * @param {Function} onSave - 保存后的回调函数
   */
  init(month, onSave) {
    this.currentMonth = month;
    this.onSaveCallback = onSave;
    this.bindEvents();
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 使用事件委托处理编辑按钮点击
    document.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-btn');
      const saveBtn = e.target.closest('.save-btn');
      const cancelBtn = e.target.closest('.cancel-btn');

      if (editBtn && !this.isEditing) {
        this.enterEditMode();
      } else if (saveBtn) {
        this.saveChanges();
      } else if (cancelBtn) {
        this.cancelEdit();
      }
    });
  }

  /**
   * 获取当前月份的数据（优先从 localStorage 读取）
   * Requirements: 12.7, 12.8
   * @returns {object}
   */
  getCurrentData() {
    const savedData = storageManager.getMonthData(this.currentMonth);
    if (savedData && savedData.customized) {
      return savedData;
    }
    
    // 返回默认数据
    const config = MONTHS_CONFIG[this.currentMonth];
    return {
      story: config.defaultStory,
      milestones: [...config.defaultMilestones],
      customized: false
    };
  }

  /**
   * 进入编辑模式
   * Requirements: 12.1, 12.2
   */
  enterEditMode() {
    this.isEditing = true;
    this.originalData = this.getCurrentData();
    stateManager.toggleEditing(true);
    this.renderEditModal();
  }

  /**
   * 渲染编辑弹窗 (Modal Style)
   * Requirements: 12.3, 12.4
   */
  renderEditModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('editor-modal');
    if (existingModal) existingModal.remove();

    const data = this.originalData;

    const modal = document.createElement('div');
    modal.id = 'editor-modal';
    modal.className = 'editor-modal';
    modal.innerHTML = `
      <div class="editor-modal-backdrop"></div>
      <div class="editor-modal-content">
        <header class="editor-modal-header">
          <h2>编辑 ${this.currentMonth} 个月记录</h2>
          <button class="editor-close-btn cancel-btn">&times;</button>
        </header>
        
        <div class="editor-modal-body">
          <div class="form-group">
            <label class="form-label">成长故事</label>
            <textarea 
              class="form-textarea story-textarea" 
              id="story-input"
              placeholder="记录宝宝这个月的成长故事..."
              rows="4"
            >${data.story}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">成长里程碑</label>
            <div class="milestones-edit-grid">
              ${data.milestones.map((m, index) => `
                <div class="milestone-edit-item">
                  <span class="milestone-edit-label">${m.label}</span>
                  <input 
                    type="text" 
                    class="form-input milestone-input" 
                    data-index="${index}"
                    value="${m.value || ''}"
                    placeholder="待记录"
                  />
                  <label class="milestone-checkbox-label">
                    <input 
                      type="checkbox" 
                      class="milestone-checkbox"
                      data-index="${index}"
                      ${m.completed ? 'checked' : ''}
                    />
                    <span>已完成</span>
                  </label>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <footer class="editor-modal-footer">
          <button class="btn btn-secondary cancel-btn">取消</button>
          <button class="btn btn-primary save-btn">💾 保存</button>
        </footer>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });

    // Focus on story input
    const storyInput = document.getElementById('story-input');
    if (storyInput) {
      setTimeout(() => storyInput.focus(), 100);
    }
  }

  /**
   * 保存更改
   * Requirements: 12.5
   */
  saveChanges() {
    const storyInput = document.getElementById('story-input');
    const milestoneInputs = document.querySelectorAll('.milestone-input');
    const milestoneCheckboxes = document.querySelectorAll('.milestone-checkbox');

    if (!storyInput) return;

    // 收集编辑后的数据
    const newData = {
      story: storyInput.value.trim() || this.originalData.story,
      milestones: this.originalData.milestones.map((m, index) => ({
        label: m.label,
        value: milestoneInputs[index]?.value || m.value,
        completed: milestoneCheckboxes[index]?.checked || false
      })),
      customized: true
    };

    // 保存到 localStorage
    storageManager.saveMonthData(this.currentMonth, newData);

    // 更新状态管理器
    stateManager.updateMonthData(this.currentMonth, newData);

    // 退出编辑模式
    this.exitEditMode(newData);

    // 触发回调
    if (this.onSaveCallback) {
      this.onSaveCallback(newData);
    }
  }

  /**
   * 取消编辑
   * Requirements: 12.6
   */
  cancelEdit() {
    this.exitEditMode(this.originalData);
  }

  /**
   * 退出编辑模式
   * @param {object} data - 要显示的数据
   */
  exitEditMode(data) {
    this.isEditing = false;
    stateManager.toggleEditing(false);
    
    // Close modal
    const modal = document.getElementById('editor-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
    
    // Update page display if data was saved
    if (data && data !== this.originalData) {
      const storyDisplay = document.getElementById('story-display');
      if (storyDisplay) {
        storyDisplay.textContent = data.story;
      }
      
      // Update milestones grid
      const milestonesGrid = document.querySelector('.mini-milestones-grid');
      if (milestonesGrid) {
        milestonesGrid.innerHTML = data.milestones.map(m => `
          <div class="mini-milestone-item ${m.completed ? 'completed' : ''}">
            <span class="mini-milestone-label">${m.label}</span>
            <span class="mini-milestone-value">${m.value || '待记录'}</span>
          </div>
        `).join('');
      }
    }
  }

  /**
   * 渲染查看模式
   * @param {object} data - 要显示的数据
   */
  renderViewMode(data) {
    const storySection = document.querySelector('.card-story-section');
    const milestonesSection = document.querySelector('.card-milestones-section');
    const actionsSection = document.querySelector('.card-actions');

    if (!storySection || !milestonesSection || !actionsSection) return;

    // 渲染故事区域
    storySection.innerHTML = `
      <h2 class="story-title">成长故事</h2>
      <p class="story-content">${data.story}</p>
    `;

    // 渲染里程碑区域
    milestonesSection.innerHTML = `
      <h2 class="milestones-title">成长里程碑</h2>
      <div class="milestones-grid">
        ${data.milestones.map(m => `
          <div class="milestone-item ${m.completed ? 'completed' : ''}">
            <span class="milestone-label">${m.label}</span>
            <span class="milestone-value">${m.value || '待记录'}</span>
          </div>
        `).join('')}
      </div>
    `;

    // 渲染操作按钮
    actionsSection.innerHTML = `
      <button class="btn btn-secondary edit-btn" aria-label="编辑${this.currentMonth}个月成长记录">
        ✏️ 编辑
      </button>
    `;
  }

  /**
   * 销毁编辑器
   */
  destroy() {
    this.isEditing = false;
    this.currentMonth = null;
    this.originalData = null;
    this.onSaveCallback = null;
  }
}

// 导出单例
let contentEditor;
if (typeof window !== 'undefined') {
  contentEditor = new ContentEditor();
}

export { ContentEditor, contentEditor };
