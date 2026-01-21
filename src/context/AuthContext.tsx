import axios from 'axios';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import client, { authEvents } from '../api/client';
import { API_BASE_URL } from '../config';
import { storage } from '../utils/storage';

WebBrowser.maybeCompleteAuthSession();

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Replace with actual Client IDs from Google Cloud Console
  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    responseType: 'id_token',
    scopes: ['profile', 'email'],
    redirectUri: makeRedirectUri({
      scheme: 'livesch',
      // Web環境では明示的にwindow.location.originを使用
      path: Platform.OS === 'web' ? undefined : 'auth',
    }),
  });

  // トークンをリフレッシュする関数
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = await storage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const res = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = res.data;

      await storage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        await storage.setItem('refreshToken', newRefreshToken);
      }
      console.log('Tokens refreshed successfully');
      return true;
    } catch (error) {
      console.log('Token refresh failed:', error);
      return false;
    }
  }, []);

  const checkLoginStatus = useCallback(async () => {
    try {
      const accessToken = await storage.getItem('accessToken');
      const userInfo = await storage.getItem('userInfo');
      const refreshToken = await storage.getItem('refreshToken');
      
      if (accessToken && userInfo) {
        setUser(JSON.parse(userInfo));
        
        // アクセストークンがあってもリフレッシュトークンが無ければ警告
        if (!refreshToken) {
          console.warn('Access token exists but no refresh token found');
        }
      } else if (refreshToken && userInfo) {
        // アクセストークンが無いがリフレッシュトークンがある場合、リフレッシュを試みる
        console.log('No access token, attempting to refresh...');
        const success = await refreshTokens();
        if (success) {
          setUser(JSON.parse(userInfo));
        } else {
          // リフレッシュ失敗時はストレージをクリアしてログアウト
          await storage.removeItem('accessToken');
          await storage.removeItem('refreshToken');
          await storage.removeItem('userInfo');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Check login status error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshTokens]);

  // 初期ログイン状態チェック
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // APIクライアントからのログアウト通知をリッスン
  useEffect(() => {
    const unsubscribe = authEvents.addLogoutListener(() => {
      console.log('Received logout event from API client');
      setUser(null);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleAppStateChange = (state: string) => {
      if (state === 'active') {
        checkLoginStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkLoginStatus();
      }
    };

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      subscription.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [checkLoginStatus]);

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken ?? response.params?.id_token;
      if (idToken) {
        handleGoogleLogin(idToken);
      } else {
        console.warn('Google login succeeded but no ID token was returned');
      }
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/v1/auth/google`, {
        idToken,
      });

      const { accessToken, refreshToken, user: userData } = res.data;

      await storage.setItem('accessToken', accessToken);
      await storage.setItem('refreshToken', refreshToken);
      await storage.setItem('userInfo', JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    await promptAsync();
  };

  const loginAsGuest = async () => {
    setIsLoading(true);
    try {
      // ダミーユーザーデータ
      const dummyUser: User = {
        id: 'guest_user_id',
        email: 'guest@example.com',
        name: 'Guest User',
        picture: 'https://via.placeholder.com/150',
      };

      // ダミートークン保存
      await storage.setItem('accessToken', 'dummy_access_token');
      await storage.setItem('refreshToken', 'dummy_refresh_token');
      await storage.setItem('userInfo', JSON.stringify(dummyUser));

      setUser(dummyUser);
    } catch (error) {
      console.error('Guest login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
        await client.post('/v1/auth/logout');
    } catch {
        // Ignore error
    }
    
    await storage.removeItem('accessToken');
    await storage.removeItem('refreshToken');
    await storage.removeItem('userInfo');
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginAsGuest, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
