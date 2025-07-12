const React = require('react');

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

const createMockComponent = (name) => 
  React.forwardRef((props, ref) => {
    return React.createElement('View', { ...props, ref, testID: props.testID || name });
  });

module.exports = {
  // Navigation
  NavigationContainer: createMockComponent('NavigationContainer'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    reset: mockReset,
    dispatch: jest.fn(),
    setParams: jest.fn(),
    isFocused: jest.fn(() => true),
  }),
  useRoute: () => ({
    params: {},
    key: 'test-key',
    name: 'test-screen',
  }),
  useFocusEffect: jest.fn(),
  
  // Bottom Tabs
  createBottomTabNavigator: () => ({
    Navigator: createMockComponent('TabNavigator'),
    Screen: createMockComponent('TabScreen'),
  }),
  
  // Stack
  createStackNavigator: () => ({
    Navigator: createMockComponent('StackNavigator'),
    Screen: createMockComponent('StackScreen'),
  }),
  
  // Common Actions
  CommonActions: {
    navigate: jest.fn(),
    reset: jest.fn(),
    goBack: jest.fn(),
  },
};
