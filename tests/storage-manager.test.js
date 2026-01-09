/**
 * StorageManager 属性测试
 * Property 5: 照片存储 Round-Trip
 * Property 6: 内容编辑 Round-Trip
 * Property 8: 浏览进度持久化
 * Validates: Requirements 10.1, 11.5, 11.6, 12.5, 12.7
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StorageManager } from '../scripts/storage-manager.js';

describe('StorageManager 属性测试', () => {
  let storage;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager();
  });

  /**
   * Property 8: 浏览进度持久化
   * *For any* 月份 M，当用户浏览到该月份后，saveProgress(M) 应被调用，
   * 且后续 getProgress() 应返回 M。
   * Validates: Requirements 10.1
   */
  describe('Property 8: 浏览进度持久化', () => {
    it('对于任意有效月份，保存后读取应返回相同值', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 12 }),
          (month) => {
            storage.saveProgress(month);
            const retrieved = storage.getProgress();
            return retrieved === month;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Property 6: 内容编辑 Round-Trip
   * *For any* 月份 M 和有效的编辑内容 C（包含 story 和 milestones），
   * 执行 saveMonthData(M, C) 后再执行 getMonthData(M)，应返回与 C 等价的数据对象。
   * Validates: Requirements 12.5, 12.7
   */
  describe('Property 6: 内容编辑 Round-Trip', () => {
    const milestoneArb = fc.record({
      label: fc.string({ minLength: 1, maxLength: 20 }),
      value: fc.string({ minLength: 1, maxLength: 50 }),
      completed: fc.boolean()
    });

    const monthDataArb = fc.record({
      month: fc.integer({ min: 0, max: 12 }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
      story: fc.string({ minLength: 0, maxLength: 500 }),
      milestones: fc.array(milestoneArb, { minLength: 0, maxLength: 10 }),
      photoUrl: fc.option(fc.webUrl(), { nil: null }),
      customized: fc.boolean()
    });

    it('对于任意月份数据，保存后读取应返回等价对象', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 12 }),
          monthDataArb,
          (month, data) => {
            storage.saveMonthData(month, data);
            const retrieved = storage.getMonthData(month);
            return JSON.stringify(retrieved) === JSON.stringify(data);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: 照片存储 Round-Trip
   * *For any* 有效的图片文件 F 和月份 M，执行 savePhoto(M, F) 后再执行 getPhoto(M)，
   * 应返回与 F 内容等价的图片数据。
   * Validates: Requirements 11.5, 11.6
   */
  describe('Property 5: 照片存储 Round-Trip', () => {
    it('对于任意图片数据，保存后读取应返回等价的 Data URL', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 12 }),
          fc.uint8Array({ minLength: 10, maxLength: 500 }),
          async (month, imageData) => {
            const blob = new Blob([imageData], { type: 'image/png' });
            
            await storage.savePhoto(month, blob);
            const retrieved = await storage.getPhoto(month);
            
            // 验证返回的是有效的 Data URL
            if (!retrieved) return false;
            if (!retrieved.startsWith('data:')) return false;
            
            // 解码 Data URL 并比较内容
            const base64Part = retrieved.split(',')[1];
            const decodedData = Uint8Array.from(atob(base64Part), c => c.charCodeAt(0));
            
            if (decodedData.length !== imageData.length) return false;
            for (let i = 0; i < imageData.length; i++) {
              if (decodedData[i] !== imageData[i]) return false;
            }
            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 30000);
  });
});
