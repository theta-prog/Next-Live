import React, { useMemo, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';

type Props = {
  navigation: { goBack: () => void };
  route: { params?: { artistId?: number } };
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

  const handleCancel = () => navigation.goBack();

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
        });
      } else {
        await addArtist({
          name: trimmedName,
          website: trimmedWebsite || undefined,
          social_media: trimmedSocial || undefined,
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
    <View>
      <Text>{editingArtist ? 'アーティスト編集' : '新規アーティスト'}</Text>

      <TextInput
        placeholder="アーティスト名"
        value={name}
        onChangeText={setName}
        testID="artist-name-input"
      />
      <TextInput
        placeholder="ウェブサイト"
        value={website}
        onChangeText={setWebsite}
        testID="artist-website-input"
      />
      <TextInput
        placeholder="SNS"
        value={social}
        onChangeText={setSocial}
        testID="artist-social-input"
      />

      <View>
        <TouchableOpacity onPress={handleCancel}>
          <Text>キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave}>
          <Text>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ArtistFormScreen;
