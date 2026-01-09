/**
 * StateManager - 状态管理器
 * 应用状态管理和月份配置数据
 * Requirements: 2.1, 2.2
 */

/**
 * 12个月份的配置数据
 * Requirements: 5.1-5.13
 */
const MONTHS_CONFIG = [
  {
    month: 0,
    title: '初生之喜',
    englishTitle: 'Newborn Joy',
    gradient: {
      start: 'rgba(255, 192, 203, 0.9)',
      end: 'rgba(255, 245, 245, 1)'
    },
    accentColor: '#FFE4E1',
    defaultStory: '2024年X月X日，你来到了这个世界，带着响亮的哭声宣告你的到来...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '头围', value: 'XX cm', completed: false },
      { label: '第一次哭声', value: '响亮有力', completed: true }
    ]
  },
  {
    month: 1,
    title: '初识世界',
    englishTitle: 'First Glimpse',
    gradient: {
      start: 'rgba(255, 250, 205, 0.9)',
      end: 'rgba(255, 255, 240, 1)'
    },
    accentColor: '#FFFACD',
    defaultStory: '一个月了，你开始对这个世界充满好奇...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '第一次微笑', value: '', completed: false },
      { label: '抬头练习', value: '', completed: false }
    ]
  },
  {
    month: 2,
    title: '甜蜜互动',
    englishTitle: 'Sweet Interactions',
    gradient: {
      start: 'rgba(255, 218, 185, 0.9)',
      end: 'rgba(255, 248, 240, 1)'
    },
    accentColor: '#FFDAB9',
    defaultStory: '两个月了，你的笑容越来越多...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '社交性微笑', value: '', completed: false },
      { label: '追视物体', value: '', completed: false }
    ]
  },
  {
    month: 3,
    title: '活力满满',
    englishTitle: 'Full of Energy',
    gradient: {
      start: 'rgba(144, 238, 144, 0.9)',
      end: 'rgba(240, 255, 240, 1)'
    },
    accentColor: '#90EE90',
    defaultStory: '三个月了，你变得越来越活泼...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '抬头稳定', value: '', completed: false },
      { label: '咿呀学语', value: '', completed: false }
    ]
  },
  {
    month: 4,
    title: '探索之手',
    englishTitle: 'Exploring Hands',
    gradient: {
      start: 'rgba(175, 238, 238, 0.9)',
      end: 'rgba(240, 255, 255, 1)'
    },
    accentColor: '#AFEEEE',
    defaultStory: '四个月了，你开始用小手探索世界...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '抓握玩具', value: '', completed: false },
      { label: '翻身尝试', value: '', completed: false }
    ]
  },
  {
    month: 5,
    title: '好奇宝宝',
    englishTitle: 'Curious Baby',
    gradient: {
      start: 'rgba(221, 160, 221, 0.9)',
      end: 'rgba(255, 240, 255, 1)'
    },
    accentColor: '#DDA0DD',
    defaultStory: '五个月了，你对一切都充满好奇...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '独立翻身', value: '', completed: false },
      { label: '认识家人', value: '', completed: false }
    ]
  },
  {
    month: 6,
    title: '半岁里程碑',
    englishTitle: 'Half Year Milestone',
    gradient: {
      start: 'rgba(255, 182, 193, 0.9)',
      end: 'rgba(255, 240, 245, 1)'
    },
    accentColor: '#FFB6C1',
    defaultStory: '半岁了！这是一个重要的里程碑...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '独坐', value: '', completed: false },
      { label: '辅食开始', value: '', completed: false }
    ]
  },
  {
    month: 7,
    title: '小小冒险家',
    englishTitle: 'Little Adventurer',
    gradient: {
      start: 'rgba(210, 180, 140, 0.9)',
      end: 'rgba(255, 248, 240, 1)'
    },
    accentColor: '#D2B48C',
    defaultStory: '七个月了，你开始到处探索...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '爬行尝试', value: '', completed: false },
      { label: '长牙', value: '', completed: false }
    ]
  },
  {
    month: 8,
    title: '爬行小能手',
    englishTitle: 'Crawling Expert',
    gradient: {
      start: 'rgba(173, 255, 47, 0.7)',
      end: 'rgba(248, 255, 240, 1)'
    },
    accentColor: '#ADFF2F',
    defaultStory: '八个月了，你爬得越来越快...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '熟练爬行', value: '', completed: false },
      { label: '扶站', value: '', completed: false }
    ]
  },
  {
    month: 9,
    title: '站立时刻',
    englishTitle: 'Standing Moment',
    gradient: {
      start: 'rgba(135, 206, 250, 0.9)',
      end: 'rgba(240, 248, 255, 1)'
    },
    accentColor: '#87CEFA',
    defaultStory: '九个月了，你开始尝试站立...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '扶站稳定', value: '', completed: false },
      { label: '叫爸爸妈妈', value: '', completed: false }
    ]
  },
  {
    month: 10,
    title: '学步时光',
    englishTitle: 'Walking Time',
    gradient: {
      start: 'rgba(255, 200, 100, 0.9)',
      end: 'rgba(255, 250, 240, 1)'
    },
    accentColor: '#FFC864',
    defaultStory: '十个月了，你开始学习走路...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '扶走', value: '', completed: false },
      { label: '简单词汇', value: '', completed: false }
    ]
  },
  {
    month: 11,
    title: '即将周岁',
    englishTitle: 'Almost One',
    gradient: {
      start: 'rgba(100, 200, 180, 0.9)',
      end: 'rgba(240, 255, 250, 1)'
    },
    accentColor: '#64C8B4',
    defaultStory: '十一个月了，周岁就在眼前...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '独立行走', value: '', completed: false },
      { label: '理解指令', value: '', completed: false }
    ]
  },
  {
    month: 12,
    title: '周岁庆典',
    englishTitle: 'First Birthday',
    gradient: {
      start: 'rgba(255, 100, 100, 0.8)',
      middle: 'rgba(255, 200, 100, 0.8)',
      end: 'rgba(100, 200, 255, 0.8)'
    },
    accentColor: '#FF6464',
    isRainbow: true,
    defaultStory: '一周岁了！这一年充满了爱与成长...',
    defaultMilestones: [
      { label: '身长', value: 'XX cm', completed: false },
      { label: '体重', value: 'XX kg', completed: false },
      { label: '第一步', value: '', completed: false },
      { label: '第一个词', value: '', completed: false }
    ]
  }
];


