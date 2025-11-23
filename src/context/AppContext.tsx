import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Artist, BaseEntity, database, LiveEvent, Memory } from '../database/asyncDatabase';

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
  const [artists, setArtists] = useState<Artist[]>([]);
  const [liveEvents, setLiveEvents] = useState<(LiveEvent & { artist_name: string })[]>([]);
  const [memories, setMemories] = useState<(Memory & { event_title: string; artist_name: string; event_date: string })[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<(LiveEvent & { artist_name: string })[]>([]);

  const refreshData = async () => {
    try {
      const [artistsData, eventsData, memoriesData, upcomingData] = await Promise.all([
        database.getAllArtists(),
        database.getLiveEventsWithArtists(),
        database.getMemoriesWithEventDetails(),
        database.getUpcomingLiveEvents(),
      ]);
      
      setArtists(artistsData);
      setLiveEvents(eventsData);
      setMemories(memoriesData);
      setUpcomingEvents(upcomingData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Artist methods
  const addArtist = async (artist: Omit<Artist, keyof BaseEntity>) => {
    try {
      await database.createArtist(artist);
      await refreshData();
    } catch (error) {
      console.error('Error adding artist:', error);
    }
  };

  const updateArtist = async (id: string, artist: Partial<Artist>) => {
    try {
      await database.updateArtist(id, artist);
      await refreshData();
    } catch (error) {
      console.error('Error updating artist:', error);
    }
  };

  const deleteArtist = async (id: string) => {
    try {
      await database.deleteArtist(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting artist:', error);
    }
  };

  // Live event methods
  const addLiveEvent = async (event: Omit<LiveEvent, keyof BaseEntity>) => {
    try {
      await database.createLiveEvent(event);
      await refreshData();
    } catch (error) {
      console.error('Error adding live event:', error);
    }
  };

  const updateLiveEvent = async (id: string, event: Partial<LiveEvent>) => {
    try {
      await database.updateLiveEvent(id, event);
      await refreshData();
    } catch (error) {
      console.error('Error updating live event:', error);
    }
  };

  const deleteLiveEvent = async (id: string) => {
    try {
      await database.deleteLiveEvent(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting live event:', error);
    }
  };

  // Memory methods
  const addMemory = async (memory: Omit<Memory, keyof BaseEntity>) => {
    try {
      await database.createMemory(memory);
      await refreshData();
    } catch (error) {
      console.error('Error adding memory:', error);
    }
  };

  const updateMemory = async (id: string, memory: Partial<Memory>) => {
    try {
      await database.updateMemory(id, memory);
      await refreshData();
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      await database.deleteMemory(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting memory:', error);
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
