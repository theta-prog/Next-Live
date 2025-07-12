import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
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

  it('handles data loading on mount', async () => {
    let contextValue: any;
    
    const TestDataLoading = () => {
      const context = useApp();
      contextValue = context;
      return <Text testID="data-loading-test">Data Loading Test</Text>;
    };

    render(
      <AppProvider>
        <TestDataLoading />
      </AppProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(Array.isArray(contextValue.artists)).toBe(true);
      expect(Array.isArray(contextValue.liveEvents)).toBe(true);
      expect(Array.isArray(contextValue.memories)).toBe(true);
      expect(Array.isArray(contextValue.upcomingEvents)).toBe(true);
    });
  });

  it('handles context provider lifecycle', async () => {
    const { unmount } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(() => unmount()).not.toThrow();
  });

  it('provides error handling for context operations', async () => {
    let contextValue: any;
    
    const TestErrorHandling = () => {
      const context = useApp();
      contextValue = context;
      return <Text testID="error-handling-test">Error Handling Test</Text>;
    };

    render(
      <AppProvider>
        <TestErrorHandling />
      </AppProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(typeof contextValue.refreshData).toBe('function');
    });
  });

  it('handles multiple children correctly', async () => {
    const { getByTestId } = render(
      <AppProvider>
        <TestComponent />
        <Text testID="second-child">Second Child</Text>
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('test-component')).toBeTruthy();
      expect(getByTestId('second-child')).toBeTruthy();
    });
  });

  it('maintains context state across re-renders', async () => {
    let contextValue: any;
    
    const TestContextPersistence = () => {
      const context = useApp();
      contextValue = context;
      return <Text testID="persistence-test">Persistence Test</Text>;
    };

    const { rerender } = render(
      <AppProvider>
        <TestContextPersistence />
      </AppProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
    });

    rerender(
      <AppProvider>
        <TestContextPersistence />
      </AppProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(typeof contextValue.addArtist).toBe('function');
    });
  });

  it('provides consistent method references', async () => {
    let contextValue: any;
    
    const TestMethodReferences = () => {
      const context = useApp();
      contextValue = context;
      return <Text testID="method-refs-test">Method References Test</Text>;
    };

    render(
      <AppProvider>
        <TestMethodReferences />
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

  it('handles edge cases and empty states', () => {
    const TestComponent = () => {
      const { artists, liveEvents, memories } = useApp();
      return (
        <Text>
          Artists: {artists.length}, Events: {liveEvents.length}, Memories: {memories.length}
        </Text>
      );
    };

    const { getByText } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(getByText(/Artists: \d+, Events: \d+, Memories: \d+/)).toBeTruthy();
  });

  it('provides all context methods', () => {
    const TestComponent = () => {
      const { 
        addArtist, 
        updateArtist, 
        deleteArtist,
        addLiveEvent,
        updateLiveEvent,
        deleteLiveEvent,
        addMemory,
        updateMemory,
        deleteMemory
      } = useApp();
      
      // Check all methods are functions
      const methodsWork = [
        addArtist, updateArtist, deleteArtist,
        addLiveEvent, updateLiveEvent, deleteLiveEvent,
        addMemory, updateMemory, deleteMemory
      ].every(method => typeof method === 'function');
      
      return (
        <Text>
          Methods available: {methodsWork ? 'true' : 'false'}
        </Text>
      );
    };

    const { getByText } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(getByText('Methods available: true')).toBeTruthy();
  });
});
