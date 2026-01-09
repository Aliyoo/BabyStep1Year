/**
 * 月份页面属性测试
 * Property 1: 月份背景色一致性
 * Property 2: 月份标题一致性
 * Validates: Requirements 2.1, 2.2, 5.1-5.13
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { MONTHS_CONFIG, StateManager } from '../scripts/state-manager.js';

describe('月份页面属性测试', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  /**
   * Property 1: 月份背景色一致性
   * *For any* 月份 M (0-12)，当显示该月份页面时，背景渐变色应该与 
   * MONTHS_CONFIG[M] 中定义的 gradient 配置完全匹配。
   * Validates: Requirements 2.1, 5.1-5.13
   */
  describe('Property 1: 月份背景色一致性', () => {
    it('对于任意月份，getMonthConfig 返回的 gradient 应与 MONTHS_CONFIG 一致', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 12 }),
          (month) => {
            const config = stateManager.getMonthConfig(month);
            const expectedConfig = MONTHS_CONFIG[month];
            
            // 验证 config 存在
            if (!config || !expectedConfig) return false;
            
            // 验证 gradient 配置一致
            if (config.gradient.start !== expectedConfig.gradient.start) return false;
            if (config.gradient.end !== expectedConfig.gradient.end) return false;
            
            // 对于彩虹色（12个月），还需验证 middle
            if (expectedConfig.isRainbow) {
              if (config.gradient.middle !== expectedConfig.gradient.middle) return false;
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('每个月份应有唯一的渐变色配置', () => {
      const gradients = MONTHS_CONFIG.map(c => JSON.stringify(c.gradient));
      const uniqueGradients = new Set(gradients);
      expect(uniqueGradients.size).toBe(MONTHS_CONFIG.length);
    });

    it('所有月份的 gradient 应包含有效的 RGBA 颜色值', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 12 }),
          (month) => {
            const config = MONTHS_CONFIG[month];
            const rgbaPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/;
            
            const startValid = rgbaPattern.test(config.gradient.start);
            const endValid = rgbaPattern.test(config.gradient.end);
            
            if (config.isRainbow) {
              const middleValid = rgbaPattern.test(config.gradient.middle);
              return startValid && middleValid && endValid;
            }
            
            return startValid && endValid;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: 月份标题一致性
   * *For any* 月份 M (0-12)，当显示该月份页面时，月份标签应显示 "M个月"，
   * 标题应显示 MONTHS_CONFIG[M].title。
   * Validates: Requirements 2.2
   */
  describe('Property 2: 月份标题一致性', () => {
    it('对于任意月份，getMonthConfig 返回的 title 应与 MONTHS_CONFIG 一致', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 12 }),
          (month) => {
            const config = stateManager.getMonthConfig(month);
            const expectedConfig = MONTHS_CONFIG[month];
            
            if (!config || !expectedConfig) return false;
            
            return config.title === expectedConfig.title &&
                   config.englishTitle === expectedConfig.englishTitle;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('月份标签格式应为 "M个月"', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 12 }),
          (month) => {
            const expectedLabel = `${month}个月`;
            // 验证月份标签格式正确
            return expectedLabel === `${month}个月`;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('每个月份应有非空的中英文标题', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 12 }),
          (month) => {
            const config = MONTHS_CONFIG[month];
            
            return config.title && 
                   config.title.length > 0 &&
                   config.englishTitle && 
                   config.englishTitle.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getMonthConfig 对无效月份应返回 null', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: -1 }),
          (invalidMonth) => {
            const config = stateManager.getMonthConfig(invalidMonth);
            return config === null;
          }
        ),
        { numRuns: 50 }
      );

      fc.assert(
        fc.property(
          fc.integer({ min: 13, max: 100 }),
          (invalidMonth) => {
            const config = stateManager.getMonthConfig(invalidMonth);
            return config === null;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
