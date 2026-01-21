import axios from 'axios';
import { API_BASE_URL } from '../config';
import { storage } from '../utils/storage';

// カスタムイベントエミッター（認証失敗時にAuthContextに通知するため）
type AuthEventListener = () => void;
const authEventListeners: AuthEventListener[] = [];

export const authEvents = {
  addLogoutListener: (listener: AuthEventListener) => {
    authEventListeners.push(listener);
    return () => {
      const index = authEventListeners.indexOf(listener);
      if (index > -1) {
        authEventListeners.splice(index, 1);
      }
    };
  },
  emitLogout: () => {
    authEventListeners.forEach(listener => listener());
  }
};

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
client.interceptors.request.use(async (config) => {
  const token = await storage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for refresh token
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await storage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Call refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        await storage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          await storage.setItem('refreshToken', newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        // リフレッシュトークンが無効な場合、ストレージをクリアしてログアウトを通知
        console.log('Token refresh failed, triggering logout');
        await storage.removeItem('accessToken');
        await storage.removeItem('refreshToken');
        await storage.removeItem('userInfo');
        // AuthContextにログアウトを通知
        authEvents.emitLogout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
