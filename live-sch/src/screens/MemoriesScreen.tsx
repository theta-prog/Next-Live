import { Ionicons } from '@expo/vector-icons';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useApp } from '../context/AppContext';

const MemoriesScreen = ({ navigation }: any) => {
  const { memories } = useApp();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderMemory = ({ item }: any) => {
    const photos = item.photos ? JSON.parse(item.photos) : [];
    const firstPhoto = photos[0];

    return (
      <TouchableOpacity
        style={styles.memoryCard}
        onPress={() => navigation.navigate('MemoryDetail', { memoryId: item.id })}
      >
        {firstPhoto && (
          <Image source={{ uri: firstPhoto }} style={styles.memoryImage} />
        )}
        
        <View style={styles.memoryContent}>
          <View style={styles.memoryHeader}>
            <Text style={styles.eventTitle}>{item.event_title}</Text>
            <Text style={styles.eventDate}>{formatDate(item.event_date)}</Text>
          </View>
          
          <Text style={styles.artistName}>{item.artist_name}</Text>
          
          {item.review && (
            <Text style={styles.reviewPreview} numberOfLines={2}>
              {item.review}
            </Text>
          )}
          
          <View style={styles.memoryFooter}>
            {photos.length > 0 && (
              <View style={styles.photoCount}>
                <Ionicons name="camera-outline" size={16} color="#666" />
                <Text style={styles.photoCountText}>{photos.length}</Text>
              </View>
            )}
            
            {item.setlist && (
              <View style={styles.setlistIndicator}>
                <Ionicons name="list-outline" size={16} color="#666" />
                <Text style={styles.setlistText}>セットリスト</Text>
              </View>
            )}
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>思い出</Text>
      </View>

      {memories.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>まだ思い出が記録されていません</Text>
          <Text style={styles.emptyStateSubtext}>参加したライブの詳細画面から思い出を追加できます</Text>
        </View>
      ) : (
        <FlatList
          data={memories}
          renderItem={renderMemory}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  memoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  memoryImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
  },
  memoryContent: {
    flex: 1,
    padding: 16,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
  },
  artistName: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  reviewPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  memoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  photoCountText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  setlistIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setlistText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
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
    lineHeight: 20,
  },
});

export default MemoriesScreen;
