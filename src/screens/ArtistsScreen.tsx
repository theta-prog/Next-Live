import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Artist } from '../database/asyncDatabase';
import { Card, Button, SectionHeader } from '../components/UI';
import { theme, typography } from '../styles/theme';

const ArtistsScreen = ({ navigation }: any) => {
  const { artists, addArtist, updateArtist, deleteArtist } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [socialMedia, setSocialMedia] = useState('');

  const openModal = (artist?: Artist) => {
    if (artist) {
      setEditingArtist(artist);
      setName(artist.name);
      setWebsite(artist.website || '');
      setSocialMedia(artist.social_media || '');
    } else {
      setEditingArtist(null);
      setName('');
      setWebsite('');
      setSocialMedia('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingArtist(null);
    setName('');
    setWebsite('');
    setSocialMedia('');
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
    <Card sharp style={styles.artistCard}>
      <View style={styles.artistInfo}>
        <Text style={[typography.h3, styles.artistName]}>{item.name}</Text>
        {item.website && (
          <Text style={[typography.body2, styles.artistDetail]}>🌐 {item.website}</Text>
        )}
        {item.social_media && (
          <Text style={[typography.body2, styles.artistDetail]}>📱 {item.social_media}</Text>
        )}
      </View>
      <View style={styles.artistActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openModal(item)}
        >
          <Ionicons name="create-outline" size={20} color={theme.colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.h1, styles.headerTitle]}>推しアーティスト</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openModal()}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {artists.length === 0 ? (
        <Card sharp style={styles.emptyState}>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingArtist ? 'アーティスト編集' : 'アーティスト追加'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>アーティスト名 *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="アーティスト名を入力"
                  autoFocus={true}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>公式サイト</Text>
                <TextInput
                  style={styles.input}
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="https://..."
                  keyboardType="url"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SNS</Text>
                <TextInput
                  style={styles.input}
                  value={socialMedia}
                  onChangeText={setSocialMedia}
                  placeholder="@username"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.none,
    margin: theme.spacing.lg,
    maxWidth: 400,
    width: '90%',
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  artistCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  artistDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  artistActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default ArtistsScreen;
