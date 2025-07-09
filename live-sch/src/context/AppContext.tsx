import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Artist, database, LiveEvent, Memory } from '../database/database';

interface AppContextType {
  artists: Artist[];
  liveEvents: (LiveEvent & { artist_name: string })[];
  memories: (Memory & { event_title: string; artist_name: string; event_date: string })[];
  upcomingEvents: (LiveEvent & { artist_name: string })[];
  
  // Artist methods
  addArtist: (artist: Omit<Artist, 'id' | 'created_at'>) => void;
  updateArtist: (id: number, artist: Partial<Artist>) => void;
  deleteArtist: (id: number) => void;
  
  // Live event methods
  addLiveEvent: (event: Omit<LiveEvent, 'id' | 'created_at'>) => void;
  updateLiveEvent: (id: number, event: Partial<LiveEvent>) => void;
  deleteLiveEvent: (id: number) => void;
  
  // Memory methods
  addMemory: (memory: Omit<Memory, 'id' | 'created_at'>) => void;
  updateMemory: (id: number, memory: Partial<Memory>) => void;
  deleteMemory: (id: number) => void;
  
  // Utility methods
  refreshData: () => void;
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

  const refreshData = () => {
    setArtists(database.getAllArtists());
    setLiveEvents(database.getLiveEventsWithArtists());
    setMemories(database.getMemoriesWithEventDetails());
    setUpcomingEvents(database.getUpcomingLiveEvents());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Artist methods
  const addArtist = (artist: Omit<Artist, 'id' | 'created_at'>) => {
    database.createArtist(artist);
    refreshData();
  };

  const updateArtist = (id: number, artist: Partial<Artist>) => {
    database.updateArtist(id, artist);
    refreshData();
  };

  const deleteArtist = (id: number) => {
    database.deleteArtist(id);
    refreshData();
  };

  // Live event methods
  const addLiveEvent = (event: Omit<LiveEvent, 'id' | 'created_at'>) => {
    database.createLiveEvent(event);
    refreshData();
  };

  const updateLiveEvent = (id: number, event: Partial<LiveEvent>) => {
    database.updateLiveEvent(id, event);
    refreshData();
  };

  const deleteLiveEvent = (id: number) => {
    database.deleteLiveEvent(id);
    refreshData();
  };

  // Memory methods
  const addMemory = (memory: Omit<Memory, 'id' | 'created_at'>) => {
    database.createMemory(memory);
    refreshData();
  };

  const updateMemory = (id: number, memory: Partial<Memory>) => {
    database.updateMemory(id, memory);
    refreshData();
  };

  const deleteMemory = (id: number) => {
    database.deleteMemory(id);
    refreshData();
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
