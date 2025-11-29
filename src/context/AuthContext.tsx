import axios from 'axios';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';
import { API_BASE_URL } from '../config';
import { storage } from '../utils/storage';

WebBrowser.maybeCompleteAuthSession();

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
  });

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleLogin(id_token);
      }
    }
  }, [response]);

  const checkLoginStatus = async () => {
    try {
      const accessToken = await storage.getItem('accessToken');
      if (accessToken) {
        const userInfo = await storage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
      }
    } catch (error) {
      console.error('Check login status error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
