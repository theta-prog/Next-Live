const React = require('react');
const { View } = require('react-native');
const jest = require('jest-mock');

const NavigationContainer = ({ children, ...props }) => (
  <View testID="NavigationContainer" {...props}>{children}</View>
);

module.exports = {
  NavigationContainer,
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({}),
  // ...他の必要なフックやモックを追加
};
