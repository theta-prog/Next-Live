import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

const CalendarScreen = ({ navigation }: any) => {
  const { liveEvents } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ライブイベントの日付をマークするためのオブジェクトを作成
  const markedDates = liveEvents.reduce((acc, event) => {
    const dateKey = event.date;
    acc[dateKey] = {
      marked: true,
      dotColor: '#007AFF',
      selectedColor: '#007AFF',
      selected: selectedDate === dateKey,
      customStyles: {
        container: {
          backgroundColor: selectedDate === dateKey ? '#007AFF' : 'transparent',
          borderRadius: 16,
        },
        text: {
          color: selectedDate === dateKey ? '#fff' : '#333',
          fontWeight: selectedDate === dateKey ? 'bold' : 'normal',
        },
      },
    };
    return acc;
  }, {} as any);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const getEventsForDate = (date: string) => {
    return liveEvents.filter(event => event.date === date);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>カレンダー</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('LiveEventForm')}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          style={styles.calendar}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#007AFF',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#007AFF',
            selectedDotColor: '#ffffff',
            arrowColor: '#007AFF',
            disabledArrowColor: '#d9e1e8',
            monthTextColor: '#2d4150',
            indicatorColor: '#007AFF',
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontWeight: '400',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 13,
          }}
          firstDay={1}
          showWeekNumbers={false}
          markingType="custom"
          markedDates={markedDates}
          onDayPress={onDayPress}
          enableSwipeMonths={true}
        />
      </View>

      {selectedDate && (
        <View style={styles.selectedDateInfo}>
          <Text style={styles.selectedDateTitle}>
            {formatDate(selectedDate)}
          </Text>
          
          {selectedDateEvents.length === 0 ? (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsText}>この日にライブ予定はありません</Text>
            </View>
          ) : (
            <View style={styles.eventsContainer}>
              {selectedDateEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => navigation.navigate('LiveEventDetail', { eventId: event.id })}
                >
                  <View style={styles.eventMainInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventArtist}>{event.artist_name}</Text>
                    <Text style={styles.eventVenue}>{event.venue_name}</Text>
                  </View>
                  
                  <View style={styles.eventTimeInfo}>
                    {event.doors_open && (
                      <Text style={styles.eventTime}>開場 {event.doors_open}</Text>
                    )}
                    {event.show_start && (
                      <Text style={styles.eventTime}>開演 {event.show_start}</Text>
                    )}
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {!selectedDate && liveEvents.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>まだライブ予定がありません</Text>
          <Text style={styles.emptyStateSubtext}>右上の「+」ボタンから追加してみましょう</Text>
        </View>
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
  calendarContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendar: {
    borderRadius: 12,
  },
  selectedDateInfo: {
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
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  eventMainInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventArtist: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  eventVenue: {
    fontSize: 14,
    color: '#666',
  },
  eventTimeInfo: {
    alignItems: 'flex-end',
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
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
});

export default CalendarScreen;
