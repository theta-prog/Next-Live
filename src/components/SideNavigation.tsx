import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform } from 'react-native';

const BRAND_COLOR = '#0095f6';
const SIDE_NAV_WIDTH = 240;

interface NavItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}

const navItems: NavItem[] = [
  { name: 'Home', label: 'ホーム', icon: 'home-outline', iconFocused: 'home' },
  { name: 'Calendar', label: 'カレンダー', icon: 'calendar-outline', iconFocused: 'calendar' },
  { name: 'Memories', label: '思い出', icon: 'heart-outline', iconFocused: 'heart' },
  { name: 'Artists', label: '推しアーティスト', icon: 'people-outline', iconFocused: 'people' },
];

interface SideNavigationProps {
  currentRoute: string;
  onNavigate: (routeName: string) => void;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ currentRoute, onNavigate }) => {
  if (Platform.OS !== 'web') return null;

  return (
    <div style={webStyles.container}>
      {/* App Title */}
      <div style={webStyles.header}>
        <span style={webStyles.title}>MEMOLIVE</span>
      </div>

      {/* Navigation Items */}
      <nav style={webStyles.nav}>
        {navItems.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.name)}
              style={{
                ...webStyles.navItem,
                backgroundColor: isActive ? `${BRAND_COLOR}15` : 'transparent',
                color: isActive ? BRAND_COLOR : '#333',
              }}
            >
              <Ionicons
                name={isActive ? item.iconFocused : item.icon}
                size={24}
                color={isActive ? BRAND_COLOR : '#666'}
              />
              <span style={{
                ...webStyles.navLabel,
                fontWeight: isActive ? '600' : '400',
                color: isActive ? BRAND_COLOR : '#333',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const webStyles: { [key: string]: React.CSSProperties } = {
  container: {
    width: SIDE_NAV_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    borderRight: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 20px',
    borderBottom: '1px solid #eee',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Oswald, sans-serif',
    color: BRAND_COLOR,
    letterSpacing: 2,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 12px',
    gap: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '14px 16px',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s',
    width: '100%',
  },
  navLabel: {
    fontSize: 15,
  },
};

export { SIDE_NAV_WIDTH };
export default SideNavigation;
