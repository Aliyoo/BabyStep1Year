/**
 * 分享模态框组件
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

/**
 * 分享模态框管理器
 */
export const shareModal = {
  isOpen: false,
  modalElement: null,
  
  /**
   * 打开分享模态框
   * Requirements: 7.1
   */
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.render();
    this.initInteractions();
    
    // 触发打开动画
    requestAnimationFrame(() => {
      const overlay = document.getElementById('share-modal-overlay');
      if (overlay) {
        overlay.classList.add('active');
      }
    });
  },
  
  /**
   * 关闭分享模态框
   * Requirements: 7.4, 7.5
   */
  close() {
    if (!this.isOpen) return;
    
    const overlay = document.getElementById('share-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      
      // 等待动画完成后移除元素
      setTimeout(() => {
        overlay.remove();
        this.isOpen = false;
        this.modalElement = null;
      }, 300);
    }
  },
  
  /**
   * 渲染分享模态框
   * Requirements: 7.1, 7.2, 7.3
   */
  render() {
    // 移除已存在的模态框
    const existingModal = document.getElementById('share-modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }
    
    const shareUrl = window.location.href;
    
    const modalHTML = `
      <div class="modal-overlay share-modal-overlay" id="share-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
        <div class="modal share-modal" role="document">
          <div class="modal-header">
            <h2 class="modal-title" id="share-modal-title">📤 分享这一年</h2>
            <button class="modal-close share-modal-close" id="share-modal-close" aria-label="关闭分享窗口">
              ✕
            </button>
          </div>
          
          <div class="modal-body share-modal-body">
            <p class="share-description">分享宝宝的成长故事给家人朋友</p>
            
            <!-- 社交分享按钮 - Requirements: 7.2 -->
            <div class="share-buttons">
              <button class="share-btn share-btn-facebook" id="share-facebook" aria-label="分享到 Facebook">
                <span class="share-btn-icon">📘</span>
                <span class="share-btn-text">Facebook</span>
              </button>
              
              <button class="share-btn share-btn-wechat" id="share-wechat" aria-label="分享到微信">
                <span class="share-btn-icon">💬</span>
                <span class="share-btn-text">微信</span>
              </button>
              
              <button class="share-btn share-btn-whatsapp" id="share-whatsapp" aria-label="分享到 WhatsApp">
                <span class="share-btn-icon">📱</span>
                <span class="share-btn-text">WhatsApp</span>
              </button>
            </div>
            
            <!-- 复制链接功能 - Requirements: 7.3 -->
            <div class="share-link-section">
              <label class="share-link-label" for="share-link-input">或复制链接分享</label>
              <div class="share-link-row">
                <input 
                  type="text" 
                  class="share-link-input" 
                  id="share-link-input" 
                  value="${shareUrl}" 
                  readonly 
                  aria-label="分享链接"
                />
                <button class="btn btn-primary share-copy-btn" id="share-copy-btn" aria-label="复制链接">
                  📋 复制
                </button>
              </div>
              <p class="share-copy-feedback" id="share-copy-feedback" aria-live="polite"></p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modalElement = document.getElementById('share-modal-overlay');
  },
  
  /**
   * 初始化模态框交互
   * Requirements: 7.4, 7.5
   */
  initInteractions() {
    const overlay = document.getElementById('share-modal-overlay');
    const closeBtn = document.getElementById('share-modal-close');
    
    // 关闭按钮点击 - Requirements: 7.4
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    
    // 点击外部关闭 - Requirements: 7.5
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.close();
        }
      });
    }
    
    // ESC 键关闭
    const handleEscape = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // 社交分享按钮
    this.initShareButtons();
    
    // 复制链接功能
    this.initCopyLink();
  },
  
  /**
   * 初始化社交分享按钮
   * Requirements: 7.2
   */
  initShareButtons() {
    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent('来看看宝宝这一年的成长历程吧！');
    
    // Facebook 分享
    const facebookBtn = document.getElementById('share-facebook');
    if (facebookBtn) {
      facebookBtn.addEventListener('click', () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
      });
    }
    
    // 微信分享（显示二维码提示）
    const wechatBtn = document.getElementById('share-wechat');
    if (wechatBtn) {
      wechatBtn.addEventListener('click', () => {
        // 微信分享需要在微信内打开或使用二维码
        alert('请使用微信扫描二维码或在微信中打开此页面进行分享');
      });
    }
    
    // WhatsApp 分享
    const whatsappBtn = document.getElementById('share-whatsapp');
    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', () => {
        const whatsappUrl = `https://wa.me/?text=${shareText}%20${shareUrl}`;
        window.open(whatsappUrl, '_blank');
      });
    }
  },
  
  /**
   * 初始化复制链接功能
   * Requirements: 7.3
   */
  initCopyLink() {
    const copyBtn = document.getElementById('share-copy-btn');
    const linkInput = document.getElementById('share-link-input');
    
    if (copyBtn && linkInput) {
      copyBtn.addEventListener('click', async () => {
        try {
          // 使用 Clipboard API
          await navigator.clipboard.writeText(linkInput.value);
          this.showCopyFeedback('✓ 链接已复制到剪贴板', 'success');
        } catch (err) {
          // 降级方案：使用 execCommand
          linkInput.select();
          linkInput.setSelectionRange(0, 99999);
          
          try {
            document.execCommand('copy');
            this.showCopyFeedback('✓ 链接已复制到剪贴板', 'success');
          } catch (execErr) {
            this.showCopyFeedback('复制失败，请手动复制', 'error');
          }
        }
      });
      
      // 点击输入框自动选中
      linkInput.addEventListener('click', () => {
        linkInput.select();
      });
    }
  },
  
  /**
   * 显示复制反馈
   * @param {string} message - 反馈消息
   * @param {string} type - 反馈类型 ('success' | 'error')
   */
  showCopyFeedback(message, type) {
    const feedback = document.getElementById('share-copy-feedback');
    if (feedback) {
      feedback.textContent = message;
      feedback.className = `share-copy-feedback ${type}`;
      
      // 3秒后清除反馈
      setTimeout(() => {
        feedback.textContent = '';
        feedback.className = 'share-copy-feedback';
      }, 3000);
    }
  }
};

export default shareModal;
