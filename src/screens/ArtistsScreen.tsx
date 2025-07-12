import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, CustomTextInput, IconButton, SectionHeader } from '../components/UI';
import { useApp } from '../context/AppContext';
import { Artist } from '../database/asyncDatabase';
import { theme, typography } from '../styles/theme';

const ArtistsScreen = ({ navigation }: any) => {
  const { artists, addArtist, updateArtist, deleteArtist } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [photo, setPhoto] = useState('');

  const openModal = (artist?: Artist) => {
    if (artist) {
      setEditingArtist(artist);
      setName(artist.name);
      setWebsite(artist.website || '');
      setSocialMedia(artist.social_media || '');
      setPhoto(artist.photo || '');
    } else {
      setEditingArtist(null);
      setName('');
      setWebsite('');
      setSocialMedia('');
      setPhoto('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingArtist(null);
    setName('');
    setWebsite('');
    setSocialMedia('');
    setPhoto('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('エラー', 'アーティスト名を入力してください');
      return;
    }

    const artistData = {
      name: name.trim(),
      website: website.trim() || undefined,
      social_media: socialMedia.trim() || undefined,
      photo: photo || undefined,
    };

    try {
      if (editingArtist) {
        await updateArtist(editingArtist.id!, artistData);
      } else {
        await addArtist(artistData);
      }
      closeModal();
    } catch {
      Alert.alert('エラー', 'このアーティスト名は既に登録されています');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('権限が必要です', '画像を選択するにはカメラロールへのアクセス権限が必要です');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

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
    <Card variant="default" style={styles.artistCard}>
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
          onPress={() => openModal(item)}
          variant="ghost"
          size="medium"
        >
          <Ionicons name="pencil" size={18} color={theme.colors.text.secondary} />
        </IconButton>
        <IconButton
          onPress={() => handleDelete(item)}
          variant="ghost"
          size="medium"
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
          <SectionHeader title="推しアーティスト" style={styles.headerTitle} />
        <IconButton
          onPress={() => openModal()}
          variant="ghost"
          size="large"
        >
          <Ionicons name="add" size={24} color={theme.colors.accent} />
        </IconButton>
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
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom']}>
            <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[typography.h3, styles.modalTitle]}>
                {editingArtist ? 'アーティスト編集' : 'アーティスト追加'}
              </Text>
              <IconButton
                onPress={closeModal}
                variant="ghost"
                size="medium"
              >
                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
              </IconButton>
            </View>

            <View style={styles.form}>
              {/* 写真選択 */}
              <View style={styles.photoSection}>
                <Text style={[typography.body2, styles.label]}>アーティスト写真 (任意)</Text>
                <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.photoPreview} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="camera" size={32} color={theme.colors.text.tertiary} />
                      <Text style={[typography.body2, styles.photoPlaceholderText]}>
                        タップして写真を選択
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <CustomTextInput
                label="アーティスト名 *"
                value={name}
                onChangeText={setName}
                placeholder="アーティスト名を入力"
                autoFocus={true}
              />

              <CustomTextInput
                label="公式サイト"
                value={website}
                onChangeText={setWebsite}
                placeholder="https://..."
                keyboardType="url"
              />

              <CustomTextInput
                label="SNS"
                value={socialMedia}
                onChangeText={setSocialMedia}
                placeholder="@username"
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="キャンセル"
                onPress={closeModal}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={editingArtist ? '更新' : '追加'}
                onPress={handleSave}
                variant="primary"
                style={styles.modalButton}
              />
            </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    letterSpacing: -1,
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
