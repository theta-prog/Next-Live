import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const MemoryDetailScreen = ({ navigation, route }: any) => {
  const { memories, deleteMemory, liveEvents } = useApp();
  const memoryId = route.params?.memoryId;
  const memory = memories.find(m => m.id === memoryId);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!memory) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>思い出が見つかりません</Text>
      </View>
    );
  }

  const photos = memory.photos ? JSON.parse(memory.photos) : [];
  const event = liveEvents.find(e => e.id === memory.live_event_id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      '削除確認',
      'この思い出を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMemory(memory.id!);
              navigation.goBack();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('エラー', '削除に失敗しました。もう一度お試しください。');
            }
          },
        },
      ]
    );
  };

  const renderSetlistLines = (setlist: string) => {
    return setlist.split('\n').map((line, index) => (
      <Text key={index} style={styles.setlistLine}>
        {line}
      </Text>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('MemoryForm', { 
                eventId: memory.live_event_id,
                memoryId: memory.id 
              })}
            >
              <Ionicons name="create-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{memory.event_title}</Text>
            <Text style={styles.artistName}>{memory.artist_name}</Text>
            <Text style={styles.eventDate}>{formatDate(memory.event_date)}</Text>
          </View>

          {photos.length > 0 && (
            <View style={styles.photosSection}>
              <Text style={styles.sectionTitle}>写真</Text>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / (width - 72));
                  setSelectedPhotoIndex(index);
                }}
              >
                {photos.map((photo: string, index: number) => (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => {
                      setSelectedPhotoIndex(index);
                      setIsModalVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: photo }}
                      style={styles.photo}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {photos.length > 1 && (
                <View style={styles.photoIndicators}>
                  {photos.map((_: any, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        { opacity: index === selectedPhotoIndex ? 1 : 0.3 }
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {memory.review && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>感想</Text>
              <Text style={styles.reviewText}>{memory.review}</Text>
            </View>
          )}

          {memory.setlist && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>セットリスト</Text>
              <View style={styles.setlistContainer}>
                {renderSetlistLines(memory.setlist)}
              </View>
            </View>
          )}

          {event && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ライブ詳細</Text>
              <TouchableOpacity
                style={styles.eventDetailButton}
                onPress={() => navigation.navigate('LiveEventDetail', { eventId: event.id })}
              >
                <View style={styles.eventDetailInfo}>
                  <Text style={styles.eventDetailTitle}>{event.title}</Text>
                  <Text style={styles.eventDetailVenue}>{event.venue_name}</Text>
                  <Text style={styles.eventDetailDate}>{formatDate(event.date)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: selectedPhotoIndex * width, y: 0 }}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setSelectedPhotoIndex(index);
            }}
          >
            {photos.map((photo: string, index: number) => (
              <View key={index} style={styles.modalImageContainer}>
                <Image
                  source={{ uri: photo }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
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
    fontSize: 20,
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
  photosSection: {
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
  photo: {
    width: width - 72, // padding + margin를 고려
    height: 200,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  photoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 4,
  },
  reviewText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  setlistContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
  },
  setlistLine: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  eventDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  eventDetailInfo: {
    flex: 1,
  },
  eventDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventDetailVenue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eventDetailDate: {
    fontSize: 14,
    color: '#666',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  modalImageContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width,
    height: height * 0.8,
  },
});

export default MemoryDetailScreen;
