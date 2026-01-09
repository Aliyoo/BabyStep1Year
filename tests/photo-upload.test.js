/**
 * PhotoUpload 属性测试
 * Property 7: 文件类型验证
 * Validates: Requirements 11.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  validateFileType, 
  validateFileSize, 
  validateFile,
  SUPPORTED_TYPES,
  MAX_FILE_SIZE 
} from '../scripts/photo-upload.js';

/**
 * Property 7: 文件类型验证
 * *For any* 文件 F，如果 F 的 MIME 类型是 'image/jpeg'、'image/png' 或 'image/webp'，
 * 则验证应通过；否则验证应失败。
 * Validates: Requirements 11.3
 */
describe('Property 7: 文件类型验证', () => {
  // 支持的 MIME 类型
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  // 不支持的 MIME 类型示例
  const unsupportedTypes = [
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/tiff',
    'application/pdf',
    'text/plain',
    'video/mp4',
    'audio/mpeg',
    'application/json',
    'text/html'
  ];

  describe('validateFileType', () => {
    it('对于任意支持的 MIME 类型，验证应通过', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...supportedTypes),
          fc.integer({ min: 1, max: MAX_FILE_SIZE }),
          (mimeType, size) => {
            const file = new File(['test'], 'test.jpg', { type: mimeType });
            Object.defineProperty(file, 'size', { value: size });
            return validateFileType(file) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任意不支持的 MIME 类型，验证应失败', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...unsupportedTypes),
          fc.integer({ min: 1, max: MAX_FILE_SIZE }),
          (mimeType, size) => {
            const file = new File(['test'], 'test.file', { type: mimeType });
            Object.defineProperty(file, 'size', { value: size });
            return validateFileType(file) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于随机生成的非图片 MIME 类型，验证应失败', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !supportedTypes.includes(s)),
          (mimeType) => {
            const file = new File(['test'], 'test.file', { type: mimeType });
            return validateFileType(file) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于 null 或 undefined 文件，验证应失败', () => {
      expect(validateFileType(null)).toBe(false);
      expect(validateFileType(undefined)).toBe(false);
    });

    it('对于没有 type 属性的对象，验证应失败', () => {
      expect(validateFileType({})).toBe(false);
      expect(validateFileType({ name: 'test.jpg' })).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('对于任意小于等于最大限制的文件大小，验证应通过', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: MAX_FILE_SIZE }),
          (size) => {
            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            Object.defineProperty(file, 'size', { value: size });
            return validateFileSize(file) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任意大于最大限制的文件大小，验证应失败', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MAX_FILE_SIZE + 1, max: MAX_FILE_SIZE * 10 }),
          (size) => {
            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            Object.defineProperty(file, 'size', { value: size });
            return validateFileSize(file) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于 null 或 undefined 文件，验证应失败', () => {
      expect(validateFileSize(null)).toBe(false);
      expect(validateFileSize(undefined)).toBe(false);
    });
  });

  describe('validateFile (综合验证)', () => {
    it('对于任意有效文件（支持的类型且大小合适），验证应通过', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...supportedTypes),
          fc.integer({ min: 1, max: MAX_FILE_SIZE }),
          (mimeType, size) => {
            const file = new File(['test'], 'test.jpg', { type: mimeType });
            Object.defineProperty(file, 'size', { value: size });
            const result = validateFile(file);
            return result.valid === true && result.error === undefined;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任意无效类型的文件，验证应失败并返回类型错误', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...unsupportedTypes),
          fc.integer({ min: 1, max: MAX_FILE_SIZE }),
          (mimeType, size) => {
            const file = new File(['test'], 'test.file', { type: mimeType });
            Object.defineProperty(file, 'size', { value: size });
            const result = validateFile(file);
            return result.valid === false && result.error.includes('不支持的文件格式');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任意超大文件，验证应失败并返回大小错误', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...supportedTypes),
          fc.integer({ min: MAX_FILE_SIZE + 1, max: MAX_FILE_SIZE * 10 }),
          (mimeType, size) => {
            const file = new File(['test'], 'test.jpg', { type: mimeType });
            Object.defineProperty(file, 'size', { value: size });
            const result = validateFile(file);
            return result.valid === false && result.error.includes('文件过大');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于 null 文件，验证应失败并返回选择文件错误', () => {
      const result = validateFile(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('请选择文件');
    });
  });
});
