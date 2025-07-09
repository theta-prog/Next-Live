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
import { Card, Button, SectionHeader, IconButton } from '../components/UI';
import { theme, typography } from '../styles/theme';

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
        <Text style={[typography.h1, styles.headerTitle]}>Next Live</Text>
        <Text style={[typography.body2, styles.headerSubtitle]}>お気に入りのアーティストを管理</Text>
      </View>

      {nextEvent ? (
        <Card variant="elevated" style={styles.nextEventCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="musical-notes" size={24} color={theme.colors.accent} />
              <Text style={[typography.h3, styles.cardTitle]}>次のライブ</Text>
            </View>
            <IconButton
              onPress={() => navigation.navigate('LiveEventDetail', { eventId: nextEvent.id })}
              variant="ghost"
              size="medium"
            >
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
            </IconButton>
          </View>
          
          <View style={styles.eventInfo}>
            <Text style={[typography.h2, styles.eventTitle]}>{nextEvent.title}</Text>
            <Text style={[typography.body1, styles.artist]}>{nextEvent.artist_name}</Text>
            <Text style={[typography.body1, styles.date]}>{formatDate(nextEvent.date)}</Text>
            <Text style={[typography.body2, styles.venue]}>{nextEvent.venue_name}</Text>
            
            <View style={styles.countdown}>
              <Text style={[typography.body1, styles.countdownLabel]}>あと</Text>
              <Text style={[typography.h1, styles.countdownDays]}>
                {calculateDaysUntil(nextEvent.date)}
              </Text>
              <Text style={[typography.body1, styles.countdownLabel]}>日</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate('LiveEventDetail', { eventId: nextEvent.id })}
          >
            <Text style={[typography.body1, styles.detailButtonText]}>詳細を見る</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </Card>
      ) : (
        <Card variant="outlined" style={styles.noEventCard}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.text.tertiary} />
          <Text style={[typography.h3, styles.noEventText]}>予定されているライブがありません</Text>
          <Text style={[typography.body2, styles.noEventSubtext]}>新しいライブ予定を追加してみましょう</Text>
        </Card>
      )}

      <View style={styles.quickActions}>
        <View style={styles.actionButtonContainer}>
          <Ionicons name="add-circle" size={24} color={theme.colors.primary} style={styles.actionIcon} />            <Button
              title="ライブ追加"
              onPress={() => navigation.navigate('LiveEventForm')}
              variant="primary"
              style={styles.actionButton}
            />
        </View>

        <View style={styles.actionButtonContainer}>
          <Ionicons name="calendar" size={24} color={theme.colors.primary} style={styles.actionIcon} />            <Button
              title="カレンダー"
              onPress={() => navigation.navigate('Calendar')}
              variant="outline"
              style={styles.actionButton}
            />
        </View>

        <View style={styles.actionButtonContainer}>
          <Ionicons name="heart" size={24} color={theme.colors.primary} style={styles.actionIcon} />            <Button
              title="思い出"
              onPress={() => navigation.navigate('Memories')}
              variant="outline"
              style={styles.actionButton}
            />
        </View>

        <View style={styles.actionButtonContainer}>
          <Ionicons name="people" size={24} color={theme.colors.primary} style={styles.actionIcon} />            <Button
              title="アーティスト"
              onPress={() => navigation.navigate('Artists')}
              variant="secondary"
              style={styles.actionButton}
            />
        </View>
      </View>

      {upcomingEvents.length > 1 && (
        <Card variant="default" style={styles.upcomingSection}>
          <SectionHeader title="今後の予定" />
          {upcomingEvents.slice(1, 4).map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.upcomingEvent}
              onPress={() => navigation.navigate('LiveEventDetail', { eventId: event.id })}
            >
              <View style={styles.upcomingEventInfo}>
                <Text style={[typography.body1, styles.upcomingEventTitle]}>{event.title}</Text>
                <Text style={[typography.body2, styles.upcomingEventArtist]}>{event.artist_name}</Text>
                <Text style={[typography.caption, styles.upcomingEventDate]}>{formatDate(event.date)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    marginBottom: theme.spacing.sm,
    letterSpacing: -1,
  },
  headerSubtitle: {
    opacity: 0.8,
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
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
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
    letterSpacing: -0.5,
  },
  artist: {
    color: theme.colors.accent,
    marginBottom: theme.spacing.sm,
  },
  date: {
    marginBottom: theme.spacing.sm,
  },
  venue: {
    color: theme.colors.text.secondary,
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.none,
  },
  countdownLabel: {
    color: theme.colors.text.secondary,
  },
  countdownDays: {
    color: theme.colors.accent,
    marginHorizontal: theme.spacing.sm,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  detailButtonText: {
    color: theme.colors.text.secondary,
  },
  noEventCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  noEventText: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  noEventSubtext: {
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  actionButton: {
    width: '48%',
    minHeight: 52,
  },
  actionButtonContainer: {
    width: '48%',
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  actionIcon: {
    marginBottom: theme.spacing.sm,
  },
  upcomingSection: {
    // Card component handles styling
  },
  upcomingEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  upcomingEventInfo: {
    flex: 1,
  },
  upcomingEventTitle: {
    letterSpacing: -0.2,
    marginBottom: theme.spacing.xs,
  },
  upcomingEventArtist: {
    color: theme.colors.accent,
    marginBottom: theme.spacing.xs,
  },
  upcomingEventDate: {
    color: theme.colors.text.tertiary,
  },
});

export default HomeScreen;
