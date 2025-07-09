import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Memory } from '../database/database';

const MemoryFormScreen = ({ navigation, route }: any) => {
  const { addMemory, updateMemory, memories, liveEvents } = useApp();
  const eventId = route.params?.eventId;
  const memoryId = route.params?.memoryId;
  const editingMemory = memoryId ? memories.find(m => m.id === memoryId) : null;
  const event = liveEvents.find(e => e.id === eventId);

  const [review, setReview] = useState('');
  const [setlist, setSetlist] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (editingMemory) {
      setReview(editingMemory.review || '');
      setSetlist(editingMemory.setlist || '');
      setPhotos(editingMemory.photos ? JSON.parse(editingMemory.photos) : []);
    }
  }, [editingMemory]);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        '権限が必要です',
        'ライブラリから写真を選択するために、メディアライブラリへのアクセス権限が必要です。',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map(asset => asset.uri);
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!review.trim() && !setlist.trim() && photos.length === 0) {
      Alert.alert('エラー', '感想、セットリスト、写真のうち少なくとも一つは入力してください');
      return;
    }

    const memoryData: Omit<Memory, 'id' | 'created_at'> = {
      live_event_id: eventId,
      review: review.trim() || undefined,
      setlist: setlist.trim() || undefined,
      photos: photos.length > 0 ? JSON.stringify(photos) : undefined,
    };

    try {
      if (editingMemory) {
        await updateMemory(editingMemory.id!, memoryData);
      } else {
        await addMemory(memoryData);
      }
      navigation.goBack();
    } catch {
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  const renderPhoto = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item }} style={styles.photoThumbnail} />
      <TouchableOpacity
        style={styles.removePhotoButton}
        onPress={() => removePhoto(index)}
      >
        <Ionicons name="close-circle" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>イベントが見つかりません</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editingMemory ? '思い出編集' : '思い出追加'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>保存</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.artistName}>{event.artist_name}</Text>
          <Text style={styles.eventDate}>
            {new Date(event.date).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>感想</Text>
          <TextInput
            style={[styles.input, styles.reviewInput]}
            value={review}
            onChangeText={setReview}
            placeholder="ライブの感想を記録しましょう...&#10;・最高だった瞬間&#10;・印象に残った曲&#10;・感動したポイント"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>セットリスト</Text>
          <TextInput
            style={[styles.input, styles.setlistInput]}
            value={setlist}
            onChangeText={setSetlist}
            placeholder="セットリストを記録しましょう...&#10;例：&#10;1. Opening SE&#10;2. 曲名1&#10;3. 曲名2&#10;- MC -&#10;4. 曲名3"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.photoSectionHeader}>
            <Text style={styles.sectionTitle}>写真</Text>
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#007AFF" />
              <Text style={styles.addPhotoButtonText}>追加</Text>
            </TouchableOpacity>
          </View>

          {photos.length === 0 ? (
            <View style={styles.noPhotosContainer}>
              <Ionicons name="camera-outline" size={48} color="#ccc" />
              <Text style={styles.noPhotosText}>写真を追加してみましょう</Text>
              <Text style={styles.noPhotosSubtext}>ライブ会場や思い出の写真を記録できます</Text>
            </View>
          ) : (
            <FlatList
              data={photos}
              renderItem={renderPhoto}
              keyExtractor={(item, index) => index.toString()}
              numColumns={3}
              contentContainerStyle={styles.photosGrid}
              scrollEnabled={false}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  eventInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  reviewInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  setlistInput: {
    height: 200,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  photoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addPhotoButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  noPhotosContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPhotosText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  noPhotosSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  photosGrid: {
    gap: 8,
  },
  photoItem: {
    flex: 1,
    margin: 4,
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
});

export default MemoryFormScreen;
