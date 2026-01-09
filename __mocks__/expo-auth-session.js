// Mock expo-auth-session
export const makeRedirectUri = jest.fn(() => 'http://localhost:3000/auth');

export const useAuthRequest = jest.fn(() => [
  null, // request
  null, // result
  jest.fn(), // promptAsync
]);

export const ResponseType = {
  Code: 'code',
  Token: 'token',
};

export const AuthSessionResult = {
  SUCCESS: 'success',
  CANCEL: 'cancel',
  DISMISS: 'dismiss',
  LOCKED: 'locked',
};

export default {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
  AuthSessionResult,
};