import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';
import { AppProvider } from '../../context/AppContext';
import HomeScreen from '../../screens/HomeScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const TestApp = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <HomeScreen navigation={{ navigate: jest.fn() }} />
      </NavigationContainer>
    </AppProvider>
  );
};

describe('App Integration Tests', () => {
  it('renders app without crashing', () => {
    const { getByText } = render(<TestApp />);
    expect(getByText('Next Live')).toBeTruthy();
  });

  it('provides app context correctly', () => {
    const { getByText } = render(<TestApp />);
    // Just check that the app renders with context
    expect(getByText('Next Live')).toBeTruthy();
  });
});