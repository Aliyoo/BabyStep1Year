/**
 * Router - 路由管理器
 * Hash-based 路由解析和导航
 * Requirements: 1.6, 3.2, 3.3
 */

class Router {
  constructor() {
    this.currentPage = 'home';
    this.currentMonth = 0;
    this.callbacks = [];
    
    this._init();
  }

  _init() {
    // 监听 hash 变化
    window.addEventListener('hashchange', () => this._handleRouteChange());
    // 初始化时解析当前路由
    this._handleRouteChange();
  }

  /**
   * 解析当前 hash 路由
   * @private
   */
  _parseHash() {
    const hash = window.location.hash.slice(1) || '/';
    
    // 首页: #/ 或空
    if (hash === '/' || hash === '') {
      return { page: 'home', month: null };
    }
    
    // 月份页面: #/month/0 到 #/month/12
    const monthMatch = hash.match(/^\/month\/(\d+)$/);
    if (monthMatch) {
      const month = parseInt(monthMatch[1], 10);
      if (month >= 0 && month <= 12) {
        return { page: 'month', month };
      }
    }
    
    // 分享页面: #/share
    if (hash === '/share') {
      return { page: 'share', month: null };
    }
    
    // 默认返回首页
    return { page: 'home', month: null };
  }

  /**
   * 处理路由变化
   * @private
   */
  _handleRouteChange() {
    const { page, month } = this._parseHash();
    const prevPage = this.currentPage;
    const prevMonth = this.currentMonth;
    
    this.currentPage = page;
    this.currentMonth = month !== null ? month : this.currentMonth;
    
    // 只有当路由真正变化时才触发回调
    if (prevPage !== page || prevMonth !== this.currentMonth) {
      this._notifyCallbacks();
    }
  }


  /**
   * 通知所有回调
   * @private
   */
  _notifyCallbacks() {
    this.callbacks.forEach(callback => {
      callback(this.currentPage, this.currentMonth);
    });
  }

  /**
   * 导航到指定页面
   * @param {string} page - 页面类型 ('home', 'month', 'share')
   * @param {number} [month] - 月份 (0-12)，仅当 page 为 'month' 时有效
   */
  navigate(page, month) {
    let hash = '/';
    
    switch (page) {
      case 'home':
        hash = '/';
        break;
      case 'month':
        if (typeof month === 'number' && month >= 0 && month <= 12) {
          hash = `/month/${month}`;
        } else {
          hash = `/month/${this.currentMonth}`;
        }
        break;
      case 'share':
        hash = '/share';
        break;
      default:
        hash = '/';
    }
    
    window.location.hash = hash;
  }

  /**
   * 导航到下一个月份
   * Requirements: 3.2
   */
  nextMonth() {
    if (this.currentMonth < 12) {
      this.navigate('month', this.currentMonth + 1);
    }
  }

  /**
   * 导航到上一个月份
   * Requirements: 3.3
   */
  prevMonth() {
    if (this.currentMonth > 0) {
      this.navigate('month', this.currentMonth - 1);
    }
  }

  /**
   * 注册路由变化回调
   * @param {Function} callback - 回调函数 (page, month) => void
   */
  onRouteChange(callback) {
    if (typeof callback === 'function') {
      this.callbacks.push(callback);
    }
  }

  /**
   * 移除路由变化回调
   * @param {Function} callback - 要移除的回调函数
   */
  offRouteChange(callback) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * 检查是否可以导航到下一个月
   * @returns {boolean}
   */
  canGoNext() {
    return this.currentPage === 'month' && this.currentMonth < 12;
  }

  /**
   * 检查是否可以导航到上一个月
   * @returns {boolean}
   */
  canGoPrev() {
    return this.currentPage === 'month' && this.currentMonth > 0;
  }
}

// 导出单例（浏览器环境）
let router;
if (typeof window !== 'undefined') {
  router = new Router();
}

// ES Module 导出
export { Router, router };
