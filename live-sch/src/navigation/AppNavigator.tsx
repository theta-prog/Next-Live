import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screen imports
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

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Memories') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Artists') {
            iconName = focused ? 'people' : 'people-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
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

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
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
  );
};

export default AppNavigator;
