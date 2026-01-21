import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export type SyncStatus = 'synced' | 'created' | 'updated';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
}

export interface Artist extends BaseEntity {
  name: string;
  website?: string;
  social_media?: string;
  photo?: string; // Artist photo URI
}

export interface LiveEvent extends BaseEntity {
  title: string;
  artist_id: string;
  date: string;
  doors_open?: string;
  show_start?: string;
  venue_name: string;
  venue_address?: string;
  ticket_status?: 'won' | 'lost' | 'pending' | 'purchased';
  ticket_price?: number;
  seat_number?: string;
  memo?: string;
}

export interface Memory extends BaseEntity {
  live_event_id: string;
  review?: string;
  setlist?: string;
  photos?: string; // JSON array of photo URIs
}

export interface DeletedItem {
  id: string;
  entityType: 'artist' | 'live_event' | 'memory';
  deletedAt: string;
}

const STORAGE_KEYS = {
  ARTISTS: 'artists',
  LIVE_EVENTS: 'live_events',
  MEMORIES: 'memories',
  DELETED_ITEMS: 'deleted_items',
  LAST_SYNC: 'last_sync',
};

class Database {
  private getNextId(): string {
    return Crypto.randomUUID();
  }

  private async getStoredData<T>(key: string): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting stored data for ${key}:`, error);
      return [];
    }
  }

  private async setStoredData<T>(key: string, data: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting stored data for ${key}:`, error);
    }
  }

  private async addDeletedItem(id: string, entityType: DeletedItem['entityType']): Promise<void> {
    const deletedItems = await this.getStoredData<DeletedItem>(STORAGE_KEYS.DELETED_ITEMS);
    deletedItems.push({
      id,
      entityType,
      deletedAt: new Date().toISOString(),
    });
    await this.setStoredData(STORAGE_KEYS.DELETED_ITEMS, deletedItems);
  }

  // Artists methods
  async createArtist(artist: Omit<Artist, keyof BaseEntity>): Promise<Artist> {
    const artists = await this.getStoredData<Artist>(STORAGE_KEYS.ARTISTS);
    const newArtist: Artist = {
      ...artist,
      id: this.getNextId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'created',
    };
    artists.push(newArtist);
    await this.setStoredData(STORAGE_KEYS.ARTISTS, artists);
    return newArtist;
  }

  async getArtist(id: string): Promise<Artist | null> {
    const artists = await this.getStoredData<Artist>(STORAGE_KEYS.ARTISTS);
    return artists.find(artist => artist.id === id) || null;
  }

  async getAllArtists(): Promise<Artist[]> {
    const artists = await this.getStoredData<Artist>(STORAGE_KEYS.ARTISTS);
    return artists.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  async updateArtist(id: string, artistData: Partial<Artist>): Promise<void> {
    const artists = await this.getStoredData<Artist>(STORAGE_KEYS.ARTISTS);
    const index = artists.findIndex(artist => artist.id === id);
    if (index !== -1) {
      const currentArtist = artists[index]!;
      artists[index] = { 
        ...currentArtist, 
        ...artistData,
        updated_at: new Date().toISOString(),
        sync_status: currentArtist.sync_status === 'created' ? 'created' : 'updated'
      };
      await this.setStoredData(STORAGE_KEYS.ARTISTS, artists);
    }
  }

  async deleteArtist(id: string): Promise<void> {
    const artists = await this.getStoredData<Artist>(STORAGE_KEYS.ARTISTS);
    const filteredArtists = artists.filter(artist => artist.id !== id);
    await this.setStoredData(STORAGE_KEYS.ARTISTS, filteredArtists);
    await this.addDeletedItem(id, 'artist');
  }

  // Live events methods
  async createLiveEvent(event: Omit<LiveEvent, keyof BaseEntity>): Promise<LiveEvent> {
    const events = await this.getStoredData<LiveEvent>(STORAGE_KEYS.LIVE_EVENTS);
    const newEvent: LiveEvent = {
      ...event,
      id: this.getNextId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'created',
    };
    events.push(newEvent);
    await this.setStoredData(STORAGE_KEYS.LIVE_EVENTS, events);
    return newEvent;
  }

  async getLiveEvent(id: string): Promise<LiveEvent | null> {
    const events = await this.getStoredData<LiveEvent>(STORAGE_KEYS.LIVE_EVENTS);
    return events.find(event => event.id === id) || null;
  }

  async getAllLiveEvents(): Promise<LiveEvent[]> {
    const events = await this.getStoredData<LiveEvent>(STORAGE_KEYS.LIVE_EVENTS);
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getLiveEventsWithArtists(): Promise<(LiveEvent & { artist_name: string })[]> {
    const events = await this.getAllLiveEvents();
    const artists = await this.getAllArtists();
    
    return events.map(event => {
      const artist = artists.find(a => a.id === event.artist_id);
      return {
        ...event,
        artist_name: artist?.name || 'Unknown Artist',
      };
    });
  }

  async getUpcomingLiveEvents(): Promise<(LiveEvent & { artist_name: string })[]> {
    const eventsWithArtists = await this.getLiveEventsWithArtists();
    const today = new Date().toISOString().split('T')[0]!;
    
    return eventsWithArtists
      .filter(event => event.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async updateLiveEvent(id: string, eventData: Partial<LiveEvent>): Promise<void> {
    const events = await this.getStoredData<LiveEvent>(STORAGE_KEYS.LIVE_EVENTS);
    const index = events.findIndex(event => event.id === id);
    if (index !== -1) {
      const currentEvent = events[index]!;
      events[index] = { 
        ...currentEvent, 
        ...eventData,
        updated_at: new Date().toISOString(),
        sync_status: currentEvent.sync_status === 'created' ? 'created' : 'updated'
      };
      await this.setStoredData(STORAGE_KEYS.LIVE_EVENTS, events);
    }
  }

  async deleteLiveEvent(id: string): Promise<void> {
    const events = await this.getStoredData<LiveEvent>(STORAGE_KEYS.LIVE_EVENTS);
    const filteredEvents = events.filter(event => event.id !== id);
    await this.setStoredData(STORAGE_KEYS.LIVE_EVENTS, filteredEvents);
    await this.addDeletedItem(id, 'live_event');
  }

  // Memories methods
  async createMemory(memory: Omit<Memory, keyof BaseEntity>): Promise<Memory> {
    const memories = await this.getStoredData<Memory>(STORAGE_KEYS.MEMORIES);
    const newMemory: Memory = {
      ...memory,
      id: this.getNextId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'created',
    };
    memories.push(newMemory);
    await this.setStoredData(STORAGE_KEYS.MEMORIES, memories);
    return newMemory;
  }

  async getMemory(id: string): Promise<Memory | null> {
    const memories = await this.getStoredData<Memory>(STORAGE_KEYS.MEMORIES);
    return memories.find(memory => memory.id === id) || null;
  }

  async getMemoryByLiveEventId(liveEventId: string): Promise<Memory | null> {
    const memories = await this.getStoredData<Memory>(STORAGE_KEYS.MEMORIES);
    return memories.find(memory => memory.live_event_id === liveEventId) || null;
  }

  async getAllMemories(): Promise<Memory[]> {
    const memories = await this.getStoredData<Memory>(STORAGE_KEYS.MEMORIES);
    return memories.sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  }

  async getMemoriesWithEventDetails(): Promise<(Memory & { event_title: string; artist_name: string; event_date: string })[]> {
    const memories = await this.getAllMemories();
    const events = await this.getAllLiveEvents();
    const artists = await this.getAllArtists();

    return memories.map(memory => {
      const event = events.find(e => e.id === memory.live_event_id);
      const artist = event ? artists.find(a => a.id === event.artist_id) : null;
      
      return {
        ...memory,
        event_title: event?.title || 'Unknown Event',
        artist_name: artist?.name || 'Unknown Artist',
        event_date: event?.date || '',
      };
    });
  }

  async updateMemory(id: string, memoryData: Partial<Memory>): Promise<void> {
    const memories = await this.getStoredData<Memory>(STORAGE_KEYS.MEMORIES);
    const index = memories.findIndex(memory => memory.id === id);
    if (index !== -1) {
      const currentMemory = memories[index]!;
      memories[index] = { 
        ...currentMemory, 
        ...memoryData,
        updated_at: new Date().toISOString(),
        sync_status: currentMemory.sync_status === 'created' ? 'created' : 'updated'
      };
      await this.setStoredData(STORAGE_KEYS.MEMORIES, memories);
    }
  }

  async deleteMemory(id: string): Promise<void> {
    const memories = await this.getStoredData<Memory>(STORAGE_KEYS.MEMORIES);
    const filteredMemories = memories.filter(memory => memory.id !== id);
    await this.setStoredData(STORAGE_KEYS.MEMORIES, filteredMemories);
    await this.addDeletedItem(id, 'memory');
  }

  // ========== Sync methods ==========
  
  /**
   * 削除されたアイテムを取得
   */
  async getDeletedItems(): Promise<DeletedItem[]> {
    return this.getStoredData<DeletedItem>(STORAGE_KEYS.DELETED_ITEMS);
  }

  /**
   * 削除済みアイテムをクリア（同期完了後に呼ぶ）
   */
  async clearDeletedItems(): Promise<void> {
    await this.setStoredData(STORAGE_KEYS.DELETED_ITEMS, []);
  }

  /**
   * アーティストをupsert（サーバーからのデータ適用用）
   */
  async upsertArtist(artist: Artist): Promise<void> {
    const artists = await this.getStoredData<Artist>(STORAGE_KEYS.ARTISTS);
    const index = artists.findIndex(a => a.id === artist.id);
    if (index !== -1) {
      // 既存のアーティストを更新（サーバーのデータで上書き）
      artists[index] = artist;
    } else {
      // 新規追加
      artists.push(artist);
    }
    await this.setStoredData(STORAGE_KEYS.ARTISTS, artists);
  }

  /**
   * ライブイベントをupsert（サーバーからのデータ適用用）
   */
  async upsertLiveEvent(event: LiveEvent): Promise<void> {
    const events = await this.getStoredData<LiveEvent>(STORAGE_KEYS.LIVE_EVENTS);
    const index = events.findIndex(e => e.id === event.id);
    if (index !== -1) {
      events[index] = event;
    } else {
      events.push(event);
    }
    await this.setStoredData(STORAGE_KEYS.LIVE_EVENTS, events);
  }

  /**
   * メモリをupsert（サーバーからのデータ適用用）
   */
  async upsertMemory(memory: Memory): Promise<void> {
    const memories = await this.getStoredData<Memory>(STORAGE_KEYS.MEMORIES);
    const index = memories.findIndex(m => m.id === memory.id);
    if (index !== -1) {
      memories[index] = memory;
    } else {
      memories.push(memory);
    }
    await this.setStoredData(STORAGE_KEYS.MEMORIES, memories);
  }

  /**
   * アーティストを同期済みにマーク
   */
  async markArtistAsSynced(id: string): Promise<void> {
    const artists = await this.getStoredData<Artist>(STORAGE_KEYS.ARTISTS);
    const index = artists.findIndex(a => a.id === id);
    if (index !== -1) {
      artists[index] = { ...artists[index]!, sync_status: 'synced' };
      await this.setStoredData(STORAGE_KEYS.ARTISTS, artists);
    }
  }

  /**
   * ライブイベントを同期済みにマーク
   */
  async markLiveEventAsSynced(id: string): Promise<void> {
    const events = await this.getStoredData<LiveEvent>(STORAGE_KEYS.LIVE_EVENTS);
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index]!, sync_status: 'synced' };
      await this.setStoredData(STORAGE_KEYS.LIVE_EVENTS, events);
    }
  }

  /**
   * メモリを同期済みにマーク
   */
  async markMemoryAsSynced(id: string): Promise<void> {
    const memories = await this.getStoredData<Memory>(STORAGE_KEYS.MEMORIES);
    const index = memories.findIndex(m => m.id === id);
    if (index !== -1) {
      memories[index] = { ...memories[index]!, sync_status: 'synced' };
      await this.setStoredData(STORAGE_KEYS.MEMORIES, memories);
    }
  }

  /**
   * 全データをクリア（ログアウト時に使用）
   */
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.setStoredData(STORAGE_KEYS.ARTISTS, []),
      this.setStoredData(STORAGE_KEYS.LIVE_EVENTS, []),
      this.setStoredData(STORAGE_KEYS.MEMORIES, []),
      this.setStoredData(STORAGE_KEYS.DELETED_ITEMS, []),
    ]);
  }
}

export const database = new Database();
export default Database;
