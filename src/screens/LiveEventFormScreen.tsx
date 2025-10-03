import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { LiveEvent } from '../database/database';
import { theme, typography } from '../styles/theme';

const LiveEventFormScreen = ({ navigation, route }: any) => {
  const { artists, addLiveEvent, updateLiveEvent, liveEvents } = useApp();
  const editingEventId = route.params?.eventId;
  const editingEvent = editingEventId ? liveEvents.find(e => e.id === editingEventId) : null;

  const [title, setTitle] = useState('');
  const [artistId, setArtistId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [doorsOpen, setDoorsOpen] = useState('');
  const [showStart, setShowStart] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [ticketStatus, setTicketStatus] = useState<'won' | 'lost' | 'pending' | 'purchased' | undefined>(undefined);
  const [ticketPrice, setTicketPrice] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [memo, setMemo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  // インライン新規アーティストフォームはUX要件変更により削除

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setArtistId(editingEvent.artist_id);
      setDate(new Date(editingEvent.date));
      setDoorsOpen(editingEvent.doors_open || '');
      setShowStart(editingEvent.show_start || '');
      setVenueName(editingEvent.venue_name);
      setVenueAddress(editingEvent.venue_address || '');
      setTicketStatus(editingEvent.ticket_status);
      setTicketPrice(editingEvent.ticket_price?.toString() || '');
      setSeatNumber(editingEvent.seat_number || '');
      setMemo(editingEvent.memo || '');
    }
  }, [editingEvent]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', '公演名を入力してください');
      return;
    }
    if (!artistId) {
      Alert.alert('エラー', 'アーティストを選択してください');
      return;
    }
    if (!venueName.trim()) {
      Alert.alert('エラー', '会場名を入力してください');
      return;
    }

    const eventData: Omit<LiveEvent, 'id' | 'created_at'> = {
      title: title.trim(),
      artist_id: artistId,
      date: date.toISOString().split('T')[0]!,
      doors_open: doorsOpen.trim() || undefined,
      show_start: showStart.trim() || undefined,
      venue_name: venueName.trim(),
      venue_address: venueAddress.trim() || undefined,
      ticket_status: ticketStatus,
      ticket_price: ticketPrice ? parseFloat(ticketPrice) : undefined,
      seat_number: seatNumber.trim() || undefined,
      memo: memo.trim() || undefined,
    };

    try {
      if (editingEvent) {
        await updateLiveEvent(editingEvent.id!, eventData);
      } else {
        await addLiveEvent(eventData);
      }
      navigation.goBack();
    } catch {
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const ticketStatusOptions = [
    { label: '選択してください', value: undefined },
    { label: '当選', value: 'won' },
    { label: '落選', value: 'lost' },
    { label: '抽選待ち', value: 'pending' },
    { label: '購入済み', value: 'purchased' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 固定ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingEvent ? 'ライブ編集' : 'ライブ追加'}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>保存</Text>
          </TouchableOpacity>
        </View>

        {/* スクロール可能なコンテンツ */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本情報</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>公演名 *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="ライブツアー名など"
              testID="title-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>アーティスト *</Text>
            {artists.length === 0 && (
              <View style={styles.noArtistContainer}>
                <Text style={styles.noArtistText}>アーティストが登録されていません</Text>
                <TouchableOpacity
                  style={styles.addArtistButton}
                  onPress={() => navigation.navigate('ArtistForm')}
                >
                  <Text style={styles.addArtistButtonText}>登録画面を開く</Text>
                </TouchableOpacity>
              </View>
            )}
            {artists.length > 0 && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={artistId}
                  onValueChange={setArtistId}
                  style={styles.picker}
                >
                  <Picker.Item label="選択してください" value={null} />
                  {artists.map((artist) => (
                    <Picker.Item
                      key={artist.id}
                      label={artist.name}
                      value={artist.id}
                    />
                  ))}
                </Picker>
                <TouchableOpacity style={styles.inlineAddButton} onPress={() => navigation.navigate('ArtistForm')}>
                  <Ionicons name="add-circle-outline" size={20} color={theme.colors.accent} />
                  <Text style={styles.inlineAddButtonText}>追加</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>日程 *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>時間</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>開場時間</Text>
            <TextInput
              style={styles.input}
              value={doorsOpen}
              onChangeText={setDoorsOpen}
              placeholder="例: 18:00"
              testID="doors-open-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>開演時間</Text>
            <TextInput
              style={styles.input}
              value={showStart}
              onChangeText={setShowStart}
              placeholder="例: 19:00"
              testID="show-start-input"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>会場情報</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>会場名 *</Text>
            <TextInput
              style={styles.input}
              value={venueName}
              onChangeText={setVenueName}
              placeholder="例: 東京ドーム"
              testID="venue-name-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>住所</Text>
            <TextInput
              style={styles.input}
              value={venueAddress}
              onChangeText={setVenueAddress}
              placeholder="例: 東京都文京区後楽1-3-61"
              multiline
              numberOfLines={2}
              testID="venue-address-input"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>チケット情報</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>チケット状況</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={ticketStatus}
                onValueChange={setTicketStatus}
                style={styles.picker}
              >
                {ticketStatusOptions.map((option) => (
                  <Picker.Item
                    key={option.value || 'none'}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>チケット代金</Text>
            <TextInput
              style={styles.input}
              value={ticketPrice}
              onChangeText={setTicketPrice}
              placeholder="例: 8000"
              keyboardType="numeric"
              testID="ticket-price-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>座席番号</Text>
            <TextInput
              style={styles.input}
              value={seatNumber}
              onChangeText={setSeatNumber}
              placeholder="例: アリーナ A1 列 10 番"
              testID="seat-number-input"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>メモ</Text>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, styles.memoInput]}
              value={memo}
              onChangeText={setMemo}
              placeholder="その他のメモ"
              multiline
              numberOfLines={4}
              testID="memo-input"
            />
          </View>
        </View>
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
    ...typography.h3,
    color: theme.colors.text.primary,
  },
  saveButton: {
    ...typography.button,
    color: theme.colors.accent,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  form: {
    padding: 16,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.card,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.medium,
  },
  sectionTitle: {
    ...typography.h3,
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...typography.label,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    ...typography.body1,
    backgroundColor: theme.colors.background,
  },
  memoInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    backgroundColor: theme.colors.background,
  },
  dateButtonText: {
    ...typography.body1,
    color: theme.colors.text.primary,
  },
  noArtistContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  noArtistText: {
    ...typography.body1,
    color: theme.colors.text.secondary,
    marginBottom: 12,
  },
  addArtistButton: {
    backgroundColor: theme.colors.accent,
    padding: 12,
    borderRadius: theme.borderRadius.button,
  },
  addArtistButtonText: {
    ...typography.button,
    color: theme.colors.text.inverse,
  },
  inlineAddButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    ...theme.shadows.small,
  },
  inlineAddButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  inlineArtistForm: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    padding: 12,
  },
  inlineArtistLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.text.primary,
  },
  inlineArtistActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  inlineArtistCancel: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  inlineArtistCancelText: {
    color: '#666',
    fontSize: 14,
  },
  inlineArtistSave: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  inlineArtistSaveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  gotoArtistFull: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  gotoArtistFullText: {
    fontSize: 12,
    color: theme.colors.accent,
    textDecorationLine: 'underline',
  },
});

export default LiveEventFormScreen;
