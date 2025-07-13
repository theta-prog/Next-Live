const React = require('react');
const createMockComponent = (name) => {
  const component = React.forwardRef((props, ref) => React.createElement('View', { ...props, ref, testID: props.testID || name }));
  component.displayName = name;
  return component;
};

const createStackNavigator = () => ({
  Navigator: createMockComponent('StackNavigator'),
  Screen: createMockComponent('StackScreen'),
});

module.exports = { createStackNavigator };
module.exports.default = { createStackNavigator };