/**
 * 应用状态管理器
 */
class StateManager {
  constructor() {
    this.state = {
      currentMonth: 0,
      isEditing: false,
      isShareModalOpen: false,
      monthsData: this._initMonthsData()
    };
    this.listeners = [];
  }

  /**
   * 初始化月份数据
   * @private
   */
  _initMonthsData() {
    return MONTHS_CONFIG.map(config => ({
      month: config.month,
      title: config.title,
      story: config.defaultStory,
      milestones: [...config.defaultMilestones],
      photoUrl: null,
      customized: false
    }));
  }

  /**
   * 获取当前状态
   * @returns {object}
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 获取指定月份的配置
   * @param {number} month - 月份 (0-12)
   * @returns {object|null}
   */
  getMonthConfig(month) {
    if (month < 0 || month > 12) return null;
    return MONTHS_CONFIG[month];
  }

  /**
   * 获取指定月份的数据
   * @param {number} month - 月份 (0-12)
   * @returns {object|null}
   */
  getMonthData(month) {
    if (month < 0 || month > 12) return null;
    return this.state.monthsData[month];
  }

  /**
   * 更新状态
   * @param {object} updates - 要更新的状态
   */
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this._notifyListeners();
  }

  /**
   * 更新月份数据
   * @param {number} month - 月份 (0-12)
   * @param {object} data - 要更新的数据
   */
  updateMonthData(month, data) {
    if (month < 0 || month > 12) return;
    
    this.state.monthsData[month] = {
      ...this.state.monthsData[month],
      ...data,
      customized: true
    };
    this._notifyListeners();
  }

  /**
   * 设置当前月份
   * @param {number} month - 月份 (0-12)
   */
  setCurrentMonth(month) {
    if (month >= 0 && month <= 12) {
      this.setState({ currentMonth: month });
    }
  }

  /**
   * 切换编辑模式
   * @param {boolean} [isEditing] - 是否编辑中
   */
  toggleEditing(isEditing) {
    this.setState({ 
      isEditing: isEditing !== undefined ? isEditing : !this.state.isEditing 
    });
  }

  /**
   * 切换分享模态框
   * @param {boolean} [isOpen] - 是否打开
   */
  toggleShareModal(isOpen) {
    this.setState({ 
      isShareModalOpen: isOpen !== undefined ? isOpen : !this.state.isShareModalOpen 
    });
  }

  /**
   * 订阅状态变化
   * @param {Function} listener - 监听函数
   * @returns {Function} 取消订阅函数
   */
  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
      return () => {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      };
    }
    return () => {};
  }

  /**
   * 通知所有监听器
   * @private
   */
  _notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * 重置所有数据
   */
  reset() {
    this.state = {
      currentMonth: 0,
      isEditing: false,
      isShareModalOpen: false,
      monthsData: this._initMonthsData()
    };
    this._notifyListeners();
  }
}

// 导出单例（浏览器环境）
let stateManager;
if (typeof window !== 'undefined') {
  stateManager = new StateManager();
}

// ES Module 导出
export { StateManager, stateManager, MONTHS_CONFIG };
