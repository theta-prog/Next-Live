import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, IconButton, SectionHeader } from '../components/UI';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { theme, typography } from '../styles/theme';

const HomeScreen = ({ navigation }: any) => {
  const { upcomingEvents } = useApp();
  const { logout } = useAuth();

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 固定ヘッダー */}
                <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={[typography.brand, styles.headerTitle]}>MEMOLIVE</Text>
              <Text style={[typography.body2, styles.headerSubtitle]}>お気に入りのアーティストを管理</Text>
            </View>
          </View>
        </View>


        {/* スクロール可能なコンテンツ */}
        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >

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
            
            <View style={styles.countdown} testID="countdown-view">
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
            testID="countdown-button"
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
        <View style={styles.actionRow}>
          <View style={styles.actionButtonContainer}>
            <Button
              title="+ ライブ"
              onPress={() => navigation.navigate('LiveEventForm')}
              variant="primary"
              size="medium"
              style={styles.actionButton}
              testID="add-event-button"
            />
          </View>
          <View style={styles.actionButtonContainer}>
            <Button
              title="📅 予定"
              onPress={() => navigation.navigate('Calendar')}
              variant="outline"
              size="medium"
              style={styles.actionButton}
            />
          </View>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.actionButtonContainer}>
            <Button
              title="👤 推し"
              onPress={() => navigation.navigate('Artists')}
              variant="outline"
              size="medium"
              style={styles.actionButton}
            />
          </View>
          <View style={styles.actionButtonContainer}>
            <Button
              title="📸 思い出"
              onPress={() => navigation.navigate('Memories')}
              variant="secondary"
              size="medium"
              style={styles.actionButton}
              testID="add-memory-button"
            />
          </View>
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

      <View style={styles.footer}>
        <Button
          title="ログアウト"
          onPress={logout}
          variant="ghost"
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        />
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
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
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100, // タブバーの高さを考慮
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    marginBottom: theme.spacing.sm,
    fontSize: 32, // ヘッダー用に少し小さく調整
    lineHeight: 40,
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButtonContainer: {
    flex: 1,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: theme.borderRadius.button,
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
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoutButton: {
    minWidth: 120,
  },
  logoutButtonText: {
    color: theme.colors.error,
  },
  versionText: {
    ...typography.caption,
    color: theme.colors.text.tertiary,
  },
});

export default HomeScreen;
