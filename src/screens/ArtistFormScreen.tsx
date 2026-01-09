import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { theme, typography } from '../styles/theme';

type Props = {
  navigation: { goBack: () => void };
  route: { params?: { artistId?: string } };
};

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const ArtistFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { artists, addArtist, updateArtist } = useApp();
  const artistId = route?.params?.artistId;
  const editingArtist = useMemo(() => artists.find(a => a.id === artistId), [artists, artistId]);

  const [name, setName] = useState(editingArtist?.name ?? '');
  const [website, setWebsite] = useState(editingArtist?.website ?? '');
  const [social, setSocial] = useState(editingArtist?.social_media ?? '');
  const [photo, setPhoto] = useState<string | undefined>(editingArtist?.photo);

  const handleCancel = () => navigation.goBack();

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
      quality: 0.7, // 画質を下げてデータサイズを制限
      base64: true, // Base64データを取得
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        // Base64データをdata URLとして保存
        const mimeType = asset.mimeType || 'image/jpeg';
        const base64Image = `data:${mimeType};base64,${asset.base64}`;
        setPhoto(base64Image);
      } else {
        Alert.alert('エラー', '画像の処理に失敗しました');
      }
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedWebsite = website.trim();
    const trimmedSocial = social.trim();

    if (!trimmedName) {
      Alert.alert('エラー', 'アーティスト名は必須です');
      return;
    }

    if (trimmedWebsite && !isValidUrl(trimmedWebsite)) {
      Alert.alert('エラー', '有効なURLを入力してください');
      return;
    }

    const isDuplicate = artists.some(a =>
      a.name === trimmedName && (editingArtist ? a.id !== editingArtist.id : true)
    );
    if (isDuplicate) {
      Alert.alert('エラー', 'このアーティスト名は既に存在します');
      return;
    }

    try {
      if (editingArtist?.id) {
        await updateArtist(editingArtist.id, {
          name: trimmedName,
          website: trimmedWebsite || undefined,
          social_media: trimmedSocial || undefined,
          photo: photo || undefined,
        });
      } else {
        await addArtist({
          name: trimmedName,
          website: trimmedWebsite || undefined,
          social_media: trimmedSocial || undefined,
          photo: photo || undefined,
        });
      }
      navigation.goBack();
  } catch {
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  if (artistId && !editingArtist) {
    return (
      <View>
        <Text>アーティストが見つかりません</Text>
      </View>
    );
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={[typography.h3, styles.modalTitle]}>
            {editingArtist ? 'アーティスト編集' : 'アーティスト追加'}
          </Text>
          <TouchableOpacity onPress={handleCancel} style={styles.iconButton} testID="artist-form-close">
            <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[typography.body2, styles.inputLabel]}>アーティスト写真 (任意)</Text>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage} testID="artist-photo-picker">
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={32} color={theme.colors.text.tertiary} />
                <Text style={[typography.body2, styles.photoPlaceholderText]}>タップして写真を選択</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>アーティスト名 *</Text>
            <TextInput
              style={styles.input}
              placeholder="アーティスト名を入力"
              value={name}
              onChangeText={setName}
              autoFocus
              testID="artist-name-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>公式サイト</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              keyboardType="url"
              value={website}
              onChangeText={setWebsite}
              testID="artist-website-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SNS</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              value={social}
              onChangeText={setSocial}
              testID="artist-social-input"
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleCancel} style={[styles.actionBtn, styles.cancelBtn]} testID="artist-cancel-btn">
            <Text style={styles.cancelText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={[styles.actionBtn, styles.saveBtn]} testID="artist-save-btn">
            <Text style={styles.saveText}>{editingArtist ? '更新' : '追加'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ArtistFormScreen;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    width: '90%',
    maxWidth: 420,
    borderRadius: theme.borderRadius.none,
    overflow: 'hidden',
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
    letterSpacing: -0.3,
  },
  iconButton: {
    padding: theme.spacing.sm,
  },
  form: {
    padding: theme.spacing.lg,
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
    marginBottom: theme.spacing.lg,
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
  inputLabel: {
    ...typography.label,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.button,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    fontFamily: theme.fonts.secondary,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surface,
    minHeight: 44,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.none,
    marginHorizontal: theme.spacing.sm,
  },
  cancelBtn: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
  },
  cancelText: {
    fontFamily: theme.fonts.primarySemiBold,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  saveText: {
    fontFamily: theme.fonts.primarySemiBold,
    fontSize: 16,
    color: theme.colors.text.inverse,
  },
});
