import React, { createContext, useContext, useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';

const PC_BREAKPOINT = 768;

interface ResponsiveContextType {
  isPC: boolean;
  windowWidth: number;
}

const ResponsiveContext = createContext<ResponsiveContextType>({
  isPC: false,
  windowWidth: Dimensions.get('window').width,
});

export const useResponsive = () => useContext(ResponsiveContext);

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPC = Platform.OS === 'web' && windowWidth >= PC_BREAKPOINT;

  return (
    <ResponsiveContext.Provider value={{ isPC, windowWidth }}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export { PC_BREAKPOINT };
