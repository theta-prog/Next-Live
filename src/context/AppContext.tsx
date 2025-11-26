import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { artistService, liveEventService, memoryService } from '../api/services';
import { Artist, BaseEntity, LiveEvent, Memory } from '../database/asyncDatabase';
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

  const refreshData = async () => {
    if (!isAuthenticated) return;

    try {
      // Fetch all data in parallel
      const [artistsData, eventsData, memoriesData] = await Promise.all([
        artistService.getAll(),
        liveEventService.getAll(),
        memoryService.getAll(),
      ]);
      
      // Sort artists
      const sortedArtists = artistsData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setArtists(sortedArtists);

      // Join events with artists
      const eventsWithArtists = eventsData.map(event => {
        const artist = artistsData.find(a => a.id === event.artist_id);
        return {
          ...event,
          artist_name: artist?.name || 'Unknown Artist',
        };
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setLiveEvents(eventsWithArtists);

      // Join memories with events and artists
      const memoriesWithDetails = memoriesData.map(memory => {
        const event = eventsData.find(e => e.id === memory.live_event_id);
        const artist = event ? artistsData.find(a => a.id === event.artist_id) : null;
        
        return {
          ...memory,
          event_title: event?.title || 'Unknown Event',
          artist_name: artist?.name || 'Unknown Artist',
          event_date: event?.date || '',
        };
      }).sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      setMemories(memoriesWithDetails);

      // Filter upcoming events
      const today = new Date().toISOString().split('T')[0]!;
      const upcoming = eventsWithArtists
        .filter(event => event.date >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setUpcomingEvents(upcoming);

    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      // Clear data on logout
      setArtists([]);
      setLiveEvents([]);
      setMemories([]);
      setUpcomingEvents([]);
    }
  }, [isAuthenticated]);

  // Artist methods
  const addArtist = async (artist: Omit<Artist, keyof BaseEntity>) => {
    try {
      await artistService.create(artist);
      await refreshData();
    } catch (error) {
      console.error('Error adding artist:', error);
      throw error;
    }
  };

  const updateArtist = async (id: string, artist: Partial<Artist>) => {
    try {
      await artistService.update(id, artist);
      await refreshData();
    } catch (error) {
      console.error('Error updating artist:', error);
      throw error;
    }
  };

  const deleteArtist = async (id: string) => {
    try {
      await artistService.delete(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting artist:', error);
      throw error;
    }
  };

  // Live event methods
  const addLiveEvent = async (event: Omit<LiveEvent, keyof BaseEntity>) => {
    try {
      await liveEventService.create(event);
      await refreshData();
    } catch (error) {
      console.error('Error adding live event:', error);
      throw error;
    }
  };

  const updateLiveEvent = async (id: string, event: Partial<LiveEvent>) => {
    try {
      await liveEventService.update(id, event);
      await refreshData();
    } catch (error) {
      console.error('Error updating live event:', error);
      throw error;
    }
  };

  const deleteLiveEvent = async (id: string) => {
    try {
      await liveEventService.delete(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting live event:', error);
      throw error;
    }
  };

  // Memory methods
  const addMemory = async (memory: Omit<Memory, keyof BaseEntity>) => {
    try {
      await memoryService.create(memory);
      await refreshData();
    } catch (error) {
      console.error('Error adding memory:', error);
      throw error;
    }
  };

  const updateMemory = async (id: string, memory: Partial<Memory>) => {
    try {
      await memoryService.update(id, memory);
      await refreshData();
    } catch (error) {
      console.error('Error updating memory:', error);
      throw error;
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      await memoryService.delete(id);
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
