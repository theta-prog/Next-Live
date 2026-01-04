import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform } from 'react-native';

// ルート名から日本語タイトルへのマッピング
const routeTitles: { [key: string]: string } = {
  Home: 'ホーム',
  Calendar: 'カレンダー',
  Memories: '思い出',
  Artists: '推しアーティスト',
};

// 各ルートに対応する追加ボタンの設定
const routeAddButtons: { [key: string]: { navigateTo: string; label: string } | null } = {
  Home: null, // ホーム画面には追加ボタン不要
  Calendar: { navigateTo: 'LiveEventForm', label: 'ライブを追加' },
  Memories: { navigateTo: 'MemoryForm', label: '思い出を追加' },
  Artists: { navigateTo: 'ArtistForm', label: 'アーティストを追加' },
};

interface PCHeaderProps {
  currentRoute: string;
  userName?: string;
  userPicture?: string;
  onLogout: () => void;
  onNavigate?: (routeName: string) => void;
}

const PCHeader: React.FC<PCHeaderProps> = ({
  currentRoute,
  userName,
  userPicture,
  onLogout,
  onNavigate,
}) => {
  if (Platform.OS !== 'web') return null;

  const pageTitle = routeTitles[currentRoute] || currentRoute;
  const addButton = routeAddButtons[currentRoute];

  const handleAdd = () => {
    if (addButton && onNavigate) {
      onNavigate(addButton.navigateTo);
    }
  };

  return (
    <div style={webStyles.container}>
      {/* Left: Page Title + Add Button */}
      <div style={webStyles.titleSection}>
        <h1 style={webStyles.pageTitle}>{pageTitle}</h1>
        {addButton && onNavigate && (
          <button
            onClick={handleAdd}
            style={webStyles.addButton}
            title={addButton.label}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <span style={webStyles.addButtonText}>{addButton.label}</span>
          </button>
        )}
      </div>

      {/* Right: User Info */}
      <div style={webStyles.userSection}>
        {userPicture ? (
          <img
            src={userPicture}
            alt={userName || 'User'}
            style={webStyles.userAvatar}
          />
        ) : (
          <div style={webStyles.userAvatarPlaceholder}>
            <Ionicons name="person" size={20} color="#666" />
          </div>
        )}
        {userName && (
          <span style={webStyles.userName}>{userName}</span>
        )}
        <button
          onClick={onLogout}
          style={webStyles.logoutButton}
          title="ログアウト"
        >
          <Ionicons name="log-out-outline" size={20} color="#666" />
        </button>
      </div>
    </div>
  );
};

const webStyles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    flexShrink: 0,
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0095f6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  addButtonText: {
    color: '#fff',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  userAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
};

export default PCHeader;
