import { Artist, database, DeletedItem, LiveEvent, Memory } from '../database/asyncDatabase';
import { storage } from '../utils/storage';
import client from './client';

interface SyncResponse {
  serverChanges: {
    artists: any[];
    liveEvents: any[];
    memories: any[];
  };
  syncedAt: string;
  conflicts: any[];
}

interface LocalChanges {
  artists: Artist[];
  liveEvents: LiveEvent[];
  memories: Memory[];
  deletedItems: DeletedItem[];
}

// フィールド名のマッピング（ローカル -> サーバー）
const mapArtistToServer = (artist: Artist) => ({
  id: artist.id,
  name: artist.name,
  website: artist.website,
  socialMedia: artist.social_media,
  photoUrl: artist.photo,
});

const mapLiveEventToServer = (event: LiveEvent) => ({
  id: event.id,
  title: event.title,
  artistId: event.artist_id,
  date: event.date,
  venue: event.venue_name,
  venueAddress: event.venue_address,
  doorsOpen: event.doors_open,
  showStart: event.show_start,
  ticketStatus: event.ticket_status,
  ticketPrice: event.ticket_price,
  seatNumber: event.seat_number,
  memo: event.memo,
});

const mapMemoryToServer = (memory: Memory) => ({
  id: memory.id,
  eventId: memory.live_event_id,
  review: memory.review,
  setlist: memory.setlist,
  photos: memory.photos ? JSON.parse(memory.photos) : [],
});

// フィールド名のマッピング（サーバー -> ローカル）
const mapArtistFromServer = (item: any): Artist => ({
  id: item.id,
  name: item.name,
  website: item.website,
  social_media: item.socialMedia,
  photo: item.photoUrl,
  created_at: item.createdAt,
  updated_at: item.updatedAt,
  sync_status: 'synced',
});

const mapLiveEventFromServer = (item: any): LiveEvent => ({
  id: item.id,
  title: item.title,
  artist_id: item.artistId,
  date: item.date,
  venue_name: item.venue,
  venue_address: item.venueAddress,
  doors_open: item.doorsOpen,
  show_start: item.showStart,
  ticket_status: item.ticketStatus,
  ticket_price: item.ticketPrice,
  seat_number: item.seatNumber,
  memo: item.memo,
  created_at: item.createdAt,
  updated_at: item.updatedAt,
  sync_status: 'synced',
});

const mapMemoryFromServer = (item: any): Memory => ({
  id: item.id,
  live_event_id: item.eventId,
  review: item.review,
  setlist: item.setlist,
  photos: item.photos ? JSON.stringify(item.photos) : undefined,
  created_at: item.createdAt,
  updated_at: item.updatedAt,
  sync_status: 'synced',
});

export const syncService = {
  /**
   * 最後の同期日時を取得
   */
  getLastSyncTime: async (): Promise<string | null> => {
    return storage.getItem('lastSyncAt');
  },

  /**
   * 最後の同期日時を保存
   */
  setLastSyncTime: async (syncedAt: string): Promise<void> => {
    await storage.setItem('lastSyncAt', syncedAt);
  },

  /**
   * ローカルの未同期データを取得
   */
  getLocalChanges: async (): Promise<LocalChanges> => {
    const [artists, liveEvents, memories] = await Promise.all([
      database.getAllArtists(),
      database.getAllLiveEvents(),
      database.getAllMemories(),
    ]);

    // 未同期のアイテムのみ抽出
    const unsyncedArtists = artists.filter(a => a.sync_status !== 'synced');
    const unsyncedEvents = liveEvents.filter(e => e.sync_status !== 'synced');
    const unsyncedMemories = memories.filter(m => m.sync_status !== 'synced');

    // 削除されたアイテムを取得
    const deletedItems = await database.getDeletedItems();

    return {
      artists: unsyncedArtists,
      liveEvents: unsyncedEvents,
      memories: unsyncedMemories,
      deletedItems,
    };
  },

  /**
   * サーバーと同期を実行
   */
  sync: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const accessToken = await storage.getItem('accessToken');
      if (!accessToken) {
        return { success: false, error: 'Not authenticated' };
      }

      // 最後の同期日時を取得
      const lastSyncAt = await syncService.getLastSyncTime();

      // ローカルの変更を取得
      const localChanges = await syncService.getLocalChanges();

      // サーバーに同期リクエストを送信
      const response = await client.post<SyncResponse>('/v1/sync', {
        lastSyncAt: lastSyncAt || undefined,
        clientChanges: {
          artists: localChanges.artists.map(mapArtistToServer),
          liveEvents: localChanges.liveEvents.map(mapLiveEventToServer),
          memories: localChanges.memories.map(mapMemoryToServer),
        },
      });

      const { serverChanges, syncedAt } = response.data;

      // サーバーからの変更をローカルに適用
      await syncService.applyServerChanges(serverChanges);

      // 同期済みのローカルアイテムのステータスを更新
      await syncService.markAsSynced(localChanges);

      // 削除済みアイテムをクリア
      await database.clearDeletedItems();

      // 同期日時を保存
      await syncService.setLastSyncTime(syncedAt);

      return { success: true };
    } catch (error: any) {
      console.error('Sync failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
      };
    }
  },

  /**
   * サーバーからの変更をローカルに適用
   */
  applyServerChanges: async (serverChanges: SyncResponse['serverChanges']): Promise<void> => {
    // アーティストを更新/追加
    for (const serverArtist of serverChanges.artists) {
      const localArtist = mapArtistFromServer(serverArtist);
      await database.upsertArtist(localArtist);
    }

    // ライブイベントを更新/追加
    for (const serverEvent of serverChanges.liveEvents) {
      const localEvent = mapLiveEventFromServer(serverEvent);
      await database.upsertLiveEvent(localEvent);
    }

    // メモリを更新/追加
    for (const serverMemory of serverChanges.memories) {
      const localMemory = mapMemoryFromServer(serverMemory);
      await database.upsertMemory(localMemory);
    }
  },

  /**
   * ローカルの変更を同期済みにマーク
   */
  markAsSynced: async (localChanges: LocalChanges): Promise<void> => {
    // アーティストを同期済みにマーク
    for (const artist of localChanges.artists) {
      await database.markArtistAsSynced(artist.id);
    }

    // ライブイベントを同期済みにマーク
    for (const event of localChanges.liveEvents) {
      await database.markLiveEventAsSynced(event.id);
    }

    // メモリを同期済みにマーク
    for (const memory of localChanges.memories) {
      await database.markMemoryAsSynced(memory.id);
    }
  },

  /**
   * サーバーから全データを取得してローカルを更新（初回同期用）
   */
  fullSync: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const accessToken = await storage.getItem('accessToken');
      if (!accessToken) {
        return { success: false, error: 'Not authenticated' };
      }

      // サーバーから全データを取得
      const response = await client.post<SyncResponse>('/v1/sync', {
        // lastSyncAt を指定しないことで全データを取得
        clientChanges: {},
      });

      const { serverChanges, syncedAt } = response.data;

      // サーバーからのデータをローカルに保存
      await syncService.applyServerChanges(serverChanges);

      // 同期日時を保存
      await syncService.setLastSyncTime(syncedAt);

      return { success: true };
    } catch (error: any) {
      console.error('Full sync failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
      };
    }
  },
};

export default syncService;
