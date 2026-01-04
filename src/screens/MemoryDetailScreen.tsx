import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageStyle,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { confirmDelete } from '../utils/alert';
import ShareableMemoryCard from '../components/ShareableMemoryCard';
import { captureViewAsImage, shareImage, generateShareMessage } from '../utils/share';

// Get initial dimensions once
const INITIAL_WIDTH = Dimensions.get('window').width;
const PHOTO_HEIGHT = 220;

// Native用ヘッダーコンポーネント
interface HeaderProps {
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}

const Header = memo(function Header({ onBack, onEdit, onDelete, onShare }: HeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton} onPress={onShare}>
          <Ionicons name="share-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Memoized Photo Carousel - isolated from header
interface PhotoCarouselProps {
  photos: string[];
  containerWidth: number;
  selectedPhotoIndex: number;
  onPhotoPress: (index: number) => void;
  onIndexChange: (index: number) => void;
  onLayout: (e: any) => void;
}

// Native用写真カルーセル
const PhotoCarousel = memo(function PhotoCarousel({
  photos,
  containerWidth,
  selectedPhotoIndex,
  onPhotoPress,
  onIndexChange,
  onLayout,
}: PhotoCarouselProps) {
  if (photos.length === 0) return null;
  
  return (
    <View style={styles.photosSection}>
      <Text style={styles.sectionTitle}>写真</Text>
      <View style={styles.photoCarouselContainer} onLayout={onLayout}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          onMomentumScrollEnd={(event) => {
            const w = event.nativeEvent.layoutMeasurement.width || containerWidth;
            const index = Math.round(event.nativeEvent.contentOffset.x / w);
            onIndexChange(index);
          }}
        >
          {photos.map((photo: string, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => onPhotoPress(index)}
              style={[styles.photoTouchable, { width: containerWidth }]}
            >
              <Image
                source={{ uri: photo }}
                style={[styles.photo, { width: containerWidth }] as ImageStyle[]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
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
  );
});

const MemoryDetailScreen = ({ navigation, route }: any) => {
  const { memories, deleteMemory, liveEvents } = useApp();
  const memoryId = route.params?.memoryId;
  const memory = memories.find(m => m.id === memoryId);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [containerWidth, setContainerWidth] = useState(INITIAL_WIDTH - 72);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<View>(null);

  // Parse photos using useMemo
  const photos = useMemo(() => {
    if (!memory?.photos) return [];
    try {
      return JSON.parse(memory.photos);
    } catch {
      return [];
    }
  }, [memory?.photos]);

  const event = memory ? liveEvents.find(e => e.id === memory.live_event_id) : null;

  const Wrapper = Platform.OS === 'web' ? View : SafeAreaView;

  // Stable callbacks using useMemo to prevent Header re-renders
  const headerCallbacks = useMemo(() => ({
    onBack: () => navigation.goBack(),
    onEdit: () => {
      if (memoryId && memory?.live_event_id) {
        navigation.navigate('MemoryForm', {
          eventId: memory.live_event_id,
          memoryId: memoryId
        });
      }
    },
    onDelete: () => {
      if (!memoryId) return;
      confirmDelete(
        '削除確認',
        'この思い出を削除しますか？',
        async () => {
          try {
            await deleteMemory(memoryId);
            navigation.goBack();
          } catch (error) {
            console.error('Delete error:', error);
            if (Platform.OS === 'web') {
              window.alert('削除に失敗しました。もう一度お試しください。');
            } else {
              Alert.alert('エラー', '削除に失敗しました。もう一度お試しください。');
            }
          }
        }
      );
    },
    onShare: () => {
      setIsShareModalVisible(true);
    },
  }), [navigation, memoryId, memory?.live_event_id, deleteMemory]);

  // 共有処理
  const handleShare = useCallback(async () => {
    if (!memory || !shareCardRef.current) return;

    setIsSharing(true);
    try {
      // カードを画像としてキャプチャ
      const imageUri = await captureViewAsImage(shareCardRef);
      if (!imageUri) {
        throw new Error('Failed to capture image');
      }

      // 共有メッセージを生成
      const message = generateShareMessage({
        eventTitle: memory.event_title,
        artistName: memory.artist_name,
        eventDate: memory.event_date,
        review: memory.review,
      });

      // 画像を共有
      await shareImage(imageUri, {
        title: '思い出を共有',
        message,
      });

      setIsShareModalVisible(false);
    } catch (error) {
      console.error('Share error:', error);
      if (Platform.OS === 'web') {
        window.alert('共有に失敗しました。もう一度お試しください。');
      } else {
        Alert.alert('エラー', '共有に失敗しました。もう一度お試しください。');
      }
    } finally {
      setIsSharing(false);
    }
  }, [memory]);

  const handleContainerLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - containerWidth) > 1) {
      setContainerWidth(width);
    }
  }, [containerWidth]);

  const handlePhotoPress = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
    setIsModalVisible(true);
  }, []);

  const handleIndexChange = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
  }, []);

  if (!memory) {
    return (
      <Wrapper style={styles.safeArea} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>思い出が見つかりません</Text>
        </View>
      </Wrapper>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const renderSetlistLines = (setlist: string) => {
    return setlist.split('\n').map((line, index) => (
      <Text key={index} style={styles.setlistLine}>
        {line}
      </Text>
    ));
  };

  // Web用のレンダリング
  if (Platform.OS === 'web') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Web用固定ヘッダー */}
        <div 
          style={{
            position: 'sticky',
            top: 0,
            height: 64,
            backgroundColor: '#fff',
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            zIndex: 9999,
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        >
          <button
            onClick={headerCallbacks.onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </button>
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={headerCallbacks.onShare}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="share-outline" size={24} color="#007AFF" />
            </button>
            <button
              onClick={headerCallbacks.onEdit}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="create-outline" size={24} color="#007AFF" />
            </button>
            <button
              onClick={headerCallbacks.onDelete}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </button>
          </div>
        </div>

        {/* スクロールコンテンツ */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {/* イベント情報 */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
              {memory.event_title}
            </div>
            <div style={{ fontSize: 16, color: '#007AFF', marginBottom: 4 }}>
              {memory.artist_name}
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>
              {formatDate(memory.event_date)}
            </div>
          </div>

          {/* 写真セクション */}
          {photos.length > 0 && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>
                写真
              </div>
              <div
                style={{
                  height: PHOTO_HEIGHT,
                  overflow: 'hidden',
                  display: 'flex',
                  scrollSnapType: 'x mandatory',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                }}
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  const w = target.clientWidth || 1;
                  const index = Math.round(target.scrollLeft / w);
                  if (index !== selectedPhotoIndex) {
                    setSelectedPhotoIndex(index);
                  }
                }}
              >
                {photos.map((photo: string, index: number) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedPhotoIndex(index);
                      setIsModalVisible(true);
                    }}
                    style={{
                      flex: '0 0 100%',
                      height: PHOTO_HEIGHT,
                      scrollSnapAlign: 'start',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#000',
                      borderRadius: 8,
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                ))}
              </div>
              
              {photos.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, gap: 8 }}>
                  {photos.map((_: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#007AFF',
                        opacity: index === selectedPhotoIndex ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 感想セクション */}
          {memory.review && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>
                感想
              </div>
              <div style={{ fontSize: 16, color: '#333', lineHeight: 1.5 }}>
                {memory.review}
              </div>
            </div>
          )}

          {/* セットリストセクション */}
          {memory.setlist && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>
                セットリスト
              </div>
              <div style={{ backgroundColor: '#f8f8f8', borderRadius: 8, padding: 16 }}>
                {memory.setlist.split('\n').map((line: string, index: number) => (
                  <div key={index} style={{ fontSize: 14, color: '#333', lineHeight: 1.5, marginBottom: 4 }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ライブ詳細セクション */}
          {event && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
              marginBottom: 100,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>
                ライブ詳細
              </div>
              <button
                onClick={() => navigation.navigate('LiveEventDetail', { eventId: event.id })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: 16,
                  backgroundColor: '#f8f8f8',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
                    {event.title}
                  </div>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>
                    {event.venue_name}
                  </div>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    {formatDate(event.date)}
                  </div>
                </div>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </button>
            </div>
          )}
        </div>

        {/* Full Screen Image Modal */}
        {isModalVisible && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10000,
            }}
          >
            <button
              onClick={() => setIsModalVisible(false)}
              style={{
                position: 'absolute',
                top: 40,
                right: 20,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 10,
                zIndex: 1,
              }}
            >
              <Ionicons name="close" size={30} color="#fff" />
            </button>
            <div 
              style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={photos[selectedPhotoIndex]}
                alt="Full size"
                style={{
                  maxWidth: '90%',
                  maxHeight: '80%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        )}

        {/* Web Share Modal */}
        {isShareModalVisible && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
              padding: 20,
            }}
            onClick={() => setIsShareModalVisible(false)}
          >
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                maxWidth: 420,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 16,
                  borderBottom: '1px solid #eee',
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>
                  思い出を共有
                </span>
                <button
                  onClick={() => setIsShareModalVisible(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <ShareableMemoryCard
                  ref={shareCardRef}
                  eventTitle={memory.event_title || ''}
                  artistName={memory.artist_name || ''}
                  eventDate={memory.event_date || ''}
                  venueName={event?.venue_name}
                  review={memory.review}
                  photo={photos.length > 0 ? photos[0] : undefined}
                  setlist={memory.setlist}
                />
              </div>

              <div
                style={{
                  padding: 16,
                  borderTop: '1px solid #eee',
                }}
              >
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    backgroundColor: isSharing ? '#b2dffc' : '#0095f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '14px 20px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: isSharing ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSharing ? (
                    <span>共有中...</span>
                  ) : (
                    <>
                      <Ionicons name="share-outline" size={20} color="#fff" />
                      <span>画像を共有</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Native用レンダリング
  return (
    <Wrapper style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Header
          onBack={headerCallbacks.onBack}
          onEdit={headerCallbacks.onEdit}
          onDelete={headerCallbacks.onDelete}
          onShare={headerCallbacks.onShare}
        />

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.content}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{memory.event_title}</Text>
              <Text style={styles.artistName}>{memory.artist_name}</Text>
              <Text style={styles.eventDate}>{formatDate(memory.event_date)}</Text>
            </View>

            <PhotoCarousel
              photos={photos}
              containerWidth={containerWidth}
              selectedPhotoIndex={selectedPhotoIndex}
              onPhotoPress={handlePhotoPress}
              onIndexChange={handleIndexChange}
              onLayout={handleContainerLayout}
            />

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
      </View>

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
            contentOffset={{ x: selectedPhotoIndex * INITIAL_WIDTH, y: 0 }}
          >
            {photos.map((photo: string, index: number) => (
              <View key={index} style={[styles.modalImageContainer, { width: INITIAL_WIDTH }]}>
                <Image
                  source={{ uri: photo }}
                  style={[styles.modalImage, { width: INITIAL_WIDTH }] as ImageStyle[]}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal
        visible={isShareModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsShareModalVisible(false)}
      >
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContainer}>
            <View style={styles.shareModalHeader}>
              <Text style={styles.shareModalTitle}>思い出を共有</Text>
              <TouchableOpacity
                onPress={() => setIsShareModalVisible(false)}
                style={styles.shareModalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.shareCardScrollView}
              contentContainerStyle={styles.shareCardScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <ShareableMemoryCard
                ref={shareCardRef}
                eventTitle={memory.event_title || ''}
                artistName={memory.artist_name || ''}
                eventDate={memory.event_date || ''}
                venueName={event?.venue_name}
                review={memory.review}
                photo={photos.length > 0 ? photos[0] : undefined}
                setlist={memory.setlist}
              />
            </ScrollView>

            <View style={styles.shareModalActions}>
              <TouchableOpacity
                style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
                onPress={handleShare}
                disabled={isSharing}
              >
                {isSharing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="share-outline" size={20} color="#fff" />
                    <Text style={styles.shareButtonText}>画像を共有</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
    // Web: ハードウェアアクセラレーションで振動を防止
    ...(Platform.OS === 'web' ? {
      transform: [{ translateZ: 0 }],
      willChange: 'transform',
    } : {}),
  } as any,
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
    justifyContent: 'flex-end',
  },
  headerButton: {
    marginLeft: 16,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    overflow: 'hidden',
    // Web: 画像の再レンダリングがヘッダーに影響しないよう隔離
    ...(Platform.OS === 'web' ? {
      contain: 'layout paint',
    } : {}),
  } as any,
  photoCarouselContainer: {
    height: PHOTO_HEIGHT,
    overflow: 'hidden',
    // Web: GPUレイヤーで分離
    ...(Platform.OS === 'web' ? {
      transform: [{ translateZ: 0 }],
    } : {}),
  } as any,
  photoTouchable: {
    height: PHOTO_HEIGHT,
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
    height: PHOTO_HEIGHT,
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
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    height: '80%',
  },
  // Share Modal Styles
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  shareModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  shareModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  shareModalCloseButton: {
    padding: 4,
  },
  shareCardScrollView: {
    maxHeight: 500,
  },
  shareCardScrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  shareModalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0095f6',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  shareButtonDisabled: {
    backgroundColor: '#b2dffc',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MemoryDetailScreen;
