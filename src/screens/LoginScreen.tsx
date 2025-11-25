import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { theme, typography } from '../styles/theme';

const LoginScreen = () => {
  const { login, loginAsGuest, isLoading } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="musical-notes" size={80} color={theme.colors.text.primary} />
          <Text style={styles.title}>MEMOLIVE</Text>
          <Text style={styles.subtitle}>あなたのライブ参戦履歴を管理しよう</Text>
        </View>

        <View style={styles.form}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={login}
            disabled={isLoading}
          >
            <Ionicons name="logo-google" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Googleでログイン</Text>
          </TouchableOpacity>

          {/* 開発用ゲストログインボタン */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.guestButton}
              onPress={loginAsGuest}
              disabled={isLoading}
            >
              <Text style={styles.guestButtonText}>ゲストとしてログイン (Dev)</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    ...typography.brand,
    marginTop: 24,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  form: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.text.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    maxWidth: 300,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  guestButton: {
    paddingVertical: 12,
  },
  guestButtonText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
