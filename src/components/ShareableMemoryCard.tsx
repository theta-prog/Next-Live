import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { theme } from '../styles/theme';

interface ShareableMemoryCardProps {
  eventTitle: string;
  artistName: string;
  eventDate: string;
  venueName?: string;
  review?: string;
  photo?: string;
  setlist?: string;
}

/**
 * SNS共有用の思い出カードコンポーネント
 * react-native-view-shot でキャプチャするために使用
 */
const ShareableMemoryCard = forwardRef<View, ShareableMemoryCardProps>(
  ({ eventTitle, artistName, eventDate, venueName, review, photo, setlist }, ref) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // セットリストは共有時に表示しない（ネタバレ防止）

    return (
      <View 
        ref={ref} 
        style={styles.container} 
        collapsable={false}
        data-testid="shareable-memory-card"
      >
        {/* ヘッダー部分 - グラデーション風 */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="musical-notes" size={28} color="#fff" />
            <Text style={styles.appName}>MEMOLIVE</Text>
          </View>
        </View>

        {/* メインコンテンツ */}
        <View style={styles.content}>
          {/* アーティスト名 */}
          <Text style={styles.artistName}>{artistName}</Text>

          {/* イベント名 */}
          <Text style={styles.eventTitle}>{eventTitle}</Text>

          {/* 日付と会場 */}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.infoText}>{formatDate(eventDate)}</Text>
          </View>

          {venueName && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.infoText}>{venueName}</Text>
            </View>
          )}

          {/* 写真 */}
          {photo && (
            <View style={styles.photoContainer}>
              <Image 
                source={{ uri: photo }} 
                style={styles.photo}
                resizeMode="cover"
              />
            </View>
          )}

          {/* 感想 */}
          {review && (
            <View style={styles.reviewContainer}>
              <Text style={styles.reviewLabel}>感想</Text>
              <Text style={styles.reviewText} numberOfLines={6}>
                {review}
              </Text>
            </View>
          )}

          {/* セットリスト - ネタバレ防止のため共有時は非表示
          {setlistData && setlistData.songs.length > 0 && (
            <View style={styles.setlistContainer}>
              <Text style={styles.setlistLabel}>♫ セットリスト</Text>
              {setlistData.songs.map((song, index) => (
                <Text key={index} style={styles.setlistItem}>
                  {index + 1}. {song}
                </Text>
              ))}
              {setlistData.hasMore && (
                <Text style={styles.setlistMore}>
                  ...他 {setlistData.totalCount - 5} 曲
                </Text>
              )}
            </View>
          )}
          */}
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🎵 Powered by MEMOLIVE</Text>
        </View>
      </View>
    );
  }
);

ShareableMemoryCard.displayName = 'ShareableMemoryCard';

const styles = StyleSheet.create({
  container: {
    width: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
    letterSpacing: 1,
  },
  content: {
    padding: 24,
  },
  artistName: {
    fontSize: 14,
    color: theme.colors.accent,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: 6,
  },
  photoContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  reviewContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
  },
  reviewLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    lineHeight: 22,
    paddingHorizontal: 2,
  },
  setlistContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  setlistLabel: {
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setlistItem: {
    fontSize: 14,
    color: theme.colors.text.primary,
    paddingVertical: 4,
  },
  setlistMore: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  footer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default ShareableMemoryCard;
