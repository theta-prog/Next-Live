import * as SQLite from 'expo-sqlite';

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

class Database {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('live_sch.db');
    this.init();
  }

  private init() {
    // Artists table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS artists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        website TEXT,
        social_media TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Live events table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS live_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        doors_open TEXT,
        show_start TEXT,
        venue_name TEXT NOT NULL,
        venue_address TEXT,
        ticket_status TEXT,
        ticket_price REAL,
        seat_number TEXT,
        memo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES artists (id)
      );
    `);

    // Memories table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        live_event_id INTEGER NOT NULL,
        review TEXT,
        setlist TEXT,
        photos TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (live_event_id) REFERENCES live_events (id)
      );
    `);
  }

  // Artists methods
  createArtist(artist: Omit<Artist, 'id' | 'created_at'>): Artist {
    const result = this.db.runSync(
      'INSERT INTO artists (name, website, social_media) VALUES (?, ?, ?)',
      [artist.name, artist.website || null, artist.social_media || null]
    );
    
    return this.getArtist(result.lastInsertRowId);
  }

  getArtist(id: number): Artist {
    const result = this.db.getFirstSync('SELECT * FROM artists WHERE id = ?', [id]);
    return result as Artist;
  }

  getAllArtists(): Artist[] {
    const result = this.db.getAllSync('SELECT * FROM artists ORDER BY name');
    return result as Artist[];
  }

  updateArtist(id: number, artist: Partial<Artist>): void {
    const fields = Object.keys(artist).filter(key => key !== 'id' && key !== 'created_at');
    const values = fields.map(field => {
      const value = artist[field as keyof Artist];
      return value ?? null;
    });
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    this.db.runSync(`UPDATE artists SET ${setClause} WHERE id = ?`, [...values, id]);
  }

  deleteArtist(id: number): void {
    this.db.runSync('DELETE FROM artists WHERE id = ?', [id]);
  }

  // Live events methods
  createLiveEvent(event: Omit<LiveEvent, 'id' | 'created_at'>): LiveEvent {
    const result = this.db.runSync(
      `INSERT INTO live_events (title, artist_id, date, doors_open, show_start, venue_name, venue_address, ticket_status, ticket_price, seat_number, memo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.title,
        event.artist_id,
        event.date,
        event.doors_open || null,
        event.show_start || null,
        event.venue_name,
        event.venue_address || null,
        event.ticket_status || null,
        event.ticket_price || null,
        event.seat_number || null,
        event.memo || null
      ]
    );
    
    return this.getLiveEvent(result.lastInsertRowId);
  }

  getLiveEvent(id: number): LiveEvent {
    const result = this.db.getFirstSync('SELECT * FROM live_events WHERE id = ?', [id]);
    return result as LiveEvent;
  }

  getAllLiveEvents(): LiveEvent[] {
    const result = this.db.getAllSync('SELECT * FROM live_events ORDER BY date');
    return result as LiveEvent[];
  }

  getLiveEventsWithArtists(): (LiveEvent & { artist_name: string })[] {
    const result = this.db.getAllSync(`
      SELECT le.*, a.name as artist_name 
      FROM live_events le 
      JOIN artists a ON le.artist_id = a.id 
      ORDER BY le.date
    `);
    return result as (LiveEvent & { artist_name: string })[];
  }

  getUpcomingLiveEvents(): (LiveEvent & { artist_name: string })[] {
    const today = new Date().toISOString().split('T')[0]!;
    const result = this.db.getAllSync(`
      SELECT le.*, a.name as artist_name 
      FROM live_events le 
      JOIN artists a ON le.artist_id = a.id 
      WHERE le.date >= ?
      ORDER BY le.date ASC
    `, [today]);
    return result as (LiveEvent & { artist_name: string })[];
  }

  updateLiveEvent(id: number, event: Partial<LiveEvent>): void {
    const fields = Object.keys(event).filter(key => key !== 'id' && key !== 'created_at');
    const values = fields.map(field => {
      const value = event[field as keyof LiveEvent];
      return value ?? null;
    });
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    this.db.runSync(`UPDATE live_events SET ${setClause} WHERE id = ?`, [...values, id]);
  }

  deleteLiveEvent(id: number): void {
    this.db.runSync('DELETE FROM live_events WHERE id = ?', [id]);
  }

  // Memories methods
  createMemory(memory: Omit<Memory, 'id' | 'created_at'>): Memory {
    const result = this.db.runSync(
      'INSERT INTO memories (live_event_id, review, setlist, photos) VALUES (?, ?, ?, ?)',
      [memory.live_event_id, memory.review || null, memory.setlist || null, memory.photos || null]
    );
    
    return this.getMemory(result.lastInsertRowId);
  }

  getMemory(id: number): Memory {
    const result = this.db.getFirstSync('SELECT * FROM memories WHERE id = ?', [id]);
    return result as Memory;
  }

  getMemoryByLiveEventId(liveEventId: number): Memory | null {
    const result = this.db.getFirstSync('SELECT * FROM memories WHERE live_event_id = ?', [liveEventId]);
    return result as Memory || null;
  }

  getAllMemories(): Memory[] {
    const result = this.db.getAllSync('SELECT * FROM memories ORDER BY created_at DESC');
    return result as Memory[];
  }

  getMemoriesWithEventDetails(): (Memory & { event_title: string; artist_name: string; event_date: string })[] {
    const result = this.db.getAllSync(`
      SELECT m.*, le.title as event_title, le.date as event_date, a.name as artist_name
      FROM memories m
      JOIN live_events le ON m.live_event_id = le.id
      JOIN artists a ON le.artist_id = a.id
      ORDER BY le.date DESC
    `);
    return result as (Memory & { event_title: string; artist_name: string; event_date: string })[];
  }

  updateMemory(id: number, memory: Partial<Memory>): void {
    const fields = Object.keys(memory).filter(key => key !== 'id' && key !== 'created_at');
    const values = fields.map(field => {
      const value = memory[field as keyof Memory];
      return value ?? null;
    });
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    this.db.runSync(`UPDATE memories SET ${setClause} WHERE id = ?`, [...values, id]);
  }

  deleteMemory(id: number): void {
    this.db.runSync('DELETE FROM memories WHERE id = ?', [id]);
  }
}

export const database = new Database();
