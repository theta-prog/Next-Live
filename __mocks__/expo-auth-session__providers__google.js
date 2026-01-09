// Mock expo-auth-session/providers/google
export const useGoogleAuth = jest.fn(() => ({
  request: null,
  response: null,
  promptAsync: jest.fn(),
}));

export const GoogleAuthRequest = jest.fn();

export default {
  useGoogleAuth,
  GoogleAuthRequest,
};