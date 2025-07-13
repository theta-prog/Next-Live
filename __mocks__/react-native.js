const React = require('react');

const createMockComponent = (name) => {
  const component = React.forwardRef((props, ref) => {
    return React.createElement('View', { ...props, ref, testID: props.testID || name });
  });
  component.displayName = name;
  return component;
};

const createMockTextComponent = (name) => {
  const component = React.forwardRef((props, ref) => {
    const children = props.children || props.title;
    return React.createElement('Text', { ...props, ref, testID: props.testID || name }, children);
  });
  component.displayName = name;
  return component;
};

const createMockTouchableComponent = (name) => {
  const component = React.forwardRef((props, ref) => {
    const children = props.children || props.title;
    return React.createElement('TouchableOpacity', { 
      ...props, 
      ref, 
      testID: props.testID || name,
      onPress: props.disabled ? undefined : props.onPress
    }, children);
  });
  component.displayName = name;
  return component;
};

const mockModal = React.forwardRef((props, ref) => {
  if (props.visible) {
    return React.createElement('View', { ...props, ref, testID: 'Modal' });
  }
  return null;
});
mockModal.displayName = 'Modal';

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
