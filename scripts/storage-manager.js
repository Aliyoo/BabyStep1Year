/**
 * StorageManager - 存储管理器
 * 负责 localStorage 和 IndexedDB 的数据存取操作
 * Requirements: 10.1, 11.5, 12.5
 */

const STORAGE_KEYS = {
  PROGRESS: 'baby_journey_progress',
  MONTH_DATA_PREFIX: 'baby_journey_month_',
  FIRST_VISIT: 'baby_journey_first_visit'
};

const DB_NAME = 'BabyJourneyDB';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';

class StorageManager {
  constructor() {
    this.db = null;
    this.dbReady = this._initIndexedDB();
  }

  // ==================== IndexedDB 初始化 ====================

  async _initIndexedDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB 不支持，将使用 localStorage 降级方案');
        resolve(false);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB 打开失败:', request.error);
        resolve(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          db.createObjectStore(PHOTO_STORE, { keyPath: 'month' });
        }
      };
    });
  }


  // ==================== localStorage 操作 ====================

  /**
   * 保存浏览进度
   * @param {number} month - 当前月份 (0-12)
   */
  saveProgress(month) {
    if (typeof month !== 'number' || month < 0 || month > 12) {
      throw new Error('无效的月份值');
    }
    localStorage.setItem(STORAGE_KEYS.PROGRESS, String(month));
  }

  /**
   * 获取浏览进度
   * @returns {number} 上次浏览的月份，默认返回 0
   */
  getProgress() {
    const progress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (progress === null) return 0;
    const month = parseInt(progress, 10);
    return isNaN(month) ? 0 : Math.max(0, Math.min(12, month));
  }

  /**
   * 保存月份数据
   * @param {number} month - 月份 (0-12)
   * @param {object} data - 月份数据对象
   */
  saveMonthData(month, data) {
    if (typeof month !== 'number' || month < 0 || month > 12) {
      throw new Error('无效的月份值');
    }
    const key = STORAGE_KEYS.MONTH_DATA_PREFIX + month;
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * 获取月份数据
   * @param {number} month - 月份 (0-12)
   * @returns {object|null} 月份数据对象或 null
   */
  getMonthData(month) {
    if (typeof month !== 'number' || month < 0 || month > 12) {
      return null;
    }
    const key = STORAGE_KEYS.MONTH_DATA_PREFIX + month;
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('解析月份数据失败:', e);
      return null;
    }
  }

  /**
   * 检查是否首次访问
   * @returns {boolean}
   */
  isFirstVisit() {
    return localStorage.getItem(STORAGE_KEYS.FIRST_VISIT) === null;
  }

  /**
   * 标记已访问
   */
  markVisited() {
    localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, Date.now().toString());
  }


  // ==================== IndexedDB 操作 (照片存储) ====================

  /**
   * 保存月份照片列表
   * @param {number} month - 月份 (0-12)
   * @param {string[]} photos - 图片 Data URL 数组
   * @returns {Promise<void>}
   */
  async saveMonthPhotos(month, photos) {
    await this.dbReady;

    if (typeof month !== 'number' || month < 0 || month > 12) {
      throw new Error('无效的月份值');
    }

    if (!Array.isArray(photos)) {
      throw new Error('无效的照片数据');
    }

    // 如果 IndexedDB 不可用，降级到 localStorage
    if (!this.db) {
      return this._savePhotosToLocalStorage(month, photos);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([PHOTO_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);

      const photoData = {
        month: month,
        photos: photos,
        timestamp: Date.now()
      };

      const request = store.put(photoData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('保存照片失败: ' + request.error));
    });
  }

  /**
   * 获取月份照片列表
   * @param {number} month - 月份 (0-12)
   * @returns {Promise<string[]>} 图片 Data URL 数组
   */
  async getMonthPhotos(month) {
    await this.dbReady;

    if (typeof month !== 'number' || month < 0 || month > 12) {
      return [];
    }

    // 如果 IndexedDB 不可用，从 localStorage 读取
    if (!this.db) {
      return this._getPhotosFromLocalStorage(month);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([PHOTO_STORE], 'readonly');
      const store = transaction.objectStore(PHOTO_STORE);
      const request = store.get(month);

      request.onsuccess = () => {
        const result = request.result;
        
        // Handle migration from old single 'blob' format if necessary
        if (result && result.blob) {
            // Old format found: { month, blob }
            // Convert blob to dataURL and return as single item array
             const reader = new FileReader();
             reader.onload = () => resolve([reader.result]);
             reader.onerror = () => resolve([]); // Fail safe
             reader.readAsDataURL(result.blob);
             return;
        }

        if (result && Array.isArray(result.photos)) {
            resolve(result.photos);
        } else {
            resolve([]);
        }
      };

      request.onerror = () => reject(new Error('获取照片失败: ' + request.error));
    });
  }

  /**
   * 删除所有照片（指定月份）
   * @param {number} month - 月份 (0-12)
   * @returns {Promise<void>}
   */
  async deleteMonthPhotos(month) {
    await this.dbReady;

    if (typeof month !== 'number' || month < 0 || month > 12) {
      throw new Error('无效的月份值');
    }

    if (!this.db) {
      return this._deletePhotosFromLocalStorage(month);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([PHOTO_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      const request = store.delete(month);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除照片失败: ' + request.error));
    });
  }

  // ==================== localStorage 降级方案 ====================

  async _savePhotosToLocalStorage(month, photos) {
    try {
        localStorage.setItem(`baby_journey_photos_${month}`, JSON.stringify(photos));
        return Promise.resolve();
    } catch(e) {
        return Promise.reject(new Error('存储空间不足'));
    }
  }

  _getPhotosFromLocalStorage(month) {
    const raw = localStorage.getItem(`baby_journey_photos_${month}`);
    if (!raw) {
        // Fallback check for old key
        const oldSingle = localStorage.getItem(`baby_journey_photo_${month}`);
        if (oldSingle) return Promise.resolve([oldSingle]);
        return Promise.resolve([]);
    }
    try {
        return Promise.resolve(JSON.parse(raw));
    } catch {
        return Promise.resolve([]);
    }
  }

  _deletePhotosFromLocalStorage(month) {
    localStorage.removeItem(`baby_journey_photos_${month}`);
    // Also clear old key
    localStorage.removeItem(`baby_journey_photo_${month}`);
    return Promise.resolve();
  }

  // ==================== 清理方法 ====================

  /**
   * 清除所有数据
   */
  async clearAll() {
    // 清除 localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key.includes('PREFIX')) return;
      localStorage.removeItem(key);
    });

    // 清除月份数据
    for (let i = 0; i <= 12; i++) {
      localStorage.removeItem(STORAGE_KEYS.MONTH_DATA_PREFIX + i);
      localStorage.removeItem(`baby_journey_photo_${i}`);
    }

    // 清除 IndexedDB
    if (this.db) {
      await this.dbReady;
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([PHOTO_STORE], 'readwrite');
        const store = transaction.objectStore(PHOTO_STORE);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// 导出单例（浏览器环境）
let storageManager;
if (typeof window !== 'undefined') {
  storageManager = new StorageManager();
}

// ES Module 导出
export { StorageManager, storageManager, STORAGE_KEYS };
