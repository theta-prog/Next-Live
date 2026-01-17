import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import ResponsiveLayout, { PC_BREAKPOINT } from '../components/ResponsiveLayout';
import { useAuth } from '../context/AuthContext';
import { ResponsiveProvider } from '../context/ResponsiveContext';
import ArtistDetailScreen from '../screens/ArtistDetailScreen';
import ArtistFormScreen from '../screens/ArtistFormScreen';
import ArtistsScreen from '../screens/ArtistsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HomeScreen from '../screens/HomeScreen';
import LiveEventDetailScreen from '../screens/LiveEventDetailScreen';
import LiveEventFormScreen from '../screens/LiveEventFormScreen';
import LoginScreen from '../screens/LoginScreen';
import MemoriesScreen from '../screens/MemoriesScreen';
import MemoryDetailScreen from '../screens/MemoryDetailScreen';
import MemoryFormScreen from '../screens/MemoryFormScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const BRAND_COLOR = '#0095f6';
const TAB_SCREENS = ['Home', 'Calendar', 'Memories', 'Artists'];

// Hook to detect PC mode
const useIsPC = () => {
  const [isPC, setIsPC] = useState(
    Platform.OS === 'web' && Dimensions.get('window').width >= PC_BREAKPOINT
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleResize = () => {
      setIsPC(window.innerWidth >= PC_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isPC;
};

export const getTabIconName = (
  routeName: string,
  focused: boolean
): keyof typeof Ionicons.glyphMap => {
  if (routeName === 'Home') {
    return (focused ? 'home' : 'home-outline') as keyof typeof Ionicons.glyphMap;
  } else if (routeName === 'Calendar') {
    return (focused ? 'calendar' : 'calendar-outline') as keyof typeof Ionicons.glyphMap;
  } else if (routeName === 'Memories') {
    return (focused ? 'heart' : 'heart-outline') as keyof typeof Ionicons.glyphMap;
  } else if (routeName === 'Artists') {
    return (focused ? 'people' : 'people-outline') as keyof typeof Ionicons.glyphMap;
  }
  return 'help-outline';
};

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 12);
  const isPC = useIsPC();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabIconName(route.name, focused);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: BRAND_COLOR,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: isPC ? { display: 'none' } : {
          backgroundColor: '#fff',
          borderTopWidth: 1,
            borderTopColor: '#eee',
            paddingTop: 6,
            paddingBottom: bottomPad,
            height: 62 + bottomPad,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
          headerShown: false,
        })}
      >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'ホーム' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ tabBarLabel: 'カレンダー' }}
      />
      <Tab.Screen 
        name="Memories" 
        component={MemoriesScreen} 
        options={{ tabBarLabel: '思い出' }}
      />
      <Tab.Screen 
        name="Artists" 
        component={ArtistsScreen} 
        options={{ tabBarLabel: 'アーティスト' }}
      />
    </Tab.Navigator>
  );
};

// Export TabNavigator for testing
export { TabNavigator };

// Wrapper component to handle responsive layout with navigation
const ResponsiveNavigationWrapper: React.FC<{ 
  children: React.ReactNode;
  userName?: string;
  userPicture?: string;
  onLogout?: () => void;
}> = ({ children, userName, userPicture, onLogout }) => {
  const navigationRef = React.useRef<any>(null);
  const [currentRoute, setCurrentRoute] = useState('Home');

  const handleNavigate = useCallback((routeName: string) => {
    if (navigationRef.current) {
      if (TAB_SCREENS.includes(routeName)) {
        // タブ画面への遷移
        navigationRef.current.navigate('Main', { screen: routeName });
        setCurrentRoute(routeName);
      } else {
        // Stack画面（フォーム等）への遷移
        navigationRef.current.navigate(routeName);
      }
    }
  }, []);

  const onStateChange = useCallback(() => {
    if (navigationRef.current) {
      const state = navigationRef.current.getRootState();
      if (state) {
        // 現在のルートを確認
        const currentIndex = state.index;
        const currentMainRoute = state.routes[currentIndex];
        
        // Mainルート（タブナビゲーター）の場合
        if (currentMainRoute?.name === 'Main' && currentMainRoute?.state) {
          const tabState = currentMainRoute.state;
          const tabIndex = tabState.index ?? 0;
          const currentTab = tabState.routes[tabIndex];
          if (currentTab) {
            setCurrentRoute(currentTab.name);
          }
        }
        // Mainルート以外（Stack画面）の場合はcurrentRouteを変更しない
        // これにより、フォーム画面でもヘッダーは前のタブ名を維持
      }
    }
  }, []);

  return (
    <ResponsiveLayout
      currentRoute={currentRoute}
      onNavigate={handleNavigate}
      showSideNav={true}
      userName={userName}
      userPicture={userPicture}
      onLogout={onLogout}
    >
      <NavigationContainer ref={navigationRef} onStateChange={onStateChange}>
        {children}
      </NavigationContainer>
    </ResponsiveLayout>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={BRAND_COLOR} />
      </View>
    );
  }

  return (
    <ResponsiveProvider>
      <SafeAreaProvider>
        <ResponsiveNavigationWrapper
          userName={user?.name}
          userPicture={user?.picture}
          onLogout={logout}
        >
          <StatusBar style="auto" />
          <Stack.Navigator 
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#f5f5f5' },
            }}
          >
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen 
                name="ArtistForm" 
                component={ArtistFormScreen}
                options={{
                  headerShown: false,
                  presentation: 'modal',
                }}
              />
              <Stack.Screen 
                name="ArtistDetail" 
                component={ArtistDetailScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="LiveEventForm" 
                component={LiveEventFormScreen}
                options={{
                  headerShown: false,
                  presentation: 'modal',
                }}
              />
              <Stack.Screen 
                name="LiveEventDetail" 
                component={LiveEventDetailScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="MemoryForm" 
                component={MemoryFormScreen}
                options={{
                  headerShown: false,
                  presentation: 'modal',
                }}
              />
              <Stack.Screen 
                name="MemoryDetail" 
                component={MemoryDetailScreen}
                options={{
                  headerShown: false,
                }}
              />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </ResponsiveNavigationWrapper>
    </SafeAreaProvider>
  </ResponsiveProvider>
  );
};

export default AppNavigator;
