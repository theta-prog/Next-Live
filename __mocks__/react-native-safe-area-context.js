import React from 'react';

export const SafeAreaView = ({ children, style, ...props }) => {
  return React.createElement('View', { style, ...props }, children);
};

export const useSafeAreaInsets = () => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

export const SafeAreaProvider = ({ children }) => {
  return React.createElement('View', {}, children);
};

export const SafeAreaInsetsContext = React.createContext({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});
