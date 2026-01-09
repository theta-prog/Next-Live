// Mock expo-web-browser
export const openBrowserAsync = jest.fn(() => Promise.resolve({ type: 'cancel' }));

export const dismissBrowser = jest.fn(() => Promise.resolve());

export const warmUpAsync = jest.fn(() => Promise.resolve());

export const coolDownAsync = jest.fn(() => Promise.resolve());

export const maybeCompleteAuthSession = jest.fn(() => Promise.resolve());

export default {
  openBrowserAsync,
  dismissBrowser,
  warmUpAsync,
  coolDownAsync,
  maybeCompleteAuthSession,
};