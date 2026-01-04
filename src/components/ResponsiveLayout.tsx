import React, { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import PCHeader from './PCHeader';
import SideNavigation from './SideNavigation';

const PC_BREAKPOINT = 768;
const OUTER_BG_COLOR = '#e6f3ff'; // Light blue brand background

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (routeName: string) => void;
  showSideNav?: boolean;
  userName?: string;
  userPicture?: string;
  onLogout?: () => void;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  currentRoute,
  onNavigate,
  showSideNav = true,
  userName,
  userPicture,
  onLogout,
}) => {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On native, just render children
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const isPC = windowWidth >= PC_BREAKPOINT;

  // On mobile web, just render children (bottom tabs will show)
  if (!isPC) {
    return <>{children}</>;
  }

  // On PC web, render side navigation layout
  return (
    <div style={webStyles.outerContainer}>
      <div style={webStyles.innerContainer}>
        {showSideNav && (
          <SideNavigation
            currentRoute={currentRoute}
            onNavigate={onNavigate}
          />
        )}
        <div style={webStyles.mainContent}>
          <PCHeader
            currentRoute={currentRoute}
            userName={userName}
            userPicture={userPicture}
            onLogout={onLogout || (() => {})}
            onNavigate={onNavigate}
          />
          <div style={webStyles.contentArea}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const webStyles: { [key: string]: React.CSSProperties } = {
  outerContainer: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: OUTER_BG_COLOR,
    display: 'flex',
    justifyContent: 'center',
  },
  innerContainer: {
    display: 'flex',
    width: '100%',
    height: '100vh',
    backgroundColor: '#fff',
    boxShadow: '0 0 40px rgba(0, 0, 0, 0.1)',
  },
  mainContent: {
    flex: 1,
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  contentArea: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
};

export { PC_BREAKPOINT };
export default ResponsiveLayout;
