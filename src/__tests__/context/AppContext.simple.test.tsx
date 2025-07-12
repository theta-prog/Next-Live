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
});
