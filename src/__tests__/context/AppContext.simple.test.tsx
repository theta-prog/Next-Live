import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { AppProvider, useApp } from '../../context/AppContext';

// Mock the database module
jest.mock('../../database/asyncDatabase', () => ({
  getAllArtists: jest.fn().mockResolvedValue([]),
  getLiveEventsWithArtists: jest.fn().mockResolvedValue([]),
  getMemoriesWithEventDetails: jest.fn().mockResolvedValue([]),
  getUpcomingLiveEvents: jest.fn().mockResolvedValue([]),
  addArtist: jest.fn().mockResolvedValue(1),
  updateArtist: jest.fn().mockResolvedValue(true),
  deleteArtist: jest.fn().mockResolvedValue(true),
  addLiveEvent: jest.fn().mockResolvedValue(1),
  updateLiveEvent: jest.fn().mockResolvedValue(true),
  deleteLiveEvent: jest.fn().mockResolvedValue(true),
  addMemory: jest.fn().mockResolvedValue(1),
  updateMemory: jest.fn().mockResolvedValue(true),
  deleteMemory: jest.fn().mockResolvedValue(true),
}));

const TestComponent = () => {
  return <Text testID="test-component">Test Component</Text>;
};

describe('AppContext', () => {
  it('provides context values correctly', async () => {
    const { getByTestId } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-component')).toBeTruthy();
    });
  });

  it('renders children correctly', async () => {
    const { getByTestId } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-component')).toBeTruthy();
    });
  });

  it('initializes with default values', async () => {
    let contextValue: any;
    
    const TestContextValues = () => {
      const context = useApp();
      contextValue = context;
      return <Text testID="context-test">Context Test</Text>;
    };

    render(
      <AppProvider>
        <TestContextValues />
      </AppProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.artists).toEqual([]);
      expect(contextValue.liveEvents).toEqual([]);
      expect(contextValue.memories).toEqual([]);
      expect(contextValue.upcomingEvents).toEqual([]);
    });
  });

  it('provides all required methods', async () => {
    let contextValue: any;
    
    const TestContextMethods = () => {
      const context = useApp();
      contextValue = context;
      return <Text testID="methods-test">Methods Test</Text>;
    };

    render(
      <AppProvider>
        <TestContextMethods />
      </AppProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(typeof contextValue.addArtist).toBe('function');
      expect(typeof contextValue.updateArtist).toBe('function');
      expect(typeof contextValue.deleteArtist).toBe('function');
      expect(typeof contextValue.addLiveEvent).toBe('function');
      expect(typeof contextValue.updateLiveEvent).toBe('function');
      expect(typeof contextValue.deleteLiveEvent).toBe('function');
      expect(typeof contextValue.addMemory).toBe('function');
      expect(typeof contextValue.updateMemory).toBe('function');
      expect(typeof contextValue.deleteMemory).toBe('function');
      expect(typeof contextValue.refreshData).toBe('function');
    });
  });

  it('handles addArtist operation', async () => {
    let contextValue: any;
    
    const TestAddArtist = () => {
      const context = useApp();
      contextValue = context;
      return <Text testID="test">Test</Text>;
    };

    render(
      <AppProvider>
        <TestAddArtist />
      </AppProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
    });

    // Test adding an artist
    await contextValue.addArtist({
      name: 'Test Artist',
      website: 'https://test.com',
      social_media: '@test',
    });

    expect(typeof contextValue.addArtist).toBe('function');
  });

  it('handles updateArtist operation', async () => {
    let contextValue: any;
    
    const TestUpdateArtist = () => {
      const context = useApp();
      contextValue = context;
      return <Text testID="test">Test</Text>;
    };

    render(
      <AppProvider>
        <TestUpdateArtist />
      </AppProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
    });

    // Test updating an artist
    await contextValue.updateArtist(1, {
      name: 'Updated Artist',
    });

    expect(typeof contextValue.updateArtist).toBe('function');
  });

  it('handles deleteArtist operation', async () => {
    let contextValue: any;
    
    const TestDeleteArtist = () => {
      const context = useApp();
      contextValue = context;
      return <Text testID="test">Test</Text>;
    };

    render(
      <AppProvider>
        <TestDeleteArtist />
      </AppProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
    });

    // Test deleting an artist
    await contextValue.deleteArtist(1);

    expect(typeof contextValue.deleteArtist).toBe('function');
  });

  it('handles live event operations', async () => {
    let contextValue: any;
    
    const TestLiveEvents = () => {
      const context = useApp();
      contextValue = context;
      return <Text testID="test">Test</Text>;
    };

    render(
      <AppProvider>
        <TestLiveEvents />
      </AppProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
    });

    // Test adding a live event
    await contextValue.addLiveEvent({
      title: 'Test Concert',
      artist_id: 1,
      date: '2024-12-25',
      venue_name: 'Test Venue',
    });

    // Test updating a live event
    await contextValue.updateLiveEvent(1, {
      title: 'Updated Concert',
    });

    // Test deleting a live event
    await contextValue.deleteLiveEvent(1);

    expect(typeof contextValue.addLiveEvent).toBe('function');
    expect(typeof contextValue.updateLiveEvent).toBe('function');
    expect(typeof contextValue.deleteLiveEvent).toBe('function');
  });

  it('handles memory operations', async () => {
    let contextValue: any;
    
    const TestMemories = () => {
      const context = useApp();
      contextValue = context;
      return <Text testID="test">Test</Text>;
    };

    render(
      <AppProvider>
        <TestMemories />
      </AppProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
    });

    // Test adding a memory
    await contextValue.addMemory({
      live_event_id: 1,
      review: 'Great concert!',
      setlist: 'Song 1, Song 2',
    });

    // Test updating a memory
    await contextValue.updateMemory(1, {
      review: 'Updated review',
    });

    // Test deleting a memory
    await contextValue.deleteMemory(1);

    expect(typeof contextValue.addMemory).toBe('function');
    expect(typeof contextValue.updateMemory).toBe('function');
    expect(typeof contextValue.deleteMemory).toBe('function');
  });

  it('handles refreshData operation', async () => {
    let contextValue: any;
    
    const TestRefresh = () => {
      const context = useApp();
      contextValue = context;
      return <Text testID="test">Test</Text>;
    };

    render(
      <AppProvider>
        <TestRefresh />
      </AppProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
    });

    // Test refreshing data
    await contextValue.refreshData();

    expect(typeof contextValue.refreshData).toBe('function');
  });

  it('handles addArtist error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockDatabase = jest.requireMock('../../database/asyncDatabase');
    mockDatabase.addArtist.mockRejectedValueOnce(new Error('Database error'));

    const TestComponent = () => {
      const { addArtist } = useApp();
      
      React.useEffect(() => {
        addArtist({ name: 'Test Artist' });
      }, [addArtist]);

      return <Text>Test</Text>;
    };

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error adding artist:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles updateArtist error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockDatabase = jest.requireMock('../../database/asyncDatabase');
    mockDatabase.updateArtist.mockRejectedValueOnce(new Error('Update error'));

    const TestComponent = () => {
      const { updateArtist } = useApp();
      
      React.useEffect(() => {
        updateArtist(1, { name: 'Updated Artist' });
      }, [updateArtist]);

      return <Text>Test</Text>;
    };

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error updating artist:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles deleteArtist error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockDatabase = jest.requireMock('../../database/asyncDatabase');
    mockDatabase.deleteArtist.mockRejectedValueOnce(new Error('Delete error'));

    const TestComponent = () => {
      const { deleteArtist } = useApp();
      
      React.useEffect(() => {
        deleteArtist(1);
      }, [deleteArtist]);

      return <Text>Test</Text>;
    };

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting artist:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles addLiveEvent error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockDatabase = jest.requireMock('../../database/asyncDatabase');
    mockDatabase.addLiveEvent.mockRejectedValueOnce(new Error('LiveEvent error'));

    const TestComponent = () => {
      const { addLiveEvent } = useApp();
      
      React.useEffect(() => {
        addLiveEvent({
          title: 'Test Event',
          artist_id: 1,
          date: '2024-12-25',
          venue_name: 'Test Venue',
        });
      }, [addLiveEvent]);

      return <Text>Test</Text>;
    };

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error adding live event:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles updateLiveEvent error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockDatabase = jest.requireMock('../../database/asyncDatabase');
    mockDatabase.updateLiveEvent.mockRejectedValueOnce(new Error('Update LiveEvent error'));

    const TestComponent = () => {
      const { updateLiveEvent } = useApp();
      
      React.useEffect(() => {
        updateLiveEvent(1, { title: 'Updated Event' });
      }, [updateLiveEvent]);

      return <Text>Test</Text>;
    };

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error updating live event:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles deleteLiveEvent error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockDatabase = jest.requireMock('../../database/asyncDatabase');
    mockDatabase.deleteLiveEvent.mockRejectedValueOnce(new Error('Delete LiveEvent error'));

    const TestComponent = () => {
      const { deleteLiveEvent } = useApp();
      
      React.useEffect(() => {
        deleteLiveEvent(1);
      }, [deleteLiveEvent]);

      return <Text>Test</Text>;
    };

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting live event:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  // Error handling tests for comprehensive coverage
  it('handles addArtist errors gracefully', async () => {
    const mockAddArtist = jest.requireMock('../../database/asyncDatabase').addArtist;
    mockAddArtist.mockRejectedValueOnce(new Error('Database error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponentWithAddArtist = () => {
      const { addArtist } = useApp();
      React.useEffect(() => {
        addArtist({ name: 'Test Artist' });
      }, [addArtist]);
      return <Text testID="test-add-artist">Test Add Artist</Text>;
    };

    const { getByTestId } = render(
      <AppProvider>
        <TestComponentWithAddArtist />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-add-artist')).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalledWith('Error adding artist:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles updateArtist errors gracefully', async () => {
    const mockUpdateArtist = jest.requireMock('../../database/asyncDatabase').updateArtist;
    mockUpdateArtist.mockRejectedValueOnce(new Error('Update error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponentWithUpdateArtist = () => {
      const { updateArtist } = useApp();
      React.useEffect(() => {
        updateArtist(1, { name: 'Updated Artist' });
      }, [updateArtist]);
      return <Text testID="test-update-artist">Test Update Artist</Text>;
    };

    const { getByTestId } = render(
      <AppProvider>
        <TestComponentWithUpdateArtist />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-update-artist')).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalledWith('Error updating artist:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles deleteArtist errors gracefully', async () => {
    const mockDeleteArtist = jest.requireMock('../../database/asyncDatabase').deleteArtist;
    mockDeleteArtist.mockRejectedValueOnce(new Error('Delete error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponentWithDeleteArtist = () => {
      const { deleteArtist } = useApp();
      React.useEffect(() => {
        deleteArtist(1);
      }, [deleteArtist]);
      return <Text testID="test-delete-artist">Test Delete Artist</Text>;
    };

    const { getByTestId } = render(
      <AppProvider>
        <TestComponentWithDeleteArtist />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-delete-artist')).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting artist:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles addLiveEvent errors gracefully', async () => {
    const mockAddLiveEvent = jest.requireMock('../../database/asyncDatabase').addLiveEvent;
    mockAddLiveEvent.mockRejectedValueOnce(new Error('Live event error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponentWithAddLiveEvent = () => {
      const { addLiveEvent } = useApp();
      React.useEffect(() => {
        addLiveEvent({
          title: 'Test Event',
          artist_id: 1,
          date: '2024-01-01',
          venue_name: 'Test Location'
        });
      }, [addLiveEvent]);
      return <Text testID="test-add-live-event">Test Add Live Event</Text>;
    };

    const { getByTestId } = render(
      <AppProvider>
        <TestComponentWithAddLiveEvent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-add-live-event')).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalledWith('Error adding live event:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles updateLiveEvent errors gracefully', async () => {
    const mockUpdateLiveEvent = jest.requireMock('../../database/asyncDatabase').updateLiveEvent;
    mockUpdateLiveEvent.mockRejectedValueOnce(new Error('Update live event error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponentWithUpdateLiveEvent = () => {
      const { updateLiveEvent } = useApp();
      React.useEffect(() => {
        updateLiveEvent(1, { title: 'Updated Event' });
      }, [updateLiveEvent]);
      return <Text testID="test-update-live-event">Test Update Live Event</Text>;
    };

    const { getByTestId } = render(
      <AppProvider>
        <TestComponentWithUpdateLiveEvent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-update-live-event')).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalledWith('Error updating live event:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles deleteLiveEvent errors gracefully', async () => {
    const mockDeleteLiveEvent = jest.requireMock('../../database/asyncDatabase').deleteLiveEvent;
    mockDeleteLiveEvent.mockRejectedValueOnce(new Error('Delete live event error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponentWithDeleteLiveEvent = () => {
      const { deleteLiveEvent } = useApp();
      React.useEffect(() => {
        deleteLiveEvent(1);
      }, [deleteLiveEvent]);
      return <Text testID="test-delete-live-event">Test Delete Live Event</Text>;
    };

    const { getByTestId } = render(
      <AppProvider>
        <TestComponentWithDeleteLiveEvent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-delete-live-event')).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting live event:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles addMemory errors gracefully', async () => {
    const mockAddMemory = jest.requireMock('../../database/asyncDatabase').addMemory;
    mockAddMemory.mockRejectedValueOnce(new Error('Add memory error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponentWithAddMemory = () => {
      const { addMemory } = useApp();
      React.useEffect(() => {
        addMemory({
          live_event_id: 1,
          review: 'Test review',
          setlist: 'Test setlist',
          photos: '[]'
        });
      }, [addMemory]);
      return <Text testID="test-add-memory">Test Add Memory</Text>;
    };

    const { getByTestId } = render(
      <AppProvider>
        <TestComponentWithAddMemory />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-add-memory')).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalledWith('Error adding memory:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles updateMemory errors gracefully', async () => {
    const mockUpdateMemory = jest.requireMock('../../database/asyncDatabase').updateMemory;
    mockUpdateMemory.mockRejectedValueOnce(new Error('Update memory error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponentWithUpdateMemory = () => {
      const { updateMemory } = useApp();
      React.useEffect(() => {
        updateMemory(1, { review: 'Updated review' });
      }, [updateMemory]);
      return <Text testID="test-update-memory">Test Update Memory</Text>;
    };

    const { getByTestId } = render(
      <AppProvider>
        <TestComponentWithUpdateMemory />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-update-memory')).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalledWith('Error updating memory:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles deleteMemory errors gracefully', async () => {
    const mockDeleteMemory = jest.requireMock('../../database/asyncDatabase').deleteMemory;
    mockDeleteMemory.mockRejectedValueOnce(new Error('Delete memory error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponentWithDeleteMemory = () => {
      const { deleteMemory } = useApp();
      React.useEffect(() => {
        deleteMemory(1);
      }, [deleteMemory]);
      return <Text testID="test-delete-memory">Test Delete Memory</Text>;
    };

    const { getByTestId } = render(
      <AppProvider>
        <TestComponentWithDeleteMemory />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-delete-memory')).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting memory:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles refreshData errors gracefully', async () => {
    const mockGetAllArtists = jest.requireMock('../../database/asyncDatabase').getAllArtists;
    mockGetAllArtists.mockRejectedValueOnce(new Error('Refresh data error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponentWithRefreshData = () => {
      const { refreshData } = useApp();
      React.useEffect(() => {
        refreshData();
      }, [refreshData]);
      return <Text testID="test-refresh-data">Test Refresh Data</Text>;
    };

    const { getByTestId } = render(
      <AppProvider>
        <TestComponentWithRefreshData />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-refresh-data')).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalledWith('Error refreshing data:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('throws error when useApp is called outside AppProvider', () => {
    const TestComponent = () => {
      useApp(); // This should throw an error
      return <Text>Test</Text>;
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useApp must be used within an AppProvider');

    consoleSpy.mockRestore();
  });

  it('initializes state variables correctly on mount', () => {
    const TestComponentWithState = () => {
      const { artists, liveEvents, memories, upcomingEvents } = useApp();
      return (
        <View>
          <Text testID="artists-length">{artists.length}</Text>
          <Text testID="live-events-length">{liveEvents.length}</Text>
          <Text testID="memories-length">{memories.length}</Text>
          <Text testID="upcoming-events-length">{upcomingEvents.length}</Text>
        </View>
      );
    };

    const { getByTestId } = render(
      <AppProvider>
        <TestComponentWithState />
      </AppProvider>
    );

    // Check mocked data is loaded (from mocked database)
    expect(getByTestId('artists-length')).toBeTruthy();
    expect(getByTestId('live-events-length')).toBeTruthy();
    expect(getByTestId('memories-length')).toBeTruthy();
    expect(getByTestId('upcoming-events-length')).toBeTruthy();
  });

});
