import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AppProvider, useApp } from '../../context/AppContext';
import { database } from '../../database/asyncDatabase';

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: jest.fn(),
    loginAsGuest: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock the database module
jest.mock('../../database/asyncDatabase');
const mockDatabase = database as jest.Mocked<typeof database>;

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('AppContext Error Handling Tests', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
    
    // Set up default successful mocks
    mockDatabase.getAllArtists.mockResolvedValue([]);
    mockDatabase.getLiveEventsWithArtists.mockResolvedValue([]);
    mockDatabase.getMemoriesWithEventDetails.mockResolvedValue([]);
    mockDatabase.getUpcomingLiveEvents.mockResolvedValue([]);
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('handles refreshData errors gracefully', async () => {
    // Simulate getAllArtists failing
    mockDatabase.getAllArtists.mockRejectedValueOnce(new Error('Database connection failed'));

    const { result } = renderHook(() => useApp(), { wrapper });

    await waitFor(() => {
      expect(result.current.artists).toEqual([]);
    });

    // Should have logged the error
    expect(consoleSpy).toHaveBeenCalledWith('Error refreshing data:', expect.any(Error));
  });

  it('handles artist creation errors gracefully', async () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.artists).toEqual([]);
    });

    // Mock createArtist to fail
    mockDatabase.createArtist.mockRejectedValueOnce(new Error('Database write failed'));

    await result.current.addArtist({ name: 'Test Artist' });

    // Should log the error
    expect(consoleSpy).toHaveBeenCalledWith('Error adding artist:', expect.any(Error));
  });

  it('handles live event creation errors gracefully', async () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.artists).toEqual([]);
    });

    // Mock createLiveEvent to fail
    mockDatabase.createLiveEvent.mockRejectedValueOnce(new Error('Event creation failed'));

    await result.current.addLiveEvent({
      title: 'Test Event',
      artist_id: '1',
      venue_name: 'Test Venue',
      date: '2024-01-01'
    });

    // Should log the error
    expect(consoleSpy).toHaveBeenCalledWith('Error adding live event:', expect.any(Error));
  });

  it('handles memory creation errors gracefully', async () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.artists).toEqual([]);
    });

    // Mock createMemory to fail
    mockDatabase.createMemory.mockRejectedValueOnce(new Error('Memory creation failed'));

    await result.current.addMemory({
      live_event_id: '1',
      review: 'Test memory content',
      photos: '[]'
    });

    // Should log the error
    expect(consoleSpy).toHaveBeenCalledWith('Error adding memory:', expect.any(Error));
  });
});
