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

describe('Date Utilities', () => {
  beforeEach(() => {
    // Reset timezone to ensure consistent tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatDate', () => {
    it('formats date correctly in Japanese', () => {
      const result = formatDate('2024-12-25');
      expect(result).toContain('2024年');
      expect(result).toContain('12月');
      expect(result).toContain('25日');
    });

    it('formats date correctly in English', () => {
      const result = formatDate('2024-12-25', 'en-US');
      expect(result).toContain('December');
      expect(result).toContain('25');
      expect(result).toContain('2024');
    });
  });

  describe('formatDateShort', () => {
    it('formats date in short format', () => {
      const result = formatDateShort('2024-12-25');
      expect(result).toBe('2024/12/25');
    });
  });

  describe('formatTime', () => {
    it('formats time correctly', () => {
      const result = formatTime('19:30');
      expect(result).toBe('19:30');
    });
  });

  describe('calculateDaysUntil', () => {
    it('calculates days until future event', () => {
      const result = calculateDaysUntil('2024-01-10');
      expect(result).toBe(9);
    });

    it('calculates days until past event', () => {
      const result = calculateDaysUntil('2023-12-25');
      expect(result).toBe(-7);
    });

    it('calculates days until today', () => {
      const result = calculateDaysUntil('2024-01-01');
      expect(result).toBe(0);
    });
  });

  describe('isEventPast', () => {
    it('returns true for past event', () => {
      const result = isEventPast('2023-12-25');
      expect(result).toBe(true);
    });

    it('returns false for future event', () => {
      const result = isEventPast('2024-01-10');
      expect(result).toBe(false);
    });
  });

  describe('isEventToday', () => {
    it('returns true for today\'s event', () => {
      const result = isEventToday('2024-01-01');
      expect(result).toBe(true);
    });

    it('returns false for other day\'s event', () => {
      const result = isEventToday('2024-01-02');
      expect(result).toBe(false);
    });
  });

  describe('isEventThisMonth', () => {
    it('returns true for this month\'s event', () => {
      const result = isEventThisMonth('2024-01-15');
      expect(result).toBe(true);
    });

    it('returns false for other month\'s event', () => {
      const result = isEventThisMonth('2024-02-15');
      expect(result).toBe(false);
    });
  });
});

describe('String Utilities', () => {
  describe('truncateText', () => {
    it('truncates long text', () => {
      const result = truncateText('This is a very long text', 10);
      expect(result).toBe('This is a ...');
    });

    it('returns original text if shorter than max length', () => {
      const result = truncateText('Short text', 20);
      expect(result).toBe('Short text');
    });
  });

  describe('capitalizeFirst', () => {
    it('capitalizes first letter', () => {
      const result = capitalizeFirst('hello world');
      expect(result).toBe('Hello world');
    });

    it('returns empty string for empty input', () => {
      const result = capitalizeFirst('');
      expect(result).toBe('');
    });
  });

  describe('formatPrice', () => {
    it('formats price in Japanese yen', () => {
      const result = formatPrice(5000);
      expect(result).toBe('￥5,000');
    });

    it('formats price with decimals', () => {
      const result = formatPrice(5000.5);
      expect(result).toBe('￥5,001');
    });
  });
});

describe('Array Utilities', () => {
  describe('groupBy', () => {
    it('groups objects by key', () => {
      const data = [
        { id: 1, category: 'A', name: 'Item 1' },
        { id: 2, category: 'B', name: 'Item 2' },
        { id: 3, category: 'A', name: 'Item 3' },
      ];

      const result = groupBy(data, 'category');

      expect(result).toEqual({
        A: [
          { id: 1, category: 'A', name: 'Item 1' },
          { id: 3, category: 'A', name: 'Item 3' },
        ],
        B: [
          { id: 2, category: 'B', name: 'Item 2' },
        ],
      });
    });
  });

  describe('sortBy', () => {
    it('sorts array by key in ascending order', () => {
      const data = [
        { id: 3, name: 'C' },
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ];

      const result = sortBy(data, 'id');

      expect(result).toEqual([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
      ]);
    });

    it('sorts array by key in descending order', () => {
      const data = [
        { id: 1, name: 'A' },
        { id: 3, name: 'C' },
        { id: 2, name: 'B' },
      ];

      const result = sortBy(data, 'id', 'desc');

      expect(result).toEqual([
        { id: 3, name: 'C' },
        { id: 2, name: 'B' },
        { id: 1, name: 'A' },
      ]);
    });
  });
});

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('returns true for valid email', () => {
      const result = isValidEmail('test@example.com');
      expect(result).toBe(true);
    });

    it('returns false for invalid email', () => {
      const result = isValidEmail('invalid-email');
      expect(result).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('returns true for valid URL', () => {
      const result = isValidUrl('https://example.com');
      expect(result).toBe(true);
    });

    it('returns false for invalid URL', () => {
      const result = isValidUrl('not-a-url');
      expect(result).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('returns true for valid date string', () => {
      const result = isValidDate('2024-01-01');
      expect(result).toBe(true);
    });

    it('returns false for invalid date string', () => {
      const result = isValidDate('not-a-date');
      expect(result).toBe(false);
    });
  });
});

describe('Photo Utilities', () => {
  describe('parsePhotoArray', () => {
    it('parses valid JSON array', () => {
      const result = parsePhotoArray('["photo1.jpg", "photo2.jpg"]');
      expect(result).toEqual(['photo1.jpg', 'photo2.jpg']);
    });

    it('returns empty array for invalid JSON', () => {
      const result = parsePhotoArray('invalid json');
      expect(result).toEqual([]);
    });

    it('returns empty array for non-array JSON', () => {
      const result = parsePhotoArray('{"not": "array"}');
      expect(result).toEqual([]);
    });
  });

  describe('stringifyPhotoArray', () => {
    it('stringifies array to JSON', () => {
      const result = stringifyPhotoArray(['photo1.jpg', 'photo2.jpg']);
      expect(result).toBe('["photo1.jpg","photo2.jpg"]');
    });

    it('stringifies empty array', () => {
      const result = stringifyPhotoArray([]);
      expect(result).toBe('[]');
    });
  });
});
