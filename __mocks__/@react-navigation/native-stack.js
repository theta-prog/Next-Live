const React = require('react');
const createMockComponent = (name) => {
  const component = React.forwardRef((props, ref) => React.createElement('View', { ...props, ref, testID: props.testID || name }));
  component.displayName = name;
  return component;
};

const createNativeStackNavigator = () => ({
  Navigator: createMockComponent('StackNavigator'),
  Screen: createMockComponent('StackScreen'),
});

module.exports = { createNativeStackNavigator };
module.exports.createStackNavigator = createNativeStackNavigator;
module.exports.default = {
  ...module.exports,
  createStackNavigator: createNativeStackNavigator,
  createNativeStackNavigator,
};
