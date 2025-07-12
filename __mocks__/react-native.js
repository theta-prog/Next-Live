const React = require('react');

const createMockComponent = (name) => 
  React.forwardRef((props, ref) => {
    return React.createElement('View', { ...props, ref, testID: props.testID || name });
  });

const createMockTextComponent = (name) =>
  React.forwardRef((props, ref) => {
    const children = props.children || props.title;
    return React.createElement('Text', { ...props, ref, testID: props.testID || name }, children);
  });

const createMockTouchableComponent = (name) =>
  React.forwardRef((props, ref) => {
    const children = props.children || props.title;
    return React.createElement('TouchableOpacity', { 
      ...props, 
      ref, 
      testID: props.testID || name,
      onPress: props.disabled ? undefined : props.onPress
    }, children);
  });

const mockModal = React.forwardRef((props, ref) => {
  if (props.visible) {
    return React.createElement('View', { ...props, ref, testID: 'Modal' });
  }
  return null;
});

module.exports = {
  // Core components
  View: createMockComponent('View'),
  Text: createMockTextComponent('Text'),
  TextInput: createMockComponent('TextInput'),
  ScrollView: createMockComponent('ScrollView'),
  FlatList: createMockComponent('FlatList'),
  SectionList: createMockComponent('SectionList'),
  TouchableOpacity: createMockTouchableComponent('TouchableOpacity'),
  TouchableHighlight: createMockTouchableComponent('TouchableHighlight'),
  TouchableWithoutFeedback: createMockTouchableComponent('TouchableWithoutFeedback'),
  Pressable: createMockComponent('Pressable'),
  Image: createMockComponent('Image'),
  Modal: mockModal,
  Alert: {
    alert: () => {},
  },
  
  // Layout
  SafeAreaView: createMockComponent('SafeAreaView'),
  KeyboardAvoidingView: createMockComponent('KeyboardAvoidingView'),
  
  // Platform and device info
  Platform: {
    OS: 'ios',
    select: (options) => options.ios || options.default,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
  
  // Styles
  StyleSheet: {
    create: (styles) => styles,
    flatten: (styles) => styles,
  },
};
