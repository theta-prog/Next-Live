import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useResponsive } from '../context/ResponsiveContext';
import { theme, typography } from '../styles/theme';

const CalendarScreen = ({ navigation }: any) => {
  const { liveEvents } = useApp();
  const { isPC } = useResponsive();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ライブイベントの日付をマークするためのオブジェクトを作成
  const markedDates = liveEvents.reduce((acc, event) => {
    const dateKey = event.date;
    const isSelected = selectedDate === dateKey;
    
    acc[dateKey] = {
      marked: true,
      dotColor: isSelected ? '#ffffff' : '#007AFF',
      selectedColor: '#007AFF',
      selected: isSelected,
      customStyles: {
        container: {
          backgroundColor: isSelected ? '#007AFF' : '#FFE5E5', // ライブがある日は薄いピンク色
          borderRadius: 16,
          borderWidth: isSelected ? 0 : 2,
          borderColor: isSelected ? 'transparent' : '#FF6B6B', // 赤いボーダーで目立たせる
        },
        text: {
          color: isSelected ? '#fff' : '#FF6B6B', // ライブがある日は赤文字
          fontWeight: 'bold', // ライブがある日は常に太字
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
  };  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 固定ヘッダー（SPのみ） */}
        {!isPC && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>カレンダー</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('LiveEventForm')}
            >
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* スクロール可能なコンテンツ */}
        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: theme.colors.text.primary,
  },
  addButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  calendar: {
    borderRadius: theme.borderRadius.lg,
  },
  selectedDateInfo: {
    backgroundColor: theme.colors.surface,
    margin: 16,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    ...theme.shadows.medium,
  },
  selectedDateTitle: {
    ...typography.h3,
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noEventsText: {
    ...typography.body1,
    color: theme.colors.text.secondary,
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  eventMainInfo: {
    flex: 1,
  },
  eventTitle: {
    ...typography.body1,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  eventArtist: {
    ...typography.body2,
    color: theme.colors.accent,
    marginBottom: 2,
  },
  eventVenue: {
    ...typography.caption,
    color: theme.colors.text.secondary,
  },
  eventTimeInfo: {
    alignItems: 'flex-end',
  },
  eventTime: {
    ...typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    ...typography.h3,
    color: theme.colors.text.secondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...typography.body2,
    color: theme.colors.text.tertiary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CalendarScreen;
