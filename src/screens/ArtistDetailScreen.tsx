import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { theme, typography } from '../styles/theme';
import { confirmDelete } from '../utils/alert';

const ArtistDetailScreen = ({ navigation, route }: any) => {
  const { artists, liveEvents, deleteArtist } = useApp();
  const artistId = route.params?.artistId;
  const artist = artists.find(a => a.id === artistId);

  if (!artist) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>アーティストが見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Filter events for this artist
  const artistEvents = liveEvents.filter(e => e.artist_id === artistId);
  
  // Sort events by date
  const sortedEvents = [...artistEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = sortedEvents.filter(e => new Date(e.date) >= today);
  const pastEvents = sortedEvents.filter(e => new Date(e.date) < today).reverse(); // Most recent past event first

  const handleDelete = () => {
    confirmDelete(
      '削除確認',
      `「${artist.name}」を削除しますか？`,
      async () => {
        try {
          await deleteArtist(artist.id!);
          navigation.goBack();
        } catch (error) {
          console.error('Delete error:', error);
          if (Platform.OS === 'web') {
            window.alert('削除に失敗しました。関連するデータがある可能性があります。');
          } else {
            Alert.alert('エラー', '削除に失敗しました。関連するデータがある可能性があります。');
          }
        }
      }
    );
  };

  const openLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('エラー', 'このURLを開けませんでした');
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const renderEventItem = (event: any) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() => navigation.navigate('LiveEventDetail', { eventId: event.id })}
    >
      <View style={styles.eventDateContainer}>
        <Text style={styles.eventDateText}>{formatDate(event.date)}</Text>
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.venueName} numberOfLines={1}>{event.venue_name}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('ArtistForm', { artistId: artist.id })}
            >
              <Ionicons name="create-outline" size={24} color={theme.colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Artist Info */}
            <View style={styles.artistProfile}>
              {artist.photo ? (
                <Image source={{ uri: artist.photo }} style={styles.artistPhoto} />
              ) : (
                <View style={[styles.artistPhoto, styles.artistPhotoPlaceholder]}>
                  <Ionicons name="person" size={40} color="#ccc" />
                </View>
              )}
              <Text style={styles.artistName}>{artist.name}</Text>
              
              <View style={styles.linksContainer}>
                {artist.website && (
                  <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => openLink(artist.website!)}
                  >
                    <Ionicons name="globe-outline" size={20} color={theme.colors.accent} />
                    <Text style={styles.linkText}>公式サイト</Text>
                  </TouchableOpacity>
                )}
                {artist.social_media && (
                  <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => openLink(artist.social_media!)}
                  >
                    <Ionicons name="share-social-outline" size={20} color={theme.colors.accent} />
                    <Text style={styles.linkText}>SNS</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Upcoming Events */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>今後のライブ予定</Text>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(renderEventItem)
              ) : (
                <Text style={styles.emptyText}>予定されているライブはありません</Text>
              )}
            </View>

            {/* Past Events */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>過去のライブ</Text>
              {pastEvents.length > 0 ? (
                pastEvents.map(renderEventItem)
              ) : (
                <Text style={styles.emptyText}>過去のライブ履歴はありません</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...(Platform.OS === 'web' ? { height: '100vh', overflow: 'hidden' } : {}),
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
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  content: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body1,
    color: theme.colors.text.secondary,
  },
  artistProfile: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: theme.borderRadius.card,
    ...theme.shadows.medium,
  },
  artistPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  artistPhotoPlaceholder: {
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  artistName: {
    ...typography.h2,
    color: theme.colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  linkText: {
    marginLeft: 8,
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: theme.colors.text.primary,
    marginBottom: 12,
    marginLeft: 4,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    marginBottom: 12,
    ...theme.shadows.small,
  },
  eventDateContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  eventDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  venueName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  emptyText: {
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
});

export default ArtistDetailScreen;
