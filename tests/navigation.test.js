/**
 * 导航栏属性测试
 * Property 3: 月份导航正确性
 * Property 4: 进度指示正确性
 * Validates: Requirements 3.2, 3.3, 3.6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateProgress,
  canNavigatePrev,
  canNavigateNext
} from '../scripts/navigation.js';

describe('导航栏属性测试', () => {
  /**
   * Property 3: 月份导航正确性
   * *For any* 月份 M (0-11)，点击"下一个月"按钮后，当前月份应变为 M+1；
   * *For any* 月份 M (1-12)，点击"上一个月"按钮后，当前月份应变为 M-1。
   * Validates: Requirements 3.2, 3.3
   */
  describe('Property 3: 月份导航正确性', () => {
    it('对于任意月份 M (0-11)，canNavigateNext 应返回 true', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 11 }),
          (month) => {
            return canNavigateNext(month) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于月份 12，canNavigateNext 应返回 false', () => {
      expect(canNavigateNext(12)).toBe(false);
    });

    it('对于任意月份 M (1-12)，canNavigatePrev 应返回 true', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 12 }),
          (month) => {
            return canNavigatePrev(month) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于月份 0，canNavigatePrev 应返回 false', () => {
      expect(canNavigatePrev(0)).toBe(false);
    });

    it('导航边界条件：0月只能前进，12月只能后退', () => {
      // 0月：不能后退，可以前进
      expect(canNavigatePrev(0)).toBe(false);
      expect(canNavigateNext(0)).toBe(true);
      
      // 12月：可以后退，不能前进
      expect(canNavigatePrev(12)).toBe(true);
      expect(canNavigateNext(12)).toBe(false);
    });

    it('对于任意中间月份 M (1-11)，双向导航都应可用', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 11 }),
          (month) => {
            return canNavigatePrev(month) === true && 
                   canNavigateNext(month) === true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: 进度指示正确性
   * *For any* 月份 M (0-12)，进度指示应显示 Math.round((M / 12) * 100) + '%'。
   * Validates: Requirements 3.6
   */
  describe('Property 4: 进度指示正确性', () => {
    it('对于任意月份，calculateProgress 应返回正确的百分比', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 12 }),
          (month) => {
            const expected = Math.round((month / 12) * 100);
            const actual = calculateProgress(month);
            return actual === expected;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('进度值应在 0-100 范围内', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 12 }),
          (month) => {
            const progress = calculateProgress(month);
            return progress >= 0 && progress <= 100;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('进度应随月份单调递增', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 11 }),
          (month) => {
            const currentProgress = calculateProgress(month);
            const nextProgress = calculateProgress(month + 1);
            return nextProgress >= currentProgress;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('边界值验证：0月为0%，12月为100%', () => {
      expect(calculateProgress(0)).toBe(0);
      expect(calculateProgress(12)).toBe(100);
    });

    it('进度值应为整数', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 12 }),
          (month) => {
            const progress = calculateProgress(month);
            return Number.isInteger(progress);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
