import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Artist {
  id?: number;
  name: string;
  website?: string;
  social_media?: string;
  created_at?: string;
}

export interface LiveEvent {
  id?: number;
  title: string;
  artist_id: number;
  date: string;
  doors_open?: string;
  show_start?: string;
  venue_name: string;
  venue_address?: string;
  ticket_status?: 'won' | 'lost' | 'pending' | 'purchased';
  ticket_price?: number;
  seat_number?: string;
  memo?: string;
  created_at?: string;
}

export interface Memory {
  id?: number;
  live_event_id: number;
  review?: string;
  setlist?: string;
  photos?: string; // JSON array of photo URIs
  created_at?: string;
}

const STORAGE_KEYS = {
  ARTISTS: 'artists',
  LIVE_EVENTS: 'live_events',
  MEMORIES: 'memories',
  COUNTER: 'counter',
};

class Database {
  private async getNextId(entityType: string): Promise<number> {
    try {
      const counterKey = `${STORAGE_KEYS.COUNTER}_${entityType}`;
      const counter = await AsyncStorage.getItem(counterKey);
      const nextId = counter ? parseInt(counter) + 1 : 1;
      await AsyncStorage.setItem(counterKey, nextId.toString());
      return nextId;
    } catch (error) {
      console.error('Error getting next ID:', error);
      return Date.now(); // fallback to timestamp
    }
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

  // Artists methods
  async createArtist(artist: Omit<Artist, 'id' | 'created_at'>): Promise<Artist> {
    const artists = await this.getStoredData<Artist>(STORAGE_KEYS.ARTISTS);
    const id = await this.getNextId('artist');
    const newArtist: Artist = {
      ...artist,
      id,
      created_at: new Date().toISOString(),
    };
    artists.push(newArtist);
    await this.setStoredData(STORAGE_KEYS.ARTISTS, artists);
    return newArtist;
  }

  async getArtist(id: number): Promise<Artist | null> {
    const artists = await this.getStoredData<Artist>(STORAGE_KEYS.ARTISTS);
    return artists.find(artist => artist.id === id) || null;
  }

  async getAllArtists(): Promise<Artist[]> {
    const artists = await this.getStoredData<Artist>(STORAGE_KEYS.ARTISTS);
    return artists.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  async updateArtist(id: number, artistData: Partial<Artist>): Promise<void> {
    const artists = await this.getStoredData<Artist>(STORAGE_KEYS.ARTISTS);
    const index = artists.findIndex(artist => artist.id === id);
    if (index !== -1) {
      artists[index] = { ...artists[index], ...artistData };
      await this.setStoredData(STORAGE_KEYS.ARTISTS, artists);
    }
  }

  async deleteArtist(id: number): Promise<void> {
    const artists = await this.getStoredData<Artist>(STORAGE_KEYS.ARTISTS);
    const filteredArtists = artists.filter(artist => artist.id !== id);
    await this.setStoredData(STORAGE_KEYS.ARTISTS, filteredArtists);
  }

  // Live events methods
  async createLiveEvent(event: Omit<LiveEvent, 'id' | 'created_at'>): Promise<LiveEvent> {
    const events = await this.getStoredData<LiveEvent>(STORAGE_KEYS.LIVE_EVENTS);
    const id = await this.getNextId('live_event');
    const newEvent: LiveEvent = {
      ...event,
      id,
      created_at: new Date().toISOString(),
    };
    events.push(newEvent);
    await this.setStoredData(STORAGE_KEYS.LIVE_EVENTS, events);
    return newEvent;
  }

  async getLiveEvent(id: number): Promise<LiveEvent | null> {
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
    const today = new Date().toISOString().split('T')[0];
    
    return eventsWithArtists
      .filter(event => event.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async updateLiveEvent(id: number, eventData: Partial<LiveEvent>): Promise<void> {
    const events = await this.getStoredData<LiveEvent>(STORAGE_KEYS.LIVE_EVENTS);
    const index = events.findIndex(event => event.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...eventData };
      await this.setStoredData(STORAGE_KEYS.LIVE_EVENTS, events);
    }
  }

  async deleteLiveEvent(id: number): Promise<void> {
    const events = await this.getStoredData<LiveEvent>(STORAGE_KEYS.LIVE_EVENTS);
    const filteredEvents = events.filter(event => event.id !== id);
    await this.setStoredData(STORAGE_KEYS.LIVE_EVENTS, filteredEvents);
  }

  // Memories methods
  async createMemory(memory: Omit<Memory, 'id' | 'created_at'>): Promise<Memory> {
    const memories = await this.getStoredData<Memory>(STORAGE_KEYS.MEMORIES);
    const id = await this.getNextId('memory');
    const newMemory: Memory = {
      ...memory,
      id,
      created_at: new Date().toISOString(),
    };
    memories.push(newMemory);
    await this.setStoredData(STORAGE_KEYS.MEMORIES, memories);
    return newMemory;
  }

  async getMemory(id: number): Promise<Memory | null> {
    const memories = await this.getStoredData<Memory>(STORAGE_KEYS.MEMORIES);
    return memories.find(memory => memory.id === id) || null;
  }

  async getMemoryByLiveEventId(liveEventId: number): Promise<Memory | null> {
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

  async updateMemory(id: number, memoryData: Partial<Memory>): Promise<void> {
    const memories = await this.getStoredData<Memory>(STORAGE_KEYS.MEMORIES);
    const index = memories.findIndex(memory => memory.id === id);
    if (index !== -1) {
      memories[index] = { ...memories[index], ...memoryData };
      await this.setStoredData(STORAGE_KEYS.MEMORIES, memories);
    }
  }

  async deleteMemory(id: number): Promise<void> {
    const memories = await this.getStoredData<Memory>(STORAGE_KEYS.MEMORIES);
    const filteredMemories = memories.filter(memory => memory.id !== id);
    await this.setStoredData(STORAGE_KEYS.MEMORIES, filteredMemories);
  }
}

export const database = new Database();
export default Database;
