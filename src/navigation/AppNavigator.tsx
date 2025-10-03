import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Screen imports
import ArtistFormScreen from '../screens/ArtistFormScreen';
import ArtistsScreen from '../screens/ArtistsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HomeScreen from '../screens/HomeScreen';
import LiveEventDetailScreen from '../screens/LiveEventDetailScreen';
import LiveEventFormScreen from '../screens/LiveEventFormScreen';
import MemoriesScreen from '../screens/MemoriesScreen';
import MemoryDetailScreen from '../screens/MemoryDetailScreen';
import MemoryFormScreen from '../screens/MemoryFormScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
  const bottomPad = Math.max(insets.bottom, 12); // ensure a minimum padding for devices without inset
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabIconName(route.name, focused);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
            borderTopColor: '#eee',
            paddingTop: 6,
            paddingBottom: bottomPad,
            height: 62 + bottomPad, // dynamic height based on inset
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

const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator 
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#f5f5f5' },
          }}
        >
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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
