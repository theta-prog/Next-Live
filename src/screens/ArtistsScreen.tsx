import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, IconButton } from '../components/UI';
import { useApp } from '../context/AppContext';
import { Artist } from '../database/asyncDatabase';
import { theme, typography } from '../styles/theme';

const ArtistsScreen = ({ navigation, route }: any) => {
  // route.params.openAdd が true の場合初回レンダー後にモーダルを開く
  useEffect(() => {
    if (route?.params?.openAdd) {
      navigation.navigate('ArtistForm');
      navigation.setParams({ openAdd: undefined });
    }
  }, [route?.params?.openAdd, navigation]);
  const { artists, deleteArtist } = useApp();


  const handleDelete = (artist: Artist) => {
    Alert.alert(
      '削除確認',
      `「${artist.name}」を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => await deleteArtist(artist.id!),
        },
      ]
    );
  };

  const renderArtist = ({ item }: { item: Artist }) => (
    <Card variant="default" style={styles.artistCard} testID={`artist-card-${item.id}`}>
      <View style={styles.artistHeader}>
        {item.photo && (
          <Image source={{ uri: item.photo }} style={styles.artistPhoto} />
        )}
        <View style={styles.artistInfo}>
          <Text style={[typography.h3, styles.artistName]}>{item.name}</Text>
          {item.website && (
            <Text style={[typography.body2, styles.artistDetail]}>🌐 {item.website}</Text>
          )}
          {item.social_media && (
            <Text style={[typography.body2, styles.artistDetail]}>📱 {item.social_media}</Text>
          )}
        </View>
      </View>
      <View style={styles.artistActions}>
        <IconButton
          onPress={() => navigation.navigate('ArtistForm', { artistId: item.id })}
          variant="ghost"
          size="medium"
          testID={`edit-artist-button-${item.id}`}
        >
          <Ionicons name="pencil" size={18} color={theme.colors.text.secondary} />
        </IconButton>
        <IconButton
          onPress={() => handleDelete(item)}
          variant="ghost"
          size="medium"
          testID={`delete-artist-button-${item.id}`}
        >
          <Ionicons name="trash" size={18} color={theme.colors.error} />
        </IconButton>
      </View>
    </Card>
  );

  return (
  <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>推しアーティスト</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('ArtistForm')}
            testID="add-artist-button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
        </View>

      {artists.length === 0 ? (
        <Card variant="outlined" style={styles.emptyState}>
          <Ionicons name="musical-notes-outline" size={64} color={theme.colors.text.tertiary} />
          <Text style={[typography.h3, styles.emptyStateText]}>まだアーティストが登録されていません</Text>
          <Text style={[typography.body2, styles.emptyStateSubtext]}>右上の「+」ボタンから追加してみましょう</Text>
        </Card>
      ) : (
        <FlatList
          data={artists}
          renderItem={renderArtist}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={styles.listContainer}
          testID="artists-flatlist"
        />
      )}

      {/* モーダルは共通の ArtistFormScreen に統一 */}
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
    padding: theme.spacing.md, // 他ページと統一（16）
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: theme.colors.text.primary,
  },
  addButton: {
    padding: theme.spacing.sm,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  artistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  artistPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  artistDetail: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  artistActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    margin: theme.spacing.md,
  },
  emptyStateText: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  emptyStateSubtext: {
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.text.tertiary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.none,
    margin: theme.spacing.lg,
    maxWidth: 400,
    width: '90%',
    maxHeight: '80%',
    ...theme.shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    letterSpacing: -0.5,
  },
  form: {
    padding: theme.spacing.lg,
  },
  photoSection: {
    marginBottom: theme.spacing.lg,
  },
  photoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    borderRadius: theme.borderRadius.none,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.background,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.none,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.none,
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
    minWidth: 0, // 文字切れ防止: フレックス収縮を許可
  },
  modalButtonText: {
    // variant 側の色指定を上書きしないため、最小限の上書きのみ
    fontFamily: theme.fonts.primarySemiBold,
    textTransform: 'none',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.text.secondary,
  },
  saveButtonText: {
    color: theme.colors.text.inverse,
  },
});

export default ArtistsScreen;
