const React = require('react');

const createMockComponent = (name) => 
  React.forwardRef((props, ref) => {
    return React.createElement('Text', { ...props, ref, testID: props.testID || name });
  });

module.exports = {
  Ionicons: createMockComponent('Ionicons'),
  MaterialIcons: createMockComponent('MaterialIcons'),
  FontAwesome: createMockComponent('FontAwesome'),
  AntDesign: createMockComponent('AntDesign'),
  Feather: createMockComponent('Feather'),
  MaterialCommunityIcons: createMockComponent('MaterialCommunityIcons'),
  Entypo: createMockComponent('Entypo'),
  Foundation: createMockComponent('Foundation'),
  EvilIcons: createMockComponent('EvilIcons'),
  Octicons: createMockComponent('Octicons'),
  Zocial: createMockComponent('Zocial'),
  SimpleLineIcons: createMockComponent('SimpleLineIcons'),
};
