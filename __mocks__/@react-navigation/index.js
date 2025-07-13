/* global jest */

const React = require('react');

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

const createMockComponent = (name) => {
  const component = React.forwardRef((props, ref) => {
    return React.createElement('View', { ...props, ref, testID: props.testID || name });
  });
  component.displayName = name;
  return component;
};

// Bottom Tabs
const createBottomTabNavigator = () => ({
  Navigator: createMockComponent('TabNavigator'),
  Screen: createMockComponent('TabScreen'),
});

// Stack
const createStackNavigator = () => ({
  Navigator: createMockComponent('StackNavigator'),
  Screen: createMockComponent('StackScreen'),
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
  
  // Common Actions
  CommonActions: {
    navigate: jest.fn(),
    reset: jest.fn(),
    goBack: jest.fn(),
  },
};

exports.createBottomTabNavigator = createBottomTabNavigator;
exports.createStackNavigator = createStackNavigator;
module.exports.createBottomTabNavigator = createBottomTabNavigator;
module.exports.createStackNavigator = createStackNavigator;
module.exports.default = {
  ...module.exports,
  createBottomTabNavigator,
  createStackNavigator,
};
