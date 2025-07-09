import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }: any) => {
  const { upcomingEvents } = useApp();

  const nextEvent = upcomingEvents[0];

  const calculateDaysUntil = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ライブスケジュール</Text>
        <Text style={styles.headerSubtitle}>お気に入りのアーティストを管理</Text>
      </View>

      {nextEvent ? (
        <View style={styles.nextEventCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="musical-notes" size={24} color="#333" />
            <Text style={styles.cardTitle}>次のライブ</Text>
          </View>
          
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{nextEvent.title}</Text>
            <Text style={styles.artistName}>{nextEvent.artist_name}</Text>
            <Text style={styles.eventDate}>{formatDate(nextEvent.date)}</Text>
            <Text style={styles.venue}>{nextEvent.venue_name}</Text>
            
            <View style={styles.countdown}>
              <Text style={styles.countdownLabel}>あと</Text>
              <Text style={styles.countdownDays}>
                {calculateDaysUntil(nextEvent.date)}
              </Text>
              <Text style={styles.countdownLabel}>日</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate('LiveEventDetail', { eventId: nextEvent.id })}
          >
            <Text style={styles.detailButtonText}>詳細を見る</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noEventCard}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.noEventText}>予定されているライブがありません</Text>
          <Text style={styles.noEventSubtext}>新しいライブ予定を追加してみましょう</Text>
        </View>
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('LiveEventForm')}
        >
          <Ionicons name="add-circle" size={32} color="#007AFF" />
          <Text style={styles.actionButtonText}>ライブ追加</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Ionicons name="calendar" size={32} color="#007AFF" />
          <Text style={styles.actionButtonText}>カレンダー</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Memories')}
        >
          <Ionicons name="heart" size={32} color="#007AFF" />
          <Text style={styles.actionButtonText}>思い出</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Artists')}
        >
          <Ionicons name="people" size={32} color="#007AFF" />
          <Text style={styles.actionButtonText}>アーティスト</Text>
        </TouchableOpacity>
      </View>

      {upcomingEvents.length > 1 && (
        <View style={styles.upcomingSection}>
          <Text style={styles.sectionTitle}>今後の予定</Text>
          {upcomingEvents.slice(1, 4).map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.upcomingEvent}
              onPress={() => navigation.navigate('LiveEventDetail', { eventId: event.id })}
            >
              <View style={styles.upcomingEventInfo}>
                <Text style={styles.upcomingEventTitle}>{event.title}</Text>
                <Text style={styles.upcomingEventArtist}>{event.artist_name}</Text>
                <Text style={styles.upcomingEventDate}>{formatDate(event.date)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      )}
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
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  nextEventCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  eventInfo: {
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  venue: {
    fontSize: 14,
    color: '#666',
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  countdownLabel: {
    fontSize: 16,
    color: '#666',
  },
  countdownDays: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginHorizontal: 8,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailButtonText: {
    fontSize: 16,
    color: '#666',
  },
  noEventCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noEventText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  noEventSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
  },
  upcomingSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
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
  upcomingEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  upcomingEventInfo: {
    flex: 1,
  },
  upcomingEventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  upcomingEventArtist: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
  },
  upcomingEventDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default HomeScreen;
