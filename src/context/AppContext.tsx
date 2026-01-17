import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { artistService, liveEventService, memoryService } from '../api/services';
import { Artist, BaseEntity, database, LiveEvent, Memory } from '../database/asyncDatabase';
import { isEventToday } from '../utils';
import { useAuth } from './AuthContext';

interface AppContextType {
  artists: Artist[];
  liveEvents: (LiveEvent & { artist_name: string })[];
  memories: (Memory & { event_title: string; artist_name: string; event_date: string })[];
  upcomingEvents: (LiveEvent & { artist_name: string })[];
  
  // Artist methods
  addArtist: (artist: Omit<Artist, keyof BaseEntity>) => Promise<void>;
  updateArtist: (id: string, artist: Partial<Artist>) => Promise<void>;
  deleteArtist: (id: string) => Promise<void>;
  
  // Live event methods
  addLiveEvent: (event: Omit<LiveEvent, keyof BaseEntity>) => Promise<void>;
  updateLiveEvent: (id: string, event: Partial<LiveEvent>) => Promise<void>;
  deleteLiveEvent: (id: string) => Promise<void>;
  
  // Memory methods
  addMemory: (memory: Omit<Memory, keyof BaseEntity>) => Promise<void>;
  updateMemory: (id: string, memory: Partial<Memory>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  
  // Utility methods
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [liveEvents, setLiveEvents] = useState<(LiveEvent & { artist_name: string })[]>([]);
  const [memories, setMemories] = useState<(Memory & { event_title: string; artist_name: string; event_date: string })[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<(LiveEvent & { artist_name: string })[]>([]);

  const refreshData = useCallback(async () => {
    try {
      // ローカル環境では直接asyncDatabaseからデータを取得
      // プロダクションではAPI経由でデータを取得
      const useLocalDatabase = !isAuthenticated || process.env.NODE_ENV === 'development';
      
      let artistsData, eventsData, memoriesData;
      
      if (useLocalDatabase) {
        // Local database access
        console.log('Using local database for data access');
        const [localArtists, localEvents, localMemories] = await Promise.all([
          database.getAllArtists(),
          database.getLiveEventsWithArtists(), 
          database.getMemoriesWithEventDetails(),
        ]);
        
        console.log('Local data retrieved:', {
          artists: localArtists.length,
          events: localEvents.length,
          memories: localMemories.length
        });
        
        artistsData = localArtists;
        eventsData = localEvents;
        memoriesData = localMemories;
      } else {
        // API access for authenticated users
        const [apiArtists, apiEvents, apiMemories] = await Promise.all([
          artistService.getAll(),
          liveEventService.getAll(),
          memoryService.getAll(),
        ]);
        
        artistsData = apiArtists;
        eventsData = apiEvents.map(event => {
          const artist = apiArtists.find(a => a.id === event.artist_id);
          return {
            ...event,
            artist_name: artist?.name || 'Unknown Artist',
          };
        });
        memoriesData = apiMemories.map(memory => {
          const event = apiEvents.find(e => e.id === memory.live_event_id);
          const artist = event ? apiArtists.find(a => a.id === event.artist_id) : null;
          
          return {
            ...memory,
            event_title: event?.title || 'Unknown Event',
            artist_name: artist?.name || 'Unknown Artist',
            event_date: event?.date || '',
          };
        });
      }
      
      // Sort artists
      const sortedArtists = artistsData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setArtists(sortedArtists);

      // Set events (already includes artist_name from database query)
      const sortedEvents = eventsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      console.log('Setting liveEvents:', sortedEvents);
      setLiveEvents(sortedEvents);

      // Set memories (already includes event details from database query)
      const sortedMemories = memoriesData.sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setMemories(sortedMemories);

      // Filter upcoming events (including today's events)
      const upcoming = sortedEvents
        .filter(event => {
          const eventDate = new Date(event.date);
          const today = new Date();
          
          // Include today's events
          if (isEventToday(event.date)) {
            return true;
          }
          
          // Remove time component for proper date comparison
          const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
          const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          
          return eventDateOnly > todayOnly;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setUpcomingEvents(upcoming);

    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // ローカル環境では常にデータを読み込む
    refreshData();
  }, [refreshData]);

  // Artist methods
  const addArtist = async (artist: Omit<Artist, keyof BaseEntity>) => {
    try {
      const useLocalDatabase = !isAuthenticated || process.env.NODE_ENV === 'development';
      
      if (useLocalDatabase) {
        await database.createArtist(artist);
      } else {
        await artistService.create(artist);
      }
      await refreshData();
    } catch (error) {
      console.error('Error adding artist:', error);
      throw error;
    }
  };

  const updateArtist = async (id: string, artist: Partial<Artist>) => {
    try {
      const useLocalDatabase = !isAuthenticated || process.env.NODE_ENV === 'development';
      
      if (useLocalDatabase) {
        await database.updateArtist(id, artist);
      } else {
        await artistService.update(id, artist);
      }
      await refreshData();
    } catch (error) {
      console.error('Error updating artist:', error);
      throw error;
    }
  };

  const deleteArtist = async (id: string) => {
    try {
      const useLocalDatabase = !isAuthenticated || process.env.NODE_ENV === 'development';
      
      if (useLocalDatabase) {
        await database.deleteArtist(id);
      } else {
        await artistService.delete(id);
      }
      await refreshData();
    } catch (error) {
      console.error('Error deleting artist:', error);
      throw error;
    }
  };

  // Live event methods
  const addLiveEvent = async (event: Omit<LiveEvent, keyof BaseEntity>) => {
    try {
      const useLocalDatabase = !isAuthenticated || process.env.NODE_ENV === 'development';
      
      if (useLocalDatabase) {
        await database.createLiveEvent(event);
      } else {
        await liveEventService.create(event);
      }
      await refreshData();
    } catch (error) {
      console.error('Error adding live event:', error);
      throw error;
    }
  };

  const updateLiveEvent = async (id: string, event: Partial<LiveEvent>) => {
    try {
      const useLocalDatabase = !isAuthenticated || process.env.NODE_ENV === 'development';
      
      if (useLocalDatabase) {
        await database.updateLiveEvent(id, event);
      } else {
        await liveEventService.update(id, event);
      }
      await refreshData();
    } catch (error) {
      console.error('Error updating live event:', error);
      throw error;
    }
  };

  const deleteLiveEvent = async (id: string) => {
    try {
      const useLocalDatabase = !isAuthenticated || process.env.NODE_ENV === 'development';
      
      if (useLocalDatabase) {
        await database.deleteLiveEvent(id);
      } else {
        await liveEventService.delete(id);
      }
      await refreshData();
    } catch (error) {
      console.error('Error deleting live event:', error);
      throw error;
    }
  };

  // Memory methods
  const addMemory = async (memory: Omit<Memory, keyof BaseEntity>) => {
    try {
      const useLocalDatabase = !isAuthenticated || process.env.NODE_ENV === 'development';
      
      if (useLocalDatabase) {
        await database.createMemory(memory);
      } else {
        await memoryService.create(memory);
      }
      await refreshData();
    } catch (error) {
      console.error('Error adding memory:', error);
      throw error;
    }
  };

  const updateMemory = async (id: string, memory: Partial<Memory>) => {
    try {
      const useLocalDatabase = !isAuthenticated || process.env.NODE_ENV === 'development';
      
      if (useLocalDatabase) {
        await database.updateMemory(id, memory);
      } else {
        await memoryService.update(id, memory);
      }
      await refreshData();
    } catch (error) {
      console.error('Error updating memory:', error);
      throw error;
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      const useLocalDatabase = !isAuthenticated || process.env.NODE_ENV === 'development';
      
      if (useLocalDatabase) {
        await database.deleteMemory(id);
      } else {
        await memoryService.delete(id);
      }
      await refreshData();
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  };

  const value: AppContextType = {
    artists,
    liveEvents,
    memories,
    upcomingEvents,
    addArtist,
    updateArtist,
    deleteArtist,
    addLiveEvent,
    updateLiveEvent,
    deleteLiveEvent,
    addMemory,
    updateMemory,
    deleteMemory,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
