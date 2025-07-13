const React = require('react');
const createMockComponent = (name) => {
  const component = React.forwardRef((props, ref) => React.createElement('View', { ...props, ref, testID: props.testID || name }));
  component.displayName = name;
  return component;
};

const createBottomTabNavigator = () => ({
  Navigator: createMockComponent('TabNavigator'),
  Screen: createMockComponent('TabScreen'),
});

module.exports = { createBottomTabNavigator };
