import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import ShareableMemoryCard from '../components/ShareableMemoryCard';
import { captureViewAsImage, shareImage, generateShareMessage } from '../utils/share';
import { DEMO_MEMORY, DEMO_EVENT } from '../utils/demoData';

/**
 * 開発環境用の共有テストページ
 */
const ShareTestScreen = () => {
  const shareCardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [lastCapturedUri, setLastCapturedUri] = useState<string | null>(null);

  const handleTestCapture = async () => {
    console.log('Testing capture...');
    const uri = await captureViewAsImage(shareCardRef);
    setLastCapturedUri(uri);
    
    if (uri) {
      Alert.alert('成功', `画像キャプチャが成功しました！\nURI: ${uri.substring(0, 50)}...`);
    } else {
      Alert.alert('失敗', '画像キャプチャに失敗しました');
    }
  };

  const handleTestShare = async () => {
    if (!lastCapturedUri) {
      Alert.alert('エラー', 'まず画像をキャプチャしてください');
      return;
    }

    setIsSharing(true);
    try {
      const message = generateShareMessage({
        eventTitle: DEMO_MEMORY.event_title,
        artistName: DEMO_MEMORY.artist_name,
        eventDate: DEMO_MEMORY.event_date,
        review: DEMO_MEMORY.review,
      });

      const success = await shareImage(lastCapturedUri, {
        title: '思い出を共有',
        message,
      });

      if (success) {
        Alert.alert('成功', '共有処理が完了しました！');
      }
    } catch (error) {
      console.error('Share test error:', error);
      Alert.alert('エラー', '共有テストでエラーが発生しました');
    } finally {
      setIsSharing(false);
    }
  };

  const photos = JSON.parse(DEMO_MEMORY.photos);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📱 共有機能テスト</Text>
        <Text style={styles.subtitle}>開発環境用テストページ</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>デモカード</Text>
        <View style={styles.cardContainer}>
          <ShareableMemoryCard
            ref={shareCardRef}
            eventTitle={DEMO_MEMORY.event_title}
            artistName={DEMO_MEMORY.artist_name}
            eventDate={DEMO_MEMORY.event_date}
            venueName={DEMO_EVENT.venue_name}
            review={DEMO_MEMORY.review}
            photo={photos.length > 0 ? photos[0] : undefined}
            setlist={DEMO_MEMORY.setlist}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>テストボタン</Text>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestCapture}
        >
          <Text style={styles.buttonText}>1. 画像キャプチャテスト</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.shareButton, !lastCapturedUri && styles.disabledButton]}
          onPress={handleTestShare}
          disabled={!lastCapturedUri || isSharing}
        >
          <Text style={styles.buttonText}>
            {isSharing ? '2. 共有中...' : '2. 共有テスト'}
          </Text>
        </TouchableOpacity>

        {lastCapturedUri && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>✅ キャプチャ成功</Text>
            <Text style={styles.infoText}>URI: {lastCapturedUri.substring(0, 60)}...</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>開発ノート</Text>
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            🚧 ローカル開発環境での制限：{'\n'}
            • react-native-view-shot: Expo Goでは動作しない場合があります{'\n'}
            • expo-sharing: 実機でのみ正常動作{'\n'}
            • Web Share API: localhostでは制限あり{'\n\n'}
            
            ✅ 推奨テスト方法：{'\n'}
            • 実機でのテスト{'\n'}
            • Expo Dev Client の使用{'\n'}
            • プロダクションビルドでの確認
          </Text>
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
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  cardContainer: {
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#0095f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#00d4aa',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5a2d',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#2d5a2d',
  },
  noteBox: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  noteText: {
    fontSize: 14,
    color: '#664d03',
    lineHeight: 20,
  },
});

export default ShareTestScreen;