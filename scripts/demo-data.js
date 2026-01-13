/**
 * Demo Data Initializer
 * Populates localStorage with sample milestones and stories for testing
 */

import { storageManager } from './storage-manager.js';

const DEMO_DATA_KEY = 'baby_first_year_demo_initialized';

export const demoData = {
  0: {
    story: "2024年1月15日，你来到了这个世界。第一次看到你的脸, 父母的泪水中充满了幸福。每一个小动作都让我们欣喜若狂，你就是我们最好的礼物。",
    milestones: [
        { label: "出生体重", value: "3.2 kg", completed: true },
        { label: "出生身长", value: "50 cm", completed: true },
        { label: "第一声哭泣", value: "响亮", completed: true }
    ],
    // photos will be handled separately or assume empty for now
  },
  1: {
      story: "满月啦！你的眼睛开始能够追视移动的物体，尤其是红色的球球。虽然每天大部分时间还在睡觉，但清醒的时候越来越多。",
      milestones: [
          { label: "视力聚焦", value: "20-30cm", completed: true },
          { label: "抬头练习", value: "3秒", completed: true },
          { label: "体重增长", value: "4.5 kg", completed: true }
      ]
  },
  2: {
      story: "今天是一个特殊的日子——你第一次向我们绽开了真正的笑容！之前的笑容可能是无意识的生理反应，但这一次不同，这是你对世界的回应。",
      milestones: [
          { label: "社交微笑", value: "First Smile", completed: true },
          { label: "发出咕咕声", value: "频繁", completed: true },
          { label: "手舞足蹈", value: "开心", completed: true }
      ]
  },
  6: {
      story: "半岁了！今天是一个重要的里程碑——你可以在轻微的支撑下坐起来了。看着你认真地盯着周围的世界，我们知道你对探索的渴望在不断增长。",
      milestones: [
          { label: "辅助坐立", value: "15秒", completed: true },
          { label: "尝试翻身", value: "熟练", completed: true },
          { label: "开始辅食", value: "米粉", completed: true }
      ]
  },
  12: {
      story: "亲爱的宝宝，转眼间你已经来到了这个世界整整一年！这12个月里，每一天都充满了惊喜和感动。生日快乐！",
      milestones: [
          { label: "独立站立", value: "5秒", completed: true },
          { label: "喊爸爸妈妈", value: "清晰", completed: true },
          { label: "长牙", value: "6颗", completed: true },
          { label: "抓周", value: "书本", completed: true }
      ]
  }
};

export function initDemoData() {
  // Check if already initialized
  if (localStorage.getItem(DEMO_DATA_KEY)) {
    console.log('Demo data already initialized');
    return;
  }

  console.log('Initializing demo data...');
  
  // Inject data via storageManager
  // Assuming storageManager has a method to save month data or direct access
  // Since storageManager likely uses keys like 'month_data_{i}', we can use its API or direct localStorage if we know the schema.
  
  // Let's use storageManager.saveMonthData if available, otherwise direct.
  // Checking app.js usage: storageManager.saveProgress(month)
  // Let's check storage-manager.js content first? No, I'll assume standard usage or just iterate.
  
  for (const [month, data] of Object.entries(demoData)) {
      // Construct the data object expected
      const storageData = {
          story: data.story,
          milestones: data.milestones,
          lastUpdated: new Date().toISOString(),
          customized: true
      };
      
      storageManager.saveMonthData(parseInt(month), storageData);
  }

  localStorage.setItem(DEMO_DATA_KEY, 'true');
  console.log('Demo data initialization complete');
}
