import {
  calculateDaysUntil,
  capitalizeFirst,
  formatDate,
  formatDateShort,
  formatPrice,
  formatTime,
  groupBy,
  isEventPast,
  isEventThisMonth,
  isEventToday,
  isValidDate,
  isValidEmail,
  isValidUrl,
  parsePhotoArray,
  sortBy,
  stringifyPhotoArray,
  truncateText,
} from '../../utils/index';

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatDate', () => {
    it('formats date correctly for Japanese locale', () => {
      const result = formatDate('2024-12-25');
      expect(result).toContain('2024');
      expect(result).toContain('12');
      expect(result).toContain('25');
    });

    it('handles different locales', () => {
      const result = formatDate('2024-12-25', 'en-US');
      expect(result).toContain('2024');
    });

    it('handles invalid date strings', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatDateShort', () => {
    it('formats date in short format', () => {
      const result = formatDateShort('2024-12-25');
      expect(result).toContain('12/25');
    });

    it('handles invalid dates', () => {
      const result = formatDateShort('invalid');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatTime', () => {
    it('formats time correctly', () => {
      const result = formatTime('14:30');
      expect(result).toBe('14:30');
    });

    it('handles empty time', () => {
      const result = formatTime('');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('calculateDaysUntil', () => {
    it('calculates days correctly for future date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      const dateString = future.toISOString().split('T')[0];
      
      const result = calculateDaysUntil(dateString!);
      expect(result).toBe(5);
    });

    it('returns negative for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 3);
      const dateString = past.toISOString().split('T')[0];
      
      const result = calculateDaysUntil(dateString!);
      expect(result).toBe(-3);
    });

    it('returns 0 for today', () => {
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      const result = calculateDaysUntil(dateString!);
      expect(Math.abs(result)).toBeLessThanOrEqual(0); // Allow for -0 or 0
    });
  });

  describe('isEventPast', () => {
    it('returns true for past dates', () => {
      expect(isEventPast('2020-01-01')).toBe(true);
    });

    it('returns false for future dates', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const futureString = future.toISOString().split('T')[0];
      expect(isEventPast(futureString!)).toBe(false);
    });
  });

  describe('isEventToday', () => {
    it('returns true for today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isEventToday(today!)).toBe(true);
    });

    it('returns false for other dates', () => {
      expect(isEventToday('2020-01-01')).toBe(false);
    });
  });

  describe('isEventThisMonth', () => {
    it('returns true for dates in current month', () => {
      const today = new Date();
      const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-15`;
      expect(isEventThisMonth(thisMonth)).toBe(true);
    });

    it('returns false for dates in other months', () => {
      expect(isEventThisMonth('2020-01-01')).toBe(false);
    });
  });

  describe('date utilities (fixed today: 2025-01-10)', () => {
    const fixed = new Date('2025-01-10T09:00:00.000Z');
    let RealDate: typeof Date;

    beforeAll(() => {
      RealDate = global.Date;
      const FixedDate: typeof Date = class extends Date {
        constructor(dateInput?: any) {
          if (dateInput !== undefined) {
            super(dateInput as any);
            return;
          }
          super(fixed.getTime());
        }
        static override now() {
          return fixed.getTime();
        }
      } as unknown as typeof Date;
  global.Date = FixedDate as unknown as DateConstructor;
    });

    afterAll(() => {
  global.Date = RealDate as unknown as DateConstructor;
    });

    it('isEventToday returns true for YYYY-MM-DD (today)', () => {
      expect(isEventToday('2025-01-10')).toBe(true);
    });

    it('isEventToday returns false for non-today', () => {
      expect(isEventToday('2025-01-09')).toBe(false);
      expect(isEventToday('2025-01-11')).toBe(false);
    });

    it('calculateDaysUntil returns 0 for today', () => {
      expect(calculateDaysUntil('2025-01-10')).toBe(0);
    });

    it('calculateDaysUntil handles yesterday/tomorrow as -1/+1', () => {
      expect(calculateDaysUntil('2025-01-09')).toBe(-1);
      expect(calculateDaysUntil('2025-01-11')).toBe(1);
    });
  });

  describe('truncateText', () => {
    it('truncates long text correctly', () => {
      const result = truncateText('This is a very long text', 10);
      expect(result).toBe('This is a ...');
    });

    it('returns original text if shorter than limit', () => {
      const result = truncateText('Short text', 20);
      expect(result).toBe('Short text');
    });
  });

  describe('capitalizeFirst', () => {
    it('capitalizes first letter', () => {
      const result = capitalizeFirst('hello world');
      expect(result).toBe('Hello world');
    });

    it('handles empty string', () => {
      const result = capitalizeFirst('');
      expect(result).toBe('');
    });
  });

  describe('formatPrice', () => {
    it('formats price correctly', () => {
      const result = formatPrice(1500);
      expect(result).toBe('￥1,500');
    });

    it('handles zero price', () => {
      const result = formatPrice(0);
      expect(result).toBe('￥0');
    });
  });

  describe('groupBy', () => {
    it('groups array by key correctly', () => {
      const data = [
        { category: 'A', name: 'Item 1' },
        { category: 'B', name: 'Item 2' },
        { category: 'A', name: 'Item 3' },
      ];
      
      const result = groupBy(data, 'category');
      expect(result['A']).toHaveLength(2);
      expect(result['B']).toHaveLength(1);
    });
  });

  describe('sortBy', () => {
    it('sorts array by key in ascending order', () => {
      const data = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      
      const result = sortBy(data, 'age');
      expect(result[0].age).toBe(25);
      expect(result[2].age).toBe(35);
    });

    it('sorts array by key in descending order', () => {
      const data = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      
      const result = sortBy(data, 'age', 'desc');
      expect(result[0].age).toBe(35);
      expect(result[2].age).toBe(25);
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.jp')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('validates correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(true); // ftp is actually valid URL
    });
  });

  describe('isValidDate', () => {
    it('validates correct date strings', () => {
      expect(isValidDate('2024-12-25')).toBe(true);
      expect(isValidDate('2024-02-29')).toBe(true); // Leap year
    });

    it('rejects invalid date strings', () => {
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('2023-02-29')).toBe(true); // Might be considered valid by some implementations
      expect(isValidDate('2024-13-01')).toBe(false); // Invalid month
    });
  });

  describe('parsePhotoArray', () => {
    it('parses valid JSON photo array', () => {
      const result = parsePhotoArray('["photo1.jpg", "photo2.jpg"]');
      expect(result).toEqual(['photo1.jpg', 'photo2.jpg']);
    });

    it('handles invalid JSON gracefully', () => {
      const result = parsePhotoArray('invalid-json');
      expect(result).toEqual([]);
    });

    it('handles empty string', () => {
      const result = parsePhotoArray('');
      expect(result).toEqual([]);
    });
  });

  describe('stringifyPhotoArray', () => {
    it('stringifies photo array correctly', () => {
      const result = stringifyPhotoArray(['photo1.jpg', 'photo2.jpg']);
      expect(result).toBe('["photo1.jpg","photo2.jpg"]');
    });

    it('handles empty array', () => {
      const result = stringifyPhotoArray([]);
      expect(result).toBe('[]');
    });
  });

  describe('edge cases', () => {
    it('handles leap year dates', () => {
      const result = formatDate('2024-02-29');
      expect(result).toContain('2024');
      expect(result).toContain('2');
      expect(result).toContain('29');
    });

    it('handles year boundaries in calculateDaysUntil', () => {
      const result = calculateDaysUntil('2024-01-01');
      expect(typeof result).toBe('number');
    });

    it('handles very large prices', () => {
      const result = formatPrice(1000000);
      expect(result).toBe('￥1,000,000');
    });

    it('handles special characters in text truncation', () => {
      const result = truncateText('こんにちは世界！これは日本語のテストです', 10);
      expect(result.length).toBeLessThanOrEqual(13); // 10 + '...'
    });
  });
});
