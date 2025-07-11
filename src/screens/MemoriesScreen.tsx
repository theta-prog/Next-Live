import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { theme, typography } from '../styles/theme';

const MemoriesScreen = ({ navigation }: any) => {
  const { memories } = useApp();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderMemory = ({ item }: any) => {
    const photos = item.photos ? JSON.parse(item.photos) : [];
    const firstPhoto = photos[0];

    return (
      <TouchableOpacity
        style={styles.memoryCard}
        onPress={() => navigation.navigate('MemoryDetail', { memoryId: item.id })}
      >
        <View style={styles.imageContainer}>
          {firstPhoto && (
            <Image source={{ uri: firstPhoto }} style={styles.memoryImage} />
          )}
        </View>
        
        <View style={styles.memoryContent}>
          <View style={styles.memoryHeader}>
            <Text style={styles.eventTitle}>{item.event_title}</Text>
            <Text style={styles.eventDate}>{formatDate(item.event_date)}</Text>
          </View>
          
          <Text style={styles.artistName}>{item.artist_name}</Text>
          
          {item.review && (
            <Text style={styles.reviewPreview} numberOfLines={2}>
              {item.review}
            </Text>
          )}
          
          <View style={styles.memoryFooter}>
            {photos.length > 0 && (
              <View style={styles.photoCount}>
                <Ionicons name="camera-outline" size={16} color="#666" />
                <Text style={styles.photoCountText}>{photos.length}</Text>
              </View>
            )}
            
            {item.setlist && (
              <View style={styles.setlistIndicator}>
                <Ionicons name="list-outline" size={16} color="#666" />
                <Text style={styles.setlistText}>セットリスト</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 固定ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>思い出</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('MemoryForm')}
          >
            <Ionicons name="add" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
        </View>

        {/* スクロール可能なコンテンツ */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {memories.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color={theme.colors.text.tertiary} />
              <Text style={styles.emptyStateText}>まだ思い出が記録されていません</Text>
              <Text style={styles.emptyStateSubtext}>参加したライブの詳細画面から思い出を追加できます</Text>
            </View>
          ) : (
            <FlatList
              data={memories}
              renderItem={renderMemory}
              keyExtractor={(item) => item.id!.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: theme.colors.text.primary,
  },
  addButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  listContainer: {
    padding: 16,
  },
  memoryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.card,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.medium,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  imageContainer: {
    paddingLeft: 8,
    paddingRight: 4,
  },
  memoryImage: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  memoryContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
    paddingRight: 8,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    ...typography.body1,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  eventDate: {
    ...typography.caption,
    color: theme.colors.text.secondary,
  },
  artistName: {
    ...typography.body2,
    color: theme.colors.accent,
    marginBottom: 6,
    fontWeight: '600',
  },
  reviewPreview: {
    ...typography.body2,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  memoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  photoCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    ...typography.caption,
    color: theme.colors.text.secondary,
    marginLeft: 4,
  },
  setlistIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  setlistText: {
    ...typography.caption,
    color: theme.colors.text.secondary,
    marginLeft: 4,
  },
  chevronContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    ...typography.h3,
    color: theme.colors.text.secondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...typography.body2,
    color: theme.colors.text.tertiary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MemoriesScreen;
