import { Artist, database, LiveEvent, Memory } from '../../database/database';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(),
  })),
}));

// Mock the database instance
const mockExecSync = jest.fn();
const mockRunSync = jest.fn();
const mockGetFirstSync = jest.fn();
const mockGetAllSync = jest.fn();

// Override the database methods
Object.defineProperty(database, 'db', {
  value: {
    execSync: mockExecSync,
    runSync: mockRunSync,
    getFirstSync: mockGetFirstSync,
    getAllSync: mockGetAllSync,
  },
  writable: true,
});

describe('Database', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Artists', () => {
    it('creates an artist successfully', () => {
      const mockArtist: Artist = {
        id: 1,
        name: 'Test Artist',
        website: 'https://test.com',
        social_media: '@test',
        created_at: '2023-01-01T00:00:00.000Z',
      };

      mockRunSync.mockReturnValue({ lastInsertRowId: 1 });
      mockGetFirstSync.mockReturnValue(mockArtist);

      const result = database.createArtist({
        name: 'Test Artist',
        website: 'https://test.com',
        social_media: '@test',
      });

      expect(mockRunSync).toHaveBeenCalledWith(
        'INSERT INTO artists (name, website, social_media) VALUES (?, ?, ?)',
        ['Test Artist', 'https://test.com', '@test']
      );
      expect(result).toEqual(mockArtist);
    });

    it('gets an artist by id', () => {
      const mockArtist: Artist = {
        id: 1,
        name: 'Test Artist',
        created_at: '2023-01-01T00:00:00.000Z',
      };

      mockGetFirstSync.mockReturnValue(mockArtist);

      const result = database.getArtist(1);

      expect(mockGetFirstSync).toHaveBeenCalledWith(
        'SELECT * FROM artists WHERE id = ?',
        [1]
      );
      expect(result).toEqual(mockArtist);
    });

    it('gets all artists', () => {
      const mockArtists: Artist[] = [
        { id: 1, name: 'Artist 1', created_at: '2023-01-01T00:00:00.000Z' },
        { id: 2, name: 'Artist 2', created_at: '2023-01-02T00:00:00.000Z' },
      ];

      mockGetAllSync.mockReturnValue(mockArtists);

      const result = database.getAllArtists();

      expect(mockGetAllSync).toHaveBeenCalledWith(
        'SELECT * FROM artists ORDER BY name'
      );
      expect(result).toEqual(mockArtists);
    });

    it('updates an artist', () => {
      database.updateArtist(1, { name: 'Updated Artist' });

      expect(mockRunSync).toHaveBeenCalledWith(
        'UPDATE artists SET name = ? WHERE id = ?',
        ['Updated Artist', 1]
      );
    });

    it('deletes an artist', () => {
      database.deleteArtist(1);

      expect(mockRunSync).toHaveBeenCalledWith(
        'DELETE FROM artists WHERE id = ?',
        [1]
      );
    });

    it('handles artist creation with null optional fields', () => {
      mockRunSync.mockReturnValue({ lastInsertRowId: 1 });
      mockGetFirstSync.mockReturnValue({ id: 1, name: 'Test' });

      database.createArtist({ name: 'Test' });

      expect(mockRunSync).toHaveBeenCalledWith(
        'INSERT INTO artists (name, website, social_media) VALUES (?, ?, ?)',
        ['Test', null, null]
      );
    });
  });

  describe('Live Events', () => {
    it('creates a live event successfully', () => {
      const mockEvent: LiveEvent = {
        id: 1,
        title: 'Test Concert',
        artist_id: 1,
        date: '2024-12-25',
        venue_name: 'Test Venue',
        created_at: '2023-01-01T00:00:00.000Z',
      };

      mockRunSync.mockReturnValue({ lastInsertRowId: 1 });
      mockGetFirstSync.mockReturnValue(mockEvent);

      const result = database.createLiveEvent({
        title: 'Test Concert',
        artist_id: 1,
        date: '2024-12-25',
        venue_name: 'Test Venue',
      });

      expect(mockRunSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO live_events'),
        expect.arrayContaining(['Test Concert', 1, '2024-12-25', 'Test Venue'])
      );
      expect(result).toEqual(mockEvent);
    });

    it('gets a live event by id', () => {
      const mockEvent: LiveEvent = {
        id: 1,
        title: 'Test Concert',
        artist_id: 1,
        date: '2024-12-25',
        venue_name: 'Test Venue',
      };

      mockGetFirstSync.mockReturnValue(mockEvent);

      const result = database.getLiveEvent(1);

      expect(mockGetFirstSync).toHaveBeenCalledWith(
        'SELECT * FROM live_events WHERE id = ?',
        [1]
      );
      expect(result).toEqual(mockEvent);
    });

    it('gets all live events', () => {
      const mockEvents: LiveEvent[] = [
        { id: 1, title: 'Event 1', artist_id: 1, date: '2024-12-25', venue_name: 'Venue 1' },
        { id: 2, title: 'Event 2', artist_id: 2, date: '2024-12-26', venue_name: 'Venue 2' },
      ];

      mockGetAllSync.mockReturnValue(mockEvents);

      const result = database.getAllLiveEvents();

      expect(mockGetAllSync).toHaveBeenCalledWith(
        'SELECT * FROM live_events ORDER BY date'
      );
      expect(result).toEqual(mockEvents);
    });

    it('gets live events with artists', () => {
      const mockEventsWithArtists = [
        {
          id: 1,
          title: 'Event 1',
          artist_id: 1,
          date: '2024-12-25',
          venue_name: 'Venue 1',
          artist_name: 'Artist 1',
        },
      ];

      mockGetAllSync.mockReturnValue(mockEventsWithArtists);

      const result = database.getLiveEventsWithArtists();

      expect(mockGetAllSync).toHaveBeenCalledWith(
        expect.stringContaining('JOIN artists')
      );
      expect(result).toEqual(mockEventsWithArtists);
    });

    it('gets upcoming live events', () => {
      const mockUpcomingEvents = [
        {
          id: 1,
          title: 'Future Event',
          artist_id: 1,
          date: '2025-12-25',
          venue_name: 'Venue 1',
          artist_name: 'Artist 1',
        },
      ];

      mockGetAllSync.mockReturnValue(mockUpcomingEvents);

      const result = database.getUpcomingLiveEvents();

      expect(mockGetAllSync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE le.date >='),
        expect.arrayContaining([expect.any(String)])
      );
      expect(result).toEqual(mockUpcomingEvents);
    });

    it('updates a live event', () => {
      database.updateLiveEvent(1, { title: 'Updated Event' });

      expect(mockRunSync).toHaveBeenCalledWith(
        'UPDATE live_events SET title = ? WHERE id = ?',
        ['Updated Event', 1]
      );
    });

    it('deletes a live event', () => {
      database.deleteLiveEvent(1);

      expect(mockRunSync).toHaveBeenCalledWith(
        'DELETE FROM live_events WHERE id = ?',
        [1]
      );
    });

    it('handles live event creation with all optional fields', () => {
      mockRunSync.mockReturnValue({ lastInsertRowId: 1 });
      mockGetFirstSync.mockReturnValue({ id: 1, title: 'Test' });

      database.createLiveEvent({
        title: 'Test Concert',
        artist_id: 1,
        date: '2024-12-25',
        doors_open: '18:00',
        show_start: '19:00',
        venue_name: 'Test Venue',
        venue_address: '123 Test St',
        ticket_status: 'purchased',
        ticket_price: 5000,
        seat_number: 'A-10',
        memo: 'Test memo',
      });

      expect(mockRunSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO live_events'),
        expect.arrayContaining([
          'Test Concert',
          1,
          '2024-12-25',
          '18:00',
          '19:00',
          'Test Venue',
          '123 Test St',
          'purchased',
          5000,
          'A-10',
          'Test memo',
        ])
      );
    });
  });

  describe('Memories', () => {
    it('creates a memory successfully', () => {
      const mockMemory: Memory = {
        id: 1,
        live_event_id: 1,
        review: 'Great concert!',
        setlist: 'Song 1\nSong 2',
        photos: '["photo1.jpg"]',
        created_at: '2023-01-01T00:00:00.000Z',
      };

      mockRunSync.mockReturnValue({ lastInsertRowId: 1 });
      mockGetFirstSync.mockReturnValue(mockMemory);

      const result = database.createMemory({
        live_event_id: 1,
        review: 'Great concert!',
        setlist: 'Song 1\nSong 2',
        photos: '["photo1.jpg"]',
      });

      expect(mockRunSync).toHaveBeenCalledWith(
        'INSERT INTO memories (live_event_id, review, setlist, photos) VALUES (?, ?, ?, ?)',
        [1, 'Great concert!', 'Song 1\nSong 2', '["photo1.jpg"]']
      );
      expect(result).toEqual(mockMemory);
    });

    it('gets a memory by id', () => {
      const mockMemory: Memory = {
        id: 1,
        live_event_id: 1,
        review: 'Great concert!',
      };

      mockGetFirstSync.mockReturnValue(mockMemory);

      const result = database.getMemory(1);

      expect(mockGetFirstSync).toHaveBeenCalledWith(
        'SELECT * FROM memories WHERE id = ?',
        [1]
      );
      expect(result).toEqual(mockMemory);
    });

    it('gets memory by live event id', () => {
      const mockMemory: Memory = {
        id: 1,
        live_event_id: 1,
        review: 'Great concert!',
      };

      mockGetFirstSync.mockReturnValue(mockMemory);

      const result = database.getMemoryByLiveEventId(1);

      expect(mockGetFirstSync).toHaveBeenCalledWith(
        'SELECT * FROM memories WHERE live_event_id = ?',
        [1]
      );
      expect(result).toEqual(mockMemory);
    });

    it('returns null when memory not found by live event id', () => {
      mockGetFirstSync.mockReturnValue(undefined);

      const result = database.getMemoryByLiveEventId(999);

      expect(result).toBeNull();
    });

    it('gets all memories', () => {
      const mockMemories: Memory[] = [
        { id: 1, live_event_id: 1, review: 'Memory 1' },
        { id: 2, live_event_id: 2, review: 'Memory 2' },
      ];

      mockGetAllSync.mockReturnValue(mockMemories);

      const result = database.getAllMemories();

      expect(mockGetAllSync).toHaveBeenCalledWith(
        'SELECT * FROM memories ORDER BY created_at DESC'
      );
      expect(result).toEqual(mockMemories);
    });

    it('gets memories with event details', () => {
      const mockMemoriesWithDetails = [
        {
          id: 1,
          live_event_id: 1,
          review: 'Great!',
          event_title: 'Concert',
          artist_name: 'Artist',
          event_date: '2024-12-25',
        },
      ];

      mockGetAllSync.mockReturnValue(mockMemoriesWithDetails);

      const result = database.getMemoriesWithEventDetails();

      expect(mockGetAllSync).toHaveBeenCalledWith(
        expect.stringContaining('JOIN live_events')
      );
      expect(result).toEqual(mockMemoriesWithDetails);
    });

    it('updates a memory', () => {
      database.updateMemory(1, { review: 'Updated review' });

      expect(mockRunSync).toHaveBeenCalledWith(
        'UPDATE memories SET review = ? WHERE id = ?',
        ['Updated review', 1]
      );
    });

    it('deletes a memory', () => {
      database.deleteMemory(1);

      expect(mockRunSync).toHaveBeenCalledWith(
        'DELETE FROM memories WHERE id = ?',
        [1]
      );
    });

    it('handles memory creation with null optional fields', () => {
      mockRunSync.mockReturnValue({ lastInsertRowId: 1 });
      mockGetFirstSync.mockReturnValue({ id: 1, live_event_id: 1 });

      database.createMemory({ live_event_id: 1 });

      expect(mockRunSync).toHaveBeenCalledWith(
        'INSERT INTO memories (live_event_id, review, setlist, photos) VALUES (?, ?, ?, ?)',
        [1, null, null, null]
      );
    });
  });

  describe('Database Initialization', () => {
    it('initializes database instance successfully', () => {
      expect(database).toBeDefined();
    });
  });

  describe('Complex Update Operations', () => {
    it('handles multiple field updates for artists', () => {
      database.updateArtist(1, {
        name: 'Updated Name',
        website: 'https://updated.com',
        social_media: '@updated',
      });

      expect(mockRunSync).toHaveBeenCalledWith(
        'UPDATE artists SET name = ?, website = ?, social_media = ? WHERE id = ?',
        ['Updated Name', 'https://updated.com', '@updated', 1]
      );
    });

    it('handles multiple field updates for live events', () => {
      database.updateLiveEvent(1, {
        title: 'Updated Title',
        venue_name: 'Updated Venue',
        ticket_status: 'won',
      });

      expect(mockRunSync).toHaveBeenCalledWith(
        'UPDATE live_events SET title = ?, venue_name = ?, ticket_status = ? WHERE id = ?',
        ['Updated Title', 'Updated Venue', 'won', 1]
      );
    });

    it('handles multiple field updates for memories', () => {
      database.updateMemory(1, {
        review: 'Updated review',
        setlist: 'Updated setlist',
        photos: '["updated.jpg"]',
      });

      expect(mockRunSync).toHaveBeenCalledWith(
        'UPDATE memories SET review = ?, setlist = ?, photos = ? WHERE id = ?',
        ['Updated review', 'Updated setlist', '["updated.jpg"]', 1]
      );
    });
  });
});
