import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useApp } from '../context/AppContext';

const LiveEventDetailScreen = ({ navigation, route }: any) => {
  const { liveEvents, deleteLiveEvent, memories } = useApp();
  const eventId = route.params?.eventId;
  const event = liveEvents.find(e => e.id === eventId);
  const memory = memories.find(m => m.live_event_id === eventId);

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>イベントが見つかりません</Text>
      </View>
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

  const calculateDaysUntil = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isEventPassed = () => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate < today;
  };

  const handleDelete = () => {
    Alert.alert(
      '削除確認',
      `「${event.title}」を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await deleteLiveEvent(event.id!);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getTicketStatusText = (status?: string) => {
    switch (status) {
      case 'won': return '当選';
      case 'lost': return '落選';
      case 'pending': return '抽選待ち';
      case 'purchased': return '購入済み';
      default: return '未設定';
    }
  };

  const getTicketStatusColor = (status?: string) => {
    switch (status) {
      case 'won': return '#4CAF50';
      case 'lost': return '#F44336';
      case 'pending': return '#FF9800';
      case 'purchased': return '#2196F3';
      default: return '#999';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('LiveEventForm', { eventId: event.id })}
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
        <View style={styles.mainInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.artistName}>{event.artist_name}</Text>
          <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
          
          {!isEventPassed() && (
            <View style={styles.countdown}>
              <Text style={styles.countdownLabel}>あと</Text>
              <Text style={styles.countdownDays}>
                {calculateDaysUntil(event.date)}
              </Text>
              <Text style={styles.countdownLabel}>日</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>時間</Text>
          {event.doors_open && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>開場</Text>
              <Text style={styles.infoValue}>{event.doors_open}</Text>
            </View>
          )}
          {event.show_start && (
            <View style={styles.infoRow}>
              <Ionicons name="play-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>開演</Text>
              <Text style={styles.infoValue}>{event.show_start}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>会場</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>会場名</Text>
            <Text style={styles.infoValue}>{event.venue_name}</Text>
          </View>
          {event.venue_address && (
            <View style={styles.infoRow}>
              <Ionicons name="map-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>住所</Text>
              <Text style={styles.infoValue}>{event.venue_address}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>チケット情報</Text>
          <View style={styles.infoRow}>
            <Ionicons name="ticket-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>状況</Text>
            <Text style={[
              styles.ticketStatus,
              { color: getTicketStatusColor(event.ticket_status) }
            ]}>
              {getTicketStatusText(event.ticket_status)}
            </Text>
          </View>
          {event.ticket_price && (
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>金額</Text>
              <Text style={styles.infoValue}>¥{event.ticket_price.toLocaleString()}</Text>
            </View>
          )}
          {event.seat_number && (
            <View style={styles.infoRow}>
              <Ionicons name="albums-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>座席</Text>
              <Text style={styles.infoValue}>{event.seat_number}</Text>
            </View>
          )}
        </View>

        {event.memo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>メモ</Text>
            <Text style={styles.memoText}>{event.memo}</Text>
          </View>
        )}

        {isEventPassed() && (
          <View style={styles.memorySection}>
            <View style={styles.memorySectionHeader}>
              <Text style={styles.sectionTitle}>思い出</Text>
              <TouchableOpacity
                style={styles.addMemoryButton}
                onPress={() => navigation.navigate('MemoryForm', { eventId: event.id })}
              >
                <Text style={styles.addMemoryButtonText}>
                  {memory ? '編集' : '追加'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {memory ? (
              <TouchableOpacity
                style={styles.memoryCard}
                onPress={() => navigation.navigate('MemoryDetail', { memoryId: memory.id })}
              >
                <Text style={styles.memoryCardText}>思い出が記録されています</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ) : (
              <View style={styles.noMemoryCard}>
                <Text style={styles.noMemoryText}>まだ思い出が記録されていません</Text>
              </View>
            )}
          </View>
        )}
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
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  content: {
    padding: 16,
  },
  mainInfo: {
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  countdownLabel: {
    fontSize: 16,
    color: '#666',
  },
  countdownDays: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginHorizontal: 8,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    minWidth: 60,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  ticketStatus: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
  memoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  memorySection: {
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
  memorySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addMemoryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addMemoryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  memoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  memoryCardText: {
    fontSize: 16,
    color: '#333',
  },
  noMemoryCard: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    alignItems: 'center',
  },
  noMemoryText: {
    fontSize: 16,
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
});

export default LiveEventDetailScreen;
