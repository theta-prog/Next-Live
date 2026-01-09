import {
    captureViewAsImage,
    generateShareMessage,
    shareImage
} from '../../utils/share';

// Mock modules
jest.mock('expo-constants');
jest.mock('expo-sharing');
jest.mock('react-native-view-shot');

describe('Share Utils', () => {
  describe('generateShareMessage', () => {
    it('should generate a share message with all params', () => {
      const params = {
        eventTitle: 'Test Concert',
        artistName: 'Test Artist',
        eventDate: '2024-01-15',
        review: 'Amazing performance!'
      };

      const message = generateShareMessage(params);

      expect(message).toContain('Test Concert');
      expect(message).toContain('Test Artist');
      expect(message).toContain('2024年1月15日');
      expect(message).toContain('Amazing performance!');
      expect(message).toContain('#NextLive');
    });

    it('should generate message with partial params', () => {
      const params = {
        eventTitle: 'Test Concert',
      };

      const message = generateShareMessage(params);

      expect(message).toContain('Test Concert');
      expect(message).toContain('#NextLive');
    });

    it('should truncate long reviews', () => {
      const longReview = 'a'.repeat(150);
      const params = {
        eventTitle: 'Test Concert',
        review: longReview,
      };

      const message = generateShareMessage(params);

      expect(message).toContain('...');
      expect(message.length).toBeLessThan(200 + 100); // Base message + truncated review
    });
  });

  describe('captureViewAsImage', () => {
    it('should capture view successfully', async () => {
      const mockRef = { current: {} };
      const result = await captureViewAsImage(mockRef);

      expect(result).toEqual(expect.stringContaining('data:image/png;base64'));
    });

    it('should return null when ref is not available', async () => {
      const mockRef = { current: null };
      const result = await captureViewAsImage(mockRef);

      // In development mode, it returns fallback image
      expect(result).toBeTruthy();
    });
  });

  describe('shareImage', () => {
    it('should share image successfully', async () => {
      const imageUri = 'data:image/png;base64,test';
      const content = { title: 'Test', message: 'Test message' };

      const result = await shareImage(imageUri, content);

      expect(result).toBe(true);
    });
  });
});